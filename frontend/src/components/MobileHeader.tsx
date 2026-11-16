// MobileHeader.tsx — FloraAI header for mobile/tablet (<lg)
import { Link } from 'react-router-dom'
import { LanguageSelector } from './LanguageSelector'
import profileImage from '../../IMAGES/images.jpg'

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-50 border-b border-white/15 shadow-[0_4px_20px_rgba(6,78,59,0.25)] bg-gradient-to-r from-[var(--color-nav-bg)] to-[var(--color-nav-bg-2)] px-4 sm:px-6">
      <div className="flex items-center justify-between min-h-[56px]">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 no-underline min-h-[44px]">
          <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center overflow-hidden">
            <img
              src="/header_icon.png"
              alt="FloraAI Logo"
              className="w-5.5 h-5.5 object-contain"
            />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-bold text-white tracking-tight">Flora</span>
            <span className="text-base font-bold text-green-200 tracking-tight">AI</span>
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <img
            src={profileImage}
            alt="User profile"
            className="w-8 h-8 rounded-full object-cover border border-white/40"
          />
          <LanguageSelector compact />
        </div>
      </div>
    </header>
  )
}
