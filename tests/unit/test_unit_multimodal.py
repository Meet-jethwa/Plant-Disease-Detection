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


def test_extract_weather_tensor_from_dict():
    """Verify dictionary weather input maps to [1, 7, 11] normalized PyTorch tensor."""
    weather = {
        "temperature_c": 28.0,
        "humidity_percent": 80.0,
        "rainfall_mm": 10.0,
        "wind_kmh": 15.0,
    }
    tensor = extract_weather_tensor(weather)
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

