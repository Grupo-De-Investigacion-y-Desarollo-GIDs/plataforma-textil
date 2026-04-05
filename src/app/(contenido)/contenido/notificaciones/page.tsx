export const dynamic = 'force-dynamic'

import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { redirect } from 'next/navigation'
import { Mail, Bell, BellOff, Send } from 'lucide-react'
import NotificacionesClient from '@/app/(admin)/admin/notificaciones/notificaciones-client'

export default async function ContenidoNotificacionesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const [notificaciones, total, sinLeer] = await Promise.all([
    prisma.notificacion.findMany({
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.notificacion.count(),
    prisma.notificacion.count({ where: { leida: false } }),
  ])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Notificaciones</h1>
          <p className="text-gray-500 text-sm">Envio de comunicaciones a talleres</p>
        </div>
        <NotificacionesClient />
      </div>

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

      <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Recientes</h2>
      {notificaciones.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
          <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No hay notificaciones enviadas todavia</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {notificaciones.map(n => (
            <div key={n.id} className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-gray-800 truncate">{n.titulo}</p>
                  {!n.leida && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" aria-label="Sin leer" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.mensaje}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Para: {n.user.name ?? 'Usuario'} ({n.user.role})
                  {' | '}{n.createdAt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${n.leida ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
                {n.leida ? 'Leida' : 'Sin leer'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
