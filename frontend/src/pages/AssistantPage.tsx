// AssistantPage.tsx — Diagnosis Dashboard + Conversational Chat
import { useState, useRef, useEffect } from 'react'
import {
  Bot, Send, Loader2, Leaf, Thermometer, Droplets, Wind,
  CloudRain, MapPin, Sparkles, ShieldAlert,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronRight, Eye,
  Volume2, Square, BarChart3,
  Microscope, Activity,
} from 'lucide-react'
import type { ChatMessage, GeminiResponse, PredictionResponse, LocationContextData } from '../types'
import { useLang } from '../contexts/LanguageContext'
import { LANGUAGE_META } from '../i18n/translations'

// ── Markdown-lite renderer ────────────────────────────────────────────────────
// Converts **bold**, numbered lists, and bullet points into React elements.

function renderMarkdown(text: string): React.ReactNode[] {
  const paragraphs = text.split(/\n\n+/)
  return paragraphs.map((para, pi) => {
    const lines = para.split('\n')

    // Numbered list block
    if (lines.every(l => /^\d+\./.test(l.trim()) || l.trim() === '')) {
      return (
        <ol key={pi} className="space-y-2 my-2 pl-1">
          {lines.filter(l => l.trim()).map((line, li) => (
            <li key={li} className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-[#E6F7EF] text-[#0B8F68] text-[10px] font-700 flex items-center justify-center shrink-0 mt-0.5">
                {li + 1}
              </span>
              <span className="text-sm text-[#17211D] leading-relaxed flex-1">
                {renderInline(line.replace(/^\d+\.\s*/, ''))}
              </span>
            </li>
          ))}
        </ol>
      )
    }

    // Bullet list block
    if (lines.every(l => /^[-*]/.test(l.trim()) || l.trim() === '')) {
      return (
        <ul key={pi} className="space-y-1.5 my-2 pl-1">
          {lines.filter(l => l.trim()).map((line, li) => (
            <li key={li} className="flex gap-2 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0B8F68] mt-2 shrink-0" />
              <span className="text-sm text-[#17211D] leading-relaxed flex-1">
                {renderInline(line.replace(/^[-*]\s*/, ''))}
              </span>
            </li>
          ))}
        </ul>
      )
    }

    // Plain paragraph
    return (
      <p key={pi} className="text-sm text-[#17211D] leading-relaxed mb-1">
        {renderInline(para)}
      </p>
    )
  })
}

function renderInline(text: string): React.ReactNode[] {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-700 text-[#10231D]">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

// ── Intent-based quick chip sets ──────────────────────────────────────────────

function getQuickChips(intent?: string, disease?: string): Array<{ label: string; question: string }> {
  if (intent === 'treatment') return [
    { label: '📅 Monitor schedule', question: 'How often should I monitor the crop after treatment?' },
    { label: '🛡 Prevention', question: 'How do I prevent this disease from spreading?' },
    { label: '❓ No treatment?', question: 'What happens if I don\'t treat it?' },
  ]
  if (intent === 'gradcam') return [
    { label: '🔬 Disease confirmation?', question: 'Does the Grad-CAM confirm the exact disease location?' },
    { label: '🗣 Simpler explanation', question: 'Can you explain this more simply?' },
    { label: '🔴 Why those areas?', question: 'Why are only some areas highlighted in the heatmap?' },
  ]
  if (intent === 'shap' || intent === 'environment') return [
    { label: '💧 Reduce humidity', question: 'How can I reduce the humidity risk for my crop?' },
    { label: '🌧 Rainfall impact', question: 'How does rainfall affect this disease?' },
    { label: '📆 When to recheck', question: 'When should I check the environmental conditions again?' },
  ]
  if (intent === 'prevention') return [
    { label: '🌱 Resistant varieties', question: 'What are the best resistant varieties for this crop?' },
    { label: '💧 Drainage', question: 'How do I improve field drainage to prevent disease?' },
    { label: '⏰ Preventive timing', question: 'When should I start preventive treatment?' },
  ]
  if (intent === 'why_detected') return [
    { label: '💊 What to do?', question: 'What should I do now about this diagnosis?' },
    { label: '🔥 Model reliability', question: 'How reliable is the AI model for this prediction?' },
    { label: '🔥 Grad-CAM', question: 'Can you explain the Grad-CAM heatmap?' },
  ]
  // Default (initial, general, severity, symptoms)
  return [
    { label: '💊 Treatment', question: `What should I do about ${disease || 'this disease'} now?` },
    { label: '🔍 Why detected?', question: 'Why did the model detect this disease?' },
    { label: '🔥 Grad-CAM', question: 'Can you explain the Grad-CAM heatmap?' },
    { label: '🌦 Weather risk', question: 'Is the weather increasing the risk of this disease?' },
  ]
}

// ── DiagnosisDashboard — Initial Mode A result ────────────────────────────────

function DiagnosisDashboard({
  data,
  prediction,
  onAsk,
}: {
  data: GeminiResponse
  prediction: PredictionResponse | null
  onAsk: (q: string) => void
}) {
  const [showPrevention, setShowPrevention] = useState(false)
  const disease = prediction?.predicted_class?.replace(/_/g, ' ') || 'Unknown'
  const chips = getQuickChips(undefined, disease)

  return (
    <div className="rounded-2xl border border-[#D4E8DC] bg-white overflow-hidden shadow-sm">
      {/* ── Header ── */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#0B8F68] to-[#0d7a5a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Microscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-600 text-white/70 uppercase tracking-wider">AI Diagnosis</p>
            <h3 className="text-base font-800 text-white leading-tight">{disease}</h3>
          </div>
        </div>
        {prediction && (
          <div className="text-right">
            <p className="text-2xl font-800 text-white leading-none">{prediction.confidence_percent.toFixed(1)}%</p>
            <p className="text-[10px] text-white/70 mt-0.5">Model confidence</p>
          </div>
        )}
      </div>

      {/* ── Visual Evidence ── */}
      {prediction && (prediction.original_image || prediction.highlighted_image) && (
        <div className="p-4 border-b border-[#EDF7F2]">
          <div className="flex items-center gap-1.5 mb-3">
            <Eye className="w-3.5 h-3.5 text-purple-600" />
            <p className="text-[10px] font-700 text-purple-700 uppercase tracking-wider">Visual Evidence</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {prediction.original_image && (
              <div>
                <p className="text-[9px] font-700 text-[#64736C] uppercase tracking-wider mb-1.5">📷 Original Leaf</p>
                <div className="rounded-xl overflow-hidden border border-[#D4E8DC] bg-[#F0FAF4]">
                  <img
                    src={prediction.original_image}
                    alt="Original leaf"
                    className="w-full h-36 object-contain"
                  />
                </div>
              </div>
            )}
            {prediction.highlighted_image && (
              <div>
                <p className="text-[9px] font-700 text-[#64736C] uppercase tracking-wider mb-1.5">🔥 Grad-CAM</p>
                <div className="rounded-xl overflow-hidden border border-orange-100 bg-orange-50">
                  <img
                    src={prediction.highlighted_image}
                    alt="Grad-CAM attention heatmap"
                    className="w-full h-36 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
          {data.visual_explanation?.gradcam_explanation && (
            <p className="text-[11px] text-[#4A5E52] mt-2.5 leading-relaxed italic">
              {data.visual_explanation.gradcam_explanation}
            </p>
          )}
        </div>
      )}

      {/* ── AI Explanation ── */}
      {data.diagnosis_summary && (
        <div className="p-4 border-b border-[#EDF7F2]">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0B8F68]" />
            <p className="text-[10px] font-700 text-[#0B8F68] uppercase tracking-wider">AI Explanation</p>
          </div>
          <p className="text-[13px] text-[#10231D] leading-relaxed">{data.diagnosis_summary}</p>
          {data.why_detected?.length > 0 && (
            <ul className="mt-2.5 space-y-1.5">
              {data.why_detected.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-[#0B8F68] mt-0.5 shrink-0" />
                  <span className="text-[12px] text-[#4A5E52] leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Environmental Risk (merged SHAP + environment, shown once) ── */}
      {data.environmental_factors?.length > 0 && (
        <div className="p-4 border-b border-[#EDF7F2]">
          <div className="flex items-center gap-1.5 mb-3">
            <CloudRain className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-[10px] font-700 text-blue-700 uppercase tracking-wider">Environmental Risk</p>
          </div>
          <div className="space-y-3">
            {data.environmental_factors.map((ef, i) => {
              const pct = Math.min(ef.importance_pct, 100)
              const level = pct > 40 ? 'High' : pct > 20 ? 'Moderate' : 'Low'
              const barColor = pct > 40 ? '#EA580C' : pct > 20 ? '#D97706' : '#0B8F68'
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-600 text-[#10231D]">{ef.factor}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-700" style={{ color: barColor }}>{pct.toFixed(0)}%</span>
                      <span
                        className="text-[9px] font-700 px-1.5 py-0.5 rounded-full"
                        style={{ background: barColor + '18', color: barColor }}
                      >
                        {level}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#EDF7F2] overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>
                  <p className="text-[11px] text-[#64736C] leading-relaxed">{ef.explanation}</p>
                </div>
              )
            })}
          </div>
          <p className="text-[9px] text-[#94A09B] mt-2.5 leading-relaxed">
            SHAP-based contributions from environmental features — pre-computed by the backend, not by the AI.
          </p>
        </div>
      )}

      {/* ── Recommended Actions ── */}
      {data.recommended_actions?.length > 0 && (
        <div className="p-4 border-b border-[#EDF7F2]">
          <div className="flex items-center gap-1.5 mb-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <p className="text-[10px] font-700 text-amber-700 uppercase tracking-wider">Recommended Actions</p>
          </div>
          <ol className="space-y-2">
            {data.recommended_actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-700 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[12px] text-[#10231D] leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Prevention (collapsible) ── */}
      {data.prevention?.length > 0 && (
        <div className="p-4 border-b border-[#EDF7F2]">
          <button
            type="button"
            onClick={() => setShowPrevention(!showPrevention)}
            className="flex items-center gap-1.5 w-full text-left"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#0B8F68]" />
            <span className="text-[10px] font-700 text-[#0B8F68] uppercase tracking-wider flex-1">Prevention</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#64736C] transition-transform ${showPrevention ? 'rotate-180' : ''}`} />
          </button>
          {showPrevention && (
            <ul className="mt-2.5 space-y-1.5">
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

      {/* ── Disclaimer ── */}
      {data.disclaimer && (
        <div className="px-4 py-3 border-b border-[#EDF7F2]">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 leading-relaxed">{data.disclaimer}</p>
          </div>
        </div>
      )}

      {/* ── Quick chips ── */}
      <div className="p-4">
        <p className="text-[10px] font-700 text-[#64736C] uppercase tracking-wider mb-2.5">Ask about this diagnosis</p>
        <div className="grid grid-cols-2 gap-2">
          {chips.map(chip => (
            <button
              key={chip.question}
              type="button"
              onClick={() => onAsk(chip.question)}
              className="text-left text-[11px] px-3 py-2 rounded-xl bg-[#F0FAF4] border border-[#B9E8D1] text-[#0B6344] font-600 hover:bg-[#0B8F68] hover:text-white hover:border-[#0B8F68] transition-all leading-tight"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── ChatAnswerBubble — Mode B focused answer ──────────────────────────────────

function ChatAnswerBubble({
  message,
  onAsk,
}: {
  message: ChatMessage
  onAsk: (q: string) => void
}) {
  const chatAnswer = message.chat_answer || message.text
  const chips = getQuickChips(message.intent)
  const followUps = message.follow_up_questions ?? []

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <Bot className="w-3.5 h-3.5 text-[#0B8F68]" />
        <span className="text-[10px] font-700 text-[#0B8F68]">Plant Health Assistant</span>
        {message.intent && message.intent !== 'general' && (
          <span className="text-[9px] font-600 px-1.5 py-0.5 rounded-full bg-[#E6F7EF] text-[#0B8F68] capitalize ml-1">
            {message.intent.replace(/_/g, ' ')}
          </span>
        )}
      </div>
      <div className="bg-white rounded-2xl rounded-tl-none border border-[#E0EBE4] px-5 py-4 shadow-sm">
        <div className="space-y-1">
          {renderMarkdown(chatAnswer)}
        </div>
      </div>

      {/* Dynamic follow-up chips */}
      {(followUps.length > 0 || chips.length > 0) && (
        <div className="pl-1">
          <p className="text-[10px] font-600 text-[#66736C] uppercase tracking-wider mb-1.5">Continue asking</p>
          <div className="flex flex-wrap gap-1.5">
            {(followUps.length > 0 ? followUps : chips.map(c => c.question)).slice(0, 3).map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onAsk(q)}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#F0FAF4] border border-[#B9E8D1] text-[#0B6344] font-500 hover:bg-[#0B8F68] hover:text-white hover:border-[#0B8F68] transition-all"
              >
                {typeof q === 'string' ? q : (q as { question: string }).question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Left panel: Diagnosis Snapshot ───────────────────────────────────────────

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
        <p className="text-sm font-600 text-[#10231D] mb-1">No active diagnosis</p>
        <p className="text-xs text-[#64736C] leading-relaxed">
          Scan a plant leaf to get a full diagnosis. The assistant will receive the complete context automatically.
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
      {/* Image */}
      <div className="relative rounded-xl overflow-hidden bg-[#F0FAF4] border border-[#B9E8D1]">
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
            {prediction.disease_info.severity} — knowledge base
          </span>
        </div>
      </div>

      {/* Prediction summary */}
      <div className="p-3 rounded-xl bg-[#F5FBF7] border border-[#D4E8DC] space-y-2">
        <div>
          <p className="text-[9px] font-700 text-[#64736C] uppercase tracking-wider">Detected Condition</p>
          <p className="text-sm font-700 text-[#10231D] leading-tight mt-0.5">
            {prediction.predicted_class.replace(/_/g, ' ')}
          </p>
          <p className="text-[11px] text-[#64736C] capitalize">Crop: {prediction.crop}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-[#64736C]">Model Confidence</span>
            <span className="text-[11px] font-700 text-[#10231D]">{prediction.confidence_percent.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#EDF7F2] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${prediction.confidence_percent}%`, background: severityColor }}
            />
          </div>
          <p className="text-[9px] text-[#94A09B] mt-1">
            Confidence ≠ severity. Disease impact from knowledge base.
          </p>
        </div>
      </div>

      {/* Weather */}
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

      {/* SHAP feature importance — shown once in snapshot only */}
      {fiEntries.length > 0 && (
        <div className="p-3 rounded-xl bg-[#F5FBF7] border border-[#D4E8DC]">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#0B8F68]" />
            <p className="text-[10px] font-700 text-[#64736C] uppercase tracking-wider">SHAP Risk Factors</p>
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
            SHAP-based environmental contributions — pre-computed by backend.
          </p>
        </div>
      )}

      {/* Grad-CAM thumbnail */}
      {prediction.highlighted_image && (
        <div className="p-2 rounded-xl bg-[#F0FAF4] border border-[#B9E8D1]">
          <p className="text-[9px] font-700 text-[#0B8F68] uppercase tracking-wider mb-1.5 px-1">Grad-CAM</p>
          <img
            src={prediction.highlighted_image}
            alt="Grad-CAM heatmap"
            className="w-full rounded-lg object-contain max-h-28"
          />
          <p className="text-[9px] text-[#64736C] mt-1.5 px-1 leading-relaxed">
            Model attention regions — not a pixel-level disease map.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Main AssistantPage ────────────────────────────────────────────────────────

interface AssistantPageProps {
  chat: ChatMessage[]
  onAskAssistant: (question: string) => Promise<void>
  isAsking: boolean
  latestPrediction: PredictionResponse | null
  locationData?: LocationContextData | null
  diagnosisId?: string | null
}

export function AssistantPage({
  chat,
  onAskAssistant,
  isAsking,
  latestPrediction,
  locationData,
  diagnosisId,
}: AssistantPageProps) {
  const [input, setInput] = useState('')
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const { lang, t } = useLang()

  const disease = latestPrediction?.predicted_class?.replace(/_/g, ' ')

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  function speakText(text: string, msgIndex: number) {
    if (!('speechSynthesis' in window)) return

    if (speakingIndex === msgIndex) {
      window.speechSynthesis.cancel()
      setSpeakingIndex(null)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const bcp47 = LANGUAGE_META[lang]?.bcp47 || 'en-US'
    utterance.lang = bcp47
    utterance.rate = 0.95

    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)

    setSpeakingIndex(msgIndex)
    window.speechSynthesis.speak(utterance)
  }

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
    <div className="space-y-5 pb-16 max-w-7xl mx-auto animate-fade-in">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-[#E0EBE4] p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#0B8F68] flex items-center justify-center shrink-0 shadow-md shadow-[#0B8F68]/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#111827]">{t('assistant.title')}</h1>
                <span className="badge badge-green text-[10px] font-bold px-2 py-0.5">{t('common.poweredBy')}</span>
              </div>
              <p className="text-xs text-[#4B5563] mt-0.5">{t('assistant.subtitle')}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${diagnosisId ? 'bg-[#0B8F68] animate-pulse-dot' : 'bg-emerald-500'}`} />
            <span className={`text-xs font-600 ${diagnosisId ? 'text-[#0B8F68]' : 'text-emerald-700'}`}>
              {diagnosisId
                ? `Diagnosis session active — ${disease || 'diagnosis'}`
                : 'AI Assistant ready — Ask any question'
              }
            </span>
          </div>
        </div>
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT: Snapshot */}
        <div className="lg:col-span-4 rounded-2xl border border-[#E0EBE4] bg-white overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[#E0EBE4] bg-[#F0FAF4]">
            <Activity className="w-4 h-4 text-[#0B8F68]" />
            <p className="text-sm font-bold text-[#111827]">Diagnosis Context</p>
            {latestPrediction && (
              <span className="ml-auto text-[9px] font-bold px-2 py-1 rounded-full bg-[#0B8F68] text-white">
                Active
              </span>
            )}
          </div>
          <div className="p-4 overflow-y-auto flex-1" style={{ maxHeight: 680 }}>
            <DiagnosisSnapshot prediction={latestPrediction} locationData={locationData ?? null} />
          </div>
        </div>

        {/* RIGHT: Chat */}
        <div
          className="lg:col-span-8 flex flex-col rounded-2xl border border-[#E0EBE4] bg-[#FAFCFA] overflow-hidden shadow-sm"
          style={{ minHeight: 600 }}
        >
          {/* Context banner */}
          {latestPrediction && (
            <div className="flex items-center gap-2 px-5 py-3 bg-[#F0FAF4] border-b border-[#B9E8D1]">
              <div className="w-2 h-2 rounded-full bg-[#0B8F68] animate-pulse-dot" />
              <span className="text-xs text-[#0B8F68] font-600">
                Diagnosis context: <strong>{latestPrediction.crop} — {disease}</strong> ({latestPrediction.confidence_percent.toFixed(1)}% confidence)
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

            {/* Welcome state */}
            {chat.length === 1 && chat[0].role === 'assistant' && !chat[0].structured && !isAsking && (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F0FAF4] border border-[#B9E8D1] flex items-center justify-center mb-4 text-[#0B8F68] shadow-sm">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-1">Plant Health & General AI Assistant</h3>
                <p className="text-xs text-[#4B5563] max-w-md leading-relaxed">
                  {latestPrediction
                    ? 'Ask questions about your diagnosis, treatments, Grad-CAM heatmap, weather risk, or any general question!'
                    : 'Ask any question about agriculture, crop care, science, math, or general topics! You can also scan a plant leaf to get AI diagnosis details.'}
                </p>
              </div>
            )}

            {chat.map((msg, i) => {
              const isSpeakingThis = speakingIndex === i
              const speakableText = msg.chat_answer || msg.text

              return (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                    msg.role === 'assistant' ? 'bg-[#159A70] text-white' : 'bg-[#DDF3E8] text-[#159A70]'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
                  </div>

                  {/* Content */}
                  <div className={`${msg.role === 'user' ? 'max-w-[80%]' : 'flex-1'}`}>
                    {msg.role === 'user' ? (
                      <div className="bg-[#159A70] text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-sm leading-relaxed">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Voice button — only for non-dashboard messages */}
                        {!msg.structured && (
                          <div className="flex items-center justify-end px-1">
                            <button
                              type="button"
                              onClick={() => speakText(speakableText, i)}
                              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                                isSpeakingThis
                                  ? 'bg-red-500 text-white animate-pulse'
                                  : 'bg-[#E6F7EF] text-[#0B8F68] hover:bg-[#0B8F68] hover:text-white'
                              }`}
                              title="Listen to this answer"
                            >
                              {isSpeakingThis ? (
                                <><Square className="w-3 h-3 fill-current" /><span>{t('btn.stopSpeaking')}</span></>
                              ) : (
                                <><Volume2 className="w-3 h-3" /><span>{t('btn.speak')}</span></>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Mode A — full diagnosis dashboard */}
                        {msg.structured ? (
                          <DiagnosisDashboard
                            data={msg.structured}
                            prediction={latestPrediction}
                            onAsk={onAskAssistant}
                          />
                        ) : msg.chat_answer ? (
                          /* Mode B — focused chat answer */
                          <ChatAnswerBubble message={msg} onAsk={onAskAssistant} />
                        ) : (
                          /* Plain text fallback */
                          <div className="bg-white border border-[#E0EBE4] px-4 py-3 rounded-2xl rounded-tl-none text-sm text-[#17211D] leading-relaxed shadow-sm">
                            {msg.text}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Typing indicator */}
            {isAsking && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#159A70] flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-[#E0EBE4] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
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

          {/* Input area */}
          <div className="px-4 py-3 border-t border-[#E0EBE4] bg-white flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                latestPrediction
                  ? 'Ask about this diagnosis — treatment, Grad-CAM, humidity, prevention…'
                  : 'Ask about plant diseases, treatments, or prevention…'
              }
              rows={1}
              aria-label="Ask the plant health AI assistant"
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
