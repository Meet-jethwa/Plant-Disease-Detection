// CropSelector.tsx — Accessible crop selection grid
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
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[var(--color-ink)] text-left">{t('scan.selectCrop')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
              className={`flex items-center justify-center p-3 rounded-xl border text-center cursor-pointer transition-all min-h-[48px] sm:min-h-[52px] ${
                isSelected
                  ? 'bg-[var(--color-green-700)] text-white border-[var(--color-green-700)] font-semibold shadow-sm'
                  : 'bg-white text-[var(--color-ink)] border-[#E4E7E2] hover:border-[var(--color-green-700)] hover:bg-[#F2F4F0]'
              }`}
            >
              <span className="text-sm font-semibold leading-tight truncate w-full text-center">
                {translatedName}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
