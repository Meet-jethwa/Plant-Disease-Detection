"""
multimodal_loader.py
=====================
Consolidated compatibility bridge for backend.multimodal_model.
Points directly to the single authoritative PyTorch multimodal inference pipeline:
  - Visual stream: EfficientNetV2-S (300x300 RGB) -> 512-dim embedding
  - Environmental stream: 7-day x 11-feature meteorological sequence via 1D-CNN + 4-Head Attention -> 128-dim embedding
  - Late fusion: Concatenation (640-dim) -> Classification MLP (256 -> 33 classes)
"""

from __future__ import annotations

import io
from datetime import date
from typing import Any, Dict, Tuple
import numpy as np
import torch
from PIL import Image

# Re-export canonical definitions from the single authoritative implementation
from backend.multimodal_model import (
    CLASS_NAMES,
    DEFAULT_WEATHER_MEAN,
    DEFAULT_WEATHER_STD,
    WeatherEncoder,
    MultimodalClassifier,
    extract_weather_tensor,
    get_season_encoding,
    get_weather_stats,
    preprocess_image_pytorch,
    load_multimodal_model,
    predict_multimodal,
    compute_multimodal_weather_shap,
    generate_multimodal_gradcam,
)

# Backwards compatibility alias for the network architecture
MultimodalDiseaseNet = MultimodalClassifier


def get_multimodal_model() -> Tuple[MultimodalClassifier | None, Dict[int, str] | None]:
    """Load and cache PyTorch multimodal model and index-to-label dictionary."""
    try:
        model = load_multimodal_model()
        label_dict = {i: name for i, name in enumerate(CLASS_NAMES)}
        return model, label_dict
    except Exception as exc:
        print(f"[multimodal_loader] Could not load multimodal model: {exc}")
        return None, None


def predict_multimodal_disease(
    file_bytes: bytes,
    weather_dict: dict | list | np.ndarray | None = None,
    crop_hint: str | None = None,
) -> Dict[str, Any]:
    """
    Run PyTorch multimodal inference using the consolidated production pipeline.
    """
    res = predict_multimodal(
        image=file_bytes,
        weather=weather_dict if isinstance(weather_dict, dict) else None,
        crop_hint=crop_hint,
        weather_features_7x11=weather_dict if isinstance(weather_dict, (list, np.ndarray)) else None,
    )
    return {
        "predicted_label": res["predicted_disease"],
        "raw_class": res["raw_label"],
        "crop": res["crop"],
        "confidence": res["confidence"],
        "top3": res["top3"],
        "all_probs": res["all_probs"],
        "weather_importance_days": res["daily_attention"],
        "gradcam": {
            "overlay_rgb": res["overlay_rgb"],
            "heatmap_rgb": res["heatmap_rgb"],
            "activation_coverage_percent": res["activation_coverage_percent"],
        },
        "shap_explanation": res.get("shap_explanation"),
    }
