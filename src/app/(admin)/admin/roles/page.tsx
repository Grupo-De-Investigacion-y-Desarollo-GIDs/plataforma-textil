'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Shield } from 'lucide-react'

interface Rol {
  id: string
  nombre: string
  descripcion: string
  permisos: string[]
  usuarios: number
  sistema: boolean
}

const todosPermisos = [
  'usuarios:ver', 'usuarios:crear', 'usuarios:editar', 'usuarios:eliminar',
  'talleres:ver', 'talleres:editar', 'talleres:validar',
  'marcas:ver', 'marcas:editar', 'marcas:aprobar',
  'colecciones:ver', 'colecciones:crear', 'colecciones:editar',
  'certificados:ver', 'certificados:revocar',
  'auditorias:ver', 'auditorias:crear', 'auditorias:informe',
  'reportes:ver', 'reportes:exportar',
  'config:ver', 'config:editar',
  'logs:ver',
]

const mockRoles: Rol[] = [
  { id: '1', nombre: 'ADMIN', descripcion: 'Acceso total al sistema', permisos: todosPermisos, usuarios: 2, sistema: true },
  { id: '2', nombre: 'ESTADO', descripcion: 'Acceso a reportes y estadísticas', permisos: ['talleres:ver', 'marcas:ver', 'reportes:ver', 'reportes:exportar', 'auditorias:ver'], usuarios: 3, sistema: true },
  { id: '3', nombre: 'AUDITOR', descripcion: 'Gestión de auditorías', permisos: ['talleres:ver', 'auditorias:ver', 'auditorias:crear', 'auditorias:informe'], usuarios: 2, sistema: false },
]

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Rol[]>(mockRoles)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Rol | null>(null)

  function handleEdit(r: Rol) {
    setEditando({ ...r })
    setModalOpen(true)
  }

  function handleNew() {
    setEditando({ id: '', nombre: '', descripcion: '', permisos: [], usuarios: 0, sistema: false })
    setModalOpen(true)
  }

  function togglePermiso(permiso: string) {
    if (!editando) return
    const permisos = editando.permisos.includes(permiso)
      ? editando.permisos.filter(p => p !== permiso)
      : [...editando.permisos, permiso]
    setEditando({ ...editando, permisos })
  }

  function handleSave() {
    if (!editando) return
    if (editando.id) {
      setRoles(roles.map(r => r.id === editando.id ? editando : r))
    } else {
      setRoles([...roles, { ...editando, id: String(Date.now()) }])
    }
    setModalOpen(false)
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Roles y Permisos</h1>
          <p className="text-gray-500 text-sm">Configurá los niveles de acceso</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={handleNew}>Nuevo Rol</Button>
      </div>

      <div className="space-y-3">
        {roles.map(r => (
          <Card key={r.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-blue" />
                  <h2 className="font-overpass font-bold text-brand-blue">{r.nombre}</h2>
                  {r.sistema && <Badge variant="default">Sistema</Badge>}
                </div>
                <p className="text-sm text-gray-500 mt-1">{r.descripcion}</p>
                <p className="text-xs text-gray-400 mt-1">{r.permisos.length} permisos | {r.usuarios} usuarios</p>
              </div>
              <Button size="sm" variant="secondary" icon={<Edit className="w-3 h-3" />} onClick={() => handleEdit(r)}>
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando?.id ? 'Editar Rol' : 'Nuevo Rol'} size="lg">
        {editando && (
          <div className="space-y-4">
            <Input label="Nombre del rol *" value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })}
              disabled={editando.sistema} />
            <Input label="Descripción" value={editando.descripcion} onChange={e => setEditando({ ...editando, descripcion: e.target.value })} />

            <h3 className="font-overpass font-bold text-brand-blue text-sm">Permisos</h3>
            <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto">
              {todosPermisos.map(p => (
                <label key={p} className="flex items-center gap-2 cursor-pointer py-0.5">
                  <input type="checkbox" checked={editando.permisos.includes(p)} onChange={() => togglePermiso(p)} className="rounded" />
                  <span className="text-xs">{p}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
