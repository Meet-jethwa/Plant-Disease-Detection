// ChatComposer.tsx — Unified rounded composer container
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Send, Mic, MicOff, Loader2, Info, ChevronDown, Check
} from 'lucide-react'
import { pressTap } from '../../lib/motion'
import { LANGUAGE_META, type LangCode } from '../../i18n/translations'

interface ChatComposerProps {
  input: string
  setInput: (value: string) => void
  onSend: (text: string) => void
  isSending: boolean
  isOnline: boolean
  lang: LangCode
  placeholder?: string
  disclaimer?: string
  quickChips?: Array<{ label: string; question: string }>
  selectedCrop?: string
  onSelectCrop?: (crop: string) => void
}

export function ChatComposer({
  input,
  setInput,
  onSend,
  isSending,
  isOnline,
  lang,
  placeholder = 'Ask about irrigation, moisture, fertilizer, or crop stage…',
  disclaimer = 'Advice generated using AI agro-climatic intelligence. Always verify with local agronomy officers.',
  quickChips,
  selectedCrop = 'Rice',
  onSelectCrop,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [showCropMenu, setShowCropMenu] = useState(false)
  const [, setHasSpeechSupport] = useState(true)
  const recognitionRef = useRef<any>(null)

  const crops = ['Rice', 'Wheat', 'Sugarcane', 'Cotton']

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120)
      textareaRef.current.style.height = `${Math.max(newHeight, 36)}px`
    }
  }, [input])

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setHasSpeechSupport(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = LANGUAGE_META[lang]?.bcp47 || 'en-IN'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)

      recognition.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (transcript) {
          setInput(transcript)
        }
      }

      recognitionRef.current = recognition
    } catch {
      setHasSpeechSupport(false)
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch {}
      }
    }
  }, [lang, setInput])

  function toggleSpeech() {
    if (!recognitionRef.current) return
    if (isListening) {
      try { recognitionRef.current.stop() } catch {}
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.lang = LANGUAGE_META[lang]?.bcp47 || 'en-IN'
        recognitionRef.current.start()
      } catch {
        setIsListening(false)
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleFormSubmit()
    }
  }

  function handleFormSubmit() {
    const trimmed = input.trim()
    if (!trimmed || isSending || !isOnline) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px'
    }
  }

  const hasText = input.trim().length > 0

  return (
    <div className="w-full space-y-3">
      {/* ── Contextual Quick Chips (if available) ── */}
      {quickChips && quickChips.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSend(chip.question)}
              className="px-3 py-1.5 rounded-full bg-white border border-[var(--color-green-200)] text-xs font-medium text-[var(--color-ink-2)] hover:border-[var(--color-green-500)] hover:text-[var(--color-green-700)] transition-colors whitespace-nowrap min-h-[36px] cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Unified Rounded Composer Container ── */}
      <div className="bg-white rounded-2xl border border-[var(--color-green-200)] shadow-sm focus-within:border-[var(--color-green-600)] focus-within:ring-2 focus-within:ring-[var(--color-green-600)]/15 transition-all p-2 sm:p-3">
        {/* Top inner row: Crop selector pill */}
        <div className="flex items-center justify-between pb-1 px-1">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCropMenu(!showCropMenu)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-green-50)] text-[var(--color-green-700)] border border-[var(--color-green-200)] text-xs font-semibold hover:bg-[var(--color-green-100)] transition-colors cursor-pointer"
              aria-expanded={showCropMenu}
              aria-label="Select active crop context"
            >
              <span>{selectedCrop}</span>
              <ChevronDown className="w-3 h-3 text-[var(--color-green-700)]" />
            </button>

            {showCropMenu && (
              <div className="absolute bottom-full mb-1 left-0 z-30 bg-white border border-[var(--color-green-200)] rounded-xl shadow-lg p-1.5 w-36 space-y-0.5">
                {crops.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onSelectCrop?.(c)
                      setShowCropMenu(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      selectedCrop.toLowerCase() === c.toLowerCase()
                        ? 'bg-[var(--color-green-50)] text-[var(--color-green-700)]'
                        : 'text-[var(--color-ink)] hover:bg-[var(--color-green-50)]'
                    }`}
                  >
                    <span>{c}</span>
                    {selectedCrop.toLowerCase() === c.toLowerCase() && (
                      <Check className="w-3 h-3 text-[var(--color-green-700)]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Text input area and buttons in one flow */}
        <div className="flex items-end gap-2 pt-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending || !isOnline}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none bg-transparent border-0 outline-none p-1 text-sm sm:text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink-2)]/60 min-h-[36px] max-h-32 leading-relaxed"
          />

          <div className="flex items-center gap-1 shrink-0 pb-0.5">
            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleSpeech}
              className={`w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center transition-colors cursor-pointer border ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-transparent text-[var(--color-ink-2)] hover:bg-[var(--color-green-50)] hover:text-[var(--color-green-700)] border-transparent'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <motion.button
              whileTap={pressTap}
              type="button"
              onClick={handleFormSubmit}
              disabled={!hasText || isSending || !isOnline}
              className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-[var(--color-green-700)] text-white hover:bg-[var(--color-green-800)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer border-none"
              aria-label="Send query"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Disclaimer Line with Generous Spacing ── */}
      <div className="flex items-center justify-center gap-1.5 text-center text-sm text-[var(--color-ink-2)]/90 px-2">
        <Info className="w-3.5 h-3.5 shrink-0 opacity-70" />
        <p className="line-clamp-1">{disclaimer}</p>
      </div>
    </div>
  )
}
