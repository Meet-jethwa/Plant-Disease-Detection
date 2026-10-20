# 🌱 FloraAI — Multimodal Plant Health & Disease Intelligence

An explainable, multimodal deep learning platform designed for Indian farmers and agricultural extension workers. FloraAI combines computer vision on leaf photos with real-time environmental weather telemetry to detect, classify, and explain crop diseases across major Indian staple crops: **Rice**, **Wheat**, **Sugarcane**, and **Cotton**.

---

## 🚀 Key Highlights

- **Multimodal Deep Learning**:
  - Image encoder based on **EfficientNetV2** extracting fine-grained visual pathology patterns.
  - 1D-CNN + Multihead Attention weather encoder processing 7-day meteorological factors (temperature, relative humidity, rainfall, wind speed).
  - Joint fusion classifier for robust in-field predictions even under early or ambiguous visual symptoms.
- **Explainable AI (XAI)**:
  - **Grad-CAM Visual Heatmaps**: Reveals the exact leaf lesions and anatomical regions that triggered the model's prediction.
  - **SHAP Feature Importance**: Quantifies the contribution of humidity, leaf wetness duration, and ambient temperature to the disease outbreak.
- **Farmer-Friendly Web Application**:
  - Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.
  - Live GPS location lookup + automatic weather risk radar via the Open-Meteo API.
  - Contextual AI agricultural chat assistant powered by the Google GenAI SDK.
  - Personal farm garden ("My Plants"), disease history timeline, and visual encyclopedia.
- **Build-Time Indic Multilingual Pipeline**:
  - Full native localization across **8 languages**: English (`en`), Hindi (`hi`), Gujarati (`gu`), Marathi (`mr`), Tamil (`ta`), Telugu (`te`), Bengali (`bn`), and Punjabi (`pa`).
  - **Zero Runtime Translation Latency**: All UI strings and disease knowledge-base texts are compiled at build time using the Gemini Flash API and committed as static JSON.
  - **$0 Rerun Cache (`i18n-cache.json`)**: SHA-256 content hashing skips unchanged strings, making routine CI/CD runs cost nothing.
  - **Treatment Safety Invariant**: All chemical doses (`g/L`, `ml/L`, `kg/ha`) and spray intervals are strictly locked in `backend/data/treatments.json` and referenced by ID. No dosage numbers are translated as free text.

---

## 🌾 Supported Crops & Diseases

FloraAI classifies **31 distinct crop health conditions**:

| Crop | Supported Conditions & Diseases |
| :--- | :--- |
| **Rice** (*Oryza sativa*) | Bacterial Leaf Blight, Brown Spot, Leaf Blast, Leaf Scald, Sheath Blight, Bacterial Leaf Streak, Bacterial Panicle Blight, Tungro, Hispa, Healthy Rice Leaf |
| **Wheat** (*Triticum aestivum*) | Yellow (Stripe) Rust, Brown (Leaf) Rust, Black (Stem) Rust, Mildew, Septoria, Tan Spot, Fusarium Head Blight, Smut, Aphid, Mite, Blast, Common Root Rot, Stem Fly, Leaf Blight, Healthy |
| **Sugarcane** (*Saccharum officinarum*) | Red Rot, Mosaic Disease, Rust, Yellow Disease, Healthy |
| **Cotton** (*Gossypium hirsutum*) | Bacterial Blight, Leaf Curl Virus, Leaf Reddening, Alternaria Leaf Spot, Downy Mildew, Dead Heart, Healthy Leaf |

---

## 🏛️ System Architecture

```
Plant-Disease-Detection/
├── backend/
│   ├── server.py                   # FastAPI application & REST endpoints
│   ├── multimodal_model.py         # PyTorch multimodal inference pipeline
│   ├── gemini_chat.py              # Contextual AI assistant using google-genai
│   ├── disease_info.py             # Knowledge base & SHAP importance calculations
│   ├── gradcam.py                  # Grad-CAM attention heatmap generator
│   ├── data/
│   │   └── treatments.json         # Language-independent treatments & dosages (Source of Truth)
│   └── locales/                    # Localized disease knowledge bases
│       ├── en/diseases.json        # English baseline (references treatment_ids)
│       └── {hi,gu,mr,ta,te,bn,pa}/ # Translated disease profiles
├── frontend/
│   ├── public/locales/             # Static UI translation bundles (8 namespaces per language)
│   │   └── {en,hi,gu,mr,ta,te,bn,pa}/
│   │       ├── common.json         # Global buttons, navigation, alerts
│   │       ├── home.json           # Landing screen & quick scan cards
│   │       ├── scan.json           # Upload workspace, camera tips, progress
│   │       ├── diagnosis.json      # Health score, XAI heatmaps, treatments
│   │       ├── assistant.json      # Chat interface & suggested prompts
│   │       ├── library.json        # Crop disease encyclopedia
│   │       ├── plants.json         # Farm crop monitor & care journal
│   │       └── profile.json        # Location settings & manual weather override
│   └── src/
│       ├── contexts/               # LanguageContext (locale persistence, RTL/LTR)
│       ├── i18n/                   # translations.ts, diseaseHelper.ts, languages.ts
│       ├── pages/                  # ScanPage, DiagnosisResultPage, AssistantPage, etc.
│       └── components/             # Reusable UI widgets, LeafVision, DiseaseCard
├── scripts/
│   ├── translate-i18n.py           # Gemini build-time translation pipeline
│   ├── check-i18n.py               # 100% key parity & dosage invariant test suite
│   ├── glossary.json               # Agricultural & technical terminology mapping
│   └── spot_check.py               # Unicode glyph & tofu box validator
├── review/                         # Native-speaker in-field CSV review sheets
│   └── {hi,gu,mr,ta,te,bn,pa}.csv
├── REVIEW.md                       # Translation status & review priority guide
├── i18n-cache.json                 # SHA-256 hash cache for $0 rerun cost
├── locked.json                     # Human-approved keys protected from overwrite
└── package.json                    # Root task runner scripts
```

---

## 🛠️ Quickstart & Installation

### 1. Prerequisites
- **Python 3.10+** (64-bit)
- **Node.js 18+** & **npm**
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/) (required only for running build-time translations or live chat assistance)

### 2. Environment Configuration
Create a `.env` file in the project root (this file is gitignored and will never be committed):
```ini
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Linux / macOS
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

Start the FastAPI development server:
```bash
python -m uvicorn backend.server:app --reload --host 127.0.0.1 --port 8000
```
Interactive OpenAPI documentation will be accessible at: `http://127.0.0.1:8000/docs`.

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🌐 Multilingual i18n Pipeline

FloraAI enforces strict build-time translation so the deployed web app never makes costly or slow runtime LLM calls for static interface text.

### Available Commands

| Command | Description |
| :--- | :--- |
| `npm run i18n:translate` | Translates only missing or modified English strings across all 7 Indic targets. Existing cached translations cost **$0.00**. |
| `npm run i18n:translate -- --lang ta --force` | Forces a complete regeneration of a single language (e.g., Tamil). |
| `npm run i18n:translate -- --lock` | Marks all currently reviewed strings into `locked.json` so machine translations never overwrite human edits. |
| `npm run i18n:check` | Automated CI test verifying 100% key parity across all 8 languages and confirming zero altered dosage strings. |
| `npm run build` | Builds and type-checks the production frontend bundle (`tsc -b && vite build`). |

### Invariant: Treatment & Chemical Dosage Safety
To protect farmers from AI hallucinations on chemical treatments:
1. All dosage amounts, spray frequencies, and dilution ratios are maintained exclusively in `backend/data/treatments.json`.
2. Translated disease files (`backend/locales/{lang}/diseases.json`) hold only agronomic descriptions and reference treatments by stable ID (`treatment_ids`).
3. `scripts/check-i18n.py` automatically asserts that no dosage patterns (e.g., `g/L`, `ml/L`, `kg/ha`) were injected as unvetted free text.

---

## 🔬 Model Training & Evaluation

To retrain the individual crop baseline models on raw image datasets:

```bash
# Train Sugarcane and Cotton classifiers
python train_sugarcane_cotton.py --crops cotton
python train_sugarcane_cotton.py --crops sugarcane

# Train Rice classifier
python train_rice_disease.py
```

Trained checkpoints and confusion matrix plots are saved to:
- `models/`: Checkpoint weights (`.pth`, `.keras`) and class index dictionaries (`.json`).
- `plots/`: Confusion matrices, loss curves, and validation accuracy graphs.

---

## 🔒 Security & Privacy

- `.env` is gitignored and untracked. API keys are never bundled into client-side JavaScript.
- All plant image uploads processed via `/api/predict` are evaluated in-memory and not stored on public servers without farmer consent.

---

## ⚠️ Agronomic Disclaimer

*FloraAI is an artificial intelligence decision-support tool designed for preliminary in-field screening. Model predictions, Grad-CAM heatmaps, and AI recommendations should not replace on-site verification by a certified agronomist, plant pathologist, or local Krishi Vigyan Kendra (KVK) officer before purchasing or applying commercial chemical treatments.*

---

## 📄 License
This project is licensed under the MIT License.
