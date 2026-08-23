// DiseaseCard.tsx — Shows disease name, severity badge, and AI confidence
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
    return { label: 'Healthy', badgeClass: 'badge-green', barColor: 'bg-emerald-500', icon: CheckCircle2, textColor: 'text-emerald-700' }
  if (s === 'low')
    return { label: 'Low', badgeClass: 'badge-green', barColor: 'bg-emerald-400', icon: ShieldAlert, textColor: 'text-emerald-700' }
  if (s === 'moderate')
    return { label: 'Moderate', badgeClass: 'badge-amber', barColor: 'bg-amber-500', icon: AlertTriangle, textColor: 'text-amber-700' }
  if (s === 'high')
    return { label: 'High', badgeClass: 'badge-orange', barColor: 'bg-orange-500', icon: Bug, textColor: 'text-orange-700' }
  if (s === 'severe' || s === 'critical')
    return { label: 'Severe', badgeClass: 'badge-red', barColor: 'bg-red-500', icon: ShieldX, textColor: 'text-red-700' }
  return { label: severity, badgeClass: 'badge-slate', barColor: 'bg-slate-400', icon: Bug, textColor: 'text-slate-700' }
}

function confidenceWidth(confidence: number) {
  return `${Math.min(100, Math.max(0, confidence))}%`
}

export function DiseaseCard({ diseaseName, severity, confidence, description, compact = false }: DiseaseCardProps) {
  const config = getSeverityConfig(severity)
  const Icon = config.icon

  if (compact) {
    return (
      <div className="card p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#F0FBF5] flex items-center justify-center shrink-0">
          <Icon className={`w-5 h-5 ${config.textColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-600 text-[#10231D] truncate">{diseaseName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${config.badgeClass}`}>{config.label}</span>
            <span className="text-xs text-[#64736C]">{confidence.toFixed(1)}% confidence</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F0FBF5] border border-[#D4E8DC] flex items-center justify-center shrink-0">
            <Icon className={`w-6 h-6 ${config.textColor}`} />
          </div>
          <div>
            <h3 className="text-base font-700 text-[#10231D] leading-tight">{diseaseName}</h3>
            <span className={`badge mt-1 ${config.badgeClass}`}>
              <Icon className="w-3 h-3" />
              {config.label} Severity
            </span>
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-600 text-[#64736C]">AI Confidence</span>
          <span className="text-sm font-700 text-[#10231D]">{confidence.toFixed(1)}%</span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${config.barColor}`}
            style={{ width: confidenceWidth(confidence) }}
            role="progressbar"
            aria-valuenow={confidence}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-[#64736C] leading-relaxed mt-3 pt-3 border-t border-[#D4E8DC]">
          {description}
        </p>
      )}
    </div>
  )
}
