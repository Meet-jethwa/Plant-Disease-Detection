// Footer.tsx — FloraAI Professional SaaS footer
import { Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  const columns = [
    {
      heading: 'Product',
      links: [
        { label: 'Plant Scanner', to: '/scan' },
        { label: 'AI Chat', to: '/assistant' },
        { label: 'My Plants', to: '/plants' },
        { label: 'Encyclopedia', to: '/library' },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { label: 'Disease Library', to: '/library' },
        { label: 'Scan History', to: '/history' },
        { label: 'Plant Care', to: '/plants' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About FloraAI', to: '/' },
        { label: 'Contact', to: '/' },
        { label: 'Privacy', to: '/' },
        { label: 'Terms', to: '/' },
      ],
    },
  ]

  return (
    <footer className="border-t border-[#E0EBE4] bg-white mt-8">
      <div className="max-w-[1280px] mx-auto px-6 xl:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#159A70] flex items-center justify-center shadow-sm">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-base text-[#17211D]">Flora</span>
                <span className="font-bold text-base text-[#159A70]">AI</span>
              </div>
            </div>
            <p className="text-xs text-[#66736C] leading-relaxed max-w-[180px]">
              Smart Plant Diagnostics. AI-powered disease detection for farmers and gardeners.
            </p>
          </div>

          {/* Nav columns */}
          {columns.map(col => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold text-[#17211D] uppercase tracking-widest mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.to + l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-[#66736C] hover:text-[#159A70] transition-colors"
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
        <div className="border-t border-[#EEF4EE] mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#96A39D]">
            &copy; {year} FloraAI. All rights reserved.
          </p>
          <p className="text-[11px] text-[#96A39D] text-center max-w-lg leading-relaxed">
            FloraAI provides diagnostic guidance for informational purposes. Results should be verified by a qualified agricultural expert. AI confidence indicates pattern similarity, not absolute certainty.
          </p>
        </div>
      </div>
    </footer>
  )
}
