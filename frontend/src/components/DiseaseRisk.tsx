// DiseaseRisk.tsx — Shows disease risk level: Low / Medium / High
import { ShieldCheck, AlertTriangle, ShieldX } from 'lucide-react'

interface DiseaseRiskProps {
  riskLevel: string
  riskReason?: string
  compact?: boolean
}

function getRiskConfig(level: string) {
  const l = level.toLowerCase()
  if (l === 'low')
    return {
      label: 'Low Risk',
      icon: ShieldCheck,
      badgeClass: 'badge-green',
      bgClass: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-800',
    }
  if (l === 'medium' || l === 'moderate')
    return {
      label: 'Medium Risk',
      icon: AlertTriangle,
      badgeClass: 'badge-amber',
      bgClass: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-800',
    }
  if (l === 'high' || l === 'severe')
    return {
      label: 'High Risk',
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

export function DiseaseRisk({ riskLevel, riskReason, compact = false }: DiseaseRiskProps) {
  const config = getRiskConfig(riskLevel)
  const Icon = config.icon

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
        <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${config.dotColor} animate-ping opacity-70`} aria-hidden="true" />
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-700 ${config.textColor}`}>{config.label}</p>
        {riskReason && (
          <p className="text-xs text-[#64736C] mt-0.5 leading-relaxed">{riskReason}</p>
        )}
      </div>
    </div>
  )
}
