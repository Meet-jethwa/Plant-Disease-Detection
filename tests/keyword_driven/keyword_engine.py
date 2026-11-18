"""
tests/keyword_driven/keyword_engine.py
======================================
Keyword-Driven Testing (KDT) Execution Engine for FloraAI.
Maps abstract keywords from test step tables to executable test automation logic.
"""

from __future__ import annotations

from typing import Any, Dict
from fastapi.testclient import TestClient


class KeywordEngine:
    """Keyword action interpreter and state container for execution steps."""

    def __init__(self, client: TestClient, sample_image_bytes: bytes):
        self.client = client
        self.sample_image_bytes = sample_image_bytes
        self.context: Dict[str, Any] = {
            "crop": "rice",
            "weather": {},
            "image": None,
            "last_response": None,
            "last_prediction": None,
            "session_id": "kdt-session-101",
        }

    def execute_step(self, keyword: str, target: str, value: str, expected: str):
        """Dispatches action based on keyword and verifies expectation."""
        method_name = f"action_{keyword.lower()}"
        action_func = getattr(self, method_name, None)
        if not action_func:
            raise NotImplementedError(f"Keyword action '{keyword}' is not supported.")
        action_func(target, value, expected)

    def action_check_health(self, target: str, value: str, expected: str):
        res = self.client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data.get("status") == expected

    def action_select_crop(self, target: str, value: str, expected: str):
        self.context["crop"] = value
        if expected:
            assert self.context["crop"] == expected

    def action_override_weather(self, target: str, value: str, expected: str):
        self.context["weather"][target] = float(value)
        if expected:
            assert self.context["weather"][target] == float(expected)

    def action_upload_image(self, target: str, value: str, expected: str):
        self.context["image"] = self.sample_image_bytes
        assert len(self.context["image"]) > 0

    def action_execute_prediction(self, target: str, value: str, expected: str):
        files = {"file": ("test_leaf.jpg", self.context["image"] or b"dummy", "image/jpeg")}
        data = {
            "crop": self.context["crop"],
            "temperature": str(self.context["weather"].get("temperature_c", 28.0)),
            "humidity": str(self.context["weather"].get("humidity_percent", 70.0)),
            "rainfall": str(self.context["weather"].get("rainfall_mm", 2.0)),
            "wind_speed": str(self.context["weather"].get("wind_kmh", 10.0)),
        }
        res = self.client.post("/api/predict", files=files, data=data)
        self.context["last_response"] = res
        assert res.status_code == int(expected), f"Expected status {expected}, got {res.status_code}"
        if res.status_code == 200:
            self.context["last_prediction"] = res.json()

    def action_verify_prediction_field(self, target: str, value: str, expected: str):
        pred = self.context.get("last_prediction")
        assert pred is not None, "No prediction found in context to verify."
        if target == "crop":
            assert pred["crop"].lower() == expected.lower()
        elif target == "confidence":
            threshold = float(expected)
            assert pred["confidence"] >= threshold

    def action_verify_risk_level(self, target: str, value: str, expected: str):
        pred = self.context.get("last_prediction")
        assert pred is not None
        risk = pred.get("risk_level") or pred.get("weather_risk", {}).get("level")
        assert risk in ["Low", "Medium", "High"]

    def action_forecast_7day_risk(self, target: str, value: str, expected: str):
        res = self.client.get(
            "/api/weather/forecast-risk",
            params={"crop": self.context["crop"], "temperature": 25.0, "humidity": 70.0},
        )
        assert res.status_code == 200
        data = res.json()
        assert len(data.get("seven_day_outlook", [])) == 7

    def action_start_assistant_session(self, target: str, value: str, expected: str):
        pred = self.context.get("last_prediction")
        payload = {
            "diagnosis_id": self.context["session_id"],
            "crop": self.context["crop"],
            "predicted_class": pred["predicted_class"] if pred else "Brown Spot",
            "confidence": pred["confidence"] if pred else 0.85,
            "language": "en",
        }
        res = self.client.post("/api/assistant/start", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "diagnosis_summary" in data or "chat_answer" in data

    def action_ask_assistant_question(self, target: str, value: str, expected: str):
        payload = {
            "diagnosis_id": self.context["session_id"],
            "question": value,
            "language": "en",
        }
        res = self.client.post("/api/assistant/ask", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert len(data.get("chat_answer", "")) > 0
