// ErrorState.tsx — FloraAI green design system
import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  description: string
  action?: ReactNode
  variant?: 'inline' | 'page'
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  action,
  variant = 'inline',
}: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <div
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 16px', borderRadius: 12,
          background: 'var(--color-danger-bg)',
          border: '1px solid var(--color-danger-border)',
        }}
        role="alert"
      >
        <AlertTriangle style={{ width: 18, height: 18, color: 'var(--color-danger)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-danger)' }}>{title}</p>
          <p style={{ fontSize: 14, color: 'var(--color-danger)', opacity: 0.85, marginTop: 3, lineHeight: 1.5 }}>{description}</p>
          {action && <div style={{ marginTop: 10 }}>{action}</div>}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 0 }}>
      <div style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <AlertTriangle style={{ width: 28, height: 28, color: 'var(--color-danger)' }} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--color-ink-2)', maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}>{description}</p>
      {action}
    </div>
  )
}
