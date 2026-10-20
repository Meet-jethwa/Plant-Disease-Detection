// ImageUploader.tsx — FloraAI clean white dropzone
// Design inspired by app/static/styles.css: white bg, green border, clean shadow
import { useRef, useState } from 'react'
import { Camera, ImagePlus, Upload, X } from 'lucide-react'
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
    e.preventDefault(); setDragging(false)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-2)', marginBottom: 2, textAlign: 'center' }}>
        {t('uploader.leafImage')}
      </p>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }} onChange={handleChange}
        id="leaf-file-input" aria-label={t('uploader.uploadHint')}
      />

      {/* Preview or Dropzone */}
      {previewUrl ? (
        <div style={{
          position: 'relative', borderRadius: 12, overflow: 'hidden',
          /* Clean white card — matches app's .video-wrap */
          border: '1px solid var(--color-green-200)',
          background: 'var(--color-green-50)',
          aspectRatio: '16/9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-card)',
        }}>
          <img src={previewUrl} alt="Selected leaf" style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: 260 }} />
          {/* File info overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(11, 46, 28, 0.7))',
            padding: '20px 12px 10px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="status-dot status-dot-green" style={{ width: 6, height: 6 }} />
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedFile?.name ?? 'leaf.jpg'} · {fileSizeKb}KB
              </span>
            </div>
            <button type="button" onClick={onClear} aria-label={t('uploader.remove')}
              style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
              }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="leaf-file-input"
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 14, minHeight: 200, borderRadius: 12,
            /* App-inspired: white bg with green dashed border */
            border: `2px dashed ${dragging ? 'var(--color-green-600)' : 'var(--color-green-200)'}`,
            background: dragging ? 'var(--color-green-50)' : 'var(--color-white)',
            cursor: 'pointer', transition: 'all 0.18s ease',
            boxShadow: dragging ? '0 0 0 4px rgba(21, 128, 61, 0.08) inset' : 'var(--shadow-card)',
          }}
        >
          {/* Upload icon badge — matches app's clean icon pattern */}
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: dragging ? 'var(--color-green-100)' : 'var(--color-green-50)',
            border: '1px solid var(--color-green-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.18s ease',
          }}>
            <Upload style={{ width: 24, height: 24, color: 'var(--color-green-600)' }} />
          </div>
          <div style={{ textAlign: 'center', padding: '0 16px' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 4 }}>
              {dragging ? t('uploader.dropHint') : t('uploader.uploadHint')}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-2)' }}>
              {t('uploader.fileLimits')}
            </p>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-green-700)' }}>
            {t('uploader.tip')}
          </p>
        </label>
      )}

      {/* Error */}
      {sizeError && (
        <div style={{
          padding: '8px 12px', borderRadius: 8,
          background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)',
          fontSize: '0.8rem', color: 'var(--color-danger)',
        }}>
          ⚠ {sizeError}
        </div>
      )}

      {/* Action Buttons */}
      {!previewUrl && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button type="button" onClick={onCameraOpen} className="btn btn-primary btn-sm" aria-label={t('uploader.takePhoto')}>
            <Camera style={{ width: 14, height: 14 }} />
            <span>{t('uploader.takePhoto')}</span>
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-secondary btn-sm" aria-label={t('uploader.chooseFile')}>
            <ImagePlus style={{ width: 14, height: 14 }} />
            <span>{t('uploader.chooseFile')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
