import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// U-03 PR2b: las dos migraciones reales (ownership + branching) gatean por
// requiereRolApi (membresía) y conservan el chequeo de ownership intacto.
// El helper lee la SESIÓN, nunca la DB cruda.

vi.mock('@/compartido/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    observacionCampo: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: { findUnique: vi.fn() },
  },
}))
vi.mock('@/compartido/lib/log', () => ({
  logAccionAdmin: vi.fn(),
}))
vi.mock('@/compartido/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ exito: true }),
  buildInvitacionRegistroEmail: vi.fn().mockReturnValue({ subject: 'S', html: 'H' }),
}))

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { sendEmail, buildInvitacionRegistroEmail } from '@/compartido/lib/email'
import {
  GET as obsGET,
  PATCH as obsPATCH,
  DELETE as obsDELETE,
} from '@/app/api/admin/observaciones/[id]/route'
import { POST as reenviarPOST } from '@/app/api/admin/onboarding/reenviar-invitacion/route'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockObsFind = prisma.observacionCampo.findUnique as ReturnType<typeof vi.fn>
const mockObsUpdate = prisma.observacionCampo.update as ReturnType<typeof vi.fn>
const mockObsDelete = prisma.observacionCampo.delete as ReturnType<typeof vi.fn>
const mockUserFind = prisma.user.findUnique as ReturnType<typeof vi.fn>
const mockSendEmail = sendEmail as ReturnType<typeof vi.fn>
const mockBuildEmail = buildInvitacionRegistroEmail as ReturnType<typeof vi.fn>

function sesion(role: string, opts: { id?: string; name?: string } = {}) {
  return {
    user: {
      id: opts.id ?? `${role.toLowerCase()}-1`,
      role,
      roles: [role],
      activeMode: role,
      name: opts.name,
    },
  }
}

const ctx = (id = 'obs-1') => ({ params: Promise.resolve({ id }) })
const obsReq = (body?: unknown) =>
  new NextRequest('http://localhost/api/admin/observaciones/obs-1', {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/admin/observaciones/[id] — gate por helper', () => {
  it('ADMIN obtiene la observacion (200)', async () => {
    mockAuth.mockResolvedValue(sesion('ADMIN'))
    mockObsFind.mockResolvedValue({ id: 'obs-1', titulo: 'X', autor: {}, user: {} })
    const res = await obsGET(obsReq() as NextRequest, ctx())
    expect(res.status).toBe(200)
  })

  it('ESTADO obtiene la observacion (200)', async () => {
    mockAuth.mockResolvedValue(sesion('ESTADO'))
    mockObsFind.mockResolvedValue({ id: 'obs-1', titulo: 'X', autor: {}, user: {} })
    const res = await obsGET(obsReq() as NextRequest, ctx())
    expect(res.status).toBe(200)
  })

  it('TALLER recibe 403 (logueado sin rol suficiente, no 401)', async () => {
    mockAuth.mockResolvedValue(sesion('TALLER'))
    const res = await obsGET(obsReq() as NextRequest, ctx())
    expect(res.status).toBe(403)
    expect(mockObsFind).not.toHaveBeenCalled()
  })

  it('sin sesion recibe 401', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await obsGET(obsReq() as NextRequest, ctx())
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/admin/observaciones/[id] — ownership intacto', () => {
  it('el autor (ESTADO, no-admin) puede editar su observacion', async () => {
    mockAuth.mockResolvedValue(sesion('ESTADO', { id: 'autor-1' }))
    mockObsFind.mockResolvedValue({ autorId: 'autor-1' }) // verificarPermisoEdicion
    mockObsUpdate.mockResolvedValue({ id: 'obs-1', titulo: 'Editado' })
    const res = await obsPATCH(obsReq({ titulo: 'Editado' }) as NextRequest, ctx())
    expect(res.status).toBe(200)
    expect(mockObsUpdate).toHaveBeenCalled()
  })

  it('un ESTADO que NO es el autor recibe 403 (ownership)', async () => {
    mockAuth.mockResolvedValue(sesion('ESTADO', { id: 'estado-2' }))
    mockObsFind.mockResolvedValue({ autorId: 'otro-autor' })
    const res = await obsPATCH(obsReq({ titulo: 'Hack' }) as NextRequest, ctx())
    expect(res.status).toBe(403)
    expect(mockObsUpdate).not.toHaveBeenCalled()
  })

  it('ADMIN puede editar la observacion de otro (bypass ownership)', async () => {
    mockAuth.mockResolvedValue(sesion('ADMIN', { id: 'admin-1' }))
    mockObsFind.mockResolvedValue({ autorId: 'otro-autor' })
    mockObsUpdate.mockResolvedValue({ id: 'obs-1', titulo: 'Mod' })
    const res = await obsPATCH(obsReq({ titulo: 'Mod' }) as NextRequest, ctx())
    expect(res.status).toBe(200)
    expect(mockObsUpdate).toHaveBeenCalled()
  })

  it('TALLER recibe 403 antes de tocar la DB', async () => {
    mockAuth.mockResolvedValue(sesion('TALLER'))
    const res = await obsPATCH(obsReq({ titulo: 'x' }) as NextRequest, ctx())
    expect(res.status).toBe(403)
    expect(mockObsFind).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/admin/observaciones/[id]', () => {
  it('el autor puede borrar su observacion', async () => {
    mockAuth.mockResolvedValue(sesion('ESTADO', { id: 'autor-1' }))
    mockObsFind.mockResolvedValue({ autorId: 'autor-1' })
    mockObsDelete.mockResolvedValue({ id: 'obs-1' })
    const res = await obsDELETE(obsReq() as NextRequest, ctx())
    expect(res.status).toBe(200)
    expect(mockObsDelete).toHaveBeenCalled()
  })

  it('TALLER recibe 403', async () => {
    mockAuth.mockResolvedValue(sesion('TALLER'))
    const res = await obsDELETE(obsReq() as NextRequest, ctx())
    expect(res.status).toBe(403)
  })
})

describe('POST /api/admin/onboarding/reenviar-invitacion — helper + auth() para name', () => {
  const req = () =>
    new NextRequest('http://localhost/api/admin/onboarding/reenviar-invitacion', {
      method: 'POST',
      body: JSON.stringify({ userId: 'dest-1' }),
    })

  it('ADMIN reenvia y usa session.user.name como referente', async () => {
    mockAuth.mockResolvedValue(sesion('ADMIN', { name: 'Coordinador OIT' }))
    mockUserFind.mockResolvedValue({ id: 'dest-1', email: 'd@x.com', name: 'Dest', active: true })
    const res = await reenviarPOST(req() as NextRequest)
    expect(res.status).toBe(200)
    expect(mockSendEmail).toHaveBeenCalled()
    // el nombre del referente proviene de la sesion (auth() aparte, opcion A)
    expect(mockBuildEmail).toHaveBeenCalledWith(
      expect.objectContaining({ nombreReferente: 'Coordinador OIT' })
    )
  })

  it('ESTADO tambien puede reenviar (200)', async () => {
    mockAuth.mockResolvedValue(sesion('ESTADO', { name: 'Tecnico' }))
    mockUserFind.mockResolvedValue({ id: 'dest-1', email: 'd@x.com', name: 'Dest', active: true })
    const res = await reenviarPOST(req() as NextRequest)
    expect(res.status).toBe(200)
  })

  it('TALLER recibe 403 sin tocar la DB', async () => {
    mockAuth.mockResolvedValue(sesion('TALLER'))
    const res = await reenviarPOST(req() as NextRequest)
    expect(res.status).toBe(403)
    expect(mockUserFind).not.toHaveBeenCalled()
  })

  it('sin sesion recibe 401', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await reenviarPOST(req() as NextRequest)
    expect(res.status).toBe(401)
  })

  it('fallback de referente a "Equipo PDT" si la sesion no tiene name', async () => {
    mockAuth.mockResolvedValue(sesion('ADMIN', {})) // sin name
    mockUserFind.mockResolvedValue({ id: 'dest-1', email: 'd@x.com', name: 'Dest', active: true })
    const res = await reenviarPOST(req() as NextRequest)
    expect(res.status).toBe(200)
    expect(mockBuildEmail).toHaveBeenCalledWith(
      expect.objectContaining({ nombreReferente: 'Equipo PDT' })
    )
  })
})
