import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { logAccionAdmin } from '@/compartido/lib/log'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'
import { generarXlsx, toCsv } from '@/compartido/lib/exportes'
import { obtenerDataExporte, esTipoValido } from './data'

export const maxDuration = 120

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: { code: 'AUTH_REQUIRED', message: 'No autorizado' } }, { status: 401 })
  }
  const role = (session.user as { role?: string }).role
  if (role !== 'ESTADO' && role !== 'ADMIN') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Solo ESTADO o ADMIN' } }, { status: 403 })
  }

  const rateLimitResponse = await rateLimit(req, 'exportar', getClientIp(req))
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') ?? ''
  const formato = searchParams.get('formato') ?? 'csv'
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')
  const provincia = searchParams.get('provincia')
  const nivel = searchParams.get('nivel')

  if (!esTipoValido(tipo)) {
    return NextResponse.json({
      error: { code: 'INVALID_INPUT', message: `Tipo invalido: ${tipo}` },
    }, { status: 400 })
  }

  if (formato !== 'csv' && formato !== 'xlsx') {
    return NextResponse.json({
      error: { code: 'INVALID_INPUT', message: 'Formato invalido. Usar csv o xlsx' },
    }, { status: 400 })
  }

  try {
    const data = await obtenerDataExporte(tipo, { desde, hasta, provincia, nivel })
    const fecha = new Date().toISOString().split('T')[0]

    logAccionAdmin('EXPORTE_GENERADO', session.user.id, {
      entidad: 'exportacion',
      entidadId: tipo,
      metadata: { tipo, formato, filtros: { desde, hasta, provincia, nivel }, cantidadRegistros: data.filas.length },
    })

    if (formato === 'csv') {
      const csv = '\uFEFF' + toCsv(data.headers, data.filas)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${tipo}-${fecha}.csv"`,
        },
      })
    }

    const buffer = await generarXlsx(data.hojas, data.metadata)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${tipo}-${fecha}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('[F-04] Error en exporte:', error)
    return NextResponse.json({
      error: { code: 'INTERNAL_ERROR', message: 'Error al generar el reporte' },
    }, { status: 500 })
  }
}
