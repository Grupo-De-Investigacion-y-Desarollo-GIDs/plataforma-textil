import { NextRequest, NextResponse } from 'next/server'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { sincronizarTaller } from '@/compartido/lib/arca'
import { prisma } from '@/compartido/lib/prisma'
import { logActividad } from '@/compartido/lib/log'

// POST /api/estado/arca — Sincronización masiva de talleres contra ARCA
export async function POST(req: NextRequest) {
  const sesion = await requiereRolApi(['ESTADO', 'ADMIN'])
  if (sesion instanceof NextResponse) return sesion

  const body = await req.json().catch(() => ({}))
  const force = body.force === true

  const talleres = await prisma.taller.findMany({
    select: { id: true, nombre: true, cuit: true, verificadoAfip: true, verificadoAfipAt: true },
    orderBy: { nombre: 'asc' },
  })

  const resultados: { tallerId: string; nombre: string; exitosa: boolean; error?: string }[] = []

  for (const taller of talleres) {
    const resultado = await sincronizarTaller(taller.id, force)
    resultados.push({
      tallerId: taller.id,
      nombre: taller.nombre,
      exitosa: resultado.exitosa,
      error: resultado.error,
    })
  }

  const verificados = resultados.filter(r => r.exitosa).length
  const fallidos = resultados.filter(r => !r.exitosa).length

  logActividad('ARCA_SYNC_MASIVA', sesion.userId, {
    total: talleres.length,
    verificados,
    fallidos,
    force,
  })

  return NextResponse.json({
    total: talleres.length,
    verificados,
    fallidos,
    resultados,
  })
}

// GET /api/estado/arca — Stats de consultas ARCA (último mes)
export async function GET() {
  const sesion = await requiereRolApi(['ESTADO', 'ADMIN'])
  if (sesion instanceof NextResponse) return sesion

  const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalConsultas, exitosas, fallidas] = await Promise.all([
    prisma.consultaArca.count({ where: { createdAt: { gte: hace30dias } } }),
    prisma.consultaArca.count({ where: { createdAt: { gte: hace30dias }, exitosa: true } }),
    prisma.consultaArca.count({ where: { createdAt: { gte: hace30dias }, exitosa: false } }),
  ])

  return NextResponse.json({
    periodo: '30d',
    totalConsultas,
    exitosas,
    fallidas,
    alertaCosto: totalConsultas > 500,
  })
}
