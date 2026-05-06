import { NextRequest, NextResponse } from 'next/server'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { sincronizarTaller } from '@/compartido/lib/arca'
import { prisma } from '@/compartido/lib/prisma'
import { logActividad } from '@/compartido/lib/log'
import { apiHandler } from '@/compartido/lib/api-errors'

// POST /api/estado/arca/reverificar/[id] — Re-verificar un taller individual contra ARCA
export const POST = apiHandler(async (
  _req: NextRequest,
  { params },
) => {
  const sesion = await requiereRolApi(['ESTADO', 'ADMIN'])
  if (sesion instanceof NextResponse) return sesion

  const { id } = await params!

  const taller = await prisma.taller.findUnique({
    where: { id: id as string },
    select: { id: true, nombre: true, cuit: true },
  })

  if (!taller) {
    return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
  }

  const resultado = await sincronizarTaller(taller.id, true, sesion.userId)

  logActividad('ARCA_REVERIFICACION', sesion.userId, {
    tallerId: taller.id,
    nombre: taller.nombre,
    cuit: taller.cuit,
    exitosa: resultado.exitosa,
    error: resultado.error,
  })

  if (resultado.exitosa) {
    const actualizado = await prisma.taller.findUnique({
      where: { id: id as string },
      select: {
        verificadoAfip: true,
        verificadoAfipAt: true,
        tipoInscripcionAfip: true,
        estadoCuitAfip: true,
        categoriaMonotributo: true,
        actividadesAfip: true,
      },
    })
    return NextResponse.json({ exitosa: true, taller: actualizado })
  }

  return NextResponse.json({
    exitosa: false,
    error: resultado.error,
    duracionMs: resultado.duracionMs,
  })
})
