export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Package, Clock, DollarSign, TrendingUp, CheckCircle } from 'lucide-react'
import { AsignarTaller } from './asignar-taller'
import { CancelarPedido } from './cancelar-pedido'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  BORRADOR: 'default',
  EN_EJECUCION: 'warning',
  COMPLETADO: 'success',
  CANCELADO: 'error',
}

const statusLabel: Record<string, string> = {
  BORRADOR: 'Borrador',
  EN_EJECUCION: 'En ejecución',
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
  { key: 'EN_EJECUCION', label: 'En ejecución' },
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
          taller: { select: { nombre: true, nivel: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!pedido || pedido.marcaId !== marca.id) notFound()

  const currentStep = getStepIndex(pedido.estado)
  const isCancelled = pedido.estado === 'CANCELADO'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/marca/pedidos" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline">
        <ArrowLeft className="w-4 h-4" /> Volver a pedidos
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-overpass font-bold text-3xl text-brand-blue">{pedido.omId}</h1>
          <p className="text-gray-600 mt-1">{pedido.tipoPrenda} - {pedido.cantidad.toLocaleString()} unidades</p>
          <p className="text-sm text-gray-400 mt-1">
            Creado: {new Date(pedido.createdAt).toLocaleDateString('es-AR')}
          </p>
        </div>
        <Badge variant={statusVariant[pedido.estado] || 'default'}>
          {statusLabel[pedido.estado] || pedido.estado}
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

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-3">
        {pedido.estado === 'BORRADOR' && (
          <AsignarTaller pedidoId={pedido.id} />
        )}
        {(pedido.estado === 'BORRADOR' || pedido.estado === 'EN_EJECUCION') && (
          <CancelarPedido pedidoId={pedido.id} />
        )}
      </div>

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
                className="border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="font-overpass font-semibold text-brand-blue">{orden.moId}</p>
                  <p className="text-sm text-gray-600">
                    Taller: {orden.taller.nombre} ({orden.taller.nivel})
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
                  <Badge variant={ordenStatusVariant[orden.estado] || 'default'}>
                    {ordenStatusLabel[orden.estado] || orden.estado}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
