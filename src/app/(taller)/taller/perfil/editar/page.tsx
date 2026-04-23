export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { EditarPerfilForm } from './editar-form'

export default async function EditarPerfilPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    include: {
      user: { select: { email: true, name: true, phone: true } },
    },
  })

  if (!taller) redirect('/taller/perfil/completar')

  return <EditarPerfilForm taller={taller} />
}
