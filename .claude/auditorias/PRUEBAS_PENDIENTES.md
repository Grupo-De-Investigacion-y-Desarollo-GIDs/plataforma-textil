# Pruebas manuales pendientes — V3

Este archivo acumula TODAS las verificaciones manuales que requieren ojos humanos en produccion/dev. Se ejecutan al final de la implementacion de todos los specs V3, en una sesion de validacion dedicada.

---

## Spec S-01 — Cookies seguridad

### Pruebas en plataforma-textil-dev.vercel.app (DEV)

- [ ] Login con email + password — cookie authjs.session-token tiene flags HttpOnly, Secure, SameSite=Lax, Path=/
- [ ] Login con Google OAuth — misma verificacion de flags
- [ ] Login con Magic Link — misma verificacion de flags
- [ ] Cookie csrf-token tiene los mismos flags en los 3 escenarios

### Pruebas en plataforma-textil.vercel.app (PRODUCCION)

- [ ] Login con email + password — cookie __Secure-authjs.session-token tiene flags correctos
- [ ] Login con Google OAuth — misma verificacion
- [ ] Login con Magic Link — misma verificacion
- [ ] Cookie __Host-authjs.csrf-token con flags correctos

### Como ejecutar

1. Abri ventana incognito (Ctrl+Shift+N)
2. Anda a la URL del ambiente
3. Logueate con el metodo correspondiente
4. F12 → Application → Cookies → selecciona el dominio
5. Verifica los flags en cada cookie

---

## Spec S-02 — Rate limiting

### Pruebas en plataforma-textil-dev.vercel.app (DEV)

- [ ] Login brute force: intentar login con password incorrecto 6 veces seguidas → la 6ta debe retornar 429
- [ ] Despues de 15 minutos, la misma IP puede volver a intentar login
- [ ] Header Retry-After presente en la respuesta 429
- [ ] Body de la respuesta 429 dice "Demasiadas solicitudes" en español
- [ ] Login normal (1-3 intentos) NO se ve afectado
- [ ] ADMIN/ESTADO autenticados pueden hacer 21+ cotizaciones sin rate limit (verificar por codigo durante review, no por prueba real)
- [ ] Si Redis cae (simulable cambiando UPSTASH_REDIS_REST_URL en Vercel temporalmente), las requests siguen pasando (fail-open)

### Como ejecutar

1. Abri ventana incognito
2. Anda a /login
3. Intenta login con password incorrecto 6 veces seguidas
4. La 6ta respuesta debe ser 429 en Network tab (F12 → Network)
5. Verificar header Retry-After y body con mensaje en español
6. Esperar 15 minutos y verificar que login vuelve a funcionar
