'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Input } from '@/compartido/componentes/ui/input'
import { Modal } from '@/compartido/componentes/ui/modal'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Plus, Edit } from 'lucide-react'

interface TipoDocumento {
  id: string
  nombre: string
  descripcion: string | null
  requerido: boolean
  activo: boolean
  puntosOtorgados: number
  nivelMinimo: string
}

export default function EstadoDocumentosPage() {
  const [docs, setDocs] = useState<TipoDocumento[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState<{ id: string; nombre: string; label: string; descripcion: string; requerido: boolean; activo: boolean; puntosOtorgados: number; nivelMinimo: string } | null>(null)

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch('/api/tipos-documento')
      if (res.ok) setDocs(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const obligatorios = docs.filter(d => d.requerido)
  const opcionales = docs.filter(d => !d.requerido)

  function handleEdit(d: TipoDocumento) {
    setEditando({ id: d.id, nombre: d.nombre, label: '', descripcion: d.descripcion ?? '', requerido: d.requerido, activo: d.activo, puntosOtorgados: d.puntosOtorgados, nivelMinimo: d.nivelMinimo })
    setError('')
    setModalOpen(true)
  }

  function handleNew() {
    setEditando({ id: '', nombre: '', label: '', descripcion: '', requerido: true, activo: true, puntosOtorgados: 10, nivelMinimo: 'BRONCE' })
    setError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!editando || !editando.nombre.trim()) return
    setSaving(true)
    setError('')
    try {
      const method = editando.id ? 'PUT' : 'POST'
      const res = await fetch('/api/tipos-documento', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editando),
      })
      if (!res.ok) {
        const data = await res.json()
        if (data.code === 'INSUFFICIENT_ROLE') {
          setError('Solo el rol ESTADO puede gestionar tipos de documento')
        } else {
          setError(data.error || 'Error al guardar')
        }
        return
      }
      setModalOpen(false)
      fetchDocs()
    } finally {
      setSaving(false)
    }
  }

  function renderList(title: string, items: TipoDocumento[]) {
    return (
      <div className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-2">{title}</h2>
        <Card>
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">Sin documentos en esta categoria.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{doc.nombre}</p>
                      <Badge variant="muted">{doc.puntosOtorgados} pts</Badge>
                      <Badge variant="default">{doc.nivelMinimo}</Badge>
                      {!doc.activo && <Badge variant="warning">Inactivo</Badge>}
                    </div>
                    {doc.descripcion && (
                      <p className="text-xs text-gray-400">{doc.descripcion}</p>
                    )}
                  </div>
                  <button onClick={() => handleEdit(doc)} className="p-1 hover:bg-gray-100 rounded shrink-0">
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Tipos de Documento</h1>
          <p className="text-gray-500 text-sm">Requisitos de formalizacion por nivel — configuracion regulatoria del Estado</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={handleNew}>Nuevo Requisito</Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-8">Cargando...</p>
      ) : (
        <>
          {renderList(`Obligatorios (${obligatorios.length})`, obligatorios)}
          {renderList(`Opcionales (${opcionales.length})`, opcionales)}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando?.id ? 'Editar Requisito' : 'Nuevo Requisito'}>
        {editando && (
          <div className="space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <Input label="Nombre del requisito *" value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} />
            {!editando.id && (
              <Input label="Label (frase para el checklist) *" value={editando.label} onChange={e => setEditando({ ...editando, label: e.target.value })} placeholder="Ej: Registrate en ARCA" />
            )}
            {!editando.id && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nivel minimo</label>
                <select value={editando.nivelMinimo} onChange={e => setEditando({ ...editando, nivelMinimo: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent">
                  <option value="BRONCE">Bronce</option>
                  <option value="PLATA">Plata</option>
                  <option value="ORO">Oro</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripcion</label>
              <textarea value={editando.descripcion} onChange={e => setEditando({ ...editando, descripcion: e.target.value })} rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Puntos otorgados</label>
              <input type="number" min={0} max={100} value={editando.puntosOtorgados} onChange={e => setEditando({ ...editando, puntosOtorgados: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
              <p className="text-xs text-gray-400 mt-1">Puntos que suma el taller al completar este documento</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editando.requerido} onChange={e => setEditando({ ...editando, requerido: e.target.checked })} className="rounded" />
              <span className="text-sm">Obligatorio para formalizacion</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editando.activo} onChange={e => setEditando({ ...editando, activo: e.target.checked })} className="rounded" />
              <span className="text-sm">Activo (visible en el checklist)</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !editando.nombre.trim()}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
