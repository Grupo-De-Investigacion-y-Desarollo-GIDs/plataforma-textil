import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Solo ADMIN' }, { status: 403 })

    const configs = await prisma.configuracionUpload.findMany({
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(configs)
  } catch (error) {
    console.error('[admin/configuracion-upload] GET error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
