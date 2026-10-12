// ProfilePage.tsx — FloraAI profile & settings with manual weather data preference
import { useState, useEffect } from 'react'
import {
  User, Camera, Bell, Globe, Shield,
  HelpCircle, LogOut, ChevronRight, ChevronDown, Leaf, ScanLine,
  HeartPulse, BookMarked, Check, Zap,
  CloudRain, Thermometer, Droplets, Wind, MapPin, RefreshCw,
  Sliders,
} from 'lucide-react'
import { LanguageSelector } from '../components/LanguageSelector'
import type { LocationContextData } from '../types'

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
  return (
    <button
      type="button" id={id}
      onClick={toggle ? () => setOn(v => !v) : onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 8, transition: 'all 0.15s ease',
        background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F0FAF4')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        background: '#F0FAF4', border: '1px solid rgba(11,143,104,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon style={{ width: 16, height: 16, color: '#0B8F68' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
        {description && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>{description}</p>}
      </div>
      {toggle ? (
        <div
          style={{
            width: 44, height: 24, borderRadius: 999, position: 'relative', flexShrink: 0,
            background: on ? 'rgba(11,143,104,0.2)' : '#E2E8F0',
            border: `1px solid ${on ? 'rgba(11,143,104,0.4)' : '#CBD5E1'}`,
            boxShadow: on ? '0 0 8px rgba(11,143,104,0.15)' : 'none',
            transition: 'all 0.2s ease',
          }}
          role="switch" aria-checked={on} aria-label={label}
        >
          <span style={{
            position: 'absolute', top: 3,
            width: 16, height: 16, borderRadius: '50%',
            background: on ? '#0B8F68' : '#94A3B8',
            transform: on ? 'translateX(24px)' : 'translateX(3px)',
            transition: 'all 0.2s ease',
            boxShadow: on ? '0 0 6px rgba(11,143,104,0.3)' : 'none',
          }} />
        </div>
      ) : value ? (
        <span style={{ fontSize: '0.75rem', color: '#0B8F68', background: '#F0FAF4', border: '1px solid rgba(11,143,104,0.2)', padding: typeof value === 'string' ? '3px 8px' : 0, borderRadius: 6, fontWeight: 600 }}>
          {value}
        </span>
      ) : (
        <ChevronRight style={{ width: 15, height: 15, color: 'var(--text-muted)', flexShrink: 0 }} />
      )}
    </button>
  )
}

interface ProfilePageProps {
  locationData?: LocationContextData | null
  onUpdateLocationData?: (data: LocationContextData | null) => void
}

export function ProfilePage({ locationData, onUpdateLocationData }: ProfilePageProps) {
  const [isWeatherOpen, setIsWeatherOpen] = useState(false)
  const [isManualActive, setIsManualActive] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState(false)
  const [resetFeedback, setResetFeedback] = useState(false)

  // Weather Form State
  const [city, setCity] = useState(locationData?.location?.city || 'Mumbai')
  const [stateName, setStateName] = useState(locationData?.location?.state || 'Maharashtra')
  const [temperature, setTemperature] = useState(locationData?.weather?.temperature_c ?? 31.2)
  const [humidity, setHumidity] = useState(locationData?.weather?.humidity_percent ?? 88)
  const [rainfall, setRainfall] = useState(locationData?.weather?.rainfall_mm ?? 18.6)
  const [wind, setWind] = useState(locationData?.weather?.wind_kmh ?? 22.5)
  const [condition, setCondition] = useState(locationData?.weather?.condition || 'Overcast with Rain')
  const [riskLevel, setRiskLevel] = useState(locationData?.risk_level || 'High')
  const [riskReason, setRiskReason] = useState(
    locationData?.risk_reason || 'High humidity and rainfall support elevated disease progression risk.'
  )

  // Check on mount if manual weather is already active
  useEffect(() => {
    const saved = localStorage.getItem('flora_ai_manual_weather')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LocationContextData
        setIsManualActive(true)
        if (parsed.location?.city) setCity(parsed.location.city)
        if (parsed.location?.state) setStateName(parsed.location.state)
        if (parsed.weather?.temperature_c !== undefined) setTemperature(parsed.weather.temperature_c)
        if (parsed.weather?.humidity_percent !== undefined) setHumidity(parsed.weather.humidity_percent)
        if (parsed.weather?.rainfall_mm !== undefined) setRainfall(parsed.weather.rainfall_mm)
        if (parsed.weather?.wind_kmh !== undefined) setWind(parsed.weather.wind_kmh)
        if (parsed.weather?.condition) setCondition(parsed.weather.condition)
        if (parsed.risk_level) setRiskLevel(parsed.risk_level)
        if (parsed.risk_reason) setRiskReason(parsed.risk_reason)
      } catch (_) {}
    } else if (locationData) {
      if (locationData.location?.city) setCity(locationData.location.city)
      if (locationData.location?.state) setStateName(locationData.location.state)
      if (locationData.weather?.temperature_c !== undefined) setTemperature(locationData.weather.temperature_c)
      if (locationData.weather?.humidity_percent !== undefined) setHumidity(locationData.weather.humidity_percent)
      if (locationData.weather?.rainfall_mm !== undefined) setRainfall(locationData.weather.rainfall_mm)
      if (locationData.weather?.wind_kmh !== undefined) setWind(locationData.weather.wind_kmh)
      if (locationData.weather?.condition) setCondition(locationData.weather.condition)
      if (locationData.risk_level) setRiskLevel(locationData.risk_level)
    }
  }, [locationData])

  function handleSaveManualWeather(e: React.FormEvent) {
    e.preventDefault()
    const autoReason =
      riskReason || `${condition} with ${humidity}% humidity and ${rainfall}mm rainfall.`

    const newLocationData: LocationContextData = {
      location: {
        city: city.trim() || 'Mumbai',
        state: stateName.trim() || 'Maharashtra',
        country: 'India',
        latitude: 19.08,
        longitude: 72.88,
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
    { label: 'Plants',  value: 8,  icon: Leaf,       color: '#0B8F68' },
    { label: 'Scans',   value: 24, icon: ScanLine,   color: '#0EA5E9' },
    { label: 'Healthy', value: 19, icon: HeartPulse, color: '#0B8F68' },
    { label: 'Reports', value: 6,  icon: BookMarked, color: '#D97706' },
  ]

  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Profile header card */}
      <div className="bio-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 76, height: 76, borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(11,143,104,0.15), rgba(14,165,233,0.12))',
              border: '2px solid rgba(11,143,104,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(11,143,104,0.1)',
            }}>
              <User style={{ width: 30, height: 30, color: '#0B8F68' }} />
            </div>
            <button type="button" aria-label="Change profile photo" id="profile-avatar-btn" style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 28, height: 28, borderRadius: '50%',
              background: '#FFFFFF', border: '1px solid rgba(11,143,104,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#0B8F68',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            }}>
              <Camera style={{ width: 12, height: 12 }} />
            </button>
          </div>

          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '0.02em' }}>
              MEET JETHWA
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>meetjethwa@example.com</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="badge badge-green">
                <Check style={{ width: 10, height: 10 }} />
                VERIFIED
              </span>
              <span className="badge badge-green">
                <Zap style={{ width: 10, height: 10 }} />
                PRO SPECIALIST
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: '#F0FAF4', border: '1px solid var(--border-subtle)' }}>
                <Icon style={{ width: 18, height: 18, color: stat.color, margin: '0 auto 6px' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 3, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{stat.label.toUpperCase()}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── NOTIFICATIONS SECTION ── */}
      <div className="bio-card" style={{ padding: '6px 8px' }}>
        <p className="eyebrow" style={{ padding: '12px 8px 6px', paddingLeft: 16 }}>NOTIFICATIONS</p>
        <SettingRow icon={Bell} label="Disease Alerts" description="Get notified when crop infection risk is high" toggle defaultOn id="pref-disease-alerts" />
        <SettingRow icon={Bell} label="Weekly Reports" description="Summary of your plant health and treatments" toggle defaultOn={false} id="pref-weekly-reports" />
      </div>

      {/* ── PREFERENCES SECTION (Includes Manual Weather Data) ── */}
      <div className="bio-card" style={{ padding: '6px 8px' }} id="preferences-section">
        <p className="eyebrow" style={{ padding: '12px 8px 6px', paddingLeft: 16 }}>PREFERENCES</p>
        
        {/* Language */}
        <SettingRow icon={Globe} label="Language" value={<LanguageSelector variant="light" />} id="pref-language" />
        
        {/* Units */}
        <SettingRow icon={Shield} label="Units" value="Metric (°C, mm, km/h)" id="pref-units" />

        {/* Manual Weather Data Setting Row */}
        <div style={{ borderTop: '1px solid #EDF7F2', marginTop: 4, paddingTop: 4 }}>
          <button
            type="button"
            id="pref-weather-toggle"
            onClick={() => setIsWeatherOpen(prev => !prev)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 8, transition: 'all 0.15s ease',
              background: isWeatherOpen ? '#F0FAF4' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: '#F0FAF4', border: '1px solid rgba(11,143,104,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CloudRain style={{ width: 16, height: 16, color: '#0B8F68' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Manual Weather Data
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isManualActive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isManualActive ? 'MANUAL ACTIVE' : 'AUTO GPS'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                {city} • {temperature}°C • {humidity}% RH • {rainfall} mm
              </p>
            </div>
            {isWeatherOpen ? (
              <ChevronDown style={{ width: 16, height: 16, color: '#0B8F68' }} />
            ) : (
              <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
            )}
          </button>

          {/* Expandable Manual Weather Configuration Form */}
          {isWeatherOpen && (
            <div className="p-4 mx-2 my-2 rounded-xl border border-[#D4E8DC] bg-[#FAFDFB] space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#E0EBE4]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0B8F68]" />
                  <span className="text-xs font-bold text-[#111827] uppercase tracking-wide">
                    Agro-Climatic Weather Override
                  </span>
                </div>
                <span className="text-[11px] text-[#64736C]">
                  {isManualActive ? 'Manual Override Enabled' : 'Using Live Open-Meteo GPS'}
                </span>
              </div>

              {/* Form inputs */}
              <form onSubmit={handleSaveManualWeather} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* City */}
                  <div>
                    <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                      City / Village
                    </label>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D4E8DC] bg-white">
                      <MapPin className="w-3.5 h-3.5 text-[#0B8F68] shrink-0" />
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Mumbai, Nashik, Pune"
                        className="w-full text-xs text-[#111827] font-medium bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                      State / Region
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={e => setStateName(e.target.value)}
                      placeholder="e.g. Maharashtra, Punjab"
                      className="w-full px-3 py-2 text-xs text-[#111827] font-medium rounded-lg border border-[#D4E8DC] bg-white outline-none focus:border-[#0B8F68]"
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                      Temperature (°C)
                    </label>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D4E8DC] bg-white">
                      <Thermometer className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <input
                        type="number"
                        step="0.1"
                        value={temperature}
                        onChange={e => setTemperature(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs text-[#111827] font-semibold bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Humidity */}
                  <div>
                    <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                      Relative Humidity (%)
                    </label>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D4E8DC] bg-white">
                      <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={humidity}
                        onChange={e => setHumidity(parseInt(e.target.value) || 0)}
                        className="w-full text-xs text-[#111827] font-semibold bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Rainfall */}
                  <div>
                    <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                      Rainfall (24h mm)
                    </label>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D4E8DC] bg-white">
                      <CloudRain className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={rainfall}
                        onChange={e => setRainfall(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs text-[#111827] font-semibold bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Wind */}
                  <div>
                    <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                      Wind Speed (km/h)
                    </label>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D4E8DC] bg-white">
                      <Wind className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={wind}
                        onChange={e => setWind(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs text-[#111827] font-semibold bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                      Weather Condition
                    </label>
                    <select
                      value={condition}
                      onChange={e => setCondition(e.target.value)}
                      className="w-full px-3 py-2 text-xs text-[#111827] font-medium rounded-lg border border-[#D4E8DC] bg-white outline-none focus:border-[#0B8F68] cursor-pointer"
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
                    <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                      Environmental Risk Level
                    </label>
                    <select
                      value={riskLevel}
                      onChange={e => setRiskLevel(e.target.value)}
                      className="w-full px-3 py-2 text-xs text-[#111827] font-medium rounded-lg border border-[#D4E8DC] bg-white outline-none focus:border-[#0B8F68] cursor-pointer"
                    >
                      <option value="Low">Low Risk</option>
                      <option value="Moderate">Moderate Risk</option>
                      <option value="High">High Risk</option>
                      <option value="Severe">Severe Risk</option>
                    </select>
                  </div>
                </div>

                {/* Risk Reason text */}
                <div>
                  <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
                    Risk Assessment Explanation
                  </label>
                  <input
                    type="text"
                    value={riskReason}
                    onChange={e => setRiskReason(e.target.value)}
                    placeholder="e.g. High humidity and rainfall support elevated disease progression risk."
                    className="w-full px-3 py-2 text-xs text-[#111827] rounded-lg border border-[#D4E8DC] bg-white outline-none focus:border-[#0B8F68]"
                  />
                </div>

                {/* Live Preview Pill */}
                <div className="p-3 rounded-xl bg-white border border-[#D4E8DC] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📍</span>
                    <span className="text-xs font-bold text-[#111827]">{city}, {stateName}</span>
                    <span className="text-[#D4E8DC]">|</span>
                    <span className="text-xs text-[#4B5563] font-medium">
                      {temperature}°C • {humidity}% RH • {rainfall} mm
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    riskLevel === 'High' || riskLevel === 'Severe'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {riskLevel} Risk
                  </span>
                </div>

                {/* Feedback banners */}
                {savedFeedback && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Manual weather data saved and applied across the entire app!</span>
                  </div>
                )}
                {resetFeedback && (
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Reset to live GPS sensors and Open-Meteo weather data!</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#0B8F68] text-white text-xs font-bold hover:bg-[#097354] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Weather Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToLiveGPS}
                    className="px-4 py-2.5 rounded-xl border border-[#D4E8DC] bg-white text-[#4B5563] text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset to Live GPS</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── PRIVACY & DATA SECTION ── */}
      <div className="bio-card" style={{ padding: '6px 8px' }}>
        <p className="eyebrow" style={{ padding: '12px 8px 6px', paddingLeft: 16 }}>PRIVACY & DATA</p>
        <SettingRow icon={Shield} label="Data Sharing" description="Help improve agronomic AI models" toggle defaultOn id="pref-data-sharing" />
        <SettingRow icon={Shield} label="Privacy Policy" id="pref-privacy" />
        <SettingRow icon={Shield} label="Delete My Data" id="pref-delete-data" />
      </div>

      {/* ── SUPPORT SECTION ── */}
      <div className="bio-card" style={{ padding: '6px 8px' }}>
        <p className="eyebrow" style={{ padding: '12px 8px 6px', paddingLeft: 16 }}>SUPPORT</p>
        <SettingRow icon={HelpCircle} label="Help & FAQ" id="pref-help" />
        <SettingRow icon={HelpCircle} label="Contact Agronomist Support" id="pref-contact" />
      </div>

      {/* Logout */}
      <button type="button" className="btn btn-danger btn-lg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} id="profile-logout-btn">
        <LogOut style={{ width: 16, height: 16 }} />
        SIGN OUT
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
        FLORA AI v2.1.0 • PLANT DISEASE INTELLIGENCE PLATFORM
      </p>
    </div>
  )
}
