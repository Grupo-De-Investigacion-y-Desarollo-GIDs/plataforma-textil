# Spec: Rate limiting en APIs críticas

- **Versión:** V3
- **Origen:** V3_BACKLOG S-02
- **Asignado a:** Gerardo
- **Prioridad:** Alta — antes de exponer a usuarios reales en el piloto con OIT

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG I-01 mergeado (ambientes separados)
- [ ] Acceso a Vercel para configurar variables de entorno

---

## 1. Contexto

Hoy ningún endpoint de la API tiene límite de requests. Un actor malicioso puede:

- Hacer **brute force de login** contra `/api/auth/callback/credentials` probando passwords
- **Spammear cotizaciones** creando cientos por segundo desde `/api/cotizaciones`
- **Flood de denuncias anónimas** en `/api/denuncias` sin captcha ni límite
- **Enumerar CUITs** llamando repetidamente a `/api/auth/verificar-cuit` — además consume requests del plan AfipSDK
- **DDoS barato** contra cualquier endpoint que haga queries pesadas

Para el piloto con OIT esto es inaceptable — no podemos exponer una plataforma que validará formalizaciones reales sin protección básica contra abuso.

Este spec agrega rate limiting granular por endpoint crítico, con respuestas claras al usuario legítimo y bloqueo silencioso al abusador.

---

## 2. Qué construir

1. **Helper de rate limiting reutilizable** — función que se aplica por endpoint
2. **Storage de contadores** — Upstash Redis (free tier cubre el piloto)
3. **Aplicación por endpoint crítico** — con límites diferenciados según sensibilidad
4. **Respuestas HTTP 429 con Retry-After** — estándar de industria
5. **Logs de intentos bloqueados** — para que el admin vea ataques en `/admin/logs`
6. **Exención para usuarios logueados trusted** — ADMIN y ESTADO no tienen límite (o lo tienen muy alto)

---

## 3. Límites por endpoint

| Endpoint | Límite | Ventana | Identificador | Razón |
|----------|--------|---------|---------------|-------|
| `POST /api/auth/callback/credentials` | 5 intentos | 15 min | IP | Brute force de login |
| `POST /api/auth/verificar-cuit` | 10 requests | 1 min | IP | Enumeración + consumo plan AFIP |
| `POST /api/cotizaciones` | 20 requests | 1 hora | `session.user.id` | Spam de cotizaciones |
| `POST /api/pedidos` | 10 requests | 1 hora | `session.user.id` | Spam de pedidos |
| `POST /api/denuncias` | 3 requests | 1 hora | IP | Spam de denuncias anónimas |
| `POST /api/feedback` | 10 requests | 15 min | IP | Spam de issues (widget QA) |
| `POST /api/validaciones/[id]/upload` | 20 requests | 1 hora | `session.user.id` | Spam de uploads |
| `POST /api/auth/registro` | 5 requests | 1 hora | IP | Spam de cuentas |
| `POST /api/chat` (RAG) | 30 requests | 1 hora | `session.user.id` | Consumo de LLM |
| `POST /api/admin/mensajes-individuales` | 50 requests | 1 hora | `session.user.id` | Spam de mensajes individuales (F-07) |

**Nota sobre login:** El identificador es solo IP (no IP+email) porque el endpoint `/api/auth/callback/credentials` es manejado internamente por NextAuth. Leer el body del POST para extraer el email consumiría el stream y NextAuth no podría re-leerlo para procesar el login. IP solo es suficiente para brute force protection en un piloto de 25-50 usuarios.

**Endpoints sin rate limiting (intencional):**
- GETs públicos (directorio, perfiles) — se cachean en CDN
- `/api/notificaciones` — queries de lectura del usuario propio
- Endpoints internos del admin — ya requieren rol ADMIN/ESTADO, **excepto** `/api/admin/mensajes-individuales` que tiene rate limit explícito (50/hora) por riesgo de spam (F-07 §9.2)

---

## 4. Stack técnico

### Storage: Upstash Redis

**Por qué Upstash:**
- Serverless-compatible (Vercel Functions no pueden mantener conexiones)
- Free tier: 10,000 comandos/día — suficiente para el piloto
- Integración directa con Vercel (env vars automáticas)
- Latencia <10ms desde `gru1` (São Paulo)

**Alternativas consideradas y descartadas:**
- `@vercel/kv` — deprecado, Vercel recomienda Upstash directo
- In-memory (Map) — no funciona en serverless (cada función es stateless)
- PostgreSQL (Supabase) — demasiado lento para rate limiting (agrega latencia al path crítico)

### Librería: `@upstash/ratelimit`

Maneja sliding window, tokens, fixed window automáticamente. ~200 líneas de código wrapper.

---

## 5. Prescripciones técnicas

### 5.1 — Setup de Upstash

1. Crear cuenta en upstash.com (gmail)
2. Create Database → nombre `plataforma-textil-ratelimit`
3. Región: `sa-east-1` (misma que Supabase)
4. Copiar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
5. Agregar en Vercel como env vars scope "All Environments"

### 5.2 — Instalar dependencias

```bash
npm install @upstash/ratelimit @upstash/redis
```

### 5.3 — Helper reutilizable

Archivo nuevo: `src/compartido/lib/ratelimit.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { logActividad } from './log'

const redis = Redis.fromEnv()

// Prefijo por ambiente para que dev y prod no compartan contadores
const env = process.env.VERCEL_ENV ?? 'development'

// analytics: false — ahorra 33% de comandos Redis (3→2 por call).
// Los bloqueos ya se registran con logActividad en la DB,
// que es más útil que las métricas genéricas del dashboard de Upstash.
const limiters = {
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: false,
    prefix: `rl:${env}:login`,
  }),
  verificarCuit: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: false,
    prefix: `rl:${env}:cuit`,
  }),
  cotizaciones: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    analytics: false,
    prefix: `rl:${env}:cot`,
  }),
  pedidos: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: false,
    prefix: `rl:${env}:ped`,
  }),
  denuncias: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: false,
    prefix: `rl:${env}:den`,
  }),
  feedback: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '15 m'),
    analytics: false,
    prefix: `rl:${env}:fb`,
  }),
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    analytics: false,
    prefix: `rl:${env}:upl`,
  }),
  registro: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: false,
    prefix: `rl:${env}:reg`,
  }),
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 h'),
    analytics: false,
    prefix: `rl:${env}:chat`,
  }),
  // Excepción: endpoint admin con rate limit por riesgo de spam (F-07 §9.2)
  mensajesIndividuales: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    analytics: false,
    prefix: `rl:${env}:msg`,
  }),
} as const

type LimiterKey = keyof typeof limiters

/**
 * Obtiene la IP del cliente. Prioriza x-real-ip (seteado por Vercel edge,
 * un solo valor confiable) sobre x-forwarded-for (puede contener cadena
 * de proxies: "client, proxy1, proxy2").
 */
export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-real-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? '127.0.0.1'
}

/**
 * Aplica rate limiting a una request.
 * Retorna NextResponse con 429 si se excede el límite, null si pasa.
 *
 * Si Redis está caído, falla abierto (permite la request) para no
 * romper la plataforma — loguea el error pero no bloquea al usuario.
 */
export async function rateLimit(
  req: NextRequest,
  limiterKey: LimiterKey,
  identifier: string
): Promise<NextResponse | null> {
  try {
    const limiter = limiters[limiterKey]
    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    if (!success) {
      // Log del intento bloqueado (fire-and-forget via logActividad)
      logActividad('RATE_LIMIT_EXCEEDED', null, {
        endpoint: limiterKey,
        identifier,
        limit,
        resetAt: new Date(reset).toISOString(),
      })

      // Post-Q-03 mergeado: migrar esta response al formato estándar usando
      // errorRateLimited(retryAfter) de @/compartido/lib/api-errors
      // que retorna { error: { code: 'RATE_LIMITED', message, digest } }
      return NextResponse.json(
        {
          error: 'Demasiadas solicitudes',
          message: `Espera ${Math.ceil((reset - Date.now()) / 1000)} segundos antes de intentar de nuevo.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
          },
        }
      )
    }

    return null
  } catch (error) {
    // Redis caído → fail open (permitir la request)
    console.error('Rate limit error (failing open):', error)
    return null
  }
}
```

### 5.4 — Rate limiting en login (NextAuth)

El endpoint `POST /api/auth/callback/credentials` es manejado internamente por NextAuth a través del catch-all `[...nextauth]/route.ts`. No es un endpoint propio — no podemos agregar rate limiting adentro del handler.

**Solución:** Wrappear el POST en el catch-all para interceptar antes de que NextAuth procese:

Archivo: `src/app/api/auth/[...nextauth]/route.ts` (modificar existente)

```typescript
import { handlers } from '@/compartido/lib/auth'
import { NextRequest } from 'next/server'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'

// GET no cambia — NextAuth lo maneja como siempre
export const GET = handlers.GET

// POST wrapeado para rate limiting en login
export async function POST(req: NextRequest) {
  if (req.nextUrl.pathname === '/api/auth/callback/credentials') {
    const ip = getClientIp(req)
    const blocked = await rateLimit(req, 'login', ip)
    if (blocked) return blocked
  }
  return handlers.POST(req)
}
```

**Por qué solo IP y no IP+email:** Leer el body del POST (`await req.json()`) consume el stream. Cuando NextAuth intenta leer el body después, falla porque el stream ya fue consumido. Se podría clonar el request con `req.clone()`, pero agrega complejidad innecesaria para el piloto. IP solo es suficiente para brute force protection con 25-50 usuarios.

### 5.5 — Aplicar en endpoints propios

Ejemplo en `src/app/api/cotizaciones/route.ts`:

```typescript
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'
import { auth } from '@/compartido/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Rate limiting (excepto ADMIN/ESTADO)
  if (session.user.role !== 'ADMIN' && session.user.role !== 'ESTADO') {
    const rateLimitResponse = await rateLimit(
      req,
      'cotizaciones',
      session.user.id
    )
    if (rateLimitResponse) return rateLimitResponse
  }

  // ... resto del handler existente
}
```

**Patrón:** siempre primero auth, después rate limit, después handler. El orden es importante — no queremos contar intentos de usuarios autenticados como si fueran anónimos.

Para endpoints públicos (denuncias, feedback, registro, verificar-cuit), usar `getClientIp(req)` como identificador:

```typescript
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const blocked = await rateLimit(req, 'denuncias', ip)
  if (blocked) return blocked

  // ... resto del handler existente
}
```

### 5.6 — Exención para ADMIN y ESTADO

Como se ve en el ejemplo de 5.5, estos roles no tienen rate limit. Son usuarios de confianza dentro de la plataforma.

**Excepción:** `/api/auth/callback/credentials` siempre tiene rate limit — incluso si el login exitoso es de un ADMIN, los intentos fallidos previos pueden ser de un atacante.

### 5.7 — Respuestas al usuario

**Para usuario legítimo que accidentalmente pasa el límite:**
- HTTP 429 con body claro: "Demasiadas solicitudes. Esperá X segundos."
- Header `Retry-After` para que el cliente pueda auto-retry
- El frontend muestra el mensaje con countdown

**Para atacante:**
- Mismo HTTP 429 — no revelar info adicional
- El log queda en `/admin/logs` con IP y endpoint para que el admin investigue

---

## 6. Casos borde

- **Múltiples usuarios detrás del mismo NAT** — varias personas con la misma IP pública. El límite por IP en `/api/auth/verificar-cuit` puede bloquear a usuarios legítimos de una oficina compartida. Mitigación: el límite de 10 req/min es generoso para uso humano normal.

- **Upstash Redis caído** — el helper falla abierto (permite la request) para no romper la plataforma. Loguea el error pero no bloquea al usuario. Implementado con try/catch en `rateLimit()`.

- **Clock skew entre servidor y Redis** — Upstash usa tiempo server-side, no hay desfase.

- **ADMIN que programa scripts contra su propia API** — la exención de ADMIN lo cubre. Si en el futuro se necesita límite para ADMIN también, agregar flag por endpoint.

- **Cold start de la función serverless** — la primera request puede ser lenta por la conexión a Redis. Upstash usa REST (HTTP), no TCP, así que cold start es mínimo (<50ms adicionales).

- **Rate limit acumulado entre ambientes** — dev y prod usan prefijos diferentes en Redis (`rl:development:*` vs `rl:production:*` vs `rl:preview:*`), separados por `VERCEL_ENV` que Vercel setea automáticamente. No se pisan contadores.

---

## 7. Criterios de aceptación

- [ ] Upstash Redis creado y variables de entorno configuradas en Vercel
- [ ] `@upstash/ratelimit` y `@upstash/redis` instalados
- [ ] Helper `rateLimit()` y `getClientIp()` creados en `src/compartido/lib/ratelimit.ts`
- [ ] `getClientIp()` prioriza `x-real-ip` sobre `x-forwarded-for`
- [ ] 9 endpoints con rate limiting aplicado según tabla de sección 3
- [ ] Login rate limited via wrapper en `[...nextauth]/route.ts`
- [ ] ADMIN y ESTADO exentos (excepto login)
- [ ] Respuestas 429 con header `Retry-After`
- [ ] Intentos bloqueados logueados con `logActividad()` (import desde `./log`)
- [ ] Dev y prod usan prefijos diferentes en Redis via `VERCEL_ENV`
- [ ] `analytics: false` en todos los limiters
- [ ] Fallback: si Redis está caído, la request pasa (no bloquear usuario)
- [ ] Build sin errores de TypeScript

---

## 8. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | Login pasa en intento 1-5 | Playwright: 5 logins seguidos con credenciales correctas | DEV |
| 2 | Login falla con 429 en intento 6 | Playwright: 6 logins fallidos rápidos, verificar 429 | DEV |
| 3 | Mensaje 429 es claro y en español | Verificar body del 429 en Network tab | QA |
| 4 | Header Retry-After presente | DevTools → Network → headers del 429 | DEV |
| 5 | Rate limit de cotizaciones se aplica | Script que manda 25 cotizaciones, verificar que las últimas 5 dan 429 | DEV |
| 6 | ADMIN no tiene rate limit en cotizaciones | Loguear como ADMIN, crear 25 cotizaciones, todas deben pasar | DEV |
| 7 | Logs de rate limit aparecen en /admin/logs | Después del test 2, verificar logs en admin | QA |
| 8 | Redis caído no rompe la plataforma | Simular con URL de Redis inválida, verificar que requests pasan | DEV |
| 9 | Dev y prod no comparten contadores | Abusar en Preview, verificar que prod no queda afectado | DEV |
| 10 | `x-real-ip` se usa como fuente primaria de IP | Verificar en logs que la IP logueada es la del cliente, no del proxy | DEV |

---

## 9. Costos estimados

**Upstash free tier:** 10,000 comandos/día.

Estimación para piloto con `analytics: false` (2 comandos por `.limit()`):
- 25 talleres × 10 acciones/día × 2 comandos = 500 cmd/día
- Margen 20x para picos y crecimiento
- Con `analytics: true` serían 750 cmd/día (3 cmd × 250 acciones) — ahorro de 33%

**Conclusión:** free tier alcanza. Si el piloto escala a >100 usuarios activos, evaluar plan pago ($10/mes por 100k cmd/día).

---

## 10. Referencias

- V3_BACKLOG → S-02
- OWASP Top 10 — A07: Identification and Authentication Failures
- Upstash Ratelimit docs: https://github.com/upstash/ratelimit
- RFC 6585 — HTTP 429 Too Many Requests
