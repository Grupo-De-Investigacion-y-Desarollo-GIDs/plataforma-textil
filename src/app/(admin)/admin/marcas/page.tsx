'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { DataTable } from '@/components/ui/data-table'
import { StatCard } from '@/components/ui/stat-card'
import { Eye, Edit } from 'lucide-react'

interface MarcaRow {
  id: string
  nombre: string
  cuit: string
  createdAt: string
  user: { active: boolean; email: string; phone: string | null }
}

export default function AdminMarcasPage() {
  const [marcas, setMarcas] = useState<MarcaRow[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/marcas?limit=100').then(r => r.json()).then((d: { marcas?: MarcaRow[] }) => setMarcas(d.marcas || [])).catch(() => {})
  }, [])

  const filtered = marcas.filter(m =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.cuit.includes(search) ||
    m.user.email.toLowerCase().includes(search.toLowerCase())
  )

  const activas = marcas.filter(m => m.user.active).length

  const columns = [
    { header: 'Empresa', accessor: (row: MarcaRow) => (
      <div>
        <p className="font-semibold">{row.nombre}</p>
        <p className="text-xs text-gray-400">{row.user.email}</p>
      </div>
    )},
    { header: 'CUIT', accessor: 'cuit' as const, sortable: true },
    { header: 'Estado', accessor: (row: MarcaRow) => (
      <Badge variant={row.user.active ? 'success' : 'warning'}>{row.user.active ? 'Activa' : 'Inactiva'}</Badge>
    )},
    { header: 'Registro', accessor: (row: MarcaRow) => new Date(row.createdAt).toLocaleDateString('es-AR'), sortable: true },
    { header: 'Acciones', accessor: (row: MarcaRow) => (
      <div className="flex gap-1">
        <Link href={`/admin/marcas/${row.id}`}><button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button></Link>
        <button className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
      </div>
    )},
  ]

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Gestión de Marcas</h1>
      <p className="text-gray-500 text-sm mb-6">Todas las marcas/empresas registradas</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard value={String(marcas.length)} label="Total" variant="success" />
        <StatCard value={String(activas)} label="Activas" variant="success" />
      </div>

      <SearchInput onChange={setSearch} placeholder="Buscar por nombre, CUIT o email..." className="mb-4" />

      <Card>
        <DataTable columns={columns} data={filtered} />
      </Card>
    </div>
  )
}
