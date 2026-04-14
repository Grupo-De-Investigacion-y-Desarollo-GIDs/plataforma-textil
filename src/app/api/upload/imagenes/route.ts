import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { uploadFile } from '@/compartido/lib/storage'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const contexto = formData.get('contexto') as string
    const entityId = formData.get('entityId') as string

    if (!file || !contexto || !entityId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no soportado. Usa JPG, PNG o WebP.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'La imagen no puede superar 5MB' },
        { status: 400 }
      )
    }

    // Validar ownership segun contexto
    if (contexto === 'portfolio') {
      const taller = await prisma.taller.findFirst({
        where: { id: entityId, userId: session.user.id },
      })
      if (!taller) {
        return NextResponse.json({ error: 'Sin acceso a este taller' }, { status: 403 })
      }
    } else if (contexto === 'pedido') {
      const pedido = await prisma.pedido.findUnique({
        where: { id: entityId },
        include: { marca: { select: { userId: true } } },
      })
      if (!pedido || pedido.marca.userId !== session.user.id) {
        // Also allow if entityId is a marcaId (for new pedidos that don't exist yet)
        const marca = await prisma.marca.findFirst({
          where: { id: entityId, userId: session.user.id },
        })
        if (!marca) {
          return NextResponse.json({ error: 'Sin acceso a este pedido' }, { status: 403 })
        }
      }
    } else if (contexto === 'cotizacion') {
      const taller = await prisma.taller.findFirst({
        where: { userId: session.user.id },
      })
      if (!taller) {
        return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Contexto invalido' }, { status: 400 })
    }

    // Construir path seguro server-side
    const ext = file.name.split('.').pop() ?? 'jpg'
    const timestamp = Date.now()
    const path = `${contexto}/${entityId}/${timestamp}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadFile(buffer, path, file.type, 'imagenes')

    return NextResponse.json({ url })
  } catch (error) {
    console.error('[upload/imagenes]', error)
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 502 })
  }
}
