export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Package, MapPin, Calendar } from 'lucide-react'

export default async function PedidosDisponiblesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const pedidosDisponibles = await prisma.pedido.findMany({
    where: { estado: 'PUBLICADO' },
    include: {
      marca: { select: { nombre: true, tipo: true, ubicacion: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Pedidos disponibles</h1>
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
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-overpass font-bold text-gray-800">{pedido.tipoPrenda}</p>
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
                  className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-overpass font-semibold hover:bg-blue-800 transition-colors shrink-0"
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
