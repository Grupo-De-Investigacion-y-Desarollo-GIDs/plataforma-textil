import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { uploadFile } from '@/compartido/lib/storage'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Usá PDF, JPG o PNG.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 5MB)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop() || 'pdf'
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
