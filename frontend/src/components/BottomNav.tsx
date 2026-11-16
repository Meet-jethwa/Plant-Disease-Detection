// BottomNav.tsx — FloraAI clean white bottom navigation
import { Link, useLocation } from 'react-router-dom'
import { Home, Scan, Leaf, MessageSquare, BookOpen } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

export function BottomNav() {
  const location = useLocation()
  const { t } = useLang()

  const tabs = [
    { path: '/',          labelKey: 'nav.home'         as const, icon: Home },
    { path: '/plants',    labelKey: 'nav.plants'       as const, icon: Leaf },
    { path: '/scan',      labelKey: 'nav.scan'         as const, icon: Scan },
    { path: '/assistant', labelKey: 'nav.chat'         as const, icon: MessageSquare },
    { path: '/library',   labelKey: 'nav.encyclopedia' as const, icon: BookOpen },
  ]

  return (
    <nav
      aria-label="Main navigation"
      className="mobile-bottom-nav lg:hidden"
    >
      <div className="flex items-center justify-around max-w-[480px] mx-auto pb-[calc(env(safe-area-inset-bottom,0px)+4px)] pt-1">
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
                className="flex flex-col items-center gap-0.5 no-underline -mt-4 min-h-[44px] min-w-[44px]"
              >
                {/* Raised scan FAB */}
                <div
                  className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center border-2 border-white/90 shadow-[0_4px_14px_rgba(21,128,61,0.35)] transition-all ${
                    isActive ? 'bg-[var(--color-green-600)]' : 'bg-[var(--color-green-700)]'
                  }`}
                >
                  <Scan className="w-[22px] h-[22px] text-white" />
                </div>
                <span
                  className={`text-xs font-semibold tracking-wide ${
                    isActive ? 'text-[var(--color-green-700)]' : 'text-[var(--color-ink-2)]'
                  }`}
                >
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
              className="flex flex-col items-center gap-0.5 px-3 no-underline relative min-w-[44px] min-h-[52px] justify-center"
            >
              {/* Active top indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full bg-[var(--color-green-600)]" />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-[var(--color-green-700)]' : 'text-[var(--color-ink-2)]'
                }`}
              />
              <span
                className={`text-xs tracking-wide transition-colors ${
                  isActive ? 'font-semibold text-[var(--color-green-700)]' : 'font-normal text-[var(--color-ink-2)]'
                }`}
              >
                {t(tab.labelKey)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
