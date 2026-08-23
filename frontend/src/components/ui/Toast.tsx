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
    success: { icon: CheckCircle2, bg: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600', titleColor: 'text-emerald-900' },
    error:   { icon: XCircle,      bg: 'bg-red-50 border-red-200',         iconColor: 'text-red-600',     titleColor: 'text-red-900' },
    warning: { icon: AlertTriangle,bg: 'bg-amber-50 border-amber-200',     iconColor: 'text-amber-600',   titleColor: 'text-amber-900' },
    info:    { icon: Info,         bg: 'bg-blue-50 border-blue-200',       iconColor: 'text-blue-600',    titleColor: 'text-blue-900' },
  }[toast.type]

  const Icon = config.icon

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-fade-in-up ${config.bg} min-w-[280px] max-w-sm`}>
      <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${config.titleColor}`}>{toast.title}</p>
        {toast.message && <p className="text-xs text-[#64736C] mt-0.5">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="text-[#94A09B] hover:text-[#10231D] transition-colors shrink-0"
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
