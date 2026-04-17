'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle2 } from 'lucide-react'

interface Notificacion {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  link: string | null
  createdAt: string | Date
}

const labelPorTipo: Record<string, string> = {
  COTIZACION: 'Ver pedido',
  PEDIDO_DISPONIBLE: 'Ver pedido disponible',
  PEDIDO_INVITACION: 'Ver pedido',
  ADMIN_ENVIO: 'Ir al enlace',
}

function marcarLeida(notificacionId: string) {
  fetch('/api/notificaciones', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: notificacionId }),
  }).catch(() => {})
}

function marcarTodasLeidas() {
  return fetch('/api/notificaciones', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marcarTodas: true }),
  })
}

export function NotificacionesLista({ notificaciones: initial, emptyMessage }: { notificaciones: Notificacion[]; emptyMessage?: string }) {
  const [notificaciones, setNotificaciones] = useState(initial)

  const sinLeer = notificaciones.filter(n => !n.leida).length

  async function handleMarcarTodas() {
    await marcarTodasLeidas()
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  function handleClickNotificacion(n: Notificacion) {
    if (!n.leida) {
      marcarLeida(n.id)
      setNotificaciones(prev =>
        prev.map(notif => notif.id === n.id ? { ...notif, leida: true } : notif)
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Notificaciones</h1>
        {sinLeer > 0 && (
          <button
            onClick={handleMarcarTodas}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-overpass font-semibold text-brand-blue hover:bg-gray-50 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Marcar todas como leidas
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600">
        Total: {notificaciones.length} | Sin leer: {sinLeer}
      </p>

      {notificaciones.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Bell className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">{emptyMessage ?? 'No tenes notificaciones por ahora.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificaciones.map(n => {
            const contenido = (
              <>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="font-overpass font-semibold text-brand-blue">{n.titulo}</h2>
                  {!n.leida && (
                    <span className="text-xs font-overpass font-semibold text-brand-red">NUEVA</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-1">{n.mensaje}</p>
                {n.link && (
                  <span className="text-xs text-brand-blue font-medium">
                    {labelPorTipo[n.tipo] ?? 'Ver'} →
                  </span>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(n.createdAt).toLocaleString('es-AR')}
                </p>
              </>
            )

            const baseClasses = `block rounded-xl border p-4 transition-colors ${
              n.leida
                ? 'border-gray-200 bg-white'
                : 'border-brand-blue/30 bg-brand-blue/5'
            }`

            if (!n.link) {
              return (
                <div key={n.id} className={baseClasses}>
                  {contenido}
                </div>
              )
            }

            const isExternal = n.link.startsWith('http')

            if (isExternal) {
              return (
                <a
                  key={n.id}
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClickNotificacion(n)}
                  className={`${baseClasses} cursor-pointer hover:bg-gray-50`}
                >
                  {contenido}
                </a>
              )
            }

            return (
              <Link
                key={n.id}
                href={n.link}
                onClick={() => handleClickNotificacion(n)}
                className={`${baseClasses} cursor-pointer hover:bg-gray-50`}
              >
                {contenido}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
