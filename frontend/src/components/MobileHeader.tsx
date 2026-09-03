// MobileHeader.tsx — BioScan Lab top bar for mobile/tablet (<lg)
import { Link } from 'react-router-dom'

export function MobileHeader() {
  return (
    <header className="lg:hidden" style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'linear-gradient(135deg, #0B6344 0%, #064E3B 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 2px 10px rgba(6, 78, 59, 0.25)',
      padding: '10px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img src="/header_icon.png" alt="FloraAI Logo" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>FLORA</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: '#3DFF8F' }}>AI</span>
          </div>
        </Link>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          <Link
            to="/profile"
            aria-label="Profile"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,212,255,0.1))',
              border: '1px solid rgba(0,255,136,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--neon-green)', fontWeight: 700, fontSize: '0.65rem',
              fontFamily: 'var(--font-display)', textDecoration: 'none',
              boxShadow: '0 0 8px rgba(0,255,136,0.12)',
            }}
          >
            MJ
          </Link>
        </div>
      </div>
    </header>
  )
}
