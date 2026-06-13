export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import Link from 'next/link'
import { NotificacionesLista } from './notificaciones-lista'
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'

type Tab = 'todas' | 'comunicaciones' | 'sistema'

export default async function NotificacionesPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }> | { tab?: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=%2Fcuenta%2Fnotificaciones')

  const params = await Promise.resolve(searchParams ?? {})
  const rawTab = params.tab
  const tab: Tab = rawTab === 'historial' || rawTab === 'sistema'
    ? 'sistema'
    : rawTab === 'comunicaciones'
    ? 'comunicaciones'
    : 'todas'

  const where: Record<string, unknown> = { userId: session.user.id }
  if (tab === 'comunicaciones') {
    where.createdById = { not: null }
  } else if (tab === 'sistema') {
    where.createdById = null
  }

  const notificaciones = await prisma.notificacion.findMany({
    where,
    include: {
      creadaPor: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Mi cuenta', href: '/cuenta' },
        { label: 'Notificaciones' },
      ]} />
      <div className="flex gap-2">
        <Link
          href="/cuenta/notificaciones"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'todas' ? 'bg-brand-blue text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Todas
        </Link>
        <Link
          href="?tab=comunicaciones"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'comunicaciones' ? 'bg-brand-blue text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Comunicaciones
        </Link>
        <Link
          href="?tab=sistema"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'sistema' ? 'bg-brand-blue text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Sistema
        </Link>
      </div>

      <NotificacionesLista
        notificaciones={notificaciones}
        emptyMessage={
          tab === 'todas'
            ? 'Estas al dia. No tenes notificaciones.'
            : tab === 'comunicaciones'
            ? 'No recibiste comunicaciones todavia.'
            : 'Sin alertas del sistema.'
        }
      />
    </div>
  )
}
