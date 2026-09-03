import { motion, useReducedMotion } from 'framer-motion'

interface PlantHealthGlyphProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

function getHealthState(score: number) {
  if (score >= 85) return { name: 'healthy', color: '#B9E36C', stem: '#167A5A', spots: 0 }
  if (score >= 65) return { name: 'watch', color: '#A5C95D', stem: '#6F8A4D', spots: 1 }
  if (score >= 45) return { name: 'at risk', color: '#C98C4A', stem: '#8A6A4A', spots: 2 }
  return { name: 'critical', color: '#C65A45', stem: '#7E4438', spots: 3 }
}

const sizes = {
  sm: { width: 36, height: 44 },
  md: { width: 52, height: 62 },
  lg: { width: 72, height: 84 },
}

export function PlantHealthGlyph({ score, size = 'md', label = 'Plant health' }: PlantHealthGlyphProps) {
  const state = getHealthState(score)
  const reduceMotion = useReducedMotion()
  const dimensions = sizes[size]
  const tilt = state.name === 'healthy' ? 0 : state.name === 'watch' ? -3 : -8

  return (
    <motion.svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 72 84"
      role="img"
      aria-label={`${label}: ${state.name}`}
      initial={false}
      animate={reduceMotion ? undefined : { rotate: tilt }}
      transition={{ type: 'spring', stiffness: 180, damping: 16 }}
      className="plant-health-glyph shrink-0"
    >
      <path d="M36 76 C35 63 36 50 37 38" fill="none" stroke={state.stem} strokeWidth="4" strokeLinecap="round" />
      <path d="M36 55 C26 54 18 48 15 39 C25 38 34 42 37 50Z" fill={state.color} opacity=".92" />
      <path d="M37 43 C44 32 53 29 61 31 C58 41 50 47 37 48Z" fill={state.color} opacity=".82" />
      <path d="M37 38 C31 29 31 20 37 12 C44 21 43 30 37 38Z" fill={state.color} />
      {Array.from({ length: state.spots }).map((_, index) => (
        <circle key={index} cx={index === 0 ? 24 : index === 1 ? 51 : 35} cy={index === 0 ? 45 : index === 1 ? 38 : 23} r="3" fill="#C65A45" opacity=".9" />
      ))}
      <path d="M20 76 H53" fill="none" stroke={state.stem} strokeWidth="3" strokeLinecap="round" opacity=".45" />
    </motion.svg>
  )
}
