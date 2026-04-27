import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { uploadFile } from '@/compartido/lib/storage'
import { rateLimit } from '@/compartido/lib/ratelimit'
import { validarArchivo, sanitizarNombreArchivo } from '@/compartido/lib/file-validation'
import { logActividad } from '@/compartido/lib/log'

// Mapeo de contexto del form al contexto de ConfiguracionUpload
const CONTEXTO_CONFIG: Record<string, string> = {
  portfolio: 'imagenes-portfolio',
  pedido: 'imagenes-pedido',
  cotizacion: 'imagenes-pedido', // cotizaciones usan la misma config de imagenes
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string }).role
    if (userRole !== 'ADMIN' && userRole !== 'ESTADO') {
      const blocked = await rateLimit(request, 'upload', session.user.id!)
      if (blocked) return blocked
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const contexto = formData.get('contexto') as string
    const entityId = formData.get('entityId') as string

    if (!file || !contexto || !entityId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const contextoConfig = CONTEXTO_CONFIG[contexto]
    if (!contextoConfig) {
      return NextResponse.json({ error: 'Contexto invalido' }, { status: 400 })
    }

    // Validacion server-side por magic bytes y config de DB
    const resultado = await validarArchivo(file, contextoConfig)
    if (!resultado.valid) {
      logActividad('UPLOAD_REJECTED', session.user.id, {
        contexto: contextoConfig,
        motivo: resultado.error,
        nombreArchivo: file.name,
        tamano: file.size,
      })
      return NextResponse.json({ error: resultado.error }, { status: 400 })
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
    }

    // Construir path seguro server-side
    const nombreSeguro = sanitizarNombreArchivo(file.name)
    const ext = nombreSeguro.split('.').pop() ?? 'jpg'
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
