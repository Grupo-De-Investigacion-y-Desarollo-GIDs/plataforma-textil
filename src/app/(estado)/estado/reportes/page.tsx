'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Download, FileText } from 'lucide-react'

const reportes = [
  { id: '1', nombre: 'Talleres por nivel', descripcion: 'Distribución de talleres según nivel de formalización (Bronce, Plata, Oro)', tipo: 'Formalización' },
  { id: '2', nombre: 'Avance de formalización', descripcion: 'Progreso mensual del proceso de formalización de talleres', tipo: 'Formalización' },
  { id: '3', nombre: 'Auditorías realizadas', descripcion: 'Resumen de auditorías por tipo, estado y resultado', tipo: 'Auditorías' },
  { id: '4', nombre: 'Denuncias recibidas', descripcion: 'Estado y evolución de denuncias por período', tipo: 'Denuncias' },
  { id: '5', nombre: 'Capacitación completada', descripcion: 'Talleres que completaron cursos y obtuvieron certificados', tipo: 'Capacitación' },
  { id: '6', nombre: 'Indicadores generales', descripcion: 'KPIs del sector textil: empleo, producción, formalización', tipo: 'General' },
]

export default function EstadoReportesPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Reportes</h1>
          <p className="text-gray-500 text-sm">Reportes y estadísticas del sector textil</p>
        </div>
      </div>

      <div className="grid gap-4">
        {reportes.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-bg-light flex items-center justify-center flex-shrink-0">
                  {r.tipo === 'General' ? <BarChart3 className="w-5 h-5 text-brand-blue" /> : <FileText className="w-5 h-5 text-brand-blue" />}
                </div>
                <div>
                  <h2 className="font-overpass font-semibold text-gray-900">{r.nombre}</h2>
                  <p className="text-sm text-gray-500 mt-1">{r.descripcion}</p>
                  <span className="text-xs text-brand-blue font-medium mt-1 inline-block">{r.tipo}</span>
                </div>
              </div>
              <Button size="sm" variant="secondary" icon={<Download className="w-4 h-4" />}>
                Exportar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
