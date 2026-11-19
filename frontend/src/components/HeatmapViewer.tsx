// HeatmapViewer.tsx — Interactive Grad-CAM visual analysis viewer
import { useState } from 'react'
import { Eye, Maximize2, X, Info, Layers, ZoomIn, Flame } from 'lucide-react'

interface HeatmapViewerProps {
  originalImage: string
  highlightedImage: string
  gradcamHeatmap?: string          // pure JET colormap (no blend)
  activationCoveragePercent?: number
  affectedAreaPercent?: number
}

type ViewMode = 'gradcam' | 'heatmap' | 'original'

const COLOR_SCALE = [
  { label: 'Peak Activation',   color: '#DC2626', desc: 'Strongest influence on diagnosis (>0.75)' },
  { label: 'High Salience',     color: '#EA580C', desc: 'Elevated visual attention (0.50–0.75)' },
  { label: 'Moderate Salience', color: '#D97706', desc: 'Contextual leaf patterns (0.25–0.50)' },
  { label: 'Low Salience',      color: '#65A30D', desc: 'Minor model influence (0.10–0.25)' },
  { label: 'Baseline / Foliar', color: '#2563EB', desc: 'Background leaf tissue (<0.10)' },
]

export function HeatmapViewer({
  originalImage,
  highlightedImage,
  gradcamHeatmap,
  activationCoveragePercent,
  affectedAreaPercent,
}: HeatmapViewerProps) {
  const [mode, setMode] = useState<ViewMode>('gradcam')
  const [fullscreen, setFullscreen] = useState(false)
  const [showLegend, setShowLegend] = useState(true)

  const coverage = activationCoveragePercent ?? affectedAreaPercent

  const hasRawHeatmap = Boolean(gradcamHeatmap)

  function ImageView({ maxH }: { maxH: string }) {
    if (mode === 'original') {
      return (
        <img
          src={originalImage}
          alt="Original plant leaf"
          className={`w-full object-contain block ${maxH}`}
        />
      )
    }

    if (mode === 'heatmap' && hasRawHeatmap && gradcamHeatmap) {
      return (
        <img
          src={gradcamHeatmap}
          alt="Pure Grad-CAM heatmap activation map"
          className={`w-full object-contain block ${maxH}`}
        />
      )
    }

    // Default Grad-CAM mode: render composite highlightedImage
    // Fall back to original with screen-blended heatmap if highlightedImage is empty
    if (highlightedImage) {
      return (
        <img
          src={highlightedImage}
          alt="Grad-CAM visual attention overlay"
          className={`w-full object-contain block ${maxH}`}
        />
      )
    }

    if (hasRawHeatmap && gradcamHeatmap) {
      return (
        <div className="relative">
          <img
            src={originalImage}
            alt="Original plant leaf"
            className={`w-full object-contain block ${maxH}`}
          />
          <img
            src={gradcamHeatmap}
            alt="Grad-CAM heatmap"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ mixBlendMode: 'screen', opacity: 0.88 }}
          />
        </div>
      )
    }

    return (
      <img
        src={originalImage}
        alt="Original plant leaf"
        className={`w-full object-contain block ${maxH}`}
      />
    )
  }

  const tabs: Array<{ key: ViewMode; label: string; icon: React.ReactNode }> = [
    { key: 'gradcam', label: 'Grad-CAM Overlay', icon: <Layers className="w-3.5 h-3.5" /> },
    ...(hasRawHeatmap
      ? [{ key: 'heatmap' as ViewMode, label: 'Pure Heatmap', icon: <Flame className="w-3.5 h-3.5" /> }]
      : []),
    { key: 'original', label: 'Original', icon: <Eye className="w-3.5 h-3.5" /> },
  ]

  return (
    <>
      {/* ── Main Card ─────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E4E7E2] bg-white overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E7E2] bg-[#F2F4F0]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-[#E4E7E2] flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-[var(--color-green-700)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-ink)] leading-none">Grad-CAM Analysis</p>
              <p className="text-sm text-[var(--color-ink-2)] mt-0.5">AI visual attention map</p>
            </div>
          </div>

          {/* Activation coverage badge + fullscreen */}
          <div className="flex items-center gap-2">
            {coverage !== undefined && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                ~{coverage}% attention coverage
              </div>
            )}
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="w-7 h-7 rounded-lg bg-white border border-[#E4E7E2] flex items-center justify-center hover:bg-[#F2F4F0] transition-colors cursor-pointer"
              aria-label="View fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[var(--color-ink-2)]" />
            </button>
          </div>
        </div>

        {/* Mode selector tabs */}
        <div className="flex gap-1 p-3 bg-[#F2F4F0] border-b border-[#E4E7E2]">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex-1 justify-center cursor-pointer min-h-[36px] ${
                mode === key
                  ? 'bg-[var(--color-green-700)] text-white shadow-sm'
                  : 'bg-white text-[var(--color-ink-2)] border border-[#E4E7E2] hover:border-[var(--color-green-700)] hover:text-[var(--color-green-700)]'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Image display area */}
        <div className="relative bg-[#0e0e0e] select-none border-b border-[#D4E8DC]" style={{ minHeight: 300 }}>
          <ImageView maxH="max-h-[420px]" />

          {/* Color legend (top-right) — only in Grad-CAM / heatmap mode */}
          {showLegend && mode !== 'original' && (
            <div className="absolute top-3 right-3 bg-black/65 backdrop-blur-sm rounded-xl p-2.5 space-y-1.5 z-10">
              <p className="text-xs font-semibold text-white/80 mb-1">Intensity</p>
              {COLOR_SCALE.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
                  <span className="text-[9px] font-600 text-white">{label}</span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="text-[8px] text-white/40 hover:text-white/70 mt-1 block w-full text-center"
              >
                hide
              </button>
            </div>
          )}

          {/* Mode label pill (bottom-left) */}
          <div className="absolute bottom-3 left-3 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
              <span className="text-xs font-semibold text-white">
                {mode === 'original'
                  ? 'Original uploaded image'
                  : mode === 'heatmap'
                  ? 'Pure JET colormap activation map'
                  : 'AI attention heatmap overlay'}
              </span>
            </div>
          </div>
        </div>

        {/* Intensity scale bar */}
        <div className="px-4 py-3 border-t border-[#E4E7E2]">
          <p className="text-sm font-semibold text-[var(--color-ink)] mb-2">Activation intensity scale</p>
          <div className="flex gap-1">
            {COLOR_SCALE.map(({ label, color, desc }) => (
              <div key={label} className="flex-1 group relative">
                <div className="h-2 rounded-sm" style={{ background: color }} />
                <p className="text-xs text-[#64736C] mt-1 text-center hidden sm:block">{label}</p>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#10231D] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {desc}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-[#64736C] mt-1">
            <span>Baseline Attention (Cool)</span>
            <span>Peak Activation (Hot)</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border-t border-amber-100">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Grad-CAM</strong> reveals spatial regions where the convolutional image encoder concentrated its visual attention during classification. Warmer regions (red/orange) had the highest influence on this diagnosis, while cooler regions (blue/cyan) provided baseline context. Attention maps explain neural feature sensitivity, not verified biological lesion margins.
          </p>
        </div>
      </div>

      {/* ── Fullscreen Modal ───────────────────────────── */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal
          aria-label="Grad-CAM fullscreen viewer"
        >
          <div
            className="relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Fullscreen header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-green-700)]">
              <p className="text-sm font-bold text-white">Grad-CAM — Full View</p>
              <div className="flex gap-2">
                {tabs.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMode(key)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                      mode === key ? 'bg-white text-[var(--color-green-700)]' : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors ml-2"
                  aria-label="Close fullscreen"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Fullscreen image */}
            <div className="relative bg-[#0e0e0e]">
              <ImageView maxH="max-h-[70vh]" />

              {/* Fullscreen legend */}
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-xl p-3 space-y-2 z-10">
                <p className="text-sm font-medium text-white/80">Intensity scale</p>
                {COLOR_SCALE.map(({ label, color, desc }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />
                    <div>
                      <p className="text-xs font-semibold text-white leading-none">{label}</p>
                      <p className="text-xs text-white/60">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-2 bg-[var(--color-green-800)] text-sm text-white/80 text-center border-t border-white/10">
              Click outside to close ·{' '}
              {mode === 'original' ? 'Original uploaded image' : 'AI attention heatmap — red = disease hotspot'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
