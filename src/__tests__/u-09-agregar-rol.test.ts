import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// U-09: endpoint POST /api/usuarios/me/roles. Agrega un 2do rol (TALLER⇄MARCA),
// crea la entidad y expande roles[] de forma explícita (rolesEfectivos ∪ {nuevo}),
// manteniendo role == activeMode. La creación de entidad se mockea (helper aparte).

vi.mock('@/compartido/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}))
vi.mock('@/compartido/lib/crear-entidad-rol', () => ({
  crearEntidadParaRol: vi.fn(),
}))
vi.mock('@/compartido/lib/arca', () => ({
  consultarPadron: vi.fn(),
  errorBloqueaRegistro: vi.fn(),
  mensajeErrorArca: vi.fn().mockReturnValue('CUIT invalido'),
}))
vi.mock('@/compartido/lib/log', () => ({ logActividad: vi.fn() }))

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { crearEntidadParaRol } from '@/compartido/lib/crear-entidad-rol'
import { consultarPadron, errorBloqueaRegistro } from '@/compartido/lib/arca'
import { POST } from '@/app/api/usuarios/me/roles/route'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockUserFind = prisma.user.findUnique as ReturnType<typeof vi.fn>
const mockTx = prisma.$transaction as ReturnType<typeof vi.fn>
const mockCrear = crearEntidadParaRol as ReturnType<typeof vi.fn>
const mockPadron = consultarPadron as ReturnType<typeof vi.fn>
const mockBloquea = errorBloqueaRegistro as ReturnType<typeof vi.fn>

const txUserUpdate = vi.fn()

const post = (body?: unknown) =>
  POST(
    new NextRequest('http://localhost/api/usuarios/me/roles', {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }) as NextRequest,
    {} as never
  )

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { id: 'u1' } })
  // $transaction(cb) ejecuta el callback con un tx que expone user.update
  mockTx.mockImplementation(async (cb: (tx: unknown) => unknown) =>
    cb({ user: { update: txUserUpdate } })
  )
  mockPadron.mockResolvedValue({ exitosa: true, datos: { nombre: 'X', cuit: '20-1-2' } })
  mockBloquea.mockReturnValue(false)
})

describe('POST /api/usuarios/me/roles', () => {
  it('agrega MARCA a un TALLER (200) y expande roles[] = [TALLER, MARCA]', async () => {
    mockUserFind.mockResolvedValue({ id: 'u1', roles: [], role: 'TALLER', taller: { id: 't1' }, marca: null })
    mockCrear.mockResolvedValue({ id: 'marca-1' })

    const res = await post({ rol: 'MARCA', nombre: 'Mi Marca', cuit: '20-12345678-9' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      rol: 'MARCA',
      entidadId: 'marca-1',
      roles: ['TALLER', 'MARCA'],
      activeMode: 'MARCA',
    })
    expect(mockCrear).toHaveBeenCalled()
    // Unión explícita + invariante role == activeMode
    expect(txUserUpdate).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { roles: { set: ['TALLER', 'MARCA'] }, activeMode: 'MARCA', role: 'MARCA' },
    })
  })

  it('normalización: user con roles=[] en DB termina en [TALLER, MARCA], no [MARCA]', async () => {
    mockUserFind.mockResolvedValue({ id: 'u1', roles: [], role: 'TALLER', taller: { id: 't1' }, marca: null })
    mockCrear.mockResolvedValue({ id: 'marca-1' })
    await post({ rol: 'MARCA', nombre: 'Mi Marca', cuit: '20-1-9' })
    const arg = txUserUpdate.mock.calls[0][0]
    expect(arg.data.roles.set).toEqual(['TALLER', 'MARCA'])
  })

  it('D: CUIT coincide con un Taller VERIFICADO → 200 SIN llamar a ARCA', async () => {
    // Mismo CUIT que su Taller verificadoAfip=true → se omite consultarPadron (cache-like).
    mockUserFind.mockResolvedValue({
      id: 'u1', roles: ['TALLER'], role: 'TALLER',
      taller: { id: 't1', cuit: '20123456789', verificadoAfip: true }, marca: null,
    })
    mockCrear.mockResolvedValue({ id: 'marca-1' })

    const res = await post({ rol: 'MARCA', nombre: 'Mi Marca', cuit: '20-12345678-9' })
    expect(res.status).toBe(200)
    expect(mockPadron).not.toHaveBeenCalled()
    expect(mockCrear).toHaveBeenCalled()
    // Se creó igual con verificadoAfip asumido (sin datosArca de ARCA).
    const crearArgs = mockCrear.mock.calls[0][1]
    expect(crearArgs.verificadoAfip).toBe(true)
    expect(crearArgs.datosArca).toBeUndefined()
  })

  it('D (caso martin): CUIT coincide pero la entidad NO está verificada → SÍ llama a ARCA', async () => {
    // Fidedigno a martin.echevarria: marca con cuit presente pero verificadoAfip=false.
    // El CUIT nunca fue verificado → no se skipea, se manda a ARCA como corresponde.
    mockUserFind.mockResolvedValue({
      id: 'u1', roles: ['MARCA'], role: 'MARCA',
      taller: null, marca: { id: 'm1', cuit: '30718902345', verificadoAfip: false },
    })
    mockCrear.mockResolvedValue({ id: 'taller-1' })

    const res = await post({ rol: 'TALLER', nombre: 'Mi Taller', cuit: '30-71890234-5' })
    expect(res.status).toBe(200)
    expect(mockPadron).toHaveBeenCalledTimes(1)
    expect(mockPadron).toHaveBeenCalledWith('30-71890234-5')
  })

  it('B-02: CUIT verificado en User (sin entidad) → 200 SIN llamar a ARCA', async () => {
    // Caso registro abandonado: el User tiene cuit + verificadoAfip=true pero NO
    // creó entidad. El skip debe disparar leyendo User.cuit/verificadoAfip.
    mockUserFind.mockResolvedValue({
      id: 'u1', roles: ['TALLER'], role: 'TALLER',
      cuit: '20123456789', verificadoAfip: true,
      taller: null, marca: null,
    })
    mockCrear.mockResolvedValue({ id: 'marca-1' })

    const res = await post({ rol: 'MARCA', nombre: 'Mi Marca', cuit: '20-12345678-9' })
    expect(res.status).toBe(200)
    expect(mockPadron).not.toHaveBeenCalled()
    const crearArgs = mockCrear.mock.calls[0][1]
    expect(crearArgs.verificadoAfip).toBe(true)
  })

  it('B-02: CUIT presente en User pero NO verificado → SÍ llama a ARCA', async () => {
    // Mismo gate semántico que entidades: presencia de CUIT no implica verificación.
    mockUserFind.mockResolvedValue({
      id: 'u1', roles: ['TALLER'], role: 'TALLER',
      cuit: '20123456789', verificadoAfip: false,
      taller: null, marca: null,
    })
    mockCrear.mockResolvedValue({ id: 'marca-1' })

    const res = await post({ rol: 'MARCA', nombre: 'Mi Marca', cuit: '20-12345678-9' })
    expect(res.status).toBe(200)
    expect(mockPadron).toHaveBeenCalledTimes(1)
    expect(mockPadron).toHaveBeenCalledWith('20-12345678-9')
  })

  it('D: CUIT difiere del verificado → 200 LLAMANDO a ARCA como antes', async () => {
    mockUserFind.mockResolvedValue({
      id: 'u1', roles: ['TALLER'], role: 'TALLER',
      taller: { id: 't1', cuit: '20123456789', verificadoAfip: true }, marca: null,
    })
    mockCrear.mockResolvedValue({ id: 'marca-1' })

    const res = await post({ rol: 'MARCA', nombre: 'Mi Marca', cuit: '27-99999999-3' })
    expect(res.status).toBe(200)
    expect(mockPadron).toHaveBeenCalledTimes(1)
    expect(mockPadron).toHaveBeenCalledWith('27-99999999-3')
  })

  it('rol ya poseído → 409, sin crear entidad', async () => {
    mockUserFind.mockResolvedValue({ id: 'u1', roles: ['TALLER'], role: 'TALLER', taller: { id: 't1' }, marca: null })
    const res = await post({ rol: 'TALLER', nombre: 'Otro', cuit: '20-1-9' })
    expect(res.status).toBe(409)
    expect(mockCrear).not.toHaveBeenCalled()
  })

  it('rol administrativo (ADMIN) → 400, sin tocar la DB', async () => {
    const res = await post({ rol: 'ADMIN', nombre: 'X', cuit: '20-1-9' })
    expect(res.status).toBe(400)
    expect(mockUserFind).not.toHaveBeenCalled()
  })

  it('CUIT inválido (ARCA bloquea) → 400, sin crear entidad', async () => {
    mockUserFind.mockResolvedValue({ id: 'u1', roles: [], role: 'TALLER', taller: { id: 't1' }, marca: null })
    mockPadron.mockResolvedValue({ exitosa: false, error: 'CUIT_INEXISTENTE' })
    mockBloquea.mockReturnValue(true)
    const res = await post({ rol: 'MARCA', nombre: 'Mi Marca', cuit: '99-99999999-9' })
    expect(res.status).toBe(400)
    expect(mockCrear).not.toHaveBeenCalled()
  })

  it('sin sesión → 401', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await post({ rol: 'MARCA', nombre: 'Mi Marca', cuit: '20-1-9' })
    expect(res.status).toBe(401)
    expect(mockUserFind).not.toHaveBeenCalled()
  })
})
