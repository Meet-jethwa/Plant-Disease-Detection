from __future__ import annotations

import base64
from datetime import date, datetime, timedelta
import io
import json
import math
import os
import re
import time
import urllib.parse
import urllib.request
import uuid
from functools import lru_cache
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

from backend.disease_info import (
    compute_weather_feature_importance,
    compute_weather_shap_values,
    get_disease_info,
)
from backend.forecasting import (
    forecast_7day_disease_progression,
    predict_disease_risk,
)
from backend.gemini_chat import ask_gemini_initial, ask_gemini_chat, detect_intent
from backend.multimodal_model import (
    CLASS_NAMES,
    MODEL_PATH,
    get_season_encoding,
    get_weather_stats,
    load_multimodal_model,
    predict_multimodal,
)

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

SUPPORTED_CROPS = set(MODEL_FILES.keys())

_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
_ENV_CORS = os.getenv("CORS_ORIGINS")
if _ENV_CORS:
    _CORS_ORIGINS.extend([o.strip() for o in _ENV_CORS.split(",") if o.strip()])

app = FastAPI(title="FloraAI Plant Disease API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def clean_path_middleware(request, call_next):
    """Normalize accidental double or redundant slashes in incoming request paths."""
    if "//" in request.scope.get("path", ""):
        request.scope["path"] = re.sub(r"/+", "/", request.scope["path"])
    return await call_next(request)

# ── In-memory session store ───────────────────────────────────────────────────
# Maps diagnosis_id → full diagnosis context + conversation history
_diagnosis_sessions: dict[str, dict] = {}

MAX_UPLOAD_SIZE = 15 * 1024 * 1024  # 15 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_IMAGE_PIXELS = 4096 * 4096  # ~16.7 megapixels


def validate_image_upload(file_bytes: bytes, filename: str | None, content_type: str | None) -> Image.Image:
    """
    Validate upload size, MIME type, structure, and decompression bounds (Phase 10.2).
    Prevents decompression bombs, malformed payloads, and server resource exhaustion.
    """
    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(file_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Image file size ({len(file_bytes)/(1024*1024):.1f}MB) exceeds the maximum allowed limit of 15MB."
        )

    if content_type and content_type.lower() not in ALLOWED_MIME_TYPES and content_type != "application/octet-stream":
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{content_type}'. Please upload a JPEG, PNG, or WebP image."
        )

    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Corrupt or invalid image file. Decoding failed: {exc}"
        )

    img = Image.open(io.BytesIO(file_bytes))
    w, h = img.size
    if w * h > MAX_IMAGE_PIXELS:
        raise HTTPException(
            status_code=400,
            detail=f"Image dimensions ({w}x{h} = {w*h} pixels) exceed the maximum safe threshold of 16 megapixels."
        )
    return img


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
    Accepts message or question, and diagnosis_id.
    """
    diagnosis_id: str
    message: str | None = None
    question: str | None = None
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

    from tensorflow.keras.models import load_model
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


def get_weather_risk(weather: dict, crop: str = "rice") -> tuple[str, str]:
    try:
        res = predict_disease_risk(weather, crop=crop)
        return res["risk_level"], res["reasoning"]
    except Exception:
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


# ── Open-Meteo Integration with Caching & Agro-Climatic Fallbacks ───────────
OPEN_METEO_API_KEY = os.getenv("OPEN_METEO_API_KEY", "").strip()


def _append_api_key(url: str) -> str:
    """Append optional Open-Meteo API key if configured in environment."""
    if OPEN_METEO_API_KEY:
        sep = "&" if "?" in url else "?"
        return f"{url}{sep}apikey={OPEN_METEO_API_KEY}"
    return url


# In-memory TTL caches: key -> (timestamp, data)
# Drastically slashes outbound requests and avoids shared datacenter IP rate limits (HTTP 429)
_GEOCODE_CACHE: dict[str, tuple[float, dict]] = {}
_CURRENT_WEATHER_CACHE: dict[str, tuple[float, dict]] = {}
_PAST_WEATHER_CACHE: dict[str, tuple[float, dict]] = {}

# Well-known agricultural and major city hubs for instant offline resolution
_KNOWN_GEO_LOCATIONS: dict[str, dict] = {
    "delhi": {"city": "New Delhi", "state": "Delhi", "country": "India", "latitude": 28.6139, "longitude": 77.2090, "elevation": 216.0, "timezone": "Asia/Kolkata"},
    "new delhi": {"city": "New Delhi", "state": "Delhi", "country": "India", "latitude": 28.6139, "longitude": 77.2090, "elevation": 216.0, "timezone": "Asia/Kolkata"},
    "mumbai": {"city": "Mumbai", "state": "Maharashtra", "country": "India", "latitude": 19.0760, "longitude": 72.8777, "elevation": 14.0, "timezone": "Asia/Kolkata"},
    "pune": {"city": "Pune", "state": "Maharashtra", "country": "India", "latitude": 18.5204, "longitude": 73.8567, "elevation": 560.0, "timezone": "Asia/Kolkata"},
    "nagpur": {"city": "Nagpur", "state": "Maharashtra", "country": "India", "latitude": 21.1458, "longitude": 79.0882, "elevation": 310.0, "timezone": "Asia/Kolkata"},
    "ahmedabad": {"city": "Ahmedabad", "state": "Gujarat", "country": "India", "latitude": 23.0225, "longitude": 72.5714, "elevation": 53.0, "timezone": "Asia/Kolkata"},
    "surat": {"city": "Surat", "state": "Gujarat", "country": "India", "latitude": 21.1702, "longitude": 72.8311, "elevation": 13.0, "timezone": "Asia/Kolkata"},
    "rajkot": {"city": "Rajkot", "state": "Gujarat", "country": "India", "latitude": 22.3039, "longitude": 70.8022, "elevation": 128.0, "timezone": "Asia/Kolkata"},
    "bengaluru": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "latitude": 12.9716, "longitude": 77.5946, "elevation": 920.0, "timezone": "Asia/Kolkata"},
    "bangalore": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "latitude": 12.9716, "longitude": 77.5946, "elevation": 920.0, "timezone": "Asia/Kolkata"},
    "hyderabad": {"city": "Hyderabad", "state": "Telangana", "country": "India", "latitude": 17.3850, "longitude": 78.4867, "elevation": 542.0, "timezone": "Asia/Kolkata"},
    "chennai": {"city": "Chennai", "state": "Tamil Nadu", "country": "India", "latitude": 13.0827, "longitude": 80.2707, "elevation": 6.0, "timezone": "Asia/Kolkata"},
    "kolkata": {"city": "Kolkata", "state": "West Bengal", "country": "India", "latitude": 22.5726, "longitude": 88.3639, "elevation": 9.0, "timezone": "Asia/Kolkata"},
    "lucknow": {"city": "Lucknow", "state": "Uttar Pradesh", "country": "India", "latitude": 26.8467, "longitude": 80.9462, "elevation": 123.0, "timezone": "Asia/Kolkata"},
    "kanpur": {"city": "Kanpur", "state": "Uttar Pradesh", "country": "India", "latitude": 26.4499, "longitude": 80.3319, "elevation": 126.0, "timezone": "Asia/Kolkata"},
    "ludhiana": {"city": "Ludhiana", "state": "Punjab", "country": "India", "latitude": 30.9010, "longitude": 75.8573, "elevation": 244.0, "timezone": "Asia/Kolkata"},
    "chandigarh": {"city": "Chandigarh", "state": "Punjab", "country": "India", "latitude": 30.7333, "longitude": 76.7794, "elevation": 321.0, "timezone": "Asia/Kolkata"},
    "jaipur": {"city": "Jaipur", "state": "Rajasthan", "country": "India", "latitude": 26.9124, "longitude": 75.7873, "elevation": 431.0, "timezone": "Asia/Kolkata"},
    "bhopal": {"city": "Bhopal", "state": "Madhya Pradesh", "country": "India", "latitude": 23.2599, "longitude": 77.4126, "elevation": 527.0, "timezone": "Asia/Kolkata"},
    "indore": {"city": "Indore", "state": "Madhya Pradesh", "country": "India", "latitude": 22.7196, "longitude": 75.8577, "elevation": 553.0, "timezone": "Asia/Kolkata"},
    "patna": {"city": "Patna", "state": "Bihar", "country": "India", "latitude": 25.5941, "longitude": 85.1376, "elevation": 53.0, "timezone": "Asia/Kolkata"},
}


def generate_agro_seasonal_baseline(
    latitude: float,
    longitude: float,
    target_d: date | None = None,
) -> dict:
    """
    Synthesize an authentic agro-climatic 7-day meteorological sequence based on
    latitude and seasonal calendar normals. Used as a resilient safety net when
    external meteorological APIs (Open-Meteo) encounter rate limits (HTTP 429)
    or network partitions, guaranteeing diagnosis never fails with HTTP 502.
    """
    d_end = target_d or date.today()
    month = d_end.month

    # Seasonal baseline for sub-tropical agricultural zones (8° - 35° N)
    if month in (12, 1, 2):
        # Winter / Cold dry season
        base_tmax, base_tmin, base_rh, base_rain, base_wind = 26.0, 13.5, 62.0, 0.0, 8.5
    elif month in (3, 4, 5):
        # Summer / Hot dry pre-monsoon
        base_tmax, base_tmin, base_rh, base_rain, base_wind = 37.5, 23.5, 48.0, 0.5, 12.0
    elif month in (6, 7, 8, 9):
        # Monsoon / Kharif wet season
        base_tmax, base_tmin, base_rh, base_rain, base_wind = 30.5, 24.0, 84.0, 12.0, 13.5
    else:
        # Months 10, 11: Post-Monsoon / Autumn / Rabi sowing
        base_tmax, base_tmin, base_rh, base_rain, base_wind = 29.0, 18.0, 66.0, 1.0, 9.0

    # Latitude adjustment for non-tropical or temperate latitudes
    lat_adj = max(-15.0, min(10.0, (25.0 - abs(latitude)) * 0.35))
    base_tmax = round(base_tmax + lat_adj, 1)
    base_tmin = round(base_tmin + lat_adj, 1)

    features_7x11 = []
    dates_list = []
    for idx in range(7):
        day_date = d_end - timedelta(days=(6 - idx))
        sin_m, cos_m = get_season_encoding(day_date)
        var_factor = math.sin((idx / 6.0) * math.pi)
        t_max = round(base_tmax + (idx - 3) * 0.35 + var_factor * 0.5, 1)
        t_min = round(base_tmin + (idx - 3) * 0.25, 1)
        t_mean = round((t_max + t_min) / 2.0, 1)
        rh_mean = round(min(98.0, max(25.0, base_rh + (idx - 3) * 1.2)), 1)
        rh_max = round(min(100.0, rh_mean + 12.0), 1)
        precip = round(max(0.0, base_rain * (0.8 + 0.1 * idx)), 1)
        dewpoint = round(t_mean - ((100.0 - rh_mean) / 5.0), 1)
        wind_max = round(max(2.0, base_wind + (idx % 3) * 0.6), 1)
        soil_temp = 0.0

        features_7x11.append([
            t_max, t_min, t_mean, rh_max, rh_mean, precip,
            dewpoint, wind_max, soil_temp, sin_m, cos_m
        ])
        dates_list.append(day_date.isoformat())

    temps = [row[2] for row in features_7x11]
    rhs = [row[4] for row in features_7x11]
    rains = [row[5] for row in features_7x11]
    winds = [row[7] for row in features_7x11]

    avg_temp = round(sum(temps) / len(temps), 1)
    avg_rh = int(round(sum(rhs) / len(rhs)))
    total_rain = round(sum(rains), 1)
    avg_wind = round(sum(winds) / len(winds), 1)

    if total_rain >= 15.0:
        cond = "Rainy / Prolonged Wetness"
    elif avg_rh >= 80:
        cond = "Humid Canopy Conditions"
    elif avg_temp >= 33.0:
        cond = "Hot & Dry"
    else:
        cond = "Moderate Foliar Environment"

    return {
        "features_7x11": features_7x11,
        "dates": dates_list,
        "is_archive": False,
        "source": "agro_seasonal_baseline",
        "weather_summary": {
            "temperature_c": avg_temp,
            "humidity_percent": avg_rh,
            "rainfall_mm": total_rain,
            "wind_kmh": avg_wind,
            "condition": cond,
        },
    }


def geocode_location_open_meteo(query: str) -> dict | None:
    """
    Search and resolve city/region coordinates using Open-Meteo Geocoding API with
    in-memory caching and fallback to known agricultural hub coordinates.
    """
    if not query or not query.strip():
        return None
    cleaned = query.strip()
    cache_key = cleaned.lower()

    # Check cache (24 hours TTL)
    if cache_key in _GEOCODE_CACHE:
        cached_ts, cached_data = _GEOCODE_CACHE[cache_key]
        if time.time() - cached_ts < 86400:
            return cached_data

    # Check known agricultural locations first for instant zero-latency match
    if cache_key in _KNOWN_GEO_LOCATIONS:
        match = _KNOWN_GEO_LOCATIONS[cache_key]
        _GEOCODE_CACHE[cache_key] = (time.time(), match)
        return match

    try:
        url = _append_api_key(
            f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(cleaned)}&count=1&language=en&format=json"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "FloraAI/1.0"})
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                results = data.get("results")
                if results and len(results) > 0:
                    top = results[0]
                    res = {
                        "city": top.get("name") or cleaned,
                        "state": top.get("admin1") or top.get("admin2") or "Agricultural Area",
                        "country": top.get("country") or "India",
                        "latitude": float(top.get("latitude")),
                        "longitude": float(top.get("longitude")),
                        "elevation": top.get("elevation"),
                        "timezone": top.get("timezone", "Asia/Kolkata"),
                    }
                    _GEOCODE_CACHE[cache_key] = (time.time(), res)
                    return res
    except Exception as exc:
        print(f"[Open-Meteo Geocoding] Failed for '{cleaned}': {exc}")

    # Fallback: check if any known location is a substring
    for known_key, known_val in _KNOWN_GEO_LOCATIONS.items():
        if known_key in cache_key or cache_key in known_key:
            _GEOCODE_CACHE[cache_key] = (time.time(), known_val)
            return known_val

    return None


def weather_from_coordinates(
    latitude: float,
    longitude: float,
    city_hint: str | None = None,
    state_hint: str | None = None,
    country_hint: str | None = None,
    elevation_hint: float | None = None,
    timezone_hint: str | None = None,
) -> dict:
    if city_hint:
        city = city_hint
        state = state_hint or "Agricultural Area"
        country = country_hint or "India"
    else:
        city, state, country = fetch_real_location_info(latitude, longitude)

    cache_key = f"{round(latitude, 2)}_{round(longitude, 2)}"
    now = time.time()
    if cache_key in _CURRENT_WEATHER_CACHE:
        cached_ts, cached_payload = _CURRENT_WEATHER_CACHE[cache_key]
        if now - cached_ts < 1800:  # 30 minutes TTL
            result = dict(cached_payload)
            if city_hint:
                result["location"] = {
                    **result["location"],
                    "city": city,
                    "state": state,
                    "country": country,
                }
            return result

    # Defaults
    temp_c = 28.0
    humidity = 70
    rainfall = 0.0
    wind_kmh = 10.0
    condition = "Partly Cloudy"
    code = 0
    surface_pressure = None
    cloud_cover = None
    elevation = elevation_hint
    timezone = timezone_hint or "Asia/Kolkata"
    success = False

    try:
        url = _append_api_key(
            f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}"
            "&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code,surface_pressure,cloud_cover"
            "&timezone=auto"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "FloraAI/1.0"})
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            if resp.status == 200:
                raw_json = json.loads(resp.read().decode("utf-8"))
                wdata = raw_json.get("current", {})
                temp_c = float(wdata.get("temperature_2m", temp_c))
                humidity = int(round(float(wdata.get("relative_humidity_2m", humidity))))
                rainfall = float(wdata.get("rain", rainfall))
                wind_kmh = float(wdata.get("wind_speed_10m", wind_kmh))
                code = int(wdata.get("weather_code", 0))
                surface_pressure = wdata.get("surface_pressure")
                cloud_cover = wdata.get("cloud_cover")
                if "elevation" in raw_json:
                    elevation = raw_json["elevation"]
                if "timezone" in raw_json:
                    timezone = raw_json["timezone"]

                # Accurate WMO weather interpretation
                if code == 0:
                    condition = "Clear Sky"
                elif code in (1, 2):
                    condition = "Partly Cloudy"
                elif code == 3:
                    condition = "Overcast"
                elif code in (45, 48):
                    condition = "Foggy"
                elif code in (51, 53, 55):
                    condition = "Drizzle / Light Rain"
                elif code in (61, 63, 65):
                    condition = "Rain"
                elif code in (80, 81, 82):
                    condition = "Rain Showers"
                elif code in (95, 96, 99):
                    condition = "Thunderstorm"
                elif humidity >= 80:
                    condition = "Humid & Overcast"
                elif temp_c >= 33:
                    condition = "Hot & Sunny"
                else:
                    condition = "Partly Cloudy"
                success = True
    except Exception as exc:
        print(f"[Open-Meteo Current Weather] Fetch failed ({exc}); falling back gracefully.")
        # Stale cache fallback if available
        if cache_key in _CURRENT_WEATHER_CACHE:
            return _CURRENT_WEATHER_CACHE[cache_key][1]

        # Agro-climatic seasonal baseline fallback
        baseline = generate_agro_seasonal_baseline(latitude, longitude)
        b_sum = baseline["weather_summary"]
        temp_c = b_sum["temperature_c"]
        humidity = b_sum["humidity_percent"]
        rainfall = b_sum["rainfall_mm"]
        wind_kmh = b_sum["wind_kmh"]
        condition = b_sum["condition"]

    result = {
        "location": {
            "city": city,
            "state": state,
            "country": country,
            "latitude": round(latitude, 5),
            "longitude": round(longitude, 5),
            "elevation": elevation,
            "timezone": timezone,
        },
        "weather": {
            "temperature_c": round(temp_c, 1),
            "humidity_percent": humidity,
            "rainfall_mm": round(rainfall, 1),
            "wind_kmh": round(wind_kmh, 1),
            "condition": condition,
            "weather_code": code,
            "surface_pressure_hpa": round(surface_pressure, 1) if surface_pressure else None,
            "cloud_cover_percent": cloud_cover,
        },
        "source": "open_meteo_live" if success else "agro_seasonal_baseline",
    }
    _CURRENT_WEATHER_CACHE[cache_key] = (now, result)
    return result


def fetch_real_past_weather_sequence(
    latitude: float,
    longitude: float,
    capture_date: str | date | None = None,
) -> dict:
    """
    Retrieve authentic 7-day past meteorological observations from Open-Meteo.
    - If capture_date is specified and older than 5 days, queries Open-Meteo Historical Archive API.
    - Otherwise, queries Open-Meteo Forecast API with past_days=7.
    Extracts the 11 standardized features per day matching the multimodal training schema:
      0: temp_max, 1: temp_min, 2: temp_mean, 3: rh_max, 4: rh_mean, 5: precip_sum,
      6: dewpoint_mean, 7: wind_max, 8: soil_temp (0.0), 9: month_sin, 10: month_cos.
    Includes in-memory TTL caching and graceful seasonal agro-climatic baseline fallback
    on HTTP 429 rate limits or network issues to ensure prediction never fails with 502.
    """
    today = date.today()
    target_d = None
    is_archive = False

    if capture_date:
        try:
            if isinstance(capture_date, str):
                target_d = datetime.strptime(capture_date.strip()[:10], "%Y-%m-%d").date()
            elif isinstance(capture_date, datetime):
                target_d = capture_date.date()
            elif isinstance(capture_date, date):
                target_d = capture_date
        except Exception:
            target_d = None

    cache_date_str = target_d.isoformat() if target_d else today.isoformat()
    cache_key = f"{round(latitude, 2)}_{round(longitude, 2)}_{cache_date_str}"
    now = time.time()

    # Check cache (1 hour for recent, 24 hours for archive)
    if cache_key in _PAST_WEATHER_CACHE:
        cached_ts, cached_payload = _PAST_WEATHER_CACHE[cache_key]
        ttl = 86400 if is_archive else 3600
        if now - cached_ts < ttl:
            return cached_payload

    if target_d and target_d < (today - timedelta(days=5)):
        is_archive = True
        start_d = target_d - timedelta(days=6)
        end_d = target_d
        url = _append_api_key(
            f"https://archive-api.open-meteo.com/v1/archive?latitude={latitude}&longitude={longitude}"
            f"&start_date={start_d.isoformat()}&end_date={end_d.isoformat()}"
            "&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_max,relative_humidity_2m_mean,precipitation_sum,dew_point_2m_mean,wind_speed_10m_max"
            "&timezone=auto"
        )
    else:
        url = _append_api_key(
            f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}"
            "&past_days=7&forecast_days=1"
            "&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_max,relative_humidity_2m_mean,precipitation_sum,dew_point_2m_mean,wind_speed_10m_max"
            "&timezone=auto"
        )

    raw = None
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "FloraAI/1.0"})
        with urllib.request.urlopen(req, timeout=4.5) as resp:
            if resp.status == 200:
                raw = json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        print(f"[Open-Meteo Past Weather] Retrieval failed ({exc}); falling back gracefully.")

    daily = raw.get("daily", {}) if raw else {}
    times = daily.get("time", [])

    if not raw or len(times) < 7:
        # Check stale cache first
        if cache_key in _PAST_WEATHER_CACHE:
            return _PAST_WEATHER_CACHE[cache_key][1]

        # Synthesize seasonal agro-climatic baseline
        fallback = generate_agro_seasonal_baseline(latitude, longitude, target_d=target_d or today)
        fallback["is_archive"] = is_archive
        _PAST_WEATHER_CACHE[cache_key] = (now, fallback)
        return fallback

    # Take the 7 incubation days preceding / ending on diagnosis date
    indices = range(len(times) - 7, len(times))
    features_7x11 = []
    dates_list = []

    for idx in indices:
        t_max = float(daily["temperature_2m_max"][idx]) if daily.get("temperature_2m_max") and daily["temperature_2m_max"][idx] is not None else 28.0
        t_min = float(daily["temperature_2m_min"][idx]) if daily.get("temperature_2m_min") and daily["temperature_2m_min"][idx] is not None else 20.0
        t_mean = float(daily["temperature_2m_mean"][idx]) if daily.get("temperature_2m_mean") and daily["temperature_2m_mean"][idx] is not None else (t_max + t_min) / 2.0
        rh_mean = float(daily["relative_humidity_2m_mean"][idx]) if daily.get("relative_humidity_2m_mean") and daily["relative_humidity_2m_mean"][idx] is not None else 70.0
        rh_max = float(daily["relative_humidity_2m_max"][idx]) if daily.get("relative_humidity_2m_max") and daily["relative_humidity_2m_max"][idx] is not None else min(100.0, rh_mean + 12.0)
        precip = float(daily["precipitation_sum"][idx]) if daily.get("precipitation_sum") and daily["precipitation_sum"][idx] is not None else 0.0
        dewpoint = float(daily["dew_point_2m_mean"][idx]) if daily.get("dew_point_2m_mean") and daily["dew_point_2m_mean"][idx] is not None else (t_mean - ((100.0 - rh_mean) / 5.0))
        wind_max = float(daily["wind_speed_10m_max"][idx]) if daily.get("wind_speed_10m_max") and daily["wind_speed_10m_max"][idx] is not None else 10.0
        soil_temp = 0.0

        try:
            d_obj = datetime.strptime(times[idx], "%Y-%m-%d").date()
        except Exception:
            d_obj = today - timedelta(days=(len(times) - 1 - idx))

        sin_m, cos_m = get_season_encoding(d_obj)
        features_7x11.append([
            t_max, t_min, t_mean, rh_max, rh_mean, precip,
            dewpoint, wind_max, soil_temp, sin_m, cos_m
        ])
        dates_list.append(times[idx])

    temps = [row[2] for row in features_7x11]
    rhs = [row[4] for row in features_7x11]
    rains = [row[5] for row in features_7x11]
    winds = [row[7] for row in features_7x11]

    avg_temp = round(sum(temps) / len(temps), 1)
    avg_rh = int(round(sum(rhs) / len(rhs)))
    total_rain = round(sum(rains), 1)
    avg_wind = round(sum(winds) / len(winds), 1)

    if total_rain >= 15.0:
        cond = "Rainy / Prolonged Wetness"
    elif avg_rh >= 80:
        cond = "Humid Canopy Conditions"
    elif avg_temp >= 33.0:
        cond = "Hot & Dry"
    else:
        cond = "Moderate Foliar Environment"

    result = {
        "features_7x11": features_7x11,
        "dates": dates_list,
        "is_archive": is_archive,
        "source": "open_meteo_historical_archive" if is_archive else "open_meteo_live",
        "weather_summary": {
            "temperature_c": avg_temp,
            "humidity_percent": avg_rh,
            "rainfall_mm": total_rain,
            "wind_kmh": avg_wind,
            "condition": cond,
        },
    }
    _PAST_WEATHER_CACHE[cache_key] = (now, result)
    return result


# ── Disease Weather Profiles (Project v3 Dataset) ───────────────────────────
_WEATHER_PROFILES_CACHE = None

def _get_disease_weather_profiles() -> dict:
    global _WEATHER_PROFILES_CACHE
    if _WEATHER_PROFILES_CACHE is None:
        p_path = MODELS_DIR / "disease_weather_profiles.json"
        if p_path.exists():
            try:
                with open(p_path, "r", encoding="utf-8") as f:
                    _WEATHER_PROFILES_CACHE = json.load(f)
            except Exception as e:
                print(f"[server] Warning loading disease_weather_profiles.json: {e}")
                _WEATHER_PROFILES_CACHE = {}
        else:
            _WEATHER_PROFILES_CACHE = {}
    return _WEATHER_PROFILES_CACHE


@app.get("/api/weather/disease-profiles")
def get_disease_weather_profiles(crop: str | None = None):
    """
    Returns pre-computed meteorological profiles from the Project v3 dataset
    for demonstration and testing mode.
    """
    profiles = _get_disease_weather_profiles()
    result = []
    for key, p in profiles.items():
        if crop and p.get("crop", "").lower() != crop.lower():
            continue
        result.append({
            "key": key,
            "crop": p.get("crop"),
            "disease": p.get("disease"),
            "display_name": p.get("display_name"),
            "avg_temp_c": p.get("avg_temp_c"),
            "avg_humidity_pct": p.get("avg_humidity_pct"),
            "total_rainfall_mm": p.get("total_rainfall_mm"),
            "avg_wind_kmh": p.get("avg_wind_kmh"),
            "condition_summary": p.get("condition_summary"),
            "description": p.get("description"),
        })
    result.sort(key=lambda x: x["display_name"])
    return {"profiles": result}


@app.get("/api/weather/forecast-risk")
def get_risk_forecast(
    crop: str = "rice",
    temperature: float = 28.0,
    humidity: float = 70.0,
    rainfall: float = 2.0,
    wind_speed: float = 10.0,
    latitude: float | None = None,
    longitude: float | None = None,
    city: str | None = None,
):
    lat = latitude
    lon = longitude
    if (lat is None or lon is None) and city and city.strip():
        geo = geocode_location_open_meteo(city.strip())
        if geo:
            lat = geo["latitude"]
            lon = geo["longitude"]

    wx = {
        "temperature_c": temperature,
        "humidity_percent": humidity,
        "rainfall_mm": rainfall,
        "wind_kmh": wind_speed,
        "latitude": lat,
        "longitude": lon,
    }
    current_risk = predict_disease_risk(wx, crop=crop)
    outlook = forecast_7day_disease_progression(wx, crop=crop, latitude=lat, longitude=lon)
    return {
        "crop": crop,
        "current_assessment": current_risk,
        "seven_day_outlook": outlook,
        "coordinates": {"latitude": lat, "longitude": lon} if lat is not None and lon is not None else None,
    }


# ── Standard routes ───────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "FloraAI backend"}


@app.get("/api/model/status")
def get_model_status():
    """Verify presence, integrity, and compatibility of required ML model checkpoints (Phase 6)."""
    multimodal_ready = False
    details = {}
    try:
        if MODEL_PATH.exists():
            _ = load_multimodal_model()
            mean, std = get_weather_stats()
            multimodal_ready = (len(CLASS_NAMES) == 33 and len(mean) == 11 and len(std) == 11)
            details["multimodal"] = {
                "checkpoint": str(MODEL_PATH.name),
                "classes": len(CLASS_NAMES),
                "weather_features": len(mean),
                "status": "ready" if multimodal_ready else "invalid_dimensions",
            }
        else:
            details["multimodal"] = {"status": "missing_checkpoint", "path": str(MODEL_PATH)}
    except Exception as exc:
        details["multimodal"] = {"status": "error", "error": str(exc)}

    crop_models = {}
    for crop, files in MODEL_FILES.items():
        m_path = MODELS_DIR / files["model_file"]
        crop_models[crop] = {
            "file": files["model_file"],
            "exists": m_path.exists(),
        }
    details["crop_image_models"] = crop_models
    return {
        "status": "healthy" if multimodal_ready else "degraded",
        "primary_engine": "multimodal_fusion" if multimodal_ready else "image_only_fallback",
        "models": details,
    }


@app.get("/api/crops")
def get_crops():
    return {
        "crops": [
            {"name": crop, "label": crop.capitalize()} for crop in MODEL_FILES.keys()
        ]
    }


@app.get("/api/location/search")
def search_locations(query: str):
    """
    Search cities and agricultural regions worldwide via Open-Meteo Geocoding API,
    with fallback to known agricultural hub coordinates if API is rate-limited.
    """
    if not query or not query.strip():
        return {"results": []}
    q = query.strip()
    try:
        url = _append_api_key(
            f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(q)}&count=8&language=en&format=json"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "FloraAI/1.0"})
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                results = [
                    {
                        "id": r.get("id"),
                        "name": r.get("name"),
                        "latitude": r.get("latitude"),
                        "longitude": r.get("longitude"),
                        "elevation": r.get("elevation"),
                        "country": r.get("country"),
                        "state": r.get("admin1"),
                        "timezone": r.get("timezone"),
                    }
                    for r in data.get("results", [])
                ]
                if results:
                    return {"results": results}
    except Exception as exc:
        print(f"[Open-Meteo Geocoding search] Error: {exc}")

    # Fallback: search known agricultural hubs if external API is rate-limited
    q_low = q.lower()
    local_matches = []
    for k, v in _KNOWN_GEO_LOCATIONS.items():
        if q_low in k or k in q_low:
            local_matches.append({
                "id": abs(hash(k)) % 100000,
                "name": v["city"],
                "latitude": v["latitude"],
                "longitude": v["longitude"],
                "elevation": v.get("elevation", 100.0),
                "country": v["country"],
                "state": v["state"],
                "timezone": v.get("timezone", "Asia/Kolkata"),
            })
    return {"results": local_matches}


@app.get("/api/location/fetch")
def fetch_location(
    latitude: float | None = None,
    longitude: float | None = None,
    lat: float | None = None,
    lon: float | None = None,
    city: str | None = None,
    query: str | None = None,
):
    target_lat = latitude if latitude is not None else lat
    target_lon = longitude if longitude is not None else lon
    search_term = city or query
    if search_term and search_term.strip():
        geo = geocode_location_open_meteo(search_term.strip())
        if geo:
            data = weather_from_coordinates(
                geo["latitude"],
                geo["longitude"],
                city_hint=geo["city"],
                state_hint=geo["state"],
                country_hint=geo["country"],
                elevation_hint=geo.get("elevation"),
                timezone_hint=geo.get("timezone"),
            )
            source = "open_meteo_geocoding"
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Location '{search_term.strip()}' could not be resolved via Open-Meteo geocoding. Please check the spelling or provide GPS coordinates."
            )
    elif target_lat is not None and target_lon is not None:
        data = weather_from_coordinates(target_lat, target_lon)
        source = "coordinates"
    else:
        raise HTTPException(
            status_code=400,
            detail="Latitude and longitude coordinates or a valid city/village name are required. Location data not provided."
        )

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
    model_type: str = Form("auto"),
    lang: str = Form("en"),
    weather_profile: str | None = Form(None),
    capture_date: str | None = Form(None),
):
    crop_key = crop.lower()
    if crop_key not in SUPPORTED_CROPS:
        raise HTTPException(status_code=400, detail=f"Unsupported crop: {crop_key}")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Please select an image file.")

    file_bytes = await file.read()
    # Validate upload security: size, MIME type, PIL decode, decompression bounds (Phase 10.2)
    validate_image_upload(file_bytes, file.filename, file.content_type)

    # ── Fetch or build genuine weather data ──────────────────────────────────
    weather_features_7x11 = None
    is_manual_profile = False
    profile_info = None
    observation_dates = None
    is_historical_archive = False

    # 1. Demonstration research testing profile override
    if weather_profile and weather_profile.strip() and weather_profile.strip().lower() != "auto":
        profiles = _get_disease_weather_profiles()
        profile_data = profiles.get(weather_profile.strip())
        if profile_data:
            is_manual_profile = True
            profile_info = profile_data
            weather_features_7x11 = profile_data.get("features_7x11")
            weather_dict = {
                "temperature_c": float(profile_data.get("avg_temp_c", 28.0)),
                "humidity_percent": int(round(profile_data.get("avg_humidity_pct", 70.0))),
                "rainfall_mm": float(profile_data.get("total_rainfall_mm", 0.0)),
                "wind_kmh": float(profile_data.get("avg_wind_kmh", 10.0)),
                "condition": profile_data.get("condition_summary", "Demonstration Profile"),
            }
            loc_dict = {
                "city": f"{profile_data.get('disease')} Profile",
                "state": f"Project v3 ({profile_data.get('crop', '').capitalize()})",
                "country": "Demonstration Dataset",
                "latitude": 23.0,
                "longitude": 72.0,
            }
            weather_payload = {
                "location": loc_dict,
                "weather": weather_dict,
                "source": "demonstration_research_profile",
                "is_manual_profile": True,
                "profile_key": weather_profile,
                "profile_display": profile_info.get("display_name"),
            }
        else:
            raise HTTPException(status_code=400, detail=f"Research profile '{weather_profile}' not found.")
    elif (latitude is not None and longitude is not None) or (city and city.strip()):
        # 2. Genuine Open-Meteo farm location weather retrieval
        lat = latitude
        lon = longitude
        city_hint = city.strip() if city and city.strip() else None
        state_hint = None
        country_hint = None

        if (lat is None or lon is None) and city_hint:
            geo = geocode_location_open_meteo(city_hint)
            if not geo:
                raise HTTPException(
                    status_code=404,
                    detail=f"Location '{city_hint}' could not be resolved via Open-Meteo geocoding. Please check spelling or provide GPS coordinates."
                )
            lat = geo["latitude"]
            lon = geo["longitude"]
            city_hint = geo["city"]
            state_hint = geo["state"]
            country_hint = geo["country"]

        # Fetch authentic 7-day past observations sequence
        past_wx = fetch_real_past_weather_sequence(lat, lon, capture_date=capture_date)
        weather_features_7x11 = past_wx["features_7x11"]
        observation_dates = past_wx["dates"]
        is_historical_archive = past_wx["is_archive"]

        # Fetch location metadata and current conditions
        curr_payload = weather_from_coordinates(lat, lon, city_hint=city_hint, state_hint=state_hint, country_hint=country_hint)
        loc_dict = curr_payload["location"]
        weather_dict = curr_payload["weather"]
        weather_dict["past_7day_rainfall_mm"] = past_wx["weather_summary"]["rainfall_mm"]

        weather_payload = {
            "location": loc_dict,
            "weather": weather_dict,
            "source": past_wx.get("source") or ("open_meteo_historical_archive" if is_historical_archive else "open_meteo_live"),
            "observation_dates": observation_dates,
            "is_manual_profile": False,
            "is_historical_archive": is_historical_archive,
        }
    elif temperature is not None or humidity is not None or rainfall is not None or wind_speed is not None:
        # 3. Manual farmer telemetry
        t = float(temperature) if temperature is not None else 28.0
        h = int(round(humidity)) if humidity is not None else 70
        r = float(rainfall) if rainfall is not None else 0.0
        w = float(wind_speed) if wind_speed is not None else 10.0
        weather_dict = {
            "temperature_c": t,
            "humidity_percent": h,
            "rainfall_mm": r,
            "wind_kmh": w,
            "condition": "Manual Sensor Observation",
        }
        loc_dict = {
            "city": city.strip() if city and city.strip() else "Farmer Field Telemetry",
            "state": "Local Microclimate",
            "country": "India",
            "latitude": 0.0,
            "longitude": 0.0,
        }
        weather_payload = {
            "location": loc_dict,
            "weather": weather_dict,
            "source": "manual_sensor_input",
            "is_manual_profile": False,
        }
    else:
        # 4. Graceful default: retrieve real Open-Meteo observations for Central Agricultural Zone
        # Ensures diagnosis never aborts with 400 Bad Request when browser GPS is blocked/offline
        default_lat, default_lon = 28.6139, 77.2090
        past_wx = fetch_real_past_weather_sequence(default_lat, default_lon, capture_date=capture_date)
        weather_features_7x11 = past_wx["features_7x11"]
        observation_dates = past_wx["dates"]
        is_historical_archive = past_wx["is_archive"]

        curr_payload = weather_from_coordinates(
            default_lat,
            default_lon,
            city_hint="Central Agricultural Zone",
            state_hint="Delhi NCR",
            country_hint="India",
        )
        loc_dict = curr_payload["location"]
        weather_dict = curr_payload["weather"]
        weather_dict["past_7day_rainfall_mm"] = past_wx["weather_summary"]["rainfall_mm"]

        weather_payload = {
            "location": loc_dict,
            "weather": weather_dict,
            "source": "default_agricultural_zone",
            "observation_dates": observation_dates,
            "is_manual_profile": False,
            "is_historical_archive": is_historical_archive,
        }

    overlay_original = None
    overlay_highlight = None
    raw_heatmap = None
    affected_area_percent = 0.0
    weather_importance_days = None
    mm_result = {}

    use_multimodal = (model_type in {"multimodal", "multimodal_only", "auto"})
    if use_multimodal:
        try:
            mm_result = predict_multimodal(
                image=file_bytes,
                weather=weather_dict if weather_features_7x11 is not None else None,
                crop_hint=crop_key,
                weather_features_7x11=weather_features_7x11,
                allow_image_only=True,
            )
            predicted_label = mm_result["predicted_disease"]
            normalized_label = normalize_class_name(predicted_label)
            confidence = float(mm_result["confidence"])
            top3 = [
                {"class": normalize_class_name(item["class"]), "confidence": float(item["confidence"])}
                for item in mm_result["top3"]
            ]
            original_rgb = mm_result["original_rgb"]
            overlay_original = original_rgb
            overlay_highlight = mm_result["overlay_rgb"]
            raw_heatmap = mm_result["heatmap_rgb"]
            affected_area_percent = float(mm_result["affected_area_pct"])
            weather_importance_days = mm_result.get("daily_attention")
            gradcam_enabled = True
            if mm_result.get("model_mode") == "image_only_fallback":
                use_multimodal = False
        except Exception as exc:
            print(f"[Predict] Multimodal model failed: {exc}. Trying Keras fallback.")
            use_multimodal = False

    if not use_multimodal and not mm_result:
        try:
            model, label_map = load_crop_model(crop_key)
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

        try:
            from backend.gradcam import generate_gradcam_overlay
            overlay_original, overlay_highlight, raw_heatmap, affected_area_percent = generate_gradcam_overlay(
                original_rgb, model, alpha=0.55
            )
            gradcam_enabled = True
        except Exception as g_exc:
            print(f"[GradCAM] Keras Grad-CAM failed: {g_exc}")
            gradcam_enabled = False

    is_healthy_prediction = "healthy" in normalized_label.lower()
    if is_healthy_prediction:
        health_score = max(10, min(100, int(round(confidence * 100))))
    else:
        health_score = max(5, min(90, int(round((1.0 - confidence) * 100))))

    disease_info = get_disease_info(normalized_label, lang=lang, crop=crop_key)

    if overlay_original is None:
        original_image = image_to_data_url(original_rgb) if 'original_rgb' in locals() and original_rgb is not None else ""
    else:
        original_image = image_to_data_url(overlay_original)

    highlighted_image = image_to_data_url(overlay_highlight) if overlay_highlight is not None else None
    gradcam_heatmap = image_to_data_url(raw_heatmap) if raw_heatmap is not None else None

    risk_level, risk_reason = get_weather_risk(weather_payload["weather"], crop=crop_key)

    if use_multimodal:
        if mm_result.get("shap_explanation"):
            model_shap = mm_result["shap_explanation"]
            weather_importance = model_shap.get("feature_importance", {})
            shap_details = model_shap
        else:
            weather_importance = {}
            shap_details = None
    else:
        # Phase 6: Image-only fallback must disable environmental SHAP and not claim multimodal fusion
        weather_importance = None
        shap_details = None
        weather_payload["multimodal_fusion"] = False
        weather_payload["note"] = "Image-only inference used; environmental SHAP is disabled."

    summary = (
        f"Detected {normalized_label} in {crop_key} with {round(confidence * 100, 2)}% confidence. "
        f"Likely cause: {disease_info.get('causes', 'Condition-specific causes unavailable.')}"
    )

    diagnosis_id = f"dgn_{uuid.uuid4().hex[:12]}"
    _diagnosis_sessions[diagnosis_id] = {
        "crop": crop_key,
        "predicted_class": normalized_label,
        "disease": normalized_label,
        "confidence": float(confidence),
        "top3": top3,
        "weather": weather_payload.get("weather"),
        "feature_importance": weather_importance,
        "gradcam_image_b64": highlighted_image,
        "disease_info": disease_info,
        "language": "en",
        "conversation_history": [],
    }

    return {
        "diagnosis_id": diagnosis_id,
        "model_mode": "multimodal_fusion" if use_multimodal else "image_only_fallback",
        "multimodal_fusion": use_multimodal,
        "crop": crop_key,
        "predicted_class": normalized_label,
        "confidence": round(confidence, 4),
        "confidence_percent": round(confidence * 100, 2),
        "confidence_type": mm_result.get("confidence_type", "crop_conditioned_softmax") if use_multimodal else "raw_softmax",
        "health_score": health_score,
        "health_assessment": {
            "score": health_score,
            "metric_type": "proxy_non_infection_confidence_index",
            "interpretation": (
                "Proxy score reflecting model confidence in healthy tissue vs estimated disease burden. "
                "It is an algorithmic decision-support indicator, not a clinical lab biomarker."
            ),
        },
        "activation_coverage_percent": affected_area_percent,
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
        "risk_level": risk_level,
        "weather_risk": {
            "level": risk_level,
            "reason": risk_reason,
            "indicator_type": "rule_based_risk_indicator",
        },
        "weather_context": {
            **weather_payload,
            "risk_level": risk_level,
            "risk_reason": risk_reason,
            "feature_importance": weather_importance,
            "shap_values": shap_details.get("shap_values") if shap_details else None,
            "shap_explanation": shap_details,
            "weather_importance_days": weather_importance_days,
            "observation_dates": observation_dates,
            "is_historical_archive": is_historical_archive,
            "demonstration_mode": is_manual_profile,
        },
        "analysis_summary": summary,
        "summary": summary,
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
        disease_info = get_disease_info(payload.predicted_class, lang=payload.language or "en", crop=payload.crop)

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

    # Store or update session (without huge base64 in every history entry — stored once here)
    if payload.diagnosis_id in _diagnosis_sessions:
        _diagnosis_sessions[payload.diagnosis_id].update({
            **{k: v for k, v in context.items() if v is not None},
            "language": payload.language or _diagnosis_sessions[payload.diagnosis_id].get("language", "en"),
        })
    else:
        _diagnosis_sessions[payload.diagnosis_id] = {
            **context,
            "conversation_history": [],
        }

    # Call Gemini Mode A
    gemini_response = ask_gemini_initial(context)

    return {
        "diagnosis_id": payload.diagnosis_id,
        "gemini_response": gemini_response,
        **gemini_response,
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
    raw_msg = payload.message or payload.question or ""
    message = raw_msg.strip()
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
