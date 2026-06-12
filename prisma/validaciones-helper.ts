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

// ── Exclusión de talleres del backfill (condición de Sergio: cuenta de smoke intocable)

// Parsea el flag --exclude del argv. Acepta forma repetible y CSV, con o sin '=':
//   --exclude a@x.com --exclude b@y.com
//   --exclude a@x.com,b@y.com
//   --exclude=a@x.com,b@y.com
// Normaliza a lowercase, trimea, descarta vacíos y deduplica.
export function parseExcludeEmails(argv: string[]): string[] {
  const out: string[] = []
  const push = (csv: string) => {
    for (const part of csv.split(',')) {
      const email = part.trim().toLowerCase()
      if (email) out.push(email)
    }
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--exclude') {
      const val = argv[i + 1]
      if (val && !val.startsWith('--')) {
        push(val)
        i++ // consumir el valor
      }
    } else if (arg.startsWith('--exclude=')) {
      push(arg.slice('--exclude='.length))
    }
  }
  return [...new Set(out)]
}

export type TallerConEmail = { id: string; nombre: string; userEmail: string | null }

// Particiona los talleres en incluidos (entran al backfill) y excluidos (cuenta de
// smoke u otros), comparando el email del user dueño contra la lista de --exclude.
// Comparación case-insensitive. Reporta también qué emails de la lista no matchearon
// ningún taller (para detectar typos antes del --apply).
export function particionarExcluidos(
  talleres: TallerConEmail[],
  excludeEmails: string[],
): { incluidos: TallerConEmail[]; excluidos: TallerConEmail[]; sinMatch: string[] } {
  const set = new Set(excludeEmails.map((e) => e.toLowerCase()))
  const incluidos: TallerConEmail[] = []
  const excluidos: TallerConEmail[] = []
  const matcheados = new Set<string>()
  for (const t of talleres) {
    const email = t.userEmail?.toLowerCase() ?? null
    if (email && set.has(email)) {
      excluidos.push(t)
      matcheados.add(email)
    } else {
      incluidos.push(t)
    }
  }
  const sinMatch = [...set].filter((e) => !matcheados.has(e))
  return { incluidos, excluidos, sinMatch }
}
