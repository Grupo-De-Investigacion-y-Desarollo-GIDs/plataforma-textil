import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { aplicarNivel } from '@/compartido/lib/nivel'
import { logAccionAdmin } from '@/compartido/lib/log'

export async function GET(req: NextRequest) {
  try {
    const sesion = await requiereRolApi(['ADMIN', 'ESTADO'])
    if (sesion instanceof NextResponse) return sesion

    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tallerId = searchParams.get('tallerId')

    const where: Record<string, unknown> = {}
    if (tallerId) where.tallerId = tallerId

    const [certificados, total] = await Promise.all([
      prisma.certificado.findMany({
        where,
        include: {
          taller: { select: { id: true, nombre: true } },
          coleccion: { select: { id: true, titulo: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { fecha: 'desc' },
      }),
      prisma.certificado.count({ where }),
    ])

    return NextResponse.json({ certificados, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener certificados' }, { status: 500 })
  }
}

// PATCH /api/certificados — revocar certificado por id (admin)
export async function PATCH(req: NextRequest) {
  try {
    const sesion = await requiereRolApi(['ADMIN'])
    if (sesion instanceof NextResponse) return sesion

    const { id, motivo } = await req.json()
    if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

    const cert = await prisma.certificado.update({
      where: { id },
      data: { revocado: true },
      include: { taller: { select: { id: true } } },
    })

    await aplicarNivel(cert.taller.id, sesion.userId)

    logAccionAdmin('CERTIFICADO_REVOCADO', sesion.userId, {
      entidad: 'certificado',
      entidadId: id,
      motivo: motivo || 'Sin motivo',
      metadata: { tallerId: cert.taller.id },
    })

    return NextResponse.json(cert)
  } catch (error) {
    console.error('Error en PATCH /api/certificados:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sesion = await requiereRolApi(['ADMIN'])
    if (sesion instanceof NextResponse) return sesion

    const body = await req.json()
    const certificado = await prisma.certificado.create({
      data: {
        tallerId: body.tallerId,
        coleccionId: body.coleccionId,
        codigo: body.codigo,
        calificacion: body.calificacion,
      },
    })

    // Recalculate taller level after new certificate
    await aplicarNivel(body.tallerId, sesion.userId)

    logAccionAdmin('CERTIFICADO_EMITIDO', sesion.userId, {
      entidad: 'certificado',
      entidadId: certificado.id,
      metadata: { tallerId: body.tallerId, codigo: body.codigo },
    })

    return NextResponse.json(certificado, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear el certificado' }, { status: 500 })
  }
}
