import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { logAccionAdmin } from '@/compartido/lib/log'
import { generarEmbedding } from '@/compartido/lib/rag'
import { z } from 'zod'

const crearDocSchema = z.object({
  titulo: z.string().min(1, 'Titulo requerido'),
  contenido: z.string().min(10, 'Contenido debe tener al menos 10 caracteres'),
  categoria: z.string().min(1, 'Categoria requerida'),
  fuente: z.string().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN' && role !== 'CONTENIDO') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    // Retornar documentos sin el campo embedding (demasiado grande)
    const documentos = await prisma.documentoRAG.findMany({
      select: { id: true, titulo: true, categoria: true, fuente: true, activo: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ documentos })
  } catch (error) {
    console.error('Error en GET /api/admin/rag:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN' && role !== 'CONTENIDO') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = crearDocSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }
    const data = parsed.data

    // Generar embedding
    const embedding = await generarEmbedding(data.contenido)
    const embeddingStr = `[${embedding.join(',')}]`

    // Insertar con raw query por el tipo vector
    const id = `rag-${Date.now().toString(36)}`
    await prisma.$executeRaw`
      INSERT INTO documentos_rag (id, titulo, contenido, categoria, fuente, activo, embedding, "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${data.titulo},
        ${data.contenido},
        ${data.categoria},
        ${data.fuente ?? null},
        true,
        ${embeddingStr}::vector,
        NOW(),
        NOW()
      )
    `

    logAccionAdmin('RAG_DOCUMENTO_CREADO', session.user.id, {
      entidad: 'rag',
      entidadId: id,
      metadata: { titulo: data.titulo, categoria: data.categoria },
    })

    return NextResponse.json({ id, titulo: data.titulo, categoria: data.categoria }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/admin/rag:', error)
    return NextResponse.json({ error: 'Error al crear documento' }, { status: 500 })
  }
}
