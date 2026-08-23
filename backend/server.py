from __future__ import annotations

import base64
import io
import json
import re
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
from backend.gemini_chat import ask_gemini

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

DEFAULT_LOCATION_PROFILES = [
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
]

_location_cursor = 0


class DiagnosisContext(BaseModel):
    """Full structured context sent to the Gemini interpretation layer."""
    question: str
    crop: str | None = None
    predicted_class: str | None = None
    confidence: float | None = None          # 0.0–1.0
    weather: dict | None = None
    feature_importance: dict | None = None   # {"Humidity": 52.1, "Rainfall": 28.3, ...}
    gradcam_image_b64: str | None = None     # base64 Grad-CAM data URL
    disease_info: dict | None = None         # from disease knowledge base


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


def weather_from_coordinates(latitude: float, longitude: float) -> dict:
    seed = abs(latitude * 1.7 + longitude * 0.9)
    humidity = int(max(35, min(92, round(45 + (seed % 50)))))
    rainfall = round(max(0.0, min(22.0, (seed * 1.3) % 23)), 1)
    temperature = round(max(12.0, min(41.0, 18.0 + ((latitude + longitude) % 23))), 1)
    wind = round(max(2.5, min(30.0, 6.0 + ((seed * 2.1) % 20))), 1)

    if rainfall >= 12:
        condition = "Rain Showers"
    elif humidity >= 80:
        condition = "Humid Cloud Cover"
    elif temperature >= 34:
        condition = "Hot and Dry"
    else:
        condition = "Partly Cloudy"

    return {
        "location": {
            "city": "Detected Location",
            "state": "User Area",
            "country": "Unknown",
            "latitude": round(latitude, 5),
            "longitude": round(longitude, 5),
        },
        "weather": {
            "temperature_c": temperature,
            "humidity_percent": humidity,
            "rainfall_mm": rainfall,
            "wind_kmh": wind,
            "condition": condition,
        },
    }


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
):
    try:
        model, label_map = load_crop_model(crop)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive error handling
        raise HTTPException(status_code=500, detail=f"Model load failed: {exc}") from exc

    if not file.filename:
        raise HTTPException(status_code=400, detail="Please select an image file.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    try:
        image_array, original_rgb = preprocess_image(file_bytes)
        predictions = model.predict(image_array, verbose=0)[0]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

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

    # Health score: high confidence in a DISEASE means LOW plant health.
    # For healthy predictions, high confidence means HIGH health score.
    is_healthy_prediction = "healthy" in normalized_label.lower()
    if is_healthy_prediction:
        health_score = max(10, min(100, int(round(confidence * 100))))
    else:
        # Invert: 100% confident disease → score near 0; low confidence → score near 90
        health_score = max(5, min(90, int(round((1.0 - confidence) * 100))))

    disease_info = get_disease_info(normalized_label)
    overlay_original, overlay_highlight = generate_gradcam_overlay(original_rgb, model, alpha=0.4)

    if overlay_original is None or overlay_highlight is None:
        original_image = image_to_data_url(original_rgb)
        highlighted_image = image_to_data_url(original_rgb)
    else:
        original_image = image_to_data_url(overlay_original)
        highlighted_image = image_to_data_url(overlay_highlight)

    weather_payload = None
    if latitude is not None and longitude is not None:
        weather_payload = weather_from_coordinates(latitude, longitude)
    else:
        weather_payload = DEFAULT_LOCATION_PROFILES[0]

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
    }


@app.post("/api/assistant/ask")
def ask_assistant(payload: DiagnosisContext):
    """
    Context-aware agricultural assistant powered by Gemini.

    Receives a full DiagnosisContext (disease prediction + XAI outputs +
    environmental data + Grad-CAM image) and routes it to the Gemini
    interpretation layer.

    Gemini's role: interpret and explain. NOT re-diagnose.
    Falls back to rule-based responses when GEMINI_API_KEY is not set.
    """
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Enrich disease_info from knowledge base if not already provided
    disease_info = payload.disease_info or {}
    if payload.predicted_class and not disease_info:
        disease_info = get_disease_info(payload.predicted_class)

    # Build the full context dict for Gemini
    context: dict = {
        "question": question,
        "crop": payload.crop,
        "predicted_class": payload.predicted_class,
        "confidence": payload.confidence,
        "weather": payload.weather,
        "feature_importance": payload.feature_importance,
        "gradcam_image_b64": payload.gradcam_image_b64,
        "disease_info": disease_info,
    }

    # Generate suggested follow-up questions (context-aware)
    disease_label = (
        disease_info.get("display") or
        (payload.predicted_class or "").replace("_", " ").title() or
        "your plant"
    )
    follow_ups = [
        f"What should I do about {disease_label}?",
        f"Why was {disease_label} detected in my {payload.crop or 'crop'}?",
        "What environmental factors contributed to this detection?",
        f"How can I prevent {disease_label} from spreading?",
        "What symptoms should I monitor over the next few days?",
    ]

    gemini_response = ask_gemini(context)
    return {
        "gemini_response": gemini_response,
        "follow_up_questions": follow_ups,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.server:app", host="127.0.0.1", port=8000, reload=False)
