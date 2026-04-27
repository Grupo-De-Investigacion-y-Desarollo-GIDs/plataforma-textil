import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getClientIp, isCiBypass } from '@/compartido/lib/ratelimit'
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

describe('isCiBypass', () => {
  const savedEnv: Record<string, string | undefined> = {}

  beforeEach(() => {
    savedEnv.CI_BYPASS_TOKEN = process.env.CI_BYPASS_TOKEN
    savedEnv.VERCEL_ENV = process.env.VERCEL_ENV
  })

  afterEach(() => {
    if (savedEnv.CI_BYPASS_TOKEN === undefined) delete process.env.CI_BYPASS_TOKEN
    else process.env.CI_BYPASS_TOKEN = savedEnv.CI_BYPASS_TOKEN
    if (savedEnv.VERCEL_ENV === undefined) delete process.env.VERCEL_ENV
    else process.env.VERCEL_ENV = savedEnv.VERCEL_ENV
  })

  it('bypass aplica si token matchea y env es preview', () => {
    process.env.CI_BYPASS_TOKEN = 'test-secret-token'
    process.env.VERCEL_ENV = 'preview'
    const req = makeReq({ 'x-ci-bypass': 'test-secret-token' })
    expect(isCiBypass(req)).toBe(true)
  })

  it('bypass aplica si token matchea y env es development', () => {
    process.env.CI_BYPASS_TOKEN = 'test-secret-token'
    process.env.VERCEL_ENV = 'development'
    const req = makeReq({ 'x-ci-bypass': 'test-secret-token' })
    expect(isCiBypass(req)).toBe(true)
  })

  it('NO bypass si env es production (aunque token matchee)', () => {
    process.env.CI_BYPASS_TOKEN = 'test-secret-token'
    process.env.VERCEL_ENV = 'production'
    const req = makeReq({ 'x-ci-bypass': 'test-secret-token' })
    expect(isCiBypass(req)).toBe(false)
  })

  it('NO bypass si token no matchea', () => {
    process.env.CI_BYPASS_TOKEN = 'real-token'
    process.env.VERCEL_ENV = 'preview'
    const req = makeReq({ 'x-ci-bypass': 'wrong-token' })
    expect(isCiBypass(req)).toBe(false)
  })

  it('NO bypass si CI_BYPASS_TOKEN no esta configurado', () => {
    delete process.env.CI_BYPASS_TOKEN
    process.env.VERCEL_ENV = 'preview'
    const req = makeReq({ 'x-ci-bypass': 'any-token' })
    expect(isCiBypass(req)).toBe(false)
  })

  it('NO bypass si header no esta presente', () => {
    process.env.CI_BYPASS_TOKEN = 'test-secret-token'
    process.env.VERCEL_ENV = 'preview'
    const req = makeReq()
    expect(isCiBypass(req)).toBe(false)
  })
})
