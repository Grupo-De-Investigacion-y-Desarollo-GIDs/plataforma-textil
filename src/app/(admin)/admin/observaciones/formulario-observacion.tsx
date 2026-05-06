'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/compartido/componentes/ui/button'
import { useToast } from '@/compartido/componentes/ui/toast'
import { Star } from 'lucide-react'

const TIPOS = [
  { value: 'RESISTENCIA', label: 'Resistencia' },
  { value: 'EXPECTATIVA', label: 'Expectativa' },
  { value: 'DIFICULTAD_TECNICA', label: 'Dificultad tecnica' },
  { value: 'DIFICULTAD_PROCESO', label: 'Dificultad de proceso' },
  { value: 'OPORTUNIDAD', label: 'Oportunidad' },
  { value: 'EXITO', label: 'Exito' },
  { value: 'CONTEXTO_TALLER', label: 'Contexto taller' },
  { value: 'CONTEXTO_MARCA', label: 'Contexto marca' },
  { value: 'POLITICA_PUBLICA', label: 'Politica publica' },
]

const FUENTES = [
  { value: 'VISITA', label: 'Visita presencial' },
  { value: 'LLAMADA', label: 'Llamada telefonica' },
  { value: 'WHATSAPP', label: 'Chat WhatsApp' },
  { value: 'PLATAFORMA', label: 'Observado en plataforma' },
  { value: 'ENTREVISTA', label: 'Entrevista estructurada' },
  { value: 'OTROS', label: 'Otros' },
]

const TAGS_SUGERIDOS = [
  'cultural', 'fiscal', 'tecnico', 'proceso', 'positivo', 'negativo',
  'urgente', 'politica-publica', 'engagement', 'capacitacion', 'comercial',
]

interface Usuario {
  id: string
  name: string | null
  email: string
  role: string
}

interface ObservacionData {
  id?: string
  userId?: string | null
  tipo: string
  fuente: string
  sentimiento?: string | null
  importancia: number
  titulo: string
  contenido: string
  tags: string[]
  fechaEvento: string
  ubicacion?: string | null
}

interface Props {
  initial?: ObservacionData
  observacionId?: string
}

export function FormularioObservacion({ initial, observacionId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!observacionId

  const [userId, setUserId] = useState(initial?.userId ?? '')
  const [tipo, setTipo] = useState(initial?.tipo ?? 'RESISTENCIA')
  const [fuente, setFuente] = useState(initial?.fuente ?? 'VISITA')
  const [sentimiento, setSentimiento] = useState<string>(initial?.sentimiento ?? 'NEUTRAL')
  const [importancia, setImportancia] = useState(initial?.importancia ?? 3)
  const [titulo, setTitulo] = useState(initial?.titulo ?? '')
  const [contenido, setContenido] = useState(initial?.contenido ?? '')
  const [tagsInput, setTagsInput] = useState(initial?.tags?.join(', ') ?? '')
  const [fechaEvento, setFechaEvento] = useState(
    initial?.fechaEvento
      ? new Date(initial.fechaEvento).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  )
  const [ubicacion, setUbicacion] = useState(initial?.ubicacion ?? '')
  const [saving, setSaving] = useState(false)

  // User search
  const [userQuery, setUserQuery] = useState('')
  const [userResults, setUserResults] = useState<Usuario[]>([])
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  useEffect(() => {
    if (!userQuery || userQuery.length < 2) {
      setUserResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/usuarios-buscar?q=${encodeURIComponent(userQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setUserResults(data.usuarios ?? [])
        }
      } catch { /* ignore */ }
    }, 300)
    return () => clearTimeout(timer)
  }, [userQuery])

  // Load selected user name on edit
  useEffect(() => {
    if (initial?.userId && !selectedUser) {
      fetch(`/api/admin/usuarios-buscar?id=${initial.userId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.usuarios?.[0]) setSelectedUser(data.usuarios[0])
        })
        .catch(() => {})
    }
  }, [initial?.userId, selectedUser])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !contenido.trim()) {
      toast('Titulo y contenido son obligatorios', 'error')
      return
    }

    setSaving(true)
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)

      const body = {
        userId: userId || undefined,
        tipo,
        fuente,
        sentimiento: sentimiento || undefined,
        importancia,
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        tags,
        fechaEvento,
        ubicacion: ubicacion.trim() || undefined,
      }

      const url = isEditing
        ? `/api/admin/observaciones/${observacionId}`
        : '/api/admin/observaciones'

      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error?.message ?? 'Error al guardar')
      }

      toast(isEditing ? 'Observacion actualizada' : 'Observacion registrada', 'success')
      router.push('/admin/observaciones')
      router.refresh()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-3xl">
      {/* Usuario asociado */}
      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">
          Sobre quien (opcional)
        </label>
        {selectedUser ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-800">
              {selectedUser.name ?? selectedUser.email} ({selectedUser.role})
            </span>
            <button
              type="button"
              onClick={() => { setSelectedUser(null); setUserId(''); setUserQuery('') }}
              className="text-xs text-red-500 hover:underline"
            >
              Quitar
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={userQuery}
              onChange={e => { setUserQuery(e.target.value); setShowUserDropdown(true) }}
              onFocus={() => setShowUserDropdown(true)}
              placeholder="Buscar usuario por nombre o email..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {showUserDropdown && userResults.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {userResults.map(u => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(u)
                        setUserId(u.id)
                        setShowUserDropdown(false)
                        setUserQuery('')
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <span className="font-medium">{u.name ?? 'Sin nombre'}</span>
                      <span className="text-gray-400 ml-2">{u.email}</span>
                      <span className="text-xs text-gray-400 ml-2">({u.role})</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Tipo + Fuente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">Tipo *</label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {TIPOS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">Fuente *</label>
          <select
            value={fuente}
            onChange={e => setFuente(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {FUENTES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sentimiento + Importancia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">Sentimiento</label>
          <div className="flex gap-4 mt-1">
            {(['POSITIVO', 'NEUTRAL', 'NEGATIVO'] as const).map(s => (
              <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="sentimiento"
                  value={s}
                  checked={sentimiento === s}
                  onChange={() => setSentimiento(s)}
                  className="accent-brand-blue"
                />
                {s === 'POSITIVO' ? 'Positivo' : s === 'NEUTRAL' ? 'Neutral' : 'Negativo'}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">
            Importancia (1-5)
          </label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setImportancia(n)}
                className="p-0.5"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    n <= importancia ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Titulo */}
      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">Titulo *</label>
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          maxLength={200}
          placeholder="Resumen breve de lo observado"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          required
        />
      </div>

      {/* Contenido */}
      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">Contenido *</label>
        <textarea
          value={contenido}
          onChange={e => setContenido(e.target.value)}
          rows={6}
          placeholder="Describi lo observado con detalle. Inclui citas literales si es relevante. Pensa en alguien leyendo esto en 3 meses."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
          required
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">
          Tags (separados por coma)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="cultural, fiscal, tecnico..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {TAGS_SUGERIDOS.map(tag => {
            const currentTags = tagsInput.split(',').map(t => t.trim().toLowerCase())
            const isActive = currentTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (isActive) {
                    setTagsInput(currentTags.filter(t => t !== tag).join(', '))
                  } else {
                    setTagsInput(
                      [...currentTags.filter(Boolean), tag].join(', ')
                    )
                  }
                }}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  isActive
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-blue/50'
                }`}
              >
                #{tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Fecha + Ubicacion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">
            Fecha del evento *
          </label>
          <input
            type="date"
            value={fechaEvento}
            onChange={e => setFechaEvento(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">
            Ubicacion (opcional)
          </label>
          <input
            type="text"
            value={ubicacion}
            onChange={e => setUbicacion(e.target.value)}
            placeholder="Provincia, localidad, taller fisico..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/observaciones')}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {isEditing ? 'Guardar cambios' : 'Registrar observacion'}
        </Button>
      </div>
    </form>
  )
}
