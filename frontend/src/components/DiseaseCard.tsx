// DiseaseCard.tsx — FloraAI disease indicator card
import { AlertTriangle, Bug, CheckCircle2, ShieldAlert, ShieldX } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import { localizeDiseaseName } from '../i18n/translations'

interface DiseaseCardProps {
  diseaseName: string
  severity: string
  confidence: number
  description?: string
  compact?: boolean
}

function getSeverityConfig(severity: string, t: (k: string) => string) {
  const s = severity.toLowerCase()
  if (s === 'healthy' || s === 'none') {
    return {
      label: t('severity.none') || 'Healthy',
      tileCls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      textCls: 'text-emerald-700',
      barCls: 'bg-emerald-600',
      icon: CheckCircle2,
    }
  }
  if (s === 'low') {
    return {
      label: t('severity.low') || 'Low',
      tileCls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      textCls: 'text-emerald-700',
      barCls: 'bg-emerald-600',
      icon: ShieldAlert,
    }
  }
  if (s === 'moderate' || s === 'medium') {
    return {
      label: t('severity.moderate') || 'Moderate',
      tileCls: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
      textCls: 'text-amber-700',
      barCls: 'bg-amber-500',
      icon: AlertTriangle,
    }
  }
  if (s === 'high') {
    return {
      label: t('severity.high') || 'High',
      tileCls: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
      textCls: 'text-amber-700',
      barCls: 'bg-amber-500',
      icon: Bug,
    }
  }
  if (s === 'severe' || s === 'critical') {
    return {
      label: t('severity.severe') || 'Severe',
      tileCls: 'bg-red-50 text-red-800 border-red-200',
      badgeCls: 'bg-red-50 text-red-800 border-red-200',
      textCls: 'text-red-700',
      barCls: 'bg-red-600',
      icon: ShieldX,
    }
  }
  return {
    label: (t(('severity.' + s) as any) || severity),
    tileCls: 'bg-stone-50 text-stone-700 border-stone-200',
    badgeCls: 'bg-stone-50 text-stone-700 border-stone-200',
    textCls: 'text-stone-700',
    barCls: 'bg-stone-600',
    icon: Bug,
  }
}

export function DiseaseCard({ diseaseName, severity, confidence, description, compact = false }: DiseaseCardProps) {
  const { t, lang } = useLang()
  const config = getSeverityConfig(severity, t)
  const Icon = config.icon
  const localizedName = localizeDiseaseName(diseaseName, lang)

  if (compact) {
    return (
      <div className="card flex items-center gap-3 px-4 py-3.5">
        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${config.tileCls}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
            {localizedName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${config.badgeCls}`}>
              {config.label}
            </span>
            <span className="text-sm text-[var(--color-ink-2)]">
              {confidence.toFixed(1)}% {t('common.confidence')}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      {/* Header row */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center border ${config.tileCls}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-ink)] leading-snug mb-1.5">
            {localizedName}
          </h3>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.badgeCls}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label} {t('scan.severity')}</span>
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-[var(--color-ink-2)] tracking-wide">{t('common.confidence')}</span>
          <span className={`text-sm font-bold ${config.textCls}`}>
            {confidence.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.barCls}`}
            role="progressbar"
            aria-valuenow={confidence}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
              width: `${Math.min(100, Math.max(0, confidence))}%`,
            }}
          />
        </div>
      </div>

      {description && (
        <p className="mt-3.5 text-sm text-[var(--color-ink-2)] leading-relaxed border-t border-stone-100 pt-3">
          {description}
        </p>
      )}
    </div>
  )
}
