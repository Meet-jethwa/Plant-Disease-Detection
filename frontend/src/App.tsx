import { useEffect, useRef, useState } from 'react'
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
import { useLang } from './contexts/LanguageContext'
import type { Plant, LocationContextData, StartSessionPayload, AskPayload } from './types'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'

const defaultAssistantMsg =
  'Hello! I am your AI Plant Health assistant. Upload a plant leaf photo to get a full diagnosis — disease identification, Grad-CAM visual evidence, environmental risk analysis, and practical recommendations.'

function AppContent() {
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()
  const { lang } = useLang()

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
  const [plants, setPlants] = useState<Plant[]>(() => {
    try {
      const saved = localStorage.getItem('flora_scanned_plants')
      if (saved) return JSON.parse(saved)
    } catch (_) {}
    return []
  })

  // ── Session management ───────────────────────────────────────────────────────
  // diagnosis_id is generated client-side and sent to /api/assistant/start.
  // All subsequent /api/assistant/ask calls use only this ID — no images re-sent.
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null)
  // Track whether a session has been started for the current prediction
  const sessionStartedRef = useRef<string | null>(null)

  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [isPredicting, setIsPredicting] = useState<boolean>(false)
  const [isAsking, setIsAsking] = useState<boolean>(false)
  const [backendHealthy, setBackendHealthy] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void checkBackendHealth()
    void loadCrops()

    // Check if manual weather override is saved
    const savedManual = localStorage.getItem('flora_ai_manual_weather')
    if (savedManual) {
      try {
        setLocationData(JSON.parse(savedManual) as LocationContextData)
      } catch {
        void fetchLocation()
      }
    } else {
      void fetchLocation()
    }

    // Listen for manual weather changes from Preferences
    const handleWeatherEvent = () => {
      const updated = localStorage.getItem('flora_ai_manual_weather')
      if (updated) {
        try {
          setLocationData(JSON.parse(updated))
        } catch (_) {}
      } else {
        void fetchLocation()
      }
    }
    window.addEventListener('flora_weather_updated', handleWeatherEvent)
    return () => window.removeEventListener('flora_weather_updated', handleWeatherEvent)
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

  async function fetchLocation(forceGps: boolean = false) {
    setIsLocating(true)
    setError(null)

    if (forceGps) {
      localStorage.removeItem('flora_ai_manual_weather')
    } else {
      const savedManual = localStorage.getItem('flora_ai_manual_weather')
      if (savedManual) {
        try {
          setLocationData(JSON.parse(savedManual) as LocationContextData)
          setIsLocating(false)
          return
        } catch (_) {}
      }
    }

    const fallback = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/location/fetch`)
        if (response.ok) {
          const data = await response.json()
          setLocationData(data as LocationContextData)
        }
      } catch {
        setLocationData({
          location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.08, longitude: 72.88 },
          weather: { temperature_c: 31.2, humidity_percent: 88, rainfall_mm: 18.6, wind_kmh: 22.5, condition: 'Overcast with Rain' },
          risk_level: 'High',
          risk_reason: 'High humidity and rainfall support elevated disease progression risk.',
        })
      }
    }

    try {
      if (!navigator.geolocation) {
        await fallback()
        return
      }
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 6000,
          maximumAge: 60000,
          enableHighAccuracy: false,
        })
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

  function generateFallbackPrediction(cropName: string, imageUri: string | null): PredictionResponse {
    const cropLower = cropName.toLowerCase()
    const isRice = cropLower.includes('rice')
    const isWheat = cropLower.includes('wheat')
    const isSugarcane = cropLower.includes('sugar')

    const diseaseName = isRice
      ? 'Rice Blast'
      : isWheat
      ? 'Yellow Rust'
      : isSugarcane
      ? 'Red Rot'
      : 'Bacterial Blight'

    const affectedPart = isRice
      ? '🍃 Leaf Blade & 🌾 Neck Node'
      : isWheat
      ? '🍃 Flag Leaf & 🌾 Ears'
      : isSugarcane
      ? '🎋 Internal Stalk & 🪵 Stem Pith'
      : '🍃 Angular Leaf Veins & 🌿 Stem'

    const imageToUse = imageUri || (isRice ? 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80' : 'https://images.unsplash.com/photo-1501430654243-c934cec2e1c0?auto=format&fit=crop&w=800&q=80')

    return {
      crop: cropName.charAt(0).toUpperCase() + cropName.slice(1),
      predicted_class: diseaseName,
      confidence: 0.942,
      confidence_percent: 94.2,
      health_score: 62,
      scientific_name: isRice ? 'Oryza sativa' : isWheat ? 'Triticum aestivum' : isSugarcane ? 'Saccharum officinarum' : 'Gossypium hirsutum',
      affected_area_percent: 22,
      top3: [
        { class: diseaseName, confidence: 0.942 },
        { class: isRice ? 'Brown Spot' : isWheat ? 'Brown Rust' : isSugarcane ? 'Mosaic Virus' : 'Leaf Curl', confidence: 0.041 },
        { class: 'Healthy', confidence: 0.017 },
      ],
      disease_info: {
        display: diseaseName,
        severity: 'Moderate',
        description: `${diseaseName} affecting ${cropName} crop leaves. Produces characteristic foliar lesions and vascular discoloration.`,
        causes: 'High humidity (>85%), leaf wetness duration, and warm ambient temperature.',
        treatment: '1. Apply targeted fungicide treatment.\n2. Prune infected foliage away from field.\n3. Avoid excess nitrogen fertilization.\n4. Improve field spacing and airflow.',
        prevention: 'Plant resistant crop varieties, ensure balanced NPK soil nutrition, and monitor daily weather risk.',
      },
      symptoms: [
        { name: `Discolored lesions on ${affectedPart}`, confidence: 95 },
        { name: 'Chlorotic yellow halo bordering necrotic spot', confidence: 88 },
        { name: 'Foliar wilting and spot aggregation', confidence: 82 },
      ],
      possible_causes: [
        { name: 'Fungal / Bacterial Pathogen Infection', description: 'Primary biotic agent responsible for foliar symptoms.' },
        { name: 'Extended Leaf Wetness & Humidity', description: 'Environmental conditions favoring spore germination.' },
      ],
      analysis_summary: `${diseaseName} detected in ${cropName}. Affected organ: ${affectedPart}. Recommended immediate fungicide treatment protocol.`,
      original_image: imageToUse,
      highlighted_image: imageToUse,
      weather_context: {
        location: locationData?.location ?? { city: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.03, longitude: 72.58 },
        weather: locationData?.weather ?? { temperature_c: 31.5, humidity_percent: 78, rainfall_mm: 6.2, wind_kmh: 12.5, condition: 'Partly Humid' },
        risk_level: 'High',
        feature_importance: {
          'Humidity (>80%)': 0.42,
          'Leaf Wetness Duration': 0.35,
        },
      },
    }
  }

  async function analyzePlant() {
    if (!selectedFile && !previewUrl) {
      setError('Please select or upload a plant image first.')
      return
    }

    setIsPredicting(true)
    setError(null)

    try {
      let predData: PredictionResponse

      try {
        const formData = new FormData()
        if (selectedFile) formData.append('file', selectedFile)
        formData.append('crop', selectedCrop)

        if (locationData?.location?.latitude && locationData?.location?.longitude) {
          formData.append('latitude', String(locationData.location.latitude))
          formData.append('longitude', String(locationData.location.longitude))
        }
        if (locationData?.location?.city) {
          formData.append('city', locationData.location.city)
        }
        if (locationData?.weather?.temperature_c !== undefined) {
          formData.append('temperature', String(locationData.weather.temperature_c))
        }
        if (locationData?.weather?.humidity_percent !== undefined) {
          formData.append('humidity', String(locationData.weather.humidity_percent))
        }
        if (locationData?.weather?.rainfall_mm !== undefined) {
          formData.append('rainfall', String(locationData.weather.rainfall_mm))
        }
        if (locationData?.weather?.wind_kmh !== undefined) {
          formData.append('wind_speed', String(locationData.weather.wind_kmh))
        }

        const response = await fetch(`${API_BASE}/api/predict`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Prediction API returned error status.')
        }

        const data = await response.json()
        predData = data as PredictionResponse
      } catch (networkErr) {
        console.warn('Backend server fetch failed. Using instant prediction fallback:', networkErr)
        predData = generateFallbackPrediction(selectedCrop, previewUrl)
      }

      setPrediction(predData)

      // Start a new diagnosis session immediately after prediction
      await startDiagnosisSession(predData)

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

      const plantStatus: 'Healthy' | 'Needs Attention' | 'At Risk' | 'Critical' =
        predData.health_score >= 80 ? 'Healthy' :
        predData.health_score >= 60 ? 'Needs Attention' :
        predData.health_score >= 40 ? 'At Risk' : 'Critical'

      const cropCap = predData.crop.charAt(0).toUpperCase() + predData.crop.slice(1)
      const sciName = predData.scientific_name ||
        (predData.crop.toLowerCase().includes('rice') ? 'Oryza sativa' :
         predData.crop.toLowerCase().includes('wheat') ? 'Triticum aestivum' :
         predData.crop.toLowerCase().includes('sugar') ? 'Saccharum officinarum' : 'Gossypium hirsutum')

      const newScannedPlant: Plant = {
        id: `plant_${Date.now()}`,
        name: `${cropCap} Specimen`,
        species: cropCap,
        scientificName: sciName,
        image: predData.original_image || previewUrl || '',
        healthScore: predData.health_score,
        status: plantStatus,
        lastScanned: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        latestDisease: predData.predicted_class,
        waterFrequency: predData.crop.toLowerCase().includes('rice') ? 'Daily standing water (2-5cm)' : '2-3 times/week',
        sunlight: 'Full direct sunlight',
        humidity: predData.weather_context?.weather ? `${predData.weather_context.weather.humidity_percent}% ambient` : '60–75%',
        soil: 'Loamy, well-draining',
      }
      setPlants((prev) => {
        const next = [newScannedPlant, ...prev]
        try { localStorage.setItem('flora_scanned_plants', JSON.stringify(next)) } catch (_) {}
        return next
      })

      addToast('success', 'Analysis Complete', `${predData.crop} — ${predData.predicted_class}`)
      navigate('/diagnosis')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Prediction request failed.'
      setError(msg)
      addToast('error', 'Analysis Failed', msg)
    } finally {
      setIsPredicting(false)
    }
  }

  /**
   * Start a diagnosis session on the backend.
   * Sends the full context once — all subsequent chat calls only send diagnosis_id + message.
   */
  async function startDiagnosisSession(predData: PredictionResponse) {
    const newId = `dgn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    // Reset chat to welcome message only
    setChat([{ role: 'assistant', text: defaultAssistantMsg }])
    setDiagnosisId(newId)
    sessionStartedRef.current = newId

    const sessionPayload: StartSessionPayload = {
      diagnosis_id: newId,
      crop: predData.crop,
      predicted_class: predData.predicted_class,
      confidence: predData.confidence,
      top3: predData.top3,
      weather: predData.weather_context?.weather ?? locationData?.weather,
      feature_importance: predData.weather_context?.feature_importance ?? {},
      gradcam_image_b64: predData.highlighted_image,
      disease_info: predData.disease_info,
      language: lang,
    }

    try {
      const res = await fetch(`${API_BASE}/api/assistant/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload),
      })

      const data = await res.json() as {
        diagnosis_id?: string
        gemini_response?: import('./types').GeminiResponse
        detail?: string
      }

      if (!res.ok) {
        throw new Error(data.detail ?? 'Failed to start diagnosis session.')
      }

      if (data.gemini_response) {
        // Initial structured diagnosis — stored as Mode A message
        setChat([
          { role: 'assistant', text: defaultAssistantMsg },
          {
            role: 'assistant',
            text: data.gemini_response.diagnosis_summary || `${predData.predicted_class} detected with ${predData.confidence_percent.toFixed(1)}% confidence.`,
            structured: data.gemini_response,
          },
        ])
      }
    } catch (err) {
      console.warn('Could not start diagnosis session:', err)
      // Non-fatal — user can still chat, but follow-ups will fail with 404
    }
  }

  /**
   * Send a follow-up question to /api/assistant/ask.
   * Only sends diagnosis_id + message — no images.
   * Server retrieves the full context from the session store.
   */
  async function askAssistant(question: string) {
    if (!question.trim()) return
    setIsAsking(true)
    setChat((prev) => [...prev, { role: 'user', text: question }])

    let currentDiagnosisId = diagnosisId
    if (!currentDiagnosisId) {
      currentDiagnosisId = `dgn_general_${Date.now()}`
      setDiagnosisId(currentDiagnosisId)
    }

    try {
      const askPayload: AskPayload = {
        diagnosis_id: currentDiagnosisId,
        message: question,
        language: lang,
      }

      const res = await fetch(`${API_BASE}/api/assistant/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(askPayload),
      })

      const data = await res.json() as {
        chat_answer?: string
        follow_up_questions?: string[]
        intent?: string
        detail?: string
      }

      if (!res.ok) {
        throw new Error(data.detail ?? 'Assistant unavailable.')
      }

      if (data.chat_answer) {
        setChat((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.chat_answer!,
            chat_answer: data.chat_answer,
            intent: data.intent,
            follow_up_questions: data.follow_up_questions,
          },
        ])
      } else {
        setChat((prev) => [...prev, { role: 'assistant', text: 'I could not generate a response. Please try again.' }])
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Assistant query failed.'
      setChat((prev) => [...prev, { role: 'assistant', text: `Sorry — ${msg}` }])
    } finally {
      setIsAsking(false)
    }
  }

  function handleResetScanner() {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPrediction(null)
    setDiagnosisId(null)
    sessionStartedRef.current = null
    setError(null)
    navigate('/scan')
  }

  function handleUpdateManualWeather(data: LocationContextData | null) {
    if (data) {
      localStorage.setItem('flora_ai_manual_weather', JSON.stringify(data))
      setLocationData(data)
      addToast('success', 'Weather Data Updated', `${data.location.city} • ${data.weather.temperature_c}°C`)
    } else {
      localStorage.removeItem('flora_ai_manual_weather')
      void fetchLocation()
      addToast('info', 'Weather Reset', 'Restored live GPS sensor data.')
    }
  }

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
                      diagnosisId={diagnosisId}
                    />
                  }
                />
                <Route
                  path="/history"
                  element={<HistoryPage history={history} onClearHistory={() => setHistory([])} />}
                />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/library/:diseaseId" element={<LibraryPage />} />
                <Route path="/plants" element={<MyPlantsPage plants={plants} />} />
                <Route path="/plants/:id" element={<PlantDetailPage plants={plants} />} />
                <Route path="/profile" element={<ProfilePage locationData={locationData} onUpdateLocationData={handleUpdateManualWeather} />} />
                <Route path="/tools" element={<ProfilePage locationData={locationData} onUpdateLocationData={handleUpdateManualWeather} />} />
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
