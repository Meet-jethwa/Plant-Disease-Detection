// MyPlantsPage.tsx — Website-scale plant grid with search and filter
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Leaf, Search } from 'lucide-react'
import { PlantCard } from '../components/PlantCard'
import { EmptyState } from '../components/ui/EmptyState'
import { MOCK_PLANTS } from '../data/mockData'
import type { Plant } from '../types'

type Filter = 'all' | 'healthy' | 'attention' | 'risk'

interface MyPlantsPageProps {
  plants?: Plant[]
}

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'All Plants' },
  { key: 'healthy',   label: 'Healthy' },
  { key: 'attention', label: 'Needs Attention' },
  { key: 'risk',      label: 'At Risk' },
]

function filterPlants(plants: Plant[], filter: Filter, query: string): Plant[] {
  let result = plants
  if (filter === 'healthy')   result = result.filter(p => p.status === 'Healthy')
  if (filter === 'attention') result = result.filter(p => p.status === 'Needs Attention')
  if (filter === 'risk')      result = result.filter(p => p.status === 'At Risk' || p.status === 'Critical')
  if (query.trim()) {
    const q = query.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.species.toLowerCase().includes(q) ||
      p.scientificName.toLowerCase().includes(q)
    )
  }
  return result
}

export function MyPlantsPage({ plants = MOCK_PLANTS }: MyPlantsPageProps) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const filtered = filterPlants(plants, filter, query)

  const counts = {
    all:       plants.length,
    healthy:   plants.filter(p => p.status === 'Healthy').length,
    attention: plants.filter(p => p.status === 'Needs Attention').length,
    risk:      plants.filter(p => p.status === 'At Risk' || p.status === 'Critical').length,
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-2">Garden Monitor</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#17211D]">My Plants</h1>
          <p className="text-[#66736C] mt-1.5">{plants.length} plants being monitored by AI</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/scan')}
          className="btn btn-primary gap-2 shrink-0"
          id="my-plants-add-btn"
        >
          <Plus className="w-4 h-4" />
          Add Plant
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs text-[#66736C] font-medium mb-2">Healthy</p>
          <p className="text-4xl font-bold text-[#159A70]">{counts.healthy}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-[#66736C] font-medium mb-2">Need Attention</p>
          <p className="text-4xl font-bold text-[#E89B24]">{counts.attention}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-[#66736C] font-medium mb-2">At Risk</p>
          <p className="text-4xl font-bold text-[#D9534F]">{counts.risk}</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96A39D] pointer-events-none" />
        <input
          type="text"
          placeholder="Search plants by name or species..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="input pl-11 text-sm"
          aria-label="Search plants"
          id="my-plants-search"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              filter === tab.key
                ? 'bg-[#159A70] text-white border-[#159A70] shadow-sm'
                : 'bg-white text-[#66736C] border-[#E0EBE4] hover:border-[#BDD8C7] hover:text-[#17211D]'
            }`}
            id={`my-plants-filter-${tab.key}`}
          >
            {tab.label}
            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${filter === tab.key ? 'bg-white/25 text-white' : 'bg-[#F0FAF4] text-[#66736C]'}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Plants grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Leaf className="w-10 h-10" />}
          title={query ? 'No plants found' : 'No plants yet'}
          description={query ? 'Try a different search term.' : 'Add your first plant by scanning a leaf.'}
          action={!query ? (
            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="btn btn-primary btn-lg gap-2"
              id="my-plants-empty-add-btn"
            >
              <Plus className="w-5 h-5" />
              Scan Your First Plant
            </button>
          ) : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((plant, i) => (
            <div
              key={plant.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <PlantCard
                plant={plant}
                onClick={() => navigate(`/plants/${plant.id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
