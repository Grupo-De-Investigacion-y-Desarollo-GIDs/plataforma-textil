import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { uploadFile } from '@/compartido/lib/storage'
import { rateLimit } from '@/compartido/lib/ratelimit'
import { validarArchivo, sanitizarNombreArchivo } from '@/compartido/lib/file-validation'
import { logActividad } from '@/compartido/lib/log'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userRole = (session.user as { role?: string }).role
    if (userRole !== 'ADMIN' && userRole !== 'ESTADO') {
      const blocked = await rateLimit(req, 'upload', session.user.id!)
      if (blocked) return blocked
    }

    const { id } = await params

    // Verify validacion belongs to user's taller
    const validacion = await prisma.validacion.findUnique({
      where: { id },
      include: { taller: { select: { userId: true } } },
    })
    if (!validacion) return NextResponse.json({ error: 'Validación no encontrada' }, { status: 404 })
    if (validacion.taller.userId !== session.user.id) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })
    }

    // Only allow upload if NO_INICIADO or RECHAZADO
    if (validacion.estado !== 'NO_INICIADO' && validacion.estado !== 'RECHAZADO') {
      return NextResponse.json({ error: 'No se puede subir documento en este estado' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })

    // Validacion server-side por magic bytes y config de DB
    const resultado = await validarArchivo(file, 'documentos-formalizacion')
    if (!resultado.valid) {
      logActividad('UPLOAD_REJECTED', session.user.id, {
        contexto: 'documentos-formalizacion',
        motivo: resultado.error,
        nombreArchivo: file.name,
        tamano: file.size,
      })
      return NextResponse.json({ error: resultado.error }, { status: 400 })
    }

    const nombreSeguro = sanitizarNombreArchivo(file.name)
    const ext = nombreSeguro.split('.').pop() || 'pdf'
    const buffer = Buffer.from(await file.arrayBuffer())
    const path = `validaciones/${validacion.tallerId}/${id}.${ext}`

    let url: string
    try {
      url = await uploadFile(buffer, path, file.type)
    } catch (storageError) {
      console.error('Error al subir a storage:', storageError)
      return NextResponse.json({ error: 'No se pudo subir el documento. Intentá de nuevo.' }, { status: 502 })
    }

    const updated = await prisma.validacion.update({
      where: { id },
      data: { documentoUrl: url, estado: 'PENDIENTE' },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error en upload validacion:', error)
    return NextResponse.json({ error: 'Error al subir documento' }, { status: 500 })
  }
}
