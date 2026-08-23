// EmptyState.tsx — Reusable empty state component
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#DDF7EA] border border-[#B9E8D1] flex items-center justify-center text-[#0B8F68] mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#10231D] mb-2">{title}</h3>
      <p className="text-sm text-[#64736C] max-w-sm leading-relaxed mb-6">{description}</p>
      {action}
    </div>
  )
}
