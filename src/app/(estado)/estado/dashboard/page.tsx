'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Users, Building2, Award, BookOpen, FileText, BarChart3, Mail, AlertTriangle, Info } from 'lucide-react'

interface Stats {
  talleres: number; marcas: number; certificados: number;
  talleresPorNivel: Record<string, number>
}

const alertas = [
  { tipo: 'warning', texto: '2 talleres con habilitación municipal por vencer' },
  { tipo: 'warning', texto: '1 marca reportó problema con entrega' },
  { tipo: 'info', texto: '3 nuevos talleres registrados esta semana' },
]

export default function DashboardEstadoPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  const totalTalleres = stats?.talleres || 0
  const nivelesData = stats?.talleresPorNivel || {}

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Panel de Acompañamiento</h1>
      <p className="text-gray-500 text-sm mb-6">Monitoreo del sector textil</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={String(stats?.talleres || 0)} label="Talleres registrados" variant="success" />
        <StatCard value={String(stats?.marcas || 0)} label="Marcas registradas" variant="success" />
        <StatCard value={String(stats?.certificados || 0)} label="Certificados emitidos" variant="warning" />
        <StatCard value="45" label="Cursos completados" variant="muted" />
      </div>

      <Card title="Distribución por Nivel" className="mb-6">
        {['ORO', 'PLATA', 'BRONCE'].map(nivel => {
          const count = nivelesData[nivel] || 0
          const pct = totalTalleres > 0 ? Math.round((count / totalTalleres) * 100) : 0
          const colors: Record<string, string> = { ORO: 'bg-yellow-500', PLATA: 'bg-gray-400', BRONCE: 'bg-orange-400' }
          return (
            <div key={nivel} className="flex items-center gap-3 mb-2">
              <span className="w-16 text-sm font-semibold">{nivel} ({count})</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${colors[nivel]} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-10 text-sm text-gray-500 text-right">{pct}%</span>
            </div>
          )
        })}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card title="Talleres que necesitan acompañamiento">
          <ul className="space-y-2 text-sm">
            <li>5 talleres no completaron el registro</li>
            <li>3 talleres sin actividad en 30 días</li>
            <li>2 talleres con certificados por vencer</li>
          </ul>
          <Link href="/estado/exportar" className="text-sm text-brand-blue font-semibold hover:underline mt-3 block">
            Ver listado completo
          </Link>
        </Card>

        <Card title="Cursos más completados">
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Formalización básica (15 talleres)</li>
            <li>Cálculo de costos (12 talleres)</li>
            <li>Control de calidad (8 talleres)</li>
          </ol>
        </Card>
      </div>

      <Card title="Alertas Recientes" className="mb-6">
        <div className="space-y-2">
          {alertas.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {a.tipo === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" /> : <Info className="w-4 h-4 text-blue-500 shrink-0" />}
              {a.texto}
            </div>
          ))}
        </div>
      </Card>

      <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Acciones Rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/directorio"><Card className="text-center hover:shadow-card-hover transition-shadow cursor-pointer p-4"><Users className="w-6 h-6 text-brand-blue mx-auto mb-2" /><p className="text-sm font-semibold">Ver todos los talleres</p></Card></Link>
        <Link href="/estado/exportar"><Card className="text-center hover:shadow-card-hover transition-shadow cursor-pointer p-4"><BarChart3 className="w-6 h-6 text-brand-blue mx-auto mb-2" /><p className="text-sm font-semibold">Exportar reporte</p></Card></Link>
        <Card className="text-center hover:shadow-card-hover transition-shadow cursor-pointer p-4"><Mail className="w-6 h-6 text-brand-blue mx-auto mb-2" /><p className="text-sm font-semibold">Enviar recordatorios</p></Card>
      </div>
    </div>
  )
}
