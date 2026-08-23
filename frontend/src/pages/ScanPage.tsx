// ScanPage.tsx — Diagnostic Workbench
import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  RotateCcw,
  Scan,
  Microscope,
} from 'lucide-react'
import { CropSelector } from '../components/CropSelector'
import { ImageUploader } from '../components/ImageUploader'
import { CameraScanner } from '../components/CameraScanner'
import { AnalysisLoader } from '../components/AnalysisLoader'
import { HeatmapViewer } from '../components/HeatmapViewer'
import { TreatmentCard } from '../components/TreatmentCard'
import { WeatherCard } from '../components/WeatherCard'
import { MOCK_CROPS } from '../data/mockData'
import type { Crop, PredictionResponse, LocationContextData } from '../types'

export type { Crop, PredictionResponse }

interface ScanPageProps {
  crops?: Crop[]
  selectedCrop: string
  setSelectedCrop: (c: string) => void
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

const SAMPLES = [
  { crop: 'rice', label: 'Rice Blast', key: 'rice_blast' },
  { crop: 'wheat', label: 'Yellow Rust', key: 'wheat_yellow_rust' },
  { crop: 'sugarcane', label: 'Red Rot', key: 'sugarcane_red_rot' },
  { crop: 'cotton', label: 'Bacterial Blight', key: 'cotton_bacterial_blight' },
]

export function ScanPage({
  crops = MOCK_CROPS,
  selectedCrop,
  setSelectedCrop,
  selectedFile,
  previewUrl,
  onFileChange,
  onSelectSamplePreset,
  onAnalyzePlant,
  isPredicting,
  prediction,
  locationData,
  onFetchLocation,
  isLocating,
  error,
  onReset,
}: ScanPageProps) {
  const [showCamera, setShowCamera] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')

  const cropLabel = crops.find((c) => c.name === selectedCrop)?.label ?? selectedCrop

  function handleCameraCapture(file: File) {
    setShowCamera(false)
    onFileChange(file)
  }

  function handleValidatedAnalyze() {
    if (!selectedFile && !previewUrl) return
    onAnalyzePlant()
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'causes', label: 'Causes' },
    { id: 'treatment', label: 'Treatment' },
    { id: 'prevention', label: 'Prevention' },
  ]

  return (
    <>
      {showCamera && (
        <CameraScanner
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          onUploadInstead={() => setShowCamera(false)}
        />
      )}

      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        
        {/* ── Top Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
            padding: '20px 24px',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#159A70' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#159A70', letterSpacing: '0.05em' }}>
                Pathology Diagnostic Terminal
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Specimen Input & Inference Module
            </h1>
          </div>

          <button
            type="button"
            onClick={onReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <RotateCcw style={{ width: '14px', height: '14px' }} />
            Reset Workspace
          </button>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* ── Left Column: Controls & Input ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Step 1: Crop Select */}
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: '12px' }}>
                1. Select Target Crop
              </span>
              <CropSelector crops={crops} selectedCrop={selectedCrop} onSelect={setSelectedCrop} />
            </div>

            {/* Step 2: Upload Area */}
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                2. Leaf Specimen Capture
              </span>

              <ImageUploader
                onFile={onFileChange}
                onCameraOpen={() => setShowCamera(true)}
                previewUrl={previewUrl}
                selectedFile={selectedFile}
                onClear={onReset}
              />

              {/* Benchmark Presets */}
              <div style={{ paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '8px' }}>
                  Or Load Calibrated Test Specimen:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {SAMPLES.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => onSelectSamplePreset(s.crop, s.key)}
                      style={{
                        padding: '8px 10px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <ImagePlus style={{ width: '13px', height: '13px', color: '#159A70', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Environmental Context */}
              <div style={{ paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                <WeatherCard data={locationData} isLoading={isLocating} onRefresh={onFetchLocation} compact />
              </div>

              {/* Error box */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', fontSize: '12px' }}>
                  <AlertTriangle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{error}</span>
                </div>
              )}

              {/* Run Inference Button */}
              <button
                type="button"
                onClick={handleValidatedAnalyze}
                disabled={isPredicting || (!selectedFile && !previewUrl)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: isPredicting || (!selectedFile && !previewUrl) ? '#94A3B8' : '#159A70',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: isPredicting || (!selectedFile && !previewUrl) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(21,154,112,0.25)',
                }}
              >
                {isPredicting ? (
                  <>
                    <Scan style={{ width: '18px', height: '18px' }} />
                    Running Neural Inference...
                  </>
                ) : (
                  <>
                    <Scan style={{ width: '18px', height: '18px' }} />
                    Run Diagnostic Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Right Column: Output / Heatmap / Diagnostics ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isPredicting ? (
              <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '32px' }}>
                <AnalysisLoader imageUrl={previewUrl} cropName={cropLabel} />
              </div>
            ) : prediction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Result Top Card */}
                <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 style={{ width: '16px', height: '16px', color: '#159A70' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#159A70', textTransform: 'uppercase' }}>Classification Complete</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '6px' }}>
                      {prediction.disease_info.severity} Severity
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        {prediction.predicted_class}
                      </h2>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                        {prediction.analysis_summary}
                      </p>
                    </div>

                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '10px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#159A70' }}>{prediction.health_score}</div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#159A70' }}>Health Index</div>
                    </div>
                  </div>
                </div>

                {/* Grad-CAM Viewer */}
                <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: '12px' }}>
                    Grad-CAM Class Activation Map
                  </span>
                  <HeatmapViewer
                    originalImage={prediction.original_image}
                    highlightedImage={prediction.highlighted_image}
                    affectedAreaPercent={prediction.affected_area_percent ?? 18}
                  />
                </div>

                {/* Pathology Details Tabs */}
                <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '14px' }}>
                    {tabs.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: tab === t.id ? 700 : 500,
                          background: tab === t.id ? '#159A70' : 'transparent',
                          color: tab === t.id ? '#ffffff' : '#64748B',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                    {tab === 'overview' && <p style={{ margin: 0 }}>{prediction.disease_info.description}</p>}
                    {tab === 'causes' && <p style={{ margin: 0 }}>{prediction.disease_info.causes}</p>}
                    {tab === 'treatment' && (
                      <TreatmentCard
                        treatment={prediction.disease_info.treatment}
                        prevention={prediction.disease_info.prevention}
                        severity={prediction.disease_info.severity}
                      />
                    )}
                    {tab === 'prevention' && <p style={{ margin: 0 }}>{prediction.disease_info.prevention}</p>}
                  </div>
                </div>

              </div>
            ) : (
              /* Empty Standby State */
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '48px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: '360px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F1F5F9', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Microscope style={{ width: '24px', height: '24px', color: '#64748B' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Inference Output Standby
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '340px', margin: 0, lineHeight: 1.5 }}>
                  Select a crop, upload a leaf specimen or pick a benchmark preset from the left panel, and initiate diagnostic analysis.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </>
  )
}