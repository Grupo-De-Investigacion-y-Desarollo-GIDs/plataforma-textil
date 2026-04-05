'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AceptarCotizacion({ cotizacionId }: { cotizacionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [error, setError] = useState('')

  async function handleAceptar() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'ACEPTAR' }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al aceptar')
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
        <button onClick={handleAceptar} disabled={loading}
          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Aceptando...' : 'Confirmar'}
        </button>
        <button onClick={() => setConfirmar(false)} className="text-xs text-gray-500 hover:underline">Cancelar</button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  return (
    <button onClick={() => setConfirmar(true)}
      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700">
      Aceptar
    </button>
  )
}
