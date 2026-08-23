// AnimatedPlant.tsx — Decorative SVG plant that grows, sways and pulses
// Designed to sit inside the hero AI panel of the FloraAI homepage.

interface AnimatedPlantProps {
  /** Width of the SVG. Height is derived automatically (viewBox 200×260). */
  width?: number
  className?: string
}

/**
 * A fully self-contained, pure-CSS animated plant.
 *
 * Animation sequence (on mount):
 *  0.0s — soil / root grounds appear
 *  0.2s — stem draws itself upward (stroke-dashoffset)
 *  0.7s — lower-left leaf unfurls
 *  0.9s — lower-right leaf unfurls
 *  1.1s — upper-left leaf unfurls
 *  1.3s — top leaf / tip unfurls
 *  1.5s — pollen particles begin floating
 *  ∞     — whole plant sways in breeze; leaves shimmer; particles drift
 */
export function AnimatedPlant({ width = 180, className = '' }: AnimatedPlantProps) {
  return (
    <svg
      viewBox="0 0 200 260"
      width={width}
      aria-label="Animated healthy plant illustration"
      role="img"
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* ── Definitions ── */}
      <defs>
        {/* Leaf gradient — deep forest at base, lighter sage at tip */}
        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#12372A" />
          <stop offset="55%" stopColor="#1A5C3A" />
          <stop offset="100%" stopColor="#769B85" />
        </linearGradient>

        {/* Lighter leaf variant */}
        <linearGradient id="leafGrad2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1A5C3A" />
          <stop offset="100%" stopColor="#5E9572" />
        </linearGradient>

        {/* Stem gradient */}
        <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#769B85" />
          <stop offset="100%" stopColor="#12372A" />
        </linearGradient>

        {/* Soil gradient */}
        <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3D2B1F" />
          <stop offset="100%" stopColor="#1C110A" />
        </linearGradient>

        {/* Pot gradient */}
        <linearGradient id="potGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C97D4A" />
          <stop offset="100%" stopColor="#8B4D22" />
        </linearGradient>

        {/* Glow filter for healthy pulse */}
        <filter id="leafGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Swaying group — pivot at soil level ── */}
      <g className="plant-sway">

        {/* ── Pot ── */}
        <g className="plant-root">
          {/* Pot body */}
          <path
            d="M68 232 L76 258 L124 258 L132 232 Z"
            fill="url(#potGrad)"
            rx="3"
          />
          {/* Pot rim */}
          <rect x="63" y="228" width="74" height="9" rx="4" fill="#D4835A" />
          {/* Soil */}
          <ellipse cx="100" cy="232" rx="34" ry="7" fill="url(#soilGrad)" />
          {/* Soil highlight */}
          <ellipse cx="91" cy="230" rx="12" ry="3" fill="#4A3020" opacity="0.5" />
        </g>

        {/* ── Main stem (draws upward) ── */}
        <path
          d="M100 230 C100 200, 99 170, 100 100"
          fill="none"
          stroke="url(#stemGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          className="plant-stem"
        />

        {/* ── Branch stems ── */}
        {/* Left branch — lower */}
        <path
          d="M100 195 C90 185, 72 180, 58 172"
          fill="none"
          stroke="#1A5C3A"
          strokeWidth="3"
          strokeLinecap="round"
          className="plant-stem"
          style={{ animationDelay: '0.35s' }}
        />
        {/* Right branch — lower */}
        <path
          d="M100 175 C110 165, 128 160, 142 153"
          fill="none"
          stroke="#1A5C3A"
          strokeWidth="3"
          strokeLinecap="round"
          className="plant-stem"
          style={{ animationDelay: '0.5s' }}
        />
        {/* Left branch — upper */}
        <path
          d="M100 145 C88 135, 72 128, 60 120"
          fill="none"
          stroke="#2B7A50"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="plant-stem"
          style={{ animationDelay: '0.7s' }}
        />

        {/* ── Lower-left leaf ── */}
        <g style={{ animationDelay: '0.55s' }} className="plant-leaf-l plant-shimmer">
          <ellipse
            cx="46" cy="168"
            rx="22" ry="10"
            fill="url(#leafGrad)"
            transform="rotate(-25 46 168)"
            filter="url(#leafGlow)"
          />
          {/* Leaf vein */}
          <line
            x1="62" y1="162" x2="32" y2="174"
            stroke="#12372A" strokeWidth="0.8" strokeOpacity="0.5"
          />
        </g>

        {/* ── Lower-right leaf ── */}
        <g style={{ animationDelay: '0.7s' }} className="plant-leaf-r plant-shimmer">
          <ellipse
            cx="154" cy="148"
            rx="22" ry="10"
            fill="url(#leafGrad2)"
            transform="rotate(20 154 148)"
            filter="url(#leafGlow)"
          />
          <line
            x1="136" y1="143" x2="168" y2="155"
            stroke="#12372A" strokeWidth="0.8" strokeOpacity="0.5"
          />
        </g>

        {/* ── Upper-left leaf ── */}
        <g style={{ animationDelay: '0.9s' }} className="plant-leaf-l plant-shimmer">
          <ellipse
            cx="50" cy="116"
            rx="19" ry="9"
            fill="url(#leafGrad)"
            transform="rotate(-30 50 116)"
            filter="url(#leafGlow)"
          />
          <line
            x1="64" y1="110" x2="36" y2="122"
            stroke="#12372A" strokeWidth="0.8" strokeOpacity="0.5"
          />
        </g>

        {/* ── Top central leaf / growing tip ── */}
        <g style={{ animationDelay: '1.1s' }} className="plant-leaf-l plant-shimmer">
          <ellipse
            cx="100" cy="92"
            rx="14" ry="7"
            fill="#22784A"
            transform="rotate(-10 100 92)"
            filter="url(#leafGlow)"
          />
        </g>
        <g style={{ animationDelay: '1.2s' }} className="plant-leaf-r plant-shimmer">
          <ellipse
            cx="100" cy="85"
            rx="12" ry="6"
            fill="#2E9960"
            transform="rotate(10 100 85)"
          />
        </g>

        {/* ── Stem tip bud ── */}
        <circle
          cx="100" cy="100"
          r="4"
          fill="#4ADE80"
          opacity="0.9"
          style={{
            animation: 'leaf-shimmer 2s ease-in-out infinite',
            animationDelay: '1.4s',
          }}
        />

        {/* ── Floating pollen particles ── */}
        {[
          { cx: 76,  cy: 155, delay: '1.6s', size: 2.5, dx: '-10px' },
          { cx: 130, cy: 138, delay: '2.1s', size: 2,   dx: '14px'  },
          { cx: 65,  cy: 108, delay: '2.8s', size: 1.8, dx: '-8px'  },
          { cx: 105, cy: 125, delay: '3.4s', size: 2.2, dx: '6px'   },
          { cx: 90,  cy: 140, delay: '4.0s', size: 1.5, dx: '-5px'  },
        ].map((p, i) => (
          <circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r={p.size}
            fill="#A8D5B0"
            opacity="0"
            className="plant-particle"
            style={{
              '--px': p.dx,
              animationDelay: p.delay,
              animationDuration: `${2.8 + i * 0.4}s`,
            } as React.CSSProperties}
          />
        ))}

      </g>{/* end .plant-sway */}
    </svg>
  )
}
