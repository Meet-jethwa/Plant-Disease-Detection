// ProfilePage.tsx — BioScan Lab dark profile & settings
import { useState } from 'react'
import {
  User, Camera, Bell, Globe, Shield,
  HelpCircle, LogOut, ChevronRight, Leaf, ScanLine,
  HeartPulse, BookMarked, Check, Zap,
} from 'lucide-react'
import { LanguageSelector } from '../components/LanguageSelector'

interface SettingRowProps {
  icon: React.ElementType
  label: string
  description?: string
  value?: React.ReactNode
  toggle?: boolean
  defaultOn?: boolean
  onClick?: () => void
  id?: string
}

function SettingRow({ icon: Icon, label, description, value, toggle, defaultOn = false, onClick, id }: SettingRowProps) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      type="button" id={id}
      onClick={toggle ? () => setOn(v => !v) : onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 8, transition: 'all 0.15s ease',
        background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F0FAF4')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        background: '#F0FAF4', border: '1px solid rgba(11,143,104,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon style={{ width: 16, height: 16, color: 'var(--neon-green)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</p>
        {description && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>{description}</p>}
      </div>
      {toggle ? (
        <div
          style={{
            width: 44, height: 24, borderRadius: 999, position: 'relative', flexShrink: 0,
            background: on ? 'rgba(11,143,104,0.2)' : '#E2E8F0',
            border: `1px solid ${on ? 'rgba(11,143,104,0.4)' : '#CBD5E1'}`,
            boxShadow: on ? '0 0 8px rgba(11,143,104,0.15)' : 'none',
            transition: 'all 0.2s ease',
          }}
          role="switch" aria-checked={on} aria-label={label}
        >
          <span style={{
            position: 'absolute', top: 3,
            width: 16, height: 16, borderRadius: '50%',
            background: on ? 'var(--neon-green)' : '#94A3B8',
            transform: on ? 'translateX(24px)' : 'translateX(3px)',
            transition: 'all 0.2s ease',
            boxShadow: on ? '0 0 6px rgba(11,143,104,0.3)' : 'none',
          }} />
        </div>
      ) : value ? (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#F0FAF4', border: '1px solid rgba(11,143,104,0.15)', padding: typeof value === 'string' ? '3px 8px' : 0, borderRadius: 6, fontFamily: 'var(--font-mono)' }}>
          {value}
        </span>
      ) : (
        <ChevronRight style={{ width: 15, height: 15, color: 'var(--text-muted)', flexShrink: 0 }} />
      )}
    </button>
  )
}

export function ProfilePage() {
  const stats = [
    { label: 'Plants',  value: 8,  icon: Leaf,       color: 'var(--neon-green)' },
    { label: 'Scans',   value: 24, icon: ScanLine,   color: 'var(--neon-cyan)' },
    { label: 'Healthy', value: 19, icon: HeartPulse, color: 'var(--neon-green)' },
    { label: 'Reports', value: 6,  icon: BookMarked, color: 'var(--neon-purple)' },
  ]

  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Profile header card */}
      <div className="bio-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 76, height: 76, borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(11,143,104,0.15), rgba(14,165,233,0.12))',
              border: '2px solid rgba(11,143,104,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(11,143,104,0.1)',
            }}>
              <User style={{ width: 30, height: 30, color: 'var(--neon-green)' }} />
            </div>
            <button type="button" aria-label="Change profile photo" id="profile-avatar-btn" style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 28, height: 28, borderRadius: '50%',
              background: '#FFFFFF', border: '1px solid rgba(11,143,104,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--neon-green)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            }}>
              <Camera style={{ width: 12, height: 12 }} />
            </button>
          </div>

          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '0.02em' }}>
              MEET JETHWA
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>meetjethwa@example.com</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="badge badge-green">
                <Check style={{ width: 10, height: 10 }} />
                VERIFIED
              </span>
              <span className="badge badge-purple">
                <Zap style={{ width: 10, height: 10 }} />
                PRO SPECIALIST
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: '#F0FAF4', border: '1px solid var(--border-subtle)' }}>
                <Icon style={{ width: 18, height: 18, color: stat.color, margin: '0 auto 6px' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 3, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{stat.label.toUpperCase()}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Settings sections */}
      {[
        {
          label: 'NOTIFICATIONS',
          items: [
            { icon: Bell, label: 'Disease Alerts', description: 'Get notified when risk is high', toggle: true, defaultOn: true, id: 'pref-disease-alerts' },
            { icon: Bell, label: 'Weekly Reports', description: 'Summary of your plant health', toggle: true, defaultOn: false, id: 'pref-weekly-reports' },
          ],
        },
        {
          label: 'PREFERENCES',
          items: [
            { icon: Globe, label: 'Language', value: <LanguageSelector variant="light" />, id: 'pref-language' },
            { icon: Shield, label: 'Units', value: 'Metric', id: 'pref-units' },
          ],
        },
        {
          label: 'PRIVACY & DATA',
          items: [
            { icon: Shield, label: 'Data Sharing', description: 'Help improve AI accuracy', toggle: true, defaultOn: true, id: 'pref-data-sharing' },
            { icon: Shield, label: 'Privacy Policy', id: 'pref-privacy' },
            { icon: Shield, label: 'Delete My Data', id: 'pref-delete-data' },
          ],
        },
        {
          label: 'SUPPORT',
          items: [
            { icon: HelpCircle, label: 'Help & FAQ', id: 'pref-help' },
            { icon: HelpCircle, label: 'Contact Support', id: 'pref-contact' },
          ],
        },
      ].map(section => (
        <div key={section.label} className="bio-card" style={{ padding: '6px 8px' }}>
          <p className="eyebrow" style={{ padding: '12px 8px 6px', paddingLeft: 16 }}>{section.label}</p>
          {section.items.map(item => (
            <SettingRow key={item.label} {...(item as any)} />
          ))}
        </div>
      ))}

      {/* Logout */}
      <button type="button" className="btn btn-danger btn-lg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} id="profile-logout-btn">
        <LogOut style={{ width: 16, height: 16 }} />
        SIGN OUT
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
        FLORA AI v2.1.0 · PLANT DISEASE INTELLIGENCE PLATFORM
      </p>
    </div>
  )
}
