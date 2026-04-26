import { describe, it, expect } from 'vitest'
import { toCsv } from '@/compartido/lib/csv'

describe('toCsv', () => {
  it('genera CSV con headers y filas', () => {
    const csv = toCsv(['Nombre', 'Edad'], [['Juan', '30'], ['Maria', '25']])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('"Nombre","Edad"')
    expect(lines[1]).toBe('"Juan","30"')
    expect(lines[2]).toBe('"Maria","25"')
  })

  it('escapa comillas dobles segun RFC 4180', () => {
    const csv = toCsv(['Texto'], [['El dijo "hola"']])
    expect(csv).toContain('"El dijo ""hola"""')
  })

  it('maneja valores null/undefined como string vacio', () => {
    const csv = toCsv(['Col'], [[null as unknown as string], [undefined as unknown as string]])
    const lines = csv.split('\n')
    expect(lines[1]).toBe('""')
    expect(lines[2]).toBe('""')
  })

  it('genera solo headers si no hay filas', () => {
    const csv = toCsv(['A', 'B', 'C'], [])
    expect(csv).toBe('"A","B","C"')
  })

  it('maneja caracteres especiales (comas, saltos de linea)', () => {
    const csv = toCsv(['Desc'], [['valor con, coma'], ['valor\ncon salto']])
    const lines = csv.split('\n')
    expect(lines[1]).toBe('"valor con, coma"')
    // El salto de linea queda dentro de las comillas
    expect(csv).toContain('"valor\ncon salto"')
  })
})
