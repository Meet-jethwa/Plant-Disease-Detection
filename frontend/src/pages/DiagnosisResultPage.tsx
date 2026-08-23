// DiagnosisResultPage.tsx — Clean, consistent Plant Health Report
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Download, Share2, Scan, MessageSquare,
  Bookmark, AlertCircle, Leaf, FlaskConical, Info,
  CheckCircle2, AlertTriangle, ShieldAlert
} from 'lucide-react'
import { HealthScore } from '../components/HealthScore'
import { HeatmapViewer } from '../components/HeatmapViewer'
import { TreatmentCard } from '../components/TreatmentCard'
import { DiseaseRisk } from '../components/DiseaseRisk'
import { WeatherCard } from '../components/WeatherCard'
import type { PredictionResponse, LocationContextData } from '../types'

interface DiagnosisResultPageProps {
  prediction: PredictionResponse
  locationData: LocationContextData | null
  onReset: () => void
  onSaveToPlants?: () => void
}

function getSeverityMeta(severity: string, isHealthy: boolean) {
  if (isHealthy) return {
    label: 'No Disease Detected',
    color: '#159A70',
    bg: '#DDF3E8',
    border: '#B0D8C4',
    Icon: CheckCircle2,
  }
  const s = severity.toLowerCase()
  if (s === 'low')      return { label: 'Low Severity',      color: '#159A70', bg: '#DDF3E8', border: '#B0D8C4', Icon: ShieldAlert }
  if (s === 'moderate') return { label: 'Moderate Severity', color: '#E89B24', bg: '#FEF3C7', border: '#FDE68A', Icon: AlertTriangle }
  if (s === 'high')     return { label: 'High Severity',     color: '#EA580C', bg: '#FFEDD5', border: '#FED7AA', Icon: AlertTriangle }
  if (s === 'severe' || s === 'critical') return { label: 'Critical Severity', color: '#D9534F', bg: '#FEE2E2', border: '#FECACA', Icon: AlertCircle }
  return { label: severity, color: '#66736C', bg: '#F7F8F3', border: '#E0EBE4', Icon: Info }
}

export function DiagnosisResultPage({
  prediction,
  locationData,
  onReset,
  onSaveToPlants,
}: DiagnosisResultPageProps) {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  const disease = prediction.disease_info
  const isHealthy = prediction.predicted_class.toLowerCase().includes('healthy')
  const severityMeta = getSeverityMeta(disease.severity, isHealthy)
  const SeverityIcon = severityMeta.Icon

  const symptoms = prediction.symptoms ?? [
    { name: 'Leaf Discoloration', confidence: prediction.confidence_percent },
    { name: 'Lesion Formation', confidence: Math.max(0, prediction.confidence_percent - 15) },
    { name: 'Tissue Damage', confidence: Math.max(0, prediction.confidence_percent - 28) },
  ]

  const causes = prediction.possible_causes ?? [
    { name: 'Primary Pathogen', description: disease.causes },
    { name: 'Environmental Stress', description: 'High humidity and poor air circulation favour disease spread.' },
  ]

  function handleSave() {
    setSaved(true)
    onSaveToPlants?.()
  }

  function handleDownload() {
    const report = [
      'FloraAI Diagnosis Report',
      '=========================',
      `Crop:         ${prediction.crop}`,
      `Disease:      ${prediction.predicted_class}`,
      `Confidence:   ${prediction.confidence_percent.toFixed(1)}%`,
      `Health Score: ${prediction.health_score}/100`,
      `Severity:     ${disease.severity}`,
      '---',
      disease.description,
      '',
      'Treatment:',
      disease.treatment,
      '',
      'Prevention:',
      disease.prevention,
    ].join('\n')
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `FloraAI_Report_${prediction.crop}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleShare() {
    if (navigator.share) {
      void navigator.share({
        title: `FloraAI: ${prediction.predicted_class}`,
        text: `${prediction.crop} diagnosed with ${prediction.predicted_class} (${prediction.confidence_percent.toFixed(1)}% confidence). Health score: ${prediction.health_score}/100`,
        url: window.location.href,
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in">

      {/* ── Back header ── */}
      <div className="flex items-center gap-3 mb-5 px-4 sm:px-0">
        <button
          type="button"
          onClick={() => navigate('/scan')}
          className="btn btn-secondary btn-icon"
          aria-label="Back to scanner"
          id="result-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-700 text-[#10231D]">Plant Health Report</h1>
          <p className="text-sm text-[#64736C] capitalize">{prediction.crop}</p>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="mb-5 overflow-hidden rounded-2xl border border-[#D4E8DC] shadow-sm">
        {/* Status bar */}
        <div
          className="px-5 py-3 flex items-center gap-2.5 border-b"
          style={{ background: severityMeta.bg, borderColor: severityMeta.border }}
        >
          <SeverityIcon className="w-4 h-4 shrink-0" style={{ color: severityMeta.color }} />
          <span className="text-sm font-700" style={{ color: severityMeta.color }}>
            {severityMeta.label}
          </span>
          <span
            className="ml-auto text-xs font-600 px-2.5 py-0.5 rounded-full"
            style={{ background: severityMeta.color + '18', color: severityMeta.color }}
          >
            {prediction.confidence_percent.toFixed(1)}% confidence
          </span>
        </div>

        <div className="grid lg:grid-cols-[auto_1fr] bg-white">
          {/* Image panel */}
          <div className="relative h-64 lg:h-auto lg:w-72 bg-[#06251C] flex items-center justify-center overflow-hidden">
            {prediction.original_image ? (
              <img
                src={prediction.original_image}
                alt={`${prediction.crop} leaf`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#DDF7EA] opacity-40">
                <Leaf className="w-14 h-14" />
                <span className="text-xs">No image preview</span>
              </div>
            )}
          </div>

          {/* Summary panel */}
          <div className="p-5 flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-700 text-[#64736C] uppercase tracking-wider mb-1">Detected Condition</p>
              <h2 className="text-2xl font-800 text-[#10231D] leading-tight">
                {prediction.predicted_class.replace(/_/g, ' ')}
              </h2>
              {prediction.scientific_name && (
                <p className="text-sm italic text-[#64736C] mt-1 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                  {prediction.scientific_name}
                </p>
              )}
            </div>

            <p className="text-sm text-[#4A5E52] leading-relaxed line-clamp-3">
              {disease.description}
            </p>

            {/* Top-3 predictions */}
            {prediction.top3 && prediction.top3.length > 0 && (
              <div>
                <p className="text-[11px] font-700 text-[#64736C] uppercase tracking-wider mb-2">Model Predictions</p>
                <div className="space-y-2">
                  {prediction.top3.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#F5FBF7] border border-[#D4E8DC] flex items-center justify-center text-[9px] font-700 text-[#0B8F68] shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs text-[#10231D] font-500 flex-1 truncate">
                        {item.class.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-700 text-[#64736C] shrink-0">
                        {(item.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-[#D4E8DC]">
              <button
                type="button"
                onClick={handleSave}
                disabled={saved}
                className={`btn ${saved ? 'btn-secondary' : 'btn-primary'} btn-sm gap-1.5`}
                id="result-save-btn"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {saved ? 'Saved' : 'Save Plant'}
              </button>
              <button type="button" onClick={handleDownload} className="btn btn-secondary btn-sm gap-1.5" id="result-download-btn">
                <Download className="w-3.5 h-3.5" />
                Download Report
              </button>
              {'share' in navigator && (
                <button type="button" onClick={handleShare} className="btn btn-secondary btn-sm gap-1.5" id="result-share-btn">
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Health Score + Diagnosis Details ── */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5 px-4 sm:px-0">
        <div className="card p-5">
          <p className="text-[11px] font-700 text-[#64736C] uppercase tracking-wider mb-4">Health Score</p>
          <HealthScore score={prediction.health_score} isHealthy={isHealthy} />
        </div>

        <div className="card p-5">
          <p className="text-[11px] font-700 text-[#64736C] uppercase tracking-wider mb-4">Diagnosis Details</p>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-700 mb-4"
            style={{ background: severityMeta.bg, borderColor: severityMeta.border, color: severityMeta.color }}
          >
            <SeverityIcon className="w-4 h-4" />
            {severityMeta.label}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-600 text-[#64736C]">AI Confidence</span>
              <span className="text-sm font-700 text-[#10231D]">{prediction.confidence_percent.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#EDF7F2] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${prediction.confidence_percent}%`, background: severityMeta.color }}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-600 text-[#64736C] mb-2">Root Causes</p>
            <div className="space-y-2.5">
              {causes.map((cause, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#DDF7EA] border border-[#B9E8D1] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-700 text-[#0B8F68]">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-xs font-600 text-[#10231D]">{cause.name}</p>
                    <p className="text-[11px] text-[#64736C] mt-0.5 leading-relaxed">{cause.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grad-CAM Visual Analysis ── */}
      <div className="mb-5 px-4 sm:px-0">
        <p className="text-[11px] font-700 text-[#64736C] uppercase tracking-wider mb-3">AI Visual Analysis (Grad-CAM)</p>
        <HeatmapViewer
          originalImage={prediction.original_image}
          highlightedImage={prediction.highlighted_image}
          affectedAreaPercent={prediction.affected_area_percent}
        />
      </div>

      {/* ── Symptoms Detected ── */}
      {!isHealthy && (
        <div className="mb-5 px-4 sm:px-0">
          <p className="text-[11px] font-700 text-[#64736C] uppercase tracking-wider mb-3">Symptoms Detected</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {symptoms.map((s, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-600 text-[#10231D]">{s.name}</p>
                  <span
                    className="text-xs font-700"
                    style={{ color: s.confidence >= 70 ? '#DC2626' : s.confidence >= 45 ? '#D97706' : '#0B8F68' }}
                  >
                    {s.confidence.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#EDF7F2] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.confidence}%`,
                      background: s.confidence >= 70 ? '#DC2626' : s.confidence >= 45 ? '#D97706' : '#0B8F68',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Analysis Summary ── */}
      <div className="mb-5 px-4 sm:px-0">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-[#0B8F68]" />
            <p className="text-sm font-semibold text-[#17211D]">Why FloraAI thinks this</p>
          </div>
          <p className="text-sm text-[#4A5E52] leading-relaxed">{prediction.analysis_summary}</p>
        </div>
      </div>

      {/* ── Weather + Risk ── */}
      {(locationData ?? prediction.weather_context) && (
        <div className="mb-5 px-4 sm:px-0 grid sm:grid-cols-2 gap-4">
          {locationData && (
            <div>
              <p className="text-[11px] font-700 text-[#64736C] uppercase tracking-wider mb-3">Current Conditions</p>
              <WeatherCard data={locationData} isLoading={false} onRefresh={() => {}} />
            </div>
          )}
          {(prediction.weather_context?.risk_level ?? locationData?.risk_level) && (
            <div>
              <p className="text-[11px] font-700 text-[#64736C] uppercase tracking-wider mb-3">Disease Risk</p>
              <DiseaseRisk
                riskLevel={prediction.weather_context?.risk_level ?? locationData?.risk_level ?? 'Low'}
                riskReason={prediction.weather_context?.risk_reason ?? locationData?.risk_reason}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Treatment Plan ── */}
      {!isHealthy && (
        <div className="mb-5 px-4 sm:px-0">
          <p className="text-[11px] font-700 text-[#64736C] uppercase tracking-wider mb-3">Treatment Plan</p>
          <TreatmentCard treatment={disease.treatment} prevention={disease.prevention} severity={disease.severity} />
        </div>
      )}

      {/* ── Expert alert for severe/high cases ── */}
      {['severe', 'critical', 'high'].includes(disease.severity.toLowerCase()) && (
        <div className="mb-5 px-4 sm:px-0">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-700 text-red-800 mb-0.5">Consult an Expert</p>
              <p className="text-sm text-red-700">
                This diagnosis indicates a {disease.severity.toLowerCase()} condition. Consult a local agronomist or plant pathologist before applying treatment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom actions ── */}
      <div className="px-4 sm:px-0 grid sm:grid-cols-2 gap-3 pb-8">
        <button
          type="button"
          onClick={onReset}
          className="btn btn-outline btn-lg gap-2"
          id="result-scan-another-btn"
        >
          <Scan className="w-5 h-5" />
          Scan Another Plant
        </button>
        <button
          type="button"
          onClick={() => navigate('/assistant')}
          className="btn btn-primary btn-lg gap-2"
          id="result-ask-doctor-btn"
        >
          <MessageSquare className="w-5 h-5" />
          Ask AI Chat
        </button>
      </div>
    </div>
  )
}
