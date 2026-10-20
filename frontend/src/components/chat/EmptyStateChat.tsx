// EmptyStateChat.tsx — Centered responsive empty state with 2x2 contextual suggestion cards
import { motion, type Variants } from 'framer-motion'
import { Leaf, Droplets, Sprout, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react'
import { pressTap } from '../../lib/motion'
import { useLang } from '../../contexts/LanguageContext'
import { localizeDiseaseName } from '../../i18n/translations'
import type { PredictionResponse, LocationContextData } from '../../types'

interface EmptyStateChatProps {
  onSelectSuggestion: (question: string) => void
  headline: string
  subtitle?: string
  latestPrediction?: PredictionResponse | null
  locationData?: LocationContextData | null
}

export function EmptyStateChat({
  onSelectSuggestion,
  headline,
  subtitle = 'Ask about irrigation, moisture, fertilizer, or crop stage…',
  latestPrediction,
  locationData,
}: EmptyStateChatProps) {
  const { t, lang } = useLang()

  const isRainy = locationData?.weather?.condition?.toLowerCase().includes('rain') ||
    (locationData?.weather?.rainfall_mm ?? 0) > 2

  const diseaseRaw = latestPrediction?.predicted_class?.replace(/_/g, ' ')
  const disease = diseaseRaw ? localizeDiseaseName(diseaseRaw, lang) : undefined

  // Contextual suggestion cards
  const suggestions = [
    ...(disease ? [{
      icon: AlertCircle,
      title: `${t('chat.treatTitle')}: ${disease}`,
      question: `${disease}: ${t('chat.treatQuestion')}`,
    }] : isRainy ? [{
      icon: Droplets,
      title: t('chat.irrigationRainTitle'),
      question: t('chat.irrigationRainQuestion'),
    }] : [{
      icon: Droplets,
      title: t('chat.irrigationTitle'),
      question: t('chat.irrigationQuestion'),
    }]),
    {
      icon: Sprout,
      title: t('chat.fertilizerTitle'),
      question: t('chat.fertilizerQuestion'),
    },
    {
      icon: Leaf,
      title: t('chat.yellowingTitle'),
      question: t('chat.yellowingQuestion'),
    },
    {
      icon: HelpCircle,
      title: t('chat.dripTitle'),
      question: t('chat.dripQuestion'),
    },
  ]

  const containerVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  }

  const itemVariants: Variants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="my-auto py-6 sm:py-8 flex flex-col items-center text-center max-w-[720px] mx-auto px-4 w-full"
    >
      {/* Icon: 64px badge followed by 24px spacing */}
      <motion.div
        variants={itemVariants}
        className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-6 shadow-xs"
      >
        <Leaf className="w-8 h-8" />
      </motion.div>

      {/* Headline: 28px font followed by 12px spacing */}
      <motion.h2
        variants={itemVariants}
        className="text-[28px] font-extrabold text-emerald-950 tracking-tight leading-tight mb-3"
      >
        {headline}
      </motion.h2>

      {/* Subtitle: 16px font followed by 32px spacing */}
      <motion.p
        variants={itemVariants}
        className="text-[16px] text-emerald-900/70 mb-8 max-w-lg leading-normal"
      >
        {subtitle}
      </motion.p>

      {/* Suggestion Cards: 16px gap, min 64px height, 1 column below 640px, full question on up to 2 lines */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
      >
        {suggestions.map((s, idx) => {
          const Icon = s.icon
          return (
            <motion.button
              key={idx}
              variants={itemVariants}
              whileTap={pressTap}
              type="button"
              onClick={() => onSelectSuggestion(s.question)}
              className="min-h-[64px] p-4 rounded-2xl bg-white border border-emerald-200/90 hover:border-emerald-500 hover:bg-emerald-50/50 shadow-xs hover:shadow-md transition-all text-left flex items-start justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block text-sm sm:text-base font-bold text-emerald-950 group-hover:text-emerald-800 transition-colors mb-0.5">
                    {s.title}
                  </span>
                  <span className="block text-[16px] leading-snug text-stone-600 line-clamp-2">
                    {s.question}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-700/60 group-hover:text-emerald-800 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </motion.button>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
