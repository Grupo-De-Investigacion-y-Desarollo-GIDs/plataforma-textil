# Review de codigo para Gerardo — S-01 Cookies seguridad

## Antes de mergear a main, revisar:

### Cambios al codigo

- [ ] `auth.config.ts` tiene `session` y `cookies` explicitamente configurados — no depende de defaults de NextAuth
- [ ] `auth.ts` ya no tiene `session: { strategy: 'jwt' }` — hereda de `authConfig` via spread, sin duplicacion
- [ ] Los flags `httpOnly: true`, `sameSite: 'lax'`, `path: '/'` estan presentes en ambas cookies (session y CSRF)
- [ ] `secure` usa `isProduction` (derivado de `NODE_ENV`) — `true` en prod, `false` en dev
- [ ] Prefijos `__Secure-` (session) y `__Host-` (CSRF) se aplican solo en production
- [ ] `maxAge: 7 * 24 * 60 * 60` y `updateAge: 24 * 60 * 60` — no hay otra config que los sobreescriba

### Decisiones arquitectonicas que tome

- [ ] **Config en auth.config.ts, no en auth.ts** — porque el middleware (`middleware.ts`) usa `auth.config.ts` directamente. Si cookies va solo en `auth.ts`, el middleware usa nombres default y no reconoce la sesion. Alternativa descartada: duplicar config en ambos archivos (fragil, se desincroniza).
- [ ] **`as const` en sameSite** — TypeScript infiere `string` para `'lax'` sin el cast, y NextAuthConfig espera el literal `'lax' | 'strict' | 'none'`. Alternativa: `satisfies` en el objeto options, pero `as const` es mas limpio.
- [ ] **No diferenciar maxAge por rol** — NextAuth no soporta cookies diferenciadas por rol. La unica forma seria estrategia `database` con sesiones custom, que agrega queries en cada request. Para 25-50 usuarios del piloto no vale el overhead.

### Riesgos no cubiertos por tests automatizados

- [ ] **Google OAuth sigue funcionando** — el test E2E solo prueba login con credenciales. Verificar manualmente que Google OAuth funciona (si hay credenciales configuradas en preview). El cambio de cookie names no deberia afectarlo, pero los callbacks OAuth son sensibles a `sameSite`.
- [ ] **Magic link sigue funcionando** — el provider EmailProvider usa cookies internas de NextAuth para el flujo. Verificar que el segundo form de la pagina de login (enviar link) no se rompio.
- [ ] **No hay logging de cookies** — verificar que ningun `console.log`, `logActividad`, o middleware imprime el valor de la cookie de sesion. Buscar en el codigo: `session-token` en contextos de logging.
- [ ] **Sesiones existentes** — el cambio de maxAge (de 30 dias default a 7 dias) puede expirar sesiones activas. Esto es aceptable pero hay que saberlo.

### Cosas a verificar despues del deploy

- [ ] En produccion (plataforma-textil.vercel.app): login con credenciales → DevTools → cookie tiene `__Secure-` prefix, `HttpOnly`, `Secure`, `SameSite=Lax`
- [ ] En produccion: `document.cookie` en consola NO muestra la cookie de sesion (httpOnly la oculta)
- [ ] El middleware sigue protegiendo rutas — ir a `/admin` sin login redirige a `/login`
- [ ] El cambio aplica a TODOS los providers: credentials, Google OAuth, magic link — todos usan la misma cookie config porque comparten `auth.config.ts`
