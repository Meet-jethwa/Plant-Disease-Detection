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
from backend.multimodal_model import CLASS_NAMES, predict_multimodal

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

MODEL_FILES = {
    "rice": {
        "model_file": "rice_disease_disease_model.keras",
        "labels_file": "rice_disease_class_labels.json",
    },
    "wheat": {
        "model_file": "wheat_best_model.keras",
        "labels_file": "wheat_class_labels.json",
    },
    "sugarcane": {
        "model_file": "sugarcane_disease_model.keras",
        "labels_file": "sugarcane_class_labels.json",
    },
    "cotton": {
        "model_file": "cotton_disease_model.keras",
        "labels_file": "cotton_class_labels.json",
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
        with urllib.request.urlopen(req, timeout=2.5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                city = data.get("city") or data.get("locality") or "Detected Location"
                state = data.get("principalSubdivision") or "User Area"
                country = data.get("countryName") or "India"
                return city, state, country
    except Exception:
        pass

    return "Detected Location", "User Area", "India"


def weather_from_coordinates(latitude: float, longitude: float) -> dict:
    city, state, country = fetch_real_location_info(latitude, longitude)

    # Defaults
    temp_c = 28.0
    humidity = 70
    rainfall = 0.0
    wind_kmh = 10.0
    condition = "Partly Cloudy"

    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code"
        req = urllib.request.Request(url, headers={"User-Agent": "FloraAI/1.0"})
        with urllib.request.urlopen(req, timeout=2.5) as resp:
            if resp.status == 200:
                wdata = json.loads(resp.read().decode("utf-8")).get("current", {})
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
            {"name": crop, "label": crop.capitalize()} for crop in MODEL_FILES.keys()
        ]
    }


@app.get("/api/location/fetch")
def fetch_location(latitude: float | None = None, longitude: float | None = None):
    global _location_cursor

    if latitude is not None and longitude is not None:
        data = weather_from_coordinates(latitude, longitude)
        source = "coordinates"
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
    model_type: str = Form("multimodal"),
):
    weather_payload = (
        weather_from_coordinates(latitude, longitude)
        if latitude is not None and longitude is not None
        else DEFAULT_LOCATION_PROFILES[0]
    )

    if model_type not in {"multimodal", "keras"}:
        raise HTTPException(status_code=400, detail="model_type must be 'multimodal' or 'keras'.")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Please select an image file.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if model_type == "multimodal":
        try:
            image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            predictions = predict_multimodal(image, weather_payload["weather"])
            original_rgb = np.asarray(image, dtype=np.uint8)
            crop_prefix = crop.lower()
            crop_indexes = [
                index for index, name in enumerate(CLASS_NAMES)
                if name.startswith(f"{crop_prefix}_")
            ]
            if not crop_indexes:
                raise HTTPException(status_code=400, detail=f"Unsupported crop: {crop}")
            predictions = predictions[crop_indexes]
            label_map = {
                str(index): CLASS_NAMES[crop_indexes[index]].split("_", 1)[1]
                for index in range(len(crop_indexes))
            }
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Multimodal prediction failed: {exc}") from exc
        gradcam_enabled = False
    else:
        try:
            model, label_map = load_crop_model(crop)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except Exception as exc:  # pragma: no cover
            raise HTTPException(status_code=500, detail=f"Model load failed: {exc}") from exc

        try:
            image_array, original_rgb = preprocess_image(file_bytes)
            predictions = model.predict(image_array, verbose=0)[0]
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc
        gradcam_enabled = True

    top_indexes = np.argsort(predictions)[::-1][:3]
    top3 = [
        {
            "class": normalize_class_name(label_map.get(str(int(index)), f"Class_{int(index)}")),
            "confidence": round(float(predictions[int(index)]), 4),
        }
        for index in top_indexes
    ]

    top_index = int(top_indexes[0])
    predicted_label = label_map.get(str(top_index), f"Class_{top_index}")
    confidence = float(predictions[top_index])
    normalized_label = normalize_class_name(predicted_label)

    is_healthy_prediction = "healthy" in normalized_label.lower()
    if is_healthy_prediction:
        health_score = max(10, min(100, int(round(confidence * 100))))
    else:
        health_score = max(5, min(90, int(round((1.0 - confidence) * 100))))

    disease_info = get_disease_info(normalized_label)
    if gradcam_enabled:
        overlay_original, overlay_highlight, raw_heatmap, affected_area_percent = generate_gradcam_overlay(original_rgb, model, alpha=0.55)
    else:
        overlay_original, overlay_highlight, raw_heatmap, affected_area_percent = None, None, None, 0.0

    if overlay_original is None or overlay_highlight is None:
        if gradcam_enabled:
            print(f"[GradCAM] Failed for crop={crop}. Returning original image only.")
        original_image = image_to_data_url(original_rgb)
        highlighted_image = None
        gradcam_heatmap = None
        affected_area_percent = 0.0
    else:
        original_image = image_to_data_url(overlay_original)
        highlighted_image = image_to_data_url(overlay_highlight)
        gradcam_heatmap = image_to_data_url(raw_heatmap) if raw_heatmap is not None else None

    risk_level, risk_reason = get_weather_risk(weather_payload["weather"])
    weather_importance = compute_weather_feature_importance(disease_info, weather_payload["weather"])

    summary = (
        f"Detected {normalized_label} in {crop.lower()} with {round(confidence * 100, 2)}% confidence. "
        f"Likely cause: {disease_info.get('causes', 'Condition-specific causes unavailable.')}"
    )

    return {
        "crop": crop.lower(),
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
