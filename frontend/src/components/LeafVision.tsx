import { useEffect, useRef, useState, useCallback } from 'react'
import { Info, Maximize2, Minus, Plus, RotateCcw, X, Layers, Flame, Eye } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLang } from '../contexts/LanguageContext'
import type { PredictionResponse } from '../types'

type VisionMode = 'photo' | 'gradcam' | 'heatmap' | 'compare'
type Hotspot = { x: number; y: number; symptom?: string }

const LOW_CONFIDENCE_THRESHOLD = 0.40

export function LeafVision({ prediction }: { prediction: PredictionResponse }) {
  const { t } = useLang()
  const reducedMotion = useReducedMotion()
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const originalPhoto = prediction.original_image
  const gradcamOverlay = prediction.highlighted_image || originalPhoto
  const gradcamHeatmap = prediction.gradcam_heatmap
  const hasGradcam = Boolean(prediction.highlighted_image)
  const hasHeatmap = Boolean(prediction.gradcam_heatmap)

  const confidenceFraction = prediction.confidence ?? (prediction.confidence_percent ? prediction.confidence_percent / 100 : 0)
  const lowConfidence = confidenceFraction < LOW_CONFIDENCE_THRESHOLD

  const [mode, setMode] = useState<VisionMode>(() => {
    return hasGradcam && !lowConfidence ? 'gradcam' : 'photo'
  })
  const [slider, setSlider] = useState(50)
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [activePin, setActivePin] = useState<number | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [scale, setScale] = useState(1)

  const touchDistRef = useRef<number | null>(null)

  // Fall back silently to photo if below low-confidence
  useEffect(() => {
    if (lowConfidence) {
      setMode('photo')
    } else if (hasGradcam && mode === 'photo') {
      setMode('gradcam')
    }
  }, [lowConfidence, hasGradcam])

  // Derive up to 3 hotspot positions from gradcam_heatmap or highlighted_image
  useEffect(() => {
    const heatmapSrc = prediction.gradcam_heatmap || prediction.highlighted_image
    if (!heatmapSrc || lowConfidence) {
      setHotspots([])
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const w = Math.min(img.naturalWidth || 224, 224)
        const h = Math.min(img.naturalHeight || 224, 224)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0, w, h)
        const imgData = ctx.getImageData(0, 0, w, h)
        const pixels = imgData.data

        // 1. Map JET pixels back to intensity [0..1]
        const intensities = new Float32Array(w * h)
        const activeValues: number[] = []

        for (let i = 0; i < intensities.length; i++) {
          const off = i * 4
          const r = pixels[off]
          const g = pixels[off + 1]
          const b = pixels[off + 2]
          const a = pixels[off + 3]

          if (a < 20 || (r === 0 && g === 0 && b === 0)) {
            intensities[i] = 0
            continue
          }

          // JET intensity inversion:
          let val = 0
          if (r >= b) {
            val = 0.5 + 0.5 * ((r - b) / 255)
          } else {
            val = Math.max(0, 0.5 - 0.5 * ((b - r) / 255))
          }
          intensities[i] = val
          if (val > 0.15) activeValues.push(val)
        }

        // 2. Thresholding at top 15%
        let threshold = 0.80
        if (activeValues.length > 30) {
          activeValues.sort((a, b) => a - b)
          const p85 = activeValues[Math.floor(activeValues.length * 0.85)]
          threshold = Math.max(0.70, p85)
        }

        const active = new Uint8Array(w * h)
        for (let i = 0; i < intensities.length; i++) {
          active[i] = intensities[i] >= threshold ? 1 : 0
        }

        // 3. Connected regions centroid calculation
        const seen = new Uint8Array(w * h)
        const regions: Array<{ cx: number; cy: number; count: number; maxVal: number }> = []

        for (let i = 0; i < active.length; i++) {
          if (!active[i] || seen[i]) continue
          const queue = [i]
          seen[i] = 1
          let count = 0
          let sumX = 0
          let sumY = 0
          let maxVal = 0

          while (queue.length > 0) {
            const pt = queue.pop()!
            const px = pt % w
            const py = Math.floor(pt / w)
            count++
            sumX += px
            sumY += py
            if (intensities[pt] > maxVal) maxVal = intensities[pt]

            const neighbors = [pt - 1, pt + 1, pt - w, pt + w]
            for (const nb of neighbors) {
              if (nb >= 0 && nb < active.length && active[nb] && !seen[nb]) {
                seen[nb] = 1
                queue.push(nb)
              }
            }
          }

          if (count >= Math.max(5, Math.floor(w * h * 0.0012))) {
            regions.push({
              cx: sumX / count,
              cy: sumY / count,
              count,
              maxVal,
            })
          }
        }

        // Sort descending by size * peak activation, pick up to 3 centroids
        regions.sort((a, b) => (b.count * b.maxVal) - (a.count * a.maxVal))
        const derived = regions.slice(0, 3).map((r, idx) => ({
          x: Math.round((r.cx / w) * 1000) / 10,
          y: Math.round((r.cy / h) * 1000) / 10,
          symptom: prediction.symptoms?.[idx]?.name,
        }))
        setHotspots(derived)
      } catch {
        setHotspots([])
      }
    }
    img.onerror = () => {
      setHotspots([])
    }
    img.src = heatmapSrc
  }, [prediction.gradcam_heatmap, prediction.highlighted_image, prediction.symptoms, lowConfidence])

  // Pinch-to-zoom touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      touchDistRef.current = dist
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const ratio = dist / touchDistRef.current
      setScale(current => Math.min(3, Math.max(1, Number((current * ratio).toFixed(2)))))
      touchDistRef.current = dist
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    touchDistRef.current = null
  }, [])

  function changeZoom(delta: number) {
    setScale(current => Math.max(1, Math.min(3, Number((current + delta).toFixed(2)))))
  }

  function handleSliderKey(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      setSlider(value => Math.max(0, value - 5))
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      setSlider(value => Math.min(100, value + 5))
    }
  }

  return (
    <section className="mb-8 w-full" aria-label={t('diagnosis.whereAiLooked')}>
      <div className="relative rounded-2xl border border-[#CBE6D4] bg-white shadow-sm overflow-visible">
        
        {/* ── 4:3 Full Width Image Box (Object-contain, Light green bg, 16px radius) ── */}
        <div
          ref={imageContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#EEF9F1] select-none touch-pan-y"
        >
          {/* Zoomable image container */}
          <div
            className="absolute inset-0 origin-center flex items-center justify-center"
            style={{ transform: `scale(${scale})`, transition: 'transform 180ms ease-out' }}
          >
            {/* 1. Original leaf photo */}
            {mode === 'photo' && (
              <img
                src={originalPhoto}
                alt={t('diagnosis.originalPhoto')}
                className="h-full w-full object-contain"
                draggable={false}
              />
            )}

            {/* 2. Grad-CAM Overlay (Authentic model activation heatmap overlaid on leaf) */}
            {mode === 'gradcam' && hasGradcam && !lowConfidence && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' }}
                src={gradcamOverlay}
                alt={t('diagnosis.aiView')}
                className="h-full w-full object-contain"
                draggable={false}
              />
            )}

            {/* 3. Pure Heatmap (Pure JET colormap activation map) */}
            {mode === 'heatmap' && hasHeatmap && gradcamHeatmap && !lowConfidence && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' }}
                src={gradcamHeatmap}
                alt={t('diagnosis.gradcamHeatmap')}
                className="h-full w-full object-contain bg-black/5"
                draggable={false}
              />
            )}

            {/* 4. Compare View: Vertical slider revealing original on left, Grad-CAM on right */}
            {mode === 'compare' && hasGradcam && !lowConfidence && (
              <div className="relative h-full w-full flex items-center justify-center">
                {/* Original leaf photo (underneath) */}
                <img
                  src={originalPhoto}
                  alt={t('diagnosis.originalPhoto')}
                  className="absolute inset-0 h-full w-full object-contain"
                  draggable={false}
                />
                {/* Grad-CAM overlay (revealed by slider from right) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 0 0 ${slider}%)` }}
                >
                  <img
                    src={gradcamOverlay}
                    alt={t('diagnosis.aiView')}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Draggable Vertical Slider Handle (48px touch target, keyboard accessible) */}
          {mode === 'compare' && hasGradcam && !lowConfidence && (
            <button
              type="button"
              role="slider"
              tabIndex={0}
              aria-label={t('diagnosis.compareHandle')}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(slider)}
              onKeyDown={handleSliderKey}
              onPointerDown={event => {
                const parent = event.currentTarget.parentElement
                if (!parent) return
                const rect = parent.getBoundingClientRect()
                const move = (e: PointerEvent) => {
                  const clientX = e.clientX
                  const relativeX = clientX - rect.left
                  const percentage = Math.min(100, Math.max(0, (relativeX / rect.width) * 100))
                  setSlider(percentage)
                }
                const up = () => {
                  window.removeEventListener('pointermove', move)
                  window.removeEventListener('pointerup', up)
                }
                window.addEventListener('pointermove', move)
                window.addEventListener('pointerup', up)
              }}
              style={{ left: `${slider}%` }}
              className="absolute top-0 bottom-0 -ml-5 w-10 flex items-center justify-center cursor-ew-resize touch-none select-none z-20 group focus:outline-none"
            >
              <div className="h-full w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)] group-hover:w-1 transition-all" />
              <div className="absolute top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-xl border border-stone-300 text-stone-700 text-xs font-bold transition-transform group-hover:scale-110">
                ↔
              </div>
            </button>
          )}

          {/* Interactive Hotspot Pins (Only when Grad-CAM is active) */}
          {mode === 'gradcam' && !lowConfidence && hotspots.map((pin, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActivePin(activePin === index ? null : index)}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              aria-label={`Hotspot ${index + 1}: ${pin.symptom || 'Attention region'}`}
              className="absolute -ml-3.5 -mt-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg ring-2 ring-white hover:bg-emerald-700 transition-transform hover:scale-110 cursor-pointer z-10"
            >
              <span>{index + 1}</span>
              <AnimatePresence>
                {activePin === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-8 left-1/2 w-52 -translate-x-1/2 rounded-xl bg-emerald-950/95 p-3 text-left text-xs font-medium text-white shadow-2xl backdrop-blur-md z-30"
                  >
                    <p className="font-bold text-emerald-300 mb-0.5">{t('diagnosis.attentionHere')}</p>
                    {pin.symptom && (
                      <p className="text-[11px] text-stone-200 mt-1 border-t border-emerald-800/60 pt-1">
                        {pin.symptom}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>

        {/* ── Lower Control Bar (Directly below image with clean flow) ── */}
        <div className="p-3 sm:p-4">
          
          {/* Segmented control: Photo, Grad-CAM, Heatmap, Compare */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 rounded-xl bg-green-50/80 p-1 border border-green-100" role="tablist" aria-label={t('diagnosis.whereAiLooked')}>
            {([
              ['photo', t('diagnosis.photo'), true, <Eye className="h-3.5 w-3.5 mr-1 inline" key="photo" />],
              ['gradcam', t('diagnosis.aiView'), hasGradcam && !lowConfidence, <Layers className="h-3.5 w-3.5 mr-1 inline" key="gradcam" />],
              ...(hasHeatmap ? [['heatmap', t('diagnosis.gradcamHeatmap'), !lowConfidence, <Flame className="h-3.5 w-3.5 mr-1 inline" key="heatmap" />] as const] : []),
              ['compare', t('diagnosis.compare'), hasGradcam && !lowConfidence, null],
            ] as const).map(([key, label, isAvailable, icon]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                disabled={!isAvailable}
                onClick={() => setMode(key as VisionMode)}
                className={`min-h-[44px] rounded-lg px-2 text-xs sm:text-sm font-bold transition-all flex items-center justify-center ${
                  mode === key
                    ? 'bg-white text-green-900 shadow-xs border border-green-200/50'
                    : 'text-green-900/70 hover:text-green-900'
                } disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Low confidence warning note */}
          {lowConfidence && (
            <div className="mt-3 rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs font-medium text-amber-900">
              {t('diagnosis.lowConfidenceNote')}
            </div>
          )}

          {/* Attention Legend & Info explanation */}
          {(mode === 'gradcam' || mode === 'compare' || mode === 'heatmap') && !lowConfidence && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 bg-stone-50 rounded-xl p-2.5 border border-stone-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-950">{t('diagnosis.aiView')}</span>
                {/* JET Intensity Scale */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-stone-500 font-medium">Low</span>
                  <div className="h-2.5 w-24 rounded-full bg-gradient-to-r from-blue-600 via-green-400 via-yellow-400 to-red-600 shadow-inner" />
                  <span className="text-[10px] text-stone-500 font-medium">High</span>
                </div>
              </div>

              {/* Tiny info button explaining Grad-CAM attention */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowInfo(!showInfo)}
                  className="inline-flex items-center gap-1 text-green-700 hover:text-green-900 text-xs font-semibold cursor-pointer"
                  title={t('diagnosis.attentionInfo')}
                  aria-label={t('diagnosis.attentionInfo')}
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>Info</span>
                </button>

                {showInfo && (
                  <div className="absolute right-0 bottom-7 z-30 w-64 rounded-xl bg-white p-3 text-xs text-stone-700 shadow-xl border border-green-200">
                    <p className="font-bold text-green-950 mb-1">{t('diagnosis.whereAiLooked')}</p>
                    <p className="leading-relaxed">{t('diagnosis.attentionInfo')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Zoom controls & Fullscreen toggle */}
          <div className="mt-3 flex items-center justify-between pt-1 border-t border-green-50">
            <span className="text-xs text-stone-500">
              {scale > 1 ? `${Math.round(scale * 100)}% zoom` : '100%'}
            </span>

            <div className="flex items-center gap-1.5">
              {scale > 1 && (
                <button
                  type="button"
                  onClick={() => setScale(1)}
                  className="h-9 px-2.5 rounded-lg border border-green-200 text-green-900 text-xs font-semibold hover:bg-green-50 flex items-center gap-1 cursor-pointer"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => changeZoom(-0.25)}
                disabled={scale <= 1}
                className="h-9 w-9 rounded-lg border border-green-200 text-green-900 hover:bg-green-50 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                aria-label="Zoom out"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => changeZoom(0.25)}
                disabled={scale >= 3}
                className="h-9 w-9 rounded-lg border border-green-200 text-green-900 hover:bg-green-50 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                aria-label="Zoom in"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                className="h-9 w-9 rounded-lg border border-green-200 text-green-900 hover:bg-green-50 flex items-center justify-center cursor-pointer"
                aria-label="View fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 rounded-xl bg-white/90 hover:bg-white p-2.5 text-stone-900 shadow-md cursor-pointer flex items-center gap-1 text-sm font-bold"
            aria-label="Close fullscreen"
          >
            <X className="h-5 w-5" />
            <span>Close</span>
          </button>
          <img
            src={
              mode === 'gradcam' || mode === 'compare'
                ? gradcamOverlay
                : mode === 'heatmap' && gradcamHeatmap
                ? gradcamHeatmap
                : originalPhoto
            }
            alt={t('diagnosis.aiView')}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
          />
        </div>
      )}
    </section>
  )
}
