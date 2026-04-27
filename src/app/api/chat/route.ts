import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { buscarContexto, generarRespuesta } from '@/compartido/lib/rag'
import { rateLimit } from '@/compartido/lib/ratelimit'
import { z } from 'zod'

const chatSchema = z.object({
  pregunta: z.string().min(10, 'La pregunta debe tener al menos 10 caracteres').max(500, 'La pregunta es demasiado larga'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string }).role
    if (userRole !== 'ADMIN' && userRole !== 'ESTADO') {
      const blocked = await rateLimit(req, 'chat', session.user.id!)
      if (blocked) return blocked
    }

    if (!process.env.ANTHROPIC_API_KEY || !process.env.VOYAGE_API_KEY) {
      console.error('[chat] ANTHROPIC_API_KEY o VOYAGE_API_KEY no configuradas en las variables de entorno')
      return NextResponse.json({ error: 'Asistente no disponible' }, { status: 503 })
    }

    // Check de llm_enabled — antes de buscarContexto para no consumir
    // creditos de Voyage AI innecesariamente si el asistente esta deshabilitado
    const llmEnabledConfig = await prisma.configuracionSistema.findFirst({
      where: { clave: 'llm_enabled', grupo: 'llm' },
    })
    if (llmEnabledConfig?.valor === 'false') {
      return NextResponse.json(
        { error: 'El asistente está deshabilitado temporalmente' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const parsed = chatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    const { pregunta } = parsed.data

    // Buscar contexto relevante
    let contexto: { id: string; titulo: string; contenido: string; categoria: string }[] = []
    try {
      contexto = await buscarContexto(pregunta)
    } catch (err) {
      // Si pgvector falla o no hay documentos, responder sin contexto
      console.error('Error buscando contexto RAG:', err)
    }

    // Generar respuesta con Claude
    const respuesta = await generarRespuesta(pregunta, contexto)

    return NextResponse.json({
      respuesta,
      fuentes: contexto.map((d) => d.titulo),
    })
  } catch (error) {
    console.error('Error en POST /api/chat:', error)
    return NextResponse.json(
      { error: 'No se pudo generar la respuesta. Intenta de nuevo.' },
      { status: 503 }
    )
  }
}
