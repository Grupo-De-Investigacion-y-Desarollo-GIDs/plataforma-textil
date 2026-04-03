export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { OrdenActions } from '@/taller/componentes/orden-actions'

const estadoLabel: Record<string, string> = {
  PENDIENTE: 'Pendiente de aceptación',
  EN_EJECUCION: 'En ejecución',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}

const estadoColor: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_EJECUCION: 'bg-blue-100 text-blue-800',
  COMPLETADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-gray-100 text-gray-600',
}

export default async function TallerOrdenDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!taller) redirect('/login')

  const orden = await prisma.ordenManufactura.findUnique({
    where: { id },
    include: {
      pedido: {
        include: {
          marca: { select: { nombre: true, user: { select: { phone: true } } } },
        },
      },
    },
  })

  if (!orden || orden.tallerId !== taller.id) notFound()

  const pedido = orden.pedido

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/taller/pedidos"
        className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a pedidos
      </Link>

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue">{orden.moId}</h1>
          <p className="text-gray-500 text-sm mt-0.5">Pedido {pedido.omId}</p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${estadoColor[orden.estado] ?? 'bg-gray-100 text-gray-600'}`}>
          {estadoLabel[orden.estado] ?? orden.estado}
        </span>
      </div>

      {/* Detalle del pedido */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-overpass font-semibold text-gray-700 text-sm uppercase">
          Detalle del pedido
        </h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-gray-500">Marca</p>
            <p className="font-medium text-gray-800">{pedido.marca.nombre}</p>
          </div>
          <div>
            <p className="text-gray-500">Prenda</p>
            <p className="font-medium text-gray-800">{pedido.tipoPrenda}</p>
          </div>
          <div>
            <p className="text-gray-500">Cantidad</p>
            <p className="font-medium text-gray-800">{pedido.cantidad.toLocaleString()} unidades</p>
          </div>
          <div>
            <p className="text-gray-500">Fecha objetivo</p>
            <p className="font-medium text-gray-800">
              {pedido.fechaObjetivo
                ? new Date(pedido.fechaObjetivo).toLocaleDateString('es-AR')
                : 'Sin fecha'}
            </p>
          </div>
        </div>
      </div>

      {/* Detalle de la orden */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-overpass font-semibold text-gray-700 text-sm uppercase">
          Tu orden de manufactura
        </h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-gray-500">Proceso</p>
            <p className="font-medium text-gray-800">{orden.proceso}</p>
          </div>
          <div>
            <p className="text-gray-500">Precio acordado</p>
            <p className="font-medium text-gray-800">${orden.precio.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Plazo</p>
            <p className="font-medium text-gray-800">
              {orden.plazoDias ? `${orden.plazoDias} días` : 'Sin plazo definido'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Recibida el</p>
            <p className="font-medium text-gray-800">
              {new Date(orden.createdAt).toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>

        {/* Barra de progreso (solo en ejecución o completo) */}
        {(orden.estado === 'EN_EJECUCION' || orden.estado === 'COMPLETADO') && (
          <div className="pt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span>
              <span className="font-semibold">{Math.round(orden.progreso)}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-blue rounded-full transition-all"
                style={{ width: `${Math.min(orden.progreso, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      {(orden.estado === 'PENDIENTE' || orden.estado === 'EN_EJECUCION') && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-overpass font-semibold text-gray-700 text-sm uppercase">
            {orden.estado === 'PENDIENTE' ? 'Responder propuesta' : 'Actualizar progreso'}
          </h2>
          <OrdenActions
            ordenId={orden.id}
            estado={orden.estado}
            progresoActual={orden.progreso}
          />
        </div>
      )}

      {/* Contacto marca */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-overpass font-semibold text-gray-700 text-sm uppercase mb-3">
          Contacto marca
        </h2>
        <p className="text-sm font-medium text-gray-800 mb-3">{pedido.marca.nombre}</p>
        {pedido.marca.user.phone ? (
          <a
            href={`https://wa.me/${pedido.marca.user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, te contacto por la orden ${orden.moId} del pedido ${pedido.omId}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Contactar por WhatsApp
          </a>
        ) : (
          <p className="text-sm text-gray-400">La marca no tiene teléfono registrado.</p>
        )}
      </div>

      {orden.estado === 'COMPLETADO' && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-green-700 font-semibold">Orden completada exitosamente</p>
          <p className="text-green-600 text-sm mt-1">
            Completada el {new Date(orden.updatedAt).toLocaleDateString('es-AR')}
          </p>
        </div>
      )}
    </div>
  )
}
