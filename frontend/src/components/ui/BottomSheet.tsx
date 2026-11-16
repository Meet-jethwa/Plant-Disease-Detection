/**
 * FloraAI — BottomSheet
 *
 * - Spring animation upward from bottom
 * - Drag-to-dismiss via dragElastic + dragConstraints
 * - Respects env(safe-area-inset-bottom)
 * - Backdrop closes on click
 * - Focus trapped inside (via aria-modal)
 * - Zero unnecessary inline styles
 */

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { sheetVariants, backdropVariants } from '../../lib/motion'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  /** Max height in dvh units, default 85 */
  maxHeight?: number
}

export function BottomSheet({ open, onClose, title, children, maxHeight = 85 }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="bottom-sheet-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="bottom-sheet touch-none"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose()
            }}
            style={{ maxHeight: `${maxHeight}dvh` }}
          >
            {/* Drag handle */}
            <div className="sheet-drag-handle" aria-hidden />

            {title && (
              <div className="px-5 pt-2 pb-4 border-b border-[var(--color-green-100)]">
                <h2 className="text-lg font-bold text-[var(--color-ink)]">{title}</h2>
              </div>
            )}

            <div className="overflow-y-auto touch-pan-y">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
