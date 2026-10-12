/**
 * FloraAI — Card primitive
 * whileTap scale feedback on interactive cards
 */

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { pressTap } from '../../lib/motion'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode
  tinted?: boolean
  interactive?: boolean  // adds hover lift + press feedback
  padding?: string | number
  noPad?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ tinted, interactive, padding, noPad, children, className = '', style, ...rest }, ref) => {
    const classes = [
      tinted ? 'card-tinted' : 'card',
      interactive ? 'card-hover' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const computedStyle = {
      padding: noPad ? 0 : padding ?? 20,
      ...style,
    }

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
