// MessageBubble.tsx — User and AI chat message cards with accessible action row
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Leaf, Volume2, Square, Copy, Check, ThumbsUp, ThumbsDown
} from 'lucide-react'
import type { ChatMessage, GeminiResponse, PredictionResponse } from '../../types'
import { DiagnosisCard } from './DiagnosisCard'

interface MessageBubbleProps {
  message: ChatMessage
  index: number
  isSpeaking: boolean
  onToggleSpeak: (text: string, index: number) => void
  onCopy: (text: string, index: number) => void
  isCopied: boolean
  onAsk: (question: string) => void
  latestPrediction?: PredictionResponse | null
}

export function MessageBubble({
  message,
  index,
  isSpeaking,
  onToggleSpeak,
  onCopy,
  isCopied,
  onAsk,
  latestPrediction,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  // Parse markdown-lite into structured elements
  function renderFormattedText(text: string) {
    const paragraphs = text.split(/\n\n+/)
    return paragraphs.map((para, pi) => {
      const lines = para.split('\n')

      // Numbered list block
      if (lines.length > 1 && lines.every(l => /^\d+\./.test(l.trim()) || l.trim() === '')) {
        return (
          <ol key={pi} className="space-y-2.5 my-3 pl-1">
            {lines.filter(l => l.trim()).map((line, li) => (
              <li key={li} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {li + 1}
                </span>
                <span className="text-base text-emerald-950 leading-relaxed flex-1">
                  {line.replace(/^\d+\.\s*/, '')}
                </span>
              </li>
            ))}
          </ol>
        )
      }

      // Bullet list block
      if (lines.length > 1 && lines.every(l => /^[-*•]/.test(l.trim()) || l.trim() === '')) {
        return (
          <ul key={pi} className="space-y-2 my-2.5 pl-1">
            {lines.filter(l => l.trim()).map((line, li) => (
              <li key={li} className="flex gap-2.5 items-start">
                <div className="w-2 h-2 rounded-full bg-emerald-700 mt-2 shrink-0" />
                <span className="text-base text-emerald-950 leading-relaxed flex-1">
                  {line.replace(/^[-*•]\s*/, '')}
                </span>
              </li>
            ))}
          </ul>
        )
      }

      return (
        <p key={pi} className="text-base leading-relaxed my-2 first:mt-0 last:mb-0">
          {para}
        </p>
      )
    })
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end my-3"
      >
        <div className="bg-emerald-700 text-white text-base rounded-[20px_20px_6px_20px] px-4 sm:px-5 py-3 max-w-[85%] shadow-xs leading-relaxed break-words">
          {message.text}
        </div>
      </motion.div>
    )
  }

  // AI Message
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-3 my-4 max-w-full text-left"
    >
      {/* 32px Leaf Avatar */}
      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
        <Leaf className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 max-w-[90%] sm:max-w-[85%] space-y-2">
        
        {/* Main AI Bubble: White card, 1px green-200, radius 6/20/20/20 */}
        <div className="bg-white border border-emerald-200 rounded-[6px_20px_20px_20px] p-4 sm:p-5 shadow-xs text-emerald-950 text-base leading-[1.6]">
          {renderFormattedText(message.text)}

          {/* Embedded Diagnosis card if present in message payload */}
          {message.geminiData && (
            <DiagnosisCard
              data={message.geminiData}
              prediction={latestPrediction ?? null}
              onAsk={onAsk}
            />
          )}
        </div>

        {/* Action Row Under AI Message: 40px icon buttons */}
        <div className="flex items-center gap-1 sm:gap-2 pt-0.5">
          {/* Listen Button */}
          <button
            type="button"
            onClick={() => onToggleSpeak(message.text, index)}
            className={`min-h-[40px] h-10 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'text-stone-600 hover:text-emerald-950 hover:bg-emerald-50'
            }`}
            aria-label={isSpeaking ? 'Stop listening to advice' : 'Listen to advice spoken aloud'}
          >
            {isSpeaking ? <Square className="w-4 h-4 text-emerald-700 fill-emerald-700" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={() => onCopy(message.text, index)}
            className="min-h-[40px] h-10 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-950 hover:bg-emerald-50 transition-colors cursor-pointer"
            aria-label="Copy message text to clipboard"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4 text-emerald-700" />}
            <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Helpful Button */}
          <button
            type="button"
            onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
            className={`min-h-[40px] h-10 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              feedback === 'up'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'text-stone-600 hover:text-emerald-950 hover:bg-emerald-50'
            }`}
            aria-label="Mark response as helpful"
          >
            <ThumbsUp className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Helpful</span>
          </button>

          {/* Not Helpful */}
          <button
            type="button"
            onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
            className={`min-h-[40px] h-10 px-2.5 rounded-xl flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer ${
              feedback === 'down'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'text-stone-600 hover:text-red-700 hover:bg-emerald-50'
            }`}
            aria-label="Mark response as unhelpful"
          >
            <ThumbsDown className="w-4 h-4 text-stone-500" />
          </button>
        </div>

      </div>
    </motion.div>
  )
}
