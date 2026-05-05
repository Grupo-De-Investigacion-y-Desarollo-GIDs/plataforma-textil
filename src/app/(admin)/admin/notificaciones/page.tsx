export const dynamic = 'force-dynamic'

import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Mail, Bell, BellOff, Send, Users } from 'lucide-react'
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import NotificacionesClient from './notificaciones-client'

const canalLabels: Record<string, string> = {
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  PUSH: 'Push',
  PLATAFORMA: 'In-app',
}

export default async function AdminNotificacionesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') redirect('/unauthorized')

  const adminWhere = { createdById: { not: null } }
  const [total, sinLeer, batches] = await Promise.all([
    prisma.notificacion.count({ where: adminWhere }),
    prisma.notificacion.count({ where: { ...adminWhere, leida: false } }),
    prisma.notificacion.groupBy({
      by: ['batchId'],
      where: { createdById: { not: null }, batchId: { not: null } },
      _count: true,
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: 'desc' } },
      take: 30,
    }),
  ])

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Comunicaciones</h1>
          <p className="text-gray-500 text-sm">Envio de comunicaciones a usuarios</p>
        </div>
        <NotificacionesClient />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{total}</p>
              <p className="text-xs text-gray-500">Total enviadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <BellOff className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{sinLeer}</p>
              <p className="text-xs text-gray-500">Sin leer</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{total - sinLeer}</p>
              <p className="text-xs text-gray-500">Leidas</p>
            </div>
          </div>
        </div>
      </div>

      <ComunicacionesTab batches={batches} />

      <p className="text-xs text-gray-400 mt-6 text-center">
        Para ver la actividad del sistema, ir a{' '}
        <Link href="/admin/logs" className="text-brand-blue hover:underline">Logs del sistema</Link>
      </p>
    </div>
  )
}

async function ComunicacionesTab({ batches }: { batches: { batchId: string | null; _count: number; _max: { createdAt: Date | null } }[] }) {
  const batchIds = batches.map(b => b.batchId!).filter(Boolean)
  const ejemplos = batchIds.length > 0
    ? await prisma.notificacion.findMany({
        where: { batchId: { in: batchIds } },
        distinct: ['batchId'],
        select: {
          batchId: true,
          titulo: true,
          mensaje: true,
          canal: true,
          createdAt: true,
          creadaPor: { select: { name: true } },
        },
      })
    : []

  const comunicaciones = batches.map(b => {
    const ej = ejemplos.find(e => e.batchId === b.batchId)
    return {
      batchId: b.batchId!,
      destinatarios: b._count,
      titulo: ej?.titulo ?? '(sin titulo)',
      mensaje: ej?.mensaje ?? '',
      canal: ej?.canal ?? 'PLATAFORMA',
      createdAt: ej?.createdAt ?? new Date(),
      enviadoPor: ej?.creadaPor?.name ?? 'Sistema',
    }
  })

  if (comunicaciones.length === 0) {
    return (
      <EmptyState
        titulo="Sin comunicaciones enviadas"
        mensaje="Todavia no enviaste ninguna comunicacion. Usa el formulario de arriba para enviar la primera."
      />
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
      {comunicaciones.map(c => (
        <div key={c.batchId} className="px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-gray-800">{c.titulo}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.mensaje}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span>Enviado por: {c.enviadoPor}</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {c.destinatarios} destinatarios
                </span>
                <span>{canalLabels[c.canal] ?? c.canal}</span>
                <span>{c.createdAt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

