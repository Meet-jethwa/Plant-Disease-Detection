// PlantCard.tsx — Standard plant health card
import { Link } from 'react-router-dom'
import { Clock, ChevronRight, Leaf, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Plant } from '../types'
import { PlantHealthGlyph } from './PlantHealthGlyph'
import { useLang } from '../contexts/LanguageContext'
import { localizeDiseaseName } from '../i18n/translations'

interface PlantCardProps {
  plant: Plant
  onClick?: () => void
}

function getStatusConfig(score: number, t: (k: string) => string) {
  if (score >= 85) return {
    label: t('status.healthy'),
    pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    barClass: 'bg-emerald-600',
    scoreClass: 'text-emerald-700',
    Icon: CheckCircle2,
  }
  if (score >= 65) return {
    label: t('status.needsAttention'),
    pillClass: 'bg-amber-50 text-amber-800 border-amber-200',
    barClass: 'bg-amber-500',
    scoreClass: 'text-amber-700',
    Icon: AlertTriangle,
  }
  if (score >= 45) return {
    label: t('status.atRisk'),
    pillClass: 'bg-orange-50 text-orange-800 border-orange-200',
    barClass: 'bg-orange-500',
    scoreClass: 'text-orange-700',
    Icon: AlertTriangle,
  }
  return {
    label: t('status.critical'),
    pillClass: 'bg-red-50 text-red-800 border-red-200',
    barClass: 'bg-red-600',
    scoreClass: 'text-red-700',
    Icon: AlertTriangle,
  }
}

export function PlantCard({ plant, onClick }: PlantCardProps) {
  const { t, lang } = useLang()
  const config = getStatusConfig(plant.healthScore, t)
  const translatedSpecies = t(('crop.' + plant.species.toLowerCase()) as any) || plant.species

  return (
    <Link
      to={`/plants/${plant.id}`}
      onClick={onClick}
      className="block bg-white rounded-2xl border border-[var(--color-green-200)] shadow-xs hover:shadow-md hover:border-emerald-500 transition-all duration-200 overflow-hidden group"
      aria-label={`${t('common.view')} ${plant.name}`}
    >
      {/* Image area */}
      <div className="relative h-48 sm:h-52 bg-stone-100 overflow-hidden">
        {plant.image ? (
          <img
            src={plant.image}
            alt={`${plant.name} leaf`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--color-green-50)]">
            <Leaf className="w-16 h-16 text-emerald-700/30" />
          </div>
        )}

        {/* Status badge — top right */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs backdrop-blur-xs ${config.pillClass}`}>
            <config.Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {config.label}
          </span>
        </div>

        {/* Species tag — bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-[var(--color-brand)] border border-emerald-100 shadow-xs">
            {translatedSpecies}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-700 text-white shadow-xs">
            {plant.species === 'Rice' ? t('tag.leafNeck') : plant.species === 'Wheat' ? t('tag.flagEars') : plant.species === 'Sugarcane' ? t('tag.stalkPith') : t('tag.leafVeins')}
          </span>
        </div>
      </div>

      {/* Info section */}
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-ink)] leading-tight group-hover:text-[var(--color-brand)] transition-colors">{plant.name}</h3>
            <p className="text-sm italic text-[var(--color-ink-2)] mt-0.5">{plant.scientificName}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-[var(--color-brand)] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
        </div>

        {/* Health signal and score */}
        <div className="flex items-center gap-3">
          <PlantHealthGlyph score={plant.healthScore} size="sm" />
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--color-ink-2)] font-semibold">{t('common.healthScore')}</span>
              <span className={`text-base font-bold ${config.scoreClass}`}>{plant.healthScore}<span className="text-xs font-normal text-stone-400">/100</span></span>
            </div>
            <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${config.barClass}`}
                style={{ width: `${Math.min(100, Math.max(0, plant.healthScore))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-sm pt-1 border-t border-stone-100">
          <div className="flex items-center gap-1.5 text-stone-500">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{plant.lastScanned}</span>
          </div>
          {plant.latestDisease && plant.latestDisease !== 'None detected' && (
            <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-0.5 text-xs font-bold">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>{localizeDiseaseName(plant.latestDisease, lang)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
