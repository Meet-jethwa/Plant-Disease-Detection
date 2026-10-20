// TreatmentCard.tsx — BioScan Lab dark treatment protocol card
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
    { id: 'immediate' as const, label: t('diagnosis.tabImmediate'),  icon: AlertTriangle, color: 'var(--neon-red)' },
    { id: 'organic'   as const, label: t('diagnosis.tabOrganic'),    icon: Leaf,          color: 'var(--neon-green)' },
    { id: 'preventive'as const, label: t('diagnosis.tabPreventive'), icon: ShieldCheck,   color: 'var(--neon-cyan)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FlaskConical style={{ width: 15, height: 15, color: 'var(--neon-green)' }} />
        <h3 className="eyebrow">{t('diagnosis.treatment')}</h3>
      </div>

      {/* Tab switcher */}
      <div className="tab-group">
        {tabs.map(tTab => (
          <button
            key={tTab.id} type="button"
            onClick={() => setTab(tTab.id)}
            className={`tab-item ${tab === tTab.id ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem',
              color: tab === tTab.id ? tTab.color : undefined,
            }}
          >
            <tTab.icon style={{ width: 12, height: 12 }} />
            {tTab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" style={{ minHeight: 120 }}>
        {tab === 'immediate' && (
          <ol style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {steps.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 12 }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                  background: 'rgba(255,69,96,0.1)', border: '1px solid rgba(255,69,96,0.25)',
                  color: 'var(--neon-red)', fontWeight: 700, fontSize: '0.65rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65, paddingTop: 2 }}>{step}</span>
              </li>
            ))}
          </ol>
        )}

        {tab === 'organic' && (
          <ol style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {organicSteps.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 12 }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                  background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Leaf style={{ width: 11, height: 11, color: 'var(--neon-green)' }} />
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65, paddingTop: 2 }}>{step}</span>
              </li>
            ))}
          </ol>
        )}

        {tab === 'preventive' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prevention.split('.').filter(s => s.trim()).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <ShieldCheck style={{ width: 14, height: 14, color: 'var(--neon-cyan)', flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.trim()}.</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Severe alert */}
      {isSevere && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '12px 14px', borderRadius: 10,
          background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.25)',
        }}>
          <AlertTriangle style={{ width: 15, height: 15, color: 'var(--neon-amber)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--neon-amber)' }}>{t('diagnosis.expertAlert')}:</strong>{' '}
            {t('diagnosis.consultExpert')}
          </p>
        </div>
      )}
    </div>
  )
}
