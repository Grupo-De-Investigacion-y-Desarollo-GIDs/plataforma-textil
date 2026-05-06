import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { apiHandler, errorAuthRequired, errorForbidden } from '@/compartido/lib/api-errors'

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) return errorAuthRequired()
  if (!['ADMIN', 'ESTADO'].includes(session.user.role)) return errorForbidden('ADMIN o ESTADO')

  const url = req.nextUrl.searchParams
  const q = url.get('q') || ''
  const id = url.get('id') || ''

  const where: Record<string, unknown> = {}

  if (id) {
    where.id = id
  } else if (q.length >= 2) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ]
  } else {
    return NextResponse.json({ usuarios: [] })
  }

  const usuarios = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true },
    take: 10,
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ usuarios })
})
