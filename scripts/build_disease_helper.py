import json
from pathlib import Path

locales_dir = Path("backend/locales")
langs = ["en", "hi", "gu", "mr", "ta", "te", "bn", "pa"]

disease_names: dict[str, dict[str, str]] = {}

for lang in langs:
    fpath = locales_dir / lang / "diseases.json"
    if not fpath.exists():
        continue
    data = json.loads(fpath.read_text(encoding="utf-8"))
    for dkey, val in data.items():
        disp = val.get("display", "")
        if dkey not in disease_names:
            disease_names[dkey] = {}
        disease_names[dkey][lang] = disp

# Add aliases for standard display/prediction names
aliases = {
    "Rice Blast": "leaf_blast",
    "rice_blast": "leaf_blast",
    "Leaf Blast": "leaf_blast",
    "rice_leaf_blast": "leaf_blast",
    "Blast": "blast",
    "blast": "blast",
    "Brown Spot": "brown_spot",
    "rice_brown_spot": "brown_spot",
    "Bacterial Leaf Blight": "bacterial_leaf_blight",
    "rice_bacterial_leaf_blight": "bacterial_leaf_blight",
    "Sheath Blight": "sheath_blight",
    "rice_sheath_blight": "sheath_blight",
    "Leaf Scald": "leaf_scald",
    "Rice Hispa": "hispa",
    "hispa": "hispa",
    "Tungro": "tungro",
    "tungro": "tungro",
    "Yellow Rust": "yellow_rust",
    "Brown Rust": "brown_rust",
    "Black Rust": "black_rust",
    "Powdery Mildew": "mildew",
    "Loose Smut": "smut",
    "Septoria": "septoria",
    "Tan Spot": "tan_spot",
    "Aphid": "aphid",
    "Bacterial Blight": "bacterial_blight",
    "Mosaic Disease": "mosaic_disease",
    "Healthy": "healthy",
    "healthy": "healthy",
    "normal": "normal",
}

for alias, target in aliases.items():
    if target in disease_names:
        disease_names[alias] = disease_names[target].copy()

# Fix Rice Blast Gujarati display explicitly if needed
if "Rice Blast" in disease_names:
    disease_names["Rice Blast"]["gu"] = "ડાંગરનો બ્લાસ્ટ રોગ (પાનનો બ્લાસ્ટ)"
    disease_names["Rice Blast"]["hi"] = "धान का झोंका रोग (ब्लास्ट)"
if "leaf_blast" in disease_names:
    disease_names["leaf_blast"]["gu"] = "ડાંગરનો બ્લાસ્ટ રોગ (પાનનો બ્લાસ્ટ)"

organic_steps = {
    "en": [
        "Apply 2% cold-pressed neem oil spray in the late afternoon every 5 to 7 days.",
        "Dust wood ash or use organic copper-based Bordeaux mixture (1%) for fungal deterrence.",
        "Incorporate Trichoderma bio-agent into soil root zones during evening watering.",
        "Remove infected debris away from fields and burn or deeply bury it."
    ],
    "gu": [
        "દર 5 થી 7 દિવસે મોડી બપોરે 2% લીમડાના તેલનો (નીમ ઓઈલ) છંટકાવ કરો.",
        "ફૂગ અટકાવવા માટે લાકડાની રાખ છાંટો અથવા ઓર્ગેનિક બોર્ડો મિશ્રણ (1%) વાપરો.",
        "સાંજે પિયત આપતી વખતે જમીનમાં મૂળ પાસે ટ્રાઇકોડર્મા જૈવિક નિયંત્રક ઉમેરો.",
        "રોગવાળા પાંદડા અને કચરો ખેતરથી દૂર લઈ જઈ ઊંડા ખાડામાં દાટો અથવા બાળી દો."
    ],
    "hi": [
        "हर 5 से 7 दिन में देर दोपहर 2% नीम के तेल का छिड़काव करें।",
        "फफूंद रोकने के लिए लकड़ी की राख छिड़कें या 1% जैविक बोर्डो मिश्रण का उपयोग करें।",
        "शाम को सिंचाई के दौरान जड़ों के पास ट्राइकोडर्मा जैविक नियंत्रण एजेंट डालें।",
        "संक्रमित पत्तियों और मलबे को खेत से दूर ले जाकर नष्ट करें या गहरा दबा दें।"
    ],
    "mr": [
        "दर ५ ते ७ दिवसांनी संध्याकाळी २% कडुनिंबाच्या तेलाची फवारणी करा.",
        "बुरशी नियंत्रणासाठी लाकडाची राख किंवा १% सेंद्रिय बोर्डो मिश्रण वापरा.",
        "संध्याकाळी पाणी देताना मुळांजवळ ट्रायकोडर्मा जैविक घटक मिसळा.",
        "रोगट पाने आणि अवशेष शेताबाहेर नेऊन नष्ट करा किंवा जमिनीत गाडून टाका."
    ],
    "ta": [
        "ஒவ்வொரு 5 முதல் 7 நாட்களுக்கு ஒருமுறை மாலையில் 2% வேப்பெண்ணெய் தெளிக்கவும்.",
        "பூஞ்சையைக் கட்டுப்படுத்த மரச் சாம்பல் அல்லது 1% போர்டோ கலவையைப் பயன்படுத்தவும்.",
        "மாலையில் நீர்ப்பாசனம் செய்யும் போது ட்ரைக்கோடெர்மா உயிரியல் காரணியை வேர் பகுதியில் இடவும்.",
        "பாதிக்கப்பட்ட இலைகள் மற்றும் பயிர் எச்சங்களை வயலிலிருந்து அகற்றி அழிக்கவும்."
    ],
    "te": [
        "ప్రతి 5 నుండి 7 రోజులకు ఒకసారి సాయంత్రం వేళల్లో 2% వేపనూనె పిచికారీ చేయండి.",
        "శిలీంధ్రాల నివారణకు బూడిద లేదా 1% బోర్డో మిశ్రమాన్ని ఉపయోగించండి.",
        "సాయంత్రం నీటిపారుదల సమయంలో వేర్ల వద్ద ట్రైకోడెర్మా జీవ నియంత్రణ కారకాన్ని కలపండి.",
        "తెగులు సోకిన ఆకులు మరియు వ్యర్థాలను పొలం నుండి తొలగించి నాశనం చేయండి."
    ],
    "bn": [
        "প্রতি ৫ থেকে ৭ দিন পর পর বিকেলে ২% নিম তেলের স্প্রে প্রয়োগ করুন।",
        "ছত্রাক দমনে কাঠের ছাই ছিটান বা ১% জৈব বোর্দো মিশ্রণ ব্যবহার করুন।",
        "বিকেলে সেচের সময় শিকড়ের কাছে ট্রাইকোডার্মা বায়ো-এজেন্ট মিশিয়ে দিন।",
        "আক্রান্ত পাতা ও আবর্জনা মাঠ থেকে দূরে সরিয়ে পুড়িয়ে ফেলুন বা মাটিতে পুঁতে দিন।"
    ],
    "pa": [
        "ਹਰ 5 ਤੋਂ 7 ਦਿਨਾਂ ਬਾਅਦ ਸ਼ਾਮ ਵੇਲੇ 2% ਨਿੰਮ ਦੇ ਤੇਲ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।",
        "ਉੱਲੀ ਰੋਕਣ ਲਈ ਲੱਕੜ ਦੀ ਸੁਆਹ ਛਿੜਕੋ ਜਾਂ 1% ਜੈਵਿਕ ਬੋਰਡੋ ਮਿਸ਼ਰਣ ਵਰਤੋ।",
        "ਸ਼ਾਮ ਨੂੰ ਪਾਣੀ ਲਾਉਣ ਵੇਲੇ ਜੜ੍ਹਾਂ ਕੋਲ ਟ੍ਰਾਈਕੋਡਰਮਾ ਜੈਵਿਕ ਏਜੰਟ ਪਾਓ।",
        "ਰੋਗੀ ਪੱਤੇ ਅਤੇ ਰਹਿੰਦ-ਖੂੰਹਦ ਖੇਤ ਤੋਂ ਦੂਰ ਲੈ ਜਾ ਕੇ ਸਾੜ ਦਿਓ ਜਾਂ ਦੱਬ ਦਿਓ।"
    ]
}

weather_conditions = {
    "Overcast with Rain": { "en": "Overcast with Rain", "gu": "વાદળછાયું અને વરસાદ", "hi": "बादल छाए रहने के साथ बारिश", "mr": "ढगाळ वातावरण आणि पाऊस", "ta": "மேகமூட்டத்துடன் மழை", "te": "మేఘావృతంతో కూడిన వర్షం", "bn": "মেঘলা ও বৃষ্টি", "pa": "ਬੱਦਲਵਾਈ ਅਤੇ ਮੀਂਹ" },
    "Rain Showers": { "en": "Rain Showers", "gu": "વરસાદી ઝાપટાં", "hi": "बारिश की फुहारें", "mr": "पावसाच्या सरी", "ta": "மழை தூறல்", "te": "వర్షపు జల్లులు", "bn": "বৃষ্টির ঝাপটা", "pa": "ਮੀਂਹ ਦੀਆਂ ਫੁਹਾਰਾਂ" },
    "Drizzle / Light Rain": { "en": "Drizzle / Light Rain", "gu": "ઝરમર / હળવો વરસાદ", "hi": "बूंदाबांदी / हल्की बारिश", "mr": "रिमझिम / हलका पाऊस", "ta": "தூறல் / லேசான மழை", "te": "చినుకులు / తేలికపాటి వర్షం", "bn": "গুঁড়ি গুঁড়ি / হালকা বৃষ্টি", "pa": "ਬੂੰਦਾ-ਬਾਂਦੀ / ਹਲਕਾ ਮੀਂਹ" },
    "Humid & Overcast": { "en": "Humid & Overcast", "gu": "ભેજવાળું અને વાદળછાયું", "hi": "नमी और बादल", "mr": "दमट आणि ढगाळ", "ta": "ஈரப்பதம் மற்றும் மேகமூட்டம்", "te": "తేమ మరియు మేఘావృతం", "bn": "আর্দ্র ও মেঘলা", "pa": "ਸਿੱਲ੍ਹਾ ਅਤੇ ਬੱਦਲਵਾਈ" },
    "Hot & Sunny": { "en": "Hot & Sunny", "gu": "ગરમ અને તડકો", "hi": "गर्म और धूप", "mr": "उष्ण आणि ऊन", "ta": "சூடான மற்றும் வெயில்", "te": "వేడి మరియు ఎండ", "bn": "গরম ও রোদ", "pa": "ਗਰਮ ਅਤੇ ਧੁੱਪ" },
    "Partly Humid": { "en": "Partly Humid", "gu": "અંશતઃ ભેજવાળું", "hi": "हल्की नमी", "mr": "अंशतः दमट", "ta": "ஓரளவு ஈரப்பதம்", "te": "కొంత తేమ", "bn": "কিছুটা আর্দ্র", "pa": "ਕੁੱਝ ਸਿੱਲ੍ਹਾ" },
    "Mostly Sunny": { "en": "Mostly Sunny", "gu": "મુખ્યત્વે તડકો", "hi": "ज्यादातर धूप", "mr": "बहुतेक ऊन", "ta": "பெரும்பாலும் வெயில்", "te": "ఎక్కువగా ఎండ", "bn": "বেশিরভাগ সময় রোদ", "pa": "ਜ਼ਿਆਦਾਤਰ ਧੁੱਪ" },
    "Partly Cloudy": { "en": "Partly Cloudy", "gu": "આંશિક વાદળછાયું", "hi": "आंशिक बादल", "mr": "अंशतः ढगाळ", "ta": "பகுதி மேகமூட்டம்", "te": "పాక్షికంగా మేఘావృతం", "bn": "আংশিক মেঘলা", "pa": "ਕੁੱਝ ਬੱਦਲਵਾਈ" },
    "Thunderstorm": { "en": "Thunderstorm", "gu": "વાવાઝોડું અને વરસાદ", "hi": "तूफान और बारिश", "mr": "वादळी पाऊस", "ta": "இடியுடன் கூடிய மழை", "te": "ఉరుములతో కూడిన వర్షం", "bn": "বজ্রঝড়", "pa": "ਗਰਜ ਨਾਲ ਤੂਫਾਨ" },
    "Rain": { "en": "Rain", "gu": "વરસાદ", "hi": "बारिश", "mr": "पाऊस", "ta": "மழை", "te": "వర్షం", "bn": "বৃষ্টি", "pa": "ਮੀਂਹ" },
    "Clear": { "en": "Clear", "gu": "ચોખ્ખું આકાશ", "hi": "साफ मौसम", "mr": "स्वच्छ आकाश", "ta": "தெளிவான வானம்", "te": "స్పష్టమైన ఆకాశం", "bn": "পরিষ্কার আকাশ", "pa": "ਸਾਫ ਮੌਸਮ" },
    "Moderate": { "en": "Moderate", "gu": "સાધારણ", "hi": "मध्यम", "mr": "मध्यम", "ta": "மிதமான", "te": "మధ్యస్థం", "bn": "মাঝারি", "pa": "ਦਰਮਿਆਨਾ" },
}

weather_risks = {
    "High": { "en": "High", "gu": "વધુ જોખમ", "hi": "ज़्यादा खतरा", "mr": "जास्त धोका", "ta": "அதிக ஆபத்து", "te": "ఎక్కువ ప్రమాదం", "bn": "বেশি ঝুঁকি", "pa": "ਜ਼ਿਆਦਾ ਖਤਰਾ" },
    "High Risk": { "en": "High Risk", "gu": "વધુ જોખમ", "hi": "ज़्यादा खतरा", "mr": "जास्त धोका", "ta": "அதிக ஆபத்து", "te": "ఎక్కువ ప్రమాదం", "bn": "বেশি ঝুঁকি", "pa": "ਜ਼ਿਆਦਾ ਖਤਰਾ" },
    "Medium": { "en": "Medium", "gu": "મધ્યમ જોખમ", "hi": "मध्यम खतरा", "mr": "मध्यम धोका", "ta": "மிதமான ஆபத்து", "te": "మధ్యస్థ ప్రమాదం", "bn": "মাঝারি ঝুঁকি", "pa": "ਦਰਮਿਆਨਾ ਖਤਰਾ" },
    "Medium Risk": { "en": "Medium Risk", "gu": "મધ્યમ જોખમ", "hi": "मध्यम खतरा", "mr": "मध्यम धोका", "ta": "மிதமான ஆபத்து", "te": "మధ్యస్థ ప్రమాదం", "bn": "মাঝারি ঝুঁকি", "pa": "ਦਰਮਿਆਨਾ ਖਤਰਾ" },
    "Low": { "en": "Low", "gu": "ઓછું જોખમ", "hi": "कम खतरा", "mr": "कमी धोका", "ta": "குறைந்த ஆபத்து", "te": "తక్కువ ప్రమాదం", "bn": "কম ঝুঁকি", "pa": "ਘੱਟ ਖਤਰਾ" },
    "Low Risk": { "en": "Low Risk", "gu": "ઓછું જોખમ", "hi": "कम खतरा", "mr": "कमी धोका", "ta": "குறைந்த ஆபத்து", "te": "తక్కువ ప్రమాదం", "bn": "কম ঝুঁকি", "pa": "ਘੱਟ ਖਤਰਾ" },
}

output_code = f"""import type {{ LangCode }} from "./translations"
import {{ LOCALIZED_DISEASES, type LocalizedDiseaseEntry }} from "./diseaseData"

export const DISEASE_NAMES_LOCALIZED: Record<string, Partial<Record<LangCode, string>>> = {json.dumps(disease_names, ensure_ascii=False, indent=2)};

export const ORGANIC_STEPS: Record<LangCode, string[]> = {json.dumps(organic_steps, ensure_ascii=False, indent=2)};

export const WEATHER_CONDITIONS_LOCALIZED: Record<string, Partial<Record<LangCode, string>>> = {json.dumps(weather_conditions, ensure_ascii=False, indent=2)};

export const WEATHER_RISK_LOCALIZED: Record<string, Partial<Record<LangCode, string>>> = {json.dumps(weather_risks, ensure_ascii=False, indent=2)};

export function normalizeDiseaseKey(rawName: string | undefined | null): string {{
  if (!rawName) return ''
  let cleaned = rawName.trim().toLowerCase()
  cleaned = cleaned.replace(/^(rice|wheat|cotton|sugarcane)[\\s_]+/i, '')
  cleaned = cleaned.replace(/[\\s-]+/g, '_').replace(/_+$/, '')
  return cleaned
}}

export function localizeDiseaseName(rawName: string | undefined | null, lang: LangCode): string {{
  if (!rawName) return ''
  const trimmed = rawName.trim()
  if (DISEASE_NAMES_LOCALIZED[trimmed]?.[lang]) {{
    return DISEASE_NAMES_LOCALIZED[trimmed]![lang]!
  }}
  const normKey = normalizeDiseaseKey(trimmed)
  if (DISEASE_NAMES_LOCALIZED[normKey]?.[lang]) {{
    return DISEASE_NAMES_LOCALIZED[normKey]![lang]!
  }}
  if (normKey === 'blast' && DISEASE_NAMES_LOCALIZED['leaf_blast']?.[lang]) {{
    return DISEASE_NAMES_LOCALIZED['leaf_blast']![lang]!
  }}
  // Try directly in LOCALIZED_DISEASES
  if (LOCALIZED_DISEASES[normKey]?.[lang]?.display) {{
    return LOCALIZED_DISEASES[normKey]![lang]!.display
  }}
  if (normKey === 'blast' && LOCALIZED_DISEASES['leaf_blast']?.[lang]?.display) {{
    return LOCALIZED_DISEASES['leaf_blast']![lang]!.display
  }}
  for (const k of Object.keys(LOCALIZED_DISEASES)) {{
    if (k.includes(normKey) || normKey.includes(k)) {{
      if (LOCALIZED_DISEASES[k]?.[lang]?.display) {{
        return LOCALIZED_DISEASES[k]![lang]!.display
      }}
    }}
  }}
  return trimmed.replace(/_/g, ' ')
}}

export function getLocalizedDiseaseInfo(rawName: string | undefined | null, lang: LangCode): LocalizedDiseaseEntry {{
  const normKey = normalizeDiseaseKey(rawName)
  // Direct match
  if (LOCALIZED_DISEASES[normKey]?.[lang]) {{
    return LOCALIZED_DISEASES[normKey]![lang]!
  }}
  if (normKey === 'blast' && LOCALIZED_DISEASES['leaf_blast']?.[lang]) {{
    return LOCALIZED_DISEASES['leaf_blast']![lang]!
  }}
  // Partial match
  for (const k of Object.keys(LOCALIZED_DISEASES)) {{
    if (k === normKey || k.includes(normKey) || normKey.includes(k)) {{
      if (LOCALIZED_DISEASES[k]?.[lang]) {{
        return LOCALIZED_DISEASES[k]![lang]!
      }}
    }}
  }}
  // Fallback to English
  if (LOCALIZED_DISEASES[normKey]?.['en']) {{
    return LOCALIZED_DISEASES[normKey]!['en']!
  }}
  return {{
    display: rawName || 'Plant Condition',
    crop: '',
    severity: '',
    description: '',
    causes: '',
    treatment: '',
    prevention: '',
  }}
}}

export function localizeWeatherRisk(risk: string | undefined | null, lang: LangCode): string {{
  if (!risk) return ''
  const trimmed = risk.trim()
  return WEATHER_RISK_LOCALIZED[trimmed]?.[lang] || trimmed
}}

export function localizeWeatherCondition(cond: string | undefined | null, lang: LangCode): string {{
  if (!cond) return ''
  const trimmed = cond.trim()
  return WEATHER_CONDITIONS_LOCALIZED[trimmed]?.[lang] || trimmed
}}
"""

out_file = Path("frontend/src/i18n/diseaseHelper.ts")
out_file.write_text(output_code, encoding="utf-8")
print(f"Wrote clean UTF-8 {out_file} with {len(disease_names)} disease keys.")
