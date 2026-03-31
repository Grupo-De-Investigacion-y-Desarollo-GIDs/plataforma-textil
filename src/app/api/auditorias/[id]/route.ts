import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN' && role !== 'ESTADO') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    const auditoria = await prisma.auditoria.findUnique({
      where: { id },
      include: { taller: { select: { nombre: true, nivel: true, ubicacion: true } }, acciones: true },
    })
    if (!auditoria) return NextResponse.json({ error: 'Auditoria no encontrada' }, { status: 404 })
    return NextResponse.json(auditoria)
  } catch (error) {
    console.error('Error en GET /api/auditorias/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN' && role !== 'ESTADO') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const auditoria = await prisma.auditoria.update({
      where: { id },
      data: {
        estado: body.estado,
        resultado: body.resultado,
        hallazgos: body.hallazgos,
        fecha: body.fecha ? new Date(body.fecha) : undefined,
      },
    })
    return NextResponse.json(auditoria)
  } catch (error) {
    console.error('Error en PUT /api/auditorias/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
