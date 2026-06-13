import { NextRequest, NextResponse } from 'next/server'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { prisma } from '@/compartido/lib/prisma'
import { generarSlugUnico } from '@/compartido/lib/slugify'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sesion = await requiereRolApi(['CONTENIDO', 'ADMIN'])
  if (sesion instanceof NextResponse) return sesion

  const { id } = await params
  const body = await req.json()

  const currentNovedad = await prisma.novedad.findUnique({ where: { id } })
  if (!currentNovedad) {
    return NextResponse.json({ error: 'Novedad no encontrada' }, { status: 404 })
  }

  const updates: Record<string, unknown> = {
    titulo: body.titulo,
    descripcion: body.descripcion,
    tipo: body.tipo,
    imagenUrl: body.imagenUrl ?? null,
  }

  if (body.titulo && currentNovedad.titulo !== body.titulo) {
    updates.slug = await generarSlugUnico(body.titulo, id)
  }

  // K-05: el caller (formulario-novedad) solo chequea res.ok y redirige; no lee el body.
  await prisma.novedad.update({
    where: { id },
    data: updates,
    select: { id: true },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sesion = await requiereRolApi(['CONTENIDO', 'ADMIN'])
  if (sesion instanceof NextResponse) return sesion

  const { id } = await params

  const existing = await prisma.novedad.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Novedad no encontrada' }, { status: 404 })
  }

  await prisma.novedad.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
