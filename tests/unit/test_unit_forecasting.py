"""
tests/unit/test_unit_forecasting.py
==================================
Unit tests for the phytopathological disease risk forecasting model and SHAP explainability.
"""

from __future__ import annotations

import pytest

from backend.forecasting import (
    CROPS,
    RISK_LEVELS,
    compute_shap_feature_importance,
    forecast_7day_disease_progression,
    predict_disease_risk,
)


def test_shap_feature_importance_computation():
    """Verify SHAP values accurately allocate credit to adverse weather factors."""
    weather = {
        "temperature_c": 28.0,
        "humidity_percent": 90.0,
        "rainfall_mm": 20.0,
        "wind_kmh": 12.0,
    }
    shap_res = compute_shap_feature_importance(weather, crop="rice")
    assert "feature_importance" in shap_res
    assert "shap_values" in shap_res
    assert "base_value" in shap_res
    assert "infection_score" in shap_res

    # Humidity and rainfall should have positive SHAP attribution under wet conditions
    assert shap_res["shap_values"]["Humidity"] > 0
    assert shap_res["shap_values"]["Rainfall"] > 0
    total_pct = sum(shap_res["feature_importance"].values())
    assert pytest.approx(total_pct, abs=1.0) == 100.0


@pytest.mark.parametrize("crop", CROPS)
def test_predict_disease_risk_crops(crop: str):
    """Verify prediction produces calibrated probabilities for each crop."""
    # 1. Warm, humid, rainy condition -> High/Medium risk
    weather_warm_humid = {
        "temperature_c": 27.5,
        "humidity_percent": 88.0,
        "rainfall_mm": 18.0,
        "wind_kmh": 12.0,
    }
    res = predict_disease_risk(weather_warm_humid, crop=crop)
    assert res["crop"] == crop
    assert res["risk_level"] in ["High", "Medium"]
    assert 0.0 <= res["confidence"] <= 1.0
    assert "probabilities" in res
    assert "reasoning" in res
    assert len(res["reasoning"]) > 0

    reasoning_str = res["reasoning"].lower()
    # High humidity (88 >= 75) and high rain (18 >= 8) must trigger explicit explanatory causes
    assert "humidity" in reasoning_str, "Must mention humidity when humidity >= 75%"
    assert "rainfall" in reasoning_str or "canopy wetness" in reasoning_str, "Must mention rain when rain >= 8mm"

    # Sum of probabilities across risk levels should sum to ~1.0
    total_p = sum(res["probabilities"].values())
    assert pytest.approx(total_p, abs=0.01) == 1.0

    # 2. Moderate humidity (65% < 75%) and no rain (< 8mm) -> Must NOT claim elevated humidity or rain
    weather_moderate = {
        "temperature_c": 26.0,
        "humidity_percent": 65.0,
        "rainfall_mm": 0.0,
        "wind_kmh": 10.0,
    }
    res_mod = predict_disease_risk(weather_moderate, crop=crop)
    reasoning_mod = res_mod["reasoning"].lower()
    assert "elevated humidity" not in reasoning_mod, "Should not claim elevated humidity when hum < 75%"
    assert "recent rainfall" not in reasoning_mod, "Should not claim recent rainfall when rain == 0"

    # 3. Rainfall and humidity leaf wetness influence test (kills mutants #20, #22, #23)
    weather_rainy_wet = {
        "temperature_c": 27.0,
        "humidity_percent": 80.0,
        "rainfall_mm": 5.0,
        "wind_kmh": 10.0,
    }
    weather_dry = {
        "temperature_c": 27.0,
        "humidity_percent": 80.0,
        "rainfall_mm": 0.0,
        "wind_kmh": 10.0,
    }
    res_rainy = predict_disease_risk(weather_rainy_wet, crop=crop)
    res_dry = predict_disease_risk(weather_dry, crop=crop)
    diff_rain = res_rainy["probabilities"]["High"] - res_dry["probabilities"]["High"]
    assert diff_rain >= 0.30, f"Rainfall must increase high risk probability significantly, got diff {diff_rain}"
    assert res_rainy["probabilities"]["High"] >= 0.55, "Warm rainy weather must yield high outbreak probability"

    # 4. Cool, arid, dry condition -> Low risk
    weather_arid = {
        "temperature_c": 12.0,
        "humidity_percent": 30.0,
        "rainfall_mm": 0.0,
        "wind_kmh": 8.0,
    }
    res_arid = predict_disease_risk(weather_arid, crop=crop)
    assert res_arid["crop"] == crop
    assert res_arid["risk_level"] == "Low"
    assert res_arid["probabilities"]["Low"] > res_arid["probabilities"]["High"]

    # 5. Crop specificity & one-hot encoding test (kills mutant #24 `c == crop_lower`)
    weather_base = {
        "temperature_c": 28.0,
        "humidity_percent": 80.0,
        "rainfall_mm": 5.0,
        "wind_kmh": 10.0,
    }
    r_rice = predict_disease_risk(weather_base, crop="rice")
    r_sugar = predict_disease_risk(weather_base, crop="sugarcane")
    diff_crop = r_rice["probabilities"]["High"] - r_sugar["probabilities"]["High"]
    assert diff_crop >= 0.10, f"Rice must have higher high-risk vulnerability than sugarcane, got diff {diff_crop}"


def test_forecast_7day_progression():
    """Verify 7-day chronological progression output structure and stability."""
    current_wx = {
        "temperature_c": 31.0,
        "humidity_percent": 82.0,
        "rainfall_mm": 5.0,
        "wind_kmh": 15.0,
    }
    outlook = forecast_7day_disease_progression(current_wx, crop="wheat")
    assert len(outlook) == 7
    assert outlook[0]["day"] == "Today"
    assert outlook[6]["day"] == "Day 7"
    for day_entry in outlook:
        assert "day" in day_entry
        assert day_entry["risk_level"] in RISK_LEVELS
        assert "weather" in day_entry
        assert "temperature_c" in day_entry["weather"]
        assert "humidity_percent" in day_entry["weather"]

