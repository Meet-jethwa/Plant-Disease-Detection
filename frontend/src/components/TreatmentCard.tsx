// TreatmentCard.tsx — Tabbed treatment options: Organic, Conventional, Preventive
import { useState } from 'react'
import { Leaf, FlaskConical, ShieldCheck, AlertTriangle } from 'lucide-react'

interface TreatmentCardProps {
  treatment: string
  prevention: string
  severity: string
}

export function TreatmentCard({ treatment, prevention, severity }: TreatmentCardProps) {
  const [tab, setTab] = useState<'immediate' | 'organic' | 'preventive'>('immediate')
  const isSevere = ['severe', 'high', 'critical'].includes(severity?.toLowerCase())

  // Parse numbered steps from treatment string
  const steps = treatment.split('\n').filter(s => s.trim()).map(s => s.replace(/^\d+\.\s*/, '').trim())
  const organicSteps = [
    'Apply neem oil solution (2%) as a foliar spray every 5–7 days.',
    'Use copper-based Bordeaux mixture (1%) for fungal control.',
    'Apply Trichoderma-based biocontrol agents to soil.',
    'Prune and remove infected leaves; dispose of away from the field.',
    'Maintain proper spacing and ventilation around plants.',
  ]

  const tabs = [
    { id: 'immediate' as const, label: 'Immediate',  icon: AlertTriangle },
    { id: 'organic'   as const, label: 'Organic',    icon: Leaf },
    { id: 'preventive'as const, label: 'Preventive', icon: ShieldCheck },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-[#0B8F68]" />
        <h3 className="text-sm font-bold text-[#10231D]">Recommended Actions</h3>
      </div>

      {/* Tab switcher */}
      <div className="tab-group">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`tab-item flex items-center gap-1 ${tab === t.id ? 'active' : ''}`}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-2 min-h-[120px]">
        {tab === 'immediate' && (
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-xs text-[#10231D]">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#DDF7EA] border border-[#B9E8D1] text-[#065E44] font-bold text-[10px] flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        )}

        {tab === 'organic' && (
          <ol className="space-y-2">
            {organicSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-xs text-[#10231D]">
                <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-[10px] flex items-center justify-center">
                  <Leaf className="w-2.5 h-2.5" />
                </span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        )}

        {tab === 'preventive' && (
          <div className="space-y-2 text-xs text-[#10231D]">
            {prevention.split('.').filter(s => s.trim()).map((s, i) => (
              <div key={i} className="flex gap-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B8F68] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{s.trim()}.</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expert consultation note for severe cases */}
      {isSevere && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Severe case detected.</strong> We strongly recommend consulting a local agricultural extension officer or certified agronomist before applying treatments. These recommendations are for guidance only.
          </p>
        </div>
      )}
    </div>
  )
}
