# Daily Log

## 2026-04-27

### Gerardo Breard
- **21:04** `2fec2ce` — fix: corregir E2E tests — endpoint correcto y bypass selectivo
  - `tests/e2e/file-validation.spec.ts`
  - `tests/e2e/ratelimit.spec.ts`

- **20:57** `1f96492` — chore: trigger redeploy para capturar CI_BYPASS_TOKEN en Vercel


- **20:36** `6a1493d` — fix: CI bypass token para rate limit — runners de GitHub comparten IPs
  - `.claude/auditorias/REVIEW_v3-rate-limiting.md`
  - `.claude/auditorias/REVIEW_v3-validacion-archivos.md`
  - `.github/workflows/e2e.yml`
  - `playwright.config.ts`
  - `src/__tests__/ratelimit.test.ts`
  - `src/compartido/lib/ratelimit.ts`

- **20:15** `2f04356` — feat: v3-validacion-archivos (S-03) — validacion server-side por magic bytes + config admin
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-validacion-archivos.md`
  - `.claude/auditorias/REVIEW_v3-validacion-archivos.md`
  - `prisma/migrations/20260427100000_agregar_configuracion_upload/migration.sql`
  - `prisma/schema.prisma`
  - `prisma/seed.ts`
  - `src/__tests__/file-validation.test.ts`
  - `src/app/(admin)/admin/configuracion/archivos/page.tsx`
  - `src/app/(admin)/admin/configuracion/page.tsx`
  - `src/app/api/admin/configuracion-upload/[id]/route.ts`
  - `src/app/api/admin/configuracion-upload/route.ts`
  - `src/app/api/upload/imagenes/route.ts`
  - `src/app/api/validaciones/[id]/upload/route.ts`
  - `src/compartido/lib/file-validation.ts`
  - `tests/e2e/file-validation.spec.ts`

- **19:31** `02ba56d` — feat: progreso de verificacion DEV/QA en index de auditorias
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`

- **19:18** `a0aafb9` — docs: marcar items DEV verificados en QAs de S-01 y S-02
  - `.claude/auditorias/QA_v3-cookies-seguridad.md`
  - `.claude/auditorias/QA_v3-rate-limiting.md`

- **19:00** `f35ad70` — docs: review S-02 completado — 21/25 verificados, CORS OK
  - `.claude/auditorias/REVIEW_v3-rate-limiting.md`

- **18:52** `b450a3d` — fix: ampliar exclusiones en tsconfig.json para tests y tools
  - `tsconfig.json`

- **18:44** `e832bc3` — docs: actualizar REVIEW S-02 con decisiones de CI/deploy
  - `.claude/auditorias/REVIEW_v3-rate-limiting.md`

- **18:40** `d9e0619` — fix: type error en redis-cleanup + excluir tests del build Next.js
  - `tests/e2e/_helpers/redis-cleanup.ts`
  - `tsconfig.json`

- **18:30** `a195e8f` — fix: esperar deploy de Vercel antes de correr E2E en CI
  - `.github/workflows/e2e.yml`
  - `src/app/api/health/version/route.ts`

- **18:11** `5972b66` — fix: timeout 5s en Redis cleanup, limpiar login keys en cada test
  - `tests/e2e/_helpers/redis-cleanup.ts`
  - `tests/e2e/ratelimit.spec.ts`

- **17:55** `53f66f8` — fix: revertir skip de tests Redis en CI
  - `tests/e2e/ratelimit.spec.ts`

- **17:43** `973de84` — fix: remover globalSetup que colgaba CI conectando a Redis
  - `playwright.config.ts`
  - `tests/e2e/global-setup.ts`
  - `tests/e2e/ratelimit.spec.ts`

- **17:34** `9029de5` — fix: skip tests de Redis en CI, correr solo manualmente
  - `tests/e2e/ratelimit.spec.ts`

- **17:21** `e50663e` — fix: remover serial de tests rate limit, evitar timeout de 30min
  - `tests/e2e/global-setup.ts`
  - `tests/e2e/ratelimit.spec.ts`

- **16:40** `2174930` — fix: globalSetup limpia rate limit keys antes de todos los E2E
  - `playwright.config.ts`
  - `tests/e2e/global-setup.ts`

- **16:34** `ae90646` — fix: remover test fragil de cleanup, migrar KEYS a SCAN
  - `tests/e2e/_helpers/redis-cleanup.ts`
  - `tests/e2e/ratelimit.spec.ts`

- **16:31** `f82d9ff` — test: E2E para magic link rate limit + actualizar REVIEW y PRUEBAS
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/REVIEW_v3-rate-limiting.md`
  - `tests/e2e/ratelimit.spec.ts`

- **16:15** `9117015` — fix: rate limit en /api/auth/signin/email (magic links)
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `src/compartido/lib/ratelimit.ts`

- **15:11** `127d648` — fix: cleanup de rate limit en E2E usa wildcard de ambiente
  - `tests/e2e/ratelimit.spec.ts`

- **14:59** `261d6ec` — ci: agregar env vars de Upstash al workflow E2E
  - `.github/workflows/e2e.yml`

- **14:47** `a121869` — feat: v3-rate-limiting (S-02) — rate limiting en 9 endpoints criticos
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-rate-limiting.md`
  - `.claude/auditorias/REVIEW_v3-rate-limiting.md`
  - `package-lock.json`
  - `package.json`
  - `src/__tests__/ratelimit.test.ts`
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `src/app/api/auth/registro/route.ts`
  - `src/app/api/auth/verificar-cuit/route.ts`
  - `src/app/api/chat/route.ts`
  - `src/app/api/cotizaciones/route.ts`
  - `src/app/api/denuncias/route.ts`
  - `src/app/api/feedback/route.ts`
  - `src/app/api/pedidos/route.ts`
  - `src/app/api/validaciones/[id]/upload/route.ts`
  - `src/compartido/lib/ratelimit.ts`
  - `tests/e2e/_helpers/redis-cleanup.ts`
  - `tests/e2e/ratelimit.spec.ts`

- **13:01** `28a77af` — docs: review S-01 completado, crear PRUEBAS_PENDIENTES.md
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/REVIEW_v3-cookies-seguridad.md`


## 2026-04-26

### Gerardo Breard
- **19:00** `dffca1f` — feat: v3-cookies-seguridad (S-01) — hardening de cookies NextAuth
  - `.claude/auditorias/QA_v3-cookies-seguridad.md`
  - `.claude/auditorias/REVIEW_v3-cookies-seguridad.md`
  - `docs/seguridad/cookies.md`
  - `src/__tests__/cookie-config.test.ts`
  - `src/compartido/lib/auth.config.ts`
  - `src/compartido/lib/auth.ts`
  - `tests/e2e/cookies.spec.ts`

- **18:06** `6d728b3` — feat: resumen de estado de issues en index QA V3
  - `src/__tests__/qa-aggregate.test.ts`
  - `src/app/api/feedback/all-qa-v3/route.ts`
  - `src/compartido/lib/qa-aggregate.ts`
  - `tests/e2e/v3-qa-issues-api.spec.ts`
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`

- **17:37** `ee8cb25` — feat: QA-iss (Bloque 0) — estado de issues en interfaz de QA
  - `.claude/auditorias/QA_v3-qa-estado-issues.md`
  - `src/__tests__/cors.test.ts`
  - `src/__tests__/feedback-labels.test.ts`
  - `src/__tests__/github-issue-parser.test.ts`
  - `src/app/api/feedback/by-qa/[qaSlug]/route.ts`
  - `src/app/api/feedback/route.ts`
  - `src/compartido/lib/cors.ts`
  - `src/compartido/lib/feedback.ts`
  - `tests/e2e/v3-qa-issues-api.spec.ts`
  - `tests/fixtures/github-issue-response.json`
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`

- **16:55** `32cf6ba` — docs: regenerar QA S-04 con formato V3
  - `.claude/auditorias/QA_v3-logs-admin-auditoria.md`

- **16:48** `df28fae` — feat: index QA mejorado — secciones V3/V2, filtros, perfiles chips
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`

- **16:23** `d07ac3f` — feat: QA-fmt (Bloque 0) — formato ampliado V3 del generador QA
  - `.claude/auditorias/TEMPLATE_QA.md`
  - `.github/workflows/qa-pages.yml`
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`

- **15:39** `86dbd17` — fix: resolver 3 issues de smoke tests E2E (selector login, banner ambiente, mobile-safari)
  - `playwright.config.ts`
  - `src/compartido/componentes/ambiente-banner.tsx`
  - `tests/e2e/_helpers/auth.ts`

- **15:11** `979cf73` — test: setup parcial de Q-01 — infraestructura Playwright + smoke test
  - `.env.test.example`
  - `.github/workflows/e2e.yml`
  - `.gitignore`
  - `playwright.config.ts`
  - `tests/e2e/README.md`
  - `tests/e2e/_helpers/auth.ts`
  - `tests/e2e/_helpers/cleanup.ts`
  - `tests/e2e/_helpers/safety.ts`
  - `tests/e2e/smoke.spec.ts`
  - `vitest.config.ts`

- **14:57** `79d8526` — test: agregar tests automatizados de S-04 (logs admin auditoria)
  - `src/__tests__/admin-logs-api.test.ts`
  - `src/__tests__/csv.test.ts`
  - `src/__tests__/log.test.ts`
  - `src/__tests__/revocar-validacion.test.ts`
  - `vitest.config.ts`

- **14:34** `8423747` — feat: v3-logs-admin-auditoria (S-04) — logging sistematico, UI mejorada, export CSV
  - `.claude/auditorias/QA_v3-logs-admin-auditoria.md`
  - `src/app/(admin)/admin/logs/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/api/admin/logs/route.ts`
  - `src/app/api/admin/notas/route.ts`
  - `src/app/api/admin/rag/[id]/route.ts`
  - `src/app/api/admin/rag/route.ts`
  - `src/app/api/admin/usuarios/[id]/route.ts`
  - `src/app/api/admin/usuarios/route.ts`
  - `src/app/api/certificados/route.ts`
  - `src/app/api/colecciones/[id]/route.ts`
  - `src/app/api/exportar/route.ts`
  - `src/app/api/talleres/[id]/route.ts`
  - `src/app/api/validaciones/[id]/route.ts`
  - `src/compartido/lib/csv.ts`
  - `src/compartido/lib/log.ts`

- **13:46** `7cf48d0` — fix: seed safety — protección contra ejecución en producción
  - `package.json`
  - `prisma/seed.ts`

- **01:27** `43bdc25` — feat: v3-separar-ambientes (I-01) — build script, seed safety, banner de ambiente
  - `.claude/auditorias/QA_v3-separar-ambientes.md`
  - `package.json`
  - `src/app/layout.tsx`
  - `src/compartido/componentes/ambiente-banner.tsx`


## 2026-04-25

### Gerardo Breard
- **20:14** `6dec7a6` — docs: agregar ORDEN_IMPLEMENTACION_V3 con grafo de dependencias y orden secuencial
  - `ORDEN_IMPLEMENTACION_V3.md`

- **20:07** `ff23d62` — docs: resolver hallazgos MEDIA y BAJA de revisión cruzada
  - `.claude/specs/V3_REVISION_CRUZADA.md`
  - `.claude/specs/v3-demanda-insatisfecha.md`
  - `.claude/specs/v3-errores-consistentes-apis.md`
  - `.claude/specs/v3-logs-admin-auditoria.md`
  - `.claude/specs/v3-protocolos-onboarding.md`
  - `.claude/specs/v3-qa-estado-issues.md`
  - `.claude/specs/v3-rate-limiting.md`
  - `.claude/specs/v3-redefinicion-roles-estado.md`
  - `.claude/specs/v3-reporte-campo.md`
  - `.claude/specs/v3-whatsapp-notificaciones.md`

- **20:02** `60619f9` — docs: resolver hallazgos ALTA de revisión cruzada (C-02, C-03, C-04/U-01/U-02, D-02, D-03, R-02)
  - `.claude/specs/V3_REVISION_CRUZADA.md`
  - `.claude/specs/v3-exportes-estado.md`
  - `.claude/specs/v3-mensajes-individuales.md`
  - `.claude/specs/v3-protocolos-onboarding.md`
  - `.claude/specs/v3-proximo-nivel-dashboard.md`
  - `.claude/specs/v3-rate-limiting.md`

- **19:55** `4ac8569` — docs: resolver hallazgos bloqueantes de revisión cruzada (C-01, D-01)
  - `.claude/specs/V3_REVISION_CRUZADA.md`
  - `.claude/specs/v3-exportes-estado.md`
  - `.claude/specs/v3-validacion-archivos.md`

- **19:19** `adbc6c7` — docs: agregar spec v3-reporte-campo con correcciones de factibilidad
  - `.claude/specs/v3-reporte-campo.md`

- **19:03** `0f49926` — docs: agregar spec v3-protocolos-onboarding con correcciones de factibilidad
  - `.claude/specs/v3-protocolos-onboarding.md`

- **18:43** `68a05c7` — docs: agregar spec v3-ux-mejoras con correcciones de factibilidad
  - `.claude/specs/v3-ux-mejoras.md`

- **18:25** `c75998c` — docs: agregar spec v3-errores-consistentes-apis con correcciones de factibilidad
  - `.claude/specs/v3-errores-consistentes-apis.md`

- **18:08** `a56560d` — docs: agregar spec v3-error-boundaries con correcciones de factibilidad
  - `.claude/specs/v3-error-boundaries.md`

- **17:52** `2c4ab62` — docs: agregar spec v3-tests-e2e con correcciones de factibilidad
  - `.claude/specs/v3-tests-e2e.md`

- **17:23** `8a5f74b` — docs: agregar spec v3-mensajes-individuales con correcciones de factibilidad
  - `.claude/specs/v3-mensajes-individuales.md`

- **17:07** `6f3f70c` — docs: agregar spec v3-rag-completo con correcciones de factibilidad
  - `.claude/specs/v3-rag-completo.md`

- **16:44** `ac43abc` — docs: agregar spec v3-exportes-estado con correcciones de factibilidad
  - `.claude/specs/v3-exportes-estado.md`

- **16:22** `b242dc9` — docs: agregar spec v3-demanda-insatisfecha con correcciones de factibilidad
  - `.claude/specs/v3-demanda-insatisfecha.md`

- **16:03** `a3a9014` — docs: agregar spec v3-arca-completo con correcciones de factibilidad
  - `.claude/specs/v3-arca-completo.md`

- **15:06** `399c9a3` — docs: agregar spec v3-whatsapp-notificaciones con correcciones de factibilidad
  - `.claude/specs/v3-whatsapp-notificaciones.md`

- **13:49** `ae1b6c7` — docs: ampliar interface ProximoNivelInfo en v3-tipos-documento-db por dependencia con F-01
  - `.claude/specs/v3-tipos-documento-db.md`

- **13:45** `14813b2` — docs: actualizar v3-proximo-nivel-dashboard con spec ejecutable
  - `.claude/specs/v3-proximo-nivel-dashboard.md`

- **13:24** `9c5b45c` — docs: agregar spec v3-tipos-documento-db con correcciones de factibilidad
  - `.claude/specs/v3-tipos-documento-db.md`

- **12:41** `df56f50` — docs: agregar spec v3-redefinicion-roles-estado con correcciones de factibilidad
  - `.claude/specs/v3-redefinicion-roles-estado.md`


## 2026-04-23

### Gerardo Breard
- **16:07** `9e620e6` — docs: agregar spec v3-qa-estado-issues con correcciones de factibilidad
  - `.claude/specs/v3-qa-estado-issues.md`

- **15:26** `5205187` — docs: agregar spec v3-qa-formato-ampliado con correcciones de factibilidad
  - `.claude/specs/v3-qa-formato-ampliado.md`

- **14:57** `a1aaf37` — docs: agregar spec v3-logs-admin-auditoria con correcciones de factibilidad
  - `.claude/specs/v3-logs-admin-auditoria.md`

- **14:07** `ea39474` — docs: agregar spec v3-validacion-archivos con correcciones de factibilidad
  - `.claude/specs/v3-validacion-archivos.md`

- **12:59** `02776d6` — docs: agregar spec v3-rate-limiting con correcciones de factibilidad
  - `.claude/specs/v3-rate-limiting.md`

- **12:30** `384edbf` — docs: agregar spec v3-cookies-seguridad con correcciones de factibilidad
  - `.claude/specs/v3-cookies-seguridad.md`

- **12:19** `282f854` — docs: marcar inicio oficial de V3
  - `.claude/specs/V3_INICIO.md`

- **12:16** `10f0492` — docs: agregar spec v3-separar-ambientes con correcciones de factibilidad
  - `.claude/specs/v3-separar-ambientes.md`

- **11:33** `53b14d2` — perf: mover funciones Vercel a región gru1 (São Paulo) — reduce latencia DB
  - `vercel.json`

- **10:58** `b7ecf4b` — perf: paralelizar 5 queries en admin/talleres/[id] (#120)
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`

- **10:52** `93a691e` — fix: revocar validación requiere motivo obligatorio con log (#119)
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`

- **01:31** `2e30cf1` — fix: soporte trámites externos — botón 'Ya lo hice' y badge admin (#116)
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(taller)/taller/formalizacion/page.tsx`
  - `src/app/api/validaciones/[id]/route.ts`
  - `src/taller/componentes/marcar-realizado-button.tsx`

- **01:18** `7a05013` — fix: alinear backend con frontend — solo rechazar CUIT si AFIP confirma invalido (#117)
  - `src/app/api/auth/registro/route.ts`


## 2026-04-22

### Gerardo Breard
- **15:32** `31cae0a` — perf: paralelizar queries y paginar pedidos disponibles (#95 #96 #101)
  - `src/app/(admin)/admin/notificaciones/page.tsx`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`

- **15:13** `ca6787d` — docs: registrar UX-04 tooltip badge formalización en V3_BACKLOG
  - `.claude/specs/V3_BACKLOG.md`

- **15:05** `f316d50` — fix: SubmitButton con loading state en aprobar/rechazar/revocar validaciones (#107)
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/compartido/componentes/ui/button.tsx`

- **14:47** `8b25a5f` — docs: actualizar V3_BACKLOG con issues cerrados de V2
  - `.claude/specs/V3_BACKLOG.md`

- **14:39** `e18f8c6` — docs: registrar INT-02 problema AfipSDK en V3_BACKLOG
  - `.claude/specs/V3_BACKLOG.md`

- **14:32** `3dc106d` — fix: permitir registro cuando AFIP no responde, con warning pendiente de verificacion (#109)
  - `src/app/(auth)/registro/page.tsx`

- **12:40** `eb7692a` — docs: registrar INT-01 integración completa ARCA en V3_BACKLOG
  - `.claude/specs/V3_BACKLOG.md`


## 2026-04-21

### Gerardo Breard
- **11:45** `19405a6` — fix: eliminar campo ubicacion legacy, usar solo provincia/partido en perfil (#92)
  - `src/app/(public)/perfil/[id]/page.tsx`
  - `src/app/(taller)/taller/perfil/editar/editar-form.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`


## 2026-04-20

### Gerardo Breard
- **20:33** `8325856` — fix: agregar tab Tablero en navbar de marca para volver a /marca (#89)
  - `src/compartido/componentes/layout/header.tsx`

- **20:22** `b5b95bc` — fix: montoTotal, contactar taller, banner PENDIENTE, label visual y bug log MO (#90 #91)
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/api/cotizaciones/[id]/route.ts`
  - `src/app/api/ordenes/[id]/route.ts`

- **17:55** `b094e73` — fix: KPIs de admin/notificaciones cuentan solo comunicaciones del admin (#88)
  - `src/app/(admin)/admin/notificaciones/page.tsx`

- **17:24** `2d953c6` — fix: middleware excluir archivos de fuentes woff2/woff/ttf/eot (#86)
  - `src/middleware.ts`

- **17:07** `a2b9304` — fix: mostrar documento subido en checklist de formalización del taller (#85)
  - `src/app/(taller)/taller/formalizacion/page.tsx`
  - `src/app/api/validaciones/[id]/signed-url/route.ts`
  - `src/compartido/lib/storage.ts`
  - `src/taller/componentes/ver-documento-button.tsx`

- **16:50** `50a01f9` — fix: página /unauthorized con header de la plataforma y link al panel (#84)
  - `src/app/unauthorized/page.tsx`

- **16:40** `65eef74` — docs: registrar F-06 RAG completo en V3_BACKLOG + desactivar flags en prod
  - `.claude/specs/V3_BACKLOG.md`

- **15:24** `47857f5` — fix: suppressHydrationWarning en timeAgo de activity-timeline (#74)
  - `src/compartido/componentes/activity-timeline.tsx`

- **14:43** `fdffc03` — docs: registrar F-05 demanda insatisfecha en V3_BACKLOG
  - `.claude/specs/V3_BACKLOG.md`

- **13:58** `6cb986c` — fix: agregar botón revocar validación en admin + banner certificado faltante (#51 #52)
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(taller)/taller/page.tsx`

- **13:23** `3ab9fa9` — fix: documentos requeridos NO_INICIADO se muestran como pendientes, no como opcionales (#49)
  - `src/app/(taller)/taller/formalizacion/page.tsx`

- **12:30** `7e7b867` — fix: FileUpload muestra mensajes de error para formato, tamaño y máximo (#46 #47 #48)
  - `src/compartido/componentes/ui/file-upload.tsx`


## 2026-04-19

### Gerardo Breard
- **19:11** `0c9ef18` — docs: registrar T-05 protocolo validación funcional equipo interdisciplinario
  - `.claude/specs/V3_BACKLOG.md`

- **18:41** `57163b2` — docs: registrar estrategia de testing interdisciplinario en V3_BACKLOG
  - `.claude/specs/V3_BACKLOG.md`

- **18:14** `ab177b1` — docs: completar V3_BACKLOG con análisis completo de estándares de industria
  - `.claude/specs/V3_BACKLOG.md`

- **17:59** `b1da3f3` — docs: registrar I-01 separación de ambientes en V3_BACKLOG
  - `.claude/specs/V3_BACKLOG.md`


## 2026-04-18

### Gerardo Breard
- **14:36** `97a9b8c` — docs: registrar S-01 auditoría cookies NextAuth en V3_BACKLOG
  - `.claude/specs/V3_BACKLOG.md`

- **14:34** `389f948` — docs: registrar P-03 auditoría performance completa en V3_BACKLOG
  - `.claude/specs/V3_BACKLOG.md`

- **14:31** `970ea08` — docs: documentar resultados de performance fixes en V3_BACKLOG
  - `.claude/specs/V3_BACKLOG.md`

- **14:29** `3dad7a2` — test: agregar script de performance checks (TTFB + paginación)
  - `tools/perf-check.js`

- **14:22** `c8844b3` — docs: agregar P-02 Prisma Accelerate y registrar fixes V2 en backlog
  - `.claude/specs/V3_BACKLOG.md`

- **14:20** `9b2aec8` — perf: agregar paginación al directorio — 12 talleres por página
  - `src/app/(public)/directorio/page.tsx`

- **14:16** `1b9c8cf` — perf: paralelizar 5 queries secuenciales en dashboard taller
  - `src/app/(taller)/taller/page.tsx`

- **14:14** `0c17f02` — perf: instalar Vercel Analytics y Speed Insights
  - `package-lock.json`
  - `package.json`
  - `src/app/layout.tsx`


## 2026-04-17

### Gerardo Breard
- **19:50** `c94c889` — docs: mover proximo-nivel a V3 y registrar en backlog
  - `.claude/specs/V3_BACKLOG.md`
  - `.claude/specs/v3-proximo-nivel-dashboard.md`

- **19:41** `2e74fd1` — docs: iniciar backlog V3 con aprendizajes de V2
  - `.claude/specs/V3_BACKLOG.md`

- **19:01** `0dc6544` — fix: texto condicional en botón del wizard — "Actualizar" si ya completó, "Completar" si no (#39)
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`

- **18:52** `464d1eb` — feat: agregar campo website al modelo Taller (#42)
  - `prisma/migrations/20260417190000_add_website_taller/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(taller)/taller/perfil/editar/editar-form.tsx`
  - `src/app/api/talleres/[id]/route.ts`

- **18:33** `6176090` — fix: cards de contacto responsive en mobile — grid 1col en mobile, 2col en desktop (#41)
  - `src/app/(admin)/admin/marcas/[id]/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`

- **16:14** `d315a11` — docs: agregar QA spec v2-estandarizacion-ubicacion
  - `.claude/auditorias/QA_v2-estandarizacion-ubicacion.md`

- **16:05** `3734b17` — feat: estandarizar ubicación con provincias y partidos INDEC (#38)
  - `.claude/specs/v2-estandarizacion-ubicacion.md`
  - `prisma/migrations/20260417180000_estandarizar_ubicacion_taller/migration.sql`
  - `prisma/schema.prisma`
  - `prisma/seed.ts`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(admin)/admin/talleres/page.tsx`
  - `src/app/(estado)/estado/sector/page.tsx`
  - `src/app/(public)/directorio/page.tsx`
  - `src/app/(taller)/taller/perfil/editar/editar-form.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`
  - `src/app/api/talleres/[id]/route.ts`
  - `src/app/api/talleres/route.ts`
  - `src/compartido/componentes/ubicacion-selector.tsx`
  - `src/compartido/data/ubicaciones-ar.json`

- **15:01** `0e0bbfe` — fix: agregar boton de issue en Eje 4 y Eje 5 del generador QA
  - `tools/generate-qa.js`

- **14:53** `1c0607e` — docs: documentar flujo QA interactivo en CLAUDE.md
  - `CLAUDE.md`

- **14:34** `ded020c` — docs: agregar QA spec v2-actividad-contextual-pedidos
  - `.claude/auditorias/QA_v2-actividad-contextual-pedidos.md`

- **14:25** `2cd0a0f` — fix: corregir numeración de pasos en comentarios del wizard (#35)
  - `src/app/(taller)/taller/perfil/completar/page.tsx`

- **14:18** `d08bb0a` — feat: actividad contextual en pedidos — timeline por entidad (#33)
  - `src/app/(admin)/admin/notificaciones/page.tsx`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/[id]/page.tsx`
  - `src/app/api/cotizaciones/[id]/route.ts`
  - `src/app/api/cotizaciones/route.ts`
  - `src/app/api/ordenes/[id]/route.ts`
  - `src/app/api/pedidos/[id]/route.ts`
  - `src/compartido/componentes/activity-timeline.tsx`

- **12:50** `6f8c158` — fix: notificaciones sin link ahora son clickeables con expand/collapse (#27)
  - `src/app/(public)/cuenta/notificaciones/notificaciones-lista.tsx`

- **12:42** `d39162a` — fix: agregar tabs Comunicaciones/Historial en /cuenta/notificaciones (#34)
  - `src/app/(public)/cuenta/notificaciones/notificaciones-lista.tsx`
  - `src/app/(public)/cuenta/notificaciones/page.tsx`

- **12:09** `3ccbaf0` — fix: agregar acceso visible a notificaciones desde header y layout público (#28-#32)
  - `src/app/(public)/layout.tsx`
  - `src/compartido/componentes/layout/header.tsx`


## 2026-04-16

### Gerardo Breard
- **12:49** `b0ecb97` — docs: agregar etiqueta DEV y nota de cambio de usuario en TEMPLATE_QA
  - `.claude/auditorias/TEMPLATE_QA.md`

- **12:42** `e51ad40` — fix: validar que fechaObjetivo no sea pasada en backend y frontend (#26)
  - `src/app/(marca)/marca/pedidos/nuevo/nuevo-pedido-form.tsx`
  - `src/app/api/pedidos/route.ts`

- **12:08** `49977b5` — fix: KPIs de marca/pedidos contaban sobre resultados filtrados (#24)
  - `src/app/(marca)/marca/pedidos/page.tsx`

- **11:54** `397c2c7` — fix: expandir card de orden y eliminar link PDF roto en marca (#23)
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`

- **11:45** `1c01218` — fix: agregar navegación entre pedidos recibidos y disponibles (#21)
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
  - `src/app/(taller)/taller/pedidos/page.tsx`

- **11:32** `90ee763` — fix: agregar desglose de puntaje por certificación en admin (#12)
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`

- **11:27** `a2f0c36` — fix: mostrar certificados de academia en taller/perfil (#11)
  - `src/app/(taller)/taller/perfil/page.tsx`

- **11:19** `4c2760a` — fix: quiz mostraba opciones sin enunciado — campo pregunta vs texto (#10)
  - `src/app/(taller)/taller/aprender/[id]/page.tsx`

- **11:11** `0b74e72` — fix: .vercelignore excluía ruta /api/upload/imagenes del deploy (#22)
  - `.vercelignore`


## 2026-04-15

### Gerardo Breard
- **17:26** `c725c8d` — fix: mostrar nombre de usuario en header admin (#7)
  - `src/app/(admin)/layout.tsx`

- **17:26** `65ae5f7` — fix: toast de confirmación al subir documento (#6)
  - `src/taller/componentes/upload-button.tsx`

- **17:25** `06f15c2` — fix: agregar portfolioFotos al seed e imágenes placeholder (#3)
  - `prisma/seed.ts`
  - `public/images/portfolio/taller-aguja-1.svg`
  - `public/images/portfolio/taller-aguja-2.svg`
  - `public/images/portfolio/taller-cortesur-1.svg`
  - `public/images/portfolio/taller-cortesur-2.svg`
  - `public/images/portfolio/taller-cortesur-3.svg`
  - `public/images/portfolio/taller-cortesur-4.svg`
  - `public/images/portfolio/taller-hilos-1.svg`
  - `public/images/portfolio/taller-hilos-2.svg`
  - `public/images/portfolio/taller-hilos-3.svg`

- **15:43** `bcda56a` — fix: CORS preflight 500 en /api/feedback
  - `src/app/api/feedback/route.ts`

- **15:09** `7f25a29` — feat: GitHub Pages + botón crear issue para QA interactivos
  - `.claude/specs/v2-generador-qa-issues.md`
  - `.github/workflows/qa-pages.yml`
  - `src/app/api/feedback/route.ts`
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`

- **14:42** `29e4c35` — feat: agregar comando --index al generador QA
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`

- **14:33** `49ee518` — feat: generador QA .md → .html interactivo (tools/generate-qa.js)
  - `.gitignore`
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`

- **14:23** `a7d0e95` — docs: spec v2-generador-qa-html con correcciones de formato real
  - `.claude/specs/v2-generador-qa-html.md`

- **13:22** `a494abf` — fix: await fetch a GitHub en endpoint de feedback
  - `src/app/api/feedback/route.ts`

- **10:58** `b98f4f8` — docs: agregar QA v2-impl-contenido-visual
  - `.claude/auditorias/QA_v2-impl-contenido-visual.md`


## 2026-04-14

### Gerardo Breard
- **18:12** `ca54c06` — feat: v2-impl-contenido-visual — portfolio, imagenes en pedidos y cotizaciones
  - `.gitignore`
  - `prisma/migrations/20260414220000_contenido_visual_imagenes/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(marca)/marca/directorio/page.tsx`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(marca)/marca/pedidos/nuevo/nuevo-pedido-form.tsx`
  - `src/app/(marca)/marca/pedidos/nuevo/page.tsx`
  - `src/app/(public)/directorio/page.tsx`
  - `src/app/(public)/perfil/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`
  - `src/app/api/cotizaciones/route.ts`
  - `src/app/api/pedidos/route.ts`
  - `src/app/api/talleres/[id]/route.ts`
  - `src/app/api/upload/imagenes/route.ts`
  - `src/compartido/componentes/ui/file-upload.tsx`
  - `src/compartido/componentes/ui/image-lightbox.tsx`
  - `src/compartido/lib/storage.ts`
  - `src/compartido/lib/upload-imagen.ts`
  - `src/marca/componentes/cotizacion-imagenes.tsx`
  - `src/taller/componentes/cotizar-form.tsx`
  - `src/taller/componentes/galeria-fotos.tsx`
  - `src/taller/componentes/portfolio-manager.tsx`

- **17:38** `469654b` — docs: agregar QA v2-seguridad-tests-e2e
  - `.claude/auditorias/QA_v2-seguridad-tests-e2e.md`

- **17:35** `2f7407b` — feat: v2-seguridad-tests-e2e — fix falsos positivos, helper assertAccesoBloqueado, 10 tests nuevos
  - `e2e/checklist-sec7-8.spec.ts`
  - `e2e/helpers/auth.ts`
  - `e2e/seguridad-roles.spec.ts`

- **17:24** `2cada9d` — docs: agregar QA v2-epica-academia
  - `.claude/auditorias/QA_v2-epica-academia.md`

- **17:15** `ac76919` — feat: v2-epica-academia — gate real de videos, fix puntaje bypass, manejo 403
  - `src/app/api/colecciones/[id]/evaluacion/route.ts`
  - `src/app/api/colecciones/[id]/progreso/route.ts`
  - `src/taller/componentes/academia-cliente.tsx`

- **17:01** `fbc3323` — docs: agregar QA v2-epica-perfil-productivo
  - `.claude/auditorias/QA_v2-epica-perfil-productivo.md`

- **16:57** `1f8d531` — feat: v2-epica-perfil-productivo — fix puntaje wizard, perfil productivo, recomendaciones, dashboard sector
  - `prisma/migrations/20260414200000_add_coleccion_recomendacion_targets/migration.sql`
  - `prisma/schema.prisma`
  - `prisma/seed.ts`
  - `src/app/(estado)/estado/sector/page.tsx`
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/(taller)/taller/perfil/completar/page.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`
  - `src/compartido/componentes/layout/header.tsx`

- **16:30** `b9698e2` — docs: agregar QA v2-epica-perfiles-contacto
  - `.claude/auditorias/QA_v2-epica-perfiles-contacto.md`

- **16:22** `89bce8b` — feat: v2-epica-perfiles-contacto — edición básica taller, contacto en admin, fix puntaje
  - `src/app/(admin)/admin/marcas/[id]/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(taller)/taller/perfil/editar/editar-form.tsx`
  - `src/app/(taller)/taller/perfil/editar/page.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`
  - `src/app/api/talleres/[id]/route.ts`

- **15:42** `75cef2d` — docs: agregar QA v2-notificaciones-accionables
  - `.claude/auditorias/QA_v2-notificaciones-accionables.md`

- **15:40** `e687d5a` — feat: v2-notificaciones-accionables — deep links + mark-as-read al click
  - `prisma/migrations/20260414180000_add_notificacion_link/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(admin)/admin/notificaciones/notificaciones-client.tsx`
  - `src/app/(public)/cuenta/notificaciones/notificaciones-lista.tsx`
  - `src/app/(public)/cuenta/notificaciones/page.tsx`
  - `src/app/api/admin/notificaciones/route.ts`
  - `src/app/api/cotizaciones/[id]/route.ts`
  - `src/app/api/cotizaciones/route.ts`
  - `src/app/api/pedidos/[id]/invitaciones/route.ts`
  - `src/compartido/lib/notificaciones.ts`

- **15:22** `b0bf4e9` — docs: agregar QA v2-epica-notificaciones
  - `.claude/auditorias/QA_v2-epica-notificaciones.md`

- **15:19** `871ffcd` — feat: v2-epica-notificaciones — centro de comunicaciones + historial
  - `prisma/migrations/20260414170000_notificacion_created_by_batch/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(admin)/admin/notificaciones/notificaciones-client.tsx`
  - `src/app/(admin)/admin/notificaciones/page.tsx`
  - `src/app/(public)/cuenta/page.tsx`
  - `src/app/api/admin/notificaciones/route.ts`
  - `src/compartido/lib/email.ts`

- **14:18** `e6c28b4` — docs: agregar QA v2-rag-corpus-real
  - `.claude/auditorias/QA_v2-rag-corpus-real.md`

- **14:18** `1d6d7cb` — feat: v2-rag-corpus-real — limpiar corpus falso, conectar config admin, fallback visual
  - `package-lock.json`
  - `package.json`
  - `scripts/indexar-corpus.ts`
  - `src/app/(taller)/taller/aprender/[id]/page.tsx`
  - `src/app/api/chat/route.ts`
  - `src/app/globals.css`
  - `src/compartido/lib/rag.ts`
  - `src/taller/componentes/asistente-chat.tsx`

- **13:05** `f48d1b8` — fix: actualizar commit hash en QA v2-log-niveles-bidireccional
  - `.claude/auditorias/QA_v2-log-niveles-bidireccional.md`

- **13:05** `1221239` — docs: agregar QA v2-log-niveles-bidireccional
  - `.claude/auditorias/QA_v2-log-niveles-bidireccional.md`
  - `src/app/(estado)/estado/page.tsx`
  - `src/app/(taller)/taller/page.tsx`

- **12:21** `74c20f8` — fix: actualizar commit hash en QA v2-epica-flujo-comercial-unificado
  - `.claude/auditorias/QA_v2-epica-flujo-comercial-unificado.md`

- **12:21** `74ee26f` — docs: agregar QA v2-epica-flujo-comercial-unificado
  - `.claude/auditorias/QA_v2-epica-flujo-comercial-unificado.md`
  - `prisma/migrations/20260414160000_flujo_comercial_unificado/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
  - `src/app/api/cotizaciones/[id]/route.ts`
  - `src/app/api/cotizaciones/route.ts`
  - `src/app/api/pedidos/[id]/invitaciones/route.ts`
  - `src/app/api/pedidos/[id]/ordenes/route.ts`
  - `src/compartido/lib/email.ts`
  - `src/marca/componentes/asignar-taller.tsx`
  - `src/marca/componentes/invitar-a-cotizar.tsx`


## 2026-04-13

### Gerardo Breard
- **17:04** `6b94016` — fix: actualizar commit hash en QA v2-epica-storage-documentos
  - `.claude/auditorias/QA_v2-epica-storage-documentos.md`

- **16:37** `fed7a93` — docs: agregar QA v2-epica-storage-documentos
  - `.claude/auditorias/QA_v2-epica-storage-documentos.md`
  - `prisma/migrations/20260413160000_storage_documentos_v2/migration.sql`
  - `prisma/schema.prisma`
  - `prisma/seed.ts`
  - `src/__tests__/nivel.test.ts`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(taller)/taller/formalizacion/page.tsx`
  - `src/app/api/auth/registro/route.ts`
  - `src/app/api/tipos-documento/route.ts`
  - `src/app/api/validaciones/route.ts`
  - `src/compartido/lib/nivel.ts`

- **15:44** `6ccc569` — docs: agregar QA v2-config-piloto-pre-deploy con instructivo de uso
  - `.claude/auditorias/QA_v2-config-piloto-pre-deploy.md`

- **15:16** `ccf8643` — fix: corregir tildes en nombres de usuarios seed en acceso-rapido
  - `src/app/(auth)/acceso-rapido/page.tsx`

- **14:27** `8642713` — docs: agregar template QA con credenciales correctas
  - `.claude/auditorias/TEMPLATE_QA.md`

- **14:07** `be81aed` — feat: feedback widget funciona sin autenticación para auditorías QA
  - `src/app/api/feedback/route.ts`
  - `src/compartido/componentes/feedback-widget-wrapper.tsx`
  - `src/compartido/componentes/feedback-widget.tsx`

- **13:41** `4ce51cc` — docs: actualizar ORDEN_IMPLEMENTACION para modalidad v2 Gerardo-solo
  - `.claude/specs/ORDEN_IMPLEMENTACION.md`

- **13:27** `acde86d` — specs: agregar v2-impl-contenido-visual
  - `.claude/specs/v2-impl-contenido-visual.md`

- **12:51** `13c0ad8` — specs: agregar v2-rag-corpus-real
  - `.claude/specs/v2-rag-corpus-real.md`

- **08:43** `592de2d` — specs: agregar v2-notificaciones-accionables
  - `.claude/specs/v2-notificaciones-accionables.md`


## 2026-04-12

### Gerardo Breard
- **08:59** `8c8a36d` — specs: agregar v2-epica-perfiles-contacto
  - `.claude/specs/v2-epica-perfiles-contacto.md`


## 2026-04-11

### Gerardo Breard
- **18:32** `efe59c4` — specs: agregar v2-epica-storage-documentos
  - `.claude/specs/v2-epica-storage-documentos.md`

- **17:23** `d21386b` — specs: agregar v2-log-niveles-bidireccional
  - `.claude/specs/v2-log-niveles-bidireccional.md`

- **16:56** `cdcd130` — specs: agregar v2-epica-flujo-comercial-unificado
  - `.claude/specs/v2-epica-flujo-comercial-unificado.md`

- **16:12** `90cea52` — specs: agregar v2-seguridad-tests-e2e
  - `.claude/specs/v2-seguridad-tests-e2e.md`

- **15:41** `5bc0950` — specs: agregar v2-config-piloto-pre-deploy
  - `.claude/specs/v2-config-piloto-pre-deploy.md`

- **12:55** `c33f0c4` — specs: agregar v2-epica-notificaciones
  - `.claude/specs/v2-epica-notificaciones.md`

- **11:07** `6a1b695` — specs: agregar v2-epica-academia
  - `.claude/specs/v2-epica-academia.md`

- **10:36** `455b73c` — specs: actualizar v2-epica-perfil-productivo con ajustes de factibilidad
  - `.claude/specs/v2-epica-perfil-productivo.md`


## 2026-04-07

### Gerardo Breard
- **18:36** `cb8851b` — docs: actualizar epica contenido visual — wireframes, eliminar presupuesto de pedido
  - `.claude/specs/v2-epica-contenido-visual.md`

- **18:15** `483dcca` — docs: validacion v2 — 24 hallazgos, propuesta soluciones, flujo comercial unificado, contenido visual
  - `.claude/specs/v2-decision-flujo-comercial-unificado.md`
  - `.claude/specs/v2-epica-contenido-visual.md`
  - `.claude/specs/v2-hallazgos-validacion.md`
  - `.claude/specs/v2-propuesta-soluciones.md`
  - `e2e/checklist-sec1-2.spec.ts`
  - `e2e/checklist-sec3-4.spec.ts`
  - `e2e/checklist-sec5-6.spec.ts`
  - `e2e/checklist-sec7-8.spec.ts`
  - `e2e/checklist-sec9-10.spec.ts`


## 2026-04-05

### Gerardo Breard
- **19:56** `abec3b1` — fix: aria-label en indicadores de notificacion sin leer
  - `src/app/(admin)/admin/notificaciones/page.tsx`
  - `src/app/(contenido)/contenido/notificaciones/page.tsx`

- **19:53** `fb99d9b` — fix: estados de carga y vacios en 5 paginas admin — usuarios, talleres, marcas, pedidos, dashboard
  - `src/app/(admin)/admin/dashboard/page.tsx`
  - `src/app/(admin)/admin/marcas/page.tsx`
  - `src/app/(admin)/admin/pedidos/page.tsx`
  - `src/app/(admin)/admin/talleres/page.tsx`
  - `src/app/(admin)/admin/usuarios/page.tsx`

- **19:46** `97037a7` — fix: unificar hover de brand-blue — token brand-blue-hover en 10 archivos
  - `src/app/(marca)/marca/directorio/page.tsx`
  - `src/app/(marca)/marca/pedidos/nuevo/page.tsx`
  - `src/app/(marca)/marca/pedidos/page.tsx`
  - `src/app/(marca)/marca/perfil/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
  - `src/app/error.tsx`
  - `src/app/globals.css`
  - `src/app/not-found.tsx`
  - `src/app/page.tsx`
  - `src/app/unauthorized/page.tsx`

- **19:36** `22371e2` — fix: 13 issues criticos UI — responsive grids mobile + aria-labels accesibilidad
  - `src/app/(admin)/admin/auditorias/page.tsx`
  - `src/app/(admin)/admin/certificados/page.tsx`
  - `src/app/(admin)/admin/dashboard/page.tsx`
  - `src/app/(admin)/admin/marcas/page.tsx`
  - `src/app/(admin)/admin/notificaciones/page.tsx`
  - `src/app/(admin)/admin/pedidos/page.tsx`
  - `src/app/(admin)/admin/talleres/page.tsx`
  - `src/app/(admin)/admin/usuarios/page.tsx`
  - `src/app/(contenido)/contenido/notificaciones/page.tsx`
  - `src/app/(marca)/marca/page.tsx`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(public)/directorio/page.tsx`
  - `src/app/(public)/perfil-marca/[id]/page.tsx`
  - `src/app/(taller)/taller/aprender/page.tsx`
  - `src/app/page.tsx`

- **17:24** `d4bcfc6` — docs: agregar instrucciones completas para Sergio
  - `.claude/specs/instrucciones-sergio.md`

- **17:09** `09d4c27` — docs: agregar 46 items de experiencia por actor al checklist — total 196 items
  - `.claude/specs/semana4-checklist-sergio.md`

- **17:04** `f75f263` — fix: 4 gaps criticos de actores — dashboard marca, estado accede auditorias, admin sin 404s, denunciar en footer
  - `src/app/(admin)/layout.tsx`
  - `src/app/(auth)/acceso-rapido/page.tsx`
  - `src/app/(auth)/registro/page.tsx`
  - `src/app/(marca)/marca/page.tsx`
  - `src/app/page.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `src/middleware.ts`

- **16:42** `3935d54` — docs: agregar 68 items de flujos entre actores al checklist de Sergio — total 150 items
  - `.claude/specs/semana4-checklist-sergio.md`

- **16:35** `8f6183f` — fix: 4 gaps de flujos — aplicarNivel en APIs, contenido accede a colecciones admin, crear acciones correctivas
  - `src/app/(admin)/admin/auditorias/[id]/informe-client.tsx`
  - `src/app/api/auditorias/[id]/route.ts`
  - `src/app/api/colecciones/[id]/evaluacion/route.ts`
  - `src/app/api/validaciones/[id]/route.ts`
  - `src/middleware.ts`

- **16:08** `5f03ad2` — docs: checklist de validacion manual para Sergio — 82 items por funcion
  - `.claude/specs/semana4-checklist-sergio.md`

- **16:04** `2db6dff` — fix: AFIP no bloquea registro si no responde — verificadoAfip refleja estado real
  - `src/app/api/auth/registro/route.ts`

- **13:50** `9a69fe9` — feat: conectar paginas CONTENIDO a datos reales — colecciones, evaluaciones, notificaciones
  - `src/app/(contenido)/contenido/colecciones/page.tsx`
  - `src/app/(contenido)/contenido/evaluaciones/page.tsx`
  - `src/app/(contenido)/contenido/notificaciones/page.tsx`

- **12:52** `58fa295` — feat: agregar usuario CONTENIDO al seed y acceso rapido
  - `prisma/seed.ts`
  - `src/app/(auth)/acceso-rapido/page.tsx`

- **12:32** `2eb098d` — feat: seed completo — pedidos publicados, cotizaciones, auditorias, denuncias, notificaciones, flags E2 activos
  - `prisma/seed.ts`

- **12:16** `a484f03` — feat: pagina acceso rapido — login de un click por rol para el piloto
  - `src/app/(auth)/acceso-rapido/page.tsx`
  - `src/middleware.ts`

- **12:06** `451fd1c` — feat: feedback con entidad parseada, pagina admin/feedback, link sidebar + tests E2E
  - `e2e/admin.spec.ts`
  - `src/app/(admin)/admin/feedback/page.tsx`
  - `src/app/(admin)/layout.tsx`
  - `src/app/api/feedback/route.ts`
  - `src/compartido/componentes/feedback-widget.tsx`

- **11:59** `88cef62` — specs: actualizar semana3-feedback-widget con contexto de entidad y vista admin
  - `.claude/specs/semana3-feedback-widget.md`

- **11:45** `f8b0df5` — test: agregar E2E admin — feature flags tab, toggles E1/E2, banner email
  - `e2e/admin.spec.ts`

- **08:44** `b10d7d8` — feat: feedback widget — API + widget flotante + GitHub issues + tests E2E
  - `.env.example`
  - `e2e/feedback.spec.ts`
  - `src/app/api/feedback/route.ts`
  - `src/app/layout.tsx`
  - `src/compartido/componentes/feedback-widget-wrapper.tsx`
  - `src/compartido/componentes/feedback-widget.tsx`

- **08:39** `543a958` — specs: agregar semana3-feedback-widget
  - `.claude/specs/semana3-feedback-widget.md`

- **08:28** `812f77c` — fix: selector ambiguo en test pedidos disponibles
  - `e2e/pedidos.spec.ts`

- **08:24** `2daeae6` — feat: vistas cotizaciones — aceptar/rechazar en marca, seccion cotizaciones recibidas
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/marca/componentes/aceptar-cotizacion.tsx`
  - `src/marca/componentes/rechazar-cotizacion.tsx`

- **08:21** `9097ef3` — feat: publicacion pedidos UI — boton publicar, marketplace disponibles, cotizar form + tests E2E
  - `e2e/pedidos.spec.ts`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `src/marca/componentes/publicar-pedido.tsx`
  - `src/taller/componentes/cotizar-form.tsx`

- **08:15** `62bf10e` — feat: registro 3 pasos — unificar entidad, auto-login, step indicator dinamico + tests E2E
  - `e2e/registro.spec.ts`
  - `src/app/(auth)/registro/page.tsx`

- **08:10** `fdb9e4f` — feat: gamificacion — lenguaje taller, info contextual, beneficio proximo, banner nivel + tests E2E
  - `e2e/taller.spec.ts`
  - `src/app/(taller)/taller/formalizacion/page.tsx`
  - `src/app/(taller)/taller/page.tsx`

- **08:03** `2eaf845` — feat: layout contenido — sidebar, 3 paginas stub, auth guard + tests E2E
  - `e2e/contenido.spec.ts`
  - `src/app/(contenido)/contenido-sidebar.tsx`
  - `src/app/(contenido)/contenido/colecciones/page.tsx`
  - `src/app/(contenido)/contenido/evaluaciones/page.tsx`
  - `src/app/(contenido)/contenido/notificaciones/page.tsx`
  - `src/app/(contenido)/contenido/page.tsx`
  - `src/app/(contenido)/layout.tsx`

- **08:00** `cd32865` — feat: dashboard estado UI — 3 secciones con metricas del sector + tests E2E
  - `e2e/estado.spec.ts`
  - `e2e/helpers/auth.ts`
  - `src/app/(estado)/estado/page.tsx`

- **07:54** `356caef` — test: agregar E2E marca ve boton contactar en perfil taller
  - `e2e/marca.spec.ts`

- **07:52** `a92d220` — feat: whatsapp con contexto + perfil minimo marca antes de contactar
  - `src/app/(marca)/marca/directorio/[id]/page.tsx`
  - `src/marca/componentes/contactar-taller.tsx`

- **07:49** `ffa6269` — fix: resolver conflicto de slugs [codigo]/[id] en certificados — desbloquea NextAuth
  - `e2e/taller.spec.ts`
  - `src/app/api/certificados/[codigo]/route.ts`
  - `src/app/api/certificados/[id]/route.ts`

- **07:33** `3e874bc` — feat: stubs admin email + perfil publico con prendas, certificados y descripcion
  - `src/app/(admin)/admin/integraciones/email/page.tsx`
  - `src/app/(public)/perfil/[id]/page.tsx`

- **07:30** `2af5c97` — fix: playwright — corregir selectores, soporte BASE_URL, documentar issue NextAuth dev
  - `e2e/helpers/auth.ts`
  - `e2e/publico.spec.ts`
  - `playwright.config.ts`

- **07:21** `099aff4` — feat: setup Playwright — config, helpers, 14 tests E2E (3 publicos pasan, 11 auth pendientes)
  - `.gitignore`
  - `e2e/auth.spec.ts`
  - `e2e/helpers/auth.ts`
  - `e2e/marca.spec.ts`
  - `e2e/publico.spec.ts`
  - `e2e/taller.spec.ts`
  - `package.json`
  - `playwright.config.ts`

- **07:07** `beaf411` — specs: agregar semana1-playwright-setup
  - `.claude/specs/semana1-playwright-setup.md`

- **06:57** `ca382f1` — feat: chat RAG UI — asistente embebido en pagina de curso
  - `src/app/(taller)/taller/aprender/[id]/page.tsx`
  - `src/taller/componentes/asistente-chat.tsx`

- **06:53** `7c64b49` — feat: auditoria detalle — pagina de informe con estado, resultado y hallazgos
  - `src/app/(admin)/admin/auditorias/[id]/informe-client.tsx`
  - `src/app/(admin)/admin/auditorias/[id]/page.tsx`

- **06:45** `1bbfc62` — fix: agregar /denunciar y /consultar-denuncia a rutas publicas del middleware
  - `src/middleware.ts`

- **06:42** `234f5ce` — feat: UI denuncia publica — formulario, consulta por codigo, links en ayuda
  - `src/app/(public)/ayuda/page.tsx`
  - `src/app/(public)/consultar-denuncia/page.tsx`
  - `src/app/(public)/denunciar/page.tsx`

- **06:36** `d71cd54` — feat: directorio publico con filtros de nivel, proceso, prenda y texto
  - `src/app/(public)/directorio/page.tsx`

- **06:36** `570d973` — feat: landing con dos entradas — eliminar card Estado, CTAs con rol
  - `src/app/page.tsx`

- **06:19** `ff1bc04` — fix: feature flag retorna true si no existe en DB (opt-out)
  - `src/compartido/lib/features.ts`

- **06:13** `b1a7075` — docs: actualizar ORDEN_IMPLEMENTACION con estado de semana 3
  - `.claude/specs/ORDEN_IMPLEMENTACION.md`

- **06:13** `c57a652` — feat: exportes estado — 7 tipos de reporte con filtro de periodo
  - `src/app/(estado)/estado/exportar/page.tsx`
  - `src/app/api/exportar/route.ts`

- **06:13** `ab97320` — feat: acuerdos comerciales — PDF orden de manufactura
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/[id]/page.tsx`
  - `src/app/api/ordenes/[id]/pdf/route.tsx`
  - `src/compartido/componentes/pdf/orden-pdf.tsx`

- **06:12** `ca44365` — feat: feature flags — helper, seed, tab admin y puntos de control
  - `prisma/seed.ts`
  - `src/app/(admin)/admin/configuracion/page.tsx`
  - `src/app/(public)/directorio/page.tsx`
  - `src/app/(taller)/taller/aprender/page.tsx`
  - `src/app/api/denuncias/route.ts`
  - `src/compartido/lib/features.ts`
  - `src/compartido/lib/notificaciones.ts`

- **05:52** `78a68d9` — specs: agregar semana1-feature-flags
  - `.claude/specs/semana1-feature-flags.md`

- **05:41** `7577bce` — specs: agregar semana4-testing-checklist
  - `.claude/specs/semana4-testing-checklist.md`

- **05:38** `b3cda5b` — specs: agregar semana3-stubs-perfil-publico
  - `.claude/specs/semana3-stubs-perfil-publico.md`

- **05:33** `cb2dc72` — specs: agregar semana3-vistas-cotizaciones
  - `.claude/specs/semana3-vistas-cotizaciones.md`

- **05:28** `8613422` — specs: agregar semana3-auditoria-detalle
  - `.claude/specs/semana3-auditoria-detalle.md`

- **05:24** `b36b0df` — specs: agregar semana3-denuncia-publica
  - `.claude/specs/semana3-denuncia-publica.md`

- **05:19** `1a3b26f` — specs: agregar semana3-directorio-publico
  - `.claude/specs/semana3-directorio-publico.md`

- **05:14** `36877ac` — specs: agregar semana3-whatsapp-perfil-marca
  - `.claude/specs/semana3-whatsapp-perfil-marca.md`

- **05:09** `bb257f7` — specs: agregar semana3-chat-rag-ui
  - `.claude/specs/semana3-chat-rag-ui.md`

- **05:01** `f3f9fbf` — specs: actualizar semana3-acuerdos-comerciales con ajustes de factibilidad
  - `.claude/specs/semana3-acuerdos-comerciales.md`

- **04:53** `42d5682` — specs: agregar semana3-exportes-estado
  - `.claude/specs/semana3-exportes-estado.md`

- **04:43** `e86f5dd` — feat: notificaciones talleres compatibles
  - `src/app/api/pedidos/[id]/route.ts`
  - `src/compartido/lib/email.ts`
  - `src/compartido/lib/notificaciones.ts`

- **04:39** `c293954` — feat: PDF y QR certificados
  - `src/app/(admin)/admin/certificados/page.tsx`
  - `src/app/(taller)/taller/aprender/[id]/page.tsx`
  - `src/app/api/certificados/[id]/pdf/route.tsx`
  - `src/app/api/colecciones/[id]/evaluacion/route.ts`
  - `src/compartido/componentes/pdf/certificado-pdf.tsx`
  - `src/taller/componentes/academia-cliente.tsx`

- **04:28** `4e6e248` — feat: RAG infraestructura y pipeline
  - `.env.example`
  - `package-lock.json`
  - `package.json`
  - `prisma/migrations/20260405072000_agregar_documento_rag/migration.sql`
  - `prisma/schema.prisma`
  - `scripts/indexar-corpus.ts`
  - `src/app/(admin)/admin/integraciones/llm/page.tsx`
  - `src/app/api/admin/config/route.ts`
  - `src/app/api/admin/rag/[id]/route.ts`
  - `src/app/api/admin/rag/route.ts`
  - `src/app/api/chat/route.ts`
  - `src/compartido/lib/rag.ts`

- **04:20** `4178e38` — feat: API cotizaciones
  - `src/app/api/cotizaciones/[id]/route.ts`
  - `src/app/api/cotizaciones/route.ts`
  - `src/compartido/lib/email.ts`
  - `src/compartido/lib/notificaciones.ts`

- **04:16** `52c99b3` — feat: queries dashboard estado
  - `prisma/migrations/20260405071500_agregar_indices_dashboard_estado/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(estado)/estado/page.tsx`
  - `src/app/api/certificados/route.ts`
  - `src/compartido/lib/nivel.ts`
  - `src/middleware.ts`

- **04:07** `7bf203f` — feat: agregar estado PUBLICADO y modelo Cotizacion
  - `prisma/migrations/20260405070321_agregar_publicado_y_cotizaciones/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(admin)/admin/marcas/[id]/page.tsx`
  - `src/app/(admin)/admin/pedidos/page.tsx`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(marca)/marca/pedidos/page.tsx`
  - `src/app/api/pedidos/[id]/route.ts`

- **03:58** `02afbf6` — feat: Google OAuth y magic link
  - `.env.example`
  - `package-lock.json`
  - `package.json`
  - `prisma/migrations/20260405064329_agregar_registro_completo_user/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(admin)/admin/usuarios/page.tsx`
  - `src/app/(auth)/login/page.tsx`
  - `src/app/(auth)/registro/completar/page.tsx`
  - `src/app/api/admin/usuarios/route.ts`
  - `src/app/api/auth/registro/completar/route.ts`
  - `src/compartido/lib/auth.config.ts`
  - `src/compartido/lib/auth.ts`
  - `src/compartido/lib/email.ts`
  - `src/compartido/types/next-auth.d.ts`
  - `src/middleware.ts`

- **03:38** `d7776d1` — feat: integrar AfipSDK
  - `.env.example`
  - `package-lock.json`
  - `package.json`
  - `prisma/migrations/20260405063537_agregar_verificado_afip_marca/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(auth)/registro/page.tsx`
  - `src/app/api/auth/registro/route.ts`
  - `src/app/api/auth/verificar-cuit/route.ts`
  - `src/compartido/lib/afip.ts`

- **03:32** `3e49900` — feat: agregar rol CONTENIDO al schema y middleware
  - `prisma/migrations/20260405062904_agregar_rol_contenido/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(admin)/layout.tsx`
  - `src/app/api/colecciones/[id]/evaluacion/route.ts`
  - `src/app/api/colecciones/[id]/route.ts`
  - `src/app/api/colecciones/[id]/videos/route.ts`
  - `src/app/api/colecciones/route.ts`
  - `src/compartido/componentes/ui/logout-button.tsx`
  - `src/middleware.ts`

- **03:21** `3daf862` — docs: agregar orden de implementacion con grafo de dependencias
  - `.claude/specs/ORDEN_IMPLEMENTACION.md`
  - `CLAUDE.md`

- **03:05** `f859f28` — specs: actualizar semana3-pdf-qr-certificados con ajustes de factibilidad
  - `.claude/specs/semana3-pdf-qr-certificados.md`

- **02:56** `cc54741` — specs: actualizar semana3-notificaciones-matching con ajustes de factibilidad
  - `.claude/specs/semana3-notificaciones-matching.md`

- **02:35** `e80cabf` — specs: actualizar semana2-publicacion-pedidos-ui con ajustes de factibilidad
  - `.claude/specs/semana2-publicacion-pedidos-ui.md`

- **02:25** `f315401` — specs: actualizar semana2-dashboard-estado-ui con ajustes de factibilidad
  - `.claude/specs/semana2-dashboard-estado-ui.md`

- **02:18** `67f0daa` — specs: actualizar semana2-gamificacion con ajustes de factibilidad
  - `.claude/specs/semana2-gamificacion.md`

- **02:10** `ae15d17` — specs: actualizar semana2-layout-contenido fix iconos serializacion
  - `.claude/specs/semana2-layout-contenido.md`

- **02:02** `bfc6830` — specs: actualizar semana2-rag-decision-pipeline con fixes criticos Voyage AI
  - `.claude/specs/semana2-rag-decision-pipeline.md`

- **01:49** `b105984` — specs: actualizar semana2-api-cotizaciones con ajustes de factibilidad
  - `.claude/specs/semana2-api-cotizaciones.md`

- **01:39** `845c497` — specs: actualizar semana2-queries-dashboard-estado con ajustes de factibilidad
  - `.claude/specs/semana2-queries-dashboard-estado.md`

- **01:29** `b88c4a3` — specs: actualizar semana2-schema-e2 con ajustes de factibilidad
  - `.claude/specs/semana2-schema-e2.md`

- **01:13** `f9bb004` — specs: agregar bloqueos de dependencia en specs de Sergio semana 1
  - `.claude/specs/semana1-infra-contenido.md`
  - `.claude/specs/semana1-registro-3-pasos.md`

- **01:04** `4018f34` — specs: actualizar semana1-oauth-magiclink con fixes criticos de factibilidad
  - `.claude/specs/semana1-oauth-magiclink.md`


## 2026-04-04

### Gerardo Breard
- **18:02** `f30168d` — specs: actualizar semana1-landing-dos-entradas con ajustes de factibilidad
  - `.claude/specs/semana1-landing-dos-entradas.md`

- **17:58** `d745885` — specs: agregar semana1-landing-dos-entradas
  - `.claude/specs/semana1-landing-dos-entradas.md`

- **17:51** `d7941e0` — fix: reescribir hook daily para no depender de tool_output
  - `.claude/hooks/post_tool_use.py`
  - `.gitignore`

- **00:17** `29b0523` — docs: agregar decisiones de diseño a arquitectura E1
  - `.claude/specs/arquitectura-e1.md`
- **12:10** `dfaa2a4` — docs: agregar decisiones de autenticación y registro a arquitectura E1
  - `.claude/specs/arquitectura-e1.md`
- **12:30** `dbde96f` — docs: agregar decisiones de perfil marca y ubicación estandarizada a arquitectura E1
  - `.claude/specs/arquitectura-e1.md`
- **12:34** `6cba1f8` — docs: cerrar decisiones técnicas DT-03 DT-04 DT-05 DT-08
  - `.claude/specs/arquitectura-e1.md`
- **13:16** `f333d7d` — docs: cerrar DT-01 integración ARCA con AfipSDK
  - `.claude/specs/arquitectura-e1.md`
- **13:24** `b53ff4d` — fix: crear bucket documentos en Supabase y corregir upload que pasaba a PENDIENTE sin archivo
  - `.env.example`
  - `src/app/api/validaciones/[id]/upload/route.ts`
- **13:25** `4893cd1` — docs: cerrar DT-02 storage documentos
  - `.claude/specs/arquitectura-e1.md`
- **13:29** `136d25c` — docs: cerrar DT-06 evaluaciones admin
  - `.claude/specs/arquitectura-e1.md`
- **13:41** `00712b8` — docs: cerrar DT-07 flujo asignación taller pedido
  - `.claude/specs/arquitectura-e1.md`
- **13:48** `250a350` — fix: corregir vulnerabilidades de seguridad en API
  - `src/app/api/auth/password-reset/[token]/route.ts`
  - `src/app/api/certificados/route.ts`
  - `src/app/api/colecciones/[id]/evaluacion/route.ts`
  - `src/app/api/colecciones/[id]/progreso/route.ts`
  - `src/app/api/ordenes/[id]/route.ts`
  - `src/app/api/pedidos/[id]/route.ts`
- **13:57** `4df595b` — docs: cerrar DT-09 seguridad API
  - `.claude/specs/arquitectura-e1.md`
- **14:07** `4eaf676` — docs: cerrar DT-10 + schema: agregar modelo NotaInterna
  - `.claude/specs/arquitectura-e1.md`
  - `prisma/migrations/20260404170737_agregar_notas_internas/migration.sql`
  - `prisma/schema.prisma`
- **14:18** `82e14e5` — feat: agregar notas internas para talleres y marcas en admin
  - `src/app/(admin)/admin/marcas/[id]/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/api/admin/notas/route.ts`
- **15:29** `24cbb5a` — docs: registrar estructura definitiva de roles en arquitectura E1
  - `.claude/specs/arquitectura-e1.md`
- **15:42** `a004020` — docs: definir KPIs dashboard Estado para el piloto
  - `.claude/specs/arquitectura-e1.md`
- **16:00** `d6d1ab8` — docs: definir rol Contenido con páginas y métricas de impacto
  - `.claude/specs/arquitectura-e1.md`
- **16:14** `10a15ed` — docs: agregar inventario tareas Escenario 2
  - `.claude/specs/arquitectura-e1.md`
- **16:21** `c1d739c` — docs: planificación completa del mes de desarrollo (4 semanas)
  - `.claude/specs/planificacion-mes.md`
- **16:27** `9f63c6f` — docs: reescribir planificación mes con E1 + E2 completos (requisito OIT)
  - `.claude/specs/planificacion-mes.md`
- **16:42** `5381016` — docs: agregar estructura y reglas de specs al CLAUDE.md
  - `CLAUDE.md`
- **17:10** `d6ac4ea` — specs: semana1-infra-contenido
  - `.claude/specs/semana1-infra-contenido.md`
- **17:21** `819c554` — specs: agregar semana1-afipsdk-cuit
  - `.claude/specs/semana1-afipsdk-cuit.md`


## 2026-04-03

### Gerardo Breard
- **23:18** `68debd8` — test: verificar hook daily
  - `.claude/hooks/post_tool_use.py`
  - `.claude/settings.json`
  - `.claude/specs/sergio-setup.md`
  - `CLAUDE.md`

