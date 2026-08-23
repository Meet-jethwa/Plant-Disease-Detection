// HistoryPage.tsx — Pathology Audit & Timeline Log
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, History, Scan, Trash2 } from 'lucide-react'

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

export function HistoryPage({ history, onClearHistory }: HistoryPageProps) {
  const [filterCrop, setFilterCrop] = useState<string>('all')

  const filteredHistory = filterCrop === 'all' ? history : history.filter((h) => h.crop === filterCrop)

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* ── Header ── */}
      <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', padding: '20px 24px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#159A70' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#159A70', letterSpacing: '0.05em' }}>
              Audit Log
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Inference History & Specimen Timeline
          </h1>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#991B1B', cursor: 'pointer' }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
            Clear Log
          </button>
        )}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['all', 'rice', 'wheat', 'sugarcane', 'cotton'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilterCrop(c)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              background: filterCrop === c ? '#159A70' : '#ffffff',
              color: filterCrop === c ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: filterCrop === c ? '#159A70' : '#CBD5E1',
              cursor: 'pointer',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Log Grid ── */}
      {filteredHistory.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredHistory.map((item) => (
            <div key={item.id} style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                  {item.crop}
                </span>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar style={{ width: '12px', height: '12px' }} /> {item.timestamp}
                </span>
              </div>

              <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#0F172A' }}>
                <img src={item.image_url} alt={item.predicted_class} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>{item.predicted_class}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span>Confidence: <strong style={{ color: '#0F172A' }}>{item.confidence_percent.toFixed(1)}%</strong></span>
                  <span>Health: <strong style={{ color: '#159A70' }}>{item.health_score}/100</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <History style={{ width: '32px', height: '32px', color: '#94A3B8' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>No Inference History Recorded</h3>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Specimens classified in the scanner will be logged here automatically.</p>
          <Link
            to="/scan"
            style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#159A70', color: '#ffffff', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
          >
            <Scan style={{ width: '14px', height: '14px' }} />
            Open Diagnostic Scanner
          </Link>
        </div>
      )}

    </div>
  )
}