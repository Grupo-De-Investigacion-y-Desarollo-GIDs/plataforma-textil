import { describe, it, expect } from 'vitest'
import { getClientIp } from '@/compartido/lib/ratelimit'
import { NextRequest } from 'next/server'

function makeReq(headers: Record<string, string> = {}): NextRequest {
  const h = new Headers(headers)
  return new NextRequest('http://localhost/api/test', { headers: h })
}

describe('getClientIp', () => {
  it('retorna x-real-ip cuando esta presente', () => {
    const req = makeReq({ 'x-real-ip': '1.2.3.4' })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('retorna x-forwarded-for cuando x-real-ip no esta', () => {
    const req = makeReq({ 'x-forwarded-for': '5.6.7.8' })
    expect(getClientIp(req)).toBe('5.6.7.8')
  })

  it('retorna primera IP de cadena x-forwarded-for', () => {
    const req = makeReq({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1, 10.0.0.2' })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('retorna 127.0.0.1 cuando no hay headers de IP', () => {
    const req = makeReq()
    expect(getClientIp(req)).toBe('127.0.0.1')
  })

  it('prefiere x-real-ip sobre x-forwarded-for', () => {
    const req = makeReq({ 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' })
    expect(getClientIp(req)).toBe('1.1.1.1')
  })
})
