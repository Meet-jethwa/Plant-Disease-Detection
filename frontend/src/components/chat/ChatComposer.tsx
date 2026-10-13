// ChatComposer.tsx — Single rounded 48px composer container with Web Speech recognition
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Mic, MicOff, Loader2, Info, ChevronDown,
  Check
} from 'lucide-react'
import { pressTap } from '../../lib/motion'
import { LANGUAGE_META } from '../../i18n/translations'

interface ChatComposerProps {
  input: string
  setInput: (value: string) => void
  onSend: (text: string) => void
  isSending: boolean
  isOnline: boolean
  lang: string
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
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true)
  const recognitionRef = useRef<any>(null)

  const crops = ['Rice', 'Wheat', 'Sugarcane', 'Cotton']

  // Auto-resize textarea (1 to 5 rows)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 130)
      textareaRef.current.style.height = `${Math.max(newHeight, 44)}px`
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
      recognition.lang = LANGUAGE_META[lang as keyof typeof LANGUAGE_META]?.bcp47 || 'en-IN'

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
        try { recognitionRef.current.abort() } catch (_) {}
      }
    }
  }, [lang, setInput])

  function toggleSpeech() {
    if (!recognitionRef.current) return
    if (isListening) {
      try { recognitionRef.current.stop() } catch (_) {}
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.lang = LANGUAGE_META[lang as keyof typeof LANGUAGE_META]?.bcp47 || 'en-IN'
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
      textareaRef.current.style.height = '44px'
    }
  }

  const hasText = input.trim().length > 0

  return (
    <div className="w-full space-y-2">
      
      {/* ── Top Bar above composer: Crop selector chip & Quick Chips ── */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
        
        {/* Selected Crop chip ("Rice ▾") */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCropMenu(!showCropMenu)}
            className="h-8 px-3 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/90 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
            aria-expanded={showCropMenu}
            aria-label="Select active crop context"
          >
            <span>{selectedCrop}</span>
            <ChevronDown className="w-3 h-3 text-emerald-700" />
          </button>

          {showCropMenu && (
            <div className="absolute bottom-9 left-0 z-30 bg-white border border-emerald-200 rounded-xl shadow-lg p-1.5 w-36 space-y-0.5">
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
                      ? 'bg-emerald-100 text-emerald-950 font-bold'
                      : 'hover:bg-emerald-50 text-stone-700'
                  }`}
                >
                  <span>{c}</span>
                  {selectedCrop.toLowerCase() === c.toLowerCase() && <Check className="w-3 h-3 text-emerald-700" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick follow-up chips */}
        {quickChips && quickChips.length > 0 && (
          <div className="flex items-center gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSend(chip.question)}
                className="h-8 px-3 rounded-full bg-white text-emerald-900 border border-emerald-200 text-xs font-semibold hover:bg-emerald-50 hover:border-emerald-400 whitespace-nowrap shadow-2xs transition-all cursor-pointer shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Listening Pill Indicator ── */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex items-center justify-between px-4 py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <span>Listening to voice in {LANGUAGE_META[lang as keyof typeof LANGUAGE_META]?.label || 'English'}…</span>
            </div>
            {/* Waveform bars */}
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-1 h-2 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-3 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Single Rounded Container (Radius 24, White, 1px green-200) ── */}
      <div className="relative rounded-3xl bg-white border border-emerald-200 shadow-xs focus-within:ring-2 focus-within:ring-emerald-600/30 focus-within:border-emerald-600 transition-all p-2 flex items-end gap-2">
        
        {/* Auto-growing Textarea — 16px font to prevent mobile auto-zoom */}
        <label htmlFor="assistant-textarea" className="sr-only">Ask FloraAI Advisor</label>
        <textarea
          id="assistant-textarea"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={!isOnline}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none px-3 py-2.5 text-base text-emerald-950 placeholder-stone-400 min-h-[44px] max-h-[130px] leading-relaxed scrollbar-none"
        />

        {/* 48px Mic Button (Left of send) */}
        {hasSpeechSupport && (
          <motion.button
            whileTap={pressTap}
            type="button"
            onClick={toggleSpeech}
            disabled={!isOnline}
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isListening
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-300 shadow-md'
                : 'text-stone-500 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
            aria-label={isListening ? 'Stop listening voice input' : 'Start voice input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>
        )}

        {/* 48px Send Button */}
        <motion.button
          whileTap={pressTap}
          type="button"
          onClick={handleFormSubmit}
          disabled={!hasText || isSending || !isOnline}
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            hasText && isOnline && !isSending
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
              : 'bg-emerald-100/70 text-stone-400 cursor-not-allowed'
          }`}
          aria-label="Send query"
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin text-emerald-800" />
          ) : (
            <Send className="w-5 h-5 ml-0.5" />
          )}
        </motion.button>
      </div>

      {/* ── Disclaimer (One 12px line below with "i" icon, >= 4.5:1 contrast) ── */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-stone-600 px-2 pt-0.5">
        <Info className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
        <span className="truncate">{disclaimer}</span>
      </div>

    </div>
  )
}
