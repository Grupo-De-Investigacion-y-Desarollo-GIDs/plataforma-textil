// Visibilidad por bloque de la vidriera del taller (Etapa 2.2 / Modelo B, §1.3).
//
// El taller puede ocultar bloques completos de su vidriera publica desde
// "Configuracion de visibilidad" (UI de un PR posterior). Este modulo es la base:
// el tipo, el normalizador y el helper de consulta que usa el render publico.
//
// Reglas (invariantes del Modelo B):
// - Default = TODO VISIBLE. `visibilidadVidriera` null/ausente, o una key faltante,
//   significa visible. Solo `false` explicito oculta un bloque. Esto hace que el
//   comportamiento actual (todos los talleres con el campo en null) sea identico.
// - Credenciales (etapa + ARCA) NUNCA se oculta: no es un bloque toggleable.
// - SAM NUNCA se expone en la vidriera publica, sin importar el toggle de `capacidad`.

/**
 * Bloques TOGGLE-LIBRE de la vidriera que el taller puede mostrar/ocultar a las
 * marcas. Set del PILOTO (Etapa 2.2-B, §6.1): 10 keys. La expansion respecto de
 * #437 (formacion/equipo/espacio/capacidad/organizacion/maquinaria) es aditiva:
 * solo TS + array; el JSONB ya soporta las nuevas keys, sin migracion.
 *
 * Fuera del set (a proposito): 'tiempos' (= SAM, forzado-privado, D3) y las
 * certificaciones externas (`TallerCertificacion`, fuera del piloto, D4).
 */
export type BloqueVidriera =
  | 'formacion'
  | 'equipo'
  | 'espacio'
  | 'capacidad'
  | 'organizacion'
  | 'maquinaria'
  | 'procesos'
  | 'prendas'
  | 'anioFundacion'
  | 'portfolio'

/** Lista canonica de bloques toggleables (Credenciales no esta: es fijo). */
export const BLOQUES_VIDRIERA: readonly BloqueVidriera[] = [
  'formacion',
  'equipo',
  'espacio',
  'capacidad',
  'organizacion',
  'maquinaria',
  'procesos',
  'prendas',
  'anioFundacion',
  'portfolio',
] as const

/** Forma persistida en `Taller.visibilidadVidriera` (todas las keys opcionales). */
export type VisibilidadVidriera = Partial<Record<BloqueVidriera, boolean>>

/**
 * Normaliza el JSON crudo del campo a forma canonica: devuelve TODOS los bloques
 * con un booleano explicito. Convencion: solo `false` oculta; cualquier otra cosa
 * (ausente, null, no-booleano, JSON invalido) = visible.
 */
export function normalizarVisibilidad(
  raw: unknown,
): Record<BloqueVidriera, boolean> {
  const obj =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}
  const out = {} as Record<BloqueVidriera, boolean>
  for (const bloque of BLOQUES_VIDRIERA) {
    // Solo el valor `false` explicito oculta; todo lo demas queda visible.
    out[bloque] = obj[bloque] !== false
  }
  return out
}

/**
 * ¿Se muestra este bloque en la vidriera publica?
 * Credenciales no se consulta aca (siempre visible). SAM es un invariante de
 * render aparte (ver `samVisible`), no un bloque.
 */
export function bloqueVisible(
  taller: { visibilidadVidriera?: unknown },
  bloque: BloqueVidriera,
): boolean {
  return normalizarVisibilidad(taller?.visibilidadVidriera)[bloque]
}

/**
 * ¿Se muestra este bloque TOGGLE-LIBRE en la vidriera publica, aplicando
 * privacy-by-default segun `modeloB_revisado` (Etapa 2.2-B, §5.2)?
 *
 * - `modeloB_revisado === true` (talleres EXISTENTES via backfill, o tras revisar
 *   la config): respeta el null=visible de #437 → mismo comportamiento que hoy.
 *   Es la garantia BEHAVIOR-PRESERVING: para los existentes nada cambia.
 * - `modeloB_revisado === false` (talleres NUEVOS): privacy-by-default → un bloque
 *   en null/ausente se trata como OCULTO; solo se muestra lo activado explicito.
 *
 * Forzado-VISIBLE (Credenciales: etapa + ARCA + ubicacion) no se consulta aca:
 * se renderiza siempre. Forzado-PRIVADO (CUIT, responsable, SAM, los 7) nunca se
 * expone, sin importar el flag (no son bloques de este set).
 */
export function bloqueVisiblePublico(
  taller: { visibilidadVidriera?: unknown; modeloB_revisado?: boolean },
  bloque: BloqueVidriera,
): boolean {
  const obj =
    taller?.visibilidadVidriera &&
    typeof taller.visibilidadVidriera === 'object' &&
    !Array.isArray(taller.visibilidadVidriera)
      ? (taller.visibilidadVidriera as Record<string, unknown>)
      : {}
  const raw = obj[bloque]
  if (taller?.modeloB_revisado) {
    // #437: null/true/ausente → visible; solo `false` explicito oculta.
    return raw !== false
  }
  // Privacy-by-default: SOLO el `true` explicito se muestra.
  return raw === true
}

/**
 * Invariante SAM: el SAM (minutos estandar) solo es visible en contexto privado
 * ("Mi gestion productiva"). NUNCA en la vidriera publica, aunque el bloque
 * `capacidad` este visible. Protege la cotizacion del taller (§4.5).
 */
export function samVisible(contexto: 'publico' | 'privado'): boolean {
  return contexto === 'privado'
}
