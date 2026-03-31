'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SearchInput } from '@/components/ui/search-input'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit } from 'lucide-react'

interface Proceso {
  id: string
  nombre: string
  descripcion: string | null
  activo: boolean
  _count: { talleres: number }
}

export default function AdminProcesosPage() {
  const [procesos, setProcesos] = useState<Proceso[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState<{ id: string; nombre: string; descripcion: string; activo: boolean } | null>(null)

  const fetchProcesos = useCallback(async () => {
    try {
      const res = await fetch('/api/procesos')
      if (res.ok) setProcesos(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProcesos() }, [fetchProcesos])

  const filtered = procesos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(p: Proceso) {
    setEditando({ id: p.id, nombre: p.nombre, descripcion: p.descripcion ?? '', activo: p.activo })
    setError('')
    setModalOpen(true)
  }

  function handleNew() {
    setEditando({ id: '', nombre: '', descripcion: '', activo: true })
    setError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!editando || !editando.nombre.trim()) return
    setSaving(true)
    setError('')
    try {
      const method = editando.id ? 'PUT' : 'POST'
      const res = await fetch('/api/procesos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editando),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al guardar')
        return
      }
      setModalOpen(false)
      fetchProcesos()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { header: 'Proceso', accessor: (row: Proceso) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.nombre}</span>
        {!row.activo && <Badge variant="muted">Inactivo</Badge>}
      </div>
    )},
    { header: 'Descripcion', accessor: (row: Proceso) => (
      <span className="text-gray-500">{row.descripcion || '-'}</span>
    )},
    { header: 'Talleres', accessor: (row: Proceso) => String(row._count.talleres), sortable: false },
    { header: 'Acciones', accessor: (row: Proceso) => (
      <button onClick={() => handleEdit(row)} className="p-1 hover:bg-gray-100 rounded">
        <Edit className="w-4 h-4 text-gray-500" />
      </button>
    )},
  ]

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Procesos Productivos</h1>
          <p className="text-gray-500 text-sm">Tags que los talleres usan para indicar sus capacidades</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={handleNew}>Nuevo Proceso</Button>
      </div>

      <SearchInput onChange={setSearch} placeholder="Buscar proceso..." className="mb-4" />

      <Card>
        {loading ? (
          <p className="text-sm text-gray-500 py-4 text-center">Cargando...</p>
        ) : procesos.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No hay procesos registrados.</p>
        ) : (
          <DataTable columns={columns} data={filtered} />
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando?.id ? 'Editar Proceso' : 'Nuevo Proceso'}>
        {editando && (
          <div className="space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <Input label="Nombre del proceso *" value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} />
            <Input label="Descripcion" value={editando.descripcion} onChange={e => setEditando({ ...editando, descripcion: e.target.value })} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editando.activo} onChange={e => setEditando({ ...editando, activo: e.target.checked })} className="rounded" />
              <span className="text-sm">Proceso activo (visible en el directorio)</span>
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
