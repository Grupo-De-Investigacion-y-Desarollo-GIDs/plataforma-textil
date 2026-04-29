import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// Mock crypto.randomBytes for deterministic digests
vi.mock('crypto', () => ({
  randomBytes: () => Buffer.from('deadbeef', 'hex'),
}))

import {
  errorResponse,
  errorAuthRequired,
  errorForbidden,
  errorNotFound,
  errorInvalidInput,
  errorConflict,
  errorRateLimited,
  errorInternal,
  errorExternalService,
  apiHandler,
} from '@/compartido/lib/api-errors'

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('errorResponse', () => {
  it('retorna formato V3 con code, message y digest', async () => {
    const res = errorResponse({ code: 'TEST_CODE', message: 'Test message', status: 400 })
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('TEST_CODE')
    expect(body.error.message).toBe('Test message')
    expect(body.error.digest).toMatch(/^err_/)
  })

  it('incluye details cuando se proporcionan', async () => {
    const res = errorResponse({
      code: 'INVALID_INPUT',
      message: 'Datos invalidos',
      status: 400,
      details: { email: ['requerido'] },
    })
    const body = await res.json()

    expect(body.error.details).toEqual({ email: ['requerido'] })
  })

  it('logea a console.error con digest', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    errorResponse({ code: 'TEST', message: 'test', status: 500 })

    expect(consoleSpy).toHaveBeenCalledWith('[api error]', expect.objectContaining({
      code: 'TEST',
      digest: expect.stringMatching(/^err_/),
    }))
  })
})

describe('helpers especificos', () => {
  it('errorAuthRequired retorna 401 AUTH_REQUIRED', async () => {
    const res = errorAuthRequired()
    const body = await res.json()
    expect(res.status).toBe(401)
    expect(body.error.code).toBe('AUTH_REQUIRED')
  })

  it('errorForbidden retorna 403 FORBIDDEN', async () => {
    const res = errorForbidden('ADMIN')
    const body = await res.json()
    expect(res.status).toBe(403)
    expect(body.error.code).toBe('FORBIDDEN')
    expect(body.error.message).toContain('ADMIN')
  })

  it('errorForbidden sin rol retorna mensaje generico', async () => {
    const res = errorForbidden()
    const body = await res.json()
    expect(body.error.message).toBe('No tenes permisos para esta accion')
  })

  it('errorNotFound retorna 404 NOT_FOUND', async () => {
    const res = errorNotFound('pedido')
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.error.code).toBe('NOT_FOUND')
    expect(body.error.message).toContain('pedido')
  })

  it('errorInvalidInput retorna 400 con details de Zod', async () => {
    const mockZodError = { format: () => ({ email: { _errors: ['requerido'] } }) }
    const res = errorInvalidInput(mockZodError)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error.code).toBe('INVALID_INPUT')
    expect(body.error.details).toEqual({ email: { _errors: ['requerido'] } })
  })

  it('errorConflict retorna 409 CONFLICT', async () => {
    const res = errorConflict('El email ya esta registrado')
    const body = await res.json()
    expect(res.status).toBe(409)
    expect(body.error.code).toBe('CONFLICT')
  })

  it('errorRateLimited retorna 429 con Retry-After', async () => {
    const res = errorRateLimited(60)
    const body = await res.json()
    expect(res.status).toBe(429)
    expect(body.error.code).toBe('RATE_LIMITED')
    expect(res.headers.get('Retry-After')).toBe('60')
  })

  it('errorInternal retorna 500 sin exponer detalles', async () => {
    const res = errorInternal(new Error('SQL syntax error'))
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
    expect(body.error.message).not.toContain('SQL')
  })

  it('errorExternalService retorna 502', async () => {
    const res = errorExternalService('ARCA')
    const body = await res.json()
    expect(res.status).toBe(502)
    expect(body.error.code).toBe('EXTERNAL_SERVICE_ERROR')
    expect(body.error.message).toContain('ARCA')
  })
})

describe('apiHandler', () => {
  function makeReq() {
    return new Request('http://localhost/api/test', { method: 'GET' }) as unknown as import('next/server').NextRequest
  }

  it('pasa respuestas normales sin modificar', async () => {
    const handler = apiHandler(async () => NextResponse.json({ ok: true }))
    const res = await handler(makeReq(), {})
    const body = await res.json()
    expect(body).toEqual({ ok: true })
  })

  it('captura errores no manejados como 500 INTERNAL_ERROR', async () => {
    const handler = apiHandler(async () => { throw new Error('unexpected') })
    const res = await handler(makeReq(), {})
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('convierte Prisma P2002 a 409 CONFLICT', async () => {
    const handler = apiHandler(async () => {
      const err = new Error('Unique constraint') as Error & { code: string }
      err.code = 'P2002'
      throw err
    })
    const res = await handler(makeReq(), {})
    const body = await res.json()
    expect(res.status).toBe(409)
    expect(body.error.code).toBe('CONFLICT')
  })

  it('convierte Prisma P2025 a 404 NOT_FOUND', async () => {
    const handler = apiHandler(async () => {
      const err = new Error('Record not found') as Error & { code: string }
      err.code = 'P2025'
      throw err
    })
    const res = await handler(makeReq(), {})
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.error.code).toBe('NOT_FOUND')
  })

  it('convierte Prisma P2003 a 409 CONFLICT datos vinculados', async () => {
    const handler = apiHandler(async () => {
      const err = new Error('FK constraint') as Error & { code: string }
      err.code = 'P2003'
      throw err
    })
    const res = await handler(makeReq(), {})
    const body = await res.json()
    expect(res.status).toBe(409)
    expect(body.error.message).toContain('datos vinculados')
  })

  it('pasa ctx.params sin modificar', async () => {
    const handler = apiHandler(async (_req, ctx) => {
      const params = await ctx.params!
      return NextResponse.json({ id: params.id })
    })
    const ctx = { params: Promise.resolve({ id: 'abc-123' }) }
    const res = await handler(makeReq(), ctx)
    const body = await res.json()
    expect(body.id).toBe('abc-123')
  })
})
