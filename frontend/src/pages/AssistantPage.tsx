// AssistantPage.tsx — Gemini-powered XAI Agricultural Assistant
import { useState, useRef, useEffect } from 'react'
import {
  Bot, Send, Loader2, Leaf, Thermometer, Droplets, Wind,
  CloudRain, MapPin, Sparkles, ShieldAlert, FlaskConical,
  BarChart3, CheckCircle2, AlertTriangle, Info, ChevronRight,
} from 'lucide-react'
import type { ChatMessage, GeminiResponse, PredictionResponse, LocationContextData } from '../types'

// ── Suggested prompts ────────────────────────────────────────────────────────

function getContextPrompts(disease?: string, crop?: string): string[] {
  if (disease && crop) {
    return [
      `What should I do about ${disease}?`,
      `Why was ${disease} detected in my ${crop}?`,
      `What environmental factors contributed to this detection?`,
      `How can I prevent ${disease} from spreading?`,
      `What symptoms should I monitor over the next few days?`,
    ]
  }
  return [
    'How do I treat Rice Blast organically?',
    'What causes Yellow Rust in Wheat?',
    'How does high humidity affect plant disease?',
    'What are early signs of Bacterial Leaf Blight?',
    'How can I improve my crop disease prevention?',
  ]
}

// ── Structured Gemini Response Card ─────────────────────────────────────────

function StructuredResponseCard({ data }: { data: GeminiResponse }) {
  const [showPrevention, setShowPrevention] = useState(false)

  return (
    <div className="space-y-3 text-sm">
      {/* Diagnosis Summary */}
      {data.diagnosis_summary && (
        <div className="p-3 rounded-xl bg-[#F0FBF5] border border-[#B9E8D1]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-[#0B8F68] shrink-0" />
            <span className="text-[11px] font-700 text-[#0B8F68] uppercase tracking-wider">Diagnosis Summary</span>
          </div>
          <p className="text-[12px] text-[#10231D] leading-relaxed">{data.diagnosis_summary}</p>
        </div>
      )}

      {/* Why Detected */}
      {data.why_detected?.length > 0 && (
        <div className="p-3 rounded-xl bg-[#F5F8F5] border border-[#D4E8DC]">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#6366f1] shrink-0" />
            <span className="text-[11px] font-700 text-[#4f46e5] uppercase tracking-wider">Why Detected (XAI)</span>
          </div>
          <ul className="space-y-1.5">
            {data.why_detected.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-[#6366f1] mt-0.5 shrink-0" />
                <span className="text-[12px] text-[#10231D] leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Environmental Factors */}
      {data.environmental_factors?.length > 0 && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] font-700 text-blue-700 uppercase tracking-wider">Environmental Factors</span>
          </div>
          <div className="space-y-2">
            {data.environmental_factors.map((ef, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-600 text-[#10231D]">{ef.factor}</span>
                  <span className="text-[11px] font-700 text-blue-700">{ef.importance_pct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-blue-100 overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                    style={{ width: `${Math.min(ef.importance_pct, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#4A5E52] leading-relaxed">{ef.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {data.recommended_actions?.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px] font-700 text-amber-700 uppercase tracking-wider">Recommended Actions</span>
          </div>
          <ol className="space-y-1.5">
            {data.recommended_actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 text-[9px] font-700 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[12px] text-[#10231D] leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Prevention (collapsible) */}
      {data.prevention?.length > 0 && (
        <div className="p-3 rounded-xl bg-[#F5F8F5] border border-[#D4E8DC]">
          <button
            type="button"
            onClick={() => setShowPrevention(!showPrevention)}
            className="flex items-center gap-1.5 w-full text-left"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#0B8F68] shrink-0" />
            <span className="text-[11px] font-700 text-[#0B8F68] uppercase tracking-wider flex-1">Prevention</span>
            <ChevronRight className={`w-3.5 h-3.5 text-[#64736C] transition-transform ${showPrevention ? 'rotate-90' : ''}`} />
          </button>
          {showPrevention && (
            <ul className="mt-2 space-y-1.5">
              {data.prevention.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0B8F68] mt-1.5 shrink-0" />
                  <span className="text-[12px] text-[#10231D] leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Disclaimer */}
      {data.disclaimer && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-relaxed">{data.disclaimer}</p>
        </div>
      )}
    </div>
  )
}

// ── Left panel: Diagnosis Snapshot ──────────────────────────────────────────

function DiagnosisSnapshot({
  prediction,
  locationData,
}: {
  prediction: PredictionResponse | null
  locationData: LocationContextData | null
}) {
  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#F0FBF5] border border-[#D4E8DC] flex items-center justify-center mb-4">
          <Leaf className="w-8 h-8 text-[#B9E8D1]" />
        </div>
        <p className="text-sm font-600 text-[#10231D] mb-1">No diagnosis yet</p>
        <p className="text-xs text-[#64736C] leading-relaxed">
          Scan a plant leaf first. The AI assistant will receive the full diagnosis context automatically.
        </p>
      </div>
    )
  }

  const fi = prediction.weather_context?.feature_importance ?? {}
  const fiEntries = Object.entries(fi).sort(([, a], [, b]) => b - a)
  const weather = prediction.weather_context?.weather ?? locationData?.weather
  const location = prediction.weather_context?.location ?? locationData?.location
  const isHealthy = prediction.predicted_class.toLowerCase().includes('healthy')
  const severityColor = isHealthy ? '#0B8F68'
    : prediction.disease_info.severity.toLowerCase() === 'high' ? '#EA580C'
    : prediction.disease_info.severity.toLowerCase() === 'very high' ? '#DC2626'
    : '#D97706'

  return (
    <div className="space-y-3">
      {/* Image + Disease badge */}
      <div className="relative rounded-xl overflow-hidden bg-[#06251C]">
        {prediction.original_image ? (
          <img
            src={prediction.original_image}
            alt="Scanned leaf"
            className="w-full h-40 object-contain"
          />
        ) : (
          <div className="h-40 flex items-center justify-center">
            <Leaf className="w-10 h-10 text-[#DDF7EA]/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <span
            className="text-[10px] font-700 px-2 py-0.5 rounded-full"
            style={{ background: severityColor + '22', color: severityColor, border: `1px solid ${severityColor}40` }}
          >
            {prediction.disease_info.severity} severity
          </span>
        </div>
      </div>

      {/* Prediction details */}
      <div className="p-3 rounded-xl bg-[#F5FBF7] border border-[#D4E8DC] space-y-2">
        <div>
          <p className="text-[9px] font-700 text-[#64736C] uppercase tracking-wider">Detected Condition</p>
          <p className="text-sm font-700 text-[#10231D] leading-tight mt-0.5">
            {prediction.predicted_class.replace(/_/g, ' ')}
          </p>
          <p className="text-[11px] text-[#64736C] capitalize">Crop: {prediction.crop}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-[#64736C]">AI Confidence</span>
              <span className="text-[11px] font-700 text-[#10231D]">{prediction.confidence_percent.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#EDF7F2] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${prediction.confidence_percent}%`, background: severityColor }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[#64736C]">Health</p>
            <p className="text-sm font-700" style={{ color: severityColor }}>{prediction.health_score}</p>
          </div>
        </div>
      </div>

      {/* Weather conditions */}
      {weather && (
        <div className="p-3 rounded-xl bg-[#F5FBF7] border border-[#D4E8DC]">
          <div className="flex items-center gap-1.5 mb-2">
            <CloudRain className="w-3.5 h-3.5 text-[#0B8F68]" />
            <p className="text-[10px] font-700 text-[#64736C] uppercase tracking-wider">Environment</p>
          </div>
          {location && (
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3 text-[#64736C]" />
              <span className="text-[11px] text-[#64736C]">
                {location.city}{location.state ? `, ${location.state}` : ''}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-[#10231D]">
              <Thermometer className="w-3 h-3 text-orange-500 shrink-0" />
              {weather.temperature_c}°C
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#10231D]">
              <Droplets className="w-3 h-3 text-blue-500 shrink-0" />
              {weather.humidity_percent}% RH
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#10231D]">
              <CloudRain className="w-3 h-3 text-blue-400 shrink-0" />
              {weather.rainfall_mm} mm
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#10231D]">
              <Wind className="w-3 h-3 text-[#64736C] shrink-0" />
              {weather.wind_kmh} km/h
            </div>
          </div>
        </div>
      )}

      {/* XAI Feature Importance */}
      {fiEntries.length > 0 && (
        <div className="p-3 rounded-xl bg-[#F5FBF7] border border-[#D4E8DC]">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#0B8F68]" />
            <p className="text-[10px] font-700 text-[#64736C] uppercase tracking-wider">XAI Environmental Factors</p>
          </div>
          <div className="space-y-2">
            {fiEntries.map(([factor, val]) => (
              <div key={factor}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-600 text-[#10231D]">{factor}</span>
                  <span className="text-[11px] font-700 text-[#0B8F68]">{val.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#EDF7F2] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0B8F68] transition-all duration-700"
                    style={{ width: `${Math.min(val, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-[#94A09B] mt-2 leading-relaxed">
            SHAP-based weights showing which environmental features contributed most to disease risk.
          </p>
        </div>
      )}

      {/* Grad-CAM thumbnail */}
      {prediction.highlighted_image && (
        <div className="p-2 rounded-xl bg-[#06251C] border border-[#0B8F68]/30">
          <p className="text-[9px] font-700 text-[#B9E8D1] uppercase tracking-wider mb-1.5 px-1">Grad-CAM Heatmap</p>
          <img
            src={prediction.highlighted_image}
            alt="Grad-CAM visual attention heatmap"
            className="w-full rounded-lg object-contain max-h-28"
          />
          <p className="text-[9px] text-[#64736C] mt-1.5 px-1 leading-relaxed">
            Regions where the AI model focused during prediction. Sent to Gemini for visual interpretation.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Main AssistantPage ───────────────────────────────────────────────────────

interface AssistantPageProps {
  chat: ChatMessage[]
  onAskAssistant: (question: string) => Promise<void>
  isAsking: boolean
  latestPrediction: PredictionResponse | null
  locationData?: LocationContextData | null
}

export function AssistantPage({
  chat,
  onAskAssistant,
  isAsking,
  latestPrediction,
  locationData,
}: AssistantPageProps) {
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  const disease = latestPrediction?.predicted_class?.replace(/_/g, ' ')
  const crop = latestPrediction?.crop
  const prompts = getContextPrompts(disease, crop)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, isAsking])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isAsking) return
    const text = input.trim()
    setInput('')
    await onAskAssistant(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#159A70] flex items-center justify-center shrink-0 shadow-sm">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[#17211D]">AI Chat</h1>
          <p className="text-xs text-[#66736C] mt-0.5">
            Powered by Gemini · Interprets disease predictions, Grad-CAM visual evidence, and environmental XAI outputs
          </p>
        </div>
      </div>

      {/* Architecture explanation banner */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F0FAF4] border border-[#D4EAD9]">
        <Info className="w-4 h-4 text-[#159A70] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#4A5E52] leading-relaxed">
          <strong>Your CNN model diagnoses. Gemini explains.</strong> The assistant receives the full structured context —
          disease prediction, Grad-CAM heatmap, SHAP environmental weights, and live weather — to generate farmer-friendly guidance.
          It does not re-diagnose.
        </p>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── LEFT: Diagnosis Snapshot Panel ── */}
        <div className="lg:col-span-4 rounded-2xl border border-[#E0EBE4] bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E0EBE4] bg-[#F7F8F3]">
            <Leaf className="w-4 h-4 text-[#159A70]" />
            <p className="text-sm font-semibold text-[#17211D]">Diagnosis Snapshot</p>
            {latestPrediction && (
              <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#DDF3E8] text-[#159A70]">
                Active
              </span>
            )}
          </div>
          <div className="p-3 overflow-y-auto" style={{ maxHeight: 600 }}>
            <DiagnosisSnapshot prediction={latestPrediction} locationData={locationData ?? null} />
          </div>
        </div>

        {/* ── RIGHT: Chat Panel ── */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-[#E0EBE4] bg-white overflow-hidden shadow-sm"
          style={{ minHeight: 560 }}>

          {/* Context banner */}
          {latestPrediction && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F0FAF4] border-b border-[#E0EBE4]">
              <div className="w-2 h-2 rounded-full bg-[#159A70] animate-pulse-dot" />
              <span className="text-xs text-[#0B6344] font-medium">
                Context active: <strong>{latestPrediction.crop} — {disease}</strong> ({latestPrediction.confidence_percent.toFixed(1)}% confidence)
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {chat.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F0FAF4] border border-[#D4EAD9] flex items-center justify-center mb-3">
                  <Bot className="w-7 h-7 text-[#159A70]" />
                </div>
                <p className="text-sm font-semibold text-[#17211D] mb-1">Ask the AI Chat</p>
                <p className="text-xs text-[#66736C]">
                  {latestPrediction
                    ? 'Start with a suggested question below, or type your own.'
                    : 'Scan a plant first for context-aware responses.'}
                </p>
              </div>
            )}

            {chat.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'assistant'
                    ? 'bg-[#159A70] text-white'
                    : 'bg-[#DDF3E8] text-[#159A70]'
                }`}>
                  {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-[#159A70] text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-sm'
                    : 'flex-1'
                }`}>
                  {msg.role === 'user' ? (
                    msg.text
                  ) : msg.structured ? (
                    // Structured Gemini response — render as cards
                    <div className="rounded-2xl rounded-tl-none border border-[#E0EBE4] bg-[#F7F8F3] p-3">
                      <StructuredResponseCard data={msg.structured} />
                    </div>
                  ) : (
                    // Plain text fallback
                    <div className="bg-[#F7F8F3] border border-[#E0EBE4] px-4 py-3 rounded-2xl rounded-tl-none text-sm text-[#17211D] leading-relaxed">
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isAsking && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#159A70] flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#F7F8F3] border border-[#E0EBE4] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  {[0, 1, 2].map(j => (
                    <div
                      key={j}
                      className="w-2 h-2 rounded-full bg-[#BDD8C7]"
                      style={{ animation: `bounce-dot 1.2s ease-in-out ${j * 0.2}s infinite` }}
                    />
                  ))}
                  <span className="text-xs text-[#66736C] ml-1">Analysing…</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested prompts */}
          {chat.filter(m => m.role === 'user').length === 0 && !isAsking && (
            <div className="px-4 pb-3 border-t border-[#EEF4EE] pt-3">
              <p className="text-[10px] font-semibold text-[#66736C] uppercase tracking-wider mb-2">
                {latestPrediction ? 'Suggested questions:' : 'Try asking:'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {prompts.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void onAskAssistant(prompt)}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-[#F7F8F3] border border-[#E0EBE4] text-[#17211D] font-medium hover:bg-[#DDF3E8] hover:border-[#B0D8C4] hover:text-[#0B6344] transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="px-4 py-3 border-t border-[#E0EBE4] flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                latestPrediction
                  ? `Ask about ${disease}…`
                  : 'Ask about plant diseases, treatments, or prevention…'
              }
              rows={1}
              aria-label="Ask the AI Chat assistant"
              className="flex-1 resize-none rounded-xl border border-[#E0EBE4] bg-[#F7F8F3] px-4 py-2.5 text-sm text-[#17211D] placeholder-[#96A39D] focus:outline-none focus:border-[#159A70] focus:shadow-[0_0_0_3px_rgba(21,154,112,0.08)] transition-all max-h-32 min-h-[44px]"
            />
            <button
              type="button"
              onClick={e => void handleSubmit(e)}
              disabled={!input.trim() || isAsking}
              aria-label="Send message"
              className="w-10 h-10 rounded-xl bg-[#159A70] text-white flex items-center justify-center hover:bg-[#128A63] disabled:opacity-40 transition-colors shrink-0 shadow-sm"
            >
              {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
