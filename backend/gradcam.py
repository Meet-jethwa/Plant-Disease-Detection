"""
gradcam.py
===========
Generates Grad-CAM heatmap overlays for EfficientNetB0 models.
The last convolutional layer inside EfficientNetB0 is 'top_conv'.
"""

import numpy as np
import cv2
import tensorflow as tf


def _get_gradcam_heatmap(img_array: np.ndarray, model, last_conv_layer_name: str = "top_conv") -> np.ndarray | None:
    """
    Compute the Grad-CAM heatmap for the top predicted class.

    Args:
        img_array : float32 array of shape (1, 224, 224, 3), pixel values 0-255
        model     : loaded Keras model (EfficientNetB0 transfer-learning)
        last_conv_layer_name : name of the last conv layer inside the base model

    Returns:
        heatmap as a 2-D float32 array in [0, 1], or None on failure
    """
    # Locate the EfficientNetB0 sub-model
    base_model = None
    for layer in model.layers:
        if "efficientnetb0" in layer.name.lower():
            base_model = layer
            break

    if base_model is None:
        return None

    last_conv_layer = None
    try:
        last_conv_layer = base_model.get_layer(last_conv_layer_name)
    except ValueError:
        # Fallback: find the last Conv2D or DepthwiseConv2D layer by scanning.
        # EfficientNetB0 uses both Conv2D (top_conv) and DepthwiseConv2D blocks.
        for layer in reversed(base_model.layers):
            if isinstance(layer, (tf.keras.layers.Conv2D, tf.keras.layers.DepthwiseConv2D)):
                last_conv_layer = layer
                break

    if last_conv_layer is None:
        return None

    # Build a sub-model: input → (last_conv_output, final_predictions).
    # Some exported/stacked models expose a last conv tensor that is not connected
    # to the top-level model input graph. In that case, Grad-CAM is unavailable.
    try:
        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[last_conv_layer.output, model.output],
        )
    except Exception:
        return None

    try:
        inputs = tf.cast(img_array, tf.float32)
        # IMPORTANT: tape.watch must be set up BEFORE the forward pass produces the
        # tensor we want to differentiate with respect to.  We watch `inputs` so the
        # full computation graph (inputs → conv_outputs → predictions) is recorded,
        # then ask for d(loss)/d(conv_outputs).
        with tf.GradientTape() as tape:
            tape.watch(inputs)
            conv_outputs, predictions = grad_model(inputs, training=False)
            top_class_idx = tf.argmax(predictions[0])
            loss = predictions[:, top_class_idx]

        # Gradients of the top class score w.r.t. last conv layer output
        grads = tape.gradient(loss, conv_outputs)  # (1, H, W, C)
    except Exception:
        return None

    if grads is None:
        return None

    # Global Average Pooling of gradients → per-channel importance
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))  # (C,)

    # Weight each channel map by its importance
    conv_outputs = conv_outputs[0]                           # (H, W, C)
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]  # (H, W, 1)
    heatmap = tf.squeeze(heatmap)                           # (H, W)

    # Guard against scalar result (edge case with 1x1 feature maps)
    if heatmap.shape.rank == 0:
        return None

    # ReLU + normalise to [0, 1]
    heatmap = tf.maximum(heatmap, 0)
    max_val = tf.reduce_max(heatmap)
    if max_val > 1e-8:
        heatmap = heatmap / max_val
    else:
        # All activations are zero or negligible — heatmap would be blank
        return None

    return heatmap.numpy()


def generate_gradcam_overlay(
    original_img: np.ndarray,
    model,
    alpha: float = 0.45,
    last_conv_layer_name: str = "top_conv",
) -> tuple[np.ndarray, np.ndarray] | tuple[None, None]:
    """
    Generate the original image and the Grad-CAM overlay.

    Args:
        original_img : uint8 or float HxWx3 RGB image (any scale)
        model        : loaded Keras model
        alpha        : blend factor for heatmap (0 = only original, 1 = only heatmap)
        last_conv_layer_name : last conv layer inside EfficientNetB0

    Returns:
        (original_rgb, overlay_rgb) both as uint8 (H, W, 3) arrays
        or (None, None) on failure
    """
    # Normalise original to uint8
    if original_img.dtype != np.uint8:
        if original_img.max() <= 1.0:
            orig_uint8 = (original_img * 255).astype(np.uint8)
        else:
            orig_uint8 = original_img.astype(np.uint8)
    else:
        orig_uint8 = original_img.copy()

    H, W = orig_uint8.shape[:2]

    # Prepare model input: resize to 224x224
    img_224 = cv2.resize(orig_uint8, (224, 224))
    img_batch = np.expand_dims(img_224.astype(np.float32), axis=0)

    heatmap = _get_gradcam_heatmap(img_batch, model, last_conv_layer_name)
    if heatmap is None:
        return None, None

    # Resize heatmap to original image size
    heatmap_resized = cv2.resize(heatmap, (W, H))

    # Colorise heatmap (JET colormap: blue=low, red=high)
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    heatmap_bgr   = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_rgb   = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

    # Blend with original
    overlay = cv2.addWeighted(orig_uint8, 1.0 - alpha, heatmap_rgb, alpha, 0)

    return orig_uint8, overlay
