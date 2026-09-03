// Footer.tsx — BioScan Lab dark minimal footer
import { Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  const columns = [
    {
      heading: 'Platform',
      links: [
        { label: 'Plant Scanner', to: '/scan' },
        { label: 'AI Chat', to: '/assistant' },
        { label: 'My Plants', to: '/plants' },
        { label: 'Encyclopedia', to: '/library' },
      ],
    },
    {
      heading: 'Data',
      links: [
        { label: 'Disease Library', to: '/library' },
        { label: 'Scan History', to: '/history' },
        { label: 'Analysis Tools', to: '/tools' },
      ],
    },
    {
      heading: 'Info',
      links: [
        { label: 'About BioScan', to: '/' },
        { label: 'Contact', to: '/' },
        { label: 'Privacy', to: '/' },
        { label: 'Terms', to: '/' },
      ],
    },
  ]

  return (
    <footer style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.15)',
      background: 'linear-gradient(180deg, #0B6344 0%, #043E2E 100%)',
      backdropFilter: 'blur(12px)',
      marginTop: 40,
      position: 'relative',
      overflow: 'hidden',
      color: '#FFFFFF',
    }}>
      {/* Accent trace line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, #3DFF8F 30%, #0EA5E9 70%, transparent 100%)',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sprout style={{ width: 16, height: 16, color: '#3DFF8F' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>FLORA</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 800, color: '#3DFF8F', textShadow: '0 0 8px rgba(61,255,143,0.4)' }}>AI</span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: 220 }}>
              AI-powered plant disease intelligence for farms, labs, and greenhouses worldwide.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
              <span className="status-dot status-dot-green" style={{ width: 6, height: 6 }} />
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#3DFF8F', fontWeight: 600, letterSpacing: '0.08em' }}>
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>

          {/* Nav columns */}
          {columns.map(col => (
            <div key={col.heading}>
              <h4 style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em',
                color: '#A7F3D0', textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)', marginBottom: 16,
              }}>
                {col.heading}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(l => (
                  <li key={l.to + l.label}>
                    <Link
                      to={l.to}
                      style={{
                        fontSize: '0.875rem', color: '#E2E8F0',
                        textDecoration: 'none', transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#3DFF8F')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#E2E8F0')}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: 40, paddingTop: 24,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }} className="md:flex-row md:justify-between">
          <p style={{ fontSize: '0.75rem', color: '#A7F3D0', fontFamily: 'var(--font-mono)' }}>
            © {year} Flora AI. All rights reserved.
          </p>
          <p style={{ fontSize: '0.7rem', color: '#A7F3D0', opacity: 0.8, textAlign: 'center', maxWidth: 500, lineHeight: 1.6 }}>
            Flora AI provides diagnostic guidance for informational purposes only. Results should be verified by a qualified agricultural expert.
          </p>
        </div>
      </div>
    </footer>
  )
}
