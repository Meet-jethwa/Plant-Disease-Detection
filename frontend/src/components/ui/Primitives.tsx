/**
 * FloraAI — Chip, SectionHeader, IconBadge, SkeletonBlock primitives
 */

import { motion } from 'framer-motion'
import { pressTap } from '../../lib/motion'

/* ── Chip ────────────────────────────────────────────────────────────────── */
interface ChipProps {
  active?: boolean
  onClick?: () => void
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function Chip({ active, onClick, icon, children, className = '', disabled }: ChipProps) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : pressTap}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`chip ${active ? 'active' : ''} ${className}`}
      style={{ cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      {icon && <span aria-hidden style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </motion.button>
  )
}

/* ── SectionHeader ───────────────────────────────────────────────────────── */
interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, action, className = '' }: SectionHeaderProps) {
  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}
    >
      <div style={{ minWidth: 0 }}>
        <h2 className="section-header">{title}</h2>
        {subtitle && <p className="text-secondary" style={{ marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

/* ── IconBadge ───────────────────────────────────────────────────────────── */
interface IconBadgeProps {
  icon: React.ReactNode
  size?: 'md' | 'lg'
  color?: string        // CSS color for icon
  bg?: string           // CSS background
  className?: string
}

export function IconBadge({ icon, size = 'md', color, bg, className = '' }: IconBadgeProps) {
  return (
    <div
      className={`icon-badge ${size === 'lg' ? 'icon-badge-lg' : ''} ${className}`}
      style={{
        color: color ?? 'var(--color-green-700)',
        background: bg ?? 'var(--color-green-100)',
      }}
      aria-hidden
    >
      {icon}
    </div>
  )
}

/* ── SkeletonBlock ───────────────────────────────────────────────────────── */
interface SkeletonBlockProps {
  height?: number | string
  width?: number | string
  borderRadius?: number | string
  className?: string
}

export function SkeletonBlock({
  height = 20,
  width = '100%',
  borderRadius = 8,
  className = '',
}: SkeletonBlockProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, width, borderRadius }}
      aria-hidden
    />
  )
}

/* ── SkeletonCard ────────────────────────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <SkeletonBlock width={48} height={48} borderRadius={12} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonBlock height={16} width="60%" />
          <SkeletonBlock height={13} width="40%" />
        </div>
      </div>
      <SkeletonBlock height={13} />
      <SkeletonBlock height={13} width="80%" />
    </div>
  )
}
