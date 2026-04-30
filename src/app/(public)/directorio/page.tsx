export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/compartido/lib/prisma'
import { getFeatureFlag } from '@/compartido/lib/features'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { Star, MapPin, Users, ArrowRight, Factory, ShieldCheck } from 'lucide-react'

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; proceso?: string; prenda?: string; page?: string }> | { q?: string; proceso?: string; prenda?: string; page?: string }
}) {
  if (!await getFeatureFlag('directorio_publico')) notFound()

  const params = await Promise.resolve(searchParams ?? {})
  const query = (params.q || '').trim()
  const procesoId = (params.proceso || '').trim()
  const prendaId = (params.prenda || '').trim()
  const page = Math.max(1, parseInt(params.page || '1'))
  const PAGE_SIZE = 12

  const tallerWhere = {
    verificadoAfip: true,
    ...(query ? { OR: [
      { nombre: { contains: query, mode: 'insensitive' as const } },
      { ubicacion: { contains: query, mode: 'insensitive' as const } },
      { provincia: { contains: query, mode: 'insensitive' as const } },
      { partido: { contains: query, mode: 'insensitive' as const } },
    ]} : {}),
    ...(procesoId ? { procesos: { some: { procesoId } } } : {}),
    ...(prendaId ? { prendas: { some: { prendaId } } } : {}),
  }

  const [procesos, prendas, talleres, totalTalleres] = await Promise.all([
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
      where: tallerWhere,
      include: {
        procesos: { include: { proceso: true } },
        prendas: { include: { prenda: true } },
        validaciones: {
          where: { estado: 'COMPLETADO' },
          select: { tipoDocumento: { select: { nombre: true } } },
        },
      },
      orderBy: { puntaje: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.taller.count({ where: tallerWhere }),
  ])

  const hasFilters = query || procesoId || prendaId

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">Directorio de Talleres</h1>
        <p className="text-gray-600">Encontra talleres textiles registrados y verificados en la plataforma.</p>
      </div>

      <form method="get" className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre o ubicacion..."
            aria-label="Buscar por nombre o ubicacion"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
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
        {totalTalleres} {totalTalleres === 1 ? 'taller encontrado' : 'talleres encontrados'}
        {hasFilters ? ' con los filtros aplicados' : ''}
        {totalTalleres > PAGE_SIZE && ` — página ${page} de ${Math.ceil(totalTalleres / PAGE_SIZE)}`}
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
                <div className="mb-3">
                  <h2 className="font-overpass font-bold text-lg text-brand-blue">{taller.nombre}</h2>
                  {taller.validaciones.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span className="text-xs text-green-700 font-medium">
                        {taller.validaciones.length} {taller.validaciones.length === 1 ? 'credencial verificada' : 'credenciales verificadas'}
                      </span>
                    </div>
                  )}
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

      {/* Paginación */}
      {totalTalleres > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/directorio?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(procesoId ? { proceso: procesoId } : {}), ...(prendaId ? { prenda: prendaId } : {}), page: String(page - 1) }).toString()}`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
            >
              ← Anterior
            </Link>
          )}
          {Array.from({ length: Math.ceil(totalTalleres / PAGE_SIZE) }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/directorio?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(procesoId ? { proceso: procesoId } : {}), ...(prendaId ? { prenda: prendaId } : {}), page: String(p) }).toString()}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium ${
                p === page ? 'bg-brand-blue text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </Link>
          ))}
          {page < Math.ceil(totalTalleres / PAGE_SIZE) && (
            <Link
              href={`/directorio?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(procesoId ? { proceso: procesoId } : {}), ...(prendaId ? { prenda: prendaId } : {}), page: String(page + 1) }).toString()}`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
