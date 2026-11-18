"""
tests/unit/test_unit_predict_cli.py
===================================
Unit tests for the standalone CLI prediction engine (predict.py).
"""

from __future__ import annotations

from pathlib import Path
import pytest

from predict import display_result, predict_disease


def test_predict_cli_valid_image(dataset_image_path: Path):
    """Verify CLI inference engine produces structured prediction on sample dataset image."""
    if not dataset_image_path.exists():
        pytest.skip(f"Dataset image {dataset_image_path} not found")

    res = predict_disease(dataset_image_path, crop_name="cotton")
    assert res is not None
    assert res["crop"] == "cotton"
    assert "predicted_disease" in res
    assert "confidence" in res
    assert 0.0 <= res["confidence"] <= 1.0
    assert "top_3_predictions" in res
    assert len(res["top_3_predictions"]) <= 3


def test_predict_cli_nonexistent_image():
    """Verify CLI raises FileNotFoundError on missing image path."""
    with pytest.raises(FileNotFoundError):
        predict_disease("non_existent_leaf_photo_xyz.jpg", crop_name="rice")


def test_predict_cli_invalid_crop(dataset_image_path: Path):
    """Verify CLI raises ValueError when an unsupported crop is supplied."""
    with pytest.raises(ValueError, match="Crop must be one of"):
        predict_disease(dataset_image_path, crop_name="barley")


def test_predict_display_result(capsys):
    """Verify display_result pretty-printer renders formatted terminal banner."""
    dummy_res = {
        "image": "sample_leaf.jpg",
        "crop": "rice",
        "predicted_disease": "Leaf Blast",
        "confidence": 0.942,
        "model_type": "Multimodal",
        "affected_area_percent": 14.5,
        "top_3_predictions": [
            {"class": "Leaf Blast", "confidence": 0.942},
            {"class": "Brown Spot", "confidence": 0.038},
            {"class": "Healthy", "confidence": 0.020},
        ],
    }
    display_result(dummy_res)
    captured = capsys.readouterr().out
    assert "PLANT DISEASE PREDICTION RESULT" in captured
    assert "Leaf Blast" in captured
    assert "94.20%" in captured

