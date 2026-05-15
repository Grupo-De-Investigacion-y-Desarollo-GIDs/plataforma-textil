import { NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get('limit')
  const limit = Math.min(Math.max(parseInt(limitParam ?? '4', 10) || 4, 1), 20)

  const novedades = await prisma.novedad.findMany({
    where: { publicado: true },
    orderBy: { fecha: 'desc' },
    take: limit,
    select: {
      id: true,
      tipo: true,
      titulo: true,
      slug: true,
      fecha: true,
      imagenUrl: true,
    },
  })

  return NextResponse.json({ novedades })
}
