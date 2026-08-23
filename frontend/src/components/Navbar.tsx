// Navbar.tsx — Pathology Diagnostic Workbench Topbar
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  ChevronDown,
  MessageSquare,
  History,
  Home,
  LogOut,
  MapPin,
  RefreshCw,
  Scan,
  Settings,
  Microscope,
  User,
} from 'lucide-react'

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

export function Navbar({ locationData, isLocating, onFetchLocation, backendHealthy }: NavbarProps) {
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)

  const navLinks = [
    { path: '/', label: 'Overview', icon: Home },
    { path: '/scan', label: 'Diagnostic Scanner', icon: Scan },
    { path: '/assistant', label: 'XAI Assistant', icon: MessageSquare },
    { path: '/history', label: 'Audit Log', icon: History },
    { path: '/library', label: 'Disease DB', icon: BookOpen },
  ]

  const riskBadgeStyles: Record<string, { bg: string; color: string; border: string }> = {
    High: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
    Medium: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
    Low: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
  }

  const currentRisk = locationData?.risk_level ?? 'Low'
  const riskStyle = riskBadgeStyles[currentRisk] ?? riskBadgeStyles.Low

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', gap: '20px' }}>
          
          {/* Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#159A70',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Microscope style={{ width: '18px', height: '18px', color: '#ffffff' }} />
            </div>
            <div>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1 }}>
                Plant Pathology
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', letterSpacing: '0.04em' }}>
                DIAGNOSTIC WORKBENCH
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#159A70' : '#475569',
                    background: isActive ? '#ECFDF5' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            
            {/* Environmental Widget */}
            <button
              type="button"
              onClick={onFetchLocation}
              disabled={isLocating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              {isLocating ? (
                <RefreshCw style={{ width: '13px', height: '13px', color: '#159A70', animation: 'spin 1s linear infinite' }} />
              ) : (
                <MapPin style={{ width: '13px', height: '13px', color: '#159A70' }} />
              )}
              <span>
                {locationData?.location
                  ? `${locationData.location.city} · ${locationData.weather?.temperature_c ?? '—'}°C`
                  : 'Sensors'}
              </span>
              {locationData?.risk_level && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: riskStyle.bg,
                    color: riskStyle.color,
                    border: `1px solid ${riskStyle.border}`,
                  }}
                >
                  {locationData.risk_level}
                </span>
              )}
            </button>

            {/* API Status Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: backendHealthy ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${backendHealthy ? '#A7F3D0' : '#FECACA'}`,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: backendHealthy ? '#10B981' : '#EF4444',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: backendHealthy ? '#065F46' : '#991B1B' }}>
                {backendHealthy ? 'Model API Live' : 'API Standby'}
              </span>
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: '#159A70',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  MJ
                </div>
                <ChevronDown style={{ width: '13px', height: '13px', color: '#64748B' }} />
              </button>

              {profileOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setProfileOpen(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '220px',
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      padding: '8px',
                      zIndex: 50,
                    }}
                  >
                    <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Meet Jethwa</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Diagnostic Terminal User</div>
                    </div>

                    {[
                      { to: '/profile', icon: User, label: 'Researcher Profile' },
                      { to: '/history', icon: History, label: 'Audit Log' },
                      { to: '/tools', icon: Settings, label: 'Pipeline Config' },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#334155',
                          textDecoration: 'none',
                        }}
                      >
                        <item.icon style={{ width: '14px', height: '14px', color: '#64748B' }} />
                        <span>{item.label}</span>
                      </Link>
                    ))}

                    <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '4px', paddingTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#DC2626',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <LogOut style={{ width: '14px', height: '14px' }} />
                        <span>Sign Out</span>
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