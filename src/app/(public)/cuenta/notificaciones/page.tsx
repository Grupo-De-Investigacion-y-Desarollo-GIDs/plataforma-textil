export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { NotificacionesLista } from './notificaciones-lista'

export default async function NotificacionesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=%2Fcuenta%2Fnotificaciones')

  const notificaciones = await prisma.notificacion.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return <NotificacionesLista notificaciones={notificaciones} />
}
