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
**Prevencion:** PR #337 implemento `test.afterEach` que garantiza
  reactivacion despues de cada test. Fix mergeado.

## smoke.spec.ts:6 — degradacion progresiva (net::ERR_ABORTED)

**Detectado en:** PR #324 (X-02 rebase), 2026-05-16
**Sintoma:** net::ERR_ABORTED en page.goto a /admin/logs durante test
  de Playwright con sesion de admin.

**Patron historico:**
- W-A1 (PR #326): 1 fallo, pasa en retry 1
- PR #337 (config fix): 2 fallos, pasa en retry 2
- X-02 (PR #324 rebase): 3 fallos, no pasa sin re-run

**Diagnostico:** NO es regresion de codigo. Es problema intermitente de
  la funcion serverless Vercel que afecta navegacion autenticada en
  Playwright. Verificado:
- /admin/logs responde 307 al curl en 0.5s (funcion OK)
- X-02 no modifico nada en src/app/(admin)/ ni layout admin
- Diff de X-02 es puramente visual (CSS + variantes nuevas)

**Workaround:** re-run del test fallido. Si CI vuelve verde, mergear.

**Fix sugerido (futuro):** cambiar waitUntil: 'load' a
  waitUntil: 'domcontentloaded' en el test. Menos estricto con SSR
  streaming. Pendiente para spec de mantenimiento E2E.
