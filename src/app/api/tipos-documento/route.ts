import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { invalidarCacheNivel } from '@/compartido/lib/nivel'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const tipos = await prisma.tipoDocumento.findMany({
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json(tipos)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener tipos de documento' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ESTADO') return NextResponse.json({ error: 'Requiere rol: ESTADO', code: 'INSUFFICIENT_ROLE', rolesRequeridos: ['ESTADO'] }, { status: 403 })

    const body = await req.json()
    if (!body.nombre?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    if (!body.label?.trim()) return NextResponse.json({ error: 'Label requerido' }, { status: 400 })
    if (!body.nivelMinimo) return NextResponse.json({ error: 'Nivel mínimo requerido' }, { status: 400 })

    const tipo = await prisma.tipoDocumento.create({
      data: {
        nombre: body.nombre.trim(),
        label: body.label.trim(),
        descripcion: body.descripcion?.trim() || null,
        enlaceTramite: body.enlaceTramite?.trim() || null,
        costoEstimado: body.costoEstimado?.trim() || null,
        nivelMinimo: body.nivelMinimo,
        requerido: body.requerido ?? true,
        activo: body.activo ?? true,
        orden: body.orden ?? 0,
        puntosOtorgados: body.puntosOtorgados ?? 10,
      },
    })

    invalidarCacheNivel()
    return NextResponse.json(tipo, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un tipo de documento con ese nombre' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al crear tipo de documento' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ESTADO') return NextResponse.json({ error: 'Requiere rol: ESTADO', code: 'INSUFFICIENT_ROLE', rolesRequeridos: ['ESTADO'] }, { status: 403 })

    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    if (!body.nombre?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

    const data: Record<string, unknown> = {
      nombre: body.nombre.trim(),
      descripcion: body.descripcion?.trim() || null,
      requerido: body.requerido ?? true,
      activo: body.activo ?? true,
    }
    if (body.puntosOtorgados !== undefined) data.puntosOtorgados = body.puntosOtorgados

    const tipo = await prisma.tipoDocumento.update({
      where: { id: body.id },
      data,
    })

    invalidarCacheNivel()
    return NextResponse.json(tipo)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un tipo de documento con ese nombre' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al actualizar tipo de documento' }, { status: 500 })
  }
}
