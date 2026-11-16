// Toast.tsx — Toast notification system
import { useEffect } from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import type { Toast as ToastType } from '../../types'

interface ToastItemProps {
  toast: ToastType
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  const config = {
    success: { icon: CheckCircle2, bg: 'bg-[var(--color-green-50)] border-[var(--color-green-200)]', iconColor: 'text-[var(--color-green-700)]', titleColor: 'text-[var(--color-green-950)]' },
    error:   { icon: XCircle,      bg: 'bg-[var(--color-danger-bg)] border-[var(--color-danger-border)]', iconColor: 'text-[var(--color-danger)]', titleColor: 'text-[var(--color-danger)]' },
    warning: { icon: AlertTriangle,bg: 'bg-[var(--color-warn-bg)] border-[var(--color-warn-border)]',     iconColor: 'text-[var(--color-warn)]',   titleColor: 'text-[var(--color-warn)]' },
    info:    { icon: Info,         bg: 'bg-[var(--color-green-50)] border-[var(--color-green-200)]', iconColor: 'text-[var(--color-green-700)]', titleColor: 'text-[var(--color-ink)]' },
  }[toast.type]

  const Icon = config.icon

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-md animate-fade-in-up ${config.bg} min-w-[280px] max-w-sm`}>
      <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${config.titleColor}`}>{toast.title}</p>
        {toast.message && <p className="text-xs text-[var(--color-ink-2)] mt-0.5">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors shrink-0 p-1 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer bg-transparent border-none"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastType[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 lg:bottom-6 lg:right-6"
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
