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

const esSeccionNumerada = (linea: string) => /^##\s+\d+\./.test(linea)

/**
 * Publica SOLO el cuerpo del documento legal: el título (H1), la "última
 * actualización" y las secciones numeradas (`## 1.`, `## 2.`, …). Recorta, por
 * ESTRUCTURA (no por línea fija), el preámbulo (blockquote "Nota de estado", listas
 * de intro) y los apéndices internos (`## Definiciones institucionales pendientes`,
 * `## Notas para la revisión`, y cualquier `##` no numerado que venga después).
 *
 * Robusto ante cambios del .md: si legal agrega una sección numerada nueva, entra
 * sola; si agrega un apéndice no numerado, queda fuera sin tocar el render.
 */
export function soloCuerpoLegal(md: string): string {
  const lineas = md.split('\n')
  const h1 = lineas.find(l => /^#\s+/.test(l))?.trim() ?? ''
  const inicio = lineas.findIndex(esSeccionNumerada)
  if (inicio === -1) return h1
  // Fin: primer `##` posterior que NO es sección numerada (apéndice/notas internas).
  let fin = lineas.length
  for (let i = inicio; i < lineas.length; i++) {
    if (/^##\s+/.test(lineas[i]) && !esSeccionNumerada(lineas[i])) { fin = i; break }
  }
  const cuerpo = lineas.slice(inicio, fin).join('\n').trim()
  return `${h1}\n\n_Última actualización: ${LEGAL_VERSION}_\n\n${cuerpo}`
}
