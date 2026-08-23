"""
weather.py
==========
Dummy location toggle for demo purposes.
Alternates between two realistic Indian farm-location weather profiles
on each "Fetch Location" click.
"""

import streamlit as st

# ── Two dummy weather profiles ────────────────────────────────────────────────
DUMMY_LOCATIONS = [
    {
        "city":        "Ahmedabad",
        "state":       "Gujarat",
        "latitude":    23.03,
        "longitude":   72.58,
        "temperature": 36.4,     # °C
        "humidity":    62,        # %
        "rainfall":    2.1,       # mm (last 24 h)
        "wind_speed":  14.2,      # km/h
        "uv_index":    8,
        "condition":   "Mostly Sunny",
        "risk_note":   (
            "Moderate humidity with high temperatures creates favourable conditions "
            "for fungal spore germination. Monitor crops for early signs of blight."
        ),
    },
    {
        "city":        "Mumbai",
        "state":       "Maharashtra",
        "latitude":    19.08,
        "longitude":   72.88,
        "temperature": 31.2,
        "humidity":    88,
        "rainfall":    18.6,
        "wind_speed":  22.5,
        "uv_index":    5,
        "condition":   "Overcast with Rain",
        "risk_note":   (
            "High humidity (88 %) combined with recent heavy rainfall (18.6 mm) "
            "significantly elevates the risk of bacterial and fungal diseases. "
            "Ensure adequate drainage and consider preventive fungicide application."
        ),
    },
]


def fetch_weather() -> dict:
    """
    Toggle between the two dummy profiles on each call.
    Uses st.session_state to track which profile is active.
    """
    if "weather_toggle" not in st.session_state:
        st.session_state["weather_toggle"] = 0

    profile = DUMMY_LOCATIONS[st.session_state["weather_toggle"]]

    # Advance toggle for next click
    st.session_state["weather_toggle"] = (
        st.session_state["weather_toggle"] + 1
    ) % len(DUMMY_LOCATIONS)

    return profile


def get_risk_level(weather: dict) -> tuple[str, str]:
    """
    Return a (level_label, color) tuple based on humidity + rainfall.
    """
    h = weather.get("humidity", 50)
    r = weather.get("rainfall", 0)

    if h >= 80 or r >= 15:
        return "High Risk", "#ef4444"
    elif h >= 65 or r >= 5:
        return "Medium Risk", "#f59e0b"
    else:
        return "Low Risk", "#22c55e"
