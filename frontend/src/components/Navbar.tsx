// Navbar.tsx — BioScan Lab Desktop header (lg+ screens)
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen, ChevronDown, MessageSquare, History,
  Home, Leaf, LogOut, Scan,
  Settings, User,
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import { LanguageSelector } from './LanguageSelector'
import profileImage from '../../IMAGES/images.jpg'

interface NavbarProps {
  locationData: {
    location?: { city: string; state: string }
    weather?: { temperature_c: number; condition: string }
    risk_level?: string
  } | null
  isLocating: boolean
  onFetchLocation: () => void
  backendHealthy: boolean
}

export function Navbar({ backendHealthy }: NavbarProps) {
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const { t } = useLang()

  const navLinks = [
    { path: '/',          label: t('nav.home'),         icon: Home },
    { path: '/scan',      label: t('nav.scan'),         icon: Scan },
    { path: '/assistant', label: t('nav.chat'),         icon: MessageSquare },
    { path: '/plants',    label: t('nav.plants'),       icon: Leaf },
    { path: '/library',   label: t('nav.encyclopedia'), icon: BookOpen },
  ]

  return (
    <header className="hidden lg:block" style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'linear-gradient(135deg, #0B6344 0%, #064E3B 100%)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 4px 20px rgba(6, 78, 59, 0.25)',
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', gap: 24 }}>

          {/* Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}>
              <img src="/header_icon.png" alt="FloraAI Logo" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  FLORA
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#3DFF8F', letterSpacing: '-0.01em', textShadow: '0 0 12px rgba(61,255,143,0.5)' }}>
                  AI
                </span>
              </div>
              <p style={{ fontSize: '10px', color: '#A7F3D0', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginTop: -2 }}>
                PLANT INTELLIGENCE
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map(link => {
              const Icon = link.icon
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8,
                    fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    color: '#FFFFFF',
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(255,255,255,0.35)' : 'transparent'}`,
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <Icon style={{ width: 15, height: 15, flexShrink: 0, color: isActive ? '#3DFF8F' : '#E2E8F0' }} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Language Selector */}
            <LanguageSelector variant="dark" />

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-label="User profile menu"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 6px 4px 4px', borderRadius: 999,
                  border: '1.5px solid var(--border-base)',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  position: 'relative', width: 34, height: 34, borderRadius: '50%',
                  overflow: 'visible',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img
                    src={profileImage}
                    alt="User profile"
                    style={{
                      width: 34, height: 34, borderRadius: '50%', objectFit: 'cover',
                      border: '1.5px solid #0B8F68',
                    }}
                  />
                  <span style={{
                    position: 'absolute', bottom: -1, right: -1,
                    width: 10, height: 10, borderRadius: '50%',
                    background: backendHealthy ? 'var(--neon-green)' : 'var(--neon-amber)',
                    border: '2px solid #FFFFFF',
                    boxShadow: `0 0 6px ${backendHealthy ? 'var(--neon-green)' : 'var(--neon-amber)'}`,
                  }} />
                </div>
                <ChevronDown style={{
                  width: 13, height: 13, color: 'var(--text-muted)',
                  transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                }} />
              </button>

              {profileOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setProfileOpen(false)} />
                  <div className="dropdown-panel animate-fade-in" style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 220, zIndex: 50,
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={profileImage}
                          alt="User profile"
                          style={{
                            width: 38, height: 38, borderRadius: '50%', objectFit: 'cover',
                            border: '1.5px solid #0B8F68', flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Meet Jethwa</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>meetjethwa@example.com</div>
                        </div>
                      </div>
                      <span className="badge badge-green" style={{ marginTop: 10, display: 'inline-flex' }}>{t('nav.proSpecialist')}</span>
                    </div>

                    <div style={{ padding: '6px 8px' }}>
                      {[
                        { to: '/profile', icon: User,     label: t('nav.myProfile') },
                        { to: '/history', icon: History,  label: t('nav.scanHistory') },
                        { to: '/tools',   icon: Settings, label: t('nav.preferences') },
                      ].map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setProfileOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 10px', borderRadius: 8,
                            fontSize: '0.875rem', color: 'var(--text-secondary)',
                            textDecoration: 'none', transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'var(--neon-green-muted)'
                            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--neon-green)'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'
                          }}
                        >
                          <item.icon style={{ width: 15, height: 15 }} />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '6px 8px' }}>
                      <button
                        type="button"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 10px', borderRadius: 8,
                          fontSize: '0.875rem', color: 'var(--neon-red)',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          transition: 'all 0.15s ease', textAlign: 'left',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        <LogOut style={{ width: 15, height: 15 }} />
                        <span>{t('nav.signOut')}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
