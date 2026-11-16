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
import { useLang } from '../contexts/LanguageContext'
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
}

export function ProfilePage({ locationData, onUpdateLocationData }: ProfilePageProps) {
  const { t } = useLang()
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
      } catch {
        // invalid storage
      }
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
                        placeholder="e.g. Mumbai, Nashik, Pune"
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
