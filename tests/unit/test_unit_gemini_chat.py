"""
tests/unit/test_unit_gemini_chat.py
===================================
Unit tests for the Google Gemini contextual chat assistant and agronomic intent classification.
"""

from __future__ import annotations

import base64
import json
from unittest.mock import MagicMock, patch
import pytest

from backend.gemini_chat import (
    _build_image_part,
    _fallback_chat,
    _fallback_initial,
    _lang_name,
    _strip_data_url_prefix,
    ask_gemini,
    ask_gemini_chat,
    ask_gemini_initial,
    detect_intent,
)


def test_intent_detection_matrix():
    """Verify deterministic keyword matching maps agricultural queries to correct intents."""
    test_cases = [
        ("What fungicide or medicine should I spray for blast?", "treatment"),
        ("What does the red heatmap area on the leaf mean?", "gradcam"),
        ("Why does humidity have 50% feature importance?", "shap"),
        ("How does high moisture and rain affect fungal spread?", "environment"),
        ("How can I prevent this infection from recurring?", "prevention"),
        ("What visible lesions or spots should I look for?", "symptoms"),
        ("Why was this disease detected by the model?", "why_detected"),
        ("Is this disease critical or dangerous to the yield?", "severity"),
        ("Hello, how are you today?", "general"),
    ]
    for prompt, expected_intent in test_cases:
        detected = detect_intent(prompt)
        assert detected == expected_intent, f"Expected {expected_intent} for '{prompt}', got {detected}"


def test_strip_data_url_prefix():
    """Verify extraction of mime-type and payload from data URLs."""
    # Standard data URL
    data_url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=="
    mime, b64 = _strip_data_url_prefix(data_url)
    assert mime == "image/png"
    assert b64 == "iVBORw0KGgoAAAANSUhEUg=="

    # Plain base64 without prefix
    plain_b64 = "SGVsbG8gV29ybGQ="
    mime_plain, b64_plain = _strip_data_url_prefix(plain_b64)
    assert mime_plain == "image/jpeg"
    assert b64_plain == plain_b64


def test_lang_name_mapping():
    """Verify locale code mapping across all 8 supported Indic and English languages."""
    assert "English" in _lang_name("en")
    assert "Hindi" in _lang_name("hi")
    assert "Gujarati" in _lang_name("gu")
    assert "Marathi" in _lang_name("mr")
    assert "Tamil" in _lang_name("ta")
    assert "Telugu" in _lang_name("te")
    assert "Bengali" in _lang_name("bn")
    assert "Punjabi" in _lang_name("pa")
    assert _lang_name("unknown") == "English"


def test_build_image_part():
    """Verify base64 data conversion to genai Image Part."""
    valid_b64 = "data:image/jpeg;base64," + base64.b64encode(b"fake_image_bytes").decode("ascii")
    part = _build_image_part(valid_b64)
    assert part is not None

    # Empty and invalid base64 inputs
    assert _build_image_part("") is None
    assert _build_image_part("data:image/jpeg;base64,invalid!@#$") is None


def test_fallback_initial_structure():
    """Verify Mode A fallback returns complete schema compliant response with disclaimer."""
    ctx = {"crop": "rice", "predicted_class": "Leaf Blast", "confidence": 0.88}
    res = _fallback_initial(ctx, err_msg="Offline Mode")
    assert res["error"] is True
    assert "Offline Mode" in res["message"]
    assert "disclaimer" in res
    assert isinstance(res["why_detected"], list)
    assert isinstance(res["follow_up_questions"], list)


def test_fallback_chat_structure():
    """Verify Mode B fallback returns genuine explanatory message and intent."""
    ctx = {"crop": "wheat"}
    res = _fallback_chat(ctx, intent="treatment", err_msg="Service unavailable")
    assert res["error"] is True
    assert res["intent"] == "treatment"
    assert "Gemini AI error" in res["chat_answer"]


def test_ask_gemini_initial_without_api_key():
    """Verify initial diagnosis generation falls back gracefully without API key."""
    with patch.dict("os.environ", {"GEMINI_API_KEY": ""}, clear=False):
        ctx = {"crop": "rice", "predicted_class": "Brown Spot", "confidence": 0.92}
        res = ask_gemini_initial(ctx)
        assert res["error"] is True
        assert "GEMINI_API_KEY" in res["message"]


def test_ask_gemini_chat_without_api_key():
    """Verify follow-up chat falls back gracefully without API key."""
    with patch.dict("os.environ", {"GEMINI_API_KEY": ""}, clear=False):
        ctx = {"crop": "cotton", "message": "What should I do?"}
        res = ask_gemini_chat(ctx, intent="treatment")
        assert res["error"] is True
        assert res["intent"] == "treatment"


def test_ask_gemini_legacy_alias():
    """Verify legacy ask_gemini() wrapper invokes initial diagnosis."""
    with patch.dict("os.environ", {"GEMINI_API_KEY": ""}, clear=False):
        res = ask_gemini({"crop": "sugarcane"})
        assert "disclaimer" in res


def test_ask_gemini_initial_with_mocked_client():
    """Verify Mode A structured JSON extraction when Gemini client returns valid output."""
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "diagnosis_summary": "Rice blast detected.",
        "why_detected": ["Lesions"],
        "visual_explanation": {"original_image_explanation": "Spots", "gradcam_explanation": "Heatmap"},
        "environmental_factors": [],
        "recommended_actions": ["Spray tricyclazole"],
        "prevention": ["Crop rotation"],
        "follow_up_questions": ["Next steps?"]
    })

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response

    with patch.dict("os.environ", {"GEMINI_API_KEY": "fake_test_key_12345"}), \
         patch("google.genai.Client", return_value=mock_client):
        ctx = {
            "crop": "rice",
            "predicted_class": "Leaf Blast",
            "confidence": 0.94,
            "weather": {"temperature_c": 28, "humidity_percent": 85},
            "language": "en",
        }
        res = ask_gemini_initial(ctx)
        assert res.get("diagnosis_summary") == "Rice blast detected."
        assert "recommended_actions" in res
        assert "disclaimer" in res


def test_ask_gemini_chat_with_mocked_client():
    """Verify Mode B plain-text answer generation when Gemini client responds."""
    mock_response = MagicMock()
    mock_response.text = "Apply copper oxychloride at 2.5 g/L early in the morning."

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response

    with patch.dict("os.environ", {"GEMINI_API_KEY": "fake_test_key_12345"}), \
         patch("google.genai.Client", return_value=mock_client):
        ctx = {
            "crop": "cotton",
            "predicted_class": "Bacterial Blight",
            "confidence": 0.89,
            "message": "How do I control this blight?",
            "language": "en",
        }
        res = ask_gemini_chat(ctx, intent="treatment")
        assert "copper oxychloride" in res["chat_answer"]
        assert res["intent"] == "treatment"
        assert len(res["follow_up_questions"]) > 0
