"""
tests/unit/test_unit_multimodal.py
==================================
Unit tests for backend.multimodal_model tensor operations and class labels.
"""

from __future__ import annotations

import io
from PIL import Image
import torch
import pytest

from backend.multimodal_model import (
    CLASS_NAMES,
    extract_weather_tensor,
    get_weather_stats,
    preprocess_image_pytorch,
)


def test_multimodal_classes_coverage():
    """Verify exactly 33 canonical classes covering all 4 economic crops."""
    assert len(CLASS_NAMES) == 33
    crops_found = set()
    for name in CLASS_NAMES:
        prefix = name.split("_")[0].lower()
        crops_found.add(prefix)
    assert crops_found == {"rice", "wheat", "sugarcane", "cotton"}


def test_weather_stats_shape():
    """Verify the 11-feature meteorological z-score parameters."""
    mean, std = get_weather_stats()
    assert len(mean) == 11
    assert len(std) == 11
    assert (std > 0).all()


def test_extract_weather_tensor_rejects_scalar_dict():
    """Verify scalar single-day weather dict is rejected without synthetic generation."""
    weather = {
        "temperature_c": 28.0,
        "humidity_percent": 80.0,
        "rainfall_mm": 10.0,
        "wind_kmh": 15.0,
    }
    with pytest.raises(ValueError, match="Multimodal inference requires a genuine 7-day"):
        extract_weather_tensor(weather)


def test_extract_weather_tensor_valid_7x11():
    """Verify valid 7x11 sequence maps to [1, 7, 11] normalized PyTorch tensor."""
    valid_seq = [[28.0, 20.0, 24.0, 85.0, 70.0, 5.0, 18.0, 12.0, 0.0, 0.5, 0.86] for _ in range(7)]
    tensor = extract_weather_tensor({"features_7x11": valid_seq})
    assert isinstance(tensor, torch.Tensor)
    assert tensor.shape == (1, 7, 11)
    assert not torch.isnan(tensor).any()


def test_preprocess_image_pytorch():
    """Verify PIL image converts into [1, 3, 300, 300] float32 tensor."""
    img = Image.new("RGB", (250, 400), color=(100, 150, 50))
    tensor = preprocess_image_pytorch(img)
    assert isinstance(tensor, torch.Tensor)
    assert tensor.shape == (1, 3, 300, 300)
    assert tensor.dtype == torch.float32


def test_compute_multimodal_weather_shap():
    """Verify real PyTorch GradientExplainer SHAP attribution on MultimodalClassifier."""
    from backend.multimodal_model import load_multimodal_model, compute_multimodal_weather_shap

    model = load_multimodal_model()
    img_tensor = torch.randn(1, 3, 300, 300)
    wx_tensor = torch.zeros((1, 7, 11), dtype=torch.float32)

    shap_res = compute_multimodal_weather_shap(
        model=model,
        img_tensor=img_tensor,
        wx_tensor=wx_tensor,
        target_class_idx=15,  # rice_Bacterial Leaf Blight
        background_samples_count=8,
    )

    assert "target_class" in shap_res
    assert "feature_groups" in shap_res
    assert "feature_importance" in shap_res
    assert "shap_values" in shap_res
    assert "raw_matrix_7x11" in shap_res
    assert shap_res["method"].startswith("SHAP (GradientExplainer")
    assert "Temperature" in shap_res["feature_groups"]
    assert "Relative Humidity" in shap_res["feature_groups"]
    assert "Rainfall / Precipitation" in shap_res["feature_groups"]
    assert pytest.approx(sum(shap_res["feature_importance"].values()), abs=1.0) == 100.0

