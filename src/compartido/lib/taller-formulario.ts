// Fuente única de la definición valor↔label de los campos del formulario del taller
// (W-A). Evita que el perfil del taller (donde se muestran) y el dashboard sectorial de
// ESTADO (donde se agregan) dupliquen y diverjan los labels respecto del wizard (donde
// se cargan).
//
// Por qué existe: el refactor W-A cambió/agregó valores en varios campos, pero el perfil
// y el dashboard seguían mapeando los viejos → datos mostrados mal:
//   - escalabilidad: el form guarda 'turnos'/'maquinaria' pero ambos mostraban
//     "Sin capacidad de escalar" / "Desconocido".
//   - organizacion: el form agregó 'mixta' pero el perfil lo mostraba como
//     "Prenda completa" (el `else` del ternario) y el dashboard como "Desconocido".
//   - registroProduccion: el form usa 'no'/'sin-sistematico' pero el perfil los
//     colapsaba en "Sin registro" y el dashboard tenía una clave muerta 'ninguno'.
//
// El copy es el del master (2.15–2.18) = el copy exacto de los RadioOption del wizard
// (src/app/(taller)/taller/perfil/completar/page.tsx). Si el wizard cambia un valor o
// label, se actualiza ACÁ y los tres lugares quedan consistentes.
//
// Nota: `disponibilidad` (W-A4 pregunta 1: sin-cambios/con-limites/baja/no-puede) NO se
// muestra ni agrega en ningún reporte hoy, así que no tiene labels duplicados ni bug.
// Cuando W-B la exponga, agregar su mapa acá.

// W-A2 (issue #299) — "¿Cómo organizan el trabajo?" (campo `organizacion`)
export const ORGANIZACION_LABELS: Record<string, string> = {
  linea: 'En línea',
  modular: 'Modular',
  completa: 'Prenda completa',
  mixta: 'Organización mixta',
}

// W-A3 (issue #300) — "¿Llevan registro de producción diaria?" (campo `registroProduccion`)
export const REGISTRO_LABELS: Record<string, string> = {
  no: 'No llevan registro',
  'sin-sistematico': 'Sin registro sistemático',
  papel: 'Papel/cuaderno',
  excel: 'Excel/planilla',
  software: 'Sistema/software',
}

// W-A4 (issue #303) — "¿Cómo podría aumentar su capacidad productiva?" (campo `escalabilidad`)
export const ESCALABILIDAD_LABELS: Record<string, string> = {
  turnos: 'Ampliando turnos u horas de trabajo',
  contratar: 'Contratando personal',
  tercerizar: 'Tercerizando parte de la producción',
  maquinaria: 'Invirtiendo en maquinaria/equipamiento',
}

function label(map: Record<string, string>, valor: string | null | undefined, fallback: string): string {
  if (!valor) return fallback
  return map[valor] ?? fallback
}

export const labelOrganizacion = (v: string | null | undefined, fallback = 'Desconocido') => label(ORGANIZACION_LABELS, v, fallback)
export const labelRegistro = (v: string | null | undefined, fallback = 'Desconocido') => label(REGISTRO_LABELS, v, fallback)
export const labelEscalabilidad = (v: string | null | undefined, fallback = 'Desconocido') => label(ESCALABILIDAD_LABELS, v, fallback)

// Etapa 2.2-C1 (2a vuelta) — tipo de inscripcion tributaria para la vidriera.
// SOLO el tipo, NUNCA la categoria de monotributo (Cat. F/G expone franja de
// facturacion — minimizacion). Mapea el enum TipoInscripcionAfip a label legible.
export const TIPO_INSCRIPCION_LABELS: Record<string, string> = {
  RESPONSABLE_INSCRIPTO: 'Responsable Inscripto',
  MONOTRIBUTO: 'Monotributista',
  EXENTO: 'Exento',
  NO_INSCRIPTO: 'No inscripto',
}

export const labelTipoInscripcion = (v: string | null | undefined): string | null =>
  v ? (TIPO_INSCRIPCION_LABELS[v] ?? null) : null

// Etapa 2.2-C1 (§4.3/§4.5) — capacidad PUBLICA = rango bucketizado, NUNCA el SAM ni
// el numero exacto. El bloque `capacidad` muestra esto en la vidriera publica; el SAM
// (Taller.sam) queda forzado-privado (samVisible('publico')===false).
export function rangoCapacidad(unidadesMes: number | null | undefined): string | null {
  const n = unidadesMes ?? 0
  if (n <= 0) return null
  if (n <= 500) return 'Hasta 500 u/mes'
  if (n <= 2000) return '500 a 2.000 u/mes'
  if (n <= 5000) return '2.000 a 5.000 u/mes'
  if (n <= 10000) return '5.000 a 10.000 u/mes'
  return 'Más de 10.000 u/mes'
}
