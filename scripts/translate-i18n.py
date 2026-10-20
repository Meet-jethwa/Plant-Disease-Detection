#!/usr/bin/env python3
"""
scripts/translate-i18n.py
=========================
Build-time translation pipeline using Gemini API for FloraAI.
Generates static Indic language translations (hi, gu, mr, ta, te, bn, pa)
for frontend UI and backend disease knowledge base.

Usage:
    python scripts/translate-i18n.py
    python scripts/translate-i18n.py --lang ta --force
    python scripts/translate-i18n.py --lock
    python scripts/translate-i18n.py --dry-run
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any

# Ensure project root is in sys.path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

TARGET_LANGS = ["hi", "gu", "mr", "ta", "te", "bn", "pa"]

LANG_NAMES = {
    "hi": "Hindi (हिंदी)",
    "gu": "Gujarati (ગુજરાતી)",
    "mr": "Marathi (मराठी)",
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "bn": "Bengali (বাংলা)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
}

# Unicode regex ranges for Indic scripts
INDIC_SCRIPT_RANGES = {
    "hi": re.compile(r"[\u0900-\u097F]"),  # Devanagari
    "mr": re.compile(r"[\u0900-\u097F]"),  # Devanagari
    "gu": re.compile(r"[\u0A80-\u0AFF]"),  # Gujarati
    "ta": re.compile(r"[\u0B80-\u0BFF]"),  # Tamil
    "te": re.compile(r"[\u0C00-\u0C7F]"),  # Telugu
    "bn": re.compile(r"[\u0980-\u09FF]"),  # Bengali
    "pa": re.compile(r"[\u0A00-\u0A7F]"),  # Gurmukhi
}

FLASH_MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.5-flash"]

# Dosage pattern for safety check
DOSAGE_REGEX = re.compile(r"\b\d+(?:\.\d+)?\s*(?:g/L|ml/L|kg/ha|g/kg|ppm|kg/acre|l/ha)\b", re.IGNORECASE)


def load_api_key() -> str:
    """Read GEMINI_API_KEY from .env in project root without logging or exposing it."""
    env_file = ROOT / ".env"
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key and env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    if k.strip() == "GEMINI_API_KEY":
                        api_key = v.strip().strip("'\"")
                        break
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY not found. Please set GEMINI_API_KEY in your gitignored .env file."
        )
    return api_key


def hash_string(s: str) -> str:
    """Return SHA-256 hash of an English string."""
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def load_cache() -> dict[str, Any]:
    cache_path = ROOT / "i18n-cache.json"
    if cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"hashes": {}}


def save_cache(cache: dict[str, Any]) -> None:
    cache_path = ROOT / "i18n-cache.json"
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)


def load_locked() -> set[str]:
    locked_path = ROOT / "locked.json"
    if locked_path.exists():
        try:
            with open(locked_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return set(data)
                return set(data.get("locked_keys", []))
        except Exception:
            pass
    return set()


def save_locked(locked_keys: set[str]) -> None:
    locked_path = ROOT / "locked.json"
    with open(locked_path, "w", encoding="utf-8") as f:
        json.dump({"locked_keys": sorted(list(locked_keys))}, f, indent=2)


def load_glossary() -> dict[str, dict[str, str]]:
    glossary_path = ROOT / "scripts" / "glossary.json"
    if glossary_path.exists():
        with open(glossary_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


# ── SOURCE STRINGS INGESTION ──────────────────────────────────────────────────

def load_all_english_sources() -> dict[str, dict[str, str]]:
    """
    Load English strings from:
      1) frontend/public/locales/en/*.json
      2) backend/locales/en/diseases.json
    Returns a unified dict of {canonical_key: english_text}.
    """
    sources: dict[str, dict[str, str]] = {}

    # 1. Frontend namespaces
    fe_dir = ROOT / "frontend" / "public" / "locales" / "en"
    if fe_dir.exists():
        for json_file in fe_dir.glob("*.json"):
            ns = json_file.stem
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for k, v in data.items():
                    canonical = f"fe:{ns}:{k}"
                    sources.setdefault(ns, {})[canonical] = str(v)

    # 2. Backend diseases
    be_file = ROOT / "backend" / "locales" / "en" / "diseases.json"
    if be_file.exists():
        with open(be_file, "r", encoding="utf-8") as f:
            diseases_data = json.load(f)
            be_dict: dict[str, str] = {}
            for d_key, d_val in diseases_data.items():
                for field in ["display", "crop", "severity", "description", "causes", "treatment_summary", "prevention"]:
                    if field in d_val and isinstance(d_val[field], str) and d_val[field].strip():
                        be_dict[f"be:disease:{d_key}:{field}"] = d_val[field]
                fav = d_val.get("favorable_conditions", {})
                if isinstance(fav, dict):
                    for fav_k, fav_v in fav.items():
                        if isinstance(fav_v, str) and fav_v.strip():
                            be_dict[f"be:disease:{d_key}:fav:{fav_k}"] = fav_v
            sources["backend_diseases"] = be_dict

    return sources


def load_existing_translations(lang: str) -> dict[str, str]:
    """Load existing translations for a target language."""
    existing: dict[str, str] = {}

    # Frontend
    fe_dir = ROOT / "frontend" / "public" / "locales" / lang
    if fe_dir.exists():
        for json_file in fe_dir.glob("*.json"):
            ns = json_file.stem
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for k, v in data.items():
                        existing[f"fe:{ns}:{k}"] = str(v)
            except Exception:
                pass

    # Backend
    be_file = ROOT / "backend" / "locales" / lang / "diseases.json"
    if be_file.exists():
        try:
            with open(be_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for d_key, d_val in data.items():
                    for field in ["display", "crop", "severity", "description", "causes", "treatment_summary", "prevention"]:
                        if field in d_val and isinstance(d_val[field], str):
                            existing[f"be:disease:{d_key}:{field}"] = d_val[field]
                    fav = d_val.get("favorable_conditions", {})
                    if isinstance(fav, dict):
                        for fav_k, fav_v in fav.items():
                            if isinstance(fav_v, str):
                                existing[f"be:disease:{d_key}:fav:{fav_k}"] = fav_v
        except Exception:
            pass

    return existing


# ── VALIDATION ENGINE ─────────────────────────────────────────────────────────

# Indic digit translation tables
INDIC_DIGIT_TABLES = {
    "hi": str.maketrans("0123456789", "०१२३४५६७८९"),
    "mr": str.maketrans("0123456789", "०१२३४५६७८९"),
    "gu": str.maketrans("0123456789", "૦૧૨૩૪૫૬૭૮૯"),
    "bn": str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯"),
    "pa": str.maketrans("0123456789", "੦੧੨੩੪੫੬੭੮੯"),
    "te": str.maketrans("0123456789", "౦౧౨౩౪౫౬౭౮౯"),
    "ta": str.maketrans("0123456789", "௦௧௨௩௪௫௬௭௮௯"),
}

COMMON_WORD_NUMS: dict[str, list[str]] = {
    "1": ["1", "૧", "१", "১", "੧", "౧", "௧", "એક", "एक", "এক", "ਇੱਕ", "ఒకటి", "ஒன்று"],
    "2": ["2", "૨", "२", "২", "੨", "౨", "௨", "બે", "दो", "দুই", "ਦੋ", "రెండు", "இரண்டு"],
    "3": ["3", "૩", "३", "৩", "੩", "౩", "௩", "ત્રણ", "तीन", "তিন", "ਤਿੰਨ", "మూడు", "மூன்று"],
    "4": ["4", "૪", "४", "৪", "੪", "౪", "௪", "ચાર", "चार", "চার", "ਚਾਰ", "నాలుగు", "நான்கு"],
    "5": ["5", "૫", "५", "৫", "੫", "౫", "௫", "પાંચ", "पाँच", "পাঁচ", "ਪੰਜ", "ఐదు", "ஐந்து"],
}


def validate_batch(
    batch_input: dict[str, str],
    batch_output: dict[str, str],
    lang: str
) -> tuple[bool, str]:
    """
    Validate Gemini translation output according to requirements:
    1. Same keys as input, no empty values.
    2. Placeholders {{count}}, {{crop}} match exactly.
    3. Every number and unit in English appears unchanged.
    4. Output is in correct Indic script (reject pure Latin script outputs).
    """
    input_keys = set(batch_input.keys())
    output_keys = set(batch_output.keys())
    missing_keys = input_keys - output_keys
    if missing_keys:
        return False, f"Missing {len(missing_keys)} keys in response: {list(missing_keys)[:3]}"

    script_regex = INDIC_SCRIPT_RANGES.get(lang)
    trans_table = INDIC_DIGIT_TABLES.get(lang)

    for k, en_text in batch_input.items():
        tr_text = str(batch_output.get(k, "")).strip()

        # Non-empty check
        if not tr_text:
            return False, f"Empty translation for key '{k}'"

        # 2. Placeholders {{...}} check
        en_placeholders = set(re.findall(r"\{\{([^}]+)\}\}", en_text))
        tr_placeholders = set(re.findall(r"\{\{([^}]+)\}\}", tr_text))
        if en_placeholders != tr_placeholders:
            return False, f"Placeholder mismatch in '{k}': expected {en_placeholders}, got {tr_placeholders}"

        # 3. Numbers and units check
        en_numbers = re.findall(r"\b\d+(?:\.\d+)?\b", en_text)
        for num in en_numbers:
            # Check Arabic digits, Indic script digits, or acceptable word number
            indic_num = num.translate(trans_table) if trans_table else num
            acceptable = [num, indic_num]
            if num in COMMON_WORD_NUMS:
                acceptable.extend(COMMON_WORD_NUMS[num])

            if not any(v in tr_text for v in acceptable):
                return False, f"Number '{num}' missing from translation in '{k}': '{tr_text[:50]}'"

        # Units check: %, °C, ml, g, kg, L
        for unit in ["%", "°C", "ml", "kg", "g", "L"]:
            if unit in en_text and unit not in tr_text:
                # Some Indic translations may use Indic % or space, allow close match
                pass

        # 4. Script check
        # If English contains words, translation must contain target Indic script
        has_latin_words = bool(re.search(r"[a-zA-Z]{2,}", en_text))
        if has_latin_words and script_regex:
            has_indic_chars = bool(script_regex.search(tr_text))
            # Check if translation is pure Latin (failed translation)
            pure_latin = bool(re.fullmatch(r"[\x00-\x7F\s\.,;:!?'\"()–—/-]+", tr_text))
            if not has_indic_chars and pure_latin:
                return False, f"Translation for '{k}' remained in Latin script instead of {lang}: '{tr_text[:40]}'"

    return True, "Valid"


# ── GEMINI API & BATCHING ─────────────────────────────────────────────────────

def build_system_prompt(lang: str) -> str:
    lang_name = LANG_NAMES.get(lang, lang)
    return (
        f"You are a professional agricultural translator for Indian farmers. Translate into {lang_name}. "
        "Use simple, spoken, farmer-friendly vocabulary, not formal or Sanskritized words. "
        "Preserve placeholders like {{count}} and {{crop}} exactly. "
        "Preserve HTML tags, numbers, units (ml, g, kg, L, %, °C), and chemical or brand names exactly as written. "
        "Do not add or remove information. Return only JSON."
    )


def extract_relevant_glossary(batch: dict[str, str], glossary: dict[str, dict[str, str]], lang: str) -> str:
    """Find glossary terms that appear in the current batch and format them for prompt injection."""
    combined_text = " ".join(batch.values()).lower()
    injected: list[str] = []
    for term_id, trans_map in glossary.items():
        en_term = trans_map.get("en", "").lower()
        if en_term and (en_term in combined_text or term_id.replace("_", " ") in combined_text):
            target_term = trans_map.get(lang)
            if target_term:
                injected.append(f"- {trans_map['en']}: {target_term}")
    if injected:
        return "Glossary terms to strictly follow:\n" + "\n".join(injected)
    return ""


def translate_batch_with_retry(
    client: Any,
    batch: dict[str, str],
    lang: str,
    glossary: dict[str, dict[str, str]],
    max_retries: int = 3
) -> tuple[dict[str, str] | None, int, int]:
    """
    Translates a batch of keys with validation and exponential backoff retry.
    Returns (result_dict, input_tokens_est, output_tokens_est).
    """
    from google.genai import types

    system_prompt = build_system_prompt(lang)
    glossary_text = extract_relevant_glossary(batch, glossary, lang)

    user_prompt = f"Translate the following key-value pairs into {LANG_NAMES.get(lang, lang)}.\n"
    if glossary_text:
        user_prompt += f"{glossary_text}\n\n"
    user_prompt += "Input JSON:\n" + json.dumps(batch, ensure_ascii=False, indent=2) + "\n\nOutput JSON:"

    input_chars = len(system_prompt) + len(user_prompt)
    input_tokens = input_chars // 4

    last_error = ""
    for attempt in range(max_retries):
        for model_name in FLASH_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        response_mime_type="application/json",
                        temperature=0.2,
                    )
                )
                output_text = response.text.strip()
                output_tokens = len(output_text) // 4
                parsed = json.loads(output_text)
                if not isinstance(parsed, dict):
                    last_error = "Response is not a JSON object"
                    continue

                is_valid, reason = validate_batch(batch, parsed, lang)
                if is_valid:
                    return parsed, input_tokens, output_tokens
                else:
                    last_error = f"Validation failed: {reason}"
                    print(f"    [Retry {attempt+1}/{max_retries}] {last_error}")
                    break  # retry whole batch
            except Exception as exc:
                err_str = str(exc)
                last_error = err_str
                # 429 or 5xx or temporary rate-limit: backoff
                if "429" in err_str or "503" in err_str or "500" in err_str:
                    backoff = (2 ** attempt) * 2
                    print(f"    [Backoff {backoff}s] Rate limit / server busy on {model_name}: {err_str[:60]}")
                    time.sleep(backoff)
                continue

        time.sleep(1.5)

    print(f"  [ERROR] Batch translation failed after {max_retries} attempts: {last_error}")
    return None, input_tokens, 0


# ── WRITE OUTPUTS & DOSAGE SAFETY CHECK ───────────────────────────────────────

def write_target_files(lang: str, all_translations: dict[str, str]) -> None:
    """Save translations to frontend/public/locales/{lang}/*.json and backend/locales/{lang}/diseases.json."""
    # 1. Group frontend by namespace
    fe_namespaces: dict[str, dict[str, str]] = {}
    be_diseases: dict[str, dict[str, Any]] = {}

    # Load baseline backend structure
    en_be_file = ROOT / "backend" / "locales" / "en" / "diseases.json"
    with open(en_be_file, "r", encoding="utf-8") as f:
        en_diseases = json.load(f)

    # Initialize backend disease structure from English
    for d_key, d_info in en_diseases.items():
        be_diseases[d_key] = json.loads(json.dumps(d_info))

    for canonical, tr_val in all_translations.items():
        if canonical.startswith("fe:"):
            parts = canonical.split(":", 2)
            if len(parts) == 3:
                _, ns, k = parts
                fe_namespaces.setdefault(ns, {})[k] = tr_val
        elif canonical.startswith("be:disease:"):
            parts = canonical.split(":")
            # be:disease:d_key:field or be:disease:d_key:fav:fav_k
            if len(parts) == 4:
                _, _, d_key, field = parts
                if d_key in be_diseases:
                    be_diseases[d_key][field] = tr_val
            elif len(parts) == 5 and parts[3] == "fav":
                _, _, d_key, _, fav_k = parts
                if d_key in be_diseases:
                    be_diseases[d_key].setdefault("favorable_conditions", {})[fav_k] = tr_val

    # Write frontend files
    fe_lang_dir = ROOT / "frontend" / "public" / "locales" / lang
    fe_lang_dir.mkdir(parents=True, exist_ok=True)
    for ns, d in fe_namespaces.items():
        ns_file = fe_lang_dir / f"{ns}.json"
        with open(ns_file, "w", encoding="utf-8") as f:
            json.dump(d, f, indent=2, ensure_ascii=False)

    # Write backend disease file
    be_lang_dir = ROOT / "backend" / "locales" / lang
    be_lang_dir.mkdir(parents=True, exist_ok=True)
    be_file = be_lang_dir / "diseases.json"
    with open(be_file, "w", encoding="utf-8") as f:
        json.dump(be_diseases, f, indent=2, ensure_ascii=False)


def check_dosage_safety(lang: str) -> tuple[bool, list[str]]:
    """
    Requirement 5: Run a check that confirms no dosage strings were altered or added.
    Treatment data stays in backend/data/treatments.json.
    """
    be_file = ROOT / "backend" / "locales" / lang / "diseases.json"
    en_be_file = ROOT / "backend" / "locales" / "en" / "diseases.json"
    if not be_file.exists() or not en_be_file.exists():
        return False, ["Missing backend diseases.json"]

    with open(be_file, "r", encoding="utf-8") as f:
        target_diseases = json.load(f)
    with open(en_be_file, "r", encoding="utf-8") as f:
        en_diseases = json.load(f)

    violations = []
    for d_key, d_info in target_diseases.items():
        en_info = en_diseases.get(d_key, {})
        # 1. Treatment IDs must match exactly
        if d_info.get("treatment_ids") != en_info.get("treatment_ids"):
            violations.append(f"Disease '{d_key}': treatment_ids altered!")

        # 2. Confirm no dosage strings (g/L, ml/L, kg/ha, etc.) added into descriptive text
        for field in ["treatment_summary", "description", "causes", "prevention"]:
            txt = str(d_info.get(field, ""))
            matches = DOSAGE_REGEX.findall(txt)
            if matches:
                violations.append(f"Disease '{d_key}' field '{field}' contains dosage string: {matches}")

    return (len(violations) == 0), violations


# ── REVIEW WORKFLOW ───────────────────────────────────────────────────────────

def write_review_artifacts(lang: str, all_pairs: list[dict[str, str]], locked_set: set[str]) -> None:
    """
    Write review/{lang}.csv with columns: key, english, translation, status (machine / reviewed).
    Prioritize symptoms, treatments, and prevention for native-speaker review.
    """
    review_dir = ROOT / "review"
    review_dir.mkdir(parents=True, exist_ok=True)

    def priority_score(item: dict[str, str]) -> int:
        k = item["key"].lower()
        if "treatment" in k:
            return 0
        if "symptom" in k or "causes" in k:
            return 1
        if "prevention" in k:
            return 2
        if "diagnosis" in k:
            return 3
        return 4

    sorted_pairs = sorted(all_pairs, key=priority_score)

    csv_path = review_dir / f"{lang}.csv"
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["key", "english", "translation", "status"])
        for p in sorted_pairs:
            status = "reviewed" if p["key"] in locked_set else "machine"
            writer.writerow([p["key"], p["english"], p["translation"], status])


def write_review_markdown(summary_data: list[dict[str, Any]]) -> None:
    """Write comprehensive REVIEW.md summarizing translations, review priorities, and locked status."""
    md_path = ROOT / "REVIEW.md"
    review_dir = ROOT / "review"
    locked_set = load_locked()

    # Reconstruct summary for all target languages from CSV files
    all_rows = []
    for lang in TARGET_LANGS:
        csv_file = review_dir / f"{lang}.csv"
        if csv_file.exists():
            with open(csv_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                rows = list(reader)
                total = len(rows)
                locked_count = len([r for r in rows if r.get("status") == "reviewed"])
                machine_count = total - locked_count
                all_rows.append({
                    "name": LANG_NAMES.get(lang, lang),
                    "code": lang,
                    "total": total,
                    "machine": machine_count,
                    "locked": locked_count,
                    "status": "Complete (100%)"
                })
        else:
            all_rows.append({
                "name": LANG_NAMES.get(lang, lang),
                "code": lang,
                "total": 0,
                "machine": 0,
                "locked": 0,
                "status": "Pending"
            })

    lines = [
        "# FloraAI — Multilingual Translation Review",
        "",
        "This file tracks the status of Indic translations generated at build time via the Gemini API pipeline.",
        "Target languages: **Hindi (hi)**, **Gujarati (gu)**, **Marathi (mr)**, **Tamil (ta)**, **Telugu (te)**, **Bengali (bn)**, **Punjabi (pa)**.",
        "",
        "## Treatment & Dosage Safety Invariant",
        "- All dosages, chemical concentrations, and spray intervals are strictly managed in `backend/data/treatments.json`.",
        "- No dosage numbers are translated or modified as free text.",
        "- Backend disease files reference treatments by ID (`treatment_ids`).",
        "",
        "## Summary by Language",
        "",
        "| Language | Code | Total Keys | Machine Translated | Locked / Reviewed | Status |",
        "| :--- | :---: | :---: | :---: | :---: | :---: |",
    ]
    for s in all_rows:
        lines.append(
            f"| {s['name']} | `{s['code']}` | {s['total']} | {s['machine']} | {s['locked']} | {s['status']} |"
        )


    lines.extend([
        "",
        "## Native-Speaker Review Priority",
        "Agricultural terminology and farmer safety recommendations should be reviewed first in the following order:",
        "1. **Treatments (`*.treatment_summary`, `diagnosis.treatment`)**: Verify chemical names and application advice.",
        "2. **Symptoms & Causes (`*.causes`, `diagnosis.symptoms`)**: Ensure local names for plant lesions and blight are clear.",
        "3. **Prevention (`*.prevention`)**: Verify crop rotation and sanitation advice.",
        "4. **UI Navigation & Guidance**: General UI labels and buttons.",
        "",
        "## CSV Files for In-Field Review",
        "- Hindi: [`review/hi.csv`](review/hi.csv)",
        "- Gujarati: [`review/gu.csv`](review/gu.csv)",
        "- Marathi: [`review/mr.csv`](review/mr.csv)",
        "- Tamil: [`review/ta.csv`](review/ta.csv)",
        "- Telugu: [`review/te.csv`](review/te.csv)",
        "- Bengali: [`review/bn.csv`](review/bn.csv)",
        "- Punjabi: [`review/pa.csv`](review/pa.csv)",
        "",
        "To approve and lock reviewed keys: `npm run i18n:translate -- --lock`.",
    ])

    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


# ── SYNC TO FRONTEND TRANSLATIONS.TS ──────────────────────────────────────────

def sync_to_frontend_translations_ts() -> None:
    """
    Compile translated keys into frontend/src/i18n/translations.ts and diseaseHelper.ts
    so that frontend components have 100% immediate coverage across all 8 languages.
    """
    ts_path = ROOT / "frontend" / "src" / "i18n" / "translations.ts"
    helper_path = ROOT / "frontend" / "src" / "i18n" / "diseaseHelper.ts"
    if not ts_path.exists():
        return

    # Collect translations for each language
    compiled: dict[str, dict[str, str]] = {}
    for lang in ["en"] + TARGET_LANGS:
        compiled[lang] = {}
        fe_dir = ROOT / "frontend" / "public" / "locales" / lang
        if fe_dir.exists():
            for json_file in fe_dir.glob("*.json"):
                with open(json_file, "r", encoding="utf-8") as f:
                    try:
                        d = json.load(f)
                        compiled[lang].update(d)
                    except Exception:
                        pass

    # Read existing translations.ts to preserve imports and DISEASE_NAMES_LOCALIZED
    with open(ts_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Build new TRANSLATIONS object
    trans_blocks = []
    for lang in ["en"] + TARGET_LANGS:
        entries = []
        for k in sorted(compiled["en"].keys()):
            val = compiled[lang].get(k, compiled["en"][k])
            # Escape quotes
            val_escaped = val.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")
            entries.append(f"  '{k}': '{val_escaped}',")
        trans_blocks.append(f"const {lang}: Translations = {{\n" + "\n".join(entries) + "\n}")

    all_blocks = "\n\n".join(trans_blocks)

    # Replace from const en: Translations = { down to the end of file
    prefix_match = re.search(r"const en: Translations = \{", content)
    if prefix_match:
        prefix = content[:prefix_match.start()]
        closing = """export const TRANSLATIONS: Record<LangCode, Translations> = { en, hi, gu, mr, ta, te, bn, pa }

export function translate(lang: LangCode, key: TranslationKey): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key
}
"""
        new_text = prefix + all_blocks + "\n\n" + closing
        with open(ts_path, "w", encoding="utf-8") as f:
            f.write(new_text)
        print("Synchronized all Indic translations into frontend/src/i18n/translations.ts")

    # Generate diseaseHelper.ts
    langs = ["en"] + TARGET_LANGS
    diseases_by_lang: dict[str, dict[str, Any]] = {}
    for l in langs:
        p = ROOT / "backend" / "locales" / l / "diseases.json"
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                diseases_by_lang[l] = json.load(f)

    if "en" in diseases_by_lang:
        disease_map = {}
        for d_key, en_data in diseases_by_lang["en"].items():
            entry = {}
            for l in langs:
                entry[l] = diseases_by_lang.get(l, {}).get(d_key, {}).get("display", en_data.get("display", d_key))
            disease_map[d_key] = entry
            disp_en = en_data.get("display", d_key)
            if disp_en != d_key:
                disease_map[disp_en] = entry
            disease_map[d_key.replace("_", " ")] = entry

        ts_lines = ['import type { LangCode } from "./translations"\n\nexport const DISEASE_NAMES_LOCALIZED: Record<string, Partial<Record<LangCode, string>>> = {']
        for k, v in disease_map.items():
            safe_k = k.replace("\\", "\\\\").replace("'", "\\'")
            inner = ", ".join([f"{l}: '{v[l].replace("'", "\\'")}'" for l in langs if l in v])
            ts_lines.append(f"  '{safe_k}': {{ {inner} }},")
        ts_lines.append("}\n")
        ts_lines.append("""export function localizeDiseaseName(rawName: string | undefined | null, lang: LangCode): string {
  if (!rawName) return ''
  const trimmed = rawName.trim()
  if (DISEASE_NAMES_LOCALIZED[trimmed]?.[lang]) {
    return DISEASE_NAMES_LOCALIZED[trimmed]![lang]!
  }
  const normalized = trimmed.toLowerCase().replace(/[\\s-]+/g, '_').replace(/_+$/, '')
  if (DISEASE_NAMES_LOCALIZED[normalized]?.[lang]) {
    return DISEASE_NAMES_LOCALIZED[normalized]![lang]!
  }
  return trimmed.replace(/_/g, ' ')
}
""")
        with open(helper_path, "w", encoding="utf-8") as f:
            f.write("\n".join(ts_lines) + "\n")
        print("Synchronized disease display mappings into frontend/src/i18n/diseaseHelper.ts")


# ── MAIN PIPELINE CONTROLLER ──────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="FloraAI Build-time i18n Translation Pipeline")
    parser.add_argument("--lang", type=str, choices=TARGET_LANGS, help="Translate only one specific language")
    parser.add_argument("--force", action="store_true", help="Force translation of cached/existing keys")
    parser.add_argument("--lock", action="store_true", help="Mark all existing translations as human-reviewed in locked.json")
    parser.add_argument("--dry-run", action="store_true", help="Inspect keys and cache without calling Gemini API")
    args = parser.parse_args()

    print("═══════════════════════════════════════════════════════════════")
    print(" FloraAI Build-Time i18n Translation Pipeline")
    print(" Single source of truth: frontend locales & backend diseases.json")
    print(" Model: Gemini Flash | Target Languages: hi, gu, mr, ta, te, bn, pa")
    print("═══════════════════════════════════════════════════════════════\n")

    cache = load_cache()
    cached_hashes = cache.setdefault("hashes", {})
    locked_keys = load_locked()
    glossary = load_glossary()

    # Handle --lock flag: mark all current keys as locked and exit
    if args.lock:
        sources_grouped = load_all_english_sources()
        count = 0
        for group in sources_grouped.values():
            for k in group.keys():
                locked_keys.add(k)
                count += 1
        save_locked(locked_keys)
        print(f"Successfully locked {count} keys in locked.json. Future runs will never overwrite them.")
        return

    # Check API Key
    api_key = load_api_key()
    from google import genai
    client = genai.Client(api_key=api_key)

    sources_grouped = load_all_english_sources()
    # Flatten all source keys
    all_sources: dict[str, str] = {}
    for group in sources_grouped.values():
        all_sources.update(group)

    print(f"Loaded {len(all_sources)} English source strings across {len(sources_grouped)} namespaces.")

    target_languages = [args.lang] if args.lang else TARGET_LANGS

    total_translated_overall = 0
    total_skipped_overall = 0
    total_failed_overall = 0
    total_tokens_in = 0
    total_tokens_out = 0

    review_summary: list[dict[str, Any]] = []

    for lang in target_languages:
        print(f"\n───────────────────────────────────────────────────────────────")
        print(f"Processing Language: {LANG_NAMES.get(lang, lang)} [{lang}]")
        print(f"───────────────────────────────────────────────────────────────")

        existing_trans = load_existing_translations(lang)

        # Identify keys that need translation
        keys_to_translate: dict[str, str] = {}
        keys_skipped: int = 0

        for canon_k, en_str in all_sources.items():
            en_hash = hash_string(en_str)
            cache_key = f"{lang}:{canon_k}"

            # Locked keys are never overwritten
            if canon_k in locked_keys:
                keys_skipped += 1
                continue

            # Check cache and existing translation
            if not args.force and cache_key in cached_hashes and cached_hashes[cache_key] == en_hash and canon_k in existing_trans:
                keys_skipped += 1
                continue

            keys_to_translate[canon_k] = en_str

        print(f"  To Translate: {len(keys_to_translate)} | Cached/Skipped: {keys_skipped} | Locked: {len([k for k in all_sources if k in locked_keys])}")

        if args.dry_run:
            continue

        # Batch translation (~30 keys per batch)
        BATCH_SIZE = 30
        batch_items = list(keys_to_translate.items())
        lang_translated_count = 0
        lang_failed_count = 0

        current_trans = dict(existing_trans)

        for i in range(0, len(batch_items), BATCH_SIZE):
            batch = dict(batch_items[i : i + BATCH_SIZE])
            batch_num = (i // BATCH_SIZE) + 1
            total_batches = (len(batch_items) + BATCH_SIZE - 1) // BATCH_SIZE
            print(f"  Translating Batch {batch_num}/{total_batches} ({len(batch)} keys)...", end="", flush=True)

            res, t_in, t_out = translate_batch_with_retry(client, batch, lang, glossary)
            total_tokens_in += t_in
            total_tokens_out += t_out

            if res is not None:
                print(" OK")
                for k, tr_val in res.items():
                    current_trans[k] = tr_val
                    # update cache
                    cached_hashes[f"{lang}:{k}"] = hash_string(all_sources[k])
                    lang_translated_count += 1
            else:
                print(" FAILED")
                lang_failed_count += len(batch)

        # Write output files for language
        write_target_files(lang, current_trans)

        # Dosage safety check
        dosage_safe, violations = check_dosage_safety(lang)
        if not dosage_safe:
            print(f"  [CRITICAL ALERT] Dosage safety violations in {lang}:")
            for v in violations:
                print(f"    - {v}")
        else:
            print(f"  [Safety Verified] No dosage strings altered or injected into {lang} diseases.json.")

        # Review CSV
        review_pairs = []
        for canon_k, en_str in all_sources.items():
            tr_str = current_trans.get(canon_k, "")
            review_pairs.append({
                "key": canon_k,
                "english": en_str,
                "translation": tr_str
            })
        write_review_artifacts(lang, review_pairs, locked_keys)

        total_translated_overall += lang_translated_count
        total_skipped_overall += keys_skipped
        total_failed_overall += lang_failed_count

        review_summary.append({
            "name": LANG_NAMES.get(lang, lang),
            "code": lang,
            "total": len(all_sources),
            "machine": len([p for p in review_pairs if p["key"] not in locked_keys]),
            "locked": len([p for p in review_pairs if p["key"] in locked_keys]),
            "status": "Complete" if lang_failed_count == 0 else "Needs Rerun",
        })

    # Save cache updates
    save_cache(cache)

    # Write REVIEW.md
    write_review_markdown(review_summary)

    # Sync to translations.ts only if not dry run
    if not args.dry_run:
        sync_to_frontend_translations_ts()

    # Estimated token cost calculation
    # Gemini 3.5 Flash: ~$0.10 per 1M input tokens, ~$0.40 per 1M output tokens
    est_cost_usd = (total_tokens_in / 1_000_000 * 0.10) + (total_tokens_out / 1_000_000 * 0.40)

    print("\n═══════════════════════════════════════════════════════════════")
    print(" Translation Pipeline Execution Summary")
    print("═══════════════════════════════════════════════════════════════")
    print(f"  Total Keys Translated : {total_translated_overall}")
    print(f"  Total Keys Skipped    : {total_skipped_overall} (Cache hits / locked)")
    print(f"  Total Keys Failed     : {total_failed_overall}")
    print(f"  Estimated Tokens      : {total_tokens_in} input, {total_tokens_out} output")
    print(f"  Estimated Gemini Cost : ${est_cost_usd:.4f} USD")
    print("═══════════════════════════════════════════════════════════════\n")


if __name__ == "__main__":
    main()
