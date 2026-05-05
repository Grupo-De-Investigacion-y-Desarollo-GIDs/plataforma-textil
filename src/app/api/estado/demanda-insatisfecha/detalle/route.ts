import { NextRequest, NextResponse } from 'next/server'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { apiHandler, errorResponse } from '@/compartido/lib/api-errors'
import { obtenerDetallePorCategoria, obtenerTalleresCerca } from '@/compartido/lib/demanda-insatisfecha'
import type { MotivoCategoria } from '@prisma/client'

const CATEGORIAS_VALIDAS = ['SIN_TALLERES_NIVEL', 'SIN_TALLERES_CAPACIDAD', 'SIN_TALLERES_PROCESO', 'OTROS']

export const GET = apiHandler(async (req: NextRequest) => {
  const authResult = await requiereRolApi(['ESTADO', 'ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  const url = new URL(req.url)
  const vista = url.searchParams.get('vista')
  const motivoCategoriaParam = url.searchParams.get('motivoCategoria')

  const ahora = new Date()
  const hace30d = new Date(ahora)
  hace30d.setDate(hace30d.getDate() - 30)

  const desde = url.searchParams.get('desde')
    ? new Date(url.searchParams.get('desde')!)
    : hace30d
  const hasta = url.searchParams.get('hasta')
    ? new Date(url.searchParams.get('hasta')!)
    : ahora

  // Vista especial: talleres cerca de matchear
  if (vista === 'talleres-cerca') {
    const talleres = await obtenerTalleresCerca(desde, hasta)
    return NextResponse.json({ talleres })
  }

  if (!motivoCategoriaParam || !CATEGORIAS_VALIDAS.includes(motivoCategoriaParam)) {
    return errorResponse({
      code: 'INVALID_INPUT',
      message: 'motivoCategoria es requerido y debe ser uno de: ' + CATEGORIAS_VALIDAS.join(', '),
      status: 400,
    })
  }

  const detalle = await obtenerDetallePorCategoria(
    motivoCategoriaParam as MotivoCategoria,
    desde,
    hasta,
  )

  return NextResponse.json({ pedidos: detalle })
})
