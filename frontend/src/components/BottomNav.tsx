// BottomNav.tsx — FloraAI clean white bottom navigation
// Inspired by app/static/styles.css: clean white bg, green active indicator, pill-shaped scan button
import { Link, useLocation } from 'react-router-dom'
import { Home, Scan, Leaf, MessageSquare, BookOpen } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

export function BottomNav() {
  const location = useLocation()
  const { t } = useLang()

  const tabs = [
    { path: '/',          labelKey: 'nav.home' as const,        icon: Home },
    { path: '/plants',    labelKey: 'nav.plants' as const,      icon: Leaf },
    { path: '/scan',      labelKey: 'nav.scan' as const,        icon: Scan },
    { path: '/assistant', labelKey: 'nav.chat' as const,        icon: MessageSquare },
    { path: '/library',   labelKey: 'nav.encyclopedia' as const, icon: BookOpen },
  ]

  return (
    <nav
      aria-label="Main navigation"
      className="mobile-bottom-nav lg:hidden"
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '4px 0',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)',
        maxWidth: 480, margin: '0 auto',
      }}>
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path
            || (tab.path !== '/' && location.pathname.startsWith(tab.path))
          const isScan = tab.path === '/scan'
          const Icon = tab.icon

          if (isScan) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                aria-label={t(tab.labelKey)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  marginTop: -16, textDecoration: 'none',
                }}
              >
                {/* Raised scan FAB — pill button like app's .nav-cta */}
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: isActive ? 'var(--color-green-600)' : 'var(--color-green-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(21, 128, 61, 0.35)',
                  border: '2px solid rgba(255,255,255,0.9)',
                  transition: 'background 0.18s ease, transform 0.12s ease',
                }}>
                  <Scan style={{ width: 22, height: 22, color: '#FFFFFF' }} />
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: 600,
                  color: isActive ? 'var(--color-green-700)' : 'var(--color-ink-2)',
                  transition: 'color 0.15s ease', letterSpacing: '0.02em',
                }}>
                  {t(tab.labelKey)}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              aria-label={t(tab.labelKey)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 12px', minWidth: 44, minHeight: 52, justifyContent: 'center',
                textDecoration: 'none', position: 'relative',
              }}
            >
              {/* Active top indicator — slim green bar, like app's nav-links hover */}
              {isActive && (
                <span style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 24, height: 2.5, borderRadius: 999,
                  background: 'var(--color-green-600)',
                }} />
              )}
              <Icon style={{
                width: 20, height: 20,
                color: isActive ? 'var(--color-green-700)' : 'var(--color-ink-2)',
                transition: 'color 0.15s ease',
              }} />
              <span style={{
                fontSize: '10px', fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-green-700)' : 'var(--color-ink-2)',
                transition: 'color 0.15s ease', letterSpacing: '0.01em',
              }}>
                {t(tab.labelKey)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
