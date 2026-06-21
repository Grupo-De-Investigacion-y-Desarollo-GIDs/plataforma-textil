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

/** Bloques de la vidriera que el taller puede mostrar/ocultar a las marcas. */
export type BloqueVidriera =
  | 'formacion'
  | 'equipo'
  | 'espacio'
  | 'capacidad'
  | 'organizacion'
  | 'maquinaria'

/** Lista canonica de bloques toggleables (Credenciales no esta: es fijo). */
export const BLOQUES_VIDRIERA: readonly BloqueVidriera[] = [
  'formacion',
  'equipo',
  'espacio',
  'capacidad',
  'organizacion',
  'maquinaria',
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
 * Invariante SAM: el SAM (minutos estandar) solo es visible en contexto privado
 * ("Mi gestion productiva"). NUNCA en la vidriera publica, aunque el bloque
 * `capacidad` este visible. Protege la cotizacion del taller (§4.5).
 */
export function samVisible(contexto: 'publico' | 'privado'): boolean {
  return contexto === 'privado'
}
