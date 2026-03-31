export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const statusLabel: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_EJECUCION: 'En ejecucion',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}

const statusVariant: Record<string, 'default' | 'success' | 'warning'> = {
  PENDIENTE: 'default',
  EN_EJECUCION: 'warning',
  COMPLETADO: 'success',
  CANCELADO: 'warning',
}

export default async function TallerPedidosPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: { id: true, nombre: true },
  })

  if (!taller) redirect('/login')

  const ordenes = await prisma.ordenManufactura.findMany({
    where: { tallerId: taller.id },
    include: {
      pedido: {
        select: {
          omId: true,
          tipoPrenda: true,
          cantidad: true,
          marca: { select: { nombre: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const total = ordenes.length
  const enEjecucion = ordenes.filter(o => o.estado === 'EN_EJECUCION').length
  const completadas = ordenes.filter(o => o.estado === 'COMPLETADO').length
  const pendientes = ordenes.filter(o => o.estado === 'PENDIENTE').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Pedidos Recibidos</h1>
        <p className="text-gray-600 mt-2">Ordenes de manufactura asignadas a {taller.nombre}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-overpass font-bold text-2xl text-brand-blue">{total}</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-xs text-gray-500">Pendientes</p>
          <p className="font-overpass font-bold text-2xl text-brand-blue">{pendientes}</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-xs text-gray-500">En ejecucion</p>
          <p className="font-overpass font-bold text-2xl text-brand-blue">{enEjecucion}</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-xs text-gray-500">Completadas</p>
          <p className="font-overpass font-bold text-2xl text-brand-blue">{completadas}</p>
        </Card>
      </div>

      <Card>
        {ordenes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-600">No tenes ordenes de manufactura asignadas todavia.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ordenes.map((orden) => (
              <Link
                key={orden.id}
                href={`/taller/pedidos/${orden.id}`}
                className="block border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-brand-blue hover:bg-blue-50/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-overpass font-semibold text-brand-blue">{orden.moId}</p>
                    {orden.estado === 'PENDIENTE' && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
                        ¡Requiere respuesta!
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Pedido: {orden.pedido.omId} - {orden.pedido.tipoPrenda}
                  </p>
                  <p className="text-sm text-gray-600">
                    Marca: {orden.pedido.marca.nombre}
                  </p>
                  <p className="text-sm text-gray-600">
                    Proceso: {orden.proceso} - ${orden.precio.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{orden.progreso}%</p>
                    <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                      <div
                        className="h-2 bg-brand-blue rounded-full"
                        style={{ width: `${Math.min(orden.progreso, 100)}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant={statusVariant[orden.estado] || 'default'}>
                    {statusLabel[orden.estado] || orden.estado}
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
