from __future__ import annotations

import base64
import io
import json
import re
import urllib.request
import uuid
from functools import lru_cache
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from tensorflow.keras.models import load_model

from backend.disease_info import compute_weather_feature_importance, get_disease_info
from backend.gradcam import generate_gradcam_overlay
from backend.gemini_chat import ask_gemini_initial, ask_gemini_chat, detect_intent
from backend.multimodal_loader import predict_multimodal_disease, get_multimodal_model

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

# Crops supported by the multimodal model (all 4 crops — 33 classes)
SUPPORTED_CROPS = ["rice", "wheat", "sugarcane", "cotton"]

# Keras fallback models (only available for rice & wheat)
MODEL_FILES = {
    "rice": {
        "model_file": "rice_disease_disease_model.keras",
        "labels_file": "rice_disease_class_labels.json",
    },
    "wheat": {
        "model_file": "wheat_best_model.keras",
        "labels_file": "wheat_class_labels.json",
    },
}

app = FastAPI(title="FloraAI Plant Disease API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory session store ───────────────────────────────────────────────────
# Maps diagnosis_id → full diagnosis context + conversation history
# In production this would be Redis/DB; for now in-memory is fine.
_diagnosis_sessions: dict[str, dict] = {}

DEFAULT_LOCATION_PROFILES = [
    {
        "location": {
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "latitude": 19.08,
            "longitude": 72.88,
        },
        "weather": {
            "temperature_c": 31.2,
            "humidity_percent": 88,
            "rainfall_mm": 18.6,
            "wind_kmh": 22.5,
            "condition": "Overcast with Rain",
        },
    },
    {
        "location": {
            "city": "Ahmedabad",
            "state": "Gujarat",
            "country": "India",
            "latitude": 23.03,
            "longitude": 72.58,
        },
        "weather": {
            "temperature_c": 36.4,
            "humidity_percent": 62,
            "rainfall_mm": 2.1,
            "wind_kmh": 14.2,
            "condition": "Mostly Sunny",
        },
    },
]

_location_cursor = 0


# ── Pydantic models ───────────────────────────────────────────────────────────

class StartSessionRequest(BaseModel):
    """
    Payload for POST /api/assistant/start.
    Sent once after CNN prediction to initialise a diagnosis session.
    """
    diagnosis_id: str
    crop: str
    predicted_class: str
    confidence: float               # 0.0–1.0
    top3: list | None = None
    weather: dict | None = None
    feature_importance: dict | None = None
    gradcam_image_b64: str | None = None
    disease_info: dict | None = None
    language: str = "en"


class AskRequest(BaseModel):
    """
    Payload for POST /api/assistant/ask (follow-up chat).
    Only sends the diagnosis_id and the user's message — no images.
    """
    diagnosis_id: str
    message: str
    language: str = "en"


class LegacyAskRequest(BaseModel):
    """
    Legacy payload for POST /api/assistant/ask (backward compat).
    Detected by absence of diagnosis_id.
    """
    question: str
    crop: str | None = None
    predicted_class: str | None = None
    confidence: float | None = None
    top3: list | None = None
    weather: dict | None = None
    feature_importance: dict | None = None
    gradcam_image_b64: str | None = None
    disease_info: dict | None = None
    language: str | None = "en"


def normalize_class_name(raw_name: str) -> str:
    cleaned = raw_name.strip().replace("_", " ")
    return " ".join(part.capitalize() for part in cleaned.split())


def normalize_disease_key(raw_name: str) -> str:
    key = raw_name.lower().strip().replace(" ", "_").replace("-", "_")
    key = re.sub(r"[^a-z0-9_]", "", key)
    return key


@lru_cache(maxsize=4)
def load_crop_model(crop: str):
    crop_key = crop.lower()
    if crop_key not in MODEL_FILES:
        raise ValueError(f"Unsupported crop: {crop_key}")

    config = MODEL_FILES[crop_key]
    model_path = MODELS_DIR / config["model_file"]
    labels_path = MODELS_DIR / config["labels_file"]

    if not model_path.exists() or not labels_path.exists():
        raise FileNotFoundError(f"Model files not found for crop '{crop_key}'")

    model = load_model(str(model_path), compile=False)
    with open(labels_path, "r", encoding="utf-8") as handle:
        raw_labels = json.load(handle)

    label_map = {str(key): value for key, value in raw_labels.items()}
    return model, label_map


def preprocess_image(file_bytes: bytes) -> tuple[np.ndarray, np.ndarray]:
    image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    original_rgb = np.asarray(image, dtype=np.uint8)
    model_image = image.resize((224, 224), Image.LANCZOS)
    image_array = np.asarray(model_image, dtype=np.float32)
    return np.expand_dims(image_array, axis=0), original_rgb


def image_to_data_url(image_array: np.ndarray) -> str:
    image = Image.fromarray(image_array.astype(np.uint8), mode="RGB")
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=90)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def get_weather_risk(weather: dict) -> tuple[str, str]:
    humidity = float(weather.get("humidity_percent", 50))
    rainfall = float(weather.get("rainfall_mm", 0))

    if humidity >= 80 or rainfall >= 15:
        return "High", "High humidity or heavy rainfall can strongly accelerate fungal and bacterial spread."
    if humidity >= 65 or rainfall >= 5:
        return "Medium", "Current conditions may support disease progression if leaf wetness remains high."
    return "Low", "Weather risk is currently lower, but continue routine monitoring."


def fetch_real_location_info(latitude: float, longitude: float) -> tuple[str, str, str]:
    """Reverse geocode latitude and longitude to get city, state, country."""
    # Proximity checks for instant accuracy on major Indian cities
    if 18.5 <= latitude <= 19.5 and 72.5 <= longitude <= 73.3:
        return "Mumbai", "Maharashtra", "India"
    if 22.5 <= latitude <= 23.5 and 72.3 <= longitude <= 72.8:
        return "Ahmedabad", "Gujarat", "India"
    if 28.3 <= latitude <= 28.9 and 76.8 <= longitude <= 77.5:
        return "New Delhi", "Delhi", "India"
    if 12.7 <= latitude <= 13.2 and 77.3 <= longitude <= 77.9:
        return "Bengaluru", "Karnataka", "India"
    if 17.1 <= latitude <= 17.7 and 78.1 <= longitude <= 78.7:
        return "Hyderabad", "Telangana", "India"
    if 18.3 <= latitude <= 18.7 and 73.6 <= longitude <= 74.1:
        return "Pune", "Maharashtra", "India"
    if 12.8 <= latitude <= 13.3 and 80.0 <= longitude <= 80.4:
        return "Chennai", "Tamil Nadu", "India"

    try:
        url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={latitude}&longitude={longitude}&localityLanguage=en"
        req = urllib.request.Request(url, headers={"User-Agent": "FloraAI/1.0"})
        with urllib.request.urlopen(req, timeout=4.0) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                city = data.get("city") or data.get("locality") or "Detected Location"
                state = data.get("principalSubdivision") or "User Area"
                country = data.get("countryName") or "India"
                return city, state, country
    except Exception:
        pass

    return "Detected Location", "User Area", "India"


def geocode_city_name(city_name: str) -> tuple[float, float, str, str, str] | None:
    """Geocode any city name using free Open-Meteo geocoding API."""
    try:
        import urllib.parse
        encoded = urllib.parse.quote(city_name.strip())
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded}&count=1&language=en&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "FloraAI/1.0"})
        with urllib.request.urlopen(req, timeout=4.0) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                results = data.get("results")
                if results and len(results) > 0:
                    r = results[0]
                    lat = float(r.get("latitude"))
                    lon = float(r.get("longitude"))
                    resolved_city = r.get("name") or city_name.strip()
                    resolved_state = r.get("admin1") or ""
                    resolved_country = r.get("country") or "India"
                    return lat, lon, resolved_city, resolved_state, resolved_country
    except Exception as exc:
        print(f"[Geocode] Failed to geocode '{city_name}': {exc}")
    return None


def fetch_ip_location() -> tuple[float, float, str, str, str] | None:
    """Fallback IP-based location if browser GPS is blocked/unavailable."""
    try:
        url = "http://ip-api.com/json"
        req = urllib.request.Request(url, headers={"User-Agent": "FloraAI/1.0"})
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("status") == "success":
                    lat = float(data.get("lat"))
                    lon = float(data.get("lon"))
                    city = data.get("city", "Detected Region")
                    state = data.get("regionName", "")
                    country = data.get("country", "India")
                    return lat, lon, city, state, country
    except Exception as exc:
        print(f"[IP-Locate] IP fallback failed: {exc}")
    return None


def weather_from_coordinates(
    latitude: float,
    longitude: float,
    city_override: str | None = None,
    state_override: str | None = None,
    country_override: str | None = None,
) -> dict:
    if city_override:
        city = city_override
        state = state_override or ""
        country = country_override or "India"
    else:
        city, state, country = fetch_real_location_info(latitude, longitude)

    # Defaults
    temp_c = 28.0
    humidity = 70
    rainfall = 0.0
    wind_kmh = 10.0
    condition = "Partly Cloudy"

    daily_data = {}
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}"
            f"&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code"
            f"&past_days=7&forecast_days=1"
            f"&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_max,relative_humidity_2m_mean,precipitation_sum,dew_point_2m_mean,wind_speed_10m_max"
            f"&timezone=Asia%2FKolkata"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "FloraAI/1.0"})
        with urllib.request.urlopen(req, timeout=4.5) as resp:
            if resp.status == 200:
                res_json = json.loads(resp.read().decode("utf-8"))
                wdata = res_json.get("current", {})
                daily_data = res_json.get("daily", {})
                temp_c = float(wdata.get("temperature_2m", temp_c))
                humidity = int(wdata.get("relative_humidity_2m", humidity))
                rainfall = float(wdata.get("rain", rainfall))
                wind_kmh = float(wdata.get("wind_speed_10m", wind_kmh))
                code = int(wdata.get("weather_code", 0))

                if code in (61, 63, 65, 80, 81, 82):
                    condition = "Rain Showers"
                elif code in (51, 53, 55):
                    condition = "Drizzle / Light Rain"
                elif code in (95, 96, 99):
                    condition = "Thunderstorm"
                elif humidity >= 80:
                    condition = "Humid & Overcast"
                elif temp_c >= 33:
                    condition = "Hot & Sunny"
                else:
                    condition = "Partly Cloudy"
    except Exception:
        seed = abs(latitude * 1.7 + longitude * 0.9)
        humidity = int(max(35, min(92, round(45 + (seed % 50)))))
        rainfall = round(max(0.0, min(22.0, (seed * 1.3) % 23)), 1)
        temp_c = round(max(12.0, min(41.0, 18.0 + ((latitude + longitude) % 23))), 1)
        wind_kmh = round(max(2.5, min(30.0, 6.0 + ((seed * 2.1) % 20))), 1)
        if rainfall >= 12:
            condition = "Rain Showers"
        elif humidity >= 80:
            condition = "Humid Cloud Cover"
        elif temp_c >= 34:
            condition = "Hot and Dry"
        else:
            condition = "Partly Cloudy"

    return {
        "location": {
            "city": city,
            "state": state,
            "country": country,
            "latitude": round(latitude, 5),
            "longitude": round(longitude, 5),
        },
        "weather": {
            "temperature_c": round(temp_c, 1),
            "humidity_percent": humidity,
            "rainfall_mm": round(rainfall, 1),
            "wind_kmh": round(wind_kmh, 1),
            "condition": condition,
            "daily": daily_data,
        },
    }


# ── Standard routes ───────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "FloraAI backend"}


@app.get("/api/crops")
def get_crops():
    return {
        "crops": [
            {"name": crop, "label": crop.capitalize()} for crop in SUPPORTED_CROPS
        ]
    }


@app.get("/api/location/fetch")
def fetch_location(
    latitude: float | None = None,
    longitude: float | None = None,
    city: str | None = None,
):
    global _location_cursor

    # 1. City search
    if city and city.strip():
        geocoded = geocode_city_name(city.strip())
        if geocoded:
            g_lat, g_lon, g_city, g_state, g_country = geocoded
            data = weather_from_coordinates(
                g_lat, g_lon,
                city_override=g_city,
                state_override=g_state,
                country_override=g_country,
            )
            risk_level, risk_reason = get_weather_risk(data["weather"])
            return {
                "source": "city_search",
                **data,
                "risk_level": risk_level,
                "risk_reason": risk_reason,
            }

    # 2. GPS coordinates
    if latitude is not None and longitude is not None:
        data = weather_from_coordinates(latitude, longitude)
        source = "coordinates"

    # 3. IP Geolocation fallback
    else:
        ip_loc = fetch_ip_location()
        if ip_loc:
            ip_lat, ip_lon, ip_city, ip_state, ip_country = ip_loc
            data = weather_from_coordinates(
                ip_lat, ip_lon,
                city_override=ip_city,
                state_override=ip_state,
                country_override=ip_country,
            )
            source = "ip_geolocation"
        else:
            data = DEFAULT_LOCATION_PROFILES[_location_cursor % len(DEFAULT_LOCATION_PROFILES)]
            _location_cursor += 1
            source = "demo_profile"

    risk_level, risk_reason = get_weather_risk(data["weather"])
    return {
        "source": source,
        **data,
        "risk_level": risk_level,
        "risk_reason": risk_reason,
    }


@app.post("/api/predict")
async def predict_disease(
    file: UploadFile = File(...),
    crop: str = Form("rice"),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    temperature: float | None = Form(None),
    humidity: float | None = Form(None),
    rainfall: float | None = Form(None),
    wind_speed: float | None = Form(None),
    city: str | None = Form(None),
):
    crop_key = crop.lower()
    if crop_key not in SUPPORTED_CROPS:
        raise HTTPException(status_code=400, detail=f"Unsupported crop: {crop_key}")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Please select an image file.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    # ── Fetch or build weather data (fed directly to multimodal model) ────
    if latitude is not None and longitude is not None:
        weather_payload = weather_from_coordinates(latitude, longitude)
    else:
        weather_payload = dict(DEFAULT_LOCATION_PROFILES[0])

    weather_dict = dict(weather_payload["weather"])
    loc_dict = dict(weather_payload["location"])

    # Apply manual farmer overrides if provided
    if temperature is not None:
        weather_dict["temperature_c"] = float(temperature)
    if humidity is not None:
        weather_dict["humidity_percent"] = int(round(humidity))
    if rainfall is not None:
        weather_dict["rainfall_mm"] = float(rainfall)
    if wind_speed is not None:
        weather_dict["wind_kmh"] = float(wind_speed)
    if city and city.strip():
        loc_dict["city"] = city.strip()

    weather_payload = {
        **weather_payload,
        "location": loc_dict,
        "weather": weather_dict,
    }

    # ── Multimodal PyTorch Model (covers all 4 crops: rice, wheat, sugarcane, cotton) ──
    multimodal_result = None
    try:
        multimodal_result = predict_multimodal_disease(file_bytes, weather_dict, crop_hint=crop_key)
        print(f"[Predict] Multimodal model OK -> {multimodal_result['predicted_label']} ({multimodal_result['confidence']:.3f})")
    except Exception as mm_exc:
        print(f"[Predict] Multimodal model failed: {mm_exc}. Trying keras fallback.")

    if multimodal_result is not None:
        # ── Use multimodal result ─────────────────────────────────────────
        predicted_label = multimodal_result["predicted_label"]
        confidence = multimodal_result["confidence"]
        top3_raw = multimodal_result["top3"]
        top3 = [
            {"class": normalize_class_name(item["class"]), "confidence": item["confidence"]}
            for item in top3_raw
        ]
        normalized_label = normalize_class_name(predicted_label)

        # Grad-CAM via keras fallback if available, else skip
        original_rgb = None
        overlay_original = overlay_highlight = raw_heatmap = None
        affected_area_percent = 0.0
        try:
            from PIL import Image as _PIL
            import io as _io
            img = _PIL.open(_io.BytesIO(file_bytes)).convert("RGB")
            original_rgb = np.asarray(img, dtype=np.uint8)
            if crop_key in MODEL_FILES:
                keras_model, _ = load_crop_model(crop_key)
                overlay_original, overlay_highlight, raw_heatmap, affected_area_percent = generate_gradcam_overlay(
                    original_rgb, keras_model, alpha=0.55
                )
        except Exception:
            pass

    else:
        # ── Keras fallback (rice/wheat only) ──────────────────────────────
        if crop_key not in MODEL_FILES:
            raise HTTPException(status_code=503, detail=f"Multimodal model unavailable and no keras fallback for '{crop_key}'.")
        try:
            keras_model, label_map = load_crop_model(crop_key)
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Model load failed: {exc}") from exc

        try:
            image_array, original_rgb = preprocess_image(file_bytes)
            predictions = keras_model.predict(image_array, verbose=0)[0]
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

        top_indexes = np.argsort(predictions)[::-1][:3]
        top3 = [
            {"class": normalize_class_name(label_map.get(str(int(i)), f"Class_{int(i)}")), "confidence": round(float(predictions[int(i)]), 4)}
            for i in top_indexes
        ]
        top_index = int(top_indexes[0])
        predicted_label = label_map.get(str(top_index), f"Class_{top_index}")
        confidence = float(predictions[top_index])
        normalized_label = normalize_class_name(predicted_label)

        overlay_original, overlay_highlight, raw_heatmap, affected_area_percent = generate_gradcam_overlay(
            original_rgb, keras_model, alpha=0.55
        )

    # ── Shared post-processing ────────────────────────────────────────────
    is_healthy_prediction = "healthy" in normalized_label.lower()
    if is_healthy_prediction:
        health_score = max(10, min(100, int(round(confidence * 100))))
    else:
        health_score = max(5, min(90, int(round((1.0 - confidence) * 100))))

    disease_info = get_disease_info(normalized_label)

    if overlay_original is None:
        from PIL import Image as _PIL
        import io as _io
        try:
            img = _PIL.open(_io.BytesIO(file_bytes)).convert("RGB")
            original_rgb_fallback = np.asarray(img, dtype=np.uint8)
            original_image = image_to_data_url(original_rgb_fallback)
        except Exception:
            original_image = ""
        highlighted_image = None
        gradcam_heatmap = None
        affected_area_percent = 0.0
    else:
        original_image = image_to_data_url(overlay_original)
        highlighted_image = image_to_data_url(overlay_highlight)
        gradcam_heatmap = image_to_data_url(raw_heatmap) if raw_heatmap is not None else None

    risk_level, risk_reason = get_weather_risk(weather_dict)
    weather_importance = compute_weather_feature_importance(disease_info, weather_dict)

    summary = (
        f"Detected {normalized_label} in {crop_key} using multimodal AI analysis. "
        f"Likely cause: {disease_info.get('causes', 'Condition-specific causes unavailable.')}"
    )

    return {
        "crop": crop_key,
        "predicted_class": normalized_label,
        "confidence": round(confidence, 4),
        "confidence_percent": round(confidence * 100, 2),
        "health_score": health_score,
        "affected_area_percent": affected_area_percent,
        "top3": top3,
        "disease_key": normalize_disease_key(normalized_label),
        "disease_info": {
            "display": disease_info.get("display"),
            "severity": disease_info.get("severity"),
            "description": disease_info.get("description"),
            "causes": disease_info.get("causes"),
            "treatment": disease_info.get("treatment"),
            "prevention": disease_info.get("prevention"),
        },
        "weather_context": {
            **weather_payload,
            "risk_level": risk_level,
            "risk_reason": risk_reason,
            "feature_importance": weather_importance,
            "weather_importance_days": multimodal_result.get("weather_importance_days") if multimodal_result else None,
        },
        "analysis_summary": summary,
        "original_image": original_image,
        "highlighted_image": highlighted_image,
        "gradcam_heatmap": gradcam_heatmap,
    }


# ── NEW: Diagnosis session endpoints ─────────────────────────────────────────

@app.post("/api/assistant/start")
def start_diagnosis_session(payload: StartSessionRequest):
    """
    POST /api/assistant/start

    Initialises a new diagnosis session and returns the full Mode A Gemini explanation.
    Called once immediately after /api/predict succeeds.
    The frontend receives a diagnosis_id to use for all subsequent /api/assistant/ask calls.
    """
    disease_info = payload.disease_info or {}
    if payload.predicted_class and not disease_info:
        disease_info = get_disease_info(payload.predicted_class)

    # Build the full context for Mode A
    context: dict = {
        "crop": payload.crop,
        "predicted_class": payload.predicted_class,
        "disease": payload.predicted_class,
        "confidence": payload.confidence,
        "top3": payload.top3,
        "weather": payload.weather,
        "feature_importance": payload.feature_importance,
        "gradcam_image_b64": payload.gradcam_image_b64,
        "disease_info": disease_info,
        "language": payload.language,
    }

    # Store session (without huge base64 in every history entry — stored once here)
    _diagnosis_sessions[payload.diagnosis_id] = {
        **context,
        "conversation_history": [],
    }

    # Call Gemini Mode A
    gemini_response = ask_gemini_initial(context)

    return {
        "diagnosis_id": payload.diagnosis_id,
        "gemini_response": gemini_response,
    }


@app.post("/api/assistant/ask")
def ask_assistant(payload: AskRequest):
    """
    POST /api/assistant/ask

    Follow-up conversational chat endpoint.
    Receives only the diagnosis_id and the user's message.
    All diagnosis evidence is looked up from the server-side session store.

    Returns a focused answer (Mode B) — NOT the full diagnosis report.
    """
    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Look up session or create a general session if none exists
    session = _diagnosis_sessions.get(payload.diagnosis_id)
    if not session:
        session = {
            "crop": None,
            "predicted_class": None,
            "disease": None,
            "confidence": 0.0,
            "conversation_history": [],
            "language": payload.language or "en",
        }
        _diagnosis_sessions[payload.diagnosis_id or "default"] = session

    # Detect intent
    intent = detect_intent(message)

    # Build context for Mode B (include conversation history, no re-sending images in history)
    chat_context: dict = {
        **session,
        "message": message,
        "language": payload.language or session.get("language", "en"),
    }

    # Call Gemini Mode B
    result = ask_gemini_chat(chat_context, intent)

    # Update conversation history (text only — no images)
    session["conversation_history"].append({"role": "user", "content": message})
    session["conversation_history"].append({"role": "assistant", "content": result.get("chat_answer", "")})

    # Cap history at 12 entries (6 exchanges)
    if len(session["conversation_history"]) > 12:
        session["conversation_history"] = session["conversation_history"][-12:]

    return {
        "chat_answer": result.get("chat_answer", ""),
        "follow_up_questions": result.get("follow_up_questions", []),
        "intent": result.get("intent", intent),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.server:app", host="127.0.0.1", port=8000, reload=True)
