import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { generarSlugUnico } from '@/compartido/lib/slugify'

function checkAuth(session: { user?: { role?: string } } | null) {
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const role = (session.user as { role?: string }).role
  if (role !== 'CONTENIDO' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const authError = checkAuth(session)
  if (authError) return authError

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

  const novedad = await prisma.novedad.update({
    where: { id },
    data: updates,
  })

  return NextResponse.json({ novedad })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const authError = checkAuth(session)
  if (authError) return authError

  const { id } = await params

  const existing = await prisma.novedad.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Novedad no encontrada' }, { status: 404 })
  }

  await prisma.novedad.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
