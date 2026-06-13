import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { ownershipMatrix, makePrismaMock, makeSession, type Rol } from './_helpers/auth-matrix'

// ─── K-02 tanda 2 — matriz IDOR (ownership: owner vs no-owner) ────────────────
//
// Para cada endpoint cuyo 200 depende de PERTENENCIA (no solo de rol), el caso
// crítico es el "no-owner": un usuario del mismo rol que intenta leer/mutar el
// recurso de otro. SOLO tests: cero cambios de comportamiento.
//
// Convención 403/404 del proyecto (fotografiada): la mayoría de las rutas `[id]`
// devuelven 404 si el recurso no existe y 403 si existe pero no sos el dueño
// (revela existencia). `notificaciones` PUT es la excepción: 403 también para
// inexistente (no revela). Ver §5.1 de la auditoría.

const mockAuth = vi.fn()
vi.mock('@/compartido/lib/auth', () => ({ auth: () => mockAuth() }))

const mockPrisma = makePrismaMock()
vi.mock('@/compartido/lib/prisma', () => ({ prisma: mockPrisma }))

vi.mock('@/compartido/lib/log', () => ({ logActividad: vi.fn(), logAccionAdmin: vi.fn() }))
vi.mock('@/compartido/lib/nivel', () => ({ aplicarNivel: vi.fn(), invalidarCacheNivel: vi.fn() }))
vi.mock('@/compartido/lib/storage', () => ({ uploadFile: vi.fn().mockResolvedValue('https://x/up.jpg'), getSignedUrl: vi.fn().mockResolvedValue('https://x/signed') }))
vi.mock('@/compartido/lib/ratelimit', () => ({ rateLimit: vi.fn().mockResolvedValue(null) }))
vi.mock('@/compartido/lib/file-validation', () => ({
  validarArchivo: vi.fn().mockResolvedValue({ valid: true }),
  sanitizarNombreArchivo: vi.fn((n: string) => n),
}))
vi.mock('@/compartido/lib/email', () => ({
  sendEmail: vi.fn(), buildInvitacionCotizarEmail: vi.fn(() => ({})), buildCertificadoEmail: vi.fn(() => ({})),
}))
vi.mock('@/compartido/lib/notificaciones', () => ({
  notificarTalleresCompatibles: vi.fn(), notificarCotizacion: vi.fn(),
}))

const deps = { setSession: (s: { user: Record<string, unknown> } | null) => mockAuth.mockResolvedValue(s) }
const m = (modelo: string) => (mockPrisma as Record<string, Record<string, ReturnType<typeof vi.fn>>>)[modelo]

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

// ─── pedidos/[id] (dueño = marca; taller asignado también lee) ────────────────

describe('GET /api/pedidos/[id] — owner marca / ADMIN transversal', () => {
  ownershipMatrix(
    {
      importer: () => import('@/app/api/pedidos/[id]/route'),
      method: 'GET',
      url: '/api/pedidos/p1',
      params: { id: 'p1' },
      ownerRole: 'MARCA',
      ownerId: 'marca-owner',
      transversal: ['ADMIN'],
      nonOwnerStatus: 403,
      ownerSuccess: 200,
      setup: () => {
        m('pedido').findUnique.mockResolvedValue({
          id: 'p1', marca: { id: 'm1', nombre: 'M', userId: 'marca-owner' }, ordenes: [],
        })
      },
    },
    deps
  )
})

describe('PUT /api/pedidos/[id] — muta: no-owner es el IDOR clásico', () => {
  ownershipMatrix(
    {
      importer: () => import('@/app/api/pedidos/[id]/route'),
      method: 'PUT',
      url: '/api/pedidos/p1',
      params: { id: 'p1' },
      body: {}, // sin estado: cae al update final
      ownerRole: 'MARCA',
      ownerId: 'marca-owner',
      transversal: ['ADMIN'],
      nonOwnerStatus: 403,
      ownerSuccess: 200,
      setup: () => {
        m('pedido').findUnique.mockResolvedValue({ marca: { userId: 'marca-owner' } })
        m('pedido').update.mockResolvedValue({ id: 'p1' })
      },
    },
    deps
  )
})

// ─── cotizaciones/[id] PUT — ownership por acción ─────────────────────────────

describe('PUT /api/cotizaciones/[id] ACEPTAR — owner marca / ADMIN transversal', () => {
  ownershipMatrix(
    {
      importer: () => import('@/app/api/cotizaciones/[id]/route'),
      method: 'PUT',
      url: '/api/cotizaciones/cot1',
      params: { id: 'cot1' },
      body: { accion: 'ACEPTAR' },
      ownerRole: 'MARCA',
      ownerId: 'marca-owner',
      transversal: ['ADMIN'],
      nonOwnerStatus: 403,
      ownerSuccess: 'passes-ownership', // estado != ENVIADA -> 400 (pasó ownership)
      setup: () => {
        m('cotizacion').findUnique.mockResolvedValue({
          id: 'cot1', estado: 'ACEPTADA', pedidoId: 'p1', venceEn: new Date(0),
          pedido: { omId: 'OM1', marca: { userId: 'marca-owner', nombre: 'M' } },
          taller: { id: 't1', userId: 'taller-owner', nombre: 'T' },
        })
      },
    },
    deps
  )
})

describe('PUT /api/cotizaciones/[id] RETIRAR — owner taller', () => {
  ownershipMatrix(
    {
      importer: () => import('@/app/api/cotizaciones/[id]/route'),
      method: 'PUT',
      url: '/api/cotizaciones/cot1',
      params: { id: 'cot1' },
      body: { accion: 'RETIRAR' },
      ownerRole: 'TALLER',
      ownerId: 'taller-owner',
      intruderId: 'intruder-taller',
      transversal: ['ADMIN'],
      nonOwnerStatus: 403,
      ownerSuccess: 'passes-ownership',
      setup: () => {
        m('cotizacion').findUnique.mockResolvedValue({
          id: 'cot1', estado: 'ACEPTADA', pedidoId: 'p1', venceEn: new Date(0),
          pedido: { omId: 'OM1', marca: { userId: 'marca-owner', nombre: 'M' } },
          taller: { id: 't1', userId: 'taller-owner', nombre: 'T' },
        })
      },
    },
    deps
  )
})

// ─── ordenes/[id] PUT — solo taller asignado o ADMIN ──────────────────────────

describe('PUT /api/ordenes/[id] — owner taller asignado / ADMIN transversal', () => {
  ownershipMatrix(
    {
      importer: () => import('@/app/api/ordenes/[id]/route'),
      method: 'PUT',
      url: '/api/ordenes/o1',
      params: { id: 'o1' },
      body: {},
      ownerRole: 'TALLER',
      ownerId: 'taller-owner',
      intruderId: 'intruder-taller',
      transversal: ['ADMIN'],
      nonOwnerStatus: 403,
      ownerSuccess: 200,
      setup: () => {
        m('ordenManufactura').findUnique.mockResolvedValue({ id: 'o1', estado: 'PENDIENTE', pedidoId: 'p1', taller: { userId: 'taller-owner' } })
        m('ordenManufactura').update.mockResolvedValue({ id: 'o1' })
        m('ordenManufactura').findMany.mockResolvedValue([])
        m('pedido').update.mockResolvedValue({})
      },
    },
    deps
  )
})

// ─── validaciones/[id] PUT — transversal ESTADO (NO ADMIN) ────────────────────

describe('PUT /api/validaciones/[id] — owner taller / transversal SOLO ESTADO', () => {
  const setup = () => {
    m('validacion').findUnique.mockResolvedValue({ id: 'v1', estado: 'NO_INICIADO', tallerId: 't1', taller: { userId: 'taller-owner' } })
    m('validacion').update.mockResolvedValue({ id: 'v1' })
  }
  ownershipMatrix(
    {
      importer: () => import('@/app/api/validaciones/[id]/route'),
      method: 'PUT',
      url: '/api/validaciones/v1',
      params: { id: 'v1' },
      body: {},
      ownerRole: 'TALLER',
      ownerId: 'taller-owner',
      intruderId: 'intruder-taller',
      transversal: ['ESTADO'],
      nonOwnerStatus: 403,
      ownerSuccess: 200,
      setup,
    },
    deps
  )

  // FOTOGRAFÍA: a diferencia de otras rutas, ADMIN NO es transversal aquí
  // (solo ESTADO u owner). Un ADMIN que no es dueño recibe 403.
  it('ADMIN no-owner -> 403 (ADMIN no es transversal en validaciones)', async () => {
    deps.setSession(makeSession('ADMIN', 'admin-1'))
    setup()
    const { PUT } = await import('@/app/api/validaciones/[id]/route')
    const res = await PUT(
      new NextRequest(new URL('/api/validaciones/v1', 'http://localhost'), { method: 'PUT', body: '{}', headers: { 'content-type': 'application/json' } }),
      { params: Promise.resolve({ id: 'v1' }) } as never
    )
    expect(res.status).toBe(403)
  })
})

// ─── validaciones/[id]/signed-url GET — transversal ADMIN + ESTADO ────────────

describe('GET /api/validaciones/[id]/signed-url — owner / ADMIN / ESTADO', () => {
  ownershipMatrix(
    {
      importer: () => import('@/app/api/validaciones/[id]/signed-url/route'),
      method: 'GET',
      url: '/api/validaciones/v1/signed-url',
      params: { id: 'v1' },
      ownerRole: 'TALLER',
      ownerId: 'taller-owner',
      intruderId: 'intruder-taller',
      transversal: ['ADMIN', 'ESTADO'],
      nonOwnerStatus: 403,
      ownerSuccess: 200,
      setup: () => {
        m('validacion').findUnique.mockResolvedValue({ id: 'v1', documentoUrl: 'https://x/doc.pdf', taller: { userId: 'taller-owner' } })
      },
    },
    deps
  )
})

// ─── validaciones/[id]/upload POST — owner ONLY (ni ADMIN ni ESTADO) ──────────

describe('POST /api/validaciones/[id]/upload — solo owner (no transversal)', () => {
  ownershipMatrix(
    {
      importer: () => import('@/app/api/validaciones/[id]/upload/route'),
      method: 'POST',
      url: '/api/validaciones/v1/upload',
      params: { id: 'v1' },
      body: {}, // sin file -> el owner pasa ownership y luego falla por archivo (no es 401/403)
      ownerRole: 'TALLER',
      ownerId: 'taller-owner',
      intruderId: 'intruder-taller',
      transversal: [],
      nonOwnerStatus: 403,
      ownerSuccess: 'passes-ownership',
      setup: () => {
        m('validacion').findUnique.mockResolvedValue({ id: 'v1', estado: 'NO_INICIADO', tallerId: 't1', taller: { userId: 'taller-owner' } })
      },
    },
    deps
  )
})

// ─── pedidos/[id]/invitaciones POST — owner marca / ADMIN transversal ─────────

describe('POST /api/pedidos/[id]/invitaciones — owner marca / ADMIN', () => {
  ownershipMatrix(
    {
      importer: () => import('@/app/api/pedidos/[id]/invitaciones/route'),
      method: 'POST',
      url: '/api/pedidos/p1/invitaciones',
      params: { id: 'p1' },
      body: { tallerIds: ['t1'] },
      ownerRole: 'MARCA',
      ownerId: 'marca-owner',
      transversal: ['ADMIN'],
      nonOwnerStatus: 403,
      ownerSuccess: 'passes-ownership', // estado PUBLICADO != BORRADOR -> 400 (pasó ownership)
      setup: () => {
        m('pedido').findUnique.mockResolvedValue({ id: 'p1', estado: 'PUBLICADO', tipoPrenda: 'X', cantidad: 1, marca: { userId: 'marca-owner', nombre: 'M' } })
      },
    },
    deps
  )
})

// ─── notificaciones PUT — IDOR de notificación; convención 403-para-inexistente

describe('PUT /api/notificaciones — owner / no-owner (403 incluso si no existe)', () => {
  const setup = () => {
    m('notificacion').findUnique.mockResolvedValue({ userId: 'notif-owner' })
    m('notificacion').update.mockResolvedValue({ id: 'n1', leida: true })
  }
  ownershipMatrix(
    {
      importer: () => import('@/app/api/notificaciones/route'),
      method: 'PUT',
      url: '/api/notificaciones',
      body: { id: 'n1' },
      ownerRole: 'TALLER',
      ownerId: 'notif-owner',
      intruderId: 'intruder-1',
      transversal: [], // ni ADMIN: cualquiera solo toca sus propias notificaciones
      nonOwnerStatus: 403,
      ownerSuccess: 200,
      setup,
    },
    deps
  )

  // FOTOGRAFÍA de convención: notificación inexistente -> 403 (no revela existencia),
  // a diferencia de pedidos/cotizaciones/validaciones que dan 404.
  it('notificación inexistente -> 403 (no 404: no revela existencia)', async () => {
    deps.setSession(makeSession('TALLER', 'cualquiera'))
    m('notificacion').findUnique.mockResolvedValue(null)
    const { PUT } = await import('@/app/api/notificaciones/route')
    const res = await PUT(
      new NextRequest(new URL('/api/notificaciones', 'http://localhost'), { method: 'PUT', body: JSON.stringify({ id: 'no-existe' }), headers: { 'content-type': 'application/json' } })
    )
    expect(res.status).toBe(403)
  })
})

// ─── upload/imagenes — LA excepción de la auditoría (§6.3): contexto cotizacion
//     no ata entityId al caller. Tests bespoke (formData) que FOTOGRAFÍAN el gap.

describe('POST /api/upload/imagenes — ownership por contexto', () => {
  function uploadReq(contexto: string, entityId: string) {
    const fd = new FormData()
    fd.append('file', new File([new Uint8Array([0xff, 0xd8, 0xff])], 'x.jpg', { type: 'image/jpeg' }))
    fd.append('contexto', contexto)
    fd.append('entityId', entityId)
    return new NextRequest(new URL('/api/upload/imagenes', 'http://localhost'), { method: 'POST', body: fd })
  }
  async function post(req: NextRequest) {
    const { POST } = await import('@/app/api/upload/imagenes/route')
    return POST(req)
  }

  it('anónimo -> 401', async () => {
    deps.setSession(null)
    expect((await post(uploadReq('portfolio', 'taller-x'))).status).toBe(401)
  })

  it('portfolio: entityId NO propio -> 403 (patrón seguro, ata entityId al caller)', async () => {
    deps.setSession(makeSession('TALLER', 'attacker'))
    m('taller').findFirst.mockResolvedValue(null) // no hay taller {id:entityId, userId:attacker}
    const res = await post(uploadReq('portfolio', 'victim-taller'))
    expect(res.status).toBe(403)
  })

  it('portfolio: entityId propio -> 200 (dueño legítimo)', async () => {
    deps.setSession(makeSession('TALLER', 'owner'))
    m('taller').findFirst.mockResolvedValue({ id: 'mi-taller', userId: 'owner' })
    const res = await post(uploadReq('portfolio', 'mi-taller'))
    expect(res.status).toBe(200)
  })

  // C5 CERRADO (fix elegibilidad): el contexto 'cotizacion' usa entityId como
  // pedidoId y gatea por ELEGIBILIDAD para cotizar ese pedido (elegibilidadCotizar,
  // misma fuente que POST /api/cotizaciones). entityId = pedido al que el taller
  // NO es elegible -> 403 (antes 200, era el IDOR). El caso positivo verifica que
  // el flujo legítimo (taller elegible) sigue subiendo imágenes.
  it('cotizacion: pedido NO elegible (ajeno/no-publicado) -> 403 [C5 cerrado]', async () => {
    deps.setSession(makeSession('TALLER', 'attacker'))
    m('taller').findFirst.mockResolvedValue({ id: 'attacker-taller' }) // posee SU taller
    m('pedido').findUnique.mockResolvedValue(null) // pedido no resuelve -> no elegible
    const res = await post(uploadReq('cotizacion', 'pedido-ajeno'))
    expect(res.status).toBe(403)
  })

  it('cotizacion: taller ELEGIBLE para el pedido -> 200 (flujo legítimo intacto)', async () => {
    deps.setSession(makeSession('TALLER', 'taller-user'))
    m('taller').findFirst.mockResolvedValue({ id: 'mi-taller' })
    m('pedido').findUnique.mockResolvedValue({
      id: 'p1', estado: 'PUBLICADO', visibilidad: 'PUBLICO',
      marca: { userId: 'otra-marca', nombre: 'M' }, omId: 'OM1', tipoPrenda: 'X', cantidad: 1, marcaId: 'mi1',
    })
    const res = await post(uploadReq('cotizacion', 'p1'))
    expect(res.status).toBe(200)
  })
})
