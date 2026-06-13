import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'

export async function GET(req: NextRequest) {
  try {
    const sesion = await requiereRolApi(['ADMIN'])
    if (sesion instanceof NextResponse) return sesion

    const grupo = req.nextUrl.searchParams.get('grupo')
    const config = await prisma.configuracionSistema.findMany({
      ...(grupo ? { where: { grupo } } : {}),
      // K-05: select explicito — los callers (admin/configuracion, integraciones/llm)
      // solo leen clave + valor. Evita filtrar campos nuevos del modelo.
      select: { clave: true, valor: true },
      orderBy: { clave: 'asc' },
    })
    return NextResponse.json({ configs: config })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sesion = await requiereRolApi(['ADMIN'])
    if (sesion instanceof NextResponse) return sesion

    const body = await req.json()
    await prisma.configuracionSistema.upsert({
      where: { clave: body.clave },
      update: { valor: body.valor },
      create: { clave: body.clave, valor: body.valor, grupo: body.grupo },
      // K-05: los callers no leen el body de la respuesta del PUT (solo res.ok).
      select: { clave: true },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
