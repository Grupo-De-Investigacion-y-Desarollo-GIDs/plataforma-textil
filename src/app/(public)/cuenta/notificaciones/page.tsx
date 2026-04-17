export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import Link from 'next/link'
import { NotificacionesLista } from './notificaciones-lista'

type Tab = 'comunicaciones' | 'historial'

export default async function NotificacionesPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }> | { tab?: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=%2Fcuenta%2Fnotificaciones')

  const params = await Promise.resolve(searchParams ?? {})
  const tab: Tab = params.tab === 'historial' ? 'historial' : 'comunicaciones'

  const where: Record<string, unknown> = { userId: session.user.id }
  if (tab === 'comunicaciones') {
    where.createdById = { not: null }
  } else {
    where.createdById = null
  }

  const notificaciones = await prisma.notificacion.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Link
          href="?tab=comunicaciones"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'comunicaciones' ? 'bg-brand-blue text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Comunicaciones
        </Link>
        <Link
          href="?tab=historial"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'historial' ? 'bg-brand-blue text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Historial del sistema
        </Link>
      </div>

      <NotificacionesLista
        notificaciones={notificaciones}
        emptyMessage={
          tab === 'comunicaciones'
            ? 'No recibiste comunicaciones todavia.'
            : 'El sistema no genero notificaciones para vos todavia.'
        }
      />
    </div>
  )
}
