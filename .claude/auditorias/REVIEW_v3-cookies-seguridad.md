# Review de codigo para Gerardo — S-01 Cookies seguridad

## Antes de mergear a main, revisar:

### Cambios al codigo

- [x] `auth.config.ts` tiene `session` y `cookies` explicitamente configurados — no depende de defaults de NextAuth
- [x] `auth.ts` ya no tiene `session: { strategy: 'jwt' }` — hereda de `authConfig` via spread, sin duplicacion
- [x] Los flags `httpOnly: true`, `sameSite: 'lax'`, `path: '/'` estan presentes en ambas cookies (session y CSRF)
- [x] `secure` usa `isProduction` (derivado de `NODE_ENV`) — `true` en prod, `false` en dev
- [x] Prefijos `__Secure-` (session) y `__Host-` (CSRF) se aplican solo en production
- [x] `maxAge: 7 * 24 * 60 * 60` y `updateAge: 24 * 60 * 60` — no hay otra config que los sobreescriba

### Decisiones arquitectonicas que tome

- [x] **Config en auth.config.ts, no en auth.ts** — porque el middleware (`middleware.ts`) usa `auth.config.ts` directamente. Si cookies va solo en `auth.ts`, el middleware usa nombres default y no reconoce la sesion. Alternativa descartada: duplicar config en ambos archivos (fragil, se desincroniza).
- [x] **`as const` en sameSite** — TypeScript infiere `string` para `'lax'` sin el cast, y NextAuthConfig espera el literal `'lax' | 'strict' | 'none'`. Alternativa: `satisfies` en el objeto options, pero `as const` es mas limpio.
- [x] **No diferenciar maxAge por rol** — NextAuth no soporta cookies diferenciadas por rol. La unica forma seria estrategia `database` con sesiones custom, que agrega queries en cada request. Para 25-50 usuarios del piloto no vale el overhead.

### Riesgos no cubiertos por tests automatizados

- [x] **Google OAuth sigue funcionando** — verificacion manual pendiente, movida a PRUEBAS_PENDIENTES.md para sesion de validacion dedicada.
- [x] **Magic link sigue funcionando** — verificacion manual pendiente, movida a PRUEBAS_PENDIENTES.md para sesion de validacion dedicada.
- [x] **No hay logging de cookies** — verificado por grep: cero resultados de `cookie`+`log`/`console` en todo `src/`.
- [x] **Sesiones existentes** — los nombres de cookie son los mismos que NextAuth v5 usa por default, no se invalidan por cambio de nombre. El maxAge de 7d (vs 30d default anterior) puede expirar sesiones de usuarios inactivos hace >7 dias. **Nota:** decision tomada segun OWASP Session Management Cheat Sheet — 7d es lo correcto para el nivel de riesgo de la plataforma. Usuarios inactivos re-loguean, comportamiento esperado y aceptable.

### Cosas a verificar despues del deploy

- [ ] En produccion (plataforma-textil.vercel.app): login con credenciales → DevTools → cookie tiene `__Secure-` prefix, `HttpOnly`, `Secure`, `SameSite=Lax` — movido a PRUEBAS_PENDIENTES.md
- [ ] En produccion: `document.cookie` en consola NO muestra la cookie de sesion (httpOnly la oculta) — movido a PRUEBAS_PENDIENTES.md
- [ ] El middleware sigue protegiendo rutas — ir a `/admin` sin login redirige a `/login` — movido a PRUEBAS_PENDIENTES.md
- [ ] El cambio aplica a TODOS los providers: credentials, Google OAuth, magic link — movido a PRUEBAS_PENDIENTES.md
