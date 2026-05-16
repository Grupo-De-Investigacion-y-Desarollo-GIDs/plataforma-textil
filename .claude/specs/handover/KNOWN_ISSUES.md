# Issues conocidos en V4

Bugs y flakies detectados pero no resueltos. Documentados para no perderlos
de vista pero sin bloquear avance del MVP.

## Flaky intermitente: flujo-comercial.spec.ts:9

**Test:** "Marca crea pedido → taller cotiza → marca acepta"
**Comportamiento:** falla en intento 1 (~18s), pasa en retry
**Probable causa:** race condition en test multi-rol (marca + taller)
**Estado:** TODO, no bloquea CI (pasa en retry)
**Descubierto:** durante PR #318 cuando se resolvieron los 20 timeouts de ESTADO que enmascaraban flakies preexistentes
**Proxima accion:** investigar cuando aparezca otro flaky multi-rol o cuando haya tiempo dedicado

## Config 'imagenes-portfolio' quedo desactivada en dev DB

**Detectado:** 2026-05-16, durante PR #326 (W-A1)
**Sintoma:** file-validation.spec.ts:21 falla con HTTP 400 —
  "Subida de archivos no habilitada para este contexto"
**Causa raiz:** la fila `configuraciones_upload[imagenes-portfolio]` tenia
  `activo=false`. El test `:159` (upload a contexto deshabilitado) desactiva
  la config en linea 182, y tiene un finally en linea 216-222 que la
  reactiva. Pero si Playwright aborta el test por timeout (30s), el finally
  no se completa y la DB queda en estado sucio.
**Evidencia:** `updatedAt = 2026-05-15T23:52:08` coincide con el E2E run
  del PR #325 (X-04) que corrio a las 23:41 UTC.
**Fix aplicado:** UPDATE manual a `activo=true` en Supabase REST API.
**Prevencion:** considerar agregar un beforeAll o afterAll global en
  `file-validation.spec.ts` que garantice reactivar TODOS los contextos
  de upload al final del describe, independiente de si tests individuales
  fallan. Alternativa: que el test `:159` use un contexto de prueba
  dedicado en vez de desactivar uno real.
