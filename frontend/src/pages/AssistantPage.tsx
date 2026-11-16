// AssistantPage.tsx — FloraAI Conversational Field & Crop Advisor
import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf, Clock, ArrowDown, WifiOff,
  AlertTriangle, RotateCcw, CloudSun
} from 'lucide-react'
import type { ChatMessage, PredictionResponse, LocationContextData } from '../types'
import { useLang } from '../contexts/LanguageContext'
import { LANGUAGE_META } from '../i18n/translations'
import { EmptyStateChat } from '../components/chat/EmptyStateChat'
import { MessageBubble } from '../components/chat/MessageBubble'
import { ChatComposer } from '../components/chat/ChatComposer'
import { HistoryDrawer } from '../components/chat/HistoryDrawer'

interface AssistantPageProps {
  chat: ChatMessage[]
  onAskAssistant: (question: string) => Promise<void>
  isAsking: boolean
  latestPrediction: PredictionResponse | null
  locationData?: LocationContextData | null
  diagnosisId?: string | null
}

const LOCAL_COPY: Record<string, {
  title: string
  emptyHeadline: string
  emptySubtitle: string
  placeholder: string
  disclaimer: string
  offlineMsg: string
  retry: string
  takingLonger: string
}> = {
  en: {
    title: 'FloraAI Advisor',
    emptyHeadline: 'How can I help with your crop today?',
    emptySubtitle: 'Ask about irrigation, moisture, fertilizer, or crop stage…',
    placeholder: 'Ask about irrigation, moisture, fertilizer, or crop stage…',
    disclaimer: 'Advice generated using AI agro-climatic intelligence. Always verify with local agronomy officers.',
    offlineMsg: "You're offline — messages will send when you reconnect.",
    retry: 'Retry',
    takingLonger: 'Taking longer than usual — still trying…',
  },
  hi: {
    title: 'फ्लोरा-AI सलाहकार',
    emptyHeadline: 'मैं आज आपकी फसल में कैसे मदद कर सकता हूँ?',
    emptySubtitle: 'सिंचाई, नमी, खाद या फसल की अवस्था के बारे में पूछें…',
    placeholder: 'सिंचाई, नमी, खाद या फसल की अवस्था के बारे में पूछें…',
    disclaimer: 'सलाह AI और स्थानीय कृषि-मौसम डेटा पर आधारित है। स्थानीय विशेषज्ञों से पुष्टि करें।',
    offlineMsg: 'आप ऑफ़लाइन हैं — इंटरनेट जुड़ने पर संदेश भेजे जाएंगे।',
    retry: 'फिर प्रयास करें',
    takingLonger: 'उत्तर में सामान्य से अधिक समय लग रहा है — प्रयास जारी है…',
  },
  gu: {
    title: 'ફ્લોરા-AI સલાહકાર',
    emptyHeadline: 'હું આજે તમારા પાકમાં કેવી રીતે મદદ કરી શકું?',
    emptySubtitle: 'પિયત, ભેજ, ખાતર અથવા પાકની સ્થિતિ વિશે પૂછો…',
    placeholder: 'પિયત, ભેજ, ખાતર અથવા પાકની સ્થિતિ વિશે પૂછો…',
    disclaimer: 'સલાહ AI અને સ્થાનિક હવામાન ડેટા પર આધારિત છે. સ્થાનિક નિષ્ણાતો સાથે પુષ્ટિ કરો.',
    offlineMsg: 'તમે ઑફલાઇન છો — ઇન્ટરનેટ જોડાણ પછી મોકલાશે.',
    retry: 'ફરી પ્રયાસ',
    takingLonger: 'સામાન્ય કરતાં વધુ સમય લાગી રહ્યો છે…',
  },
  mr: {
    title: 'फ्लोरा-AI सल्लागार',
    emptyHeadline: 'मी आज आपल्या पिकासाठी कशी मदत करू शकतो?',
    emptySubtitle: 'पाणी नियोजन, खत किंवा पीक अवस्थेबद्दल विचारा…',
    placeholder: 'पाणी नियोजन, खत किंवा पीक अवस्थेबद्दल विचारा…',
    disclaimer: 'सल्ला AI आणि स्थानिक कृषी-हवामान डेटावर आधारित आहे. तज्ञांशी खात्री करा.',
    offlineMsg: 'तुम्ही ऑफलाइन आहात — इंटरनेट जोडणीनंतर पाठवले जाईल.',
    retry: 'पुन्हा प्रयत्न',
    takingLonger: 'नेहमीपेक्षा जास्त वेळ लागत आहे…',
  },
  ta: {
    title: 'ஃப்ளோரா-AI ஆலோசகர்',
    emptyHeadline: 'இன்று உங்கள் பயிருக்கு நான் எவ்வாறு உதவ முடியும்?',
    emptySubtitle: 'நீர்ப்பாசனம், உரம் அல்லது பயிர் நிலை பற்றி கேளுங்கள்…',
    placeholder: 'நீர்ப்பாசனம், உரம் அல்லது பயிர் நிலை பற்றி கேளுங்கள்…',
    disclaimer: 'ஆலோசனை AI மற்றும் உள்ளூர் வானிலை தரவு அடிப்படையிலானது.',
    offlineMsg: 'நீங்கள் ஆஃப்லைனில் உள்ளீர்கள் — இணையம் இணைந்ததும் அனுப்பப்படும்.',
    retry: 'மீண்டும் முயற்சி',
    takingLonger: 'வழக்கத்தை விட அதிக நேரம் எடுக்கிறது…',
  },
  te: {
    title: 'ఫ్లోరా-AI సలహాదారు',
    emptyHeadline: 'నేను నేడు మీ పంటకు ఎలా సహాయం చేయగలను?',
    emptySubtitle: 'నీటిపారుదల, ఎరువులు లేదా పంట దశ గురించి అడగండి…',
    placeholder: 'నీటిపారుదల, ఎరువులు లేదా పంట దశ గురించి అడగండి…',
    disclaimer: 'సలహా AI మరియు స్థానిక వాతావరణ ఆధారితమైనది.',
    offlineMsg: 'మీరు ఆఫ్‌లైన్‌లో ఉన్నారు — కనెక్షన్ వచ్చినప్పుడు పంపబడుతుంది.',
    retry: 'మళ్ళీ ప్రయత్నించు',
    takingLonger: 'సాధారణం కంటే ఎక్కువ సమయం తీసుకుంటోంది…',
  },
  bn: {
    title: 'ফ্লোরা-AI উপদেষ্টা',
    emptyHeadline: 'আজ আমি আপনার ফসলে কীভাবে সাহায্য করতে পারি?',
    emptySubtitle: 'সেচ, আর্দ্রতা, সার বা ফসলের পর্যায় সম্পর্কে জিজ্ঞাসা করুন…',
    placeholder: 'সেচ, আর্দ্রতা, সার বা ফসলের পর্যায় সম্পর্কে জিজ্ঞাসা করুন…',
    disclaimer: 'পরামর্শ এআই ও স্থানীয় কৃষি-আবহাওয়ার তথ্যের ওপর ভিত্তি করে।',
    offlineMsg: 'আপনি অফলাইনে আছেন — ইন্টারনেট সংযোগ হলে পাঠানো হবে।',
    retry: 'পুনরায় চেষ্টা',
    takingLonger: 'স্বাভাবিকের চেয়ে বেশি সময় লাগছে…',
  },
  pa: {
    title: 'ਫਲੋਰਾ-AI ਸਲਾਹਕਾਰ',
    emptyHeadline: 'ਮੈਂ ਅੱਜ ਤੁਹਾਡੀ ਫਸਲ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
    emptySubtitle: 'ਸਿੰਚਾਈ, ਨਮੀ, ਖਾਦ ਜਾਂ ਫਸਲ ਦੇ ਪੜਾਅ ਬਾਰੇ ਪੁੱਛੋ…',
    placeholder: 'ਸਿੰਚਾਈ, ਨਮੀ, ਖਾਦ ਜਾਂ ਫਸਲ ਦੇ ਪੜਾਅ ਬਾਰੇ ਪੁੱਛੋ…',
    disclaimer: 'ਸਲਾਹ AI ਅਤੇ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਮੌਸਮ ਡੇਟਾ ਤੇ ਆਧਾਰਿਤ ਹੈ।',
    offlineMsg: 'ਤੁਸੀਂ ਔਫਲਾਈਨ ਹੋ — ਇੰਟਰਨੈਟ ਜੁੜਨ ਤੇ ਭੇਜਿਆ ਜਾਵੇਗਾ।',
    retry: 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼',
    takingLonger: 'ਆਮ ਨਾਲੋਂ ਵੱਧ ਸਮਾਂ ਲੱਗ ਰਿਹਾ ਹੈ…',
  },
}

export function AssistantPage({
  chat,
  onAskAssistant,
  isAsking,
  latestPrediction,
  locationData,
}: AssistantPageProps) {
  const { lang, t } = useLang()
  const copy = LOCAL_COPY[lang] || LOCAL_COPY.en

  const [input, setInput] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [selectedCrop, setSelectedCrop] = useState(latestPrediction?.crop || 'Rice')
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [takingLonger, setTakingLonger] = useState(false)
  const [lastQuery, setLastQuery] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 15-second loading watchdog for 3G / slow network
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (isAsking) {
      setTakingLonger(false)
      timer = setTimeout(() => {
        setTakingLonger(true)
      }, 15000)
    } else {
      setTakingLonger(false)
    }
    return () => clearTimeout(timer)
  }, [isAsking])

  // Extract session queries for history
  const sessionQueries = useMemo(() => {
    return chat
      .filter((m) => m.role === 'user')
      .map((m) => m.text)
  }, [chat])

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-scroll on new messages
  useEffect(() => {
    if (!showScrollBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chat, isAsking, showScrollBottom])

  // Handle scroll to show/hide jump-to-bottom button
  function handleScroll() {
    if (!messagesContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 180
    setShowScrollBottom(isScrolledUp)
  }

  // Text to speech handler
  function handleToggleSpeak(text: string, index: number) {
    if (speakingIndex === index) {
      window.speechSynthesis.cancel()
      setSpeakingIndex(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*#_`•]/g, '').trim()
    if (!cleanText) return

    const bcp47 = LANGUAGE_META[lang]?.bcp47 || 'en-IN'
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = bcp47
    utterance.rate = 0.95

    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find((v) => v.lang === bcp47)
      ?? voices.find((v) => v.lang.startsWith(bcp47.split('-')[0]))
    if (voice) utterance.voice = voice

    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)

    setSpeakingIndex(index)
    window.speechSynthesis.speak(utterance)
  }

  // Copy handler
  function handleCopy(text: string, index: number) {
    void navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Send message
  async function handleSend(text: string) {
    if (!text.trim() || isAsking) return
    setErrorMsg(null)
    setLastQuery(text)
    setShowScrollBottom(false)
    try {
      await onAskAssistant(text)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not reach agronomy assistant. Please check connection and try again.')
    }
  }

  // Contextual quick chips after an AI message
  const quickChips = useMemo(() => {
    if (chat.length <= 1) return []
    return [
      { label: t('chat.simpler'), question: t('chat.simplerQ') },
      { label: t('chat.steps'), question: t('chat.stepsQ') },
      { label: t('chat.organic'), question: t('chat.organicQ') },
    ]
  }, [chat, t])

  // Weather chip string (quiet secondary element)
  const tempVal = locationData?.weather?.temperature_c ? `${locationData.weather.temperature_c.toFixed(0)}°C` : '31°C'
  const conditionVal = locationData?.weather?.condition || 'Overcast'
  const weatherQuestion = useMemo(() => {
    if (lang === 'hi') {
      return `आज के मौसम (${conditionVal}, ${tempVal}) के बाद फसल की सिंचाई और देखभाल के लिए मुझे क्या करना चाहिए?`
    }
    return `What should I do about crop irrigation and protection after today's weather (${conditionVal}, ${tempVal})?`
  }, [conditionVal, tempVal, lang])

  const isOnlyWelcome = sessionQueries.length === 0

  return (
    <div className="flex flex-col h-full max-h-full min-h-0 bg-[var(--color-bg)] overflow-hidden select-text relative w-full">
      
      {/* ── Header: Centered Max-Width Column (~720px) ── */}
      <header className="h-14 sm:h-16 bg-white border-b border-[var(--color-green-100)] shrink-0 z-20 shadow-xs">
        <div className="max-w-[720px] mx-auto w-full h-full px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[var(--color-green-100)] flex items-center justify-center text-[var(--color-green-700)] shrink-0">
              <Leaf className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-[var(--color-ink)] truncate leading-tight">
                {copy.title}
              </h1>
              <p className="text-xs text-[var(--color-ink-2)] truncate hidden sm:block">
                Field intelligence & disease protocols
              </p>
            </div>
          </div>

          {/* Right side: Quiet secondary weather chip + History button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSend(weatherQuestion)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--color-green-50)] text-[var(--color-green-700)] border border-[var(--color-green-200)] text-xs font-medium hover:bg-[var(--color-green-100)] transition-colors cursor-pointer min-h-[36px]"
              aria-label={`Ask weather advice: ${weatherQuestion}`}
              title="Tap for weather context advice"
            >
              <CloudSun className="w-3.5 h-3.5 text-[var(--color-green-700)] shrink-0" />
              <span>{tempVal} · {conditionVal}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="h-9 px-3 rounded-xl border border-[var(--color-green-200)] hover:border-[var(--color-green-400)] bg-white hover:bg-[var(--color-green-50)] text-[var(--color-ink)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px] shrink-0"
              aria-label="Open conversation history panel"
            >
              <Clock className="w-3.5 h-3.5 text-[var(--color-ink-2)] shrink-0" />
              <span className="hidden sm:inline">History</span>
              {sessionQueries.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[var(--color-green-700)] text-white text-xs flex items-center justify-center font-bold">
                  {sessionQueries.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Offline Banner ── */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[var(--color-warn)] text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 shrink-0 z-10 shadow-xs"
          >
            <WifiOff className="w-4 h-4" />
            <span>{copy.offlineMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Message Area (Centered max-w-[720px], generous 16-24px rhythm) ── */}
      <main
        ref={messagesContainerRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col items-center min-h-0"
      >
        <div className="w-full max-w-[720px] flex-1 flex min-h-0 flex-col justify-center">
          
          {isOnlyWelcome ? (
            <EmptyStateChat
              headline={copy.emptyHeadline}
              subtitle={copy.emptySubtitle}
              latestPrediction={latestPrediction}
              locationData={locationData}
              onSelectSuggestion={handleSend}
            />
          ) : (
            <div className="space-y-4 pb-4">
              {chat.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  message={msg}
                  index={idx}
                  isSpeaking={speakingIndex === idx}
                  onToggleSpeak={handleToggleSpeak}
                  onCopy={handleCopy}
                  isCopied={copiedIndex === idx}
                  onAsk={handleSend}
                  latestPrediction={latestPrediction}
                />
              ))}

              {/* Typing State indicator */}
              {isAsking && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 my-3 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-green-100)] text-[var(--color-green-700)] flex items-center justify-center shrink-0 mt-1">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-[var(--color-green-200)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 h-5">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-green-600)] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[var(--color-green-600)] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[var(--color-green-600)] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p className="text-xs text-[var(--color-ink-2)] font-medium">
                      Checking local conditions & generating agro advice…
                    </p>
                    {takingLonger && (
                      <div className="pt-2 border-t border-[var(--color-green-100)] flex items-center gap-2 text-xs text-[var(--color-warn)]">
                        <span>{copy.takingLonger}</span>
                        <button
                          type="button"
                          onClick={() => handleSend(lastQuery)}
                          className="font-bold underline text-[var(--color-green-700)] cursor-pointer"
                        >
                          {copy.retry}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Error card with Retry */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger)] flex items-start gap-3 my-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-sm mb-0.5">Response Generation Error</p>
                    <p className="text-[var(--color-ink-2)] mb-2">{errorMsg}</p>
                    <button
                      type="button"
                      onClick={() => handleSend(lastQuery)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-danger)] hover:opacity-90 text-white font-bold inline-flex items-center gap-1.5 transition-opacity cursor-pointer border-none"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{copy.retry}</span>
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

        </div>
      </main>

      {/* ── "Jump to Latest" Floating Button ── */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            type="button"
            onClick={scrollToBottom}
            className="fixed bottom-36 sm:bottom-32 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-[var(--color-green-900)] text-white shadow-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[var(--color-green-950)] transition-all cursor-pointer border-none"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>{t('assistant.jumpToLatest')}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Composer Container (Centered max-w-[720px], generous padding) ── */}
      <footer className="w-full bg-white/95 backdrop-blur-md border-t border-[var(--color-green-100)] px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 sm:py-4 shrink-0 z-20 flex justify-center">
        <div className="w-full max-w-[720px]">
          <ChatComposer
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isSending={isAsking}
            isOnline={isOnline}
            lang={lang}
            placeholder={copy.placeholder}
            disclaimer={copy.disclaimer}
            quickChips={quickChips}
            selectedCrop={selectedCrop}
            onSelectCrop={setSelectedCrop}
          />
        </div>
      </footer>

      {/* ── History Drawer ── */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessionQueries={sessionQueries}
        onSelectQuery={handleSend}
        onNewChat={() => {
          setInput('')
          setErrorMsg(null)
        }}
        onClearSession={() => {
          setInput('')
        }}
      />

    </div>
  )
}
