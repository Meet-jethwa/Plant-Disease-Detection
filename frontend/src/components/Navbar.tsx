// Navbar.tsx — FloraAI Desktop header (lg+ screens)
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  ChevronDown,
  MessageSquare,
  History,
  Home,
  Leaf,
  LogOut,
  MapPin,
  RefreshCw,
  Scan,
  Settings,
  Sprout,
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
    { path: '/',          label: 'Home',         icon: Home },
    { path: '/scan',      label: 'Plant Scanner', icon: Scan },
    { path: '/assistant', label: 'AI Chat',        icon: MessageSquare },
    { path: '/plants',    label: 'My Plants',     icon: Leaf },
    { path: '/library',   label: 'Encyclopedia',  icon: BookOpen },
  ]

  const riskColors: Record<string, string> = {
    High:   'bg-red-50 text-red-600 border-red-100',
    Medium: 'bg-amber-50 text-amber-700 border-amber-100',
    Low:    'bg-[#DDF3E8] text-[#0B6344] border-[#B0D8C4]',
  }

  return (
    <header className="hidden lg:block sticky top-0 z-50 bg-white/98 backdrop-blur-sm border-b border-[#E0EBE4]">
      <div className="max-w-[1440px] mx-auto px-8 xl:px-12">
        <div className="flex items-center justify-between h-[68px] gap-6">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#159A70] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-[1.1rem] tracking-tight text-[#17211D]">
                  Flora
                </span>
                <span className="font-bold text-[1.1rem] tracking-tight text-[#159A70]">AI</span>
              </div>
              <p className="text-[11px] text-[#66736C] font-medium leading-none">Smart Plant Diagnostics</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? 'text-[#159A70] font-semibold bg-[#F0FAF4]'
                      : 'text-[#66736C] font-medium hover:text-[#17211D] hover:bg-[#F7F8F3]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#159A70] rounded-t-full" />}
                </Link>
              )
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2.5 shrink-0">

            {/* Weather / Location */}
            <button
              type="button"
              onClick={onFetchLocation}
              disabled={isLocating}
              aria-label="Update local weather data"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#F7F8F3] border border-[#E0EBE4] text-sm font-medium text-[#66736C] hover:bg-[#EEF4EE] hover:text-[#17211D] transition-all cursor-pointer"
            >
              {isLocating
                ? <RefreshCw className="w-3.5 h-3.5 text-[#159A70] animate-spin" />
                : <MapPin className="w-3.5 h-3.5 text-[#159A70]" />
              }
              <span className="text-sm">
                {locationData?.location
                  ? `${locationData.location.city} · ${locationData.weather?.temperature_c ?? '—'}°C`
                  : 'Location'}
              </span>
              {locationData?.risk_level && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${riskColors[locationData.risk_level] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                  {locationData.risk_level}
                </span>
              )}
            </button>

            {/* Scan CTA */}
            <Link
              to="/scan"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#159A70] hover:bg-[#128A63] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Plant</span>
            </Link>

            {/* Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-label="User profile menu"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-[#E0EBE4] hover:border-[#BDD8C7] bg-white hover:bg-[#F7F8F3] transition-all cursor-pointer"
              >
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#159A70] to-[#12372A] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  MJ
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${backendHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#96A39D] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-[#E0EBE4] shadow-xl p-2 z-50 animate-fade-in">
                    <div className="px-3 py-3 border-b border-[#EEF4EE] mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#159A70] to-[#12372A] flex items-center justify-center text-white font-bold text-xs shadow-sm">MJ</div>
                        <div>
                          <div className="text-sm font-semibold text-[#17211D]">Meet Jethwa</div>
                          <div className="text-xs text-[#66736C]">meetjethwa@example.com</div>
                        </div>
                      </div>
                      <span className="mt-2.5 inline-block text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#DDF3E8] text-[#0B6344]">
                        PRO Plant Specialist
                      </span>
                    </div>

                    {[
                      { to: '/profile', icon: User,     label: 'My Profile' },
                      { to: '/history', icon: History,  label: 'Scan History' },
                      { to: '/tools',   icon: Settings, label: 'Preferences' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#17211D] hover:bg-[#F7F8F3] transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-[#66736C]" />
                        <span>{item.label}</span>
                      </Link>
                    ))}

                    <div className="border-t border-[#EEF4EE] mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
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
