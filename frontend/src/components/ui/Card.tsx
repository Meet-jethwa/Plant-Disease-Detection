/**
 * FloraAI — Card primitive
 * whileTap scale feedback on interactive cards
 * Restrained, clean border, subtle shadow
 */

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { pressTap } from '../../lib/motion'

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode
  tinted?: boolean
  interactive?: boolean  // adds hover lift + press feedback
  padding?: string | number
  noPad?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ tinted, interactive, padding, noPad, children, className = '', style, ...rest }, ref) => {
    const padClass = noPad ? 'p-0' : padding === undefined ? 'p-5' : ''
    const classes = [
      tinted ? 'card-tinted' : 'card',
      interactive ? 'card-hover' : '',
      padClass,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const computedStyle = padding !== undefined ? { padding, ...style } : style

    return (
      <motion.div
        ref={ref}
        whileTap={interactive ? pressTap : undefined}
        className={classes}
        style={computedStyle}
        {...rest}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'
