import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { modoActivo } from '@/compartido/lib/roles'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // K-01 C1: este GET exponia PII (email/telefono/CUIT + pedidos) sin auth.
    // Gate: mismo modelo que el PUT de este archivo (dueño o ADMIN) + ESTADO
    // para lectura de supervision. El GET no tiene callers de fetch; las
    // paginas publicas (perfil-marca/[id], directorio) leen Prisma directo.
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const role = modoActivo(session.user)

    const marca = await prisma.marca.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        nombre: true,
        cuit: true,
        ubicacion: true,
        tipo: true,
        website: true,
        volumenMensual: true,
        frecuenciaCompra: true,
        rating: true,
        pedidosRealizados: true,
        verificadoAfip: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { email: true, name: true, phone: true, avatar: true } },
        pedidos: { select: { id: true, omId: true, estado: true, tipoPrenda: true, cantidad: true, fechaCreacion: true } },
      },
    })

    if (!marca) {
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
    }

    const esDueno = marca.userId === session.user.id
    const esSupervision = role === 'ADMIN' || role === 'ESTADO'
    if (!esDueno && !esSupervision) {
      return NextResponse.json({ error: 'Sin acceso a esta marca' }, { status: 403 })
    }

    return NextResponse.json(marca)
  } catch (error) {
    console.error('Error en GET /api/marcas/[id]:', error)
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
    const role = modoActivo(session.user)

    // Ownership check: solo el dueño o ADMIN
    const existing = await prisma.marca.findUnique({ where: { id }, select: { userId: true } })
    if (!existing) return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
    if (existing.userId !== session.user.id && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin acceso a esta marca' }, { status: 403 })
    }

    const body = await req.json()

    const marca = await prisma.marca.update({
      where: { id },
      data: {
        nombre: body.nombre,
        ubicacion: body.ubicacion,
        tipo: body.tipo,
        website: body.website,
        volumenMensual: body.volumenMensual,
        frecuenciaCompra: body.frecuenciaCompra,
      },
    })

    return NextResponse.json(marca)
  } catch (error) {
    console.error('Error en PUT /api/marcas/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
