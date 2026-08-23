// MobileHeader.tsx — FloraAI top bar for mobile/tablet (< lg)
import { Link } from 'react-router-dom'
import { Sprout, Scan } from 'lucide-react'

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-[#E0EBE4] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#159A70] flex items-center justify-center shadow-sm">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-base text-[#17211D]">Flora</span>
            <span className="font-bold text-base text-[#159A70]">AI</span>
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Scan shortcut */}
          <Link
            to="/scan"
            aria-label="Open Plant Scanner"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#159A70] text-white text-xs font-semibold shadow-sm"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan</span>
          </Link>

          {/* Profile avatar */}
          <Link
            to="/profile"
            aria-label="Profile"
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#159A70] to-[#12372A] flex items-center justify-center text-white font-bold text-xs shadow-sm"
          >
            MJ
          </Link>
        </div>
      </div>
    </header>
  )
}
