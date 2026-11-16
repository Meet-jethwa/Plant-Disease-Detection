// HealthScore.tsx — FloraAI circular plant health gauge
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
  if (score >= 85) return 'var(--color-green-700)'
  if (score >= 65) return 'var(--color-warn)'
  return 'var(--color-danger)'
}

export function HealthScore({ score, isHealthy, showBreakdown = true, breakdown }: HealthScoreProps) {
  const { t } = useLang()
  const [animScore, setAnimScore] = useState(0)
  const [animBars, setAnimBars] = useState(false)

  function getStatusFromScore(s: number, healthy?: boolean) {
    if (!healthy && s >= 85) return { label: t('status.diseaseDetected'), color: 'text-[var(--color-warn)]', bg: 'bg-[var(--color-warn-bg)]', border: 'border-[var(--color-warn-border)]' }
    if (s >= 85) return { label: t('status.healthy'),          color: 'text-[var(--color-green-700)]', bg: 'bg-[var(--color-green-50)]',   border: 'border-[var(--color-green-200)]' }
    if (s >= 65) return { label: t('status.needsAttention'),   color: 'text-[var(--color-warn)]',       bg: 'bg-[var(--color-warn-bg)]',    border: 'border-[var(--color-warn-border)]' }
    if (s >= 45) return { label: t('status.atRisk'),           color: 'text-[var(--color-warn)]',       bg: 'bg-[var(--color-warn-bg)]',    border: 'border-[var(--color-warn-border)]' }
    return               { label: t('status.critical'),         color: 'text-[var(--color-danger)]',     bg: 'bg-[var(--color-danger-bg)]', border: 'border-[var(--color-danger-border)]' }
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
      const duration = 1000
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setAnimScore(Math.round(eased * score))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, 100)
    const t2 = setTimeout(() => setAnimBars(true), 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [score])

  return (
    <div className="flex flex-col gap-6">
      {/* Circular Score + Status */}
      <div className="flex items-center gap-5 flex-wrap sm:flex-nowrap">
        <PlantHealthGlyph score={score} size="lg" />

        {/* Clean SVG arc gauge */}
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            {/* Track */}
            <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-green-100)" strokeWidth="8" />
            {/* Progress arc */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold leading-none" style={{ color }}>
              {animScore}
            </span>
            <span className="text-xs text-[var(--color-ink-2)] font-medium mt-0.5">/ 100</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border mb-2 ${status.bg} ${status.border}`}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <span className={`text-xs font-bold ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
            {t('health.indexDesc')}
          </p>
        </div>
      </div>

      {/* Breakdown Bars */}
      {showBreakdown && (
        <div className="flex flex-col gap-3 pt-2 border-t border-[var(--color-green-100)]">
          <p className="section-label">{t('health.breakdown')}</p>
          {items.map(item => {
            const barColor = getScoreColor(item.value)
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-ink-2)] font-medium">{item.label}</span>
                  <span className="font-bold" style={{ color: barColor }}>{item.value}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: animBars ? `${item.value}%` : '0%',
                      background: barColor,
                      transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
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
