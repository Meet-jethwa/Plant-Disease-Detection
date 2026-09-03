// AnalysisLoader.tsx — BioScan Lab AI scanning animation
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const STAGES = [
  { label: 'IMAGE QUALITY VERIFIED',    code: 'IMG_QC_OK' },
  { label: 'PLANT STRUCTURE DETECTED',  code: 'STRUCT_OK' },
  { label: 'SYMPTOM PATTERN ANALYSIS',  code: 'SYMP_SCAN' },
  { label: 'DISEASE CLASS MATCHING',    code: 'CLASSFY'   },
  { label: 'SEVERITY INDEX COMPUTING',  code: 'SEV_CALC'  },
  { label: 'TREATMENT PROTOCOL GEN',    code: 'TRMT_GEN'  },
]

interface AnalysisLoaderProps {
  imageUrl: string | null
  cropName: string
}

export function AnalysisLoader({ imageUrl, cropName }: AnalysisLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0)

  useEffect(() => {
    if (currentStage >= STAGES.length - 1) return
    const t = setTimeout(() => setCurrentStage(s => s + 1), 850)
    return () => clearTimeout(t)
  }, [currentStage])

  const progress = Math.round(((currentStage + 1) / STAGES.length) * 100)

  return (
    <div className="bio-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 999,
          background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)',
          marginBottom: 12,
        }}>
          <Loader2 style={{ width: 13, height: 13, color: 'var(--neon-green)', animation: 'bio-spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--neon-green)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            AI ANALYSIS RUNNING
          </span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em', marginBottom: 4 }}>
          SCANNING PLANT
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          TARGET: {cropName.toUpperCase()} — RUNNING BIOSCAN PROTOCOL
        </p>
      </div>

      {/* Image with scanning effect */}
      {imageUrl && (
        <div style={{
          position: 'relative', borderRadius: 10, overflow: 'hidden',
          border: '1px solid rgba(0,255,136,0.3)',
          aspectRatio: '16/9', background: '#020906',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          maxHeight: 220, margin: '0 auto', width: '100%', maxWidth: 360,
          boxShadow: '0 0 24px rgba(0,255,136,0.12)',
        }}>
          <img src={imageUrl} alt="Analyzing" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.75 }} />
          {/* Scanning overlay pulse */}
          <div className="animate-scan-pulse" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,255,136,0.08) 0%, transparent 50%, rgba(0,255,136,0.04) 100%)',
          }} />
          {/* Moving scan line */}
          <div className="animate-scan-line" />
          {/* Grid lines */}
          <div className="scan-overlay" />
          {/* Scanner corners */}
          <div className="scanner-frame scanner-frame-br" />
          {/* Progress overlay bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            padding: '12px 10px 8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', letterSpacing: '0.06em' }}>
                {STAGES[currentStage]?.code}
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                {progress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress stages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 340, margin: '0 auto', width: '100%' }}>
        {STAGES.map((stage, i) => {
          const isDone = i < currentStage
          const isActive = i === currentStage
          const isPending = i > currentStage
          return (
            <div key={stage.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: isPending ? 0.3 : 1,
              transition: 'opacity 0.4s ease',
            }}>
              <div style={{ flexShrink: 0, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isDone ? (
                  <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--neon-green)' }} />
                ) : isActive ? (
                  <Loader2 style={{ width: 14, height: 14, color: 'var(--neon-cyan)', animation: 'bio-spin 0.9s linear infinite' }} />
                ) : (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border-base)', margin: '0 4px' }} />
                )}
              </div>
              <span style={{
                fontSize: '0.7rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                color: isDone ? 'var(--neon-green)' : isActive ? 'var(--text-primary)' : 'var(--text-dim)',
                fontWeight: isActive ? 600 : 400,
              }}>
                {stage.label}
              </span>
              {isDone && (
                <span style={{ marginLeft: 'auto', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', opacity: 0.6 }}>OK</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Overall progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>ANALYSIS PROGRESS</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
