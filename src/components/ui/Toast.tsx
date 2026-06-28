'use client'

import { useEffect } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

const icons: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning',
}

const colors: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-500 text-green-800',
  error: 'bg-error-container border-error text-on-error-container',
  info: 'bg-surface-container-low border-primary-container text-on-background',
  warning: 'bg-secondary-fixed border-secondary text-on-secondary-fixed',
}

const iconColors: Record<ToastType, string> = {
  success: 'text-green-600',
  error: 'text-error',
  info: 'text-on-tertiary-container',
  warning: 'text-secondary',
}

export default function Toast({ message, type = 'info', onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-lg max-w-sm animate-in slide-in-from-bottom-2 ${colors[type]}`}>
      <span className={`material-symbols-outlined material-symbols-filled text-[22px] ${iconColors[type]}`}>
        {icons[type]}
      </span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity ml-2">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  )
}
