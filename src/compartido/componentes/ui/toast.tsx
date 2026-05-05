'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastData {
  id: number
  mensaje: string
  tipo: ToastType
  description?: string
  accion?: {
    texto: string
    onClick: () => void
  }
}

type ToastInput =
  | string
  | {
      mensaje: string
      tipo?: ToastType
      description?: string
      accion?: {
        texto: string
        onClick: () => void
      }
    }

interface ToastContextValue {
  toast: (input: ToastInput, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const MAX_TOASTS = 3
let nextId = 0

const iconByType = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorByType = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-600 text-white',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const toast = useCallback((input: ToastInput, type?: ToastType) => {
    const id = ++nextId

    let data: ToastData
    if (typeof input === 'string') {
      data = { id, mensaje: input, tipo: type ?? 'success' }
    } else {
      data = {
        id,
        mensaje: input.mensaje,
        tipo: input.tipo ?? 'success',
        description: input.description,
        accion: input.accion,
      }
    }

    setToasts(prev => {
      const next = [...prev, data]
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next
    })

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map(t => {
          const Icon = iconByType[t.tipo]
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in-right ${colorByType[t.tipo]}`}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span>{t.mensaje}</span>
                {t.description && (
                  <p className="text-xs mt-1 opacity-90 font-normal">{t.description}</p>
                )}
                {t.accion && (
                  <button
                    onClick={() => {
                      t.accion!.onClick()
                      dismiss(t.id)
                    }}
                    className="text-xs mt-2 underline font-semibold opacity-90 hover:opacity-100"
                  >
                    {t.accion.texto}
                  </button>
                )}
              </div>
              <button onClick={() => dismiss(t.id)} className="hover:opacity-70 shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
