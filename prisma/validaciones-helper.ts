// Fuente única de la definición de "checklist de validaciones de un taller".
// Usado por el seed (prisma/seed.ts) y por el backfill (scripts/u05-backfill-validaciones.ts)
// para no duplicar qué validaciones le corresponden a un taller ni su estado inicial.
//
// Regla del proyecto (ver registro/route.ts): cada taller arranca con UNA Validacion
// NO_INICIADO por cada TipoDocumento.activo. La unicidad es por (tallerId, tipo).

export type TipoDocMin = { id: string; nombre: string }
export type ValidacionInicial = {
  tallerId: string
  tipo: string
  tipoDocumentoId: string
  estado: 'NO_INICIADO'
}

// Devuelve las validaciones NO_INICIADO que le FALTAN a un taller para completar su
// checklist, dado el conjunto de tipos activos y los nombres de tipo que ya existen.
// Dedupe por nombre de tipo (= @@unique([tallerId, tipo])). Idempotente: si no falta
// nada, devuelve []. Pasar un Set vacío genera el checklist completo (taller nuevo).
export function buildValidacionesFaltantes(
  tiposActivos: TipoDocMin[],
  tiposExistentes: Set<string>,
  tallerId: string,
): ValidacionInicial[] {
  return tiposActivos
    .filter((td) => !tiposExistentes.has(td.nombre))
    .map((td) => ({
      tallerId,
      tipo: td.nombre,
      tipoDocumentoId: td.id,
      estado: 'NO_INICIADO' as const,
    }))
}
