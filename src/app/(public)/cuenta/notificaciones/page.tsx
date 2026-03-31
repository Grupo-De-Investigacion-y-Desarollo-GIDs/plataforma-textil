export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Bell, CheckCircle2 } from 'lucide-react'

async function markAllAsRead() {
  'use server'

  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=%2Fcuenta%2Fnotificaciones')
  }

  await prisma.notificacion.updateMany({
    where: { userId: session.user.id, leida: false },
    data: { leida: true },
  })

  revalidatePath('/cuenta/notificaciones')
}

export default async function NotificacionesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=%2Fcuenta%2Fnotificaciones')
  }

  const notificaciones = await prisma.notificacion.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const sinLeer = notificaciones.filter((n) => !n.leida).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Notificaciones</h1>
        <form action={markAllAsRead}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-overpass font-semibold text-brand-blue hover:bg-gray-50 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Marcar todas como leidas
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-600">Total: {notificaciones.length} | Sin leer: {sinLeer}</p>

      {notificaciones.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Bell className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No tenes notificaciones por ahora.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificaciones.map((n) => (
            <article key={n.id} className={`rounded-xl border p-4 bg-white ${n.leida ? 'border-gray-200' : 'border-brand-blue/30 bg-brand-bg-light/30'}`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="font-overpass font-semibold text-brand-blue">{n.titulo}</h2>
                {!n.leida && <span className="text-xs font-overpass font-semibold text-brand-red">NUEVA</span>}
              </div>
              <p className="text-sm text-gray-700 mb-2">{n.mensaje}</p>
              <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString('es-AR')}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}