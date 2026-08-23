// AssistantPage.tsx — Technical XAI Diagnostic Assistant
import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Loader2,
  Leaf,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  MapPin,
  Sparkles,
  ShieldAlert,
  FlaskConical,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Terminal,
} from 'lucide-react'
import type { ChatMessage, GeminiResponse, PredictionResponse, LocationContextData } from '../types'

function getContextPrompts(disease?: string, crop?: string): string[] {
  if (disease && crop) {
    return [
      `What chemical or organic remedies treat ${disease}?`,
      `Explain the Grad-CAM focus regions for this ${crop} sample.`,
      `How do current humidity levels correlate with ${disease}?`,
      `What preventive schedule limits spore dispersal?`,
    ]
  }
  return [
    'How do I treat Rice Blast organically?',
    'What causes Yellow Rust in Wheat crops?',
    'Explain the role of relative humidity in fungal spore propagation.',
    'What are the primary symptoms of Bacterial Blight in Cotton?',
  ]
}

function StructuredResponseCard({ data }: { data: GeminiResponse }) {
  const [showPrevention, setShowPrevention] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
      {data.diagnosis_summary && (
        <div style={{ padding: '12px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <FlaskConical style={{ width: '14px', height: '14px', color: '#159A70' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#159A70', textTransform: 'uppercase' }}>Diagnosis Summary</span>
          </div>
          <p style={{ margin: 0, color: '#1E293B', lineHeight: 1.5 }}>{data.diagnosis_summary}</p>
        </div>
      )}

      {data.why_detected?.length > 0 && (
        <div style={{ padding: '12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Sparkles style={{ width: '14px', height: '14px', color: '#6366F1' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase' }}>Interpretability Rationale (XAI)</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.why_detected.map((point, i) => (
              <li key={i} style={{ color: '#334155', lineHeight: 1.5 }}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {data.environmental_factors?.length > 0 && (
        <div style={{ padding: '12px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <BarChart3 style={{ width: '14px', height: '14px', color: '#2563EB' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>Environmental Impact Ratios</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.environmental_factors.map((ef, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#1E293B', marginBottom: '2px' }}>
                  <span>{ef.factor}</span>
                  <span>{ef.importance_pct.toFixed(0)}%</span>
                </div>
                <div style={{ height: '5px', borderRadius: '999px', background: '#DBEAFE', overflow: 'hidden', marginBottom: '4px' }}>
                  <div style={{ height: '100%', borderRadius: '999px', background: '#2563EB', width: `${Math.min(ef.importance_pct, 100)}%` }} />
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>{ef.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recommended_actions?.length > 0 && (
        <div style={{ padding: '12px', borderRadius: '10px', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <CheckCircle2 style={{ width: '14px', height: '14px', color: '#D97706' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>Agronomic Recommendations</span>
          </div>
          <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.recommended_actions.map((action, i) => (
              <li key={i} style={{ color: '#1E293B', lineHeight: 1.5 }}>{action}</li>
            ))}
          </ol>
        </div>
      )}

      {data.prevention?.length > 0 && (
        <div style={{ padding: '12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <button
            type="button"
            onClick={() => setShowPrevention(!showPrevention)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert style={{ width: '14px', height: '14px', color: '#159A70' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#159A70', textTransform: 'uppercase' }}>Prophylaxis & Prevention</span>
            </div>
            <ChevronRight style={{ width: '14px', height: '14px', color: '#64748B', transform: showPrevention ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {showPrevention && (
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {data.prevention.map((p, i) => (
                <li key={i} style={{ color: '#334155', lineHeight: 1.5 }}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function DiagnosisSnapshot({
  prediction,
  locationData,
}: {
  prediction: PredictionResponse | null
  locationData: LocationContextData | null
}) {
  if (!prediction) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F1F5F9', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <Leaf style={{ width: '22px', height: '22px', color: '#94A3B8' }} />
        </div>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', margin: '0 0 4px 0' }}>No Active Inference Context</p>
        <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
          Run a leaf scan first to pass real-time disease coordinates, Grad-CAM attention, and weather parameters to the assistant.
        </p>
      </div>
    )
  }

  const weather = prediction.weather_context?.weather ?? locationData?.weather
  const location = prediction.weather_context?.location ?? locationData?.location

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#0F172A', height: '150px' }}>
        {prediction.original_image ? (
          <img src={prediction.original_image} alt="Specimen" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf style={{ width: '32px', height: '32px', color: '#334155' }} />
          </div>
        )}
      </div>

      <div style={{ padding: '12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Target Classification</span>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '2px 0 0 0' }}>{prediction.predicted_class}</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '12px', color: '#64748B' }}>
          <span>Crop: <strong style={{ color: '#0F172A', textTransform: 'capitalize' }}>{prediction.crop}</strong></span>
          <span>Confidence: <strong style={{ color: '#159A70' }}>{prediction.confidence_percent.toFixed(1)}%</strong></span>
        </div>
      </div>

      {weather && (
        <div style={{ padding: '12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Localized Sensor Context
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#334155' }}>
            <div>Temp: <strong>{weather.temperature_c}°C</strong></div>
            <div>Humidity: <strong>{weather.humidity_percent}%</strong></div>
            <div>Rain: <strong>{weather.rainfall_mm} mm</strong></div>
            <div>Wind: <strong>{weather.wind_kmh} km/h</strong></div>
          </div>
        </div>
      )}
    </div>
  )
}

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
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* ── Page Header ── */}
      <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#159A70' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#159A70', letterSpacing: '0.05em' }}>
              XAI Agronomic Consultation
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Pathology Interpretability Terminal
          </h1>
        </div>
      </div>

      {/* ── Workspace 2-Column Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Left: Diagnosis Snapshot */}
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0F172A', display: 'block', marginBottom: '14px' }}>
            Active Specimen Context
          </span>
          <DiagnosisSnapshot prediction={latestPrediction} locationData={locationData ?? null} />
        </div>

        {/* Right: Dialogue Window */}
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', display: 'flex', flexDirection: 'column', minHeight: '560px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
            Session Thread · Technical Query Terminal
          </div>

          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '480px' }}>
            {chat.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    background: msg.role === 'user' ? '#159A70' : '#F8FAFC',
                    color: msg.role === 'user' ? '#ffffff' : '#1E293B',
                    border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0',
                  }}
                >
                  {msg.role === 'user' ? (
                    msg.text
                  ) : msg.structured ? (
                    <StructuredResponseCard data={msg.structured} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isAsking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px' }}>
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                <span>Synthesizing diagnostic parameters...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompt suggestions */}
          <div style={{ padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {prompts.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void onAskAssistant(prompt)}
                style={{
                  padding: '6px 10px',
                  background: '#ffffff',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '10px' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a technical question regarding pathology, etiology, or treatment..."
              rows={1}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
              }}
            />
            <button
              type="button"
              onClick={(e) => void handleSubmit(e)}
              disabled={!input.trim() || isAsking}
              style={{
                padding: '0 16px',
                borderRadius: '8px',
                background: '#159A70',
                color: '#ffffff',
                border: 'none',
                cursor: !input.trim() || isAsking ? 'not-allowed' : 'pointer',
                opacity: !input.trim() || isAsking ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}