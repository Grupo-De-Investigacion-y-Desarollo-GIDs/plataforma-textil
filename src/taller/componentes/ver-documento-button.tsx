'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { Button } from '@/compartido/componentes/ui/button'

interface Props {
  validacionId: string
  fileName: string
}

export function VerDocumentoButton({ validacionId, fileName }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch(`/api/validaciones/${validacionId}/signed-url`)
      if (res.ok) {
        const { url } = await res.json()
        window.open(url, '_blank')
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      icon={loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
      onClick={handleClick}
      disabled={loading}
    >
      {fileName}
    </Button>
  )
}
