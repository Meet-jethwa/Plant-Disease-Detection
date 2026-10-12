// EmptyState.tsx — FloraAI green design system
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 0 }}>
      <div className="icon-badge icon-badge-lg" style={{ marginBottom: 16 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--color-ink-2)', maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}>
        {description}
      </p>
      {action}
    </div>
  )
}
