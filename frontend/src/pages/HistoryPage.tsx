import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, History, Scan } from 'lucide-react'

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
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pathology Timeline Log</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Scanned Plant History</h1>
          <p className="text-slate-600 text-xs mt-1 font-medium">Review past crop diagnoses, confidence records, and health indices.</p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold text-slate-700 hover:text-rose-700 transition-all cursor-pointer shadow-2xs"
          >
            Clear History Log
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['all', 'rice', 'wheat', 'sugarcane', 'cotton'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilterCrop(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterCrop === c
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* History Grid */}
      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div key={item.id} className="glass-panel p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="badge-emerald capitalize">{item.crop}</span>
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> {item.timestamp}
                </span>
              </div>

              <div className="rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100">
                <img src={item.image_url} alt={item.predicted_class} className="w-full h-full object-cover" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">{item.predicted_class}</h3>
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium mt-2">
                  <span>Confidence: {item.confidence_percent.toFixed(1)}%</span>
                  <span className="text-emerald-700 font-bold">Health Score: {item.health_score}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mx-auto">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Scan History Yet</h3>
          <p className="text-xs text-slate-600 font-medium">
            Diagnoses performed in the Plant Scanner will be automatically logged here.
          </p>
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm shadow-emerald-600/20"
          >
            <Scan className="w-4 h-4" />
            <span>Go to Plant Scanner</span>
          </Link>
        </div>
      )}
    </div>
  )
}
