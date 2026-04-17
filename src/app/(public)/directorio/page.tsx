export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/compartido/lib/prisma'
import { getFeatureFlag } from '@/compartido/lib/features'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { Star, MapPin, Users, ArrowRight, Factory } from 'lucide-react'

const nivelColor: Record<string, 'warning' | 'default' | 'success'> = { BRONCE: 'warning', PLATA: 'default', ORO: 'success' }
const allowedNiveles = ['BRONCE', 'PLATA', 'ORO'] as const

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; nivel?: string; proceso?: string; prenda?: string }> | { q?: string; nivel?: string; proceso?: string; prenda?: string }
}) {
  if (!await getFeatureFlag('directorio_publico')) notFound()

  const params = await Promise.resolve(searchParams ?? {})
  const query = (params.q || '').trim()
  const nivelRaw = (params.nivel || '').trim().toUpperCase()
  const nivel = allowedNiveles.includes(nivelRaw as (typeof allowedNiveles)[number])
    ? (nivelRaw as (typeof allowedNiveles)[number])
    : ''
  const procesoId = (params.proceso || '').trim()
  const prendaId = (params.prenda || '').trim()

  const [procesos, prendas, talleres] = await Promise.all([
    prisma.procesoProductivo.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.tipoPrenda.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.taller.findMany({
      where: {
        ...(query ? { OR: [
          { nombre: { contains: query, mode: 'insensitive' as const } },
          { ubicacion: { contains: query, mode: 'insensitive' as const } },
          { provincia: { contains: query, mode: 'insensitive' as const } },
          { partido: { contains: query, mode: 'insensitive' as const } },
        ]} : {}),
        ...(nivel ? { nivel } : {}),
        ...(procesoId ? { procesos: { some: { procesoId } } } : {}),
        ...(prendaId ? { prendas: { some: { prendaId } } } : {}),
      },
      include: {
        procesos: { include: { proceso: true } },
        prendas: { include: { prenda: true } },
      },
      orderBy: { puntaje: 'desc' },
    }),
  ])

  const hasFilters = query || nivel || procesoId || prendaId

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">Directorio de Talleres</h1>
        <p className="text-gray-600">Encontra talleres textiles registrados y verificados en la plataforma.</p>
      </div>

      <form method="get" className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre o ubicacion..."
            aria-label="Buscar por nombre o ubicacion"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          <select name="nivel" defaultValue={nivel}
            aria-label="Filtrar por nivel"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos los niveles</option>
            <option value="BRONCE">Bronce</option>
            <option value="PLATA">Plata</option>
            <option value="ORO">Oro</option>
          </select>
          <select name="proceso" defaultValue={procesoId}
            aria-label="Filtrar por proceso productivo"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos los procesos</option>
            {procesos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <select name="prenda" defaultValue={prendaId}
            aria-label="Filtrar por tipo de prenda"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Todas las prendas</option>
            {prendas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-3">
          <button type="submit"
            className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90">
            Filtrar
          </button>
          {hasFilters && (
            <a href="/directorio"
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
              Limpiar filtros
            </a>
          )}
        </div>
      </form>

      <p className="text-sm text-gray-500 mb-4">
        {talleres.length} {talleres.length === 1 ? 'taller encontrado' : 'talleres encontrados'}
        {hasFilters ? ' con los filtros aplicados' : ''}
      </p>

      {talleres.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No encontramos talleres con esos filtros</p>
          {hasFilters && (
            <a href="/directorio" className="text-brand-blue underline text-sm mt-2 block">
              Ver todos los talleres
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {talleres.map((taller) => (
            <Link key={taller.id} href={`/perfil/${taller.id}`}>
              <Card className="h-full hover:shadow-card-hover transition-shadow p-0 overflow-hidden">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  {taller.portfolioFotos?.[0] ? (
                    <img
                      src={taller.portfolioFotos[0]}
                      alt={taller.nombre}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Factory className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-overpass font-bold text-lg text-brand-blue">{taller.nombre}</h2>
                  <Badge variant={nivelColor[taller.nivel]}>{taller.nivel}</Badge>
                </div>

                {(taller.provincia || taller.ubicacion) && (
                  <p className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <MapPin className="w-3.5 h-3.5" /> {taller.provincia ? `${taller.provincia}${taller.partido ? `, ${taller.partido}` : ''}` : taller.ubicacion}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500" /> {taller.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {taller.trabajadoresRegistrados}
                  </span>
                  <span>{taller.capacidadMensual.toLocaleString()} u/mes</span>
                </div>

                {taller.procesos.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {taller.procesos.map((tp) => (
                      <Badge key={tp.id} variant="outline" className="text-xs">{tp.proceso.nombre}</Badge>
                    ))}
                  </div>
                )}

                <span className="inline-flex items-center gap-1 text-sm text-brand-blue font-semibold">
                  Ver perfil <ArrowRight className="w-3.5 h-3.5" />
                </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
