import { NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { apiHandler, errorAuthRequired, errorNotFound } from '@/compartido/lib/api-errors'

export const GET = apiHandler(async () => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()

  const taller = await prisma.taller.findUnique({
    where: { userId: session.user.id! },
    include: { maquinaria: true },
  })

  if (!taller) return errorNotFound('taller')

  return NextResponse.json(taller)
})
