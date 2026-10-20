// PlantDetailPage.tsx — Full plant details: care info, latest diagnosis, health timeline
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Scan, MessageSquare, Clock, Leaf } from 'lucide-react'
import { PlantTimeline } from '../components/PlantTimeline'
import { DiseaseCard } from '../components/DiseaseCard'
import { EmptyState } from '../components/ui/EmptyState'
import { MOCK_TIMELINE } from '../data/mockData'
import { useLang } from '../contexts/LanguageContext'
import { localizeDiseaseName } from '../i18n/translations'
import type { Plant } from '../types'

interface PlantDetailPageProps {
  plants?: Plant[]
}

export function PlantDetailPage({ plants = [] }: PlantDetailPageProps) {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const { id } = useParams<{ id: string }>()

  const plant = plants.find(p => p.id === id)

  if (!plant) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <EmptyState
          icon={<Leaf className="w-8 h-8" />}
          title={t('plants.empty')}
          description={t('plants.emptyDesc')}
          action={
            <button type="button" onClick={() => navigate('/plants')} className="btn btn-primary">
              {t('btn.back')}
            </button>
          }
        />
      </div>
    )
  }

  const statusBadgeClass =
    plant.status === 'Healthy' ? 'badge-green' :
    plant.status === 'Needs Attention' ? 'badge-amber' :
    plant.status === 'At Risk' ? 'badge-orange' : 'badge-red'

  const scoreColor =
    plant.healthScore >= 85 ? '#0B8F68' :
    plant.healthScore >= 65 ? '#D97706' :
    plant.healthScore >= 45 ? '#EA580C' : '#DC2626'

  return (
    <div className="max-w-3xl mx-auto py-6 animate-fade-in">
      {/* Back */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={() => navigate('/plants')}
          className="btn btn-secondary btn-icon"
          aria-label={t('btn.back')}
          id="plant-detail-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-700 text-[#10231D]">{plant.name}</h1>
          <p className="text-sm italic text-[#64736C]">{plant.scientificName}</p>
        </div>
      </div>

      {/* Hero card */}
      <div className="card-lg overflow-hidden mb-5">
        <div className="grid sm:grid-cols-2">
          {/* Image */}
          <div className="h-56 sm:h-full bg-[#EDF7F2] flex items-center justify-center overflow-hidden">
            {plant.image ? (
              <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-[#0B8F68] opacity-30 text-6xl">🌿</div>
            )}
          </div>

          {/* Info */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className={`badge ${statusBadgeClass}`}>
                {t(('status.' + (plant.status === 'Needs Attention' ? 'needsAttention' : plant.status === 'At Risk' ? 'atRisk' : plant.status.toLowerCase())) as any) || plant.status}
              </span>
              <span className="badge badge-slate capitalize">
                {t(('crop.' + plant.species.toLowerCase()) as any) || plant.species}
              </span>
            </div>

            {/* Health Score ring */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E8F5EE" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15.9"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${plant.healthScore} ${100 - plant.healthScore}`}
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-800 text-[#10231D]">{plant.healthScore}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-800 text-[#10231D]">{plant.healthScore}<span className="text-sm font-400 text-[#64736C]">/100</span></p>
                <p className="text-xs text-[#64736C]">{t('diagnosis.healthScore')}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#94A09B] mb-4">
              <Clock className="w-3.5 h-3.5" />
              {plant.lastScanned}
            </div>

            {plant.latestDisease && plant.latestDisease !== 'None detected' && (
              <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-800 font-500 mb-4">
                ⚠ {localizeDiseaseName(plant.latestDisease, lang)}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate('/scan')}
                className="btn btn-primary btn-sm gap-1.5"
                id="plant-detail-scan-btn"
              >
                <Scan className="w-3.5 h-3.5" />
                {t('btn.scanAnother')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/assistant')}
                className="btn btn-secondary btn-sm gap-1.5"
                id="plant-detail-ask-btn"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {t('btn.askChat')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Diagnosis */}
      {plant.latestDisease && plant.latestDisease !== 'None detected' && (
        <div className="mb-5">
          <h2 className="text-base font-700 text-[#10231D] mb-3">{t('diagnosis.title')}</h2>
          <DiseaseCard
            diseaseName={plant.latestDisease}
            severity={plant.status === 'At Risk' ? 'High' : plant.status === 'Needs Attention' ? 'Moderate' : 'Low'}
            confidence={82}
          />
        </div>
      )}

      {/* Health Timeline */}
      <div className="mb-6">
        <h2 className="text-base font-700 text-[#10231D] mb-3">{t('history.title')}</h2>
        <PlantTimeline entries={MOCK_TIMELINE} />
      </div>
    </div>
  )
}
