import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

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

    let csv = ''
    let filename = 'reporte.csv'

    if (tipo === 'talleres') {
      const talleres = await prisma.taller.findMany({
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
      const [totalTalleres, totalMarcas, totalCerts, niveles] = await Promise.all([
        prisma.taller.count(),
        prisma.marca.count(),
        prisma.certificado.count({ where: { revocado: false } }),
        prisma.taller.groupBy({ by: ['nivel'], _count: true }),
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
        ],
      )
      filename = 'resumen.csv'

    } else if (tipo === 'capacitaciones') {
      const certs = await prisma.certificado.findMany({
        where: { revocado: false },
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
      // Talleres con menos de 50% de validaciones completadas
      const talleres = await prisma.taller.findMany({
        include: {
          user: { select: { email: true } },
          validaciones: true,
        },
        orderBy: { puntaje: 'asc' },
      })
      const necesitan = talleres.filter(t => {
        const completadas = t.validaciones.filter(v => v.estado === 'COMPLETADO').length
        return completadas < 4 // menos de 50% de 8
      })
      csv = toCsv(
        ['Taller', 'CUIT', 'Nivel', 'Puntaje', 'Validaciones completadas', 'Email'],
        necesitan.map(t => {
          const completadas = t.validaciones.filter(v => v.estado === 'COMPLETADO').length
          return [t.nombre, t.cuit, t.nivel, String(t.puntaje), String(completadas), t.user.email]
        }),
      )
      filename = 'acompanamiento.csv'
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
