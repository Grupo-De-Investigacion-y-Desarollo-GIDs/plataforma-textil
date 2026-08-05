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
 * Lee un documento legal de docs/legal/*.md (fuente en el repo). Server-only.
 * Requiere que el archivo este disponible en runtime: ver `outputFileTracingIncludes`
 * en next.config.ts para que Vercel lo empaquete en la funcion serverless.
 */
export async function leerDocLegal(nombre: DocLegal): Promise<string> {
  const ruta = path.join(process.cwd(), 'docs', 'legal', `${nombre}.md`)
  return readFile(ruta, 'utf-8')
}
