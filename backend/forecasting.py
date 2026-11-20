"""
backend/forecasting.py
======================
Agricultural microclimate risk forecasting and progression module.
Uses phytopathological infection pressure equations and SHAP (Shapley Additive exPlanations)
to evaluate multi-day crop infection risk using live meteorological telemetry.
"""

from __future__ import annotations

import itertools
import json
import math
import os
import time
from typing import Any, Dict, List
import urllib.request

import numpy as np

# Supported economic crops
CROPS = ["rice", "wheat", "sugarcane", "cotton"]
RISK_LEVELS = ["Low", "Medium", "High"]


def predict_disease_risk(weather_data: dict, crop: str = "rice") -> dict:
    """
    Predict outbreak risk category and probability distribution for a given crop and weather context
    using deterministic phytopathological environmental rules (no Random Forest model).
    """
    temp = float(weather_data.get("temperature_c", 28.0))
    hum = float(weather_data.get("humidity_percent", 70.0))
    rain = float(weather_data.get("rainfall_mm", 2.0))
    wind = float(weather_data.get("wind_kmh", 10.0))

    crop_lower = crop.lower().strip()

    # Pathogen temperature curve
    temp_suitability = float(np.exp(-((temp - 27.0) ** 2) / (2.0 * (6.0 ** 2))))
    humidity_factor = float(np.clip((hum - 55.0) / 40.0, 0.0, 1.0))

    # Leaf wetness strongly elevated by rainfall presence
    leaf_wetness = float(weather_data.get("leaf_wetness_hours", (hum / 100.0) * 6.0 + min(18.0, rain * 3.5)))
    wetness_factor = float(np.clip(leaf_wetness / 16.0, 0.0, 1.0))
    rain_factor = float(np.clip(rain / 10.0, 0.0, 1.0))

    crop_multipliers = {"rice": 1.15, "wheat": 1.05, "cotton": 0.95, "sugarcane": 0.82}
    crop_mod = crop_multipliers.get(crop_lower, 1.0)

    infection_score = (
        0.25 * temp_suitability
        + 0.20 * humidity_factor
        + 0.35 * wetness_factor
        + 0.20 * rain_factor
    ) * 100.0 * crop_mod

    infection_score = float(np.clip(infection_score, 0.0, 100.0))

    logits = np.array([
        (52.0 - infection_score) / 5.5,
        2.5 - abs(infection_score - 56.0) / 7.0,
        (infection_score - 60.0) / 5.5,
    ])
    exp_l = np.exp(logits - np.max(logits))
    probs = exp_l / np.sum(exp_l)
    prob_map = {"Low": round(probs[0], 4), "Medium": round(probs[1], 4), "High": round(probs[2], 4)}

    # Ensure total probability sums cleanly to 1.0
    tot_p = sum(prob_map.values())
    prob_map = {k: round(v / tot_p, 4) for k, v in prob_map.items()}

    if infection_score >= 62.0:
        pred_risk = "High"
        confidence = prob_map["High"]
    elif infection_score >= 42.0:
        pred_risk = "Medium"
        confidence = prob_map["Medium"]
    else:
        pred_risk = "Low"
        confidence = prob_map["Low"]

    reasons = []
    if hum >= 75:
        reasons.append(f"Elevated humidity ({hum}%) promotes fungal spore germination.")
    if rain >= 8:
        reasons.append(f"Recent rainfall ({rain}mm) prolongs canopy wetness.")
    if 24 <= temp <= 32:
        reasons.append(f"Foliar temperature ({temp}°C) is in optimal pathogen incubation zone.")
    if not reasons:
        reasons.append("Current climatic variables are within sub-optimal pathogen incubation range.")

    breakdown = compute_rule_based_risk_breakdown(weather_data, crop=crop_lower)

    return {
        "crop": crop_lower,
        "risk_level": pred_risk,
        "confidence": confidence,
        "probabilities": prob_map,
        "reasoning": " ".join(reasons),
        "shap_values": breakdown["attribution_values"],
        "feature_importance": breakdown["feature_importance"],
        "risk_breakdown": breakdown,
        "shap_explanation": breakdown,
        "inputs": {
            "temperature_c": temp,
            "humidity_percent": hum,
            "rainfall_mm": rain,
            "wind_kmh": wind,
            "leaf_wetness_hours": round(leaf_wetness, 1),
        },
    }


def compute_rule_based_risk_breakdown(weather_data: dict, crop: str = "rice") -> dict:
    """
    Compute rule-based environmental factor attribution for phytopathological infection risk.
    Evaluates sensitivity across Temperature, Humidity, Leaf Wetness, and Rainfall
    relative to a neutral agricultural baseline using phytopathological equations.
    NOTE: This is a rule-based risk heuristic; genuine model SHAP on the trained multimodal
    classifier is computed in backend/multimodal_model.py.
    """
    temp = float(weather_data.get("temperature_c", 28.0))
    hum = float(weather_data.get("humidity_percent", 70.0))
    rain = float(weather_data.get("rainfall_mm", 2.0))
    leaf_wetness = float(weather_data.get("leaf_wetness_hours", (hum / 100.0) * 10.0 + (rain > 1.0) * 4.0))

    crop_lower = crop.lower().strip()
    crop_multipliers = {"rice": 1.15, "wheat": 1.05, "cotton": 0.95, "sugarcane": 0.90}
    crop_mod = crop_multipliers.get(crop_lower, 1.0)

    def calc_score(feats: list[float]) -> float:
        t, h, lw, r = feats
        t_suit = math.exp(-((t - 27.0) ** 2) / (2.0 * (6.0 ** 2)))
        h_factor = max(0.0, min(1.0, (h - 50.0) / 45.0))
        w_factor = max(0.0, min(1.0, lw / 18.0))
        r_factor = max(0.0, min(1.0, r / 25.0))
        score = (0.35 * t_suit + 0.30 * h_factor + 0.25 * w_factor + 0.10 * r_factor) * 100.0 * crop_mod
        return max(0.0, min(100.0, score))

    base = [22.0, 50.0, 3.0, 0.0]
    curr = [temp, hum, leaf_wetness, rain]
    names = ["Temperature", "Humidity", "Leaf Wetness", "Rainfall"]

    N = len(names)
    shap_vals = [0.0] * N
    for i in range(N):
        others = [j for j in range(N) if j != i]
        for k in range(N):
            coeff = (math.factorial(k) * math.factorial(N - k - 1)) / math.factorial(N)
            for subset in itertools.combinations(others, k):
                with_i = list(base)
                without_i = list(base)
                for s in subset:
                    with_i[s] = curr[s]
                    without_i[s] = curr[s]
                with_i[i] = curr[i]
                shap_vals[i] += coeff * (calc_score(with_i) - calc_score(without_i))

    base_score = calc_score(base)
    current_score = calc_score(curr)

    abs_vals = [max(0.1, abs(v)) for v in shap_vals]
    sum_abs = sum(abs_vals)
    importance = {name: round((v / sum_abs) * 100.0, 1) for name, v in zip(names, abs_vals)}

    diff = 100.0 - sum(importance.values())
    if abs(diff) > 0.0:
        first_key = list(importance.keys())[0]
        importance[first_key] = round(importance[first_key] + diff, 1)

    return {
        "feature_importance": importance,
        "attribution_values": {name: round(v, 3) for name, v in zip(names, shap_vals)},
        "shap_values": {name: round(v, 3) for name, v in zip(names, shap_vals)},
        "base_value": round(base_score, 2),
        "infection_score": round(current_score, 2),
        "method": "Rule-Based Environmental Risk Attribution Heuristic",
    }


# Backwards compatibility alias
compute_shap_feature_importance = compute_rule_based_risk_breakdown


_FORECAST_CACHE: dict[str, tuple[float, dict]] = {}


def forecast_7day_disease_progression(
    current_weather: dict,
    crop: str = "rice",
    latitude: float | None = None,
    longitude: float | None = None,
) -> list[dict]:
    """
    Project 7-day disease risk progression using real multi-day Open-Meteo forecasts
    or deterministic meteorological persistence curves (no pseudo-random synthetic data).
    Includes in-memory TTL caching to avoid rate limit throttling.
    """
    days_labels = ["Today", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"]
    lat = latitude if latitude is not None else current_weather.get("latitude")
    lon = longitude if longitude is not None else current_weather.get("longitude")

    real_daily = None
    if lat is not None and lon is not None:
        cache_key = f"{round(lat, 2)}_{round(lon, 2)}"
        now = time.time()
        if cache_key in _FORECAST_CACHE:
            cached_ts, cached_data = _FORECAST_CACHE[cache_key]
            if now - cached_ts < 1800:  # 30 minutes
                real_daily = cached_data

        if real_daily is None:
            try:
                api_key = os.getenv("OPEN_METEO_API_KEY", "").strip()
                url = (
                    f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
                    "&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,precipitation_sum,wind_speed_10m_max"
                    "&timezone=auto"
                )
                if api_key:
                    url += f"&apikey={api_key}"
                req = urllib.request.Request(url, headers={"User-Agent": "FloraAI/1.0"})
                with urllib.request.urlopen(req, timeout=2.5) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode("utf-8")).get("daily", {})
                        if "temperature_2m_max" in data and len(data["temperature_2m_max"]) >= 7:
                            real_daily = data
                            _FORECAST_CACHE[cache_key] = (now, data)
            except Exception:
                # Fallback to stale cache if available
                if cache_key in _FORECAST_CACHE:
                    real_daily = _FORECAST_CACHE[cache_key][1]
                else:
                    real_daily = None

    t0 = float(current_weather.get("temperature_c", 28.0))
    h0 = float(current_weather.get("humidity_percent", 70.0))
    r0 = float(current_weather.get("rainfall_mm", 2.0))
    w0 = float(current_weather.get("wind_kmh", 10.0))

    outlook = []
    for i, day in enumerate(days_labels):
        if i == 0:
            day_wx = {
                "temperature_c": round(t0, 1),
                "humidity_percent": int(round(h0)),
                "rainfall_mm": round(r0, 1),
                "wind_kmh": round(w0, 1),
            }
        elif real_daily is not None:
            t_max = real_daily["temperature_2m_max"][i]
            t_min = real_daily["temperature_2m_min"][i]
            t_avg = (t_max + t_min) / 2.0
            rh_avg = real_daily.get("relative_humidity_2m_mean", [h0] * 7)[i]
            p_sum = real_daily.get("precipitation_sum", [0.0] * 7)[i]
            w_max = real_daily.get("wind_speed_10m_max", [w0] * 7)[i]
            day_wx = {
                "temperature_c": round(float(t_avg), 1),
                "humidity_percent": int(round(float(rh_avg))),
                "rainfall_mm": round(float(p_sum), 1),
                "wind_kmh": round(float(w_max), 1),
            }
        else:
            # Deterministic meteorological trend without pseudo-random synthetic noise
            attenuation = 1.0 - (i * 0.04)
            day_wx = {
                "temperature_c": round(t0 * attenuation + (1.0 - attenuation) * 26.0, 1),
                "humidity_percent": int(round(h0 * attenuation + (1.0 - attenuation) * 65.0)),
                "rainfall_mm": round(max(0.0, r0 * max(0.2, 1.0 - i * 0.18)), 1),
                "wind_kmh": round(w0 * attenuation + (1.0 - attenuation) * 11.0, 1),
            }

        res = predict_disease_risk(day_wx, crop=crop)
        outlook.append({
            "day": day,
            "risk_level": res["risk_level"],
            "confidence": res["confidence"],
            "weather": day_wx,
        })

    return outlook
