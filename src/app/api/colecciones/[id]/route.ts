import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { logAccionAdmin } from '@/compartido/lib/log'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // K-01 C3: este GET, ademas de ser anonimo, incluia `evaluacion: true`, que
    // filtra el answer-key (preguntas[].correcta). Gate a ADMIN/CONTENIDO (igual
    // que PUT/DELETE de este archivo y su unico caller: el panel de contenido) y
    // se elimina `evaluacion` del include. La correccion de la evaluacion ocurre
    // server-side en POST .../evaluacion (el cliente nunca necesita `correcta`).
    const sesion = await requiereRolApi(['ADMIN', 'CONTENIDO'])
    if (sesion instanceof NextResponse) return sesion

    const { id } = await params
    const coleccion = await prisma.coleccion.findUnique({
      where: { id },
      include: {
        videos: { orderBy: { orden: 'asc' } },
      },
    })

    if (!coleccion) {
      return NextResponse.json({ error: 'Coleccion no encontrada' }, { status: 404 })
    }

    return NextResponse.json(coleccion)
  } catch (error) {
    console.error('Error en GET /api/colecciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sesion = await requiereRolApi(['ADMIN', 'CONTENIDO'])
    if (sesion instanceof NextResponse) return sesion

    const { id } = await params
    const body = await req.json()
    const coleccion = await prisma.coleccion.update({
      where: { id },
      data: {
        titulo: body.titulo,
        descripcion: body.descripcion,
        categoria: body.categoria,
        duracion: body.duracion,
        institucion: body.institucion,
        orden: body.orden,
        activa: body.activa,
        imagenUrl: body.imagenUrl,
      },
    })
    logAccionAdmin('COLECCION_EDITADA', sesion.userId, {
      entidad: 'coleccion',
      entidadId: id,
      cambios: { titulo: body.titulo, activa: body.activa },
    })

    return NextResponse.json(coleccion)
  } catch (error) {
    console.error('Error en PUT /api/colecciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sesion = await requiereRolApi(['ADMIN', 'CONTENIDO'])
    if (sesion instanceof NextResponse) return sesion

    const { id } = await params
    await prisma.coleccion.delete({ where: { id } })
    logAccionAdmin('COLECCION_ELIMINADA', sesion.userId, {
      entidad: 'coleccion',
      entidadId: id,
    })
    return NextResponse.json({ message: 'Coleccion eliminada' })
  } catch (error) {
    console.error('Error en DELETE /api/colecciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
