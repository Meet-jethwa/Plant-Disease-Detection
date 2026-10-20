#!/usr/bin/env python3
"""
scripts/check-i18n.py
=====================
Validates all 7 target languages (hi, gu, mr, ta, te, bn, pa) against English source of truth:
1. Missing or empty keys in frontend public/locales/{lang}/*.json
2. Missing diseases or altered treatment_ids in backend/locales/{lang}/diseases.json
3. Dosage safety invariants (no dosage numbers or chemical metrics altered or injected)
4. Placeholders {{...}} integrity
5. Script verification (Indic Unicode script check, flag Latin text leakage)

Exit code 0 on full pass, 1 on any failure.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

TARGET_LANGS = ["hi", "gu", "mr", "ta", "te", "bn", "pa"]

INDIC_SCRIPT_RANGES = {
    "hi": re.compile(r"[\u0900-\u097F]"),
    "mr": re.compile(r"[\u0900-\u097F]"),
    "gu": re.compile(r"[\u0A80-\u0AFF]"),
    "ta": re.compile(r"[\u0B80-\u0BFF]"),
    "te": re.compile(r"[\u0C00-\u0C7F]"),
    "bn": re.compile(r"[\u0980-\u09FF]"),
    "pa": re.compile(r"[\u0A00-\u0A7F]"),
}

DOSAGE_REGEX = re.compile(r"\b\d+(?:\.\d+)?\s*(?:g/L|ml/L|kg/ha|g/kg|ppm|kg/acre|l/ha)\b", re.IGNORECASE)


def run_checks() -> bool:
    print("═══════════════════════════════════════════════════════════════")
    print(" FloraAI i18n Translation Integrity & Safety Checker")
    print(" Checking targets: hi, gu, mr, ta, te, bn, pa against English")
    print("═══════════════════════════════════════════════════════════════\n")

    fe_en_dir = ROOT / "frontend" / "public" / "locales" / "en"
    be_en_file = ROOT / "backend" / "locales" / "en" / "diseases.json"

    if not fe_en_dir.exists() or not be_en_file.exists():
        print("[ERROR] English source files missing! Run scripts/build_baselines.py first.")
        return False

    # Load English frontend
    en_fe_namespaces: dict[str, dict[str, str]] = {}
    for f in fe_en_dir.glob("*.json"):
        with open(f, "r", encoding="utf-8") as jf:
            en_fe_namespaces[f.stem] = json.load(jf)

    # Load English backend
    with open(be_en_file, "r", encoding="utf-8") as jf:
        en_diseases: dict[str, dict] = json.load(jf)

    total_en_keys = sum(len(d) for d in en_fe_namespaces.values())
    total_en_diseases = len(en_diseases)
    print(f"Source of Truth: {total_en_keys} UI keys across {len(en_fe_namespaces)} namespaces, {total_en_diseases} diseases.\n")

    all_passed = True

    for lang in TARGET_LANGS:
        print(f"Checking [{lang.upper()}] ... ", end="", flush=True)
        errors: list[str] = []
        script_regex = INDIC_SCRIPT_RANGES[lang]

        # 1. Frontend namespace checks
        fe_lang_dir = ROOT / "frontend" / "public" / "locales" / lang
        if not fe_lang_dir.exists():
            errors.append(f"Missing locale directory: frontend/public/locales/{lang}")
        else:
            for ns, en_keys in en_fe_namespaces.items():
                target_file = fe_lang_dir / f"{ns}.json"
                if not target_file.exists():
                    errors.append(f"Missing namespace file: {ns}.json")
                    continue
                try:
                    with open(target_file, "r", encoding="utf-8") as jf:
                        target_keys = json.load(jf)
                except Exception as e:
                    errors.append(f"Invalid JSON in {ns}.json: {e}")
                    continue

                # Check missing and empty keys
                for k, en_val in en_keys.items():
                    if k not in target_keys:
                        errors.append(f"Missing key in {ns}.json: '{k}'")
                    else:
                        tr_val = str(target_keys[k]).strip()
                        en_stripped = str(en_val).strip()
                        if en_stripped and not tr_val:
                            errors.append(f"Empty translation in {ns}.json: '{k}'")
                        elif tr_val:
                            # Placeholders check
                            en_p = set(re.findall(r"\{\{([^}]+)\}\}", str(en_val)))
                            tr_p = set(re.findall(r"\{\{([^}]+)\}\}", tr_val))
                            if en_p != tr_p:
                                errors.append(f"Placeholder mismatch in {ns}.json '{k}': expected {en_p}, got {tr_p}")

                            # Script check
                            if re.search(r"[a-zA-Z]{3,}", str(en_val)) and not script_regex.search(tr_val):
                                # Check if it's pure Latin
                                if re.fullmatch(r"[\x00-\x7F\s\.,;:!?'\"()–—/-]+", tr_val):
                                    errors.append(f"Latin text leakage in {ns}.json '{k}': '{tr_val}'")

        # 2. Backend disease checks
        be_lang_file = ROOT / "backend" / "locales" / lang / "diseases.json"
        if not be_lang_file.exists():
            errors.append(f"Missing backend file: backend/locales/{lang}/diseases.json")
        else:
            try:
                with open(be_lang_file, "r", encoding="utf-8") as jf:
                    target_diseases = json.load(jf)
            except Exception as e:
                errors.append(f"Invalid JSON in backend diseases.json: {e}")
                target_diseases = {}

            for d_key, en_d in en_diseases.items():
                if d_key not in target_diseases:
                    errors.append(f"Missing disease: '{d_key}'")
                    continue
                tr_d = target_diseases[d_key]

                # Invariant: treatment_ids must be untouched
                if tr_d.get("treatment_ids") != en_d.get("treatment_ids"):
                    errors.append(f"Disease '{d_key}': treatment_ids mismatch!")

                # Invariant: no dosage numbers in translated descriptive text
                for fld in ["treatment_summary", "description", "causes", "prevention"]:
                    txt = str(tr_d.get(fld, ""))
                    if not txt.strip():
                        errors.append(f"Disease '{d_key}' missing text in '{fld}'")
                    elif DOSAGE_REGEX.search(txt):
                        errors.append(f"Disease '{d_key}' field '{fld}' contains raw dosage: {DOSAGE_REGEX.findall(txt)}")

                    # Script check
                    if re.search(r"[a-zA-Z]{3,}", str(en_d.get(fld, ""))) and not script_regex.search(txt):
                        if re.fullmatch(r"[\x00-\x7F\s\.,;:!?'\"()–—/-]+", txt):
                            errors.append(f"Latin text leakage in disease '{d_key}' field '{fld}': '{txt[:30]}'")

        if not errors:
            print("PASSED (100% complete, verified safe)")
        else:
            print(f"FAILED ({len(errors)} issues)")
            for err in errors[:5]:
                print(f"    - {err}")
            if len(errors) > 5:
                print(f"    ... and {len(errors) - 5} more issues")
            all_passed = False

    print("\n═══════════════════════════════════════════════════════════════")
    if all_passed:
        print(" ALL CHECKS PASSED: Full Indic localization ready for production.")
        print("═══════════════════════════════════════════════════════════════")
        return True
    else:
        print(" INTEGRITY CHECKS FAILED: Please fix issues or run translation.")
        print("═══════════════════════════════════════════════════════════════")
        return False


if __name__ == "__main__":
    success = run_checks()
    sys.exit(0 if success else 1)
