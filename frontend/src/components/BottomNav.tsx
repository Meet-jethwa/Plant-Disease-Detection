// BottomNav.tsx — FloraAI fixed bottom navigation for mobile/tablet
import { Link, useLocation } from 'react-router-dom'
import { Home, Scan, Leaf, MessageSquare, User } from 'lucide-react'

export function BottomNav() {
  const location = useLocation()

  const tabs = [
    { path: '/',         label: 'Home',    icon: Home         },
    { path: '/plants',   label: 'Plants',  icon: Leaf         },
    { path: '/scan',     label: 'Scan',    icon: Scan         }, // Center — emphasized
    { path: '/assistant', label: 'AI Chat', icon: MessageSquare },
    { path: '/profile',  label: 'Profile', icon: User         },
  ]

  return (
    <nav
      aria-label="Main navigation"
      className="mobile-bottom-nav lg:hidden"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
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
                className="flex flex-col items-center gap-0.5 -mt-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-all ${
                  isActive
                    ? 'bg-[#12372A] shadow-[#12372A]/30'
                    : 'bg-[#159A70] shadow-[#159A70]/25 hover:bg-[#128A63]'
                }`}>
                  <Scan className="w-5 h-5 text-white" />
                </div>
                <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-[#159A70]' : 'text-[#66736C]'}`}>
                  {tab.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              aria-label={tab.label}
              className="flex flex-col items-center gap-1 py-1 px-3 min-w-[44px] min-h-[48px] justify-center relative"
            >
              <Icon className={`w-5 h-5 transition-all ${isActive ? 'text-[#159A70]' : 'text-[#96A39D]'}`} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#159A70]' : 'text-[#96A39D]'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#159A70]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
