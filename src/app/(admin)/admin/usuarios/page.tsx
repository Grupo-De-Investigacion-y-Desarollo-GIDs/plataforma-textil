'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { StatCard } from '@/components/ui/stat-card'
import { Eye, Edit, UserX } from 'lucide-react'

interface Usuario {
  id: string
  name: string | null
  email: string
  role: string
  active: boolean
  createdAt: string
  phone: string | null
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [search, setSearch] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [detalleModal, setDetalleModal] = useState<Usuario | null>(null)

  useEffect(() => {
    fetch('/api/admin/usuarios').then(r => r.json()).then((d: { usuarios?: Usuario[] }) => setUsuarios(d.usuarios || [])).catch(() => {})
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
        <button onClick={() => setDetalleModal(row)} className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
        <button className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
        <button className="p-1 hover:bg-gray-100 rounded"><UserX className="w-4 h-4 text-gray-400" /></button>
      </div>
    )},
  ]

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Usuarios</h1>
      <p className="text-gray-500 text-sm mb-6">Gestión de usuarios de la plataforma</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
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
            { value: 'ADMIN', label: 'Admin' },
          ]}
        />
      </div>

      <Card>
        <DataTable columns={columns} data={filtered} />
      </Card>

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
              <div><span className="text-gray-500">Teléfono:</span> {detalleModal.phone || '-'}</div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button size="sm" variant="secondary">Cambiar rol</Button>
              <Button size="sm" variant="secondary">Resetear contraseña</Button>
              <Button size="sm" variant="secondary">Suspender cuenta</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
