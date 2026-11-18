"""
backend/forecasting.py
======================
Synthetic agricultural weather data generator and disease outbreak risk forecasting model.
Uses scikit-learn (RandomForestClassifier) to forecast multi-day crop infection risk.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "disease_risk_forecaster.joblib"

# Supported economic crops
CROPS = ["rice", "wheat", "sugarcane", "cotton"]
RISK_LEVELS = ["Low", "Medium", "High"]


def generate_synthetic_weather_training_data(
    n_samples: int = 2500,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Synthetically generate realistic multi-variable microclimatic data
    grounded in agricultural plant pathology rules (temperature, humidity,
    consecutive rainfall, leaf wetness duration, and wind dispersion).
    """
    rng = np.random.default_rng(seed)

    crops = rng.choice(CROPS, size=n_samples)
    # Seasonal temperatures in Celsius (12°C to 42°C)
    temperatures = rng.normal(loc=27.0, scale=6.5, size=n_samples)
    temperatures = np.clip(temperatures, 10.0, 45.0)

    # Relative humidity (30% to 100%)
    humidity = rng.normal(loc=72.0, scale=15.0, size=n_samples)
    humidity = np.clip(humidity, 25.0, 100.0)

    # Rainfall in mm (exponential distribution for intermittent rainfall events)
    rainfall = rng.exponential(scale=6.0, size=n_samples)
    rainfall = np.clip(rainfall, 0.0, 120.0)

    # Wind speed in km/h (Weibull/normal distribution)
    wind_speed = rng.gamma(shape=3.0, scale=4.0, size=n_samples)
    wind_speed = np.clip(wind_speed, 1.0, 60.0)

    # Leaf wetness hours (strongly correlated with humidity and rainfall)
    leaf_wetness_hours = (humidity / 100.0) * 12.0 + (rainfall > 1.0) * rng.uniform(4.0, 10.0, size=n_samples)
    leaf_wetness_hours = np.clip(leaf_wetness_hours, 0.0, 24.0)

    # Calculate ground-truth infection pressure score (0 to 100)
    # Based on phytopathological principles:
    # Fungi/bacteria thrive in warm (22-32°C), humid (>75%), prolonged leaf wetness (>8h)
    temp_suitability = np.exp(-((temperatures - 27.0) ** 2) / (2.0 * (6.0 ** 2)))
    humidity_factor = np.clip((humidity - 50.0) / 45.0, 0.0, 1.0)
    wetness_factor = np.clip(leaf_wetness_hours / 18.0, 0.0, 1.0)
    rain_factor = np.clip(rainfall / 25.0, 0.0, 1.0)

    # Crop vulnerability modifiers
    crop_multipliers = {"rice": 1.15, "wheat": 1.05, "cotton": 0.95, "sugarcane": 0.90}
    crop_mod = np.array([crop_multipliers[c] for c in crops])

    infection_score = (
        0.35 * temp_suitability
        + 0.30 * humidity_factor
        + 0.25 * wetness_factor
        + 0.10 * rain_factor
    ) * 100.0 * crop_mod

    # Add realistic environmental stochastic noise
    noise = rng.normal(0, 3.5, size=n_samples)
    infection_score = np.clip(infection_score + noise, 0.0, 100.0)

    # Stratify into 3 discrete risk categories
    risk_labels = []
    for score in infection_score:
        if score >= 62.0:
            risk_labels.append("High")
        elif score >= 38.0:
            risk_labels.append("Medium")
        else:
            risk_labels.append("Low")

    df = pd.DataFrame({
        "crop": crops,
        "temperature_c": np.round(temperatures, 2),
        "humidity_percent": np.round(humidity, 1),
        "rainfall_mm": np.round(rainfall, 2),
        "wind_kmh": np.round(wind_speed, 2),
        "leaf_wetness_hours": np.round(leaf_wetness_hours, 1),
        "infection_score": np.round(infection_score, 2),
        "risk_level": risk_labels,
    })
    return df


def prepare_features(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, list[str]]:
    """Convert dataframe into feature array and target labels with one-hot crop encoding."""
    crop_dummies = pd.get_dummies(df["crop"], prefix="crop", dtype=float)
    for c in CROPS:
        col = f"crop_{c}"
        if col not in crop_dummies.columns:
            crop_dummies[col] = 0.0

    numeric_cols = ["temperature_c", "humidity_percent", "rainfall_mm", "wind_kmh", "leaf_wetness_hours"]
    X = pd.concat([df[numeric_cols], crop_dummies[[f"crop_{c}" for c in CROPS]]], axis=1)
    feature_names = list(X.columns)

    y = df["risk_level"].values
    return X.values, y, feature_names


def train_disease_risk_forecaster(
    df: pd.DataFrame | None = None,
    save_path: Path | None = None,
) -> Tuple[RandomForestClassifier, dict[str, Any]]:
    """
    Train a Random Forest Classifier to forecast disease risk from microclimate metrics.
    """
    if df is None:
        df = generate_synthetic_weather_training_data(n_samples=3000, seed=42)

    X, y, feature_names = prepare_features(df)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    metrics = {
        "accuracy": acc,
        "classification_report": report,
        "feature_names": feature_names,
        "feature_importances": dict(zip(feature_names, model.feature_importances_.tolist())),
        "classes": model.classes_.tolist(),
        "n_samples": len(df),
    }

    target_path = save_path or MODEL_PATH
    target_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "metrics": metrics, "feature_names": feature_names}, target_path)

    return model, metrics


@lru_cache(maxsize=1)
def load_or_train_forecaster() -> Tuple[RandomForestClassifier, list[str]]:
    """Load existing model checkpoint or train on demand (cached in memory)."""
    if MODEL_PATH.exists():
        try:
            artifact = joblib.load(MODEL_PATH)
            return artifact["model"], artifact["feature_names"]
        except Exception:
            pass

    model, metrics = train_disease_risk_forecaster(save_path=MODEL_PATH)
    return model, metrics["feature_names"]


def predict_disease_risk(weather_data: dict, crop: str = "rice") -> dict:
    """
    Predict outbreak risk category and probability distribution for a given crop and weather context.
    """
    model, feature_names = load_or_train_forecaster()

    temp = float(weather_data.get("temperature_c", 28.0))
    hum = float(weather_data.get("humidity_percent", 70.0))
    rain = float(weather_data.get("rainfall_mm", 2.0))
    wind = float(weather_data.get("wind_kmh", 10.0))
    # Approximate leaf wetness if not provided
    leaf_wetness = float(weather_data.get("leaf_wetness_hours", (hum / 100.0) * 10.0 + (rain > 1.0) * 4.0))

    crop_lower = crop.lower().strip()
    features = [temp, hum, rain, wind, leaf_wetness]
    for c in CROPS:
        features.append(1.0 if c == crop_lower else 0.0)

    X_in = np.array([features], dtype=np.float32)
    probs = model.predict_proba(X_in)[0]
    classes = list(model.classes_)

    pred_idx = int(np.argmax(probs))
    pred_risk = classes[pred_idx]
    confidence = float(probs[pred_idx])

    prob_map = {classes[i]: round(float(probs[i]), 4) for i in range(len(classes))}

    # Explain reasoning
    reasons = []
    if hum >= 75:
        reasons.append(f"Elevated humidity ({hum}%) promotes fungal spore germination.")
    if rain >= 8:
        reasons.append(f"Recent rainfall ({rain}mm) prolongs canopy wetness.")
    if 24 <= temp <= 32:
        reasons.append(f"Foliar temperature ({temp}°C) is in optimal pathogen incubation zone.")
    if not reasons:
        reasons.append("Current climatic variables are within sub-optimal pathogen incubation range.")

    return {
        "crop": crop_lower,
        "risk_level": pred_risk,
        "confidence": confidence,
        "probabilities": prob_map,
        "reasoning": " ".join(reasons),
        "inputs": {
            "temperature_c": temp,
            "humidity_percent": hum,
            "rainfall_mm": rain,
            "wind_kmh": wind,
            "leaf_wetness_hours": round(leaf_wetness, 1),
        },
    }


def forecast_7day_disease_progression(current_weather: dict, crop: str = "rice") -> list[dict]:
    """
    Synthesize a 7-day environmental progression and predict daily disease risk outlook.
    """
    days = ["Today", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"]
    t0 = float(current_weather.get("temperature_c", 28.0))
    h0 = float(current_weather.get("humidity_percent", 70.0))
    r0 = float(current_weather.get("rainfall_mm", 2.0))
    w0 = float(current_weather.get("wind_kmh", 10.0))

    rng = np.random.default_rng(101)
    outlook = []

    for i, day in enumerate(days):
        if i == 0:
            day_temp, day_hum, day_rain, day_wind = t0, h0, r0, w0
        else:
            # Diurnal drift
            day_temp = float(np.clip(t0 + rng.normal(0, 1.8), 12.0, 42.0))
            day_hum = float(np.clip(h0 + rng.normal(0, 4.0), 30.0, 98.0))
            day_rain = float(max(0.0, r0 * rng.uniform(0.5, 1.4) + rng.choice([0, 0, 3.5])))
            day_wind = float(np.clip(w0 + rng.normal(0, 2.0), 2.0, 35.0))

        day_wx = {
            "temperature_c": round(day_temp, 1),
            "humidity_percent": round(day_hum, 1),
            "rainfall_mm": round(day_rain, 1),
            "wind_kmh": round(day_wind, 1),
        }
        res = predict_disease_risk(day_wx, crop=crop)
        outlook.append({
            "day": day,
            "risk_level": res["risk_level"],
            "confidence": res["confidence"],
            "weather": day_wx,
        })

    return outlook
