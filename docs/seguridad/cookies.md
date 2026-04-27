# Configuracion de cookies de sesion — PDT

**Spec:** v3-cookies-seguridad.md (S-01)
**Fecha:** 2026-04-26
**Autor:** Gerardo

---

## Configuracion actual

| Parametro | Valor | Justificacion |
|-----------|-------|---------------|
| `httpOnly` | `true` | Cookie no accesible desde JavaScript — protege contra XSS |
| `secure` | `true` en production, `false` en development | HTTPS obligatorio en prod |
| `sameSite` | `lax` | Permite OAuth callbacks, bloquea CSRF basico |
| `path` | `/` | Cookie disponible en toda la plataforma |
| `maxAge` | 7 dias (604800s) | Balance seguridad/UX con rolling |
| `updateAge` | 24 horas (86400s) | Renueva JWT cada 24h si hay actividad |

### Prefijos de cookie

- **Production:** `__Secure-authjs.session-token` y `__Host-authjs.csrf-token`
- **Development:** `authjs.session-token` y `authjs.csrf-token`

Los prefijos `__Secure-` y `__Host-` son estandar de browsers que imponen restricciones adicionales:
- `__Secure-` requiere `secure: true`
- `__Host-` requiere `secure: true`, `path: '/'`, y no permite `domain`

---

## Estrategia de sesion

Se usa **JWT** (no database sessions). Razones:

1. No agrega queries a la DB en cada request
2. Para el piloto con 25-50 usuarios no necesitamos revocacion activa de sesiones
3. La rotacion automatica de tokens con `updateAge: 24h` renueva el JWT periodicamente

### Limitaciones de JWT

- No se puede revocar un token individual sin rotar `AUTH_SECRET`
- Si se roba un JWT, es valido hasta que expire (max 7 dias sin actividad)
- `maxAge` no se puede diferenciar por rol (ADMIN vs TALLER)

---

## Justificacion de maxAge: 7 dias

Referencia: OWASP Session Management Cheat Sheet — "use the shortest maxAge that doesn't significantly impact UX for the majority of users."

| Escenario | Comportamiento |
|-----------|---------------|
| Usuario activo (entra 3x/semana) | Sesion se renueva automaticamente cada 24h, nunca nota expiracion |
| Usuario inactivo (vacaciones) | Re-login al volver. Correcto. |
| JWT robado | Expira en max 7 dias sin actividad del usuario legitimo |

---

## Donde esta la configuracion

- **`src/compartido/lib/auth.config.ts`** — config de `session` y `cookies` (compartida entre middleware y auth principal)
- **`src/compartido/lib/auth.ts`** — hereda via `...authConfig`, NO duplica `session`

La config DEBE estar en `auth.config.ts` porque el middleware la usa directamente. Si va solo en `auth.ts`, el middleware usa defaults y no reconoce la cookie.

---

## Verificacion manual

1. Ir a https://plataforma-textil.vercel.app/login
2. Loguearse con cualquier cuenta
3. Abrir DevTools > Application > Cookies
4. Verificar la cookie `__Secure-authjs.session-token`:
   - HttpOnly: si (no aparece en `document.cookie`)
   - Secure: si
   - SameSite: Lax
   - Path: /
   - Expires: ~7 dias desde el login

---

## Como correr el test E2E

```bash
# Dev local (usa credenciales de seed)
npx playwright test tests/e2e/cookies.spec.ts

# CI (usa env vars TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD)
npx playwright test tests/e2e/cookies.spec.ts
```

---

## Respuesta a incidentes

### Cookie sin httpOnly detectada
1. Verificar que `auth.config.ts` no fue modificado
2. Verificar version de NextAuth — un upgrade puede cambiar defaults
3. Deployar fix inmediato

### Sospecha de robo de cookie/JWT
1. Rotar `AUTH_SECRET` en Vercel (invalida TODAS las sesiones activas)
2. Notificar a los usuarios que deben re-loguearse
3. Investigar el vector de ataque

### AUTH_SECRET rotado por accidente
- Todas las sesiones se invalidan. Los usuarios deben re-loguearse.
- No hay perdida de datos — solo sesiones.
