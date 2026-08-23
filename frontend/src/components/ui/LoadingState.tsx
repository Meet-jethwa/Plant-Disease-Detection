// LoadingState.tsx — Reusable loading state
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({ message = 'Loading...', size = 'md' }: LoadingStateProps) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className={`${sizes[size]} text-[#0B8F68] animate-spin`} />
      <p className="text-sm text-[#64736C] font-medium">{message}</p>
    </div>
  )
}
