import { it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

// ─── K-02 — Test pattern reutilizable de auth (matriz 401/403/200) ────────────
//
// Codifica la matriz §5 de la auditoria K-01
// (.claude/specs/v4-k-01-auditoria-endpoints.md): para cada endpoint protegido,
// que rol debe recibir 401 (anonimo), 403 (logueado sin el rol) y 200 (rol
// correcto). El helper FOTOGRAFIA y VIGILA el comportamiento; NO lo corrige.
//
// Mockea al nivel de `auth()` (no de `requiereRolApi`) para ejercitar la logica
// real de gating del proyecto: requiereRolApi -> tieneAlgunRol -> rolesEfectivos.
// Asi un cambio que rompa la membresia hace fallar estos tests.

export const ALL_ROLES = ['TALLER', 'MARCA', 'ESTADO', 'ADMIN', 'CONTENIDO'] as const
export type Rol = (typeof ALL_ROLES)[number]

/**
 * Sesion minima para un rol. `tieneAlgunRol` usa `rolesEfectivos`, que cae a
 * `[activeMode ?? role]` cuando no hay `roles[]` — por eso basta con `role`.
 */
export function makeSession(role: Rol, id = `${role.toLowerCase()}-1`, extra: Record<string, unknown> = {}) {
  return { user: { id, role, ...extra } }
}

/**
 * Mock de Prisma auto-vivificante: cualquier `prisma.<modelo>.<metodo>()` existe
 * y resuelve a un valor neutro por defecto. Cada caso 200 sobreescribe lo que
 * necesite via `setup`. Un default vacio (findMany -> [], count -> 0) alcanza
 * para que la mayoria de los GET lleguen a 200 sin armar fixtures pesados.
 */
export function makePrismaMock() {
  const cache = new Map<string, Record<string, ReturnType<typeof vi.fn>>>()
  const makeModel = () => ({
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    count: vi.fn().mockResolvedValue(0),
    groupBy: vi.fn().mockResolvedValue([]),
    aggregate: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    upsert: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    createMany: vi.fn().mockResolvedValue({ count: 0 }),
  })
  const proxy: Record<string, unknown> = new Proxy(
    {},
    {
      get(_t, prop: string) {
        if (prop === '$transaction') {
          return vi.fn(async (arg: unknown) =>
            Array.isArray(arg) ? Promise.all(arg) : (arg as (tx: unknown) => unknown)(proxy)
          )
        }
        if (prop === '$executeRaw' || prop === '$queryRaw' || prop === '$executeRawUnsafe' || prop === '$queryRawUnsafe') {
          return vi.fn().mockResolvedValue([])
        }
        if (typeof prop !== 'string') return undefined
        if (!cache.has(prop)) cache.set(prop, makeModel())
        return cache.get(prop)
      },
    }
  )
  return proxy
}

export type SuccessMode = 'exact' | 'passes-auth'

export interface AuthMatrixSpec {
  /** Importer con literal estatico, p.ej. `() => import('@/app/api/admin/stats/route')`. */
  importer: () => Promise<Record<string, unknown>>
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  params?: Record<string, string>
  body?: unknown
  /** Roles que deben pasar el gate (200/2xx). */
  allow: Rol[]
  /** Roles que deben recibir 403. Por defecto: todos los que no estan en `allow`. */
  deny?: Rol[]
  /** Status de exito esperado (200 por defecto; 201 en algunos POST). */
  successStatus?: number
  /**
   * 'exact' (default): el rol permitido recibe `successStatus`.
   * 'passes-auth': solo verifica que NO es 401/403 (para handlers con deps
   * pesadas donde montar el 200 exacto agrega ruido sin valor de seguridad).
   */
  successMode?: SuccessMode
  /** Configura mocks por caso. `role` es null en el caso anonimo. */
  setup?: (role: Rol | null) => void
  /** Substrings que NO deben aparecer en el body de 401/403 (anti-leak de PII). */
  noLeak?: string[]
}

interface HelperDeps {
  setSession: (role: Rol | null) => void
}

function buildRequest(spec: AuthMatrixSpec): NextRequest {
  const init: { method: string; body?: string; headers?: Record<string, string> } = { method: spec.method }
  if (spec.body !== undefined) {
    init.body = JSON.stringify(spec.body)
    init.headers = { 'content-type': 'application/json' }
  }
  return new NextRequest(new URL(spec.url, 'http://localhost'), init)
}

async function invoke(spec: AuthMatrixSpec): Promise<Response> {
  const mod = await spec.importer()
  const handler = mod[spec.method] as (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>
  return handler(buildRequest(spec), { params: Promise.resolve(spec.params ?? {}) })
}

async function assertNoLeak(res: Response, noLeak?: string[]) {
  if (!noLeak?.length) return
  const text = JSON.stringify(await res.clone().json().catch(() => ({})))
  for (const secret of noLeak) {
    expect(text).not.toContain(secret)
  }
}

/**
 * Genera, para un endpoint, los casos de la matriz:
 *   anonimo -> 401  |  cada rol en `deny` -> 403  |  cada rol en `allow` -> 2xx
 * Debe llamarse DENTRO de un `describe(...)`.
 */
export function authMatrix(spec: AuthMatrixSpec, deps: HelperDeps) {
  const deny = spec.deny ?? ALL_ROLES.filter((r) => !spec.allow.includes(r))
  const successStatus = spec.successStatus ?? 200
  const mode: SuccessMode = spec.successMode ?? 'exact'

  it('anonimo -> 401', async () => {
    deps.setSession(null)
    spec.setup?.(null)
    const res = await invoke(spec)
    expect(res.status).toBe(401)
    await assertNoLeak(res, spec.noLeak)
  })

  for (const role of deny) {
    it(`${role} sin permiso -> 403`, async () => {
      deps.setSession(role)
      spec.setup?.(role)
      const res = await invoke(spec)
      expect(res.status).toBe(403)
      await assertNoLeak(res, spec.noLeak)
    })
  }

  for (const role of spec.allow) {
    const labelExito = mode === 'exact' ? `${role} -> ${successStatus}` : `${role} pasa el gate (no 401/403)`
    it(labelExito, async () => {
      deps.setSession(role)
      spec.setup?.(role)
      const res = await invoke(spec)
      if (mode === 'exact') {
        expect(res.status).toBe(successStatus)
      } else {
        expect(res.status).not.toBe(401)
        expect(res.status).not.toBe(403)
      }
    })
  }
}

/**
 * Endpoint publico: el anonimo NO debe recibir 401 (la auditoria §5 lista los
 * que deben quedar abiertos). Verifica que el gate no se agrego por error.
 */
export function publicMatrix(
  spec: Pick<AuthMatrixSpec, 'importer' | 'method' | 'url' | 'params' | 'body' | 'successStatus' | 'setup'>,
  deps: HelperDeps
) {
  const successStatus = spec.successStatus ?? 200
  it('anonimo -> 200 (sin auth, es publico)', async () => {
    deps.setSession(null)
    spec.setup?.(null)
    const res = await invoke(spec as AuthMatrixSpec)
    expect(res.status).toBe(successStatus)
  })
}

// ─── K-02 tanda 2 — matriz IDOR (ownership: owner vs no-owner) ────────────────
//
// El recurso es el MISMO en todos los casos; lo que cambia es la IDENTIDAD de
// la sesion. El caso CRITICO es el "no-owner" (mismo rol, otra identidad): si
// muta/lee el recurso ajeno, es IDOR. `ownershipMatrix` necesita inyectar
// sesiones con id explicito (owner-1 vs intruder-1), por eso su `deps` recibe
// `setSession(sessionObject | null)` (firma distinta a la de authMatrix).

export type OwnerSuccess = number | 'passes-ownership'

export interface OwnershipSpec {
  importer: () => Promise<Record<string, unknown>>
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  params?: Record<string, string>
  body?: unknown
  /** Rol del dueño legitimo del recurso. */
  ownerRole: Rol
  /** Id de usuario que figura como dueño en el recurso mockeado. */
  ownerId: string
  /** Rol del intruso (default = ownerRole: mismo rol, otra identidad). */
  intruderRole?: Rol
  /** Id del intruso (distinto de ownerId). */
  intruderId?: string
  /** Roles con acceso transversal legitimo (ADMIN/ESTADO segun el endpoint). */
  transversal?: Rol[]
  /** Status esperado para el intruso: 403 (revela existencia) o 404 (no la revela). */
  nonOwnerStatus: 403 | 404
  /** Exito del dueño: status exacto, o 'passes-ownership' (no 401/403) si el 200 exige fixtures pesados. */
  ownerSuccess: OwnerSuccess
  /** Monta el recurso en el proxy de prisma (mismo recurso para todos los casos). */
  setup?: () => void
}

interface OwnershipDeps {
  setSession: (session: { user: Record<string, unknown> } | null) => void
}

/**
 * Genera la matriz IDOR de un endpoint:
 *   anonimo -> 401
 *   owner (rol correcto, su recurso) -> ownerSuccess
 *   no-owner (mismo rol, otra identidad) -> nonOwnerStatus   ← el caso IDOR
 *   transversal (ADMIN/ESTADO) -> NO 403
 * Debe llamarse dentro de un `describe(...)`.
 */
export function ownershipMatrix(spec: OwnershipSpec, deps: OwnershipDeps) {
  const intruderRole = spec.intruderRole ?? spec.ownerRole
  const intruderId = spec.intruderId ?? 'intruder-1'
  const transversal = spec.transversal ?? []

  it('anonimo -> 401', async () => {
    deps.setSession(null)
    spec.setup?.()
    const res = await invoke(spec as AuthMatrixSpec)
    expect(res.status).toBe(401)
  })

  it(`owner (${spec.ownerRole}, su recurso) -> ${spec.ownerSuccess}`, async () => {
    deps.setSession(makeSession(spec.ownerRole, spec.ownerId))
    spec.setup?.()
    const res = await invoke(spec as AuthMatrixSpec)
    if (typeof spec.ownerSuccess === 'number') {
      expect(res.status).toBe(spec.ownerSuccess)
    } else {
      expect(res.status).not.toBe(401)
      expect(res.status).not.toBe(403)
    }
  })

  it(`no-owner (${intruderRole}, recurso ajeno) -> ${spec.nonOwnerStatus} [IDOR]`, async () => {
    deps.setSession(makeSession(intruderRole, intruderId))
    spec.setup?.()
    const res = await invoke(spec as AuthMatrixSpec)
    expect(res.status).toBe(spec.nonOwnerStatus)
  })

  for (const role of transversal) {
    it(`${role} transversal -> no 403`, async () => {
      deps.setSession(makeSession(role, `${role.toLowerCase()}-x`))
      spec.setup?.()
      const res = await invoke(spec as AuthMatrixSpec)
      expect(res.status).not.toBe(401)
      expect(res.status).not.toBe(403)
    })
  }
}
