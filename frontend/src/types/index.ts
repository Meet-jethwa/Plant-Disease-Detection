// ═══════════════════════════════════════════════════════
// PlantEase — Shared TypeScript Types
// ═══════════════════════════════════════════════════════

export type Crop = {
  name: string
  label: string
  emoji?: string
  sciName?: string
}

export type SeverityLevel = 'healthy' | 'low' | 'moderate' | 'high' | 'severe'

export type HealthStatus = 'Healthy' | 'Needs Attention' | 'At Risk' | 'Critical'

export type WeatherData = {
  temperature_c: number
  humidity_percent: number
  rainfall_mm: number
  wind_kmh: number
  condition: string
}

export type LocationData = {
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
}

export type DiseaseInfo = {
  display: string
  severity: string
  description: string
  causes: string
  treatment: string
  prevention: string
}

export type Symptom = {
  name: string
  confidence: number
  icon?: string
}

export type Cause = {
  name: string
  description: string
}

export type PredictionResponse = {
  crop: string
  predicted_class: string
  confidence: number              // 0.0–1.0
  confidence_percent: number
  health_score: number
  top3: Array<{ class: string; confidence: number }>
  disease_info: DiseaseInfo
  weather_context: {
    location?: LocationData
    weather?: WeatherData
    risk_level?: string
    risk_reason?: string
    feature_importance?: Record<string, number>
  }
  analysis_summary: string
  original_image: string
  highlighted_image: string
  // Extended fields (may be absent — handle gracefully)
  symptoms?: Symptom[]
  possible_causes?: Cause[]
  affected_area_percent?: number
  scientific_name?: string
}

export type Plant = {
  id: string
  name: string
  species: string
  scientificName: string
  image: string
  healthScore: number
  status: HealthStatus
  lastScanned: string
  latestDisease?: string
  waterFrequency?: string
  sunlight?: string
  humidity?: string
  soil?: string
}

export type TimelineEntry = {
  date: string
  healthScore: number
  diagnosis: string
  status: HealthStatus
}

export type HistoryItem = {
  id: string
  crop: string
  predicted_class: string
  confidence_percent: number
  health_score: number
  timestamp: string
  image_url: string
  severity?: string
  status?: HealthStatus
}

// ── Gemini Structured Response ──────────────────────────────────────────────

export type GeminiEnvFactor = {
  factor: string
  importance_pct: number
  explanation: string
}

export type GeminiResponse = {
  diagnosis_summary: string
  why_detected: string[]
  environmental_factors: GeminiEnvFactor[]
  recommended_actions: string[]
  prevention: string[]
  disclaimer: string
}

// ── Chat ────────────────────────────────────────────────────────────────────

export type ChatMessage = {
  role: 'user' | 'assistant'
  text: string                    // plain-text fallback / user messages
  structured?: GeminiResponse     // present on AI messages when Gemini returns structured data
  timestamp?: string
}

// ── Diagnosis Context (sent to /api/assistant/ask) ──────────────────────────

export type DiagnosisContext = {
  question: string
  crop?: string
  predicted_class?: string
  confidence?: number             // 0.0–1.0
  weather?: WeatherData
  feature_importance?: Record<string, number>
  gradcam_image_b64?: string      // base64 data URL of the Grad-CAM overlay
  disease_info?: Partial<DiseaseInfo>
}

export type LocationContextData = {
  location: LocationData
  weather: WeatherData
  risk_level: string
  risk_reason: string
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export type Toast = {
  id: string
  type: NotificationType
  title: string
  message?: string
}
