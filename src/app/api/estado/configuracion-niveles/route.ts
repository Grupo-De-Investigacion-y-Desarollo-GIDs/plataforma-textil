import { NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'

export async function GET() {
  const authResult = await requiereRolApi(['ESTADO', 'ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  // K-05: select explicito — el panel de estado usa estos 7 campos de la regla.
  const reglas = await prisma.reglaNivel.findMany({
    select: {
      id: true,
      nivel: true,
      puntosMinimos: true,
      requiereVerificadoAfip: true,
      certificadosAcademiaMin: true,
      descripcion: true,
      beneficios: true,
    },
    orderBy: { puntosMinimos: 'asc' },
  })

  return NextResponse.json(reglas)
}
