export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { getFeatureFlag } from '@/compartido/lib/features'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { Star, MapPin, Users, ArrowRight } from 'lucide-react'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { DirectorioFiltros } from '@/compartido/componentes/directorio-filtros'
import { TallerFotoPlaceholder } from '@/compartido/componentes/taller-foto-placeholder'
import { derivarUbicaciones } from '@/compartido/lib/directorio-ubicaciones'
import { tallerCumpleVidrieraMinima, bloqueVisiblePublico } from '@/compartido/lib/visibilidad-vidriera'
import { rangoCapacidad } from '@/compartido/lib/taller-formulario'

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; proceso?: string; prenda?: string; provincia?: string; partido?: string; page?: string }> | { q?: string; proceso?: string; prenda?: string; provincia?: string; partido?: string; page?: string }
}) {
  if (!await getFeatureFlag('directorio_publico')) notFound()

  // Bug 2 (QA #448): el layout (public) logueado ya envuelve en un container con
  // padding lateral (max-w-7xl + px), pero el anónimo usa <main> full-width (para las
  // páginas de marketing). El listado necesita su propio container SOLO cuando el
  // usuario es anónimo — así no queda a ras del borde ni excede el encabezado, y no se
  // duplica el padding cuando está logueado.
  const session = await auth()
  const wrapperClass = session?.user ? '' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6'

  const params = await Promise.resolve(searchParams ?? {})
  const query = (params.q || '').trim()
  const procesoId = (params.proceso || '').trim()
  const prendaId = (params.prenda || '').trim()
  const provincia = (params.provincia || '').trim()
  const partido = (params.partido || '').trim()
  const page = Math.max(1, parseInt(params.page || '1'))
  const PAGE_SIZE = 12

  const tallerWhere = {
    verificadoAfip: true,
    ...(query ? { OR: [
      { nombre: { contains: query, mode: 'insensitive' as const } },
      { ubicacion: { contains: query, mode: 'insensitive' as const } },
    ]} : {}),
    ...(procesoId ? { procesos: { some: { procesoId } } } : {}),
    ...(prendaId ? { prendas: { some: { prendaId } } } : {}),
    ...(provincia ? { provincia } : {}),
    ...(partido ? { partido } : {}),
  }

  const [procesos, prendas, ubicaciones, candidatos] = await Promise.all([
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
    derivarUbicaciones(),
    // Vidriera mínima (Etapa 2.3-A) + R-DIR (§4.4): la visibilidad vive en JSONB (no
    // queryable eficiente en SQL), así que traemos los candidatos por verificadoAfip +
    // filtros y filtramos en app por la vidriera mínima (descripción ≥50, ubicación,
    // ≥1 rubro visible vía R-DIR; foto opcional en el piloto). La paginación es en app.
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
      orderBy: [{ verificadoAfip: 'desc' }, { puntaje: 'desc' }],
    }),
  ])

  // Vidriera mínima: solo talleres que cumplen los requisitos (descripción ≥50,
  // ubicación declarada, ≥1 rubro visible) aparecen en el directorio. Foto opcional.
  const elegibles = candidatos.filter(tallerCumpleVidrieraMinima)
  const totalTalleres = elegibles.length
  const talleres = elegibles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasFilters = query || procesoId || prendaId || provincia || partido

  return (
    <div className={wrapperClass}>
      <div className="text-center mb-8">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">Directorio de Proveedores</h1>
        <p className="text-gray-600">Encontra talleres textiles registrados y verificados en la plataforma.</p>
      </div>

      <DirectorioFiltros
        basePath="/directorio"
        q={query}
        procesoId={procesoId}
        prendaId={prendaId}
        provincia={provincia}
        partido={partido}
        procesos={procesos}
        prendas={prendas}
        provincias={ubicaciones.provincias}
        partidosPorProvincia={ubicaciones.partidosPorProvincia}
      />

      <p className="text-sm text-gray-500 mb-4">
        {totalTalleres} {totalTalleres === 1 ? 'taller encontrado' : 'talleres encontrados'}
        {hasFilters ? ' con los filtros aplicados' : ''}
        {totalTalleres > PAGE_SIZE && ` — página ${page} de ${Math.ceil(totalTalleres / PAGE_SIZE)}`}
      </p>

      {talleres.length === 0 ? (
        <EmptyState
          titulo={hasFilters ? 'No encontramos talleres con esos filtros' : 'No hay talleres registrados aun'}
          mensaje={hasFilters ? 'Proba cambiando los filtros de busqueda.' : 'Cuando se registren talleres verificados, van a aparecer aca.'}
          accion={hasFilters ? { texto: 'Ver todos los talleres', href: '/directorio' } : undefined}
        />
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
                    <TallerFotoPlaceholder />
                  )}
                </div>
                <div className="p-4">
                <div className="mb-3">
                  <h2 className="font-overpass font-bold text-lg text-brand-blue">{taller.nombre}</h2>
                  {taller.verificadoAfip && <BadgeArca verificado={true} />}
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
                  {/* Capacidad: RANGO, nunca el número exacto en público (§4.5). */}
                  {rangoCapacidad(taller.capacidadMensual) && (
                    <span>{rangoCapacidad(taller.capacidadMensual)}</span>
                  )}
                </div>

                {taller.procesos.length > 0 && bloqueVisiblePublico(taller, 'procesos') && (
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
              href={`/directorio?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(procesoId ? { proceso: procesoId } : {}), ...(prendaId ? { prenda: prendaId } : {}), ...(provincia ? { provincia } : {}), ...(partido ? { partido } : {}), page: String(page - 1) }).toString()}`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
            >
              ← Anterior
            </Link>
          )}
          {Array.from({ length: Math.ceil(totalTalleres / PAGE_SIZE) }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/directorio?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(procesoId ? { proceso: procesoId } : {}), ...(prendaId ? { prenda: prendaId } : {}), ...(provincia ? { provincia } : {}), ...(partido ? { partido } : {}), page: String(p) }).toString()}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium ${
                p === page ? 'bg-brand-blue text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </Link>
          ))}
          {page < Math.ceil(totalTalleres / PAGE_SIZE) && (
            <Link
              href={`/directorio?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(procesoId ? { proceso: procesoId } : {}), ...(prendaId ? { prenda: prendaId } : {}), ...(provincia ? { provincia } : {}), ...(partido ? { partido } : {}), page: String(page + 1) }).toString()}`}
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
