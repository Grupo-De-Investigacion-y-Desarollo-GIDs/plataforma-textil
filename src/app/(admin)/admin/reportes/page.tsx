export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'

export default async function AdminReportesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') redirect('/login')

  // Stats principales
  const [
    totalTalleres,
    totalMarcas,
    totalCertificados,
    totalVideosVistos,
    nivelDistrib,
    registrosPorMes,
  ] = await Promise.all([
    prisma.taller.count(),
    prisma.marca.count(),
    prisma.certificado.count({ where: { revocado: false } }),
    prisma.progresoCapacitacion.count(),
    prisma.taller.groupBy({ by: ['nivel'], _count: true }),
    // Registros últimos 6 meses
    prisma.$queryRaw<{ mes: string; talleres: bigint; marcas: bigint }[]>`
      SELECT
        to_char(u."createdAt", 'YYYY-MM') as mes,
        COUNT(CASE WHEN u."role" = 'TALLER' THEN 1 END) as talleres,
        COUNT(CASE WHEN u."role" = 'MARCA' THEN 1 END) as marcas
      FROM users u
      WHERE u."createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY to_char(u."createdAt", 'YYYY-MM')
      ORDER BY mes ASC
    `,
  ])

  // Distribución nivel
  const nivelMap: Record<string, number> = { ORO: 0, PLATA: 0, BRONCE: 0 }
  for (const g of nivelDistrib) {
    nivelMap[g.nivel] = g._count
  }
  const niveles = [
    { nivel: 'Oro', count: nivelMap.ORO, color: 'bg-yellow-400' },
    { nivel: 'Plata', count: nivelMap.PLATA, color: 'bg-gray-400' },
    { nivel: 'Bronce', count: nivelMap.BRONCE, color: 'bg-amber-600' },
  ]
  const totalNivel = totalTalleres || 1

  // Registros por mes - formatear
  const mesesLabel: Record<string, string> = {
    '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
  }
  const registros = registrosPorMes.map(r => ({
    mes: mesesLabel[r.mes.split('-')[1]] || r.mes,
    talleres: Number(r.talleres),
    marcas: Number(r.marcas),
  }))
  const maxRegistros = Math.max(...registros.map(r => Math.max(r.talleres, r.marcas)), 1)

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Reportes y Estadisticas</h1>
      <p className="text-gray-500 text-sm mb-6">Metricas de la plataforma</p>

      <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Metricas Principales</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={String(totalTalleres)} label="Talleres" variant="success" />
        <StatCard value={String(totalMarcas)} label="Marcas" variant="success" />
        <StatCard value={String(totalCertificados)} label="Certificados" variant="warning" />
        <StatCard value={String(totalVideosVistos)} label="Videos completados" variant="muted" />
      </div>

      <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Distribucion por Nivel</h2>
      <Card className="mb-6">
        {totalTalleres === 0 ? (
          <p className="text-sm text-gray-500 py-2">Sin talleres registrados.</p>
        ) : (
          <div className="space-y-3">
            {niveles.map(n => {
              const pct = Math.round((n.count / totalNivel) * 100)
              return (
                <div key={n.nivel} className="flex items-center gap-3">
                  <span className="text-sm font-semibold w-16">{n.nivel}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4">
                    <div className={`${n.color} h-4 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-gray-500 w-20 text-right">{pct}% ({n.count})</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Registros por Mes</h2>
      <Card className="mb-6">
        {registros.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">Sin registros en los ultimos 6 meses.</p>
        ) : (
          <>
            <div className="flex items-end gap-3 h-40 px-4">
              {registros.map(m => (
                <div key={m.mes} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex gap-0.5 items-end w-full justify-center">
                    <div className="bg-brand-blue rounded-t w-3" style={{ height: `${(m.talleres / maxRegistros) * 120}px` }} />
                    <div className="bg-brand-blue/40 rounded-t w-3" style={{ height: `${(m.marcas / maxRegistros) * 120}px` }} />
                  </div>
                  <span className="text-xs text-gray-500">{m.mes}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 justify-center mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-brand-blue rounded" /> Talleres</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-brand-blue/40 rounded" /> Marcas</span>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
