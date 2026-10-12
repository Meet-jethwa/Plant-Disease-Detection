// LoadingState.tsx — FloraAI green design system
// Uses skeleton shimmer for list loading; spinner for other loading states

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const spinnerSize = { sm: 20, md: 32, lg: 44 }

export function LoadingState({ message = 'Loading…', size = 'md' }: LoadingStateProps) {
  const sz = spinnerSize[size]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 14 }}>
      {/* Leaf-shaped spinner using CSS border trick */}
      <div
        aria-hidden
        style={{
          width: sz, height: sz,
          borderRadius: '50%',
          border: `3px solid var(--color-green-200)`,
          borderTopColor: 'var(--color-green-700)',
          animation: 'bio-spin 0.9s linear infinite',
        }}
      />
      <p style={{ fontSize: 15, color: 'var(--color-ink-2)', fontWeight: 500 }}>{message}</p>
    </div>
  )
}
