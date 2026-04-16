export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Package, MapPin, Calendar, ImageIcon, ArrowLeft } from 'lucide-react'

export default async function PedidosDisponiblesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({ where: { userId: session.user.id } })

  const pedidosDisponibles = await prisma.pedido.findMany({
    where: {
      estado: 'PUBLICADO',
      OR: [
        { visibilidad: 'PUBLICO' },
        ...(taller ? [{ invitaciones: { some: { tallerId: taller.id } } }] : []),
      ],
    },
    include: {
      marca: { select: { nombre: true, tipo: true, ubicacion: true } },
      ...(taller ? {
        invitaciones: {
          where: { tallerId: taller.id },
          select: { id: true },
        },
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/taller/pedidos"
          className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a mis pedidos
        </Link>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mt-2">Pedidos disponibles</h1>
        <p className="text-gray-500 mt-1">Pedidos publicados por marcas que buscan talleres</p>
      </div>

      {pedidosDisponibles.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No hay pedidos disponibles por ahora.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pedidosDisponibles.map((pedido) => (
            <Card key={pedido.id}>
              {pedido.imagenes?.[0] && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <img
                    src={pedido.imagenes[0]}
                    alt={pedido.tipoPrenda}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-overpass font-bold text-gray-800">{pedido.tipoPrenda}</p>
                    {'invitaciones' in pedido && Array.isArray(pedido.invitaciones) && pedido.invitaciones.length > 0 && (
                      <Badge variant="default">Te invitaron</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {pedido.marca.nombre}
                    {pedido.marca.ubicacion && (
                      <span className="inline-flex items-center gap-1 ml-2">
                        <MapPin className="w-3 h-3" /> {pedido.marca.ubicacion}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> {pedido.cantidad.toLocaleString()} unidades
                    </span>
                    {pedido.fechaObjetivo && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(pedido.fechaObjetivo).toLocaleDateString('es-AR')}
                      </span>
                    )}
                  </div>
                  {pedido.descripcion && <p className="text-sm text-gray-600 mt-1">{pedido.descripcion}</p>}
                  {pedido.presupuesto && (
                    <p className="text-sm font-medium text-green-700 mt-1">
                      Presupuesto: ${pedido.presupuesto.toLocaleString('es-AR')}
                    </p>
                  )}
                </div>
                <Link
                  href={`/taller/pedidos/disponibles/${pedido.id}`}
                  className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-overpass font-semibold hover:bg-brand-blue-hover transition-colors shrink-0"
                >
                  Ver y cotizar
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
