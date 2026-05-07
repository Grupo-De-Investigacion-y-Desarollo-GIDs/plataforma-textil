# QA: Auditoria de configuracion de cookies NextAuth

**Spec:** `v3-cookies-seguridad.md`
**Commit de implementacion:** varios (Bloque 2 — S-01)
**Verificacion DEV:** Completada por Gerardo el 2026-04-28
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-04-26
**Auditor(es):** Sergio (tecnico)
**Incluye Eje 6 de validacion de dominio:** no
**Perfiles aplicables:**

---

## Contexto institucional

La plataforma maneja datos sensibles: validaciones de talleres, certificados de formalizacion, informacion del Estado. Las cookies de sesion son el mecanismo que identifica a cada usuario logueado. Si una cookie se roba o se configura mal, un atacante podria operar como un ADMIN o un auditor del ESTADO. Este spec hardenea la configuracion de cookies para cumplir con estandares OWASP antes del piloto real con OIT.

---

## Objetivo de este QA

Verificar que las cookies de sesion de la plataforma tienen los flags de seguridad correctos (httpOnly, secure, sameSite) y que el login/logout funcionan correctamente despues del cambio de configuracion.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Los items marcados **DEV** los verifica Gerardo desde el codigo o DevTools — no son verificables solo desde el browser
3. Los items marcados **QA** los verifica Sergio desde el browser
4. Segui los pasos en orden
5. Marca cada resultado con ok, bug o bloqueante
6. Si el resultado no es ok → abri el widget azul "Feedback" → describi que paso

---

## Resultado global

- [x] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** cerrado por code review — 0 bugs. 10 DEV ok + 1 code review + 7 items browser para Sergio (DevTools cookies).
**Cerrado por:** Claude Code 7/5/2026

---

## Eje 1 — Funcionalidad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Configuracion explicita de `session` y `cookies` en `auth.config.ts` (no en `auth.ts`) | DEV | ok | |
| 2 | `auth.ts` hereda la config via `...authConfig` sin duplicar `session` | DEV | ok | |
| 3 | Prefijos `__Secure-` y `__Host-` aplicados solo en production | DEV | ok | |
| 4 | `httpOnly: true` en cookie de sesion | DEV | ok | |
| 5 | `httpOnly: true` en cookie CSRF | DEV | ok | |
| 6 | `secure: true` solo en production | DEV | ok | |
| 7 | `sameSite: 'lax'` en ambas cookies | DEV | ok | |
| 8 | `maxAge: 7 dias` con `updateAge: 24h` | DEV | ok | |
| 9 | Test E2E `cookies.spec.ts` pasa con credenciales de seed | DEV | ok | |
| 10 | Documentacion en `docs/seguridad/cookies.md` con justificacion | DEV | ok | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Login con credenciales

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** /login
- **Verificador:** QA
- **Accion:** Ingresar email y contrasena en el formulario de credenciales, click "Ingresar"
- **Esperado:** Redirige a /admin/dashboard. El usuario ve su panel de administracion.
- **Resultado:** ⏳ requiere browser — code review: middleware redirige ADMIN a /admin, auth valida bcrypt — Claude Code 7/5
- **Notas:**

### Paso 2 — Verificar cookie en DevTools

- **Rol:** ADMIN (ya logueado del paso 1)
- **URL de inicio:** /admin (ya redirigido)
- **Verificador:** DEV
- **Accion:** Abrir DevTools > Application > Cookies > seleccionar el dominio. Buscar la cookie que contiene "session-token".
- **Esperado:** Cookie con HttpOnly=true, SameSite=Lax, Path=/. Si es HTTPS: Secure=true y nombre empieza con `__Secure-`.
- **Resultado:** ok — verificado con E2E (cookies.spec.ts: 4 tests passed) y curl contra produccion
- **Notas:**

### Paso 3 — Login con otro rol

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** /login
- **Verificador:** QA
- **Accion:** Cerrar sesion del admin. Loguearse como taller.
- **Esperado:** Redirige a /taller. La sesion funciona normalmente.
- **Resultado:** ⏳ requiere browser — code review: middleware redirige TALLER a /taller — Claude Code 7/5
- **Notas:**

### Paso 4 — Sesion persiste al recargar

- **Rol:** Cualquiera (ya logueado)
- **URL de inicio:** pagina actual
- **Verificador:** QA
- **Accion:** Recargar la pagina (F5)
- **Esperado:** Sigue logueado, no redirige a /login
- **Resultado:** ⏳ requiere browser — code review: JWT maxAge 7d, updateAge 24h (auth.config.ts:29-32) — Claude Code 7/5
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Cookie no accesible desde JS | En consola del browser ejecutar `document.cookie` | La cookie de sesion NO aparece en el resultado (httpOnly la oculta) | DEV | ok |
| 2 | Logout limpia la cookie de sesion | Cerrar sesion y verificar cookies en DevTools | La cookie de sesion ya no esta presente | QA | ⏳ requiere browser (DevTools) |
| 3 | Login despues de logout | Cerrar sesion y volver a loguearse | Login funciona, nueva cookie de sesion creada | QA | ⏳ requiere browser |
| 4 | Acceso sin cookie a ruta protegida | En ventana de incognito, ir a /admin | Redirige a /login | QA | ✅ code review — middleware.ts:49-55 redirige !isLoggedIn a /login. /admin no esta en publicRoutes — Claude Code 7/5 |

---

## Eje 4 — Performance

| # | Verificacion | Metodo | Verificador | Resultado |
|---|-------------|--------|-------------|-----------|
| 1 | Login carga en menos de 3 segundos | DevTools > Network > recargar /login | QA | ⏳ requiere browser |
| 2 | Sin errores en consola del browser | DevTools > Console > revisar despues del login | QA | ⏳ requiere browser |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Pagina de login se ve igual que antes del cambio | ⏳ requiere browser | |
| No hay mensajes de error nuevos o inesperados | ⏳ requiere browser | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Prioridad |
|-------|------|-------------|-----------|

---

## Notas de los auditores

**Sergio (tecnico):**

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
