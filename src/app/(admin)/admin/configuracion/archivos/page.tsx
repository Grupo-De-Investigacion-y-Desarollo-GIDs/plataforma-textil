'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Modal } from '@/compartido/componentes/ui/modal'

interface ConfigUpload {
  id: string
  contexto: string
  nombre: string
  descripcion: string | null
  tiposPermitidos: string[]
  tamanoMaximoMB: number
  activo: boolean
}

const TIPOS_DISPONIBLES = [
  { id: 'pdf', label: 'PDF', icon: '📄' },
  { id: 'jpeg', label: 'JPEG', icon: '🖼️' },
  { id: 'png', label: 'PNG', icon: '🖼️' },
  { id: 'webp', label: 'WebP', icon: '🖼️' },
  { id: 'xlsx', label: 'Excel', icon: '📊' },
  { id: 'docx', label: 'Word', icon: '📝' },
  { id: 'mp4', label: 'MP4', icon: '🎬' },
  { id: 'mov', label: 'MOV', icon: '🎬' },
]

export default function AdminConfiguracionArchivosPage() {
  const [configs, setConfigs] = useState<ConfigUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<ConfigUpload | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // Estado del modal de edicion
  const [editTipos, setEditTipos] = useState<string[]>([])
  const [editTamano, setEditTamano] = useState(5)
  const [editActivo, setEditActivo] = useState(true)

  useEffect(() => {
    fetch('/api/admin/configuracion-upload')
      .then(r => r.json())
      .then(data => setConfigs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function abrirEdicion(config: ConfigUpload) {
    setEditando(config)
    setEditTipos([...config.tiposPermitidos])
    setEditTamano(config.tamanoMaximoMB)
    setEditActivo(config.activo)
  }

  async function guardar() {
    if (!editando || editTipos.length === 0) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/configuracion-upload/${editando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiposPermitidos: editTipos,
          tamanoMaximoMB: editTamano,
          activo: editActivo,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setToast(data.error || 'Error al guardar')
        return
      }
      const updated = await res.json()
      setConfigs(prev => prev.map(c => c.id === updated.id ? updated : c))
      setEditando(null)
      setToast('Configuracion guardada')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  function toggleTipo(tipo: string) {
    setEditTipos(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-1">
        <a href="/admin/configuracion" className="text-brand-blue hover:underline text-sm">&larr; Configuracion</a>
      </div>
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Configuracion de Archivos</h1>
      <p className="text-gray-500 text-sm mb-6">Define que tipos de archivo y tamano maximo se aceptan en cada contexto de la plataforma</p>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && configs.length === 0 && (
        <Card>
          <p className="text-gray-500 text-sm">No hay configuraciones de upload. Ejecuta el seed para crearlas.</p>
        </Card>
      )}

      {!loading && configs.map(config => (
        <Card key={config.id} className="mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-overpass font-bold text-brand-blue">{config.nombre}</h3>
                <Badge variant={config.activo ? 'success' : 'muted'}>
                  {config.activo ? 'Activo' : 'Desactivado'}
                </Badge>
              </div>
              {config.descripcion && (
                <p className="text-xs text-gray-500 mb-2">{config.descripcion}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Contexto: <code className="bg-gray-100 px-1 rounded text-xs">{config.contexto}</code></span>
                <span>Max: {config.tamanoMaximoMB} MB</span>
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {config.tiposPermitidos.map(tipo => (
                  <Badge key={tipo} variant="default">{tipo.toUpperCase()}</Badge>
                ))}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => abrirEdicion(config)}>
              Editar
            </Button>
          </div>
        </Card>
      ))}

      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}

      <Modal open={!!editando} onClose={() => setEditando(null)} title={`Editar: ${editando?.nombre ?? ''}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipos de archivo permitidos</label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_DISPONIBLES.map(tipo => (
                <label key={tipo.id} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={editTipos.includes(tipo.id)}
                    onChange={() => toggleTipo(tipo.id)}
                    className="rounded accent-[var(--color-brand-blue)]"
                  />
                  <span className="text-sm">{tipo.icon} {tipo.label}</span>
                </label>
              ))}
            </div>
            {editTipos.length === 0 && (
              <p className="text-red-500 text-xs mt-1">Debe haber al menos un tipo permitido</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tamano maximo (MB)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={editTamano}
              onChange={e => setEditTamano(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editActivo}
                onChange={e => setEditActivo(e.target.checked)}
                className="rounded accent-[var(--color-brand-blue)]"
              />
              <span className="text-sm font-medium text-gray-700">Contexto activo</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">Si se desactiva, no se podran subir archivos en este contexto</p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button onClick={guardar} disabled={saving || editTipos.length === 0}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
