// ScanPage.tsx — FloraAI two-column plant diagnostic scanner
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, CheckCircle2,
  MessageSquare, RotateCcw, Scan, Sparkles, X
} from 'lucide-react'
import { CropSelector } from '../components/CropSelector'
import { ImageUploader } from '../components/ImageUploader'
import { CameraScanner } from '../components/CameraScanner'
import { AnalysisLoader } from '../components/AnalysisLoader'
import { HealthScore } from '../components/HealthScore'
import { HeatmapViewer } from '../components/HeatmapViewer'
import { TreatmentCard } from '../components/TreatmentCard'
import { MOCK_CROPS } from '../data/mockData'
import { useLang } from '../contexts/LanguageContext'
import { localizeDiseaseName } from '../i18n/translations'
import type { Crop, LocationContextData, PredictionResponse } from '../types'

export type { Crop, PredictionResponse }

interface ScanPageProps {
  crops?: Crop[]
  selectedCrop: string
  setSelectedCrop: (crop: string) => void
  selectedFile: File | null
  previewUrl: string | null
  onFileChange: (file: File) => void
  onSelectSamplePreset: (crop: string, key: string) => void
  onAnalyzePlant: (weatherProfile?: string) => void
  isPredicting: boolean
  prediction: PredictionResponse | null
  locationData?: LocationContextData | null | unknown
  onFetchLocation?: () => void
  onUpdateLocationData?: (data: LocationContextData | null) => void
  isLocating?: boolean
  error: string | null
  onReset: () => void
}

type Tab = 'overview' | 'causes' | 'treatment' | 'prevention'

export function ScanPage({
  crops = MOCK_CROPS,
  selectedCrop,
  setSelectedCrop,
  selectedFile,
  previewUrl,
  onFileChange,
  onAnalyzePlant,
  isPredicting,
  prediction,
  error,
  onReset,
}: ScanPageProps) {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const [showCamera, setShowCamera] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')

  const cropNameKey = `crop.${selectedCrop.toLowerCase()}`
  const cropLabel = t(cropNameKey) !== cropNameKey ? t(cropNameKey) : (crops.find(c => c.name === selectedCrop)?.label ?? selectedCrop)

  function handleCameraCapture(file: File) {
    setShowCamera(false)
    onFileChange(file)
  }

  function handleValidatedAnalyze() {
    if (!selectedFile && !previewUrl) {
      return
    }
    onAnalyzePlant()
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview',   label: t('diagnosis.details')  },
    { id: 'causes',     label: t('card.whyDetected')    },
    { id: 'treatment',  label: t('diagnosis.treatment') },
    { id: 'prevention', label: t('card.prevention')    },
  ]

  return (
    <>
      {/* Camera Modal (fullscreen) */}
      {showCamera && (
        <CameraScanner
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          onUploadInstead={() => setShowCamera(false)}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Page Header */}
        <div className="text-center pb-4 border-b border-[#E4E7E2] space-y-2 relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
            {t('scan.title')}
          </h1>
          <p className="text-sm text-[var(--color-ink-2)] max-w-xl mx-auto">
            {t('scan.subtitle')}
          </p>
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={onReset}
              className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
              aria-label={t('scan.reset')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('scan.reset')}</span>
            </button>
          </div>
        </div>

        {/* Main Two-Column Layout (single column below 1024px; two equal columns from lg up) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left Column: Diagnostics Input Controls */}
          <div className="space-y-6 w-full">

            {/* Crop Selector Card */}
            <div className="bg-white rounded-2xl border border-[#E4E7E2] p-5 shadow-sm">
              <CropSelector
                crops={crops}
                selectedCrop={selectedCrop}
                onSelect={setSelectedCrop}
              />
            </div>

            {/* Image Uploader Card */}
            <div className="bg-white rounded-2xl border border-[#E4E7E2] p-5 space-y-4 shadow-sm">
              <ImageUploader
                onFile={onFileChange}
                onCameraOpen={() => setShowCamera(true)}
                previewUrl={previewUrl}
                selectedFile={selectedFile}
                onClear={onReset}
              />

              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)]">
                  <AlertTriangle className="w-4 h-4 text-[var(--color-danger)] shrink-0" />
                  <p className="text-sm text-[var(--color-danger)] font-medium flex-1">{error}</p>
                  <button type="button" onClick={onReset} className="text-[var(--color-danger)] bg-transparent border-none cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Primary Analyze CTA Button */}
              {(selectedFile || previewUrl) && (
                <button
                  type="button"
                  onClick={handleValidatedAnalyze}
                  disabled={isPredicting}
                  className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2.5 mt-2"
                  aria-label={t('scan.diagnoseCta')}
                >
                  {isPredicting ? (
                    <>
                      <Scan className="w-5 h-5 animate-spin" />
                      <span>{t('scan.diagnosing')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>{t('scan.diagnoseCta')}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Diagnostic Results / Preview / Empty State */}
          <div className="w-full">
            {isPredicting ? (
              <AnalysisLoader
                imageUrl={previewUrl}
                cropName={cropLabel}
                isPredicting={isPredicting}
                onCancel={onReset}
                onRetry={handleValidatedAnalyze}
              />
            ) : prediction ? (
              <div className="space-y-6">

                {/* Primary Result Banner */}
                <div className="bg-white rounded-2xl border border-[#E4E7E2] p-6 space-y-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge badge-green">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('scan.complete')}
                      </span>
                      <span className="text-sm text-[var(--color-ink-2)] font-medium">
                        {t(('crop.' + prediction.crop.toLowerCase()) as any) || prediction.crop}
                      </span>
                    </div>
                    <span className={`badge ${
                      prediction.disease_info.severity?.toLowerCase() === 'severe' ? 'badge-red' :
                      prediction.disease_info.severity?.toLowerCase() === 'moderate' ? 'badge-amber' :
                      prediction.disease_info.severity?.toLowerCase() === 'low' ? 'badge-green' : 'badge-slate'
                    }`}>
                      {t(('severity.' + (prediction.disease_info.severity?.toLowerCase() || 'none')) as any) || prediction.disease_info.severity} {t('scan.severity')}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-6 flex-wrap sm:flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] leading-snug">
                        {localizeDiseaseName(prediction.predicted_class, lang)}
                      </h2>
                      <p className="text-sm text-[var(--color-ink-2)] mt-2 leading-relaxed">
                        {prediction.analysis_summary}
                      </p>
                    </div>
                    {/* Health score pill card */}
                    <div className="shrink-0 text-center p-3.5 rounded-xl bg-[#F2F4F0] border border-[#E4E7E2] min-w-[90px]">
                      <div className="text-2xl font-bold text-[var(--color-green-700)]">{prediction.health_score}</div>
                      <div className="text-sm text-[var(--color-green-700)] font-semibold">/ 100</div>
                      <div className="text-sm text-[var(--color-ink-2)] mt-0.5">{t('scan.healthIndex')}</div>
                    </div>
                  </div>
                </div>

                {/* Health Score Breakdown Card */}
                <div className="bg-white rounded-2xl border border-[#E4E7E2] p-6 shadow-sm">
                  <HealthScore score={prediction.health_score} />
                </div>

                {/* Heatmap Card */}
                <div className="bg-white rounded-2xl border border-[#E4E7E2] p-6 shadow-sm">
                  <HeatmapViewer
                    originalImage={prediction.original_image}
                    highlightedImage={prediction.highlighted_image}
                    gradcamHeatmap={prediction.gradcam_heatmap}
                    activationCoveragePercent={prediction.activation_coverage_percent ?? prediction.affected_area_percent}
                  />
                </div>

                {/* Diagnosis Details & Action Protocols */}
                <div className="bg-white rounded-2xl border border-[#E4E7E2] p-6 space-y-5 shadow-sm">
                  <div className="tab-group overflow-x-auto">
                    {tabs.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        className={`tab-item whitespace-nowrap ${tab === item.id ? 'active' : ''}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[100px] text-sm text-[var(--color-ink)] leading-relaxed">
                    {tab === 'overview' && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-[var(--color-ink)]">{t('scan.symptomsPathology')}</h4>
                        <p className="text-[var(--color-ink-2)] text-sm leading-relaxed">{prediction.disease_info.description}</p>
                      </div>
                    )}
                    {tab === 'causes' && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-[var(--color-ink)]">{t('scan.environmentalFactors')}</h4>
                        <p className="text-[var(--color-ink-2)] text-sm leading-relaxed">{prediction.disease_info.causes}</p>
                      </div>
                    )}
                    {tab === 'treatment' && (
                      <TreatmentCard
                        treatment={prediction.disease_info.treatment}
                        prevention={prediction.disease_info.prevention}
                        severity={prediction.disease_info.severity}
                      />
                    )}
                    {tab === 'prevention' && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-[var(--color-ink)]">{t('scan.longTermPrevention')}</h4>
                        <p className="text-[var(--color-ink-2)] text-sm leading-relaxed">{prediction.disease_info.prevention}</p>
                      </div>
                    )}
                  </div>

                  {/* Top 3 Probabilities */}
                  <div className="pt-4 border-t border-[#E4E7E2] space-y-3">
                    <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t('scan.diseaseProbabilities')}</h3>
                    {prediction.top3.map((item, i) => (
                      <div key={item.class} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-ink-2)] font-medium truncate pr-2">
                            {localizeDiseaseName(item.class, lang)}
                          </span>
                          <span className="text-[var(--color-green-700)] font-bold shrink-0">
                            {(item.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${item.confidence * 100}%`,
                              background: i === 0 ? 'var(--color-green-700)' : 'var(--color-green-200)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/assistant', { state: { prediction, diagnosisId: prediction.diagnosis_id } })}
                    className="btn btn-primary flex-1 min-w-[160px] flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Ask AI About This</span>
                  </button>
                  <button type="button" onClick={onReset} className="btn btn-secondary flex items-center justify-center gap-2">
                    <Scan className="w-4 h-4" />
                    <span>{t('scan.scanAnother')}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Clear, Generously Scaled Empty State */
              <div className="bg-white rounded-2xl border border-[#E4E7E2] p-8 sm:p-12 flex flex-col items-center justify-center text-center h-full min-h-[420px] space-y-6 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#F2F4F0] border border-[#E4E7E2] flex items-center justify-center text-[var(--color-green-700)]">
                  <Scan className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)]">
                    {t('scan.ready')}
                  </h3>
                  <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                    {t('scan.subtitle')}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold text-[var(--color-ink)] pt-2">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2F4F0] border border-[#E4E7E2]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-green-700)]" />
                    {t('scan.aiDetection')}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2F4F0] border border-[#E4E7E2]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-green-700)]" />
                    {t('scan.visualHeatmap')}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2F4F0] border border-[#E4E7E2]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-green-700)]" />
                    {t('scan.treatmentGuide')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
