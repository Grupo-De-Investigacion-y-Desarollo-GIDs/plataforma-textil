import { NextRequest, NextResponse } from 'next/server'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { apiHandler } from '@/compartido/lib/api-errors'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'
import { exportarMotivosCSV } from '@/compartido/lib/demanda-insatisfecha'
import { toCsv } from '@/compartido/lib/csv'

export const GET = apiHandler(async (req: NextRequest) => {
  const authResult = await requiereRolApi(['ESTADO', 'ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  const rateLimitResult = await rateLimit(req, 'exportar', getClientIp(req))
  if (rateLimitResult) return rateLimitResult

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

  const datos = await exportarMotivosCSV(desde, hasta)

  const headers = ['omId', 'tipoPrenda', 'cantidad', 'presupuesto', 'marca', 'motivoCategoria', 'talleresCerca', 'fecha']
  const rows = datos.map(d => [
    d.omId,
    d.tipoPrenda,
    String(d.cantidad),
    String(d.presupuesto),
    d.marca,
    d.motivoCategoria,
    d.talleresCerca,
    d.fecha,
  ])

  const csv = toCsv(headers, rows)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="demanda-insatisfecha-${desde.toISOString().split('T')[0]}-a-${hasta.toISOString().split('T')[0]}.csv"`,
    },
  })
})
