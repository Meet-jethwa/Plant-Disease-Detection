// ═══════════════════════════════════════════════════════
// PlantEase — Mock Data
// Replace with real API responses when backend is connected
// ═══════════════════════════════════════════════════════

import type { Plant, HistoryItem, Crop, TimelineEntry } from '../types'

export const MOCK_CROPS: Crop[] = [
  { name: 'rice',     label: 'Rice',     emoji: '🌾', sciName: 'Oryza sativa' },
  { name: 'wheat',    label: 'Wheat',    emoji: '🌾', sciName: 'Triticum aestivum' },
  { name: 'sugarcane',label: 'Sugarcane',emoji: '🎋', sciName: 'Saccharum officinarum' },
  { name: 'cotton',   label: 'Cotton',   emoji: '🌿', sciName: 'Gossypium hirsutum' },
]

// Placeholder leaf image (base64 small green leaf)
const LEAF_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNEREY3RUEiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSI4MCIgZmlsbD0iIzBCOEY2OCIgb3BhY2l0eT0iMC42IiB0cmFuc2Zvcm09InJvdGF0ZSgtMTUgMTAwIDEwMCkiLz48L3N2Zz4='

export const MOCK_PLANTS: Plant[] = [
  {
    id: 'plant-1',
    name: 'Rice Paddy A',
    species: 'Rice',
    scientificName: 'Oryza sativa',
    image: LEAF_PLACEHOLDER,
    healthScore: 64,
    status: 'Needs Attention',
    lastScanned: 'Today, 2:30 PM',
    latestDisease: 'Rice Blast',
    waterFrequency: 'Flooded paddy',
    sunlight: 'Full sun',
    humidity: '80–90%',
    soil: 'Clay, waterlogged',
  },
  {
    id: 'plant-2',
    name: 'Wheat Field A',
    species: 'Wheat',
    scientificName: 'Triticum aestivum',
    image: LEAF_PLACEHOLDER,
    healthScore: 71,
    status: 'Needs Attention',
    lastScanned: 'Yesterday',
    latestDisease: 'Yellow Rust',
    waterFrequency: 'Weekly irrigation',
    sunlight: 'Full sun',
    humidity: '40–60%',
    soil: 'Clay loam',
  },
  {
    id: 'plant-3',
    name: 'Sugarcane Plot B',
    species: 'Sugarcane',
    scientificName: 'Saccharum officinarum',
    image: LEAF_PLACEHOLDER,
    healthScore: 84,
    status: 'Healthy',
    lastScanned: '3 days ago',
    latestDisease: 'None detected',
    waterFrequency: 'Twice weekly',
    sunlight: 'Full sun (8+ hrs)',
    humidity: '50–70%',
    soil: 'Loam, well-drained',
  },
  {
    id: 'plant-4',
    name: 'Cotton Block C',
    species: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    image: LEAF_PLACEHOLDER,
    healthScore: 45,
    status: 'At Risk',
    lastScanned: 'Aug 15',
    latestDisease: 'Bacterial Blight',
    waterFrequency: 'Every 5–7 days',
    sunlight: 'Full sun',
    humidity: '50–60%',
    soil: 'Black cotton soil',
  },
]

export const MOCK_TIMELINE: TimelineEntry[] = [
  { date: 'Aug 17', healthScore: 64,  diagnosis: 'Rice Blast', status: 'Needs Attention' },
  { date: 'Aug 10', healthScore: 71,  diagnosis: 'Minor leaf spotting', status: 'Needs Attention' },
  { date: 'Aug 3',  healthScore: 86,  diagnosis: 'Healthy', status: 'Healthy' },
  { date: 'Jul 26', healthScore: 92,  diagnosis: 'Healthy', status: 'Healthy' },
  { date: 'Jul 18', healthScore: 78,  diagnosis: 'Yellow Rust', status: 'Needs Attention' },
]

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'h-1',
    crop: 'Rice',
    predicted_class: 'Rice Blast',
    confidence_percent: 92.8,
    health_score: 64,
    timestamp: 'Aug 17, 2:30 PM',
    image_url: LEAF_PLACEHOLDER,
    severity: 'Moderate',
    status: 'Needs Attention',
  },
  {
    id: 'h-2',
    crop: 'Wheat',
    predicted_class: 'Yellow Rust',
    confidence_percent: 88.4,
    health_score: 71,
    timestamp: 'Aug 16, 11:00 AM',
    image_url: LEAF_PLACEHOLDER,
    severity: 'High',
    status: 'Needs Attention',
  },
  {
    id: 'h-3',
    crop: 'Sugarcane',
    predicted_class: 'Healthy',
    confidence_percent: 96.1,
    health_score: 91,
    timestamp: 'Aug 14, 9:15 AM',
    image_url: LEAF_PLACEHOLDER,
    severity: 'None',
    status: 'Healthy',
  },
  {
    id: 'h-4',
    crop: 'Cotton',
    predicted_class: 'Bacterial Blight',
    confidence_percent: 85.2,
    health_score: 45,
    timestamp: 'Aug 13, 4:00 PM',
    image_url: LEAF_PLACEHOLDER,
    severity: 'Severe',
    status: 'At Risk',
  },
]

export const MOCK_DIAGNOSIS_RESULT = {
  crop: 'Rice',
  predicted_class: 'Rice Blast',
  confidence_percent: 92.8,
  health_score: 64,
  scientific_name: 'Oryza sativa',
  affected_area_percent: 18,
  top3: [
    { class: 'Rice Blast', confidence: 0.928 },
    { class: 'Brown Spot', confidence: 0.051 },
    { class: 'Healthy', confidence: 0.021 },
  ],
  disease_info: {
    display: 'Rice Blast',
    severity: 'Moderate',
    description: 'Rice blast is a fungal disease caused by Magnaporthe oryzae. It produces spindle-shaped lesions with grey centres and dark brown borders on leaves, often spreading rapidly under high humidity.',
    causes: 'Warm, humid weather, dense canopy, frequent leaf wetness, and poor air circulation create ideal conditions for spore germination and disease spread.',
    treatment: '1. Remove infected residues from the field.\n2. Apply recommended fungicide in rotation.\n3. Avoid excess nitrogen.\n4. Improve spacing and drainage.\n5. Monitor other rice blocks closely.',
    prevention: 'Use resistant rice varieties, maintain balanced fertilization, reduce field density, and avoid prolonged leaf wetness through proper water management.',
  },
  symptoms: [
    { name: 'Spindle-shaped leaf lesions', confidence: 94 },
    { name: 'Dark brown margins with grey centres', confidence: 89 },
    { name: 'Leaf yellowing around infection site', confidence: 82 },
    { name: 'Spread from older leaves upward', confidence: 71 },
  ],
  possible_causes: [
    { name: 'Fungal infection (Magnaporthe oryzae)', description: 'Primary pathogen responsible for the blast lesions.' },
    { name: 'High humidity & leaf wetness', description: 'Extended wet periods accelerate spore germination.' },
    { name: 'Dense crop canopy', description: 'Crowded growth reduces airflow and keeps foliage damp.' },
    { name: 'Nitrogen excess', description: 'High nitrogen levels can increase susceptibility to blast disease.' },
  ],
  analysis_summary: 'Rice Blast detected in rice with moderate severity. Approximately 18% of leaf area shows characteristic blast symptoms. Immediate treatment recommended to prevent spread.',
  original_image: LEAF_PLACEHOLDER,
  highlighted_image: LEAF_PLACEHOLDER,
  weather_context: {
    location: { city: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.03, longitude: 72.58 },
    weather: { temperature_c: 32.4, humidity_percent: 74, rainfall_mm: 8.5, wind_kmh: 14.2, condition: 'Partly Humid' },
    risk_level: 'Medium',
    risk_reason: 'Moderate humidity levels support steady spore survival.',
  },
}
