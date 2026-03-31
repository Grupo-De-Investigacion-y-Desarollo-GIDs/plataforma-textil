'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Trash2, Plus, CheckCircle, AlertCircle } from 'lucide-react'

const categorias = ['Formalización', 'Costos', 'Calidad', 'Plataforma', 'Otro']
const instituciones = ['OIT', 'INTI', 'FACTA', 'OIT + INTI', 'PDT']

interface Video {
  id: string
  titulo: string
  youtubeUrl: string
  duracion: string | null
  orden: number
}

export default function AdminEditarColeccionPage() {
  const params = useParams()
  const router = useRouter()
  const coleccionId = params.id as string

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [institucion, setInstitucion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [duracion, setDuracion] = useState('')
  const [activa, setActiva] = useState(false)
  const [videos, setVideos] = useState<Video[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/colecciones/${coleccionId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        setTitulo(data.titulo ?? '')
        setDescripcion(data.descripcion ?? '')
        setInstitucion(data.institucion ?? '')
        setCategoria(data.categoria ?? '')
        setDuracion(data.duracion ?? '')
        setActiva(data.activa ?? false)
        setVideos(data.videos ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [coleccionId])

  async function handleSave() {
    if (!titulo.trim()) { setMsg({ type: 'error', text: 'El título es obligatorio' }); return }
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/colecciones/${coleccionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion, institucion, categoria, duracion, activa }),
      })
      if (res.ok) {
        setMsg({ type: 'ok', text: 'Colección guardada correctamente' })
      } else {
        const body = await res.json()
        setMsg({ type: 'error', text: body.error || 'Error al guardar' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Error de conexión' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteVideo(videoId: string) {
    if (!confirm('¿Eliminar este video?')) return
    setDeletingId(videoId)
    try {
      const res = await fetch(`/api/colecciones/${coleccionId}/videos?videoId=${videoId}`, { method: 'DELETE' })
      if (res.ok) {
        setVideos(prev => prev.filter(v => v.id !== videoId))
      }
    } catch {
      // silencioso
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="h-8 bg-gray-200 rounded w-60" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link href="/admin/colecciones" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a colecciones
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-overpass font-bold text-2xl text-brand-blue">Editar Colección</h1>
        <Badge variant={activa ? 'success' : 'default'}>{activa ? 'Publicada' : 'Borrador'}</Badge>
      </div>

      {msg && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${msg.type === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {msg.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Información Básica</h2>
        <div className="space-y-4">
          <Input label="Título de la colección *" value={titulo} onChange={e => setTitulo(e.target.value)} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Institución que avala"
              value={institucion}
              onChange={e => setInstitucion(e.target.value)}
              options={[{ value: '', label: 'Sin institución' }, ...instituciones.map(i => ({ value: i, label: i }))]}
            />
            <Select
              label="Categoría"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              options={[{ value: '', label: 'Sin categoría' }, ...categorias.map(c => ({ value: c, label: c }))]}
            />
          </div>
          <Input label="Duración estimada" placeholder="Ej: 2 horas" value={duracion} onChange={e => setDuracion(e.target.value)} />
        </div>
      </Card>

      {/* Videos */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-overpass font-bold text-brand-blue">Videos ({videos.length})</h2>
          <Link href={`/admin/colecciones/${coleccionId}/videos`}>
            <Button size="sm" variant="secondary" icon={<Plus className="w-3.5 h-3.5" />}>Agregar video</Button>
          </Link>
        </div>
        {videos.length === 0 ? (
          <p className="text-sm text-gray-500">Sin videos aún. Agregá el primero.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {videos.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 py-2.5">
                <span className="text-xs text-gray-400 w-5 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{v.titulo}</p>
                  <p className="text-xs text-gray-400 truncate">{v.youtubeUrl}</p>
                </div>
                {v.duracion && <span className="text-xs text-gray-400 shrink-0">{v.duracion}</span>}
                <button
                  onClick={() => handleDeleteVideo(v.id)}
                  disabled={deletingId === v.id}
                  className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Estado */}
      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Estado de publicación</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={!activa} onChange={() => setActiva(false)} className="accent-[var(--color-brand-blue)]" />
            <span className="text-sm">Borrador (oculto para talleres)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={activa} onChange={() => setActiva(true)} className="accent-[var(--color-brand-blue)]" />
            <span className="text-sm">Publicada (visible para talleres)</span>
          </label>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Button variant="secondary" onClick={() => router.push('/admin/colecciones')}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
