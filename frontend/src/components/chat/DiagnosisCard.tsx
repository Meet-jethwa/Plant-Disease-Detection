// DiagnosisCard.tsx — Redesigned Accessible Diagnosis Card for FloraAI Chat
// React 19 + Tailwind v4 + framer-motion (Green & White Token System, No Emojis)
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, ChevronDown, Eye,
  Info, AlertTriangle, AlertCircle, CloudRain
} from 'lucide-react'
import type { GeminiResponse, PredictionResponse } from '../../types'
import { useLang } from '../../contexts/LanguageContext'
import { localizeDiseaseName } from '../../i18n/translations'

interface DiagnosisCardProps {
  data?: GeminiResponse
  prediction: PredictionResponse | null
  onAsk?: (question: string) => void
}

export function DiagnosisCard({ data, prediction }: DiagnosisCardProps) {
  const { t, lang } = useLang()
  const [openWhatItIs, setOpenWhatItIs] = useState(true)
  const [openWhatToDo, setOpenWhatToDo] = useState(true)
  const [openWhyThinks, setOpenWhyThinks] = useState(false)
  const [openWeatherRisk, setOpenWeatherRisk] = useState(false)

  if (!prediction) return null

  const localizedDisease = localizeDiseaseName(prediction.predicted_class, lang)
  const confidence = Math.round(prediction.confidence_percent || (prediction.confidence * 100) || 85)

  // Status computation (Healthy / Warning / Danger)
  const isHealthy = prediction.predicted_class?.toLowerCase().includes('healthy')
  const isSevere = prediction.disease_info?.severity?.toLowerCase() === 'severe' || confidence > 85 && !isHealthy
  const statusType: 'healthy' | 'warning' | 'danger' = isHealthy ? 'healthy' : isSevere ? 'danger' : 'warning'

  // Environmental risks
  const envFactors = data?.environmental_factors || [
    { factor: 'Relative Humidity', importance_pct: 78, explanation: 'Elevated humidity above 80% accelerates foliar fungal germination.' },
    { factor: 'Ambient Temperature', importance_pct: 64, explanation: 'Warm canopy microclimate sustains active pathogen sporulation.' },
    { factor: 'Rainfall & Dew Wetness', importance_pct: 55, explanation: 'Persistent water droplets allow spore penetration into leaf stomata.' },
  ]

  const actions: string[] = data?.actionable_steps || data?.recommended_actions || [
    prediction.disease_info?.treatment || 'Apply recommended cultural practices and maintain field sanitation.',
    'Isolate severely infected plant tissue and avoid excessive overhead sprinkler irrigation.',
    'Inspect adjacent crop rows within 48 hours to prevent cluster spread.',
  ]

  const translatedCrop = t(('crop.' + (prediction.crop || '').toLowerCase()) as any) || prediction.crop || 'Specimen'

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white overflow-hidden shadow-sm my-3 text-left">
      
      {/* ── Header ── */}
      <div className="p-4 sm:p-5 bg-emerald-50/70 border-b border-emerald-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          {/* StatusPill with icon + word */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs">
            {statusType === 'healthy' && (
              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {t('diagnosis.healthyPlant')}
              </span>
            )}
            {statusType === 'warning' && (
              <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-100 border-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                {t('status.warning')}
              </span>
            )}
            {statusType === 'danger' && (
              <span className="inline-flex items-center gap-1 text-red-900 bg-red-100 border-red-300">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                {t('status.danger')}
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-emerald-950 capitalize leading-tight">
            {localizedDisease}
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            {t('common.crop')}: {translatedCrop}
          </p>
        </div>

        {/* Confidence Ring (Sweeps 0 to value) */}
        <div className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-xl border border-emerald-200 shadow-xs">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-emerald-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                className="text-emerald-700"
                strokeWidth="3.5"
                strokeDasharray={`${confidence}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${confidence}, 100` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold text-emerald-950">
              {confidence}%
            </span>
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider">{t('common.confidence')}</span>
            <span className="block text-xs text-stone-500">{t('card.diagnosisSummary')}</span>
          </div>
        </div>
      </div>

      {/* ── Collapsible Section 1: What It Is (Open by default) ── */}
      <div className="border-b border-emerald-100">
        <button
          type="button"
          onClick={() => setOpenWhatItIs(!openWhatItIs)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-emerald-700 shrink-0" />
            <span className="text-sm font-bold text-emerald-950">{t('card.diagnosisSummary')}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-emerald-700 transition-transform duration-200 ${openWhatItIs ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence initial={false}>
          {openWhatItIs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 text-sm text-stone-700 leading-relaxed space-y-2">
                <p>
                  {prediction.disease_info?.description || prediction.analysis_summary || 'Pathogen affecting foliar tissue and photosynthetic efficiency.'}
                </p>
                {prediction.disease_info?.causes && (
                  <p className="text-xs text-stone-500 bg-emerald-50 p-3 rounded-xl border border-emerald-200/60">
                    <strong className="text-emerald-900 font-semibold">Primary Cause:</strong> {prediction.disease_info.causes}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Collapsible Section 2: What to Do Now (Numbered Steps, Open by default) ── */}
      <div className="border-b border-emerald-100">
        <button
          type="button"
          onClick={() => setOpenWhatToDo(!openWhatToDo)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span className="text-sm font-bold text-emerald-950">{t('diagnosis.whatToDoNow')}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-emerald-700 transition-transform duration-200 ${openWhatToDo ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence initial={false}>
          {openWhatToDo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 space-y-2.5">
                {actions.map((act: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-stone-800 leading-relaxed font-medium">
                      {act}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Collapsible Section 3: Why the AI Thinks So (Grad-CAM + Original Leaf) ── */}
      {(prediction.original_image || prediction.highlighted_image) && (
        <div className="border-b border-emerald-100">
          <button
            type="button"
            onClick={() => setOpenWhyThinks(!openWhyThinks)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-emerald-700 shrink-0" />
              <span className="text-sm font-bold text-emerald-950">{t('diagnosis.aiSummary')}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-emerald-700 transition-transform duration-200 ${openWhyThinks ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {openWhyThinks && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 space-y-3">
                  <p className="text-xs text-stone-600">
                    The AI examined high-activation zones highlighted in the heatmap to classify lesion morphology.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {prediction.original_image && (
                      <div className="space-y-1">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden border border-emerald-200 bg-stone-100">
                          <img
                            src={prediction.original_image}
                            alt="Original leaf specimen"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[11px] font-bold text-stone-600 text-center uppercase tracking-wider">
                          {t('card.original')}
                        </p>
                      </div>
                    )}

                    {prediction.highlighted_image && (
                      <div className="space-y-1">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden border border-emerald-200 bg-stone-100">
                          <img
                            src={prediction.highlighted_image}
                            alt="Grad-CAM activation heatmap"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[11px] font-bold text-emerald-800 text-center uppercase tracking-wider">
                          {t('card.gradcam')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Collapsible Section 4: Weather Risk (Bars with Green -> Amber -> Red scale) ── */}
      <div>
        <button
          type="button"
          onClick={() => setOpenWeatherRisk(!openWeatherRisk)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <CloudRain className="w-5 h-5 text-emerald-700 shrink-0" />
            <span className="text-sm font-bold text-emerald-950">{t('scan.environmentalFactors')}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-emerald-700 transition-transform duration-200 ${openWeatherRisk ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence initial={false}>
          {openWeatherRisk && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-3">
                {envFactors.map((env, i) => {
                  const pct = env.importance_pct || 50
                  const isHighRisk = pct >= 70
                  const isModerate = pct >= 50 && pct < 70
                  const barColor = isHighRisk ? 'bg-red-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                  const statusLabel = isHighRisk ? t('risk.high') : isModerate ? t('risk.medium') : t('risk.low')

                  return (
                    <div key={i} className="p-3 rounded-xl bg-white border border-emerald-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                        <span>{env.factor}</span>
                        <span className={isHighRisk ? 'text-red-700' : isModerate ? 'text-amber-800' : 'text-emerald-700'}>
                          {pct}% · {statusLabel}
                        </span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {env.explanation}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
