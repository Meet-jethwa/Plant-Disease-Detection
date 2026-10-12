import { LIBRARY_IMAGE_PATHS } from './plantImages'

export interface DiseaseItem {
  id: string
  crop: 'Rice' | 'Wheat' | 'Sugarcane' | 'Cotton'
  name: string
  scientificName: string
  impact: 'High' | 'Medium' | 'Severe'
  image: string
  affectedParts: string[]
  whatToLookFor: string
  whatFavorsIt: string
  howItSpreads: string
  recommendedAction: string
  organicTreatment: string
  chemicalTreatment: string
  prevention: string
  technicalDetails: {
    anatomy: string
    pathology: string
  }
}

export const DISEASES_DATA: DiseaseItem[] = [
  {
    id: 'rice-blast',
    crop: 'Rice',
    name: 'Rice Blast',
    scientificName: 'Magnaporthe oryzae',
    impact: 'Severe',
    image: LIBRARY_IMAGE_PATHS.riceBlast,
    affectedParts: ['Leaf blade', 'Neck node', 'Panicle collar'],
    whatToLookFor: 'Spindle-shaped elliptical lesions with grayish-white centers and dark brown margins on leaves and neck nodes.',
    whatFavorsIt: 'High relative humidity (>90%), prolonged leaf moisture, and excess nitrogen fertilizer application.',
    howItSpreads: 'Conidia fungal spores dispersed over long distances through air currents and rain splashes.',
    recommendedAction: 'Apply tricyclazole or isoprothiolane at panicle initiation. Avoid excess nitrogenous fertilizers.',
    organicTreatment: 'Spray Pseudomonas fluorescens (2.5 kg/ha) or neem oil (3%) at early symptom onset; apply composted biochar to strengthen leaf cuticle.',
    chemicalTreatment: 'Foliar spray of Tricyclazole 75% WP @ 0.6 g/L or Kasugamycin 3% SL @ 2.5 ml/L when weather conditions favor sporulation.',
    prevention: 'Treat seeds with Carbendazim 2g/kg, maintain optimal field water drainage, and use blast-resistant cultivars like Pusa Basmati 1637.',
    technicalDetails: {
      anatomy: 'Leaf collar, panicle neck node, and upper flag leaf blades.',
      pathology: 'Spindle-shaped necrotic lesions & collar rot caused by fungal conidia spores.'
    }
  },
  {
    id: 'rice-brown-spot',
    crop: 'Rice',
    name: 'Brown Spot',
    scientificName: 'Bipolaris oryzae / Helminthosporium oryzae',
    impact: 'Medium',
    image: LIBRARY_IMAGE_PATHS.riceBrownSpot,
    affectedParts: ['Leaf blade', 'Seed grain', 'Glumes'],
    whatToLookFor: 'Small, circular to oval dark brown spots on foliage, often surrounded by a prominent yellow chlorotic halo.',
    whatFavorsIt: 'Nutrient-deficient soils (especially low potassium, silicon, or manganese) combined with prolonged drought stress.',
    howItSpreads: 'Airborne conidia spores and seed-borne fungal mycelium persisting on uncertified seed lots.',
    recommendedAction: 'Correct potassium deficiency with muriate of potash (MOP); apply Mancozeb or Propiconazole foliar sprays.',
    organicTreatment: 'Seed soak in Trichoderma harzianum solution (10g/kg); foliar spray with fermented butter-milk (chaas) mixed with cow urine.',
    chemicalTreatment: 'Apply Mancozeb 75% WP @ 2 g/L or Propiconazole 25% EC @ 1 ml/L at tillering and boot leaf emergence.',
    prevention: 'Conduct pre-sowing soil tests, ensure balanced N-P-K-Si nutrition, and avoid severe moisture stress during panicle development.',
    technicalDetails: {
      anatomy: 'Leaf parenchymal tissue and glumes on developing grain.',
      pathology: 'Circular dark brown necrotic spots with chlorotic halo caused by infected seed setts and airborne spores.'
    }
  },
  {
    id: 'rice-hispa',
    crop: 'Rice',
    name: 'Hispa Leaf Beetle Damage',
    scientificName: 'Dicladispa armigera',
    impact: 'Medium',
    image: LIBRARY_IMAGE_PATHS.riceHispa,
    affectedParts: ['Upper leaf surface', 'Leaf tip'],
    whatToLookFor: 'White, parallel characteristic streaks along leaf veins where green parenchymal tissue is scraped away, giving fields a withered, white appearance.',
    whatFavorsIt: 'High humidity, shaded canopy, early vegetative tillering stage, and heavy early-season nitrogen.',
    howItSpreads: 'Adult spiny beetles fly between fields, and internal larvae mine between upper and lower epidermal layers.',
    recommendedAction: 'Sweep-netting adult beetles; clip leaf tips before transplanting to destroy leaf-miner eggs.',
    organicTreatment: 'Foliar spray with 5% Neem Seed Kernel Extract (NSKE) or Beauveria bassiana entomopathogenic fungus @ 5g/L.',
    chemicalTreatment: 'Foliar application of Chlorpyrifos 20% EC @ 2 ml/L or Quinalphos 25% EC @ 2 ml/L when leaf damage exceeds 1–2 adults per hill.',
    prevention: 'Avoid excessive nitrogen; practice community sweep-netting; clip and burn leaf tips during seedling nursery transplanting.',
    technicalDetails: {
      anatomy: 'Upper epidermal green layer between leaf veins.',
      pathology: 'White parallel scraping streaks and leaf blighting caused by adult feeding and larval tunneling.'
    }
  },
  {
    id: 'wheat-brown-rust',
    crop: 'Wheat',
    name: 'Brown Rust / Leaf Rust',
    scientificName: 'Puccinia triticina',
    impact: 'High',
    image: LIBRARY_IMAGE_PATHS.wheatRust,
    affectedParts: ['Leaf blade', 'Leaf sheath'],
    whatToLookFor: 'Small, circular orange-brown powdery pustules (uredinia) scattered randomly across the upper leaf blade surface.',
    whatFavorsIt: 'Moderate temperatures (15–25°C) with persistent night dew and humid overcast conditions.',
    howItSpreads: 'Lightweight urediniospores carried hundreds of kilometers by atmospheric wind streams.',
    recommendedAction: 'Spray Propiconazole or Tebuconazole as soon as rust pustules are spotted on lower canopy leaves.',
    organicTreatment: 'Foliar application of fermented cow dung-urine slurry (Jeevamrutha) and spraying 1% baking soda solution to alter leaf surface pH.',
    chemicalTreatment: 'Propiconazole 25% EC (Tilt) @ 1 ml/L or Tebuconazole 25.9% EC @ 1.25 ml/L in 500 liters of water per hectare.',
    prevention: 'Sow rust-resistant varieties recommended for your agro-climatic zone (e.g. HD-2967, PBW-550); follow recommended sowing calendar.',
    technicalDetails: {
      anatomy: 'Upper surface of wheat leaves and leaf sheaths.',
      pathology: 'Randomly scattered orange-brown powdery pustules formed by windborne urediniospores.'
    }
  },
  {
    id: 'wheat-yellow-rust',
    crop: 'Wheat',
    name: 'Yellow Rust / Stripe Rust',
    scientificName: 'Puccinia striiformis',
    impact: 'Severe',
    image: LIBRARY_IMAGE_PATHS.wheatYellowRust,
    affectedParts: ['Leaf veins', 'Upper canopy', 'Spikelets'],
    whatToLookFor: 'Bright yellow-orange powdery pustules arranged in distinct, narrow stripes running parallel to leaf veins.',
    whatFavorsIt: 'Cool temperatures (10–18°C) with frequent rain or heavy fog/dew; common in northern and foothill plains.',
    howItSpreads: 'Rapid airborne spore dispersal under cool wind patterns; capable of destroying entire fields within 10–14 days.',
    recommendedAction: 'Immediate community-level fungicide spraying at the very first stripe detection to preserve flag leaf photosynthetic area.',
    organicTreatment: 'Spray bio-fungicide Ampelomyces quisqualis or wettable sulfur (3g/L) during early vegetative stages before stripe expansion.',
    chemicalTreatment: 'Apply Propiconazole 25% EC @ 1 ml/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L immediately.',
    prevention: 'Cultivate stripe-rust resistant genotypes (e.g. DBW-187, DBW-222); avoid late sowing in cooler regions.',
    technicalDetails: {
      anatomy: 'Parallel foliar veins on the upper leaf canopy.',
      pathology: 'Longitudinal yellow pustule stripes organized along leaf veins, driven by cool wind spores.'
    }
  },
  {
    id: 'wheat-septoria',
    crop: 'Wheat',
    name: 'Septoria Leaf Blotch',
    scientificName: 'Zymoseptoria tritici',
    impact: 'Medium',
    image: LIBRARY_IMAGE_PATHS.wheatSeptoria,
    affectedParts: ['Lower leaves', 'Flag leaf', 'Leaf sheath'],
    whatToLookFor: 'Irregular rectangular brown to olive blotches containing distinctive tiny black pycnidia specks visible within dead tissue.',
    whatFavorsIt: 'Frequent rainfall, dense foliage, and prolonged canopy humidity between 15–20°C.',
    howItSpreads: 'Rain splashes bounce pycnidiospores upwards from infected lower leaves to middle canopy and flag leaves.',
    recommendedAction: 'Apply protective strobilurin or triazole fungicides prior to canopy closure to safeguard the flag leaf.',
    organicTreatment: 'Spray copper hydroxide (2 g/L) or Bacillus subtilis bioprotectant; thin plant density to enhance air movement.',
    chemicalTreatment: 'Foliar spray with Epoxiconazole + Pyraclostrobin or Chlorothalonil 75% WP @ 2 g/L at stem elongation (GS 31–39).',
    prevention: 'Deep plow infected crop residue after harvest; implement minimum 2-year crop rotation with non-cereal crops.',
    technicalDetails: {
      anatomy: 'Older lower leaves moving upward to flag leaf.',
      pathology: 'Rectangular necrotic brown blotches with black pycnidia spore specks dispersed via rain splash.'
    }
  },
  {
    id: 'sugarcane-red-rot',
    crop: 'Sugarcane',
    name: 'Red Rot',
    scientificName: 'Colletotrichum falcatum',
    impact: 'Severe',
    image: LIBRARY_IMAGE_PATHS.sugarcaneRedRot,
    affectedParts: ['Internal stalk', 'Stem pith', 'Leaf midrib'],
    whatToLookFor: 'Third and fourth leaves wither and turn yellow from margins inward. Splitting the stalk reveals bright red internal tissue with white horizontal cross-bands and a sour, alcoholic odor.',
    whatFavorsIt: 'Poorly drained waterlogged fields, stalk borer insect tunneling, continuous ratoon cropping, and infected seed cane.',
    howItSpreads: 'Spread via infected seed setts, irrigation/flood runoff, and conidia entering stem borer boring holes.',
    recommendedAction: 'Uproot and burn diseased clumps immediately; treat planting seed setts with hot water; do not ratoon infected crops.',
    organicTreatment: 'Sett treatment with Trichoderma viride (10 g/L) for 30 minutes; incorporate neem cake @ 250 kg/ha during field preparation.',
    chemicalTreatment: 'Dip seed setts in Carbendazim 50% WP (1 g/L) or Thiophanate-methyl 70% WP (1 g/L) for 15 minutes before furrow placement.',
    prevention: 'Use certified red-rot resistant varieties (e.g. Co 0238, CoLk 94184); ensure laser-leveled drainage channels.',
    technicalDetails: {
      anatomy: 'Stalk vascular bundles, internodes, and root head.',
      pathology: 'Internal red stalk rotting with white cross bands caused by fungal infection entering through wounds or infected setts.'
    }
  },
  {
    id: 'sugarcane-mosaic',
    crop: 'Sugarcane',
    name: 'Sugarcane Mosaic Virus',
    scientificName: 'Sugarcane Mosaic Potyvirus (SCMV)',
    impact: 'Medium',
    image: LIBRARY_IMAGE_PATHS.sugarcaneMosaic,
    affectedParts: ['Young whorl leaves', 'Spindle leaves'],
    whatToLookFor: 'Contrasting islands of dark green and pale green/yellow chlorotic streaks running parallel along the leaf midrib on emerging young leaves.',
    whatFavorsIt: 'Abundant aphid populations, weed reservoirs (Johnson grass), and warm growing seasons.',
    howItSpreads: 'Non-persistent transmission by corn leaf aphids (Rhopalosiphum maidis) and planting infected vegetative cane cuttings.',
    recommendedAction: 'Rogue out and destroy infected young plants; spray recommended aphicides to control vector population.',
    organicTreatment: 'Spray yellow sticky traps (15–20 per acre) and foliar application of 3% neem oil or insecticidal soap against vector aphids.',
    chemicalTreatment: 'Spray Imidacloprid 17.8% SL @ 0.3 ml/L or Thiamethoxam 25% WG @ 0.3 g/L to suppress aphid vector colonies.',
    prevention: 'Plant certified virus-indexed tissue-cultured plantlets; eradicate weed hosts like Sorghum halepense around field borders.',
    technicalDetails: {
      anatomy: 'Newly emerging whorl leaves and leaf sheaths.',
      pathology: 'Chlorotic mosaic streaks caused by viral particles transmitted via the corn aphid vector (Rhopalosiphum maidis).'
    }
  },
  {
    id: 'cotton-bacterial-blight',
    crop: 'Cotton',
    name: 'Bacterial Blight',
    scientificName: 'Xanthomonas citri pv. malvacearum',
    impact: 'High',
    image: LIBRARY_IMAGE_PATHS.cottonBlight,
    affectedParts: ['Angular leaf veins', 'Main stem', 'Bolls'],
    whatToLookFor: 'Dark, water-soaked, angular leaf spots restricted by veins (blackarm stage), black lesions girdling stems, and oily spots on developing bolls.',
    whatFavorsIt: 'High temperatures (28–35°C), heavy rainfall accompanied by wind, and overhead sprinkler irrigation.',
    howItSpreads: 'Infected fuzzy seeds, driving wind-rain splash, and farm machinery wounding.',
    recommendedAction: 'Spray copper oxychloride combined with Streptomycin sulphate at first sign of angular leaf lesions.',
    organicTreatment: 'Seed acid delinting followed by bio-priming with Pseudomonas fluorescens; foliar spray with copper sulfate + lime (Bordeaux mixture 1%).',
    chemicalTreatment: 'Spray Copper Oxychloride 50% WP @ 2.5 g/L mixed with Streptocycline @ 0.1 g/L (100 ppm) at 12–15 day intervals.',
    prevention: 'Delint cotton seed with concentrated sulfuric acid (100 ml/kg) to eliminate seed-borne bacteria; rotate with non-host crops.',
    technicalDetails: {
      anatomy: 'Cotyledons, angular leaf vein cells, and the main stem.',
      pathology: 'Water-soaked angular vein-bounded spots and black stem rot driven by bacterial infection.'
    }
  },
  {
    id: 'cotton-leaf-curl',
    crop: 'Cotton',
    name: 'Cotton Leaf Curl Virus (CLCuV)',
    scientificName: 'Cotton Leaf Curl Begomovirus',
    impact: 'Severe',
    image: LIBRARY_IMAGE_PATHS.cottonLeafCurl,
    affectedParts: ['Leaf margins', 'Vein network', 'Growing shoot'],
    whatToLookFor: 'Upward or downward cupping of leaves, prominent thickening of foliar veins, leaf enations (cup-like outgrowths) on leaf undersides, and stunted plant stature.',
    whatFavorsIt: 'Dense whitefly (Bemisia tabaci) populations during warm, dry weather spells.',
    howItSpreads: 'Exclusively transmitted in a persistent, circulative manner by adult whitefly insects feeding on vascular sap.',
    recommendedAction: 'Strict whitefly vector suppression; immediately rogue out infected plants during early vegetative squaring.',
    organicTreatment: 'Install yellow sticky traps (30/acre); foliar spray with Neem Seed Kernel Extract 5% or Lecanicillium lecanii fungal bio-agent (5g/L).',
    chemicalTreatment: 'Spray Diafenthiuron 50% WP @ 1 g/L, Pyriproxyfen 10% EC @ 2 ml/L, or Spiromesifen 22.9% SC @ 1 ml/L against whitefly nymphs and adults.',
    prevention: 'Sow CLCuV-resistant Bt-cotton hybrids; avoid growing alternative hosts (okra, brinjal) near cotton perimeters.',
    technicalDetails: {
      anatomy: 'Foliar leaf margins, veins, and leaf undersides.',
      pathology: 'Leaf curling, thickened veins, and enations caused by viral infection transmitted by Bemisia tabaci.'
    }
  }
]
