// Footer.tsx — FloraAI clean dark footer
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
        { label: t('footer.scanner'),     to: '/scan' },
        { label: t('footer.chat'),        to: '/assistant' },
        { label: t('footer.plants'),      to: '/plants' },
        { label: t('footer.encyclopedia'), to: '/library' },
      ],
    },
    {
      heading: t('footer.data'),
      links: [
        { label: t('footer.library'), to: '/library' },
        { label: t('footer.history'), to: '/history' },
        { label: t('footer.tools'),   to: '/scan' },
      ],
    },
    {
      heading: t('footer.info'),
      links: [
        { label: t('footer.about'),   to: '/' },
        { label: t('footer.contact'), to: '/' },
        { label: t('footer.privacy'), to: '/' },
        { label: t('footer.terms'),   to: '/' },
      ],
    },
  ]

  return (
    <footer className="mt-10 border-t border-white/12 relative overflow-hidden text-white bg-gradient-to-b from-[var(--color-nav-bg)] to-[var(--color-nav-bg-2)]">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-green-500)] to-transparent opacity-50" />

      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/18 border border-white/30 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-green-200" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-[15px] font-bold text-white">Flora</span>
                <span className="text-[15px] font-bold text-green-200">AI</span>
              </div>
            </div>
            <p className="text-sm text-green-100/90 leading-relaxed max-w-[220px]">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Nav columns */}
          {columns.map(col => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold text-green-200 mb-4">
                {col.heading}
              </h4>
              <ul className="list-none flex flex-col gap-2.5">
                {col.links.map(l => (
                  <li key={l.to + l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-white/90 no-underline transition-colors hover:text-white"
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
        <div className="border-t border-white/12 mt-10 pt-6 flex flex-col md:flex-row md:justify-between items-center gap-2.5">
          <p className="text-sm text-green-100/85">
            © {year} Flora AI. {t('footer.rights')}
          </p>
          <p className="text-sm text-green-100/80 text-center max-w-[500px] leading-relaxed">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  )
}
