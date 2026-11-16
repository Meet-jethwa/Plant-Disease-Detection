/**
 * FloraAI — Button primitive
 *
 * Features:
 * - min-height 48px (md) / 56px (lg) / 40px (sm) — touch target compliant
 * - whileTap scale(0.97) press feedback via framer-motion
 * - loading spinner state
 * - full-width option
 * - aria-busy during loading
 * - wraps text — no single-line truncation (critical for i18n strings)
 * - zero inline styles
 */

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { HTMLMotionProps } from 'framer-motion'
import { pressTap } from '../../lib/motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize    = 'md' | 'lg' | 'sm'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  as?: 'button' | 'a'
  href?: string
}

const variantClass: Record<ButtonVariant, string> = {
  primary:   'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost:     'btn btn-ghost',
  danger:    'btn btn-danger',
  outline:   'btn btn-outline',
}

const sizeClass: Record<ButtonSize, string> = {
  md: 'btn-md',
  lg: 'btn-lg',
  sm: 'btn-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      as: _as = 'button',
      ...rest
    },
    ref
  ) => {
    const classes = [
      variantClass[variant],
      sizeClass[size],
      fullWidth ? 'btn-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        whileTap={isDisabled ? undefined : pressTap}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...rest}
      >
        {loading ? (
          <Loader2
            className="w-4.5 h-4.5 shrink-0 animate-spin"
            aria-hidden
          />
        ) : leftIcon ? (
          <span aria-hidden className="flex shrink-0">{leftIcon}</span>
        ) : null}
        <span className={loading ? 'flex-1' : undefined}>{children}</span>
        {!loading && rightIcon && (
          <span aria-hidden className="flex shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
