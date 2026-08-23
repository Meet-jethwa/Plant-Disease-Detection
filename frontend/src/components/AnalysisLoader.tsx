// AnalysisLoader.tsx — AI scanning animation with stage progress
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const STAGES = [
  'Image quality checked',
  'Plant structure detected',
  'Analyzing visible symptoms',
  'Identifying disease pattern',
  'Estimating severity level',
  'Preparing treatment plan',
]

interface AnalysisLoaderProps {
  imageUrl: string | null
  cropName: string
}

export function AnalysisLoader({ imageUrl, cropName }: AnalysisLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0)

  useEffect(() => {
    if (currentStage >= STAGES.length - 1) return
    const t = setTimeout(() => setCurrentStage(s => s + 1), 900)
    return () => clearTimeout(t)
  }, [currentStage])

  return (
    <div className="card-lg p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF7EA] border border-[#B9E8D1] text-[#065E44] text-xs font-bold">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B8F68]" />
          <span>AI Analysis in Progress</span>
        </div>
        <h2 className="text-xl font-bold text-[#10231D]">Analyzing Your Plant</h2>
        <p className="text-sm text-[#64736C]">
          FloraAI is examining visible symptoms on your {cropName} leaf.
        </p>
      </div>

      {/* Image with scanning effect */}
      <div className="relative rounded-xl overflow-hidden border border-[#D4E8DC] aspect-video bg-[#06251C] max-h-56 mx-auto max-w-sm">
        {imageUrl && (
          <img src={imageUrl} alt="Analyzing" className="w-full h-full object-contain opacity-80" />
        )}
        {/* Scanning overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B8F68]/10 to-transparent animate-scan-pulse" />
        {/* Moving scan line */}
        <div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#0B8F68] to-transparent opacity-90"
          style={{ animation: 'scan-line 2s ease-in-out infinite' }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(to right, #0B8F68 1px, transparent 1px), linear-gradient(to bottom, #0B8F68 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Progress stages */}
      <div className="space-y-2.5 max-w-xs mx-auto">
        {STAGES.map((stage, i) => {
          const isDone    = i < currentStage
          const isActive  = i === currentStage
          const isPending = i > currentStage
          return (
            <div key={stage} className={`flex items-center gap-3 transition-all duration-300 ${isPending ? 'opacity-40' : ''}`}>
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#0B8F68]" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-[#0B8F68] animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-[#D4E8DC]" />
                )}
              </div>
              <span className={`text-xs font-medium ${isDone ? 'text-[#0B8F68]' : isActive ? 'text-[#10231D] font-semibold' : 'text-[#94A09B]'}`}>
                {stage}
              </span>
            </div>
          )
        })}
      </div>

      {/* Overall progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[#64736C] font-medium">
          <span>Processing</span>
          <span>{Math.round(((currentStage + 1) / STAGES.length) * 100)}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
