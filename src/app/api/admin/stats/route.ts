import { NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'

export async function GET() {
  try {
    const sesion = await requiereRolApi(['ADMIN'])
    if (sesion instanceof NextResponse) return sesion

    const [talleres, marcas, pedidos, auditorias, usuarios, denuncias, certificados] = await Promise.all([
      prisma.taller.count(),
      prisma.marca.count(),
      prisma.pedido.count(),
      prisma.auditoria.count(),
      prisma.user.count(),
      prisma.denuncia.count(),
      prisma.certificado.count(),
    ])

    const pedidosPorEstado = await prisma.pedido.groupBy({ by: ['estado'], _count: true })
    const talleresPorNivel = await prisma.taller.groupBy({ by: ['nivel'], _count: true })

    return NextResponse.json({
      talleres, marcas, pedidos, auditorias, usuarios, denuncias, certificados,
      pedidosPorEstado: Object.fromEntries(pedidosPorEstado.map((p: { estado: string; _count: number }) => [p.estado, p._count])),
      talleresPorNivel: Object.fromEntries(talleresPorNivel.map((t: { nivel: string; _count: number }) => [t.nivel, t._count])),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
