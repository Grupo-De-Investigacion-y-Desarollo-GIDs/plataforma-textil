import { describe, it, expect } from 'vitest'
import { getErrorMessage, getErrorCode } from '@/compartido/lib/api-client'

describe('getErrorMessage', () => {
  it('extrae message de formato V3', () => {
    const data = { error: { code: 'INVALID_INPUT', message: 'Email invalido', digest: 'err_abc' } }
    expect(getErrorMessage(data)).toBe('Email invalido')
  })

  it('extrae string de formato legacy', () => {
    const data = { error: 'No autorizado' }
    expect(getErrorMessage(data)).toBe('No autorizado')
  })

  it('retorna fallback cuando data es null', () => {
    expect(getErrorMessage(null)).toBe('Algo salio mal')
  })

  it('retorna fallback personalizado', () => {
    expect(getErrorMessage(null, 'Error custom')).toBe('Error custom')
  })

  it('retorna fallback cuando error no tiene message', () => {
    expect(getErrorMessage({ error: { code: 'X' } })).toBe('Algo salio mal')
  })

  it('retorna fallback cuando no hay campo error', () => {
    expect(getErrorMessage({ ok: false })).toBe('Algo salio mal')
  })
})

describe('getErrorCode', () => {
  it('extrae code de formato V3', () => {
    const data = { error: { code: 'FORBIDDEN', message: 'Sin permisos' } }
    expect(getErrorCode(data)).toBe('FORBIDDEN')
  })

  it('retorna undefined para formato legacy', () => {
    const data = { error: 'No autorizado' }
    expect(getErrorCode(data)).toBeUndefined()
  })

  it('retorna undefined para null', () => {
    expect(getErrorCode(null)).toBeUndefined()
  })
})
