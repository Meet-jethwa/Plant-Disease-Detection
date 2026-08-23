// WeatherCard.tsx — Location & weather display component
import { MapPin, Thermometer, Droplets, Wind, RefreshCw } from 'lucide-react'
import type { LocationContextData } from '../types'

interface WeatherCardProps {
  data: LocationContextData | null
  isLoading: boolean
  onRefresh: () => void
  compact?: boolean
}

const riskConfig: Record<string, { label: string; cls: string; dot: string }> = {
  Low:    { label: 'Low Risk',    cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',  dot: 'bg-emerald-500'  },
  Medium: { label: 'Medium Risk', cls: 'bg-amber-50 text-amber-800 border-amber-200',        dot: 'bg-amber-500'    },
  High:   { label: 'High Risk',   cls: 'bg-red-50 text-red-800 border-red-200',              dot: 'bg-red-500'      },
}

export function WeatherCard({ data, isLoading, onRefresh, compact = false }: WeatherCardProps) {
  const risk = riskConfig[data?.risk_level ?? ''] ?? riskConfig['Medium']

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#0B8F68]" />
          <span className="text-xs font-bold text-[#10231D]">Local Weather Context</span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh weather data"
          className="flex items-center gap-1 text-[10px] text-[#0B8F68] font-bold hover:underline disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Update</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-xs text-[#64736C] animate-pulse">Detecting location...</div>
      ) : data ? (
        <>
          <div>
            <div className="text-sm font-bold text-[#10231D]">
              {data.location.city}, {data.location.state}
            </div>
            {!compact && (
              <div className="text-xs text-[#64736C] mt-0.5">{data.location.country}</div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1 text-[#64736C]">
              <Thermometer className="w-3 h-3 text-orange-500" />
              <span className="font-semibold">{data.weather.temperature_c}°C</span>
            </div>
            <div className="flex items-center gap-1 text-[#64736C]">
              <Droplets className="w-3 h-3 text-blue-500" />
              <span className="font-semibold">{data.weather.humidity_percent}%</span>
            </div>
            <div className="flex items-center gap-1 text-[#64736C]">
              <Wind className="w-3 h-3 text-slate-400" />
              <span className="font-semibold">{data.weather.wind_kmh} km/h</span>
            </div>
          </div>

          <div className="text-[10px] text-[#64736C]">{data.weather.condition}</div>

          {/* Risk indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${risk.cls}`}>
            <span className={`w-2 h-2 rounded-full ${risk.dot} shrink-0`} aria-hidden="true" />
            <span>{risk.label}</span>
            {!compact && data.risk_reason && (
              <span className="font-normal text-[10px] ml-1">— {data.risk_reason}</span>
            )}
          </div>
        </>
      ) : (
        <div className="text-xs text-[#64736C]">
          Click Update to load local weather and disease risk data.
        </div>
      )}
    </div>
  )
}
