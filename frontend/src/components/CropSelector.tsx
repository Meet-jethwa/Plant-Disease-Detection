// CropSelector.tsx — Scrollable crop selection grid
import type { Crop } from '../types'
import { MOCK_CROPS } from '../data/mockData'

interface CropSelectorProps {
  crops?: Crop[]
  selectedCrop: string
  onSelect: (crop: string) => void
}

export function CropSelector({ crops = MOCK_CROPS, selectedCrop, onSelect }: CropSelectorProps) {
  return (
    <div>
      <p className="section-label mb-3 text-center">1. Select Crop Type</p>
      <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
        {crops.map(crop => {
          const isSelected = selectedCrop === crop.name
          return (
            <button
              key={crop.name}
              type="button"
              onClick={() => onSelect(crop.name)}
              aria-pressed={isSelected}
              className={`flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border text-center cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#0B8F68] text-white border-[#065E44] shadow-md shadow-[#0B8F68]/25'
                  : 'bg-white text-[#64736C] border-[#D4E8DC] hover:border-[#0B8F68] hover:bg-[#F0FBF5] hover:text-[#10231D]'
              }`}
            >
              <span className="text-xl sm:text-2xl leading-none" role="img" aria-label={crop.label}>
                {crop.emoji ?? '🌿'}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold leading-tight mt-0.5 truncate w-full text-center">
                {crop.label}
              </span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-white/80 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
