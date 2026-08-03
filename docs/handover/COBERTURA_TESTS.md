# Cobertura de tests — PDT (Plataforma Digital Textil)

Documento de handover · OIT/UNTREF · Estado del repo al momento de redacción.

## 1. Resumen ejecutivo

La plataforma cuenta hoy con **55 suites de tests unitarios** (Vitest, en `src/__tests__/`) y **37 specs end-to-end** (Playwright, en `tests/e2e/`). En números redondos hay **~650 casos unitarios** y **~142 casos e2e**, sumando alrededor de **790 aserciones de comportamiento** ejercitadas de forma automatizada.

Ambas suites corren en integración continua (GitHub Actions) en cada Pull Request hacia `develop` y `main`:

- Los unitarios se ejecutan aislados en el runner de CI (`test.yml`).
- Los e2e se ejecutan con Playwright contra el **preview deploy real de Vercel** del PR (`e2e.yml`).

> **Aclaración metodológica importante.** Hoy el proyecto **no mide porcentaje de líneas cubiertas**: no hay tooling de coverage instalado (`@vitest/coverage-v8` está ausente del `package.json`). Por eso este documento **no reporta un “% de cobertura”**, sino que reporta la cobertura de dos maneras verificables:
> 1. **Por inventario** — la lista real de suites que existen en el repo.
> 2. **Por áreas funcionales** — qué partes del sistema quedan ejercitadas por esas suites.
>
> Agregar la métrica de líneas es un gap conocido y de bajo esfuerzo (ver sección 6).

## 2. Tests unitarios (Vitest)

Ubicación: `src/__tests__/` · Ejecución local: **`npm test`** (`vitest run`) · Watch: `npm run test:watch`.

Los 55 archivos, agrupados por área funcional según lo que indican sus nombres:

### Autenticación, sesión y multi-rol (bloque U)
- `roles-multirol.test.ts`
- `session-cookie.test.ts`
- `cookie-config.test.ts`
- `permisos.test.ts`
- `tipos-documento-permisos.test.ts`
- `crear-entidad-rol.test.ts`
- `acceso-verificado.test.ts`
- `u-03-pr2b-ownership.test.ts`
- `u-04-active-mode.test.ts`
- `u-05-cierre-fuente.test.ts`
- `u05-exclude.test.ts`
- `u-06-clasificacion-pedidos.test.ts`
- `u-09-agregar-rol.test.ts`
- `u-09-anti-incesto-regresion.test.ts`

### Circuito CUIT / ARCA y registro
- `arca.test.ts`
- `corregir-cuit-helper.test.ts`
- `corregir-cuit-route.test.ts`
- `registro-cuit-normalizacion.test.ts`
- `revocar-validacion.test.ts`
- `onboarding.test.ts`

### Rate limiting y CORS (seguridad de red)
- `ratelimit.test.ts`
- `cors.test.ts`

### RLS, IDOR y matrices de seguridad (bloque K)
- `k-01-criticos.test.ts`
- `k-02-auth-matrix.test.ts`
- `k-02-idor-matrix.test.ts`
- `k-05-no-leak.test.ts`

### Niveles y gamificación
- `nivel.test.ts`
- `proximo-nivel-card.test.ts`
- `configuracion-niveles-api.test.ts`

### Cotizaciones y demanda (flujo comercial)
- `cotizaciones-elegibilidad.test.ts`
- `demanda-insatisfecha.test.ts`

### Notificaciones, mensajería y email
- `notificaciones-bell.test.ts`
- `notificaciones-matching.test.ts`
- `mensajes-individuales.test.ts`
- `email-resend.test.ts`
- `whatsapp.test.ts`
- `feedback-labels.test.ts`

### Vidriera, gracia CUIT y cron
- `visibilidad-vidriera.test.ts`
- `gracia.test.ts`
- `cron-gracia.test.ts`

### Exportes y datos
- `exportes.test.ts`
- `csv.test.ts`

### Formularios, observaciones y UX
- `observaciones-campo.test.ts`
- `taller-formulario-labels.test.ts`
- `ux-mejoras.test.ts`

### Infraestructura, logging, errores y utilitarios
- `utils.test.ts`
- `api-client.test.ts`
- `api-errors.test.ts`
- `error-logger.test.ts`
- `log.test.ts`
- `log-error-route.test.ts`
- `admin-logs-api.test.ts`
- `file-validation.test.ts`
- `github-issue-parser.test.ts`
- `qa-aggregate.test.ts`

**Total: 55 suites · ~650 casos.** Helpers compartidos en `src/__tests__/_helpers/`.

## 3. Tests end-to-end (Playwright)

Ubicación: `tests/e2e/` · Ejecución local: **`npm run test:e2e`** (`playwright test`) · Variantes: `test:e2e:ui`, `test:e2e:headed`.

En CI corren contra el **preview deploy de Vercel** del PR (`e2e.yml`). El login se resuelve una vez con `auth.setup.ts` (storageState por rol), usando credenciales de test inyectadas por secrets. Los 37 specs, agrupados por área/rol:

### Autenticación y roles
- `auth-roles.spec.ts`
- `roles-estado.spec.ts`
- `acceso-verificado.spec.ts`
- `cookies.spec.ts`
- `u-04-toggle-multi-rol.spec.ts`
- `u-06-clasificacion-pedidos.spec.ts`
- `u-07-anti-incesto.spec.ts`
- `u-08-cuenta-multirol.spec.ts`
- `u-08-gating-dual.spec.ts`
- `u-09-agregar-segundo-rol.spec.ts`

### Registro y onboarding
- `registro-marca.spec.ts`
- `registro-taller.spec.ts`
- `onboarding.spec.ts`

### Flujo comercial y documentos
- `flujo-comercial.spec.ts`
- `aprobacion-documento.spec.ts`
- `desglose-plantilla.spec.ts`
- `demanda-insatisfecha.spec.ts`

### Niveles y gamificación
- `cierre-niveles-f1.spec.ts`
- `configuracion-niveles.spec.ts`

### Vidriera y certificados
- `credenciales-vidriera.spec.ts`
- `verificar-certificado.spec.ts`

### Notificaciones y mensajería
- `notificaciones-bell.spec.ts`
- `mensajes-individuales.spec.ts`
- `whatsapp-notificaciones.spec.ts`
- `feedback-widget.spec.ts`

### Estado y exportes
- `exportes-estado.spec.ts`

### Rate limiting y validación de archivos (seguridad)
- `ratelimit.spec.ts`
- `file-validation.spec.ts`

### Formularios y observaciones
- `observaciones-campo.spec.ts`
- `w-a-formulario.spec.ts`

### UX, layout y robustez de plataforma
- `smoke.spec.ts`
- `layout-consistency.spec.ts`
- `error-boundaries.spec.ts`
- `ux-mejoras.spec.ts`
- `admin-no-regression.spec.ts`
- `taller-flujo.mobile.spec.ts`
- `v3-qa-issues-api.spec.ts`

**Total: 37 specs · ~142 casos.** Helpers en `tests/e2e/_helpers/`, setup de auth en `tests/e2e/auth.setup.ts`, notas en `tests/e2e/README.md`.

## 4. Integración continua

Workflows en `.github/workflows/`:

| Workflow | Qué corre | Dispara en | Contra qué |
|----------|-----------|------------|------------|
| `test.yml` | Vitest (`npm run test`) tras `npm ci` + `prisma generate` | PR a `develop`/`main` y push a `develop` | Runner de CI (aislado) |
| `e2e.yml` | Playwright (`npm run test:e2e`) | PR a `develop`/`main` y push a `develop` | Preview deploy de Vercel del PR (espera a que el deploy matchee el SHA vía `/api/health/version`) |

Ambos workflows se ejecutan de forma automática en cada PR y quedan visibles como checks verde/rojo. El objetivo operativo es que **ambos deban estar en verde para poder mergear**.

> **Nota de estado (a verificar en branch protection).** El encabezado de `test.yml` documenta que ese workflow arrancó en **“modo informativo”** — reporta resultado pero, según ese comentario, todavía no estaba marcado como *required check* en la protección de rama, con la intención de promoverlo a obligatorio una vez estabilizado. Antes de declararlo formalmente como gate bloqueante conviene confirmar la configuración de *required status checks* en GitHub. El `e2e.yml` corre en las mismas condiciones de disparo.

## 5. Áreas de seguridad testeadas

La superficie de seguridad crítica tiene cobertura automatizada dedicada:

- **Rate limiting (Upstash Redis):** `ratelimit.test.ts` (unit) + `ratelimit.spec.ts` (e2e, contra preview con secrets de Upstash de test).
- **CORS:** `cors.test.ts`.
- **RLS y no-leak de datos:** `k-05-no-leak.test.ts`, `k-01-criticos.test.ts`.
- **IDOR / autorización horizontal (bloque K):** `k-02-idor-matrix.test.ts`, `k-02-auth-matrix.test.ts`.
- **Auth multi-rol (bloque U):** matriz completa en unit (`roles-multirol`, `u-03/04/05/06/09`, `u-09-anti-incesto-regresion`) y e2e (`auth-roles`, `u-04/06/07/08/09`, incluyendo anti-incesto y gating dual).
- **Circuito CUIT / ARCA:** `arca.test.ts`, `corregir-cuit-*`, `registro-cuit-normalizacion.test.ts`, `revocar-validacion.test.ts`.
- **Validación de archivos subidos:** `file-validation.test.ts` (unit) + `file-validation.spec.ts` (e2e).
- **Sesión y cookies:** `session-cookie.test.ts`, `cookie-config.test.ts`, `cookies.spec.ts`.

## 6. Gaps conocidos

1. **Métrica de % de líneas.** No hay tooling de coverage instalado. Acción sugerida: agregar `@vitest/coverage-v8`, configurar `coverage` en la config de Vitest y publicar el reporte (idealmente como artefacto de CI y/o umbral mínimo). Es de bajo esfuerzo y convierte la cobertura “por inventario” en una métrica cuantitativa comparable en el tiempo.
2. **Matriz de riesgos formal.** Falta un documento de riesgos que mapee cada área crítica a su nivel de cobertura y probabilidad/impacto. Decisión pendiente de Sergio: enfoque **ISO** (formal, exhaustivo) vs. **pragmático** (matriz liviana orientada a las áreas de mayor impacto).
3. **Tests de accesibilidad automatizados.** No hay checks a11y automatizados (p. ej. `axe-core` / `@axe-core/playwright`) integrados en la suite e2e. Recomendado dado que es un entregable institucional (OIT/UNTREF) con exigencias de accesibilidad.
