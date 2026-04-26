import { describe, it, expect } from 'vitest'
import { extractQaSlugs, aggregateIssues } from '@/compartido/lib/qa-aggregate'
import { transformIssue } from '@/app/api/feedback/by-qa/[qaSlug]/route'
import fixture from '../../tests/fixtures/github-issue-response.json'

describe('extractQaSlugs', () => {
  it('extrae labels QA_v3-*', () => {
    const labels = ['bug', 'piloto', 'QA_v3-logs-admin-auditoria']
    expect(extractQaSlugs(labels)).toEqual(['QA_v3-logs-admin-auditoria'])
  })

  it('ignora labels que no son QA_v3-*', () => {
    const labels = ['bug', 'piloto', 'QA_v2-algo']
    expect(extractQaSlugs(labels)).toEqual([])
  })

  it('retorna multiples slugs si hay mas de uno', () => {
    const labels = ['QA_v3-a', 'piloto', 'QA_v3-b']
    expect(extractQaSlugs(labels)).toEqual(['QA_v3-a', 'QA_v3-b'])
  })

  it('retorna vacio si no hay labels QA_v3-*', () => {
    expect(extractQaSlugs([])).toEqual([])
    expect(extractQaSlugs(['bug'])).toEqual([])
  })
})

describe('aggregateIssues — contra fixture real de GitHub', () => {
  const transformed = fixture.map(transformIssue)

  it('agrupa issues por QA slug', () => {
    const { counts } = aggregateIssues(transformed)
    expect(Object.keys(counts)).toEqual(['QA_v3-logs-admin-auditoria'])
    expect(counts['QA_v3-logs-admin-auditoria'].total).toBe(2)
  })

  it('cuenta open y closed correctamente', () => {
    const { counts } = aggregateIssues(transformed)
    const qa = counts['QA_v3-logs-admin-auditoria']
    // Issue 120 closed, issue 115 open
    expect(qa.open).toBe(1)
    expect(qa.closed).toBe(1)
  })

  it('agrega por verificador', () => {
    const { counts } = aggregateIssues(transformed)
    const qa = counts['QA_v3-logs-admin-auditoria']
    expect(qa.porVerificador['qa']).toEqual({ open: 1, closed: 1 })
  })

  it('agrega por perfil', () => {
    const { counts } = aggregateIssues(transformed)
    const qa = counts['QA_v3-logs-admin-auditoria']
    expect(qa.porPerfil['tecnico']).toEqual({ open: 1, closed: 1 })
  })

  it('incluye issues summary en cada QA', () => {
    const { counts } = aggregateIssues(transformed)
    const qa = counts['QA_v3-logs-admin-auditoria']
    expect(qa.issues).toHaveLength(2)
    expect(qa.issues[0].number).toBe(120)
    expect(qa.issues[1].number).toBe(115)
  })

  it('ignora issues sin label QA_v3-*', () => {
    const { counts } = aggregateIssues(transformed)
    // Issue 100 no tiene QA_v3-* label
    const allNumbers = Object.values(counts).flatMap(q => q.issues.map(i => i.number))
    expect(allNumbers).not.toContain(100)
  })

  it('calcula global correctamente', () => {
    const { global } = aggregateIssues(transformed)
    expect(global.open).toBe(1)
    expect(global.closed).toBe(1)
    expect(global.total).toBe(2)
    expect(global.porVerificador['qa']).toEqual({ open: 1, closed: 1 })
    expect(global.porPerfil['tecnico']).toEqual({ open: 1, closed: 1 })
  })

  it('retorna estructura vacia sin issues', () => {
    const { counts, global } = aggregateIssues([])
    expect(counts).toEqual({})
    expect(global).toEqual({ open: 0, closed: 0, total: 0, porVerificador: {}, porPerfil: {} })
  })

  it('usa "desconocido" cuando verificador es null', () => {
    const issuesSinMeta = [transformIssue(fixture[2])]
    // Issue 100 no tiene metadata ni QA_v3 label, pero forzamos uno
    const forzado = { ...issuesSinMeta[0], labels: ['QA_v3-test'] }
    const { counts } = aggregateIssues([forzado])
    expect(counts['QA_v3-test'].porVerificador['desconocido']).toBeDefined()
  })

  it('usa "tecnico" como perfil default cuando es null', () => {
    const forzado = { ...transformIssue(fixture[2]), labels: ['QA_v3-test'] }
    const { counts } = aggregateIssues([forzado])
    expect(counts['QA_v3-test'].porPerfil['tecnico']).toBeDefined()
  })
})
