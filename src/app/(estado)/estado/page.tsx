export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Factory, Store, FileCheck, Award, Clock, TrendingUp, AlertCircle } from 'lucide-react'

export default async function EstadoDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const [
    totalTalleres,
    totalMarcas,
    bronce,
    plata,
    oro,
    validacionesPendientes,
    totalCertificados,
    talleresConProgreso,
    pedidosActivos,
  ] = await prisma.$transaction([
    prisma.taller.count(),
    prisma.marca.count(),
    prisma.taller.count({ where: { nivel: 'BRONCE' } }),
    prisma.taller.count({ where: { nivel: 'PLATA' } }),
    prisma.taller.count({ where: { nivel: 'ORO' } }),
    prisma.validacion.count({ where: { estado: 'PENDIENTE' } }),
    prisma.certificado.count({ where: { revocado: false } }),
    prisma.progresoCapacitacion.count({ where: { porcentajeCompletado: 100 } }),
    prisma.pedido.count({ where: { estado: 'EN_EJECUCION' } }),
  ])

  // Últimas validaciones pendientes de revisión
  const ultimasPendientes = await prisma.validacion.findMany({
    where: { estado: 'PENDIENTE' },
    include: { taller: { select: { id: true, nombre: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  })

  // Talleres que subieron de nivel recientemente (logs)
  const logsNivel = await prisma.logActividad.findMany({
    where: { accion: 'VALIDACION_APROBADA' },
    orderBy: { timestamp: 'desc' },
    take: 5,
    include: { user: { select: { name: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Monitoreo de la Plataforma Digital Textil</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <Factory className="w-6 h-6 text-brand-blue mx-auto mb-1" />
          <p className="font-overpass font-bold text-3xl text-brand-blue">{totalTalleres}</p>
          <p className="text-xs text-gray-500">Talleres registrados</p>
        </Card>
        <Card className="text-center">
          <Store className="w-6 h-6 text-brand-blue mx-auto mb-1" />
          <p className="font-overpass font-bold text-3xl text-brand-blue">{totalMarcas}</p>
          <p className="text-xs text-gray-500">Marcas registradas</p>
        </Card>
        <Card className="text-center">
          <Award className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <p className="font-overpass font-bold text-3xl text-brand-blue">{totalCertificados}</p>
          <p className="text-xs text-gray-500">Certificados emitidos</p>
        </Card>
        <Card className="text-center">
          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="font-overpass font-bold text-3xl text-brand-blue">{pedidosActivos}</p>
          <p className="text-xs text-gray-500">Pedidos en ejecución</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribución por nivel */}
        <Card title="Distribución por Nivel">
          <div className="space-y-3">
            {[
              { label: 'Bronce', count: bronce, color: 'bg-orange-400', textColor: 'text-orange-600' },
              { label: 'Plata', count: plata, color: 'bg-gray-400', textColor: 'text-gray-500' },
              { label: 'Oro', count: oro, color: 'bg-yellow-400', textColor: 'text-yellow-600' },
            ].map(({ label, count, color, textColor }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={`font-semibold ${textColor}`}>{label}</span>
                  <span className="font-semibold text-gray-700">{count} talleres</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: `${totalTalleres ? (count / totalTalleres) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
            <span>{totalTalleres} talleres en total</span>
            <span>{totalTalleres > 0 ? Math.round(((plata + oro) / totalTalleres) * 100) : 0}% formalizados (Plata+Oro)</span>
          </div>
        </Card>

        {/* Capacitación */}
        <Card title="Capacitación">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cursos completados</span>
              <span className="font-overpass font-bold text-brand-blue text-xl">{talleresConProgreso}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Certificados emitidos</span>
              <span className="font-overpass font-bold text-brand-blue text-xl">{totalCertificados}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <Link href="/estado/reportes" className="text-sm text-brand-blue font-semibold hover:underline">
                Ver reporte completo →
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Validaciones pendientes */}
      <Card title={
        <span className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-500" />
          Validaciones pendientes de revisión
          {validacionesPendientes > 0 && (
            <Badge variant="warning">{validacionesPendientes}</Badge>
          )}
        </span>
      }>
        {ultimasPendientes.length === 0 ? (
          <p className="text-sm text-gray-500">No hay validaciones pendientes.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {ultimasPendientes.map((v) => (
              <div key={v.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{v.taller.nombre}</p>
                  <p className="text-xs text-gray-500">{v.tipo.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {v.updatedAt.toLocaleDateString('es-AR')}
                  </span>
                  <Link href={`/admin/talleres/${v.taller.id}?tab=documentos`}>
                    <Badge variant="warning">Revisar</Badge>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {validacionesPendientes > 5 && (
          <p className="text-xs text-gray-400 mt-2">
            y {validacionesPendientes - 5} más pendientes.
          </p>
        )}
      </Card>

      {/* Actividad reciente */}
      {logsNivel.length > 0 && (
        <Card title="Actividad reciente — Aprobaciones">
          <div className="divide-y divide-gray-100">
            {logsNivel.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{log.user?.name || 'Admin'}</span>
                      {' aprobó validación'}
                    </p>
                    <p className="text-xs text-gray-400">{log.timestamp.toLocaleDateString('es-AR')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
