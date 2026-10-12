import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import { LANGUAGE_META, type LangCode } from '../i18n/translations'

export function LanguageSelector({ compact = false, variant = 'dark' }: { compact?: boolean, variant?: 'dark' | 'light' }) {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentMeta = LANGUAGE_META[lang] || LANGUAGE_META.en

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer ${
          compact
            ? 'px-2.5 py-1.5 text-xs bg-[var(--color-green-50)] border-[var(--color-green-200)] text-[var(--color-green-700)] hover:bg-[var(--color-green-100)] font-medium'
            : variant === 'light'
            ? 'px-2.5 py-1.5 text-xs bg-[#F0FAF4] border-[#0B8F68]/20 text-[#0B8F68] hover:bg-[#DDF3E8] shadow-sm font-medium'
            : 'px-2.5 py-1.5 text-xs bg-white/15 border-white/25 text-white hover:bg-white/25 shadow-sm'
        }`}
        aria-label="Select Language"
      >
        <Globe className={`w-3.5 h-3.5 ${compact || variant === 'light' ? 'text-[var(--color-green-700)]' : 'text-[#3DFF8F]'}`} />
        <span className="font-semibold">{currentMeta.flag} {currentMeta.nativeName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''} ${compact || variant === 'light' ? 'text-[var(--color-green-700)]/70' : 'text-white/70'}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white shadow-xl border border-[#E0EBE4] py-1.5 z-50 animate-fade-in text-slate-800">
          <div className="px-3 py-1 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Select Language
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {(Object.keys(LANGUAGE_META) as LangCode[]).map((code) => {
              const meta = LANGUAGE_META[code]
              const selected = code === lang
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setLang(code)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    selected ? 'bg-[#F0FAF4] text-[#0B8F68] font-bold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{meta.flag}</span>
                    <span>{meta.nativeName}</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">({meta.label})</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
