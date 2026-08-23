// useCamera.ts — Browser camera hook with permission handling
import { useState, useRef, useCallback } from 'react'

export type CameraState = 'idle' | 'requesting' | 'active' | 'captured' | 'denied' | 'unavailable'
export type FacingMode = 'environment' | 'user'

export function useCamera() {
  const [state, setState] = useState<CameraState>('idle')
  const [facingMode, setFacingMode] = useState<FacingMode>('environment')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [capturedFile, setCapturedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async (mode: FacingMode = facingMode) => {
    setState('requesting')
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unavailable')
      setError('Camera is not supported on this device or browser.')
      return
    }

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setState('active')
    } catch (err) {
      const e = err as DOMException
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setState('denied')
        setError('Camera access was denied. Please allow camera access in your browser settings.')
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setState('unavailable')
        setError('No camera found on this device.')
      } else {
        setState('unavailable')
        setError('Could not start camera: ' + e.message)
      }
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setState('idle')
  }, [])

  const capturePhoto = useCallback((): File | null => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

    // Convert to File
    const byteString = atob(dataUrl.split(',')[1])
    const mimeString = 'image/jpeg'
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
    const blob = new Blob([ab], { type: mimeString })
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: mimeString })

    setCapturedImage(dataUrl)
    setCapturedFile(file)
    setState('captured')

    stopCamera()
    return file
  }, [stopCamera])

  const retake = useCallback(() => {
    setCapturedImage(null)
    setCapturedFile(null)
    setError(null)
    startCamera(facingMode)
  }, [facingMode, startCamera])

  const toggleFacing = useCallback(() => {
    const newMode: FacingMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(newMode)
    if (state === 'active') startCamera(newMode)
  }, [facingMode, state, startCamera])

  const reset = useCallback(() => {
    stopCamera()
    setCapturedImage(null)
    setCapturedFile(null)
    setError(null)
    setState('idle')
  }, [stopCamera])

  return {
    state,
    facingMode,
    capturedImage,
    capturedFile,
    error,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    retake,
    toggleFacing,
    reset,
  }
}
