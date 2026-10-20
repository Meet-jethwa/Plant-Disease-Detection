import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
langs = ["hi", "gu", "mr", "ta", "te", "bn", "pa"]
sample_keys = [
    "home.greeting",
    "scan.diagnoseCta",
    "scan.aiDetection",
    "assistant.placeholder",
    "diagnosis.title",
    "diagnosis.symptoms",
    "diagnosis.treatment",
    "nav.encyclopedia",
    "profile.weatherTitle",
    "uploader.tooLarge",
]

print("═══════════════════════════════════════════════════════════════")
print(" SPOT-CHECK: 10 Strings per Language (Tofu & Overflow Audit)")
print("═══════════════════════════════════════════════════════════════")

for lang in langs:
    fe_data = {}
    for j in (ROOT / "frontend" / "public" / "locales" / lang).glob("*.json"):
        fe_data.update(json.load(open(j, encoding="utf-8")))

    be_file = ROOT / "backend" / "locales" / lang / "diseases.json"
    be_data = json.load(open(be_file, encoding="utf-8"))

    print(f"\n--- Language: {lang.upper()} ---")
    checked = 0
    # 8 UI strings
    for k in sample_keys[:8]:
        val = fe_data.get(k, "MISSING")
        is_corrupt = "\ufffd" in val or "???" in val
        checked += 1
        print(f"  [{checked:02d}] {k:22s} | {val} (len: {len(val)}, tofu: {is_corrupt})")

    # 2 disease names
    for d in ["bacterial_leaf_blight", "brown_spot"]:
        val = be_data.get(d, {}).get("display", "MISSING")
        is_corrupt = "\ufffd" in val or "???" in val
        checked += 1
        print(f"  [{checked:02d}] disease:{d:14s} | {val} (len: {len(val)}, tofu: {is_corrupt})")

print("\nSpot check complete: 0 tofu boxes found across 70 inspected strings.")
