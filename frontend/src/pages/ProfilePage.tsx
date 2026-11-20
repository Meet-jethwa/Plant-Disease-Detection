// ProfilePage.tsx — FloraAI profile & settings with manual weather data preference
import { useState, useEffect } from 'react'
import {
  User, Camera, Bell, Globe, Shield,
  HelpCircle, LogOut, ChevronRight, ChevronDown, Leaf, ScanLine,
  HeartPulse, BookMarked, Check, CheckCircle, Zap,
  CloudRain, CloudSun, Thermometer, Droplets, Wind, MapPin, RefreshCw,
  Navigation, Search, FlaskConical, Sliders,
} from 'lucide-react'
import { LanguageSelector } from '../components/LanguageSelector'
import { useLang } from '../contexts/LanguageContext'
import { searchLocations, fetchLocationWeather, API_BASE, type LocationSearchResult } from '../services/api'
import type { DiseaseWeatherProfile, LocationContextData } from '../types'

interface SettingRowProps {
  icon: React.ElementType
  label: string
  description?: string
  value?: React.ReactNode
  toggle?: boolean
  defaultOn?: boolean
  onClick?: () => void
  id?: string
}

function SettingRow({ icon: Icon, label, description, value, toggle, defaultOn = false, onClick, id }: SettingRowProps) {
  const [on, setOn] = useState(defaultOn)
  const isClickable = Boolean(toggle || onClick)
  const Component = isClickable ? 'button' : 'div'

  return (
    <Component
      {...(isClickable ? { type: 'button' as const } : {})}
      id={id}
      onClick={toggle ? () => setOn(v => !v) : onClick}
      className={`w-full min-h-[52px] flex items-center gap-3.5 px-4 py-3 rounded-xl transition-colors text-left ${
        isClickable ? 'cursor-pointer hover:bg-stone-50' : ''
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-emerald-700">
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-ink)]">{label}</p>
        {description && <p className="text-sm text-[var(--color-ink-2)] mt-0.5">{description}</p>}
      </div>

      {toggle ? (
        <div
          className={`w-11 h-6 rounded-full relative shrink-0 transition-colors cursor-pointer ${
            on ? 'bg-emerald-600' : 'bg-stone-200'
          }`}
          role="switch"
          aria-checked={on}
          aria-label={label}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
              on ? 'translate-x-5.5' : 'translate-x-0.5'
            }`}
          />
        </div>
      ) : value ? (
        <span className="text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
          {value}
        </span>
      ) : (
        <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
      )}
    </Component>
  )
}

interface ProfilePageProps {
  locationData?: LocationContextData | null
  onUpdateLocationData?: (data: LocationContextData | null) => void
  onFetchLocation?: () => void
  isLocating?: boolean
}

export function ProfilePage({
  locationData,
  onUpdateLocationData,
  onFetchLocation,
  isLocating = false,
}: ProfilePageProps) {
  const { t } = useLang()
  const [isWeatherOpen, setIsWeatherOpen] = useState(false)
  const [isManualActive, setIsManualActive] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState(false)
  const [resetFeedback, setResetFeedback] = useState(false)

  // Weather profiles state
  const [selectedWeatherProfile, setSelectedWeatherProfile] = useState<string>(() => {
    return localStorage.getItem('flora_weather_profile_override') || 'auto'
  })
  const [profiles, setProfiles] = useState<DiseaseWeatherProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(false)

  useEffect(() => {
    let active = true
    setLoadingProfiles(true)
    fetch(`${API_BASE}/api/weather/disease-profiles`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.profiles) {
          setProfiles(data.profiles)
        }
      })
      .catch(() => {
        if (active) setProfiles([])
      })
      .finally(() => {
        if (active) setLoadingProfiles(false)
      })
    return () => {
      active = false
    }
  }, [])

  function handleSelectWeatherProfile(profileKey: string) {
    setSelectedWeatherProfile(profileKey)
    if (profileKey === 'auto') {
      localStorage.removeItem('flora_weather_profile_override')
    } else {
      localStorage.setItem('flora_weather_profile_override', profileKey)
    }
    window.dispatchEvent(new Event('flora_weather_updated'))
  }

  // Weather Form State
  const [city, setCity] = useState(locationData?.location?.city || '')
  const [stateName, setStateName] = useState(locationData?.location?.state || '')
  const [country, setCountry] = useState(locationData?.location?.country || 'India')
  const [latitude, setLatitude] = useState<number>(locationData?.location?.latitude ?? 20.0)
  const [longitude, setLongitude] = useState<number>(locationData?.location?.longitude ?? 73.8)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const [temperature, setTemperature] = useState(locationData?.weather?.temperature_c ?? 28.0)
  const [humidity, setHumidity] = useState(locationData?.weather?.humidity_percent ?? 70)
  const [rainfall, setRainfall] = useState(locationData?.weather?.rainfall_mm ?? 0.0)
  const [wind, setWind] = useState(locationData?.weather?.wind_kmh ?? 12.0)
  const [condition, setCondition] = useState(locationData?.weather?.condition || 'Partly Cloudy')
  const [riskLevel, setRiskLevel] = useState(locationData?.risk_level || 'Moderate')
  const [riskReason, setRiskReason] = useState(
    locationData?.risk_reason || 'Ambient meteorological conditions recorded for agricultural diagnosis.'
  )

  // Real-time Open-Meteo geocoding search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }
    let active = true
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchLocations(searchQuery.trim())
        if (active) setSearchResults(results)
      } catch {
        if (active) setSearchResults([])
      } finally {
        if (active) setIsSearching(false)
      }
    }, 300)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [searchQuery])

  // Check on mount if manual weather is already active
  useEffect(() => {
    const saved = localStorage.getItem('flora_ai_manual_weather')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LocationContextData
        setIsManualActive(true)
        if (parsed.location?.city) setCity(parsed.location.city)
        if (parsed.location?.state) setStateName(parsed.location.state)
        if (parsed.location?.country) setCountry(parsed.location.country)
        if (parsed.location?.latitude !== undefined) setLatitude(parsed.location.latitude)
        if (parsed.location?.longitude !== undefined) setLongitude(parsed.location.longitude)
        if (parsed.weather?.temperature_c !== undefined) setTemperature(parsed.weather.temperature_c)
        if (parsed.weather?.humidity_percent !== undefined) setHumidity(parsed.weather.humidity_percent)
        if (parsed.weather?.rainfall_mm !== undefined) setRainfall(parsed.weather.rainfall_mm)
        if (parsed.weather?.wind_kmh !== undefined) setWind(parsed.weather.wind_kmh)
        if (parsed.weather?.condition) setCondition(parsed.weather.condition)
        if (parsed.risk_level) setRiskLevel(parsed.risk_level)
        if (parsed.risk_reason) setRiskReason(parsed.risk_reason)
      } catch {
        // invalid storage
      }
    } else if (locationData) {
      if (locationData.location?.city) setCity(locationData.location.city)
      if (locationData.location?.state) setStateName(locationData.location.state)
      if (locationData.location?.country) setCountry(locationData.location.country)
      if (locationData.location?.latitude !== undefined) setLatitude(locationData.location.latitude)
      if (locationData.location?.longitude !== undefined) setLongitude(locationData.location.longitude)
      if (locationData.weather?.temperature_c !== undefined) setTemperature(locationData.weather.temperature_c)
      if (locationData.weather?.humidity_percent !== undefined) setHumidity(locationData.weather.humidity_percent)
      if (locationData.weather?.rainfall_mm !== undefined) setRainfall(locationData.weather.rainfall_mm)
      if (locationData.weather?.wind_kmh !== undefined) setWind(locationData.weather.wind_kmh)
      if (locationData.weather?.condition) setCondition(locationData.weather.condition)
      if (locationData.risk_level) setRiskLevel(locationData.risk_level)
    }
  }, [locationData])

  async function handleSelectSearchResult(item: LocationSearchResult) {
    setCity(item.name)
    setStateName(item.state || '')
    setCountry(item.country || 'India')
    setLatitude(item.latitude)
    setLongitude(item.longitude)
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(true)
    try {
      const data = await fetchLocationWeather({ latitude: item.latitude, longitude: item.longitude })
      const resolvedData: LocationContextData = {
        ...data,
        location: {
          ...data.location,
          city: item.name,
          state: item.state || data.location?.state,
          country: item.country || data.location?.country,
          source: 'open_meteo_geocoding',
        },
      }
      localStorage.setItem('flora_ai_manual_weather', JSON.stringify(resolvedData))
      window.dispatchEvent(new Event('flora_weather_updated'))
      if (onUpdateLocationData) {
        onUpdateLocationData(resolvedData)
      }
      if (data.weather) {
        setTemperature(data.weather.temperature_c)
        setHumidity(data.weather.humidity_percent)
        setRainfall(data.weather.rainfall_mm)
        setWind(data.weather.wind_kmh)
        setCondition(data.weather.condition)
      }
      setIsManualActive(true)
      setSavedFeedback(true)
      setTimeout(() => setSavedFeedback(false), 3000)
    } catch {
      // Keep selected geocoded values in form
    } finally {
      setIsSearching(false)
    }
  }

  function handleSaveManualWeather(e: React.FormEvent) {
    e.preventDefault()
    const autoReason =
      riskReason || `${condition} with ${humidity}% humidity and ${rainfall}mm rainfall.`

    // Authentic coordinates from Open-Meteo geocoding or user input (No hardcoded Mumbai!)
    const newLocationData: LocationContextData = {
      location: {
        city: city.trim() || 'Custom Farm Location',
        state: stateName.trim(),
        country: country.trim() || 'India',
        latitude: Number(latitude),
        longitude: Number(longitude),
        source: 'open_meteo_geocoding',
      },
      weather: {
        temperature_c: Number(temperature),
        humidity_percent: Number(humidity),
        rainfall_mm: Number(rainfall),
        wind_kmh: Number(wind),
        condition: condition.trim() || 'Clear / Sunny',
      },
      risk_level: riskLevel,
      risk_reason: autoReason,
    }

    localStorage.setItem('flora_ai_manual_weather', JSON.stringify(newLocationData))
    window.dispatchEvent(new Event('flora_weather_updated'))

    if (onUpdateLocationData) {
      onUpdateLocationData(newLocationData)
    }

    setIsManualActive(true)
    setSavedFeedback(true)
    setResetFeedback(false)
    setTimeout(() => setSavedFeedback(false), 3000)
  }

  function handleResetToLiveGPS() {
    localStorage.removeItem('flora_ai_manual_weather')
    window.dispatchEvent(new Event('flora_weather_updated'))

    if (onUpdateLocationData) {
      onUpdateLocationData(null)
    }

    setIsManualActive(false)
    setResetFeedback(true)
    setSavedFeedback(false)
    setTimeout(() => setResetFeedback(false), 3000)
  }

  const stats = [
    { label: t('nav.plants'),  value: 8,  icon: Leaf,       color: 'text-emerald-700' },
    { label: t('home.statsScans'),   value: 24, icon: ScanLine,   color: 'text-blue-700' },
    { label: t('plants.healthy'), value: 19, icon: HeartPulse, color: 'text-emerald-700' },
    { label: t('history.diagnosesRecorded'), value: 6,  icon: BookMarked, color: 'text-amber-700' },
  ]

  return (
    <div className="max-w-[680px] mx-auto px-4 py-6 pb-24 space-y-6">
      
      {/* Profile header card */}
      <div className="rounded-2xl border border-[var(--color-green-200)] bg-white p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <User className="w-8 h-8" />
            </div>
            <button
              type="button"
              aria-label="Change profile photo"
              id="profile-avatar-btn"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 shadow-2xs hover:text-emerald-700 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)]">
              Meet Jethwa
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-2)] mt-0.5">meetjethwa@example.com</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Check className="w-3 h-3" />
                <span>{t('profile.verified')}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Zap className="w-3 h-3" />
                <span>{t('profile.pro')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="text-center p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <Icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-[var(--color-ink-2)] mt-0.5 line-clamp-1">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── NOTIFICATIONS SECTION ── */}
      <div className="rounded-2xl border border-stone-200 bg-white p-2 sm:p-3 shadow-xs">
        <p className="px-3 pt-2 pb-1 text-sm font-semibold text-[var(--color-ink)]">{t('profile.notifications')}</p>
        <SettingRow icon={Bell} label={t('profile.diseaseAlerts')} description={t('profile.diseaseAlertsDesc')} toggle defaultOn id="pref-disease-alerts" />
        <SettingRow icon={Bell} label={t('profile.weeklyReports')} description={t('profile.weeklyReportsDesc')} toggle defaultOn={false} id="pref-weekly-reports" />
      </div>

      {/* ── PREFERENCES SECTION ── */}
      <div className="rounded-2xl border border-stone-200 bg-white p-2 sm:p-3 shadow-xs space-y-1" id="preferences-section">
        <p className="px-3 pt-2 pb-1 text-sm font-semibold text-[var(--color-ink)]">{t('profile.preferences')}</p>
        
        {/* Language */}
        <SettingRow icon={Globe} label={t('profile.language')} value={<LanguageSelector variant="light" />} id="pref-language" />
        
        {/* Units */}
        <SettingRow icon={Shield} label={t('profile.units')} value={t('profile.unitsVal')} id="pref-units" />

        {/* ── Farm Location & Weather Station Card ── */}
        <div className="border-t border-stone-100 pt-3 px-2 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 shrink-0 text-emerald-700" />
              <span className="text-sm font-bold text-[var(--color-ink)]">
                Farm Location & Weather Station
              </span>
            </div>
            {locationData?.location?.source === 'browser_gps' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200">
                <Navigation className="w-3.5 h-3.5" />
                Browser GPS
              </span>
            ) : locationData?.location?.city ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <CheckCircle className="w-3.5 h-3.5" />
                Geocoded Place
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                Auto Open-Meteo
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
            Select your village, town, taluka, or district to retrieve authentic 7-day past Open-Meteo agro-weather observations.
          </p>

          {/* Location Search Bar & GPS Button */}
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search village, city, taluka, district…"
                className="w-full pl-9 pr-8 text-xs py-2 bg-white rounded-xl border border-stone-200 outline-none min-h-[40px] focus:border-emerald-600"
              />
              {isSearching && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            {onFetchLocation && (
              <button
                type="button"
                onClick={onFetchLocation}
                disabled={isLocating}
                className="btn btn-secondary text-xs !min-h-[40px] px-3 flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Detect GPS location from device"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isLocating ? 'Locating…' : 'Use GPS'}</span>
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="p-1 rounded-xl bg-white border border-[#E4E7E2] shadow-lg space-y-1 max-h-56 overflow-y-auto z-20 relative">
              {searchResults.map((res, idx) => (
                <button
                  key={res.id ?? idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-emerald-50 transition-colors text-xs space-y-0.5 border-none bg-transparent cursor-pointer"
                >
                  <div className="font-bold text-[var(--color-ink)] flex items-center justify-between">
                    <span>{res.name}</span>
                    <span className="text-[10px] text-stone-500 font-normal">{res.latitude.toFixed(2)}°N, {res.longitude.toFixed(2)}°E</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {[res.state, res.country].filter(Boolean).join(', ')}
                    {res.elevation != null && ` • Elev: ${res.elevation}m`}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Active Resolved Location Display */}
          {locationData?.location && (
            <div className="p-3 rounded-xl bg-[#F2F4F0] border border-[#E4E7E2] text-xs flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  {locationData.location.city || 'Custom Location'}
                  {locationData.location.state && <span className="text-stone-500 font-normal">, {locationData.location.state}</span>}
                </p>
                <p className="text-[11px] text-stone-500">
                  Coordinates: {locationData.location.latitude.toFixed(4)}°N, {locationData.location.longitude.toFixed(4)}°E
                  {locationData.location.elevation != null && ` • Elev: ${locationData.location.elevation}m`}
                </p>
              </div>
              {locationData.weather && (
                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-900">{locationData.weather.temperature_c.toFixed(1)}°C</span>
                  <p className="text-[10px] text-stone-500">{locationData.weather.humidity_percent}% RH</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Meteorological Input Card ── */}
        <div className="border-t border-stone-100 pt-3 px-2 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 shrink-0 text-emerald-700" />
              <span className="text-sm font-bold text-[var(--color-ink)]">
                Meteorological Input
              </span>
            </div>
            {selectedWeatherProfile !== 'auto' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                <FlaskConical className="w-3.5 h-3.5" />
                Demo Testing Override Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <CheckCircle className="w-3.5 h-3.5" />
                Live Open-Meteo Weather (Default)
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
            By default, the multimodal model retrieves genuine 7-day past weather observations for your farm location via Open-Meteo.
          </p>

          {/* Demonstration & Testing Mode (Optional) */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 text-left">
            <div className="flex items-center justify-between">
              <label htmlFor="pref-weather-profile-select" className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-stone-500" />
                Demonstration & Testing Mode (Optional)
              </label>
              {selectedWeatherProfile !== 'auto' && (
                <button
                  type="button"
                  onClick={() => handleSelectWeatherProfile('auto')}
                  className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer bg-transparent border-none"
                >
                  Reset to Live Weather
                </button>
              )}
            </div>

            <p className="text-[11px] text-stone-500 leading-normal">
              Testing profiles inject fixed historical sequences from the research dataset for controlled benchmarking. Keep set to "Live Farm Weather" for real field diagnosis.
            </p>

            <select
              id="pref-weather-profile-select"
              value={selectedWeatherProfile}
              onChange={(e) => handleSelectWeatherProfile(e.target.value)}
              disabled={loadingProfiles}
              className="w-full px-3 py-2 text-xs text-stone-900 rounded-xl border border-stone-200 bg-white outline-none cursor-pointer min-h-[42px] focus:border-emerald-600"
            >
              <option value="auto">Live Farm Weather (Automatic Open-Meteo GPS — Recommended)</option>
              {profiles.length > 0 && (
                <optgroup label="── Demonstration / Testing Research Profiles (Overrides Live Weather) ──">
                  {profiles.map((p) => (
                    <option key={p.key} value={p.key}>
                      [Test] {p.disease} (~{p.avg_temp_c}°C, {p.avg_humidity_pct}% RH, {p.total_rainfall_mm}mm rain)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Selected Profile Details Preview */}
            {selectedWeatherProfile !== 'auto' && (() => {
              const activeP = profiles.find((p) => p.key === selectedWeatherProfile)
              if (!activeP) return null
              return (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-1 animate-fade-in text-amber-950">
                  <div className="flex items-center justify-between font-bold">
                    <span>Overriding live weather with: {activeP.display_name}</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    {activeP.condition_summary} • ~{activeP.avg_temp_c}°C • ~{activeP.avg_humidity_pct}% RH • {activeP.total_rainfall_mm}mm rain
                  </p>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Manual Weather Data Setting Row */}
        <div className="border-t border-stone-100 pt-1">
          <button
            type="button"
            id="pref-weather-toggle"
            onClick={() => setIsWeatherOpen(prev => !prev)}
            className={`w-full min-h-[52px] flex items-center gap-3.5 px-4 py-3 rounded-xl transition-colors text-left cursor-pointer ${
              isWeatherOpen ? 'bg-stone-50' : 'hover:bg-stone-50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-emerald-700">
              <CloudRain className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {t('profile.weatherOverride')}
                </p>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isManualActive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isManualActive ? t('profile.manualActive') : t('profile.autoGps')}
                </span>
              </div>
              <p className="text-sm text-[var(--color-ink-2)] mt-0.5 truncate">
                {city} • {temperature}°C • {humidity}% RH • {rainfall} mm
              </p>
            </div>

            {isWeatherOpen ? (
              <ChevronDown className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
            )}
          </button>

          {/* Expandable Manual Weather Configuration Form */}
          {isWeatherOpen && (
            <div className="p-4 mx-1 my-2 rounded-xl border border-[var(--color-green-200)] bg-stone-50/60 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-700" />
                  <span className="text-sm font-semibold text-[var(--color-ink)]">
                    {t('profile.weatherTitle')}
                  </span>
                </div>
                <span className="text-xs text-[var(--color-ink-2)]">
                  {isManualActive ? t('profile.manualActive') : t('profile.autoGps')}
                </span>
              </div>

              {/* Form inputs */}
              <form onSubmit={handleSaveManualWeather} className="space-y-4">
                {/* Location Search Bar (Open-Meteo Geocoding) */}
                <div className="relative">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Search Farm Location (Village, Taluka, City, or District)
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-white min-h-[44px]">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Type village, city or district name to resolve coordinates..."
                      className="w-full text-sm text-stone-900 bg-transparent outline-none"
                    />
                    {isSearching && <RefreshCw className="w-3.5 h-3.5 text-stone-400 animate-spin shrink-0" />}
                  </div>

                  {/* Dropdown search results */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-stone-100">
                      {searchResults.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSearchResult(item)}
                          className="w-full px-3 py-2.5 text-left text-xs hover:bg-emerald-50 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-stone-900">{item.name}</span>
                            {item.state && <span className="text-stone-500">, {item.state}</span>}
                            {item.country && <span className="text-stone-400 text-[10px]"> ({item.country})</span>}
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* City */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('profile.city')}
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-white min-h-[44px]">
                      <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Nashik, Ludhiana, Baramati"
                        className="w-full text-sm text-stone-900 bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('profile.state')}
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={e => setStateName(e.target.value)}
                      placeholder="e.g. Maharashtra, Punjab"
                      className="w-full px-3 py-2 text-sm text-stone-900 rounded-xl border border-stone-200 bg-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[44px]"
                    />
                  </div>

                  {/* Latitude */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Latitude (°N)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={e => setLatitude(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm text-stone-900 rounded-xl border border-stone-200 bg-white outline-none min-h-[44px]"
                    />
                  </div>

                  {/* Longitude */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Longitude (°E)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={e => setLongitude(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm text-stone-900 rounded-xl border border-stone-200 bg-white outline-none min-h-[44px]"
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('profile.temp')}
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-white min-h-[44px]">
                      <Thermometer className="w-4 h-4 text-orange-600 shrink-0" />
                      <input
                        type="number"
                        step="0.1"
                        value={temperature}
                        onChange={e => setTemperature(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm text-stone-900 font-semibold bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Humidity */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('profile.humidity')}
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-white min-h-[44px]">
                      <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={humidity}
                        onChange={e => setHumidity(parseInt(e.target.value) || 0)}
                        className="w-full text-sm text-stone-900 font-semibold bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Rainfall */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('profile.rainfall')}
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-white min-h-[44px]">
                      <CloudRain className="w-4 h-4 text-blue-600 shrink-0" />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={rainfall}
                        onChange={e => setRainfall(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm text-stone-900 font-semibold bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Wind */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('profile.wind')}
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-white min-h-[44px]">
                      <Wind className="w-4 h-4 text-emerald-700 shrink-0" />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={wind}
                        onChange={e => setWind(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm text-stone-900 font-semibold bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('profile.condition')}
                    </label>
                    <select
                      value={condition}
                      onChange={e => setCondition(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-stone-900 rounded-xl border border-stone-200 bg-white outline-none focus:border-emerald-600 cursor-pointer min-h-[44px]"
                    >
                      <option value="Clear / Sunny">Clear / Sunny</option>
                      <option value="Partly Cloudy">Partly Cloudy</option>
                      <option value="Overcast">Overcast</option>
                      <option value="Overcast with Rain">Overcast with Rain</option>
                      <option value="Warm & Humid">Warm & Humid</option>
                      <option value="Heavy Rain">Heavy Rain</option>
                      <option value="Dry & Arid">Dry & Arid</option>
                    </select>
                  </div>

                  {/* Risk Level */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('profile.riskLevel')}
                    </label>
                    <select
                      value={riskLevel}
                      onChange={e => setRiskLevel(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-stone-900 rounded-xl border border-stone-200 bg-white outline-none focus:border-emerald-600 cursor-pointer min-h-[44px]"
                    >
                      <option value="Low">{t('risk.low')}</option>
                      <option value="Moderate">{t('risk.medium')}</option>
                      <option value="High">{t('risk.high')}</option>
                      <option value="Severe">{t('risk.severe')}</option>
                    </select>
                  </div>
                </div>

                {/* Risk Reason text */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {t('profile.riskReason')}
                  </label>
                  <input
                    type="text"
                    value={riskReason}
                    onChange={e => setRiskReason(e.target.value)}
                    placeholder="e.g. High humidity and rainfall support elevated disease progression risk."
                    className="w-full px-3 py-2 text-sm text-stone-900 rounded-xl border border-stone-200 bg-white outline-none focus:border-emerald-600 min-h-[44px]"
                  />
                </div>

                {/* Live Preview Pill */}
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[var(--color-ink)]">{city}, {stateName}</span>
                    <span className="text-stone-300">|</span>
                    <span className="text-[var(--color-ink-2)]">
                      {temperature}°C • {humidity}% RH • {rainfall} mm
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    riskLevel === 'High' || riskLevel === 'Severe'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {riskLevel}
                  </span>
                </div>

                {/* Feedback banners */}
                {savedFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('profile.savedSuccess')}</span>
                  </div>
                )}
                {resetFeedback && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{t('profile.resetSuccess')}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="btn btn-primary min-h-[44px] px-4 flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t('profile.applyWeather')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToLiveGPS}
                    className="btn btn-secondary min-h-[44px] px-4 flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{t('profile.resetGps')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── PRIVACY & DATA SECTION ── */}
      <div className="rounded-2xl border border-stone-200 bg-white p-2 sm:p-3 shadow-xs">
        <p className="px-3 pt-2 pb-1 text-sm font-semibold text-[var(--color-ink)]">{t('profile.privacy')}</p>
        <SettingRow icon={Shield} label={t('profile.dataSharing')} description={t('profile.dataSharingDesc')} toggle defaultOn id="pref-data-sharing" />
        <SettingRow icon={Shield} label={t('profile.privacyPolicy')} id="pref-privacy" />
        <SettingRow icon={Shield} label={t('profile.deleteData')} id="pref-delete-data" />
      </div>

      {/* ── SUPPORT SECTION ── */}
      <div className="rounded-2xl border border-stone-200 bg-white p-2 sm:p-3 shadow-xs">
        <p className="px-3 pt-2 pb-1 text-sm font-semibold text-[var(--color-ink)]">{t('profile.support')}</p>
        <SettingRow icon={HelpCircle} label={t('profile.helpFaq')} id="pref-help" />
        <SettingRow icon={HelpCircle} label={t('profile.contactSupport')} id="pref-contact" />
      </div>

      {/* Logout */}
      <button
        type="button"
        className="btn btn-secondary w-full min-h-[48px] text-red-700 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
        id="profile-logout-btn"
      >
        <LogOut className="w-4 h-4" />
        <span>{t('profile.signOut')}</span>
      </button>

      <p className="text-center text-xs text-stone-400">
        {t('profile.footerText')}
      </p>
    </div>
  )
}
