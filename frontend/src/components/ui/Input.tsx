// Input.tsx — Standardized Input and Select primitives
import { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`input ${error ? '!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/20' : ''} ${className}`}
          {...props}
        />
        {helperText && (
          <p className={`text-xs mt-1.5 ${error ? 'text-[var(--color-danger)]' : 'text-[var(--color-ink-2)]'}`}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  helperText?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, helperText, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={`input ${error ? '!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/20' : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
        {helperText && (
          <p className={`text-xs mt-1.5 ${error ? 'text-[var(--color-danger)]' : 'text-[var(--color-ink-2)]'}`}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'

