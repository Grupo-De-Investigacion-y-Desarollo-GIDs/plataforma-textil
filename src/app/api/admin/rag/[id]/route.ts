import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { logAccionAdmin } from '@/compartido/lib/log'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sesion = await requiereRolApi(['ADMIN', 'CONTENIDO'])
    if (sesion instanceof NextResponse) return sesion

    const { id } = await params

    // Soft delete
    await prisma.documentoRAG.update({
      where: { id },
      data: { activo: false },
    })
    logAccionAdmin('RAG_DOCUMENTO_DESACTIVADO', sesion.userId, {
      entidad: 'rag',
      entidadId: id,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en DELETE /api/admin/rag/[id]:', error)
    return NextResponse.json({ error: 'Error al desactivar documento' }, { status: 500 })
  }
}
