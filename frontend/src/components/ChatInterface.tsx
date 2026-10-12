// ChatInterface.tsx — AI assistant chat UI
import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, Leaf } from 'lucide-react'
import type { ChatMessage } from '../types'

const SUGGESTED_PROMPTS = [
  'What causes Yellow Rust in wheat?',
  'How should I manage Rice Blast in flooded fields?',
  'What should I do after today\'s diagnosis?',
  'How can I prevent bacterial blight in cotton?',
  'Is red rot in sugarcane treatable early?',
]

interface ChatInterfaceProps {
  messages: ChatMessage[]
  onSend: (text: string) => void
  isLoading: boolean
  currentPlant?: { name: string; disease?: string; score?: number } | null
}

export function ChatInterface({ messages, onSend, isLoading, currentPlant }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return
    onSend(text)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[500px] max-h-[700px] rounded-2xl bg-white border border-emerald-200 shadow-sm overflow-hidden text-left">
      {/* Context banner */}
      {currentPlant && (
        <div className="px-4 py-3 bg-emerald-50/80 border-b border-emerald-200 flex items-center gap-2.5">
          <Leaf className="w-4 h-4 text-emerald-700 shrink-0" />
          <div className="text-xs text-emerald-950 font-medium truncate">
            <span className="font-bold">Active Specimen: {currentPlant.name}</span>
            {currentPlant.disease && (
              <span className="text-stone-600 ml-1.5">· {currentPlant.disease}</span>
            )}
            {currentPlant.score != null && (
              <span className="text-stone-600 ml-1.5">· Health: {currentPlant.score}/100</span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-stone-400 text-sm">
            Start a conversation with your FloraAI Field Assistant
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-emerald-700 text-white'
            }`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[85%] px-4 py-3 text-base leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-white border border-emerald-200 text-emerald-950 rounded-[6px_20px_20px_20px] shadow-xs'
                : 'bg-emerald-700 text-white rounded-[20px_20px_6px_20px] shadow-xs'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-emerald-200 px-4 py-3 rounded-[6px_20px_20px_20px] shadow-xs flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-emerald-600"
                  style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts — shown only when no user messages */}
      {messages.filter(m => m.role === 'user').length === 0 && !isLoading && (
        <div className="px-4 pb-3 border-t border-emerald-100 pt-3">
          <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map(prompt => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSend(prompt)}
                className="text-xs px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold hover:bg-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-emerald-200 flex items-end gap-2 bg-emerald-50/30">
        <label htmlFor="chat-input" className="sr-only">Message FloraAI</label>
        <textarea
          id="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about crop health, irrigation, or fertilization..."
          rows={1}
          className="flex-1 rounded-xl bg-white border border-emerald-200 px-3.5 py-2.5 text-base text-emerald-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 resize-none max-h-32 min-h-[44px]"
          style={{ height: 'auto' }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
          className="w-11 h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-100 disabled:text-stone-400 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-xs"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
        </button>
      </div>
    </div>
  )
}
