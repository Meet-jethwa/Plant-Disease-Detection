// MyPlantsPage.tsx — Monitored Specimens Dashboard
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Sprout, HeartPulse, AlertTriangle, ShieldAlert } from 'lucide-react'
import { PlantCard } from '../components/PlantCard'
import { EmptyState } from '../components/ui/EmptyState'
import { useLang } from '../contexts/LanguageContext'
import type { Plant } from '../types'

type Filter = 'all' | 'healthy' | 'attention' | 'risk'

interface MyPlantsPageProps {
  plants?: Plant[]
}

function filterPlants(plants: Plant[], filter: Filter, query: string): Plant[] {
  let result = plants
  if (filter === 'healthy') result = result.filter((p) => p.status === 'Healthy')
  if (filter === 'attention') result = result.filter((p) => p.status === 'Needs Attention')
  if (filter === 'risk') result = result.filter((p) => p.status === 'At Risk' || p.status === 'Critical')
  if (query.trim()) {
    const q = query.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.species.toLowerCase().includes(q) ||
        p.scientificName.toLowerCase().includes(q)
    )
  }
  return result
}

export function MyPlantsPage({ plants = [] }: MyPlantsPageProps) {
  const navigate = useNavigate()
  const { t } = useLang()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const FILTER_TABS: { key: Filter; label: string }[] = [
    { key: 'all', label: t('plants.allCrops') },
    { key: 'healthy', label: t('plants.healthy') },
    { key: 'attention', label: t('plants.needsAttention') },
    { key: 'risk', label: t('plants.highRisk') },
  ]

  const filtered = filterPlants(plants, filter, query)

  const counts = {
    all: plants.length,
    healthy: plants.filter((p) => p.status === 'Healthy').length,
    attention: plants.filter((p) => p.status === 'Needs Attention').length,
    risk: plants.filter((p) => p.status === 'At Risk' || p.status === 'Critical').length,
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 pb-24 space-y-6">
      
      {/* ── Top Header ── */}
      <div className="rounded-2xl border border-[var(--color-green-200)] bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-green-50)] px-3 py-1 text-xs font-semibold text-[var(--color-brand)] border border-[var(--color-green-200)] mb-2">
            <Sprout className="h-3.5 w-3.5" />
            <span>{t('plants.badge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
            {t('plants.title')}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate('/scan')}
          className="btn btn-primary min-h-[44px] px-4 flex items-center gap-2 text-sm font-semibold cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{t('plants.registerNew')}</span>
        </button>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#E4E7E2] bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-stone-500">
              {t('plants.healthySpecimens')}
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">
              {counts.healthy}
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <HeartPulse className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#E4E7E2] bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-stone-500">
              {t('plants.attentionRequired')}
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-700 mt-1">
              {counts.attention}
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#E4E7E2] bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-stone-500">
              {t('plants.highRisk')}
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-red-700 mt-1">
              {counts.risk}
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── Search & Filter Tabs ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('plants.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                filter === tab.key
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {plants.length === 0 ? (
        <EmptyState
          icon={<Sprout className="h-8 w-8 text-emerald-700" />}
          title={t('plants.empty')}
          description={t('plants.emptyDesc')}
          action={
            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="btn btn-primary min-h-[44px] px-4 flex items-center gap-2 text-sm font-semibold cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t('plants.scanFirst')}</span>
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-500 shadow-xs">
          <p className="text-sm font-semibold">{t('plants.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((plant) => (
            <div key={plant.id} onClick={() => navigate(`/plants/${plant.id}`)} className="cursor-pointer">
              <PlantCard plant={plant} />
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
