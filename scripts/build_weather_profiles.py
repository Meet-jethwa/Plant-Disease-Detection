"""
build_weather_profiles.py
==========================
Extracts representative 7-day x 11-feature meteorological profiles for all 33
disease classes from Project v3 dataset (d:\clg\major project\Project folder\projectv3\dataset\weather).

Saves to: models/disease_weather_profiles.json
"""

import os
import json
from pathlib import Path
import numpy as np

PROJECTV3_WEATHER_DIR = Path(r"d:\clg\major project\Project folder\projectv3\dataset\weather")
PROJECTV3_INDEX_PATH = Path(r"d:\clg\major project\Project folder\projectv3\dataset\dataset_index.json")

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "models" / "disease_weather_profiles.json"


def main():
    if not PROJECTV3_INDEX_PATH.exists() or not PROJECTV3_WEATHER_DIR.exists():
        print("Project v3 dataset paths not found.")
        return

    with open(PROJECTV3_INDEX_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)

    by_class = {}
    for r in records:
        crop = r.get("crop_type", "")
        disease = r.get("disease_label", "")
        class_key = f"{crop}_{disease}"
        by_class.setdefault(class_key, []).append(r.get("weather_file", ""))

    profiles = {}

    for class_key, file_names in sorted(by_class.items()):
        unique_files = list(dict.fromkeys(file_names))
        loaded_arrays = []
        for fn in unique_files[:30]:
            fp = PROJECTV3_WEATHER_DIR / fn
            if fp.exists():
                try:
                    arr = np.load(fp)
                    if arr.shape == (7, 11):
                        loaded_arrays.append(arr)
                except Exception:
                    pass

        if not loaded_arrays:
            continue

        mean_7x11 = np.mean(loaded_arrays, axis=0).astype(np.float32)

        crop, disease = class_key.split("_", 1)
        avg_temp = float(np.mean(mean_7x11[:, 2]))
        avg_rh = float(np.mean(mean_7x11[:, 4]))
        tot_rain = float(np.sum(mean_7x11[:, 5]))
        avg_wind = float(np.mean(mean_7x11[:, 7]))

        # Condition summary
        if avg_rh > 75 and tot_rain > 5:
            cond = "Warm & Humid with Rainfall"
        elif avg_rh > 75:
            cond = "High Ambient Humidity"
        elif avg_temp > 30 and avg_rh < 55:
            cond = "Hot & Semi-Arid"
        elif avg_temp < 20:
            cond = "Cool & Damp"
        else:
            cond = "Moderate Agricultural Climate"

        profiles[class_key] = {
            "key": class_key,
            "crop": crop,
            "disease": disease,
            "display_name": f"{crop.capitalize()} — {disease}",
            "avg_temp_c": round(avg_temp, 1),
            "avg_humidity_pct": round(avg_rh, 1),
            "total_rainfall_mm": round(tot_rain, 1),
            "avg_wind_kmh": round(avg_wind, 1),
            "condition_summary": cond,
            "description": (
                f"Historical 7-day meteorological sequence from Project v3 training dataset for {crop.capitalize()} {disease}. "
                f"Features: ~{round(avg_temp, 1)}°C mean temp, ~{round(avg_rh, 1)}% relative humidity, {round(tot_rain, 1)}mm incubation precipitation."
            ),
            "features_7x11": mean_7x11.tolist(),
        }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as out_f:
        json.dump(profiles, out_f, indent=2)

    print(f"Successfully generated {len(profiles)} disease weather profiles at {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
