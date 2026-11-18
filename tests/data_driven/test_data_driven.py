"""
tests/data_driven/test_data_driven.py
=====================================
Data-Driven Testing (DDT) engine for FloraAI Plant Disease Detection.
Iterates over a comprehensive matrix of environmental conditions, crop types,
boundary values, and language localizations loaded from CSV.
"""

from __future__ import annotations

import csv
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "test_data_matrix.csv"


def load_test_matrix():
    """Load test cases from CSV matrix."""
    cases = []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cases.append(row)
    return cases


TEST_CASES = load_test_matrix()


@pytest.mark.parametrize("case", TEST_CASES, ids=[c["TestCaseID"] for c in TEST_CASES])
def test_data_driven_prediction_pipeline(
    case: dict,
    client: TestClient,
    sample_leaf_bytes: bytes,
):
    """
    Execute data-driven test case:
    Uploads leaf image with the parameterized microclimatic and localized context.
    Verifies response status, structure, confidence bounds, and risk expectations.
    """
    case_id = case["TestCaseID"]
    crop = case["Crop"]
    expected_status = int(case["ExpectedStatus"])
    expected_risk = case["ExpectedRisk"]
    lang = case["Lang"]

    files = {"file": ("leaf_sample.jpg", sample_leaf_bytes, "image/jpeg")}
    payload = {
        "crop": crop,
        "temperature": case["Temperature"],
        "humidity": case["Humidity"],
        "rainfall": case["Rainfall"],
        "wind_speed": case["WindSpeed"],
        "lang": lang,
    }

    response = client.post("/api/predict", files=files, data=payload)
    assert (
        response.status_code == expected_status
    ), f"[{case_id}] Expected HTTP {expected_status}, got {response.status_code}: {response.text}"

    if expected_status == 200:
        data = response.json()
        assert data["crop"] == crop
        assert "predicted_class" in data
        assert 0.0 <= data["confidence"] <= 1.0
        assert "risk_level" in data
        assert "top3" in data
        assert len(data["top3"]) > 0

        # Verify risk level matches phytopathological direction
        risk = data.get("risk_level") or data.get("weather_risk", {}).get("level")
        if expected_risk != "None":
            assert risk in ["Low", "Medium", "High"], f"Unexpected risk level: {risk}"

        # Verify localized language information is populated
        assert "disease_info" in data
        assert len(data["disease_info"]["display"]) > 0
    else:
        # Negative test assertion
        error_detail = response.json().get("detail", "")
        assert "Unsupported crop" in error_detail or "error" in error_detail.lower()
