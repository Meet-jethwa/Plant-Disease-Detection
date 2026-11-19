"""
tests/unit/test_unit_disease_info.py
====================================
Unit tests for backend.disease_info and weather risk computation.
"""

from __future__ import annotations

import pytest
from backend.disease_info import (
    compute_weather_feature_importance,
    compute_weather_shap_values,
    get_disease_info,
)
from backend.server import get_weather_risk, normalize_disease_key


def test_normalize_disease_key():
    """Verify raw strings are correctly normalized to clean keys."""
    assert normalize_disease_key("Brown Spot") == "brown_spot"
    assert normalize_disease_key("Bacterial-Leaf-Blight") == "bacterial_leaf_blight"
    assert normalize_disease_key("  Wheat (Yellow Rust)  ") == "wheat_yellow_rust"


def test_get_disease_info_known_disease():
    """Verify info retrieval for established disease catalog entries."""
    info = get_disease_info("Brown Spot", lang="en")
    assert info is not None
    assert "display" in info
    assert "description" in info
    assert "treatment" in info
    assert "prevention" in info
    assert "severity" in info


def test_get_disease_info_healthy():
    """Verify healthy leaf condition returns None severity and positive guidance."""
    info = get_disease_info("Healthy", lang="en")
    assert info["severity"] == "None"
    assert "healthy" in info["description"].lower()


def test_get_disease_info_unknown_fallback():
    """Verify unknown disease key triggers graceful generic fallback without raising exceptions."""
    info = get_disease_info("Mysterious Alien Blight 999", lang="en")
    assert info is not None
    assert info["display"] == "Mysterious Alien Blight 999"
    assert "severity" in info


@pytest.mark.parametrize("lang", ["hi", "gu", "mr", "ta", "te", "bn", "pa"])
def test_get_disease_info_indic_translations(lang: str):
    """Verify disease info successfully queries localized Indic language dictionaries."""
    info = get_disease_info("Brown Spot", lang=lang)
    assert info is not None
    assert "display" in info
    # Display or description should be non-empty
    assert len(info["description"]) > 0


def test_weather_risk_levels():
    """Verify weather risk categorizer accurately evaluates microclimatic conditions."""
    # High risk conditions (high humidity + heavy rain)
    high_risk, high_reason = get_weather_risk({"humidity_percent": 90, "rainfall_mm": 25.0}, crop="rice")
    assert high_risk in ["High", "Medium"]
    assert len(high_reason) > 0

    # Low risk conditions (dry, low humidity)
    low_risk, low_reason = get_weather_risk({"humidity_percent": 35, "rainfall_mm": 0.0}, crop="wheat")
    assert low_risk in ["Low", "Medium"]
    assert len(low_reason) > 0


def test_compute_weather_feature_importance():
    """Verify weather feature importance factors correlate with ambient conditions."""
    disease_info = get_disease_info("Brown Spot")
    weather = {"temperature_c": 30.0, "humidity_percent": 85.0, "rainfall_mm": 10.0}
    importance = compute_weather_feature_importance(disease_info, weather)
    lower_keys = {k.lower(): v for k, v in importance.items()}
    assert "humidity" in lower_keys
    assert "temperature" in lower_keys
    assert "rainfall" in lower_keys
    total = sum(importance.values())
    assert pytest.approx(total, abs=1.0) == 100.0


def test_compute_weather_shap_values():
    """Verify SHAP game-theoretic decomposition satisfies attribution properties."""
    disease_info = get_disease_info("Brown Spot")
    weather = {"temperature_c": 28.0, "humidity_percent": 88.0, "rainfall_mm": 15.0, "wind_kmh": 12.0}
    shap_res = compute_weather_shap_values(disease_info, weather, crop="rice")
    assert "shap_values" in shap_res
    assert "feature_importance" in shap_res
    assert "base_value" in shap_res
    assert "risk_score" in shap_res
    assert "Rule-Based" in shap_res["method"] or "Attribution" in shap_res["method"]

    # High humidity and rain should have positive risk-increasing attributions
    assert shap_res["shap_values"]["Humidity"] > 0
    assert shap_res["shap_values"]["Rainfall"] > 0
    total = sum(shap_res["feature_importance"].values())
    assert pytest.approx(total, abs=1.0) == 100.0


def test_disease_info_crop_disambiguation():
    """Verify wheat blast is disambiguated from rice blast when crop is specified."""
    wheat_info = get_disease_info("Blast", crop="wheat")
    assert wheat_info["crop"].lower() == "wheat"

    rice_info = get_disease_info("Blast", crop="rice")
    assert rice_info["crop"].lower() == "rice"


def test_chatbot_response_rules():
    """Verify agricultural chatbot fallback rules engine."""
    from backend.disease_info import chatbot_response

    # Test keyword matching
    res_blast = chatbot_response("how do I treat rice blast?")
    assert len(res_blast) > 20
    assert "blast" in res_blast.lower() or "fungicide" in res_blast.lower()

    # Test default fallback response
    res_default = chatbot_response("what is the stock price of Apple?")
    assert len(res_default) > 20

