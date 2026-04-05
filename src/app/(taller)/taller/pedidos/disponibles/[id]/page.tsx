export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { ArrowLeft } from 'lucide-react'
import { CotizarForm } from '@/taller/componentes/cotizar-form'

export default async function PedidoDisponibleDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const pedido = await prisma.pedido.findFirst({
    where: { id, estado: 'PUBLICADO' },
    include: { marca: { select: { nombre: true, tipo: true, ubicacion: true } } },
  })
  if (!pedido) notFound()

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })
  const cotizacionExistente = taller
    ? await prisma.cotizacion.findFirst({
        where: { pedidoId: id, tallerId: taller.id, estado: { in: ['ENVIADA', 'ACEPTADA'] } },
      })
    : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/taller/pedidos/disponibles" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline">
        <ArrowLeft className="w-4 h-4" /> Volver a pedidos disponibles
      </Link>

      <div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">{pedido.tipoPrenda}</h1>
        <p className="text-gray-500 mt-1">Publicado por {pedido.marca.nombre}</p>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Cantidad</p>
            <p className="font-overpass font-bold text-lg">{pedido.cantidad.toLocaleString()} unidades</p>
          </div>
          {pedido.fechaObjetivo && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Fecha objetivo</p>
              <p className="font-overpass font-bold text-lg">{new Date(pedido.fechaObjetivo).toLocaleDateString('es-AR')}</p>
            </div>
          )}
          {pedido.presupuesto && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Presupuesto</p>
              <p className="font-overpass font-bold text-lg text-green-700">${pedido.presupuesto.toLocaleString('es-AR')}</p>
            </div>
          )}
          {pedido.marca.ubicacion && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Ubicacion marca</p>
              <p className="font-overpass font-bold text-lg">{pedido.marca.ubicacion}</p>
            </div>
          )}
        </div>
        {pedido.descripcion && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Descripcion</p>
            <p className="text-sm text-gray-700">{pedido.descripcion}</p>
          </div>
        )}
      </Card>

      {cotizacionExistente ? (
        <Card>
          <div className="text-center py-4">
            <p className="font-overpass font-semibold text-brand-blue">Ya enviaste una cotizacion para este pedido</p>
            <p className="text-sm text-gray-500 mt-1">
              Precio: ${cotizacionExistente.precio.toLocaleString('es-AR')} · Plazo: {cotizacionExistente.plazoDias} dias
            </p>
          </div>
        </Card>
      ) : (
        <Card title="Enviar cotizacion">
          <CotizarForm pedidoId={pedido.id} />
        </Card>
      )}
    </div>
  )
}
