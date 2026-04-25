# Spec: Formato de errores consistente en todas las APIs

- **Version:** V3
- **Origen:** V3_BACKLOG Q-03
- **Asignado a:** Gerardo
- **Prioridad:** Media — mejora la experiencia de debugging y abre la puerta a integraciones futuras

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG Q-02 mergeado (error boundaries — patron consistente con esta filosofia)

---

## 1. Contexto

Hoy las 22+ API routes del proyecto retornan errores en un formato **consistente pero primitivo**. El 99.3% de las respuestas de error (289 de 291 instancias auditadas) usan el mismo patron:

```typescript
// Patron A — string suelto (99.3% del codebase)
return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
```

La unica variante detectada es 1 instancia en `/api/colecciones/[id]` que usa `{ message: '...' }` pero es un success response, no un error.

**No hay** patrones con `NextResponse.json('string')` ni `NextResponse.json(null)` — esos no existen en el codebase.

Los errores de validacion Zod tampoco exponen detalles estructurados — siempre se colapsan a un solo string: `parsed.error.issues[0]?.message`.

**El problema no es la heterogeneidad sino que el formato es limitado:**

1. **Frontend no puede ramificar por tipo de error** — todo es `data.error` como string. No hay forma de distinguir "no autorizado" de "datos invalidos" sin parsear texto libre
2. **Logs dificiles de filtrar** — no hay un campo `code` para filtrar errores por tipo en Vercel Logs
3. **Errores Zod pierden informacion** — al colapsar a `issues[0]?.message` se pierde cual campo fallo y por que. El frontend no puede mostrar errores por campo
4. **Imposible correlacionar reportes con logs** — sin un digest, cuando un usuario reporta "me dio error", no hay forma de encontrar el log especifico
5. **Mensajes tecnicos al usuario** — algunos errores de Prisma o internos llegan al UI sin filtrar

**Para V3:** un unico formato de error estructurado que las APIs nuevas usen y las viejas se migren gradualmente.

---

## 2. Que construir

1. **Tipo `ApiError`** — estructura unificada de respuesta de error
2. **Helper `errorResponse()`** — wrapper para construir errores con el formato correcto
3. **Codigos de error estandar** — taxonomia para clasificar
4. **Migracion gradual** — APIs criticas de V3 usan el helper; las viejas se migran con el tiempo
5. **Cliente HTTP en el frontend** — wrapper de `fetch` que parsea errores consistentemente
6. **Documentacion** — un README en `/api` para que cualquier dev sepa el contrato

---

## 3. Formato de respuesta de error

### 3.1 — Estructura

```typescript
// src/compartido/lib/api-errors.ts
export interface ApiError {
  error: {
    code: string              // 'AUTH_REQUIRED', 'INVALID_INPUT', 'NOT_FOUND', etc.
    message: string            // mensaje user-friendly en espanol
    details?: any              // detalles estructurados (ej: errores Zod por campo)
    digest?: string            // ID unico para correlacionar con logs
  }
}
```

Ejemplo de respuesta real:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Los datos enviados no son validos",
    "details": {
      "email": ["Debe ser un email valido"],
      "cuit": ["El CUIT debe tener 11 digitos"]
    },
    "digest": "err_abc123"
  }
}
```

### 3.2 — Diferencia con el formato actual

Hoy: `{ error: "Mensaje" }` (string suelto, sin codigo, sin digest)
V3: `{ error: { code, message, details?, digest? } }` (objeto estructurado)

Es un breaking change para cualquiera que parsee la API. Por eso la migracion es **gradual** — las APIs viejas siguen como estan hasta que se actualicen.

---

## 4. Codigos de error estandar

Taxonomia minima para V3:

| Codigo | Cuando usar | Status HTTP |
|--------|-------------|-------------|
| `AUTH_REQUIRED` | No hay sesion | 401 |
| `AUTH_INVALID` | Sesion expirada o credenciales malas | 401 |
| `FORBIDDEN` | Tiene sesion pero sin permisos | 403 |
| `NOT_FOUND` | Recurso no existe | 404 |
| `INVALID_INPUT` | Validacion Zod o de negocio fallo | 400 |
| `CONFLICT` | Estado ya existe / conflicto / datos vinculados | 409 |
| `RATE_LIMITED` | Demasiadas requests | 429 |
| `EXTERNAL_SERVICE_ERROR` | Falla de servicio externo (ARCA, Voyage, etc.) | 502 |
| `INTERNAL_ERROR` | Catch-all para errores inesperados | 500 |

Las APIs pueden agregar codigos especificos del dominio (ej: `CUIT_INVALID`, `CAPACIDAD_INSUFICIENTE`) cuando agreguen valor. Son strings, no enum — flexibles.

---

## 5. Helper `errorResponse()`

Archivo nuevo: `src/compartido/lib/api-errors.ts`

Ninguno de los nombres propuestos (`errorResponse`, `errorAuthRequired`, `errorForbidden`, `errorNotFound`, `errorInvalidInput`, `errorRateLimited`, `errorInternal`, `errorExternalService`, `errorConflict`, `apiHandler`, `apiFetch`, `ApiError`) existe hoy en el codebase. El archivo `src/compartido/lib/api-errors.ts` tampoco existe. Todo se crea nuevo sin conflictos.

```typescript
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

interface ErrorOpts {
  code: string
  message: string
  status: number
  details?: any
}

export function errorResponse({ code, message, status, details }: ErrorOpts): NextResponse {
  // Generar digest corto para correlacionar logs
  const digest = `err_${randomBytes(4).toString('hex')}`

  // Loguear server-side (visible en Vercel Logs)
  console.error('[api error]', { code, message, status, digest, details })

  return NextResponse.json({
    error: {
      code,
      message,
      details,
      digest,
    }
  }, { status })
}
```

### 5.1 — Helpers especificos para casos comunes

```typescript
// src/compartido/lib/api-errors.ts (continuacion)

export function errorAuthRequired() {
  return errorResponse({
    code: 'AUTH_REQUIRED',
    message: 'Necesitas iniciar sesion',
    status: 401,
  })
}

export function errorForbidden(rolNecesario?: string) {
  return errorResponse({
    code: 'FORBIDDEN',
    message: rolNecesario
      ? `Esta accion requiere rol ${rolNecesario}`
      : 'No tenes permisos para esta accion',
    status: 403,
  })
}

export function errorNotFound(recurso = 'recurso') {
  return errorResponse({
    code: 'NOT_FOUND',
    message: `El ${recurso} no existe`,
    status: 404,
  })
}

export function errorInvalidInput(zodResult: { format(): any }) {
  return errorResponse({
    code: 'INVALID_INPUT',
    message: 'Los datos enviados no son validos',
    status: 400,
    details: zodResult.format(),
  })
}

export function errorConflict(mensaje = 'Ya existe un registro con esos datos') {
  return errorResponse({
    code: 'CONFLICT',
    message: mensaje,
    status: 409,
  })
}

export function errorRateLimited(retryAfter?: number) {
  const headers: Record<string, string> = {}
  if (retryAfter) headers['Retry-After'] = retryAfter.toString()

  const res = errorResponse({
    code: 'RATE_LIMITED',
    message: 'Demasiadas solicitudes. Intenta mas tarde.',
    status: 429,
  })

  // Aplicar headers extra
  Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v))
  return res
}

export function errorInternal(originalError?: Error) {
  // Loguear el error original con stack
  if (originalError) {
    console.error('[internal error]', originalError)
  }

  return errorResponse({
    code: 'INTERNAL_ERROR',
    message: 'Tuvimos un problema procesando tu solicitud',
    status: 500,
  })
}

export function errorExternalService(servicio: string, originalError?: Error) {
  if (originalError) {
    console.error(`[external service: ${servicio}]`, originalError)
  }

  return errorResponse({
    code: 'EXTERNAL_SERVICE_ERROR',
    message: `El servicio ${servicio} no esta disponible en este momento`,
    status: 502,
  })
}
```

---

## 6. Wrapper para handlers — manejo de excepciones

### 6.1 — Helper `apiHandler()`

Para evitar try/catch repetitivo en cada route, un wrapper. **Importante:** en Next.js 15+/16, `params` es un `Promise`. El wrapper pasa `ctx` sin modificar para que `await ctx.params` siga funcionando dentro del handler.

```typescript
// src/compartido/lib/api-errors.ts (continuacion)

import type { NextRequest } from 'next/server'

type RouteContext = { params?: Promise<Record<string, string | string[]>> }
type Handler = (req: NextRequest, ctx: RouteContext) => Promise<NextResponse>

export function apiHandler(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      // ctx se pasa sin modificar — el handler accede a params con await
      return await handler(req, ctx)
    } catch (error: any) {
      // Si ya es una NextResponse (error explicito), pasarla
      if (error instanceof NextResponse) return error

      // --- Errores de Prisma conocidos ---

      // P2002: Unique constraint violation
      // Escenarios: email/CUIT duplicado en registro, cotizacion duplicada
      // por par pedido+taller, validacion duplicada por par taller+tipo
      if (error.code === 'P2002') {
        return errorConflict('Ya existe un registro con esos datos')
      }

      // P2025: Record not found
      // Escenarios: delete de token expirado, update de registro con race condition,
      // findUniqueOrThrow sobre ID que no existe
      if (error.code === 'P2025') {
        return errorNotFound()
      }

      // P2003: Foreign key constraint failure
      // Escenarios: admin borra Marca con pedidos referenciados,
      // borra TipoDocumento con validaciones, borra Taller con ordenes
      if (error.code === 'P2003') {
        return errorResponse({
          code: 'CONFLICT',
          message: 'No se puede eliminar porque tiene datos vinculados',
          status: 409,
        })
      }

      // P2014 (required relation violation) es raro con cascades ��� V4

      // Catch-all: error 500
      return errorInternal(error)
    }
  }
}
```

### 6.2 — Codigos Prisma manejados

| Codigo Prisma | Significado | Respuesta API | Escenarios reales del schema |
|---|---|---|---|
| P2002 | Unique constraint violation | 409 CONFLICT | Email/CUIT duplicado en registro, cotizacion duplicada (pedidoId+tallerId), validacion duplicada (tallerId+tipo) |
| P2025 | Record not found | 404 NOT_FOUND | Delete de tokens expirados en password-reset, update con race conditions |
| P2003 | Foreign key constraint | 409 CONFLICT | Borrar Marca con pedidos, borrar TipoDocumento con validaciones, borrar Taller con ordenes |
| P2014 | Required relation violation | V4 | Raro con cascades — la mayoria usa onDelete: Cascade o SetNull |

**Nota:** 6 routes ya manejan P2002 inline (registro, cotizaciones, procesos, tipos-documento). Con `apiHandler`, ese handling queda centralizado.

### 6.3 — Uso

```typescript
// src/app/api/admin/usuarios/route.ts (ejemplo migrado)

import { apiHandler, errorAuthRequired, errorForbidden, errorInvalidInput } from '@/compartido/lib/api-errors'
import { auth } from '@/compartido/lib/auth'
import { z } from 'zod'

const Schema = z.object({
  email: z.string().email(),
  nombre: z.string().min(2),
})

export const POST = apiHandler(async (req) => {
  const session = await auth()

  if (!session?.user) return errorAuthRequired()
  if (session.user.role !== 'ADMIN') return errorForbidden('ADMIN')

  const body = await req.json()
  const parsed = Schema.safeParse(body)

  if (!parsed.success) return errorInvalidInput(parsed.error)

  // ... logica de creacion
  // Si tira excepcion Prisma, apiHandler la captura automaticamente

  return NextResponse.json({ success: true })
})
```

### 6.4 — Uso con params dinamicos

```typescript
// src/app/api/pedidos/[id]/route.ts (ejemplo con params)

export const GET = apiHandler(async (req, ctx) => {
  // Next.js 15+/16: params es Promise — usar await
  const { id } = await ctx.params!

  const session = await auth()
  if (!session?.user) return errorAuthRequired()

  const pedido = await prisma.pedido.findUnique({ where: { id: id as string } })
  if (!pedido) return errorNotFound('pedido')

  return NextResponse.json(pedido)
})
```

---

## 7. Cliente HTTP en el frontend

No existe ningun wrapper de fetch en el proyecto — los componentes client hacen `fetch()` directo inline. `apiFetch` se crea nuevo sin conflictos en `src/compartido/lib/api-client.ts`.

```typescript
// src/compartido/lib/api-client.ts

interface ApiResult<T> {
  ok: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
    digest?: string
    status: number
  }
}

export async function apiFetch<T = any>(
  url: string,
  opts: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...opts.headers,
      }
    })

    const json = await res.json().catch(() => null)

    if (!res.ok) {
      // Error con formato V3 nuevo
      if (json?.error?.code) {
        return {
          ok: false,
          error: {
            code: json.error.code,
            message: json.error.message,
            details: json.error.details,
            digest: json.error.digest,
            status: res.status,
          }
        }
      }

      // Error con formato viejo (string suelto — Pattern A actual)
      if (typeof json?.error === 'string') {
        return {
          ok: false,
          error: {
            code: 'LEGACY_ERROR',
            message: json.error,
            status: res.status,
          }
        }
      }

      // Sin formato reconocible
      return {
        ok: false,
        error: {
          code: 'UNKNOWN',
          message: 'Error desconocido',
          status: res.status,
        }
      }
    }

    return { ok: true, data: json }
  } catch (error: any) {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'No pudimos conectarnos al servidor',
        status: 0,
      }
    }
  }
}
```

### 7.1 — Uso desde un componente

```tsx
// Ejemplo: enviar mensaje individual (F-07)

const result = await apiFetch<{ success: boolean }>('/api/admin/mensajes-individuales', {
  method: 'POST',
  body: JSON.stringify(payload),
})

if (!result.ok) {
  // Manejar segun el codigo
  if (result.error?.code === 'RATE_LIMITED') {
    toast.error('Estas enviando demasiados mensajes. Espera un momento.')
  } else if (result.error?.code === 'INVALID_INPUT') {
    setErrores(result.error.details)
  } else {
    toast.error(result.error?.message || 'Algo salio mal')
  }
  return
}

toast.success('Mensaje enviado')
```

---

## 8. Migracion gradual

### 8.1 — Estrategia

**No reescribimos las 22+ API routes existentes en V3.** Eso seria 1-2 dias de trabajo de bajo impacto.

En su lugar:

1. **APIs nuevas de V3** usan `apiHandler` y `errorResponse` desde el dia 1
2. **APIs existentes que se modifican** se migran al pasar
3. **APIs no tocadas** quedan como estan — el cliente HTTP las maneja con `LEGACY_ERROR`
4. **V4** completa la migracion

### 8.2 — Lista de APIs nuevas en V3 (deben usar el formato)

- `POST /api/admin/mensajes-individuales` (F-07)
- `POST /api/log-error` (Q-02)
- `POST /api/n/[token]` (F-02 — magic links)
- `GET /api/estado/demanda-insatisfecha` (F-05)
- `GET /api/estado/exportar` (F-04)
- Endpoints de RAG ampliados (F-06) — `/api/admin/rag` y `/api/admin/rag/[id]` ya existen, migrar al formato

### 8.3 — Lista de APIs viejas que conviene migrar (alta prioridad)

Son las mas usadas y user-facing, donde el formato consistente da mas valor:

| Endpoint | Metodo | Razon de prioridad |
|---|---|---|
| `/api/auth/registro` | POST | Flujo critico de onboarding |
| `/api/cotizaciones` | POST | Usado por talleres en cada cotizacion |
| `/api/cotizaciones/[id]` | DELETE | Cancelacion de cotizaciones |
| `/api/pedidos` | POST | Usado por marcas para crear pedidos |
| `/api/pedidos/[id]` | PUT | Actualizacion de pedidos por marcas |
| `/api/pedidos/[id]/ordenes` | POST | Creacion de ordenes de manufactura |
| `/api/validaciones/[id]` | PUT | Aprobacion/rechazo de documentos por ESTADO |
| `/api/validaciones/[id]/upload` | POST | Subida de documentos — alta frecuencia |
| `/api/talleres/me` | GET | Perfil del taller — llamado en cada carga |
| `/api/chat` | POST | Asistente IA — user-facing |
| `/api/feedback` | POST | Reportes de usuarios |

### 8.4 — Las que pueden quedar para V4

Endpoints administrativos internos que solo el admin/dev usan:

- `/api/admin/seed`
- `/api/admin/health`
- Algunos endpoints de configuracion
- Endpoints de `/api/admin/stats`, `/api/admin/config`

---

## 9. Documentacion: README en `/api`

Archivo nuevo: `src/app/api/README.md`

```markdown
# API Endpoints — Plataforma Digital Textil

## Formato de respuesta

### Exito

\`\`\`json
{ "data": { ... } }
\`\`\`

O directamente el objeto: \`{ ... }\` (depende del endpoint)

### Error

\`\`\`json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Los datos no son validos",
    "details": { ... },
    "digest": "err_abc123"
  }
}
\`\`\`

## Codigos de error estandar

| Codigo | Status | Significado |
|--------|--------|-------------|
| AUTH_REQUIRED | 401 | No hay sesion |
| FORBIDDEN | 403 | Sin permisos |
| NOT_FOUND | 404 | No existe |
| INVALID_INPUT | 400 | Validacion fallo |
| CONFLICT | 409 | Conflicto de estado / datos vinculados |
| RATE_LIMITED | 429 | Demasiadas solicitudes |
| EXTERNAL_SERVICE_ERROR | 502 | Servicio externo caido |
| INTERNAL_ERROR | 500 | Error inesperado |

## Para agregar un nuevo endpoint

1. Importa los helpers: \`import { apiHandler, errorAuthRequired, ... } from '@/compartido/lib/api-errors'\`
2. Envolve tu handler con \`apiHandler\`
3. Usa los helpers para errores comunes
4. Para errores de dominio, podes usar \`errorResponse({ code: 'TU_CODIGO', message: '...', status: ... })\`

Ver ejemplos en \`src/app/api/admin/mensajes-individuales/route.ts\`.
```

---

## 10. Casos borde

- **API que retorna lista vacia** — `[]` no es error, status 200. Si el cliente quiere distinguir "vacio" de "error", debe parsear el body.

- **API que falla parcialmente (ej: 5 de 10 items procesados)** — el formato actual no contempla esto. Para V3 no es necesario; si aparece el caso, retornar 200 con `{ success: 5, failed: 5, errors: [...] }`.

- **Error en middleware** — el middleware (`src/middleware.ts`) maneja redirects pero no devuelve JSON. Si necesita retornar error, hacerlo con NextResponse.json explicita (no con el helper).

- **Cliente HTTP en server components** — `apiFetch` es para client components. Server components pueden hacer queries directas con Prisma. No usar `apiFetch` server-side.

- **Compatibilidad hacia atras** — el cliente HTTP debe poder parsear el formato viejo (`error: string`) durante la migracion. Lo maneja con `LEGACY_ERROR` como fallback.

- **Errores de Prisma no mapeados** — `apiHandler` mapea P2002, P2025 y P2003. Otros errores de Prisma (P2014 required relation, etc.) caen en `INTERNAL_ERROR`. Para V4 evaluar si conviene mapear mas codigos.

- **Errores de Zod muy anidados** — `parsed.error.format()` puede ser un objeto profundo. El cliente debe ser tolerante a estructuras variables.

- **Digest del error** — generado por `errorResponse`. Si el usuario reporta "tuve error con digest err_abc123", el dev puede buscar en logs de Vercel ese digest exacto.

---

## 11. Criterios de aceptacion

- [ ] Tipo `ApiError` definido en `src/compartido/lib/api-errors.ts`
- [ ] Helper `errorResponse()` implementado
- [ ] 8 helpers especificos: `errorAuthRequired`, `errorForbidden`, `errorNotFound`, `errorInvalidInput`, `errorRateLimited`, `errorInternal`, `errorExternalService`, `errorConflict`
- [ ] Wrapper `apiHandler()` con firma correcta para Next.js 15+/16 (params como Promise)
- [ ] `apiHandler` maneja Prisma P2002, P2025 y P2003
- [ ] Cliente HTTP `apiFetch()` en `src/compartido/lib/api-client.ts` con compatibilidad hacia atras
- [ ] APIs nuevas de V3 usan el helper desde el dia 1
- [ ] 11 APIs viejas criticas migradas (lista en seccion 8.3)
- [ ] README en `src/app/api/README.md` con documentacion
- [ ] Logs de error incluyen digest
- [ ] Build sin errores de TypeScript

---

## 12. Tests

| # | Que testear | Como | Verificador |
|---|-------------|------|-------------|
| 1 | `errorAuthRequired` retorna 401 con codigo correcto | Llamar sin sesion, verificar response | DEV |
| 2 | `errorInvalidInput` incluye details de Zod | Enviar payload invalido | DEV |
| 3 | `apiHandler` captura errores no manejados | Endpoint con throw, verificar 500 | DEV |
| 4 | P2002 -> 409 CONFLICT | Crear duplicado, verificar status | DEV |
| 5 | P2025 -> 404 NOT_FOUND | Update inexistente, verificar | DEV |
| 6 | P2003 -> 409 CONFLICT "datos vinculados" | Delete con FK referenciada, verificar | DEV |
| 7 | Cliente HTTP parsea formato V3 nuevo | Mock response, verificar parsing | DEV |
| 8 | Cliente HTTP parsea formato viejo (Pattern A) | Mock response legacy, verificar `LEGACY_ERROR` | DEV |
| 9 | Cliente HTTP maneja error de red | Sin conexion, verificar `NETWORK_ERROR` | DEV |
| 10 | Digest aparece en respuesta y en logs | Verificar correlacion | DEV |
| 11 | Migracion no rompe APIs viejas | Llamar API no migrada, verificar funciona | QA |
| 12 | `apiHandler` pasa ctx.params sin modificar | Endpoint con [id], verificar await params | DEV |

---

## 13. Validacion de dominio

Este spec es puramente tecnico — no aplica el Eje 6.

---

## 14. Referencias

- V3_BACKLOG -> Q-03
- Q-02 — usa el mismo patron filosofico (errores con digest, mensaje user-friendly)
- F-07 — primer endpoint nuevo que usa el formato
- Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
- `logActividad` existente: `src/compartido/lib/log.ts` — disponible si se quiere persistir errores en DB
