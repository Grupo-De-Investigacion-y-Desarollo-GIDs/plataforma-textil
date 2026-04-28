import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@/compartido/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`) }),
}))

import { auth } from '@/compartido/lib/auth'
import { redirect } from 'next/navigation'
import { requiereRol, requiereRolApi } from '@/compartido/lib/permisos'

const mockAuth = auth as ReturnType<typeof vi.fn>

function mockSession(role: string, id = 'user-123') {
  return { user: { id, role, email: `test-${role}@pdt.org.ar` } }
}

describe('requiereRol (Server Components)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna sesion cuando el rol coincide', async () => {
    mockAuth.mockResolvedValue(mockSession('ESTADO'))
    const session = await requiereRol(['ESTADO'])
    expect(session.user.role).toBe('ESTADO')
  })

  it('permite acceso dual ESTADO+ADMIN', async () => {
    mockAuth.mockResolvedValue(mockSession('ADMIN'))
    const session = await requiereRol(['ESTADO', 'ADMIN'])
    expect(session.user.role).toBe('ADMIN')
  })

  it('redirige a /login sin sesion', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(requiereRol(['ESTADO'])).rejects.toThrow('REDIRECT:/login')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('redirige a /unauthorized con rol incorrecto', async () => {
    mockAuth.mockResolvedValue(mockSession('ADMIN'))
    await expect(requiereRol(['ESTADO'])).rejects.toThrow('REDIRECT:/unauthorized')
    expect(redirect).toHaveBeenCalledWith('/unauthorized')
  })

  it('TALLER no puede acceder a rutas ESTADO', async () => {
    mockAuth.mockResolvedValue(mockSession('TALLER'))
    await expect(requiereRol(['ESTADO', 'ADMIN'])).rejects.toThrow('REDIRECT:/unauthorized')
  })
})

describe('requiereRolApi (API Routes)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna userId y role con sesion valida', async () => {
    mockAuth.mockResolvedValue(mockSession('ESTADO', 'estado-456'))
    const result = await requiereRolApi(['ESTADO'])
    expect(result).toEqual({ userId: 'estado-456', role: 'ESTADO' })
  })

  it('retorna 401 sin sesion', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await requiereRolApi(['ESTADO'])
    expect(result).toBeInstanceOf(NextResponse)
    const body = await (result as NextResponse).json()
    expect(body.error).toBe('No autorizado')
    expect((result as NextResponse).status).toBe(401)
  })

  it('retorna 403 con formato INSUFFICIENT_ROLE para ADMIN intentando ESTADO', async () => {
    mockAuth.mockResolvedValue(mockSession('ADMIN'))
    const result = await requiereRolApi(['ESTADO'])
    expect(result).toBeInstanceOf(NextResponse)
    const res = result as NextResponse
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('INSUFFICIENT_ROLE')
    expect(body.error).toContain('ESTADO')
    expect(body.rolesRequeridos).toEqual(['ESTADO'])
  })

  it('permite acceso dual ESTADO+ADMIN', async () => {
    mockAuth.mockResolvedValue(mockSession('ADMIN', 'admin-789'))
    const result = await requiereRolApi(['ESTADO', 'ADMIN'])
    expect(result).toEqual({ userId: 'admin-789', role: 'ADMIN' })
  })

  it('403 incluye todos los roles requeridos en el mensaje', async () => {
    mockAuth.mockResolvedValue(mockSession('TALLER'))
    const result = await requiereRolApi(['ESTADO', 'ADMIN'])
    const body = await (result as NextResponse).json()
    expect(body.error).toContain('ESTADO')
    expect(body.error).toContain('ADMIN')
    expect(body.rolesRequeridos).toEqual(['ESTADO', 'ADMIN'])
  })
})
