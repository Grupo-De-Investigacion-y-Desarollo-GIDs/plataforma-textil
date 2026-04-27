# QA: Rate limiting en APIs criticas

**Spec:** `v3-rate-limiting.md`
**Commit de implementacion:** `pendiente`
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
| 1 | Helper `rateLimit()` y `getClientIp()` creados en `ratelimit.ts` | DEV | | |
| 2 | `getClientIp()` prioriza `x-real-ip` sobre `x-forwarded-for` | DEV | | |
| 3 | 9 endpoints con rate limiting aplicado segun tabla del spec | DEV | | |
| 4 | Login rate limited via wrapper en `[...nextauth]/route.ts` | DEV | | |
| 5 | ADMIN y ESTADO exentos (excepto login) | DEV | | |
| 6 | Respuestas 429 con header `Retry-After` | DEV | | |
| 7 | Intentos bloqueados logueados con `logActividad()` | DEV | | |
| 8 | Dev y prod usan prefijos diferentes via `VERCEL_ENV` | DEV | | |
| 9 | `analytics: false` en todos los limiters | DEV | | |
| 10 | Fallback: si Redis esta caido, la request pasa (fail-open) | DEV | | |
| 11 | `@upstash/ratelimit` y `@upstash/redis` instalados | DEV | | |
| 12 | Build sin errores de TypeScript | DEV | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Login normal funciona

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** /login
- **Verificador:** QA
- **Accion:** Login con credenciales correctas
- **Esperado:** Redirige a /admin normalmente, sin retraso ni error 429
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Crear cotizacion como taller

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Crear 1-2 cotizaciones desde un pedido existente
- **Esperado:** Cotizaciones se crean sin error 429 (limite es 20/hora)
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Enviar feedback con widget

- **Rol:** Cualquiera
- **URL de inicio:** cualquier pagina
- **Verificador:** QA
- **Accion:** Enviar 1-2 feedbacks con el widget azul
- **Esperado:** Feedback se envia sin error 429 (limite es 10/15min)
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Mensaje 429 en español | Forzar 429 (ver pruebas manuales) | Body dice "Demasiadas solicitudes" y Retry-After header presente | DEV | |
| 2 | Login normal no se ve afectado | Login 1-3 veces seguidas | No hay 429, login funciona normal | QA | |
| 3 | Uso normal de la plataforma sin rate limit | Navegar por 5+ paginas, hacer acciones normales | Nada retorna 429 en uso normal | QA | |

---

## Eje 4 — Performance

| # | Verificacion | Metodo | Verificador | Resultado |
|---|-------------|--------|-------------|-----------|
| 1 | Rate limiting no agrega latencia notable | DevTools > Network > verificar tiempos de respuesta | QA | |
| 2 | Sin errores en consola del browser | DevTools > Console | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| La plataforma se ve y funciona igual que antes | | |
| No hay mensajes de error nuevos o inesperados en uso normal | | |

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
