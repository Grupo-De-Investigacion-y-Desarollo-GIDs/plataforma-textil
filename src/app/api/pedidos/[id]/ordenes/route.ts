import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { apiHandler, errorAuthRequired, errorForbidden } from '@/compartido/lib/api-errors'

async function checkPedidoAccess(pedidoId: string, userId: string, role: string | undefined) {
  if (role === 'ADMIN') return true
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    select: { marca: { select: { userId: true } } },
  })
  return pedido?.marca.userId === userId
}

export const GET = apiHandler(async (_req: NextRequest, ctx) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()
  const role = (session.user as { role?: string }).role

  const { id } = await ctx.params!

  if (!(await checkPedidoAccess(id as string, session.user.id!, role))) {
    return errorForbidden()
  }

  const ordenes = await prisma.ordenManufactura.findMany({
    where: { pedidoId: id as string },
    include: {
      taller: { select: { id: true, nombre: true, nivel: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(ordenes)
})
