// DiseaseRisk.tsx — Shows disease risk level: Low / Medium / High
import { ShieldCheck, AlertTriangle, ShieldX } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

interface DiseaseRiskProps {
  riskLevel: string
  riskReason?: string
  compact?: boolean
}

export function DiseaseRisk({ riskLevel, riskReason, compact = false }: DiseaseRiskProps) {
  const { t } = useLang()

  function getRiskConfig(level: string) {
    const l = level.toLowerCase()
    if (l === 'low')
      return {
        label: t('risk.low'),
        icon: ShieldCheck,
        badgeClass: 'badge-green',
        bgClass: 'bg-emerald-50 border-emerald-200',
        iconColor: 'text-emerald-600',
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-800',
      }
    if (l === 'medium' || l === 'moderate')
      return {
        label: t('risk.medium'),
        icon: AlertTriangle,
        badgeClass: 'badge-amber',
        bgClass: 'bg-amber-50 border-amber-200',
        iconColor: 'text-amber-600',
        dotColor: 'bg-amber-500',
        textColor: 'text-amber-800',
      }
    if (l === 'high')
      return {
        label: t('risk.high'),
        icon: ShieldX,
        badgeClass: 'badge-red',
        bgClass: 'bg-red-50 border-red-200',
        iconColor: 'text-red-600',
        dotColor: 'bg-red-500',
        textColor: 'text-red-800',
      }
    if (l === 'severe')
      return {
        label: t('risk.severe'),
        icon: ShieldX,
        badgeClass: 'badge-red',
        bgClass: 'bg-red-50 border-red-200',
        iconColor: 'text-red-600',
        dotColor: 'bg-red-500',
        textColor: 'text-red-800',
      }
    return {
      label: level,
      icon: AlertTriangle,
      badgeClass: 'badge-slate',
      bgClass: 'bg-slate-50 border-slate-200',
      iconColor: 'text-slate-600',
      dotColor: 'bg-slate-400',
      textColor: 'text-slate-800',
    }
  }

  const config = getRiskConfig(riskLevel)
  const Icon = config.icon
  const normalizedRiskReason = riskReason?.replace(/\s+/g, ' ').trim()

  if (compact) {
    return (
      <span className={`badge ${config.badgeClass}`} aria-label={`Disease risk: ${config.label}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.bgClass}`}>
      {/* Pulse dot + icon */}
      <div className="relative shrink-0 mt-0.5">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        {normalizedRiskReason && (
          <p className="text-xs text-[#4A5E52] mt-1 leading-relaxed">
            {normalizedRiskReason}
          </p>
        )}
      </div>
    </div>
  )
}
