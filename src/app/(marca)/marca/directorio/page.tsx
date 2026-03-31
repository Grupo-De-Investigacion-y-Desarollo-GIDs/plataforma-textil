export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MapPin, Star, MessageCircle } from 'lucide-react'

const nivelVariant: Record<string, 'warning' | 'default' | 'success'> = {
  BRONCE: 'warning',
  PLATA: 'default',
  ORO: 'success',
}

const allowedNiveles = ['BRONCE', 'PLATA', 'ORO'] as const

type SearchParams = {
  q?: string
  nivel?: string
  proceso?: string
  prenda?: string
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
  const nivelRaw = (resolvedSearchParams.nivel || '').trim().toUpperCase()
  const nivel = allowedNiveles.includes(nivelRaw as (typeof allowedNiveles)[number])
    ? (nivelRaw as (typeof allowedNiveles)[number])
    : ''
  const procesoId = (resolvedSearchParams.proceso || '').trim()
  const prendaId = (resolvedSearchParams.prenda || '').trim()

  // Cargar opciones para los selects
  const [procesos, prendas] = await Promise.all([
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
  ])

  // Query principal con filtros dinámicos
  const talleres = await prisma.taller.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { nombre: { contains: query, mode: 'insensitive' } },
              { ubicacion: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(nivel ? { nivel } : {}),
      ...(procesoId ? { procesos: { some: { procesoId } } } : {}),
      ...(prendaId ? { prendas: { some: { prendaId } } } : {}),
    },
    include: {
      procesos: { include: { proceso: true } },
      prendas: { include: { prenda: true } },
    },
    orderBy: { puntaje: 'desc' },
  })

  const hasFilters = query || nivel || procesoId || prendaId

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">
          Explorar Talleres
        </h1>
        <p className="text-gray-600 mt-2">
          Registro oficial de unidades productivas acreditadas
        </p>
      </div>

      <Card>
        <form method="get" className="space-y-3">
          <div>
            <label htmlFor="q" className="block text-sm font-medium text-brand-blue mb-1.5">
              Buscar por nombre o ubicacion
            </label>
            <input
              id="q"
              name="q"
              defaultValue={query}
              placeholder="Ej: Corte Sur, Avellaneda..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="nivel" className="block text-sm font-medium text-brand-blue mb-1.5">
                Nivel
              </label>
              <select
                id="nivel"
                name="nivel"
                defaultValue={nivel}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="ORO">Oro</option>
                <option value="PLATA">Plata</option>
                <option value="BRONCE">Bronce</option>
              </select>
            </div>
            <div>
              <label htmlFor="proceso" className="block text-sm font-medium text-brand-blue mb-1.5">
                Proceso
              </label>
              <select
                id="proceso"
                name="proceso"
                defaultValue={procesoId}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              >
                <option value="">Todos</option>
                {procesos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="prenda" className="block text-sm font-medium text-brand-blue mb-1.5">
                Tipo de prenda
              </label>
              <select
                id="prenda"
                name="prenda"
                defaultValue={prendaId}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              >
                <option value="">Todos</option>
                {prendas.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold transition-colors bg-brand-blue hover:bg-blue-800 text-white px-4 py-2.5 text-sm"
            >
              Filtrar
            </button>
            {hasFilters && (
              <Link
                href="/marca/directorio"
                className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold transition-colors bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 text-sm"
              >
                Limpiar filtros
              </Link>
            )}
          </div>
        </form>
      </Card>

      <p className="text-sm text-gray-500">
        Mostrando {talleres.length} {talleres.length === 1 ? 'taller' : 'talleres'}
      </p>

      {talleres.length === 0 ? (
        <Card>
          <div className="py-8 text-center">
            <p className="text-gray-600">
              {hasFilters
                ? 'No hay talleres para esos filtros.'
                : 'No hay talleres registrados aun.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {talleres.map((taller) => (
            <Card key={taller.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-overpass font-bold text-xl text-brand-blue">
                    {taller.nombre}
                  </h3>
                  <Badge variant={nivelVariant[taller.nivel] || 'default'} className="text-xs px-2 py-1">
                    {taller.nivel}
                  </Badge>
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

                {taller.procesos.length > 0 && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Procesos:</span>{' '}
                    {taller.procesos.map((tp) => tp.proceso.nombre).join(', ')}
                  </p>
                )}

                {taller.prendas.length > 0 && (
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

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link
                  href={`/marca/directorio/${taller.id}`}
                  className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold transition-colors bg-brand-blue hover:bg-blue-800 text-white px-4 py-2 text-sm"
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
    </div>
  )
}
