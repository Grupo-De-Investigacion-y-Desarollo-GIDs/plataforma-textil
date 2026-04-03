'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'

interface CancelarPedidoProps {
  pedidoId: string
}

export function CancelarPedido({ pedidoId }: CancelarPedidoProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function cancelar() {
    if (!confirm('¿Estás seguro de cancelar este pedido? Las órdenes pendientes también se cancelarán.')) {
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'CANCELADO' }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al cancelar el pedido')
        return
      }
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={cancelar}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg font-overpass font-semibold bg-white border border-red-300 text-red-600 hover:bg-red-50 px-3 py-2 text-sm transition-colors disabled:opacity-50"
      >
        <XCircle className="w-4 h-4" />
        {loading ? 'Cancelando...' : 'Cancelar pedido'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
