import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { uploadFile } from '@/compartido/lib/storage'
import { rateLimit } from '@/compartido/lib/ratelimit'
import { validarArchivo, sanitizarNombreArchivo } from '@/compartido/lib/file-validation'
import { logActividad } from '@/compartido/lib/log'
import { apiHandler, errorAuthRequired, errorNotFound, errorForbidden, errorResponse, errorExternalService } from '@/compartido/lib/api-errors'

export const POST = apiHandler(async (req: NextRequest, ctx) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()

  const userRole = (session.user as { role?: string }).role
  if (userRole !== 'ADMIN' && userRole !== 'ESTADO') {
    const blocked = await rateLimit(req, 'upload', session.user.id!)
    if (blocked) return blocked
  }

  const { id } = await ctx.params!

  const validacion = await prisma.validacion.findUnique({
    where: { id: id as string },
    include: { taller: { select: { userId: true } } },
  })
  if (!validacion) return errorNotFound('validacion')
  if (validacion.taller.userId !== session.user.id) return errorForbidden()

  if (validacion.estado !== 'NO_INICIADO' && validacion.estado !== 'RECHAZADO') {
    return errorResponse({
      code: 'INVALID_INPUT',
      message: 'No se puede subir documento en este estado',
      status: 400,
    })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return errorResponse({ code: 'INVALID_INPUT', message: 'Archivo requerido', status: 400 })
  }

  const resultado = await validarArchivo(file, 'documentos-formalizacion')
  if (!resultado.valid) {
    logActividad('UPLOAD_REJECTED', session.user.id, {
      contexto: 'documentos-formalizacion',
      motivo: resultado.error,
      nombreArchivo: file.name,
      tamano: file.size,
    })
    return errorResponse({ code: 'INVALID_INPUT', message: resultado.error!, status: 400 })
  }

  const nombreSeguro = sanitizarNombreArchivo(file.name)
  const ext = nombreSeguro.split('.').pop() || 'pdf'
  const buffer = Buffer.from(await file.arrayBuffer())
  const path = `validaciones/${validacion.tallerId}/${id}.${ext}`

  let url: string
  try {
    url = await uploadFile(buffer, path, file.type)
  } catch (storageError) {
    return errorExternalService('storage', storageError instanceof Error ? storageError : undefined)
  }

  const updated = await prisma.validacion.update({
    where: { id: id as string },
    data: { documentoUrl: url, estado: 'PENDIENTE' },
  })

  return NextResponse.json(updated)
})
