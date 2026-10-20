// CropSelector.tsx — Scrollable crop selection grid
import type { Crop } from '../types'
import { MOCK_CROPS } from '../data/mockData'
import { useLang } from '../contexts/LanguageContext'

interface CropSelectorProps {
  crops?: Crop[]
  selectedCrop: string
  onSelect: (crop: string) => void
}

export function CropSelector({ crops = MOCK_CROPS, selectedCrop, onSelect }: CropSelectorProps) {
  const { t } = useLang()

  return (
    <div>
      <p className="section-label mb-3 text-center">{t('scan.selectCrop')}</p>
      <div className="grid grid-cols-4 gap-2">
        {crops.map(crop => {
          const isSelected = selectedCrop === crop.name
          const cropKey = `crop.${crop.name.toLowerCase()}`
          const translatedName = t(cropKey) !== cropKey ? t(cropKey) : crop.label

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
              <span className="text-xl sm:text-2xl leading-none" role="img" aria-label={translatedName}>
                {crop.emoji ?? '🌿'}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold leading-tight mt-0.5 truncate w-full text-center">
                {translatedName}
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
