# Review de codigo para Gerardo — S-02 Rate limiting

## Antes de mergear a main, revisar:

### Cambios al codigo

- [x] `ratelimit.ts` tiene 10 limiters con prefijos separados por `VERCEL_ENV`
- [x] `getClientIp()` prioriza `x-real-ip` (Vercel edge, confiable) sobre `x-forwarded-for` (cadena de proxies)
- [x] Si `UPSTASH_REDIS_REST_URL` no esta configurado, `limiters` es null y `rateLimit()` retorna null (fail-open)
- [x] Try/catch en `rateLimit()` — si Redis esta caido, `console.error` + retorna null (fail-open)
- [x] `analytics: false` en todos los limiters — ahorra 33% de comandos Redis
- [x] `[...nextauth]/route.ts` wrappea POST para dos paths: `/api/auth/callback/credentials` (login, 5/15min) y `/api/auth/signin/email` (magic links, 5/hora). Todo lo demas (CSRF, signout, Google callback, session) pasa directo sin rate limit.
- [x] Endpoints autenticados (cotizaciones, pedidos, chat, upload) aplican rate limit DESPUES de auth y exentan ADMIN/ESTADO
- [x] Endpoints publicos (denuncias, feedback, registro, verificar-cuit) aplican rate limit ANTES de cualquier logica, identificados por IP
- [x] Respuesta 429 tiene body en español ("Demasiadas solicitudes") y headers `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- [x] `logActividad('RATE_LIMIT_EXCEEDED', ...)` registra bloqueos en la DB (visible en /admin/logs)

### Decisiones arquitectonicas que tome

- [x] **Redis condicional** — si las env vars de Upstash no estan, el helper permite todo. Esto evita romper el dev local si alguien no tiene Redis configurado. Alternativa descartada: fallar con error al inicializar (romperia `npm run dev` para developers nuevos).
- [x] **Login rate limit por IP sola, no IP+email** — leer el body del POST consumiria el stream y NextAuth no podria re-leerlo. Se podria usar `req.clone()` pero agrega complejidad innecesaria para 25-50 usuarios.
- [x] **Magic link rate limit agregado post-spec** — el spec original no cubria `/api/auth/signin/email`. Gerardo lo detecto en review: sin limite, un atacante puede consumir la cuota de SendGrid. Mismo patron que login: intercepta en el catch-all de NextAuth, 5/hora por IP.
- [x] **`admin/mensajes-individuales` omitido** — el endpoint no existe todavia. Se agrega cuando se implemente F-07.
- [x] **verificar-cuit es GET, no POST** — el spec decia POST pero el endpoint real es GET. Rate limit aplicado al GET.
- [x] **Deploy wait en CI** — el workflow E2E ahora pollea `/api/health/version` hasta que el SHA del deploy coincida con el commit. Esto resuelve la race condition donde Playwright corria contra un deploy viejo. Endpoint nuevo: `src/app/api/health/version/route.ts`.
- [x] **tsconfig.json excluye tests/** — Next.js compilaba `tests/e2e/**/*.ts` en el build. Un type error en redis-cleanup.ts rompia todos los deploys de Preview. Con `"exclude": ["node_modules", "tests", "src/__tests__", "tools"]` el build no toca archivos de test.
- [x] **CI bypass token para rate limit** — los runners de GitHub Actions comparten pool de IPs y acumulan rate limit entre runs. Esto bloqueaba TODOS los logins del CI con 429 → "Error inesperado". Solucion: `isCiBypass()` en rateLimit.ts chequea header `x-ci-bypass` contra `CI_BYPASS_TOKEN`. Solo aplica si: (1) CI_BYPASS_TOKEN esta configurado, (2) VERCEL_ENV no es 'production'. Playwright envia el header via `extraHTTPHeaders` en la config. 6 tests Vitest cubren todos los edge cases (token correcto, incorrecto, ausente, env production).

### Riesgos no cubiertos por tests automatizados

- [x] **Brute force de login real** — diferido a PRUEBAS_PENDIENTES.md
- [x] **ADMIN/ESTADO exencion en cada endpoint** — diferido a PRUEBAS_PENDIENTES.md
- [x] **Upstash free tier suficiente** — 10k commands/dia, 500 cmd/dia estimados. Margen 20x.
- [x] **Cambio de tipo en feedback/route.ts** — CORS verificado end-to-end: curl desde origin de GitHub Pages retorna 200 con Access-Control-Allow-Origin correcto. NextRequest extiende Request, corsHeaders() sigue funcionando.

### Cosas a verificar despues del deploy

- [ ] En produccion (plataforma-textil.vercel.app): login normal funciona (no 429 en intento 1-3) — post-merge
- [ ] En /admin/logs: si se forzo un 429, aparece entrada `RATE_LIMIT_EXCEEDED` — post-merge
- [ ] Los contadores de Redis se ven en Upstash dashboard — post-merge
- [ ] Feedback widget sigue funcionando desde GitHub Pages — **verificado pre-merge: CORS OK**
