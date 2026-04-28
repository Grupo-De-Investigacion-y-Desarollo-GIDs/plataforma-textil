import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { invalidarCacheConfigs } from '@/compartido/lib/file-validation'
import { logAccionAdmin } from '@/compartido/lib/log'

const TIPOS_VALIDOS = ['pdf', 'jpeg', 'png', 'webp', 'xlsx', 'docx', 'mp4', 'mov']

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Solo ADMIN' }, { status: 403 })

    const { id } = await params
    const body = await req.json()
    const { tiposPermitidos, tamanoMaximoMB, activo } = body

    // Validar tipos
    if (tiposPermitidos !== undefined) {
      if (!Array.isArray(tiposPermitidos) || tiposPermitidos.length === 0) {
        return NextResponse.json({ error: 'Debe haber al menos un tipo permitido' }, { status: 400 })
      }
      const invalidos = tiposPermitidos.filter((t: string) => !TIPOS_VALIDOS.includes(t))
      if (invalidos.length > 0) {
        return NextResponse.json({ error: `Tipos invalidos: ${invalidos.join(', ')}` }, { status: 400 })
      }
    }

    // Validar tamano
    if (tamanoMaximoMB !== undefined) {
      if (typeof tamanoMaximoMB !== 'number' || tamanoMaximoMB < 1 || tamanoMaximoMB > 100) {
        return NextResponse.json({ error: 'Tamaño máximo debe ser entre 1 y 100 MB' }, { status: 400 })
      }
    }

    const existing = await prisma.configuracionUpload.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Configuración no encontrada' }, { status: 404 })
    }

    const updated = await prisma.configuracionUpload.update({
      where: { id },
      data: {
        ...(tiposPermitidos !== undefined && { tiposPermitidos }),
        ...(tamanoMaximoMB !== undefined && { tamanoMaximoMB }),
        ...(activo !== undefined && { activo }),
        actualizadoPor: session.user.id,
      },
    })

    invalidarCacheConfigs()

    logAccionAdmin('CONFIGURACION_UPLOAD_ACTUALIZADA', session.user.id!, {
      entidad: 'configuracion',
      entidadId: id,
      cambios: {
        ...(tiposPermitidos !== undefined && { tiposPermitidos }),
        ...(tamanoMaximoMB !== undefined && { tamanoMaximoMB }),
        ...(activo !== undefined && { activo }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[admin/configuracion-upload] PUT error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
