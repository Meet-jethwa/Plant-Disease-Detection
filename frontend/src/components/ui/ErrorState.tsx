// ErrorState.tsx — Reusable error/problem state component
import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  description: string
  action?: ReactNode
  variant?: 'inline' | 'page'
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  variant = 'inline'
}: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800">{title}</p>
          <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{description}</p>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-[#10231D] mb-2">{title}</h3>
      <p className="text-sm text-[#64736C] max-w-sm leading-relaxed mb-6">{description}</p>
      {action}
    </div>
  )
}
