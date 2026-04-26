/**
 * Funciones puras para agregar issues de QA V3 por slug, verificador y perfil.
 * Extraídas del endpoint /api/feedback/all-qa-v3 para testabilidad.
 */

interface TransformedIssue {
  number: number
  title: string
  state: string
  stateReason: string | null
  itemSelector: string | null
  verificador: string | null
  perfil: string | null
  createdAt: string
  closedAt: string | null
  url: string
  labels: string[]
}

interface StatePair {
  open: number
  closed: number
}

interface IssueSummary {
  number: number
  title: string
  state: string
  verificador: string | null
  perfil: string | null
  url: string
}

interface QaCounts {
  open: number
  closed: number
  total: number
  porVerificador: Record<string, StatePair>
  porPerfil: Record<string, StatePair>
  issues: IssueSummary[]
}

interface GlobalCounts {
  open: number
  closed: number
  total: number
  porVerificador: Record<string, StatePair>
  porPerfil: Record<string, StatePair>
}

export interface AggregateResult {
  counts: Record<string, QaCounts>
  global: GlobalCounts
}

/**
 * Extrae labels que corresponden a QA V3 slugs (empiezan con "QA_v3-").
 */
export function extractQaSlugs(labels: string[]): string[] {
  return labels.filter(l => l.startsWith('QA_v3-'))
}

/**
 * Agrega issues transformados por QA slug, verificador y perfil.
 * Issues sin label QA_v3-* se ignoran.
 * Un issue con múltiples labels QA_v3-* cuenta en cada uno.
 */
export function aggregateIssues(issues: TransformedIssue[]): AggregateResult {
  const counts: Record<string, QaCounts> = {}

  for (const issue of issues) {
    const slugs = extractQaSlugs(issue.labels)
    if (slugs.length === 0) continue

    for (const slug of slugs) {
      if (!counts[slug]) {
        counts[slug] = { open: 0, closed: 0, total: 0, porVerificador: {}, porPerfil: {}, issues: [] }
      }

      const qa = counts[slug]
      const isOpen = issue.state === 'open'

      if (isOpen) qa.open++
      else qa.closed++
      qa.total++

      const ver = (issue.verificador ?? 'desconocido').toLowerCase()
      if (!qa.porVerificador[ver]) qa.porVerificador[ver] = { open: 0, closed: 0 }
      if (isOpen) qa.porVerificador[ver].open++
      else qa.porVerificador[ver].closed++

      const perfil = (issue.perfil ?? 'tecnico').toLowerCase()
      if (!qa.porPerfil[perfil]) qa.porPerfil[perfil] = { open: 0, closed: 0 }
      if (isOpen) qa.porPerfil[perfil].open++
      else qa.porPerfil[perfil].closed++

      qa.issues.push({
        number: issue.number as number,
        title: issue.title as string,
        state: issue.state as string,
        verificador: issue.verificador,
        perfil: issue.perfil,
        url: issue.url as string,
      })
    }
  }

  const global: GlobalCounts = {
    open: 0, closed: 0, total: 0,
    porVerificador: {},
    porPerfil: {},
  }

  for (const qa of Object.values(counts)) {
    global.open += qa.open
    global.closed += qa.closed
    global.total += qa.total

    for (const [ver, sp] of Object.entries(qa.porVerificador)) {
      if (!global.porVerificador[ver]) global.porVerificador[ver] = { open: 0, closed: 0 }
      global.porVerificador[ver].open += sp.open
      global.porVerificador[ver].closed += sp.closed
    }

    for (const [perfil, sp] of Object.entries(qa.porPerfil)) {
      if (!global.porPerfil[perfil]) global.porPerfil[perfil] = { open: 0, closed: 0 }
      global.porPerfil[perfil].open += sp.open
      global.porPerfil[perfil].closed += sp.closed
    }
  }

  return { counts, global }
}
