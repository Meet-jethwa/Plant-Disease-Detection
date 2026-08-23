// HistoryCard.tsx — Diagnosis history list item
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, TrendingUp } from 'lucide-react'
import type { HistoryItem } from '../types'

interface HistoryCardProps {
  item: HistoryItem
}

function getSeverityBadge(item: HistoryItem) {
  const score = item.health_score
  if (score >= 85 || item.predicted_class?.toLowerCase() === 'healthy')
    return { label: 'Healthy',         cls: 'badge-green'  }
  if (score >= 65) return { label: 'Needs Attention', cls: 'badge-amber'  }
  if (score >= 45) return { label: 'At Risk',          cls: 'badge-orange' }
  return             { label: 'Critical',         cls: 'badge-red'    }
}

export function HistoryCard({ item }: HistoryCardProps) {
  const badge = getSeverityBadge(item)

  return (
    <Link
      to={`/history/${item.id}`}
      className="card card-hover flex items-center gap-4 p-4 group"
      aria-label={`View diagnosis for ${item.crop} - ${item.predicted_class}`}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl bg-[#EDF7F2] overflow-hidden shrink-0 border border-[#D4E8DC]">
        {item.image_url ? (
          <img src={item.image_url} alt={`${item.crop} scan`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#DDF7EA]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-[#10231D]">{item.crop}</span>
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
        </div>
        <p className="text-xs text-[#64736C] font-medium truncate">{item.predicted_class}</p>
        <div className="flex items-center gap-3 text-[10px] text-[#94A09B]">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {item.confidence_percent.toFixed(1)}% confidence
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {item.timestamp}
          </span>
        </div>
      </div>

      {/* Score + Arrow */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="text-base font-extrabold text-[#0B8F68]">{item.health_score}</div>
          <div className="text-[9px] text-[#94A09B] font-medium">/100</div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#94A09B] group-hover:text-[#0B8F68] transition-colors" />
      </div>
    </Link>
  )
}
