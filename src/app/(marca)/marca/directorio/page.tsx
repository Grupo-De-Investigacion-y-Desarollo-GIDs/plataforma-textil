export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import Link from 'next/link'
import { MapPin, Star, MessageCircle } from 'lucide-react'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { DirectorioFiltros } from '@/compartido/componentes/directorio-filtros'
import { TallerFotoPlaceholder } from '@/compartido/componentes/taller-foto-placeholder'
import { derivarUbicaciones } from '@/compartido/lib/directorio-ubicaciones'
import { tallerCumpleVidrieraMinima, bloqueVisiblePublico } from '@/compartido/lib/visibilidad-vidriera'

const PAGE_SIZE = 12

type SearchParams = {
  q?: string
  proceso?: string
  prenda?: string
  provincia?: string
  partido?: string
  page?: string
}

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const query = (resolvedSearchParams.q || '').trim()
  const procesoId = (resolvedSearchParams.proceso || '').trim()
  const prendaId = (resolvedSearchParams.prenda || '').trim()
  const provincia = (resolvedSearchParams.provincia || '').trim()
  const partido = (resolvedSearchParams.partido || '').trim()
  const page = Math.max(1, parseInt(resolvedSearchParams.page || '1'))

  // Cargar opciones para los selects
  const [procesos, prendas, ubicaciones] = await Promise.all([
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
  ])

  // Query principal con filtros dinámicos — solo talleres verificados
  const where = {
    verificadoAfip: true as const,
    ...(query
      ? {
          OR: [
            { nombre: { contains: query, mode: 'insensitive' as const } },
            { ubicacion: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(procesoId ? { procesos: { some: { procesoId } } } : {}),
    ...(prendaId ? { prendas: { some: { prendaId } } } : {}),
    ...(provincia ? { provincia } : {}),
    ...(partido ? { partido } : {}),
  }

  // Vidriera mínima (Etapa 2.3-A) + R-DIR (§4.4): la visibilidad vive en JSONB (no
  // queryable en SQL); traemos los candidatos por verificadoAfip + filtros y filtramos
  // en app por la vidriera mínima (descripción ≥50, ubicación, ≥1 rubro visible vía
  // R-DIR; foto opcional en el piloto). Paginación en app.
  const candidatos = await prisma.taller.findMany({
    where,
    include: {
      procesos: { include: { proceso: true } },
      prendas: { include: { prenda: true } },
      validaciones: {
        where: { estado: 'COMPLETADO' },
        select: { tipoDocumento: { select: { nombre: true } } },
      },
    },
    orderBy: [{ verificadoAfip: 'desc' }, { puntaje: 'desc' }],
  })

  const elegibles = candidatos.filter(tallerCumpleVidrieraMinima)
  const total = elegibles.length
  const talleres = elegibles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasFilters = query || procesoId || prendaId || provincia || partido

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-3xl text-ink-primary">
          Explorar talleres
        </h1>
        <p className="text-gray-600 mt-2">
          Registro de unidades productivas acreditadas
        </p>
      </div>

      <DirectorioFiltros
        basePath="/marca/directorio"
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

      <p className="text-sm text-gray-500">
        Mostrando {talleres.length} de {total} {total === 1 ? 'taller' : 'talleres'}
        {totalPages > 1 && ` — pagina ${page} de ${totalPages}`}
      </p>

      {talleres.length === 0 ? (
        <Card>
          <EmptyState
            titulo={hasFilters ? 'No encontramos talleres con esos filtros' : 'No hay talleres registrados aun'}
            mensaje={hasFilters ? 'Proba cambiando los filtros de busqueda.' : 'Cuando se registren talleres verificados, van a aparecer aca.'}
            accion={hasFilters ? { texto: 'Limpiar filtros', href: '/marca/directorio' } : undefined}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {talleres.map((taller) => (
            <Card key={taller.id} className="flex flex-col justify-between p-0 overflow-hidden">
              <div>
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
                  <h3 className="font-overpass font-bold text-xl text-brand-blue">
                    {taller.nombre}
                  </h3>
                  {taller.verificadoAfip && <BadgeArca verificado={true} />}
                </div>

                {taller.ubicacion && (
                  <p className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                    <MapPin className="w-4 h-4" /> {taller.ubicacion}
                  </p>
                )}

                <p className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <Star className="w-4 h-4 text-yellow-500" /> {taller.rating.toFixed(1)}
                  <span className="text-gray-400 ml-1">({taller.pedidosCompletados} pedidos)</span>
                </p>

                {taller.procesos.length > 0 && bloqueVisiblePublico(taller, 'procesos') && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Procesos:</span>{' '}
                    {taller.procesos.map((tp) => tp.proceso.nombre).join(', ')}
                  </p>
                )}

                {taller.prendas.length > 0 && bloqueVisiblePublico(taller, 'prendas') && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Prendas:</span>{' '}
                    {taller.prendas.map((tp) => tp.prenda.nombre).join(', ')}
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  <span className="font-medium">Capacidad:</span>{' '}
                  {taller.capacidadMensual.toLocaleString()} prendas/mes
                </p>
              </div>

              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 px-4 pb-4">
                <Link
                  href={`/marca/directorio/${taller.id}`}
                  className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold transition-colors bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 text-sm"
                >
                  Ver perfil
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 justify-center rounded-lg font-overpass font-semibold transition-colors bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" /> Contactar
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-2">
          {page > 1 && (
            <Link
              href={`/marca/directorio?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(procesoId ? { proceso: procesoId } : {}), ...(prendaId ? { prenda: prendaId } : {}), ...(provincia ? { provincia } : {}), ...(partido ? { partido } : {}), page: String(page - 1) }).toString()}`}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Anterior
            </Link>
          )}
          <span className="text-sm text-gray-500">Pagina {page} de {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`/marca/directorio?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(procesoId ? { proceso: procesoId } : {}), ...(prendaId ? { prenda: prendaId } : {}), ...(provincia ? { provincia } : {}), ...(partido ? { partido } : {}), page: String(page + 1) }).toString()}`}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
