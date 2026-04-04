import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Solo ADMIN' }, { status: 403 })

    const { searchParams } = req.nextUrl
    const tallerId = searchParams.get('tallerId')
    const marcaId = searchParams.get('marcaId')

    if (!tallerId && !marcaId) {
      return NextResponse.json({ error: 'tallerId o marcaId requerido' }, { status: 400 })
    }

    const where: Record<string, string> = {}
    if (tallerId) where.tallerId = tallerId
    if (marcaId) where.marcaId = marcaId

    const notas = await prisma.notaInterna.findMany({
      where,
      include: { admin: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notas)
  } catch (error) {
    console.error('Error en GET /api/admin/notas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Solo ADMIN' }, { status: 403 })

    const { texto, tallerId, marcaId } = await req.json()

    if (!texto?.trim()) {
      return NextResponse.json({ error: 'Texto requerido' }, { status: 400 })
    }
    if (!tallerId && !marcaId) {
      return NextResponse.json({ error: 'tallerId o marcaId requerido' }, { status: 400 })
    }

    const nota = await prisma.notaInterna.create({
      data: {
        texto: texto.trim(),
        adminId: session.user.id,
        ...(tallerId ? { tallerId } : {}),
        ...(marcaId ? { marcaId } : {}),
      },
      include: { admin: { select: { name: true } } },
    })

    return NextResponse.json(nota, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/admin/notas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
