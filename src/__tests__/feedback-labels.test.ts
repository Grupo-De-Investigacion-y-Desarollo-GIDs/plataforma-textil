import { describe, it, expect } from 'vitest'
import { buildIssueLabels, buildIssueBody } from '@/compartido/lib/feedback'

describe('buildIssueLabels', () => {
  it('retorna labels base para tipo bug', () => {
    const labels = buildIssueLabels('bug')
    expect(labels).toEqual(['bug', 'piloto'])
  })

  it('retorna labels base para tipo bloqueante', () => {
    const labels = buildIssueLabels('bloqueante')
    expect(labels).toContain('critical')
  })

  it('agrega qaSlug como label cuando esta presente', () => {
    const labels = buildIssueLabels('bug', { qaSlug: 'QA_v3-logs-admin-auditoria' })
    expect(labels).toContain('QA_v3-logs-admin-auditoria')
  })

  it('no agrega qaSlug si no esta en contextoQA', () => {
    const labels = buildIssueLabels('bug', { spec: 'algo' })
    expect(labels).toEqual(['bug', 'piloto'])
  })

  it('agrega label de perfil cuando no es tecnico', () => {
    const labels = buildIssueLabels('bug', { qaSlug: 'QA_v3-test', perfil: 'politologo' })
    expect(labels).toContain('perfil-politologo')
  })

  it('no agrega label de perfil cuando es tecnico', () => {
    const labels = buildIssueLabels('bug', { qaSlug: 'QA_v3-test', perfil: 'tecnico' })
    expect(labels).not.toContain('perfil-tecnico')
  })

  it('retorna piloto por defecto para tipo desconocido', () => {
    const labels = buildIssueLabels('tipo_raro')
    expect(labels).toEqual(['piloto'])
  })

  it('maneja contextoQA null', () => {
    const labels = buildIssueLabels('bug', null)
    expect(labels).toEqual(['bug', 'piloto'])
  })
})

describe('buildIssueBody', () => {
  it('arma body basico sin contextoQA', () => {
    const body = buildIssueBody({
      tipo: 'bug',
      rolDisplay: 'QA',
      pagina: '/admin/logs',
      mensaje: 'El filtro no funciona',
    })
    expect(body).toContain('**Tipo:** bug')
    expect(body).toContain('**Rol:** QA')
    expect(body).toContain('**Pagina:** /admin/logs')
    expect(body).toContain('El filtro no funciona')
    expect(body).not.toContain('<!-- item:')
  })

  it('incluye contexto QA cuando esta presente', () => {
    const body = buildIssueBody({
      tipo: 'bug',
      rolDisplay: 'QA',
      pagina: '/admin/logs',
      mensaje: 'Filtro roto',
      contextoQA: {
        spec: 'v3-logs.md',
        eje: 'Eje 1',
        item: '#17 Filtro por fecha',
        resultado: 'bug',
      },
    })
    expect(body).toContain('## Contexto QA')
    expect(body).toContain('v3-logs.md')
    expect(body).toContain('#17 Filtro por fecha')
  })

  it('inserta metadata HTML comments cuando hay itemSelector', () => {
    const body = buildIssueBody({
      tipo: 'bug',
      rolDisplay: 'QA',
      pagina: '/admin/logs',
      mensaje: 'Filtro roto',
      contextoQA: {
        itemSelector: 'eje-1-item-17',
        verificador: 'QA',
        perfil: 'tecnico',
      },
    })
    expect(body).toContain('<!-- item: eje-1-item-17 -->')
    expect(body).toContain('<!-- verificador: QA -->')
    expect(body).toContain('<!-- perfil: tecnico -->')
    expect(body).toContain('<!-- url: /admin/logs -->')
  })

  it('no inserta HTML comments si no hay itemSelector ni verificador ni perfil', () => {
    const body = buildIssueBody({
      tipo: 'bug',
      rolDisplay: 'QA',
      pagina: '/admin/logs',
      mensaje: 'Bug generico',
      contextoQA: { spec: 'algo' },
    })
    expect(body).not.toContain('<!-- item:')
  })

  it('incluye entidad cuando esta presente', () => {
    const body = buildIssueBody({
      tipo: 'bug',
      rolDisplay: 'ADMIN',
      pagina: '/admin',
      entidad: 'taller',
      entidadId: 'abc-123',
      mensaje: 'Taller roto',
    })
    expect(body).toContain('**Entidad:** taller abc-123')
  })
})
