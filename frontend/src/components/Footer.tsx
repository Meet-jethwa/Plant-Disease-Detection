// Footer.tsx — BioScan Lab dark minimal footer
import { Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

export function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  const columns = [
    {
      heading: t('footer.platform'),
      links: [
        { label: t('footer.scanner'), to: '/scan' },
        { label: t('footer.chat'), to: '/assistant' },
        { label: t('footer.plants'), to: '/plants' },
        { label: t('footer.encyclopedia'), to: '/library' },
      ],
    },
    {
      heading: t('footer.data'),
      links: [
        { label: t('footer.library'), to: '/library' },
        { label: t('footer.history'), to: '/history' },
        { label: t('footer.tools'), to: '/scan' },
      ],
    },
    {
      heading: t('footer.info'),
      links: [
        { label: t('footer.about'), to: '/' },
        { label: t('footer.contact'), to: '/' },
        { label: t('footer.privacy'), to: '/' },
        { label: t('footer.terms'), to: '/' },
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
              {t('footer.tagline')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
              <span className="status-dot status-dot-green" style={{ width: 6, height: 6 }} />
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#3DFF8F', fontWeight: 600, letterSpacing: '0.08em' }}>
                {t('footer.operational')}
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
            © {year} Flora AI. {t('footer.rights')}
          </p>
          <p style={{ fontSize: '0.7rem', color: '#A7F3D0', opacity: 0.8, textAlign: 'center', maxWidth: 500, lineHeight: 1.6 }}>
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  )
}
