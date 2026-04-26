import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { toCsv } from '@/compartido/lib/csv'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const exportCsv = searchParams.get('export') === 'csv'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const accion = searchParams.get('accion')
    const entidad = searchParams.get('entidad')
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (accion) where.accion = accion
    if (entidad) {
      where.detalles = { path: ['entidad'], equals: entidad }
    }
    if (desde || hasta) {
      const timestamp: Record<string, Date> = {}
      if (desde) timestamp.gte = new Date(desde)
      if (hasta) {
        const hastaDate = new Date(hasta)
        hastaDate.setHours(23, 59, 59, 999)
        timestamp.lte = hastaDate
      }
      where.timestamp = timestamp
    }

    // CSV export — sin paginacion
    if (exportCsv) {
      const logs = await prisma.logActividad.findMany({
        where,
        include: { user: { select: { email: true, name: true, role: true } } },
        orderBy: { timestamp: 'desc' },
        take: 10000,
      })

      const rows = logs.map(log => {
        const detalles = log.detalles as Record<string, unknown> | null
        return [
          log.timestamp.toISOString(),
          log.user?.email || 'sistema',
          log.user?.role || '',
          log.accion,
          (detalles?.entidad as string) || '',
          (detalles?.entidadId as string) || '',
          (detalles?.motivo as string) || '',
          detalles ? JSON.stringify(detalles) : '',
        ]
      })

      const csv = toCsv(
        ['fecha', 'usuario_email', 'usuario_rol', 'accion', 'entidad', 'entidad_id', 'motivo', 'detalles'],
        rows,
      )

      const desdeStr = desde || 'inicio'
      const hastaStr = hasta || new Date().toISOString().split('T')[0]

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="logs_${desdeStr}_${hastaStr}.csv"`,
        },
      })
    }

    // Paginado normal
    const [logs, total] = await Promise.all([
      prisma.logActividad.findMany({
        where,
        include: { user: { select: { email: true, name: true, role: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.logActividad.count({ where }),
    ])

    // Obtener lista de acciones unicas y usuarios admin/estado para los filtros
    const [acciones, usuarios] = await Promise.all([
      prisma.logActividad.findMany({
        select: { accion: true },
        distinct: ['accion'],
        orderBy: { accion: 'asc' },
      }),
      prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'ESTADO'] } },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: 'asc' },
      }),
    ])

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      acciones: acciones.map(a => a.accion),
      usuarios,
    })
  } catch (error) {
    console.error('Error en GET /api/admin/logs:', error)
    return NextResponse.json({ error: 'Error al obtener logs' }, { status: 500 })
  }
}
