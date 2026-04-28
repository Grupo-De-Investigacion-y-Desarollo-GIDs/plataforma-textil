export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRol } from '@/compartido/lib/permisos'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { StatCard } from '@/compartido/componentes/ui/stat-card'
import { Eye } from 'lucide-react'

export default async function EstadoTalleresPage({
  searchParams,
}: {
  searchParams: Promise<{ nivel?: string; provincia?: string; pendientes?: string }>
}) {
  await requiereRol(['ESTADO', 'ADMIN'])

  const { nivel, provincia, pendientes } = await searchParams

  const where: Record<string, unknown> = {}
  if (nivel) where.nivel = nivel
  if (provincia) where.provincia = provincia

  const talleres = await prisma.taller.findMany({
    where,
    include: {
      user: { select: { email: true, active: true } },
      validaciones: { select: { estado: true } },
    },
    orderBy: { nombre: 'asc' },
  })

  // Enriquecer con conteo de docs pendientes
  const enriched = talleres.map(t => ({
    ...t,
    docsPendientes: t.validaciones.filter(v => v.estado === 'PENDIENTE').length,
    docsCompletados: t.validaciones.filter(v => v.estado === 'COMPLETADO').length,
    totalDocs: t.validaciones.length,
  }))

  // Filtro post-query por pendientes
  const filtered = pendientes === 'con'
    ? enriched.filter(t => t.docsPendientes > 0)
    : pendientes === 'sin'
      ? enriched.filter(t => t.docsPendientes === 0)
      : enriched

  const provincias = [...new Set(talleres.map(t => t.provincia).filter(Boolean))].sort()
  const byNivel = (n: string) => talleres.filter(t => t.nivel === n).length

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Talleres</h1>
      <p className="text-gray-500 text-sm mb-6">Vista regulatoria — estado de formalizacion y documentacion</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={String(talleres.length)} label="Total" variant="success" />
        <StatCard value={String(byNivel('ORO'))} label="Oro" variant="success" />
        <StatCard value={String(byNivel('PLATA'))} label="Plata" variant="muted" />
        <StatCard value={String(byNivel('BRONCE'))} label="Bronce" variant="warning" />
      </div>

      {/* Filtros */}
      <Card className="mb-4">
        <form method="get" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select name="nivel" defaultValue={nivel || ''} className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option value="">Todos los niveles</option>
            <option value="BRONCE">Bronce</option>
            <option value="PLATA">Plata</option>
            <option value="ORO">Oro</option>
          </select>
          <select name="provincia" defaultValue={provincia || ''} className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option value="">Todas las provincias</option>
            {provincias.map(p => (
              <option key={p} value={p!}>{p}</option>
            ))}
          </select>
          <select name="pendientes" defaultValue={pendientes || ''} className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option value="">Todos</option>
            <option value="con">Con docs pendientes</option>
            <option value="sin">Sin docs pendientes</option>
          </select>
          <div className="sm:col-span-3 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90">Filtrar</button>
            <a href="/estado/talleres" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200">Limpiar</a>
          </div>
        </form>
      </Card>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Taller</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Nivel</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Provincia</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Docs pendientes</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Progreso</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No se encontraron talleres.</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-sm">{t.nombre}</p>
                    <p className="text-xs text-gray-400">{t.cuit}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.nivel === 'ORO' ? 'success' : t.nivel === 'PLATA' ? 'default' : 'warning'}>{t.nivel}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.provincia || '-'}</td>
                  <td className="px-4 py-3">
                    {t.docsPendientes > 0 ? (
                      <Badge variant="warning">{t.docsPendientes} pendiente{t.docsPendientes > 1 ? 's' : ''}</Badge>
                    ) : (
                      <span className="text-xs text-gray-400">Ninguno</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-gray-600">{t.docsCompletados}/{t.totalDocs}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/estado/talleres/${t.id}`} className="p-1 hover:bg-gray-100 rounded inline-block" aria-label="Ver detalle">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
