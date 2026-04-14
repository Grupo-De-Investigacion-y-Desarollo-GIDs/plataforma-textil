export const dynamic = 'force-dynamic'

import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Mail, Bell, BellOff, Send, Users } from 'lucide-react'
import NotificacionesClient from './notificaciones-client'

type Tab = 'comunicaciones' | 'historial'

const canalLabels: Record<string, string> = {
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  PUSH: 'Push',
  PLATAFORMA: 'In-app',
}

export default async function AdminNotificacionesPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }> | { tab?: string }
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') redirect('/unauthorized')

  const params = await Promise.resolve(searchParams ?? {})
  const tab: Tab = params.tab === 'historial' ? 'historial' : 'comunicaciones'

  const [total, sinLeer] = await Promise.all([
    prisma.notificacion.count(),
    prisma.notificacion.count({ where: { leida: false } }),
  ])

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Centro de Notificaciones</h1>
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Link
          href="?tab=comunicaciones"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'comunicaciones' ? 'bg-brand-blue text-white' : 'border border-gray-300 text-gray-600'
          }`}
        >
          Comunicaciones del admin
        </Link>
        <Link
          href="?tab=historial"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'historial' ? 'bg-brand-blue text-white' : 'border border-gray-300 text-gray-600'
          }`}
        >
          Notificaciones del sistema
        </Link>
      </div>

      {tab === 'comunicaciones' && <ComunicacionesTab />}
      {tab === 'historial' && <HistorialTab />}
    </div>
  )
}

async function ComunicacionesTab() {
  const batches = await prisma.notificacion.groupBy({
    by: ['batchId'],
    where: { createdById: { not: null }, batchId: { not: null } },
    _count: true,
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: 'desc' } },
    take: 30,
  })

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
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
        <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Todavia no enviaste ninguna comunicacion</p>
      </div>
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

async function HistorialTab() {
  const notificaciones = await prisma.notificacion.findMany({
    where: { createdById: null },
    include: {
      user: { select: { name: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  if (notificaciones.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">El sistema no genero notificaciones todavia</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
      {notificaciones.map(n => (
        <div key={n.id} className="px-5 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-gray-800 truncate">{n.titulo}</p>
              {!n.leida && (
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" aria-label="Sin leer" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.mensaje}</p>
            <p className="text-xs text-gray-400 mt-1">
              Para: {n.user.name ?? 'Usuario'} ({n.user.role})
              {' | '}{canalLabels[n.canal] ?? n.canal}
              {' | '}{n.createdAt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            </p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${n.leida ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
            {n.leida ? 'Leida' : 'Sin leer'}
          </span>
        </div>
      ))}
    </div>
  )
}
