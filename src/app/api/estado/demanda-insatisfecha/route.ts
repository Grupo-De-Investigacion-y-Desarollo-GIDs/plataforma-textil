import { NextRequest, NextResponse } from 'next/server'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { apiHandler } from '@/compartido/lib/api-errors'
import { calcularStatsAgregadas, generarRecomendaciones } from '@/compartido/lib/demanda-insatisfecha'

export const GET = apiHandler(async (req: NextRequest) => {
  const authResult = await requiereRolApi(['ESTADO', 'ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  const url = new URL(req.url)
  const ahora = new Date()
  const hace30d = new Date(ahora)
  hace30d.setDate(hace30d.getDate() - 30)

  const desde = url.searchParams.get('desde')
    ? new Date(url.searchParams.get('desde')!)
    : hace30d
  const hasta = url.searchParams.get('hasta')
    ? new Date(url.searchParams.get('hasta')!)
    : ahora

  const [stats, recomendaciones] = await Promise.all([
    calcularStatsAgregadas(desde, hasta),
    generarRecomendaciones(desde, hasta),
  ])

  return NextResponse.json({ ...stats, recomendaciones })
})
