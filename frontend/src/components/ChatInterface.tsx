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
    <div className="flex flex-col h-full min-h-[500px] max-h-[700px] card-lg overflow-hidden">
      {/* Context banner */}
      {currentPlant && (
        <div className="px-4 py-2.5 bg-[#F0FBF5] border-b border-[#D4E8DC] flex items-center gap-2">
          <Leaf className="w-3.5 h-3.5 text-[#0B8F68]" />
          <div className="text-xs text-[#064e3b]">
            <span className="font-bold">Current plant: {currentPlant.name}</span>
            {currentPlant.disease && (
              <span className="text-[#64736C] ml-1">· {currentPlant.disease}</span>
            )}
            {currentPlant.score != null && (
              <span className="text-[#64736C] ml-1">· Health: {currentPlant.score}/100</span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-[#94A09B] text-sm">
            Start a conversation with your AI Chat
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-[#0B8F68] text-white'
                : 'bg-[#DDF7EA] text-[#0B8F68]'
            }`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-[#F5F8F5] border border-[#D4E8DC] text-[#10231D] rounded-tl-none'
                : 'bg-[#0B8F68] text-white rounded-tr-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0B8F68] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#F5F8F5] border border-[#D4E8DC] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#94A09B]"
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
        <div className="px-4 pb-3 border-t border-[#EDF7F2] pt-3">
          <p className="section-label mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map(prompt => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSend(prompt)}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#F0FBF5] border border-[#B9E8D1] text-[#065E44] font-medium hover:bg-[#DDF7EA] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#D4E8DC] flex items-end gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your plant..."
          rows={1}
          aria-label="Message AI Chat"
          className="flex-1 input resize-none py-2.5 max-h-32 min-h-[44px]"
          style={{ height: 'auto' }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
          className="btn btn-primary btn-icon shrink-0"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
