"""
tests/unit/test_unit_forecasting.py
==================================
Unit tests for the synthetic data generator and disease risk forecasting model.
"""

from __future__ import annotations

import pandas as pd
import pytest

from backend.forecasting import (
    CROPS,
    RISK_LEVELS,
    forecast_7day_disease_progression,
    generate_synthetic_weather_training_data,
    predict_disease_risk,
    train_disease_risk_forecaster,
)


def test_synthetic_data_generation():
    """Verify synthetic weather training dataset conforms to realistic agricultural constraints."""
    df = generate_synthetic_weather_training_data(n_samples=500, seed=123)
    assert len(df) == 500
    expected_cols = [
        "crop",
        "temperature_c",
        "humidity_percent",
        "rainfall_mm",
        "wind_kmh",
        "leaf_wetness_hours",
        "infection_score",
        "risk_level",
    ]
    for col in expected_cols:
        assert col in df.columns

    # Check realistic physical bounds
    assert df["temperature_c"].min() >= 10.0
    assert df["temperature_c"].max() <= 45.0
    assert df["humidity_percent"].min() >= 25.0
    assert df["humidity_percent"].max() <= 100.0
    assert df["rainfall_mm"].min() >= 0.0
    assert df["leaf_wetness_hours"].between(0.0, 24.0).all()

    # Verify infection score calibration and distribution
    mean_infection = df["infection_score"].mean()
    assert 30.0 <= mean_infection <= 70.0, f"Infection score mean out of range: {mean_infection}"
    assert df["infection_score"].std() >= 12.0, "Infection score variance is collapsed"

    # Verify humidity and rainfall strongly drive higher infection pressure (kills mutants in weights/formulas)
    high_hum_score = df[df["humidity_percent"] >= 80]["infection_score"].mean()
    low_hum_score = df[df["humidity_percent"] <= 55]["infection_score"].mean()
    assert high_hum_score - low_hum_score >= 20.0, "High humidity must strongly increase infection score"

    # Verify leaf wetness factor contribution (kills mutant #11)
    wet_score = df[df["leaf_wetness_hours"] >= 10.0]["infection_score"].mean()
    dry_score = df[df["leaf_wetness_hours"] <= 4.0]["infection_score"].mean()
    assert wet_score - dry_score >= 25.0, "Leaf wetness duration must positively drive infection score"

    # Verify rainfall drives leaf wetness hours (kills mutant #01)
    rainy_wetness = df[df["rainfall_mm"] >= 3.0]["leaf_wetness_hours"].mean()
    dry_wetness = df[df["rainfall_mm"] <= 0.5]["leaf_wetness_hours"].mean()
    assert rainy_wetness - dry_wetness >= 4.0, "Rainfall must increase leaf wetness duration by at least 4 hours"

    # Verify rain factor contribution to score (kills mutant #14)
    rain_high = df[(df["rainfall_mm"] >= 10.0) & (df["humidity_percent"].between(65, 85))]["infection_score"].mean()
    rain_low = df[(df["rainfall_mm"] <= 2.0) & (df["humidity_percent"].between(65, 85))]["infection_score"].mean()
    assert rain_high - rain_low >= 8.0, "Rainfall must increase infection score"

    # Verify deterministic noise addition (kills mutant #17)
    assert pytest.approx(df["infection_score"].sum(), abs=30.0) == 30674.74

    # Verify risk labels are stratified across all categories
    risk_counts = df["risk_level"].value_counts()
    for r in RISK_LEVELS:
        assert r in risk_counts, f"Missing risk category {r}"
        assert risk_counts[r] >= 20, f"Insufficient samples for category {r}: {risk_counts[r]}"


def test_forecaster_training_and_accuracy():
    """Verify RandomForestClassifier trains properly and achieves baseline accuracy."""
    df = generate_synthetic_weather_training_data(n_samples=1000, seed=99)
    model, metrics = train_disease_risk_forecaster(df=df)

    assert model is not None
    assert metrics["accuracy"] >= 0.75
    assert len(metrics["feature_names"]) > 5
    assert "classes" in metrics
    for r in RISK_LEVELS:
        assert r in metrics["classes"]


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

