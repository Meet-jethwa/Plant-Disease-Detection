import { useState, useRef, useEffect, useCallback } from 'react'
import { Globe, ChevronDown, Check, X } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import { LANGUAGES, type LangCode } from '../i18n/languages'

interface LanguageSelectorProps {
  compact?: boolean
  variant?: 'dark' | 'light'
}

export function LanguageSelector({ compact = false, variant = 'dark' }: LanguageSelectorProps) {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)

  const activeLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0]

  const closeDropdown = useCallback(() => {
    setOpen(false)
    setFocusedIndex(-1)
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown()
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, closeDropdown])

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
        setFocusedIndex(LANGUAGES.findIndex(l => l.code === lang))
      }
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      closeDropdown()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(prev => (prev + 1) % LANGUAGES.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => (prev - 1 + LANGUAGES.length) % LANGUAGES.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (focusedIndex >= 0 && focusedIndex < LANGUAGES.length) {
        setLang(LANGUAGES[focusedIndex].code)
        closeDropdown()
      }
    }
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} onKeyDown={handleKeyDown}>
      {/* Trigger Button: Closed button shows active native name (not code) + globe icon */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select Language"
        className={`flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
          compact
            ? 'px-2.5 py-1.5 text-xs bg-[var(--color-green-50)] border-[var(--color-green-200)] text-[var(--color-green-700)] hover:bg-[var(--color-green-100)]'
            : variant === 'light'
            ? 'px-2.5 py-1.5 text-xs bg-[#F0FAF4] border-[#0B8F68]/20 text-[#0B8F68] hover:bg-[#DDF3E8] shadow-sm'
            : 'px-2.5 py-1.5 text-xs bg-white/15 border-white/25 text-white hover:bg-white/25 shadow-sm'
        }`}
      >
        <Globe className={`w-3.5 h-3.5 flex-shrink-0 ${compact || variant === 'light' ? 'text-[var(--color-green-700)]' : 'text-[#3DFF8F]'}`} />
        <span className="font-semibold text-xs tracking-wide" lang={activeLang.code}>
          {activeLang.native}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''} ${compact || variant === 'light' ? 'text-[var(--color-green-700)]/70' : 'text-white/70'}`} />
      </button>

      {/* Desktop Dropdown & Mobile Bottom Sheet */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-50 md:hidden animate-fade-in"
            onClick={closeDropdown}
          />

          {/* Container: Bottom Sheet on Mobile, Popover on Desktop */}
          <div
            ref={listboxRef}
            role="listbox"
            aria-label="Languages"
            className={`
              fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl p-3 border-t border-slate-200
              md:absolute md:bottom-auto md:top-full md:left-auto md:right-0 md:mt-1.5 md:w-56 md:rounded-xl md:shadow-xl md:border md:border-[#E0EBE4] md:p-1.5
              animate-fade-in text-slate-800 max-h-[80vh] md:max-h-80 overflow-y-auto
            `}
          >
            {/* Mobile handle & header */}
            <div className="flex md:hidden items-center justify-between px-3 pb-2 pt-1 border-b border-gray-100">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Language</div>
              <button
                type="button"
                onClick={closeDropdown}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-1 space-y-0.5">
              {LANGUAGES.map((l, index) => {
                const isSelected = l.code === lang
                const isFocused = index === focusedIndex

                return (
                  <button
                    key={l.code}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    lang={l.code}
                    onClick={() => {
                      setLang(l.code as LangCode)
                      closeDropdown()
                    }}
                    className={`
                      w-full text-left px-3 py-2.5 md:py-2 rounded-lg text-sm flex items-center justify-between transition-colors
                      min-h-[48px] md:min-h-[40px] cursor-pointer
                      ${isSelected ? 'bg-[#F0FAF4] text-[#0B8F68] font-semibold' : 'text-slate-700 hover:bg-slate-50'}
                      ${isFocused ? 'ring-2 ring-[#0B8F68]/30' : ''}
                    `}
                    style={{ fontFamily: l.font }}
                  >
                    <div className="flex flex-col text-left">
                      {/* Native name primary label */}
                      <span className="text-sm font-bold text-slate-900 tracking-wide">
                        {l.native}
                      </span>
                      {/* English name secondary label */}
                      {l.code !== 'en' && (
                        <span className="text-[11px] text-slate-400 font-sans font-normal">
                          {l.english}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#0B8F68] flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
