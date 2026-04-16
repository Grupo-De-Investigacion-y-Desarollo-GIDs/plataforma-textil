# Daily Log

## 2026-04-16

### Gerardo Breard
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

