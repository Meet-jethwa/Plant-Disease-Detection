"""PyTorch loader and inference helpers for the multimodal checkpoint."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import timm
from PIL import Image


MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "best_model_multimodal.pth"
IMAGE_SIZE = 224

# The checkpoint was trained with these canonical, crop-prefixed labels.
CLASS_NAMES = [
    "wheat_Yellow Rust", "wheat_Brown Rust", "wheat_Black Rust",
    "wheat_Mildew", "wheat_Septoria", "wheat_Tan Spot",
    "wheat_Fusarium Head Blight", "wheat_Smut", "wheat_Aphid",
    "wheat_Mite", "wheat_Blast", "wheat_Common Root Rot",
    "wheat_Stem Fly", "wheat_Leaf Blight", "wheat_Healthy",
    "rice_Leaf Blast", "rice_Bacterial Leaf Blight", "rice_Brown Spot",
    "rice_Sheath Blight", "rice_Leaf Scald", "rice_Healthy Rice Leaf",
    "sugarcane_Redrot", "sugarcane_Mosaic", "sugarcane_Rust",
    "sugarcane_Yellow Disease", "sugarcane_Healthy",
    "cotton_Bacterial Blight", "cotton_Curl Virus",
    "cotton_Leaf Reddening", "cotton_Leaf Variegation",
    "cotton_Leaf Hopper Jassids", "cotton_Herbicide Damage",
    "cotton_Healthy Leaf",
]


class WeatherEncoder(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv1d(11, 64, kernel_size=3),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Conv1d(64, 128, kernel_size=3),
            nn.BatchNorm1d(128),
            nn.ReLU(),
        )
        self.attn = nn.MultiheadAttention(128, num_heads=8, batch_first=True)
        self.fc = nn.Linear(128, 128)
        self.norm = nn.LayerNorm(128)

    def forward(self, weather: torch.Tensor) -> torch.Tensor:
        features = self.conv(weather).transpose(1, 2)
        attended, _ = self.attn(features, features, features)
        return self.norm(self.fc(attended.mean(dim=1)))


class MultimodalClassifier(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.image_encoder = timm.create_model(
            "tf_efficientnetv2_s", pretrained=False, num_classes=0, global_pool="avg"
        )
        self.image_fc = nn.Sequential(nn.Linear(1280, 512), nn.ReLU())
        self.weather_encoder = WeatherEncoder()
        self.classifier = nn.Sequential(
            nn.Linear(640, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, len(CLASS_NAMES)),
        )

    def forward(self, image: torch.Tensor, weather: torch.Tensor) -> torch.Tensor:
        image_features = self.image_fc(self.image_encoder(image))
        weather_features = self.weather_encoder(weather)
        return self.classifier(torch.cat([image_features, weather_features], dim=1))


@lru_cache(maxsize=1)
def load_multimodal_model() -> MultimodalClassifier:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Multimodal model not found: {MODEL_PATH}")
    model = MultimodalClassifier()
    checkpoint = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
    model.load_state_dict(checkpoint, strict=True)
    model.eval()
    return model


def build_weather_features(weather: dict | None) -> torch.Tensor:
    """Build the 7-step, 11-feature shape used by the checkpoint."""
    values = weather or {}
    row = [
        float(values.get("temperature_c", 28.0)),
        float(values.get("humidity_percent", 70.0)),
        float(values.get("rainfall_mm", 0.0)),
        float(values.get("wind_kmh", 10.0)),
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
    ]
    # The training data stores seven consecutive weather records.
    return torch.tensor([row] * 7, dtype=torch.float32).transpose(0, 1).unsqueeze(0)


def predict_multimodal(
    image: Image.Image, weather: dict | None = None
) -> np.ndarray:
    model = load_multimodal_model()
    image_array = np.asarray(image.resize((IMAGE_SIZE, IMAGE_SIZE)), dtype=np.float32) / 255.0
    image_tensor = torch.from_numpy(image_array).permute(2, 0, 1).unsqueeze(0)
    weather_tensor = build_weather_features(weather)
    with torch.inference_mode():
        return torch.softmax(model(image_tensor, weather_tensor), dim=1)[0].numpy()
