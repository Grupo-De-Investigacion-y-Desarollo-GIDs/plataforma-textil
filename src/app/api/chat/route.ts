import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { buscarContexto, generarRespuesta } from '@/compartido/lib/rag'
import { rateLimit } from '@/compartido/lib/ratelimit'
import { apiHandler, errorAuthRequired, errorResponse } from '@/compartido/lib/api-errors'
import { z } from 'zod'

const chatSchema = z.object({
  pregunta: z.string().min(10, 'La pregunta debe tener al menos 10 caracteres').max(500, 'La pregunta es demasiado larga'),
})

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()

  const userRole = (session.user as { role?: string }).role
  if (userRole !== 'ADMIN' && userRole !== 'ESTADO') {
    const blocked = await rateLimit(req, 'chat', session.user.id!)
    if (blocked) return blocked
  }

  if (!process.env.ANTHROPIC_API_KEY || !process.env.VOYAGE_API_KEY) {
    console.error('[chat] ANTHROPIC_API_KEY o VOYAGE_API_KEY no configuradas en las variables de entorno')
    return errorResponse({
      code: 'EXTERNAL_SERVICE_ERROR',
      message: 'Asistente no disponible',
      status: 503,
    })
  }

  const llmEnabledConfig = await prisma.configuracionSistema.findFirst({
    where: { clave: 'llm_enabled', grupo: 'llm' },
  })
  if (llmEnabledConfig?.valor === 'false') {
    return errorResponse({
      code: 'EXTERNAL_SERVICE_ERROR',
      message: 'El asistente esta deshabilitado temporalmente',
      status: 503,
    })
  }

  const body = await req.json()
  const parsed = chatSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse({
      code: 'INVALID_INPUT',
      message: parsed.error.issues[0]?.message || 'Datos invalidos',
      status: 400,
    })
  }

  const { pregunta } = parsed.data

  let contexto: { id: string; titulo: string; contenido: string; categoria: string }[] = []
  try {
    contexto = await buscarContexto(pregunta)
  } catch (err) {
    console.error('Error buscando contexto RAG:', err)
  }

  const respuesta = await generarRespuesta(pregunta, contexto)

  return NextResponse.json({
    respuesta,
    fuentes: contexto.map((d) => d.titulo),
  })
})
