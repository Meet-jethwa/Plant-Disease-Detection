// PlantCard.tsx — Large, premium plant health card
import { Link } from 'react-router-dom'
import { Clock, ChevronRight, Leaf, AlertTriangle } from 'lucide-react'
import type { Plant } from '../types'

interface PlantCardProps {
  plant: Plant
  onClick?: () => void
}

function getStatusConfig(score: number) {
  if (score >= 85) return {
    label: 'Healthy', badgeCls: 'badge-green',
    dot: 'bg-emerald-500', barColor: '#16A34A', scoreColor: 'text-emerald-600',
  }
  if (score >= 65) return {
    label: 'Needs Attention', badgeCls: 'badge-amber',
    dot: 'bg-amber-500', barColor: '#D97706', scoreColor: 'text-amber-600',
  }
  if (score >= 45) return {
    label: 'At Risk', badgeCls: 'badge-orange',
    dot: 'bg-orange-500', barColor: '#EA580C', scoreColor: 'text-orange-600',
  }
  return {
    label: 'Critical', badgeCls: 'badge-red',
    dot: 'bg-red-500', barColor: '#DC2626', scoreColor: 'text-red-600',
  }
}

export function PlantCard({ plant, onClick }: PlantCardProps) {
  const config = getStatusConfig(plant.healthScore)

  return (
    <Link
      to={`/plants/${plant.id}`}
      onClick={onClick}
      className="block bg-white rounded-2xl border border-[#D4E8DC] shadow-sm hover:shadow-xl hover:border-[#0B8F68]/40 hover:-translate-y-1 transition-all duration-200 overflow-hidden group"
      aria-label={`View details for ${plant.name}`}
    >
      {/* Image area — bigger */}
      <div className="relative h-52 bg-gradient-to-br from-[#EDF7F2] to-[#DDF7EA] overflow-hidden">
        {plant.image ? (
          <img
            src={plant.image}
            alt={`${plant.name} leaf`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="w-20 h-20 text-[#0B8F68] opacity-30" />
          </div>
        )}

        {/* Status badge — top right */}
        <div className="absolute top-4 right-4">
          <span className={`badge ${config.badgeCls} text-sm px-3 py-1.5 shadow-md backdrop-blur-sm`}>
            <span className={`w-2 h-2 rounded-full ${config.dot} shrink-0`} aria-hidden="true" />
            {config.label}
          </span>
        </div>

        {/* Species tag — bottom left */}
        <div className="absolute bottom-4 left-4">
          <span className="badge bg-white/85 backdrop-blur-sm text-[#64736C] border-white/50 text-xs font-semibold px-3 py-1.5">
            {plant.species}
          </span>
        </div>
      </div>

      {/* Info section */}
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-[#06251C] leading-tight">{plant.name}</h3>
            <p className="text-sm italic text-[#64736C] mt-1">{plant.scientificName}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#94A09B] group-hover:text-[#0B8F68] transition-colors shrink-0 mt-1" />
        </div>

        {/* Health Score Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#64736C] font-semibold">Health Score</span>
            <span className={`text-xl font-extrabold ${config.scoreColor}`}>{plant.healthScore}<span className="text-sm font-normal text-[#94A09B]">/100</span></span>
          </div>
          <div className="h-2.5 rounded-full bg-[#EDF7F2] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${plant.healthScore}%`, background: config.barColor }}
            />
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-sm pt-1">
          <div className="flex items-center gap-1.5 text-[#94A09B]">
            <Clock className="w-3.5 h-3.5" />
            <span>{plant.lastScanned}</span>
          </div>
          {plant.latestDisease && plant.latestDisease !== 'None detected' && (
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 text-xs font-bold">
              <AlertTriangle className="w-3 h-3" />
              {plant.latestDisease}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
