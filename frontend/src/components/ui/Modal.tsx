// Modal.tsx — FloraAI accessible modal dialog (no backdrop-filter blur)
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

const maxWidthClass: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'sm:max-w-[380px]',
  md: 'sm:max-w-[480px]',
  lg: 'sm:max-w-[560px]',
  xl: 'sm:max-w-[680px]',
}

export function Modal({ open, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-emerald-950/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={`animate-fade-in-up relative w-full ${maxWidthClass[maxWidth]} bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90dvh] overflow-y-auto pb-[env(safe-area-inset-bottom,16px)] sm:pb-0 border border-[var(--color-green-100)]`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-green-100)]">
            <h2 id="modal-title" className="text-lg font-bold text-[var(--color-ink)]">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-transparent border-none cursor-pointer rounded-xl text-[var(--color-ink-2)] hover:bg-[var(--color-green-50)] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {!title && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2.5 right-3 w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-[var(--color-green-50)] border-none cursor-pointer rounded-xl z-10 text-[var(--color-ink-2)] hover:bg-[var(--color-green-100)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
