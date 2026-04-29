'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getErrorMessage } from '@/compartido/lib/api-client'

export function RechazarCotizacion({ cotizacionId }: { cotizacionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [error, setError] = useState('')

  async function handleRechazar() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'RECHAZAR' }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(getErrorMessage(data, 'Error al rechazar'))
        return
      }
      router.refresh()
    } catch {
      setError('Error de conexion')
    } finally {
      setLoading(false)
      setConfirmar(false)
    }
  }

  if (confirmar) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={handleRechazar} disabled={loading}
          className="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50">
          {loading ? 'Rechazando...' : 'Confirmar'}
        </button>
        <button onClick={() => setConfirmar(false)} className="text-xs text-gray-500 hover:underline">Cancelar</button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  return (
    <button onClick={() => setConfirmar(true)}
      className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50">
      Rechazar
    </button>
  )
}
