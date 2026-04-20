import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { getSignedUrl } from '@/compartido/lib/storage'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const role = (session.user as { role?: string }).role

    const validacion = await prisma.validacion.findUnique({
      where: { id },
      include: { taller: { select: { userId: true } } },
    })

    if (!validacion) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

    // Solo el taller dueño o ADMIN pueden ver el documento
    if (role !== 'ADMIN' && validacion.taller.userId !== session.user.id) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })
    }

    if (!validacion.documentoUrl) {
      return NextResponse.json({ error: 'Sin documento' }, { status: 404 })
    }

    // Extraer el path del documento desde la URL pública
    // URL format: https://xxx.supabase.co/storage/v1/object/public/documentos/validaciones/tallerId/id.ext
    const urlParts = validacion.documentoUrl.split('/storage/v1/object/public/documentos/')
    if (urlParts.length < 2) {
      // Fallback: devolver URL pública directamente
      return NextResponse.json({ url: validacion.documentoUrl })
    }

    const path = urlParts[1]
    const url = await getSignedUrl(path, 3600)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error generando signed URL:', error)
    return NextResponse.json({ error: 'Error al generar URL' }, { status: 500 })
  }
}
