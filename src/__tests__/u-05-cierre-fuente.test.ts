import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// U-05: cierre de la fuente. Las 3 vías que crean/actualizan users deben setear
// roles=[role] y activeMode=role (invariante role==activeMode, role ∈ roles) para que
// el dato no se vuelva a desincronizar. Acá cubrimos los 2 handlers (registro y
// registro/completar); el seed se valida vía script (u05-audit --verify post db:seed).

// ---------- mocks compartidos ----------
vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    taller: { findUnique: vi.fn() },
    tipoDocumento: { findMany: vi.fn().mockResolvedValue([]) },
    validacion: { createMany: vi.fn() },
    consentimiento: { createMany: vi.fn() },
    $transaction: vi.fn(),
  },
}))
vi.mock('@/compartido/lib/arca', () => ({
  consultarPadron: vi.fn(),
  errorBloqueaRegistro: vi.fn().mockReturnValue(false),
  mensajeErrorArca: vi.fn().mockReturnValue('CUIT invalido'),
}))
vi.mock('@/compartido/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  buildBienvenidaEmail: vi.fn().mockReturnValue({ subject: 's', html: '<p>h</p>' }),
}))
vi.mock('@/compartido/lib/ratelimit', () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
  getClientIp: vi.fn().mockReturnValue('1.1.1.1'),
}))
vi.mock('@/compartido/lib/log', () => ({ logActividad: vi.fn() }))
vi.mock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('hashed') } }))
vi.mock('@/compartido/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/compartido/lib/afip', () => ({ verificarCuit: vi.fn() }))
vi.mock('@/compartido/lib/crear-entidad-rol', () => ({ crearEntidadParaRol: vi.fn() }))

import { prisma } from '@/compartido/lib/prisma'
import { consultarPadron } from '@/compartido/lib/arca'
import { auth } from '@/compartido/lib/auth'
import { verificarCuit } from '@/compartido/lib/afip'
import { crearEntidadParaRol } from '@/compartido/lib/crear-entidad-rol'

import { POST as registroPOST } from '@/app/api/auth/registro/route'
import { POST as completarPOST } from '@/app/api/auth/registro/completar/route'

const mockUserFind = prisma.user.findUnique as ReturnType<typeof vi.fn>
const mockUserCreate = prisma.user.create as ReturnType<typeof vi.fn>
const mockTallerFind = prisma.taller.findUnique as ReturnType<typeof vi.fn>
const mockTx = prisma.$transaction as ReturnType<typeof vi.fn>
const mockPadron = consultarPadron as ReturnType<typeof vi.fn>
const mockAuth = auth as ReturnType<typeof vi.fn>
const mockVerificarCuit = verificarCuit as ReturnType<typeof vi.fn>
const mockCrear = crearEntidadParaRol as ReturnType<typeof vi.fn>

const reqRegistro = (body: unknown) =>
  registroPOST(
    new NextRequest('http://localhost/api/auth/registro', { method: 'POST', body: JSON.stringify(body) }) as NextRequest,
    {} as never,
  )

const reqCompletar = (body: unknown) =>
  completarPOST(
    new NextRequest('http://localhost/api/auth/registro/completar', { method: 'POST', body: JSON.stringify(body) }) as NextRequest,
  )

beforeEach(() => {
  vi.clearAllMocks()
  process.env.VERCEL_ENV = 'production' // gate de registro (spec v4-a) = no-op en prod
  mockPadron.mockResolvedValue({ exitosa: true, datos: { nombre: 'X' } })
})

describe('U-05 cierre de fuente — POST /api/auth/registro', () => {
  it('MARCA nueva: user.create recibe roles=[MARCA] y activeMode=MARCA', async () => {
    mockUserFind.mockResolvedValue(null)
    mockUserCreate.mockResolvedValue({ id: 'u1', email: 'm@x.com', name: null, role: 'MARCA' })

    const res = await reqRegistro({
      email: 'm@x.com',
      password: 'password123',
      role: 'MARCA',
      marcaData: { nombre: 'Mi Marca', cuit: '27-99999999-1' },
    })

    expect(res.status).toBe(201)
    const arg = mockUserCreate.mock.calls[0][0]
    expect(arg.data.role).toBe('MARCA')
    expect(arg.data.roles).toEqual(['MARCA'])
    expect(arg.data.activeMode).toBe('MARCA')
  })

  it('TALLER nuevo: user.create recibe roles=[TALLER] y activeMode=TALLER', async () => {
    mockUserFind.mockResolvedValue(null)
    mockUserCreate.mockResolvedValue({ id: 'u2', email: 't@x.com', name: null, role: 'TALLER' })
    mockTallerFind.mockResolvedValue(null) // corta el subflow de validaciones

    const res = await reqRegistro({
      email: 't@x.com',
      password: 'password123',
      role: 'TALLER',
      tallerData: { nombre: 'Mi Taller', cuit: '20-12345678-9' },
    })

    expect(res.status).toBe(201)
    const arg = mockUserCreate.mock.calls[0][0]
    expect(arg.data.role).toBe('TALLER')
    expect(arg.data.roles).toEqual(['TALLER'])
    expect(arg.data.activeMode).toBe('TALLER')
  })

  it('invariante: roles contiene siempre al role y activeMode == role', async () => {
    mockUserFind.mockResolvedValue(null)
    mockUserCreate.mockResolvedValue({ id: 'u3', email: 'm2@x.com', name: null, role: 'MARCA' })
    await reqRegistro({ email: 'm2@x.com', password: 'password123', role: 'MARCA', marcaData: { nombre: 'M', cuit: '27-1-1' } })
    const { role, roles, activeMode } = mockUserCreate.mock.calls[0][0].data
    expect(roles).toContain(role)
    expect(activeMode).toBe(role)
  })
})

describe('U-05 cierre de fuente — POST /api/auth/registro/completar', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } })
    mockVerificarCuit.mockResolvedValue({ valid: true })
    // $transaction(cb) ejecuta el callback con un tx que expone user.update
    mockTx.mockImplementation(async (cb: (tx: unknown) => unknown) => cb({ user: { update: txUserUpdate }, consentimiento: { createMany: vi.fn() } }))
  })

  const txUserUpdate = vi.fn()

  it('completar primera entidad: user.update setea role + roles=[role] + activeMode=role', async () => {
    mockUserFind.mockResolvedValue({ id: 'u1', taller: null, marca: null })

    const res = await reqCompletar({ role: 'TALLER', nombre: 'Mi Taller', cuit: '20-12345678-9' })

    expect(res.status).toBe(200)
    expect(mockCrear).toHaveBeenCalled()
    expect(txUserUpdate).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { role: 'TALLER', roles: ['TALLER'], activeMode: 'TALLER', registroCompleto: true },
    })
  })

  it('no sincroniza si el user ya tiene entidad (409, sin tocar el update)', async () => {
    mockUserFind.mockResolvedValue({ id: 'u1', taller: { id: 't1' }, marca: null })
    const res = await reqCompletar({ role: 'MARCA', nombre: 'M', cuit: '27-1-1' })
    expect(res.status).toBe(409)
    expect(txUserUpdate).not.toHaveBeenCalled()
  })
})
