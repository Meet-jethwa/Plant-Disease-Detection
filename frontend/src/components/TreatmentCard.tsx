// TreatmentCard.tsx — FloraAI treatment protocol card
import { useState } from 'react'
import { Leaf, FlaskConical, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

interface TreatmentCardProps {
  treatment: string
  prevention: string
  severity: string
}

export function TreatmentCard({ treatment, prevention, severity }: TreatmentCardProps) {
  const { t } = useLang()
  const [tab, setTab] = useState<'immediate' | 'organic' | 'preventive'>('immediate')
  const isSevere = ['severe', 'high', 'critical'].includes(severity?.toLowerCase())

  const steps = treatment.split('\n').filter(s => s.trim()).map(s => s.replace(/^\d+\.\s*/, '').trim())
  const organicSteps = [
    'Apply neem oil solution (2%) as a foliar spray every 5–7 days.',
    'Use copper-based Bordeaux mixture (1%) for fungal control.',
    'Apply Trichoderma-based biocontrol agents to soil.',
    'Prune and remove infected leaves; dispose of away from the field.',
    'Maintain proper spacing and ventilation around plants.',
  ]

  const tabs = [
    { id: 'immediate' as const,  label: t('diagnosis.tabImmediate'),  icon: AlertTriangle },
    { id: 'organic'   as const,  label: t('diagnosis.tabOrganic'),    icon: Leaf },
    { id: 'preventive'as const,  label: t('diagnosis.tabPreventive'), icon: ShieldCheck },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[var(--color-green-700)]">
        <FlaskConical className="w-4 h-4 shrink-0" />
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t('diagnosis.treatment')}</h3>
      </div>

      {/* Tab switcher */}
      <div className="tab-group overflow-x-auto">
        {tabs.map(tTab => {
          const Icon = tTab.icon
          const isActive = tab === tTab.id
          return (
            <button
              key={tTab.id}
              type="button"
              onClick={() => setTab(tTab.id)}
              className={`tab-item flex items-center justify-center gap-1.5 text-sm font-semibold whitespace-nowrap min-h-[40px] cursor-pointer ${
                isActive ? 'active text-[var(--color-green-700)]' : 'text-[var(--color-ink-2)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tTab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in min-h-[120px]">
        {tab === 'immediate' && (
          <ol className="flex flex-col gap-2.5 list-none p-0 m-0">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-md bg-[var(--color-green-100)] text-[var(--color-green-800)] font-bold text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-[var(--color-ink-2)] leading-relaxed pt-0.5">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        )}

        {tab === 'organic' && (
          <ol className="flex flex-col gap-2.5 list-none p-0 m-0">
            {organicSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-md bg-[var(--color-green-100)] text-[var(--color-green-700)] flex items-center justify-center mt-0.5">
                  <Leaf className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm text-[var(--color-ink-2)] leading-relaxed pt-0.5">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        )}

        {tab === 'preventive' && (
          <div className="flex flex-col gap-2.5">
            {prevention.split('.').filter(s => s.trim()).map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[var(--color-green-700)] shrink-0 mt-1" />
                <span className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                  {s.trim()}.
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Severe alert */}
      {isSevere && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--color-warn-bg)] border border-[var(--color-warn-border)]">
          <AlertTriangle className="w-4 h-4 text-[var(--color-warn)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
            <strong className="text-[var(--color-warn)] font-bold">{t('diagnosis.expertAlert')}:</strong>{' '}
            {t('diagnosis.consultExpert')}
          </p>
        </div>
      )}
    </div>
  )
}
