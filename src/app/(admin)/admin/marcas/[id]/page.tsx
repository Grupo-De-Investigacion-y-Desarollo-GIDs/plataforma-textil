export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { ArrowLeft, MapPin, Mail, Phone, Globe, Calendar } from 'lucide-react'

export default async function AdminDetalleMarcaPage({ params }: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') redirect('/login')

  const { id } = await params

  const marca = await prisma.marca.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, phone: true, name: true, active: true, createdAt: true } },
      pedidos: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          _count: { select: { ordenes: true } },
        },
      },
    },
  })

  if (!marca) notFound()

  const logs = await prisma.logActividad.findMany({
    where: { detalles: { path: ['marcaId'], equals: id } },
    orderBy: { timestamp: 'desc' },
    take: 20,
    include: { user: { select: { name: true } } },
  }).catch(() => [])

  // Stats
  const totalPedidos = marca.pedidos.length
  const pedidosActivos = marca.pedidos.filter(p =>
    ['BORRADOR', 'PUBLICADO', 'EN_PROCESO'].includes(p.estado)
  ).length
  const montoTotal = marca.pedidos.reduce((sum, p) => sum + (p.montoTotal ?? 0), 0)

  const formatDate = (d: Date) =>
    d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })

  const estadoLabel: Record<string, string> = {
    BORRADOR: 'Borrador',
    PUBLICADO: 'Publicado',
    EN_PROCESO: 'En proceso',
    COMPLETADO: 'Completado',
    CANCELADO: 'Cancelado',
  }
  const estadoVariant: Record<string, 'success' | 'warning' | 'muted'> = {
    BORRADOR: 'muted',
    PUBLICADO: 'warning',
    EN_PROCESO: 'warning',
    COMPLETADO: 'success',
    CANCELADO: 'muted',
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Link href="/admin/marcas" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a marcas
      </Link>

      {/* Header */}
      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue font-overpass font-bold text-xl">
            {marca.nombre.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-overpass font-bold text-xl text-brand-blue">{marca.nombre}</h1>
            <p className="text-sm text-gray-500">CUIT: {marca.cuit}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              {marca.ubicacion && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {marca.ubicacion}</span>
              )}
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {marca.user.email}</span>
              {marca.user.phone && (
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {marca.user.phone}</span>
              )}
              {marca.website && (
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {marca.website}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Registrada {formatDate(marca.user.createdAt)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant={marca.user.active ? 'success' : 'warning'}>
                {marca.user.active ? 'Activa' : 'Inactiva'}
              </Badge>
              {marca.tipo && <Badge variant="muted">{marca.tipo}</Badge>}
              {marca.frecuenciaCompra && (
                <Badge variant="muted">Compra: {marca.frecuenciaCompra}</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard value={String(totalPedidos)} label="Pedidos totales" variant="muted" />
        <StatCard value={String(pedidosActivos)} label="Pedidos activos" variant="warning" />
        <StatCard value={String(marca.volumenMensual)} label="Volumen mensual" variant="success" />
        <StatCard
          value={montoTotal > 0 ? `$${montoTotal.toLocaleString('es-AR')}` : '-'}
          label="Monto total pedidos"
          variant="muted"
        />
      </div>

      {/* Pedidos */}
      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Pedidos</h2>
        {marca.pedidos.length === 0 ? (
          <p className="text-sm text-gray-500">Sin pedidos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">OM</th>
                  <th className="pb-2 font-medium">Prenda</th>
                  <th className="pb-2 font-medium">Cantidad</th>
                  <th className="pb-2 font-medium">Ordenes</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {marca.pedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-2 font-medium">{p.omId}</td>
                    <td className="py-2 text-gray-600">{p.tipoPrenda}</td>
                    <td className="py-2 text-gray-600">{p.cantidad}</td>
                    <td className="py-2 text-gray-600">{p._count.ordenes}</td>
                    <td className="py-2">
                      <Badge variant={estadoVariant[p.estado] ?? 'muted'}>
                        {estadoLabel[p.estado] ?? p.estado}
                      </Badge>
                    </td>
                    <td className="py-2 text-gray-400">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Actividad (logs) */}
      <Card>
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Actividad Reciente</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500">Sin actividad registrada.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <p key={log.id} className="text-sm">
                <span className="text-gray-400">{formatDate(log.timestamp)}</span>
                {' - '}
                <span className="font-medium text-gray-600">{log.accion}</span>
                {log.user?.name && (
                  <span className="text-gray-400"> por {log.user.name}</span>
                )}
              </p>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
