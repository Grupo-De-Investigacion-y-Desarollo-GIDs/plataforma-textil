export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { StatCard } from '@/compartido/componentes/ui/stat-card'
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { Badge } from '@/compartido/componentes/ui/badge'
import { calcularEtapa, ETAPA_LABELS, ETAPA_COLORS, type EtapaOnboarding } from '@/compartido/lib/onboarding'
import { AccionesRapidasOnboarding } from './acciones-rapidas'

export default async function AdminOnboardingPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const usuarios = await prisma.user.findMany({
    where: { role: { in: ['TALLER', 'MARCA'] }, active: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const usuariosConEtapa = await Promise.all(
    usuarios.map(async u => ({
      ...u,
      etapa: await calcularEtapa(u.id, u.role),
    }))
  )

  const conteos: Record<EtapaOnboarding, number> = {
    INVITADO: 0,
    REGISTRADO: 0,
    PERFIL_COMPLETO: 0,
    ACTIVO: 0,
    INACTIVO: 0,
  }
  for (const u of usuariosConEtapa) {
    conteos[u.etapa]++
  }

  const total = usuariosConEtapa.length
  const pctRegistrados = total > 0 ? Math.round(((total - conteos.INVITADO) / total) * 100) : 0
  const pctPerfilCompleto = total > 0 ? Math.round(((conteos.PERFIL_COMPLETO + conteos.ACTIVO) / total) * 100) : 0
  const pctActivos = total > 0 ? Math.round((conteos.ACTIVO / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue">Estado del onboarding</h1>
          <p className="text-sm text-gray-500 mt-1">Seguimiento del progreso de talleres y marcas en el piloto</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <StatCard value={String(total)} label="Total usuarios" variant="muted" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <StatCard value={String(conteos.INVITADO)} label="Invitados" variant="muted" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <StatCard value={String(conteos.REGISTRADO)} label="Registrados" variant="warning" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <StatCard value={String(conteos.ACTIVO)} label="Activos" variant="success" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <StatCard value={String(conteos.INACTIVO)} label="Inactivos" variant="warning" />
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-overpass font-bold text-lg text-gray-800 mb-4">Funnel de adopcion</h2>
        <div className="space-y-3">
          <FunnelBar label="Invitados" count={total} pct={100} color="bg-gray-300" />
          <FunnelBar label="Registrados" count={total - conteos.INVITADO} pct={pctRegistrados} color="bg-blue-400" />
          <FunnelBar label="Perfil completo" count={conteos.PERFIL_COMPLETO + conteos.ACTIVO} pct={pctPerfilCompleto} color="bg-amber-400" />
          <FunnelBar label="Activos" count={conteos.ACTIVO} pct={pctActivos} color="bg-green-500" />
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-overpass font-bold text-lg text-gray-800">Usuarios</h2>
        </div>
        {usuariosConEtapa.length === 0 ? (
          <EmptyState
            titulo="Sin usuarios de onboarding"
            mensaje="No hay talleres ni marcas registrados todavia."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 font-overpass font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-6 py-3 font-overpass font-semibold text-gray-600">Rol</th>
                  <th className="text-left px-6 py-3 font-overpass font-semibold text-gray-600">Etapa</th>
                  <th className="text-left px-6 py-3 font-overpass font-semibold text-gray-600">Registro</th>
                  <th className="text-left px-6 py-3 font-overpass font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuariosConEtapa.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{u.name ?? 'Sin nombre'}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant="outline">{u.role}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ETAPA_COLORS[u.etapa]}`}>
                        {ETAPA_LABELS[u.etapa]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-3">
                      <AccionesRapidasOnboarding
                        userId={u.id}
                        userName={u.name ?? 'Usuario'}
                        userRole={u.role}
                        userPhone={u.phone}
                        etapa={u.etapa}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function FunnelBar({ label, count, pct, color }: { label: string; count: number; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-32 text-sm text-gray-600 text-right">{label}</span>
      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="w-20 text-sm text-gray-700 font-medium">{count} ({pct}%)</span>
    </div>
  )
}
