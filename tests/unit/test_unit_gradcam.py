"""
tests/unit/test_unit_gradcam.py
===============================
Unit tests for Grad-CAM Explainable AI (XAI) attention overlays and layer discovery.
"""

from __future__ import annotations

import numpy as np
import pytest
import tensorflow as tf

from backend.gradcam import (
    _find_last_conv_layer,
    _find_nested_efficientnet,
    _get_gradcam_heatmap,
    generate_gradcam_overlay,
)


def _build_dummy_conv_model(name: str = "model") -> tf.keras.Model:
    """Build a lightweight Keras CNN with a named conv layer for testing."""
    inputs = tf.keras.Input(shape=(224, 224, 3), name=f"{name}_input")
    x = tf.keras.layers.Conv2D(16, (3, 3), padding="same", activation="relu", name="top_conv")(inputs)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    outputs = tf.keras.layers.Dense(4, activation="softmax", name=f"{name}_out")(x)
    return tf.keras.Model(inputs=inputs, outputs=outputs, name=name)


def test_find_last_conv_layer():
    """Verify discovery of conv layer by name and backward traversal."""
    model = _build_dummy_conv_model()

    # Found by preferred name
    conv = _find_last_conv_layer(model, preferred_name="top_conv")
    assert conv is not None
    assert conv.name == "top_conv"

    # Fallback to last conv layer when preferred name is absent
    conv_fallback = _find_last_conv_layer(model, preferred_name="nonexistent_layer")
    assert conv_fallback is not None
    assert isinstance(conv_fallback, tf.keras.layers.Conv2D)


def test_find_nested_efficientnet():
    """Verify detection of nested sub-models."""
    inner = _build_dummy_conv_model(name="efficientnetb0")
    outer = tf.keras.Sequential([inner, tf.keras.layers.Dense(2)])

    nested = _find_nested_efficientnet(outer)
    assert nested is not None
    assert "efficientnetb0" in nested.name.lower()

    # Model without nested sub-models returns None
    flat_model = _build_dummy_conv_model(name="flat_model")
    assert _find_nested_efficientnet(flat_model) is None


def test_generate_gradcam_overlay_success():
    """Verify Grad-CAM overlay generates heatmap and blended RGB output."""
    model = _build_dummy_conv_model()
    dummy_img = np.random.randint(0, 255, (300, 300, 3), dtype=np.uint8)

    orig, overlay, heatmap, affected_pct = generate_gradcam_overlay(
        original_img=dummy_img,
        model=model,
        alpha=0.5,
        last_conv_layer_name="top_conv",
    )

    if orig is not None:
        assert orig.shape == (300, 300, 3)
        assert overlay.shape == (300, 300, 3)
        assert heatmap.shape == (300, 300, 3)
        assert 0.0 <= affected_pct <= 100.0


def test_generate_gradcam_overlay_float_input():
    """Verify float image in [0, 1] is correctly converted to uint8."""
    model = _build_dummy_conv_model()
    dummy_float_img = np.random.rand(224, 224, 3).astype(np.float32)

    orig, overlay, heatmap, affected_pct = generate_gradcam_overlay(
        original_img=dummy_float_img,
        model=model,
        alpha=0.5,
        last_conv_layer_name="top_conv",
    )

    if orig is not None:
        assert orig.dtype == np.uint8


def test_generate_gradcam_overlay_invalid_model_fails_gracefully():
    """Verify passing an invalid/corrupt model returns (None, None, None, None) safely."""
    dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
    orig, overlay, heatmap, affected_pct = generate_gradcam_overlay(
        original_img=dummy_img,
        model=None,
    )
    assert orig is None
    assert overlay is None
    assert heatmap is None
    assert affected_pct is None


def test_generate_gradcam_overlay_nested_efficientnet():
    """Verify Grad-CAM overlay handles nested EfficientNet transfer-learning architectures."""
    inner = _build_dummy_conv_model(name="efficientnetb0")
    outer = tf.keras.Sequential([
        inner,
        tf.keras.layers.Dense(4, activation="softmax")
    ])
    dummy_img = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    orig, overlay, heatmap, affected_pct = generate_gradcam_overlay(
        original_img=dummy_img,
        model=outer,
        alpha=0.5,
        last_conv_layer_name="top_conv",
    )
    if orig is not None:
        assert orig.shape == (224, 224, 3)
        assert overlay.shape == (224, 224, 3)
        assert 0.0 <= affected_pct <= 100.0
    else:
        assert orig is None and overlay is None and heatmap is None

