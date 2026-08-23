// Modal.tsx — Reusable accessible modal dialog
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

const widthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
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

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={`relative w-full ${widthMap[maxWidth]} bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-fade-in-up max-h-[90dvh] overflow-y-auto`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#D4E8DC]">
            <h2 id="modal-title" className="text-base font-700 text-[#10231D]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-icon btn-ghost"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {!title && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-icon btn-ghost absolute top-3 right-3 z-10"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
