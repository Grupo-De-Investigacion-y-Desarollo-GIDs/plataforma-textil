# Daily Log

## 2026-04-05

### Gerardo Breard
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

