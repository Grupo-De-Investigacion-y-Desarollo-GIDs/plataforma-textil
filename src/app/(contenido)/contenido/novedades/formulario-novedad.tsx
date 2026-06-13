'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/compartido/componentes/ui/modal'

interface NovedadData {
  id: string
  tipo: 'NOTICIA' | 'CASO' | 'INDICADOR'
  titulo: string
  descripcion: string
  imagenUrl: string | null
  fecha: Date | string
}

interface Props {
  novedad?: NovedadData
}

const TIPO_OPTIONS = [
  { value: 'NOTICIA', label: 'Noticia' },
  { value: 'CASO', label: 'Caso de éxito' },
  { value: 'INDICADOR', label: 'Indicador' },
] as const

export function FormularioNovedad({ novedad }: Props) {
  const router = useRouter()
  const isEdit = !!novedad

  const [tipo, setTipo] = useState(novedad?.tipo ?? 'NOTICIA')
  const [titulo, setTitulo] = useState(novedad?.titulo ?? '')
  const [descripcion, setDescripcion] = useState(novedad?.descripcion ?? '')
  const [imagenUrl, setImagenUrl] = useState<string | null>(novedad?.imagenUrl ?? null)
  const [fecha, setFecha] = useState(() => {
    if (novedad?.fecha) {
      const d = new Date(novedad.fecha)
      return d.toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/contenido/novedades/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error subiendo imagen')
      }

      const { url } = await res.json()
      setImagenUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEdit
        ? `/api/contenido/novedades/${novedad.id}`
        : '/api/contenido/novedades'

      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, titulo, descripcion, imagenUrl, fecha }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error guardando')
      }

      router.push('/contenido/novedades')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit) return
    setLoading(true)

    try {
      const res = await fetch(`/api/contenido/novedades/${novedad.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Error eliminando')

      router.push('/contenido/novedades')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tipo */}
      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">
          Tipo <span className="text-red-500">*</span>
        </label>
        <select
          value={tipo}
          onChange={e => setTipo(e.target.value as typeof tipo)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
          required
        >
          {TIPO_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
          placeholder="Ej: Convenio firmado con OIT para piloto sectorial"
          required
        />
        <p className="text-xs text-gray-400 mt-1">{titulo.length}/200 caracteres</p>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          maxLength={2000}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue resize-y"
          placeholder="Descripción de la novedad..."
          required
        />
        <p className="text-xs text-gray-400 mt-1">{descripcion.length}/2000 caracteres</p>
      </div>

      {/* Imagen */}
      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">
          Imagen
        </label>
        {imagenUrl ? (
          <div className="space-y-2">
            <img src={imagenUrl} alt="" className="max-w-xs h-40 object-cover rounded-lg border border-gray-200" />
            <button
              type="button"
              onClick={() => setImagenUrl(null)}
              className="text-sm text-red-600 hover:text-red-800 font-overpass font-medium"
            >
              Quitar imagen
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) await handleUpload(file)
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-overpass file:font-semibold file:bg-pastel-blue file:text-brand-blue hover:file:bg-pastel-blue"
            />
            {uploading && (
              <p className="text-sm text-brand-blue animate-pulse">Subiendo imagen...</p>
            )}
            <p className="text-xs text-gray-400">JPEG, PNG o WebP. Máximo 5MB.</p>
          </div>
        )}
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">
          Fecha de publicación
        </label>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-5 py-2.5 bg-brand-blue text-white rounded-lg font-overpass font-semibold text-sm hover:bg-brand-blue-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear novedad'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/contenido/novedades')}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-overpass font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>

        {isEdit && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="text-sm text-red-600 hover:text-red-800 font-overpass font-medium"
          >
            Eliminar novedad
          </button>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar novedad"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          ¿Estás seguro de que querés eliminar esta novedad? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-overpass font-semibold text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-overpass font-medium text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </form>
  )
}
