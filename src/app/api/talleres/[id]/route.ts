import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { logAccionAdmin } from '@/compartido/lib/log'

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
      'nombre', 'ubicacion', 'website', 'provincia', 'partido', 'ubicacionDetalle', 'descripcion',
      'capacidadMensual', 'trabajadoresRegistrados', 'fundado',
      'sam', 'prendaPrincipal', 'organizacion', 'metrosCuadrados',
      'areas', 'experienciaPromedio', 'polivalencia', 'horario',
      'registroProduccion', 'escalabilidad', 'paradasFrecuencia',
      'portfolioFotos',
    ]
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f]
    }

    // Todo en una transacción atómica
    await prisma.$transaction(async (tx) => {
      // Maquinaria: replace all if provided
      if (Array.isArray(body.maquinaria)) {
        await tx.maquinaria.deleteMany({ where: { tallerId: id } })
        if (body.maquinaria.length > 0) {
          await tx.maquinaria.createMany({
            data: body.maquinaria.map((m: { nombre: string; cantidad?: number; tipo?: string }) => ({
              tallerId: id,
              nombre: m.nombre,
              cantidad: m.cantidad ?? 1,
              tipo: m.tipo,
            })),
          })
        }
      }

      // Procesos: replace all if provided
      if (Array.isArray(body.procesosIds)) {
        await tx.tallerProceso.deleteMany({ where: { tallerId: id } })
        if (body.procesosIds.length > 0) {
          await tx.tallerProceso.createMany({
            data: body.procesosIds.map((procesoId: string) => ({ tallerId: id, procesoId })),
            skipDuplicates: true,
          })
        }
      }

      // Prendas: replace all if provided
      if (Array.isArray(body.prendasIds)) {
        await tx.tallerPrenda.deleteMany({ where: { tallerId: id } })
        if (body.prendasIds.length > 0) {
          await tx.tallerPrenda.createMany({
            data: body.prendasIds.map((prendaId: string) => ({ tallerId: id, prendaId })),
            skipDuplicates: true,
          })
        }
      }

      // Taller update
      await tx.taller.update({ where: { id }, data })

      // User update — solo name y phone
      if (body.user && typeof body.user === 'object') {
        const userData: Record<string, unknown> = {}
        if (typeof body.user.name === 'string') {
          userData.name = body.user.name.trim() || null
        }
        if (typeof body.user.phone === 'string') {
          userData.phone = body.user.phone.trim() || null
        }
        if (Object.keys(userData).length > 0) {
          await tx.user.update({
            where: { id: existing.userId },
            data: userData,
          })
        }
      }
    })

    // Log solo si es ADMIN editando taller de otro
    if (role === 'ADMIN' && existing.userId !== session.user.id) {
      logAccionAdmin('ADMIN_TALLER_EDITADO', session.user.id, {
        entidad: 'taller',
        entidadId: id,
        cambios: data,
      })
    }

    // Re-fetch con includes para el response
    const taller = await prisma.taller.findUnique({
      where: { id },
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
