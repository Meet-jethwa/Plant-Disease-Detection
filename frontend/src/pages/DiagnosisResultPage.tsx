// DiagnosisResultPage.tsx — Clean, Technical Pathology Assessment Report
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  Share2,
  Scan,
  MessageSquare,
  Bookmark,
  AlertCircle,
  Leaf,
  FlaskConical,
  Info,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
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
  if (isHealthy) {
    return {
      label: 'Healthy / No Pathogen Detected',
      color: '#159A70',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      Icon: CheckCircle2,
    }
  }
  const s = severity.toLowerCase()
  if (s === 'low') return { label: 'Low Severity', color: '#159A70', bg: '#ECFDF5', border: '#A7F3D0', Icon: ShieldAlert }
  if (s === 'moderate') return { label: 'Moderate Severity', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', Icon: AlertTriangle }
  if (s === 'high') return { label: 'High Severity', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', Icon: AlertTriangle }
  if (s === 'severe' || s === 'critical') return { label: 'Critical Severity', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', Icon: AlertCircle }
  return { label: severity, color: '#475569', bg: '#F8FAFC', border: '#E2E8F0', Icon: Info }
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

  const causes = prediction.possible_causes ?? [
    { name: 'Primary Pathogen', description: disease.causes },
    { name: 'Environmental Conditions', description: 'Elevated relative humidity and leaf moisture favor spore colonization.' },
  ]

  function handleSave() {
    setSaved(true)
    onSaveToPlants?.()
  }

  function handleDownload() {
    const report = [
      'Diagnostic Pathology Report',
      '===========================',
      `Target Crop:         ${prediction.crop}`,
      `Classification:      ${prediction.predicted_class}`,
      `Confidence:          ${prediction.confidence_percent.toFixed(1)}%`,
      `Health Score:        ${prediction.health_score}/100`,
      `Assessed Severity:   ${disease.severity}`,
      '---------------------------',
      disease.description,
      '',
      'Agronomic Treatment Protocol:',
      disease.treatment,
      '',
      'Long-term Prevention Strategy:',
      disease.prevention,
    ].join('\n')
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Pathology_Report_${prediction.crop}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* ── Top Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #E2E8F0', padding: '16px 24px', borderRadius: '14px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/scan')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: 'pointer' }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px', color: '#334155' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Pathological Assessment Report</h1>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, textTransform: 'capitalize' }}>Specimen Crop: {prediction.crop}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: saved ? '#F1F5F9' : '#ffffff', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: saved ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Bookmark style={{ width: '14px', height: '14px' }} />
            {saved ? 'Logged' : 'Save Record'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#159A70', fontSize: '13px', fontWeight: 600, color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download style={{ width: '14px', height: '14px' }} />
            Export Report
          </button>
        </div>
      </div>

      {/* ── Summary Card ── */}
      <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '12px 20px', background: severityMeta.bg, borderBottom: `1px solid ${severityMeta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SeverityIcon style={{ width: '16px', height: '16px', color: severityMeta.color }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: severityMeta.color }}>{severityMeta.label}</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: severityMeta.color }}>
            {prediction.confidence_percent.toFixed(1)}% Confidence
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', padding: '24px', gap: '24px' }}>
          <div style={{ height: '220px', background: '#0F172A', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {prediction.original_image ? (
              <img src={prediction.original_image} alt="Target Leaf" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Leaf style={{ width: '40px', height: '40px', color: '#334155' }} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>Identified Condition</span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '4px 0 0 0' }}>
                {prediction.predicted_class}
              </h2>
              {prediction.scientific_name && (
                <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#64748B', margin: '4px 0 0 0' }}>
                  {prediction.scientific_name}
                </p>
              )}
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '12px', lineHeight: 1.6 }}>
                {disease.description}
              </p>
            </div>

            {prediction.top3 && prediction.top3.length > 0 && (
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: '8px' }}>
                  Model Class Probabilities
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {prediction.top3.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#1E293B', fontWeight: 500 }}>{item.class}</span>
                      <span style={{ color: '#64748B', fontWeight: 700 }}>{(item.confidence * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Grad-CAM Saliency Analysis ── */}
      <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0F172A', display: 'block', marginBottom: '14px' }}>
          Grad-CAM Saliency & Region Attention
        </span>
        <HeatmapViewer
          originalImage={prediction.original_image}
          highlightedImage={prediction.highlighted_image}
          affectedAreaPercent={prediction.affected_area_percent}
        />
      </div>

      {/* ── Agronomic Treatment & Prevention ── */}
      {!isHealthy && (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0F172A', display: 'block', marginBottom: '14px' }}>
            Recommended Agronomic Action Plan
          </span>
          <TreatmentCard treatment={disease.treatment} prevention={disease.prevention} severity={disease.severity} />
        </div>
      )}

      {/* ── Bottom Action Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <button
          type="button"
          onClick={onReset}
          style={{ padding: '14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#ffffff', fontSize: '14px', fontWeight: 700, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Scan style={{ width: '16px', height: '16px' }} />
          Scan Another Specimen
        </button>
        <button
          type="button"
          onClick={() => navigate('/assistant')}
          style={{ padding: '14px', borderRadius: '10px', border: 'none', background: '#159A70', fontSize: '14px', fontWeight: 700, color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <MessageSquare style={{ width: '16px', height: '16px' }} />
          Query Diagnostic Assistant
        </button>
      </div>

    </div>
  )
}