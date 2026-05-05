'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Button } from '@/compartido/componentes/ui/button'
import { SearchInput } from '@/compartido/componentes/ui/search-input'
import { DataTable } from '@/compartido/componentes/ui/data-table'
import { Modal } from '@/compartido/componentes/ui/modal'
import { Select } from '@/compartido/componentes/ui/select'
import { StatCard } from '@/compartido/componentes/ui/stat-card'
import { Eye, Edit, UserX, MessageSquare } from 'lucide-react'
import { EditorMensajeIndividual } from '@/admin/componentes/editor-mensaje-individual'

interface Usuario {
  id: string
  name: string | null
  email: string
  role: string
  active: boolean
  createdAt: string
  phone: string | null
}

interface RegistroIncompleto {
  id: string
  name: string | null
  email: string
  createdAt: string
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [registrosIncompletos, setRegistrosIncompletos] = useState<RegistroIncompleto[]>([])
  const [search, setSearch] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [detalleModal, setDetalleModal] = useState<Usuario | null>(null)
  const [editModal, setEditModal] = useState<Usuario | null>(null)
  const [editRole, setEditRole] = useState('')
  const [confirmAction, setConfirmAction] = useState<{ user: Usuario; action: 'suspend' | 'resetPassword' } | null>(null)
  const [mensajeTarget, setMensajeTarget] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function refreshUsuarios() {
    fetch('/api/admin/usuarios').then(r => r.json())
      .then((d: { usuarios?: Usuario[] }) => setUsuarios(d.usuarios || []))
      .catch(() => {})
  }

  async function handleChangeRole() {
    if (!editModal || !editRole) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${editModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole }),
      })
      if (!res.ok) { showToast('Error al cambiar rol'); return }
      showToast(`Rol cambiado a ${editRole}`)
      setEditModal(null)
      setDetalleModal(null)
      refreshUsuarios()
    } finally { setSaving(false) }
  }

  async function handleSuspend(user: Usuario) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${user.id}`, { method: 'DELETE' })
      if (!res.ok) { showToast('Error al suspender cuenta'); return }
      showToast(`Cuenta de ${user.email} suspendida`)
      setConfirmAction(null)
      setDetalleModal(null)
      refreshUsuarios()
    } finally { setSaving(false) }
  }

  async function handleResetPassword(user: Usuario) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name }),
      })
      if (!res.ok) { showToast('Error al resetear'); return }
      showToast(`Se envio instrucciones de reset a ${user.email} (pendiente implementar email)`)
      setConfirmAction(null)
    } finally { setSaving(false) }
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/usuarios').then(r => r.json()).then((d: { usuarios?: Usuario[] }) => setUsuarios(d.usuarios || [])).catch(() => {}),
      fetch('/api/admin/usuarios?incompletos=true').then(r => r.json()).then((d: { usuarios?: RegistroIncompleto[] }) => setRegistrosIncompletos(d.usuarios || [])).catch(() => {})
    ]).finally(() => setLoading(false))
  }, [])

  const filtered = usuarios.filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRol = !filtroRol || u.role === filtroRol
    return matchSearch && matchRol
  })

  const totalTalleres = usuarios.filter(u => u.role === 'TALLER').length
  const totalMarcas = usuarios.filter(u => u.role === 'MARCA').length

  const columns = [
    { header: 'Usuario', accessor: (row: Usuario) => (
      <div>
        <p className="font-semibold">{row.name || 'Sin nombre'}</p>
        <p className="text-xs text-gray-400">{row.email}</p>
      </div>
    )},
    { header: 'Rol', accessor: (row: Usuario) => (
      <Badge variant={row.role === 'ADMIN' ? 'success' : 'default'}>{row.role}</Badge>
    )},
    { header: 'Estado', accessor: (row: Usuario) => (
      <Badge variant={row.active ? 'success' : 'warning'}>{row.active ? 'Activo' : 'Inactivo'}</Badge>
    )},
    { header: 'Registro', accessor: (row: Usuario) => new Date(row.createdAt).toLocaleDateString('es-AR'), sortable: true },
    { header: 'Acciones', accessor: (row: Usuario) => (
      <div className="flex gap-1">
        <button onClick={() => setDetalleModal(row)} className="p-1 hover:bg-gray-100 rounded" aria-label="Ver detalle"><Eye className="w-4 h-4 text-gray-500" /></button>
        <button onClick={() => { setEditModal(row); setEditRole(row.role) }} className="p-1 hover:bg-gray-100 rounded" aria-label="Editar"><Edit className="w-4 h-4 text-gray-500" /></button>
        <button onClick={() => setConfirmAction({ user: row, action: 'suspend' })} className="p-1 hover:bg-gray-100 rounded" aria-label="Desactivar usuario"><UserX className="w-4 h-4 text-gray-400" /></button>
      </div>
    )},
  ]

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Usuarios</h1>
      <p className="text-gray-500 text-sm mb-6">Gestión de usuarios de la plataforma</p>

      {registrosIncompletos.length > 0 && (
        <Card className="mb-6 border-l-4 border-l-amber-400">
          <h2 className="font-overpass font-bold text-brand-blue mb-3">Registros incompletos</h2>
          <p className="text-sm text-gray-500 mb-3">Usuarios que iniciaron registro con Google o magic link pero no completaron el CUIT y rol.</p>
          <div className="divide-y divide-gray-100">
            {registrosIncompletos.map((r) => (
              <div key={r.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{r.email}</p>
                  <p className="text-xs text-gray-400">{r.name || 'Sin nombre'} · {new Date(r.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
                <a href={`mailto:${r.email}`} className="text-xs text-brand-blue font-semibold hover:underline">
                  Contactar
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard value={String(usuarios.length)} label="Total" variant="success" />
        <StatCard value={String(totalTalleres)} label="Talleres" variant="warning" />
        <StatCard value={String(totalMarcas)} label="Marcas" variant="muted" />
      </div>

      <div className="flex gap-3 mb-4">
        <SearchInput onChange={setSearch} placeholder="Buscar por nombre, email o CUIT..." className="flex-1" />
        <Select
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value)}
          options={[
            { value: '', label: 'Todos los roles' },
            { value: 'TALLER', label: 'Taller' },
            { value: 'MARCA', label: 'Marca' },
            { value: 'ESTADO', label: 'Estado' },
            { value: 'CONTENIDO', label: 'Contenido' },
            { value: 'ADMIN', label: 'Admin' },
          ]}
        />
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400">No se encontraron usuarios.</div>
      )}

      {!loading && filtered.length > 0 && (
        <Card>
          <DataTable columns={columns} data={filtered} />
        </Card>
      )}

      <Modal open={!!detalleModal} onClose={() => setDetalleModal(null)} title="Detalle de Usuario" size="lg">
        {detalleModal && (
          <div className="space-y-4">
            <div>
              <p className="font-overpass font-bold text-lg">{detalleModal.name || 'Sin nombre'}</p>
              <p className="text-sm text-gray-500">{detalleModal.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Rol:</span> {detalleModal.role}</div>
              <div><span className="text-gray-500">Estado:</span> {detalleModal.active ? 'Activo' : 'Inactivo'}</div>
              <div><span className="text-gray-500">Registrado:</span> {new Date(detalleModal.createdAt).toLocaleDateString('es-AR')}</div>
              <div><span className="text-gray-500">Telefono:</span> {detalleModal.phone || '-'}</div>
            </div>
            <div className="flex gap-2 pt-4 border-t flex-wrap">
              <Button size="sm" variant="secondary" icon={<MessageSquare className="w-4 h-4" />} onClick={() => setMensajeTarget(detalleModal)}>Enviar mensaje</Button>
              <Button size="sm" variant="secondary" onClick={() => { setEditModal(detalleModal); setEditRole(detalleModal.role) }}>Cambiar rol</Button>
              <Button size="sm" variant="secondary" onClick={() => setConfirmAction({ user: detalleModal, action: 'resetPassword' })}>Resetear contrasena</Button>
              <Button size="sm" variant="danger" onClick={() => setConfirmAction({ user: detalleModal, action: 'suspend' })}>Suspender cuenta</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Cambiar rol" size="sm">
        {editModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Cambiar rol de <strong>{editModal.email}</strong></p>
            <Select
              value={editRole}
              onChange={e => setEditRole(e.target.value)}
              options={[
                { value: 'TALLER', label: 'Taller' },
                { value: 'MARCA', label: 'Marca' },
                { value: 'ESTADO', label: 'Estado' },
                { value: 'CONTENIDO', label: 'Contenido' },
                { value: 'ADMIN', label: 'Admin' },
              ]}
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="secondary" onClick={() => setEditModal(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleChangeRole} disabled={saving || editRole === editModal.role}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} title={confirmAction?.action === 'suspend' ? 'Suspender cuenta' : 'Resetear contrasena'} size="sm">
        {confirmAction && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {confirmAction.action === 'suspend'
                ? `Vas a suspender la cuenta de ${confirmAction.user.email}. El usuario no podra acceder a la plataforma.`
                : `Se enviaran instrucciones de reset de contrasena a ${confirmAction.user.email}.`}
            </p>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="secondary" onClick={() => setConfirmAction(null)}>Cancelar</Button>
              <Button
                size="sm"
                variant={confirmAction.action === 'suspend' ? 'danger' : 'primary'}
                disabled={saving}
                onClick={() => confirmAction.action === 'suspend'
                  ? handleSuspend(confirmAction.user)
                  : handleResetPassword(confirmAction.user)}
              >
                {saving ? 'Procesando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {mensajeTarget && (
        <EditorMensajeIndividual
          destinatarioId={mensajeTarget.id}
          destinatarioNombre={mensajeTarget.name || mensajeTarget.email}
          destinatarioRol={mensajeTarget.role as 'TALLER' | 'MARCA' | 'ADMIN' | 'ESTADO' | 'CONTENIDO'}
          destinatarioTienePhone={!!mensajeTarget.phone}
          onCerrar={() => setMensajeTarget(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
