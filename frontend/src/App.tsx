import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { ToastContainer } from './components/ui/Toast'
import { useToast } from './hooks/useToast'
import { HomePage } from './pages/HomePage'
import { ScanPage } from './pages/ScanPage'
import type { PredictionResponse, Crop } from './pages/ScanPage'
import { AssistantPage } from './pages/AssistantPage'
import type { ChatMessage } from './types'
import { HistoryPage } from './pages/HistoryPage'
import type { HistoryItem } from './pages/HistoryPage'
import { LibraryPage } from './pages/LibraryPage'
import { MyPlantsPage } from './pages/MyPlantsPage'
import { PlantDetailPage } from './pages/PlantDetailPage'
import { DiagnosisResultPage } from './pages/DiagnosisResultPage'
import { ProfilePage } from './pages/ProfilePage'
import { LoginPage } from './pages/LoginPage'
import { MOCK_PLANTS } from './data/mockData'
import type { Plant, LocationContextData } from './types'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'

const defaultAssistantMsg =
  'Hello! I am your AI Chat assistant, available 24/7. Upload a plant leaf photo or pick a crop sample to diagnose symptoms, assess weather risk, and get step-by-step treatment guidance.'

function AppContent() {
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()

  const [crops, setCrops] = useState<Crop[]>([
    { name: 'rice', label: 'Rice' },
    { name: 'wheat', label: 'Wheat' },
    { name: 'sugarcane', label: 'Sugarcane' },
    { name: 'cotton', label: 'Cotton' },
  ])
  const [selectedCrop, setSelectedCrop] = useState<string>('rice')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [locationData, setLocationData] = useState<LocationContextData | null>(null)
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [chat, setChat] = useState<ChatMessage[]>([{ role: 'assistant', text: defaultAssistantMsg }])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [plants] = useState<Plant[]>(MOCK_PLANTS)

  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [isPredicting, setIsPredicting] = useState<boolean>(false)
  const [isAsking, setIsAsking] = useState<boolean>(false)
  const [backendHealthy, setBackendHealthy] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void checkBackendHealth()
    void loadCrops()
    void fetchLocation()
  }, [])

  async function checkBackendHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/health`)
      setBackendHealthy(res.ok)
    } catch {
      setBackendHealthy(false)
    }
  }

  async function loadCrops() {
    try {
      const response = await fetch(`${API_BASE}/api/crops`)
      if (response.ok) {
        const data = (await response.json()) as { crops: Crop[] }
        if (data.crops && data.crops.length > 0) {
          setCrops(data.crops)
          setSelectedCrop(data.crops[0].name)
        }
      }
    } catch {
      // Fallback stays active
    }
  }

  function handleFileChange(file: File) {
    setSelectedFile(file)
    setPrediction(null)
    setError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // Create synthetic sample leaf image File for 1-click test presets
  function generateSampleLeafFile(sampleKey: string): File {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0f291e'
      ctx.fillRect(0, 0, 400, 400)
      ctx.beginPath()
      ctx.ellipse(200, 200, 140, 170, Math.PI / 6, 0, Math.PI * 2)
      ctx.fillStyle = '#1b4d36'
      ctx.fill()
      ctx.lineWidth = 4
      ctx.strokeStyle = '#2ecc71'
      ctx.stroke()

      if (sampleKey === 'rice_blast') {
        ctx.fillStyle = '#8b0000'
        ctx.beginPath()
        ctx.ellipse(180, 160, 25, 45, Math.PI / 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#d3d3d3'
        ctx.beginPath()
        ctx.ellipse(180, 160, 10, 20, Math.PI / 4, 0, Math.PI * 2)
        ctx.fill()
      } else if (sampleKey === 'wheat_yellow_rust') {
        ctx.fillStyle = '#f59e0b'
        for (let i = 0; i < 6; i++) ctx.fillRect(140 + i * 20, 100 + i * 30, 8, 40)
      } else if (sampleKey === 'sugarcane_red_rot') {
        ctx.fillStyle = '#a00000'
        ctx.fillRect(160, 80, 80, 240)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(180, 180, 40, 15)
      } else {
        ctx.fillStyle = '#4a2c11'
        ctx.fillRect(150, 150, 40, 40)
        ctx.fillRect(220, 210, 30, 30)
      }
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    const byteString = atob(dataUrl.split(',')[1])
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
    const blob = new Blob([ab], { type: mimeString })
    return new File([blob], `${sampleKey}.jpg`, { type: 'image/jpeg' })
  }

  function handleSelectSamplePreset(crop: string, sampleKey: string) {
    setSelectedCrop(crop)
    const file = generateSampleLeafFile(sampleKey)
    handleFileChange(file)
    navigate('/scan')
  }

  async function fetchLocation() {
    setIsLocating(true)
    setError(null)
    const fallback = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/location/fetch`)
        if (response.ok) {
          const data = await response.json()
          setLocationData(data as LocationContextData)
        }
      } catch {
        setLocationData({
          location: { city: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.03, longitude: 72.58 },
          weather: { temperature_c: 32.4, humidity_percent: 74, rainfall_mm: 8.5, wind_kmh: 14.2, condition: 'Partly Humid' },
          risk_level: 'Medium',
          risk_reason: 'Moderate humidity levels support steady spore survival.',
        })
      }
    }

    try {
      if (!navigator.geolocation) { await fallback(); return }
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      })
      const { latitude, longitude } = position.coords
      const res = await fetch(`${API_BASE}/api/location/fetch?latitude=${latitude}&longitude=${longitude}`)
      if (res.ok) {
        const data = await res.json()
        setLocationData(data as LocationContextData)
      } else {
        await fallback()
      }
    } catch {
      await fallback()
    } finally {
      setIsLocating(false)
    }
  }

  async function analyzePlant() {
    if (!selectedFile) {
      setError('Please select or upload a plant image first.')
      return
    }

    setIsPredicting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('crop', selectedCrop)

      if (locationData?.location?.latitude && locationData?.location?.longitude) {
        formData.append('latitude', String(locationData.location.latitude))
        formData.append('longitude', String(locationData.location.longitude))
      }

      const response = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error((data as { detail?: string }).detail ?? 'Prediction failed.')
      }

      const predData = data as PredictionResponse
      setPrediction(predData)

      setChat((prev) => [
        ...prev,
        { role: 'assistant', text: `Diagnosis Complete: ${predData.analysis_summary}` },
      ])

      const newHistoryItem: HistoryItem = {
        id: String(Date.now()),
        crop: predData.crop,
        predicted_class: predData.predicted_class,
        confidence_percent: predData.confidence_percent,
        health_score: predData.health_score,
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        image_url: predData.original_image || previewUrl || '',
      }
      setHistory((prev) => [newHistoryItem, ...prev])

      addToast('success', 'Analysis Complete', predData.predicted_class)
      navigate('/diagnosis')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Prediction request failed.'
      setError(msg)
      addToast('error', 'Analysis Failed', msg)
    } finally {
      setIsPredicting(false)
    }
  }

  async function askAssistant(question: string) {
    if (!question.trim()) return
    setIsAsking(true)
    setChat((prev) => [...prev, { role: 'user', text: question }])

    try {
      const res = await fetch(`${API_BASE}/api/assistant/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          crop: prediction?.crop ?? selectedCrop,
          predicted_class: prediction?.predicted_class,
          confidence: prediction?.confidence,
          weather: prediction?.weather_context?.weather ?? locationData?.weather,
          feature_importance: prediction?.weather_context?.feature_importance,
          // Send Grad-CAM image to Gemini for visual interpretation
          gradcam_image_b64: prediction?.highlighted_image,
          disease_info: prediction?.disease_info,
        }),
      })

      const data = await res.json() as {
        gemini_response?: import('./types').GeminiResponse
        follow_up_questions?: string[]
        detail?: string
      }

      if (!res.ok) {
        throw new Error(data.detail ?? 'Assistant unavailable.')
      }

      const geminiResponse = data.gemini_response

      if (geminiResponse) {
        // Structured Gemini response — store both plain-text summary and structured data
        setChat((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: geminiResponse.diagnosis_summary || 'Here is my analysis.',
            structured: geminiResponse,
          },
        ])
      } else {
        // Fallback plain-text
        const answer = (data as unknown as { answer?: string }).answer ?? 'I could not generate a response.'
        setChat((prev) => [...prev, { role: 'assistant', text: answer }])
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Assistant query failed.'
      setChat((prev) => [...prev, { role: 'assistant', text: `Sorry, ${msg}` }])
    } finally {
      setIsAsking(false)
    }
  }

  function handleResetScanner() {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPrediction(null)
    setError(null)
    navigate('/scan')
  }

  // LoginPage has its own full-screen layout — render outside AppLayout
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="*"
          element={
            <AppLayout
              locationData={locationData}
              isLocating={isLocating}
              onFetchLocation={fetchLocation}
              backendHealthy={backendHealthy}
            >
              <Routes>
                <Route path="/" element={<HomePage onSelectSamplePreset={handleSelectSamplePreset} />} />
                <Route
                  path="/scan"
                  element={
                    <ScanPage
                      crops={crops}
                      selectedCrop={selectedCrop}
                      setSelectedCrop={setSelectedCrop}
                      selectedFile={selectedFile}
                      previewUrl={previewUrl}
                      onFileChange={handleFileChange}
                      onSelectSamplePreset={handleSelectSamplePreset}
                      onAnalyzePlant={analyzePlant}
                      isPredicting={isPredicting}
                      prediction={prediction}
                      locationData={locationData}
                      onFetchLocation={fetchLocation}
                      isLocating={isLocating}
                      error={error}
                      onReset={handleResetScanner}
                    />
                  }
                />
                <Route
                  path="/diagnosis"
                  element={
                    prediction ? (
                      <DiagnosisResultPage
                        prediction={prediction}
                        locationData={locationData}
                        onReset={handleResetScanner}
                        onSaveToPlants={() => addToast('success', 'Plant saved!', 'Added to My Plants.')}
                      />
                    ) : (
                      <ScanPage
                        crops={crops}
                        selectedCrop={selectedCrop}
                        setSelectedCrop={setSelectedCrop}
                        selectedFile={selectedFile}
                        previewUrl={previewUrl}
                        onFileChange={handleFileChange}
                        onSelectSamplePreset={handleSelectSamplePreset}
                        onAnalyzePlant={analyzePlant}
                        isPredicting={isPredicting}
                        prediction={prediction}
                        locationData={locationData}
                        onFetchLocation={fetchLocation}
                        isLocating={isLocating}
                        error={error}
                        onReset={handleResetScanner}
                      />
                    )
                  }
                />
                <Route
                  path="/assistant"
                  element={
                    <AssistantPage
                      chat={chat}
                      onAskAssistant={askAssistant}
                      isAsking={isAsking}
                      latestPrediction={prediction}
                      locationData={locationData}
                    />
                  }
                />
                <Route
                  path="/history"
                  element={<HistoryPage history={history} onClearHistory={() => setHistory([])} />}
                />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/plants" element={<MyPlantsPage plants={plants} />} />
                <Route path="/plants/:id" element={<PlantDetailPage plants={plants} />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>

      {/* Global toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
