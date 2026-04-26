import { describe, it, expect } from 'vitest'
import { corsHeaders } from '@/compartido/lib/cors'

const ALLOWED = 'https://grupo-de-investigacion-y-desarollo-gids.github.io'

function fakeRequest(origin: string): Request {
  return { headers: new Headers({ origin }) } as unknown as Request
}

describe('corsHeaders', () => {
  it('retorna headers CORS para origin permitido', () => {
    const headers = corsHeaders(fakeRequest(ALLOWED))
    expect(headers['Access-Control-Allow-Origin']).toBe(ALLOWED)
    expect(headers['Access-Control-Allow-Methods']).toContain('GET')
    expect(headers['Access-Control-Allow-Methods']).toContain('POST')
    expect(headers['Access-Control-Allow-Methods']).toContain('OPTIONS')
    expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type')
  })

  it('retorna headers vacios para origin no permitido', () => {
    const headers = corsHeaders(fakeRequest('https://evil.com'))
    expect(Object.keys(headers)).toHaveLength(0)
  })

  it('retorna headers vacios si no hay origin', () => {
    const req = { headers: new Headers() } as unknown as Request
    const headers = corsHeaders(req)
    expect(Object.keys(headers)).toHaveLength(0)
  })
})
