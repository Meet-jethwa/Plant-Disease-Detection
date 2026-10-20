// MyPlantsPage.tsx — Monitored Specimens Dashboard
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Sprout } from 'lucide-react'
import { PlantCard } from '../components/PlantCard'
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
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* ── Top Header ── */}
      <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', padding: '20px 24px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#159A70' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#159A70', letterSpacing: '0.05em' }}>
              {t('plants.badge')}
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            {t('plants.title')}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate('/scan')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#159A70', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus style={{ width: '15px', height: '15px' }} />
          {t('plants.registerNew')}
        </button>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>{t('plants.healthySpecimens')}</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#159A70', marginTop: '4px' }}>{counts.healthy}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>{t('plants.attentionRequired')}</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>{counts.attention}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>{t('plants.highRisk')}</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>{counts.risk}</div>
        </div>
      </div>

      {/* ── Search & Filter Tabs ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search style={{ width: '15px', height: '15px', color: '#94A3B8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('plants.searchPlaceholder')}
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#ffffff' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                background: filter === tab.key ? '#159A70' : '#ffffff',
                color: filter === tab.key ? '#ffffff' : '#475569',
                border: '1px solid',
                borderColor: filter === tab.key ? '#159A70' : '#CBD5E1',
                cursor: 'pointer',
              }}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {plants.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #D4E8DC', borderRadius: '16px', padding: '56px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F0FBF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B8F68', marginBottom: '16px' }}>
            <Sprout style={{ width: '28px', height: '28px' }} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#10231D', margin: '0 0 8px 0' }}>
            {t('plants.empty')}
          </h2>
          <p style={{ fontSize: '14px', color: '#64736C', maxWidth: '440px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            {t('plants.emptyDesc')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/scan')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#0B8F68', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            {t('plants.scanFirst')}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '48px', textAlign: 'center', color: '#64748B' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t('plants.empty')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {filtered.map((plant) => (
            <div key={plant.id} onClick={() => navigate(`/plants/${plant.id}`)} style={{ cursor: 'pointer' }}>
              <PlantCard plant={plant} />
            </div>
          ))}
        </div>
      )}

    </div>
  )
}