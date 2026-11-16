"""
Plant Disease Detection - Prediction Script
============================================
Predict plant disease from a leaf image using the trained model.
Supports all 4 crops: Rice, Wheat, Sugarcane, Cotton.

Usage:
    python predict.py --image <path_to_image> --crop <rice|wheat|sugarcane|cotton>
    python predict.py --image dataset/Sugercane/Healthy/image001.jpg --crop sugarcane
    python predict.py --image sample.jpg --crop rice
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MULTIMODAL_WEIGHTS = MODELS_DIR / "best_model_multimodal.pth"

SUPPORTED_CROPS = ["rice", "wheat", "sugarcane", "cotton"]


def predict_with_multimodal(image_path: Path, crop_name: str) -> dict:
    """Run prediction using the trained PyTorch multimodal model (best_model_multimodal.pth)."""
    # Ensure project root is in sys.path
    if str(BASE_DIR) not in sys.path:
        sys.path.insert(0, str(BASE_DIR))

    try:
        from backend.multimodal_model import predict_multimodal
    except ImportError as e:
        print(f"\n[Error] Could not import PyTorch multimodal engine: {e}")
        print("Please run this command using the virtual environment python:")
        print(r"  .\.venv\Scripts\python.exe predict.py --image ... --crop ...")
        sys.exit(1)

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    # Ambient default weather for field inference
    default_weather = {
        "temperature_c": 28.0,
        "humidity_percent": 70,
        "rainfall_mm": 2.0,
        "wind_kmh": 10.0,
        "condition": "Field ambient",
    }

    res = predict_multimodal(
        image=image_bytes,
        weather=default_weather,
        crop_hint=crop_name,
    )

    return {
        "image": str(image_path),
        "crop": crop_name,
        "predicted_disease": res["predicted_disease"],
        "confidence": float(res["confidence"]),
        "model_type": "Multimodal (EfficientNetV2 + Weather Attention)",
        "affected_area_percent": res.get("affected_area_pct", 0.0),
        "top_3_predictions": [
            {
                "class": item["class"],
                "confidence": float(item["confidence"]),
            }
            for item in res.get("top3", [])
        ],
    }


def predict_with_keras(image_path: Path, crop_name: str, model_path: Path, labels_path: Path) -> dict:
    """Run prediction using a standalone Keras CNN model."""
    os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
    os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

    import numpy as np
    from tensorflow.keras.models import load_model
    from tensorflow.keras.utils import img_to_array, load_img

    with open(labels_path, "r", encoding="utf-8") as f:
        label_map = json.load(f)

    model = load_model(str(model_path), compile=False)
    img = load_img(str(image_path), target_size=(224, 224))
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array, verbose=0)[0]
    predicted_idx = int(np.argmax(predictions))
    confidence = float(predictions[predicted_idx])

    top3_indices = np.argsort(predictions)[::-1][:3]
    top3_results = [
        {
            "class": label_map.get(str(idx), f"Class_{idx}"),
            "confidence": float(predictions[idx]),
        }
        for idx in top3_indices
    ]

    return {
        "image": str(image_path),
        "crop": crop_name,
        "predicted_disease": label_map.get(str(predicted_idx), f"Class_{predicted_idx}"),
        "confidence": confidence,
        "model_type": "Keras CNN (EfficientNetB0)",
        "top_3_predictions": top3_results,
    }


def predict_disease(image_path: str | Path, crop_name: str) -> dict:
    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    crop_name = crop_name.lower().strip()
    if crop_name not in SUPPORTED_CROPS:
        raise ValueError(f"Crop must be one of: {', '.join(SUPPORTED_CROPS)}")

    # 1. Prefer PyTorch Multimodal model if present (canonical model with all 33 classes)
    if MULTIMODAL_WEIGHTS.exists():
        return predict_with_multimodal(image_path, crop_name)

    # 2. Check for crop-specific Keras model
    possible_keras_names = [
        f"{crop_name}_disease_model.keras",
        f"{crop_name}_best_model.keras",
        f"{crop_name}_disease_disease_model.keras",
    ]
    keras_model_path = None
    for name in possible_keras_names:
        p = MODELS_DIR / name
        if p.exists():
            keras_model_path = p
            break

    labels_path = MODELS_DIR / f"{crop_name}_class_labels.json"
    if not labels_path.exists():
        labels_path = MODELS_DIR / f"{crop_name}_disease_class_labels.json"

    if keras_model_path and labels_path.exists():
        return predict_with_keras(image_path, crop_name, keras_model_path, labels_path)

    raise FileNotFoundError(
        f"No trained model found for '{crop_name}' in {MODELS_DIR}.\n"
        f"Expected either {MULTIMODAL_WEIGHTS.name} or {crop_name}_disease_model.keras"
    )


def display_result(result: dict):
    """Pretty print prediction results."""
    print("\n" + "=" * 56)
    print("  PLANT DISEASE PREDICTION RESULT")
    print("=" * 56)
    print(f"  Image:       {result['image']}")
    print(f"  Crop:        {result['crop'].title()}")
    print(f"  Disease:     {result['predicted_disease']}")
    print(f"  Confidence:  {result['confidence'] * 100:.2f}%")
    print(f"  Engine:      {result.get('model_type', 'Default')}")
    if result.get("affected_area_percent"):
        print(f"  Lesion Area: {result['affected_area_percent']:.1f}%")
    print("-" * 56)
    print("  Top Predictions:")
    for i, pred in enumerate(result.get("top_3_predictions", []), 1):
        bar_len = int(pred["confidence"] * 24)
        bar = "#" * bar_len + "-" * (24 - bar_len)
        print(f"    {i}. {pred['class']:<26} [{bar}] {pred['confidence'] * 100:.1f}%")
    print("=" * 56 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="FloraAI - Predict disease from plant leaf image"
    )
    parser.add_argument(
        "--image", "-i", required=True,
        help="Path to the leaf image file"
    )
    parser.add_argument(
        "--crop", "-c", required=True, choices=SUPPORTED_CROPS,
        help=f"Crop type: {', '.join(SUPPORTED_CROPS)}"
    )

    args = parser.parse_args()

    try:
        res = predict_disease(args.image, args.crop)
        display_result(res)
    except Exception as e:
        print(f"\n[Error] {e}")
        sys.exit(1)
