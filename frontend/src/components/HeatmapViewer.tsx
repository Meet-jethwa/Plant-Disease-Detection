// HeatmapViewer.tsx — Interactive Grad-CAM visual analysis viewer
import { useState } from 'react'
import { Eye, Maximize2, X, Info, Layers, ZoomIn, Flame } from 'lucide-react'

interface HeatmapViewerProps {
  originalImage: string
  highlightedImage: string
  gradcamHeatmap?: string          // pure JET colormap (no blend)
  affectedAreaPercent?: number
}

type ViewMode = 'gradcam' | 'heatmap' | 'original'

const COLOR_SCALE = [
  { label: 'Critical',  color: '#DC2626', desc: 'Heavily affected' },
  { label: 'High',      color: '#EA580C', desc: 'Severely affected' },
  { label: 'Moderate',  color: '#D97706', desc: 'Moderately affected' },
  { label: 'Low',       color: '#65A30D', desc: 'Mildly affected' },
  { label: 'Healthy',   color: '#16A34A', desc: 'Unaffected region' },
]

export function HeatmapViewer({
  originalImage,
  highlightedImage,
  gradcamHeatmap,
  affectedAreaPercent = 18,
}: HeatmapViewerProps) {
  const [mode, setMode] = useState<ViewMode>('gradcam')
  const [fullscreen, setFullscreen] = useState(false)
  const [showLegend, setShowLegend] = useState(true)

  const severityColor =
    affectedAreaPercent >= 60 ? '#DC2626'
    : affectedAreaPercent >= 35 ? '#D97706'
    : '#16A34A'

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
      <div className="rounded-2xl border border-[#D4E8DC] bg-white overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#D4E8DC] bg-[#F5FBF7]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0B8F68]/10 flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-[#0B8F68]" />
            </div>
            <div>
              <p className="text-sm font-700 text-[#10231D] leading-none">Grad-CAM Analysis</p>
              <p className="text-[10px] text-[#64736C] mt-0.5">AI visual attention map</p>
            </div>
          </div>

          {/* Affected area badge + fullscreen */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600"
              style={{ background: severityColor + '15', color: severityColor }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: severityColor }} />
              ~{affectedAreaPercent}% affected
            </div>
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="w-7 h-7 rounded-lg bg-[#F5F8F5] border border-[#D4E8DC] flex items-center justify-center hover:bg-[#DDF7EA] transition-colors"
              aria-label="View fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#64736C]" />
            </button>
          </div>
        </div>

        {/* Mode selector tabs */}
        <div className="flex gap-1 p-3 bg-[#F5FBF7] border-b border-[#D4E8DC]">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 transition-all flex-1 justify-center ${
                mode === key
                  ? 'bg-[#0B8F68] text-white shadow-sm'
                  : 'bg-white text-[#64736C] border border-[#D4E8DC] hover:border-[#0B8F68]/40 hover:text-[#0B8F68]'
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
              <p className="text-[9px] font-700 text-white/70 uppercase tracking-wider mb-1">Intensity</p>
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
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
              <span className="text-[10px] font-600 text-white">
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
        <div className="px-4 py-3 border-t border-[#D4E8DC]">
          <p className="text-[10px] font-700 text-[#10231D] uppercase tracking-wider mb-2">Activation Intensity Scale</p>
          <div className="flex gap-1">
            {COLOR_SCALE.map(({ label, color, desc }) => (
              <div key={label} className="flex-1 group relative">
                <div className="h-2 rounded-sm" style={{ background: color }} />
                <p className="text-[8px] text-[#64736C] mt-1 text-center hidden sm:block">{label}</p>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#10231D] text-white text-[9px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {desc}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-[#64736C] mt-1">
            <span>← Healthy</span>
            <span>Diseased →</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border-t border-amber-100">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 leading-relaxed">
            <strong>Grad-CAM</strong> highlights regions the AI focused on. <span className="font-semibold text-red-600">Red/orange</span> = disease hotspots, <span className="font-semibold text-yellow-600">yellow</span> = moderate concern, <span className="font-semibold text-green-700">green/blue</span> = healthy regions. Always verify with a qualified agronomist before treatment.
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
            <div className="flex items-center justify-between px-4 py-3 bg-[#0B8F68]">
              <p className="text-sm font-700 text-white">Grad-CAM — Full View</p>
              <div className="flex gap-2">
                {tabs.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMode(key)}
                    className={`px-3 py-1 rounded-lg text-xs font-600 transition-colors ${
                      mode === key ? 'bg-white text-[#0B8F68]' : 'bg-white/10 text-white/70 hover:bg-white/20'
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
                <p className="text-[9px] font-700 text-white/60 uppercase tracking-wider">Intensity Scale</p>
                {COLOR_SCALE.map(({ label, color, desc }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />
                    <div>
                      <p className="text-[10px] font-600 text-white leading-none">{label}</p>
                      <p className="text-[9px] text-white/50">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-2 bg-[#086E50] text-[10px] text-white/70 text-center border-t border-white/10">
              Click outside to close ·{' '}
              {mode === 'original' ? 'Original uploaded image' : 'AI attention heatmap — red = disease hotspot'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
