// HistoryPage.tsx — Clean scan history timeline
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, History, Scan, Trash2, Leaf } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState'
import { useLang } from '../contexts/LanguageContext'
import { localizeDiseaseName } from '../i18n/translations'

export type HistoryItem = {
  id: string
  crop: string
  predicted_class: string
  confidence_percent: number
  health_score: number
  timestamp: string
  image_url: string
}

interface HistoryPageProps {
  history: HistoryItem[]
  onClearHistory: () => void
}

function getHealthScoreConfig(score: number) {
  if (score >= 85) {
    return {
      textColor: 'text-emerald-700',
      barColor: 'bg-emerald-600',
    }
  }
  if (score >= 65) {
    return {
      textColor: 'text-amber-700',
      barColor: 'bg-amber-500',
    }
  }
  if (score >= 45) {
    return {
      textColor: 'text-orange-700',
      barColor: 'bg-orange-500',
    }
  }
  return {
    textColor: 'text-red-700',
    barColor: 'bg-red-600',
  }
}

export function HistoryPage({ history, onClearHistory }: HistoryPageProps) {
  const { t, lang } = useLang()
  const [filterCrop, setFilterCrop] = useState<string>('all')
  const filteredHistory = filterCrop === 'all' ? history : history.filter(h => h.crop.toLowerCase() === filterCrop.toLowerCase())

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 pb-24 space-y-6">
      
      {/* ── Page Header ── */}
      <div className="rounded-2xl border border-[var(--color-green-200)] bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-green-50)] px-3 py-1 text-xs font-semibold text-[var(--color-brand)] border border-[var(--color-green-200)] mb-2">
            <History className="h-3.5 w-3.5" />
            <span>{t('history.title')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
            {t('nav.history')}
          </h1>
          <p className="text-sm text-[var(--color-ink-2)] mt-1">
            {history.length} {t('history.diagnosesRecorded')}
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="btn btn-secondary min-h-[44px] px-4 text-red-700 border-red-200 hover:bg-red-50 flex items-center gap-2 text-sm font-semibold cursor-pointer shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t('history.clear')}</span>
          </button>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'rice', 'wheat', 'sugarcane', 'cotton'].map(c => {
          const label = c === 'all' ? t('library.allCrops') : (t(('crop.' + c) as any) || c)
          const active = filterCrop.toLowerCase() === c.toLowerCase()
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCrop(c)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                active
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* ── History Grid ── */}
      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHistory.map(item => {
            const healthConfig = getHealthScoreConfig(item.health_score)
            const cropKey = `crop.${item.crop.toLowerCase()}`
            const translatedCrop = t(cropKey as any) !== cropKey ? t(cropKey as any) : item.crop

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#E4E7E2] bg-white p-5 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#F2F4F0] text-[var(--color-brand)] border border-[#E4E7E2] capitalize">
                    {translatedCrop}
                  </span>
                  <div className="flex items-center gap-1.5 text-stone-500 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                {/* Leaf Image preview */}
                <div className="rounded-xl overflow-hidden aspect-video bg-stone-100 border border-stone-200 relative">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.predicted_class}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Leaf className="w-10 h-10 text-stone-300" />
                    </div>
                  )}
                </div>

                {/* Diagnosis details */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[var(--color-ink)] leading-snug">
                    {localizeDiseaseName(item.predicted_class, lang)}
                  </h3>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-[var(--color-ink-2)] font-semibold">{t('common.confidence')}</span>
                      <p className="text-base font-bold text-[var(--color-brand)] mt-0.5">
                        {item.confidence_percent.toFixed(1)}%
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[var(--color-ink-2)] font-semibold">{t('common.health')}</span>
                      <p className={`text-base font-bold ${healthConfig.textColor} mt-0.5`}>
                        {item.health_score}/100
                      </p>
                    </div>
                  </div>

                  {/* Health bar */}
                  <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${healthConfig.barColor}`}
                      style={{ width: `${Math.min(100, Math.max(0, item.health_score))}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={<History className="w-8 h-8 text-emerald-700" />}
          title={t('history.empty')}
          description={t('plants.emptyDesc')}
          action={
            <Link
              to="/scan"
              className="btn btn-primary min-h-[44px] px-4 inline-flex items-center gap-2 text-sm font-semibold cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>{t('btn.scanPlant')}</span>
            </Link>
          }
        />
      )}
    </div>
  )
}
