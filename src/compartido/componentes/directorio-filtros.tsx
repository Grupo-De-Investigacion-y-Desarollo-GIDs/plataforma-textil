'use client'

import { useState } from 'react'

// Etapa 2.4 — filtros del directorio: Rubro / Servicios / Ubicación.
// - Rubro = tipo de prenda principal (relación `prendas`, param `prenda`)
// - Servicios = procesos productivos (relación `procesos`, param `proceso`)
// - Ubicación = cascada provincia → partido (params `provincia` / `partido`)
// La regla "solo CUIT verificado por ARCA" no es un filtro: es texto fijo.
// Las opciones de ubicación se derivan de los talleres reales (no hay dataset
// canónico de provincias/partidos en el proyecto), así que la cascada solo
// ofrece lo que efectivamente existe en el directorio.

type Opcion = { id: string; nombre: string }

export function DirectorioFiltros({
  basePath,
  q,
  procesoId,
  prendaId,
  provincia,
  partido,
  procesos,
  prendas,
  provincias,
  partidosPorProvincia,
}: {
  basePath: string
  q: string
  procesoId: string
  prendaId: string
  provincia: string
  partido: string
  procesos: Opcion[]
  prendas: Opcion[]
  provincias: string[]
  partidosPorProvincia: Record<string, string[]>
}) {
  // La provincia seleccionada gobierna qué partidos se ofrecen (cascada).
  const [provinciaSel, setProvinciaSel] = useState(provincia)
  const partidosDisponibles = provinciaSel ? partidosPorProvincia[provinciaSel] ?? [] : []
  const hasFilters = Boolean(q || procesoId || prendaId || provincia || partido)

  const selectClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30'
  const labelClass = 'block text-sm font-medium text-brand-blue mb-1.5'

  return (
    <form method="get" action={basePath} className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
      <h2 className="font-overpass font-bold text-brand-blue mb-3">Filtrar talleres</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor="q" className={labelClass}>
            Buscar por nombre
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Nombre del taller..."
            aria-label="Buscar por nombre"
            className={selectClass}
          />
        </div>

        <div>
          <label htmlFor="prenda" className={labelClass}>
            Rubro
          </label>
          <select id="prenda" name="prenda" defaultValue={prendaId} aria-label="Filtrar por rubro" className={selectClass}>
            <option value="">Todos los rubros</option>
            {prendas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="proceso" className={labelClass}>
            Servicios
          </label>
          <select id="proceso" name="proceso" defaultValue={procesoId} aria-label="Filtrar por servicios" className={selectClass}>
            <option value="">Todos los servicios</option>
            {procesos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="provincia" className={labelClass}>
            Ubicación — provincia
          </label>
          <select
            id="provincia"
            name="provincia"
            value={provinciaSel}
            onChange={(e) => setProvinciaSel(e.target.value)}
            aria-label="Filtrar por provincia"
            className={selectClass}
          >
            <option value="">Todas las provincias</option>
            {provincias.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="partido" className={labelClass}>
            Ubicación — partido
          </label>
          <select
            id="partido"
            name="partido"
            // Si cambia la provincia, el partido previo deja de tener sentido:
            // forzamos un re-mount con la key para resetear la selección.
            key={provinciaSel}
            defaultValue={provinciaSel === provincia ? partido : ''}
            disabled={!provinciaSel}
            aria-label="Filtrar por partido"
            className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400`}
          >
            <option value="">{provinciaSel ? 'Todos los partidos' : 'Elegí una provincia'}</option>
            {partidosDisponibles.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">Mostramos solo talleres con CUIT verificado por ARCA.</p>

      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90"
        >
          Aplicar filtros
        </button>
        {hasFilters && (
          <a
            href={basePath}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            Limpiar filtros
          </a>
        )}
      </div>
    </form>
  )
}
