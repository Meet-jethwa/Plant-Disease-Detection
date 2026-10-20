// HistoryPage.tsx — BioScan Lab dark scan history timeline
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, History, Scan, Trash2 } from 'lucide-react'
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

function getHealthColor(score: number) {
  if (score >= 85) return 'var(--neon-green)'
  if (score >= 65) return 'var(--neon-amber)'
  if (score >= 45) return '#FF8C00'
  return 'var(--neon-red)'
}

export function HistoryPage({ history, onClearHistory }: HistoryPageProps) {
  const { t, lang } = useLang()
  const [filterCrop, setFilterCrop] = useState<string>('all')
  const filteredHistory = filterCrop === 'all' ? history : history.filter(h => h.crop === filterCrop)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', marginBottom: 10 }}>
            <History style={{ width: 12, height: 12, color: 'var(--neon-green)' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--neon-green)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>{t('history.title')}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {t('nav.history')}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {history.length} {t('history.diagnosesRecorded')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {['all', 'rice', 'wheat', 'sugarcane', 'cotton'].map(c => {
              const label = c === 'all' ? t('library.allCrops') : (t(('crop.' + c) as any) || c)
              return (
                <button key={c} type="button" onClick={() => setFilterCrop(c)}
                  className={`chip ${filterCrop === c ? 'active' : ''}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {history.length > 0 && (
            <button type="button" onClick={onClearHistory} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Trash2 style={{ width: 13, height: 13 }} />
              {t('history.clear')}
            </button>
          )}
        </div>
      </div>

      {/* History Grid */}
      {filteredHistory.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredHistory.map(item => {
            const healthColor = getHealthColor(item.health_score)
            const cropKey = `crop.${item.crop.toLowerCase()}`
            const translatedCrop = t(cropKey as any) !== cropKey ? t(cropKey as any) : item.crop

            return (
              <div key={item.id} className="bio-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-green" style={{ textTransform: 'capitalize' }}>{translatedCrop}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                    <Calendar style={{ width: 10, height: 10 }} />
                    {item.timestamp}
                  </div>
                </div>

                {/* Image */}
                <div style={{
                  borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9',
                  border: '1px solid var(--border-subtle)', background: '#020906',
                  position: 'relative',
                }}>
                  <img src={item.image_url} alt={item.predicted_class}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="scan-overlay" />
                </div>

                {/* Data */}
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                    {localizeDiseaseName(item.predicted_class, lang)}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 2 }}>{t('common.confidence')}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>
                        {item.confidence_percent.toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 2 }}>{t('common.health')}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: healthColor }}>
                        {item.health_score}/100
                      </div>
                    </div>
                  </div>

                  {/* Health bar */}
                  <div className="progress-track" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{
                      width: `${item.health_score}%`,
                      background: `linear-gradient(90deg, ${healthColor}50, ${healthColor})`,
                      boxShadow: `0 0 6px ${healthColor}50`,
                    }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', gap: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <History style={{ width: 28, height: 28, color: 'var(--text-muted)' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              {t('history.empty')}
            </h3>
          </div>
          <Link to="/scan" className="btn btn-primary">
            <Scan style={{ width: 15, height: 15 }} />
            {t('btn.scanPlant')}
          </Link>
        </div>
      )}
    </div>
  )
}
