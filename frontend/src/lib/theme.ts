/**
 * FloraAI design system tokens and color constants.
 * Pure centralized theme definition for JS/TS consumers (charts, canvas, dynamic SVG).
 */

export const THEME_COLORS = {
  brand: {
    DEFAULT: '#15803D', // green-700
    dark: '#166534',    // green-800
    darker: '#14532D',  // green-900
    deep: '#0B2E1C',    // green-950
    light: '#DCFCE7',   // green-100
    surface: '#F0FDF4', // green-50
  },
  neutral: {
    surface: '#FFFFFF',
    pageBg: '#F0FDF4',
    ink: '#0B2E1C',     // max contrast text
    inkSecondary: '#3F5A4A', // secondary text
    border: '#BBF7D0',  // green-200
    borderSubtle: 'rgba(21, 128, 61, 0.12)',
  },
  severity: {
    healthy: '#15803D',
    healthyBg: '#F0FDF4',
    healthyBorder: '#BBF7D0',
    warning: '#B45309',
    warningBg: '#FFFBEB',
    warningBorder: 'rgba(180, 83, 9, 0.25)',
    danger: '#B91C1C',
    dangerBg: '#FEF2F2',
    dangerBorder: 'rgba(185, 28, 28, 0.25)',
  },
  chart: {
    healthy: '#15803D',
    warning: '#B45309',
    danger: '#B91C1C',
    grid: '#BBF7D0',
    axis: '#3F5A4A',
  },
} as const

export type SeverityStatus = 'healthy' | 'warning' | 'danger'

/** Maps a disease severity string to a StatusPill severity value */
export function severityToStatus(severity: string): SeverityStatus {
  const s = severity.toLowerCase()
  if (s === 'healthy' || s === 'low') return 'healthy'
  if (s === 'severe' || s === 'critical' || s === 'high') return 'danger'
  return 'warning'
}

