// AnalysisLoader.tsx — Farmer-friendly plant scanning progress loader
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Leaf, RefreshCw } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

interface AnalysisLoaderProps {
  imageUrl?: string | null
  cropName?: string
  isPredicting?: boolean
  onCancel?: () => void
  onRetry?: () => void
  onComplete?: () => void
}

export function AnalysisLoader({
  imageUrl,
  cropName: _cropName,
  isPredicting = true,
  onCancel,
  onRetry,
  onComplete,
}: AnalysisLoaderProps) {
  const { t } = useLang()
  const reducedMotion = useReducedMotion()

  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [isFinishing, setIsFinishing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const startTimeRef = useRef(Date.now())
  const hasTriggeredCompleteRef = useRef(false)
  const isPredictingRef = useRef(isPredicting)

  isPredictingRef.current = isPredicting

  // Main timer loop: decelerate from 0% to ~90% over 8s, then hold at 90%
  useEffect(() => {
    startTimeRef.current = Date.now()
    hasTriggeredCompleteRef.current = false
    setIsFinishing(false)
    setIsCompleted(false)

    const interval = setInterval(() => {
      const now = Date.now()
      const totalElapsed = (now - startTimeRef.current) / 1000
      setElapsed(totalElapsed)

      // If already animating to 100%, let that effect take over
      if (hasTriggeredCompleteRef.current) return

      // Decelerating curve over ~8 seconds: Ease-out quadratic towards 90%
      if (totalElapsed < 8) {
        const tNorm = totalElapsed / 8
        const easeOutQuad = 1 - (1 - tNorm) * (1 - tNorm)
        const currentSimulated = Math.min(90, Math.round(easeOutQuad * 90))
        setProgress(currentSimulated)
      } else {
        // Hold firmly at 90% until backend response arrives
        setProgress(90)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // When backend finishes (isPredicting transitions to false)
  useEffect(() => {
    if (isPredicting || hasTriggeredCompleteRef.current) return

    const now = Date.now()
    const elapsedMs = now - startTimeRef.current
    const minWaitMs = Math.max(0, 1200 - elapsedMs) // Guarantee at least 1.2s total visible time

    const timer = setTimeout(() => {
      hasTriggeredCompleteRef.current = true
      setIsFinishing(true)

      // Quickly animate to 100% over ~250ms
      setProgress(100)

      // 300ms pause after reaching 100% before handing over
      const finishTimer = setTimeout(() => {
        setIsCompleted(true)
        onComplete?.()
      }, 300)

      return () => clearTimeout(finishTimer)
    }, minWaitMs)

    return () => clearTimeout(timer)
  }, [isPredicting, onComplete])

  // Determine stage & messaging
  const isTimeoutError = elapsed >= 45 && !hasTriggeredCompleteRef.current && isPredicting
  const isTakingLonger = elapsed >= 15 && !isTimeoutError && !hasTriggeredCompleteRef.current
  const isIndeterminate = isTakingLonger

  const displaySentence = isTimeoutError
    ? t('loader.timeoutError')
    : isTakingLonger
    ? t('loader.takingLonger')
    : t('loader.checking')

  const roundedPercentage = Math.min(100, Math.max(0, Math.round(progress)))

  if (isCompleted) {
    return null
  }

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#D4E8DC] bg-white p-6 shadow-sm flex flex-col items-center text-center">
        
        {/* Leaf photo thumbnail (96px, rounded) */}
        <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-[#B0D8C4] bg-[#F0FAF4] shadow-xs flex items-center justify-center shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Leaf photo"
              className="h-full w-full object-cover"
            />
          ) : (
            <Leaf className="h-10 w-10 text-[#15803D]" />
          )}

          {/* Soft green scan line sweeping across thumbnail (transform & opacity only) */}
          {!reducedMotion && !isTimeoutError && (
            <motion.div
              initial={{ y: -96, opacity: 0 }}
              animate={{ y: 96, opacity: [0, 0.85, 0.85, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]"
              style={{ willChange: 'transform, opacity' }}
            />
          )}
        </div>

        {/* Short sentence in 20px text */}
        <div className="mt-5 min-h-[3rem] flex items-center justify-center px-1">
          <p
            aria-live="polite"
            className={`text-[20px] font-semibold leading-snug ${
              isTimeoutError ? 'text-red-700' : 'text-[#17211D]'
            }`}
          >
            {displaySentence}
          </p>
        </div>

        {/* Progress bar container (12px high, 999px radius, green-100 track, green-700 fill) */}
        {!isTimeoutError && (
          <div className="mt-5 w-full flex items-center gap-3">
            <div
              role="progressbar"
              aria-label={t('loader.checking')}
              aria-valuenow={roundedPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              className="relative h-3 flex-1 overflow-hidden rounded-full bg-green-100"
            >
              {/* Fill */}
              <div
                className={`h-full rounded-full bg-green-700 ${
                  isFinishing ? 'transition-all duration-300 ease-out' : 'transition-all duration-150 ease-out'
                }`}
                style={{ width: `${roundedPercentage}%` }}
              />

              {/* Moving shine / indeterminate shimmer */}
              {!reducedMotion && !isFinishing && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{
                      duration: isIndeterminate ? 1.2 : 2.2,
                      repeat: Infinity,
                      ease: isIndeterminate ? 'easeInOut' : 'linear',
                    }}
                    className={`h-full ${
                      isIndeterminate ? 'w-1/2 bg-white/40' : 'w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent'
                    }`}
                    style={{ willChange: 'transform' }}
                  />
                </div>
              )}
            </div>

            {/* Percentage in 16px bold text on the right */}
            <span className="w-12 text-right text-base font-bold text-[#17211D] tabular-nums shrink-0">
              {roundedPercentage}%
            </span>
          </div>
        )}

        {/* Controls / Actions */}
        <div className="mt-6 w-full flex flex-col items-center gap-2">
          {isTimeoutError ? (
            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onRetry}
                className="btn btn-primary min-h-[48px] w-full flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                {t('loader.tryAgain')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary min-h-[48px] w-full flex items-center justify-center text-sm font-semibold cursor-pointer"
              >
                {t('btn.cancel')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[48px] px-4 py-3 text-sm font-medium text-[#66736C] hover:text-[#17211D] transition-colors cursor-pointer flex items-center justify-center"
              aria-label={t('btn.cancel')}
            >
              {t('btn.cancel')}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
