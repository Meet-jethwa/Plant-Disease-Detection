// WeatherCard.tsx — BioScan Lab dark weather & risk widget
import { MapPin, Thermometer, Droplets, Wind, RefreshCw } from 'lucide-react'
import type { LocationContextData } from '../types'

interface WeatherCardProps {
  data: LocationContextData | null
  isLoading: boolean
  onRefresh: () => void
  compact?: boolean
}

const riskConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Low:    { label: 'LOW RISK',    color: 'var(--neon-green)', bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.25)' },
  Medium: { label: 'MEDIUM RISK', color: 'var(--neon-amber)', bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.25)' },
  High:   { label: 'HIGH RISK',   color: 'var(--neon-red)',   bg: 'rgba(255,69,96,0.08)', border: 'rgba(255,69,96,0.25)' },
}

export function WeatherCard({ data, isLoading, onRefresh, compact = false }: WeatherCardProps) {
  const risk = riskConfig[data?.risk_level ?? ''] ?? riskConfig['Medium']

  return (
    <div className="bio-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin style={{ width: 13, height: 13, color: 'var(--neon-cyan)' }} />
          <span className="eyebrow">WEATHER CONTEXT</span>
        </div>
        <button type="button" onClick={onRefresh} disabled={isLoading} aria-label="Refresh weather data"
          style={{
            display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--neon-green)', fontSize: '0.65rem',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', opacity: isLoading ? 0.5 : 1,
          }}>
          <RefreshCw style={{ width: 11, height: 11, animation: isLoading ? 'bio-spin 1s linear infinite' : 'none' }} />
          <span>UPDATE</span>
        </button>
      </div>

      {isLoading ? (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span className="animate-pulse-dot" style={{ display: 'inline-block', marginRight: 6 }}>●</span>
          LOCATING...
        </div>
      ) : data ? (
        <>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
              {data.location.city}, {data.location.state}
            </div>
            {!compact && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{data.location.country}</div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { icon: Thermometer, value: `${data.weather.temperature_c}°C`, color: '#FF8C4A' },
              { icon: Droplets,    value: `${data.weather.humidity_percent}%`, color: 'var(--neon-cyan)' },
              { icon: Wind,        value: `${data.weather.wind_kmh}km/h`, color: 'var(--text-secondary)' },
            ].map(({ icon: Icon, value, color }) => (
              <div key={value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                <Icon style={{ width: 13, height: 13, color }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {data.weather.condition.toUpperCase()}
          </div>

          {/* Risk indicator */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '10px 12px', borderRadius: 8,
            background: risk.bg, border: `1px solid ${risk.border}`,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: risk.color, boxShadow: `0 0 6px ${risk.color}`, flexShrink: 0, marginTop: 3 }} />
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: risk.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                {risk.label}
              </span>
              {!compact && data.risk_reason && (
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{data.risk_reason}</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Click UPDATE to load local weather and disease risk data.
        </div>
      )}
    </div>
  )
}
