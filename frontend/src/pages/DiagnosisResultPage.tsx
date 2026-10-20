// DiagnosisResultPage.tsx — Farmer-friendly Plant Health Diagnosis Result Page
import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Download, Share2, Scan, MessageSquare,
  Bookmark, AlertTriangle, CheckCircle2,
  Volume2, VolumeX, ChevronDown, ChevronUp, Sun,
  Camera, Leaf, MoreVertical, ShieldAlert,
  Info
} from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { LeafVision } from '../components/LeafVision'
import { WeatherCard } from '../components/WeatherCard'
import { DiseaseRisk } from '../components/DiseaseRisk'
import { useLang } from '../contexts/LanguageContext'
import { LANGUAGE_META } from '../i18n/translations'
import {
  localizeDiseaseName,
  getLocalizedDiseaseInfo,
  ORGANIC_STEPS,
  localizeWeatherRisk,
  localizeWeatherCondition,
} from '../i18n/diseaseHelper'
import type { PredictionResponse, LocationContextData } from '../types'

// ── Configurable Confidence Thresholds ───────────────────────────────────────────
export const LOW_CONFIDENCE = 60
export const UNKNOWN_CONFIDENCE = 25

interface DiagnosisResultPageProps {
  prediction: PredictionResponse
  locationData: LocationContextData | null
  onReset: () => void
  onSaveToPlants?: () => void
}

export function DiagnosisResultPage({
  prediction,
  locationData,
  onReset,
  onSaveToPlants,
}: DiagnosisResultPageProps) {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const reducedMotion = useReducedMotion()

  // ── States ──────────────────────────────────────────────────────────────────
  const [saved, setSaved] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [activeTreatmentTab, setActiveTreatmentTab] = useState<'immediate' | 'organic' | 'preventive'>('immediate')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showTreatmentsAnyway, setShowTreatmentsAnyway] = useState(false)

  // Accordion toggles (all collapsed by default per specification)
  const [accordions, setAccordions] = useState({
    vision: false,
    symptoms: false,
    weather: false,
    technical: false,
  })

  const moreMenuRef = useRef<HTMLDivElement>(null)

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // ── Derived Data ─────────────────────────────────────────────────────────────
  const localizedInfo = useMemo(() => {
    return getLocalizedDiseaseInfo(prediction.predicted_class, lang)
  }, [prediction.predicted_class, lang])

  const disease = {
    ...prediction.disease_info,
    display: localizedInfo.display || prediction.disease_info.display,
    description: localizedInfo.description || prediction.disease_info.description,
    treatment: localizedInfo.treatment || prediction.disease_info.treatment,
    causes: localizedInfo.causes || prediction.disease_info.causes,
    prevention: localizedInfo.prevention || prediction.disease_info.prevention,
  }

  const isHealthy = prediction.predicted_class.toLowerCase().includes('healthy')

  const confidence = typeof prediction.confidence_percent === 'number'
    ? prediction.confidence_percent
    : (prediction.confidence != null ? prediction.confidence * 100 : 0)

  const isMediumConfidence = confidence >= UNKNOWN_CONFIDENCE && confidence < LOW_CONFIDENCE
  const isUnknownConfidence = confidence < UNKNOWN_CONFIDENCE

  const affectedAreaPct = prediction.affected_area_percent ?? 18
  const rawRisk = prediction.weather_context?.risk_level ?? locationData?.risk_level ?? 'Low'
  const rawCondition = prediction.weather_context?.weather?.condition ?? locationData?.weather?.condition ?? 'Moderate'

  const weatherRisk = localizeWeatherRisk(rawRisk, lang)
  const weatherDesc = localizeWeatherCondition(rawCondition, lang)

  // Build 3 to 5 clear steps for each tab
  const immediateSteps = useMemo(() => {
    const rawText = disease.treatment || ''
    const raw = rawText
      .split(/(?:\. |\n|\। )/)
      .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(s => s.length > 5)
    if (raw.length > 0) return raw.slice(0, 5)
    return [
      t('diagnosis.stepIsolate'),
      t('diagnosis.stepRefrain'),
      t('diagnosis.stepInspect'),
      t('diagnosis.stepConsult'),
    ]
  }, [disease.treatment, t])

  const organicSteps = ORGANIC_STEPS[lang] || ORGANIC_STEPS.en

  const preventiveSteps = useMemo(() => {
    const rawText = disease.prevention || ''
    const raw = rawText
      .split(/(?:\. |\n|\। )/)
      .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(s => s.length > 5)
    if (raw.length > 0) return raw.slice(0, 4)
    return [
      t('diagnosis.stepSpacing'),
      t('diagnosis.stepFertilizer'),
      t('diagnosis.stepIrrigation'),
      t('diagnosis.stepCultivars'),
    ]
  }, [disease.prevention, t])

  const currentTabSteps =
    activeTreatmentTab === 'immediate'
      ? immediateSteps
      : activeTreatmentTab === 'organic'
      ? organicSteps
      : preventiveSteps

  // Text-to-speech for "What to do now"
  function handleToggleSpeech() {
    if (!('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const bcp47 = LANGUAGE_META[lang]?.bcp47 || 'en-IN'
    const speechText = currentTabSteps
      .map((step, idx) => `Step ${idx + 1}: ${step}`)
      .join('. ')

    const utterance = new SpeechSynthesisUtterance(speechText)
    utterance.lang = bcp47
    utterance.rate = 0.92

    // Pick exact voice or best prefix match; fall back to browser default
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find((v) => v.lang === bcp47)
      ?? voices.find((v) => v.lang.startsWith(bcp47.split('-')[0]))
    if (voice) utterance.voice = voice

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  // Action handlers
  function handleSave() {
    setSaved(true)
    setShowMoreMenu(false)
    onSaveToPlants?.()
  }

  function handleDownload() {
    setShowMoreMenu(false)
    const report = [
      'FloraAI Plant Diagnosis Report',
      '==============================',
      `Crop:         ${prediction.crop}`,
      `Condition:    ${prediction.predicted_class}`,
      `Confidence:   ${confidence.toFixed(1)}%`,
      `Affected Area:${affectedAreaPct}%`,
      `Weather Risk: ${weatherRisk}`,
      '---',
      disease.description,
      '',
      'Immediate Actions:',
      immediateSteps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      '',
      'Organic Remedies:',
      organicSteps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      '',
      'Prevention Plan:',
      preventiveSteps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    ].join('\n')

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `FloraAI_Report_${prediction.crop}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleShare() {
    setShowMoreMenu(false)
    if (navigator.share) {
      void navigator.share({
        title: `FloraAI: ${prediction.predicted_class}`,
        text: `${prediction.crop} diagnosis: ${prediction.predicted_class} (${confidence.toFixed(1)}% confidence).`,
        url: window.location.href,
      })
    } else {
      void navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  function toggleAccordion(key: keyof typeof accordions) {
    setAccordions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER TIER 3: Confidence < 25% ("We could not recognize this leaf")
  // ─────────────────────────────────────────────────────────────────────────────
  if (isUnknownConfidence) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        
        {/* Header with back button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="btn btn-secondary min-h-[48px] px-4 flex items-center gap-2 text-sm font-semibold cursor-pointer"
            aria-label={t('btn.back')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('btn.back')}</span>
          </button>
        </div>

        {/* Unrecognized Card */}
        <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="text-2xl sm:text-[28px] font-bold text-[#17211D] leading-tight mb-2">
            {t('diagnosis.unrecognizedLeaf')}
          </h1>

          <p className="max-w-md text-base text-[#4A5E52] leading-relaxed mb-6">
            {t('diagnosis.unrecognizedHint')}
          </p>

          {/* Leaf image preview */}
          {prediction.original_image && (
            <div className="mb-6 h-48 w-48 overflow-hidden rounded-2xl border border-[#D4E8DC] bg-[#F0FAF4] shadow-xs">
              <img
                src={prediction.original_image}
                alt="Uploaded leaf"
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {/* Photo quality tips */}
          <div className="mb-8 w-full max-w-md rounded-xl bg-stone-50 border border-stone-200 p-4 text-left">
            <p className="text-sm font-bold text-[#17211D] mb-3 flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-600" />
              <span>{t('diagnosis.photoTips')}</span>
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium text-stone-700">
              <div className="rounded-lg bg-white p-2.5 border border-stone-200/60 flex flex-col items-center gap-1.5">
                <Sun className="h-5 w-5 text-amber-600" />
                <span>{t('scan.tipLight')}</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-stone-200/60 flex flex-col items-center gap-1.5">
                <Leaf className="h-5 w-5 text-emerald-600" />
                <span>{t('scan.tipOneLeaf')}</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-stone-200/60 flex flex-col items-center gap-1.5">
                <Camera className="h-5 w-5 text-blue-600" />
                <span>{t('scan.tipHold')}</span>
              </div>
            </div>
          </div>

          {/* Only 2 buttons allowed per spec */}
          <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onReset}
              className="btn btn-primary min-h-[48px] flex-1 flex items-center justify-center gap-2 text-base font-semibold cursor-pointer"
            >
              <Scan className="h-5 w-5" />
              <span>{t('diagnosis.retakePhoto')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/assistant')}
              className="btn btn-secondary min-h-[48px] flex-1 flex items-center justify-center gap-2 text-base font-semibold cursor-pointer"
            >
              <MessageSquare className="h-5 w-5" />
              <span>{t('diagnosis.askAiAboutThis')}</span>
            </button>
          </div>

        </div>

        {/* Legal fine print */}
        <p className="mt-6 text-center text-[12px] text-stone-400">
          FloraAI diagnostic assistance is advisory only. Verify with agricultural officers before crop intervention.
        </p>

      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER TIER 2: 25% <= Confidence < 60% ("Not sure yet")
  // ─────────────────────────────────────────────────────────────────────────────
  if (isMediumConfidence) {
    const top3Predictions = prediction.top3 && prediction.top3.length > 0
      ? prediction.top3
      : [{ class: prediction.predicted_class, confidence: confidence / 100 }]

    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-6">

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="btn btn-secondary min-h-[48px] px-4 flex items-center gap-2 text-sm font-semibold cursor-pointer"
            aria-label={t('btn.back')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('btn.back')}</span>
          </button>

          {/* More menu */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="btn btn-secondary min-h-[48px] w-12 flex items-center justify-center cursor-pointer"
              aria-label={t('btn.more')}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-1.5 shadow-xl border border-stone-200 z-40">
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full min-h-[44px] px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Bookmark className="h-4 w-4 text-emerald-700" />
                  <span>{saved ? t('btn.saved') : t('btn.save')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full min-h-[44px] px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-emerald-700" />
                  <span>{t('btn.download')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full min-h-[44px] px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="h-4 w-4 text-emerald-700" />
                  <span>{t('btn.share')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* "Not sure yet" Verdict Card */}
        <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900 mb-2">
                <AlertTriangle className="h-4 w-4" />
                {t('diagnosis.notSureYet')}
              </span>
              <h1 className="text-2xl sm:text-[28px] font-bold text-[#17211D] leading-tight">
                {t('diagnosis.notSureYet')}
              </h1>
              <p className="text-sm text-[#4A5E52] mt-1">
                {t('diagnosis.confidenceIs')} {Math.round(confidence)}%. {t('diagnosis.multipleMatch')}
              </p>
            </div>

            {/* Circular Ring Gauge */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center self-start sm:self-auto">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="#FEF3C7" strokeWidth="4" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={2 * Math.PI * 18 * (1 - confidence / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-bold text-amber-900">
                {Math.round(confidence)}%
              </span>
            </div>
          </div>

          {/* Top 3 possible diseases as plain rows */}
          <div className="mt-5 border-t border-stone-100 pt-4">
            <p className="text-sm font-bold text-[#17211D] mb-3">
              {t('diagnosis.possibleDiseases')}
            </p>
            <div className="space-y-2.5">
              {top3Predictions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/70"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-stone-300 text-xs font-bold text-stone-700">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-[#17211D]">
                      {localizeDiseaseName(item.class, lang)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-stone-800">
                    {(item.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips for a better photo */}
          <div className="mt-6 rounded-xl bg-amber-50/70 border border-amber-200/80 p-4">
            <p className="text-sm font-bold text-amber-950 mb-3 flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-700" />
              <span>{t('diagnosis.photoTips')}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center text-xs font-semibold text-amber-950">
              <div className="rounded-lg bg-white p-3 border border-amber-200/60 flex flex-col items-center gap-1.5 shadow-xs">
                <Sun className="h-5 w-5 text-amber-600" />
                <span>{t('scan.tipLight')}</span>
              </div>
              <div className="rounded-lg bg-white p-3 border border-amber-200/60 flex flex-col items-center gap-1.5 shadow-xs">
                <Leaf className="h-5 w-5 text-emerald-600" />
                <span>{t('scan.tipOneLeaf')}</span>
              </div>
              <div className="rounded-lg bg-white p-3 border border-amber-200/60 flex flex-col items-center gap-1.5 shadow-xs">
                <Camera className="h-5 w-5 text-blue-600" />
                <span>{t('scan.tipHold')}</span>
              </div>
            </div>
          </div>

          {/* Primary Retake Photo Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={onReset}
              className="btn btn-primary min-h-[48px] w-full flex items-center justify-center gap-2 text-base font-semibold cursor-pointer"
            >
              <Scan className="h-5 w-5" />
              <span>{t('diagnosis.retakePhoto')}</span>
            </button>
          </div>

          {/* Collapsible treatment link with warning */}
          <div className="mt-5 border-t border-stone-100 pt-4 text-center">
            {!showTreatmentsAnyway ? (
              <button
                type="button"
                onClick={() => setShowTreatmentsAnyway(true)}
                className="min-h-[48px] px-3 text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-4 cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>{t('diagnosis.showTreatmentsAnyway')}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            ) : (
              <div className="text-left mt-2 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2.5 text-red-800 text-sm font-medium mb-3">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                  <p className="leading-relaxed">
                    {t('diagnosis.lowConfidenceWarning')}
                  </p>
                </div>
                <div className="mt-3 bg-white p-4 rounded-xl border border-red-200">
                  <p className="text-sm font-bold text-stone-900 mb-2">{t('diagnosis.preliminaryMeasures')}</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-stone-700">
                    {immediateSteps.slice(0, 3).map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Collapsible Leaf Vision Accordion */}
        <div className="rounded-2xl border border-[#D4E8DC] bg-white overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleAccordion('vision')}
            className="w-full min-h-[48px] px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <span className="text-base font-bold text-[#17211D] flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-700" />
              <span>{t('diagnosis.whereAiLooked')}</span>
            </span>
            {accordions.vision ? (
              <ChevronUp className="h-5 w-5 text-stone-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-stone-500" />
            )}
          </button>
          {accordions.vision && (
            <div className="border-t border-[#D4E8DC] p-4 sm:p-5">
              <LeafVision prediction={prediction} />
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar */}
        <div className="sticky bottom-0 z-30 -mx-4 -mb-6 bg-white/95 backdrop-blur-md border-t border-[#D4E8DC] p-3 sm:p-4 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onReset}
              className="btn btn-secondary min-h-[48px] flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
            >
              <Scan className="h-4 w-4" />
              <span>{t('btn.scanAnother')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/assistant')}
              className="btn btn-primary min-h-[48px] flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{t('diagnosis.askAiAboutThis')}</span>
            </button>
          </div>
        </div>

      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER TIER 1: Confidence >= 60% (Normal Result)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 pb-24 space-y-6">

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary min-h-[48px] px-4 flex items-center gap-2 text-sm font-semibold cursor-pointer"
          aria-label={t('btn.back')}
          id="result-back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('btn.back')}</span>
        </button>

        <div className="text-center hidden sm:block">
          <h1 className="text-lg font-bold text-[#17211D]">{t('diagnosis.title')}</h1>
          <p className="text-sm text-[#64736C] capitalize">{t(('crop.' + prediction.crop.toLowerCase()) as any) || prediction.crop}</p>
        </div>

        {/* Single "More" Menu Button */}
        <div className="relative" ref={moreMenuRef}>
          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="btn btn-secondary min-h-[48px] px-3.5 flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
            aria-label={t('btn.more')}
            id="result-more-btn"
          >
            <span>{t('btn.more')}</span>
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white p-1.5 shadow-xl border border-stone-200 z-40">
              <button
                type="button"
                onClick={handleSave}
                className="w-full min-h-[44px] px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2.5 cursor-pointer"
              >
                <Bookmark className="h-4 w-4 text-emerald-700" />
                <span>{saved ? t('btn.saved') : t('btn.save')}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="w-full min-h-[44px] px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2.5 cursor-pointer"
              >
                <Download className="h-4 w-4 text-emerald-700" />
                <span>{t('btn.download')}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="w-full min-h-[44px] px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2.5 cursor-pointer"
              >
                <Share2 className="h-4 w-4 text-emerald-700" />
                <span>{t('btn.share')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: 1 column on mobile, 2 columns from 1024px */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-6 lg:space-y-0">

        {/* ── Left Column (Verdict, What to do now, 3 Key facts) ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Verdict Card */}
          <div className="rounded-2xl border border-[#D4E8DC] bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Status Pill with icon and word */}
                <div className="mb-2.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
                    isHealthy
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}>
                    {isHealthy ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        <span>{t('diagnosis.healthyPlant')}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-700" />
                        <span>{t('diagnosis.diseaseDetected')}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Disease name at 28px */}
                <h2 className="text-[28px] font-bold text-[#10231D] leading-tight break-words">
                  {localizeDiseaseName(prediction.predicted_class, lang)}
                </h2>

                {prediction.scientific_name && (
                  <p className="text-sm italic text-[#64736C] mt-1">
                    {prediction.scientific_name}
                  </p>
                )}

                <p className="mt-2.5 text-sm text-[#4A5E52] leading-relaxed line-clamp-3">
                  {disease.description}
                </p>
              </div>

              {/* Confidence Ring Gauge */}
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#DDF3E8" strokeWidth="4" />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke="#15803D"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - confidence / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-sm sm:text-base font-bold text-[#10231D]">
                    {Math.round(confidence)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. "What to do now" (3 to 5 numbered steps at 18px with Tabs + Listen button) */}
          <div className="rounded-2xl border border-[#D4E8DC] bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-xl font-bold text-[#10231D]">
                {t('diagnosis.whatToDoNow')}
              </h3>

              {/* Listen button (TTS) with 48px min tap target */}
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`btn ${
                  isSpeaking ? 'btn-primary' : 'btn-secondary'
                } min-h-[48px] px-4 flex items-center gap-2 text-sm font-semibold cursor-pointer`}
                aria-label={isSpeaking ? t('diagnosis.stopListening') : t('diagnosis.listen')}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-4 w-4" />
                    <span>{t('diagnosis.stopListening')}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    <span>{t('diagnosis.listen')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Tabs: Immediate, Organic, Preventive (48px tap target) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-stone-100 mb-5">
              {(['immediate', 'organic', 'preventive'] as const).map(tabKey => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => {
                    setActiveTreatmentTab(tabKey)
                    if (isSpeaking) {
                      window.speechSynthesis.cancel()
                      setIsSpeaking(false)
                    }
                  }}
                  className={`min-h-[48px] rounded-lg px-2 text-sm font-bold transition-all flex items-center justify-center cursor-pointer ${
                    activeTreatmentTab === tabKey
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tabKey === 'immediate'
                    ? t('diagnosis.tabImmediate')
                    : tabKey === 'organic'
                    ? t('diagnosis.tabOrganic')
                    : t('diagnosis.tabPreventive')}
                </button>
              ))}
            </div>

            {/* Numbered Steps at 18px */}
            <ol className="space-y-4">
              {currentTabSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F5EE] border border-[#B0D8C4] text-sm font-bold text-[#15803D] mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-[18px] font-medium text-[#10231D] leading-relaxed">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* 3. Three Key Facts in One Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Fact 1: Affected Area */}
            <div className="rounded-xl border border-[#D4E8DC] bg-white p-3.5 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-[#66736C]">
                {t('diagnosis.affectedArea')}
              </p>
              <p className="text-base sm:text-lg font-bold text-[#10231D] mt-1">
                {affectedAreaPct}%
              </p>
            </div>

            {/* Fact 2: Weather Risk */}
            <div className="rounded-xl border border-[#D4E8DC] bg-white p-3.5 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-[#66736C]">
                {t('diagnosis.weatherRisk')}
              </p>
              <p className={`text-base sm:text-lg font-bold mt-1 ${
                rawRisk.toLowerCase().includes('high') ? 'text-amber-800' : 'text-emerald-800'
              }`}>
                {weatherRisk} — {weatherDesc}
              </p>
            </div>

            {/* Fact 3: Confidence */}
            <div className="rounded-xl border border-[#D4E8DC] bg-white p-3.5 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-[#66736C]">
                {t('common.confidence')}
              </p>
              <p className="text-base sm:text-lg font-bold text-[#10231D] mt-1">
                {Math.round(confidence)}%
              </p>
            </div>
          </div>

        </div>

        {/* ── Right Column (Collapsed Accordions) ── */}
        <div className="lg:col-span-5 space-y-4">

          {/* Accordion 1: Where the AI looked (Photo / AI view / Compare viewer) */}
          <div className="rounded-2xl border border-[#D4E8DC] bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => toggleAccordion('vision')}
              className="w-full min-h-[48px] px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <span className="text-base font-bold text-[#17211D] flex items-center gap-2">
                <Camera className="h-4 w-4 text-emerald-700" />
                <span>{t('diagnosis.whereAiLooked')}</span>
              </span>
              {accordions.vision ? (
                <ChevronUp className="h-5 w-5 text-stone-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-stone-500" />
              )}
            </button>
            <AnimatePresence>
              {accordions.vision && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-[#D4E8DC] p-4 sm:p-5"
                >
                  <LeafVision prediction={prediction} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 2: Symptoms found */}
          <div className="rounded-2xl border border-[#D4E8DC] bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => toggleAccordion('symptoms')}
              className="w-full min-h-[48px] px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <span className="text-base font-bold text-[#17211D] flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-700" />
                <span>{t('diagnosis.symptomsFound')}</span>
              </span>
              {accordions.symptoms ? (
                <ChevronUp className="h-5 w-5 text-stone-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-stone-500" />
              )}
            </button>
            <AnimatePresence>
              {accordions.symptoms && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-[#D4E8DC] p-5 space-y-3"
                >
                  {(prediction.symptoms ?? [
                    { name: t('diagnosis.sympLesions'), confidence: Math.round(confidence) },
                    { name: t('diagnosis.sympNecrosis'), confidence: Math.max(20, Math.round(confidence - 15)) },
                    { name: t('diagnosis.sympVascular'), confidence: Math.max(10, Math.round(confidence - 28)) },
                  ]).map((sym, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                      <span className="text-sm font-semibold text-[#17211D]">{sym.name}</span>
                      <span className="text-sm font-bold text-stone-700">{sym.confidence}%</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 3: Weather details */}
          <div className="rounded-2xl border border-[#D4E8DC] bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => toggleAccordion('weather')}
              className="w-full min-h-[48px] px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <span className="text-base font-bold text-[#17211D] flex items-center gap-2">
                <Sun className="h-4 w-4 text-emerald-700" />
                <span>{t('diagnosis.weatherDetails')}</span>
              </span>
              {accordions.weather ? (
                <ChevronUp className="h-5 w-5 text-stone-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-stone-500" />
              )}
            </button>
            <AnimatePresence>
              {accordions.weather && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-[#D4E8DC] p-5 space-y-4"
                >
                  {locationData && (
                    <WeatherCard data={locationData} isLoading={false} onRefresh={() => {}} />
                  )}
                  <DiseaseRisk
                    riskLevel={weatherRisk}
                    riskReason={prediction.weather_context?.risk_reason ?? locationData?.risk_reason}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 4: Technical details (Only real API data, hides hard-coded health breakdown) */}
          <div className="rounded-2xl border border-[#D4E8DC] bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => toggleAccordion('technical')}
              className="w-full min-h-[48px] px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <span className="text-base font-bold text-[#17211D] flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-700" />
                <span>{t('diagnosis.technicalDetails')}</span>
              </span>
              {accordions.technical ? (
                <ChevronUp className="h-5 w-5 text-stone-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-stone-500" />
              )}
            </button>
            <AnimatePresence>
              {accordions.technical && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-[#D4E8DC] p-5 space-y-4"
                >
                  {/* Top-3 Model Probability Distribution */}
                  {prediction.top3 && prediction.top3.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-[#17211D] mb-3">{t('diagnosis.possibleDiseases')}</p>
                      <div className="space-y-2">
                        {prediction.top3.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800 shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm text-[#10231D] font-medium flex-1 truncate">
                              {localizeDiseaseName(item.class, lang)}
                            </span>
                            <span className="text-sm font-bold text-stone-700 shrink-0">
                              {(item.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weather feature importance (if returned by backend API) */}
                  {prediction.weather_context?.feature_importance && Object.keys(prediction.weather_context.feature_importance).length > 0 && (
                    <div className="pt-3 border-t border-stone-100">
                      <p className="text-sm font-bold text-[#17211D] mb-2.5">{t('diagnosis.factorInfluence')}</p>
                      <div className="space-y-2">
                        {Object.entries(prediction.weather_context.feature_importance).map(([factor, weight], idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-stone-700 font-medium">{factor}</span>
                            <span className="font-bold text-emerald-800">{(weight * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#D4E8DC] p-3 sm:p-4 shadow-lg">
        <div className="mx-auto max-w-4xl grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onReset}
            className="btn btn-secondary min-h-[48px] flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
            id="result-scan-another-btn"
          >
            <Scan className="h-4 w-4" />
            <span>{t('btn.scanAnother')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/assistant')}
            className="btn btn-primary min-h-[48px] flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
            id="result-ask-doctor-btn"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{t('diagnosis.askAiAboutThis')}</span>
          </button>
        </div>
      </div>

    </div>
  )
}
