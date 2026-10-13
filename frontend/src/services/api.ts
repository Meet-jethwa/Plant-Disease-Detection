// ═══════════════════════════════════════════════════════
// PlantEase — API Service Layer
// Mock implementations ready to be replaced with real API
// ═══════════════════════════════════════════════════════

import type { Plant, HistoryItem, PredictionResponse, ChatMessage, LocationContextData } from '../types'
import { MOCK_PLANTS, MOCK_HISTORY, MOCK_DIAGNOSIS_RESULT } from '../data/mockData'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options)
  const data = await res.json()
  if (!res.ok) {
    const err = (data as { detail?: string }).detail ?? 'API request failed'
    throw new Error(err)
  }
  return data as T
}

// ── Plant Analysis ─────────────────────────────────────
export async function analyzePlant(
  file: File,
  crop: string,
  location?: { latitude?: number; longitude?: number; city?: string },
  weather?: { temperature_c?: number; humidity_percent?: number; rainfall_mm?: number; wind_kmh?: number }
): Promise<PredictionResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('crop', crop)
  if (location?.latitude) formData.append('latitude', String(location.latitude))
  if (location?.longitude) formData.append('longitude', String(location.longitude))
  if (location?.city) formData.append('city', location.city)
  if (weather?.temperature_c !== undefined) formData.append('temperature', String(weather.temperature_c))
  if (weather?.humidity_percent !== undefined) formData.append('humidity', String(weather.humidity_percent))
  if (weather?.rainfall_mm !== undefined) formData.append('rainfall', String(weather.rainfall_mm))
  if (weather?.wind_kmh !== undefined) formData.append('wind_speed', String(weather.wind_kmh))
  return fetchAPI<PredictionResponse>('/api/predict', { method: 'POST', body: formData })
}

// ── Plants CRUD ────────────────────────────────────────
export async function getPlants(): Promise<Plant[]> {
  try {
    return await fetchAPI<Plant[]>('/api/plants')
  } catch {
    return MOCK_PLANTS
  }
}

export async function savePlant(data: Partial<Plant>): Promise<Plant> {
  try {
    return await fetchAPI<Plant>('/api/plants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {
    const mock: Plant = {
      id: `plant-${Date.now()}`,
      name: data.name ?? 'Unknown Plant',
      species: data.species ?? 'Unknown',
      scientificName: data.scientificName ?? '',
      image: data.image ?? '',
      healthScore: data.healthScore ?? 80,
      status: data.status ?? 'Healthy',
      lastScanned: 'Just now',
    }
    return mock
  }
}

// ── History ────────────────────────────────────────────
export async function getHistory(): Promise<HistoryItem[]> {
  try {
    return await fetchAPI<HistoryItem[]>('/api/history')
  } catch {
    return MOCK_HISTORY
  }
}

export async function getDiagnosis(id: string): Promise<PredictionResponse> {
  try {
    return await fetchAPI<PredictionResponse>(`/api/diagnosis/${id}`)
  } catch {
    return MOCK_DIAGNOSIS_RESULT as PredictionResponse
  }
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
      `agronomist for tailored treatment advice.`
    )
  }
}

// ── Weather / Location ─────────────────────────────────
export async function fetchLocationWeather(
  coords?: { latitude: number; longitude: number }
): Promise<LocationContextData> {
  const query = coords ? `?latitude=${coords.latitude}&longitude=${coords.longitude}` : ''
  try {
    return await fetchAPI<LocationContextData>(`/api/location/fetch${query}`)
  } catch {
    return {
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.08, longitude: 72.88 },
      weather: { temperature_c: 31.2, humidity_percent: 88, rainfall_mm: 18.6, wind_kmh: 22.5, condition: 'Overcast with Rain' },
      risk_level: 'High',
      risk_reason: 'High humidity and rainfall support elevated disease progression risk.',
    }
  }
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
