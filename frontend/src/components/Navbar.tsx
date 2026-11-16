// Navbar.tsx — FloraAI desktop header (lg+ screens)
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
    <header className="hidden lg:block sticky top-0 z-50 border-b border-white/15 shadow-[0_4px_20px_rgba(6,78,59,0.25)] bg-gradient-to-r from-[var(--color-nav-bg)] to-[var(--color-nav-bg-2)]">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="flex items-center justify-between h-[70px] gap-6">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/18 border border-white/30 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.15)] overflow-hidden">
              <img src="/header_icon.png" alt="FloraAI Logo" className="w-6.5 h-6.5 object-contain" />
            </div>
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-white tracking-tight">Flora</span>
                <span className="text-xl font-bold text-green-200 tracking-tight">AI</span>
              </div>
              <p className="text-xs text-[var(--color-nav-text-muted)] font-medium -mt-0.5">
                Plant intelligence
              </p>
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
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] no-underline transition-all min-h-[44px] text-white border ${
                    isActive
                      ? 'font-bold bg-white/20 border-white/30 shadow-sm'
                      : 'font-medium bg-transparent border-transparent hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-green-100' : 'text-white/75'}`} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Selector */}
            <LanguageSelector variant="dark" />

            {/* Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-label="User profile menu"
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-white/25 bg-white/10 cursor-pointer transition-all hover:bg-white/20 min-h-[44px]"
              >
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <img
                    src={profileImage}
                    alt="User profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/40"
                  />
                  {/* Online status dot */}
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      backendHealthy ? 'bg-[var(--color-green-500)]' : 'bg-[var(--color-warn)]'
                    }`}
                  />
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-white/70 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="dropdown-panel animate-fade-in absolute right-0 top-[calc(100%+8px)] w-[220px] z-50">
                    <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[var(--color-border-subtle)]">
                      <img
                        src={profileImage}
                        alt="User profile"
                        className="w-9 h-9 rounded-full object-cover border border-[var(--color-green-200)] shrink-0"
                      />
                      <div>
                        <div className="text-sm font-semibold text-[var(--color-ink)]">Meet Jethwa</div>
                        <div className="text-sm text-[var(--color-ink-2)]">meetjethwa@example.com</div>
                      </div>
                    </div>
                    <span className="badge badge-green mx-4 my-2 inline-flex">{t('nav.proSpecialist')}</span>

                    <div className="px-2 py-1.5">
                      {[
                        { to: '/profile', icon: User,     label: t('nav.myProfile') },
                        { to: '/history', icon: History,  label: t('nav.scanHistory') },
                        { to: '/tools',   icon: Settings, label: t('nav.preferences') },
                      ].map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm text-[var(--color-ink-2)] no-underline transition-all hover:bg-[var(--color-green-50)] hover:text-[var(--color-green-700)] min-h-[44px]"
                        >
                          <item.icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-[var(--color-border-subtle)] px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm text-[var(--color-danger)] bg-transparent border-none cursor-pointer transition-all hover:bg-[var(--color-danger-bg)] text-left font-[var(--font-sans)] min-h-[44px]"
                      >
                        <LogOut className="w-3.5 h-3.5" />
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
