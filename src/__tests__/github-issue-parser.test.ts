import { describe, it, expect } from 'vitest'
import { parseIssueMetadata, transformIssue } from '@/app/api/feedback/by-qa/[qaSlug]/route'
import fixture from '../../tests/fixtures/github-issue-response.json'

describe('parseIssueMetadata', () => {
  it('extrae itemSelector, verificador, perfil de HTML comments', () => {
    const body = '---\n<!-- item: eje-4-item-2 -->\n<!-- verificador: QA -->\n<!-- perfil: tecnico -->\n<!-- url: https://example.com -->'
    const meta = parseIssueMetadata(body)
    expect(meta.itemSelector).toBe('eje-4-item-2')
    expect(meta.verificador).toBe('QA')
    expect(meta.perfil).toBe('tecnico')
  })

  it('retorna null para campos ausentes', () => {
    const meta = parseIssueMetadata('Solo texto sin comments')
    expect(meta.itemSelector).toBeNull()
    expect(meta.verificador).toBeNull()
    expect(meta.perfil).toBeNull()
  })

  it('maneja body vacio', () => {
    const meta = parseIssueMetadata('')
    expect(meta.itemSelector).toBeNull()
  })

  it('extrae perfil interdisciplinario', () => {
    const body = '<!-- item: eje-6-politologo-1 -->\n<!-- verificador: perfil -->\n<!-- perfil: politologo -->'
    const meta = parseIssueMetadata(body)
    expect(meta.perfil).toBe('politologo')
    expect(meta.itemSelector).toBe('eje-6-politologo-1')
  })
})

describe('transformIssue — contra fixture real de GitHub', () => {
  it('transforma issue cerrado con metadata completa', () => {
    const result = transformIssue(fixture[0])
    expect(result.number).toBe(120)
    expect(result.title).toBe('[BUG] 4,5 segundos')
    expect(result.state).toBe('closed')
    expect(result.stateReason).toBe('completed')
    expect(result.itemSelector).toBe('eje-4-item-2')
    expect(result.verificador).toBe('QA')
    expect(result.perfil).toBe('tecnico')
    expect(result.createdAt).toBe('2026-04-22T22:37:53Z')
    expect(result.closedAt).toBe('2026-04-23T13:58:49Z')
    expect(result.url).toContain('github.com')
    expect(result.labels).toContain('bug')
    expect(result.labels).toContain('piloto')
  })

  it('transforma issue abierto con metadata', () => {
    const result = transformIssue(fixture[1])
    expect(result.number).toBe(115)
    expect(result.state).toBe('open')
    expect(result.stateReason).toBeNull()
    expect(result.itemSelector).toBe('eje-1-item-17')
    expect(result.closedAt).toBeNull()
  })

  it('transforma issue sin metadata (viejo, sin HTML comments)', () => {
    const result = transformIssue(fixture[2])
    expect(result.number).toBe(100)
    expect(result.state).toBe('closed')
    expect(result.stateReason).toBe('not_planned')
    expect(result.itemSelector).toBeNull()
    expect(result.verificador).toBeNull()
    expect(result.perfil).toBeNull()
    expect(result.labels).toContain('bug')
  })

  it('preserva la estructura completa de labels', () => {
    const result = transformIssue(fixture[0])
    expect(result.labels).toEqual(['bug', 'piloto', 'QA_v3-logs-admin-auditoria'])
  })
})
