# Daily Log

## 2026-04-05

### Gerardo Breard
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

