# QA: Rate limiting en APIs criticas

**Spec:** `v3-rate-limiting.md`
**Commit de implementacion:** varios (Bloque 2 — S-02)
**Verificacion DEV:** Completada por Gerardo el 2026-04-28
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-04-27
**Auditor(es):** Sergio (tecnico)
**Incluye Eje 6 de validacion de dominio:** no
**Perfiles aplicables:**

---

## Contexto institucional

La plataforma maneja datos sensibles: validaciones de talleres, certificados de formalizacion, informacion del Estado. Sin rate limiting, un actor malicioso puede hacer brute force de login, spammear cotizaciones, o agotar recursos de terceros (AFIP, LLM). Este spec protege los endpoints criticos antes del piloto real con OIT.

---

## Objetivo de este QA

Verificar que los endpoints sensibles tienen proteccion contra abuso (rate limiting), que las respuestas HTTP 429 son claras para el usuario, y que el rate limiting no afecta el uso normal de la plataforma.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Los items marcados **DEV** los verifica Gerardo desde codigo o terminal
3. Los items marcados **QA** los verifica Sergio desde el browser
4. Marca cada resultado con ok, bug o bloqueante

---

## Resultado global

- [ ] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar v3 / fix inmediato / abrir item v4 ]
**Issues abiertos:** # (links a GitHub)

---

## Eje 1 — Funcionalidad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Helper `rateLimit()` y `getClientIp()` creados en `ratelimit.ts` | DEV | ok | |
| 2 | `getClientIp()` prioriza `x-real-ip` sobre `x-forwarded-for` | DEV | ok | |
| 3 | 9 endpoints con rate limiting aplicado segun tabla del spec | DEV | ok | |
| 4 | Login rate limited via wrapper en `[...nextauth]/route.ts` | DEV | ok | |
| 5 | ADMIN y ESTADO exentos (excepto login) | DEV | ok | |
| 6 | Respuestas 429 con header `Retry-After` | DEV | ok | |
| 7 | Intentos bloqueados logueados con `logActividad()` | DEV | ok | |
| 8 | Dev y prod usan prefijos diferentes via `VERCEL_ENV` | DEV | ok | |
| 9 | `analytics: false` en todos los limiters | DEV | ok | |
| 10 | Fallback: si Redis esta caido, la request pasa (fail-open) | DEV | ok | |
| 11 | `@upstash/ratelimit` y `@upstash/redis` instalados | DEV | ok | |
| 12 | Build sin errores de TypeScript | DEV | ok | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Login normal funciona

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** /login
- **Verificador:** QA
- **Accion:** Login con credenciales correctas
- **Esperado:** Redirige a /admin normalmente, sin retraso ni error 429
- **Resultado:** ⏳ requiere browser — code review: login limit 5/15min, 1 login no trigerea. Todos los limiters tienen analytics:false para performance — Claude Code 7/5
- **Notas:**

### Paso 2 — Crear cotizacion como taller

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Crear 1-2 cotizaciones desde un pedido existente
- **Esperado:** Cotizaciones se crean sin error 429 (limite es 20/hora)
- **Resultado:** ⏳ requiere browser — code review: cotizaciones limit 20/h. ADMIN/ESTADO exentos — Claude Code 7/5
- **Notas:**

### Paso 3 — Enviar feedback con widget

- **Rol:** Cualquiera
- **URL de inicio:** cualquier pagina
- **Verificador:** QA
- **Accion:** Enviar 1-2 feedbacks con el widget azul
- **Esperado:** Feedback se envia sin error 429 (limite es 10/15min)
- **Resultado:** ⏳ requiere browser — code review: feedback limit 10/15min, no exencion (publico, pre-auth) — Claude Code 7/5
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Mensaje 429 en español | Forzar 429 (ver pruebas manuales) | Body dice "Demasiadas solicitudes" y Retry-After header presente | DEV | ok |
| 2 | Login normal no se ve afectado | Login 1-3 veces seguidas | No hay 429, login funciona normal | QA | ⏳ requiere browser — limit 5/15min, 1-3 OK |
| 3 | Uso normal de la plataforma sin rate limit | Navegar por 5+ paginas, hacer acciones normales | Nada retorna 429 en uso normal | QA | ⏳ requiere browser — todos los limits generosos para uso normal |

---

## Eje 4 — Performance

| # | Verificacion | Metodo | Verificador | Resultado |
|---|-------------|--------|-------------|-----------|
| 1 | Rate limiting no agrega latencia notable | DevTools > Network > verificar tiempos de respuesta | QA | ⏳ requiere browser |
| 2 | Sin errores en consola del browser | DevTools > Console | QA | ⏳ requiere browser |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| La plataforma se ve y funciona igual que antes | ⏳ requiere browser | |
| No hay mensajes de error nuevos o inesperados en uso normal | ⏳ requiere browser | |

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
