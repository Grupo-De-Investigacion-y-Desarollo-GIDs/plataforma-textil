import { NextRequest, NextResponse } from 'next/server'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { uploadFile } from '@/compartido/lib/storage'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sesion = await requiereRolApi(['CONTENIDO', 'ADMIN'])
    if (sesion instanceof NextResponse) return sesion

    const { id } = await params
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Use JPEG, PNG o WebP.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Archivo muy grande. Máximo 5MB.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `colecciones/${id}/${timestamp}.${ext}`

    const url = await uploadFile(buffer, path, file.type, 'imagenes')

    return NextResponse.json({ url })
  } catch (error) {
    console.error('[colecciones/upload]', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const isMissingBucket = /bucket not found/i.test(message)
    return NextResponse.json(
      { error: isMissingBucket ? 'Storage no configurado: bucket "imagenes" no existe' : message },
      { status: isMissingBucket ? 503 : 500 }
    )
  }
}
