import { describe, beforeEach, vi } from 'vitest'
import {
  authMatrix,
  publicMatrix,
  makePrismaMock,
  makeSession,
  type Rol,
} from './_helpers/auth-matrix'

// ─── K-02 — Matriz de auth sistematica (401/403/200) ─────────────────────────
//
// Codifica la matriz §5 de la auditoria K-01 sobre endpoints reales del
// proyecto. SOLO tests: ningun cambio de comportamiento. Cada describe = un
// endpoint; el helper genera anonimo->401, rol-sin-permiso->403, rol-ok->2xx.
//
// Mockea `auth()` (no `requiereRolApi`) para ejercitar el gating real
// (requiereRolApi -> tieneAlgunRol -> rolesEfectivos). Prisma y las libs con
// efectos (log, nivel, demanda) se mockean para que el camino 200 no pegue a DB.

const mockAuth = vi.fn()
vi.mock('@/compartido/lib/auth', () => ({ auth: () => mockAuth() }))

const mockPrisma = makePrismaMock()
vi.mock('@/compartido/lib/prisma', () => ({ prisma: mockPrisma }))

// Libs con efectos colaterales (escriben a DB / cache) — neutralizadas.
vi.mock('@/compartido/lib/log', () => ({ logActividad: vi.fn(), logAccionAdmin: vi.fn() }))
vi.mock('@/compartido/lib/nivel', () => ({ invalidarCacheNivel: vi.fn(), aplicarNivel: vi.fn() }))
vi.mock('@/compartido/lib/demanda-insatisfecha', () => ({
  calcularStatsAgregadas: vi.fn().mockResolvedValue({}),
  generarRecomendaciones: vi.fn().mockResolvedValue([]),
}))
// Libs importadas a nivel de modulo por la ruta de evaluacion (no se ejercitan
// en el camino de auth, pero se mockean para evitar dependencias de entorno).
vi.mock('@/compartido/lib/email', () => ({ sendEmail: vi.fn(), buildCertificadoEmail: vi.fn(() => ({})) }))
vi.mock('@/compartido/lib/qr', () => ({ generateQrBuffer: vi.fn() }))
vi.mock('@/compartido/lib/storage', () => ({ uploadFile: vi.fn() }))

function setSession(role: Rol | null) {
  mockAuth.mockResolvedValue(role ? makeSession(role) : null)
}
const deps = { setSession }

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

// Helpers de modelo del proxy (tipado laxo: es un mock auto-vivificante).
const m = (modelo: string) => (mockPrisma as Record<string, Record<string, ReturnType<typeof vi.fn>>>)[modelo]

const PII = 'leak@pii.test'

// ─── Admin (ADMIN, algunos +ESTADO / +CONTENIDO) ─────────────────────────────

describe('GET /api/admin/stats — solo ADMIN', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/admin/stats/route'),
      method: 'GET',
      url: '/api/admin/stats',
      allow: ['ADMIN'],
    },
    deps
  )
})

describe('GET /api/admin/usuarios — solo ADMIN (PII: email/phone)', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/admin/usuarios/route'),
      method: 'GET',
      url: '/api/admin/usuarios',
      allow: ['ADMIN'],
      noLeak: [PII],
      setup: () => {
        m('user').findMany.mockResolvedValue([{ id: 'u1', email: PII, name: 'X', role: 'TALLER', phone: '123' }])
        m('user').count.mockResolvedValue(1)
      },
    },
    deps
  )
})

describe('GET /api/admin/usuarios-buscar — ADMIN/ESTADO (PII)', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/admin/usuarios-buscar/route'),
      method: 'GET',
      url: '/api/admin/usuarios-buscar', // sin q -> {usuarios:[]} con 200
      allow: ['ADMIN', 'ESTADO'],
      noLeak: [PII],
    },
    deps
  )
})

describe('GET /api/admin/whatsapp — ADMIN/ESTADO (PII: phone)', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/admin/whatsapp/route'),
      method: 'GET',
      url: '/api/admin/whatsapp',
      allow: ['ADMIN', 'ESTADO'],
    },
    deps
  )
})

describe('GET /api/admin/rag — ADMIN/CONTENIDO', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/admin/rag/route'),
      method: 'GET',
      url: '/api/admin/rag',
      allow: ['ADMIN', 'CONTENIDO'],
    },
    deps
  )
})

describe('GET /api/admin/config — solo ADMIN', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/admin/config/route'),
      method: 'GET',
      url: '/api/admin/config',
      allow: ['ADMIN'],
    },
    deps
  )
})

// ─── Marcas / Talleres (listados con PII) ────────────────────────────────────

describe('GET /api/marcas — solo ADMIN (PII de marcas)', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/marcas/route'),
      method: 'GET',
      url: '/api/marcas',
      allow: ['ADMIN'],
      noLeak: [PII],
      setup: () => {
        m('marca').findMany.mockResolvedValue([{ id: 'm1', nombre: 'M', user: { email: PII, name: 'D', phone: '1', active: true } }])
        m('marca').count.mockResolvedValue(1)
      },
    },
    deps
  )
})

describe('GET /api/talleres — ADMIN/ESTADO/MARCA (directorio)', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/talleres/route'),
      method: 'GET',
      url: '/api/talleres',
      allow: ['ADMIN', 'ESTADO', 'MARCA'],
      setup: () => {
        m('taller').findMany.mockResolvedValue([])
        m('taller').count.mockResolvedValue(0)
      },
    },
    deps
  )
})

// ─── Validaciones ────────────────────────────────────────────────────────────

describe('GET /api/validaciones — ADMIN/ESTADO', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/validaciones/route'),
      method: 'GET',
      url: '/api/validaciones',
      allow: ['ADMIN', 'ESTADO'],
    },
    deps
  )
})

describe('POST /api/validaciones — solo ADMIN (crea, 201)', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/validaciones/route'),
      method: 'POST',
      url: '/api/validaciones',
      body: { tallerId: 't1', tipo: 'HABILITACION', tipoDocumentoId: 'td1', estado: 'PENDIENTE' },
      allow: ['ADMIN'],
      successStatus: 201,
      setup: () => {
        m('validacion').create.mockResolvedValue({ id: 'val1' })
      },
    },
    deps
  )
})

// ─── Contenido / academia ────────────────────────────────────────────────────

// K-05: el GET (list) se elimino por codigo muerto. El gate (requiereRolApi
// CONTENIDO/ADMIN) sigue vivo en el POST, que ejercemos aca con el mismo allow-list.
describe('POST /api/contenido/novedades — CONTENIDO/ADMIN', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/contenido/novedades/route'),
      method: 'POST',
      url: '/api/contenido/novedades',
      body: { titulo: 'T', descripcion: 'D', tipo: 'NOTICIA' },
      allow: ['CONTENIDO', 'ADMIN'],
      successMode: 'passes-auth',
    },
    deps
  )
})

describe('GET /api/colecciones/[id]/evaluacion — ADMIN/CONTENIDO (answer-key)', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/colecciones/[id]/evaluacion/route'),
      method: 'GET',
      url: '/api/colecciones/c1/evaluacion',
      params: { id: 'c1' },
      allow: ['ADMIN', 'CONTENIDO'],
      noLeak: ['correcta'],
    },
    deps
  )
})

describe('POST /api/colecciones/[id]/evaluacion — solo TALLER (rinde la evaluacion)', () => {
  // El 200 real depende de tener taller + certificado + email; aca solo
  // verificamos el gate: TALLER pasa, el resto recibe 403, anonimo 401.
  authMatrix(
    {
      importer: () => import('@/app/api/colecciones/[id]/evaluacion/route'),
      method: 'POST',
      url: '/api/colecciones/c1/evaluacion',
      params: { id: 'c1' },
      body: { respuestas: [] },
      allow: ['TALLER'],
      successMode: 'passes-auth',
    },
    deps
  )
})

// K-05: el GET (list) se elimino por codigo muerto. El gate (requiereRolApi
// ADMIN/ESTADO) sigue vivo en el POST, que ejercemos aca con el mismo allow-list.
describe('POST /api/auditorias — ADMIN/ESTADO', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/auditorias/route'),
      method: 'POST',
      url: '/api/auditorias',
      body: { tallerId: 't1' },
      allow: ['ADMIN', 'ESTADO'],
      successMode: 'passes-auth',
    },
    deps
  )
})

// ─── Estado ──────────────────────────────────────────────────────────────────

describe('GET /api/estado/configuracion-niveles — ESTADO/ADMIN', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/estado/configuracion-niveles/route'),
      method: 'GET',
      url: '/api/estado/configuracion-niveles',
      allow: ['ESTADO', 'ADMIN'],
    },
    deps
  )
})

describe('PUT /api/estado/configuracion-niveles/[id] — solo ESTADO', () => {
  // INCONSISTENCIA DOCUMENTADA (auditoria §5 ⚠): a diferencia del resto de
  // /api/estado/*, este PUT excluye ADMIN (requiereRolApi(['ESTADO'])). El test
  // FOTOGRAFIA el comportamiento real (ADMIN -> 403) en vez de corregirlo.
  // Si la decision de negocio es incluir ADMIN, cambiar el endpoint y este test
  // juntos. Ref: .claude/specs/v4-k-01-auditoria-endpoints.md §5 / §8.3(b).
  authMatrix(
    {
      importer: () => import('@/app/api/estado/configuracion-niveles/[id]/route'),
      method: 'PUT',
      url: '/api/estado/configuracion-niveles/r1',
      params: { id: 'r1' },
      body: { descripcion: 'editada' },
      allow: ['ESTADO'], // ADMIN cae en deny -> 403 (comportamiento real)
      setup: () => {
        m('reglaNivel').findUnique.mockResolvedValue({
          id: 'r1', nivel: 'PLATA', puntosMinimos: 10, requiereVerificadoAfip: false,
          certificadosAcademiaMin: 0, descripcion: 'd', beneficios: [],
        })
        m('reglaNivel').update.mockResolvedValue({ id: 'r1' })
      },
    },
    deps
  )
})

describe('GET /api/estado/demanda-insatisfecha — ESTADO/ADMIN', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/estado/demanda-insatisfecha/route'),
      method: 'GET',
      url: '/api/estado/demanda-insatisfecha',
      allow: ['ESTADO', 'ADMIN'],
    },
    deps
  )
})

// ─── Exportacion (C4: PII masiva — aca cubrimos su auth-gate) ─────────────────

describe('GET /api/exportar — ADMIN/ESTADO (CSV con PII)', () => {
  authMatrix(
    {
      importer: () => import('@/app/api/exportar/route'),
      method: 'GET',
      url: '/api/exportar?tipo=talleres',
      allow: ['ADMIN', 'ESTADO'],
      noLeak: [PII],
      setup: () => {
        m('taller').findMany.mockResolvedValue([]) // CSV vacio -> 200 sin armar fixture pesado
      },
    },
    deps
  )
})

// ─── Publicos (la auditoria §5 exige que NO pidan auth) ──────────────────────

describe('GET /api/stats/public — publico', () => {
  publicMatrix(
    {
      importer: () => import('@/app/api/stats/public/route'),
      method: 'GET',
      url: '/api/stats/public',
    },
    deps
  )
})

describe('GET /api/health/version — publico', () => {
  publicMatrix(
    {
      importer: () => import('@/app/api/health/version/route'),
      method: 'GET',
      url: '/api/health/version',
    },
    deps
  )
})
