'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { useToast } from '@/compartido/componentes/ui/toast'

interface NotificacionPreview {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  link: string | null
  createdAt: string
  creadaPor?: { name: string | null } | null
}

const POLL_INTERVAL = 30_000

export function NotificacionesBell() {
  const [sinLeer, setSinLeer] = useState(0)
  const [notificaciones, setNotificaciones] = useState<NotificacionPreview[]>([])
  const [open, setOpen] = useState(false)
  const [cargando, setCargando] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const fetchErrorShown = useRef(false)

  const fetchNotificaciones = useCallback(async (showLoading = false) => {
    if (showLoading) setCargando(true)
    try {
      const res = await fetch('/api/notificaciones?limit=5')
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setSinLeer(data.sinLeer ?? 0)
      setNotificaciones(data.notificaciones ?? [])
      fetchErrorShown.current = false
    } catch {
      if (!fetchErrorShown.current) {
        toast({ mensaje: 'No se pudieron cargar las notificaciones', tipo: 'error' })
        fetchErrorShown.current = true
      }
    } finally {
      setCargando(false)
    }
  }, [toast])

  // Initial fetch
  useEffect(() => {
    fetchNotificaciones(true)
  }, [fetchNotificaciones])

  // Polling every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchNotificaciones(), POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchNotificaciones])

  // Refetch on tab focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchNotificaciones()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [fetchNotificaciones])

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close dropdown on ESC
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open])

  async function marcarLeida(id: string) {
    await fetch('/api/notificaciones', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    )
    setSinLeer(prev => Math.max(0, prev - 1))
  }

  function handleNotificacionClick(n: NotificacionPreview) {
    if (!n.leida) marcarLeida(n.id)
    setOpen(false)
    if (n.link) {
      if (n.link.startsWith('http')) {
        window.open(n.link, '_blank', 'noopener,noreferrer')
      } else {
        router.push(n.link)
      }
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen(prev => !prev)
          if (!open) fetchNotificaciones()
        }}
        className="hover:text-blue-200 transition-colors relative"
        aria-label={`Notificaciones${sinLeer > 0 ? ` (${sinLeer} sin leer)` : ''}`}
      >
        <Bell className="w-4 h-4" />
        {sinLeer > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-brand-red text-white text-[10px] font-bold rounded-full px-1">
            {sinLeer > 99 ? '99+' : sinLeer}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-sm:w-[calc(100vw-2rem)] max-sm:right-[-0.5rem] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-overpass font-semibold text-sm text-gray-900">Notificaciones</h3>
            {sinLeer > 0 && (
              <span className="text-xs text-brand-blue font-medium">{sinLeer} sin leer</span>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {cargando ? (
              <DropdownSkeleton />
            ) : notificaciones.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="font-overpass font-semibold text-gray-800 text-sm mb-1">Estas al dia</p>
                <p className="text-xs text-gray-500">Sin notificaciones nuevas</p>
              </div>
            ) : (
              notificaciones.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificacionClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-l-2 ${
                    n.leida ? 'border-transparent' : 'border-brand-blue bg-brand-blue/5'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {n.tipo === 'mensaje_individual' && (
                        <span className="inline-block text-[10px] font-semibold text-white bg-brand-blue rounded px-1.5 py-0.5 mb-1">
                          Mensaje del equipo
                        </span>
                      )}
                      <p className="text-sm font-medium text-gray-900 truncate">{n.titulo}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{n.mensaje}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {n.tipo === 'mensaje_individual' && n.creadaPor?.name && (
                          <span className="text-[11px] text-gray-400">De: {n.creadaPor.name}</span>
                        )}
                        <span className="text-[11px] text-gray-400">{tiempoRelativo(n.createdAt)}</span>
                      </div>
                    </div>
                    {!n.leida && (
                      <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100">
            <Link
              href="/cuenta/notificaciones"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-center text-sm font-overpass font-medium text-brand-blue hover:bg-gray-50 transition-colors"
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function DropdownSkeleton() {
  return (
    <div className="px-4 py-3 space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded w-full" />
          <div className="h-2 bg-gray-100 rounded w-1/3" />
        </div>
      ))}
    </div>
  )
}

export function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const horas = Math.floor(mins / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  return `hace ${dias}d`
}
