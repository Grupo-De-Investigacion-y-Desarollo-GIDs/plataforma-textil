import { NextResponse } from 'next/server'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { prisma } from '@/compartido/lib/prisma'

export async function GET() {
  try {
    const sesion = await requiereRolApi(['ADMIN'])
    if (sesion instanceof NextResponse) return sesion

    const configs = await prisma.configuracionUpload.findMany({
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(configs)
  } catch (error) {
    console.error('[admin/configuracion-upload] GET error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
