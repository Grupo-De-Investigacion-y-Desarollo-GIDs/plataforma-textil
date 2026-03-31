import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const taller = await prisma.taller.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, phone: true, name: true } },
        procesos: { include: { proceso: true } },
        prendas: { include: { prenda: true } },
        maquinaria: true,
        certificaciones: true,
        validaciones: true,
      },
    })

    if (!taller) {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
    }

    return NextResponse.json(taller)
  } catch (error) {
    console.error('Error en GET /api/talleres/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const role = (session.user as { role?: string }).role

    // Ownership check: solo el dueño o ADMIN
    const existing = await prisma.taller.findUnique({ where: { id }, select: { userId: true } })
    if (!existing) return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
    if (existing.userId !== session.user.id && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin acceso a este taller' }, { status: 403 })
    }

    const body = await req.json()

    // Build update data with only provided fields
    const data: Record<string, unknown> = {}
    const fields = [
      'nombre', 'ubicacion', 'zona', 'descripcion',
      'capacidadMensual', 'trabajadoresRegistrados', 'fundado',
      // Wizard fields
      'sam', 'prendaPrincipal', 'organizacion', 'metrosCuadrados',
      'areas', 'experienciaPromedio', 'polivalencia', 'horario',
      'registroProduccion', 'escalabilidad', 'paradasFrecuencia', 'puntaje',
    ]
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f]
    }

    // Maquinaria: replace all if provided
    if (Array.isArray(body.maquinaria)) {
      await prisma.maquinaria.deleteMany({ where: { tallerId: id } })
      if (body.maquinaria.length > 0) {
        await prisma.maquinaria.createMany({
          data: body.maquinaria.map((m: { nombre: string; cantidad?: number; tipo?: string }) => ({
            tallerId: id,
            nombre: m.nombre,
            cantidad: m.cantidad ?? 1,
            tipo: m.tipo,
          })),
        })
      }
    }

    // Procesos: replace all if provided (array of procesoId strings)
    if (Array.isArray(body.procesosIds)) {
      await prisma.tallerProceso.deleteMany({ where: { tallerId: id } })
      if (body.procesosIds.length > 0) {
        await prisma.tallerProceso.createMany({
          data: body.procesosIds.map((procesoId: string) => ({ tallerId: id, procesoId })),
          skipDuplicates: true,
        })
      }
    }

    // Prendas: replace all if provided (array of prendaId strings)
    if (Array.isArray(body.prendasIds)) {
      await prisma.tallerPrenda.deleteMany({ where: { tallerId: id } })
      if (body.prendasIds.length > 0) {
        await prisma.tallerPrenda.createMany({
          data: body.prendasIds.map((prendaId: string) => ({ tallerId: id, prendaId })),
          skipDuplicates: true,
        })
      }
    }

    const taller = await prisma.taller.update({
      where: { id },
      data,
      include: {
        maquinaria: true,
        procesos: { include: { proceso: true } },
        prendas: { include: { prenda: true } },
      },
    })

    return NextResponse.json(taller)
  } catch (error) {
    console.error('Error en PUT /api/talleres/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
