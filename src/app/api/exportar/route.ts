import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [headers.map(escape).join(',')]
  for (const row of rows) {
    lines.push(row.map(escape).join(','))
  }
  return lines.join('\n')
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN' && role !== 'ESTADO') {
      return NextResponse.json({ error: 'Solo ADMIN o ESTADO' }, { status: 403 })
    }

    const tipo = req.nextUrl.searchParams.get('tipo') || 'talleres'
    const desde = req.nextUrl.searchParams.get('desde')
    const whereBase = desde ? { createdAt: { gte: new Date(desde) } } : {}

    let csv = ''
    let filename = 'reporte.csv'

    if (tipo === 'talleres') {
      const talleres = await prisma.taller.findMany({
        where: whereBase,
        include: {
          user: { select: { email: true, phone: true, createdAt: true } },
          _count: { select: { validaciones: true, certificados: true } },
        },
        orderBy: { nombre: 'asc' },
      })
      csv = toCsv(
        ['Nombre', 'CUIT', 'Ubicacion', 'Nivel', 'Puntaje', 'Capacidad', 'Email', 'Telefono', 'Validaciones', 'Certificados', 'Fecha registro'],
        talleres.map(t => [
          t.nombre, t.cuit, t.ubicacion ?? '', t.nivel, String(t.puntaje),
          String(t.capacidadMensual), t.user.email, t.user.phone ?? '',
          String(t._count.validaciones), String(t._count.certificados),
          t.user.createdAt.toISOString().split('T')[0],
        ]),
      )
      filename = 'talleres.csv'

    } else if (tipo === 'resumen') {
      const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

      const [totalTalleres, totalMarcas, totalCerts, niveles, talleresInactivos, denunciasSinResolver, certificadosMes, subieronNivelMes] = await Promise.all([
        prisma.taller.count(),
        prisma.marca.count(),
        prisma.certificado.count({ where: { revocado: false } }),
        prisma.taller.groupBy({ by: ['nivel'], _count: true }),
        prisma.taller.count({
          where: { createdAt: { lt: hace30dias }, user: { logs: { none: { timestamp: { gte: hace30dias } } } } },
        }),
        prisma.denuncia.count({ where: { estado: { in: ['RECIBIDA', 'EN_INVESTIGACION'] } } }),
        prisma.certificado.count({ where: { fecha: { gte: inicioMes }, revocado: false } }),
        prisma.logActividad.count({ where: { accion: 'NIVEL_SUBIDO', timestamp: { gte: inicioMes } } }),
      ])
      const nivelMap: Record<string, number> = {}
      for (const g of niveles) nivelMap[g.nivel] = g._count
      csv = toCsv(
        ['Metrica', 'Valor'],
        [
          ['Total talleres', String(totalTalleres)],
          ['Total marcas', String(totalMarcas)],
          ['Certificados vigentes', String(totalCerts)],
          ['Talleres Bronce', String(nivelMap.BRONCE ?? 0)],
          ['Talleres Plata', String(nivelMap.PLATA ?? 0)],
          ['Talleres Oro', String(nivelMap.ORO ?? 0)],
          ['Talleres inactivos (30 dias)', String(talleresInactivos)],
          ['Denuncias sin resolver', String(denunciasSinResolver)],
          ['Certificados este mes', String(certificadosMes)],
          ['Subieron de nivel este mes', String(subieronNivelMes)],
        ],
      )
      filename = 'resumen.csv'

    } else if (tipo === 'capacitaciones') {
      const certs = await prisma.certificado.findMany({
        where: { revocado: false, ...whereBase },
        include: {
          taller: { select: { nombre: true } },
          coleccion: { select: { titulo: true } },
        },
        orderBy: { fecha: 'desc' },
      })
      csv = toCsv(
        ['Taller', 'Coleccion', 'Codigo', 'Calificacion', 'Fecha'],
        certs.map(c => [
          c.taller.nombre, c.coleccion?.titulo ?? '', c.codigo,
          String(c.calificacion ?? ''), c.fecha.toISOString().split('T')[0],
        ]),
      )
      filename = 'capacitaciones.csv'

    } else if (tipo === 'acompanamiento') {
      const talleres = await prisma.taller.findMany({
        include: {
          user: { select: { email: true } },
          validaciones: true,
        },
        orderBy: { puntaje: 'asc' },
      })
      const necesitan = talleres.filter(t => {
        const completadas = t.validaciones.filter(v => v.estado === 'COMPLETADO').length
        return completadas < 4
      })
      csv = toCsv(
        ['Taller', 'CUIT', 'Nivel', 'Puntaje', 'Validaciones completadas', 'Email'],
        necesitan.map(t => {
          const completadas = t.validaciones.filter(v => v.estado === 'COMPLETADO').length
          return [t.nombre, t.cuit, t.nivel, String(t.puntaje), String(completadas), t.user.email]
        }),
      )
      filename = 'acompanamiento.csv'

    } else if (tipo === 'marcas') {
      const marcas = await prisma.marca.findMany({
        where: whereBase,
        include: { user: { select: { email: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
      })
      csv = toCsv(
        ['Nombre', 'CUIT', 'Tipo', 'Ubicacion', 'Email', 'Volumen mensual', 'Pedidos realizados', 'Fecha registro'],
        marcas.map(m => [
          m.nombre, m.cuit, m.tipo ?? '', m.ubicacion ?? '',
          m.user.email, String(m.volumenMensual), String(m.pedidosRealizados),
          m.user.createdAt.toISOString().split('T')[0],
        ]),
      )
      filename = 'marcas.csv'

    } else if (tipo === 'pedidos') {
      const pedidos = await prisma.pedido.findMany({
        where: whereBase,
        include: { marca: { select: { nombre: true } } },
        orderBy: { createdAt: 'desc' },
      })
      csv = toCsv(
        ['ID', 'Marca', 'Tipo prenda', 'Cantidad', 'Estado', 'Monto total', 'Fecha creacion', 'Fecha objetivo'],
        pedidos.map(p => [
          p.omId, p.marca.nombre, p.tipoPrenda, String(p.cantidad), p.estado,
          String(p.montoTotal ?? ''), p.createdAt.toISOString().split('T')[0],
          p.fechaObjetivo ? p.fechaObjetivo.toISOString().split('T')[0] : '',
        ]),
      )
      filename = 'pedidos.csv'

    } else if (tipo === 'denuncias') {
      const denuncias = await prisma.denuncia.findMany({
        where: whereBase,
        orderBy: { createdAt: 'desc' },
      })
      csv = toCsv(
        ['Tipo', 'Estado', 'Anonima', 'Fecha recepcion', 'Ultima actualizacion'],
        denuncias.map(d => [
          d.tipo, d.estado, d.anonima ? 'Si' : 'No',
          d.createdAt.toISOString().split('T')[0],
          d.updatedAt.toISOString().split('T')[0],
        ]),
      )
      filename = 'denuncias.csv'
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error en GET /api/exportar:', error)
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 })
  }
}
