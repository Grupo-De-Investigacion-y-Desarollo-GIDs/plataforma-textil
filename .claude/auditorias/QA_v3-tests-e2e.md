---
spec: v3-tests-e2e
version: V3
bloque: 4
titulo: "Tests E2E con Playwright"
fecha: 2026-04-29
autor: Gerardo (Claude Code)
verificacion_dev: Completada por Gerardo el 2026-04-29
---

# QA: Tests E2E (Q-01)

## Eje 1 — Tests de flujos criticos

### 1.1 Registro de taller
- [x] Test: taller se registra en 3 pasos (rol, datos personales, datos entidad) — ✅ Gerardo 29/4
- [x] Test: CUIT se verifica via ARCA o queda pendiente — ✅ Gerardo 29/4
- [x] Test: despues del registro, redirige a /taller con nivel BRONCE — ✅ Gerardo 29/4

### 1.2 Registro de marca
- [x] Test: marca se registra con el mismo formulario multi-step — ✅ Gerardo 29/4
- [x] Test: redirige a /marca despues del registro — ✅ Gerardo 29/4

### 1.3 Login de 4 roles
- [x] Test: taller llega a /taller — ✅ Gerardo 29/4
- [x] Test: marca llega a /marca — ✅ Gerardo 29/4
- [x] Test: admin llega a /admin — ✅ Gerardo 29/4
- [x] Test: estado llega a /estado — ✅ Gerardo 29/4
- [x] Test: credenciales invalidas muestran error — ✅ Gerardo 29/4

### 1.4 Flujo comercial completo
- [x] Test: marca crea pedido (BORRADOR) — ✅ Gerardo 29/4
- [x] Test: marca publica pedido (PUBLICADO) — ✅ Gerardo 29/4
- [x] Test: taller ve pedido en disponibles y cotiza — ✅ Gerardo 29/4
- [x] Test: marca acepta cotizacion (badge ACEPTADA) — ✅ Gerardo 29/4

### 1.5 Aprobacion de documento por ESTADO
- [x] Test: ESTADO aprueba documento PENDIENTE — ✅ Gerardo 29/4
- [x] Test: metadata "Aprobado por" visible despues — ✅ Gerardo 29/4
- [x] Test: ADMIN no puede aprobar (modo lectura) — ✅ Gerardo 29/4

## Eje 2 — Infraestructura de tests

### 2.1 Configuracion
- [x] playwright.config.ts con multi-environment — ✅ Gerardo 29/4
- [x] Helper loginAs(page, rol) para 4 roles — ✅ Gerardo 29/4
- [x] Helper logout(page) — ✅ Gerardo 29/4
- [x] Helper ensureNotProduction(page) — ✅ Gerardo 29/4
- [x] Helper cleanup.ts para datos de test — ✅ Gerardo 29/4

### 2.2 CI/CD
- [x] GitHub Action e2e.yml configurada — ✅ Gerardo 29/4
- [x] Wait for Vercel deployment antes de tests — ✅ Gerardo 29/4
- [x] Upload de playwright-report en failure — ✅ Gerardo 29/4
- [x] Variables de entorno en GitHub Secrets — ✅ Gerardo 29/4

### 2.3 data-* atributos
- [x] data-action="publicar" en publicar-pedido.tsx — ✅ Gerardo 29/4
- [x] data-action="enviar-cotizacion" en cotizar-form.tsx — ✅ Gerardo 29/4
- [x] data-action="aceptar-cotizacion" en aceptar-cotizacion.tsx — ✅ Gerardo 29/4
- [x] data-action="confirmar-aceptacion" en aceptar-cotizacion.tsx — ✅ Gerardo 29/4
- [x] data-action="confirmar-aprobacion" en orden-actions.tsx — ✅ Gerardo 29/4
- [x] data-testid="proceso-*" en nuevo-pedido-form.tsx — ✅ Gerardo 29/4
- [x] data-estado en cotizacion containers — ✅ Gerardo 29/4

## Eje 3 — Resultados del suite

### 3.1 Metricas
- [x] 49 tests totales (13 archivos) — ✅ Gerardo 29/4
- [x] 43 pasaron, 4 skipped, 2 flaky bajo carga local — ✅ Gerardo 29/4
- [x] Tiempo total: 1m 26s (3 workers local) — ✅ Gerardo 29/4
- [x] TypeScript check sin errores — ✅ Gerardo 29/4

### 3.2 Tests skipped (esperados)
- [ ] aprobacion-documento: skip si no hay docs PENDIENTE aprobables (seed ya consumido)
- [ ] file-validation upload JPEG: skip si Supabase Storage no disponible
- [ ] ratelimit feedback: skip si Redis no configurado
- [ ] ratelimit magic link: skip si Redis no configurado

## Eje 4 — Gaps entre spec y realidad documentados

### 4.1 Diferencias del spec original
- [x] Pedido creation: 2 pasos (crear borrador + publicar), no 1 — ✅ Gerardo 29/4
- [x] Cotizacion success: redirect, no toast — ✅ Gerardo 29/4
- [x] Aceptar success: badge change, no toast — ✅ Gerardo 29/4
- [x] Registro: 3 pasos (rol + datos + entidad), no 2 — ✅ Gerardo 29/4
- [x] ESTADO aprobacion: server action form, no modal con confirm — ✅ Gerardo 29/4
- [x] data-action="ver-cotizaciones" no aplica (cotizaciones siempre inline) — ✅ Gerardo 29/4
- [x] data-filter="con-pendientes" no aplica (no hay boton filtro en dashboard) — ✅ Gerardo 29/4
