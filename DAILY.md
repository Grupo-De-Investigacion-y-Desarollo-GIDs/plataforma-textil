# Daily Log

## 2026-08-10

### Gerardo Breard
- **20:59** `31364af` — fix(seed): restaurar los 6 cursos reales (colecciones+videos) que el reseed pisó con placeholders
  - `prisma/seed.ts`
  - `scripts/seed-cursos.ts`
  - `src/__tests__/seed-cursos.test.ts`

- **17:17** `82edbca` — feat(evento): imágenes demo reseed-safe para las 11 cuentas (talleres + marcas)
  - `docs/EVENTO_DEMO.md`
  - `prisma/seed.ts`
  - `scripts/seed-evento-assets/NOTA_LOGOS_MARCA.md`
  - `scripts/seed-evento-assets/README_PROGRAMADOR.md`
  - `scripts/seed-evento-assets/manifest.json`
  - `scripts/seed-evento-assets/marcas/MAR_001_indumentaria_aurora/MAR_001_01_producto_vestidos.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_001_indumentaria_aurora/MAR_001_02_producto_campera.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_001_indumentaria_aurora/MAR_001_03_local_showroom.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_001_indumentaria_aurora/MAR_001_logo.png`
  - `scripts/seed-evento-assets/marcas/MAR_002_moda_delta/MAR_002_01_producto_remeras.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_002_moda_delta/MAR_002_02_producto_buzos.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_002_moda_delta/MAR_002_03_local_showroom.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_002_moda_delta/MAR_002_logo.png`
  - `scripts/seed-evento-assets/marcas/MAR_003_textiles_del_plata/MAR_003_01_producto_ropa_trabajo.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_003_textiles_del_plata/MAR_003_02_producto_pantalones.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_003_textiles_del_plata/MAR_003_03_local_showroom.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_003_textiles_del_plata/MAR_003_logo.png`
  - `scripts/seed-evento-assets/marcas/MAR_004_amapola/MAR_004_01_producto_vestidos.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_004_amapola/MAR_004_02_producto_remeras.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_004_amapola/MAR_004_03_local_showroom.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_004_amapola/MAR_004_logo.png`
  - `scripts/seed-evento-assets/marcas/MAR_005_urbano_textil/MAR_005_01_producto_campera.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_005_urbano_textil/MAR_005_02_producto_buzos.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_005_urbano_textil/MAR_005_03_local_showroom.jpg`
  - `scripts/seed-evento-assets/marcas/MAR_005_urbano_textil/MAR_005_logo.png`
  - `scripts/seed-evento-assets/sha256sums.txt`
  - `scripts/seed-evento-assets/talleres/TAL_001_confecciones_belgrano/TAL_001_01_taller.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_001_confecciones_belgrano/TAL_001_02_producto_remeras.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_001_confecciones_belgrano/TAL_001_03_control_calidad.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_001_confecciones_belgrano/TAL_001_logo.png`
  - `scripts/seed-evento-assets/talleres/TAL_002_textil_avellaneda/TAL_002_01_taller.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_002_textil_avellaneda/TAL_002_02_producto_ropa_trabajo.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_002_textil_avellaneda/TAL_002_03_proceso_corte.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_002_textil_avellaneda/TAL_002_logo.png`
  - `scripts/seed-evento-assets/talleres/TAL_003_taller_lanus/TAL_003_01_taller.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_003_taller_lanus/TAL_003_02_producto_buzos.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_003_taller_lanus/TAL_003_03_proceso_armado_buzos.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_003_taller_lanus/TAL_003_logo.png`
  - `scripts/seed-evento-assets/talleres/TAL_004_corte_ramos_mejia/TAL_004_01_proceso_overlock.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_004_corte_ramos_mejia/TAL_004_02_proceso_bolsillos_cierres.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_004_corte_ramos_mejia/TAL_004_03_proceso_corte_denim.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_004_corte_ramos_mejia/TAL_004_logo.png`
  - `scripts/seed-evento-assets/talleres/TAL_005_costura_del_oeste/TAL_005_01_proceso_dobladillo.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_005_costura_del_oeste/TAL_005_02_proceso_reparaciones.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_005_costura_del_oeste/TAL_005_03_proceso_arreglos.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_005_costura_del_oeste/TAL_005_logo.png`
  - `scripts/seed-evento-assets/talleres/TAL_006_corte_sur_srl/TAL_006_01_taller.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_006_corte_sur_srl/TAL_006_02_producto_pantalones.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_006_corte_sur_srl/TAL_006_03_produccion_pantalones.jpg`
  - `scripts/seed-evento-assets/talleres/TAL_006_corte_sur_srl/TAL_006_logo.png`
  - `scripts/seed-evento-imagenes.ts`
  - `src/__tests__/evento-imagenes.test.ts`


## 2026-08-08

### Gerardo Breard
- **19:31** `f17a1de` — fix(evento): QA de Sergio — rate limits, logout→/demo, timeout, emails gateados
  - `docs/EVENTO_DEMO.md`
  - `src/__tests__/evento-ratelimit.test.ts`
  - `src/app/(admin)/logout-button.tsx`
  - `src/app/(auth)/acceso-rapido/page.tsx`
  - `src/app/(auth)/demo/demo-login.tsx`
  - `src/app/layout.tsx`
  - `src/app/providers.tsx`
  - `src/compartido/componentes/evento/evento-provider.tsx`
  - `src/compartido/componentes/layout/header.tsx`
  - `src/compartido/componentes/ui/logout-button.tsx`
  - `src/compartido/lib/email.ts`
  - `src/compartido/lib/ratelimit.ts`


## 2026-08-07

### Gerardo Breard
- **20:00** `76b43e5` — feat(evento): página /demo (login directo) + cuentas de escritura + guard de demo
  - `prisma/seed.ts`
  - `scripts/seed-evento.ts`
  - `src/__tests__/demo-guard.test.ts`
  - `src/app/(auth)/demo/demo-login.tsx`
  - `src/app/(auth)/demo/page.tsx`
  - `src/app/api/auth/mi-cuenta/route.ts`
  - `src/app/api/auth/password-reset/[token]/route.ts`
  - `src/compartido/lib/demo.ts`
  - `src/middleware.ts`

- **14:14** `7e1db26` — Merge remote-tracking branch 'origin/develop' into feat/p01-p03-consentimiento


- **14:11** `91f5123` — ci: forzar corrida de tests (synchronize perdido) [legales _WEB]


- **14:03** `2f9cd70` — fix(admin/usuarios): límite real (100) + contadores Total/Talleres/Marcas por COUNT
  - `src/__tests__/admin-usuarios-api.test.ts`
  - `src/app/(admin)/admin/usuarios/page.tsx`
  - `src/app/api/admin/usuarios/route.ts`


- **13:44** `5d2be6f` — feat(legal): publicar versiones _WEB depuradas (Sergio) en /terminos y /privacidad
  - `docs/legal/web/LEEME.md`
  - `docs/legal/web/POLITICA_DE_PRIVACIDAD_WEB.md`
  - `docs/legal/web/TERMINOS_Y_CONDICIONES_WEB.md`
  - `src/__tests__/legal.test.ts`
  - `src/app/(public)/privacidad/page.tsx`
  - `src/app/(public)/terminos/page.tsx`
  - `src/compartido/lib/legal.ts`


## 2026-08-06

### Gerardo Breard
- **23:17** `2a8f54f` — docs(handover): cierre documental de la semana — estado final + tags + freeze
  - `CHANGELOG.md`
  - `docs/handover/HANDOVER_PACKAGE.md`

- **22:49** `311a62a` — Merge remote-tracking branch 'origin/develop' into feature/proteger-registro-dev


- **22:21** `612fa51` — test(e2e): /estado/auditorias ahora devuelve 404 (ruta retirada)
  - `tests/e2e/roles-estado.spec.ts`

- **22:01** `a4684a4` — fix(estado): retirar Auditorías del menú de Coordinación + cerrar la ruta (404)
  - `src/app/(estado)/estado/auditorias/page.tsx`
  - `src/compartido/lib/content/institutional.ts`

- **21:50** `339a2cd` — fix(legal): publicar solo el cuerpo (extracción estructural) + remark-gfm + textos nuevos + acentos registro
  - `docs/legal/POLITICA_DE_PRIVACIDAD.md`
  - `docs/legal/TERMINOS_Y_CONDICIONES.md`
  - `package-lock.json`
  - `package.json`
  - `src/__tests__/legal.test.ts`
  - `src/app/(auth)/registro/page.tsx`
  - `src/app/(public)/privacidad/page.tsx`
  - `src/app/(public)/terminos/page.tsx`
  - `src/compartido/lib/legal.ts`


## 2026-08-04

### Gerardo Breard
- **16:11** `b58dc94` — spec: P-01+P-02(recortado)+P-03 — consentimiento, paginas legales, aviso de proposito
  - `.claude/specs/v4-p01-p02-p03-consentimiento.md`


## 2026-08-03

### Gerardo Breard
- **17:30** `58a157f` — fix(pre-deploy): dominio .com.ar, flag denuncias OFF, LICENSE Apache-2.0, docs sensibles fuera del repo
  - `LICENSE`
  - `docs/handover/DEUDA_Y_ROADMAP.md`
  - `docs/handover/GUIA_DESARROLLO.md`
  - `docs/handover/HALLAZGOS_SEGURIDAD.md`
  - `docs/handover/HANDOVER_PACKAGE.md`
  - `docs/handover/INVENTARIO_ACCESOS.md`
  - `docs/handover/README.md`
  - `docs/handover/REPORTE_LICENCIAS.md`
  - `package.json`
  - `prisma/seed.ts`
  - `src/app/(admin)/admin/integraciones/email/page.tsx`
  - `src/app/(public)/ayuda/onboarding-marca/page.tsx`
  - `src/app/(public)/ayuda/onboarding-taller/page.tsx`
  - `src/app/(public)/ayuda/page.tsx`
  - `src/app/(public)/consultar-denuncia/consultar-denuncia-form.tsx`
  - `src/app/(public)/consultar-denuncia/page.tsx`
  - `src/app/(public)/denunciar/denunciar-form.tsx`
  - `src/app/(public)/denunciar/page.tsx`
  - `src/app/(public)/privacidad/page.tsx`
  - `src/app/(public)/terminos/page.tsx`
  - `src/app/api/denuncias/[codigo]/route.ts`
  - `src/compartido/componentes/pdf/certificado-pdf.tsx`
  - `src/compartido/lib/arca.ts`
  - `src/compartido/lib/content/institutional.ts`
  - `src/compartido/lib/rag.ts`
  - `src/taller/componentes/asistente-chat.tsx`

- **15:50** `01d1438` — docs(handover): cerrar re-scope NEXTAUTH_SECRET + CRON_SECRET (2026-08-03)
  - `docs/handover/DEUDA_Y_ROADMAP.md`
  - `docs/handover/HALLAZGOS_SEGURIDAD.md`
  - `docs/handover/HANDOVER_PACKAGE.md`
  - `docs/handover/INVENTARIO_ACCESOS.md`

- **15:46** `ffb0bcb` — docs(handover): cerrar re-scope NEXTAUTH_SECRET + CRON_SECRET (2026-08-03)
  - `DAILY.md`

- **15:45** `53a47db` — docs(handover): cerrar re-scope NEXTAUTH_SECRET + CRON_SECRET (2026-08-03)
  - `docs/07_cronograma.md`
  - `docs/handover/DEUDA_Y_ROADMAP.md`
  - `docs/handover/HALLAZGOS_SEGURIDAD.md`
  - `docs/handover/HANDOVER_PACKAGE.md`
  - `docs/handover/INVENTARIO_ACCESOS.md`


## 2026-07-13

### Gerardo Breard
- **23:55** `8d86a65` — fix: QA #453 — CUIT_CORREGIDO visible en Historial + renombrar botones ARCA
  - `src/app/(estado)/estado/talleres/[id]/page.tsx`
  - `src/app/(estado)/estado/talleres/[id]/reverificar-button.tsx`

- **17:09** `14521a5` — feat: circuito CUIT Piezas A+B — corrección de CUIT + reverificación
  - `src/__tests__/corregir-cuit-helper.test.ts`
  - `src/__tests__/corregir-cuit-route.test.ts`
  - `src/app/(estado)/estado/talleres/[id]/corregir-cuit-coord.tsx`
  - `src/app/(estado)/estado/talleres/[id]/page.tsx`
  - `src/app/(taller)/taller/formalizacion/page.tsx`
  - `src/app/api/arca/corregir-cuit/[id]/route.ts`
  - `src/compartido/lib/arca.ts`
  - `src/taller/componentes/banner-gracia.tsx`
  - `src/taller/componentes/corregir-cuit-form.tsx`

- **16:11** `8f7bee8` — docs(spec): circuito CUIT — PR-1 (Pieza D) HECHO (02ed22d, #452)
  - `.claude/specs/v4-circuito-cuit-implementacion.md`

- **14:18** `f0d4a59` — chore: redeploy preview — tomar ARCA_PROVIDER=mock (demo Pieza D)



## 2026-07-11

### Gerardo Breard
- **18:16** `db3686b` — feat: circuito CUIT Pieza D — reintento ARCA en el cron de gracia
  - `src/__tests__/cron-gracia.test.ts`
  - `src/app/api/cron/gracia-cuit/route.ts`

- **17:45** `844cddc` — docs(spec): circuito CUIT — spec de implementación A+D+B (DECIDIDO)
  - `.claude/specs/v4-circuito-cuit-implementacion.md`

- **17:25** `1c177d3` — docs(backlog): G-17 — /academia-publica necesita contenido real antes de ampliar el piloto
  - `.claude/specs/V4_BACKLOG.md`


## 2026-07-09

### Gerardo Breard
- **16:55** `39f10e7` — fix: eliminar seccion Recursos + ajustes de copy (aprobacion B1) + regresion onboarding
  - `src/app/(public)/recursos/page.tsx`
  - `src/compartido/componentes/layout/footer.tsx`
  - `src/compartido/lib/content/institutional.ts`
  - `src/compartido/lib/email.ts`
  - `src/compartido/lib/onboarding.ts`
  - `src/taller/componentes/banner-gracia.tsx`
- **19:37** `bacbf27` — docs(discovery): circuito CUIT + limbo verificacion ARCA (esperando decision Sergio)
  - `.claude/specs/v4-circuito-cuit-discovery.md`


## 2026-07-07

### Gerardo Breard
- **14:06** `122f09a` — docs(etapa2-3): marcar B1 HECHO (#450, 5b567d5) — Etapa 2 COMPLETA
  - `.claude/specs/v4-etapa2-3-discovery.md`


## 2026-07-02

### Gerardo Breard
- **20:34** `7a98302` — docs(etapa2-3): marcar B0 gracia HECHO (#449, 23d20b0)
  - `.claude/specs/v4-etapa2-3-discovery.md`

- **11:42** `1e7ceed` — docs(etapa2-3): marcar 2.3-A vidriera minima HECHO (#448, 9062603)
  - `.claude/specs/v4-etapa2-3-discovery.md`


## 2026-06-27

### Gerardo Breard
- **18:09** `52fc53f` — docs(etapa2): 2.2-A HECHO (#442, a12c798) + #439b (#440) + sidebar (#443) mergeados
  - `.claude/specs/v4-narrativa-etapa-2-discovery.md`

- **15:51** `074c260` — fix: 2.2-A — modelo de distribución de info por contexto (QA Sergio, reemplaza issue B)
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/(taller)/taller/perfil/layout.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`
  - `src/app/(taller)/taller/perfil/perfil-header-tabs.tsx`
  - `src/compartido/componentes/ui/checklist-onboarding.tsx`


## 2026-06-24

### Gerardo Breard
- **18:26** `7a67b40` — docs(2.2): flag modeloB_revisado YA en develop (#441) — 2.2-B desbloqueada
  - `.claude/specs/v4-etapa2-2-vidriera-discovery.md`

- **17:58** `856e5b4` — feat(schema): flag modeloB_revisado en Taller (prep 2.2-B, privacy-by-default)
  - `prisma/migrations/20260624120000_agregar_modelob_revisado/migration.sql`
  - `prisma/schema.prisma`


## 2026-06-23

### Gerardo Breard
- **17:35** `6c11c22` — docs(etapa2): cerrar spec 2.2 con la matriz final de Sergio
  - `.claude/specs/v4-etapa2-2-vidriera-discovery.md`


## 2026-06-22

### Gerardo Breard
- **13:05** `5b4c113` — docs(spec): Etapa 2 — modelo corregido por Sergio (21-jun)
  - `.claude/specs/v4-narrativa-etapa-2-discovery.md`

- **12:30** `614392f` — docs(deuda): T-01 — patron migracion manual + migrate deploy (pgvector rompe migrate dev)
  - `.claude/DEUDA_TECNICA.md`


## 2026-06-21

### Gerardo Breard
- **17:48** `66676ab` — docs(spec): propuesta schema visibilidad vidriera (Etapa 2.2 / Modelo B)
  - `.claude/specs/v4-etapa2-visibilidad-schema-propuesta.md`

- **16:50** `4cbe96b` — docs(spec): discovery Etapa 2 narrativa V4 (relevamiento, no implementa)
  - `.claude/specs/v4-narrativa-etapa-2-discovery.md`

- **16:23** `ff546e0` — docs(deuda): OBS-01 — setup externo de observabilidad PENDIENTE (gate del deploy)
  - `.claude/BITACORA_PROD.md`
  - `.claude/DEUDA_TECNICA.md`

- **15:56** `7e30efd` — docs(observabilidad): bitacora de prod + runbook de observabilidad
  - `.claude/BITACORA_PROD.md`
  - `.claude/specs/RUNBOOK_OBSERVABILIDAD.md`

- **15:54** `fcc260e` — feat(health): endpoint /api/health con check de DB para sondas externas
  - `src/app/api/health/route.ts`

- **15:43** `ee10ad9` — docs(narrativa): guardar copy de Etapas 2-3 como spec de referencia
  - `.claude/specs/v4-narrativa-etapas-2-3-copy.md`


## 2026-06-19

### Gerardo Breard
- **14:34** `7cc1ec1` — fix(f-05): truncar titulo en colecciones recomendadas (/taller 320px)
  - `src/app/(taller)/taller/page.tsx`

- **12:24** `cf1106f` — docs(deuda): cerrar T-04/T-05/T-06/B-07/F-05 + A-01/A-02; T-07 denuncia
  - `.claude/DEUDA_TECNICA.md`

- **12:21** `d7b5e3c` — fix(f-05): acotar ancho del contenedor de toasts (desborde 320px)
  - `src/compartido/componentes/ui/toast.tsx`

- **12:17** `78edbdc` — fix(b-07): verificar/page.tsx renderiza taller/coleccion como objetos
  - `src/app/(public)/verificar/page.tsx`
  - `tests/e2e/verificar-certificado.spec.ts`

- **11:26** `175953b` — test(t-06): e2e de flujo del formulario del taller (W-A2..W-A5)
  - `tests/e2e/w-a-formulario.spec.ts`

- **11:18** `31f6473` — test(t-04): borrar directorio e2e/ huerfano (16 specs V3 + helper)
  - `e2e/admin.spec.ts`
  - `e2e/auth.spec.ts`
  - `e2e/checklist-sec1-2.spec.ts`
  - `e2e/checklist-sec3-4.spec.ts`
  - `e2e/checklist-sec5-6.spec.ts`
  - `e2e/checklist-sec7-8.spec.ts`
  - `e2e/checklist-sec9-10.spec.ts`
  - `e2e/contenido.spec.ts`
  - `e2e/estado.spec.ts`
  - `e2e/feedback.spec.ts`
  - `e2e/helpers/auth.ts`
  - `e2e/marca.spec.ts`
  - `e2e/pedidos.spec.ts`
  - `e2e/publico.spec.ts`
  - `e2e/registro.spec.ts`
  - `e2e/seguridad-roles.spec.ts`
  - `e2e/taller.spec.ts`


## 2026-06-18

### Gerardo Breard
- **17:51** `64688d0` — test(t-04): recuperar cobertura del FeedbackWidget como spec fresco
  - `tests/e2e/feedback-widget.spec.ts`


## 2026-06-13

### Gerardo Breard
- **16:20** `575c3f2` — feat: K barrido de rate-limit (C4 + §4.3)
  - `src/app/api/auth/mi-cuenta/route.ts`
  - `src/app/api/auth/password-reset/[token]/route.ts`
  - `src/app/api/auth/password-reset/route.ts`
  - `src/app/api/auth/registro/completar/route.ts`
  - `src/app/api/contenido/novedades/upload/route.ts`
  - `src/app/api/cotizaciones/[id]/route.ts`
  - `src/app/api/estado/arca/route.ts`
  - `src/app/api/exportar/route.ts`
  - `src/app/api/log-error/route.ts`
  - `src/app/api/pedidos/[id]/invitaciones/route.ts`
  - `src/app/api/validaciones/[id]/signed-url/route.ts`
  - `src/compartido/lib/ratelimit.ts`

- **16:14** `71e92f5` — refactor: K-05 borrar GET muertos (§6.8 + vestigiales) — decision de Gerardo
  - `src/__tests__/k-01-criticos.test.ts`
  - `src/__tests__/k-02-auth-matrix.test.ts`
  - `src/app/api/admin/notas/route.ts`
  - `src/app/api/auditorias/[id]/route.ts`
  - `src/app/api/auditorias/route.ts`
  - `src/app/api/contenido/novedades/route.ts`
  - `src/app/api/denuncias/route.ts`
  - `src/app/api/marcas/[id]/route.ts`
  - `src/app/api/talleres/[id]/route.ts`

- **13:48** `aec1908` — feat: K-05 select explicito en endpoints de §4.1 (Fase 1)
  - `src/__tests__/k-01-criticos.test.ts`
  - `src/app/api/admin/config/route.ts`
  - `src/app/api/admin/logs/route.ts`
  - `src/app/api/catalogos/route.ts`
  - `src/app/api/certificados/[id]/route.ts`
  - `src/app/api/colecciones/[id]/route.ts`
  - `src/app/api/colecciones/route.ts`
  - `src/app/api/contenido/novedades/[id]/route.ts`
  - `src/app/api/estado/configuracion-niveles/[id]/route.ts`
  - `src/app/api/estado/configuracion-niveles/route.ts`
  - `src/app/api/marcas/route.ts`
  - `src/app/api/ordenes/[id]/route.ts`
  - `src/app/api/pedidos/[id]/route.ts`
  - `src/app/api/talleres/route.ts`
  - `src/app/api/tipos-documento/route.ts`
  - `src/app/api/validaciones/[id]/route.ts`

- **10:39** `c4289db` — docs: registrar deploy a prod 2026-06-13 en DAILY.md (#422, merge 3333016)
  - `DAILY.md`

- **10:04** `3333016` — 🚀 DEPLOY A PROD (release mayor) — merge `develop` → `main` (#422, merge commit, preserva historia)
  - **Release mayor:** 105 commits; prod no se actualizaba desde el 01-jun. Vercel deploy `plataforma-textil-rrld0fe3i` → ● Ready.
  - **Migraciones aplicadas:** 4 que estaban pendientes en la DB (`agregar_imagen_coleccion`, `agregar_tipo_pedido`, `k01_rls_revoke_anon`, `u05_backfill_roles_activemode`). Las otras 2 (`multirol_y_arca`, `formulario_taller`) ya estaban en prod desde mayo → `migrate deploy` solo aplicó las pendientes. "All migrations successfully applied", sin error.
  - **Contenido del release:** bloque U multi-rol completo, B-05 (fix race sesión), formulario taller W-A, tipo de pedido, endurecimiento RLS K-01 (Fase 3 efectiva en prod), landing X-06 (G-20 "no se encuentra cómo registrarse" RESUELTO), hotfixes de seguridad C1/C2/C3 (fugas anónimas de PII) + C5 (IDOR upload cotización).
  - **Punto de retorno:** backup diario de Supabase 03:27 AR (PITR no contratado; el pg_dump del runbook no fue viable porque `DATABASE_URL`/`DIRECT_URL` de prod son Sensitive en Vercel y `env pull` las trae vacías).
  - **Verificación técnica (checklist a-e):** home 200 + landing X-06 (CTAs de registro presentes); 3 endpoints hotfix (`marcas`/`talleres`/`colecciones` [id]) → 401 anónimo; `/api/auth/session` 200; Prisma lee post-RLS (dropdowns de directorio poblados con filas reales). **Prod sano**, sin rollback.
  - **Nota:** directorio vacío de talleres en prod = esperado (filtro `verificadoAfip: true`, aún sin talleres verificados en AFIP). No es regresión.
  - **PENDIENTE post-deploy (sin correr):** crear cuenta de Sergio en prod (faltan email + rol), su smoke, y backfill validaciones D-02 con `--exclude <email-smoke>` (solo con OK explícito de Gerardo).

## 2026-06-12

### Gerardo Breard
- **19:34** `a8be1b2` — docs: runbook de promocion develop->prod (prep, no ejecutado)
  - `.claude/specs/RUNBOOK_PROMOCION_PROD.md`

- **17:18** `9e1f120` — fix(k-02): cerrar C5 IDOR upload/imagenes contexto cotizacion (elegibilidad)
  - `.claude/specs/v4-k-01-auditoria-endpoints.md`
  - `src/__tests__/cotizaciones-elegibilidad.test.ts`
  - `src/__tests__/k-02-idor-matrix.test.ts`
  - `src/app/api/cotizaciones/route.ts`
  - `src/app/api/upload/imagenes/route.ts`
  - `src/compartido/lib/cotizaciones.ts`

- **16:27** `9fe8b60` — test(k-02): tanda 2 matriz IDOR (ownership) + hallazgo C5
  - `.claude/specs/v4-k-01-auditoria-endpoints.md`
  - `src/__tests__/_helpers/auth-matrix.ts`
  - `src/__tests__/k-02-idor-matrix.test.ts`

- **15:14** `db4a619` — docs(k-02): tanda 1 hecha (#415); plan explicito de tanda 2 (matriz IDOR)
  - `.claude/specs/v4-k-01-auditoria-endpoints.md`

- **13:13** `279d658` — test(k-02): test pattern reutilizable de auth (matriz 401/403/200)
  - `.claude/specs/v4-k-01-auditoria-endpoints.md`
  - `src/__tests__/_helpers/auth-matrix.ts`
  - `src/__tests__/k-02-auth-matrix.test.ts`


## 2026-06-11

### Gerardo Breard
- **16:14** `a2733e6` — docs(k-01): marcar C1/C2/C3 RESUELTOS (#414) + nota de codigo muerto
  - `.claude/specs/v4-k-01-auditoria-endpoints.md`

- **14:19** `452ff90` — docs(k-01): auditoria completa de endpoints
  - `.claude/specs/v4-k-01-auditoria-endpoints.md`
- **14:56** `882090f` — fix(k-01): cerrar 3 criticos C1/C2/C3 (fugas anonimas de PII y answer-key)
  - `src/__tests__/k-01-criticos.test.ts`
  - `src/app/api/colecciones/[id]/route.ts`
  - `src/app/api/marcas/[id]/route.ts`
  - `src/app/api/talleres/[id]/route.ts`

- **13:00** `16334b1` — docs: D-03 reseed coordinado pendiente (cobertura test F-1)
  - `.claude/DEUDA_TECNICA.md`

- **12:02** `807d6de` — docs: B-05 a Resueltas + registrar B-06 (pill multi-tab stale)
  - `.claude/DEUDA_TECNICA.md`


## 2026-06-10

### Gerardo Breard
- **02:14** `2ed80d2` — fix(b-05): race de clobbering de cookie en rolling JWT session
  - `.claude/specs/v4-b-05-fix-race-sesion.md`
  - `src/__tests__/session-cookie.test.ts`
  - `src/app/api/usuarios/me/active-mode/route.ts`
  - `src/app/api/usuarios/me/roles/route.ts`
  - `src/app/n/[token]/route.ts`
  - `src/compartido/lib/auth.config.ts`
  - `src/compartido/lib/session-cookie.ts`
  - `src/middleware.ts`
  - `tests/e2e/u-04-toggle-multi-rol.spec.ts`

- **01:36** `4535222` — docs: mover D-01/D-02 a Resueltas (U-05 #410)
  - `.claude/DEUDA_TECNICA.md`

- **01:10** `1c0e5f1` — feat(u-05): migracion de datos multi-rol + cierre de fuente (refs D-01/D-02)
  - `.claude/specs/handover/DECISIONS.md`
  - `.claude/specs/v4-u-05-migracion-datos.md`
  - `prisma/migrations/20260610120000_u05_backfill_roles_activemode/migration.sql`
  - `prisma/seed.ts`
  - `scripts/u05-audit.ts`
  - `scripts/u05-backfill-validaciones.ts`
  - `src/__tests__/u-05-cierre-fuente.test.ts`
  - `src/app/api/auth/registro/completar/route.ts`
  - `src/app/api/auth/registro/route.ts`

- **00:39** `7e50231` — docs(u-08): corregir supuesto de seed en CI + nota de reseed coordinado
  - `.claude/specs/v4-u-08-tests-e2e-multi-rol.md`

- **00:23** `f8b5512` — feat(u-08): tests E2E multi-rol + seed dual (cierre bloque U)
  - `prisma/seed.ts`
  - `src/app/api/test-utils/reset-seed-state/route.ts`
  - `tests/e2e/u-06-clasificacion-pedidos.spec.ts`
  - `tests/e2e/u-07-anti-incesto.spec.ts`
  - `tests/e2e/u-08-cuenta-multirol.spec.ts`
  - `tests/e2e/u-08-gating-dual.spec.ts`


## 2026-06-09

### Gerardo Breard
- **23:53** `8aa40e5` — chore: sprint deuda tecnica batch-1 (F-01/02/03 + B-02/03/04)
  - `.claude/DEUDA_TECNICA.md`
  - `src/__tests__/ratelimit.test.ts`
  - `src/__tests__/u-09-agregar-rol.test.ts`
  - `src/app/(admin)/layout.tsx`
  - `src/app/(auth)/registro/page.tsx`
  - `src/app/(contenido)/layout.tsx`
  - `src/app/(public)/cuenta/page.tsx`
  - `src/app/(taller)/layout.tsx`
  - `src/app/api/test-utils/reset-seed-state/route.ts`
  - `src/app/api/usuarios/me/roles/route.ts`
  - `src/compartido/lib/entidades-modo.ts`
  - `src/compartido/lib/nivel.ts`
  - `src/compartido/lib/ratelimit.ts`

- **22:58** `99d8dbf` — test(t-04): estabilizar u-09 — esperar respuesta de /me/roles antes del redirect
  - `tests/e2e/u-09-agregar-segundo-rol.spec.ts`

- **22:51** `0b35677` — fix(t-04): endpoint reset con allowlist + u-09 sin poll + deuda B-05
  - `.claude/DEUDA_TECNICA.md`
  - `src/app/api/test-utils/reset-seed-state/route.ts`
  - `tests/e2e/u-04-toggle-multi-rol.spec.ts`
  - `tests/e2e/u-09-agregar-segundo-rol.spec.ts`

- **17:48** `9e9f157` — fix(t-04): mover endpoint reset fuera de carpeta privada _test (App Router)
  - `.claude/DEUDA_TECNICA.md`
  - `src/app/api/_test/reset-seed-state/route.ts`
  - `src/app/api/test-utils/reset-seed-state/route.ts`
  - `tests/e2e/u-04-toggle-multi-rol.spec.ts`
  - `tests/e2e/u-09-agregar-segundo-rol.spec.ts`

- **17:22** `1b0d2c8` — fix(t-04): guard NODE_ENV + race u-09 + reset-seed-state para u-04/u-09
  - `.claude/DEUDA_TECNICA.md`
  - `src/app/api/_test/reset-seed-state/route.ts`
  - `src/app/api/_test/reset-u09/route.ts`
  - `tests/e2e/u-04-toggle-multi-rol.spec.ts`
  - `tests/e2e/u-09-agregar-segundo-rol.spec.ts`

- **15:20** `6eb0d96` — fix(u-04/u-09): bugs destapados por primer run real de specs migrados
  - `src/app/page.tsx`
  - `tests/e2e/u-09-agregar-segundo-rol.spec.ts`

- **12:29** `cfc7b57` — fix(t-04): hardening endpoint reset-u09 + deuda B-04
  - `.claude/DEUDA_TECNICA.md`
  - `src/app/api/_test/reset-u09/route.ts`

- **10:58** `6ba3ec5` — feat(t-04): migrar 4 U-specs de seguridad a tests/e2e/ + fix idempotencia u-09
  - `e2e/u-04-toggle-multi-rol.spec.ts`
  - `e2e/u-06-clasificacion-pedidos.spec.ts`
  - `e2e/u-07-anti-incesto.spec.ts`
  - `e2e/u-09-agregar-segundo-rol.spec.ts`
  - `src/app/api/_test/reset-u09/route.ts`
  - `tests/e2e/u-09-agregar-segundo-rol.spec.ts`


## 2026-06-08

### Gerardo Breard
- **12:52** `185a619` — wip: T-04 - copia de validacion de 4 U-specs a tests/e2e/
  - `tests/e2e/_helpers/auth-multirol.ts`
  - `tests/e2e/u-04-toggle-multi-rol.spec.ts`
  - `tests/e2e/u-06-clasificacion-pedidos.spec.ts`
  - `tests/e2e/u-07-anti-incesto.spec.ts`
  - `tests/e2e/u-09-agregar-segundo-rol.spec.ts`

- **11:54** `507941a` — fix(e2e): reconciliar tests reales en tests/e2e + corregir diagnostico T-03
  - `.claude/DEUDA_TECNICA.md`
  - `tests/e2e/acceso-verificado.spec.ts`
  - `tests/e2e/smoke.spec.ts`

- **11:02** `d8b28ac` — docs(deuda): T-03 resuelta en commit 66ebee8 (Narrativa V4 Etapa 1)
  - `.claude/DEUDA_TECNICA.md`

- **11:02** `66ebee8` — feat(narrativa-v4): Etapa 1 §1.1 + §1.2 - renombres y reordenamiento
  - `e2e/checklist-sec9-10.spec.ts`
  - `src/app/(marca)/marca/directorio/[id]/page.tsx`
  - `src/app/(marca)/marca/directorio/page.tsx`
  - `src/app/(marca)/marca/pedidos/page.tsx`
  - `src/app/(marca)/marca/perfil/page.tsx`
  - `src/app/(public)/directorio/page.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`
  - `src/compartido/lib/content/institutional.ts`

- **10:28** `e86102f` — Merge remote-tracking branch 'origin/develop' into feature/u-09-agregar-segundo-rol


- **00:26** `c09e67f` — docs: spec Narrativa V4 Etapa 1 (§1.1+§1.2) + nueva deuda T-03
  - `.claude/DEUDA_TECNICA.md`
  - `.claude/specs/v4-narrativa-etapa-1.md`


## 2026-06-07

### Gerardo Breard
- **23:36** `e953cfd` — docs: archivo de deuda tecnica pre-existente
  - `.claude/DEUDA_TECNICA.md`

- **22:38** `92d2a52` — docs: spec U-08 - tests E2E con seed dual
  - `.claude/specs/v4-u-08-tests-e2e-multi-rol.md`

- **20:54** `4d64713` — docs: spec U-05 - migracion de datos existentes
  - `.claude/specs/v4-u-05-migracion-datos.md`


## 2026-06-05

### Gerardo Breard
- **14:41** `233e155` — feat(u-04): toggle UI multi-rol estilo Airbnb
  - `.claude/specs/v4-u-04-toggle-multi-rol.md`
  - `e2e/helpers/auth.ts`
  - `e2e/u-04-toggle-multi-rol.spec.ts`
  - `prisma/seed.ts`
  - `src/__tests__/roles-multirol.test.ts`
  - `src/__tests__/u-04-active-mode.test.ts`
  - `src/app/(estado)/layout.tsx`
  - `src/app/(marca)/layout.tsx`
  - `src/app/(taller)/layout.tsx`
  - `src/app/api/certificados/[id]/pdf/route.tsx`
  - `src/app/api/ordenes/[id]/pdf/route.tsx`
  - `src/app/api/usuarios/me/active-mode/route.ts`
  - `src/compartido/componentes/layout/header.tsx`
  - `src/compartido/componentes/layout/modo-toggle.tsx`
  - `src/compartido/lib/auth.config.ts`
  - `src/compartido/lib/entidades-modo.ts`

- **11:51** `d05c766` — merge: resolver conflicto de DAILY.md (bitacora autogenerada) con develop


- **10:54** `c333683` — chore: trigger Actions sobre PR #396
  - `README.md`

- **00:29** `70dfaf0` — ci: trigger Actions tras destrabar budget de la org



## 2026-06-04

### Gerardo Breard
- **14:51** `59cbab7` — ci: re-trigger checks for PR2b


- **14:44** `240df5a` — feat(u-03): PR2b - ownership/branching + cast cleanup
  - `src/__tests__/u-03-pr2b-ownership.test.ts`
  - `src/app/api/admin/observaciones/[id]/route.ts`
  - `src/app/api/admin/onboarding/reenviar-invitacion/route.ts`
  - `src/app/api/chat/route.ts`
  - `src/app/api/cotizaciones/[id]/route.ts`
  - `src/app/api/feedback/route.ts`
  - `src/app/api/marcas/[id]/route.ts`
  - `src/app/api/pedidos/[id]/invitaciones/route.ts`
  - `src/app/api/pedidos/[id]/ordenes/route.ts`
  - `src/app/api/pedidos/[id]/route.ts`
  - `src/app/api/talleres/[id]/route.ts`
  - `src/app/api/upload/imagenes/route.ts`
  - `src/app/api/validaciones/[id]/route.ts`
  - `src/app/api/validaciones/[id]/signed-url/route.ts`
  - `src/app/api/validaciones/[id]/upload/route.ts`

- **11:57** `bdb7e24` — chore: env safety - DEV por defecto + guards anti-PROD
  - `.env.example`
  - `CLAUDE.md`
  - `README.md`
  - `package.json`
  - `prisma/seed.ts`
  - `scripts/check-db-ref.ts`


## 2026-06-03

### Gerardo Breard
- **22:45** `f051a9e` — feat(u-03): PR2a burn-down mecanico - 40 endpoints al helper
  - `src/__tests__/admin-logs-api.test.ts`
  - `src/__tests__/permisos.test.ts`
  - `src/app/api/admin/config/route.ts`
  - `src/app/api/admin/configuracion-upload/[id]/route.ts`
  - `src/app/api/admin/configuracion-upload/route.ts`
  - `src/app/api/admin/logs/route.ts`
  - `src/app/api/admin/mensajes-individuales/route.ts`
  - `src/app/api/admin/notas-seguimiento/route.ts`
  - `src/app/api/admin/notas/route.ts`
  - `src/app/api/admin/notificaciones/route.ts`
  - `src/app/api/admin/observaciones/route.ts`
  - `src/app/api/admin/rag/[id]/route.ts`
  - `src/app/api/admin/rag/route.ts`
  - `src/app/api/admin/reporte-mensual/route.ts`
  - `src/app/api/admin/reporte-piloto/route.ts`
  - `src/app/api/admin/stats/route.ts`
  - `src/app/api/admin/usuarios-buscar/route.ts`
  - `src/app/api/admin/usuarios/[id]/route.ts`
  - `src/app/api/admin/usuarios/route.ts`
  - `src/app/api/admin/whatsapp/route.ts`
  - `src/app/api/auditorias/[id]/route.ts`
  - `src/app/api/auditorias/route.ts`
  - `src/app/api/certificados/route.ts`
  - `src/app/api/colecciones/[id]/evaluacion/route.ts`
  - `src/app/api/colecciones/[id]/progreso/route.ts`
  - `src/app/api/colecciones/[id]/route.ts`
  - `src/app/api/colecciones/[id]/upload/route.ts`
  - `src/app/api/colecciones/[id]/videos/route.ts`
  - `src/app/api/colecciones/route.ts`
  - `src/app/api/contenido/novedades/[id]/route.ts`
  - `src/app/api/contenido/novedades/route.ts`
  - `src/app/api/contenido/novedades/upload/route.ts`
  - `src/app/api/cotizaciones/route.ts`
  - `src/app/api/denuncias/route.ts`
  - `src/app/api/estado/exportar/route.ts`
  - `src/app/api/exportar/route.ts`
  - `src/app/api/marcas/route.ts`
  - `src/app/api/ordenes/[id]/route.ts`
  - `src/app/api/pedidos/route.ts`
  - `src/app/api/procesos/route.ts`
  - `src/app/api/tipos-documento/route.ts`
  - `src/app/api/validaciones/route.ts`

- **21:58** `65c1263` — merge: develop en feature/u-03-auth-multirol (resuelve DAILY.md)


- **15:16** `413a0e7` — feat(u-03): PR1 sesion multi-rol + helper por membresia + middleware/layouts
  - `.claude/specs/v4-u-03-auth-multirol.md`
  - `src/__tests__/roles-multirol.test.ts`
  - `src/app/(admin)/layout.tsx`
  - `src/app/(contenido)/layout.tsx`
  - `src/app/(estado)/layout.tsx`
  - `src/app/(marca)/layout.tsx`
  - `src/app/(public)/layout.tsx`
  - `src/app/(taller)/layout.tsx`
  - `src/compartido/lib/auth.config.ts`
  - `src/compartido/lib/auth.ts`
  - `src/compartido/lib/permisos.ts`
  - `src/compartido/lib/roles.ts`
  - `src/compartido/types/next-auth.d.ts`
  - `src/middleware.ts`

- **18:18** `62f49f8` — chore: rate-limit en POST /api/pedidos aplica a todos los roles
  - `src/app/api/pedidos/route.ts`


## 2026-06-02

### Gerardo Breard
- **18:00** `f2485b5` — chore: gitignore para fuentes de diseno de marca
  - `.gitignore`

- **17:18** `3a437c9` — chore: trackear specs vigentes del bloque X y K
  - `.claude/specs/07-spec-mejoras-landing-FINAL.md`
  - `.claude/specs/k-01-rls-supabase.md`
  - `.claude/specs/k-02-bucket-documentos-publico.md`
  - `.claude/specs/narrativa-V4-consolidado-niveles-1-a-4.md`
  - `.claude/specs/v4-x-04b-cms-novedades-v2.md`
  - `.claude/specs/v4-x-05-header-app-footer.md`
  - `.claude/specs/v4-x-06-header-public-landing-v2.md`
  - `.claude/specs/v4-x-07a-paleta-dashboards-critico.md`

- **16:53** `c5dfe4e` — chore: gitignore para imagenes throwaway y mal ubicadas
  - `.gitignore`


## 2026-06-01

### Gerardo Breard
- **18:42** `4243067` — test: arreglar asercion fragil en acceso-verificado
  - `src/__tests__/acceso-verificado.test.ts`

- **18:03** `43d0fd7` — ci: agregar workflow Vitest (modo informativo)
  - `.github/workflows/test.yml`

- **17:21** `cdf735b` — feat(u-06): clasificacion automatica de pedidos COMERCIAL/SUBCONTRATACION
  - `.claude/specs/v4-u-06-clasificacion-pedidos.md`
  - `e2e/u-06-clasificacion-pedidos.spec.ts`
  - `prisma/migrations/20260601120000_agregar_tipo_pedido/migration.sql`
  - `prisma/schema.prisma`
  - `src/__tests__/u-06-clasificacion-pedidos.test.ts`
  - `src/app/api/pedidos/route.ts`

- **14:34** `5ecc879` — feat(u-07): regla anti-incesto multi-rol
  - `.claude/specs/v4-u-07-anti-incesto.md`
  - `e2e/u-07-anti-incesto.spec.ts`
  - `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
  - `src/app/api/cotizaciones/route.ts`
  - `src/app/api/pedidos/[id]/invitaciones/route.ts`

- **10:55** `4a85e04` — fix(admin): UI de integraciones email decia 'SendGrid', es 'Resend'
  - `e2e/checklist-sec5-6.spec.ts`
  - `src/app/(admin)/admin/integraciones/email/page.tsx`
  - `src/app/(admin)/admin/integraciones/page.tsx`


## 2026-05-31

### Gerardo Breard
- **22:15** `6c2216b` — chore(fase-0): actualizar CLAUDE.md - Resend en lugar de SendGrid
  - `CLAUDE.md`

- **21:02** `9249325` — fix(#305): ocultar boton Google sin credenciales OAuth
  - `.claude/specs/handover/DECISIONS.md`
  - `src/app/(auth)/login/page.tsx`

- **20:24** `3aa2a1b` — fix(#307): setear emailVerified al crear cuenta (mitigacion temporal)
  - `.claude/specs/handover/DECISIONS.md`
  - `src/app/api/admin/usuarios/route.ts`
  - `src/app/api/auth/registro/route.ts`

- **14:44** `808b88d` — chore: registrar D1 del bloque U en DECISIONS (faltante de d48a37e)
  - `.claude/specs/handover/DECISIONS.md`

- **14:32** `d48a37e` — chore: limpiar v1 obsoleta U-01 + registrar D1 en DECISIONS
  - `.claude/specs/v4-u-01-analisis-multi-rol-airbnb.md`
  - `.claude/specs/v4-u-02-schema-multi-rol.md`
  - `docs/analisis/U-01_multi-rol-airbnb.md`


## 2026-05-26

### Gerardo Breard
- **15:12** `01d8199` — feat(f1-f3): avatar como dropdown (Mi cuenta + Cerrar sesion)
  - `src/compartido/componentes/layout/header.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `tests/e2e/roles-estado.spec.ts`

- **13:54** `8440a54` — feat(f1-f3): sidebar visible en desktop + solo accesos personales
  - `.claude/specs/v4-f1-f3-sidebar-navegacion.md`
  - `src/app/(estado)/layout.tsx`
  - `src/app/(marca)/layout.tsx`
  - `src/app/(public)/layout.tsx`
  - `src/app/(taller)/layout.tsx`
  - `src/compartido/componentes/layout/header.tsx`
  - `src/compartido/componentes/layout/index.ts`
  - `src/compartido/componentes/layout/sidebar-context.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `tests/e2e/roles-estado.spec.ts`
  - `tests/e2e/smoke.spec.ts`

- **10:58** `820acd4` — fix(e2e): usar exact:true para tab Disponibles (strict mode)
  - `tests/e2e/ux-mejoras.spec.ts`

- **10:49** `e8c9fa0` — fix(e2e): actualizar tests para tabs en pedidos taller
  - `tests/e2e/ux-mejoras.spec.ts`

- **10:26** `c3c39ce` — feat(f2): tabs internos en Pedidos del taller [Recibidos | Disponibles]
  - `.claude/specs/v4-f2-tabs-pedidos.md`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
  - `src/app/(taller)/taller/pedidos/layout.tsx`
  - `src/app/(taller)/taller/pedidos/page.tsx`

- **00:05** `2971791` — feat(j-05): soporte de imagen en colecciones (hallazgo A)
  - `.claude/specs/v4-j-05-imagen-colecciones.md`
  - `prisma/migrations/20260526000000_agregar_imagen_coleccion/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(contenido)/contenido/colecciones/[id]/page.tsx`
  - `src/app/api/colecciones/[id]/route.ts`
  - `src/app/api/colecciones/[id]/upload/route.ts`
  - `src/app/page.tsx`


## 2026-05-25

### Gerardo Breard
- **23:44** `860b82e` — feat(nav): renombrar tabs del taller segun modelo Showcase+Match
  - `.claude/specs/v4-renombres-tabs-taller.md`
  - `src/app/(admin)/logout-button.tsx`
  - `src/app/(auth)/mi-cuenta/page.tsx`
  - `src/app/(marca)/marca/pedidos/page.tsx`
  - `src/app/(marca)/marca/perfil/page.tsx`
  - `src/app/(public)/ayuda/page.tsx`
  - `src/app/(public)/cuenta/page.tsx`
  - `src/app/(taller)/taller/aprender/[id]/page.tsx`
  - `src/app/(taller)/taller/aprender/page.tsx`
  - `src/app/(taller)/taller/formalizacion/page.tsx`
  - `src/app/(taller)/taller/perfil/completar/page.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `src/compartido/componentes/ui/logout-button.tsx`
  - `src/compartido/lib/content/institutional.ts`
  - `tests/e2e/roles-estado.spec.ts`
  - `tests/e2e/smoke.spec.ts`

- **23:23** `de790d3` — fix(j-04): flujo de publicacion de cursos (hallazgo B)
  - `.claude/specs/v4-j-04-flujo-publicacion-cursos.md`
  - `src/app/(contenido)/contenido/colecciones/[id]/page.tsx`
  - `src/app/(contenido)/contenido/colecciones/nueva/page.tsx`
  - `src/app/page.tsx`

- **21:31** `9968623` — fix(e2e): renombrar prefijo tipoPrenda del test para que no sea filtrado
  - `tests/e2e/flujo-comercial.spec.ts`

- **21:24** `97f820f` — feat(g-19): vitrina de demanda para el taller con imagenes
  - `.claude/specs/v4-g-19-vitrina-demanda.md`
  - `prisma/seed.ts`
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`

- **17:07** `e67beb9` — fix(j-03): CONTENIDO puede gestionar colecciones (bug #355)
  - `.claude/specs/j-03-contenido-rutas-colecciones.md`
  - `src/app/(admin)/admin/colecciones/[id]/page.tsx`
  - `src/app/(admin)/admin/colecciones/[id]/videos/page.tsx`
  - `src/app/(admin)/admin/colecciones/nueva/page.tsx`
  - `src/app/(admin)/admin/colecciones/page.tsx`
  - `src/app/(admin)/admin/dashboard/page.tsx`
  - `src/app/(admin)/layout.tsx`
  - `src/app/(contenido)/contenido/colecciones/[id]/page.tsx`
  - `src/app/(contenido)/contenido/colecciones/[id]/videos/page.tsx`
  - `src/app/(contenido)/contenido/colecciones/nueva/page.tsx`
  - `src/app/(contenido)/contenido/colecciones/page.tsx`
  - `src/middleware.ts`

- **16:28** `8d1c49d` — docs(w-a): spec retroactivo + QA del formulario taller
  - `.claude/auditorias/QA_v4-w-a-formulario-taller.md`
  - `.claude/specs/v4-w-a-formulario-taller.md`

- **15:49** `ac01d3f` — fix(w-a): ajustar scores de escalabilidad (optica solidez productiva)
  - `src/app/(taller)/taller/perfil/completar/page.tsx`

- **15:37** `ba5f0f0` — feat(w-a): completar formulario taller (W-A2 a W-A5)
  - `prisma/migrations/20260525180000_agregar_campos_formulario_taller/migration.sql`
  - `prisma/schema.prisma`
  - `src/app/(taller)/taller/perfil/completar/page.tsx`
  - `src/app/api/talleres/[id]/route.ts`

- **12:05** `612b951` — feat(leyenda): aplicar leyenda institucional oficial de OIT
  - `src/app/page.tsx`
  - `src/compartido/lib/content/institutional.ts`
  - `src/compartido/lib/email.ts`

- **11:41** `e8b69db` — chore: trigger e2e after rebase to develop

- **11:25** `401a8fc` — fix(test): exact:true en los 3 selectores de etapa (no solo Etapa inicial)
  - `tests/e2e/configuracion-niveles.spec.ts`

- **11:19** `eb835f5` — fix(test): desambiguar selectores en configuracion-niveles e2e
  - `tests/e2e/configuracion-niveles.spec.ts`

- **11:11** `98c63da` — fix(x-06b): recortar aire vertical del diagrama de proceso (QA Sergio)
  - `src/app/page.tsx`

- **11:04** `90e35ff` — fix(x-07c): corregir textos de nivel en seed reglas_nivel (BUG 1)
  - `prisma/seed.ts`

- **10:52** `9913013` — fix(x-07c): resolver 4 bugs del QA de Sergio
  - `src/app/(estado)/estado/documentos/page.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `src/compartido/lib/content/institutional.ts`


## 2026-05-24

### Gerardo Breard
- **23:31** `e70fd9d` — feat(x-09): mi formalizacion en 3 cards por etapa + SAM a tiempo estandar
  - `src/app/(admin)/admin/evaluaciones/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(contenido)/contenido/evaluaciones/page.tsx`
  - `src/app/(taller)/taller/formalizacion/page.tsx`
  - `src/app/(taller)/taller/perfil/completar/page.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`
  - `src/taller/componentes/asistente-chat.tsx`

- **22:57** `37c4ee8` — fix(x-07c): actualizar e2e test de configuracion-niveles al nuevo copy
  - `tests/e2e/configuracion-niveles.spec.ts`

- **22:50** `8d8ddc5` — feat(x-07c): ocultar niveles en ESTADO y ADMIN (fase 2)
  - `src/app/(admin)/admin/notificaciones/notificaciones-client.tsx`
  - `src/app/(admin)/admin/reportes/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(admin)/admin/talleres/page.tsx`
  - `src/app/(estado)/estado/configuracion-niveles/page.tsx`
  - `src/app/(estado)/estado/documentos/page.tsx`
  - `src/app/(estado)/estado/exportar/page.tsx`
  - `src/app/(estado)/estado/page.tsx`
  - `src/app/(estado)/estado/talleres/[id]/page.tsx`
  - `src/app/(estado)/estado/talleres/page.tsx`
  - `src/compartido/lib/formalizacion.ts`

- **22:27** `f14f47e` — feat(x-07b): ocultar niveles en UI de taller y marca (fase 1)
  - `src/app/(auth)/acceso-rapido/page.tsx`
  - `src/app/(marca)/marca/directorio/page.tsx`
  - `src/app/(public)/ayuda/onboarding-marca/page.tsx`
  - `src/app/(public)/ayuda/onboarding-taller/page.tsx`
  - `src/app/(public)/directorio/page.tsx`
  - `src/app/(taller)/taller/formalizacion/page.tsx`
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`
  - `src/app/api/cotizaciones/route.ts`
  - `src/compartido/componentes/feedback-widget.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `src/compartido/lib/email.ts`
  - `src/compartido/lib/formalizacion.ts`
  - `src/taller/componentes/proximo-nivel-card.tsx`

- **21:31** `6295a46` — fix(k-02): preparar codigo para bucket documentos privado
  - `src/app/(estado)/estado/talleres/[id]/page.tsx`
  - `src/app/api/validaciones/[id]/signed-url/route.ts`

- **21:05** `d023292` — fix(x-06b): assets con transparencia real
  - `public/landing/proceso-textil.webp`
  - `public/logo-pdt.png`

## 2026-05-21

### Gerardo Breard
- **14:12** `536d601` — fix(landing): traer mas novedades al carrusel (take 2 → 5)
  - `src/app/page.tsx`

- **13:29** `c75cf44` — fix(novedades): error reporting claro en upload + crear buckets faltantes
  - `src/app/api/contenido/novedades/upload/route.ts`

- **12:28** `32fa815` — fix(x-06b): aplicar feedback QA de Sergio
  - `public/seed/novedades/capacitacion-inti.jpg`
  - `public/seed/novedades/caso-taller-sur.jpg`
  - `public/seed/novedades/convenio-oit.jpg`
  - `src/app/page.tsx`


## 2026-05-20

### Gerardo Breard
- **22:47** `54650c9` — feat(novedades): pagina de detalle publica /novedades/[slug]
  - `src/app/(public)/novedades/[slug]/page.tsx`

- **22:47** `b60f9d1` — refactor(logo): <LogoPDT> usa next/image en vez de SVG inline
  - `src/compartido/componentes/ui/logo-pdt.tsx`

- **22:47** `184b7dc` — feat(landing): imagen de proceso en seccion 'Asi funciona'
  - `public/landing/proceso-textil.webp`
  - `src/app/page.tsx`

- **22:46** `272ed12` — docs+chore(x-06b): spec FINAL + logo optimizado (985KB → 9.3KB)
  - `.claude/specs/v4-x-06b-mejoras-landing.md`
  - `public/logo-pdt.png`

- **15:35** `d562934` — chore: trigger deploy
  - `README.md`

- **13:53** `9f29dc5` — fix(tests): resolver duplicacion RSC streaming en 5 tests
  - `KNOWN_ISSUES.md`
  - `tests/e2e/acceso-verificado.spec.ts`
  - `tests/e2e/demanda-insatisfecha.spec.ts`
  - `tests/e2e/roles-estado.spec.ts`
  - `tests/e2e/smoke.spec.ts`


## 2026-05-19

### Gerardo Breard
- **18:01** `41a50fd` — feat(u-02): schema multi-rol con CUIT y ARCA centralizados
  - `prisma/migrations/20260519200000_agregar_multirol_y_arca_a_user/migration.sql`
  - `prisma/schema.prisma`

- **17:35** `cbf0b39` — docs(u-01): corregir tipos ARCA tras pre-flight U-02 (v2.1)
  - `docs/analisis/U-01_multi-rol-airbnb.md`

- **17:01** `e85a08e` — docs(u-01): consolidar v2 con 10 decisiones de Gerardo
  - `docs/analisis/U-01_multi-rol-airbnb.md`

- **16:10** `21d454c` — Merge remote-tracking branch 'origin/develop' into feature/v4-x-07a-paleta-dashboards-critico


- **11:32** `f05047c` — fix(x-07a): consistencia H1 ink-primary + H2 font-serif
  - `src/app/(admin)/admin/auditorias/[id]/page.tsx`
  - `src/app/(admin)/admin/auditorias/page.tsx`
  - `src/app/(admin)/admin/certificados/page.tsx`
  - `src/app/(admin)/admin/colecciones/[id]/page.tsx`
  - `src/app/(admin)/admin/colecciones/[id]/videos/page.tsx`
  - `src/app/(admin)/admin/colecciones/nueva/page.tsx`
  - `src/app/(admin)/admin/colecciones/page.tsx`
  - `src/app/(admin)/admin/configuracion/archivos/page.tsx`
  - `src/app/(admin)/admin/configuracion/page.tsx`
  - `src/app/(admin)/admin/dashboard/page.tsx`
  - `src/app/(admin)/admin/evaluaciones/page.tsx`
  - `src/app/(admin)/admin/feedback/page.tsx`
  - `src/app/(admin)/admin/integraciones/email/page.tsx`
  - `src/app/(admin)/admin/integraciones/llm/page.tsx`
  - `src/app/(admin)/admin/integraciones/page.tsx`
  - `src/app/(admin)/admin/logs/page.tsx`
  - `src/app/(admin)/admin/marcas/[id]/page.tsx`
  - `src/app/(admin)/admin/marcas/page.tsx`
  - `src/app/(admin)/admin/notificaciones/page.tsx`
  - `src/app/(admin)/admin/observaciones/[id]/editar/page.tsx`
  - `src/app/(admin)/admin/observaciones/nueva/page.tsx`
  - `src/app/(admin)/admin/observaciones/page.tsx`
  - `src/app/(admin)/admin/onboarding/page.tsx`
  - `src/app/(admin)/admin/pedidos/page.tsx`
  - `src/app/(admin)/admin/procesos/page.tsx`
  - `src/app/(admin)/admin/reportes/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(admin)/admin/talleres/page.tsx`
  - `src/app/(admin)/admin/usuarios/page.tsx`
  - `src/app/(auth)/acceso-rapido/page.tsx`
  - `src/app/(auth)/layout.tsx`
  - `src/app/(auth)/login/page.tsx`
  - `src/app/(auth)/mi-cuenta/page.tsx`
  - `src/app/(auth)/olvide-contrasena/page.tsx`
  - `src/app/(auth)/registro/completar/page.tsx`
  - `src/app/(auth)/registro/page.tsx`
  - `src/app/(auth)/restablecer/[token]/page.tsx`
  - `src/app/(contenido)/contenido/colecciones/page.tsx`
  - `src/app/(contenido)/contenido/evaluaciones/page.tsx`
  - `src/app/(contenido)/contenido/notificaciones/page.tsx`
  - `src/app/(contenido)/contenido/novedades/[id]/editar/page.tsx`
  - `src/app/(contenido)/contenido/novedades/nueva/page.tsx`
  - `src/app/(contenido)/contenido/novedades/page.tsx`
  - `src/app/(estado)/estado/auditorias/page.tsx`
  - `src/app/(estado)/estado/configuracion-niveles/page.tsx`
  - `src/app/(estado)/estado/demanda-insatisfecha/page.tsx`
  - `src/app/(estado)/estado/documentos/page.tsx`
  - `src/app/(estado)/estado/exportar/page.tsx`
  - `src/app/(estado)/estado/page.tsx`
  - `src/app/(estado)/estado/sector/page.tsx`
  - `src/app/(estado)/estado/talleres/[id]/page.tsx`
  - `src/app/(estado)/estado/talleres/page.tsx`
  - `src/app/(marca)/marca/directorio/[id]/page.tsx`
  - `src/app/(marca)/marca/directorio/page.tsx`
  - `src/app/(marca)/marca/page.tsx`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(marca)/marca/pedidos/nuevo/nuevo-pedido-form.tsx`
  - `src/app/(marca)/marca/pedidos/page.tsx`
  - `src/app/(marca)/marca/perfil/page.tsx`
  - `src/app/(taller)/taller/aprender/[id]/page.tsx`
  - `src/app/(taller)/taller/aprender/page.tsx`
  - `src/app/(taller)/taller/formalizacion/page.tsx`
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/(taller)/taller/pedidos/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
  - `src/app/(taller)/taller/pedidos/page.tsx`
  - `src/app/(taller)/taller/perfil/completar/page.tsx`
  - `src/app/(taller)/taller/perfil/editar/editar-form.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`
  - `src/app/unauthorized/page.tsx`

- **11:24** `364640e` — fix(x-07a): refactor /taller dashboard a V4 (paridad con /marca)
  - `src/app/(taller)/taller/page.tsx`

- **10:32** `1c5709f` — docs(u-01): análisis funcional y técnico multi-rol Airbnb
  - `docs/analisis/U-01_multi-rol-airbnb.md`


## 2026-05-18

### Gerardo Breard
- **16:34** `8dcf0b0` — feat(x-07a): font-serif en titulares H1/H2 de dashboards
  - `src/app/(admin)/admin/auditorias/[id]/informe-client.tsx`
  - `src/app/(admin)/admin/auditorias/[id]/page.tsx`
  - `src/app/(admin)/admin/auditorias/page.tsx`
  - `src/app/(admin)/admin/certificados/page.tsx`
  - `src/app/(admin)/admin/colecciones/[id]/page.tsx`
  - `src/app/(admin)/admin/colecciones/[id]/videos/page.tsx`
  - `src/app/(admin)/admin/colecciones/nueva/page.tsx`
  - `src/app/(admin)/admin/colecciones/page.tsx`
  - `src/app/(admin)/admin/configuracion/archivos/page.tsx`
  - `src/app/(admin)/admin/configuracion/page.tsx`
  - `src/app/(admin)/admin/dashboard/page.tsx`
  - `src/app/(admin)/admin/evaluaciones/page.tsx`
  - `src/app/(admin)/admin/feedback/page.tsx`
  - `src/app/(admin)/admin/integraciones/email/page.tsx`
  - `src/app/(admin)/admin/integraciones/llm/page.tsx`
  - `src/app/(admin)/admin/integraciones/page.tsx`
  - `src/app/(admin)/admin/logs/page.tsx`
  - `src/app/(admin)/admin/marcas/[id]/page.tsx`
  - `src/app/(admin)/admin/marcas/page.tsx`
  - `src/app/(admin)/admin/notificaciones/page.tsx`
  - `src/app/(admin)/admin/observaciones/[id]/editar/page.tsx`
  - `src/app/(admin)/admin/observaciones/nueva/page.tsx`
  - `src/app/(admin)/admin/observaciones/page.tsx`
  - `src/app/(admin)/admin/onboarding/page.tsx`
  - `src/app/(admin)/admin/pedidos/page.tsx`
  - `src/app/(admin)/admin/procesos/page.tsx`
  - `src/app/(admin)/admin/reportes/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(admin)/admin/talleres/page.tsx`
  - `src/app/(admin)/admin/usuarios/page.tsx`
  - `src/app/(contenido)/contenido/colecciones/page.tsx`
  - `src/app/(contenido)/contenido/evaluaciones/page.tsx`
  - `src/app/(contenido)/contenido/notificaciones/page.tsx`
  - `src/app/(contenido)/contenido/novedades/[id]/editar/page.tsx`
  - `src/app/(contenido)/contenido/novedades/nueva/page.tsx`
  - `src/app/(contenido)/contenido/novedades/page.tsx`
  - `src/app/(estado)/estado/auditorias/page.tsx`
  - `src/app/(estado)/estado/configuracion-niveles/page.tsx`
  - `src/app/(estado)/estado/demanda-insatisfecha/page.tsx`
  - `src/app/(estado)/estado/documentos/page.tsx`
  - `src/app/(estado)/estado/exportar/page.tsx`
  - `src/app/(estado)/estado/page.tsx`
  - `src/app/(estado)/estado/sector/page.tsx`
  - `src/app/(estado)/estado/talleres/[id]/page.tsx`
  - `src/app/(estado)/estado/talleres/page.tsx`
  - `src/app/(marca)/marca/directorio/[id]/page.tsx`
  - `src/app/(marca)/marca/directorio/page.tsx`
  - `src/app/(marca)/marca/page.tsx`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(marca)/marca/pedidos/nuevo/nuevo-pedido-form.tsx`
  - `src/app/(marca)/marca/pedidos/page.tsx`
  - `src/app/(marca)/marca/perfil/page.tsx`
  - `src/app/(taller)/taller/aprender/[id]/page.tsx`
  - `src/app/(taller)/taller/aprender/page.tsx`
  - `src/app/(taller)/taller/formalizacion/page.tsx`
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/(taller)/taller/pedidos/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
  - `src/app/(taller)/taller/pedidos/page.tsx`
  - `src/app/(taller)/taller/perfil/completar/page.tsx`
  - `src/app/(taller)/taller/perfil/editar/editar-form.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`

- **16:22** `60192c1` — feat(x-07a): paleta V4 en 21 paginas con clases blue inline
  - `src/app/(admin)/admin/auditorias/page.tsx`
  - `src/app/(admin)/admin/notificaciones/page.tsx`
  - `src/app/(admin)/admin/observaciones/page.tsx`
  - `src/app/(admin)/admin/onboarding/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(admin)/layout.tsx`
  - `src/app/(contenido)/contenido/notificaciones/page.tsx`
  - `src/app/(contenido)/contenido/novedades/formulario-novedad.tsx`
  - `src/app/(contenido)/contenido/novedades/page.tsx`
  - `src/app/(contenido)/layout.tsx`
  - `src/app/(estado)/estado/exportar/page.tsx`
  - `src/app/(estado)/estado/page.tsx`
  - `src/app/(estado)/estado/talleres/[id]/page.tsx`
  - `src/app/(marca)/marca/directorio/[id]/page.tsx`
  - `src/app/(marca)/marca/page.tsx`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/(taller)/taller/pedidos/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/page.tsx`
  - `src/app/(taller)/taller/perfil/completar/page.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`

- **16:14** `7d58d2b` — feat(x-07a): paleta V4 en componentes layout y secundarios
  - `src/compartido/componentes/activity-timeline.tsx`
  - `src/compartido/componentes/badge-arca.tsx`
  - `src/compartido/componentes/error-page.tsx`
  - `src/compartido/componentes/feedback-widget.tsx`
  - `src/compartido/componentes/layout/notificaciones-bell.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `src/compartido/componentes/ui/progress-ring.tsx`
  - `src/compartido/componentes/ui/section-error.tsx`

- **15:58** `8cccda2` — feat(x-07a): paleta V4 en componentes UI base — toast.tsx
  - `src/compartido/componentes/ui/toast.tsx`

- **14:34** `971e673` — docs: lecciones de investigacion CI flaky (18-mayo-2026)
  - `KNOWN_ISSUES.md`

- **14:12** `7183d39` — fix(tests): eliminar doble navegacion en smoke admin/logs
  - `tests/e2e/smoke.spec.ts`

- **13:43** `f7cbcaf` — fix(tests): usar getByRole heading en exportes-estado
  - `tests/e2e/exportes-estado.spec.ts`

- **13:43** `574a35b` — fix(tests): scope selector a 'header nav' en demanda-insatisfecha
  - `tests/e2e/demanda-insatisfecha.spec.ts`

- **13:35** `8a1759f` — fix(tests): beforeAll para restaurar config imagenes-portfolio
  - `tests/e2e/file-validation.spec.ts`

- **13:35** `caf3b6d` — fix(tests): eliminar waitUntil 'load' en smoke admin/logs
  - `tests/e2e/smoke.spec.ts`


## 2026-05-17

### Gerardo Breard
- **23:10** `9964df2` — feat(x-06b): footer con links limpios (sin destinos 404)
  - `src/compartido/lib/content/institutional.ts`

- **23:09** `e57309d` — feat(x-06b): disclaimer piloto antes del footer + limpiar carrusel
  - `src/app/page.tsx`

- **23:08** `16d2b49` — refactor(x-06b): eliminar secciones obsoletas (Para Talleres + Banner Sumate)
  - `src/app/page.tsx`
  - `src/compartido/lib/content/institutional.ts`

- **23:00** `2491b17` — feat(x-06b): impacto con stats reformuladas (metricas V4)
  - `src/app/page.tsx`
  - `src/compartido/lib/content/institutional.ts`

- **22:55** `7e6492a` — feat(x-06b): nueva seccion 'Asi funciona' narrativa
  - `src/app/page.tsx`

- **22:47** `98bb682` — feat(x-06b): hero rediseñado con copy alineado a master V4
  - `src/app/page.tsx`
  - `src/compartido/lib/content/institutional.ts`

- **22:46** `8c19d3a` — feat(x-06b): HeaderPublic con pill ambiente piloto + nav reducido
  - `src/app/(public)/layout.tsx`
  - `src/app/page.tsx`
  - `src/compartido/componentes/layout/header-public.tsx`
  - `src/compartido/lib/content/institutional.ts`

- **22:44** `f8a1300` — refactor(x-06b): centralizar logica showPilotPill en util
  - `src/app/(public)/layout.tsx`
  - `src/compartido/lib/env.ts`

- **21:48** `cf0a354` — docs: oficializar TEMPLATE_SPEC_V4 con pre-flight y selectores criticos
  - `"docs/Dise\303\261o/TEMPLATE_SPEC_V4.md"`

- **20:51** `680b4bd` — fix: add Supabase Storage to next/image remotePatterns
  - `next.config.ts`

- **20:36** `bcd5fbe` — feat(x-04b): add CMS novedades pages + sidebar entry
  - `src/app/(contenido)/contenido-sidebar.tsx`
  - `src/app/(contenido)/contenido/novedades/[id]/editar/page.tsx`
  - `src/app/(contenido)/contenido/novedades/formulario-novedad.tsx`
  - `src/app/(contenido)/contenido/novedades/loading.tsx`
  - `src/app/(contenido)/contenido/novedades/nueva/page.tsx`
  - `src/app/(contenido)/contenido/novedades/page.tsx`

- **20:29** `81a92fe` — feat(x-04b): add CRUD + upload endpoints for novedades
  - `src/app/api/contenido/novedades/[id]/route.ts`
  - `src/app/api/contenido/novedades/route.ts`
  - `src/app/api/contenido/novedades/upload/route.ts`

- **20:27** `cca786b` — feat(x-04b): add slugify utility for novedades
  - `src/compartido/lib/slugify.ts`

- **18:48** `ccfb7f0` — fix(x-06): corregir valor de enum EstadoPedido
  - `src/app/page.tsx`

- **18:28** `d75cfd8` — feat(x-06): landing rediseñado V4
  - `src/app/page.tsx`

- **18:25** `048a00e` — feat(x-06): componente CarruselNovedades con flechas prev/next
  - `src/compartido/componentes/ui/carrusel-novedades.tsx`

- **18:25** `3b51b15` — feat(x-06): layout (public) usa HeaderPublic para anonimos
  - `src/app/(public)/layout.tsx`

- **18:23** `bbc75f7` — feat(x-06): assets del landing (hero + placeholders novedades)
  - `public/images/landing/hero-taller.png`
  - `public/seed/novedades/capacitacion-inti.jpg`
  - `public/seed/novedades/caso-taller-sur.jpg`
  - `public/seed/novedades/convenio-oit.jpg`
  - `public/seed/novedades/placeholder.svg`

- **18:21** `dcdd034` — feat(x-06): agregar publicRoutes para paginas marketing
  - `src/middleware.ts`

- **18:19** `85694f2` — feat(x-06): componente HeaderPublic (1 banda sticky)
  - `src/compartido/componentes/layout/header-public.tsx`

- **18:16** `1d5138c` — feat(x-06): extender institutional.ts con textos del landing
  - `src/compartido/lib/content/institutional.ts`

- **18:14** `5a61586` — feat(x-06): agregar utilities pattern-grid y card-lift
  - `src/app/globals.css`

- **00:16** `4189077` — fix(x-05): simplificar smoke test del header
  - `tests/e2e/smoke.spec.ts`

- **00:11** `b2fcd3d` — fix(x-05): scoped sidebar selector + robust pill assertion
  - `tests/e2e/roles-estado.spec.ts`
  - `tests/e2e/smoke.spec.ts`

- **00:02** `2af3fbf` — fix(x-05): tests E2E y aria-label compatible
  - `src/compartido/componentes/layout/header.tsx`
  - `tests/e2e/smoke.spec.ts`


## 2026-05-16

### Gerardo Breard
- **23:48** `8ebba81` — feat(x-05): refactor Header a 2 bandas + montar Footer en layouts
  - `src/app/(auth)/layout.tsx`
  - `src/app/(estado)/layout.tsx`
  - `src/app/(marca)/layout.tsx`
  - `src/app/(public)/layout.tsx`
  - `src/app/(taller)/layout.tsx`
  - `src/app/layout.tsx`
  - `src/compartido/componentes/layout/header.tsx`

- **23:45** `a8b89a6` — feat(x-05): componente Footer institucional 4 columnas
  - `src/compartido/componentes/layout/footer.tsx`

- **23:44** `074c380` — feat(x-05): paginas stub para links del footer
  - `src/app/(public)/academia-publica/page.tsx`
  - `src/app/(public)/accesibilidad/page.tsx`
  - `src/app/(public)/contacto/page.tsx`
  - `src/app/(public)/impacto/page.tsx`
  - `src/app/(public)/marca-info/page.tsx`
  - `src/app/(public)/novedades/page.tsx`
  - `src/app/(public)/recursos/page.tsx`
  - `src/app/(public)/taller-info/page.tsx`

- **23:43** `fb9efb2` — feat(x-05): institutional.ts con textos centralizados
  - `src/compartido/lib/content/institutional.ts`

- **23:07** `f449ace` — docs(handover): auditoria operabilidad + specs CMS pendientes
  - `.claude/specs/ORDEN_IMPLEMENTACION.md`
  - `.claude/specs/handover/AUDITORIA_OPERABILIDAD_2026-05-16.md`
  - `.claude/specs/handover/DECISIONS.md`

- **21:09** `6fb4683` — fix(acceso-rapido): restaurar usuario CONTENIDO
  - `src/app/(auth)/acceso-rapido/page.tsx`

- **20:30** `7d65e27` — fix(notificaciones): tab 'Todas' por default en pagina cuenta
  - `src/app/(public)/cuenta/notificaciones/page.tsx`

- **19:28** `f6c6950` — fix(api): include solo con relaciones en /api/talleres
  - `src/app/api/talleres/route.ts`

- **18:19** `6ead85f` — docs(handover): lecciones operativas del 2026-05-16
  - `.claude/specs/handover/DECISIONS.md`

- **16:26** `3de1276` — merge: traer W-A1 de main a develop


- **13:32** `baff23c` — feat(seed): plantillas de ejemplo + test E2E desglose
  - `prisma/seed.ts`
  - `tests/e2e/desglose-plantilla.spec.ts`

- **13:26** `73ad698` — feat(api): guardado y lectura de plantilla en talleres
  - `src/app/api/talleres/[id]/route.ts`
  - `src/app/api/talleres/me/route.ts`

- **13:25** `5e6ac69` — feat(reporte): distribucion de plantilla por categoria
  - `src/app/(estado)/estado/sector/page.tsx`

- **13:20** `2958e3f` — feat(perfil): vista de plantilla con desglose por categoria
  - `src/app/(taller)/taller/perfil/page.tsx`

- **13:20** `84a693a` — feat(form): wizard paso 4 con desglose por categoria
  - `src/app/(taller)/taller/perfil/completar/page.tsx`

- **13:16** `38737c4` — feat(db): schema TallerPlantilla + helper oficio textil
  - `prisma/migrations/20260516120000_desglose_plantilla_taller/migration.sql`
  - `prisma/schema.prisma`
  - `src/compartido/lib/oficio-textil.ts`

- **13:06** `053eb4a` — docs(spec): W-A1 desglose plantilla — spec inicial con correcciones
  - `.claude/specs/v4-w-a1-desglose-plantilla.md`


## 2026-05-15

### Gerardo Breard
- **20:40** `def5b7f` — feat(db): modelo Novedad + endpoint publico
  - `prisma/migrations/20260515200000_agregar_modelo_novedad/migration.sql`
  - `prisma/schema.prisma`
  - `prisma/seed.ts`
  - `src/app/api/novedades/route.ts`

- **20:32** `4da55c9` — docs(spec): X-04 modelo Novedad
  - `.claude/specs/v4-x-04-modelo-novedad.md`

- **15:59** `f91ea1c` — fix(e2e): resolver race condition en file-validation con serial mode
  - `tests/e2e/file-validation.spec.ts`

- **15:25** `f680b3f` — fix(e2e): strict mode y navigation race en demanda-insatisfecha y smoke
  - `tests/e2e/demanda-insatisfecha.spec.ts`
  - `tests/e2e/smoke.spec.ts`

- **15:19** `47f7347` — chore(skills): infraestructura de skills V4
  - `.claude/skills/README.md`
  - `.claude/skills/debugging-methodology/SKILL.md`
  - `.claude/skills/github-workflows/SKILL.md`
  - `.claude/skills/playwright-e2e/SKILL.md`
  - `.claude/skills/spec-v4-implementation/SKILL.md`
  - `.claude/skills/vercel-nextauth/SKILL.md`

- **14:50** `208f950` — docs(handover): documentar flaky multi-rol en flujo-comercial
  - `.claude/specs/handover/KNOWN_ISSUES.md`

- **12:56** `bf34840` — fix(e2e): 4 bugs preexistentes en tests ESTADO destapados por storageState
  - `tests/e2e/demanda-insatisfecha.spec.ts`
  - `tests/e2e/exportes-estado.spec.ts`

- **11:32** `afd40af` — fix(e2e): navegacion full-page despues de login para evitar RSC hang
  - `tests/e2e/_helpers/auth.ts`
  - `tests/e2e/auth.setup.ts`

- **11:13** `7801f9f` — fix(e2e): usar browser real en auth.setup (no page.request)
  - `tests/e2e/_helpers/auth.ts`
  - `tests/e2e/auth.setup.ts`


## 2026-05-14

### Gerardo Breard
- **23:17** `5f8b6c4` — debug: agregar logging diagnostico al auth setup
  - `tests/e2e/auth.setup.ts`

- **23:12** `ced67eb` — fix(e2e): auth setup via API directa en vez de browser form
  - `tests/e2e/auth.setup.ts`

- **22:56** `9ff8bb2` — fix(e2e): scopear locator de h1 con .first() para strict mode
  - `tests/e2e/admin-no-regression.spec.ts`
  - `tests/e2e/observaciones-campo.spec.ts`
  - `tests/e2e/onboarding.spec.ts`

- **22:55** `cf19216` — fix(e2e): resolver timeouts de tests ESTADO con storageState
  - `playwright.config.ts`
  - `tests/e2e/_helpers/auth.ts`
  - `tests/e2e/auth.setup.ts`

- **15:17** `0585e7b` — fix(e2e): scopear selector de Breadcrumb a <main>
  - `tests/e2e/exportes-estado.spec.ts`
  - `tests/e2e/layout-consistency.spec.ts`
  - `tests/e2e/ux-mejoras.spec.ts`

- **15:32** `4b6ff74` — fix(file-validation): eliminar cache in-memory cross-instance
  - `src/app/api/admin/configuracion-upload/[id]/route.ts`
  - `src/compartido/lib/file-validation.ts`

- **12:24** `52f6537` — chore(qa-pages): soportar QAs V4 en workflow y generador
  - `.github/workflows/qa-pages.yml`
  - `tools/generate-qa.js`

- **00:48** `8213c0b` — feat(visual): tokens v4 (paleta extendida + tipografías Source Serif/Inter)
  - `.claude/specs/v4-x-01-tokens.md`
  - `src/app/globals.css`


## 2026-05-13

### Gerardo Breard
- **17:16** `cb66a4b` — fix(ci+auth): consolidar fixes E2E preview deploys
  - `.github/workflows/e2e.yml`
  - `src/compartido/lib/email.ts`

- **16:37** `44b65c9` — feat(ci): warmup programático con login real por rol
  - `.github/workflows/e2e.yml`

- **16:07** `4836ead` — fix(middleware): /unauthorized debe ser pública
  - `src/middleware.ts`

- **13:20** `6bbe557` — fix(ci): E2E workflow soporta preview deploys de PRs
  - `.github/workflows/e2e.yml`

- **11:58** `7d5c473` — chore: trigger redeploy con variables de entorno corregidas


## 2026-05-12

### Gerardo Breard
- **19:42** `bb8c8fa` — chore: handover básico V4 (README, LICENSE, docs, decisiones)
  - `.claude/specs/handover/DECISIONS.md`
  - `.claude/specs/handover/DEPLOY.md`
  - `.claude/specs/handover/HOW_TO_ADD_SPEC.md`
  - `.claude/specs/handover/HOW_TO_RUN_QA.md`
  - `LICENSE`
  - `README.md`
  - `docs/AS_IS_MAP.md`
  - `docs/GAP_MATRIX.md`
  - `docs/README.md`
  - `docs/ROADMAP_REMEDIACION.md`
  - `docs/TO_BE_MAP.md`
  - `package.json`


## 2026-05-09

### Gerardo Breard
- **21:05** `aa0f198` — fix: reemplazar texto institucional "OIT Argentina" por mandato OIT
  - `src/__tests__/onboarding.test.ts`
  - `src/app/(admin)/admin/certificados/page.tsx`
  - `src/app/api/admin/onboarding/reenviar-invitacion/route.ts`
  - `src/app/api/certificados/[id]/pdf/route.tsx`
  - `src/app/page.tsx`
  - `src/compartido/componentes/pdf/certificado-pdf.tsx`
  - `src/compartido/componentes/pdf/orden-pdf.tsx`
  - `src/compartido/lib/email.ts`
  - `src/compartido/lib/rag.ts`


## 2026-05-08

### Gerardo Breard
- **18:06** `a1b7c73` — fix: E2E test buscaba 'Puntaje' que fue reemplazado por 'Formalización'
  - `tests/e2e/configuracion-niveles.spec.ts`

- **16:17** `181b73e` — fix: 10 issues feedback piloto (#215 #221 #247 #249 #250 #251 #265 #266 #284 #288)
  - `src/app/(auth)/registro/page.tsx`
  - `src/app/(marca)/marca/perfil/page.tsx`
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/(taller)/taller/perfil/completar/page.tsx`

- **15:34** `ce16843` — fix: catch generico en nuevo-pedido-form muestra error real (#280 #282)
  - `src/app/(marca)/marca/pedidos/nuevo/nuevo-pedido-form.tsx`

- **15:28** `02a8325` — fix: acentos faltantes en paginas estado (#291 #293 #294 #295 #296)
  - `src/app/(estado)/estado/auditorias/page.tsx`
  - `src/app/(estado)/estado/demanda-insatisfecha/page.tsx`
  - `src/app/(estado)/estado/page.tsx`
  - `src/app/(estado)/estado/talleres/page.tsx`

- **15:04** `2bee11e` — fix: acentos faltantes en paginas marca (#275 #277 #278 #279 #281)
  - `src/app/(marca)/marca/directorio/page.tsx`
  - `src/app/(marca)/marca/page.tsx`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(marca)/marca/pedidos/nuevo/nuevo-pedido-form.tsx`
  - `src/app/(marca)/marca/pedidos/page.tsx`

- **12:54** `0a6ebbe` — fix: 3 issues feedback piloto (#269 #270 #271)
  - `src/app/(taller)/taller/perfil/completar/page.tsx`
  - `src/app/(taller)/taller/perfil/page.tsx`
  - `src/taller/componentes/portfolio-manager.tsx`

- **12:43** `132fb50` — fix: 8 mejoras UX feedback piloto (#244 #248 #255 #261 #245 #246 #228 #231 #264)
  - `src/app/(estado)/estado/page.tsx`
  - `src/app/(taller)/taller/perfil/completar/page.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `src/compartido/componentes/ui/checklist-item.tsx`
  - `src/taller/componentes/cotizar-form.tsx`

- **12:31** `5664714` — fix: error conexion al cotizar + detectar cotizacion rechazada (#260 #263)
  - `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`
  - `src/taller/componentes/cotizar-form.tsx`

- **12:04** `6a1cc9d` — chore: mover 12 issues piloto a V4_BACKLOG (G-07 a G-16)
  - `.claude/specs/V4_BACKLOG.md`


## 2026-05-07

### Gerardo Breard
- **15:48** `91ea86e` — fix: actualizar E2E tests tras cambios de texto piloto
  - `tests/e2e/acceso-verificado.spec.ts`
  - `tests/e2e/roles-estado.spec.ts`

- **14:57** `6807200` — fix: 7 cambios de texto feedback piloto (#216-#218 #223 #227 #232 #235)
  - `src/app/(auth)/registro/page.tsx`
  - `src/app/(estado)/estado/page.tsx`
  - `src/app/(estado)/estado/sector/page.tsx`
  - `src/app/(marca)/marca/directorio/page.tsx`
  - `src/app/(marca)/marca/pedidos/page.tsx`
  - `src/app/(public)/directorio/page.tsx`
  - `src/app/(taller)/taller/perfil/completar/page.tsx`
  - `src/compartido/componentes/layout/header.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`

- **11:25** `f4ed00b` — fix: limpiar 4 links rotos en dashboard admin (#211)
  - `src/app/(admin)/admin/dashboard/page.tsx`

- **11:13** `a519638` — chore: mover issues #213 #214 a V4_BACKLOG (G-05, G-06)
  - `.claude/specs/V4_BACKLOG.md`

- **10:59** `f9c3a04` — chore: cerrar V3 — marcar resultado global en 12 QAs
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-acceso-pre-formalizacion.md`
  - `.claude/auditorias/QA_v3-arca-completo.md`
  - `.claude/auditorias/QA_v3-cookies-seguridad.md`
  - `.claude/auditorias/QA_v3-demanda-insatisfecha.md`
  - `.claude/auditorias/QA_v3-exportes-estado.md`
  - `.claude/auditorias/QA_v3-rate-limiting.md`
  - `.claude/auditorias/QA_v3-redefinicion-roles-estado.md`
  - `.claude/auditorias/QA_v3-reporte-campo.md`
  - `.claude/auditorias/QA_v3-tipos-documento-db.md`
  - `.claude/auditorias/QA_v3-validacion-archivos.md`

- **10:51** `cbc1476` — chore: reestructurar V4_BACKLOG + consolidado Eje 6
  - `.claude/specs/V4_BACKLOG.md`
  - `docs/decisiones-pendientes-OIT.md`
  - `docs/v4-input-institucional.md`

- **10:19** `4ab798a` — audit: QA S-01/S-02/S-03 seguridad — final de Fase 2
  - `.claude/auditorias/QA_v3-cookies-seguridad.md`
  - `.claude/auditorias/QA_v3-rate-limiting.md`
  - `.claude/auditorias/QA_v3-validacion-archivos.md`

- **10:02** `613cf7d` — fix: 2 hallazgos F-05 — deprecar export dedicado + sidebar mobile
  - `src/app/(estado)/estado/demanda-insatisfecha/page.tsx`
  - `src/app/api/estado/demanda-insatisfecha/exportar/route.ts`
  - `src/compartido/componentes/layout/user-sidebar.tsx`

- **09:46** `10bb476` — audit: QA F-05 demanda insatisfecha completo
  - `.claude/auditorias/QA_v3-demanda-insatisfecha.md`

- **09:30** `973f9d9` — fix: 2 hallazgos F-04 — dead import + columnas demanda
  - `src/app/(estado)/estado/exportar/page.tsx`
  - `src/app/api/estado/exportar/data.ts`
  - `src/compartido/lib/demanda-insatisfecha.ts`


## 2026-05-06

### Gerardo Breard
- **19:38** `8dfdade` — audit: QA F-04 exportes estado completo
  - `.claude/auditorias/QA_v3-exportes-estado.md`

- **19:26** `d3bbe08` — fix: threshold inactividad 7→14 dias + V4 entries + decisiones OIT
  - `.claude/specs/V4_BACKLOG.md`
  - `docs/decisiones-pendientes-OIT.md`
  - `src/compartido/lib/onboarding.ts`

- **17:54** `45b5e62` — audit: QA T-03 protocolos onboarding completo
  - `.claude/auditorias/QA_v3-protocolos-onboarding.md`

- **17:43** `ebd3cd9` — fix: 2 hallazgos T-02 + Bloque M gobernanza en V4_BACKLOG
  - `.claude/specs/V4_BACKLOG.md`
  - `src/app/(admin)/admin/observaciones/formulario-observacion.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`

- **17:25** `8aecec0` — audit: QA T-02 reporte de campo completo
  - `.claude/auditorias/QA_v3-reporte-campo.md`

- **16:32** `cfce2b0` — fix: 6 hallazgos QA D-01 + D-02
  - `.claude/auditorias/QA_v3-redefinicion-roles-estado.md`
  - `.claude/auditorias/QA_v3-tipos-documento-db.md`
  - `src/app/(estado)/estado/configuracion-niveles/page.tsx`
  - `src/app/(estado)/estado/documentos/page.tsx`
  - `src/app/(taller)/taller/formalizacion/page.tsx`
  - `src/app/api/admin/logs/route.ts`
  - `src/app/api/estado/configuracion-niveles/preview/route.ts`

- **16:17** `4aca19f` — audit: QA D-01 + D-02 completos — code review + Eje 6
  - `.claude/auditorias/QA_v3-redefinicion-roles-estado.md`
  - `.claude/auditorias/QA_v3-tipos-documento-db.md`

- **16:05** `c9208ed` — audit: INT-02 aprobado — dry-runs exitosos (Gerardo 6/5)
  - `.claude/auditorias/QA_v3-email-resend.md`

- **16:01** `77c7289` — chore: agregar Bloque L (Documentacion/Operaciones) a V4_BACKLOG
  - `.claude/specs/V4_BACKLOG.md`

- **15:55** `64ba7cb` — audit: corregir diagnostico erroneo INT-02 env vars
  - `.claude/auditorias/QA_v3-email-resend.md`

- **15:11** `04d9115` — audit: INT-02 rechazado — RESEND_API_KEY vacia en produccion
  - `.claude/auditorias/QA_v3-email-resend.md`

- **14:42** `ffd2940` — audit: QA INT-02 email-resend completo (code review)
  - `.claude/auditorias/QA_v3-email-resend.md`

- **13:56** `53f6298` — fix: 5 hallazgos QA INT-00 — seguridad, paginacion, UX
  - `src/__tests__/acceso-verificado.test.ts`
  - `src/app/(marca)/marca/directorio/page.tsx`
  - `src/app/(marca)/marca/page.tsx`
  - `src/app/(public)/directorio/page.tsx`
  - `src/app/api/pedidos/[id]/ordenes/route.ts`
  - `src/app/api/talleres/route.ts`

- **13:34** `c7c1ef2` — chore: agregar Bloque K (Seguridad) a V4_BACKLOG
  - `.claude/specs/V4_BACKLOG.md`

- **13:23** `dfeb6a7` — audit: QA INT-00 acceso pre-formalizacion completo
  - `.claude/auditorias/QA_v3-acceso-pre-formalizacion.md`

- **12:26** `2b6a695` — fix: 5 hallazgos QA INT-01 ARCA + auditoria completa
  - `.claude/auditorias/QA_v3-arca-completo.md`
  - `src/app/(estado)/estado/talleres/page.tsx`
  - `src/app/api/estado/arca/reverificar/[id]/route.ts`
  - `src/app/api/estado/arca/route.ts`
  - `src/compartido/lib/arca.ts`

- **11:08** `e195aca` — chore: agregar .certs/ y *.key a .gitignore + mover issues #208-#210 a V4
  - `.claude/specs/V4_BACKLOG.md`
  - `.gitignore`

- **10:48** `e7b3d29` — fix: resolver bugs QA pre-piloto (#193 #199 #201) + limpiar 41 issues
  - `.claude/specs/V4_BACKLOG.md`
  - `src/app/(auth)/registro/page.tsx`
  - `src/app/api/auth/verificar-email/route.ts`
  - `src/compartido/lib/ratelimit.ts`
  - `src/taller/componentes/proximo-nivel-card.tsx`

- **01:02** `68df91e` — chore: ocultar rol CONTENIDO de UI admin + documentar como deuda V4
  - `.claude/specs/V4_BACKLOG.md`
  - `src/app/(admin)/admin/usuarios/page.tsx`
  - `src/app/(auth)/acceso-rapido/page.tsx`

- **00:11** `c60113b` — feat: T-02 reporte de campo del piloto — observaciones cualitativas + reportes Excel OIT
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-reporte-campo.md`
  - `.claude/auditorias/REVIEW_v3-reporte-campo.md`
  - `prisma/migrations/20260505160000_add_observacion_campo/migration.sql`
  - `prisma/schema.prisma`
  - `src/__tests__/observaciones-campo.test.ts`
  - `src/__tests__/whatsapp.test.ts`
  - `src/app/(admin)/admin/observaciones/[id]/editar/eliminar-observacion.tsx`
  - `src/app/(admin)/admin/observaciones/[id]/editar/loading.tsx`
  - `src/app/(admin)/admin/observaciones/[id]/editar/page.tsx`
  - `src/app/(admin)/admin/observaciones/formulario-observacion.tsx`
  - `src/app/(admin)/admin/observaciones/loading.tsx`
  - `src/app/(admin)/admin/observaciones/nueva/loading.tsx`
  - `src/app/(admin)/admin/observaciones/nueva/page.tsx`
  - `src/app/(admin)/admin/observaciones/page.tsx`
  - `src/app/(admin)/layout.tsx`
  - `src/app/api/admin/observaciones/[id]/route.ts`
  - `src/app/api/admin/observaciones/route.ts`
  - `src/app/api/admin/reporte-mensual/route.ts`
  - `src/app/api/admin/reporte-piloto/route.ts`
  - `src/app/api/admin/usuarios-buscar/route.ts`
  - `tests/e2e/observaciones-campo.spec.ts`


## 2026-05-05

### Gerardo Breard
- **22:25** `1a0e850` — fix: layout (public) condicional — Header global para usuarios logueados
  - `CLAUDE.md`
  - `src/app/(public)/ayuda/onboarding-marca/page.tsx`
  - `src/app/(public)/ayuda/onboarding-taller/page.tsx`
  - `src/app/(public)/cuenta/notificaciones/page.tsx`
  - `src/app/(public)/layout.tsx`
  - `tests/e2e/layout-consistency.spec.ts`

- **21:42** `f59946b` — feat: T-03 protocolos de onboarding — guias, dashboard, checklist, notas, email
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-protocolos-onboarding.md`
  - `.claude/auditorias/REVIEW_v3-protocolos-onboarding.md`
  - `prisma/migrations/20260505140000_add_nota_seguimiento/migration.sql`
  - `prisma/schema.prisma`
  - `src/__tests__/onboarding.test.ts`
  - `src/admin/componentes/notas-seguimiento.tsx`
  - `src/app/(admin)/admin/marcas/[id]/page.tsx`
  - `src/app/(admin)/admin/onboarding/acciones-rapidas.tsx`
  - `src/app/(admin)/admin/onboarding/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(admin)/layout.tsx`
  - `src/app/(marca)/marca/page.tsx`
  - `src/app/(public)/ayuda/onboarding-marca/page.tsx`
  - `src/app/(public)/ayuda/onboarding-taller/page.tsx`
  - `src/app/(public)/ayuda/page.tsx`
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/api/admin/notas-seguimiento/route.ts`
  - `src/app/api/admin/onboarding/reenviar-invitacion/route.ts`
  - `src/compartido/componentes/ui/checklist-onboarding.tsx`
  - `src/compartido/lib/email.ts`
  - `src/compartido/lib/onboarding.ts`
  - `src/compartido/lib/whatsapp-templates.ts`
  - `tests/e2e/onboarding.spec.ts`

- **20:19** `f35e18b` — feat: badge de notificaciones en header global — campana con count, dropdown, polling 30s
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-badge-notificaciones-header.md`
  - `.claude/auditorias/REVIEW_v3-badge-notificaciones-header.md`
  - `.claude/specs/v3-badge-notificaciones-header.md`
  - `prisma/migrations/20260505120000_add_notificacion_userId_leida_index/migration.sql`
  - `prisma/schema.prisma`
  - `src/__tests__/notificaciones-bell.test.ts`
  - `src/app/(admin)/layout.tsx`
  - `src/app/api/notificaciones/route.ts`
  - `src/compartido/componentes/layout/header.tsx`
  - `src/compartido/componentes/layout/notificaciones-bell.tsx`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `tests/e2e/notificaciones-bell.spec.ts`

- **19:02** `6a0a3a1` — feat: F-07 mensajes individuales a taller/marca desde admin
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-mensajes-individuales.md`
  - `.claude/auditorias/REVIEW_v3-mensajes-individuales.md`
  - `src/__tests__/mensajes-individuales.test.ts`
  - `src/admin/componentes/boton-enviar-mensaje.tsx`
  - `src/admin/componentes/editor-mensaje-individual.tsx`
  - `src/app/(admin)/admin/marcas/[id]/page.tsx`
  - `src/app/(admin)/admin/notificaciones/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(admin)/admin/usuarios/page.tsx`
  - `src/app/(public)/cuenta/notificaciones/notificaciones-lista.tsx`
  - `src/app/(public)/cuenta/notificaciones/page.tsx`
  - `src/app/api/admin/mensajes-individuales/route.ts`
  - `tests/e2e/mensajes-individuales.spec.ts`

- **18:01** `ee7e364` — perf: resolver ESTADO login lento — indice + warm-up + test resiliente
  - `.claude/specs/V4_BACKLOG.md`
  - `.github/workflows/e2e.yml`
  - `prisma/schema.prisma`
  - `tests/e2e/roles-estado.spec.ts`

- **17:06** `b5d3194` — fix: E2E whatsapp tests toleran timeout en preview
  - `tests/e2e/whatsapp-notificaciones.spec.ts`

- **16:45** `10377e7` — fix: magic link /n/ excluido de middleware auth + E2E tests robustos
  - `src/middleware.ts`
  - `tests/e2e/whatsapp-notificaciones.spec.ts`

- **16:28** `8233a7d` — feat: F-02 WhatsApp como canal de notificacion con magic links
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-whatsapp-notificaciones.md`
  - `.claude/auditorias/REVIEW_v3-whatsapp-notificaciones.md`
  - `prisma/schema.prisma`
  - `src/__tests__/nivel.test.ts`
  - `src/__tests__/whatsapp.test.ts`
  - `src/app/(auth)/registro/page.tsx`
  - `src/app/(estado)/estado/talleres/[id]/page.tsx`
  - `src/app/(public)/cuenta/page.tsx`
  - `src/app/api/admin/notificaciones/route.ts`
  - `src/app/api/admin/whatsapp/route.ts`
  - `src/app/api/cuenta/route.ts`
  - `src/app/n/[token]/route.ts`
  - `src/compartido/componentes/cuenta-whatsapp-form.tsx`
  - `src/compartido/componentes/whatsapp-wizard.tsx`
  - `src/compartido/lib/magic-link.ts`
  - `src/compartido/lib/nivel.ts`
  - `src/compartido/lib/notificaciones.ts`
  - `src/compartido/lib/whatsapp-templates.ts`
  - `src/compartido/lib/whatsapp.ts`
  - `tests/e2e/whatsapp-notificaciones.spec.ts`

- **14:39** `686742e` — feat: F-04 exportes del Estado — Excel, ARCA, filtros, informe mensual
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-exportes-estado.md`
  - `.claude/auditorias/REVIEW_v3-exportes-estado.md`
  - `package-lock.json`
  - `package.json`
  - `src/__tests__/exportes.test.ts`
  - `src/app/(estado)/estado/exportar/page.tsx`
  - `src/app/api/estado/exportar/data.ts`
  - `src/app/api/estado/exportar/route.ts`
  - `src/compartido/lib/exportes.ts`
  - `tests/e2e/exportes-estado.spec.ts`

- **13:29** `d9fb390` — qa: marcar items DEV verificados en QA UX-mejoras
  - `.claude/auditorias/QA_v3-ux-mejoras.md`

- **12:59** `8703481` — feat: UX mejoras — Loading, EmptyState, Breadcrumbs, Toast extendido
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-ux-mejoras.md`
  - `.claude/auditorias/REVIEW_v3-ux-mejoras.md`
  - `.claude/specs/V4_BACKLOG.md`
  - `docs/03_tecnico/componentes-ux.md`
  - `src/__tests__/ux-mejoras.test.ts`
  - `src/app/(admin)/admin/auditorias/[id]/page.tsx`
  - `src/app/(admin)/admin/auditorias/page.tsx`
  - `src/app/(admin)/admin/colecciones/[id]/page.tsx`
  - `src/app/(admin)/admin/colecciones/[id]/videos/page.tsx`
  - `src/app/(admin)/admin/colecciones/nueva/page.tsx`
  - `src/app/(admin)/admin/integraciones/email/page.tsx`
  - `src/app/(admin)/admin/integraciones/llm/page.tsx`
  - `src/app/(admin)/admin/marcas/[id]/page.tsx`
  - `src/app/(admin)/admin/notificaciones/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(admin)/admin/talleres/page.tsx`
  - `src/app/(auth)/olvide-contrasena/page.tsx`
  - `src/app/(estado)/estado/demanda-insatisfecha/page.tsx`
  - `src/app/(estado)/estado/talleres/[id]/page.tsx`
  - `src/app/(marca)/marca/directorio/[id]/page.tsx`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(marca)/marca/pedidos/page.tsx`
  - `src/app/(public)/cuenta/notificaciones/notificaciones-lista.tsx`
  - `src/app/(public)/perfil-marca/[id]/page.tsx`
  - `src/app/(taller)/taller/aprender/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
  - `src/app/(taller)/taller/pedidos/page.tsx`
  - `src/app/(taller)/taller/perfil/completar/page.tsx`
  - `src/compartido/componentes/ui/breadcrumbs.tsx`
  - `src/compartido/componentes/ui/empty-state.tsx`
  - `src/compartido/componentes/ui/loading.tsx`
  - `src/compartido/componentes/ui/skeleton.tsx`
  - `src/compartido/componentes/ui/toast.tsx`
  - `src/marca/componentes/aceptar-cotizacion.tsx`
  - `src/marca/componentes/cancelar-pedido.tsx`
  - `src/marca/componentes/contactar-taller.tsx`
  - `src/marca/componentes/publicar-pedido.tsx`
  - `src/marca/componentes/rechazar-cotizacion.tsx`
  - `src/taller/componentes/cotizar-form.tsx`
  - `tests/e2e/ux-mejoras.spec.ts`


## 2026-05-04

### Gerardo Breard
- **19:58** `56c7542` — fix: E2E demanda-insatisfecha tolera ESTADO login timeout
  - `tests/e2e/demanda-insatisfecha.spec.ts`

- **19:34** `bd9d4dc` — feat: F-05 dashboard de demanda insatisfecha
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-demanda-insatisfecha.md`
  - `.claude/auditorias/REVIEW_v3-demanda-insatisfecha.md`
  - `prisma/schema.prisma`
  - `src/__tests__/demanda-insatisfecha.test.ts`
  - `src/__tests__/notificaciones-matching.test.ts`
  - `src/app/(estado)/estado/demanda-insatisfecha/loading.tsx`
  - `src/app/(estado)/estado/demanda-insatisfecha/page.tsx`
  - `src/app/api/estado/demanda-insatisfecha/detalle/route.ts`
  - `src/app/api/estado/demanda-insatisfecha/exportar/route.ts`
  - `src/app/api/estado/demanda-insatisfecha/route.ts`
  - `src/compartido/componentes/layout/header.tsx`
  - `src/compartido/lib/demanda-insatisfecha.ts`
  - `src/compartido/lib/notificaciones.ts`
  - `src/compartido/lib/ratelimit.ts`
  - `tests/e2e/demanda-insatisfecha.spec.ts`

- **18:55** `69b57e5` — docs: T-10 cerrado, T-11 health check de env vars críticas
  - `.claude/specs/V4_BACKLOG.md`

- **18:27** `f2dbaed` — fix: dashboard Puntaje strict mode + 3 fixme con causa real
  - `tests/e2e/acceso-verificado.spec.ts`
  - `tests/e2e/configuracion-niveles.spec.ts`
  - `tests/e2e/registro-marca.spec.ts`
  - `tests/e2e/registro-taller.spec.ts`

- **18:07** `bbfc18b` — chore: trigger redeploy — DATABASE_URL configurado para preview


- **17:41** `b46d922` — revert: connection_limit=1 rompe queries en preview
  - `src/compartido/lib/prisma.ts`

- **16:56** `953398a` — fix: revert functionMaxDuration — no soportado en plan Hobby
  - `vercel.json`

- **16:29** `b7c1636` — fix: cold start — connection_limit=1, loading.tsx per-page, timeouts
  - `.claude/specs/V4_BACKLOG.md`
  - `playwright.config.ts`
  - `src/app/(estado)/estado/talleres/loading.tsx`
  - `src/app/(marca)/marca/directorio/loading.tsx`
  - `src/app/(public)/directorio/loading.tsx`
  - `src/app/(taller)/taller/loading.tsx`
  - `src/compartido/lib/prisma.ts`
  - `tests/e2e/_helpers/auth.ts`
  - `vercel.json`

- **15:52** `6918643` — fix: warm-up de funciones en E2E + reactivar 8 tests fixme
  - `.claude/specs/V4_BACKLOG.md`
  - `.github/workflows/e2e.yml`
  - `tests/e2e/acceso-verificado.spec.ts`
  - `tests/e2e/admin-no-regression.spec.ts`
  - `tests/e2e/configuracion-niveles.spec.ts`
  - `tests/e2e/registro-marca.spec.ts`
  - `tests/e2e/registro-taller.spec.ts`
  - `tests/e2e/roles-estado.spec.ts`

- **14:40** `8650768` — fix: marcar 7 E2E como fixme — streaming SSR no resuelve en preview
  - `tests/e2e/acceso-verificado.spec.ts`
  - `tests/e2e/admin-no-regression.spec.ts`
  - `tests/e2e/configuracion-niveles.spec.ts`
  - `tests/e2e/registro-marca.spec.ts`
  - `tests/e2e/registro-taller.spec.ts`
  - `tests/e2e/roles-estado.spec.ts`

- **14:19** `ad1d473` — fix: ProximoNivelCard guard + E2E timeouts para streaming SSR
  - `.claude/auditorias/REVIEW_v3-proximo-nivel-dashboard.md`
  - `src/__tests__/proximo-nivel-card.test.ts`
  - `src/taller/componentes/proximo-nivel-card.tsx`
  - `tests/e2e/acceso-verificado.spec.ts`
  - `tests/e2e/admin-no-regression.spec.ts`
  - `tests/e2e/configuracion-niveles.spec.ts`
  - `tests/e2e/registro-marca.spec.ts`
  - `tests/e2e/registro-taller.spec.ts`
  - `tests/e2e/roles-estado.spec.ts`

- **13:02** `d2131fb` — fix: E2E solo en push a develop (no main)
  - `.github/workflows/e2e.yml`

- **12:38** `cd5fa66` — fix: E2E timeout 5min→10min + exit 1 on timeout (Opcion C)
  - `.claude/specs/V4_BACKLOG.md`
  - `.github/workflows/e2e.yml`

- **12:03** `4e8d4ee` — fix: ignorar branch gh-pages en builds de Vercel
  - `vercel.json`

- **11:15** `5fd0b47` — feat: F-01 Tu proximo nivel — guia de formalizacion en dashboard taller
  - `.claude/auditorias/QA_v3-proximo-nivel-dashboard.md`
  - `.claude/auditorias/REVIEW_v3-proximo-nivel-dashboard.md`
  - `src/__tests__/proximo-nivel-card.test.ts`
  - `src/app/(taller)/taller/page.tsx`
  - `src/taller/componentes/proximo-nivel-card.tsx`
  - `src/taller/componentes/sincronizar-nivel-action.ts`
  - `src/taller/componentes/sincronizar-nivel.tsx`

- **08:45** `3db4726` — fix: corregir clasificacion DEV/QA en QAs INT-01 e INT-02
  - `.claude/auditorias/QA_v3-arca-completo.md`
  - `.claude/auditorias/QA_v3-email-resend.md`

- **08:36** `f6966ab` — fix: nodemailer@7 para compatibilidad con next-auth peer dep
  - `package-lock.json`
  - `package.json`

- **08:34** `b849db6` — fix: reinstalar nodemailer — peer dependency de NextAuth EmailProvider
  - `package-lock.json`
  - `package.json`

- **08:29** `e1a96c1` — fix: reorganizar index QA — specs nuevos dentro de bloques tematicos
  - `tools/generate-qa.js`

- **07:47** `52a15c0` — feat: INT-02 — migrar email de SendGrid a Resend + cerrar [contacto-pdt]
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-email-resend.md`
  - `.claude/auditorias/REVIEW_v3-email-resend.md`
  - `.env.example`
  - `package-lock.json`
  - `package.json`
  - `src/__tests__/arca.test.ts`
  - `src/__tests__/email-resend.test.ts`
  - `src/compartido/lib/arca.ts`
  - `src/compartido/lib/auth.ts`
  - `src/compartido/lib/email.ts`


## 2026-05-03

### Gerardo Breard
- **00:53** `acc0db1` — chore: eliminar endpoint debug-arca temporal
  - `src/app/api/debug-arca/route.ts`

- **00:51** `d901d4d` — fix: clasificarError detecta CUIT inexistente de excepcion SOAP A13
  - `src/compartido/lib/arca.ts`

- **00:47** `1de3af4` — fix: adaptar mapearRespuesta a estructura real de A13
  - `src/__tests__/arca.test.ts`
  - `src/compartido/lib/arca.ts`
  - `tests/fixtures/arca-responses/padron-a13-activo.json`
  - `tests/fixtures/arca-responses/padron-a13-baja.json`
  - `tests/fixtures/arca-responses/padron-a13-inactivo.json`
  - `tests/fixtures/arca-responses/padron-a13-monotributo.json`
  - `tests/fixtures/arca-responses/padron-a13-sin-actividad.json`

- **00:41** `81702bf` — temp: debug endpoint con consulta ARCA raw
  - `src/app/api/debug-arca/route.ts`

- **00:37** `933e813` — chore: redeploy con AFIP_SDK_ENV sin newline


- **00:34** `636881e` — fix: trim AFIP_SDK_ENV para manejar newline de Vercel CLI
  - `src/compartido/lib/arca.ts`

- **00:30** `8a5d1f0` — chore: redeploy con AFIP_SDK_ENV limpio via CLI


- **00:27** `d1d7612` — chore: redeploy develop con AFIP_SDK_ENV=production corregido


- **00:01** `b408f1d` — chore: trigger redeploy with AFIP_SDK_ENV=production



## 2026-05-02

### Gerardo Breard
- **23:40** `b3f929a` — temp: debug endpoint para verificar env vars ARCA en Vercel
  - `src/app/api/debug-arca/route.ts`

- **23:24** `88d2cca` — fix: cambiar de A10 a A13, agregar soporte cert/key para AFIP
  - `.env.example`
  - `src/__tests__/arca.test.ts`
  - `src/compartido/lib/arca.ts`
  - `tests/fixtures/arca-responses/padron-a10-activo.json`
  - `tests/fixtures/arca-responses/padron-a10-baja.json`
  - `tests/fixtures/arca-responses/padron-a10-inactivo.json`
  - `tests/fixtures/arca-responses/padron-a10-monotributo.json`
  - `tests/fixtures/arca-responses/padron-a10-sin-actividad.json`
  - `tests/fixtures/arca-responses/padron-a13-activo.json`
  - `tests/fixtures/arca-responses/padron-a13-baja.json`
  - `tests/fixtures/arca-responses/padron-a13-inactivo.json`
  - `tests/fixtures/arca-responses/padron-a13-monotributo.json`
  - `tests/fixtures/arca-responses/padron-a13-sin-actividad.json`

- **22:15** `612f4d2` — fix: timeout de 10s en consultarPadron para no bloquear registro
  - `src/compartido/lib/arca.ts`

- **22:02** `015b742` — feat: INT-01 — integracion completa con ARCA/AFIP
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-arca-completo.md`
  - `.claude/auditorias/REVIEW_v3-arca-completo.md`
  - `.claude/specs/V4_BACKLOG.md`
  - `.env.example`
  - `prisma/schema.prisma`
  - `src/__tests__/arca.test.ts`
  - `src/app/(estado)/estado/talleres/[id]/page.tsx`
  - `src/app/(estado)/estado/talleres/[id]/reverificar-button.tsx`
  - `src/app/(estado)/estado/talleres/page.tsx`
  - `src/app/(estado)/estado/talleres/sync-arca-button.tsx`
  - `src/app/(marca)/marca/directorio/page.tsx`
  - `src/app/(public)/directorio/page.tsx`
  - `src/app/(public)/perfil/[id]/page.tsx`
  - `src/app/api/auth/registro/route.ts`
  - `src/app/api/auth/verificar-cuit/route.ts`
  - `src/app/api/estado/arca/reverificar/[id]/route.ts`
  - `src/app/api/estado/arca/route.ts`
  - `src/compartido/componentes/badge-arca.tsx`
  - `src/compartido/lib/arca.ts`
  - `tests/fixtures/arca-responses/padron-a10-activo.json`
  - `tests/fixtures/arca-responses/padron-a10-baja.json`
  - `tests/fixtures/arca-responses/padron-a10-inactivo.json`
  - `tests/fixtures/arca-responses/padron-a10-monotributo.json`
  - `tests/fixtures/arca-responses/padron-a10-sin-actividad.json`
  - `tools/sincronizar-arca.ts`


## 2026-04-30

### Gerardo Breard
- **11:52** `dbdf7e1` — docs: mark 6 DEV items as verified in QA acceso-pre-formalizacion
  - `.claude/auditorias/QA_v3-acceso-pre-formalizacion.md`


## 2026-04-29

### Gerardo Breard
- **21:49** `6e50273` — fix: mark ESTADO E2E test as fixme — CI login flakiness
  - `tests/e2e/acceso-verificado.spec.ts`

- **21:24** `4bf8268` — fix: increase ESTADO E2E test timeout to 60s for CI flakiness
  - `tests/e2e/acceso-verificado.spec.ts`

- **21:06** `ac3b49a` — fix: E2E selectors — use getByRole heading for strict mode
  - `tests/e2e/acceso-verificado.spec.ts`

- **20:23** `da33f6d` — feat: acceso pre-formalizacion y niveles privados
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-acceso-pre-formalizacion.md`
  - `.claude/auditorias/REVIEW_v3-acceso-pre-formalizacion.md`
  - `.claude/specs/V4_BACKLOG.md`
  - `src/__tests__/acceso-verificado.test.ts`
  - `src/app/(estado)/estado/talleres/page.tsx`
  - `src/app/(marca)/marca/directorio/[id]/page.tsx`
  - `src/app/(marca)/marca/directorio/page.tsx`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(public)/directorio/page.tsx`
  - `src/app/(public)/perfil/[id]/page.tsx`
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`
  - `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
  - `src/app/api/cotizaciones/route.ts`
  - `src/app/api/ordenes/[id]/pdf/route.tsx`
  - `src/app/api/pedidos/[id]/invitaciones/route.ts`
  - `src/app/api/talleres/route.ts`
  - `src/compartido/componentes/pdf/orden-pdf.tsx`
  - `src/marca/componentes/contactar-taller.tsx`
  - `src/marca/componentes/invitar-a-cotizar.tsx`
  - `tests/e2e/acceso-verificado.spec.ts`

- **17:31** `be284c8` — feat: v3-errores-consistentes-apis (Q-03) — formato de error estructurado en APIs
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-errores-consistentes-apis.md`
  - `.claude/auditorias/REVIEW_v3-errores-consistentes-apis.md`
  - `.claude/specs/V4_BACKLOG.md`
  - `src/__tests__/api-client.test.ts`
  - `src/__tests__/api-errors.test.ts`
  - `src/__tests__/revocar-validacion.test.ts`
  - `src/app/(auth)/registro/page.tsx`
  - `src/app/(marca)/marca/pedidos/nuevo/nuevo-pedido-form.tsx`
  - `src/app/api/README.md`
  - `src/app/api/auth/registro/route.ts`
  - `src/app/api/chat/route.ts`
  - `src/app/api/cotizaciones/[id]/route.ts`
  - `src/app/api/cotizaciones/route.ts`
  - `src/app/api/feedback/route.ts`
  - `src/app/api/pedidos/[id]/ordenes/route.ts`
  - `src/app/api/pedidos/[id]/route.ts`
  - `src/app/api/pedidos/route.ts`
  - `src/app/api/talleres/me/route.ts`
  - `src/app/api/validaciones/[id]/route.ts`
  - `src/app/api/validaciones/[id]/upload/route.ts`
  - `src/compartido/lib/api-client.ts`
  - `src/compartido/lib/api-errors.ts`
  - `src/compartido/lib/upload-imagen.ts`
  - `src/marca/componentes/aceptar-cotizacion.tsx`
  - `src/marca/componentes/cancelar-pedido.tsx`
  - `src/marca/componentes/publicar-pedido.tsx`
  - `src/marca/componentes/rechazar-cotizacion.tsx`
  - `src/taller/componentes/asistente-chat.tsx`
  - `src/taller/componentes/cotizar-form.tsx`
  - `src/taller/componentes/orden-actions.tsx`

- **16:36** `c1e477d` — docs: agregar Bloque H (mercado y transparencia) y Bloque I (servicios y catálogo) al V4_BACKLOG
  - `.claude/specs/V4_BACKLOG.md`

- **16:17** `a578479` — fix: E2E 404 global necesita login — middleware redirige a /login sin sesion
  - `tests/e2e/error-boundaries.spec.ts`

- **15:38** `1b65a1b` — feat: v3-error-boundaries (Q-02) — error boundaries y 404 en todos los layouts
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-error-boundaries.md`
  - `.claude/auditorias/REVIEW_v3-error-boundaries.md`
  - `package-lock.json`
  - `package.json`
  - `src/__tests__/error-logger.test.ts`
  - `src/__tests__/log-error-route.test.ts`
  - `src/app/(admin)/error.tsx`
  - `src/app/(admin)/not-found.tsx`
  - `src/app/(auth)/error.tsx`
  - `src/app/(auth)/not-found.tsx`
  - `src/app/(contenido)/error.tsx`
  - `src/app/(contenido)/not-found.tsx`
  - `src/app/(estado)/error.tsx`
  - `src/app/(estado)/not-found.tsx`
  - `src/app/(marca)/error.tsx`
  - `src/app/(marca)/not-found.tsx`
  - `src/app/(public)/error.tsx`
  - `src/app/(public)/not-found.tsx`
  - `src/app/(taller)/error.tsx`
  - `src/app/(taller)/not-found.tsx`
  - `src/app/api/log-error/route.ts`
  - `src/app/error.tsx`
  - `src/app/global-error.tsx`
  - `src/app/not-found.tsx`
  - `src/compartido/componentes/error-page.tsx`
  - `src/compartido/componentes/feedback-widget.tsx`
  - `src/compartido/componentes/not-found-page.tsx`
  - `src/compartido/lib/error-logger.ts`
  - `tests/e2e/error-boundaries.spec.ts`

- **14:20** `6bf18d7` — fix: agregar link "Volver al indice" en todos los QA HTML
  - `tools/generate-qa.js`

- **13:56** `3fb71bd` — fix: reescribir QA Q-01 para audiencia QA + corregir tests flaky en CI
  - `.claude/auditorias/QA_v3-tests-e2e.md`
  - `tests/e2e/flujo-comercial.spec.ts`
  - `tests/e2e/registro-taller.spec.ts`

- **13:09** `d43e0fd` — docs: agregar verificacion_dev al QA Q-01
  - `.claude/auditorias/QA_v3-tests-e2e.md`

- **01:09** `5a2929e` — docs: agregar G-01 al V4 backlog (filtro pendientes dashboard ESTADO)
  - `.claude/specs/V4_BACKLOG.md`

- **00:51** `3122d44` — feat: Q-01 tests E2E flujos criticos del piloto
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-tests-e2e.md`
  - `.claude/auditorias/REVIEW_v3-tests-e2e.md`
  - `src/app/(marca)/marca/pedidos/[id]/page.tsx`
  - `src/app/(marca)/marca/pedidos/nuevo/nuevo-pedido-form.tsx`
  - `src/marca/componentes/aceptar-cotizacion.tsx`
  - `src/marca/componentes/publicar-pedido.tsx`
  - `src/taller/componentes/cotizar-form.tsx`
  - `src/taller/componentes/orden-actions.tsx`
  - `tests/e2e/aprobacion-documento.spec.ts`
  - `tests/e2e/auth-roles.spec.ts`
  - `tests/e2e/configuracion-niveles.spec.ts`
  - `tests/e2e/flujo-comercial.spec.ts`
  - `tests/e2e/registro-marca.spec.ts`
  - `tests/e2e/registro-taller.spec.ts`
  - `tests/e2e/roles-estado.spec.ts`


## 2026-04-28

### Gerardo Breard
- **23:32** `294059c` — fix: renderEje6 soporta checkboxes como fallback (D-01 Eje 6)
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`

- **23:19** `b3bdb28` — fix: renderer QA soporta checkboxes como fallback cuando no hay tabla
  - `.claude/auditorias/QA_v3-tipos-documento-db.md`
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`

- **22:53** `d6a1ca1` — fix: generador QA parsea YAML frontmatter, checkboxes, y resultados ✅
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`

- **22:30** `5e73538` — docs: marcar verificacion DEV completada en 7 QAs V3
  - `.claude/auditorias/QA_v3-cookies-seguridad.md`
  - `.claude/auditorias/QA_v3-logs-admin-auditoria.md`
  - `.claude/auditorias/QA_v3-rate-limiting.md`
  - `.claude/auditorias/QA_v3-redefinicion-roles-estado.md`
  - `.claude/auditorias/QA_v3-separar-ambientes.md`
  - `.claude/auditorias/QA_v3-tipos-documento-db.md`
  - `.claude/auditorias/QA_v3-validacion-archivos.md`

- **19:15** `87a3644` — feat: D-02 tipos documento DB y reglas de nivel configurables
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-tipos-documento-db.md`
  - `.claude/auditorias/REVIEW_v3-tipos-documento-db.md`
  - `prisma/migrations/20260428200000_tipos_documento_y_reglas_nivel/migration.sql`
  - `prisma/migrations/20260428200001_seed_reglas_nivel/migration.sql`
  - `prisma/schema.prisma`
  - `prisma/seed.ts`
  - `scripts/verificar-migracion-d02.sql`
  - `src/__tests__/configuracion-niveles-api.test.ts`
  - `src/__tests__/nivel.test.ts`
  - `src/app/(estado)/estado/configuracion-niveles/page.tsx`
  - `src/app/(estado)/estado/documentos/page.tsx`
  - `src/app/(taller)/taller/page.tsx`
  - `src/app/api/estado/configuracion-niveles/[id]/route.ts`
  - `src/app/api/estado/configuracion-niveles/preview/route.ts`
  - `src/app/api/estado/configuracion-niveles/route.ts`
  - `src/app/api/tipos-documento/route.ts`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `src/compartido/lib/nivel.ts`
  - `tests/e2e/configuracion-niveles.spec.ts`
  - `tools/recalcular-niveles.ts`

- **16:43** `0e12152` — fix: dashboard ESTADO apuntaba a /admin/ en links de validaciones
  - `src/app/(estado)/estado/page.tsx`
  - `tests/e2e/roles-estado.spec.ts`

- **15:53** `6709a8e` — fix: ESTADO E2E tests skip gracefully si login falla en preview
  - `tests/e2e/roles-estado.spec.ts`

- **15:43** `3ae8be7` — fix: loginAs waitUntil commit para evitar cold-start timeout en Vercel
  - `tests/e2e/_helpers/auth.ts`

- **15:10** `fb25353` — fix: layout estado bloqueaba ADMIN, locators E2E con h1 duplicado
  - `src/app/(estado)/layout.tsx`
  - `tests/e2e/_helpers/auth.ts`
  - `tests/e2e/admin-no-regression.spec.ts`
  - `tests/e2e/roles-estado.spec.ts`

- **14:19** `437690d` — feat: D-01 redefinicion de roles — ESTADO valida documentos
  - `.claude/auditorias/PRUEBAS_PENDIENTES.md`
  - `.claude/auditorias/QA_v3-redefinicion-roles-estado.md`
  - `.claude/auditorias/REVIEW_v3-redefinicion-roles-estado.md`
  - `prisma/migrations/20260428100000_agregar_aprobado_por_validacion/migration.sql`
  - `prisma/migrations/20260428100001_backfill_aprobado_por_validacion/migration.sql`
  - `prisma/schema.prisma`
  - `prisma/seed.ts`
  - `scripts/verificar-migracion-d01.sql`
  - `src/__tests__/permisos.test.ts`
  - `src/__tests__/revocar-validacion.test.ts`
  - `src/__tests__/tipos-documento-permisos.test.ts`
  - `src/app/(admin)/admin/documentos/page.tsx`
  - `src/app/(admin)/admin/logs/page.tsx`
  - `src/app/(admin)/admin/talleres/[id]/page.tsx`
  - `src/app/(estado)/estado/auditorias/page.tsx`
  - `src/app/(estado)/estado/documentos/page.tsx`
  - `src/app/(estado)/estado/talleres/[id]/page.tsx`
  - `src/app/(estado)/estado/talleres/page.tsx`
  - `src/app/api/tipos-documento/route.ts`
  - `src/app/api/validaciones/[id]/route.ts`
  - `src/compartido/componentes/layout/user-sidebar.tsx`
  - `src/compartido/lib/permisos.ts`
  - `src/middleware.ts`
  - `tests/e2e/admin-no-regression.spec.ts`
  - `tests/e2e/roles-estado.spec.ts`

- **12:05** `a81cc10` — fix: resolver 9 issues de Sergio en QA de S-04 logs
  - `.claude/auditorias/QA_v3-logs-admin-auditoria.md`
  - `src/app/(admin)/admin/colecciones/[id]/page.tsx`
  - `src/app/(admin)/admin/logs/page.tsx`
  - `src/app/(admin)/admin/usuarios/page.tsx`
  - `src/app/(auth)/acceso-rapido/page.tsx`
  - `src/app/api/admin/logs/route.ts`

- **11:35** `99ce3a7` — fix: rate limit E2E test envia body invalido para no crear issues reales
  - `tests/e2e/ratelimit.spec.ts`

- **10:25** `89e8a3b` — feat: agrupar QAs V3 por bloque en index de auditorias
  - `tools/generate-qa.js`
  - `tools/generate-qa.test.js`


## 2026-04-27

### Gerardo Breard
- **21:16** `f60a00b` — fix: E2E resilience — skip graceful si storage/Redis no disponible
  - `tests/e2e/file-validation.spec.ts`
  - `tests/e2e/ratelimit.spec.ts`

- **21:10** `711b810` — fix: seed ConfiguracionUpload via migracion + ajustar E2E
  - `prisma/migrations/20260428000000_seed_configuracion_upload/migration.sql`
  - `tests/e2e/file-validation.spec.ts`

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

