import { NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'

export async function GET() {
  const authResult = await requiereRolApi(['ESTADO', 'ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  const reglas = await prisma.reglaNivel.findMany({
    orderBy: { puntosMinimos: 'asc' },
  })

  return NextResponse.json(reglas)
}
