"""
tests/unit/test_unit_multimodal_loader.py
=========================================
Unit tests for the PyTorch multimodal data loader, weather encoder, and feature preprocessors.
"""

from __future__ import annotations

from datetime import date
import io
import numpy as np
from PIL import Image
import pytest
import torch

from backend.multimodal_loader import (
    DEFAULT_WEATHER_MEAN,
    DEFAULT_WEATHER_STD,
    WeatherEncoder,
    extract_weather_tensor,
    get_season_encoding,
    get_weather_stats,
    preprocess_image_pytorch,
    predict_multimodal_disease,
)


def test_get_weather_stats():
    """Verify weather statistics have 11 dimensions and valid positive standard deviations."""
    mean, std = get_weather_stats()
    assert len(mean) == 11
    assert len(std) == 11
    assert (std >= 0).all()


def test_season_encoding_trigonometric_identity():
    """Verify seasonal cyclic encoding adheres to sin^2(x) + cos^2(x) == 1."""
    for month in range(1, 13):
        d = date(2026, month, 15)
        sin_val, cos_val = get_season_encoding(d)
        identity = (sin_val ** 2) + (cos_val ** 2)
        assert pytest.approx(identity, abs=1e-5) == 1.0


def test_weather_encoder_forward_pass():
    """Verify 1D-CNN + 4-Head Self Attention produces expected 128-dim embedding and attention weights."""
    encoder = WeatherEncoder(n_features=11, seq_len=7, out_dim=128)
    encoder.eval()

    dummy_input = torch.randn(2, 7, 11, dtype=torch.float32)

    with torch.no_grad():
        features, attn_weights = encoder(dummy_input, return_attention=True)

    # Feature embedding: [batch_size=2, out_dim=128]
    assert features.shape == (2, 128)
    # Self-attention matrix: [batch_size=2, seq_len=7, seq_len=7]
    assert attn_weights.shape == (2, 7, 7)
    # Attention probabilities must sum to 1 across target timesteps
    attn_sums = attn_weights.sum(dim=-1)
    assert torch.allclose(attn_sums, torch.ones_like(attn_sums), atol=1e-4)


def test_extract_weather_tensor_from_numpy():
    """Verify raw numpy 7x11 sequence transforms to z-score normalized PyTorch tensor [1, 7, 11]."""
    raw_seq = np.ones((7, 11), dtype=np.float32) * 25.0
    tensor = extract_weather_tensor(raw_seq)

    assert isinstance(tensor, torch.Tensor)
    assert tensor.shape == (1, 7, 11)


def test_extract_weather_tensor_from_scalar_dict():
    """Verify single-day current weather dict synthesizes valid 7-day standardized sequence."""
    current_wx = {
        "temperature_c": 29.5,
        "humidity_percent": 84.0,
        "rainfall_mm": 12.0,
        "wind_kmh": 14.0,
    }
    tensor = extract_weather_tensor(current_wx, target_date=date(2026, 7, 15))

    assert isinstance(tensor, torch.Tensor)
    assert tensor.shape == (1, 7, 11)
    assert not torch.isnan(tensor).any()


def test_extract_weather_tensor_from_daily_sequence():
    """Verify multi-day daily_sequence list transforms to normalized PyTorch tensor [1, 7, 11]."""
    daily_seq = [[25.0] * 11 for _ in range(7)]
    tensor = extract_weather_tensor({"daily_sequence": daily_seq})

    assert isinstance(tensor, torch.Tensor)
    assert tensor.shape == (1, 7, 11)


def test_extract_weather_tensor_from_open_meteo_daily_dict():
    """Verify Open-Meteo multi-day daily dict formats into valid 7x11 normalized tensor."""
    days = [f"2026-07-0{i}" for i in range(1, 8)]
    daily_data = {
        "daily": {
            "time": days,
            "temperature_2m_max": [32.0] * 7,
            "temperature_2m_min": [24.0] * 7,
            "relative_humidity_2m_max": [88.0] * 7,
            "precipitation_sum": [5.0] * 7,
        }
    }
    tensor = extract_weather_tensor(daily_data)

    assert isinstance(tensor, torch.Tensor)
    assert tensor.shape == (1, 7, 11)
    assert not torch.isnan(tensor).any()


def test_preprocess_image_pytorch():
    """Verify raw JPEG bytes transform into ImageNet normalized tensor [1, 3, 300, 300]."""
    dummy_img = (np.random.rand(300, 300, 3) * 255).astype(np.uint8)
    buf = io.BytesIO()
    Image.fromarray(dummy_img).save(buf, format="JPEG")

    tensor = preprocess_image_pytorch(buf.getvalue())
    assert isinstance(tensor, torch.Tensor)
    assert tensor.shape == (1, 3, 300, 300)


def test_predict_multimodal_disease_inference():
    """Verify end-to-end PyTorch multimodal inference pipeline."""
    dummy_img = (np.random.rand(300, 300, 3) * 255).astype(np.uint8)
    buf = io.BytesIO()
    Image.fromarray(dummy_img).save(buf, format="JPEG")

    res = predict_multimodal_disease(
        file_bytes=buf.getvalue(),
        weather_dict={"temperature_c": 30.0, "humidity_percent": 85.0},
        crop_hint="rice",
    )

    assert "predicted_label" in res
    assert "confidence" in res
    assert "top3" in res
    assert len(res["weather_importance_days"]) == 7
    assert res["crop"] == "Rice"

