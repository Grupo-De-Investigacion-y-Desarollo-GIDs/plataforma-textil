import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN' && role !== 'CONTENIDO') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const { id } = await params

    // Soft delete
    await prisma.documentoRAG.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en DELETE /api/admin/rag/[id]:', error)
    return NextResponse.json({ error: 'Error al desactivar documento' }, { status: 500 })
  }
}
