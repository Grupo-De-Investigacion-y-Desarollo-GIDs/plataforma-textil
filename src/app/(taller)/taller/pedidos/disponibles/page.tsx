export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/compartido/componentes/ui/badge'
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { SkeletonTable } from '@/compartido/componentes/ui/skeleton'
import { Package, MapPin, Calendar, ShieldCheck } from 'lucide-react'

const PAGE_SIZE = 18

async function ListaPedidosDisponibles({ page }: { page: number }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({ where: { userId: session.user.id }, select: { id: true, verificadoAfip: true } })

  const where = {
    estado: 'PUBLICADO' as const,
    NOT: [
      { tipoPrenda: { startsWith: 'E2E-Test' } },
      ...(session.user.id ? [{ marca: { userId: session.user.id } }] : []),
    ],
    OR: [
      { visibilidad: 'PUBLICO' as const },
      ...(taller ? [{ invitaciones: { some: { tallerId: taller.id } } }] : []),
    ],
  }

  const [pedidosDisponibles, totalCount] = await Promise.all([
    prisma.pedido.findMany({
      where,
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
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.pedido.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <>
      {taller && !taller.verificadoAfip && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-overpass font-semibold text-amber-900">Verificá tu CUIT para cotizar estos pedidos</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Podés ver toda la demanda disponible. Para enviar cotizaciones, completá tu formalización.
            </p>
          </div>
          <Link
            href="/taller/formalizacion"
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-overpass font-semibold hover:bg-brand-blue-hover transition-colors shrink-0"
          >
            Ir a Formalización
          </Link>
        </div>
      )}

      {pedidosDisponibles.length === 0 ? (
        <EmptyState
          titulo="No hay pedidos disponibles"
          mensaje="Por ahora no hay pedidos compatibles con tu taller. Te avisamos cuando aparezcan."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidosDisponibles.map((pedido) => (
            <Link
              key={pedido.id}
              href={`/taller/pedidos/disponibles/${pedido.id}`}
              className="group bg-white rounded-card border border-gray-100 shadow-card hover:shadow-card-hover hover:border-brand-blue transition-all overflow-hidden flex flex-col"
            >
              {pedido.imagenes?.[0] ? (
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={pedido.imagenes[0]}
                    alt={pedido.tipoPrenda}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-brand-bg-light flex items-center justify-center">
                  <Package className="w-12 h-12 text-brand-blue/30" />
                </div>
              )}

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif font-bold text-gray-800 text-base leading-tight">{pedido.tipoPrenda}</h3>
                  {'invitaciones' in pedido && Array.isArray(pedido.invitaciones) && pedido.invitaciones.length > 0 && (
                    <Badge variant="default">Invitación</Badge>
                  )}
                </div>

                <p className="text-sm text-gray-500 flex items-center gap-1">
                  {pedido.marca.nombre}
                  {pedido.marca.ubicacion && (
                    <span className="inline-flex items-center gap-0.5 ml-1">
                      <MapPin className="w-3 h-3" /> {pedido.marca.ubicacion}
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                  <span className="inline-flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" /> {pedido.cantidad.toLocaleString()} uds
                  </span>
                  {pedido.fechaObjetivo && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(pedido.fechaObjetivo).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-3">
                  {pedido.presupuesto ? (
                    <p className="font-overpass font-bold text-green-700 text-lg">
                      ${pedido.presupuesto.toLocaleString('es-AR')}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">Presupuesto a convenir</p>
                  )}
                </div>

                <div className="mt-2">
                  <span className={`inline-flex items-center justify-center w-full rounded-lg text-sm font-overpass font-semibold py-2 transition-colors ${
                    taller?.verificadoAfip
                      ? 'bg-brand-blue text-white group-hover:bg-brand-blue-hover'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}>
                    {taller?.verificadoAfip ? 'Ver y cotizar' : 'Ver detalle'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/taller/pedidos/disponibles?page=${p}`}
              className={`px-3 py-1.5 rounded text-sm font-medium ${
                p === page ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

export default async function PedidosDisponiblesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam || '1'))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-3xl text-ink-primary">Pedidos disponibles</h1>
        <p className="text-gray-500 mt-1">Pedidos publicados por marcas que buscan talleres</p>
      </div>

      <Suspense fallback={<SkeletonTable rows={5} />}>
        <ListaPedidosDisponibles page={page} />
      </Suspense>
    </div>
  )
}
