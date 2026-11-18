"""
tests/conftest.py
=================
Shared pytest fixtures for FloraAI Plant Disease Detection test suite.
"""

from __future__ import annotations

import io
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from backend.server import app

BASE_DIR = Path(__file__).resolve().parent.parent


@pytest.fixture(scope="session")
def client() -> TestClient:
    """FastAPI TestClient session fixture."""
    return TestClient(app)


@pytest.fixture(scope="session")
def sample_leaf_bytes() -> bytes:
    """Generates valid 300x300 RGB leaf image bytes in JPEG format."""
    img = Image.new("RGB", (300, 300), color=(34, 139, 34))
    # Add synthetic variation (leaf veins/lesion)
    pixels = img.load()
    for x in range(120, 180):
        for y in range(120, 180):
            pixels[x, y] = (160, 82, 45)  # Brown lesion patch
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


@pytest.fixture(scope="session")
def sample_small_leaf_bytes() -> bytes:
    """Generates valid 224x224 RGB image bytes."""
    img = Image.new("RGB", (224, 224), color=(46, 125, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


@pytest.fixture(scope="session")
def corrupt_image_bytes() -> bytes:
    """Returns corrupt byte payload."""
    return b"NOT_A_VALID_IMAGE_HEADER_1234567890ABCDEF"


@pytest.fixture(scope="session")
def standard_weather() -> dict:
    """Standard ambient weather context dictionary."""
    return {
        "temperature_c": 28.5,
        "humidity_percent": 75,
        "rainfall_mm": 5.0,
        "wind_kmh": 12.0,
        "condition": "Humid / Partly Cloudy",
    }


@pytest.fixture(scope="session")
def dataset_image_path() -> Path:
    """Path to an actual leaf image from the repository dataset."""
    sample = BASE_DIR / "dataset" / "Cotton" / "Alternaria" / "Alteranaria_1.JPG"
    if sample.exists():
        return sample
    sample_sug = BASE_DIR / "dataset" / "Sugercane" / "Healthy" / "image001.jpg"
    return sample_sug

