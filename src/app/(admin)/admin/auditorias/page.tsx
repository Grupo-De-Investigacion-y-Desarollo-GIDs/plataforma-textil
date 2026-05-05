export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, AlertTriangle, ClipboardCheck, Clock } from 'lucide-react'
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { SkeletonTable } from '@/compartido/componentes/ui/skeleton'
import AuditoriasClient from './auditorias-client'

const tipoLabels: Record<string, string> = {
  PRIMERA_VISITA: 'Primera visita',
  VERIFICACION: 'Verificación de habilitaciones',
  SEGUIMIENTO: 'Seguimiento',
  RE_AUDITORIA: 'Re-auditoría',
}

const estadoConfig: Record<string, { label: string; bg: string; text: string }> = {
  PROGRAMADA: { label: 'Programada', bg: 'bg-blue-100', text: 'text-blue-700' },
  EN_CURSO: { label: 'En curso', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  COMPLETADA: { label: 'Completada', bg: 'bg-green-100', text: 'text-green-700' },
  CANCELADA: { label: 'Cancelada', bg: 'bg-gray-100', text: 'text-gray-500' },
}

async function AuditoriasContent() {
  const [auditorias, talleres, countByEstado] = await Promise.all([
    prisma.auditoria.findMany({
      include: {
        taller: { select: { nombre: true, ubicacion: true, nivel: true } },
        inspector: { select: { name: true } },
        _count: { select: { acciones: true } },
      },
      orderBy: { fecha: 'desc' },
      take: 50,
    }),
    prisma.taller.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.auditoria.groupBy({
      by: ['estado'],
      _count: true,
    }),
  ])

  const counts: Record<string, number> = {}
  countByEstado.forEach(g => { counts[g.estado] = g._count })
  const programadas = counts['PROGRAMADA'] ?? 0
  const completadas = counts['COMPLETADA'] ?? 0
  const enCurso = counts['EN_CURSO'] ?? 0

  const proximas = auditorias.filter(a => a.estado === 'PROGRAMADA')
  const pendientesInforme = auditorias.filter(a => a.estado === 'EN_CURSO')
  const historial = auditorias.filter(a => a.estado === 'COMPLETADA' || a.estado === 'CANCELADA')

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Auditorias</h1>
          <p className="text-gray-500 text-sm">Programacion y seguimiento de auditorias presenciales</p>
        </div>
        <AuditoriasClient talleres={talleres} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{programadas}</p>
              <p className="text-xs text-gray-500">Programadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{enCurso}</p>
              <p className="text-xs text-gray-500">En curso / Pendientes informe</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{completadas}</p>
              <p className="text-xs text-gray-500">Completadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proximas auditorias */}
      <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Proximas Auditorias</h2>
      {proximas.length === 0 ? (
        <div className="mb-6">
          <EmptyState
            titulo="Sin auditorias programadas"
            mensaje="No hay auditorias pendientes. Programa una nueva desde el boton de arriba."
          />
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {proximas.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-blue" />
                    {a.fecha ? a.fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : 'Sin fecha'}
                    {a.fecha ? ` - ${a.fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </p>
                  <p className="text-sm mt-1">Taller: <strong>{a.taller.nombre}</strong></p>
                  {a.taller.ubicacion && <p className="text-xs text-gray-500">{a.taller.ubicacion}</p>}
                  <p className="text-xs text-gray-500">
                    {a.inspector?.name ? `Auditor: ${a.inspector.name}` : 'Sin auditor asignado'}
                    {' | '}{tipoLabels[a.tipo] ?? a.tipo}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoConfig[a.estado]?.bg} ${estadoConfig[a.estado]?.text}`}>
                  {estadoConfig[a.estado]?.label ?? a.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pendientes de informe */}
      {pendientesInforme.length > 0 && (
        <>
          <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Pendientes de Informe</h2>
          <div className="space-y-3 mb-6">
            {pendientesInforme.map(a => (
              <div key={a.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 border-l-4 border-l-yellow-400">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      {a.fecha ? a.fecha.toLocaleDateString('es-AR') : 'Sin fecha'} - {a.taller.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.inspector?.name ? `Auditor: ${a.inspector.name}` : 'Sin auditor'}
                      {' | '}{tipoLabels[a.tipo] ?? a.tipo}
                      {a._count.acciones > 0 ? ` | ${a._count.acciones} acciones correctivas` : ''}
                    </p>
                  </div>
                  <Link
                    href={`/admin/auditorias/${a.id}`}
                    className="text-xs font-semibold text-brand-blue bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Cargar informe
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <>
          <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Historial</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {historial.map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.taller.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {a.fecha ? a.fecha.toLocaleDateString('es-AR') : 'Sin fecha'}
                    {' | '}{tipoLabels[a.tipo] ?? a.tipo}
                    {a.resultado ? ` | ${a.resultado}` : ''}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoConfig[a.estado]?.bg} ${estadoConfig[a.estado]?.text}`}>
                  {estadoConfig[a.estado]?.label ?? a.estado}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default async function AdminAuditoriasPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto py-6 px-4"><SkeletonTable rows={5} /></div>}>
      <AuditoriasContent />
    </Suspense>
  )
}
