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

export async function GET() {
  const session = await auth()
  const authError = checkAuth(session)
  if (authError) return authError

  const novedades = await prisma.novedad.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ novedades })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const authError = checkAuth(session)
  if (authError) return authError

  const body = await req.json()

  if (!body.titulo || !body.descripcion || !body.tipo) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  if (!['NOTICIA', 'CASO', 'INDICADOR'].includes(body.tipo)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  if (body.titulo.length > 200) {
    return NextResponse.json({ error: 'Título muy largo (máximo 200 caracteres)' }, { status: 400 })
  }

  if (body.descripcion.length > 2000) {
    return NextResponse.json({ error: 'Descripción muy larga (máximo 2000 caracteres)' }, { status: 400 })
  }

  const slug = await generarSlugUnico(body.titulo)

  const novedad = await prisma.novedad.create({
    data: {
      titulo: body.titulo,
      slug,
      descripcion: body.descripcion,
      tipo: body.tipo,
      imagenUrl: body.imagenUrl ?? null,
      fecha: body.fecha ? new Date(body.fecha) : new Date(),
      publicado: true,
    },
  })

  return NextResponse.json({ novedad })
}
