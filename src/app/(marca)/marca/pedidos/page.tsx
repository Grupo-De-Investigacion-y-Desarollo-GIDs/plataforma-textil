export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const statusVariant: Record<string, 'default' | 'success' | 'warning'> = {
  BORRADOR: 'default',
  EN_EJECUCION: 'warning',
  COMPLETADO: 'success',
  CANCELADO: 'warning',
}

const statusLabel: Record<string, string> = {
  BORRADOR: 'Borrador',
  EN_EJECUCION: 'En ejecución',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}

const allowedEstados = ['BORRADOR', 'EN_EJECUCION', 'COMPLETADO', 'CANCELADO'] as const

type SearchParams = {
  q?: string
  estado?: string
  created?: string
}

export default async function MarcaPedidosPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const query = (resolvedSearchParams.q || '').trim()
  const estadoRaw = (resolvedSearchParams.estado || '').trim().toUpperCase()
  const estado =
    allowedEstados.includes(estadoRaw as (typeof allowedEstados)[number])
      ? (estadoRaw as (typeof allowedEstados)[number])
      : ''
  const created = resolvedSearchParams.created === '1'

  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=%2Fmarca%2Fpedidos')

  const marca = await prisma.marca.findFirst({
    where: { userId: session.user.id },
    select: { id: true, nombre: true },
  })

  if (!marca) redirect('/login?callbackUrl=%2Fmarca%2Fpedidos')

  const pedidos = await prisma.pedido.findMany({
    where: {
      marcaId: marca.id,
      ...(estado ? { estado } : {}),
      ...(query
        ? {
            OR: [
              { omId: { contains: query, mode: 'insensitive' } },
              { tipoPrenda: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { ordenes: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const total = pedidos.length
  const enEjecucion = pedidos.filter(p => p.estado === 'EN_EJECUCION').length
  const completados = pedidos.filter(p => p.estado === 'COMPLETADO').length
  const cancelados = pedidos.filter(p => p.estado === 'CANCELADO').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Mis Pedidos</h1>
        <p className="text-gray-600 mt-2">Seguimiento de pedidos de {marca.nombre}</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        {created ? (
          <p className="text-sm text-status-success font-medium">Pedido creado correctamente.</p>
        ) : (
          <span />
        )}
        <Link
          href="/marca/pedidos/nuevo"
          className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold transition-colors bg-brand-blue hover:bg-blue-800 text-white px-4 py-2.5 text-sm"
        >
          Crear pedido
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-overpass font-bold text-2xl text-brand-blue">{total}</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-xs text-gray-500">En ejecución</p>
          <p className="font-overpass font-bold text-2xl text-brand-blue">{enEjecucion}</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-xs text-gray-500">Completados</p>
          <p className="font-overpass font-bold text-2xl text-brand-blue">{completados}</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-xs text-gray-500">Cancelados</p>
          <p className="font-overpass font-bold text-2xl text-brand-blue">{cancelados}</p>
        </Card>
      </div>

      <Card>
        <form method="get" className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label htmlFor="q" className="block text-sm font-medium text-brand-blue mb-1.5">
              Buscar por OM o prenda
            </label>
            <input
              id="q"
              name="q"
              defaultValue={query}
              placeholder="Ej: OM-2025-00045 o Jean"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-brand-blue mb-1.5">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              defaultValue={estado}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="BORRADOR">Borrador</option>
              <option value="EN_EJECUCION">En ejecución</option>
              <option value="COMPLETADO">Completado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold transition-colors bg-brand-blue hover:bg-blue-800 text-white px-4 py-2.5 text-sm"
            >
              Filtrar
            </button>
            <Link
              href="/marca/pedidos"
              className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold transition-colors bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 text-sm"
            >
              Limpiar
            </Link>
          </div>
        </form>
      </Card>

      <Card>
        {pedidos.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-600">
              {query || estado ? 'No hay pedidos para esos filtros.' : 'Todavia no tenes pedidos creados.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <Link
                key={pedido.id}
                href={`/marca/pedidos/${pedido.id}`}
                className="block border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-brand-blue/30 hover:shadow-sm transition-all"
              >
                <div className="space-y-1">
                  <p className="font-overpass font-semibold text-brand-blue">{pedido.omId}</p>
                  <p className="text-sm text-gray-600">
                    {pedido.tipoPrenda} - {pedido.cantidad.toLocaleString()} unidades
                  </p>
                  <p className="text-xs text-gray-500">
                    Creado: {new Date(pedido.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600">{pedido._count.ordenes} orden(es)</p>
                  <Badge variant={statusVariant[pedido.estado] || 'default'}>
                    {statusLabel[pedido.estado] || pedido.estado}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
