// SymptomCard.tsx — Icon + symptom name + AI confidence bar
import { Eye, Leaf, Droplets, Thermometer, Bug, Wind, Zap, HelpCircle } from 'lucide-react'
import type { Symptom } from '../types'

interface SymptomCardProps {
  symptom: Symptom
  index?: number
}

function getSymptomIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes('spot') || n.includes('lesion') || n.includes('discolor')) return Eye
  if (n.includes('wilt') || n.includes('drooping')) return Leaf
  if (n.includes('water') || n.includes('wet') || n.includes('rot')) return Droplets
  if (n.includes('yellow') || n.includes('chloro')) return Thermometer
  if (n.includes('pest') || n.includes('insect') || n.includes('blight')) return Bug
  if (n.includes('blast') || n.includes('wind')) return Wind
  if (n.includes('burn') || n.includes('scorch')) return Zap
  return HelpCircle
}

export function SymptomCard({ symptom, index = 0 }: SymptomCardProps) {
  const Icon = getSymptomIcon(symptom.name)
  const pct = Math.min(100, Math.max(0, symptom.confidence))

  // Color based on confidence
  const barColor =
    pct >= 80 ? 'bg-emerald-500' :
    pct >= 60 ? 'bg-amber-500' :
    'bg-slate-400'

  const iconBg =
    pct >= 80 ? 'bg-emerald-50 text-emerald-600' :
    pct >= 60 ? 'bg-amber-50 text-amber-600' :
    'bg-slate-50 text-slate-500'

  return (
    <div
      className="card p-4 flex items-center gap-4 animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-600 text-[#10231D] truncate">{symptom.name}</span>
          <span className="text-xs font-700 text-[#64736C] ml-2 shrink-0">{pct.toFixed(0)}%</span>
        </div>
        <div className="progress-track h-1.5">
          <div
            className={`progress-fill ${barColor} h-full`}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${symptom.name} confidence ${pct}%`}
          />
        </div>
      </div>
    </div>
  )
}
