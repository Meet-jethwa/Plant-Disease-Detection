// ScanPage.tsx — Main plant scanner with stages: crop → upload → preview → analyze → result
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, RotateCcw, Scan, Sparkles, X, Thermometer, Droplets, Wind, MapPin, RefreshCw, Settings2 } from 'lucide-react'
import { CropSelector } from '../components/CropSelector'
import { ImageUploader } from '../components/ImageUploader'
import { CameraScanner } from '../components/CameraScanner'
import { AnalysisLoader } from '../components/AnalysisLoader'
import { HealthScore } from '../components/HealthScore'
import { HeatmapViewer } from '../components/HeatmapViewer'
import { TreatmentCard } from '../components/TreatmentCard'
import { ManualWeatherModal } from '../components/ManualWeatherModal'
import { MOCK_CROPS } from '../data/mockData'
import type { Crop, PredictionResponse, LocationContextData } from '../types'

export type { Crop, PredictionResponse }

interface ScanPageProps {
  crops?: Crop[]
  selectedCrop: string
  setSelectedCrop: (crop: string) => void
  selectedFile: File | null
  previewUrl: string | null
  onFileChange: (file: File) => void
  onSelectSamplePreset: (crop: string, key: string) => void
  onAnalyzePlant: () => void
  isPredicting: boolean
  prediction: PredictionResponse | null
  locationData: LocationContextData | null
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
  locationData,
  onFetchLocation,
  isLocating,
  error,
  onReset,
}: ScanPageProps) {
  const navigate = useNavigate()
  const [showCamera, setShowCamera] = useState(false)
  const [showWeatherModal, setShowWeatherModal] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')

  const cropLabel = crops.find(c => c.name === selectedCrop)?.label ?? selectedCrop

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
    { id: 'overview',   label: 'Overview'     },
    { id: 'causes',     label: 'Causes'       },
    { id: 'treatment',  label: 'Treatment'    },
    { id: 'prevention', label: 'Prevention'   },
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
            <p className="eyebrow mb-1">Diagnosis Workspace</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D]">Plant Scanner</h1>
            <p className="text-sm text-[#66736C] mt-1">
              Upload or capture a leaf photo to analyze infection areas and get care recommendations.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="btn btn-secondary btn-sm self-start sm:self-auto shrink-0"
            aria-label="Reset scanner"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
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
                  aria-label="Analyze plant health"
                >
                  {isPredicting ? (
                    <>
                      <Scan className="w-5 h-5 animate-pulse" />
                      Diagnosing Plant Health...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Diagnose Plant Health
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Weather Context Panel */}
            <div className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0B8F68]" />
                  <p className="section-label">Weather Context</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onFetchLocation}
                    disabled={isLocating}
                    className="btn btn-secondary btn-sm gap-1"
                    title="Refresh weather from GPS"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    {isLocating ? 'Locating...' : 'Refresh'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWeatherModal(true)}
                    className="btn btn-secondary btn-sm gap-1"
                    title="Set manual weather data"
                  >
                    <Settings2 className="w-3 h-3" />
                    Manual
                  </button>
                </div>
              </div>

              {locationData ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#64736C] shrink-0" />
                    <span className="text-xs font-semibold text-[#10231D]">
                      {locationData.location.city}, {locationData.location.state}
                    </span>
                    {(() => {
                      const saved = typeof window !== 'undefined' && localStorage.getItem('flora_ai_manual_weather')
                      return saved ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">MANUAL</span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">LIVE GPS</span>
                      )
                    })()}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#F9FDF9] border border-[#E0EBE4]">
                      <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-bold text-[#10231D]">{locationData.weather.temperature_c}°C</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#F9FDF9] border border-[#E0EBE4]">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-bold text-[#10231D]">{locationData.weather.humidity_percent}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#F9FDF9] border border-[#E0EBE4]">
                      <Wind className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-bold text-[#10231D]">{locationData.weather.wind_kmh}km/h</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#64736C]">{locationData.weather.condition}</p>
                </>
              ) : (
                <div className="text-xs text-[#64736C] py-1">
                  {isLocating ? 'Fetching location from GPS...' : 'Weather context not available. Click Refresh or set Manual data.'}
                </div>
              )}
            </div>
          </div>

          {/* Right column — result / loader / placeholder */}
          <div className="lg:col-span-7">
            {isPredicting ? (
              <AnalysisLoader imageUrl={previewUrl} cropName={cropLabel} />
            ) : prediction ? (
              <div className="space-y-5">

                {/* Result header */}
                <div className="card p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge badge-green">
                        <CheckCircle2 className="w-3 h-3" />
                        Diagnosis Complete
                      </span>
                      <span className="text-xs text-[#66736C] font-medium uppercase tracking-wider">{prediction.crop}</span>
                    </div>
                    <span className={`badge ${
                      prediction.disease_info.severity?.toLowerCase() === 'severe' ? 'badge-red' :
                      prediction.disease_info.severity?.toLowerCase() === 'moderate' ? 'badge-amber' :
                      prediction.disease_info.severity?.toLowerCase() === 'low' ? 'badge-green' : 'badge-slate'
                    }`}>
                      {prediction.disease_info.severity} Severity
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-[#17211D] leading-tight">
                        {prediction.predicted_class}
                      </h2>
                      <p className="text-xs text-[#66736C] mt-1.5 leading-relaxed max-w-lg">
                        {prediction.analysis_summary}
                      </p>
                    </div>
                    {/* Health score */}
                    <div className="shrink-0 text-center p-3 rounded-xl bg-[#F0FAF4] border border-[#B0D8C4]">
                      <div className="text-2xl font-bold text-[#159A70]">{prediction.health_score}</div>
                      <div className="text-[10px] text-[#159A70] font-semibold">/ 100</div>
                      <div className="text-[9px] text-[#66736C] mt-0.5">Health Index</div>
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
                        <h4 className="font-bold text-[#10231D]">Symptoms & Pathology</h4>
                        <p className="text-[#64736C] text-xs">{prediction.disease_info.description}</p>
                      </div>
                    )}
                    {tab === 'causes' && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-[#10231D]">Environmental & Moisture Factors</h4>
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
                        <h4 className="font-bold text-[#10231D]">Long-Term Prevention</h4>
                        <p className="text-[#64736C] text-xs">{prediction.disease_info.prevention}</p>
                      </div>
                    )}
                  </div>

                  {/* Top 3 - names only, no percentages */}
                  <div className="pt-4 border-t border-[#EDF7F2] space-y-2">
                    <p className="section-label">Possible Conditions</p>
                    {prediction.top3.map((item, i) => (
                      <div key={item.class} className="flex items-center gap-2 py-1">
                        <span className="w-5 h-5 rounded-full bg-[#F5FBF7] border border-[#D4E8DC] flex items-center justify-center text-[9px] font-700 text-[#0B8F68] shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-xs text-[#10231D] font-medium flex-1 truncate">{item.class}</span>
                        {i === 0 && (
                          <span className="badge badge-green text-[9px]">Top Match</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => navigate('/result')} className="btn btn-primary flex-1 min-w-0">
                    <CheckCircle2 className="w-4 h-4" />
                    View Detailed Report
                  </button>
                  <button type="button" onClick={onReset} className="btn btn-secondary">
                    <Scan className="w-4 h-4" />
                    Scan Another
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
                  <h3 className="text-xl font-bold text-[#10231D]">Ready to Diagnose</h3>
                  <p className="text-sm text-[#64736C] leading-relaxed">
                    Select a crop type, upload your leaf photo (or pick a sample from the left), then click <strong>Diagnose Plant Health</strong>.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-[#64736C]">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#0B8F68]" /> AI disease detection</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#0B8F68]" /> Visual heatmap</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#0B8F68]" /> Treatment guide</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ManualWeatherModal
        isOpen={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
        currentLocationData={locationData}
        onSave={() => {}}
        onResetToLive={onFetchLocation}
      />
    </>
  )
}
