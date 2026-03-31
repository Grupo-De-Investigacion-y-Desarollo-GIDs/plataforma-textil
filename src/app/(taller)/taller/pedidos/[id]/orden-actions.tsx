'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface OrdenActionsProps {
  ordenId: string
  estado: string
  progresoActual: number
}

export function OrdenActions({ ordenId, estado, progresoActual }: OrdenActionsProps) {
  const router = useRouter()
  const [progreso, setProgreso] = useState(progresoActual)
  const [loading, setLoading] = useState(false)
  const [confirmar, setConfirmar] = useState<'aceptar' | 'rechazar' | null>(null)
  const [error, setError] = useState('')

  async function actualizarOrden(body: Record<string, unknown>) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/ordenes/${ordenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al actualizar la orden.')
        return
      }
      router.refresh()
    } catch {
      setError('Error de red. Intentá de nuevo.')
    } finally {
      setLoading(false)
      setConfirmar(null)
    }
  }

  if (estado === 'PENDIENTE') {
    return (
      <div className="space-y-4">
        {confirmar ? (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 space-y-3">
            <p className="text-sm font-medium text-yellow-800">
              {confirmar === 'aceptar'
                ? '¿Confirmás que aceptás esta orden de manufactura?'
                : '¿Confirmás que rechazás esta orden? La marca podrá asignarla a otro taller.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  actualizarOrden({ estado: confirmar === 'aceptar' ? 'EN_EJECUCION' : 'CANCELADO' })
                }
                disabled={loading}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-colors ${
                  confirmar === 'aceptar'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Procesando...' : confirmar === 'aceptar' ? 'Sí, aceptar' : 'Sí, rechazar'}
              </button>
              <button
                onClick={() => setConfirmar(null)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmar('aceptar')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              ✓ Aceptar orden
            </button>
            <button
              onClick={() => setConfirmar('rechazar')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              ✗ Rechazar orden
            </button>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  if (estado === 'EN_EJECUCION') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actualizar progreso: <span className="font-bold text-brand-blue">{progreso}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={progreso}
            onChange={(e) => setProgreso(Number(e.target.value))}
            className="w-full accent-brand-blue"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => actualizarOrden({ progreso })}
            disabled={loading || progreso === progresoActual}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-blue hover:bg-blue-800 rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar progreso'}
          </button>
          {progreso < 100 && (
            <button
              onClick={() => actualizarOrden({ progreso: 100 })}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              Marcar como completado
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  return null
}
