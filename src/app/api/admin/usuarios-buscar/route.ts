import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { apiHandler } from '@/compartido/lib/api-errors'
import { requiereRolApi } from '@/compartido/lib/permisos'

export const GET = apiHandler(async (req: NextRequest) => {
  const sesion = await requiereRolApi(['ADMIN', 'ESTADO'])
  if (sesion instanceof NextResponse) return sesion

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
