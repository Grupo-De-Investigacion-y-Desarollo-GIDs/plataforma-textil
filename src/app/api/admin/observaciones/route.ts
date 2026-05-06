import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { apiHandler, errorAuthRequired, errorForbidden, errorInvalidInput } from '@/compartido/lib/api-errors'
import { logAccionAdmin } from '@/compartido/lib/log'

const crearSchema = z.object({
  userId: z.string().optional(),
  tipo: z.enum([
    'RESISTENCIA', 'EXPECTATIVA', 'DIFICULTAD_TECNICA', 'DIFICULTAD_PROCESO',
    'OPORTUNIDAD', 'EXITO', 'CONTEXTO_TALLER', 'CONTEXTO_MARCA', 'POLITICA_PUBLICA',
  ]),
  fuente: z.enum(['VISITA', 'LLAMADA', 'WHATSAPP', 'PLATAFORMA', 'ENTREVISTA', 'OTROS']).default('VISITA'),
  sentimiento: z.enum(['POSITIVO', 'NEUTRAL', 'NEGATIVO']).optional(),
  importancia: z.number().int().min(1).max(5).default(3),
  titulo: z.string().min(1).max(200),
  contenido: z.string().min(1),
  tags: z.array(z.string()).default([]),
  fechaEvento: z.string().transform(s => new Date(s)),
  ubicacion: z.string().optional(),
})

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) return errorAuthRequired()
  if (!['ADMIN', 'ESTADO'].includes(session.user.role)) return errorForbidden('ADMIN o ESTADO')

  const url = req.nextUrl.searchParams
  const tipo = url.get('tipo') || undefined
  const fuente = url.get('fuente') || undefined
  const sentimiento = url.get('sentimiento') || undefined
  const tagsParam = url.get('tags') || undefined
  const periodo = url.get('periodo') || undefined
  const page = Math.max(1, parseInt(url.get('page') || '1'))
  const limit = Math.min(50, Math.max(1, parseInt(url.get('limit') || '20')))

  const where: Record<string, unknown> = {}

  if (tipo) where.tipo = tipo
  if (fuente) where.fuente = fuente
  if (sentimiento) where.sentimiento = sentimiento
  if (tagsParam) {
    where.tags = { hasSome: tagsParam.split(',').map(t => t.trim()) }
  }

  if (periodo) {
    const now = new Date()
    let desde: Date | undefined
    switch (periodo) {
      case '7d': desde = new Date(now.getTime() - 7 * 86400000); break
      case '30d': desde = new Date(now.getTime() - 30 * 86400000); break
      case '90d': desde = new Date(now.getTime() - 90 * 86400000); break
      case '6m': desde = new Date(now.getTime() - 180 * 86400000); break
    }
    if (desde) where.fechaEvento = { gte: desde }
  }

  const [observaciones, total] = await Promise.all([
    prisma.observacionCampo.findMany({
      where,
      include: {
        autor: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { fechaEvento: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.observacionCampo.count({ where }),
  ])

  return NextResponse.json({ observaciones, total, page, limit })
})

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) return errorAuthRequired()
  if (!['ADMIN', 'ESTADO'].includes(session.user.role)) return errorForbidden('ADMIN o ESTADO')

  const body = await req.json()
  const parsed = crearSchema.safeParse(body)
  if (!parsed.success) return errorInvalidInput(parsed.error)

  const observacion = await prisma.observacionCampo.create({
    data: {
      ...parsed.data,
      autorId: session.user.id,
    },
    include: {
      autor: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
    },
  })

  logAccionAdmin('OBSERVACION_CAMPO_CREADA', session.user.id, {
    entidad: 'nota',
    entidadId: observacion.id,
    metadata: { tipo: observacion.tipo, titulo: observacion.titulo },
  })

  return NextResponse.json(observacion, { status: 201 })
})
