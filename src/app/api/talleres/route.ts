import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'

// K-05: select explicito por rama. El unico caller MARCA (invitar-a-cotizar) usa
// {id, nombre, ubicacion, capacidadMensual}; el caller ADMIN (listado de talleres)
// usa ademas cuit/nivel/createdAt + user.{email, active}. procesos/prendas solo se
// usan en el `where` (filtros), no en la respuesta, asi que no se seleccionan.
const selectMarca = {
  id: true,
  nombre: true,
  ubicacion: true,
  capacidadMensual: true,
}

const selectAdmin = {
  ...selectMarca,
  cuit: true,
  nivel: true,
  createdAt: true,
  user: { select: { email: true, active: true } },
}

export async function GET(req: NextRequest) {
  const sesion = await requiereRolApi(['ADMIN', 'ESTADO', 'MARCA'])
  if (sesion instanceof NextResponse) return sesion

  const esAdmin = sesion.role === 'ADMIN' || sesion.role === 'ESTADO'

  try {
    const { searchParams } = req.nextUrl
    const proceso = searchParams.get('proceso')
    const prenda = searchParams.get('prenda')
    const provincia = searchParams.get('provincia')
    const q = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Filtro por verificacion ARCA: OBLIGATORIO para MARCA (no debe ver/invitar
    // talleres sin verificar). ADMIN/ESTADO (Coordinacion) ven TODOS —incluidos los
    // EN_GRACIA sin verificar— para la vista regulatoria del panel.
    const where: Record<string, unknown> = {}
    if (!esAdmin) where.verificadoAfip = true

    // Filtro por nivel solo para ADMIN/ESTADO
    if (esAdmin) {
      const nivel = searchParams.get('nivel')
      if (nivel) where.nivel = nivel
    }

    if (provincia) where.provincia = { contains: provincia, mode: 'insensitive' }
    if (q) where.nombre = { contains: q, mode: 'insensitive' }
    if (proceso) {
      where.procesos = { some: { proceso: { nombre: { contains: proceso, mode: 'insensitive' } } } }
    }
    if (prenda) {
      where.prendas = { some: { prenda: { nombre: { contains: prenda, mode: 'insensitive' } } } }
    }

    const select = esAdmin ? selectAdmin : selectMarca

    const [talleres, total] = await Promise.all([
      prisma.taller.findMany({
        where,
        select,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { puntaje: 'desc' },
      }),
      prisma.taller.count({ where }),
    ])

    return NextResponse.json({ talleres, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Error en GET /api/talleres:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
