import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Consentimiento legal en el registro: el checkbox de T&C / privacidad era solo
// client-side y no se persistía (hallazgo de auditoría). Estos tests verifican el
// gate SERVER-SIDE: sin `aceptaTerminos === true` el POST se rechaza (400), y con
// aceptación se persiste versión + timestamp en user.create.

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    taller: { findUnique: vi.fn() },
    tipoDocumento: { findMany: vi.fn().mockResolvedValue([]) },
    validacion: { createMany: vi.fn() },
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

import { prisma } from '@/compartido/lib/prisma'
import { consultarPadron } from '@/compartido/lib/arca'
import { TERMINOS_VERSION } from '@/compartido/lib/legal'
import { POST as registroPOST } from '@/app/api/auth/registro/route'

const mockUserFind = prisma.user.findUnique as ReturnType<typeof vi.fn>
const mockUserCreate = prisma.user.create as ReturnType<typeof vi.fn>
const mockTallerFind = prisma.taller.findUnique as ReturnType<typeof vi.fn>
const mockPadron = consultarPadron as ReturnType<typeof vi.fn>

const reqRegistro = (body: unknown) =>
  registroPOST(
    new NextRequest('http://localhost/api/auth/registro', { method: 'POST', body: JSON.stringify(body) }) as NextRequest,
    {} as never,
  )

const baseMarca = {
  email: 'm@x.com',
  password: 'password123',
  role: 'MARCA' as const,
  marcaData: { nombre: 'Mi Marca', cuit: '27-99999999-1' },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockPadron.mockResolvedValue({ exitosa: true, datos: { nombre: 'X' } })
  mockUserFind.mockResolvedValue(null)
  mockTallerFind.mockResolvedValue(null)
  mockUserCreate.mockResolvedValue({ id: 'u1', email: 'm@x.com', name: null, role: 'MARCA' })
})

describe('Consentimiento legal — POST /api/auth/registro', () => {
  it('rechaza con 400 si falta aceptaTerminos', async () => {
    const res = await reqRegistro(baseMarca)
    expect(res.status).toBe(400)
    expect(mockUserCreate).not.toHaveBeenCalled()
  })

  it('rechaza con 400 si aceptaTerminos es false', async () => {
    const res = await reqRegistro({ ...baseMarca, aceptaTerminos: false })
    expect(res.status).toBe(400)
    expect(mockUserCreate).not.toHaveBeenCalled()
  })

  it('acepta con aceptaTerminos:true y persiste version + timestamp', async () => {
    const res = await reqRegistro({ ...baseMarca, aceptaTerminos: true })
    expect(res.status).toBe(201)
    const arg = mockUserCreate.mock.calls[0][0]
    expect(arg.data.terminosAceptadosVersion).toBe(TERMINOS_VERSION)
    expect(arg.data.terminosAceptadosEn).toBeInstanceOf(Date)
  })
})
