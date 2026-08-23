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
  location?: { latitude: number; longitude: number }
): Promise<PredictionResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('crop', crop)
  if (location) {
    formData.append('latitude', String(location.latitude))
    formData.append('longitude', String(location.longitude))
  }
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
  context: import('../types').DiagnosisContext
): Promise<import('../types').GeminiResponse | string> {
  try {
    const data = await fetchAPI<{
      gemini_response?: import('../types').GeminiResponse
      follow_up_questions?: string[]
    }>('/api/assistant/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    })
    return data.gemini_response ?? context.question
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
      location: { city: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.03, longitude: 72.58 },
      weather: { temperature_c: 32.4, humidity_percent: 74, rainfall_mm: 8.5, wind_kmh: 14.2, condition: 'Partly Humid' },
      risk_level: 'Medium',
      risk_reason: 'Moderate humidity levels support steady spore survival.',
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
