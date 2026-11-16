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
        <p className="text-sm font-semibold text-[var(--color-ink)]">Select AI model</p>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-[#E4E7E2]">
          Dual engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Multimodal (Best Model) Card */}
        <button
          type="button"
          onClick={() => onSelectModel('multimodal')}
          className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedModel === 'multimodal'
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
              : 'bg-white text-[var(--color-ink)] border-[#E4E7E2] hover:border-emerald-500 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${selectedModel === 'multimodal' ? 'text-amber-300' : 'text-emerald-700'}`} />
              <span className="font-bold text-sm">Best Model (Multimodal)</span>
            </div>
            {selectedModel === 'multimodal' ? (
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Recommended
              </span>
            )}
          </div>
          <p className={`text-sm leading-relaxed ${selectedModel === 'multimodal' ? 'text-emerald-50' : 'text-[var(--color-ink-2)]'}`}>
            Leaf photo + weather data fusion across 33 crop disease classes.
          </p>
        </button>

        {/* Old Models Card */}
        <button
          type="button"
          onClick={() => onSelectModel('old_models')}
          className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedModel === 'old_models'
              ? 'bg-stone-800 text-white border-stone-900 shadow-xs'
              : 'bg-white text-[var(--color-ink)] border-[#E4E7E2] hover:border-stone-500 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="flex items-center gap-2">
              <Layers className={`w-4 h-4 ${selectedModel === 'old_models' ? 'text-teal-300' : 'text-stone-500'}`} />
              <span className="font-bold text-sm">Old Models</span>
            </div>
            {selectedModel === 'old_models' && (
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            )}
          </div>
          <p className={`text-sm leading-relaxed ${selectedModel === 'old_models' ? 'text-stone-300' : 'text-[var(--color-ink-2)]'}`}>
            Classic crop-specific models (Rice, Wheat, Sugarcane, Cotton).
          </p>
        </button>
      </div>
    </div>
  )
}
