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
  gradcam_heatmap?: string        // pure JET colormap (no blend) for screen overlay
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

// ── Gemini Structured Response (Mode A — initial diagnosis) ──────────────────

export type GeminiEnvFactor = {
  factor: string
  importance_pct: number
  explanation: string
}

export type GeminiVisualExplanation = {
  original_image_explanation: string
  gradcam_explanation: string
}

export type GeminiResponse = {
  diagnosis_summary: string
  why_detected: string[]
  visual_explanation?: GeminiVisualExplanation
  /** Combined SHAP + environmental factors — rendered once, not twice */
  environmental_factors: GeminiEnvFactor[]
  recommended_actions: string[]
  actionable_steps?: string[]
  prevention: string[]
  follow_up_questions?: string[]
  disclaimer: string
}

// ── Chat answer (Mode B — follow-up) ─────────────────────────────────────────

export type ChatAnswerResponse = {
  chat_answer: string
  follow_up_questions: string[]
  intent: string
}

// ── Chat ────────────────────────────────────────────────────────────────────

/**
 * A single message in the chat history.
 * - `structured` is set on the initial AI message (Mode A full diagnosis)
 * - `chat_answer` is set on follow-up AI messages (Mode B focused answer)
 * - User messages only have `role` and `text`
 */
export type ChatMessage = {
  role: 'user' | 'assistant'
  text: string                       // plain-text fallback / user messages
  structured?: GeminiResponse        // Mode A: initial diagnosis explanation
  geminiData?: GeminiResponse        // alias for structured
  chat_answer?: string               // Mode B: focused follow-up answer
  intent?: string                    // detected intent for Mode B messages
  follow_up_questions?: string[]     // dynamic chips for Mode B messages
  timestamp?: string
}

// ── Diagnosis session ─────────────────────────────────────────────────────────

/**
 * Sent to POST /api/assistant/start to initialise a diagnosis session.
 */
export type StartSessionPayload = {
  diagnosis_id: string
  crop: string
  predicted_class: string
  confidence: number
  top3?: Array<{ class: string; confidence: number }>
  weather?: WeatherData
  feature_importance?: Record<string, number>
  gradcam_image_b64?: string
  disease_info?: Partial<DiseaseInfo>
  language?: string
}

/**
 * Sent to POST /api/assistant/ask for follow-up chat.
 * Only the diagnosis_id and user message — no images.
 */
export type AskPayload = {
  diagnosis_id: string
  message: string
  language?: string
}

// ── Location ──────────────────────────────────────────────────────────────────

export type LocationContextData = {
  location: LocationData
  weather: WeatherData
  risk_level: string
  risk_reason: string
}

// ── UI utilities ─────────────────────────────────────────────────────────────

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export type Toast = {
  id: string
  type: NotificationType
  title: string
  message?: string
}
