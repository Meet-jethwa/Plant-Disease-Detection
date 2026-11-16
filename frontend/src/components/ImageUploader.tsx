// ImageUploader.tsx — FloraAI clean upload zone
import { useRef, useState } from 'react'
import { AlertCircle, Camera, ImagePlus, Upload, X } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

interface ImageUploaderProps {
  onFile: (file: File) => void
  onCameraOpen: () => void
  onSampleOpen?: () => void
  previewUrl: string | null
  selectedFile: File | null
  onClear: () => void
}

export function ImageUploader({ onFile, onCameraOpen, previewUrl, selectedFile, onClear }: ImageUploaderProps) {
  const { t } = useLang()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)

  function handleFile(file: File) {
    setSizeError(null)
    if (!file.type.startsWith('image/')) { setSizeError(t('uploader.invalidType')); return }
    if (file.size > 10 * 1024 * 1024) { setSizeError(t('uploader.tooLarge')); return }
    onFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const fileSizeKb = selectedFile ? (selectedFile.size / 1024).toFixed(0) : null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-[var(--color-ink)] text-center">
        {t('uploader.leafImage')}
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
        id="leaf-file-input"
        aria-label={t('uploader.uploadHint')}
      />

      {/* Preview or Dropzone */}
      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-[#E4E7E2] bg-[#F2F4F0] aspect-video flex items-center justify-center shadow-sm">
          <img
            src={previewUrl}
            alt="Selected leaf"
            className="w-full h-full object-contain max-h-64"
          />
          {/* File info bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[var(--color-ink)]/80 to-transparent p-3 pt-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-green-500)]" />
              <span className="text-sm text-white/90 truncate max-w-[200px]">
                {selectedFile?.name ?? 'leaf.jpg'} · {fileSizeKb}KB
              </span>
            </div>
            <button
              type="button"
              onClick={onClear}
              aria-label={t('uploader.remove')}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="leaf-file-input"
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3.5 min-h-[220px] rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all ${
            dragging
              ? 'border-[var(--color-green-700)] bg-[#F2F4F0] shadow-inner'
              : 'border-[#E4E7E2] bg-white hover:bg-[#F2F4F0]/60 hover:border-[var(--color-green-700)]'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F2F4F0] border border-[#E4E7E2] flex items-center justify-center text-[var(--color-green-700)] shadow-sm">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {dragging ? t('uploader.dropHint') : t('uploader.uploadHint')}
            </p>
            <p className="text-sm text-[var(--color-ink-2)]">
              {t('uploader.fileLimits')}
            </p>
          </div>
          <p className="text-sm text-[var(--color-green-700)] font-medium">
            {t('uploader.tip')}
          </p>
        </label>
      )}

      {/* Error */}
      {sizeError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-sm text-[var(--color-danger)] font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{sizeError}</span>
        </div>
      )}

      {/* Action Buttons */}
      {!previewUrl && (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCameraOpen}
            className="btn btn-primary btn-sm flex items-center justify-center gap-2 min-h-[44px]"
            aria-label={t('uploader.takePhoto')}
          >
            <Camera className="w-4 h-4" />
            <span>{t('uploader.takePhoto')}</span>
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn btn-secondary btn-sm flex items-center justify-center gap-2 min-h-[44px]"
            aria-label={t('uploader.chooseFile')}
          >
            <ImagePlus className="w-4 h-4" />
            <span>{t('uploader.chooseFile')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
