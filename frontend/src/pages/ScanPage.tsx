import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, CloudSun, RotateCcw, Scan, Sparkles, X } from 'lucide-react'
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
import type { Crop, DiseaseWeatherProfile, PredictionResponse } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'

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
  locationData: unknown
  onFetchLocation: () => void
  isLocating: boolean
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
  const { t, lang } = useLang()
  const [showCamera, setShowCamera] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')

  // Demonstration weather profiles (Project v3 dataset)
  const [selectedWeatherProfile, setSelectedWeatherProfile] = useState<string>('auto')
  const [profiles, setProfiles] = useState<DiseaseWeatherProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(false)

  const cropNameKey = `crop.${selectedCrop.toLowerCase()}`
  const cropLabel = t(cropNameKey) !== cropNameKey ? t(cropNameKey) : (crops.find(c => c.name === selectedCrop)?.label ?? selectedCrop)

  useEffect(() => {
    let active = true
    setLoadingProfiles(true)
    fetch(`${API_BASE}/api/weather/disease-profiles?crop=${encodeURIComponent(selectedCrop)}`)
      .then(res => res.json())
      .then(data => {
        if (active && data.profiles) {
          setProfiles(data.profiles)
          setSelectedWeatherProfile('auto')
        }
      })
      .catch(() => {
        if (active) setProfiles([])
      })
      .finally(() => {
        if (active) setLoadingProfiles(false)
      })
    return () => { active = false }
  }, [selectedCrop])

  function handleCameraCapture(file: File) {
    setShowCamera(false)
    onFileChange(file)
  }

  function handleValidatedAnalyze() {
    if (!selectedFile && !previewUrl) {
      return
    }
    onAnalyzePlant(selectedWeatherProfile)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview',   label: t('diagnosis.details')     },
    { id: 'causes',     label: t('card.whyDetected')       },
    { id: 'treatment',  label: t('diagnosis.treatment')    },
    { id: 'prevention', label: t('card.prevention')   },
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

      <div className="space-y-6 pb-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D4E8DC]">
          <div>
            <p className="eyebrow mb-1">{t('scan.workspace')}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D]">{t('scan.title')}</h1>
            <p className="text-sm text-[#66736C] mt-1">
              {t('scan.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="btn btn-secondary btn-sm self-start sm:self-auto shrink-0"
            aria-label={t('scan.reset')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('scan.reset')}
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Left column — controls */}
          <div className="lg:col-span-5 space-y-5">

            {/* Crop Selector */}
            <div className="card p-4 sm:p-5">
              <CropSelector
                crops={crops}
                selectedCrop={selectedCrop}
                onSelect={setSelectedCrop}
              />
            </div>

            {/* Demonstration Weather Profile Override */}
            <div className="card p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-emerald-700" />
                  <label htmlFor="weather-profile-select" className="text-sm font-bold text-[#17211D]">
                    Environmental Profile
                  </label>
                </div>
                {selectedWeatherProfile !== 'auto' ? (
                  <span className="badge badge-green text-[10px] font-semibold">
                    Dataset Override
                  </span>
                ) : (
                  <span className="badge badge-slate text-[10px] font-medium">
                    Auto GPS
                  </span>
                )}
              </div>

              <p className="text-xs text-[#66736C] leading-relaxed">
                Live GPS weather is automatically fetched. For demonstration, you can override it with authentic 7-day meteorological data from the Project v3 research dataset.
              </p>

              <select
                id="weather-profile-select"
                value={selectedWeatherProfile}
                onChange={(e) => setSelectedWeatherProfile(e.target.value)}
                disabled={loadingProfiles}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#D4E8DC] bg-white text-[#17211D] font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="auto">🌐 Live GPS Weather (Automatic)</option>
                {profiles.map((p) => (
                  <option key={p.key} value={p.key}>
                    🔬 {p.disease} (~{p.avg_temp_c}°C, {p.avg_humidity_pct}% RH, {p.total_rainfall_mm}mm rain)
                  </option>
                ))}
              </select>

              {/* Selected Profile Details Preview */}
              {selectedWeatherProfile !== 'auto' && (() => {
                const activeP = profiles.find(p => p.key === selectedWeatherProfile)
                if (!activeP) return null
                return (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-emerald-950 font-bold">
                      <span>{activeP.display_name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedWeatherProfile('auto')}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-semibold cursor-pointer"
                      >
                        Reset to Auto
                      </button>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      {activeP.condition_summary} • ~{activeP.avg_temp_c}°C • ~{activeP.avg_humidity_pct}% RH • {activeP.total_rainfall_mm}mm rain
                    </p>
                    <p className="text-[10px] text-[#4A5E52] italic">
                      ✓ Historical 7-day × 11-feature weather sequence will be fed into the multimodal model.
                    </p>
                  </div>
                )
              })()}
            </div>

            {/* Image Uploader */}
            <div className="card p-4 sm:p-5 space-y-4">
              <ImageUploader
                onFile={onFileChange}
                onCameraOpen={() => setShowCamera(true)}
                previewUrl={previewUrl}
                selectedFile={selectedFile}
                onClear={onReset}
              />

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <p className="text-xs text-red-800 font-medium">{error}</p>
                  <button type="button" onClick={() => {}} className="ml-auto">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              )}

              {/* Analyze CTA — Shown ONLY when a photo is uploaded */}
              {(selectedFile || previewUrl) && (
                <button
                  type="button"
                  onClick={handleValidatedAnalyze}
                  disabled={isPredicting}
                  className="btn btn-primary btn-lg w-full"
                  aria-label={t('scan.diagnoseCta')}
                >
                  {isPredicting ? (
                    <>
                      <Scan className="w-5 h-5 animate-pulse" />
                      {t('scan.diagnosing')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {t('scan.diagnoseCta')}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right column — result / loader / placeholder */}
          <div className="lg:col-span-7">
            {isPredicting ? (
              <AnalysisLoader
                imageUrl={previewUrl}
                cropName={cropLabel}
                isPredicting={isPredicting}
                onCancel={onReset}
                onRetry={handleValidatedAnalyze}
              />
            ) : prediction ? (
              <div className="space-y-5">

                {/* Result header */}
                <div className="card p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge badge-green">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('scan.complete')}
                      </span>
                      <span className="text-xs text-[#66736C] font-medium uppercase tracking-wider">
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

                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-[#17211D] leading-tight">
                        {localizeDiseaseName(prediction.predicted_class, lang)}
                      </h2>
                      <p className="text-xs text-[#66736C] mt-1.5 leading-relaxed max-w-lg">
                        {prediction.analysis_summary}
                      </p>
                    </div>
                    {/* Health score */}
                    <div className="shrink-0 text-center p-3 rounded-xl bg-[#F0FAF4] border border-[#B0D8C4]">
                      <div className="text-2xl font-bold text-[#159A70]">{prediction.health_score}</div>
                      <div className="text-[10px] text-[#159A70] font-semibold">/ 100</div>
                      <div className="text-[9px] text-[#66736C] mt-0.5">{t('scan.healthIndex')}</div>
                    </div>
                  </div>
                </div>

                {/* Health Score Breakdown */}
                <div className="card p-5">
                  <HealthScore score={prediction.health_score} />
                </div>

                {/* Heatmap */}
                <div className="card p-5">
                  <HeatmapViewer
                    originalImage={prediction.original_image}
                    highlightedImage={prediction.highlighted_image}
                    affectedAreaPercent={prediction.affected_area_percent ?? 18}
                  />
                </div>

                {/* Diagnosis Tabs */}
                <div className="card p-5 space-y-4">
                  <div className="tab-group overflow-x-auto">
                    {tabs.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`tab-item whitespace-nowrap ${tab === t.id ? 'active' : ''}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[100px] text-sm text-[#10231D] leading-relaxed">
                    {tab === 'overview' && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-[#10231D]">{t('scan.symptomsPathology')}</h4>
                        <p className="text-[#64736C] text-xs">{prediction.disease_info.description}</p>
                      </div>
                    )}
                    {tab === 'causes' && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-[#10231D]">{t('scan.environmentalFactors')}</h4>
                        <p className="text-[#64736C] text-xs">{prediction.disease_info.causes}</p>
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
                        <h4 className="font-bold text-[#10231D]">{t('scan.longTermPrevention')}</h4>
                        <p className="text-[#64736C] text-xs">{prediction.disease_info.prevention}</p>
                      </div>
                    )}
                  </div>

                  {/* Top 3 probabilities */}
                  <div className="pt-4 border-t border-[#EDF7F2] space-y-2">
                    <p className="section-label">{t('scan.diseaseProbabilities')}</p>
                    {prediction.top3.map((item, i) => (
                      <div key={item.class} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#64736C] font-medium truncate pr-2">
                            {localizeDiseaseName(item.class, lang)}
                          </span>
                          <span className="text-[#0B8F68] font-bold shrink-0">{(item.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${item.confidence * 100}%`,
                              background: i === 0 ? '#0B8F68' : '#94A09B',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="btn btn-primary flex-1 min-w-0">
                    <CheckCircle2 className="w-4 h-4" />
                    {t('scan.saveToPlants')}
                  </button>
                  <button type="button" onClick={onReset} className="btn btn-secondary">
                    <Scan className="w-4 h-4" />
                    {t('scan.scanAnother')}
                  </button>
                </div>
              </div>
            ) : (
              /* Empty placeholder */
              <div className="card-lg p-12 flex flex-col items-center justify-center text-center min-h-[400px] space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#DDF7EA] border border-[#B9E8D1] flex items-center justify-center">
                  <Scan className="w-8 h-8 text-[#0B8F68]" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-xl font-bold text-[#10231D]">{t('scan.ready')}</h3>
                  <p className="text-sm text-[#64736C] leading-relaxed">
                    {t('scan.subtitle')}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-[#64736C]">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#0B8F68]" /> {t('scan.aiDetection')}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#0B8F68]" /> {t('scan.visualHeatmap')}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#0B8F68]" /> {t('scan.treatmentGuide')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
