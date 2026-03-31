'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

function getYoutubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)
  return match ? match[1] : null
}

export default function AdminAgregarVideoPage() {
  const params = useParams()
  const router = useRouter()
  const coleccionId = params.id as string

  const [url, setUrl] = useState('')
  const [titulo, setTitulo] = useState('')
  const [duracion, setDuracion] = useState('')
  const [checks, setChecks] = useState({ preciso: false, audio: false, noPublicidad: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const videoId = getYoutubeId(url)
  const urlValida = !!videoId

  async function handleSubmit() {
    if (!titulo.trim()) { setError('El título es obligatorio'); return }
    if (!urlValida) { setError('URL de YouTube inválida'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/colecciones/${coleccionId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, youtubeUrl: url, duracion: duracion || null }),
      })
      if (res.ok) {
        router.push(`/admin/colecciones/${coleccionId}`)
      } else {
        const body = await res.json()
        setError(body.error || 'Error al guardar video')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link href={`/admin/colecciones/${coleccionId}`} className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a colección
      </Link>

      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-6">Agregar Video</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Paso 1: URL de YouTube</h2>
        <Input
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={e => { setUrl(e.target.value); setError('') }}
        />
        {url && !urlValida && (
          <p className="mt-1.5 text-xs text-red-500">URL de YouTube inválida</p>
        )}
        {urlValida && (
          <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> URL válida
          </p>
        )}
      </Card>

      {urlValida && videoId && (
        <Card className="mb-6">
          <h2 className="font-overpass font-bold text-brand-blue mb-3">Vista previa</h2>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Vista previa"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Paso 2: Información del video</h2>
        <div className="space-y-4">
          <Input
            label="Título en la plataforma *"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
          />
          <Input
            label="Duración estimada"
            placeholder="Ej: 12:35"
            value={duracion}
            onChange={e => setDuracion(e.target.value)}
          />
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Verificación de contenido</h2>
        <div className="space-y-2">
          {[
            { key: 'preciso' as const, label: 'Verifiqué que el contenido es preciso y actualizado' },
            { key: 'audio' as const, label: 'El audio es claro y comprensible' },
            { key: 'noPublicidad' as const, label: 'No contiene publicidad invasiva' },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checks[item.key]}
                onChange={e => setChecks({ ...checks, [item.key]: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={saving || !urlValida || !titulo.trim() || !checks.preciso || !checks.audio || !checks.noPublicidad}
          className="flex-1"
        >
          {saving ? 'Agregando...' : 'Agregar a la colección'}
        </Button>
        <Button variant="secondary" onClick={() => router.push(`/admin/colecciones/${coleccionId}`)}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
