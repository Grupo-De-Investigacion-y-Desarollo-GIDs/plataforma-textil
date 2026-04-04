# Planificación del mes de desarrollo

Fecha: 2026-04-04
Base: arquitectura-e1.md (inventario de tareas A-I)
Duración: 4 semanas, 5 días hábiles cada una (20 días)
Equipo: Gerardo (backend, infra, integraciones, E2) + Sergio (frontend, UI, stubs, apoyo)
Regla: semana 4 es solo pruebas y fixes — no se arranca nada nuevo
Requisito: E1 + E2 completos. Es compromiso contractual con la OIT.

---

## Semana 1 — Columna vertebral: registro, auth, infra CONTENIDO, schemas E2

### Objetivo
Cerrar los gaps de REGISTRAR que bloquean todo. Establecer infra del rol CONTENIDO. Crear los modelos de datos del E2 (publicación, cotizaciones) para desbloquear semana 2. Marcar stubs como "En construcción".

### Gerardo
- **A1** — Integrar AfipSDK en registro: CUIT → consulta API → autocomplete → BRONCE automático (Alta)
- **A3** — Agregar Google OAuth como método de autenticación (Media)
- **A4** — Agregar magic link como método de autenticación (Media)
- **A7** — Conectar olvide contraseña end-to-end: API + email con token (Media)
- **A8** — Verificar flujo restablecer contraseña post-migración (Baja)
- **F1** — Agregar CONTENIDO al enum UserRole en Prisma + migración (Baja)
- **F2** — Actualizar middleware con rol CONTENIDO y rutas `/contenido/*` (Baja)
- **F3** — Actualizar endpoints colecciones/videos/evaluaciones para aceptar rol CONTENIDO (Baja)
- **I1** — Agregar estado PUBLICADO al enum EstadoPedido en Prisma + migración (Baja)
- **I6** — Modelo Cotizacion en Prisma + migración (Baja)
- **I14** — Decidir stack RAG: Claude API + Supabase pgvector (Baja)

### Sergio
- **A2** — Rediseñar registro a 3 pasos: auth method → CUIT → nombre (Alta) — depende de A1
- **A5** — Landing con dos entradas "Soy taller" / "Soy marca" (Baja)
- **A6** — Validar CUIT único + mensaje claro si ya existe (Baja) — depende de A1
- **A9** — Alinear password mínimo a 8 en frontend de registro (Baja)
- **A10** — Agregar checkbox términos y condiciones en registro (Baja)
- **G6** — Marcar stubs no prioritarios con badge "En construcción" (Baja)
- **F4** — Crear layout `/contenido` con sidebar y navegación propia (Media) — depende de F2

### Criterio de avance
- Un usuario nuevo puede registrarse con Google, email o magic link
- El CUIT se verifica contra ARCA y autocompleta datos
- Olvide contraseña funciona end-to-end
- Rol CONTENIDO existe en BD, middleware y tiene layout propio
- Modelos Cotizacion y estado PUBLICADO existen en BD (schema listo para semana 2)
- Stack RAG decidido y documentado
- Stubs marcados como "En construcción"

---

## Semana 2 — E1 core + inicio E2: gamificación, Estado, publicación, cotizaciones

### Objetivo
Implementar narrativa de formalización. Reconstruir dashboard Estado. Abrir el flujo E2: publicación de pedidos, API de cotizaciones y matching. Avanzar páginas CONTENIDO y RAG pipeline.

### Gerardo
- **D6** — Notificación al admin cuando un taller sube un documento (Baja)
- **E2** — Dashboard Estado "¿Dónde hay que actuar?": denuncias sin resolver, talleres inactivos 30d (Media)
- **E3** — Dashboard Estado "¿Qué está funcionando?": certificados este mes, subidas de nivel (Media)
- **E4** — Guard de rol ESTADO en `/estado/*` (Baja)
- **H1** — WhatsApp como canal de notificaciones: definir eventos que disparan wa.me links (Media)
- **H2** — Email templates reutilizables: bienvenida, docs, certificado, asignación, cotización (Media)
- **I4** — Algoritmo de matching: dado un pedido, encontrar talleres compatibles por proceso/prenda/nivel/capacidad (Alta)
- **I7** — API CRUD de cotizaciones (Media) — depende de I6
- **I10** — Vencimiento automático de cotizaciones no respondidas (Media) — depende de I6
- **I15** — Pipeline de indexación RAG: transcripts YouTube → chunking → embeddings → pgvector (Alta) — depende de I14

### Sergio
- **D1** — Renombrar pasos formalización a lenguaje del taller (Baja)
- **D2** — Asistente contextual en cada paso: para qué sirve, cómo obtenerlo, links y costos (Media)
- **D3** — Barra de progreso con próximo beneficio visible en dashboard taller (Media)
- **D4** — Notificación de logro al subir de nivel (celebración visual) (Baja)
- **E1** — Reconstruir `/estado` según spec 0.10: sección "¿Cómo está el sector?" (Media)
- **I2** — Flujo publicación de pedido: marca publica BORRADOR → PUBLICADO (Media) — depende de I1
- **F5** — Crear `/contenido/colecciones` (copiar de admin, adaptar permisos) (Baja) — depende de F4
- **F6** — Crear `/contenido/colecciones/[id]` y videos (Baja) — depende de F5
- **F7** — Crear `/contenido/evaluaciones` (Baja) — depende de F5
- **B8** — Ordenar directorio por nivel (ORO primero) (Baja)

### Criterio de avance
- Dashboard taller muestra barra de progreso con próximo beneficio
- Formalización tiene nombres amigables y asistente contextual
- Dashboard Estado tiene las 3 secciones con datos reales
- Marca puede publicar pedido (BORRADOR → PUBLICADO)
- API de cotizaciones funcional (CRUD + vencimiento)
- Algoritmo de matching implementado y testeado
- Pipeline RAG indexando transcripts en pgvector
- Rol CONTENIDO tiene colecciones y evaluaciones funcionando
- Templates de email y definición de canal WhatsApp listas

---

## Semana 3 — Cerrar E1 + completar E2: vistas, acuerdos, RAG, denuncias, exportes

### Objetivo
Completar todas las vistas del E2 (marketplace taller, cotizaciones marca, acuerdos). Cerrar flujos E1 pendientes (denuncias, notificaciones, PDF/QR, stubs admin). Entregar RAG funcional.

### Gerardo
- **B6** — Notificación al taller cuando le asignan una orden (email + WA) (Media)
- **B7** — Notificación a la marca cuando el taller acepta/rechaza/completa (Media)
- **I5** — Notificaciones a talleres compatibles al publicar pedido (email + WA) (Media) — depende de I4, H1
- **C1** — Generar PDF de certificado con @react-pdf/renderer (Media)
- **C2** — Generar imagen QR con librería qrcode (Baja)
- **E8** — Exportar reportes reales con Puppeteer (PDF/Excel) (Alta)
- **I11** — Registro de acuerdo: evolución de OrdenManufactura con aceptación mutua y términos (Alta) — depende de I9
- **I12** — PDF del acuerdo generado con @react-pdf/renderer (Media) — depende de I11
- **I13** — Activar EscrowHito: hitos de pago vinculados al acuerdo (Alta) — depende de I11
- **I16** — API de chat RAG: pregunta → contexto → respuesta con Claude (Alta) — depende de I15
- **I18** — Backend configuración asistente RAG en admin/integraciones/llm (Media) — depende de I14

### Sergio
- **I3** — Vista marketplace de pedidos publicados para talleres (Alta) — depende de I2
- **I8** — Vista taller: pedidos disponibles → cotizar → formulario precio/plazo/mensaje (Alta) — depende de I3, I6
- **I9** — Vista marca: cotizaciones recibidas → comparar → aceptar → crea OrdenManufactura (Alta) — depende de I7
- **I17** — UI de chat RAG embebida en `/taller/aprender` y global (Media) — depende de I16
- **B1** — Botón "Contactar" WhatsApp con contexto pre-cargado (Baja)
- **B2** — Modal perfil mínimo marca al primer contacto (Media)
- **B3** — Directorio público: filtros, búsqueda y paginación (Media)
- **B4** — Perfil público taller: certificados + botón contactar (Baja) — depende de B1
- **B5** — Construir perfil público marca con datos reales (Media)
- **C3** — Botón "Descargar PDF" en admin/certificados conectado (Baja) — depende de C1
- **C4** — Botón "Revocar" en admin/certificados conectado a API (Baja)
- **E5** — UI pública de denuncia (formulario → POST /api/denuncias) (Media)
- **E6** — UI consulta estado denuncia por código (Baja)
- **E7** — Conectar `/admin/auditorias` a datos reales (Alta)
- **G1** — Conectar `/admin/procesos` a API real (Media)
- **G2** — Conectar `/admin/documentos` (tipos) a API real (Media)

### Criterio de avance
- Taller ve pedidos publicados y puede cotizar
- Marca ve cotizaciones, compara y acepta (crea OrdenManufactura)
- Acuerdos con aceptación mutua y PDF generado
- EscrowHito vinculado a acuerdos
- Notificaciones funcionan en todos los flujos (pedidos, cotizaciones, asignación)
- Certificados generan PDF + QR
- Estado puede exportar reportes reales
- Denuncia pública funciona end-to-end
- Chat RAG funcional en academia
- Auditorías y stubs admin conectados a datos reales

---

## Semana 4 — Pruebas, fixes y preparación piloto

### Objetivo
Cero funcionalidades nuevas. Solo testing, corrección de bugs, datos de demo y preparación para el piloto. Cerrar documentación handover.

### Gerardo
- **H3** — Tests de integración para flujos críticos: registro, login, pedidos, cotizaciones, nivel (Alta)
- **H4** — Tests de integración para seguridad API (Media) — depende de H3
- **H5** — Migración incremental de gaps del schema Prisma — los más críticos (Alta — parcial)
- Corregir bugs encontrados en testing
- Revisar seguridad: segunda pasada de endpoints nuevos (cotizaciones, acuerdos, RAG, notas)
- Verificar deploy en Vercel: todas las env vars, build OK, rutas funcionan
- Documentar en `.claude/specs/handover/` las decisiones de infraestructura

### Sergio
- **G3** — Conectar `/admin/configuracion` read path (Baja)
- **G4** — Conectar botones editar/suspender/resetear en `/admin/usuarios` (Media)
- **H7** — Responsive/mobile-first para registro, formalización y academia (Media)
- **H8** — Seed de datos realistas actualizado para demo del piloto (Baja)
- **F11** — Opción crear usuario CONTENIDO desde admin (Baja)
- Corregir bugs de UI encontrados en testing
- Testing manual de todos los flujos por rol (TALLER, MARCA, ESTADO, CONTENIDO, ADMIN)
- Testing de flujo E2 completo: publicar → cotizar → aceptar → acuerdo → escrow

### Criterio de avance
- Todos los flujos E1 y E2 testeados manualmente por rol
- Tests de integración pasan para flujos críticos
- Build pasa sin errores
- Seed genera datos realistas incluyendo cotizaciones y acuerdos
- Deploy en Vercel funcional con datos de prueba
- Documentación handover actualizada
- Cero stubs que aparenten ser funcionales sin serlo

---

## Resumen de carga

| Semana | Gerardo | Sergio | Total |
|---|---|---|---|
| 1 | 11 tareas (1 Alta, 3 Media, 7 Baja) | 7 tareas (1 Alta, 1 Media, 5 Baja) | 18 |
| 2 | 10 tareas (2 Alta, 5 Media, 3 Baja) | 10 tareas (0 Alta, 3 Media, 7 Baja) | 20 |
| 3 | 11 tareas (4 Alta, 5 Media, 2 Baja) | 16 tareas (3 Alta, 5 Media, 8 Baja) | 27 |
| 4 | 3 tareas + fixes + seguridad + handover | 5 tareas + testing + bugs | 8 + fixes |
| **Total** | **35 + fixes** | **38 + testing** | **73** |

---

## Tareas sacrificables si hay atraso

### E1 — Se pueden postergar sin romper el piloto

1. **A11** — Ubicación INDEC → simplificar a texto libre por ahora
2. **D5** — Comparación social "X talleres de tu zona" → nice-to-have
3. **D7** — Auto-save wizard → funciona sin auto-save, solo UX
4. **H6** — Migrar middleware.ts a proxy.ts → post-piloto
5. **G5** — Reportes admin → dashboard Estado cubre lo urgente
6. **F8** — Notificaciones masivas contenido → se posterga
7. **F9** — Textos institucionales contenido → se posterga
8. **F10** — Dashboard de impacto contenido → CONTENIDO funciona sin métricas

### Plan de contingencia por semana

**Si semana 1 se atrasa:**
- A3 (Google OAuth) y A4 (magic link) se mueven a semana 2 — registro funciona con email+contraseña
- I14 (decidir RAG) se mueve a inicio semana 2

**Si semana 2 se atrasa:**
- F5/F6/F7 (páginas contenido) → CONTENIDO usa `/admin/*` mientras tanto
- I10 (vencimiento cotizaciones) se mueve a semana 3
- D3 (barra progreso) se simplifica a texto estático con %

**Si semana 3 se atrasa — priorizar esto, sacrificar el resto:**
- **No negociable E2:** I3 + I8 + I9 (vistas marketplace y cotizaciones) — son el core del E2
- **No negociable E2:** I11 (acuerdos) — requerimiento contractual
- **Sacrificable E2:** I13 (EscrowHito) → se documenta como "fase siguiente" — el modelo existe pero la UI se posterga
- **Sacrificable E2:** I12 (PDF acuerdo) → acuerdo se ve en pantalla sin PDF descargable
- **Sacrificable E1:** E8 (exportes Puppeteer) → Estado ve KPIs en dashboard sin exportar
- **Sacrificable E1:** B5 (perfil público marca) → no crítico para piloto
- **Sacrificable E1:** E7 (auditorías real) → queda stub con badge "En construcción"

### RAG — plan B si no llega:
Si I15/I16 no se completan, el chat RAG se reemplaza por un chatbot simple con respuestas pre-armadas (FAQ) + link a los videos relevantes. I17 (UI) se adapta a FAQ en vez de RAG. Esto cumple el entregable sin la complejidad del pipeline.
