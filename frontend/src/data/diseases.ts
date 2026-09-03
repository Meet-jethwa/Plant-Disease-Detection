import { REAL_PLANT_PHOTOS } from './plantImages'

export interface DiseaseItem {
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
  technicalDetails: {
    anatomy: string
    pathology: string
  }
}

export const DISEASES_DATA: DiseaseItem[] = [
  {
    crop: 'Rice',
    name: 'Rice Blast',
    scientificName: 'Magnaporthe oryzae',
    impact: 'Severe',
    image: REAL_PLANT_PHOTOS.riceBlast,
    affectedParts: ['Leaf blade', 'Neck node'],
    whatToLookFor: 'Spindle-shaped brown lesions with gray centers on the leaves.',
    whatFavorsIt: 'High humidity and prolonged leaf wetness can increase disease risk. Excess nitrogen may also favor disease development.',
    howItSpreads: 'The fungus spreads through airborne spores and rain splash.',
    recommendedAction: 'Use a locally approved fungicide according to the product label. Avoid excessive nitrogen and monitor nearby plants for new lesions.',
    technicalDetails: {
      anatomy: 'Leaf collar, panicle neck node, and upper leaf blades.',
      pathology: 'Spindle-shaped necrotic lesions & collar rot caused by fungal conidia spores.'
    }
  },
  {
    crop: 'Rice',
    name: 'Brown Spot',
    scientificName: 'Helminthosporium oryzae',
    impact: 'Medium',
    image: REAL_PLANT_PHOTOS.riceBrownSpot,
    affectedParts: ['Leaf blade', 'Seed grain'],
    whatToLookFor: 'Small, oval, dark brown spots on leaves, often surrounded by a yellow halo.',
    whatFavorsIt: 'Nutrient-deficient soil, particularly low potassium and manganese, combined with moisture stress.',
    howItSpreads: 'Spores are carried by air currents and can survive on infected seeds.',
    recommendedAction: 'Apply an appropriate fungicide if spots spread rapidly. Ensure balanced soil fertility and correct potassium deficiencies.',
    technicalDetails: {
      anatomy: 'Leaf parenchymal tissue and glumes on grain.',
      pathology: 'Circular dark brown necrotic spots with chlorotic halo caused by infected seed setts and airborne spores.'
    }
  },
  {
    crop: 'Rice',
    name: 'Hispa Leaf Beetle Damage',
    scientificName: 'Dicladispa armigera',
    impact: 'Medium',
    image: REAL_PLANT_PHOTOS.rice,
    affectedParts: ['Upper leaf surface'],
    whatToLookFor: 'White, parallel streaks along the leaf veins where the green tissue has been scraped away.',
    whatFavorsIt: 'High pest populations are common during the early tillering growth stage.',
    howItSpreads: 'Adult beetles fly between plants, and their larvae mine inside the leaves.',
    recommendedAction: 'Monitor pest levels. If damage exceeds economic thresholds, apply a recommended insecticide according to local guidelines.',
    technicalDetails: {
      anatomy: 'Upper epidermal green layer between leaf veins.',
      pathology: 'White parallel scraping streaks and leaf blighting caused by adult feeding and larval tunneling.'
    }
  },
  {
    crop: 'Wheat',
    name: 'Brown Rust / Leaf Rust',
    scientificName: 'Puccinia triticina',
    impact: 'High',
    image: REAL_PLANT_PHOTOS.wheatRust,
    affectedParts: ['Leaf blade', 'Sheath'],
    whatToLookFor: 'Small, round, orange-brown powdery pustules scattered randomly on the upper leaf surface.',
    whatFavorsIt: 'Moderate temperatures (15–22°C) combined with high moisture from dew or light rain.',
    howItSpreads: 'Rust spores are easily carried across long distances by wind.',
    recommendedAction: 'Apply an approved fungicide at early signs of rust detection to protect the upper canopy.',
    technicalDetails: {
      anatomy: 'Upper surface of wheat leaves and leaf sheaths.',
      pathology: 'Randomly scattered orange-brown powdery pustules formed by windborne urediniospores.'
    }
  },
  {
    crop: 'Wheat',
    name: 'Yellow Rust / Stripe Rust',
    scientificName: 'Puccinia striiformis',
    impact: 'Severe',
    image: REAL_PLANT_PHOTOS.wheatRust,
    affectedParts: ['Leaf veins', 'Upper canopy'],
    whatToLookFor: 'Long, yellow stripes of powdery pustules that run parallel along the leaf veins.',
    whatFavorsIt: 'Cool weather (10–15°C) with frequent rainfall or heavy dew.',
    howItSpreads: 'Spores are spread by wind and splashing water.',
    recommendedAction: 'Treat immediately with a recommended fungicide upon the first appearance of yellow streaks to prevent severe yield loss.',
    technicalDetails: {
      anatomy: 'Parallel foliar veins on the upper leaf canopy.',
      pathology: 'Longitudinal yellow pustule stripes organized along leaf veins, driven by cool wind spores.'
    }
  },
  {
    crop: 'Wheat',
    name: 'Septoria Leaf Blotch',
    scientificName: 'Zymoseptoria tritici',
    impact: 'Medium',
    image: REAL_PLANT_PHOTOS.wheatSeptoria,
    affectedParts: ['Lower leaves', 'Upper leaves'],
    whatToLookFor: 'Irregular, brown, rectangular blotches containing tiny black specks on the leaves.',
    whatFavorsIt: 'Frequent rainfall and high humidity, especially during early growth stages.',
    howItSpreads: 'Rain splash moves spores upward from the lower leaves to the rest of the canopy.',
    recommendedAction: 'Use an approved fungicide before the crop canopy closes to protect the flag leaf.',
    technicalDetails: {
      anatomy: 'Older lower leaves moving upward to flag leaf.',
      pathology: 'Rectangular necrotic brown blotches with black pycnidia spore specks dispersed via rain splash.'
    }
  },
  {
    crop: 'Sugarcane',
    name: 'Red Rot',
    scientificName: 'Colletotrichum falcatum',
    impact: 'Severe',
    image: REAL_PLANT_PHOTOS.sugarcaneRedRot,
    affectedParts: ['Internal stalk', 'Stem pith'],
    whatToLookFor: 'The inside of the stalk turns red with white cross-bands and gives off a sour, alcoholic smell.',
    whatFavorsIt: 'Waterlogged soils, borer insect wounds, and planting infected seed pieces.',
    howItSpreads: 'The fungus spreads through infected seed stalks and irrigation water.',
    recommendedAction: 'Plant resistant varieties. Ensure proper field drainage and treat seed stalks with hot water before planting.',
    technicalDetails: {
      anatomy: 'Stalk vascular bundles, internodes, and root head.',
      pathology: 'Internal red stalk rotting with white cross bands caused by fungal infection entering through wounds or infected setts.'
    }
  },
  {
    crop: 'Sugarcane',
    name: 'Sugarcane Mosaic Virus',
    scientificName: 'Sugarcane Mosaic Potyvirus',
    impact: 'Medium',
    image: REAL_PLANT_PHOTOS.sugarcaneMosaic,
    affectedParts: ['Young growing leaves'],
    whatToLookFor: 'Irregular, light green and yellow mottled streaks appearing on young leaves.',
    whatFavorsIt: 'The presence of aphid populations in the field and surrounding weeds.',
    howItSpreads: 'Transmitted by aphids feeding on infected plants and then moving to healthy ones.',
    recommendedAction: 'Use certified virus-free seed cane for planting and remove infected plants immediately.',
    technicalDetails: {
      anatomy: 'Newly emerging whorl leaves and leaf sheaths.',
      pathology: 'Chlorotic mosaic streaks caused by viral particles transmitted via the corn aphid vector (Rhopalosiphum maidis).'
    }
  },
  {
    crop: 'Cotton',
    name: 'Bacterial Blight',
    scientificName: 'Xanthomonas citri pv. malvacearum',
    impact: 'High',
    image: REAL_PLANT_PHOTOS.cottonBlight,
    affectedParts: ['Leaf veins', 'Stem'],
    whatToLookFor: 'Dark, water-soaked, angular spots on leaves bounded by veins, and black lesions on the stem.',
    whatFavorsIt: 'Warm, rainy weather and high winds that drive rain into the plant tissues.',
    howItSpreads: 'The bacteria spread through wind-driven rain and infected seed stock.',
    recommendedAction: 'Apply a locally recommended copper-based bactericide. Ensure seeds are certified disease-free before planting.',
    technicalDetails: {
      anatomy: 'Cotyledons, angular leaf vein cells, and the main stem.',
      pathology: 'Water-soaked angular vein-bounded spots and black stem rot driven by bacterial infection.'
    }
  },
  {
    crop: 'Cotton',
    name: 'Cotton Leaf Curl Virus (CLCuV)',
    scientificName: 'Begomovirus',
    impact: 'Severe',
    image: REAL_PLANT_PHOTOS.cottonLeafCurl,
    affectedParts: ['Leaf margins', 'Veins'],
    whatToLookFor: 'Leaves curl upwards or downwards, veins become thickened, and cup-like structures form on the leaves.',
    whatFavorsIt: 'High whitefly populations during the growing season.',
    howItSpreads: 'The virus is exclusively transmitted by the whitefly insect vector.',
    recommendedAction: 'Control whitefly populations using recommended insecticides and employ resistant cotton varieties if available.',
    technicalDetails: {
      anatomy: 'Foliar leaf margins, veins, and leaf undersides.',
      pathology: 'Leaf curling, thickened veins, and enations caused by viral infection transmitted by Bemisia tabaci.'
    }
  }
]
