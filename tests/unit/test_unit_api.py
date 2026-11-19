"""
tests/unit/test_unit_api.py
===========================
Unit and integration tests for FloraAI FastAPI REST endpoints.
"""

from __future__ import annotations

import io
from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    """Verify backend health probe returns 200 OK and expected service identifier."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "FloraAI" in data["service"]


def test_crops_endpoint(client: TestClient):
    """Verify supported crops list contains all 4 major economic crops."""
    res = client.get("/api/crops")
    assert res.status_code == 200
    data = res.json()
    assert "crops" in data
    crop_names = [c["name"] for c in data["crops"]]
    for expected in ["rice", "wheat", "sugarcane", "cotton"]:
        assert expected in crop_names


def test_weather_profiles_endpoint(client: TestClient):
    """Verify pre-computed research disease weather profiles are loaded."""
    res = client.get("/api/weather/disease-profiles")
    assert res.status_code == 200
    data = res.json()
    assert "profiles" in data
    assert len(data["profiles"]) > 0
    first_profile = data["profiles"][0]
    assert "key" in first_profile
    assert "disease" in first_profile
    assert "avg_temp_c" in first_profile


def test_weather_risk_forecast_endpoint(client: TestClient):
    """Verify the 7-day disease risk forecasting endpoint returns multi-day projections."""
    res = client.get(
        "/api/weather/forecast-risk",
        params={
            "crop": "rice",
            "temperature": 29.5,
            "humidity": 82.0,
            "rainfall": 12.0,
            "wind_speed": 14.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["crop"] == "rice"
    assert "current_assessment" in data
    assert data["current_assessment"]["risk_level"] in ["Low", "Medium", "High"]
    assert "seven_day_outlook" in data
    assert len(data["seven_day_outlook"]) == 7


def test_location_fetch_endpoint(client: TestClient):
    """Verify location/fetch returns valid weather telemetry."""
    res = client.get("/api/location/fetch")
    assert res.status_code == 200
    data = res.json()
    assert "location" in data
    assert "weather" in data
    assert "temperature_c" in data["weather"]
    assert "humidity_percent" in data["weather"]


def test_predict_endpoint_valid_image(client: TestClient, sample_leaf_bytes: bytes):
    """Verify POST /api/predict handles valid foliar image upload and returns multimodal diagnosis."""
    files = {"file": ("leaf.jpg", sample_leaf_bytes, "image/jpeg")}
    data = {
        "crop": "cotton",
        "lang": "en",
        "temperature": "29.0",
        "humidity": "75",
    }
    res = client.post("/api/predict", files=files, data=data)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["crop"] == "cotton"
    assert "predicted_class" in json_data
    assert "confidence" in json_data
    assert 0.0 <= json_data["confidence"] <= 1.0
    assert "top3" in json_data
    assert len(json_data["top3"]) > 0
    assert "disease_info" in json_data
    assert "health_score" in json_data


def test_predict_endpoint_unsupported_crop(client: TestClient, sample_leaf_bytes: bytes):
    """Verify unsupported crop returns HTTP 400 Bad Request."""
    files = {"file": ("leaf.jpg", sample_leaf_bytes, "image/jpeg")}
    data = {"crop": "banana"}
    res = client.post("/api/predict", files=files, data=data)
    assert res.status_code == 400
    assert "Unsupported crop" in res.json()["detail"]


def test_predict_endpoint_empty_file(client: TestClient):
    """Verify empty file upload returns HTTP 400."""
    files = {"file": ("empty.jpg", b"", "image/jpeg")}
    data = {"crop": "rice"}
    res = client.post("/api/predict", files=files, data=data)
    assert res.status_code == 400


def test_assistant_session_lifecycle(client: TestClient):
    """Verify diagnostic chat session initialisation and query handling."""
    # Start session
    start_payload = {
        "diagnosis_id": "test-diag-101",
        "crop": "rice",
        "predicted_class": "Brown Spot",
        "confidence": 0.91,
        "language": "en",
        "weather": {"temperature_c": 28.0, "humidity_percent": 80},
    }
    res_start = client.post("/api/assistant/start", json=start_payload)
    assert res_start.status_code == 200
    start_data = res_start.json()
    assert "diagnosis_summary" in start_data or "chat_answer" in start_data

    # Ask question
    ask_payload = {
        "diagnosis_id": "test-diag-101",
        "question": "What organic fungicides can I apply today?",
        "language": "en",
    }
    res_ask = client.post("/api/assistant/ask", json=ask_payload)
    assert res_ask.status_code == 200
    ask_data = res_ask.json()
    assert "chat_answer" in ask_data
    assert len(ask_data["chat_answer"]) > 5


def test_assistant_ask_empty_message_returns_400(client: TestClient):
    """Verify posting an empty prompt to the assistant returns HTTP 400."""
    res = client.post("/api/assistant/ask", json={"diagnosis_id": "test-id", "message": "   "})
    assert res.status_code == 400
    assert "cannot be empty" in res.json()["detail"].lower()


def test_assistant_ask_unknown_session_creates_fallback(client: TestClient):
    """Verify querying an expired or unknown session generates a valid general response."""
    res = client.post(
        "/api/assistant/ask",
        json={"diagnosis_id": "unknown-ghost-session-999", "message": "How do I care for my crop?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "chat_answer" in data


def test_location_fetch_with_coordinates(client: TestClient):
    """Verify location telemetry fetch with explicit geographic coordinates."""
    res = client.get("/api/location/fetch?lat=28.6139&lon=77.2090")
    assert res.status_code == 200
    data = res.json()
    assert "location" in data
    assert "weather" in data


def test_location_fetch_with_city_open_meteo(client: TestClient):
    """Verify Open-Meteo geocoding resolution for city names."""
    res = client.get("/api/location/fetch?city=Ludhiana")
    assert res.status_code == 200
    data = res.json()
    assert "location" in data
    assert "weather" in data
    assert "Ludhiana" in data["location"]["city"] or "Ludhiana" in str(data)


def test_location_search_open_meteo(client: TestClient):
    """Verify Open-Meteo search endpoint returns autocompletion results."""
    res = client.get("/api/location/search?query=Pune")
    assert res.status_code == 200
    data = res.json()
    assert "results" in data


def test_weather_profiles_filtered_by_crop(client: TestClient):
    """Verify disease profiles endpoint can be filtered strictly by crop."""
    res = client.get("/api/weather/disease-profiles?crop=wheat")
    assert res.status_code == 200
    profiles = res.json()["profiles"]
    for p in profiles:
        assert p["crop"].lower() == "wheat"

