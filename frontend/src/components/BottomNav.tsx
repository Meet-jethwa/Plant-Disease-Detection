// BottomNav.tsx — BioScan Lab fixed bottom navigation for mobile/tablet
import { Link, useLocation } from 'react-router-dom'
import { Home, Scan, Leaf, MessageSquare, User } from 'lucide-react'

export function BottomNav() {
  const location = useLocation()

  const tabs = [
    { path: '/',          label: 'Home',    icon: Home },
    { path: '/plants',    label: 'Plants',  icon: Leaf },
    { path: '/scan',      label: 'Scan',    icon: Scan },
    { path: '/assistant', label: 'AI Chat', icon: MessageSquare },
    { path: '/profile',   label: 'Profile', icon: User },
  ]

  return (
    <nav
      aria-label="Main navigation"
      className="mobile-bottom-nav lg:hidden"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 4px', paddingBottom: 'env(safe-area-inset-bottom, 6px)' }}>
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path))
          const isScan = tab.path === '/scan'
          const Icon = tab.icon

          if (isScan) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                aria-label="Open Plant Scanner"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  marginTop: -20, textDecoration: 'none',
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,212,255,0.15))'
                    : 'var(--neon-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isActive
                    ? '0 0 20px rgba(0,255,136,0.4), 0 0 40px rgba(0,255,136,0.15)'
                    : '0 0 20px rgba(0,255,136,0.4), 0 4px 12px rgba(0,0,0,0.4)',
                  border: isActive ? '1px solid rgba(0,255,136,0.5)' : 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}>
                  {isActive && (
                    <div style={{
                      position: 'absolute', inset: -4, borderRadius: 18,
                      border: '1px solid rgba(0,255,136,0.3)',
                      animation: 'ripple 2s ease-out infinite',
                    }} />
                  )}
                  <Scan style={{ width: 22, height: 22, color: isActive ? 'var(--neon-green)' : '#FFFFFF' }} />
                </div>
                <span style={{
                  fontSize: '9px', fontWeight: 700, marginTop: 2,
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                  color: isActive ? 'var(--neon-green)' : 'var(--text-muted)',
                }}>
                  {tab.label.toUpperCase()}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              aria-label={tab.label}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 12px', minWidth: 44, minHeight: 48, justifyContent: 'center',
                textDecoration: 'none', position: 'relative',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 20, height: 2, borderRadius: 999,
                  background: 'var(--neon-green)',
                  boxShadow: '0 0 8px rgba(0,255,136,0.6)',
                }} />
              )}
              <Icon style={{
                width: 20, height: 20,
                color: isActive ? 'var(--neon-green)' : 'var(--text-muted)',
                filter: isActive ? 'drop-shadow(0 0 4px rgba(0,255,136,0.5))' : 'none',
                transition: 'all 0.15s ease',
              }} />
              <span style={{
                fontSize: '9px', fontWeight: 600,
                fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
                color: isActive ? 'var(--neon-green)' : 'var(--text-muted)',
                transition: 'color 0.15s ease',
              }}>
                {tab.label.toUpperCase()}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
