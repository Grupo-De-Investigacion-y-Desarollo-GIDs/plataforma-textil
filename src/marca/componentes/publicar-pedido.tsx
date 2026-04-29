'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { Button } from '@/compartido/componentes/ui/button'

export function PublicarPedido({ pedidoId }: { pedidoId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePublicar() {
    if (!confirm('Publicar este pedido? Los talleres compatibles podran verlo y cotizar.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'PUBLICADO' }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al publicar el pedido')
      }
    } catch {
      alert('Error de conexion')
    }
    setLoading(false)
  }

  return (
    <Button onClick={handlePublicar} loading={loading} icon={<Send className="w-4 h-4" />} data-action="publicar">
      Publicar pedido
    </Button>
  )
}
