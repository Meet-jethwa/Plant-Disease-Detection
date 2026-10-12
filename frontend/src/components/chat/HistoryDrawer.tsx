// HistoryDrawer.tsx — Collapsible 280px Desktop Side Panel / Mobile Bottom Sheet for Query History
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, Trash2, X, Clock, ChevronRight } from 'lucide-react'

interface HistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  sessionQueries: string[]
  onSelectQuery: (query: string) => void
  onNewChat: () => void
  onClearSession: () => void
}

export function HistoryDrawer({
  isOpen,
  onClose,
  sessionQueries,
  onSelectQuery,
  onNewChat,
  onClearSession,
}: HistoryDrawerProps) {
  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (mobile and desktop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-emerald-950/30 backdrop-blur-xs z-40 lg:hidden"
            aria-hidden="true"
          />

          {/* Side Panel (Desktop 280px) & Mobile Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed top-0 bottom-0 left-0 z-50 w-[280px] sm:w-[320px] bg-white border-r border-emerald-200 shadow-xl flex flex-col"
            aria-label="Conversation history"
          >
            {/* Header */}
            <div className="p-4 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-emerald-950">Chat Session History</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-emerald-50 text-stone-500 hover:text-emerald-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close history panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions: New Chat & Clear */}
            <div className="p-3 border-b border-emerald-100 flex gap-2">
              <button
                type="button"
                onClick={() => { onNewChat(); onClose() }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
              {sessionQueries.length > 0 && (
                <button
                  type="button"
                  onClick={onClearSession}
                  className="py-2 px-3 rounded-xl border border-emerald-200 hover:bg-red-50 text-stone-600 hover:text-red-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                  title="Clear current queries"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Query List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {sessionQueries.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-emerald-950 mb-1">No Past Queries</p>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Questions you ask during this session will appear here for quick reference.
                  </p>
                </div>
              ) : (
                sessionQueries.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { onSelectQuery(q); onClose() }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 text-xs text-stone-700 hover:text-emerald-950 font-medium flex items-center justify-between gap-2 group transition-all cursor-pointer"
                  >
                    <span className="truncate flex-1">{q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-emerald-50/50 border-t border-emerald-100 text-[11px] text-stone-500 text-center">
              FloraAI Agronomy Engine v2.4
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
