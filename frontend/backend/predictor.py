"""
predictor.py
=============
Handles image preprocessing, model inference, and result formatting.
"""

import numpy as np
from PIL import Image
import io
import sys
import os

# ── suppress TF noise ──────────────────────────────────────────────────────────
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

IMG_SIZE = 224


def preprocess_image(uploaded_file) -> tuple[np.ndarray, np.ndarray]:
    """
    Read a Streamlit UploadedFile (or a PIL Image or bytes).
    Returns:
        pil_img_array  : uint8 (H, W, 3) for display
        model_input    : float32 (1, 224, 224, 3) for the model
    """
    if hasattr(uploaded_file, "read"):
        raw = uploaded_file.read()
        pil_img = Image.open(io.BytesIO(raw)).convert("RGB")
    elif isinstance(uploaded_file, Image.Image):
        pil_img = uploaded_file.convert("RGB")
    else:
        raise ValueError("Unsupported input type for image preprocessing.")

    # Resize for display — keep reasonable size
    display_img = pil_img.resize((512, 512), Image.LANCZOS)
    display_array = np.array(display_img)  # uint8 (512, 512, 3)

    # Resize for model — 224x224, keep as float32 (EfficientNetB0's preprocess
    # is baked into the augmentation layers, so we just pass raw pixel values)
    model_img = pil_img.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)
    model_array = np.array(model_img).astype(np.float32)        # (224, 224, 3)
    model_input  = np.expand_dims(model_array, axis=0)           # (1, 224, 224, 3)

    return display_array, model_input


def run_inference(model_input: np.ndarray, model, label_dict: dict) -> dict:
    """
    Run inference and return structured prediction results.

    Args:
        model_input : float32 (1, 224, 224, 3)
        model       : loaded Keras model
        label_dict  : {int_idx: class_name}

    Returns:
        {
            "predicted_class": str,
            "confidence":      float (0–1),
            "top3": [{"class": str, "confidence": float}, ...],
            "all_probs": np.ndarray  (num_classes,)
        }
    """
    preds = model.predict(model_input, verbose=0)[0]   # (num_classes,)

    top3_indices = np.argsort(preds)[::-1][:3]
    top3 = [
        {
            "class":      label_dict.get(int(i), f"Class_{i}"),
            "confidence": float(preds[i]),
        }
        for i in top3_indices
    ]

    return {
        "predicted_class": top3[0]["class"],
        "confidence":      top3[0]["confidence"],
        "top3":            top3,
        "all_probs":       preds,
    }


def format_class_name(raw: str) -> str:
    """
    Convert internal class name to a human-readable display name.
    e.g.  'bacterial_leaf_blight'  →  'Bacterial Leaf Blight'
          'Healthy'                →  'Healthy'
          'Yellow Rust'            →  'Yellow Rust'
    """
    return raw.replace("_", " ").strip().title()
