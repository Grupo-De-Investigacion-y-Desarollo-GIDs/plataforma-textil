'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadButtonProps {
  validacionId: string
  onSuccess?: () => void
}

export function UploadButton({ validacionId, onSuccess }: UploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/validaciones/${validacionId}/upload`, {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Error al subir')
      } else {
        onSuccess?.()
        // Force page refresh to show updated state
        window.location.reload()
      }
    } catch {
      setError('Error de conexión')
    }
    setUploading(false)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleUpload}
        className="hidden"
      />
      <Button
        size="sm"
        variant="secondary"
        icon={uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Subiendo...' : 'Subir documento'}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
