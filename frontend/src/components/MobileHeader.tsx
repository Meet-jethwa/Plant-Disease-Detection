// MobileHeader.tsx — FloraAI frosted-glass header inspired by app/static/styles.css
import { Link } from 'react-router-dom'
import { LanguageSelector } from './LanguageSelector'
import profileImage from '../../IMAGES/images.jpg'

export function MobileHeader() {
  return (
    <header
      className="lg:hidden"
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        /* Frosted glass — same pattern as app's .site-header */
        background: 'linear-gradient(135deg, #0B6344 0%, #064E3B 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 20px rgba(6, 78, 59, 0.25)',
        padding: '0 var(--spacing-page-x-mobile)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        minHeight: 56,
      }}>
        {/* Brand — matches app's .brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--color-green-100)',
            border: '1px solid var(--color-green-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img
              src="/header_icon.png"
              alt="FloraAI Logo"
              style={{ width: 22, height: 22, objectFit: 'contain' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
              FLORA
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#A7F3D0', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', textShadow: '0 0 10px rgba(167,243,208,0.45)' }}>
              AI
            </span>
          </div>
        </Link>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src={profileImage}
            alt="User profile"
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #A7F3D0' }}
          />
          <LanguageSelector compact />
        </div>
      </div>
    </header>
  )
}
