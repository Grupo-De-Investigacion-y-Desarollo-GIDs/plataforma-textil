export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import Link from 'next/link'
import { Package, Clock, DollarSign, TrendingUp, CheckCircle, MessageCircle } from 'lucide-react'
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { GaleriaFotos } from '@/taller/componentes/galeria-fotos'
import { CotizacionImagenes } from '@/marca/componentes/cotizacion-imagenes'
import { CancelarPedido } from '@/marca/componentes/cancelar-pedido'
import { PublicarPedido } from '@/marca/componentes/publicar-pedido'
import { InvitarACotizar } from '@/marca/componentes/invitar-a-cotizar'
import { AceptarCotizacion } from '@/marca/componentes/aceptar-cotizacion'
import { RechazarCotizacion } from '@/marca/componentes/rechazar-cotizacion'
import { ActivityTimeline } from '@/compartido/componentes/activity-timeline'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error' | 'muted'> = {
  BORRADOR: 'muted',
  PUBLICADO: 'warning',
  EN_EJECUCION: 'default',
  ESPERANDO_ENTREGA: 'warning',
  COMPLETADO: 'success',
  CANCELADO: 'error',
}

const statusLabel: Record<string, string> = {
  BORRADOR: 'Borrador',
  PUBLICADO: 'Publicado',
  EN_EJECUCION: 'En ejecucion',
  ESPERANDO_ENTREGA: 'Esperando entrega',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}

const ordenStatusLabel: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_EJECUCION: 'En ejecución',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}

const ordenStatusVariant: Record<string, 'default' | 'success' | 'warning'> = {
  PENDIENTE: 'default',
  EN_EJECUCION: 'warning',
  COMPLETADO: 'success',
  CANCELADO: 'warning',
}

// Flujo de estados del pedido (3 pasos)
const FLOW_STEPS = [
  { key: 'BORRADOR', label: 'Borrador' },
  { key: 'PUBLICADO', label: 'Publicado' },
  { key: 'EN_EJECUCION', label: 'En ejecucion' },
  { key: 'ESPERANDO_ENTREGA', label: 'Esperando entrega' },
  { key: 'COMPLETADO', label: 'Completado' },
]

function getStepIndex(estado: string) {
  if (estado === 'CANCELADO') return -1
  return FLOW_STEPS.findIndex((s) => s.key === estado)
}

export default async function MarcaPedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth()
  if (!session?.user) redirect('/login')

  const marca = await prisma.marca.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (!marca) redirect('/login')

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      ordenes: {
        include: {
          taller: { select: { nombre: true, user: { select: { phone: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!pedido || pedido.marcaId !== marca.id) notFound()

  const [cotizaciones, actividad] = await Promise.all([
    prisma.cotizacion.findMany({
      where: { pedidoId: pedido.id },
      include: { taller: { select: { nombre: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.logActividad.findMany({
      where: {
        accion: {
          in: [
            'PEDIDO_PUBLICADO', 'COTIZACION_RECIBIDA', 'COTIZACION_ACEPTADA',
            'COTIZACION_RECHAZADA', 'ORDEN_CREADA', 'PROGRESO_ACTUALIZADO',
            'ORDEN_ACEPTADA', 'ORDEN_RECHAZADA', 'ORDEN_COMPLETADA',
            'PEDIDO_COMPLETADO', 'PEDIDO_CANCELADO',
          ],
        },
        detalles: { path: ['pedidoId'], equals: pedido.id },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
      include: { user: { select: { name: true } } },
    }),
  ])

  const currentStep = getStepIndex(pedido.estado)
  const isCancelled = pedido.estado === 'CANCELADO'
  const todasPendientes = pedido.ordenes.length > 0 && pedido.ordenes.every(o => o.estado === 'PENDIENTE')
  const esperandoConfirmacion = pedido.estado === 'EN_EJECUCION' && todasPendientes

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: 'Marca', href: '/marca' },
        { label: 'Pedidos', href: '/marca/pedidos' },
        { label: `Pedido ${pedido.omId}` },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-overpass font-bold text-3xl text-brand-blue">{pedido.omId}</h1>
          <p className="text-gray-600 mt-1">{pedido.tipoPrenda} - {pedido.cantidad.toLocaleString()} unidades</p>
          <p className="text-sm text-gray-400 mt-1">
            Creado: {new Date(pedido.createdAt).toLocaleDateString('es-AR')}
          </p>
        </div>
        <Badge variant={esperandoConfirmacion ? 'warning' : (statusVariant[pedido.estado] || 'default')}>
          {esperandoConfirmacion ? 'Esperando confirmacion del taller' : (statusLabel[pedido.estado] || pedido.estado)}
        </Badge>
      </div>

      {/* Timeline de estados */}
      <Card>
        <p className="text-sm font-overpass font-semibold text-brand-blue mb-4">Flujo del pedido</p>
        {isCancelled ? (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-sm font-bold">X</span>
            </div>
            <span className="text-sm font-medium">Este pedido fue cancelado</span>
          </div>
        ) : (
          <div className="flex items-center gap-0">
            {FLOW_STEPS.map((step, i) => {
              const isDone = i < currentStep
              const isCurrent = i === currentStep
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        isDone
                          ? 'bg-green-500 text-white'
                          : isCurrent
                            ? 'bg-brand-blue text-white ring-4 ring-blue-200'
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-xs mt-1.5 text-center max-w-[80px] leading-tight ${
                      isDone || isCurrent ? 'text-brand-blue font-semibold' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mt-[-16px] ${isDone ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <Package className="w-5 h-5 text-brand-blue mx-auto mb-1" />
          <p className="font-overpass font-bold text-lg">{pedido.cantidad.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Unidades</p>
        </Card>
        <Card className="text-center p-4">
          <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="font-overpass font-bold text-lg">{pedido.progresoTotal}%</p>
          <p className="text-xs text-gray-500">Progreso</p>
        </Card>
        <Card className="text-center p-4">
          <DollarSign className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <p className="font-overpass font-bold text-lg">${pedido.montoTotal.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Monto total</p>
        </Card>
        <Card className="text-center p-4">
          <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="font-overpass font-bold text-lg">
            {pedido.fechaObjetivo
              ? new Date(pedido.fechaObjetivo).toLocaleDateString('es-AR')
              : 'Sin fecha'}
          </p>
          <p className="text-xs text-gray-500">Fecha objetivo</p>
        </Card>
      </div>

      {/* Imagenes del pedido */}
      {pedido.imagenes.length > 0 && (
        <Card title="Imagenes de referencia">
          <GaleriaFotos fotos={pedido.imagenes} />
        </Card>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-3">
        {pedido.estado === 'BORRADOR' && (
          <PublicarPedido pedidoId={pedido.id} />
        )}
        {pedido.estado === 'BORRADOR' && (
          <InvitarACotizar pedidoId={pedido.id} />
        )}
        {['BORRADOR', 'PUBLICADO', 'EN_EJECUCION'].includes(pedido.estado) && (
          <CancelarPedido pedidoId={pedido.id} />
        )}
      </div>

      {/* Cotizaciones */}
      <Card title={`Cotizaciones (${cotizaciones.length})`}>
        {cotizaciones.length === 0 ? (
          <EmptyState
            titulo="Sin cotizaciones"
            mensaje="Todavia no recibiste cotizaciones para este pedido. Los talleres compatibles ya fueron notificados."
          />
        ) : (
          <div className="space-y-3">
            {cotizaciones.map(cot => (
              <div
                key={cot.id}
                data-estado={cot.estado}
                className={`border rounded-lg p-4 ${
                  cot.estado === 'ACEPTADA'
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{cot.taller.nombre}</p>
                  </div>
                  <Badge variant={
                    cot.estado === 'ENVIADA' ? 'default' :
                    cot.estado === 'ACEPTADA' ? 'success' :
                    cot.estado === 'RECHAZADA' ? 'error' : 'muted'
                  }>
                    {cot.estado}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-sm">
                  <div><span className="text-gray-500">Proceso:</span> <span className="font-medium">{cot.proceso}</span></div>
                  <div><span className="text-gray-500">Precio:</span> <span className="font-medium">$ {cot.precio.toLocaleString('es-AR')}</span></div>
                  <div><span className="text-gray-500">Plazo:</span> <span className="font-medium">{cot.plazoDias} dias</span></div>
                </div>
                {cot.mensaje && <p className="text-sm text-gray-600 mt-2 italic">{cot.mensaje}</p>}
                {cot.imagenes && cot.imagenes.length > 0 && (
                  <CotizacionImagenes imagenes={cot.imagenes} />
                )}
                {cot.estado === 'ENVIADA' && pedido.estado === 'PUBLICADO' && (
                  <div className="flex gap-2 mt-3">
                    <AceptarCotizacion cotizacionId={cot.id} />
                    <RechazarCotizacion cotizacionId={cot.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Ordenes de manufactura */}
      <Card title={`Órdenes de manufactura (${pedido.ordenes.length})`}>
        {pedido.ordenes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500 text-sm">
              {pedido.estado === 'BORRADOR'
                ? 'Asigná un taller para comenzar la producción.'
                : 'Este pedido no tiene órdenes de manufactura.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedido.ordenes.map((orden) => (
              <div
                key={orden.id}
                className="border border-gray-100 rounded-lg p-4 space-y-3"
              >
                {orden.estado === 'PENDIENTE' && (
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3">
                    <p className="text-sm text-yellow-800 font-medium">
                      Esperando que el taller acepte esta orden de manufactura
                    </p>
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-overpass font-semibold text-brand-blue">{orden.moId}</p>
                    <p className="text-sm text-gray-600">
                      Taller: {orden.taller.nombre}
                    </p>
                  </div>
                  <Badge variant={ordenStatusVariant[orden.estado] || 'default'}>
                    {orden.estado === 'PENDIENTE'
                      ? 'Pendiente de aceptacion'
                      : (ordenStatusLabel[orden.estado] || orden.estado)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Proceso:</span>
                    <p className="font-medium">{orden.proceso}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Precio:</span>
                    <p className="font-medium">$ {orden.precio.toLocaleString('es-AR')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Plazo:</span>
                    <p className="font-medium">{orden.plazoDias} dias</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Creada:</span>
                    <p className="font-medium">{new Date(orden.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progreso</span>
                      <span className="font-medium">{orden.progreso}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-brand-blue rounded-full transition-all"
                        style={{ width: `${Math.min(orden.progreso, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Contacto talleres asignados */}
      {pedido.ordenes.length > 0 && (
        <Card>
          <h2 className="font-overpass font-semibold text-gray-700 text-sm uppercase mb-3">
            Contacto talleres
          </h2>
          <div className="space-y-3">
            {pedido.ordenes.map((orden) => (
              <div key={orden.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{orden.taller.nombre}</p>
                  <p className="text-xs text-gray-500">{orden.moId}</p>
                </div>
                {orden.taller.user.phone ? (
                  <a
                    href={`https://wa.me/${orden.taller.user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, te contacto por la orden ${orden.moId} del pedido ${pedido.omId}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Sin telefono registrado</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {actividad.length > 0 && (
        <Card>
          <h2 className="font-overpass font-bold text-brand-blue mb-3">Actividad del pedido</h2>
          <ActivityTimeline eventos={actividad} perspective="marca" />
        </Card>
      )}
    </div>
  )
}
