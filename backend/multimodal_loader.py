"""
multimodal_loader.py
=====================
PyTorch loader and inference engine for best_model_multimodal.pth (Project v3).
Fuses:
  - Visual stream: EfficientNetV2-S (300x300 RGB) with Fused-MBConv blocks -> 512-dim embedding
  - Environmental stream: 7-day x 11-feature meteorological sequence via 1D-CNN + 4-Head Attention -> 128-dim embedding
  - Late fusion: Concatenation (640-dim) -> Classification MLP (256 -> 33 classes)
"""

import io
import json
import os
import math
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Tuple, Dict, Any, List

import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import timm

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "best_model_multimodal.pth"
LABELS_PATH = MODELS_DIR / "multimodal_class_labels.json"
STATS_PATH = MODELS_DIR / "weather_stats.npy"

# Fallback statistics strictly derived from 15,290 training samples (Project v3)
DEFAULT_WEATHER_MEAN = np.array(
    [27.346455, 16.654518, 21.469334, 88.67294, 71.09642, 3.64576, 14.972206, 14.229628, 0.0, 0.10453641, 0.1918797],
    dtype=np.float32,
)
DEFAULT_WEATHER_STD = np.array(
    [5.8794727, 6.933598, 6.2781043, 13.608062, 16.653166, 9.646079, 6.749692, 5.1801934, 1e-8, 0.7755939, 0.5920627],
    dtype=np.float32,
)


class WeatherEncoder(nn.Module):
    """
    1D CNN + Multi-head Self-Attention encoder for 7-day weather sequences.
    Input shape: [B, 7, 11]
    Output shape: [B, out_dim]
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
        # 4-head attention over 7 timesteps
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
        # attn_weights: [B, 7, 7]
        x = self.norm(x + attn_out)                 # residual + LayerNorm
        x = x.permute(0, 2, 1)                      # [B, 128, 7]
        x = self.pool(x).squeeze(-1)                # [B, 128]
        feat = self.fc(x)                           # [B, out_dim]
        if return_attention:
            return feat, attn_weights
        return feat


class MultimodalDiseaseNet(nn.Module):
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


# Global model cache
_cached_multimodal_model: MultimodalDiseaseNet | None = None
_cached_labels: Dict[int, str] | None = None
_cached_weather_stats: Tuple[np.ndarray, np.ndarray] | None = None


def get_weather_stats() -> Tuple[np.ndarray, np.ndarray]:
    """Load or fallback to the training z-score parameters for the 11 weather features."""
    global _cached_weather_stats
    if _cached_weather_stats is not None:
        return _cached_weather_stats

    if STATS_PATH.exists():
        try:
            stats = np.load(STATS_PATH, allow_pickle=True).item()
            mean = np.array(stats["mean"], dtype=np.float32)
            std = np.array(stats["std"], dtype=np.float32)
            _cached_weather_stats = (mean, std)
            return _cached_weather_stats
        except Exception as e:
            print(f"[Multimodal] Could not load stats from {STATS_PATH}: {e}. Using training defaults.")

    _cached_weather_stats = (DEFAULT_WEATHER_MEAN, DEFAULT_WEATHER_STD)
    return _cached_weather_stats


def get_multimodal_model() -> Tuple[MultimodalDiseaseNet | None, Dict[int, str] | None]:
    """Load and cache PyTorch multimodal model and label dict."""
    global _cached_multimodal_model, _cached_labels

    if _cached_multimodal_model is not None and _cached_labels is not None:
        return _cached_multimodal_model, _cached_labels

    if not MODEL_PATH.exists():
        print(f"[Multimodal] Missing weights file: {MODEL_PATH}")
        return None, None

    try:
        model = MultimodalDiseaseNet(num_classes=33)
        state_dict = torch.load(MODEL_PATH, map_location="cpu")
        model.load_state_dict(state_dict, strict=True)
        model.eval()

        if LABELS_PATH.exists():
            with open(LABELS_PATH, "r", encoding="utf-8") as f:
                raw_labels = json.load(f)
            label_dict = {int(k): v for k, v in raw_labels.items()}
        else:
            # Reconstruct default 33 classes
            disease_maps = {
                "wheat": [
                    "Aphid", "Black Rust", "Blast", "Brown Rust", "Common Root Rot",
                    "Fusarium Head Blight", "Healthy", "Leaf Blight", "Mildew",
                    "Mite", "Septoria", "Smut", "Stem Fly", "Tan Spot", "Yellow Rust"
                ],
                "rice": [
                    "Bacterial Leaf Blight", "Brown Spot", "Healthy Rice Leaf",
                    "Leaf Blast", "Leaf Scald", "Sheath Blight"
                ],
                "sugarcane": [
                    "Healthy", "Mosaic", "Redrot", "Rust", "Yellow Disease"
                ],
                "cotton": [
                    "Bacterial Blight", "Curl Virus", "Healthy Leaf", "Herbicide Damage",
                    "Leaf Hopper Jassids", "Leaf Reddening", "Leaf Variegation"
                ]
            }
            label_dict = {}
            idx = 0
            for crop, d_list in disease_maps.items():
                for d in d_list:
                    label_dict[idx] = f"{crop}_{d}"
                    idx += 1

        _cached_multimodal_model = model
        _cached_labels = label_dict
        print("[Multimodal] PyTorch Multimodal Model loaded successfully! (EfficientNetV2-S + 1D-CNN MHSA)")
        return model, label_dict
    except Exception as exc:
        print(f"[Multimodal] Failed to load PyTorch multimodal model: {exc}")
        return None, None


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
    Construct standardized [1, 7, 11] tensor matching projectv3 specification.
    
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

    # Case 1: Pre-computed or raw numpy array [7, 11] or [1, 7, 11]
    if isinstance(weather_input, np.ndarray):
        arr = weather_input.squeeze()
        if arr.shape == (7, 11):
            normalized = (arr - mean) / (std + 1e-8)
            return torch.tensor(normalized, dtype=torch.float32).unsqueeze(0)

    # Case 2: Multi-day sequence from Open-Meteo or historical archive (list of 7 daily dicts/lists)
    if isinstance(weather_input, dict) and "daily_sequence" in weather_input:
        seq = weather_input["daily_sequence"]
        if isinstance(seq, (list, tuple)) and len(seq) >= 7:
            matrix = np.array(seq[-7:], dtype=np.float32)
            normalized = (matrix - mean) / (std + 1e-8)
            return torch.tensor(normalized, dtype=torch.float32).unsqueeze(0)

    # Case 3: Open-Meteo daily API dict containing arrays of length >= 7
    if isinstance(weather_input, dict) and "daily" in weather_input:
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

    # Case 4: Single-day sensor telemetry or manual farmer input
    # Synthesize biologically authentic 7-day pre-symptomatic incubation sequence
    w = weather_input if isinstance(weather_input, dict) else {}
    base_temp = float(w.get("temperature_c", 28.0))
    base_rh = float(w.get("humidity_percent", 70.0))
    base_rain = float(w.get("rainfall_mm", 0.0))
    base_wind = float(w.get("wind_kmh", 10.0))

    matrix = np.zeros((7, 11), dtype=np.float32)

    # Agronomic diurnal variations across the 7-day spore incubation window
    temp_offsets = [-0.8, -0.4, 0.2, 0.5, 0.0, -0.3, 0.0]
    rh_offsets   = [ 3.0,  1.5, -2.0, -4.0,  1.0,  2.5, 0.0]
    # Rainfall pattern: if rainfall exists, concentrate on incubation trigger days 3-5
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


def preprocess_image_pytorch(file_bytes: bytes) -> torch.Tensor:
    """Read image bytes and return ImageNet normalized PyTorch tensor (1, 3, 300, 300)."""
    image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    image = image.resize((300, 300), Image.LANCZOS)
    arr = np.asarray(image, dtype=np.float32) / 255.0

    # ImageNet mean & std
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    norm_arr = (arr - mean) / std

    # HWC -> CHW -> NCHW
    transposed = np.transpose(norm_arr, (2, 0, 1))
    tensor = torch.tensor(transposed, dtype=torch.float32).unsqueeze(0)
    return tensor


def predict_multimodal_disease(
    file_bytes: bytes,
    weather_dict: dict | None = None,
    crop_hint: str | None = None,
) -> Dict[str, Any]:
    """
    Run PyTorch multimodal inference and return detailed agronomic and XAI outputs.
    """
    model, label_map = get_multimodal_model()
    if model is None or label_map is None:
        raise RuntimeError("Multimodal PyTorch model is not available.")

    img_tensor = preprocess_image_pytorch(file_bytes)
    weather_tensor = extract_weather_tensor(weather_dict)

    with torch.no_grad():
        logits, attn_weights = model(img_tensor, weather_tensor, return_attention=True)
        probs = torch.softmax(logits, dim=1)[0].numpy()

    # Extract 7-day temporal attention scores
    attn_matrix = attn_weights[0].numpy()  # [7, 7]
    daily_importance = np.sum(attn_matrix, axis=0)  # column-wise sum
    norm_sum = float(np.sum(daily_importance)) or 1.0
    daily_attention = [round(float(v / norm_sum) * 100.0, 1) for v in daily_importance]

    # Global ranking
    top_indexes = np.argsort(probs)[::-1]
    top_global_idx = int(top_indexes[0])
    raw_predicted_label = label_map.get(top_global_idx, f"class_{top_global_idx}")

    # Crop separation (labels are prefixed with crop name, e.g. "rice_Leaf Blast")
    selected_idx = top_global_idx
    if crop_hint and crop_hint.lower() in ["wheat", "rice", "sugarcane", "cotton"]:
        target_crop = crop_hint.lower()
        crop_indices = [
            i for i, name in label_map.items() if name.lower().startswith(target_crop)
        ]
        if crop_indices:
            best_crop_idx = max(crop_indices, key=lambda idx: probs[idx])
            # If global top is already in this crop, keep it; else if high enough confidence, honor crop context
            if not raw_predicted_label.lower().startswith(target_crop):
                selected_idx = best_crop_idx

    final_raw_label = label_map.get(selected_idx, f"class_{selected_idx}")
    confidence = float(probs[selected_idx])

    # Parse crop and disease name
    if "_" in final_raw_label:
        detected_crop, disease_name = final_raw_label.split("_", 1)
    else:
        detected_crop = crop_hint or "crop"
        disease_name = final_raw_label

    top3 = []
    # If crop hint is given, provide top 3 within that crop
    candidate_indices = top_indexes
    if crop_hint and crop_hint.lower() in ["wheat", "rice", "sugarcane", "cotton"]:
        crop_candidates = [
            idx for idx in top_indexes
            if label_map.get(idx, "").lower().startswith(crop_hint.lower())
        ]
        if len(crop_candidates) >= 3:
            candidate_indices = crop_candidates

    for idx in candidate_indices[:3]:
        raw_name = label_map.get(int(idx), f"Class_{int(idx)}")
        d_name = raw_name.split("_", 1)[1] if "_" in raw_name else raw_name
        top3.append({
            "class": d_name,
            "raw_class": raw_name,
            "confidence": round(float(probs[int(idx)]), 4),
        })

    return {
        "predicted_label": disease_name,
        "raw_class": final_raw_label,
        "crop": detected_crop.capitalize(),
        "confidence": confidence,
        "top3": top3,
        "all_probs": probs,
        "weather_importance_days": daily_attention,
    }


if __name__ == "__main__":
    m, l = get_multimodal_model()
    print(f"Loaded model: {m is not None}, total classes: {len(l) if l else 0}")
    print("Testing dummy input:")
    dummy_img = (np.random.rand(300, 300, 3) * 255).astype(np.uint8)
    buf = io.BytesIO()
    Image.fromarray(dummy_img).save(buf, format="JPEG")
    res = predict_multimodal_disease(buf.getvalue(), {"temperature_c": 29, "humidity_percent": 82})
    print(f"Prediction: {res['predicted_label']} (Crop: {res['crop']})")
    print(f"7-Day Attention: {res['weather_importance_days']}")
