import json
from pathlib import Path

locales_dir = Path("backend/locales")
langs = ["en", "hi", "gu", "mr", "ta", "te", "bn", "pa"]
all_data = {}

for lang in langs:
    fpath = locales_dir / lang / "diseases.json"
    if not fpath.exists():
        continue
    data = json.loads(fpath.read_text(encoding="utf-8"))
    for dkey, val in data.items():
        if dkey not in all_data:
            all_data[dkey] = {}
        all_data[dkey][lang] = {
            "display": val.get("display", ""),
            "crop": val.get("crop", ""),
            "severity": val.get("severity", ""),
            "description": val.get("description", ""),
            "causes": val.get("causes", ""),
            "treatment": val.get("treatment_summary", "") or val.get("treatment", ""),
            "prevention": val.get("prevention", "")
        }

out_ts = Path("frontend/src/i18n/diseaseData.ts")
content = (
    "// Generated static disease localization matrix for all 8 Indic languages\n"
    "import type { LangCode } from './translations'\n\n"
    "export interface LocalizedDiseaseEntry {\n"
    "  display: string\n"
    "  crop: string\n"
    "  severity: string\n"
    "  description: string\n"
    "  causes: string\n"
    "  treatment: string\n"
    "  prevention: string\n"
    "}\n\n"
    "export const LOCALIZED_DISEASES: Record<string, Partial<Record<LangCode, LocalizedDiseaseEntry>>> = "
    + json.dumps(all_data, ensure_ascii=False, indent=2)
    + ";\n"
)
out_ts.write_text(content, encoding="utf-8")
print(f"Wrote {out_ts} with {len(all_data)} diseases across {len(langs)} languages.")
