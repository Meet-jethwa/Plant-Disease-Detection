# FloraAI — Multilingual Translation Review

This file tracks the status of Indic translations generated at build time via the Gemini API pipeline.
Target languages: **Hindi (hi)**, **Gujarati (gu)**, **Marathi (mr)**, **Tamil (ta)**, **Telugu (te)**, **Bengali (bn)**, **Punjabi (pa)**.

## Treatment & Dosage Safety Invariant
- All dosages, chemical concentrations, and spray intervals are strictly managed in `backend/data/treatments.json`.
- No dosage numbers are translated or modified as free text.
- Backend disease files reference treatments by ID (`treatment_ids`).

## Summary by Language

| Language | Code | Total Keys | Machine Translated | Locked / Reviewed | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Hindi (हिंदी) | `hi` | 737 | 648 | 89 | Complete (100%) |
| Gujarati (ગુજરાતી) | `gu` | 737 | 648 | 89 | Complete (100%) |
| Marathi (मराठी) | `mr` | 737 | 648 | 89 | Complete (100%) |
| Tamil (தமிழ்) | `ta` | 737 | 648 | 89 | Complete (100%) |
| Telugu (తెలుగు) | `te` | 737 | 648 | 89 | Complete (100%) |
| Bengali (বাংলা) | `bn` | 737 | 648 | 89 | Complete (100%) |
| Punjabi (ਪੰਜਾਬੀ) | `pa` | 737 | 648 | 89 | Complete (100%) |

## Native-Speaker Review Priority
Agricultural terminology and farmer safety recommendations should be reviewed first in the following order:
1. **Treatments (`*.treatment_summary`, `diagnosis.treatment`)**: Verify chemical names and application advice.
2. **Symptoms & Causes (`*.causes`, `diagnosis.symptoms`)**: Ensure local names for plant lesions and blight are clear.
3. **Prevention (`*.prevention`)**: Verify crop rotation and sanitation advice.
4. **UI Navigation & Guidance**: General UI labels and buttons.

## CSV Files for In-Field Review
- Hindi: [`review/hi.csv`](review/hi.csv)
- Gujarati: [`review/gu.csv`](review/gu.csv)
- Marathi: [`review/mr.csv`](review/mr.csv)
- Tamil: [`review/ta.csv`](review/ta.csv)
- Telugu: [`review/te.csv`](review/te.csv)
- Bengali: [`review/bn.csv`](review/bn.csv)
- Punjabi: [`review/pa.csv`](review/pa.csv)

To approve and lock reviewed keys: `npm run i18n:translate -- --lock`.
