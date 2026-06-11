# Deuda técnica conocida — Plataforma Textil

Este archivo lista deudas técnicas pre-existentes que se identificaron
durante el desarrollo pero NO se atacaron en el sprint correspondiente
(por scope). Se mantienen acá para no perder el conocimiento.

Cada ítem incluye: descripción, donde se detectó, impacto estimado,
y prioridad sugerida.

## Frontend / UI

### F-04: Cosmético dashboards V4 (X-07b)
- **Detectado en:** Discovery Nivel 5 (2026-06-08)
- **Descripción:** ajustes cosméticos menores en dashboards: grays,
  serif en H3, estados public-auth. El grueso del diseño V4 ya está
  aplicado (~85-90%); esto es pulido fino.
- **Impacto:** estético menor, no afecta funcionalidad ni piloto
- **Prioridad:** baja (backlog post-piloto, decisión de Gerardo)
- **Estimación:** 3-4h

## Backend / Arquitectura

### B-01: Tres paths de verificación de CUIT sin unificar
- **Detectado en:** Discovery U-09
- **Descripción:** existen 3 implementaciones paralelas de "verificar
  CUIT contra AFIP SDK":
  - `src/lib/arca.ts::consultarPadron` — RegisterScopeThirteen (A13).
    Usado en registro, verificar-cuit, U-09
  - `src/lib/afip.ts::verificarCuit` — RegisterScopeTen (A10). Usado
    solo en /registro/completar
  - `src/app/api/.../verificar-cuit/route.ts` — endpoint público
- **Impacto:** mantenimiento duplicado, deuda de consistencia
- **Prioridad:** baja (no rompe nada, pero ensucia)
- **Estimación:** 2-3h (unificar en un solo helper)

### B-06: Pill de modo desincronizado entre pestañas (useSession no recibe el broadcast)
- **Detectado en:** QA de Sergio sobre #411 (2026-06-10)
- **Descripción:** con dos pestañas de la misma sesión, togglear modo en una deja
  la OTRA con el pill del header stale ("Modo Taller") aunque su contenido
  server-side (tabs, h1, gating) ya renderiza como Marca. El estado real (cookie,
  DB, server) es correcto; solo el client-side `useSession` de la pestaña pasiva no
  se entera.
- **Evidencia de que B-05 funciona:** antes de #411, la navegación de la pestaña
  pasiva habría clobbereado la cookie de vuelta a Taller (race de datos). Ahora la
  cookie sobrevive — el problema quedó reducido a UI stale (no a datos).
- **A determinar en el discovery (NO ahora):**
  a) ¿Pre-existente o introducido por #411? (sospecha: pre-existente — el pill
     siempre dependió del broadcast client-side).
  b) ¿El BroadcastChannel de Auth.js v5 propaga `update()` entre tabs o no? ¿El
     pill escucha?
  c) ¿Se auto-corrige on-focus de la pestaña? (`useSession` refetchea on-focus —
     si sí, severidad BAJA).
  d) FUSIONAR con el follow-up de B-05 "remover el `update()` cliente redundante":
     la justificación de mantenerlo era el broadcast multi-tab; si el broadcast no
     funciona, ambas decisiones (remover update / arreglar pill) son el mismo análisis.
- **Severidad:** BAJA-MEDIA (cosmético, estado real correcto, probable
  auto-corrección on-focus — a confirmar).
- **Prioridad:** baja (PR aparte, no bloqueó #411 — criterio de Sergio).

## Datos

_Sin items abiertos. D-01 y D-02 resueltos en U-05 (#410) — ver sección "Resueltas"._

## Testing / CI

### T-01: Toolchain local roto en WSL
- **Detectado en:** durante todo el sprint
- **Descripción:** node_modules en WSL tiene typescript, vitest, prisma
  faltantes localmente. CI es validador autoritativo. Build local NO
  se corre porque dispararía prisma migrate deploy.
- **Impacto:** Claude Code no puede correr tests localmente, depende
  de CI verde
- **Prioridad:** media (problema de productividad del agente)
- **Estimación:** investigar (puede ser configuración WSL, devcontainer,
  o setup)

### T-02: GitHub Actions outage intermitente selectivo
- **Detectado en:** 2026-06-04 y volvió el 2026-06-07
- **Descripción:** synchronize (commits sobre PR existente) no agenda
  runs; opened/reopened sí. Workaround: cerrar/reabrir PR o admin bypass.
- **Impacto:** ralentiza el ciclo de CI
- **Estado:** ticket abierto a GitHub Support
- **Plan:** monitorear ticket; mientras tanto usar admin bypass

### T-04: Directorio `e2e/` huérfano (no lo corre Playwright)
- **Detectado en:** implementación Narrativa V4 Etapa 1 (2026-06-08)
- **Descripción:** existen DOS carpetas de tests Playwright: `tests/e2e/`
  (la real — `playwright.config.ts` tiene `testDir: './tests/e2e'`) y
  `e2e/` (huérfana). Los archivos `e2e/checklist-sec*.spec.ts`,
  `e2e/admin.spec.ts`, `e2e/auth.spec.ts`, etc. **nunca se ejecutan** en
  CI ni con `npm run test:e2e`. Son ~12 specs de mantenimiento muerto.
- **Impacto:** falsa sensación de cobertura. Cualquiera que edite `e2e/*`
  (como pedía el spec de Etapa 1 para T-03) cree estar arreglando tests
  que en realidad están inertes. Riesgo de divergencia silenciosa.
- **Prioridad:** media (deuda de confiabilidad de la suite)
- **Plan:** decidir entre (a) **migrar** los specs útiles de `e2e/` a
  `tests/e2e/` y borrar la carpeta, o (b) **borrar** `e2e/` si son
  duplicados/obsoletos de los de `tests/e2e/`. Verificar solapamiento
  antes de borrar.
- **Estimación:** 1-2h (auditar solapamiento + migrar/borrar)

### T-05: Test e2e u-09 no es idempotente (muta estado permanente)
- **Detectado en:** Validación de T-04 (2026-06-08)
- **Descripción:** e2e u-09-agregar-segundo-rol muta u09.test de
  single-rol a multi-rol de forma irreversible. La DEV DB persiste
  entre corridas, así que el test pasa la 1ra vez y falla la 2da
  (ya no aparece agregar-rol-card porque el user ya tiene 2 roles).
- **Impacto:** el test NO es CI-confiable sin un reseed previo en cada
  corrida. Bloquea la migración limpia de u-09 a tests/e2e/ (los otros
  3 U-specs no tienen este problema).
- **Prioridad:** media — bloquea cerrar T-04 al 100% (3 de 4 specs
  migran limpio, u-09 queda pendiente de este fix)
- **Soluciones posibles:**
  - Hook de cleanup en afterEach que resetee u09.test a single-rol
    (vía API o DB directa)
  - Usar un user throwaway creado/destruido en el propio test
  - Documentar como "one-shot" (NO recomendado: rompe en 2da corrida)
- **Relación:** ya estaba anticipado en el spec de U-08
  (v4-u-08-tests-e2e-multi-rol.md, §3.3 aislamiento) — esto lo confirma
  en la práctica
- **Estimación:** 1-2h (el cleanup hook es lo más limpio)

## Producto

### P-01: Notificaciones — comportamiento en multi-rol
- **Detectado en:** QA r1 de #398 (U-09) por Sergio
- **Descripción:** /cuenta/notificaciones muestra "98 no leídas" en
  ambos modos. Pregunta abierta: ¿todas / del rol activo / con tabs?
- **Impacto:** producto sin definir
- **Plan:** spec aparte cuando se priorize
- **Estimación:** spec + implementación, escala variable

### P-02: Modelo `PerfilTaller`/`PerfilMarca` vs `Taller`/`Marca`
- **Detectado en:** discovery U-04
- **Descripción:** el MASTER_V4 habla de "PerfilTaller" y "PerfilMarca"
  como sub-entidades del User. La implementación usa `Taller` y `Marca`
  directos. Es nomenclatura, no bug, pero puede confundir.
- **Impacto:** confusión de documentación
- **Prioridad:** muy baja (decidir si renombrar en el master o en código)

## Pendientes administrativos no técnicos (snapshot del sprint)

### A-01: GitHub Pro suscripción accidental
- **Detectado en:** 2026-06-04 durante destrabe del budget de Actions
- **Descripción:** se contrató GitHub Pro USD 4/mes accidentalmente
- **Acción:** cancelar en https://github.com/settings/billing/plans
- **Urgencia:** ALTA (cobro recurrente real)

### A-02: Aviso a 5 cuentas reales del incidente RLS
- **Detectado en:** 2026-06-03 (incidente RLS)
- **Descripción:** 5 cuentas reales (sebanestor83, cp.alanplummer,
  sofia.rojo.sr, plummer.latam, cecilia.lavena) tienen sus hashes
  bcrypt filtrados. Necesitan ser avisadas y se les debe pedir cambio
  de contraseña.
- **Estado:** pendiente desde el miércoles
- **Sexta cuenta posible:** srodriguezunq (registro abandonado, posible
  cuenta real adicional)
- **Urgencia:** ALTA (afecta a personas reales)

---

## Cómo usar este archivo

- Agregar items nuevos cuando se detecten deudas pre-existentes
  durante sprints
- NO agregar acá deudas introducidas por el sprint actual (esas se
  resuelven en el sprint)
- Revisar trimestralmente y priorizar items para sprints de "deuda técnica"
- Items resueltos: mover a sección "Resueltas" con SHA o PR de fix

## Resueltas

### B-05: Race de clobbering de cookie en rolling JWT session — RESUELTA
- **Detectado en:** Diagnóstico de fallos e2e u-09 en T-04 (2026-06-09)
- **Resuelta en:** B-05 fix A+B (#411, `c83e4ac`, 2026-06-11). QA de Sergio OK en lo
  central; smoke manual post-merge realizado.
- **Causa raíz (confirmada en `@auth/core`):** bajo `strategy: 'jwt'`, Auth.js v5
  re-firma y re-emite la cookie en CADA lectura de sesión (`updateAge` es inerte para
  jwt; solo aplica a database-session). El middleware era el escritor dominante: cada
  navegación re-emitía el token que su request transportó → pisaba la actualización
  concurrente de `update()` (last-write-wins en el cookie jar). Un multi-rol que
  cambiaba de modo y navegaba quedaba en el modo viejo hasta re-login.
- **Fix:**
  - **A — middleware read-only:** lee el JWT con `decode` (sin re-emitir Set-Cookie);
    gating byte-idéntico. El sliding-expiry queda a cargo del `useSession` (verificado
    en el gate: toda ruta autenticada monta `SessionProvider` global + `FeedbackWidget`
    + `Header`).
  - **B — cookie server-side:** `active-mode` y `me/roles` setean la cookie actualizada
    en la MISMA response, vía helper único `src/compartido/lib/session-cookie.ts`
    (reusado por `n/[token]`, mismo filtro anti-escalación que el callback jwt). El
    `update()` cliente quedó redundante (broadcast multi-tab); su remoción es follow-up
    (ver **B-06**).
  - **C —** corregido el comentario engañoso de `updateAge` en `auth.config.ts`.
- **Cobertura:** des-fixmeado `u-04 "el modo activo persiste"` (validación canónica,
  pasa en intento 1) + test multi-tab nuevo + unit test del helper (round-trip +
  anti-escalación `roles=[ADMIN]` no pasa). Suite e2e verde (118 passed / 0 failed /
  0 flaky).
- **Follow-up:** remover el `update()` cliente redundante (fusionado con B-06). La
  fase PROD del backfill de U-05 (`roles/activeMode`) viaja con el próximo deploy junto
  con este fix.

### D-01: Cuentas con role pero sin entidad asociada — RESUELTA
- **Detectado en:** Discovery U-05 + QA #398 (cuentas reales)
- **Resuelta en:** U-05 (#410, `ba23b17`, 2026-06-10)
- **Fix:** opción D (decisión registrada) — la migración SQL las normaliza igual
  (`roles=[role]`, `activeMode=role`), SIN inventarles entidad. La cuenta abandonada
  (srodriguezunq) queda single-rol coherente; su dashboard vacío por falta de entidad
  es ortogonal y se deja para revisión manual. Cierre de fuente (registro/completar/seed)
  evita nuevos casos. En DEV no aparecía (10 users del seed); aplica al universo prod.

### D-02: Talleres sin Validacion (sin checklist) — RESUELTA
- **Detectado en:** Discovery U-05
- **Resuelta en:** U-05 (#410, `ba23b17`, 2026-06-10)
- **Fix:** (a) `scripts/u05-backfill-validaciones.ts` (dry-run/apply, guard anti-PROD)
  regenera las `Validacion NO_INICIADO` faltantes por taller — aplicado en DEV (2
  talleres, 14 validaciones). (b) Cierre de fuente en el seed: el loop post-seed ahora
  itera TODOS los talleres usando `buildValidacionesFaltantes` (fuente única compartida
  con el backfill), así U09 y La Hormiga ya no quedan sin checklist tras un reseed.
  Fase PROD del backfill: paso manual gated (`ALLOW_PROD=1 ... --apply`) tras dimensionar.

### F-01: Card de perfil muestra Formalización > 100% — RESUELTA
- **Detectado en:** QA r2 de #398 (U-09) por Sergio, con Carlos Mendoza
- **Resuelta en:** sprint deuda batch-1 (`chore/deuda-tecnica-batch-1`, 2026-06-09)
- **Causa raíz:** `taller.puntaje` es un SCORE crudo (suma de `puntosOtorgados`
  de las validaciones COMPLETADO + bonus AFIP), deliberadamente SIN tope (ver
  `nivel.test.ts` "no hay cap de puntaje"). La UI lo mostraba directo con `%`, así
  que un taller con score > 100 mostraba "135%". No era solo falta de Math.min: NO
  había divisor — se mostraban puntos como porcentaje.
- **Fix:** helpers `maxPuntosFormalizacion()` + `porcentajeFormalizacion(puntaje)`
  en `src/compartido/lib/nivel.ts` (punto ÚNICO de cálculo). El % = `puntaje / máx
  alcanzable`, capado a 100 con `Math.min`. El divisor es DINÁMICO (suma de puntos
  de los tipos de documento requeridos+activos + AFIP_BONUS) → se ajusta solo al
  agregar/quitar tipos (arregla el "divisor desactualizado"). Render sites migrados:
  `(public)/cuenta/page.tsx` y el sidebar del taller vía `(taller)/layout.tsx`
  (label + barra de progreso). `taller/perfil` muestra `{puntaje} pts` (puntos, no
  %) — correcto, sin tocar.

### F-02: Link a /cuenta no visible para roles operativos — RESUELTA
- **Detectado en:** QA r2 de #398 (U-09) por Sergio
- **Resuelta en:** sprint deuda batch-1 (`chore/deuda-tecnica-batch-1`, 2026-06-09)
- **Causa raíz:** ESTADO ya usaba el `Header` compartido (que tiene "Mi cuenta" en
  el dropdown del avatar), pero ADMIN y CONTENIDO usan layouts PROPIOS con headers
  custom que no incluían el link → solo llegaban a /cuenta por URL.
- **Fix:** agregado `<Link href="/cuenta">Mi cuenta</Link>` en los headers de
  `(admin)/layout.tsx` y `(contenido)/layout.tsx`. /cuenta ya maneja roles de
  equipo (oculta "Tus perfiles" y "Agregar rol"). ESTADO ya estaba cubierto.

### F-03: on-blur sin debounce dispara N requests a ARCA — RESUELTA
- **Detectado en:** Discovery del costo CUIT en #398 (U-09)
- **Resuelta en:** sprint deuda batch-1 (`chore/deuda-tecnica-batch-1`, 2026-06-09)
- **Fix:** `registro/page.tsx` cachea el último CUIT con resultado DEFINITIVO
  (verificado o inválido) en un `useRef`; un blur con el mismo CUIT ya consultado
  no re-llama a ARCA. Los resultados transitorios (servicio caído / error de red)
  NO se cachean → permiten reintento. Si el CUIT cambia, se vuelve a validar. Sin
  librería de debounce (el cache del último valor alcanza).

### B-02: Skip ARCA podría leer User.cuit/verificadoAfip — RESUELTA
- **Detectado en:** Fix D r2 de #398 (U-09), nota del agente
- **Resuelta en:** sprint deuda batch-1 (`chore/deuda-tecnica-batch-1`, 2026-06-09)
- **Fix:** `POST /api/usuarios/me/roles` agrega `User.cuit` + `User.verificadoAfip`
  a la lista de CUITs verificados contra la que compara el skip de ARCA. MISMO gate
  semántico (`verificadoAfip === true`): presencia de CUIT no implica verificación.
  Cubre el caso "registro abandonado" (CUIT verificado en User sin entidad creada).
  2 tests nuevos en `u-09-agregar-rol.test.ts` (skip con User verificado; SÍ llama
  a ARCA si User.cuit presente pero no verificado).

### B-03: Doble query en layout y page de /cuenta — RESUELTA
- **Detectado en:** Fix A r2 de #398 (U-09)
- **Resuelta en:** sprint deuda batch-1 (`chore/deuda-tecnica-batch-1`, 2026-06-09)
- **Verificación:** NO estaban deduplicadas (funciones distintas, selects distintos
  → React `cache()` no las unía). No era no-op.
- **Fix:** helper `getPerfilesUsuario(userId)` envuelto en `cache()` de React en
  `entidades-modo.ts`, con el superset de campos. `construirEntidadesModo` (layout)
  y `cuenta/page.tsx` ahora pasan por él → dentro de un request comparten una sola
  ejecución (un multi-rol que abre /cuenta colapsa 4 queries → 2). Se preserva el
  early-return de single-rol (sin DB hit).

### B-04: isCiBypass con doble responsabilidad — RESUELTA
- **Detectado en:** Auditoría del endpoint reset de test (2026-06-09)
- **Resuelta en:** sprint deuda batch-1 (`chore/deuda-tecnica-batch-1`, 2026-06-09)
- **Fix:** función DEDICADA `isTestMutationAllowed(req)` en `ratelimit.ts`, con las
  mismas validaciones (token + `VERCEL_ENV != production` + header x-ci-bypass) pero
  SEPARADA de `isCiBypass` a propósito: relajar el bypass de rate-limit ya no
  ensancha la autorización del endpoint mutante sin tocar esta función. El endpoint
  `reset-seed-state` usa el guard nuevo; `ratelimit.ts`/`isCiBypass` quedan intactos
  para rate-limit. 4 unit tests del guard nuevo (token ausente, prod, header
  incorrecto → false; caso válido → true).
- **Nota histórica (ROOT CAUSE del cleanup roto, 2026-06-09):** el endpoint vivía en
  `src/app/api/_test/...`; el prefijo `_` lo volvía "private folder" del App Router
  → la ruta nunca existió (404 HTML, no JSON del guard). Resuelto en #407 renombrando
  `_test` → `test-utils`. Regla: nunca prefijo `_` en segmentos de ruta; verificar el
  body del 404 (JSON = ruta existe; HTML = no matcheó). Guard de prod usa
  `VERCEL_ENV` (NO NODE_ENV, siempre 'production' en deploys Vercel). Endpoint con
  allowlist `?user=u09|julieta` (enum cerrado; clave desconocida → 400; no acepta
  userId arbitrario).

### T-03: Test e2e checklist-sec9-10.spec.ts con labels stale — RESUELTA (con corrección de diagnóstico)
- **Detectado en:** Discovery narrativa V4 Etapa 1 (2026-06-07)
- **Resuelta en:** commits `66ebee8` + reconciliación real en el mismo PR
  (Narrativa V4 Etapa 1), 2026-06-08
- **Descripción original:** se reportó que `e2e/checklist-sec9-10.spec.ts`
  líneas 236/346 tenían labels obsoletos y selectores eliminados en #375.
- **CORRECCIÓN IMPORTANTE (hallazgo al implementar):** el directorio `e2e/`
  **NO lo corre Playwright**. `playwright.config.ts` tiene
  `testDir: './tests/e2e'`, y `e2e.yml` corre `npx playwright test` sin
  `--config` alterno. Por eso esos tests "stale" jamás fallaron: nunca se
  ejecutan. Ver **T-04** (directorio huérfano).
- **Fix real (lo que SÍ corre en CI, en `tests/e2e/`):** la Etapa 1 rompió
  dos tests reales que asertaban el copy viejo —
  `tests/e2e/smoke.spec.ts:29` (`'Mi vidriera'` → `'Mi taller'`) y
  `tests/e2e/acceso-verificado.spec.ts:40` (heading `'Explorar Proveedores'`
  → `'Explorar talleres'`). Ambos actualizados; e2e vuelve a verde.
- **Fix cosmético (en `e2e/` huérfano, por completitud y por si se rewirea):**
  se igualaron igualmente `checklist-sec9-10.spec.ts` 10.2/10.9 a los tabs
  del header, 10.12 (ESTADO) y 9.1/9.2 (Academia→Cursos), + asserts del
  Flujo 4 (10.9b/10.9c). No afecta CI hasta que se resuelva T-04.
