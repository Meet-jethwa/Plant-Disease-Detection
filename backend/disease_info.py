"""
disease_info.py
================
Comprehensive knowledge base for all trained crop disease classes.
Covers Rice (6 + 10 classes), Wheat (15), Sugarcane (3), Cotton (3).
Provides: description, causes, treatment, favorable weather conditions, chatbot answers.
"""

from functools import lru_cache
import itertools
import json
import math
from pathlib import Path
import re

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
    },

    "wheat_blast": {
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
    },

    # ── RICE PADDY (10 classes) — additional classes ───────────────────────────
    "rice_blast": {
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
    },

    "blast": {  # default alias for rice blast
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
    },

    # ── SUGARCANE & COTTON MULTIMODAL CLASSES ─────────────────────────────
    "banded_chlorosis": {
        "display":      "Banded Chlorosis",
        "crop":         "Sugarcane",
        "severity":     "Low",
        "description":  "Cold or heat shock causing distinctive transverse bands of pale chlorotic tissue across the leaf blade.",
        "causes":       "Severe temperature fluctuations or chilling injury during rapid growth phases.",
        "treatment":    "Provide adequate soil moisture and balanced micronutrients; plants usually recover with normal weather.",
        "prevention":   "Ensure adequate irrigation during dry spells and plant tolerant cultivars.",
        "favorable_conditions": {"temperature": "<15°C or >40°C", "humidity": "Variable", "rainfall": "Low"},
    },

    "dried_leaves": {
        "display":      "Dried Leaves / Desiccation",
        "crop":         "Sugarcane",
        "severity":     "Medium",
        "description":  "Premature leaf drying, tip burn, and margin scorch often caused by moisture stress or root damage.",
        "causes":       "Prolonged drought, high evaporative demand, salinity stress, or root borer damage.",
        "treatment":    "Resume timely irrigation, apply mulch to conserve moisture, and check for root pests.",
        "prevention":   "Implement drip irrigation, maintain trash mulching, and avoid excessive water deficits.",
        "favorable_conditions": {"temperature": ">36°C", "humidity": "<40%", "rainfall": "None"},
    },

    "grassy_shoot": {
        "display":      "Grassy Shoot Disease",
        "crop":         "Sugarcane",
        "severity":     "High",
        "description":  "Phytoplasma infection causing excessive tillering, thin grass-like chlorotic shoots, and stunted stools.",
        "causes":       "Transmitted by sugarcane leafhoppers and infected seed cane.",
        "treatment":    "Rogue out and destroy infected stools immediately to prevent field-wide vector spread.",
        "prevention":   "Hot water treatment of seed setts (50°C for 2 hours) and vector pest control.",
        "favorable_conditions": {"temperature": "26–34°C", "humidity": "60–85%", "rainfall": "Moderate"},
    },

    "mosaic": {
        "display":      "Sugarcane Mosaic",
        "crop":         "Sugarcane",
        "severity":     "Medium",
        "description":  "Sugarcane mosaic potyvirus causing contrasting dark green and yellowish-green blotches and stripes.",
        "causes":       "Transmitted non-persistently by aphids and through infected planting material.",
        "treatment":    "No direct chemical control; remove infected plants and manage aphid vectors.",
        "prevention":   "Plant certified mosaic-resistant setts and maintain barrier crops.",
        "favorable_conditions": {"temperature": "22–32°C", "humidity": "65–85%", "rainfall": "Moderate"},
    },

    "pokkah_boeng": {
        "display":      "Pokkah Boeng",
        "crop":         "Sugarcane",
        "severity":     "High",
        "description":  "Fungal disease caused by Fusarium species leading to twisted, deformed, chlorotic spindle leaves with top rot.",
        "causes":       "Hot, humid weather followed by showers; airborne conidia enter young spindles.",
        "treatment":    "Foliar spray with carbendazim or copper oxychloride at initial chlorotic leaf stage.",
        "prevention":   "Avoid susceptible varieties in high-humidity zones; ensure good canopy ventilation.",
        "favorable_conditions": {"temperature": "28–35°C", "humidity": ">80%", "rainfall": "Intermittent rain"},
    },

    "sett_rot": {
        "display":      "Sett Rot (Pineapple Disease)",
        "crop":         "Sugarcane",
        "severity":     "High",
        "description":  "Ceratocystis paradoxa infection rotting planted seed setts, emitting a characteristic fruity pineapple odor.",
        "causes":       "Waterlogged or poorly drained soils, prolonged cold planting conditions.",
        "treatment":    "Dip setts in carbendazim or benomyl solution before planting.",
        "prevention":   "Ensure well-drained planting beds and use healthy setts with protected cut ends.",
        "favorable_conditions": {"temperature": "18–26°C", "humidity": ">85%", "rainfall": "Waterlogged"},
    },

    "yellow": {
        "display":      "Sugarcane Yellow Leaf",
        "crop":         "Sugarcane",
        "severity":     "Medium",
        "description":  "Sugarcane yellow leaf virus (SCYLV) causing prominent yellowing of the midrib on leaves 3 to 6.",
        "causes":       "Aphid transmission (Melanaphis sacchari) and propagation of infected setts.",
        "treatment":    "Manage aphid populations with systemic insecticides; rogue severely affected plants.",
        "prevention":   "Use tissue-cultured disease-free planting setts and monitor vector activity.",
        "favorable_conditions": {"temperature": "25–34°C", "humidity": "50–80%", "rainfall": "Moderate"},
    },

    "alternaria": {
        "display":      "Alternaria Leaf Spot",
        "crop":         "Cotton",
        "severity":     "Medium",
        "description":  "Caused by Alternaria macrospora. Circular to irregular brown spots with concentric rings and purple margins.",
        "causes":       "Extended leaf wetness, warm humid days (25–30°C), and potassium-stressed crops.",
        "treatment":    "Apply mancozeb, azoxystrobin, or copper hydroxide sprays at early symptom appearance.",
        "prevention":   "Balanced potash nutrition, crop debris destruction, and proper plant spacing.",
        "favorable_conditions": {"temperature": "25–32°C", "humidity": ">80%", "rainfall": "Moderate"},
    },

    "cercospora": {
        "display":      "Cercospora Leaf Spot",
        "crop":         "Cotton",
        "severity":     "Medium",
        "description":  "Cercospora gossypina causing reddish-brown lesions with greyish centres, frequently leading to premature defoliation.",
        "causes":       "Warm humid conditions, poor soil fertility, and canopy shade.",
        "treatment":    "Spray chlorothalonil, propiconazole, or mancozeb fungicide.",
        "prevention":   "Maintain adequate soil nitrogen and potassium; avoid dense canopy overgrowth.",
        "favorable_conditions": {"temperature": "24–32°C", "humidity": ">75%", "rainfall": "Frequent showers"},
    },

    "grey_mildew": {
        "display":      "Grey Mildew (Dahiya)",
        "crop":         "Cotton",
        "severity":     "High",
        "description":  "Ramularia areola producing angular, pale translucent spots with powdery grey-white fungal growth on leaf undersides.",
        "causes":       "High relative humidity (>80%) and cool nights with warm humid days.",
        "treatment":    "Foliar spray of wettable sulfur or carbendazim at 15-day intervals.",
        "prevention":   "Wider crop spacing for aeration and avoiding excessive late-season irrigation.",
        "favorable_conditions": {"temperature": "20–28°C", "humidity": ">85%", "rainfall": "Heavy dew"},
    },

    "verticillium_wilt": {
        "display":      "Verticillium Wilt",
        "crop":         "Cotton",
        "severity":     "High",
        "description":  "Soil-borne Verticillium dahliae causing interveinal yellowing (tiger-stripe pattern), vascular browning, and sudden wilting.",
        "causes":       "Cool wet soils (20–25°C) followed by warm days; fungal microsclerotia in soil.",
        "treatment":    "No curative chemical spray; drench soil with bioagents (Trichoderma viride).",
        "prevention":   "Crop rotation with non-hosts (sorghum, corn), deep summer ploughing, and resistant varieties.",
        "favorable_conditions": {"temperature": "20–26°C", "humidity": "High", "rainfall": "Wet soil"},
    },

    "curl_virus": {
        "display":      "Cotton Leaf Curl Virus (CLCuV)",
        "crop":         "Cotton",
        "severity":     "Very High",
        "description":  "Begomovirus causing upward/downward leaf curling, vein thickening, enation (leaf-like outgrowths), and extreme stunting.",
        "causes":       "Exclusively transmitted by the sweetpotato whitefly (Bemisia tabaci).",
        "treatment":    "Spray systemic insecticides (acetamiprid, diafenthiuron, or neem oil) to manage whiteflies.",
        "prevention":   "Cultivate CLCuV-resistant hybrid varieties and eradicate weed hosts like Abutilon.",
        "favorable_conditions": {"temperature": "28–38°C", "humidity": "50–75%", "rainfall": "Low to moderate"},
    },

    "redrot": {
        "display":      "Sugarcane Redrot",
        "crop":         "Sugarcane",
        "severity":     "Very High",
        "description":  "Colletotrichum falcatum causes longitudinal reddening of internal stalk vascular bundles with diagnostic white transverse patches and leaf midrib lesions.",
        "causes":       "Warm humid monsoon conditions (24–35°C), high relative humidity (>75%), waterlogged soil, and diseased seed setts.",
        "treatment":    "Remove and burn infected clumps. Treat seed setts with carbendazim or hot water therapy (52°C for 30 min). Avoid water stagnation.",
        "prevention":   "Plant redrot-resistant sugarcane varieties, practice 2–3 year crop rotation, and ensure deep field drainage.",
        "favorable_conditions": {"temperature": "24–35°C", "humidity": ">75%", "rainfall": "Heavy monsoon showers"},
    },

    "yellow_disease": {
        "display":      "Sugarcane Yellow Leaf Disease",
        "crop":         "Sugarcane",
        "severity":     "Medium",
        "description":  "Caused by Sugarcane yellow leaf virus (SCYLV) and phytoplasma, characterized by intense yellowing of the midrib on the lower surface of leaves 3–6.",
        "causes":       "Transmitted by sugarcane aphids (Melanaphis sacchari) and infected seed setts; triggered by cool night temperatures (<=22°C).",
        "treatment":    "Manage aphid populations with systemic insecticides or neem formulation; rogue out severely stunted plants.",
        "prevention":   "Use tissue-cultured disease-free planting material, clean harvesting equipment, and balanced potash application.",
        "favorable_conditions": {"temperature": "16–22°C", "humidity": "60–80%", "rainfall": "Moderate"},
    },

    "healthy_rice_leaf": {
        "display":      "Healthy Rice Leaf",
        "crop":         "Rice",
        "severity":     "None",
        "description":  "Vigorous green rice leaf showing clean venation and active photosynthetic tissue with no fungal or bacterial lesions.",
        "causes":       "Optimal agronomic care, balanced nitrogen-phosphorus-potassium nutrition, and clean water management.",
        "treatment":    "Continue regular field scouting and prophylactic organic bio-fertilizer application.",
        "prevention":   "Maintain recommended water level and avoid excessive chemical nitrogen application.",
        "favorable_conditions": {"temperature": "20–35°C", "humidity": "50–85%", "rainfall": "Adequate irrigation"},
    },

    "healthy_leaf": {
        "display":      "Healthy Cotton Leaf",
        "crop":         "Cotton",
        "severity":     "None",
        "description":  "Uniform green foliage with normal palmate lobing, free of curling, vein thickening, necrotic spotting, or insect hopper burns.",
        "causes":       "Good soil moisture management, balanced nutrition, and low pest pressure.",
        "treatment":    "Maintain integrated pest management (IPM) practices and periodic leaf inspections.",
        "prevention":   "Deploy yellow sticky traps for sucking pests and maintain balanced micro-nutrients (boron and zinc).",
        "favorable_conditions": {"temperature": "22–35°C", "humidity": "40–70%", "rainfall": "Normal"},
    },

    "herbicide_damage": {
        "display":      "Cotton Herbicide Damage",
        "crop":         "Cotton",
        "severity":     "Medium",
        "description":  "Non-pathogenic chemical injury causing cupping, strapping, chlorotic bleaching, or necrotic contact scorch across leaf margins.",
        "causes":       "Herbicide drift (e.g. 2,4-D or glyphosate) from neighboring fields or spray equipment contamination.",
        "treatment":    "Irrigate immediately to leach residues; apply foliar spray of bio-stimulants, amino acids, or 1% urea + DAP to encourage recovery.",
        "prevention":   "Use dedicated sprayers for cotton; avoid spraying on windy days (>10 km/h) and install drift-reduction nozzles.",
        "favorable_conditions": {"temperature": "25–38°C", "humidity": "Variable", "rainfall": "Dry with wind drift"},
    },

    "leaf_hopper_jassids": {
        "display":      "Cotton Leaf Hopper (Jassids)",
        "crop":         "Cotton",
        "severity":     "High",
        "description":  "Amrasca biguttula nymphs and adults suck sap from leaf undersides, injecting toxic saliva that causes hopper burn: marginal yellowing and downward leaf curling.",
        "causes":       "Favoured by warm, dry microclimates (24–37°C) with moderate humidity (<72%) and low rain wash-off.",
        "treatment":    "Spray flonicamid 50 WG, thiamethoxam 25 WG, or neem oil (10,000 ppm) when hopper population exceeds economic threshold (2 nymphs/leaf).",
        "prevention":   "Sow jassid-tolerant hairy-leaf cultivars; install yellow sticky traps and conserve natural predators (ladybird beetles).",
        "favorable_conditions": {"temperature": "24–37°C", "humidity": "<72%", "rainfall": "Dry spell"},
    },

    "leaf_reddening": {
        "display":      "Cotton Leaf Reddening",
        "crop":         "Cotton",
        "severity":     "Medium",
        "description":  "Physiological disorder causing accumulation of red anthocyanin pigment in leaves, turning them bronze-red, brittle, and prone to early drop.",
        "causes":       "Sudden temperature drop during nighttime, waterlogging followed by drought stress, magnesium deficiency, or nitrogen depletion during boll development.",
        "treatment":    "Foliar spray of 1% magnesium sulphate (MgSO4) + 1% urea at flowering and boll formation stages.",
        "prevention":   "Ensure adequate soil magnesium and potash; avoid water stagnation in root zones during late vegetative stage.",
        "favorable_conditions": {"temperature": ">=32°C day with cold night shock", "humidity": "Low to medium", "rainfall": "Moisture deficit"},
    },

    "leaf_variegation": {
        "display":      "Cotton Leaf Variegation",
        "crop":         "Cotton",
        "severity":     "Low",
        "description":  "Mosaic-like chlorophyll deficiency producing distinct yellow or pale green patches bordered by normal dark green tissue.",
        "causes":       "Genetic chimera or thermal chlorophyll synthesis inhibition under temperature fluctuations (20–35°C).",
        "treatment":    "Apply balanced micro-nutrient foliar spray (zinc and iron chelate) to promote chlorophyll recovery.",
        "prevention":   "Use certified hybrid seeds from reputable breeders; avoid heat-shock during early seedling development.",
        "favorable_conditions": {"temperature": "20–35°C", "humidity": "Moderate", "rainfall": "Normal"},
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


LOCALES_DIR = Path(__file__).resolve().parent / "locales"

@lru_cache(maxsize=16)
def _load_localized_disease_db(lang: str) -> dict:
    fpath = LOCALES_DIR / lang / "diseases.json"
    if fpath.exists():
        try:
            return json.loads(fpath.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def get_disease_info(disease_name: str, lang: str = "en", crop: str | None = None) -> dict:
    """
    Look up a disease by name with multilingual support and crop-specific disambiguation.
    Returns the disease dict localized into `lang` if available.
    """
    key = disease_name.lower().strip().replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "")
    cleaned_key = re.sub(r"^(rice|wheat|cotton|sugarcane)_+", "", key)

    crop_str = crop.lower().strip() if crop else ""
    if not crop_str:
        for c in ("wheat", "rice", "cotton", "sugarcane"):
            if key.startswith(f"{c}_"):
                crop_str = c
                break

    info = None

    # 1. Look up exact crop-prefixed key (e.g., wheat_blast, rice_blast)
    if crop_str:
        prefixed_key = f"{crop_str}_{cleaned_key}"
        if prefixed_key in DISEASE_DB:
            info = DISEASE_DB[prefixed_key]

    # 2. Look up key or cleaned_key directly
    if info is None:
        if key in DISEASE_DB:
            candidate = DISEASE_DB[key]
            if not crop_str or candidate.get("crop", "").lower() in (crop_str, "all"):
                info = candidate
        if info is None and cleaned_key in DISEASE_DB:
            candidate = DISEASE_DB[cleaned_key]
            if not crop_str or candidate.get("crop", "").lower() in (crop_str, "all"):
                info = candidate

    # 3. Fuzzy search respecting crop
    if info is None and crop_str:
        for db_key, item in DISEASE_DB.items():
            if (key in db_key or db_key in key or cleaned_key in db_key or db_key in cleaned_key):
                if item.get("crop", "").lower() in (crop_str, "all"):
                    info = item
                    break

    # 4. General fallback fuzzy search
    if info is None:
        for db_key, item in DISEASE_DB.items():
            if key in db_key or db_key in key or cleaned_key in db_key or db_key in cleaned_key:
                info = item
                break

    if info is None:
        info = {
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
        }

    # If non-English language requested, overlay localized fields from backend/locales/{lang}/diseases.json
    if lang and lang != "en":
        loc_db = _load_localized_disease_db(lang)
        loc_item = loc_db.get(key) or loc_db.get(cleaned_key)
        if not loc_item:
            for k, v in loc_db.items():
                if k in key or key in k or k in cleaned_key or cleaned_key in k:
                    loc_item = v
                    break
        if loc_item:
            return {
                **info,
                "display": loc_item.get("display") or info.get("display"),
                "description": loc_item.get("description") or info.get("description"),
                "causes": loc_item.get("causes") or info.get("causes"),
                "treatment": loc_item.get("treatment_summary") or loc_item.get("treatment") or info.get("treatment"),
                "prevention": loc_item.get("prevention") or info.get("prevention"),
            }

    return info


def compute_rule_based_weather_attribution(disease_info: dict, weather: dict, crop: str = "rice") -> dict:
    """
    Compute rule-based environmental factor attribution for risk indicators.
    Uses cooperative allocation across microclimatic variables (Temperature, Humidity, Rainfall, Wind Speed)
    against a neutral agronomic baseline using phytopathological suitability rules.
    NOTE: This is a heuristic risk indicator; for trained multimodal neural network explainability,
    see compute_multimodal_weather_shap in backend/multimodal_model.py.
    """
    temp = float(weather.get("temperature_c", 25.0))
    hum = float(weather.get("humidity_percent", 50.0))
    rain = float(weather.get("rainfall_mm", 0.0))
    wind = float(weather.get("wind_kmh", 10.0))

    crop_str = (crop or (disease_info or {}).get("crop") or "rice").lower().strip()

    # Crop/disease optimal pathogen incubation parameters
    if "wheat" in crop_str:
        opt_temp, half_width = 20.0, 4.5
        crop_vuln = 0.95
    elif "cotton" in crop_str:
        opt_temp, half_width = 28.5, 4.0
        crop_vuln = 1.00
    elif "sugarcane" in crop_str:
        opt_temp, half_width = 29.0, 4.0
        crop_vuln = 0.90
    else:  # rice default
        opt_temp, half_width = 26.5, 4.0
        crop_vuln = 1.10

    def risk_function(feats: list[float]) -> float:
        t, h, r, w = feats
        t_suit = math.exp(-0.5 * ((t - opt_temp) / half_width) ** 2)
        h_suit = max(0.0, min(1.0, (h - 45.0) / 45.0))
        r_suit = max(0.0, min(1.0, r / 12.0))
        w_suit = max(0.0, min(1.0, w / 25.0))
        score = (0.35 * t_suit + 0.35 * h_suit + 0.20 * r_suit + 0.10 * w_suit) * 100.0 * crop_vuln
        return max(0.0, min(100.0, score))

    base_features = [22.0, 55.0, 1.0, 8.0]
    curr_features = [temp, hum, rain, wind]
    feature_names = ["Temperature", "Humidity", "Rainfall", "Wind Speed"]

    N = 4
    shap_vals = [0.0] * N
    for i in range(N):
        others = [j for j in range(N) if j != i]
        for k in range(N):
            coeff = (math.factorial(k) * math.factorial(N - k - 1)) / math.factorial(N)
            for subset in itertools.combinations(others, k):
                with_i = list(base_features)
                without_i = list(base_features)
                for s in subset:
                    with_i[s] = curr_features[s]
                    without_i[s] = curr_features[s]
                with_i[i] = curr_features[i]
                shap_vals[i] += coeff * (risk_function(with_i) - risk_function(without_i))

    base_score = risk_function(base_features)
    current_score = risk_function(curr_features)

    # Relative attribution for UI feature importance
    abs_shaps = [max(0.1, abs(v)) for v in shap_vals]
    sum_abs = sum(abs_shaps)
    normalized = {
        name: round((val / sum_abs) * 100.0, 1)
        for name, val in zip(feature_names, abs_shaps)
    }

    # Ensure sum of percentages equals exactly 100.0%
    diff = 100.0 - sum(normalized.values())
    if abs(diff) > 0.0:
        first_key = list(normalized.keys())[0]
        normalized[first_key] = round(normalized[first_key] + diff, 1)

    return {
        "feature_importance": normalized,
        "shap_values": {name: round(val, 3) for name, val in zip(feature_names, shap_vals)},
        "attribution_values": {name: round(val, 3) for name, val in zip(feature_names, shap_vals)},
        "base_value": round(base_score, 2),
        "risk_score": round(current_score, 2),
        "method": "Rule-Based Environmental Attribution Heuristic",
    }


def compute_rule_based_feature_importance(disease_info: dict, weather: dict, crop: str = "rice") -> dict:
    """
    Calculate environmental factor importance using rule-based pathogen suitability attribution.
    """
    attribution_data = compute_rule_based_weather_attribution(disease_info, weather, crop=crop)
    return attribution_data["feature_importance"]


# Backwards compatibility aliases
compute_weather_shap_values = compute_rule_based_weather_attribution
compute_weather_feature_importance = compute_rule_based_feature_importance


def chatbot_response(user_input: str) -> str:
    """Simple keyword-based chatbot response."""
    text = user_input.lower().strip()
    for keyword, response in CHATBOT_KB.items():
        if keyword in text:
            return response
    return CHATBOT_KB["default"]
