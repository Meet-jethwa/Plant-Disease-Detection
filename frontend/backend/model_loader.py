"""
model_loader.py
================
Discovers and caches all available .keras models from the models/ directory.
Uses Streamlit's cache_resource so models are only loaded once per session.
"""

import os
import json
import streamlit as st
from pathlib import Path
import tensorflow as tf

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# ── Path resolution ───────────────────────────────────────────────────────────
# frontend/backend/model_loader.py  →  ../../models/
BACKEND_DIR = Path(__file__).parent
FRONTEND_DIR = BACKEND_DIR.parent
PROJECT_DIR  = FRONTEND_DIR.parent
MODELS_DIR   = PROJECT_DIR / "models"

# ── Crop configuration ────────────────────────────────────────────────────────
# Each entry maps a display name → the actual files to look for
CROP_CONFIG = {
    "Rice": {
        "model_file":  "rice_disease_disease_model.keras",
        "labels_file": "rice_disease_class_labels.json",
        "key":         "rice_disease",
        "color":       "#16a34a",
        "description": "6 rice leaf diseases (Bacterial Leaf Blight, Brown Spot, Leaf Blast, etc.)",
        "accuracy":    94.23,
    },
    "Wheat": {
        "model_file":  "wheat_best_model.keras",
        "labels_file": "wheat_class_labels.json",
        "key":         "wheat",
        "color":       "#ca8a04",
        "description": "15 wheat diseases (Black Rust, Yellow Rust, Fusarium, Mildew, etc.)",
        "accuracy":    89.00,
    },
    "Sugarcane": {
        "model_file":  "sugarcane_disease_model.keras",
        "labels_file": "sugarcane_class_labels.json",
        "key":         "sugarcane",
        "color":       "#0891b2",
        "description": "3 sugarcane conditions (Mosaic Disease, Rust, Healthy)",
        "accuracy":    96.32,
    },
    "Cotton": {
        "model_file":  "cotton_disease_model.keras",
        "labels_file": "cotton_class_labels.json",
        "key":         "cotton",
        "color":       "#7c3aed",
        "description": "3 cotton conditions (Bacterial Blight, Alternaria Leaf Spot, Healthy)",
        "accuracy":    96.61,
    },
}


def get_available_crops() -> dict:
    """Return only crops whose model + labels files actually exist."""
    available = {}
    for display_name, cfg in CROP_CONFIG.items():
        model_path  = MODELS_DIR / cfg["model_file"]
        labels_path = MODELS_DIR / cfg["labels_file"]
        if model_path.exists() and labels_path.exists():
            available[display_name] = cfg
        else:
            missing = []
            if not model_path.exists():
                missing.append(cfg["model_file"])
            if not labels_path.exists():
                missing.append(cfg["labels_file"])
            # Still include but mark as unavailable so UI can grey it out
            cfg_copy = dict(cfg)
            cfg_copy["unavailable"] = True
            cfg_copy["missing_files"] = missing
            available[display_name] = cfg_copy
    return available


@st.cache_resource(show_spinner=False)
def load_model_and_labels(model_file: str, labels_file: str):
    """
    Load and cache a Keras model + its class labels.
    Returns (model, label_dict) or (None, None) on failure.
    """
    model_path  = MODELS_DIR / model_file
    labels_path = MODELS_DIR / labels_file

    if not model_path.exists() or not labels_path.exists():
        return None, None

    try:
        model = tf.keras.models.load_model(str(model_path), compile=False)
        with open(labels_path, "r") as f:
            label_map = json.load(f)          # {str(idx): class_name}
        # Normalise keys to int
        label_dict = {int(k): v for k, v in label_map.items()}
        return model, label_dict
    except Exception as e:
        st.error(f"Failed to load model {model_file}: {e}")
        return None, None
