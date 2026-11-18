# FloraAI Master Test Cases & Test Scripts Inventory

This catalog documents the complete automated testing suite developed and executed for the **FloraAI Plant Disease Detection & Outbreak Forecasting** system.

---

## 1. Unit Testing Suite (`tests/unit/` — 69 Test Cases)

### 1.1 REST API Endpoints (`test_unit_api.py` — 13 Tests)
| Test ID | Target Function / Endpoint | Input Parameters / Payload | Verification / Expected Result |
| :--- | :--- | :--- | :--- |
| `UT_API_01` | `GET /api/health` | None | Returns HTTP 200, JSON `status: "ok"`, `service: "FloraAI backend"` |
| `UT_API_02` | `GET /api/crops` | None | Returns HTTP 200, array of 4 crops: Rice, Wheat, Sugarcane, Cotton |
| `UT_API_03` | `GET /api/weather/disease-profiles` | None | Returns HTTP 200, dictionary of pre-computed meteorological profiles |
| `UT_API_04` | `GET /api/weather/forecast-risk` | `temp=29.5`, `humidity=82`, `rain=12`, `wind=14` | Returns HTTP 200, `risk_level`, `reasoning`, and 7-day outlook array |
| `UT_API_05` | `GET /api/location/fetch` | None | Returns HTTP 200, `location` and `weather` telemetry dictionary |
| `UT_API_06` | `POST /api/predict` (Valid Leaf) | `crop=cotton`, `lang=en`, 300x300 RGB bytes | Returns HTTP 200, `predicted_class`, `confidence > 0`, Grad-CAM data URL |
| `UT_API_07` | `POST /api/predict` (Unsupported Crop) | `crop=banana`, dummy image | Returns HTTP 400 Bad Request with error `"Unsupported crop"` |
| `UT_API_08` | `POST /api/predict` (Empty Image) | Zero-byte empty file payload | Returns HTTP 400 Bad Request |
| `UT_API_09` | Assistant Session Lifecycle | `POST /api/assistant/start` & `ask` | Returns HTTP 200, initializes session, returns Gemini advisory |
| `UT_API_10` | `POST /api/assistant/ask` (Empty Message) | `diagnosis_id="test"`, `message=" "` | Returns HTTP 400 Bad Request: message cannot be empty |
| `UT_API_11` | `POST /api/assistant/ask` (Unknown Session) | `diagnosis_id="unknown-id"`, valid text | Gracefully initializes general fallback session without 500 error |
| `UT_API_12` | `GET /api/location/fetch` (With Coordinates) | `lat=28.61`, `lon=77.20` | Returns HTTP 200 with localized microclimate parameters |
| `UT_API_13` | `GET /api/weather/disease-profiles` (Filtered) | `crop=wheat` | Returns HTTP 200, strictly returns only wheat profiles |

### 1.2 Disease Catalog & Indic Localization (`test_unit_disease_info.py` — 15 Tests)
| Test ID | Target Function / Feature | Test Input Key / Condition | Verification / Expected Result |
| :--- | :--- | :--- | :--- |
| `UT_DIS_01` | Key Normalization | `" Brown Spot "`, `"Bacterial-Leaf-Blight"` | Clean snake_case: `brown_spot`, `bacterial_leaf_blight` |
| `UT_DIS_02` | Known Disease Lookup | `"Brown Spot"` | Returns `display`, `severity`, `description`, `causes`, `treatment`, `prevention` |
| `UT_DIS_03` | Healthy Crop Condition | `"Healthy"` | Severity is `"None"`; description provides preventative guidelines |
| `UT_DIS_04` | Unknown Fallback | `"Mysterious Alien Blight 999"` | Graceful fallback advisory dictionary without `KeyError` |
| `UT_DIS_05` | Indic Translation [Hindi] | `"Brown Spot"`, locale `hi` | Localized Hindi description and treatment in Devanagari |
| `UT_DIS_06` | Indic Translation [Gujarati] | `"Brown Spot"`, locale `gu` | Localized Gujarati description and treatment |
| `UT_DIS_07` | Indic Translation [Marathi] | `"Brown Spot"`, locale `mr` | Localized Marathi description and treatment |
| `UT_DIS_08` | Indic Translation [Tamil] | `"Brown Spot"`, locale `ta` | Localized Tamil description and treatment |
| `UT_DIS_09` | Indic Translation [Telugu] | `"Brown Spot"`, locale `te` | Localized Telugu description and treatment |
| `UT_DIS_10` | Indic Translation [Bengali] | `"Brown Spot"`, locale `bn` | Localized Bengali description and treatment |
| `UT_DIS_11` | Indic Translation [Punjabi] | `"Brown Spot"`, locale `pa` | Localized Punjabi (Gurmukhi) description |
| `UT_DIS_12` | Weather Risk Bands | High/Medium/Low boundary metrics | Maps meteorological factors to risk thresholds correctly |
| `UT_DIS_13` | Feature Importance Calculation | Weather metric vectors | Computes feature relative weights summing to 1.0 |
| `UT_DIS_14` | Crop Disambiguation | `"Blast"` with `crop="wheat"` vs `"rice"` | Resolves distinct profiles: Wheat Blast vs. Rice Blast |
| `UT_DIS_15` | Chatbot Response Rules | Crop symptom queries | Tailored agronomic advisory recommendations |

### 1.3 Synthetic Forecaster & Disease Risk (`test_unit_forecasting.py` — 7 Tests)
| Test ID | Target Function / Feature | Inputs / Conditions | Verification / Expected Result |
| :--- | :--- | :--- | :--- |
| `UT_FOR_01` | Synthetic Data Generation | `generate_synthetic_outbreak_data(n=2000)` | DataFrame of 2000 rows, 11 features, balanced `risk_level` |
| `UT_FOR_02` | Model Training & Accuracy | `train_disease_risk_forecaster()` | Fits Random Forest, accuracy $> 90\%$, persists to `.joblib` |
| `UT_FOR_03` | Crop Risk Prediction [Rice] | Rice monsoon conditions | Returns `risk_level: "High"`, reasoning string, probabilities dict |
| `UT_FOR_04` | Crop Risk Prediction [Wheat] | Wheat cool dry conditions | Returns `risk_level: "Low"` with winter epidemiological profile |
| `UT_FOR_05` | Crop Risk Prediction [Sugarcane] | Sugarcane tropical warm conditions | Returns calibrated risk profile matching sugarcane parameters |
| `UT_FOR_06` | Crop Risk Prediction [Cotton] | Cotton semi-arid conditions | Returns calibrated risk profile matching cotton disease thresholds |
| `UT_FOR_07` | 7-Day Progression Outlook | Multi-day weather trend | Returns list of exactly 7 items with day, risk, temp, humidity |

### 1.4 Gemini AI Chat & Agronomic Intent Matrix (`test_unit_gemini_chat.py` — 11 Tests)
| Test ID | Target Function / Feature | Inputs / Conditions | Verification / Expected Result |
| :--- | :--- | :--- | :--- |
| `UT_GEM_01` | Intent Detection Matrix | 9 distinct prompt patterns across all intents | Accurately maps queries to treatment, gradcam, shap, environment |
| `UT_GEM_02` | Data URL Prefix Stripper | `data:image/png;base64,...` | Extracts pure MIME type and base64 string payload safely |
| `UT_GEM_03` | Language Name Mapping | 8 language codes (`en`, `hi`, `gu`, etc.) | Maps codes to full English language names; unknown defaults to English |
| `UT_GEM_04` | Image Part Construction | Base64 foliar image payload | Constructs `Part.from_bytes` object cleanly |
| `UT_GEM_05` | Fallback Initial Structure | Offline Mode / missing API key | Generates full Mode A schema JSON with safety disclaimer |
| `UT_GEM_06` | Fallback Chat Structure | Service unavailable on follow-up | Returns focused chat message preserving intent and error context |
| `UT_GEM_07` | Mode A Without API Key | Unset `GEMINI_API_KEY` | Returns fallback response stating API key missing without crashing |
| `UT_GEM_08` | Mode B Without API Key | Unset `GEMINI_API_KEY` on chat | Returns fallback chat response with detected intent |
| `UT_GEM_09` | Legacy Alias Verification | `ask_gemini()` | Forwards context to Mode A initial diagnosis seamlessly |
| `UT_GEM_10` | Mode A Mocked Client | Mocked client returning structured JSON | Parses diagnosis summary, recommended actions, safety disclaimer |
| `UT_GEM_11` | Mode B Mocked Client | Mocked client returning plain text | Returns clean agricultural advisory text string |

### 1.5 Grad-CAM Explainable AI (XAI) Overlays (`test_unit_gradcam.py` — 6 Tests)
| Test ID | Target Function / Feature | Inputs / Conditions | Verification / Expected Result |
| :--- | :--- | :--- | :--- |
| `UT_GC_01` | Last Conv Layer Discovery | Layer traversal | Finds preferred `top_conv` and falls back to last Conv2D |
| `UT_GC_02` | Nested EfficientNet Detection | Submodel discovery | Detects submodel with `efficientnet` in name safely |
| `UT_GC_03` | Overlay Generation Success | Valid RGB image and model | Returns 3-channel RGB overlay, heatmap, affected area percentage |
| `UT_GC_04` | Float Input Handling | Float inputs in $[0, 1]$ | Automatically clipped and converted to uint8 |
| `UT_GC_05` | Invalid Model Handling | Corrupt or None model | Gracefully returns `(None, None, None, None)` without 500 |
| `UT_GC_06` | Nested Architecture Hooking | Nested EfficientNet | Traverses nested architecture to attach gradients cleanly |

### 1.6 Multimodal Neural Network Tensor Pipeline (`test_unit_multimodal.py` — 4 Tests)
| Test ID | Target Function / Feature | Inputs / Conditions | Verification / Expected Result |
| :--- | :--- | :--- | :--- |
| `UT_MM_01` | 33-Class Coverage | `CLASS_NAMES` list | Length == 33; crop prefixes contain `{"rice", "wheat", "sugarcane", "cotton"}` |
| `UT_MM_02` | Weather Stats Shape | `get_weather_stats()` | Mean and std arrays have length 11; all std values strictly $> 0$ |
| `UT_MM_03` | Weather Tensor Extraction | Weather dictionary | Returns PyTorch Tensor with shape `[1, 7, 11]`, dtype `float32`, 0 NaNs |
| `UT_MM_04` | Image Preprocessing | Arbitrary PIL Image | Returns normalized PyTorch tensor `[1, 3, 300, 300]`, range $[-1.0, 1.0]$ |

### 1.7 PyTorch Multimodal Sequence Loader (`test_unit_multimodal_loader.py` — 9 Tests)
| Test ID | Target Function / Feature | Inputs / Conditions | Verification / Expected Result |
| :--- | :--- | :--- | :--- |
| `UT_ML_01` | Weather Stats Vector | 11-feature sequence | 11 dimensions with valid, non-negative standard deviations |
| `UT_ML_02` | Season Encoding Identity | Cyclic month coordinates | Adheres to trigonometric identity $\sin^2(x) + \cos^2(x) = 1.0$ |
| `UT_ML_03` | Weather Encoder Forward Pass | `WeatherEncoder` | 1D-CNN + 4-head attention maps `[B, 7, 11]` $\rightarrow$ `[B, 128]` embedding |
| `UT_ML_04` | Weather Tensor from NumPy | Raw 7x11 array | Standardizes into PyTorch tensor `[1, 7, 11]`, float32 |
| `UT_ML_05` | Weather Tensor from Scalar Dict | Single-day scalar metrics | Synthesizes 7-day standardized sequence tensor `[1, 7, 11]`, 0 NaNs |
| `UT_ML_06` | Weather Tensor from Daily Sequence | Full 7-day list of daily dicts | Normalized tensor `[1, 7, 11]`, float32 |
| `UT_ML_07` | Open-Meteo Schema Parsing | Raw Open-Meteo JSON with time arrays | Correctly parses and structures 7x11 float32 tensor |
| `UT_ML_08` | Image Normalization | Arbitrary PIL RGB image | Normalizes into PyTorch tensor `[1, 3, 300, 300]` |
| `UT_ML_09` | Multimodal Inference Forward | Forward pass on image & weather | Output dict with predicted class, confidence, top3 candidates |

### 1.8 CLI Diagnostic Interface (`test_unit_predict_cli.py` — 4 Tests)
| Test ID | Target Function / Feature | Command Invocation | Verification / Expected Result |
| :--- | :--- | :--- | :--- |
| `UT_CLI_01` | Valid CLI Prediction | `python -m backend.predict --image sample.jpg --crop rice` | Exit code 0, prediction output printed |
| `UT_CLI_02` | Nonexistent Image Flag | `python -m backend.predict --image non_existent.jpg` | Exit code 1, FileNotFoundError handled gracefully |
| `UT_CLI_03` | Invalid Crop Flag | `python -m backend.predict --image sample.jpg --crop invalid` | Exit code 1/2, invalid crop reported |
| `UT_CLI_04` | Terminal ASCII Formatter | `display_result()` helper | Formats prediction dictionary into clean ASCII terminal tables |

---

## 2. Data-Driven Testing (DDT) Suite (`tests/data_driven/` — 15 Scenarios)

**Test Driver:** `tests/data_driven/test_data_driven.py`  
**Dataset Matrix:** `tests/data/test_data_matrix.csv`

| Scenario ID | Crop | Temp (°C) | Humidity (%) | Rain (mm) | Language | Expected Status | Expected Risk | Objective |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `TC_DDT_01` | Rice | 28.5 | 88.0 | 25.0 | `en` | 200 | High | Rice monsoon humid high-risk condition |
| `TC_DDT_02` | Rice | 38.0 | 45.0 | 0.0 | `hi` | 200 | Low / Medium | Arid dry heat condition in Hindi |
| `TC_DDT_03` | Rice | 25.0 | 70.0 | 5.0 | `gu` | 200 | Medium | Moderate risk condition in Gujarati |
| `TC_DDT_04` | Wheat | 18.0 | 85.0 | 12.0 | `en` | 200 | High | Cool damp high rust condition |
| `TC_DDT_05` | Wheat | 32.0 | 40.0 | 0.0 | `pa` | 200 | Low / Medium | Dry harvest condition in Punjabi |
| `TC_DDT_06` | Wheat | 22.0 | 65.0 | 3.0 | `mr` | 200 | Medium | Moderate spring condition in Marathi |
| `TC_DDT_07` | Sugarcane | 30.0 | 92.0 | 45.0 | `en` | 200 | High | Heavy rain saturation condition |
| `TC_DDT_08` | Sugarcane | 41.0 | 35.0 | 0.0 | `ta` | 200 | Low / Medium | Extreme heatwave condition in Tamil |
| `TC_DDT_09` | Sugarcane | 29.0 | 72.0 | 8.0 | `te` | 200 | Medium / High | Humid tropical condition in Telugu |
| `TC_DDT_10` | Cotton | 31.0 | 85.0 | 20.0 | `en` | 200 | High | Warm wet bacterial blight condition |
| `TC_DDT_11` | Cotton | 44.0 | 30.0 | 0.0 | `bn` | 200 | Low / Medium | Arid peak summer condition in Bengali |
| `TC_DDT_12` | Cotton | 27.0 | 68.0 | 4.0 | `gu` | 200 | Medium | Semi-arid boundary in Gujarati |
| `TC_DDT_13` | Rice | 29.0 | 95.0 | 60.0 | `hi` | 200 | High | Tropical monsoon saturation in Hindi |
| `TC_DDT_14` | Barley | 25.0 | 60.0 | 0.0 | `en` | 400 | N/A | Negative test: Invalid unsupported crop rejected |
| `TC_DDT_15` | Wheat | -5.0 | 90.0 | 10.0 | `en` | 200 | High | Sub-zero temperature boundary validation |

---

## 3. Keyword-Driven Testing (KDT) Suite (`tests/keyword_driven/` — 4 Scenarios / 24 Steps)

**Engine:** `tests/keyword_driven/keyword_engine.py`  
**Keyword Spreadsheet:** `tests/data/keyword_test_suite.csv`  
**Test Runner:** `tests/keyword_driven/test_keyword_driven.py`

| Scenario ID | Test Scenario Description | Key Action Flow |
| :--- | :--- | :--- |
| `TS_KDT_01` | Standard Rice Blast Diagnostic Flow | `CHECK_HEALTH` $\rightarrow$ `SELECT_CROP` (rice) $\rightarrow$ `OVERRIDE_WEATHER` (28°C, 88%) $\rightarrow$ `UPLOAD_IMAGE` $\rightarrow$ `EXECUTE_PREDICTION` $\rightarrow$ `VERIFY_RISK_LEVEL` (High) $\rightarrow$ `VERIFY_PREDICTION_FIELD` (top3) |
| `TS_KDT_02` | Wheat Rust Microclimate Risk Assessment | `SELECT_CROP` (wheat) $\rightarrow$ `OVERRIDE_WEATHER` (18°C, 85%) $\rightarrow$ `FORECAST_7DAY_RISK` $\rightarrow$ `VERIFY_PREDICTION_FIELD` (seven_day_outlook) |
| `TS_KDT_03` | Sugarcane Interactive Assistant Session | `SELECT_CROP` (sugarcane) $\rightarrow$ `START_ASSISTANT_SESSION` $\rightarrow$ `ASK_ASSISTANT_QUESTION` ("What is the recommended treatment protocol?") |
| `TS_KDT_04` | Cotton Negative Validation & Health Check | `CHECK_HEALTH` $\rightarrow$ `SELECT_CROP` (banana) $\rightarrow$ `EXECUTE_PREDICTION` $\rightarrow$ `VERIFY_PREDICTION_FIELD` (status=400) |

---

## 4. End-to-End Selenium Testing Suite (`tests/e2e/` — 6 Scenarios)

**Test Driver:** `tests/e2e/test_selenium_flora.py`  
**Browser:** Google Chrome (Headless W3C WebDriver)

| Test ID | Scenario | Verification Criteria |
| :--- | :--- | :--- |
| `TC_E2E_01` | Home Page Load & Branding | Browser title contains `"FloraAI"`, hero headline visible, scan CTA exists |
| `TC_E2E_02` | Scanner Navigation | Navigating to `/scan` displays crop selector grid and image upload area |
| `TC_E2E_03` | Crop Selection Interaction | Clicking Rice, Wheat, Sugarcane, Cotton updates active button styling |
| `TC_E2E_04` | Language Switcher | Toggling language selector updates UI strings across English / Indic languages |
| `TC_E2E_05` | Image Upload Interaction | File input accepts `.jpg` leaf image and updates preview component |
| `TC_E2E_06` | Mobile Responsive Viewport | Resizing to 390px $\times$ 844px verifies zero horizontal scrollbar overflow |

---

## 5. Performance & Load Testing (`tests/performance/` — 550 Requests)

**JMeter JMX Plan:** `tests/performance/flora_ai_performance_plan.jmx`  
**Execution Runner:** `tests/performance/run_jmeter_simulation.py`

| Test Scenario | Concurrency Profile | Target Endpoint | Performance Thresholds & Actuals |
| :--- | :--- | :--- | :--- |
| `TC_PERF_01` | 20 Virtual Users, 200 Requests | `GET /api/health` | Error Rate $0.0\%$, Latency p95 $< 100\text{ ms}$ (Actual: 53.12 ms), Throughput $> 200\text{ RPS}$ (Actual: 301.45 RPS) |
| `TC_PERF_02` | 25 Virtual Users, 200 Requests | `GET /api/crops` | Error Rate $0.0\%$, Latency p95 $< 100\text{ ms}$ (Actual: 70.99 ms), Throughput $> 300\text{ RPS}$ (Actual: 473.00 RPS) |
| `TC_PERF_03` | 25 Virtual Users, 150 Requests | `GET /api/weather/forecast-risk` | Error Rate $0.0\%$, p50 62.4 ms, Throughput 42.5 RPS via `@lru_cache` optimization |

---

## 6. OWASP ZAP Security Audit (`tests/security/` — 6 Test Suites)

**Test Driver:** `tests/security/test_zap_security_scan.py`

| Test ID | Vulnerability Category | Injected Payloads | Security Rule Verified |
| :--- | :--- | :--- | :--- |
| `TC_SEC_01` | SQL Injection (SQLi) | `' OR '1'='1`, `1; DROP TABLE users;--` | No unhandled 500 exceptions, no database error leaks |
| `TC_SEC_02` | Cross-Site Scripting (XSS) | `<script>alert('XSS')</script>`, `<img src=x onerror=alert(1)>` | Output encoded as JSON string literal, no unescaped HTML |
| `TC_SEC_03` | Directory / Path Traversal | `../../../../windows/win.ini`, `../../../../etc/passwd` | System files never leaked; rejected with 400/404/422 |
| `TC_SEC_04` | Malicious File Upload | 0-byte file, PHP polyglot script (`shell.php.jpg`) | Rejected with 400/422, PHP payload unexecuted |
| `TC_SEC_05` | CORS Origin Misconfiguration | `Origin: http://malicious-agri-phish.com` | Untrusted origin is NOT reflected with Access-Control credentials |
| `TC_SEC_06` | Security Response Headers | Baseline HTTP headers | Explicit `Content-Type: application/json`, no OS/framework banner leaks |

---

## 7. Mutation Testing Suite (`tests/mutation/` — 25 Mutants / 100% MSI)

**Execution Script:** `tests/mutation/run_mutation_tests.py`  
**Target Module:** `backend/forecasting.py`

| Operator Category | Applied Mutations | Mutants Tested | Mutants Killed | Mutation Score Indicator |
| :--- | :--- | :---: | :---: | :---: |
| **Comparison Inversion** | Swap `>` $\rightarrow$ `<=`, `<` $\rightarrow$ `>=`, `==` $\rightarrow$ `!=` | 8 | 8 | **100.0%** |
| **Arithmetic Mutation** | Invert `+` $\rightarrow$ `-`, `*` $\rightarrow$ `/`, `**` $\rightarrow$ `*` | 7 | 7 | **100.0%** |
| **Logical / Boolean** | Swap `and` $\rightarrow$ `or`, `True` $\rightarrow$ `False` | 5 | 5 | **100.0%** |
| **Numeric Boundary** | Mutate threshold constants ($\pm 1$, inverted RH bounds) | 5 | 5 | **100.0%** |
| **Total** | **All Injected AST Mutations** | **25** | **25** | **100.00%** |
