// CameraScanner.tsx — Real browser camera interface
import { useEffect, useRef } from 'react'
import { Camera, CameraOff, FlipHorizontal, Image, RotateCcw, X, ZapOff } from 'lucide-react'
import { useCamera } from '../hooks/useCamera'

interface CameraScannerProps {
  onCapture: (file: File) => void
  onClose: () => void
  onUploadInstead: () => void
}

export function CameraScanner({ onCapture, onClose, onUploadInstead }: CameraScannerProps) {
  const camera = useCamera()
  const galleryRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    camera.startCamera('environment')
    return () => { camera.stopCamera() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCapture() {
    const file = camera.capturePhoto()
    if (file) onCapture(file)
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      camera.stopCamera()
      onCapture(file)
    }
  }

  function handleRetake() {
    camera.retake()
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Hidden canvas for capture */}
      <canvas ref={camera.canvasRef} className="hidden" />

      {/* Hidden gallery input */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGalleryChange}
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-sm z-10">
        <button
          type="button"
          onClick={() => { camera.stopCamera(); onClose() }}
          aria-label="Close camera"
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-white font-bold text-sm">FloraAI Scanner</div>
          <div className="text-white/60 text-xs">Position leaf in frame</div>
        </div>
        <button
          type="button"
          onClick={camera.toggleFacing}
          aria-label="Switch camera"
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <FlipHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {/* Permission Denied */}
        {(camera.state === 'denied' || camera.state === 'unavailable') && (
          <div className="absolute inset-0 bg-[#06251C] flex flex-col items-center justify-center gap-6 p-6 z-20">
            <div className="w-20 h-20 rounded-3xl bg-red-900/40 flex items-center justify-center">
              {camera.state === 'denied' ? (
                <CameraOff className="w-10 h-10 text-red-400" />
              ) : (
                <ZapOff className="w-10 h-10 text-amber-400" />
              )}
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold text-lg mb-2">
                {camera.state === 'denied' ? 'Camera Access Denied' : 'Camera Unavailable'}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                {camera.error ?? 'Unable to access camera.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={onUploadInstead}
                className="w-full py-3 rounded-xl bg-[#0B8F68] text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <Image className="w-5 h-5" />
                Upload Image Instead
              </button>
              <button
                type="button"
                onClick={() => camera.startCamera()}
                className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Captured Preview */}
        {camera.state === 'captured' && camera.capturedImage && (
          <div className="absolute inset-0 z-20 flex flex-col">
            <img src={camera.capturedImage} alt="Captured leaf" className="flex-1 w-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        {/* Live Camera */}
        <video
          ref={camera.videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          aria-label="Camera preview"
        />

        {/* Scan Frame Overlay */}
        {camera.state === 'active' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              {/* Corner marks */}
              {[
                'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-lg',
                'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-lg',
                'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-lg',
                'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-lg',
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-[#0B8F68] ${cls}`} />
              ))}
              {/* Scan line */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#0B8F68] to-transparent opacity-80"
                style={{ animation: 'scan-line 2.5s ease-in-out infinite' }}
              />
            </div>
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <span className="text-white/80 text-xs bg-black/40 px-3 py-1 rounded-full">
                Align the affected leaf within the frame
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/60 backdrop-blur-sm px-6 py-6 flex items-center justify-center gap-8">
        {camera.state === 'captured' ? (
          <>
            {/* Retake */}
            <button
              type="button"
              onClick={handleRetake}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/70 text-xs">Retake</span>
            </button>

            {/* Use Photo */}
            <button
              type="button"
              onClick={() => { if (camera.capturedFile) onCapture(camera.capturedFile) }}
              className="w-20 h-20 rounded-full bg-[#0B8F68] flex items-center justify-center shadow-lg shadow-[#0B8F68]/50 hover:bg-[#087A59] transition-colors"
              aria-label="Use this photo"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>

            {/* Gallery */}
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/70 text-xs">Gallery</span>
            </button>
          </>
        ) : (
          <>
            {/* Gallery */}
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/70 text-xs">Gallery</span>
            </button>

            {/* Capture */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={camera.state !== 'active'}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
              aria-label="Capture photo"
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>

            {/* Switch Camera */}
            <button
              type="button"
              onClick={camera.toggleFacing}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <FlipHorizontal className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/70 text-xs">Flip</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
