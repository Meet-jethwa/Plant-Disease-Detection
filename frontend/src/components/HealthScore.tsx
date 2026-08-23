// HealthScore.tsx — Large visual health score with breakdown bars
import { useEffect, useState } from 'react'

interface HealthScoreProps {
  score: number
  isHealthy?: boolean
  showBreakdown?: boolean
  breakdown?: { label: string; value: number }[]
}

function getStatusFromScore(score: number, isHealthy?: boolean): { label: string; color: string; bg: string } {
  // If disease detected, never show 'Healthy' regardless of score value
  if (!isHealthy && score >= 85) return { label: 'Disease Detected', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' }
  if (score >= 85) return { label: 'Healthy',         color: 'text-emerald-700',  bg: 'bg-emerald-50 border-emerald-200' }
  if (score >= 65) return { label: 'Needs Attention', color: 'text-amber-700',    bg: 'bg-amber-50 border-amber-200' }
  if (score >= 45) return { label: 'At Risk',          color: 'text-orange-700',   bg: 'bg-orange-50 border-orange-200' }
  return                  { label: 'Critical',         color: 'text-red-700',      bg: 'bg-red-50 border-red-200' }
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#0B8F68'
  if (score >= 65) return '#D97706'
  if (score >= 45) return '#EA580C'
  return '#DC2626'
}

const DEFAULT_BREAKDOWN = [
  { label: 'Leaf Health',     value: 58 },
  { label: 'Color Health',    value: 72 },
  { label: 'Visible Damage',  value: 61 },
  { label: 'Disease Risk',    value: 69 },
]

export function HealthScore({ score, isHealthy, showBreakdown = true, breakdown = DEFAULT_BREAKDOWN }: HealthScoreProps) {
  const [animScore, setAnimScore] = useState(0)
  const [animBars, setAnimBars] = useState(false)
  const status = getStatusFromScore(score, isHealthy)
  const color = getScoreColor(score)

  // SVG circle progress
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
    <div className="space-y-5">
      {/* Circular Score */}
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            {/* Track */}
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#EDF7F2" strokeWidth="10" />
            {/* Progress */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold" style={{ color }}>{animScore}</span>
            <span className="text-[10px] font-bold text-[#64736C]">/ 100</span>
          </div>
        </div>

        <div className="flex-1">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${status.bg} ${status.color} mb-2`}>
            <span className="w-2 h-2 rounded-full" style={{ background: color }} aria-hidden="true" />
            {status.label}
          </div>
          <p className="text-xs text-[#64736C] leading-relaxed">
            AI health index based on visible leaf condition, color, and disease indicators.
          </p>
        </div>
      </div>

      {/* Breakdown Bars */}
      {showBreakdown && (
        <div className="space-y-3">
          <p className="section-label">Health Breakdown</p>
          {breakdown.map(item => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#64736C]">{item.label}</span>
                <span className="text-[#10231D] font-bold">{item.value}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: animBars ? `${item.value}%` : '0%',
                    background: getScoreColor(item.value),
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
