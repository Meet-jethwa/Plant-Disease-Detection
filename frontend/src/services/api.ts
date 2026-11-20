// ═══════════════════════════════════════════════════════
// FloraAI — API Service & Data Access Layer
// Explicit Persistence: Local Browser Storage (localStorage)
// Genuine Open-Meteo & PyTorch Multimodal Integration
// ═══════════════════════════════════════════════════════

import type { Plant, HistoryItem, PredictionResponse, ChatMessage, LocationContextData } from '../types'

export const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000').replace(/\/+$/, '')

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options)
  const data = await res.json()
  if (!res.ok) {
    const err = (data as { detail?: string }).detail ?? 'API request failed'
    throw new Error(err)
  }
  return data as T
}

export interface LocationSearchResult {
  id?: number
  name: string
  latitude: number
  longitude: number
  elevation?: number
  country?: string
  state?: string
  timezone?: string
}

// ── Plant Analysis ─────────────────────────────────────
export async function analyzePlant(
  file: File,
  crop: string,
  location?: { latitude?: number; longitude?: number; city?: string },
  weather?: { temperature_c?: number; humidity_percent?: number; rainfall_mm?: number; wind_kmh?: number },
  weatherProfile?: string,
  captureDate?: string,
): Promise<PredictionResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('crop', crop)

  // Handle coordinates with explicit null/undefined check (allows latitude/longitude == 0.0)
  if (location?.latitude !== undefined && location?.latitude !== null) {
    formData.append('latitude', String(location.latitude))
  }
  if (location?.longitude !== undefined && location?.longitude !== null) {
    formData.append('longitude', String(location.longitude))
  }
  if (location?.city && location.city.trim()) {
    formData.append('city', location.city.trim())
  }
  if (weatherProfile && weatherProfile.trim() && weatherProfile !== 'auto') {
    formData.append('weather_profile', weatherProfile.trim())
  }
  if (captureDate && captureDate.trim()) {
    formData.append('capture_date', captureDate.trim())
  }

  if (weather?.temperature_c !== undefined) formData.append('temperature', String(weather.temperature_c))
  if (weather?.humidity_percent !== undefined) formData.append('humidity', String(weather.humidity_percent))
  if (weather?.rainfall_mm !== undefined) formData.append('rainfall', String(weather.rainfall_mm))
  if (weather?.wind_kmh !== undefined) formData.append('wind_speed', String(weather.wind_kmh))

  return fetchAPI<PredictionResponse>('/api/predict', { method: 'POST', body: formData })
}

// ── Plants Persistence (Explicit LocalStorage) ─────────
export async function getPlants(): Promise<Plant[]> {
  try {
    const saved = localStorage.getItem('flora_scanned_plants')
    if (saved) return JSON.parse(saved) as Plant[]
  } catch {
    // ignore parse error
  }
  return []
}

export async function savePlant(data: Partial<Plant>): Promise<Plant> {
  const current = await getPlants()
  const newPlant: Plant = {
    id: data.id || `plant_${Date.now()}`,
    name: data.name ?? 'Unknown Crop',
    species: data.species ?? 'Crop',
    scientificName: data.scientificName ?? '',
    image: data.image ?? '',
    healthScore: data.healthScore ?? 80,
    status: data.status ?? 'Healthy',
    lastScanned: 'Just now',
    latestDisease: data.latestDisease,
    waterFrequency: data.waterFrequency,
    sunlight: data.sunlight,
    humidity: data.humidity,
    soil: data.soil,
  }
  const next = [newPlant, ...current]
  try {
    localStorage.setItem('flora_scanned_plants', JSON.stringify(next))
  } catch {
    // quota exceeded or storage blocked
  }
  return newPlant
}

// ── History Persistence (Explicit LocalStorage) ────────
export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const saved = localStorage.getItem('flora_diagnosis_history')
    if (saved) return JSON.parse(saved) as HistoryItem[]
  } catch {
    // ignore parse error
  }
  return []
}

export async function saveHistoryItem(item: HistoryItem): Promise<void> {
  const current = await getHistory()
  const next = [item, ...current]
  try {
    localStorage.setItem('flora_diagnosis_history', JSON.stringify(next))
  } catch {
    // quota exceeded
  }
}

export async function getDiagnosis(id: string): Promise<PredictionResponse | null> {
  const history = await getHistory()
  const found = history.find((h) => h.id === id)
  if (found && (found as any).full_prediction) {
    return (found as any).full_prediction as PredictionResponse
  }
  return null
}

// ── AI Assistant ───────────────────────────────────────
export async function askAssistant(
  context: import('../types').AskPayload
): Promise<string> {
  try {
    const data = await fetchAPI<{
      chat_answer?: string
      follow_up_questions?: string[]
      intent?: string
    }>('/api/assistant/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    })
    return data.chat_answer ?? context.message
  } catch {
    return (
      `I understand you're asking about your plant. Based on the diagnosis context, I recommend ` +
      `monitoring the affected areas closely, ensuring proper field drainage, and consulting a local ` +
      `agronomist or Krishi Vigyan Kendra (KVK) officer for tailored treatment advice.`
    )
  }
}

// ── Weather & Location ─────────────────────────────────
export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query || !query.trim()) return []
  const data = await fetchAPI<{ results: LocationSearchResult[] }>(
    `/api/location/search?query=${encodeURIComponent(query.trim())}`
  )
  return data.results || []
}

export async function fetchLocationWeather(
  coords?: { latitude: number; longitude: number },
  city?: string,
): Promise<LocationContextData> {
  let query = ''
  if (coords?.latitude !== undefined && coords?.longitude !== undefined) {
    query = `?latitude=${coords.latitude}&longitude=${coords.longitude}`
  } else if (city && city.trim()) {
    query = `?city=${encodeURIComponent(city.trim())}`
  }
  // Authentic call — throws on failure without silently returning fake Mumbai/Ahmedabad data
  return await fetchAPI<LocationContextData>(`/api/location/fetch${query}`)
}

// ── Health Check ───────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`)
    return res.ok
  } catch {
    return false
  }
}

// ── Crops ──────────────────────────────────────────────
export async function getCrops(): Promise<{ name: string; label: string }[]> {
  try {
    const data = await fetchAPI<{ crops: { name: string; label: string }[] }>('/api/crops')
    return data.crops
  } catch {
    return [
      { name: 'rice',      label: 'Rice' },
      { name: 'wheat',     label: 'Wheat' },
      { name: 'sugarcane', label: 'Sugarcane' },
      { name: 'cotton',    label: 'Cotton' },
    ]
  }
}

export type { ChatMessage }
