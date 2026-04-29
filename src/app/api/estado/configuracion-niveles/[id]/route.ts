import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { logAccionAdmin } from '@/compartido/lib/log'
import { invalidarCacheNivel } from '@/compartido/lib/nivel'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requiereRolApi(['ESTADO'])
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params
    const body = await req.json()

    const existing = await prisma.reglaNivel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Regla no encontrada' }, { status: 404 })
    }

    if (body.puntosMinimos !== undefined && body.puntosMinimos < 0) {
      return NextResponse.json({ error: 'Puntos minimos debe ser >= 0' }, { status: 400 })
    }
    if (body.certificadosAcademiaMin !== undefined && body.certificadosAcademiaMin < 0) {
      return NextResponse.json({ error: 'Certificados minimos debe ser >= 0' }, { status: 400 })
    }

    const regla = await prisma.reglaNivel.update({
      where: { id },
      data: {
        puntosMinimos: body.puntosMinimos ?? existing.puntosMinimos,
        requiereVerificadoAfip: body.requiereVerificadoAfip ?? existing.requiereVerificadoAfip,
        certificadosAcademiaMin: body.certificadosAcademiaMin ?? existing.certificadosAcademiaMin,
        descripcion: body.descripcion !== undefined ? body.descripcion : existing.descripcion,
        beneficios: body.beneficios ?? existing.beneficios,
      },
    })

    invalidarCacheNivel()

    logAccionAdmin('REGLA_NIVEL_EDITADA', authResult.userId, {
      entidad: 'configuracion',
      entidadId: id,
      metadata: { nivel: existing.nivel, cambios: body },
    })

    return NextResponse.json(regla)
  } catch (error) {
    console.error('Error en PUT /api/estado/configuracion-niveles/[id]:', error)
    return NextResponse.json({ error: 'Error al actualizar regla' }, { status: 500 })
  }
}
