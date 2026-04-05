'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/compartido/componentes/ui/input'
import { Button } from '@/compartido/componentes/ui/button'
import { Send } from 'lucide-react'

export function CotizarForm({ pedidoId }: { pedidoId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [precio, setPrecio] = useState('')
  const [plazoDias, setPlazoDias] = useState('')
  const [proceso, setProceso] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId,
          precio: parseFloat(precio),
          plazoDias: parseInt(plazoDias),
          proceso,
          mensaje: mensaje || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(res.status === 409 ? 'Ya tenes una cotizacion activa para este pedido.' : (data.error || 'Error al enviar la cotizacion.'))
        setLoading(false)
        return
      }
      router.push('/taller/pedidos')
      router.refresh()
    } catch {
      setError('Error de conexion. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Precio ($)" type="number" min="1" step="0.01" placeholder="50000" value={precio} onChange={e => setPrecio(e.target.value)} required />
        <Input label="Plazo (dias)" type="number" min="1" placeholder="15" value={plazoDias} onChange={e => setPlazoDias(e.target.value)} required />
      </div>
      <Input label="Proceso" placeholder="Ej: Corte y confeccion de remeras" value={proceso} onChange={e => setProceso(e.target.value)} required />
      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">Mensaje (opcional)</label>
        <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} placeholder="Detalle adicional sobre tu cotizacion..." rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
      </div>
      <Button type="submit" loading={loading} icon={<Send className="w-4 h-4" />} className="w-full">
        Enviar cotizacion
      </Button>
    </form>
  )
}
