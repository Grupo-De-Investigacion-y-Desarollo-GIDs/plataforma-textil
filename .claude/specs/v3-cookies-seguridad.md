# Spec: Auditoría de configuración de cookies NextAuth

- **Versión:** V3
- **Origen:** V3_BACKLOG S-01
- **Asignado a:** Gerardo
- **Prioridad:** Alta — requisito de seguridad antes del piloto real con OIT

---

## ANTES DE ARRANCAR

- [ ] NextAuth v5 está instalado y funcionando
- [ ] Auth.config.ts existe y está configurado
- [ ] V3_BACKLOG I-01 mergeado (ambientes separados)

---

## 1. Contexto

> **Nota:** Los defaults de NextAuth v5 ya cumplen los criterios básicos de seguridad (`httpOnly: true`, `secure: true` en prod, `sameSite: 'lax'`, prefijos `__Secure-`/`__Host-` automáticos). Este spec es hardening (configuración explícita que protege contra cambios en futuras versiones de NextAuth) y ajuste de `maxAge` — no fix de algo roto.

Las cookies de sesión son el vector principal de ataque en una plataforma con datos sensibles como la nuestra — si alguien roba la cookie de un ADMIN o ESTADO, puede operar como ellos. Para OIT, donde el Estado aprueba formalizaciones reales de talleres, esto no puede quedar con configuración por defecto.

NextAuth v5 configura cookies con valores razonables por defecto, pero hay parámetros que deben revisarse explícitamente para producción:

- `httpOnly` — la cookie no es accesible desde JavaScript (previene XSS)
- `secure` — la cookie solo se envía por HTTPS (previene man-in-the-middle)
- `sameSite` — controla cuándo la cookie se envía en requests cross-site (previene CSRF)
- `maxAge` — cuánto dura la sesión antes de expirar
- Rotación de tokens — cuándo se genera un nuevo token de sesión

Este spec audita la configuración actual y deja documentado qué valores usa la plataforma, por qué, y cómo verificarlo.

---

## 2. Qué construir

1. **Configuración explícita en código** — no depender de defaults que pueden cambiar entre versiones
2. **Test E2E automatizado** — verificar que las cookies cumplen los criterios mínimos después de un login real
3. **Documentación en `docs/seguridad/cookies.md`** — decisiones tomadas y justificación

---

## 3. Configuración objetivo

### Cookies de sesión

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| `httpOnly` | `true` | Previene acceso desde JavaScript — protege contra XSS |
| `secure` | `true` en production, `false` en development | HTTPS obligatorio en prod, permite dev local en HTTP |
| `sameSite` | `'lax'` | Permite OAuth callbacks (Google) pero bloquea CSRF básico |
| `path` | `'/'` | Cookie disponible en toda la plataforma |
| `maxAge` | `7 * 24 * 60 * 60` (7 días) | Balance seguridad/UX con rolling — ver justificación abajo |
| `updateAge` | `24 * 60 * 60` (24 horas) | Renueva el JWT cada 24h si hay actividad |
| `domain` | No setear | Usar el dominio del request automáticamente |

### Justificación de maxAge: 7 días con rolling

OWASP Session Management Cheat Sheet recomienda: "For applications with mixed risk levels, use the shortest maxAge that doesn't significantly impact UX for the majority of users."

La plataforma tiene roles con niveles de riesgo distintos:

| Rol | Datos que maneja | Clasificación |
|-----|------------------|---------------|
| ADMIN | Todo: usuarios, validaciones, certificados, configuración | Alto |
| ESTADO | Auditorías, diagnósticos del sector | Medio-alto |
| MARCA | Pedidos, cotizaciones, datos propios | Medio |
| TALLER | Documentos propios, pedidos, formalizaciones | Medio |

NextAuth no soporta `maxAge` diferenciado por rol a nivel de cookie. Con 7 días + `updateAge: 24h`:
- **Usuarios activos** (taller que entra 3 veces por semana): la sesión se renueva automáticamente cada 24h, nunca notan expiración.
- **Usuarios inactivos** (ADMIN que se va de vacaciones): tienen que re-loguearse al volver. Correcto.
- **JWT robado**: expira en máximo 7 días sin actividad del usuario legítimo.

### CSRF protection

NextAuth v5 genera automáticamente un `csrfToken` cookie con `httpOnly: true` y `sameSite: 'lax'`. No hay que configurar nada adicional.

### Rotación de tokens

Estrategia `jwt` (default de NextAuth v5):
- El JWT se firma con `AUTH_SECRET`
- Se renueva cada 24h si hay actividad (`updateAge`)
- Expira a los 7 días sin actividad
- Si el usuario cierra sesión, el JWT queda inválido del lado servidor pero no se revoca proactivamente

**Decisión para V3:** mantener estrategia `jwt` por simplicidad. La rotación automática de tokens requeriría estrategia `database` que agrega queries en cada request. Para el piloto con 25-50 usuarios no vale el overhead.

---

## 4. Prescripciones técnicas

### 4.1 — Configuración explícita en `auth.config.ts`

**Archivo: `src/compartido/lib/auth.config.ts`** — la config de `session` y `cookies` DEBE ir acá (no en `auth.ts`) porque el proyecto tiene dos instancias de NextAuth:

- `auth.config.ts` → usado por middleware (`middleware.ts:5: const { auth } = NextAuth(authConfig)`)
- `auth.ts` → hereda de auth.config.ts via `...authConfig` y agrega adapter + providers completos

Si `session`/`cookies` van solo en `auth.ts`, el middleware usa nombres de cookie default mientras la auth principal usa nombres custom → **el middleware no reconoce la cookie y trata al usuario como no-logueado**. Ponerlo en `auth.config.ts` garantiza que ambas instancias hereden la misma configuración.

```typescript
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const isProduction = process.env.NODE_ENV === 'production'

export default {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: () => null,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,  // 7 días
    updateAge: 24 * 60 * 60,    // renueva cada 24h si hay actividad
  },
  cookies: {
    sessionToken: {
      name: isProduction
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    csrfToken: {
      name: isProduction
        ? '__Host-authjs.csrf-token'
        : 'authjs.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.id = user.id
        token.registroCompleto = (user as { registroCompleto?: boolean }).registroCompleto ?? true
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        ;(session.user as { registroCompleto: boolean }).registroCompleto =
          (token.registroCompleto as boolean) ?? true
      }
      return session
    },
  },
} satisfies NextAuthConfig
```

En `auth.ts`, **quitar** `session: { strategy: 'jwt' }` de la línea 29 — ahora viene heredado de `auth.config.ts` via `...authConfig`.

**Nota sobre el prefijo `__Secure-` y `__Host-`:** son prefijos de cookie del browser que imponen restricciones adicionales. `__Secure-` requiere que la cookie solo se setee con `secure: true`. `__Host-` además requiere `path: '/'` y no permite `domain`. Son estándar de industria para producción.

### 4.2 — Test E2E con Playwright

Archivo nuevo: `tests/e2e/cookies.spec.ts`

Playwright ya está instalado en el proyecto (`@playwright/test: ^1.59.1`). El test usa credenciales por env vars (`TEST_EMAIL`, `TEST_PASSWORD`) que se setean en `.env.local` y en el scope Preview de Vercel — nunca hardcodeadas en el repo.

```typescript
import { test, expect } from '@playwright/test'

test.describe('Seguridad de cookies de sesión', () => {
  test('cookies de sesión tienen flags de seguridad después del login', async ({ page }) => {
    const email = process.env.TEST_EMAIL
    const password = process.env.TEST_PASSWORD
    test.skip(!email || !password, 'TEST_EMAIL y TEST_PASSWORD requeridos')

    // Login con credenciales
    await page.goto('/login')
    await page.fill('[name="email"]', email!)
    await page.fill('[name="password"]', password!)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(taller|marca|admin|estado)/)

    // Inspeccionar cookies
    const cookies = await page.context().cookies()
    const session = cookies.find(c => c.name.includes('session-token'))

    expect(session).toBeDefined()
    expect(session!.httpOnly).toBe(true)
    expect(session!.sameSite).toBe('Lax')
    expect(session!.path).toBe('/')

    // secure solo es true en HTTPS (producción/preview)
    if (page.url().startsWith('https')) {
      expect(session!.secure).toBe(true)
      expect(session!.name).toContain('__Secure-')
    }
  })
})
```

Uso:
```bash
# Dev local (con seed)
TEST_EMAIL=lucia.fernandez@pdt.org.ar TEST_PASSWORD=pdt2026 npm run test:e2e -- cookies

# Preview (con env vars de Vercel)
npm run test:e2e -- cookies
```

### 4.3 — Documentación

Archivo nuevo: `docs/seguridad/cookies.md`

Contenido:
- Configuración actual con valores y justificación
- Por qué se eligió estrategia `jwt` vs `database`
- Justificación de maxAge citando OWASP
- Cómo verificar manualmente (DevTools → Application → Cookies)
- Cómo correr el test E2E
- Qué hacer si se detecta un cookie mal configurado (respuesta a incidente)

---

## 5. Casos borde

- **Usuario con sesión vieja después del cambio** — el nuevo `maxAge` (7 días vs 30 días default anterior) puede hacer que sesiones existentes expiren antes de lo esperado. Es comportamiento aceptable — el usuario se re-loguea una vez.
- **Cambio de nombre de cookie** — si los nombres explícitos difieren de los defaults que NextAuth ya usaba, las sesiones existentes se invalidan. Verificar antes de deployar: los nombres `__Secure-authjs.session-token` y `authjs.session-token` son los mismos que NextAuth v5 usa por default, así que no debería haber impacto.
- **Callback de Google OAuth en Preview** — `__Host-` no permite `domain`, Preview tiene URLs dinámicas. NextAuth v5 maneja esto correctamente porque el prefijo solo se aplica en production según `NODE_ENV`.
- **Cookie expira durante una operación crítica** — el usuario ve el error 401 del endpoint, NextAuth redirige a `/login`. La operación no se completa pero los datos no se corrompen (las mutations son atómicas).
- **AUTH_SECRET rotado por accidente** — todas las sesiones activas se invalidan. Es la respuesta correcta a una brecha de seguridad.

---

## 6. Criterios de aceptación

- [ ] Configuración explícita de `session` y `cookies` en `auth.config.ts` (no en `auth.ts`)
- [ ] `auth.ts` hereda la config via `...authConfig` sin duplicar `session`
- [ ] Prefijos `__Secure-` y `__Host-` aplicados solo en production
- [ ] `httpOnly: true` en ambas cookies (session y CSRF)
- [ ] `secure: true` solo en production
- [ ] `sameSite: 'lax'` en ambas cookies
- [ ] `maxAge: 7 días` con `updateAge: 24h`
- [ ] Test E2E `tests/e2e/cookies.spec.ts` pasa con credenciales de seed
- [ ] Documentación en `docs/seguridad/cookies.md` con justificación de cada decisión
- [ ] Build sin errores de TypeScript
- [ ] Login funciona correctamente después del cambio (tanto OAuth como credentials)

---

## 7. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | Cookie de sesión tiene HttpOnly en producción | DevTools → Application → Cookies → ver flags | DEV |
| 2 | Cookie de sesión tiene Secure en producción | DevTools → Application → Cookies → ver flags | DEV |
| 3 | Cookie de sesión tiene SameSite=Lax | DevTools → Application → Cookies → ver flags | DEV |
| 4 | Login con credenciales funciona después del cambio | Login con usuario de seed en Preview | QA |
| 5 | Login con Google OAuth funciona después del cambio | Intentar login con Google | QA |
| 6 | Sesión persiste al cerrar/abrir browser | Login, cerrar browser, abrir de nuevo, verificar que sigue logueado | QA |
| 7 | Sesión expira a los 7 días sin actividad | Verificar configuración en código (no testeable manualmente) | DEV |
| 8 | Sesión se renueva con actividad | Verificar `updateAge: 24h` en código | DEV |
| 9 | Test E2E pasa los criterios de seguridad | `TEST_EMAIL=... TEST_PASSWORD=... npm run test:e2e -- cookies` | DEV |
| 10 | Middleware y auth principal usan misma config de cookies | Verificar que `auth.config.ts` tiene la config y `auth.ts` no la duplica | DEV |

---

## 8. Referencias

- V3_BACKLOG → S-01
- NextAuth v5 docs: https://authjs.dev/reference/core#cookies
- OWASP Session Management Cheat Sheet
- Cookie prefixes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#cookie_prefixes
