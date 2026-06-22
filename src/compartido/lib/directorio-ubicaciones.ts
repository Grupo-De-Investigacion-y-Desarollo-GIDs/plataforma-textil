import { prisma } from '@/compartido/lib/prisma'

// Etapa 2.4 — fuente de la cascada de ubicación del directorio.
// El proyecto NO tiene un dataset canónico de provincias/partidos de Argentina.
// En vez de inventar uno, derivamos las opciones de los talleres reales y
// verificados: la cascada solo ofrece provincias/partidos que efectivamente
// existen en el directorio (coherente con lo que el usuario puede encontrar).

export type UbicacionesDirectorio = {
  provincias: string[]
  partidosPorProvincia: Record<string, string[]>
}

export async function derivarUbicaciones(): Promise<UbicacionesDirectorio> {
  const filas = await prisma.taller.findMany({
    where: { verificadoAfip: true, provincia: { not: null } },
    select: { provincia: true, partido: true },
    distinct: ['provincia', 'partido'],
    orderBy: [{ provincia: 'asc' }, { partido: 'asc' }],
  })

  const partidosPorProvincia: Record<string, string[]> = {}
  for (const { provincia, partido } of filas) {
    if (!provincia) continue
    if (!partidosPorProvincia[provincia]) partidosPorProvincia[provincia] = []
    if (partido && !partidosPorProvincia[provincia].includes(partido)) {
      partidosPorProvincia[provincia].push(partido)
    }
  }

  const provincias = Object.keys(partidosPorProvincia).sort((a, b) => a.localeCompare(b, 'es'))

  return { provincias, partidosPorProvincia }
}
