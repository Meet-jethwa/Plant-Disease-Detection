/**
 * FloraAI — StatusPill
 *
 * Rules from brief:
 * - ALWAYS icon + text together. Never color-only for disease severity.
 * - Sentence-case labels.
 * - Three states: healthy | warning | danger
 * - Zero inline styles
 */

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { SeverityStatus } from '../../lib/theme'

export type Severity = SeverityStatus

export interface StatusPillProps {
  severity: Severity
  label?: string
  className?: string
}

const config: Record<Severity, { icon: typeof CheckCircle2; className: string; defaultLabel: string }> = {
  healthy: { icon: CheckCircle2,   className: 'status-pill status-pill-healthy', defaultLabel: 'Healthy'  },
  warning: { icon: AlertTriangle,  className: 'status-pill status-pill-warning', defaultLabel: 'Warning'  },
  danger:  { icon: XCircle,        className: 'status-pill status-pill-danger',  defaultLabel: 'Danger'   },
}

export function StatusPill({ severity, label, className = '' }: StatusPillProps) {
  const { icon: Icon, className: baseClass, defaultLabel } = config[severity]

  return (
    <span className={`${baseClass} ${className}`} role="status">
      <Icon className="w-4 h-4 shrink-0" aria-hidden />
      <span>{label ?? defaultLabel}</span>
    </span>
  )
}
