import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { modoActivo } from '@/compartido/lib/roles'

// K-05/§6.8: el GET de esta ruta era codigo muerto (sin callers de fetch; las
// paginas publicas leen Prisma directo). Se elimino por completo — menos superficie
// que un GET protegido. Las lecturas de marca van por Prisma server-side.

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

    // K-05: el unico caller (contactar-taller) solo chequea res.ok; no lee el body.
    await prisma.marca.update({
      where: { id },
      data: {
        nombre: body.nombre,
        ubicacion: body.ubicacion,
        tipo: body.tipo,
        website: body.website,
        volumenMensual: body.volumenMensual,
        frecuenciaCompra: body.frecuenciaCompra,
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en PUT /api/marcas/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
