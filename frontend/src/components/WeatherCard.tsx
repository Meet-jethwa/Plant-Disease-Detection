// WeatherCard.tsx — FloraAI calm weather & risk context card
import { MapPin, Thermometer, Droplets, Wind, RefreshCw } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import type { LocationContextData } from '../types'

interface WeatherCardProps {
  data: LocationContextData | null
  isLoading: boolean
  onRefresh: () => void
  compact?: boolean
}

export function WeatherCard({ data, isLoading, onRefresh, compact = false }: WeatherCardProps) {
  const { t } = useLang()

  const riskConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    Low:    { label: t('risk.low'),    color: 'text-[var(--color-green-700)]', bg: 'bg-[var(--color-green-50)]',   border: 'border-[var(--color-green-200)]' },
    Medium: { label: t('risk.medium'), color: 'text-[var(--color-warn)]',       bg: 'bg-[var(--color-warn-bg)]',    border: 'border-[var(--color-warn-border)]' },
    High:   { label: t('risk.high'),   color: 'text-[var(--color-danger)]',     bg: 'bg-[var(--color-danger-bg)]', border: 'border-[var(--color-danger-border)]' },
    Severe: { label: t('risk.severe'), color: 'text-[var(--color-danger)]',     bg: 'bg-[var(--color-danger-bg)]', border: 'border-[var(--color-danger-border)]' },
  }

  const risk = riskConfig[data?.risk_level ?? ''] ?? riskConfig['Medium']

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-green-200)] p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[var(--color-green-700)]">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="text-sm font-semibold text-[var(--color-ink)]">{t('weather.context')}</span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label={t('weather.update')}
          className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-green-700)] hover:text-[var(--color-green-800)] cursor-pointer disabled:opacity-50 min-h-[44px] px-2 bg-transparent border-none transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{t('weather.update')}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-sm text-[var(--color-ink-2)] flex items-center gap-2 py-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-green-500)] animate-pulse" />
          <span>{t('weather.locating')}</span>
        </div>
      ) : data ? (
        <>
          <div>
            <div className="text-sm font-bold text-[var(--color-ink)]">
              {data.location.city}, {data.location.state}
            </div>
            {!compact && (
              <div className="text-xs text-[var(--color-ink-2)]">{data.location.country}</div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Thermometer, value: `${data.weather.temperature_c}°C` },
              { icon: Droplets,    value: `${data.weather.humidity_percent}%` },
              { icon: Wind,        value: `${data.weather.wind_kmh}km/h` },
            ].map(({ icon: Icon, value }) => (
              <div
                key={value}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[var(--color-green-50)] border border-[var(--color-green-100)]"
              >
                <Icon className="w-3.5 h-3.5 text-[var(--color-green-700)]" />
                <span className="text-xs font-bold text-[var(--color-ink)]">{value}</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-[var(--color-ink-2)]">
            {data.weather.condition}
          </div>

          {/* Risk indicator */}
          <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${risk.bg} ${risk.border}`}>
            <span className={`w-2 h-2 rounded-full shrink-0 mt-1 bg-current ${risk.color}`} />
            <div>
              <span className={`text-xs font-bold ${risk.color}`}>
                {risk.label}
              </span>
              {!compact && data.risk_reason && (
                <p className="text-sm text-[var(--color-ink-2)] mt-0.5 leading-relaxed">
                  {data.risk_reason}
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-sm text-[var(--color-ink-2)] py-2">
          {t('weather.prompt')}
        </div>
      )}
    </div>
  )
}
