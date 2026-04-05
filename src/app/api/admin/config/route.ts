import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const grupo = req.nextUrl.searchParams.get('grupo')
    const config = await prisma.configuracionSistema.findMany({
      ...(grupo ? { where: { grupo } } : {}),
      orderBy: { clave: 'asc' },
    })
    return NextResponse.json({ configs: config })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const config = await prisma.configuracionSistema.upsert({
      where: { clave: body.clave },
      update: { valor: body.valor },
      create: { clave: body.clave, valor: body.valor, grupo: body.grupo },
    })
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
