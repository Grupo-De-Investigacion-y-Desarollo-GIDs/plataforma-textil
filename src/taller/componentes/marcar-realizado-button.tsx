'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/compartido/componentes/ui/button'
import { useToast } from '@/compartido/componentes/ui/toast'

interface Props {
  validacionId: string
}

export function MarcarRealizadoButton({ validacionId }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch(`/api/validaciones/${validacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marcarRealizado: true }),
      })
      if (res.ok) {
        toast('Marcado como realizado. Queda pendiente de verificacion.')
        setTimeout(() => window.location.reload(), 1200)
      }
    } catch {
      // silently fail
    }
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      icon={loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Guardando...' : 'Ya lo hice'}
    </Button>
  )
}
