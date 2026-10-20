"""
gradcam.py
===========
Generates Grad-CAM heatmap overlays for EfficientNetB0 models.
Handles nested EfficientNetB0 transfer-learning models, flat models,
and automatic Conv2D / DepthwiseConv2D layer fallback discovery.
"""

from __future__ import annotations

import cv2
import numpy as np
import tensorflow as tf


def _find_nested_efficientnet(model) -> tf.keras.Model | None:
    """Find an EfficientNetB0 nested inside a transfer-learning model."""
    for layer in model.layers:
        if isinstance(layer, tf.keras.Model):
            if "efficientnetb0" in layer.name.lower():
                return layer

    for layer in model.layers:
        if hasattr(layer, "layers") and len(getattr(layer, "layers", [])) > 5:
            return layer

    return None


def _find_last_conv_layer(model, preferred_name: str = "top_conv") -> tf.keras.layers.Layer | None:
    """Find preferred convolution layer or fall back to last Conv2D/DepthwiseConv2D."""
    try:
        return model.get_layer(preferred_name)
    except ValueError:
        pass

    for layer in reversed(model.layers):
        if isinstance(layer, (tf.keras.layers.Conv2D, tf.keras.layers.DepthwiseConv2D)):
            return layer

    return None


def _get_gradcam_heatmap(
    img_array: np.ndarray,
    model,
    last_conv_layer_name: str = "top_conv",
) -> np.ndarray | None:
    """
    Compute Grad-CAM heatmap for the predicted class.

    Handles:
    - Nested EfficientNetB0 transfer-learning models
    - Flat models
    - Conv2D / DepthwiseConv2D fallback discovery

    Returns:
        2-D float32 heatmap in [0, 1], or None if Grad-CAM cannot be generated.
    """
    try:
        inputs = tf.cast(img_array, tf.float32)

        # ============================================================
        # CASE 1: Nested EfficientNetB0
        # ============================================================
        base_model = _find_nested_efficientnet(model)

        if base_model is not None:
            last_conv_layer = _find_last_conv_layer(base_model, last_conv_layer_name)
            if last_conv_layer is None:
                raise ValueError("Could not find a Conv2D or DepthwiseConv2D layer inside EfficientNetB0.")

            print(f"[GradCAM] Nested base model: {base_model.name}")
            print(f"[GradCAM] Target layer: {last_conv_layer.name}")

            feature_model = tf.keras.Model(
                inputs=base_model.input,
                outputs=[last_conv_layer.output, base_model.output],
                name="gradcam_feature_model",
            )

            base_index = None
            for i, layer in enumerate(model.layers):
                if layer is base_model:
                    base_index = i
                    break

            if base_index is None:
                raise ValueError(
                    "Nested EfficientNetB0 was found but its position inside the parent model could not be determined."
                )

            with tf.GradientTape() as tape:
                tape.watch(inputs)

                conv_outputs, base_features = feature_model(inputs, training=False)

                x = base_features
                for layer in model.layers[base_index + 1 :]:
                    if isinstance(layer, tf.keras.layers.InputLayer):
                        continue
                    x = layer(x, training=False)

                predictions = x
                predicted_class = tf.argmax(predictions[0])
                class_score = predictions[:, predicted_class]

            grads = tape.gradient(class_score, conv_outputs)

        # ============================================================
        # CASE 2: Flat / direct model
        # ============================================================
        else:
            last_conv_layer = _find_last_conv_layer(model, last_conv_layer_name)
            if last_conv_layer is None:
                raise ValueError("Could not find a suitable convolutional layer.")

            print(f"[GradCAM] Direct model target layer: {last_conv_layer.name}")

            grad_model = tf.keras.Model(
                inputs=model.inputs,
                outputs=[last_conv_layer.output, model.output],
            )

            with tf.GradientTape() as tape:
                tape.watch(inputs)
                conv_outputs, predictions = grad_model(inputs, training=False)
                predicted_class = tf.argmax(predictions[0])
                class_score = predictions[:, predicted_class]

            grads = tape.gradient(class_score, conv_outputs)

        # ============================================================
        # Validate gradient & output
        # ============================================================
        if grads is None:
            raise RuntimeError("Gradients are None. The target convolutional layer is not connected to class score.")

        if conv_outputs is None:
            raise RuntimeError("Convolution output is None.")

        print(f"[GradCAM] Conv output shape: {conv_outputs.shape}")
        print(f"[GradCAM] Gradient shape: {grads.shape}")

        # ============================================================
        # Grad-CAM calculation
        # ============================================================
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]

        raw_heatmap = tf.reduce_sum(
            conv_outputs * pooled_grads[tf.newaxis, tf.newaxis, :],
            axis=-1,
        )

        # ReLU
        heatmap = tf.maximum(raw_heatmap, 0)

        # Normalize
        max_value = float(tf.reduce_max(heatmap).numpy())
        if max_value <= 1e-8:
            # Fallback for negative gradient maps: shift min to 0
            min_val = tf.reduce_min(raw_heatmap)
            shifted = raw_heatmap - min_val
            shift_max = float(tf.reduce_max(shifted).numpy())
            if shift_max > 1e-8:
                heatmap = shifted / shift_max
            else:
                raise RuntimeError("Grad-CAM heatmap has no meaningful activation.")
        else:
            heatmap = heatmap / max_value

        heatmap = heatmap.numpy().astype(np.float32)

        # ============================================================
        # Final validation
        # ============================================================
        if heatmap.ndim != 2:
            raise RuntimeError(f"Expected 2-D heatmap, got shape {heatmap.shape}")

        if np.std(heatmap) <= 1e-8:
            raise RuntimeError("Grad-CAM heatmap has no spatial variation.")

        print(f"[GradCAM] Heatmap shape: {heatmap.shape}")
        print(f"[GradCAM] Heatmap range: {heatmap.min():.6f} - {heatmap.max():.6f}")
        print(f"[GradCAM] Heatmap std: {heatmap.std():.6f}")

        return heatmap

    except Exception as exc:
        print(f"[Grad-CAM generation failed] {type(exc).__name__}: {exc}")
        return None


def generate_gradcam_overlay(
    original_img: np.ndarray,
    model,
    alpha: float = 0.55,
    last_conv_layer_name: str = "top_conv",
) -> tuple[np.ndarray, np.ndarray, np.ndarray, float] | tuple[None, None, None, None]:
    """
    Generate original image, blended Grad-CAM overlay, raw heatmap, and affected area percentage.

    Returns:
        (original_rgb, overlay_rgb, heatmap_rgb, affected_area_percent)
        or (None, None, None, None) on failure.
    """
    try:
        if original_img.dtype != np.uint8:
            if original_img.max() <= 1.0:
                orig_uint8 = (original_img * 255).clip(0, 255).astype(np.uint8)
            else:
                orig_uint8 = original_img.clip(0, 255).astype(np.uint8)
        else:
            orig_uint8 = original_img.copy()

        H, W = orig_uint8.shape[:2]

        img_224 = cv2.resize(orig_uint8, (224, 224), interpolation=cv2.INTER_AREA)
        img_batch = np.expand_dims(img_224.astype(np.float32), axis=0)

        heatmap = _get_gradcam_heatmap(img_batch, model, last_conv_layer_name)
        if heatmap is None:
            return None, None, None, None

        # Dynamic affected area percent (pixels with activation > 0.35)
        affected_area_percent = round(float((heatmap > 0.35).mean() * 100), 1)
        if affected_area_percent < 5.0:
            affected_area_percent = round(float((heatmap > 0.2).mean() * 100), 1)
        affected_area_percent = max(5.0, min(95.0, affected_area_percent))

        heatmap_resized = cv2.resize(heatmap, (W, H), interpolation=cv2.INTER_LINEAR)
        heatmap_uint8 = np.uint8(255 * heatmap_resized)
        heatmap_bgr = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

        overlay = cv2.addWeighted(orig_uint8, 1.0 - alpha, heatmap_rgb, alpha, 0)

        difference = np.mean(np.abs(overlay.astype(np.float32) - orig_uint8.astype(np.float32)))
        print(f"[GradCAM] Overlay pixel difference: {difference:.4f}")

        if difference <= 1.0:
            print("[GradCAM] WARNING: overlay is almost identical to original image.")

        return orig_uint8, overlay, heatmap_rgb, affected_area_percent

    except Exception as exc:
        print(f"[GradCAM overlay failed] {type(exc).__name__}: {exc}")
        return None, None, None, None
