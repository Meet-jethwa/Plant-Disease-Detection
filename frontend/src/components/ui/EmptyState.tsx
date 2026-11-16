// EmptyState.tsx — FloraAI clean empty state primitive
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="icon-badge icon-badge-lg mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-ink-2)] max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {action}
    </div>
  )
}
