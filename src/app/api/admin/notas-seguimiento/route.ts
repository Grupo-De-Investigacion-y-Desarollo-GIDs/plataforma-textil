import { NextRequest, NextResponse } from 'next/server'
import { apiHandler, errorAuthRequired, errorForbidden, errorInvalidInput, errorResponse } from '@/compartido/lib/api-errors'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { z } from 'zod'

const SchemaCrearNota = z.object({
  userId: z.string().min(1),
  contenido: z.string().min(3).max(2000),
})

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()
  if (!['ADMIN', 'ESTADO'].includes(session.user.role)) {
    return errorForbidden('ADMIN o ESTADO')
  }

  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return errorResponse({ code: 'INVALID_INPUT', message: 'userId requerido', status: 400 })

  const notas = await prisma.notaSeguimiento.findMany({
    where: { userId },
    include: { autor: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ notas })
})

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()
  if (!['ADMIN', 'ESTADO'].includes(session.user.role)) {
    return errorForbidden('ADMIN o ESTADO')
  }

  const body = await req.json()
  const parsed = SchemaCrearNota.safeParse(body)
  if (!parsed.success) return errorInvalidInput(parsed.error)

  const nota = await prisma.notaSeguimiento.create({
    data: {
      userId: parsed.data.userId,
      autorId: session.user.id,
      contenido: parsed.data.contenido,
    },
    include: { autor: { select: { name: true, role: true } } },
  })

  return NextResponse.json({ nota }, { status: 201 })
})
