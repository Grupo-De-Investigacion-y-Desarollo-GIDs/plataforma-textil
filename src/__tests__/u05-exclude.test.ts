import { describe, it, expect } from 'vitest'
import { parseExcludeEmails, particionarExcluidos, type TallerConEmail } from '../../prisma/validaciones-helper'

describe('parseExcludeEmails — flag --exclude del backfill', () => {
  it('forma repetible: --exclude a --exclude b', () => {
    expect(parseExcludeEmails(['--exclude', 'a@x.com', '--exclude', 'b@y.com'])).toEqual([
      'a@x.com',
      'b@y.com',
    ])
  })

  it('forma CSV: --exclude a,b', () => {
    expect(parseExcludeEmails(['--exclude', 'a@x.com,b@y.com'])).toEqual(['a@x.com', 'b@y.com'])
  })

  it('forma con = : --exclude=a,b', () => {
    expect(parseExcludeEmails(['--exclude=a@x.com,b@y.com'])).toEqual(['a@x.com', 'b@y.com'])
  })

  it('mezcla repetible + CSV + =', () => {
    expect(
      parseExcludeEmails(['--exclude', 'a@x.com', '--exclude=b@y.com,c@z.com']),
    ).toEqual(['a@x.com', 'b@y.com', 'c@z.com'])
  })

  it('normaliza a lowercase y trimea', () => {
    expect(parseExcludeEmails(['--exclude', '  A@X.COM , b@Y.com '])).toEqual([
      'a@x.com',
      'b@y.com',
    ])
  })

  it('deduplica', () => {
    expect(parseExcludeEmails(['--exclude', 'a@x.com', '--exclude', 'A@X.com'])).toEqual([
      'a@x.com',
    ])
  })

  it('convive con --apply sin tragárselo como valor', () => {
    expect(parseExcludeEmails(['--apply', '--exclude', 'a@x.com'])).toEqual(['a@x.com'])
    expect(parseExcludeEmails(['--exclude', '--apply'])).toEqual([])
  })

  it('sin flag o flag sin valor -> []', () => {
    expect(parseExcludeEmails(['--apply'])).toEqual([])
    expect(parseExcludeEmails(['--exclude'])).toEqual([])
    expect(parseExcludeEmails([])).toEqual([])
  })
})

describe('particionarExcluidos — saca los talleres de la cuenta de smoke', () => {
  const talleres: TallerConEmail[] = [
    { id: 't1', nombre: 'Taller Uno', userEmail: 'uno@x.com' },
    { id: 't2', nombre: 'Taller Smoke', userEmail: 'smoke@sergio.com' },
    { id: 't3', nombre: 'Sin Email', userEmail: null },
  ]

  it('excluye por email (case-insensitive) y deja el resto', () => {
    const { incluidos, excluidos } = particionarExcluidos(talleres, ['SMOKE@sergio.com'])
    expect(excluidos.map((t) => t.id)).toEqual(['t2'])
    expect(incluidos.map((t) => t.id)).toEqual(['t1', 't3'])
  })

  it('userEmail null nunca se excluye', () => {
    const { excluidos } = particionarExcluidos(talleres, ['uno@x.com'])
    expect(excluidos.map((t) => t.id)).toEqual(['t1'])
  })

  it('sin exclusiones: todos incluidos', () => {
    const { incluidos, excluidos, sinMatch } = particionarExcluidos(talleres, [])
    expect(incluidos).toHaveLength(3)
    expect(excluidos).toHaveLength(0)
    expect(sinMatch).toEqual([])
  })

  it('reporta emails de --exclude que no matchean ningún taller (typo)', () => {
    const { excluidos, sinMatch } = particionarExcluidos(talleres, [
      'smoke@sergio.com',
      'noexiste@x.com',
    ])
    expect(excluidos.map((t) => t.id)).toEqual(['t2'])
    expect(sinMatch).toEqual(['noexiste@x.com'])
  })
})
