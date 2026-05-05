'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getErrorMessage, getErrorCode } from '@/compartido/lib/api-client'
import { useToast } from '@/compartido/componentes/ui/toast'

export function AceptarCotizacion({ cotizacionId }: { cotizacionId: string }) {
  const router = useRouter()
  const { toast } = useToast()
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
        const code = getErrorCode(data)
        if (code === 'CONFLICT') {
          toast({ mensaje: 'Esta cotizacion ya fue procesada', tipo: 'warning', description: 'Recarga la pagina para ver el estado actualizado.' })
        } else {
          setError(getErrorMessage(data, 'Error al aceptar'))
        }
        return
      }
      toast('Cotizacion aceptada', 'success')
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
        <button onClick={handleAceptar} disabled={loading} data-action="confirmar-aceptacion"
          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Aceptando...' : 'Confirmar'}
        </button>
        <button onClick={() => setConfirmar(false)} className="text-xs text-gray-500 hover:underline">Cancelar</button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  return (
    <button onClick={() => setConfirmar(true)} data-action="aceptar-cotizacion"
      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700">
      Aceptar
    </button>
  )
}
