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
  | 'inscripcion'

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
  // Etapa 2.2-C1 2a vuelta: tipo de inscripcion tributaria (S2 "Datos generales").
  // SOLO el tipo (Monotributista / Responsable Inscripto), NUNCA la categoria
  // (Cat. F/G expone franja de facturacion — minimizacion). Net-new al render.
  'inscripcion',
] as const

/**
 * Forma persistida en `Taller.visibilidadVidriera`.
 * - Keys de bloque (todas opcionales): solo `false` oculta; ausente = visible (#437).
 * - `formacionBadges`: override granular por badge de Academia (Etapa 2.2-C1, §6.2).
 *   Key = `Certificado.id`. Solo `false` oculta; ausente = visible. Se ignora si el
 *   master `formacion` esta oculto.
 */
export type VisibilidadVidriera = Partial<Record<BloqueVidriera, boolean>> & {
  formacionBadges?: Record<string, boolean>
}

/**
 * Input de la server action `actualizarVisibilidadVidriera` (Etapa 2.2-C1). Vive aca
 * (no en el archivo 'use server') porque un modulo 'use server' solo puede exportar
 * funciones async; el panel cliente y la action comparten este tipo desde la lib.
 */
export interface VisibilidadInput {
  /** Estado on/off por bloque toggle-libre, tal como lo dejo el panel. */
  bloques: Partial<Record<BloqueVidriera, boolean>>
  /** Override por badge de Academia. Key = Certificado.id. Solo `false` oculta. */
  formacionBadges?: Record<string, boolean>
}

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
 * Bloques que NUNCA fueron públicos antes de 2.2-C1 (net-new al render): equipo,
 * espacio, capacidad, organización, año de fundación. Para estos, "default oculto"
 * se interpreta como SOLO-OPT-IN: solo se muestran con `true` explícito, sin importar
 * `modeloB_revisado`. Asi un taller EXISTENTE (flag=true, visibilidad null) NO los
 * expone al deployar — su vidriera sigue IDÉNTICA a 2.2-B hasta que los active en el
 * panel. Los demas bloques (procesos/prendas/maquinaria/portfolio/formacion) ya eran
 * públicos en 2.2-B y siguen flag-aware (#437 behavior-preserving).
 */
const BLOQUES_SOLO_OPT_IN: ReadonlySet<BloqueVidriera> = new Set([
  'equipo',
  'espacio',
  'capacidad',
  'organizacion',
  'anioFundacion',
  'inscripcion',
])

function bloqueActivadoExplicito(
  taller: { visibilidadVidriera?: unknown },
  bloque: BloqueVidriera,
): boolean {
  const obj =
    taller?.visibilidadVidriera &&
    typeof taller.visibilidadVidriera === 'object' &&
    !Array.isArray(taller.visibilidadVidriera)
      ? (taller.visibilidadVidriera as Record<string, unknown>)
      : {}
  return obj[bloque] === true
}

/**
 * Resolver de render de la vidriera (Etapa 2.2-C1). Es el helper que deben usar TODAS
 * las superficies que pintan bloques (vidriera pública y "Mi vidriera"):
 *
 * - Bloques net-new (BLOQUES_SOLO_OPT_IN): SOLO-OPT-IN → `true` explícito, ignorando
 *   el flag. Garantiza que los existentes no expongan datos nuevos hasta activarlos.
 * - Resto: `bloqueVisiblePublico` (flag-aware, behavior-preserving para existentes).
 *
 * Nota: la elegibilidad de directorio (`tallerElegibleDirectorio`) y el master de
 * Academia (`badgeFormacionVisible`) operan sobre procesos/prendas/formacion, que son
 * bloques pre-existentes → usan `bloqueVisiblePublico` directo (no pasan por aca).
 */
export function bloqueVisibleVidriera(
  taller: { visibilidadVidriera?: unknown; modeloB_revisado?: boolean },
  bloque: BloqueVidriera,
): boolean {
  if (BLOQUES_SOLO_OPT_IN.has(bloque)) {
    return bloqueActivadoExplicito(taller, bloque)
  }
  return bloqueVisiblePublico(taller, bloque)
}

/**
 * ¿Se muestra este badge individual de Academia (Etapa 2.2-C1, §6.2)?
 *
 * - Si el master `formacion` esta oculto (segun el flag), NINGUN badge se muestra.
 * - Si el master esta visible, cada badge se muestra salvo override `false` explicito
 *   en `formacionBadges[certificadoId]` (ausente = visible). Aditivo: no toca
 *   `bloqueVisible`/`normalizarVisibilidad` ni los tests #437.
 */
export function badgeFormacionVisible(
  taller: { visibilidadVidriera?: unknown; modeloB_revisado?: boolean },
  certificadoId: string,
): boolean {
  if (!bloqueVisiblePublico(taller, 'formacion')) return false
  const obj =
    taller?.visibilidadVidriera &&
    typeof taller.visibilidadVidriera === 'object' &&
    !Array.isArray(taller.visibilidadVidriera)
      ? (taller.visibilidadVidriera as Record<string, unknown>)
      : {}
  const map =
    obj.formacionBadges &&
    typeof obj.formacionBadges === 'object' &&
    !Array.isArray(obj.formacionBadges)
      ? (obj.formacionBadges as Record<string, unknown>)
      : {}
  return map[certificadoId] !== false
}

/**
 * Elegibilidad de un taller para aparecer en el directorio (Etapa 2.2-C1, §4.4 / R-DIR).
 *
 * ⚠️ CAMBIO DE SUPUESTO vs #437: la visibilidad ahora SI condiciona la inclusion en
 * el listado (no solo el render del perfil). Para aparecer, ademas de FORZADO-VISIBLE
 * (verificadoAfip, etc., que filtra el query) se exige >=1 `proceso` o `prenda`/rubro
 * con su toggle ACTIVO. La visibilidad vive en JSONB (no queryable eficiente en SQL):
 * por eso es un filtro post-query en app.
 *
 * Behavior-preserving: los talleres EXISTENTES (modeloB_revisado=true, visibilidad
 * null) tienen procesos/prendas en null=visible → siguen siendo elegibles. Un taller
 * NUEVO sin ningun toggle activo (privacy-by-default) NO aparece.
 */
export function tallerElegibleDirectorio(taller: {
  visibilidadVidriera?: unknown
  modeloB_revisado?: boolean
  procesos?: unknown[]
  prendas?: unknown[]
}): boolean {
  const procesoVisible =
    (taller.procesos?.length ?? 0) > 0 && bloqueVisiblePublico(taller, 'procesos')
  const prendaVisible =
    (taller.prendas?.length ?? 0) > 0 && bloqueVisiblePublico(taller, 'prendas')
  return procesoVisible || prendaVisible
}

/**
 * Invariante SAM: el SAM (minutos estandar) solo es visible en contexto privado
 * ("Mi gestion productiva"). NUNCA en la vidriera publica, aunque el bloque
 * `capacidad` este visible. Protege la cotizacion del taller (§4.5).
 */
export function samVisible(contexto: 'publico' | 'privado'): boolean {
  return contexto === 'privado'
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDRIERA MÍNIMA (Etapa 2.3-A) — requisitos para aparecer en el directorio.
//
// Además de `verificadoAfip` (gate SQL del query) Sergio definió 4 requisitos:
//   1. Descripción ≥ DESCRIPCION_MIN_CHARS caracteres
//   2. Ubicación declarada manualmente (provincia + partido)
//   3. ≥1 rubro/proceso visible  → YA lo cubre R-DIR (`tallerElegibleDirectorio`),
//      incluso más estricto (exige el toggle visible). Se REUSA tal cual, no se
//      reimplementa: esta capa lo EXTIENDE con 1, 2 y 4.
//   4. Foto del taller — OPCIONAL en el piloto (`FOTO_OBLIGATORIA = false`): no
//      excluye del directorio; la card usa un placeholder institucional. Flipear la
//      constante a `true` post-piloto la vuelve requisito excluyente, sin más cambios.
//
// Se evalúa EN RENDER (filtro post-query del directorio), igual que R-DIR: la
// visibilidad vive en JSONB no-queryable y no hay campo calculado → sin migración,
// sin staleness.
// ─────────────────────────────────────────────────────────────────────────────

/** Longitud mínima de la descripción para la vidriera mínima (req 1). */
export const DESCRIPCION_MIN_CHARS = 50

/**
 * Foto del taller como requisito de vidriera mínima (req 4). PILOTO: `false`
 * (opcional, con placeholder institucional en la card). Post-piloto: poner en `true`
 * para exigirla — es el único cambio necesario para volverla excluyente.
 */
export const FOTO_OBLIGATORIA = false

/** Requisitos de la vidriera mínima que pueden faltar (para feedback al taller). */
export type RequisitoVidriera = 'descripcion' | 'ubicacion' | 'rubro' | 'foto'

export interface ResultadoVidrieraMinima {
  completa: boolean
  /** Requisitos NO cumplidos, en orden. Vacío ⇒ `completa === true`. */
  faltan: RequisitoVidriera[]
}

type TallerVidrieraMinima = {
  descripcion?: string | null
  provincia?: string | null
  partido?: string | null
  portfolioFotos?: unknown[]
  // Lo que necesita R-DIR (`tallerElegibleDirectorio`) para el req 3:
  visibilidadVidriera?: unknown
  modeloB_revisado?: boolean
  procesos?: unknown[]
  prendas?: unknown[]
}

/** Req 1: descripción con al menos `DESCRIPCION_MIN_CHARS` caracteres (sin espacios al borde). */
export function descripcionVidrieraOk(taller: { descripcion?: string | null }): boolean {
  return (taller.descripcion?.trim().length ?? 0) >= DESCRIPCION_MIN_CHARS
}

/**
 * Req 2: ubicación DECLARADA manualmente = `provincia` + `partido` (campos
 * estructurados del formulario de registro/edición). El `ubicacion` libre es legacy
 * y no cuenta como declaración formal para el gate.
 */
export function ubicacionVidrieraOk(taller: { provincia?: string | null; partido?: string | null }): boolean {
  return Boolean(taller.provincia?.trim() && taller.partido?.trim())
}

/** Req 4: el taller tiene al menos una foto cargada (portfolio). */
export function fotoVidrieraOk(taller: { portfolioFotos?: unknown[] }): boolean {
  return (taller.portfolioFotos?.length ?? 0) > 0
}

/**
 * Evalúa la vidriera mínima (Etapa 2.3-A). Devuelve qué requisitos faltan para que el
 * taller pueda mostrarle al usuario "te falta X para aparecer en el directorio".
 * El req 3 delega en `tallerElegibleDirectorio` (R-DIR intacto). La foto solo cuenta
 * si `FOTO_OBLIGATORIA` está activo.
 */
export function evaluarVidrieraMinima(taller: TallerVidrieraMinima): ResultadoVidrieraMinima {
  const faltan: RequisitoVidriera[] = []
  if (!descripcionVidrieraOk(taller)) faltan.push('descripcion')
  if (!ubicacionVidrieraOk(taller)) faltan.push('ubicacion')
  if (!tallerElegibleDirectorio(taller)) faltan.push('rubro')
  if (FOTO_OBLIGATORIA && !fotoVidrieraOk(taller)) faltan.push('foto')
  return { completa: faltan.length === 0, faltan }
}

/**
 * Gate completo de vidriera mínima para el `.filter` del directorio (público + marca).
 * Reemplaza la llamada suelta a `tallerElegibleDirectorio` (que queda subsumida como
 * el req 3). `verificadoAfip` se sigue exigiendo aguas arriba en el `where` SQL.
 */
export function tallerCumpleVidrieraMinima(taller: TallerVidrieraMinima): boolean {
  return evaluarVidrieraMinima(taller).completa
}
