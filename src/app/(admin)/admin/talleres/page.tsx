'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { DataTable } from '@/components/ui/data-table'
import { StatCard } from '@/components/ui/stat-card'
import { Select } from '@/components/ui/select'
import { Eye, Edit } from 'lucide-react'

interface TallerRow {
  id: string
  nombre: string
  cuit: string
  nivel: string
  zona: string | null
  createdAt: string
  user: { active: boolean; email: string; phone: string | null }
}

export default function AdminTalleresPage() {
  const [talleres, setTalleres] = useState<TallerRow[]>([])
  const [search, setSearch] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('')

  useEffect(() => {
    fetch('/api/talleres?limit=100').then(r => r.json()).then((d: { talleres?: TallerRow[] }) => setTalleres(d.talleres || [])).catch(() => {})
  }, [])

  const filtered = talleres.filter(t => {
    const matchSearch = t.nombre.toLowerCase().includes(search.toLowerCase()) ||
      t.cuit.includes(search) ||
      t.user.email.toLowerCase().includes(search.toLowerCase())
    const matchNivel = !filtroNivel || t.nivel === filtroNivel
    return matchSearch && matchNivel
  })

  const byNivel = (n: string) => talleres.filter(t => t.nivel === n).length

  const columns = [
    { header: 'Nombre', accessor: (row: TallerRow) => (
      <div>
        <p className="font-semibold">{row.nombre}</p>
        <p className="text-xs text-gray-400">{row.user.email}</p>
      </div>
    )},
    { header: 'CUIT', accessor: 'cuit' as const, sortable: true },
    { header: 'Nivel', accessor: (row: TallerRow) => (
      <Badge variant={row.nivel === 'ORO' ? 'success' : row.nivel === 'PLATA' ? 'default' : 'warning'}>{row.nivel}</Badge>
    )},
    { header: 'Estado', accessor: (row: TallerRow) => (
      <Badge variant={row.user.active ? 'success' : 'warning'}>{row.user.active ? 'Activo' : 'Inactivo'}</Badge>
    )},
    { header: 'Registro', accessor: (row: TallerRow) => new Date(row.createdAt).toLocaleDateString('es-AR'), sortable: true },
    { header: 'Acciones', accessor: (row: TallerRow) => (
      <div className="flex gap-1">
        <Link href={`/admin/talleres/${row.id}`}><button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button></Link>
        <button className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
      </div>
    )},
  ]

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Gestión de Talleres</h1>
      <p className="text-gray-500 text-sm mb-6">Todos los talleres registrados en la plataforma</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={String(talleres.length)} label="Total" variant="success" />
        <StatCard value={String(byNivel('ORO'))} label="Oro" variant="success" />
        <StatCard value={String(byNivel('PLATA'))} label="Plata" variant="muted" />
        <StatCard value={String(byNivel('BRONCE'))} label="Bronce" variant="warning" />
      </div>

      <div className="flex gap-3 mb-4">
        <SearchInput onChange={setSearch} placeholder="Buscar por nombre, CUIT o email..." className="flex-1" />
        <Select
          value={filtroNivel}
          onChange={e => setFiltroNivel(e.target.value)}
          options={[
            { value: '', label: 'Todos los niveles' },
            { value: 'ORO', label: 'Oro' },
            { value: 'PLATA', label: 'Plata' },
            { value: 'BRONCE', label: 'Bronce' },
          ]}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <Button size="sm" variant="secondary">Exportar CSV</Button>
        <Button size="sm" variant="secondary">Exportar Excel</Button>
      </div>

      <Card>
        <DataTable columns={columns} data={filtered} />
      </Card>
    </div>
  )
}
