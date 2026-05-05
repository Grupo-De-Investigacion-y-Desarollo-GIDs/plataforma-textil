'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { Button } from '@/compartido/componentes/ui/button'
import { getErrorMessage } from '@/compartido/lib/api-client'
import { useToast } from '@/compartido/componentes/ui/toast'

export function PublicarPedido({ pedidoId }: { pedidoId: string }) {
  const router = useRouter()
  const { toast } = useToast()
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
        toast('Pedido publicado', 'success')
        router.refresh()
      } else {
        const data = await res.json()
        toast(getErrorMessage(data, 'Error al publicar el pedido'), 'error')
      }
    } catch {
      toast('Error de conexion', 'error')
    }
    setLoading(false)
  }

  return (
    <Button onClick={handlePublicar} loading={loading} icon={<Send className="w-4 h-4" />} data-action="publicar">
      Publicar pedido
    </Button>
  )
}
