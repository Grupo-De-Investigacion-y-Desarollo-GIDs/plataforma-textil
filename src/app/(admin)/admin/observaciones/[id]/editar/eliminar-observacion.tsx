'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/compartido/componentes/ui/button'
import { useToast } from '@/compartido/componentes/ui/toast'
import { Trash2 } from 'lucide-react'

export function EliminarObservacion({ observacionId }: { observacionId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/observaciones/${observacionId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error?.message ?? 'Error al eliminar')
      }
      toast('Observacion eliminada', 'success')
      router.push('/admin/observaciones')
      router.refresh()
    } catch (err) {
      toast((err as Error).message, 'error')
      setDeleting(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Confirmar eliminacion?</span>
        <Button size="sm" variant="danger" loading={deleting} onClick={handleDelete}>
          Si, eliminar
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setConfirming(false)}>
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="danger"
      icon={<Trash2 className="w-4 h-4" />}
      onClick={() => setConfirming(true)}
    >
      Eliminar
    </Button>
  )
}
