// Modal.tsx — FloraAI accessible modal dialog (no backdrop-filter blur)
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

const maxWidthPx: Record<string, number> = { sm: 380, md: 480, lg: 560, xl: 680 }

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
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop — no blur (expensive on low-end Android) */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(11, 46, 28, 0.5)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — full-width bottom sheet on mobile, centered card on desktop */}
      <div
        ref={dialogRef}
        className="animate-fade-in-up"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: maxWidthPx[maxWidth],
          background: 'var(--color-white)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 40px rgba(21, 128, 61, 0.12)',
          maxHeight: '90dvh',
          overflowY: 'auto',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        {/* Header */}
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 16px', borderBottom: '1px solid var(--color-green-100)' }}>
            <h2 id="modal-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink)' }}>{title}</h2>
            <button
              type="button"
              onClick={onClose}
              style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 12, color: 'var(--color-ink-2)' }}
              aria-label="Close"
            >
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>
        )}
        {!title && (
          <button
            type="button"
            onClick={onClose}
            style={{ position: 'absolute', top: 10, right: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-green-50)', border: 'none', cursor: 'pointer', borderRadius: 12, zIndex: 10, color: 'var(--color-ink-2)' }}
            aria-label="Close"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        )}

        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  )
}
