// ImageUploader.tsx — Drag and drop + click image upload
import { useRef, useState } from 'react'
import { Camera, ImagePlus, Upload, X } from 'lucide-react'

interface ImageUploaderProps {
  onFile: (file: File) => void
  onCameraOpen: () => void
  onSampleOpen?: () => void
  previewUrl: string | null
  selectedFile: File | null
  onClear: () => void
}

export function ImageUploader({
  onFile,
  onCameraOpen,
  previewUrl,
  selectedFile,
  onClear,
}: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)

  function handleFile(file: File) {
    setSizeError(null)
    if (!file.type.startsWith('image/')) {
      setSizeError('Please upload a valid image file (JPG, PNG, or WEBP).')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setSizeError('Image is too large. Please use an image under 10 MB.')
      return
    }
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
    <div className="space-y-3">
      <p className="section-label">2. Upload Leaf Photo</p>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
        id="leaf-file-input"
        aria-label="Upload plant leaf photo"
      />

      {/* Preview or Dropzone */}
      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-[#D4E8DC] aspect-video bg-[#06251C] flex items-center justify-center">
          <img src={previewUrl} alt="Selected leaf" className="w-full h-full object-contain max-h-64" />
          {/* File info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-3 py-2 flex items-center justify-between">
            <div className="text-xs text-white/90 font-medium truncate">
              {selectedFile?.name ?? 'leaf.jpg'} · {fileSizeKb} KB
            </div>
            <button
              type="button"
              onClick={onClear}
              aria-label="Remove selected image"
              className="ml-2 shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="leaf-file-input"
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 min-h-[200px] rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragging
              ? 'border-[#0B8F68] bg-[#F0FBF5]'
              : 'border-[#D4E8DC] bg-[#F5F8F5] hover:border-[#0B8F68] hover:bg-[#F0FBF5]'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#DDF7EA] border border-[#B9E8D1] flex items-center justify-center">
            <Upload className={`w-7 h-7 ${dragging ? 'text-[#0B8F68]' : 'text-[#0B8F68]'}`} />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-bold text-[#10231D]">
              {dragging ? 'Drop the image here' : 'Upload Plant Leaf Photo'}
            </p>
            <p className="text-xs text-[#64736C] mt-1">Supports JPG, PNG, WEBP leaf closeups · Max 10 MB</p>
          </div>
          <p className="text-xs text-[#0B8F68] font-semibold">
            Best results with a clear, well-lit leaf image
          </p>
        </label>
      )}

      {/* Error */}
      {sizeError && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {sizeError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onCameraOpen}
          className="btn btn-primary text-xs"
          aria-label="Open camera to take photo"
        >
          <Camera className="w-4 h-4" />
          <span>Take Photo</span>
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn btn-secondary text-xs"
          aria-label="Choose image from device"
        >
          <ImagePlus className="w-4 h-4" />
          <span>Choose File</span>
        </button>
      </div>
    </div>
  )
}
