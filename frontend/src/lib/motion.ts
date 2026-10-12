/**
 * FloraAI — Shared framer-motion variants
 *
 * Design principles:
 * - Only animate transform + opacity (GPU-composited, no layout thrash)
 * - Durations 150–350ms; easing [0.22, 1, 0.36, 1] (custom spring-feel ease)
 * - Stagger capped at 8 items; breathing ring stops at 3 cycles
 * - All variants respect MotionConfig reducedMotion="user" in AppLayout
 */

import type { Variants, Transition } from 'framer-motion'

/* ── Shared easing & timing ─────────────────────────────────────────────── */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const EASE_OUT = 'easeOut'

export const DURATION = {
  xs:   0.15,
  sm:   0.22,
  md:   0.25,
  lg:   0.35,
  xl:   0.50,
} as const

export const baseTransition: Transition = {
  ease: EASE,
  duration: DURATION.md,
}

/* ── Page transitions — fade + 12px upward slide ────────────────────────── */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { ease: EASE, duration: DURATION.lg } },
  exit:    { opacity: 0, y: -8, transition: { ease: EASE_OUT, duration: DURATION.md } },
}

/* ── Card entrance — staggered fade+slide ───────────────────────────────── */
export const cardContainerVariants: Variants = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

export const cardItemVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { ease: EASE, duration: DURATION.md } },
}

/**
 * Returns card variants that stagger, but only the first 8 items animate.
 * Items 9+ appear instantly to avoid long animation queues on slow devices.
 */
export function cardVariantForIndex(index: number): Variants {
  if (index >= 8) {
    return { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
  }
  return cardItemVariants
}

/* ── Press feedback — applied via whileTap on every Button / Card ────────── */
export const pressTap = { scale: 0.97 } as const

/* ── StatusPill pop-in — small spring ───────────────────────────────────── */
export const pillVariants: Variants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 28, mass: 0.8 },
  },
}

/* ── Confidence ring — stroke-dashoffset animate ────────────────────────── */
// Used on DiagnosisResultPage — component drives the value imperatively
export const ringTransition: Transition = {
  ease: EASE,
  duration: 0.8,
  delay: 0.2,
}

/* ── Advice steps — sequential fade-in ──────────────────────────────────── */
export const adviceContainerVariants: Variants = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } },
}

export const adviceItemVariants: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: { ease: EASE, duration: DURATION.md } },
}

/* ── Scan CTA breathing ring — 3 cycles then stop ───────────────────────── */
// Applied to the ring element behind the scan button
export const scanRingVariants: Variants = {
  pulse: {
    scale:   [1, 1.08, 1],
    opacity: [0.35, 0, 0.35],
    transition: {
      duration: 2.2,
      ease: 'easeInOut',
      repeat: 2,          // 3 total cycles (0-indexed), then stops
      repeatType: 'loop',
    },
  },
}

/* ── BottomSheet spring — slides up from bottom ─────────────────────────── */
export const sheetVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 380, damping: 38, mass: 1 },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { ease: EASE, duration: DURATION.md },
  },
}

export const backdropVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.sm } },
  exit:    { opacity: 0, transition: { duration: DURATION.sm } },
}

/* ── BottomNav active indicator ─────────────────────────────────────────── */
// Use as layoutId="bottom-nav-indicator" on the active pill
export const NAV_INDICATOR_LAYOUT_ID = 'bottom-nav-indicator'

/* ── Leaf hero sway (Home page decoration) ──────────────────────────────── */
export const leafSwayVariants: Variants = {
  sway: {
    rotate: [0, 3, -3, 0],
    transition: {
      duration: 6,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
}

/* ── Skeleton shimmer is CSS-only — no framer needed ───────────────────── */
// Use className="skeleton" from index.css
