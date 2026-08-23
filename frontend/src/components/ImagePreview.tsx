// ImagePreview.tsx — Shows captured/uploaded image before analysis
import { ImagePlus, RotateCcw, Scan, Trash2 } from 'lucide-react'

interface ImagePreviewProps {
  previewUrl: string
  selectedFile: File | null
  selectedCrop: string
  onRetake: () => void
  onChooseAnother: () => void
  onAnalyze: () => void
  isPredicting?: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ImagePreview({
  previewUrl,
  selectedFile,
  selectedCrop,
  onRetake,
  onChooseAnother,
  onAnalyze,
  isPredicting = false,
}: ImagePreviewProps) {
  return (
    <div className="card p-5 animate-fade-in-up">
      {/* Image */}
      <div className="relative rounded-xl overflow-hidden bg-[#06251C] mb-4">
        <img
          src={previewUrl}
          alt="Plant leaf preview for analysis"
          className="w-full max-h-72 object-contain"
        />
        {/* Crop tag */}
        <div className="absolute top-3 left-3">
          <span className="badge badge-green text-xs font-700 capitalize px-3 py-1.5 shadow-sm">
            🌿 {selectedCrop}
          </span>
        </div>
      </div>

      {/* File info */}
      {selectedFile && (
        <div className="flex items-center gap-3 p-3 bg-[#F0FBF5] rounded-xl border border-[#D4E8DC] mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#DDF7EA] flex items-center justify-center shrink-0">
            <ImagePlus className="w-4 h-4 text-[#0B8F68]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-600 text-[#10231D] truncate">{selectedFile.name}</p>
            <p className="text-xs text-[#64736C]">
              {formatFileSize(selectedFile.size)} · {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          type="button"
          onClick={onRetake}
          disabled={isPredicting}
          className="btn btn-secondary gap-2"
          id="preview-retake-btn"
        >
          <RotateCcw className="w-4 h-4" />
          Retake
        </button>
        <button
          type="button"
          onClick={onChooseAnother}
          disabled={isPredicting}
          className="btn btn-secondary gap-2"
          id="preview-choose-another-btn"
        >
          <Trash2 className="w-4 h-4" />
          Change
        </button>
      </div>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={isPredicting}
        className="btn btn-primary btn-lg w-full gap-2"
        id="preview-analyze-btn"
      >
        <Scan className="w-5 h-5" />
        {isPredicting ? 'Analyzing…' : 'Analyze Plant'}
      </button>

      <p className="text-xs text-[#94A09B] text-center mt-3">
        AI analysis usually takes 5–15 seconds
      </p>
    </div>
  )
}
