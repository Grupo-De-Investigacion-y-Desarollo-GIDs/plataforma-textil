export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { NuevoPedidoForm } from './nuevo-pedido-form'

export default async function MarcaNuevoPedidoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'MARCA') redirect('/unauthorized')

  const marca = await prisma.marca.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!marca) redirect('/unauthorized')

  const procesos = await prisma.procesoProductivo.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' },
  })

  return <NuevoPedidoForm marcaId={marca.id} procesos={procesos} />
}
