// HealthScore.tsx — BioScan Lab neon circular health gauge
import { useEffect, useState } from 'react'
import { PlantHealthGlyph } from './PlantHealthGlyph'
import { useLang } from '../contexts/LanguageContext'

interface HealthScoreProps {
  score: number
  isHealthy?: boolean
  showBreakdown?: boolean
  breakdown?: { label: string; value: number }[]
}

function getScoreColor(score: number) {
  if (score >= 85) return 'var(--neon-green)'
  if (score >= 65) return 'var(--neon-amber)'
  if (score >= 45) return '#FF8C00'
  return 'var(--neon-red)'
}

export function HealthScore({ score, isHealthy, showBreakdown = true, breakdown }: HealthScoreProps) {
  const { t } = useLang()
  const [animScore, setAnimScore] = useState(0)
  const [animBars, setAnimBars] = useState(false)

  function getStatusFromScore(s: number, healthy?: boolean) {
    if (!healthy && s >= 85) return { label: t('status.diseaseDetected'), color: '#FF8C00', bg: 'rgba(255,140,0,0.08)', border: 'rgba(255,140,0,0.25)' }
    if (s >= 85) return { label: t('status.healthy').toUpperCase(),          color: 'var(--neon-green)', bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.25)' }
    if (s >= 65) return { label: t('status.needsAttention').toUpperCase(),  color: 'var(--neon-amber)', bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.25)' }
    if (s >= 45) return { label: t('status.atRisk').toUpperCase(),          color: '#FF8C00',           bg: 'rgba(255,140,0,0.08)', border: 'rgba(255,140,0,0.25)' }
    return               { label: t('status.critical').toUpperCase(),        color: 'var(--neon-red)',   bg: 'rgba(255,69,96,0.08)', border: 'rgba(255,69,96,0.25)' }
  }

  const defaultBreakdown = [
    { label: t('health.leafHealth'),    value: 58 },
    { label: t('health.colorHealth'),   value: 72 },
    { label: t('health.visibleDamage'), value: 61 },
    { label: t('health.diseaseRisk'),   value: 69 },
  ]

  const items = breakdown ?? defaultBreakdown
  const status = getStatusFromScore(score, isHealthy)
  const color = getScoreColor(score)

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (animScore / 100) * circumference

  useEffect(() => {
    const t1 = setTimeout(() => {
      const start = Date.now()
      const duration = 1200
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setAnimScore(Math.round(eased * score))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, 150)
    const t2 = setTimeout(() => setAnimBars(true), 600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [score])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Circular Score + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <PlantHealthGlyph score={score} size="lg" />

        {/* Neon arc gauge */}
        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
          <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
            {/* Subtle glow ring */}
            <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8" opacity="0.08" />
            {/* Progress arc */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{
                transition: 'stroke-dashoffset 0.05s linear',
                filter: `drop-shadow(0 0 6px ${color})`,
              }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color, lineHeight: 1 }}>
              {animScore}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>/ 100</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 8, marginBottom: 10,
            background: status.bg, border: `1px solid ${status.border}`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: status.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
              {status.label}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t('health.indexDesc')}
          </p>
        </div>
      </div>

      {/* Breakdown Bars */}
      {showBreakdown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="eyebrow">{t('health.breakdown')}</p>
          {items.map(item => {
            const barColor = getScoreColor(item.value)
            return (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: barColor, fontFamily: 'var(--font-mono)' }}>{item.value}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: animBars ? `${item.value}%` : '0%',
                      background: `linear-gradient(90deg, ${barColor}60, ${barColor})`,
                      boxShadow: `0 0 8px ${barColor}60`,
                      transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

