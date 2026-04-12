"""
disease_info.py
================
Comprehensive knowledge base for all trained crop disease classes.
Covers Rice (6 + 10 classes), Wheat (15), Sugarcane (3), Cotton (3).
Provides: description, causes, treatment, favorable weather conditions, chatbot answers.
"""

# ── Knowledge Base ─────────────────────────────────────────────────────────────
# Key = lowercase normalized disease name (underscores, no spaces)
DISEASE_DB = {

    # ── RICE DISEASES (rice_disease model - 6 classes) ─────────────────────────
    "bacterial_leaf_blight": {
        "display":      "Bacterial Leaf Blight",
        "crop":         "Rice",
        "severity":     "High",
        "description":  "A serious bacterial disease caused by Xanthomonas oryzae pv. oryzae. Leaves show water-soaked margins that turn yellow and eventually white.",
        "causes":       "Warm temperatures (25–30°C), high humidity, and typhoon/rain-splash that spreads the bacteria through leaf wounds.",
        "treatment":    "Apply copper-based bactericides. Remove infected plant debris. Use resistant varieties. Avoid excessive nitrogen fertilization.",
        "prevention":   "Use certified disease-free seeds. Maintain field drainage. Apply balanced fertilization.",
        "favorable_conditions": {
            "temperature": "25–35°C",
            "humidity":    ">80%",
            "rainfall":    "Heavy (storm/flooding)",
        },
        "weather_weights": {"temperature": 0.30, "humidity": 0.50, "rainfall": 0.20},
    },

    "brown_spot": {
        "display":      "Brown Spot",
        "crop":         "Rice",
        "severity":     "Medium",
        "description":  "Fungal disease caused by Cochliobolus miyabeanus. Oval to circular brown lesions with yellow halos appear on leaves.",
        "causes":       "Associated with nutrient-deficient soils (especially potassium and silicon). Favoured by warm humid conditions and poor soil health.",
        "treatment":    "Apply mancozeb or iprodione fungicide. Correct soil nutrient deficiencies (potassium, silicon). Reduce dense planting.",
        "prevention":   "Balanced fertilization, well-drained soils, disease-resistant varieties.",
        "favorable_conditions": {
            "temperature": "22–32°C",
            "humidity":    "75–90%",
            "rainfall":    "Moderate",
        },
        "weather_weights": {"temperature": 0.25, "humidity": 0.45, "rainfall": 0.30},
    },

    "healthy": {
        "display":      "Healthy",
        "crop":         "All",
        "severity":     "None",
        "description":  "The leaf appears healthy with no visible disease symptoms.",
        "causes":       "N/A",
        "treatment":    "Continue regular monitoring and preventive care.",
        "prevention":   "Maintain good agronomic practices, balanced fertilization, and proper irrigation.",
        "favorable_conditions": {
            "temperature": "Any",
            "humidity":    "Any",
            "rainfall":    "Regular",
        },
        "weather_weights": {"temperature": 0.33, "humidity": 0.33, "rainfall": 0.34},
    },

    "leaf_blast": {
        "display":      "Leaf Blast",
        "crop":         "Rice",
        "severity":     "Very High",
        "description":  "One of the most destructive rice diseases, caused by Magnaporthe oryzae. Diamond-shaped lesions with grey centres and brown borders appear on leaves.",
        "causes":       "Cool nights, warm days, high humidity (>90%), heavy dew, excessive nitrogen application, and susceptible varieties.",
        "treatment":    "Apply fungicides: tricyclazole, isoprothiolane, or azoxystrobin. Reduce nitrogen fertilizer. Drain fields to reduce humidity.",
        "prevention":   "Use blast-resistant varieties. Avoid excess nitrogen. Ensure good airflow between plants.",
        "favorable_conditions": {
            "temperature": "20–28°C",
            "humidity":    ">90%",
            "rainfall":    "Frequent light rain/dew",
        },
        "weather_weights": {"temperature": 0.20, "humidity": 0.55, "rainfall": 0.25},
    },

    "leaf_scald": {
        "display":      "Leaf Scald",
        "crop":         "Rice",
        "severity":     "Medium",
        "description":  "Caused by Microdochium oryzae. Alternating light and dark brown bands appear along leaf margins creating a 'zonate' pattern.",
        "causes":       "High humidity, warm temperatures, and dense planting that reduces airflow.",
        "treatment":    "Apply propiconazole or carbendazim fungicide. Improve field drainage and plant spacing.",
        "prevention":   "Wider row spacing, balanced nutrients, resistant varieties.",
        "favorable_conditions": {
            "temperature": "25–30°C",
            "humidity":    ">80%",
            "rainfall":    "Moderate to heavy",
        },
        "weather_weights": {"temperature": 0.30, "humidity": 0.45, "rainfall": 0.25},
    },

    "sheath_blight": {
        "display":      "Sheath Blight",
        "crop":         "Rice",
        "severity":     "High",
        "description":  "Caused by Rhizoctonia solani. Oval greenish-grey lesions with dark brown borders appear on leaf sheaths, spreading to leaves.",
        "causes":       "High humidity (>90%), temperatures of 28–32°C, dense planting, high nitrogen levels, and flooded conditions that allow mycelium spread.",
        "treatment":    "Apply validamycin, hexaconazole, or propiconazole fungicides. Reduce plant density. Minimize canopy humidity.",
        "prevention":   "Lower seeding rates, balanced fertilization, water management.",
        "favorable_conditions": {
            "temperature": "28–32°C",
            "humidity":    ">90%",
            "rainfall":    "Heavy flooding",
        },
        "weather_weights": {"temperature": 0.25, "humidity": 0.50, "rainfall": 0.25},
    },

    # ── WHEAT DISEASES (15 classes) ────────────────────────────────────────────
    "aphid": {
        "display":      "Aphid Infestation",
        "crop":         "Wheat",
        "severity":     "Medium",
        "description":  "Small soft-bodied insects that cluster on leaves and stems, sucking plant sap and potentially transmitting viruses.",
        "causes":       "Warm dry conditions, absence of natural predators, and dense planting.",
        "treatment":    "Apply imidacloprid or lambda-cyhalothrin insecticide. Encourage natural predators (ladybugs).",
        "prevention":   "Early planting, crop rotation, avoid excessive nitrogen.",
        "favorable_conditions": {
            "temperature": "15–25°C",
            "humidity":    "<60%",
            "rainfall":    "Low",
        },
        "weather_weights": {"temperature": 0.40, "humidity": 0.35, "rainfall": 0.25},
    },

    "black_rust": {
        "display":      "Black Rust (Stem Rust)",
        "crop":         "Wheat",
        "severity":     "Very High",
        "description":  "Caused by Puccinia graminis. Produces brick-red to black pustules on stems and leaves. Can devastate entire crops.",
        "causes":       "Warm temperatures (15–30°C), dew, and wind-blown spores from nearby infected fields.",
        "treatment":    "Apply propiconazole, tebuconazole, or trifloxystrobin fungicides at early stages.",
        "prevention":   "Plant resistant varieties. Early sowing. Remove volunteer wheat plants.",
        "favorable_conditions": {
            "temperature": "15–30°C",
            "humidity":    ">80%",
            "rainfall":    "Moderate with dew",
        },
        "weather_weights": {"temperature": 0.35, "humidity": 0.45, "rainfall": 0.20},
    },

    "blast": {
        "display":      "Wheat Blast",
        "crop":         "Wheat",
        "severity":     "Very High",
        "description":  "Caused by Magnaporthe triticum. Bleached spikes and grains are hallmarks. Can cause complete crop failure.",
        "causes":       "Warm temperatures (>25°C), high humidity, rainfall during flowering, and dense planting.",
        "treatment":    "Apply triazole fungicides (tebuconazole). Remove and destroy infected material.",
        "prevention":   "Use tolerant varieties, avoid late sowing, ensure good airflow.",
        "favorable_conditions": {
            "temperature": ">25°C",
            "humidity":    ">70%",
            "rainfall":    "Rain during heading",
        },
        "weather_weights": {"temperature": 0.30, "humidity": 0.45, "rainfall": 0.25},
    },

    "brown_rust": {
        "display":      "Brown Rust (Leaf Rust)",
        "crop":         "Wheat",
        "severity":     "High",
        "description":  "Caused by Puccinia triticina. Orange-brown pustules on upper leaf surface. Very common and widespread.",
        "causes":       "Moderate temperatures (15–22°C), dew, and humid conditions.",
        "treatment":    "Fungicides: propiconazole, mancozeb. Apply at early infection stage.",
        "prevention":   "Resistant varieties, timely sowing, crop rotation.",
        "favorable_conditions": {
            "temperature": "15–22°C",
            "humidity":    ">70%",
            "rainfall":    "Light rain/dew",
        },
        "weather_weights": {"temperature": 0.35, "humidity": 0.45, "rainfall": 0.20},
    },

    "common_root_rot": {
        "display":      "Common Root Rot",
        "crop":         "Wheat",
        "severity":     "Medium",
        "description":  "Caused by Bipolaris sorokiniana. Brown to black discolouration of crown and root tissues.",
        "causes":       "Dry soil conditions, warm temperatures during seeding, and soil-borne inoculum.",
        "treatment":    "Seed treatment with trifloxystrobin + tebuconazole. Crop rotation with non-cereal crops.",
        "prevention":   "Balanced soil fertility, avoid continuous wheat, proper seeding depth.",
        "favorable_conditions": {
            "temperature": "18–28°C",
            "humidity":    "Low soil moisture",
            "rainfall":    "Insufficient",
        },
        "weather_weights": {"temperature": 0.40, "humidity": 0.30, "rainfall": 0.30},
    },

    "fusarium_head_blight": {
        "display":      "Fusarium Head Blight (Scab)",
        "crop":         "Wheat",
        "severity":     "Very High",
        "description":  "Caused by Fusarium graminearum. Bleached spikelets with pink mold. Produces mycotoxins (DON) that contaminate grain.",
        "causes":       "Wet conditions during flowering (anthesis), temperatures of 25–30°C, and crop residues.",
        "treatment":    "Apply thiophanate-methyl or metconazole at early flowering. Remove infected debris.",
        "prevention":   "Resistant varieties, tillage to bury residues, good drainage.",
        "favorable_conditions": {
            "temperature": "25–30°C",
            "humidity":    ">90%",
            "rainfall":    "Rain during flowering",
        },
        "weather_weights": {"temperature": 0.25, "humidity": 0.45, "rainfall": 0.30},
    },

    "leaf_blight": {
        "display":      "Leaf Blight",
        "crop":         "Wheat",
        "severity":     "Medium",
        "description":  "Tan-brown lesions with yellow borders on older leaves.",
        "causes":       "Warm humid conditions and susceptible varieties.",
        "treatment":    "Mancozeb or propiconazole fungicide application.",
        "prevention":   "Crop rotation and use of resistant varieties.",
        "favorable_conditions": {
            "temperature": "20–30°C",
            "humidity":    ">70%",
            "rainfall":    "Moderate",
        },
        "weather_weights": {"temperature": 0.30, "humidity": 0.40, "rainfall": 0.30},
    },

    "mildew": {
        "display":      "Powdery Mildew",
        "crop":         "Wheat",
        "severity":     "Medium",
        "description":  "White powdery coating on leaves, caused by Blumeria graminis. Reduces photosynthesis.",
        "causes":       "Cool temperatures (15–22°C), moderate humidity, and dense canopy.",
        "treatment":    "Apply triadimefon, propiconazole, or sulfur-based fungicides.",
        "prevention":   "Wider row spacing, resistant varieties, early sowing.",
        "favorable_conditions": {
            "temperature": "15–22°C",
            "humidity":    "60–80%",
            "rainfall":    "Low to moderate",
        },
        "weather_weights": {"temperature": 0.40, "humidity": 0.40, "rainfall": 0.20},
    },

    "mite": {
        "display":      "Mite Infestation",
        "crop":         "Wheat",
        "severity":     "Low",
        "description":  "Tiny arachnids causing silvery stippling and bronzing of leaves.",
        "causes":       "Hot, dry conditions. Chemical treatments that kill natural predators.",
        "treatment":    "Apply abamectin or dicofol miticide. Increase irrigation.",
        "prevention":   "Avoid overly dry conditions. Conserve beneficial insects.",
        "favorable_conditions": {
            "temperature": ">30°C",
            "humidity":    "<50%",
            "rainfall":    "Very low",
        },
        "weather_weights": {"temperature": 0.50, "humidity": 0.30, "rainfall": 0.20},
    },

    "septoria": {
        "display":      "Septoria Leaf Blotch",
        "crop":         "Wheat",
        "severity":     "High",
        "description":  "Caused by Zymoseptoria tritici. Pale green-yellow blotches with brown necrosis and pycnidia on leaves.",
        "causes":       "Cool, wet weather (10–20°C), leaf wetness periods >20 hours.",
        "treatment":    "Triazole or SDHI fungicides (epoxiconazole, fluxapyroxad). Early application is key.",
        "prevention":   "Resistant varieties, crop rotation, delayed sowing.",
        "favorable_conditions": {
            "temperature": "10–20°C",
            "humidity":    ">80%",
            "rainfall":    "Frequent rain",
        },
        "weather_weights": {"temperature": 0.30, "humidity": 0.40, "rainfall": 0.30},
    },

    "smut": {
        "display":      "Loose Smut",
        "crop":         "Wheat",
        "severity":     "Medium",
        "description":  "Caused by Ustilago tritici. Spikes replaced by black powdery masses of teliospores.",
        "causes":       "Moderate temperatures during flowering with humid conditions. Seed-borne pathogen.",
        "treatment":    "Seed treatment with carboxin, thiram, or tebuconazole is highly effective.",
        "prevention":   "Use certified smut-free seed. Hot-water seed treatment.",
        "favorable_conditions": {
            "temperature": "16–22°C",
            "humidity":    ">60%",
            "rainfall":    "Moderate during anthesis",
        },
        "weather_weights": {"temperature": 0.35, "humidity": 0.40, "rainfall": 0.25},
    },

    "stem_fly": {
        "display":      "Stem Fly",
        "crop":         "Wheat",
        "severity":     "Medium",
        "description":  "Larval mining inside wheat stems causing 'dead heart' symptoms in young plants.",
        "causes":       "Peak activity during cool temperatures (15–20°C) at early crop stages.",
        "treatment":    "Apply chlorpyrifos or imidacloprid at seedling stage.",
        "prevention":   "Early sowing, treat seeds with systemic insecticide, monitor basal nodes.",
        "favorable_conditions": {
            "temperature": "15–20°C",
            "humidity":    "Any",
            "rainfall":    "Low to moderate",
        },
        "weather_weights": {"temperature": 0.50, "humidity": 0.25, "rainfall": 0.25},
    },

    "tan_spot": {
        "display":      "Tan Spot",
        "crop":         "Wheat",
        "severity":     "Medium",
        "description":  "Caused by Pyrenophora tritici-repentis. Tan-colored oval lesions with yellow borders.",
        "causes":       "Warm temperatures (20–28°C), leaf wetness, and crop residue from previous season.",
        "treatment":    "Apply propiconazole or mancozeb. Tillage to bury residues.",
        "prevention":   "Crop rotation, residue management, resistant varieties.",
        "favorable_conditions": {
            "temperature": "20–28°C",
            "humidity":    ">70%",
            "rainfall":    "Moderate",
        },
        "weather_weights": {"temperature": 0.35, "humidity": 0.40, "rainfall": 0.25},
    },

    "yellow_rust": {
        "display":      "Yellow Rust (Stripe Rust)",
        "crop":         "Wheat",
        "severity":     "Very High",
        "description":  "Caused by Puccinia striiformis. Bright yellow pustules in stripes along leaf veins. Very destructive in cool climates.",
        "causes":       "Cool temperatures (10–15°C), dew and mist, and susceptible varieties.",
        "treatment":    "Apply propiconazole, tebuconazole, or other triazole fungicides early.",
        "prevention":   "Resistant varieties are most effective. Early sowing. Monitor forecasts.",
        "favorable_conditions": {
            "temperature": "10–15°C",
            "humidity":    ">80%",
            "rainfall":    "Dew / light rain",
        },
        "weather_weights": {"temperature": 0.35, "humidity": 0.45, "rainfall": 0.20},
    },

    # ── SUGARCANE DISEASES ─────────────────────────────────────────────────────
    "mosaic_disease": {
        "display":      "Mosaic Disease",
        "crop":         "Sugarcane",
        "severity":     "High",
        "description":  "Caused by Sugarcane Mosaic Virus (SCMV). Mosaic or mottled discolouration of leaves — alternating light and dark green patches.",
        "causes":       "Transmitted by aphids (Rhopalosiphum maidis), infected planting material.",
        "treatment":    "No chemical cure. Remove and destroy infected stools. Control aphid vectors.",
        "prevention":   "Use virus-free seed cane, resistant varieties, control aphid populations.",
        "favorable_conditions": {
            "temperature": "25–30°C",
            "humidity":    "Moderate",
            "rainfall":    "Any",
        },
        "weather_weights": {"temperature": 0.30, "humidity": 0.35, "rainfall": 0.35},
    },

    "rust": {
        "display":      "Sugarcane Rust",
        "crop":         "Sugarcane",
        "severity":     "Medium",
        "description":  "Caused by Puccinia melanocephala. Orange-brown pustules on leaf undersides causing premature leaf death.",
        "causes":       "Warm temperatures (24–28°C), high humidity, and susceptible cultivars.",
        "treatment":    "Apply triadimefon or propiconazole fungicide. Remove severely infected leaves.",
        "prevention":   "Plant resistant varieties. Balanced fertilization.",
        "favorable_conditions": {
            "temperature": "24–28°C",
            "humidity":    ">75%",
            "rainfall":    "Moderate",
        },
        "weather_weights": {"temperature": 0.35, "humidity": 0.45, "rainfall": 0.20},
    },

    # ── COTTON DISEASES ────────────────────────────────────────────────────────
    "bacterial_blight": {
        "display":      "Bacterial Blight",
        "crop":         "Cotton",
        "severity":     "High",
        "description":  "Caused by Xanthomonas axonopodis pv. malvacearum. Angular water-soaked lesions on leaves, black cankers on stems.",
        "causes":       "Warm, humid weather, rain-splash, mechanical damage, and infected seeds.",
        "treatment":    "Apply copper oxychloride or streptomycin spray. Remove infected debris.",
        "prevention":   "Disease-free certified seed, seed treatment, crop rotation.",
        "favorable_conditions": {
            "temperature": "28–35°C",
            "humidity":    ">80%",
            "rainfall":    "Heavy",
        },
        "weather_weights": {"temperature": 0.30, "humidity": 0.45, "rainfall": 0.25},
    },

    "alternaria_leaf_spot": {
        "display":      "Alternaria Leaf Spot",
        "crop":         "Cotton",
        "severity":     "Medium",
        "description":  "Caused by Alternaria macrospora. Dark brown to black circular spots with concentric rings on leaves.",
        "causes":       "High humidity and temperatures of 25–30°C. Most severe on stressed or weakened plants.",
        "treatment":    "Apply mancozeb, chlorothalonil, or iprodione fungicide.",
        "prevention":   "Good drainage, balanced nutrition, remove infected debris.",
        "favorable_conditions": {
            "temperature": "25–30°C",
            "humidity":    ">75%",
            "rainfall":    "Moderate to heavy",
        },
        "weather_weights": {"temperature": 0.30, "humidity": 0.45, "rainfall": 0.25},
    },

    # ── RICE PADDY (10 classes) — additional classes ───────────────────────────
    "blast": {  # already covered by leaf_blast but short key may come from paddy model
        "display":      "Blast (Rice Paddy)",
        "crop":         "Rice",
        "severity":     "Very High",
        "description":  "Magnaporthe oryzae. Diamond-shaped lesions on leaves. Can also affect panicles (panicle blast).",
        "causes":       "Cool nights, morning dew, excess nitrogen, susceptible varieties.",
        "treatment":    "Tricyclazole, isoprothiolane, azoxystrobin fungicides.",
        "prevention":   "Resistant varieties, balanced nitrogen, regulated irrigation.",
        "favorable_conditions": {
            "temperature": "20–28°C",
            "humidity":    ">90%",
            "rainfall":    "Frequent dew/light rain",
        },
        "weather_weights": {"temperature": 0.20, "humidity": 0.55, "rainfall": 0.25},
    },

    "hispa": {
        "display":      "Rice Hispa",
        "crop":         "Rice",
        "severity":     "Medium",
        "description":  "Caused by Dicladispa armigera (leaf beetle). Adults scrape leaf surfaces; larvae mine inside leaves creating white tunnels.",
        "causes":       "Lush, dense crops with high nitrogen. Wet season conditions.",
        "treatment":    "Apply malathion or monocrotophos. Clip and destroy affected leaves.",
        "prevention":   "Avoid over-fertilization, resistant varieties, reduce dense planting.",
        "favorable_conditions": {
            "temperature": "25–35°C",
            "humidity":    ">75%",
            "rainfall":    "Moderate",
        },
        "weather_weights": {"temperature": 0.40, "humidity": 0.35, "rainfall": 0.25},
    },

    "tungro": {
        "display":      "Tungro Virus Disease",
        "crop":         "Rice",
        "severity":     "Very High",
        "description":  "Caused by two viruses (RTBV + RTSV) transmitted by green leafhoppers. Leaves turn yellow-orange. Stunted plants with reduced tillering.",
        "causes":       "Green leafhopper (Nephotettix spp.) populations carrying both viruses.",
        "treatment":    "No direct cure. Control leafhopper vectors with buprofezin or imidacloprid.",
        "prevention":   "Resistant varieties (Utri Merah), synchronized planting, leafhopper management.",
        "favorable_conditions": {
            "temperature": "25–30°C",
            "humidity":    ">80%",
            "rainfall":    "Moderate",
        },
        "weather_weights": {"temperature": 0.35, "humidity": 0.35, "rainfall": 0.30},
    },

    "dead_heart": {
        "display":      "Dead Heart (Stem Borer)",
        "crop":         "Rice",
        "severity":     "High",
        "description":  "Caused by stem borer larvae (Scirpophaga incertulas). The central leaf whorl turns yellow and dies — pulled out easily.",
        "causes":       "Stem borer moth populations during vegetative stage.",
        "treatment":    "Apply cartap hydrochloride, chlorpyrifos, or flubendiamide granules.",
        "prevention":   "Avoid early planting when moths are active. Use light traps. Remove egg masses.",
        "favorable_conditions": {
            "temperature": "25–35°C",
            "humidity":    "High",
            "rainfall":    "Moderate",
        },
        "weather_weights": {"temperature": 0.40, "humidity": 0.35, "rainfall": 0.25},
    },

    "downy_mildew": {
        "display":      "Downy Mildew",
        "crop":         "Rice",
        "severity":     "Medium",
        "description":  "Caused by Sclerophthora macrospora. Pale yellow lesions with downy growth on underside of leaves.",
        "causes":       "Waterlogged soils, cool temperatures, and high humidity.",
        "treatment":    "Apply metalaxyl or fosetyl-aluminium fungicide. Improve drainage.",
        "prevention":   "Avoid water stagnation, improve field drainage, resistant varieties.",
        "favorable_conditions": {
            "temperature": "18–25°C",
            "humidity":    ">90%",
            "rainfall":    "Heavy flooding",
        },
        "weather_weights": {"temperature": 0.25, "humidity": 0.50, "rainfall": 0.25},
    },

    "bacterial_leaf_streak": {
        "display":      "Bacterial Leaf Streak",
        "crop":         "Rice",
        "severity":     "Medium",
        "description":  "Caused by Xanthomonas oryzae pv. oryzicola. Narrow, translucent water-soaked stripes between veins.",
        "causes":       "Warm, humid weather. Spread by rain splash and irrigation water.",
        "treatment":    "Apply copper-based bactericides. Remove infected leaves.",
        "prevention":   "Use resistant varieties. Avoid excessive nitrogen.",
        "favorable_conditions": {
            "temperature": "25–35°C",
            "humidity":    ">80%",
            "rainfall":    "Heavy",
        },
        "weather_weights": {"temperature": 0.30, "humidity": 0.45, "rainfall": 0.25},
    },

    "bacterial_panicle_blight": {
        "display":      "Bacterial Panicle Blight",
        "crop":         "Rice",
        "severity":     "High",
        "description":  "Caused by Burkholderia glumae. Sterile spikelets, grayish-brown discolouration. Significant yield loss.",
        "causes":       "High temperatures (>30°C) during flowering combined with high humidity.",
        "treatment":    "Apply oxolinic acid or copper-based bactericide at panicle initiation.",
        "prevention":   "Resistant varieties, avoid water stress at heading.",
        "favorable_conditions": {
            "temperature": ">30°C",
            "humidity":    ">85%",
            "rainfall":    "Moderate",
        },
        "weather_weights": {"temperature": 0.40, "humidity": 0.40, "rainfall": 0.20},
    },

    "normal": {
        "display":      "Healthy (Normal)",
        "crop":         "Rice",
        "severity":     "None",
        "description":  "No disease detected. Crop appears healthy.",
        "causes":       "N/A",
        "treatment":    "Continue routine monitoring and preventive agronomic practices.",
        "prevention":   "Maintain balanced fertilization, proper irrigation, and crop rotation.",
        "favorable_conditions": {
            "temperature": "Any",
            "humidity":    "Any",
            "rainfall":    "Regular",
        },
        "weather_weights": {"temperature": 0.33, "humidity": 0.33, "rainfall": 0.34},
    },
}

# ── Chatbot knowledge base (keyword → response) ────────────────────────────────
CHATBOT_KB = {
    "rice blast":       "Rice Blast (Magnaporthe oryzae) forms diamond-shaped grey-centred lesions. It thrives in humid, cool conditions. Apply tricyclazole fungicide early and use resistant varieties.",
    "leaf blast":       "Leaf Blast is the initial phase of rice blast disease. Cool nights and high humidity (>90%) trigger it. Tricyclazole or isoprothiolane fungicides are effective treatments.",
    "brown spot":       "Brown Spot is linked to poor soil nutrition, especially potassium deficiency. Oval brown lesions with yellow halos are classic signs. Apply mancozeb and correct soil nutrients.",
    "bacterial leaf":   "Bacterial Leaf Blight causes water-soaked margins turning yellow-white. Copper-based bactericides help. Avoid flooding and excess nitrogen.",
    "sheath blight":    "Sheath Blight (Rhizoctonia solani) forms oval lesions on leaf sheaths. Validamycin or hexaconazole fungicides are effective. Reduce planting density.",
    "yellow rust":      "Yellow Rust forms bright yellow stripes on wheat leaves at cool temperatures (10–15°C). Apply triazole fungicides early. Plant resistant varieties.",
    "black rust":       "Black Rust (Stem Rust) causes brick-red/black pustules on wheat stems. Propiconazole or tebuconazole are effective. Hot dry weather stops its spread.",
    "powdery mildew":   "Powdery Mildew shows white powdery patches on wheat leaves in cool, humid weather. Sulfur or triadimefon fungicides control it well.",
    "fusarium":         "Fusarium Head Blight causes bleached, pink-mouldy wheat spikes. It produces dangerous mycotoxins. Apply metconazole during early flowering.",
    "mosaic":           "Sugarcane Mosaic Virus creates mosaic patterns on leaves and is spread by aphids. There is no chemical cure — control aphids and remove infected stools.",
    "sugarcane rust":   "Sugarcane Rust shows orange-brown pustules on leaf undersides. Propiconazole fungicide and resistant varieties are the best defence.",
    "cotton blight":    "Bacterial Blight of Cotton produces angular leaf spots and stem cankers. Copper oxychloride spray and disease-free certified seed are recommended.",
    "alternaria":       "Alternaria Leaf Spot causes dark concentric rings on cotton leaves. Mancozeb or iprodione fungicide applications are effective.",
    "tungro":           "Tungro is a devastating rice virus transmitted by green leafhoppers. The only control is to manage the leafhopper vector and plant resistant varieties.",
    "hispa":            "Rice Hispa is a leaf beetle whose larvae mine inside leaves. Apply malathion and avoid over-fertilization with nitrogen.",
    "humidity":         "High humidity (>80%) dramatically increases fungal and bacterial disease risk, especially for rice blast, bacterial blight, and leaf scald.",
    "temperature":      "Temperature directly influences disease development. Cool conditions (10–20°C) favour wheat rusts; warm conditions (25–35°C) favour rice bacterial diseases.",
    "treatment":        "Treatment depends on the specific disease. Fungal diseases (blasts, rusts, mildew) respond to fungicides. Bacterial diseases respond to copper-based bactericides. Viral diseases require vector control.",
    "prevention":       "General prevention: use certified disease-resistant varieties, practice crop rotation, maintain balanced soil nutrition, and monitor crops weekly for early disease signs.",
    "default":          "I can help you with information about crop diseases. Try asking about specific diseases like 'rice blast', 'yellow rust', 'cotton blight', or general topics like 'humidity effects' or 'prevention practices'.",
}


def get_disease_info(disease_name: str) -> dict:
    """
    Look up a disease by name. Tries normalized key lookup with fuzzy matching.
    Returns the disease dict, or a default 'unknown' entry.
    """
    # Normalize: lowercase, replace spaces with underscores
    key = disease_name.lower().strip().replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "")

    # Direct match
    if key in DISEASE_DB:
        return DISEASE_DB[key]

    # Partial match — find first entry whose key contains our search term
    for db_key, info in DISEASE_DB.items():
        if key in db_key or db_key in key:
            return info

    # Check display names
    for db_key, info in DISEASE_DB.items():
        if key in info.get("display", "").lower().replace(" ", "_"):
            return info

    return {
        "display":      disease_name.replace("_", " ").title(),
        "crop":         "Unknown",
        "severity":     "Unknown",
        "description":  "No detailed information available for this condition.",
        "causes":       "Information not available.",
        "treatment":    "Consult an agricultural extension officer for specific treatment advice.",
        "prevention":   "Monitor crops regularly and maintain good agronomic practices.",
        "favorable_conditions": {
            "temperature": "Variable",
            "humidity":    "Variable",
            "rainfall":    "Variable",
        },
        "weather_weights": {"temperature": 0.33, "humidity": 0.33, "rainfall": 0.34},
    }


def compute_weather_feature_importance(disease_info: dict, weather: dict) -> dict:
    """
    Calculate weighted feature importance based on disease-specific weights
    and the current weather values. Returns a dict with display-ready % values.
    """
    weights = disease_info.get("weather_weights", {
        "temperature": 0.33,
        "humidity": 0.33,
        "rainfall": 0.34,
    })

    # Severity multipliers based on current conditions vs favorable conditions
    fav = disease_info.get("favorable_conditions", {})

    raw = {
        "Temperature": weights.get("temperature", 0.33),
        "Humidity":    weights.get("humidity", 0.33),
        "Rainfall":    weights.get("rainfall", 0.34),
    }

    total = sum(raw.values())
    normalized = {k: round((v / total) * 100, 1) for k, v in raw.items()}
    return normalized


def chatbot_response(user_input: str) -> str:
    """Simple keyword-based chatbot response."""
    text = user_input.lower().strip()
    for keyword, response in CHATBOT_KB.items():
        if keyword in text:
            return response
    return CHATBOT_KB["default"]
