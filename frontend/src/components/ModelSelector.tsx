// ModelSelector.tsx — Choose between Best Model (Multimodal) vs Old Models (Crop-Specific)
import { Sparkles, Layers, CheckCircle2 } from 'lucide-react'

export type ModelType = 'multimodal' | 'old_models'

interface ModelSelectorProps {
  selectedModel: ModelType
  onSelectModel: (model: ModelType) => void
}

export function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="section-label">Select AI Model</p>
        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#E6F4ED] text-[#0B8F68]">
          Dual Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Multimodal (Best Model) Card */}
        <button
          type="button"
          onClick={() => onSelectModel('multimodal')}
          className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedModel === 'multimodal'
              ? 'bg-gradient-to-br from-[#0B8F68] to-[#087353] text-white border-[#065E44] shadow-md shadow-[#0B8F68]/20'
              : 'bg-white text-[#10231D] border-[#D4E8DC] hover:border-[#0B8F68] hover:bg-[#F0FBF5]'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${selectedModel === 'multimodal' ? 'text-amber-300' : 'text-[#0B8F68]'}`} />
              <span className="font-bold text-xs sm:text-sm">Best Model (Multimodal)</span>
            </div>
            {selectedModel === 'multimodal' ? (
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            ) : (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                Recommended
              </span>
            )}
          </div>
          <p className={`text-[11px] leading-relaxed ${selectedModel === 'multimodal' ? 'text-emerald-50' : 'text-[#64736C]'}`}>
            Leaf photo + weather data fusion across 33 crop disease classes.
          </p>
        </button>

        {/* Old Models Card */}
        <button
          type="button"
          onClick={() => onSelectModel('old_models')}
          className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedModel === 'old_models'
              ? 'bg-[#10231D] text-white border-[#0A1713] shadow-md'
              : 'bg-white text-[#10231D] border-[#D4E8DC] hover:border-[#10231D] hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="flex items-center gap-2">
              <Layers className={`w-4 h-4 ${selectedModel === 'old_models' ? 'text-teal-300' : 'text-slate-600'}`} />
              <span className="font-bold text-xs sm:text-sm">Old Models</span>
            </div>
            {selectedModel === 'old_models' && (
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            )}
          </div>
          <p className={`text-[11px] leading-relaxed ${selectedModel === 'old_models' ? 'text-slate-300' : 'text-[#64736C]'}`}>
            Classic crop-specific models (Rice, Wheat, Sugarcane, Cotton).
          </p>
        </button>
      </div>
    </div>
  )
}
