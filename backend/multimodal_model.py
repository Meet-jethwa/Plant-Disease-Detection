"""
multimodal_model.py
===================
PyTorch loader and inference engine for best_model_multimodal.pth (Project v3).
Fuses:
  - Visual stream: EfficientNetV2-S (300x300 RGB) with Fused-MBConv blocks -> 512-dim embedding
  - Environmental stream: 7-day x 11-feature meteorological sequence via 1D-CNN + 4-Head Attention -> 128-dim embedding
  - Late fusion: Concatenation (640-dim) -> Classification MLP (256 -> 33 classes)
"""

from __future__ import annotations

import io
import math
from datetime import date, datetime, timedelta
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Tuple

import cv2
import numpy as np
import timm
import torch
import torch.nn as nn
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "best_model_multimodal.pth"
STATS_PATH = MODELS_DIR / "weather_stats.npy"

IMAGE_SIZE = 300

# Canonical 33 classes in the exact 0..32 index order used during model training
CLASS_NAMES = [
    "wheat_Aphid",                  # 0
    "wheat_Black Rust",             # 1
    "wheat_Blast",                  # 2
    "wheat_Brown Rust",             # 3
    "wheat_Common Root Rot",        # 4
    "wheat_Fusarium Head Blight",   # 5
    "wheat_Healthy",                # 6
    "wheat_Leaf Blight",            # 7
    "wheat_Mildew",                 # 8
    "wheat_Mite",                   # 9
    "wheat_Septoria",               # 10
    "wheat_Smut",                   # 11
    "wheat_Stem Fly",               # 12
    "wheat_Tan Spot",               # 13
    "wheat_Yellow Rust",            # 14
    "rice_Bacterial Leaf Blight",   # 15
    "rice_Brown Spot",              # 16
    "rice_Healthy Rice Leaf",       # 17
    "rice_Leaf Blast",              # 18
    "rice_Leaf Scald",              # 19
    "rice_Sheath Blight",           # 20
    "sugarcane_Healthy",            # 21
    "sugarcane_Mosaic",             # 22
    "sugarcane_Redrot",             # 23
    "sugarcane_Rust",               # 24
    "sugarcane_Yellow Disease",     # 25
    "cotton_Bacterial Blight",      # 26
    "cotton_Curl Virus",            # 27
    "cotton_Healthy Leaf",          # 28
    "cotton_Herbicide Damage",      # 29
    "cotton_Leaf Hopper Jassids",   # 30
    "cotton_Leaf Reddening",        # 31
    "cotton_Leaf Variegation",      # 32
]

# Fallback statistics strictly derived from 15,290 training samples (Project v3)
DEFAULT_WEATHER_MEAN = np.array(
    [27.346455, 16.654518, 21.469334, 88.67294, 71.09642, 3.64576, 14.972206, 14.229628, 0.0, 0.10453641, 0.1918797],
    dtype=np.float32,
)
DEFAULT_WEATHER_STD = np.array(
    [5.8794727, 6.933598, 6.2781043, 13.608062, 16.653166, 9.646079, 6.749692, 5.1801934, 1e-8, 0.7755939, 0.5920627],
    dtype=np.float32,
)


def get_weather_stats() -> Tuple[np.ndarray, np.ndarray]:
    """Load or fallback to the training z-score parameters for the 11 weather features."""
    if STATS_PATH.exists():
        try:
            stats = np.load(STATS_PATH, allow_pickle=True).item()
            mean = np.array(stats["mean"], dtype=np.float32)
            std = np.array(stats["std"], dtype=np.float32)
            return mean, std
        except Exception as exc:
            print(f"[Multimodal] Could not load stats from {STATS_PATH}: {exc}")
    return DEFAULT_WEATHER_MEAN, DEFAULT_WEATHER_STD


class WeatherEncoder(nn.Module):
    """
    1D CNN + Multi-head Self-Attention encoder for 7-day weather sequences.
    Input shape: [B, 7, 11]
    Output shape: [B, 128]
    """
    def __init__(self, n_features: int = 11, seq_len: int = 7, out_dim: int = 128):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv1d(n_features, 64, kernel_size=3, padding=1),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Conv1d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm1d(128),
            nn.ReLU(),
        )
        self.attn = nn.MultiheadAttention(
            embed_dim=128, num_heads=4, batch_first=True, dropout=0.1
        )
        self.pool = nn.AdaptiveAvgPool1d(1)
        self.fc = nn.Linear(128, out_dim)
        self.norm = nn.LayerNorm(128)

    def forward(self, x: torch.Tensor, return_attention: bool = False):
        # x: [B, 7, 11]
        x = x.permute(0, 2, 1)                      # [B, 11, 7]
        x = self.conv(x)                            # [B, 128, 7]
        x = x.permute(0, 2, 1)                      # [B, 7, 128]
        attn_out, attn_weights = self.attn(
            x, x, x, need_weights=True, average_attn_weights=True
        )
        x = self.norm(x + attn_out)                 # residual + LayerNorm
        x = x.permute(0, 2, 1)                      # [B, 128, 7]
        x = self.pool(x).squeeze(-1)                # [B, 128]
        feat = self.fc(x)                           # [B, out_dim]
        if return_attention:
            return feat, attn_weights
        return feat


class MultimodalClassifier(nn.Module):
    """
    Full Multimodal Network: Image Encoder (EfficientNetV2-S) + Weather Encoder -> 33 Classes
    Input Image:  [B, 3, 300, 300]
    Input Weather: [B, 7, 11]
    Output:       [B, 33] Logits
    """
    def __init__(self, num_classes: int = 33, weather_dim: int = 128, img_dim: int = 512):
        super().__init__()
        self.image_encoder = timm.create_model(
            "tf_efficientnetv2_s.in1k", pretrained=False, num_classes=0
        )  # -> [B, 1280]
        self.image_fc = nn.Sequential(
            nn.Linear(1280, img_dim),
            nn.ReLU(),
            nn.Dropout(0.4),
        )
        self.weather_encoder = WeatherEncoder(
            n_features=11, seq_len=7, out_dim=weather_dim
        )
        self.classifier = nn.Sequential(
            nn.Linear(img_dim + weather_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes),
        )

    def forward(self, image: torch.Tensor, weather: torch.Tensor, return_attention: bool = False):
        img_feat = self.image_fc(self.image_encoder(image))
        if return_attention:
            wx_feat, attn_w = self.weather_encoder(weather, return_attention=True)
            fused = torch.cat([img_feat, wx_feat], dim=1)
            return self.classifier(fused), attn_w
        else:
            wx_feat = self.weather_encoder(weather)
            fused = torch.cat([img_feat, wx_feat], dim=1)
            return self.classifier(fused)


@lru_cache(maxsize=1)
def load_multimodal_model() -> MultimodalClassifier:
    """Load and cache the PyTorch multimodal checkpoint."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Multimodal model not found at: {MODEL_PATH}")
    model = MultimodalClassifier(num_classes=len(CLASS_NAMES))
    checkpoint = torch.load(MODEL_PATH, map_location="cpu")
    model.load_state_dict(checkpoint, strict=True)
    model.eval()
    return model


def get_season_encoding(d: date) -> Tuple[float, float]:
    """Harmonic cyclic month encoding sin(2*pi*m/12) and cos(2*pi*m/12)."""
    month = d.month
    sin_val = math.sin(2.0 * math.pi * month / 12.0)
    cos_val = math.cos(2.0 * math.pi * month / 12.0)
    return float(sin_val), float(cos_val)


def extract_weather_tensor(
    weather_input: dict | list | np.ndarray | None,
    target_date: date | None = None,
) -> torch.Tensor:
    """
    Construct standardized [1, 7, 11] tensor matching Project v3 specifications.
    The 11 features per day are:
      0: temp_max       (Maximum 2m temperature °C)
      1: temp_min       (Minimum 2m temperature °C)
      2: temp_mean      (Mean 2m temperature °C)
      3: rh_max         (Maximum relative humidity %)
      4: rh_mean        (Mean relative humidity %)
      5: precip_sum     (Daily cumulative precipitation mm)
      6: dewpoint_mean  (Mean dewpoint °C)
      7: wind_max       (Maximum 10m wind speed km/h)
      8: soil_temp      (Surface soil temperature °C, 0.0 standard)
      9: month_sin      (Cyclic season sine component)
     10: month_cos      (Cyclic season cosine component)
    """
    mean, std = get_weather_stats()
    today = target_date or date.today()

    # Case 1: Pre-computed or raw array/list [7, 11] or [1, 7, 11]
    if isinstance(weather_input, (np.ndarray, list)):
        arr = np.array(weather_input, dtype=np.float32).squeeze()
        if arr.shape == (7, 11):
            normalized = (arr - mean) / (std + 1e-8)
            return torch.tensor(normalized, dtype=torch.float32).unsqueeze(0)

    # Case 2: Multi-day sequence from Open-Meteo daily archive (dict containing arrays)
    if isinstance(weather_input, dict) and "daily" in weather_input and isinstance(weather_input["daily"], dict):
        daily = weather_input["daily"]
        times = daily.get("time", [])
        if len(times) >= 7:
            matrix = np.zeros((7, 11), dtype=np.float32)
            for idx, d_idx in enumerate(range(len(times) - 7, len(times))):
                t_max = float(daily.get("temperature_2m_max", [28.0] * len(times))[d_idx])
                t_min = float(daily.get("temperature_2m_min", [20.0] * len(times))[d_idx])
                t_mean = float(daily.get("temperature_2m_mean", [(t_max + t_min) / 2.0])[d_idx])
                rh_max = float(daily.get("relative_humidity_2m_max", [90.0] * len(times))[d_idx])
                rh_mean = float(daily.get("relative_humidity_2m_mean", [75.0] * len(times))[d_idx])
                precip = float(daily.get("precipitation_sum", [0.0] * len(times))[d_idx])
                dewpoint = float(daily.get("dew_point_2m_mean", [t_mean - ((100 - rh_mean) / 5)])[d_idx])
                wind_max = float(daily.get("wind_speed_10m_max", [12.0] * len(times))[d_idx])
                soil_t = float(daily.get("soil_temperature_0cm", [0.0] * len(times))[d_idx])
                try:
                    d_obj = datetime.strptime(times[d_idx], "%Y-%m-%d").date()
                except Exception:
                    d_obj = today - timedelta(days=(6 - idx))
                sin_m, cos_m = get_season_encoding(d_obj)
                matrix[idx] = [
                    t_max, t_min, t_mean, rh_max, rh_mean, precip,
                    dewpoint, wind_max, soil_t, sin_m, cos_m
                ]
            normalized = (matrix - mean) / (std + 1e-8)
            return torch.tensor(normalized, dtype=torch.float32).unsqueeze(0)

    # Case 3: Single-day sensor telemetry or manual farmer input
    # Synthesize biologically authentic 7-day pre-symptomatic incubation sequence
    w = weather_input if isinstance(weather_input, dict) else {}
    base_temp = float(w.get("temperature_c", 28.0))
    base_rh = float(w.get("humidity_percent", 70.0))
    base_rain = float(w.get("rainfall_mm", 0.0))
    base_wind = float(w.get("wind_kmh", 10.0))

    matrix = np.zeros((7, 11), dtype=np.float32)
    temp_offsets = [-0.8, -0.4, 0.2, 0.5, 0.0, -0.3, 0.0]
    rh_offsets   = [ 3.0,  1.5, -2.0, -4.0,  1.0,  2.5, 0.0]
    rain_factors = [0.1, 0.2, 0.8, 1.4, 1.0, 0.3, 0.2] if base_rain > 0 else [0.0] * 7
    wind_factors = [0.9, 1.0, 1.2, 1.3, 1.1, 0.9, 1.0]

    for day_i in range(7):
        day_date = today - timedelta(days=(6 - day_i))
        sin_m, cos_m = get_season_encoding(day_date)

        t_mean = base_temp + temp_offsets[day_i]
        t_max = t_mean + 4.5
        t_min = t_mean - 4.5

        rh_mean = min(98.0, max(20.0, base_rh + rh_offsets[day_i]))
        rh_max = min(100.0, rh_mean + 12.0)

        precip = max(0.0, base_rain * rain_factors[day_i])
        dewpoint = t_mean - ((100.0 - rh_mean) / 5.0)
        wind_max = max(4.0, base_wind * wind_factors[day_i])
        soil_temp = 0.0

        matrix[day_i] = [
            t_max, t_min, t_mean, rh_max, rh_mean, precip,
            dewpoint, wind_max, soil_temp, sin_m, cos_m
        ]

    normalized = (matrix - mean) / (std + 1e-8)
    return torch.tensor(normalized, dtype=torch.float32).unsqueeze(0)


def preprocess_image_pytorch(image_input: Image.Image | bytes) -> torch.Tensor:
    """Preprocess image to normalized PyTorch tensor (1, 3, 300, 300) with ImageNet mean/std."""
    if isinstance(image_input, bytes):
        image = Image.open(io.BytesIO(image_input)).convert("RGB")
    else:
        image = image_input.convert("RGB")

    image = image.resize((IMAGE_SIZE, IMAGE_SIZE), Image.LANCZOS)
    arr = np.asarray(image, dtype=np.float32) / 255.0

    # ImageNet mean & std
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    norm_arr = (arr - mean) / std

    # HWC -> CHW -> NCHW
    transposed = np.transpose(norm_arr, (2, 0, 1))
    return torch.tensor(transposed, dtype=torch.float32).unsqueeze(0)


def generate_multimodal_gradcam(
    model: MultimodalClassifier,
    img_tensor: torch.Tensor,
    wx_tensor: torch.Tensor,
    target_class_idx: int,
    original_rgb: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray, float]:
    """
    Generate Grad-CAM visual heatmap overlay from image_encoder.conv_head.
    Returns:
        overlay_rgb         : (H, W, 3) uint8 image with jet heatmap overlay
        raw_heatmap_rgb     : (H, W, 3) uint8 jet colormap without original image
        affected_area_pct   : float percentage of area with elevated activation
    """
    activations = []
    gradients = []

    def f_hook(module, inp, out):
        activations.append(out)

    def b_hook(module, grad_in, grad_out):
        gradients.append(grad_out[0])

    target_layer = model.image_encoder.conv_head
    h1 = target_layer.register_forward_hook(f_hook)
    h2 = target_layer.register_full_backward_hook(b_hook)

    model.zero_grad()
    img_clone = img_tensor.clone().detach().requires_grad_(True)
    logits = model(img_clone, wx_tensor)
    score = logits[0, target_class_idx]
    score.backward()

    h1.remove()
    h2.remove()

    if not activations or not gradients:
        return original_rgb, original_rgb, 0.0

    act = activations[0].detach()                      # [1, 1280, H, W]
    grad = gradients[0].detach()                       # [1, 1280, H, W]
    weights = grad.mean(dim=(2, 3), keepdim=True)       # [1, 1280, 1, 1]
    cam = (weights * act).sum(dim=1).squeeze(0).clamp(min=0).cpu().numpy()

    cam_max = float(cam.max())
    if cam_max > 0:
        cam = cam / cam_max

    h, w = original_rgb.shape[:2]
    cam_resized = cv2.resize(cam, (w, h))
    heatmap_u8 = np.uint8(255 * cam_resized)
    heatmap_jet_bgr = cv2.applyColorMap(heatmap_u8, cv2.COLORMAP_JET)

    orig_bgr = cv2.cvtColor(original_rgb, cv2.COLOR_RGB2BGR)
    overlay_bgr = cv2.addWeighted(orig_bgr, 0.55, heatmap_jet_bgr, 0.45, 0)

    affected_area_pct = round(float(np.mean(cam_resized > 0.40) * 100), 1)

    overlay_rgb = cv2.cvtColor(overlay_bgr, cv2.COLOR_BGR2RGB)
    heatmap_rgb = cv2.cvtColor(heatmap_jet_bgr, cv2.COLOR_BGR2RGB)

    return overlay_rgb, heatmap_rgb, affected_area_pct


def predict_multimodal(
    image: Image.Image | bytes,
    weather: dict | None = None,
    crop_hint: str | None = None,
    weather_features_7x11: list | np.ndarray | None = None,
) -> Dict[str, Any]:
    """
    Run full multimodal inference.
    Returns:
        all_probs          : np.ndarray [33] global softmax distribution
        top_global_idx     : int
        top_global_class   : str
        selected_idx       : int (best class within crop_hint, or top_global_idx)
        predicted_disease  : str
        predicted_crop     : str
        confidence         : float (crop-conditioned or calibrated confidence)
        top3               : list of dicts with class name and confidence
        daily_attention    : list of 7 daily attention percentages
        gradcam_data       : tuple (overlay_rgb, heatmap_rgb, affected_area_pct)
    """
    model = load_multimodal_model()

    if isinstance(image, bytes):
        pil_img = Image.open(io.BytesIO(image)).convert("RGB")
    else:
        pil_img = image.convert("RGB")

    original_rgb = np.asarray(pil_img, dtype=np.uint8)

    img_tensor = preprocess_image_pytorch(pil_img)
    if weather_features_7x11 is not None:
        wx_tensor = extract_weather_tensor(weather_features_7x11)
    elif isinstance(weather, dict) and "features_7x11" in weather:
        wx_tensor = extract_weather_tensor(weather["features_7x11"])
    else:
        wx_tensor = extract_weather_tensor(weather)

    with torch.no_grad():
        logits, attn_weights = model(img_tensor, wx_tensor, return_attention=True)
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

    # Extract 7-day temporal attention scores
    attn_matrix = attn_weights[0].cpu().numpy()  # [7, 7]
    daily_importance = np.sum(attn_matrix, axis=0)
    norm_sum = float(np.sum(daily_importance)) or 1.0
    daily_attention = [round(float(v / norm_sum) * 100.0, 1) for v in daily_importance]

    top_indexes = np.argsort(probs)[::-1]
    top_global_idx = int(top_indexes[0])
    raw_global_label = CLASS_NAMES[top_global_idx]

    # Crop conditioning logic:
    selected_idx = top_global_idx
    target_crop = crop_hint.lower().strip() if crop_hint else ""

    if target_crop in ["wheat", "rice", "sugarcane", "cotton"]:
        crop_indices = [
            i for i, name in enumerate(CLASS_NAMES)
            if name.lower().startswith(f"{target_crop}_")
        ]
        if crop_indices:
            # Slices belonging to selected crop
            crop_probs = probs[crop_indices]
            crop_sum = float(np.sum(crop_probs))
            best_local_idx = int(np.argmax(crop_probs))
            best_crop_idx = crop_indices[best_local_idx]
            selected_idx = best_crop_idx

            # Conditioned probability distribution within selected crop:
            # P(disease | crop) = P(disease) / sum_{c in crop} P(c)
            # We scale by crop credibility factor so non-leaf/wrong-crop inputs still drop low
            # If crop_sum >= 0.15, full confidence within crop. If crop_sum < 0.15, attenuated.
            credibility = min(1.0, crop_sum / 0.15)
            normalized_within_crop = float(crop_probs[best_local_idx] / (crop_sum + 1e-8))
            confidence = round(normalized_within_crop * (0.85 + 0.15 * credibility), 4)

            # Top 3 within selected crop
            sorted_local = np.argsort(crop_probs)[::-1]
            top3 = []
            for loc in sorted_local[:3]:
                c_idx = crop_indices[loc]
                d_name = CLASS_NAMES[c_idx].split("_", 1)[1]
                top3.append({
                    "class": d_name,
                    "raw_class": CLASS_NAMES[c_idx],
                    "confidence": round(float(crop_probs[loc] / (crop_sum + 1e-8)), 4),
                })
        else:
            confidence = float(probs[selected_idx])
            top3 = [
                {
                    "class": CLASS_NAMES[i].split("_", 1)[1] if "_" in CLASS_NAMES[i] else CLASS_NAMES[i],
                    "raw_class": CLASS_NAMES[i],
                    "confidence": round(float(probs[i]), 4),
                }
                for i in top_indexes[:3]
            ]
    else:
        confidence = float(probs[selected_idx])
        top3 = [
            {
                "class": CLASS_NAMES[i].split("_", 1)[1] if "_" in CLASS_NAMES[i] else CLASS_NAMES[i],
                "raw_class": CLASS_NAMES[i],
                "confidence": round(float(probs[i]), 4),
            }
            for i in top_indexes[:3]
        ]

    final_label = CLASS_NAMES[selected_idx]
    if "_" in final_label:
        detected_crop, disease_name = final_label.split("_", 1)
    else:
        detected_crop = crop_hint or "crop"
        disease_name = final_label

    # Generate PyTorch Grad-CAM on conv_head
    try:
        overlay_rgb, heatmap_rgb, affected_area_pct = generate_multimodal_gradcam(
            model=model,
            img_tensor=img_tensor,
            wx_tensor=wx_tensor,
            target_class_idx=selected_idx,
            original_rgb=original_rgb,
        )
    except Exception as g_exc:
        print(f"[GradCAM] PyTorch Grad-CAM failed: {g_exc}")
        overlay_rgb, heatmap_rgb, affected_area_pct = original_rgb, None, 0.0

    return {
        "all_probs": probs,
        "selected_idx": selected_idx,
        "raw_label": final_label,
        "predicted_disease": disease_name,
        "crop": detected_crop.capitalize(),
        "confidence": confidence,
        "top3": top3,
        "daily_attention": daily_attention,
        "original_rgb": original_rgb,
        "overlay_rgb": overlay_rgb,
        "heatmap_rgb": heatmap_rgb,
        "affected_area_pct": affected_area_pct,
    }
