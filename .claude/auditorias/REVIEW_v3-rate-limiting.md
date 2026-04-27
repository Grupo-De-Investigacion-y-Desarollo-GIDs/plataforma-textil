# Review de codigo para Gerardo — S-02 Rate limiting

## Antes de mergear a main, revisar:

### Cambios al codigo

- [ ] `ratelimit.ts` tiene 9 limiters con prefijos separados por `VERCEL_ENV`
- [ ] `getClientIp()` prioriza `x-real-ip` (Vercel edge, confiable) sobre `x-forwarded-for` (cadena de proxies)
- [ ] Si `UPSTASH_REDIS_REST_URL` no esta configurado, `limiters` es null y `rateLimit()` retorna null (fail-open)
- [ ] Try/catch en `rateLimit()` — si Redis esta caido, `console.error` + retorna null (fail-open)
- [ ] `analytics: false` en todos los limiters — ahorra 33% de comandos Redis
- [ ] `[...nextauth]/route.ts` wrappea solo `POST` cuando el pathname es `/api/auth/callback/credentials`
- [ ] Endpoints autenticados (cotizaciones, pedidos, chat, upload) aplican rate limit DESPUES de auth y exentan ADMIN/ESTADO
- [ ] Endpoints publicos (denuncias, feedback, registro, verificar-cuit) aplican rate limit ANTES de cualquier logica, identificados por IP
- [ ] Respuesta 429 tiene body en español ("Demasiadas solicitudes") y headers `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- [ ] `logActividad('RATE_LIMIT_EXCEEDED', ...)` registra bloqueos en la DB (visible en /admin/logs)

### Decisiones arquitectonicas que tome

- [ ] **Redis condicional** — si las env vars de Upstash no estan, el helper permite todo. Esto evita romper el dev local si alguien no tiene Redis configurado. Alternativa descartada: fallar con error al inicializar (romperia `npm run dev` para developers nuevos).
- [ ] **Login rate limit por IP sola, no IP+email** — leer el body del POST consumiria el stream y NextAuth no podria re-leerlo. Se podria usar `req.clone()` pero agrega complejidad innecesaria para 25-50 usuarios.
- [ ] **`admin/mensajes-individuales` omitido** — el endpoint no existe todavia. Se agrega cuando se implemente F-07.
- [ ] **verificar-cuit es GET, no POST** — el spec decia POST pero el endpoint real es GET. Rate limit aplicado al GET.

### Riesgos no cubiertos por tests automatizados

- [ ] **Brute force de login real** — el test E2E no prueba 6 logins fallidos porque bloquearia la IP 15 minutos y romperia otros tests. Verificar manualmente (en PRUEBAS_PENDIENTES.md).
- [ ] **ADMIN/ESTADO exencion en cada endpoint** — verificar visualmente que el guard `if (role !== 'ADMIN' && role !== 'ESTADO')` esta en cotizaciones, pedidos, chat, upload pero NO en login, feedback, denuncias, registro, verificar-cuit.
- [ ] **Upstash free tier suficiente** — 10k commands/dia. Con `analytics: false` son 2 cmd por `.limit()`. Para 25 usuarios x 10 acciones/dia = 500 cmd/dia. Margen 20x.
- [ ] **Cambio de tipo en feedback/route.ts** — el parametro `request` cambio de `Request` a `NextRequest` para que `getClientIp()` funcione. Verificar que CORS sigue funcionando (corsHeaders recibe `Request`, que es supertype de `NextRequest`).

### Cosas a verificar despues del deploy

- [ ] En plataforma-textil-dev.vercel.app: login normal funciona (no 429 en intento 1-3)
- [ ] En /admin/logs: si se forzo un 429, aparece entrada `RATE_LIMIT_EXCEEDED`
- [ ] Los contadores de Redis se ven en Upstash dashboard (keys con prefijo `rl:preview:*` para deploy de develop)
- [ ] Feedback widget sigue funcionando desde GitHub Pages (CORS + rate limit no interfieren)
