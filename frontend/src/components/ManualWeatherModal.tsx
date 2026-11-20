import { useState } from 'react'
import { X, Search, Thermometer, Droplets, CloudRain, Wind, MapPin, RefreshCw, Check } from 'lucide-react'
import type { LocationContextData } from '../types'

interface ManualWeatherModalProps {
  isOpen: boolean
  onClose: () => void
  currentLocationData: LocationContextData | null
  onSave: (data: LocationContextData) => void
  onResetToLive: () => void
}

import { API_BASE } from '../services/api'

export function ManualWeatherModal({
  isOpen,
  onClose,
  currentLocationData,
  onSave,
  onResetToLive,
}: ManualWeatherModalProps) {
  const [cityInput, setCityInput] = useState(currentLocationData?.location?.city || 'Ludhiana')
  const [stateInput, setStateInput] = useState(currentLocationData?.location?.state || 'Punjab')
  const [temp, setTemp] = useState(currentLocationData?.weather?.temperature_c ?? 28.5)
  const [humidity, setHumidity] = useState(currentLocationData?.weather?.humidity_percent ?? 72)
  const [rainfall, setRainfall] = useState(currentLocationData?.weather?.rainfall_mm ?? 5.0)
  const [wind, setWind] = useState(currentLocationData?.weather?.wind_kmh ?? 12.0)
  const [condition, setCondition] = useState(currentLocationData?.weather?.condition || 'Partly Cloudy')
  const [isSearchingCity, setIsSearchingCity] = useState(false)
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSearchCity() {
    if (!cityInput.trim()) return
    setIsSearchingCity(true)
    setSearchFeedback(null)
    try {
      const res = await fetch(`${API_BASE}/api/location/fetch?city=${encodeURIComponent(cityInput.trim())}`)
      if (res.ok) {
        const data = await res.json() as LocationContextData
        if (data && data.location && data.weather) {
          setCityInput(data.location.city)
          setStateInput(data.location.state || '')
          setTemp(data.weather.temperature_c)
          setHumidity(data.weather.humidity_percent)
          setRainfall(data.weather.rainfall_mm)
          setWind(data.weather.wind_kmh)
          setCondition(data.weather.condition)
          setSearchFeedback(`Loaded real-time weather for ${data.location.city}, ${data.location.country}`)
        } else {
          setSearchFeedback('City not found. You can enter values manually below.')
        }
      } else {
        setSearchFeedback('Could not fetch city weather. You can enter values manually below.')
      }
    } catch {
      setSearchFeedback('Network error. You can enter values manually below.')
    } finally {
      setIsSearchingCity(false)
    }
  }

  function handleSaveManual() {
    const riskLevel: 'Low' | 'Medium' | 'High' =
      humidity > 80 || rainfall > 15 ? 'High' :
      humidity > 65 || rainfall > 5 ? 'Medium' : 'Low'

    const riskReason =
      riskLevel === 'High'
        ? 'High humidity and moisture support accelerated spore germination and disease spread.'
        : riskLevel === 'Medium'
        ? 'Moderate ambient humidity provides favorable conditions for foliar pathogens.'
        : 'Dry ambient conditions maintain lower immediate disease progression risk.'

    const updatedData: LocationContextData = {
      location: {
        city: cityInput.trim() || 'Custom Location',
        state: stateInput.trim() || 'Agricultural Zone',
        country: 'India',
        latitude: currentLocationData?.location?.latitude ?? 28.61,
        longitude: currentLocationData?.location?.longitude ?? 77.23,
      },
      weather: {
        temperature_c: Number(temp),
        humidity_percent: Math.round(Number(humidity)),
        rainfall_mm: Number(rainfall),
        wind_kmh: Number(wind),
        condition,
      },
      risk_level: riskLevel,
      risk_reason: riskReason,
    }

    // Persist to localStorage
    localStorage.setItem('flora_ai_manual_weather', JSON.stringify(updatedData))
    window.dispatchEvent(new Event('flora_weather_updated'))
    onSave(updatedData)
    onClose()
  }

  function handleResetLive() {
    localStorage.removeItem('flora_ai_manual_weather')
    window.dispatchEvent(new Event('flora_weather_updated'))
    onResetToLive()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[var(--color-green-200)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Thermometer className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Manual Weather & Location</h3>
              <p className="text-sm text-emerald-100">Configure environmental data for AI disease diagnosis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick city fetch */}
          <div className="p-4 rounded-xl bg-[var(--color-green-50)] border border-[var(--color-green-300)] space-y-2.5">
            <label className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              Auto-fetch by City / District Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g. Ludhiana, Nashik, Hyderabad..."
                className="input input-sm flex-1 bg-white text-sm font-semibold"
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSearchCity() }}
              />
              <button
                type="button"
                onClick={() => void handleSearchCity()}
                disabled={isSearchingCity}
                className="btn btn-primary btn-sm shrink-0 gap-1 text-sm cursor-pointer"
              >
                {isSearchingCity ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Fetch
              </button>
            </div>
            {searchFeedback && (
              <p className="text-sm font-medium text-emerald-800">{searchFeedback}</p>
            )}
          </div>

          {/* Manual Parameter Sliders / Inputs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-ink)]">Custom weather parameters</span>
              <span className="text-xs font-medium text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Manual override
              </span>
            </div>

            {/* Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-[var(--color-ink)] flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-orange-600" />
                  Temperature (°C)
                </span>
                <span className="font-bold text-emerald-800 text-sm">{temp}°C</span>
              </div>
              <input
                type="range"
                min="5"
                max="48"
                step="0.5"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full accent-emerald-700"
              />
              <div className="flex justify-between text-xs text-[var(--color-ink-2)]">
                <span>5°C (Cool)</span>
                <span>28°C (Optimal)</span>
                <span>48°C (Hot)</span>
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-[var(--color-ink)] flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  Relative Humidity (%)
                </span>
                <span className="font-bold text-emerald-800 text-sm">{humidity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                value={humidity}
                onChange={(e) => setHumidity(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-700"
              />
              <div className="flex justify-between text-xs text-[var(--color-ink-2)]">
                <span>20% (Dry)</span>
                <span>65% (Moderate)</span>
                <span>100% (Saturated)</span>
              </div>
            </div>

            {/* Rainfall */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-[var(--color-ink)] flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-indigo-600" />
                  Rainfall (mm)
                </span>
                <span className="font-bold text-emerald-800 text-sm">{rainfall} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="0.5"
                value={rainfall}
                onChange={(e) => setRainfall(parseFloat(e.target.value))}
                className="w-full accent-emerald-700"
              />
              <div className="flex justify-between text-xs text-[var(--color-ink-2)]">
                <span>0 mm (None)</span>
                <span>15 mm (Moderate)</span>
                <span>60 mm (Heavy)</span>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-[var(--color-ink)] flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-emerald-600" />
                  Wind Speed (km/h)
                </span>
                <span className="font-bold text-emerald-800 text-sm">{wind} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={wind}
                onChange={(e) => setWind(parseFloat(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </div>

            {/* Weather Condition */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[var(--color-ink)]">Sky / Atmosphere Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="select select-sm w-full bg-white text-sm font-medium border border-stone-200 rounded-xl"
              >
                <option value="Sunny / Clear">Sunny / Clear</option>
                <option value="Partly Cloudy">Partly Cloudy</option>
                <option value="Humid & Overcast">Humid & Overcast</option>
                <option value="Rain Showers">Rain Showers</option>
                <option value="Drizzle / Light Rain">Drizzle / Light Rain</option>
                <option value="Thunderstorm">Thunderstorm</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-[var(--color-green-200)] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetLive}
            className="btn btn-secondary btn-sm gap-1 text-sm font-semibold cursor-pointer"
            title="Clear manual weather and fetch real live GPS/IP weather"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Live GPS
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveManual}
              className="btn btn-primary btn-sm gap-1 text-sm font-semibold cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Weather
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
