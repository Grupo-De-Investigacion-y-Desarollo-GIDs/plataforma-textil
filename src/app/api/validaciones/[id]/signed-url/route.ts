import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { modoActivo } from '@/compartido/lib/roles'
import { getSignedUrl } from '@/compartido/lib/storage'
import { rateLimit } from '@/compartido/lib/ratelimit'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // K (§4.3): rate-limit por usuario — cada hit genera una signed URL nueva.
    const blocked = await rateLimit(req, 'upload', session.user.id!)
    if (blocked) return blocked

    const { id } = await params
    const role = modoActivo(session.user)

    const validacion = await prisma.validacion.findUnique({
      where: { id },
      include: { taller: { select: { userId: true } } },
    })

    if (!validacion) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

    // Solo el taller dueño, ADMIN o ESTADO pueden ver el documento
    const canAccess = role === 'ADMIN' || role === 'ESTADO' || validacion.taller.userId === session.user.id
    if (!canAccess) {
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
