'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Button } from '@/compartido/componentes/ui/button'
import { SearchInput } from '@/compartido/componentes/ui/search-input'
import { DataTable } from '@/compartido/componentes/ui/data-table'
import { StatCard } from '@/compartido/componentes/ui/stat-card'
import { Select } from '@/compartido/componentes/ui/select'
import { Eye } from 'lucide-react'

interface Pedido {
  id: string
  omId: string
  marca: { nombre: string }
  estado: string
  tipoPrenda: string
  cantidad: number
  createdAt: string
  _count: { ordenes: number }
}

const estadoVariant: Record<string, 'success' | 'warning' | 'default' | 'muted' | 'error'> = {
  BORRADOR: 'muted',
  PUBLICADO: 'warning',
  EN_EJECUCION: 'default',
  ESPERANDO_ENTREGA: 'warning',
  COMPLETADO: 'success',
  CANCELADO: 'error',
}

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  useEffect(() => {
    fetch('/api/pedidos?limit=100').then(r => r.json()).then((d: { pedidos?: Pedido[] }) => setPedidos(d.pedidos || [])).catch(() => {})
  }, [])

  const filtered = pedidos.filter(p => {
    const matchSearch = p.marca.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.omId.toLowerCase().includes(search.toLowerCase()) ||
      p.id.includes(search)
    const matchEstado = !filtroEstado || p.estado === filtroEstado
    return matchSearch && matchEstado
  })

  const byEstado = (e: string) => pedidos.filter(p => p.estado === e).length

  const columns = [
    { header: 'OM', accessor: (row: Pedido) => row.omId },
    { header: 'Marca', accessor: (row: Pedido) => row.marca.nombre },
    { header: 'Prenda', accessor: (row: Pedido) => row.tipoPrenda },
    { header: 'Estado', accessor: (row: Pedido) => (
      <Badge variant={estadoVariant[row.estado] || 'default'}>{row.estado.replace('_', ' ')}</Badge>
    )},
    { header: 'Cantidad', accessor: (row: Pedido) => row.cantidad.toLocaleString() },
    { header: 'Órdenes', accessor: (row: Pedido) => String(row._count.ordenes) },
    { header: 'Fecha', accessor: (row: Pedido) => new Date(row.createdAt).toLocaleDateString('es-AR'), sortable: true },
    { header: 'Acciones', accessor: () => (
      <button className="p-1 hover:bg-gray-100 rounded" aria-label="Ver detalle"><Eye className="w-4 h-4 text-gray-500" /></button>
    )},
  ]

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Gestión de Pedidos</h1>
      <p className="text-gray-500 text-sm mb-6">Todos los pedidos realizados en la plataforma</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={String(pedidos.length)} label="Total" variant="success" />
        <StatCard value={String(byEstado('COMPLETADO'))} label="Completados" variant="success" />
        <StatCard value={String(byEstado('EN_EJECUCION'))} label="En ejecución" variant="warning" />
        <StatCard value={String(byEstado('PUBLICADO'))} label="Publicados" variant="warning" />
        <StatCard value={String(byEstado('BORRADOR'))} label="Borradores" variant="muted" />
      </div>

      <div className="flex gap-3 mb-4">
        <SearchInput onChange={setSearch} placeholder="Buscar por marca, OM ID..." className="flex-1" />
        <Select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'BORRADOR', label: 'Borrador' },
            { value: 'PUBLICADO', label: 'Publicado' },
            { value: 'EN_EJECUCION', label: 'En ejecucion' },
            { value: 'ESPERANDO_ENTREGA', label: 'Esperando entrega' },
            { value: 'COMPLETADO', label: 'Completado' },
            { value: 'CANCELADO', label: 'Cancelado' },
          ]}
        />
      </div>

      <Button size="sm" variant="secondary" className="mb-4">Exportar reporte de pedidos</Button>

      <Card>
        <DataTable columns={columns} data={filtered} />
      </Card>
    </div>
  )
}
