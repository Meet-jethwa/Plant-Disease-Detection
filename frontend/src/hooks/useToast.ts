// useToast.ts — Simple toast notification hook
import { useState, useCallback } from 'react'
import type { Toast, NotificationType } from '../types'

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: NotificationType, title: string, message?: string) => {
    const id = String(Date.now())
    const toast: Toast = { id, type, title, message }
    setToasts(prev => [...prev, toast])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((title: string, message?: string) => addToast('success', title, message), [addToast])
  const error   = useCallback((title: string, message?: string) => addToast('error',   title, message), [addToast])
  const warning = useCallback((title: string, message?: string) => addToast('warning', title, message), [addToast])
  const info    = useCallback((title: string, message?: string) => addToast('info',    title, message), [addToast])

  return { toasts, addToast, removeToast, success, error, warning, info }
}
