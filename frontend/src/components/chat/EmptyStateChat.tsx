// EmptyStateChat.tsx — Centered responsive empty state with 2x2 contextual suggestion cards
import { motion } from 'framer-motion'
import { Leaf, Droplets, Sprout, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react'
import { pressTap } from '../../lib/motion'
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
  
  const isRainy = locationData?.weather?.condition?.toLowerCase().includes('rain') ||
    (locationData?.weather?.rainfall_mm ?? 0) > 2

  const disease = latestPrediction?.predicted_class?.replace(/_/g, ' ')

  // Contextual suggestion cards
  const suggestions = [
    ...(disease ? [{
      icon: AlertCircle,
      title: `Treat ${disease}`,
      question: `What is the immediate recommended organic or chemical treatment for ${disease}?`,
    }] : isRainy ? [{
      icon: Droplets,
      title: 'Irrigation after rainfall',
      question: 'When should I irrigate after heavy rainfall and high soil moisture?',
    }] : [{
      icon: Droplets,
      title: 'Irrigation timing',
      question: 'When should I irrigate my crop after rainfall?',
    }]),
    {
      icon: Sprout,
      title: 'Fertilizer & nutrition',
      question: 'How much urea should I apply during the tillering stage?',
    },
    {
      icon: Leaf,
      title: 'Yellowing leaf diagnosis',
      question: 'Why are the lower crop leaves turning yellow?',
    },
    {
      icon: HelpCircle,
      title: 'Drip vs Flood methods',
      question: 'What is the water savings and yield difference between drip and flood irrigation?',
    },
  ]

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="my-auto py-8 sm:py-12 flex flex-col items-center text-center max-w-2xl mx-auto px-4 w-full"
    >
      {/* 64px Leaf Icon Badge */}
      <motion.div
        variants={itemVariants}
        className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-5 shadow-xs"
      >
        <Leaf className="w-8 h-8" />
      </motion.div>

      {/* Headline (24–28px, green-950) */}
      <motion.h2
        variants={itemVariants}
        className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight mb-2"
      >
        {headline}
      </motion.h2>

      {/* One-line subtitle (16px, green-900/70) */}
      <motion.p
        variants={itemVariants}
        className="text-base text-emerald-900/70 mb-8 max-w-lg leading-relaxed"
      >
        {subtitle}
      </motion.p>

      {/* Suggestion Cards: 2x2 on tablet/desktop, 1 col on mobile, 56-64px tall */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
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
              className="min-h-[60px] p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-200/90 hover:border-emerald-500 hover:bg-emerald-50/50 shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block text-sm sm:text-base font-bold text-emerald-950 group-hover:text-emerald-800 transition-colors truncate">
                    {s.title}
                  </span>
                  <span className="block text-xs text-stone-500 truncate">
                    {s.question}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-700/60 group-hover:text-emerald-800 group-hover:translate-x-1 transition-all shrink-0" />
            </motion.button>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
