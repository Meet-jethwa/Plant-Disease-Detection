// DiseaseCard.tsx — BioScan Lab dark disease indicator card
import { AlertTriangle, Bug, CheckCircle2, ShieldAlert, ShieldX } from 'lucide-react'

interface DiseaseCardProps {
  diseaseName: string
  severity: string
  confidence: number
  description?: string
  compact?: boolean
}

function getSeverityConfig(severity: string) {
  const s = severity.toLowerCase()
  if (s === 'healthy' || s === 'none')
    return { label: 'HEALTHY',  color: 'var(--neon-green)',  bg: 'rgba(0,255,136,0.08)',  border: 'rgba(0,255,136,0.25)', barColor: 'var(--neon-green)',  icon: CheckCircle2 }
  if (s === 'low')
    return { label: 'LOW',      color: 'var(--neon-green)',  bg: 'rgba(0,255,136,0.06)',  border: 'rgba(0,255,136,0.2)',  barColor: 'var(--neon-green)',  icon: ShieldAlert }
  if (s === 'moderate')
    return { label: 'MODERATE', color: 'var(--neon-amber)',  bg: 'rgba(255,184,0,0.08)',  border: 'rgba(255,184,0,0.25)', barColor: 'var(--neon-amber)',  icon: AlertTriangle }
  if (s === 'high')
    return { label: 'HIGH',     color: '#FF8C00',            bg: 'rgba(255,140,0,0.08)',  border: 'rgba(255,140,0,0.25)', barColor: '#FF8C00',            icon: Bug }
  if (s === 'severe' || s === 'critical')
    return { label: 'SEVERE',   color: 'var(--neon-red)',    bg: 'rgba(255,69,96,0.08)',  border: 'rgba(255,69,96,0.25)', barColor: 'var(--neon-red)',    icon: ShieldX }
  return { label: severity.toUpperCase(), color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.04)', border: 'var(--border-subtle)', barColor: 'var(--text-secondary)', icon: Bug }
}

export function DiseaseCard({ diseaseName, severity, confidence, description, compact = false }: DiseaseCardProps) {
  const config = getSeverityConfig(severity)
  const Icon = config.icon

  if (compact) {
    return (
      <div className="bio-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: config.bg, border: `1px solid ${config.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon style={{ width: 18, height: 18, color: config.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {diseaseName}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span className="badge" style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}`, fontSize: '0.6rem' }}>
              {config.label}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {confidence.toFixed(1)}% CONF
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bio-card" style={{ padding: '20px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: config.bg, border: `1px solid ${config.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 12px ${config.bg}`,
        }}>
          <Icon style={{ width: 22, height: 22, color: config.color }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 6 }}>
            {diseaseName}
          </h3>
          <span className="badge" style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
            <Icon style={{ width: 10, height: 10 }} />
            {config.label} SEVERITY
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>AI CONFIDENCE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: config.color }}>
            {confidence.toFixed(1)}%
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" role="progressbar"
            aria-valuenow={confidence} aria-valuemin={0} aria-valuemax={100}
            style={{ width: `${Math.min(100, Math.max(0, confidence))}%`, background: `linear-gradient(90deg, ${config.color}80, ${config.color})` }}
          />
        </div>
      </div>

      {/* Description */}
      {description && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
          {description}
        </p>
      )}
    </div>
  )
}
