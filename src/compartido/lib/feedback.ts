/**
 * Funciones puras para armar issues de feedback en GitHub.
 * Extraidas de /api/feedback/route.ts para testabilidad.
 */

const LABEL_MAP: Record<string, string[]> = {
  bug: ['bug', 'piloto'],
  bloqueante: ['bug', 'critical', 'piloto'],
  mejora: ['enhancement', 'piloto'],
  falta: ['feature-request', 'piloto'],
  confusion: ['ux', 'piloto'],
}

interface ContextoQA {
  spec?: string
  eje?: string
  item?: string
  resultado?: string
  qaSlug?: string
  itemSelector?: string
  verificador?: string
  perfil?: string
}

/**
 * Arma las labels del issue de GitHub.
 * Incluye qaSlug y perfil cuando están presentes.
 */
export function buildIssueLabels(tipo: string, contextoQA?: ContextoQA | null): string[] {
  const labels = [...(LABEL_MAP[tipo] ?? ['piloto'])]
  if (contextoQA?.qaSlug) {
    labels.push(contextoQA.qaSlug)
  }
  if (contextoQA?.perfil && contextoQA.perfil !== 'tecnico') {
    labels.push(`perfil-${contextoQA.perfil}`)
  }
  return labels
}

/**
 * Arma el body del issue de GitHub.
 * Incluye metadata como HTML comments para trazabilidad bidireccional.
 */
export function buildIssueBody(params: {
  tipo: string
  rolDisplay: string
  pagina: string
  entidad?: string | null
  entidadId?: string | null
  mensaje: string
  contextoQA?: ContextoQA | null
}): string {
  const { tipo, rolDisplay, pagina, entidad, entidadId, mensaje, contextoQA } = params

  let body = `**Tipo:** ${tipo}\n**Rol:** ${rolDisplay}\n**Pagina:** ${pagina}\n${entidad ? `**Entidad:** ${entidad} ${entidadId}\n` : ''}\n**Descripcion:**\n${mensaje}`

  if (contextoQA) {
    body += `\n\n## Contexto QA\n- **Spec:** ${contextoQA.spec ?? '—'}\n- **Eje:** ${contextoQA.eje ?? '—'}\n- **Item:** ${contextoQA.item ?? '—'}\n- **Resultado:** ${contextoQA.resultado ?? '—'}`
  }

  // Metadata como HTML comments para trazabilidad bidireccional
  if (contextoQA?.itemSelector || contextoQA?.verificador || contextoQA?.perfil) {
    body += '\n\n---'
    body += `\n<!-- item: ${contextoQA.itemSelector ?? ''} -->`
    body += `\n<!-- verificador: ${contextoQA.verificador ?? 'QA'} -->`
    body += `\n<!-- perfil: ${contextoQA.perfil ?? 'tecnico'} -->`
    body += `\n<!-- url: ${pagina} -->`
  }

  return body
}
