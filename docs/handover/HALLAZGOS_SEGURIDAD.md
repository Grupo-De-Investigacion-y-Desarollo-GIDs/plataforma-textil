# Hallazgos de seguridad — consolidado

> Documento vivo. Consolida los hallazgos de seguridad conocidos de la Plataforma Digital
> Textil (PDT): qué se detectó, el impacto, cómo se resolvió o mitigó, y qué queda abierto.
> Parte del punto **g) Calidad, pruebas y seguridad** del Handover Package.
>
> Estado a **2026-08-03**. Autor: equipo técnico (Gerardo, asistido).

## Cómo leer este documento

Cada hallazgo tiene un **estado**:

- **CERRADO** — resuelto y verificado; sin acción pendiente.
- **MITIGADO** — el riesgo activo está contenido, pero queda trabajo de endurecimiento o
  verificación en otro entorno.
- **ABIERTO** — identificado, con plan, sin resolver todavía.

La matriz de riesgos formal (formato ISO/OIT vs. pragmática) es una **decisión pendiente de
Sergio** en conversación con el equipo (ver `docs/handover-oit-analisis-y-division.md`, punto
g). Este documento es la base pragmática "hallazgos + mitigaciones" sobre la que se arma esa
matriz.

---

## 1. Gestión de secretos y variables de entorno

### 1.1 `.env` apuntando a producción — footgun de datos (CERRADO)
- **Hallazgo:** el Prisma CLI lee `.env` (no `.env.local`). Si `.env` apuntaba a PROD, un
  `db:migrate` / `db:push` / `db:reset` / `db:seed` local impactaba producción sin querer.
- **Impacto:** potencial pérdida/corrupción de datos de producción desde una consola de dev.
- **Resolución:** **guards anti-PROD commiteados** (PR #395). `scripts/check-db-ref.ts`
  bloquea `db:migrate/push/reset` si `DATABASE_URL` apunta al ref de prod; `prisma/seed.ts`
  se niega a correr contra prod. Bypass deliberado y explícito: `ALLOW_PROD=1` /
  `ALLOW_PROD_SEED=1`. El `build` no lleva guard (Vercel corre migraciones contra prod
  legítimamente). Convención documentada: `.env` y `.env.local` **siempre a DEV**.
- **Refs:** dev ref `fjddgukwydsdcrqoxvns` · prod ref `nefbhacmjrzynnhvgfnl`.

### 1.2 `NEXTAUTH_SECRET` compartido entre entornos (MITIGADO / acción de dashboard)
- **Hallazgo:** una única entrada de `NEXTAUTH_SECRET` cubría todos los entornos en Vercel.
  Un JWT firmado en DEV/Preview **valida en PROD** (misma clave) → una sesión emitida en un
  entorno de menor confianza es aceptable en producción.
- **Impacto:** ruptura del aislamiento de sesiones entre entornos (P0 en el runbook de
  re-scope).
- **Estado:** documentado con procedimiento exacto en
  `.claude/specs/RUNBOOK_RESCOPE_SECRETS.md`. La ejecución es una **tarea de dashboard de
  Gerardo**: generar un secret separado para Preview/Development, dejando el de Production
  aislado. Rotar invalida las sesiones activas de ese entorno (esperado).
- **Pendiente:** ejecutar el re-scope (no rompe nada en runtime; es endurecimiento).

### 1.3 `ARCA_PROVIDER` como entrada compartida — valor cruzado entre entornos (CERRADO)
- **Hallazgo:** `ARCA_PROVIDER` era una entrada compartida; al ponerla en `mock` para
  destrabar Preview (13-jul), el valor quedó potencialmente alcanzable por otros scopes.
  Además `getConfig()` usa `??`, que **no** captura `""` (string vacío) como ausencia.
- **Impacto:** riesgo de que un entorno corra el provider equivocado (mock donde debía ser
  real, o viceversa).
- **Resolución:** auditoría de valor por scope y separación de la entrada por entorno
  (documentado en `RUNBOOK_RESCOPE_SECRETS.md`). Arquitectura definida: **DEV/Preview
  necesita mock (flujos sintéticos) y real (CUITs verdaderos); PROD siempre real**. La
  convivencia mock/real en dev se resolvió con el override `?real=1` gateado (ver §3.3).

### 1.4 Incidente ARCA en producción — token inválido por scope (CERRADO)
- **Hallazgo:** la verificación real de CUIT fallaba en PRODUCCIÓN con `AFIPSDK_ERROR`.
- **Causa raíz:** la entrada de `AFIP_SDK_TOKEN` con scope **Production** contenía un valor
  **inválido desde el 22-abr** (era una entrada *separada* de la buena de Pre-Production del
  2-may). Causa secundaria: `AFIP_SDK_ENV` ausente en Production →
  `production !== 'production'` → homologación en vez de prod.
- **Método de diagnóstico (registrado, reutilizable):** las entradas **compartidas**
  (cert/key/CUIT/enabled) son idénticas por construcción y no podían explicar
  "Preview funciona / Prod falla"; la única credencial **separada por accidente**
  (`AFIP_SDK_TOKEN`) era la culpable. Preview había consultado ARCA real el 6 y 13-jul con
  el mismo token → credenciales válidas, falla de carga/scope, no de credencial.
- **Resolución (03-ago):** se borró la entrada de Production (inválida) y se extendió la
  buena a *All Environments*. Verificado en DB: fila `consultas_arca`
  `2026-08-03 15:03:47 · CUIT_INEXISTENTE · 2021ms` (llegó a AFIP y respondió).
- **Hallazgo secundario de observabilidad → CERRADO:** el `catch` de `consultarPadron`
  descartaba el error crudo del SDK (sólo dejaba el código clasificado) y devolvía 200, por
  lo que el rechazo real de AFIP **nunca aparecía en los runtime logs**. Se agregó un
  `console.error` con el mensaje crudo (hotfix #455, `d037f56`, ya en `main`).
- **Ref:** `.claude/specs/v4-circuito-cuit-implementacion.md` §10.

### 1.5 `CI_BYPASS_TOKEN` — ausente en producción por diseño (CERRADO / correcto)
- **Hallazgo/decisión:** el header `x-ci-bypass` permite saltar rate-limit y habilitar
  endpoints de test en Preview/Dev. **No debe existir en Production.**
- **Estado:** verificado `AUSENTE` en el scope Production (`vercel env ls production`). El
  código además exige `VERCEL_ENV !== 'production'`, o sea doble candado.
- **Patrón de diseño (B-04):** helpers de bypass **dedicados y separados**
  (`isCiBypass`, `isTestMutationAllowed`, `isRealArcaAllowed`) — mismos checks, funciones
  distintas — para que relajar uno no ensanche silenciosamente la autorización de otro.

---

## 2. Aislamiento de datos y control de acceso (Bloque K)

### 2.1 K-01 — RLS: fuga de datos a rol anónimo (MITIGADO en dev / pendiente efectivo en PROD)
- **Hallazgo:** sin Row Level Security, el rol `anon` de Supabase podía leer datos que no le
  correspondían (PII, answer-keys de evaluaciones).
- **Resolución en DEV:** cierre del leak de anónimos (Capas A+B, PR #389) y de 3 críticos
  C1/C2/C3 — PII + answer-key de anónimos (PR #414).
- **Estado en PROD:** el endurecimiento RLS (ENABLE RLS en ~44 tablas + REVOKE a
  anon/authenticated) entra a producción con la **migración #5 del deploy grande**
  (`20260603120000_k01_rls_revoke_anon`). Prisma/Storage usan rol owner/service_role que
  bypassa RLS → la app no se ve afectada (validado en dev). **Efectivo en PROD recién con
  la promoción** (ver `RUNBOOK_PROMOCION_PROD.md`).
- **Ref:** `.claude/specs/k-01-rls-supabase.md`.

### 2.2 K-02 — Bucket de documentos e IDOR de upload (CERRADO)
- **Hallazgo:** el bucket de documentos era candidato a acceso público; además un IDOR
  permitía subir/ver imágenes de cotización de un pedido ajeno (C5).
- **Resolución:** preparación de bucket privado (#356); cierre del IDOR de
  upload/imágenes por elegibilidad de ownership (C5, #417/#418).

### 2.3 Auditoría de endpoints (referencia)
- **Estado:** 86 endpoints clasificados por sensibilidad (docs PR #413). Críticos C1/C2/C3
  cerrados (#414); C5 cerrado (#418). Amarillos K-02/K-05 seguidos en el cierre del
  Bloque K (#423).

### 2.4 Race de sesión JWT (B-05) (CERRADO)
- **Hallazgo:** condición de carrera que clobbereaba la cookie de sesión JWT en el flujo
  multi-rol.
- **Resolución:** PR #411.

---

## 3. Superficie de registro y del evento OIT (agosto 2026)

### 3.1 Registro abierto en DEV expuesto en el evento público (ABIERTO — spec lista)
- **Contexto:** en agosto la OIT abre el ambiente de demo (probablemente DEV) al público
  general desde tablets con datos sintéticos. Un registro abierto en DEV puede recibir altas
  reales/no controladas y disparar efectos (emails, consultas ARCA).
- **Plan:** spec de **allowlist + `MODO_EVENTO`** (`.claude/specs/v4-a-proteger-registro-dev.md`):
  gate tras el parse de zod y antes de ARCA; `modoRegistro(env)` → `abierto | allowlist |
  evento`; vars `REGISTRO_ALLOWLIST` (CSV) y `MODO_EVENTO`. **Spec escrita, no implementada.**
- **Decisión pendiente:** tercer ambiente de demo dedicado vs. `MODO_EVENTO` sobre DEV
  (decisión de Gerardo/Sergio).

### 3.2 Consultas ARCA reales disparadas por el público (MITIGADO por diseño)
- **Riesgo:** que las tablets del evento disparen consultas reales a AFIP.
- **Mitigación:** el override `?real=1` está **gateado** por `isRealArcaAllowed` (token de
  dev + `VERCEL_ENV !== 'production'`). Sin token, el público del evento y los e2e quedan en
  **mock determinista**. El default en dev es mock.

### 3.3 Convivencia mock/real en DEV (CERRADO — diseño)
- **Necesidad:** DEV/Preview necesita mock (flujos sintéticos, e2e) y real (probar CUITs
  verdaderos) simultáneamente; PROD siempre real.
- **Solución:** default mock + opt-in `?real=1` gateado (PR del circuito CUIT). No rompe los
  e2e (usan CUITs dinámicos sin header → mock) ni la demo del evento.
- **Ref:** `.claude/specs/v4-circuito-cuit-implementacion.md` §9.

---

## 4. Hardening de la aplicación

### 4.1 CSP y headers de seguridad no configurados (ABIERTO)
- **Hallazgo:** `next.config.ts` **no** define Content-Security-Policy ni los headers de
  seguridad (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`,
  `Referrer-Policy`). Verificado: el `next.config.ts` actual sólo configura `reactCompiler`
  e `images.remotePatterns`.
- **Impacto:** ausencia de defensa en profundidad ante clickjacking, MIME-sniffing e
  inyección de contenido.
- **Plan:** agregar `headers()` en `next.config.ts` con CSP (empezar en `report-only`),
  HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`.
  Estimación baja; es una tarea de Gerardo del punto g del handover.

### 4.2 Rate limiting y CORS (CERRADO)
- **Estado:** rate limiting con Upstash y CORS implementados y **testeados**
  (`src/__tests__/ratelimit.test.ts`). En PROD, `UPSTASH_REDIS_REST_URL/TOKEN` **presentes**
  → el rate-limit no "falla abierto" (sólo permitiría todo si faltaran las vars). C4 cubierto.

### 4.3 Cookies de sesión (CERRADO / documentado)
- **Estado:** configuración de cookies documentada en `docs/seguridad/cookies.md` (V3).

---

## 5. Hardening N/A por diseño serverless

El hardening tradicional (nginx, firewall a nivel host, patcheo del SO, hardening de
kernel) **no aplica**: Vercel y Supabase gestionan la capa de infraestructura. El hardening
aplicable a esta plataforma es el de **Next.js + Vercel + Supabase RLS** (secciones 1–4).

---

## 6. Resumen de estado

| # | Hallazgo | Estado |
|---|----------|--------|
| 1.1 | `.env`→prod footgun | CERRADO (guards #395) |
| 1.2 | `NEXTAUTH_SECRET` compartido | MITIGADO (re-scope pendiente, dashboard) |
| 1.3 | `ARCA_PROVIDER` compartido | CERRADO |
| 1.4 | Incidente ARCA prod (token) | CERRADO (03-ago) |
| 1.5 | `CI_BYPASS_TOKEN` fuera de prod | CERRADO / correcto |
| 2.1 | K-01 RLS anon | MITIGADO (efectivo en PROD con el deploy grande) |
| 2.2 | K-02 bucket + IDOR C5 | CERRADO |
| 2.4 | Race sesión JWT B-05 | CERRADO |
| 3.1 | Registro DEV en evento OIT | ABIERTO (spec lista) |
| 3.2 | ARCA real por el público | MITIGADO (gate) |
| 3.3 | Convivencia mock/real dev | CERRADO |
| 4.1 | CSP + security headers | ABIERTO |
| 4.2 | Rate limiting / CORS | CERRADO |

**Abiertos que requieren trabajo:** re-scope de `NEXTAUTH_SECRET` (1.2, dashboard), gate de
registro para el evento (3.1, implementar spec), CSP + headers (4.1, código). Todo lo demás
está cerrado o mitigado con la promoción a producción como hito de activación de K-01.
