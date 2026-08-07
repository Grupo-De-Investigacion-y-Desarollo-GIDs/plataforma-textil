import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Version legal vigente. Fuente unica: la muestran /terminos y /privacidad y la
 * guardan los Consentimiento al aceptar (coherencia: lo que se acepta = lo que se
 * muestra). Bumpear a mano cuando cambien los textos de docs/legal/*.md.
 */
export const LEGAL_VERSION = '2026-08'

export const TIPOS_CONSENT = ['TERMINOS', 'PRIVACIDAD', 'VISIBILIDAD'] as const

type DocLegal = 'TERMINOS_Y_CONDICIONES' | 'POLITICA_DE_PRIVACIDAD'

/**
 * Lee la version PUBLICABLE de un documento legal: docs/legal/web/<nombre>_WEB.md.
 *
 * Son las versiones que preparo Sergio ya depuradas para la web — sin el aparato
 * interno (nota de estado, notas de revision), sin los marcadores de definiciones
 * pendientes, con la §11 sin enumerar controles de seguridad y la §10 sin los nombres
 * tecnicos de las cookies. Se publican TAL CUAL (byte a byte; ver docs/legal/web/LEEME.md).
 * El .md hermano en docs/legal/<nombre>.md es la version de ENTREGA a OIT y NO se publica.
 *
 * Server-only. Requiere que el archivo este disponible en runtime: ver
 * `outputFileTracingIncludes` en next.config.ts (glob `./docs/legal/**` cubre `web/`).
 */
export async function leerDocLegal(nombre: DocLegal): Promise<string> {
  const ruta = path.join(process.cwd(), 'docs', 'legal', 'web', `${nombre}_WEB.md`)
  return readFile(ruta, 'utf-8')
}
