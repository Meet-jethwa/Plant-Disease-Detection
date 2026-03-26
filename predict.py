"""
Plant Disease Detection - Prediction Script
============================================
Load a trained model and predict disease from a plant leaf image.

Usage:
    python predict.py --image <path_to_image> --crop <rice|wheat>
    python predict.py --image sample.jpg --crop rice
    python predict.py --image sample.jpg --crop wheat
"""

import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import json
import argparse
import numpy as np
from pathlib import Path

import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import load_img, img_to_array

# ─── Configuration ───────────────────────────────────────────────────────────

IMG_SIZE = 224
BASE_DIR = Path(r"d:\clg\major project\Project folder")
MODELS_DIR = BASE_DIR / "models"


def predict_disease(image_path, crop_name):
    """
    Predict plant disease from an image.
    
    Args:
        image_path: Path to the leaf image
        crop_name: 'rice' or 'wheat'
    
    Returns:
        dict with prediction results
    """
    # Validate inputs
    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    crop_name = crop_name.lower()
    if crop_name not in ['rice', 'wheat']:
        raise ValueError("Crop must be 'rice' or 'wheat'")
    
    # Load model
    model_path = MODELS_DIR / f"{crop_name}_disease_model.keras"
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model not found: {model_path}\n"
            f"Please train the model first using: python train_model.py"
        )
    
    print(f"Loading {crop_name} model...")
    model = load_model(model_path)
    
    # Load class labels
    labels_path = MODELS_DIR / f"{crop_name}_class_labels.json"
    with open(labels_path, 'r') as f:
        label_map = json.load(f)
    
    # Preprocess image
    print(f"Processing image: {image_path}")
    img = load_img(image_path, target_size=(IMG_SIZE, IMG_SIZE))
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    
    # Predict
    predictions = model.predict(img_array, verbose=0)
    predicted_class_idx = np.argmax(predictions[0])
    confidence = predictions[0][predicted_class_idx]
    
    # Get top-3 predictions
    top3_indices = np.argsort(predictions[0])[::-1][:3]
    top3_results = []
    for idx in top3_indices:
        top3_results.append({
            "class": label_map[str(idx)],
            "confidence": float(predictions[0][idx])
        })
    
    result = {
        "image": str(image_path),
        "crop": crop_name,
        "predicted_disease": label_map[str(predicted_class_idx)],
        "confidence": float(confidence),
        "top_3_predictions": top3_results
    }
    
    return result


def display_result(result):
    """Pretty print prediction results."""
    print("\n" + "=" * 50)
    print("  🌱 PLANT DISEASE PREDICTION RESULT")
    print("=" * 50)
    print(f"  📷 Image:      {result['image']}")
    print(f"  🌿 Crop:       {result['crop'].title()}")
    print(f"  🔬 Disease:    {result['predicted_disease']}")
    print(f"  📊 Confidence: {result['confidence']*100:.2f}%")
    print("-" * 50)
    print("  Top 3 Predictions:")
    for i, pred in enumerate(result['top_3_predictions'], 1):
        bar_len = int(pred['confidence'] * 30)
        bar = "█" * bar_len + "░" * (30 - bar_len)
        print(f"    {i}. {pred['class']:<30} {bar} {pred['confidence']*100:.2f}%")
    print("=" * 50)


# ─── CLI Entry Point ────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Plant Disease Detection - Predict disease from leaf image"
    )
    parser.add_argument(
        "--image", "-i", required=True,
        help="Path to the leaf image file"
    )
    parser.add_argument(
        "--crop", "-c", required=True, choices=["rice", "wheat"],
        help="Crop type: 'rice' or 'wheat'"
    )
    
    args = parser.parse_args()
    
    try:
        result = predict_disease(args.image, args.crop)
        display_result(result)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        exit(1)
