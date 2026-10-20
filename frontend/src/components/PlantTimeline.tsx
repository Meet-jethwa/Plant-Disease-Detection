// PlantTimeline.tsx — Health history timeline
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { TimelineEntry } from '../types'
import { useLang } from '../contexts/LanguageContext'
import { localizeDiseaseName } from '../i18n/translations'

interface PlantTimelineProps {
  entries: TimelineEntry[]
}

function getEntryIcon(status: string) {
  if (status === 'Healthy')         return { Icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 border-emerald-200' }
  if (status === 'Needs Attention') return { Icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-100 border-amber-200'   }
  return                                   { Icon: XCircle,       color: 'text-red-600',     bg: 'bg-red-100 border-red-200'       }
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-700'
  if (score >= 65) return 'text-amber-700'
  return 'text-red-700'
}

export function PlantTimeline({ entries }: PlantTimelineProps) {
  const { t, lang } = useLang()

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[#10231D]">{t('history.title')}</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-[#D4E8DC]" />

        <div className="space-y-4">
          {entries.map((entry, i) => {
            const { Icon, color, bg } = getEntryIcon(entry.status)
            const statusKey = entry.status === 'Needs Attention' ? 'needsAttention' : entry.status === 'At Risk' ? 'atRisk' : entry.status.toLowerCase()
            const translatedStatus = t(('status.' + statusKey) as any) || entry.status

            return (
              <div key={i} className="flex gap-4 items-start relative">
                {/* Icon node */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 bg-white z-10 ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 card p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#10231D]">{entry.date}</span>
                    <span className={`text-sm font-extrabold ${getScoreColor(entry.healthScore)}`}>
                      {entry.healthScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-[#64736C]">{localizeDiseaseName(entry.diagnosis, lang)}</p>
                  <span className={`text-[10px] font-semibold ${color}`}>{translatedStatus}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
