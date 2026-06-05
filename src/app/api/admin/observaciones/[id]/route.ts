import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/compartido/lib/prisma'
import { apiHandler, errorForbidden, errorNotFound, errorInvalidInput } from '@/compartido/lib/api-errors'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { logAccionAdmin } from '@/compartido/lib/log'

type RouteContext = { params?: Promise<Record<string, string | string[]>> }

const editarSchema = z.object({
  userId: z.string().nullable().optional(),
  tipo: z.enum([
    'RESISTENCIA', 'EXPECTATIVA', 'DIFICULTAD_TECNICA', 'DIFICULTAD_PROCESO',
    'OPORTUNIDAD', 'EXITO', 'CONTEXTO_TALLER', 'CONTEXTO_MARCA', 'POLITICA_PUBLICA',
  ]).optional(),
  fuente: z.enum(['VISITA', 'LLAMADA', 'WHATSAPP', 'PLATAFORMA', 'ENTREVISTA', 'OTROS']).optional(),
  sentimiento: z.enum(['POSITIVO', 'NEUTRAL', 'NEGATIVO']).nullable().optional(),
  importancia: z.number().int().min(1).max(5).optional(),
  titulo: z.string().min(1).max(200).optional(),
  contenido: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  fechaEvento: z.string().transform(s => new Date(s)).optional(),
  ubicacion: z.string().nullable().optional(),
})

async function verificarPermisoEdicion(sesion: { userId: string; role: string }, observacionId: string) {
  const observacion = await prisma.observacionCampo.findUnique({
    where: { id: observacionId },
    select: { autorId: true },
  })
  if (!observacion) return { error: errorNotFound('observacion') }

  // Solo el autor o ADMIN puede editar/borrar
  if (sesion.role !== 'ADMIN' && observacion.autorId !== sesion.userId) {
    return { error: errorForbidden('Solo el autor o un ADMIN puede modificar esta observacion') }
  }

  return { observacion }
}

export const GET = apiHandler(async (_req: NextRequest, ctx: RouteContext) => {
  const sesion = await requiereRolApi(['ADMIN', 'ESTADO'])
  if (sesion instanceof NextResponse) return sesion

  const params = await ctx.params!
  const id = params.id as string

  const observacion = await prisma.observacionCampo.findUnique({
    where: { id },
    include: {
      autor: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  })
  if (!observacion) return errorNotFound('observacion')

  return NextResponse.json(observacion)
})

export const PATCH = apiHandler(async (req: NextRequest, ctx: RouteContext) => {
  const sesion = await requiereRolApi(['ADMIN', 'ESTADO'])
  if (sesion instanceof NextResponse) return sesion

  const params = await ctx.params!
  const id = params.id as string

  const { error } = await verificarPermisoEdicion(sesion, id)
  if (error) return error

  const body = await req.json()
  const parsed = editarSchema.safeParse(body)
  if (!parsed.success) return errorInvalidInput(parsed.error)

  const observacion = await prisma.observacionCampo.update({
    where: { id },
    data: parsed.data,
    include: {
      autor: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
    },
  })

  logAccionAdmin('OBSERVACION_CAMPO_EDITADA', sesion.userId, {
    entidad: 'nota',
    entidadId: id,
    metadata: { titulo: observacion.titulo },
  })

  return NextResponse.json(observacion)
})

export const DELETE = apiHandler(async (_req: NextRequest, ctx: RouteContext) => {
  const sesion = await requiereRolApi(['ADMIN', 'ESTADO'])
  if (sesion instanceof NextResponse) return sesion

  const params = await ctx.params!
  const id = params.id as string

  const { error } = await verificarPermisoEdicion(sesion, id)
  if (error) return error

  await prisma.observacionCampo.delete({ where: { id } })

  logAccionAdmin('OBSERVACION_CAMPO_ELIMINADA', sesion.userId, {
    entidad: 'nota',
    entidadId: id,
  })

  return NextResponse.json({ ok: true })
})
