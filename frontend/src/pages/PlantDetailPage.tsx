// PlantDetailPage.tsx — Full plant details: care info, latest diagnosis, health timeline
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Scan, MessageSquare, Clock, Leaf, AlertTriangle, CheckCircle2 } from 'lucide-react'
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

function getStatusBadge(status: string) {
  if (status === 'Healthy') {
    return {
      cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      Icon: CheckCircle2,
      strokeClass: 'stroke-emerald-600',
    }
  }
  if (status === 'Needs Attention') {
    return {
      cls: 'bg-amber-50 text-amber-800 border-amber-200',
      Icon: AlertTriangle,
      strokeClass: 'stroke-amber-600',
    }
  }
  if (status === 'At Risk') {
    return {
      cls: 'bg-orange-50 text-orange-800 border-orange-200',
      Icon: AlertTriangle,
      strokeClass: 'stroke-orange-600',
    }
  }
  return {
    cls: 'bg-red-50 text-red-800 border-red-200',
    Icon: AlertTriangle,
    strokeClass: 'stroke-red-600',
  }
}

export function PlantDetailPage({ plants = [] }: PlantDetailPageProps) {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const { id } = useParams<{ id: string }>()

  const plant = plants.find(p => p.id === id)

  if (!plant) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <EmptyState
          icon={<Leaf className="w-8 h-8 text-emerald-700" />}
          title={t('plants.empty')}
          description={t('plants.emptyDesc')}
          action={
            <button
              type="button"
              onClick={() => navigate('/plants')}
              className="btn btn-primary min-h-[44px] px-4 text-sm font-semibold cursor-pointer"
            >
              {t('btn.back')}
            </button>
          }
        />
      </div>
    )
  }

  const statusConfig = getStatusBadge(plant.status)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      
      {/* Back & Title Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/plants')}
          className="btn btn-secondary min-h-[44px] w-11 flex items-center justify-center p-0 cursor-pointer shrink-0"
          aria-label={t('btn.back')}
          id="plant-detail-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] leading-tight">{plant.name}</h1>
          <p className="text-sm italic text-[var(--color-ink-2)]">{plant.scientificName}</p>
        </div>
      </div>

      {/* Hero card */}
      <div className="rounded-2xl border border-[#E4E7E2] bg-white overflow-hidden shadow-xs">
        <div className="grid sm:grid-cols-2">
          {/* Image */}
          <div className="h-56 sm:h-auto bg-stone-100 flex items-center justify-center overflow-hidden">
            {plant.image ? (
              <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="p-8 text-center text-emerald-700/30">
                <Leaf className="w-16 h-16 mx-auto" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.cls}`}>
                <statusConfig.Icon className="w-3.5 h-3.5" />
                <span>{t(('status.' + (plant.status === 'Needs Attention' ? 'needsAttention' : plant.status === 'At Risk' ? 'atRisk' : plant.status.toLowerCase())) as any) || plant.status}</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 capitalize">
                {t(('crop.' + plant.species.toLowerCase()) as any) || plant.species}
              </span>
            </div>

            {/* Health Score ring */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-stone-200" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15.9"
                    fill="none"
                    className={statusConfig.strokeClass}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${plant.healthScore} ${100 - plant.healthScore}`}
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-[var(--color-ink)]">{plant.healthScore}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">{plant.healthScore}<span className="text-sm font-normal text-stone-400">/100</span></p>
                <p className="text-sm text-[var(--color-ink-2)]">{t('diagnosis.healthScore')}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-stone-500">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{plant.lastScanned}</span>
            </div>

            {plant.latestDisease && plant.latestDisease !== 'None detected' && (
              <div className="text-sm bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-900 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{localizeDiseaseName(plant.latestDisease, lang)}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/scan')}
                className="btn btn-primary min-h-[44px] px-3 flex items-center justify-center gap-1.5 text-sm font-semibold cursor-pointer"
                id="plant-detail-scan-btn"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>{t('btn.scanAnother')}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/assistant')}
                className="btn btn-secondary min-h-[44px] px-3 flex items-center justify-center gap-1.5 text-sm font-semibold cursor-pointer"
                id="plant-detail-ask-btn"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t('btn.askChat')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Diagnosis */}
      {plant.latestDisease && plant.latestDisease !== 'None detected' && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[var(--color-ink)]">{t('diagnosis.title')}</h2>
          <DiseaseCard
            diseaseName={plant.latestDisease}
            severity={plant.status === 'At Risk' ? 'High' : plant.status === 'Needs Attention' ? 'Moderate' : 'Low'}
            confidence={82}
          />
        </div>
      )}

      {/* Health Timeline */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[var(--color-ink)]">{t('history.title')}</h2>
        <div className="rounded-2xl border border-[var(--color-green-200)] bg-white p-5 sm:p-6 shadow-xs">
          <PlantTimeline entries={MOCK_TIMELINE} />
        </div>
      </div>
    </div>
  )
}
