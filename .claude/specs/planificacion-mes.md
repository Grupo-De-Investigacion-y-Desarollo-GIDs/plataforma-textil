# Planificación del mes de desarrollo

Fecha: 2026-04-04
Base: arquitectura-e1.md (inventario de tareas A-I)
Duración: 4 semanas, 5 días hábiles cada una (20 días)
Equipo: Gerardo (backend, infra, integraciones) + Sergio (frontend, UI, stubs)
Regla: semana 4 es solo pruebas y fixes — no se arranca nada nuevo

---

## Semana 1 — Fundaciones: registro, auth y rol CONTENIDO

### Objetivo
Cerrar los gaps de REGISTRAR que bloquean todo lo demás. Establecer la infraestructura del nuevo rol CONTENIDO. Marcar stubs como "En construcción" para no confundir en el piloto.

### Gerardo
- **A1** — Integrar AfipSDK en registro: CUIT → consulta API → autocomplete → BRONCE automático (Alta)
- **A3** — Agregar Google OAuth como método de autenticación (Media)
- **A4** — Agregar magic link como método de autenticación (Media)
- **A7** — Conectar olvide contraseña end-to-end: API + email con token (Media)
- **A8** — Verificar flujo restablecer contraseña post-migración (Baja)
- **F1** — Agregar CONTENIDO al enum UserRole en Prisma + migración (Baja)
- **F2** — Actualizar middleware con rol CONTENIDO y rutas `/contenido/*` (Baja)
- **F3** — Actualizar endpoints colecciones/videos/evaluaciones para aceptar rol CONTENIDO (Baja)

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
- Olvide contraseña funciona end-to-end (email → token → reset)
- El rol CONTENIDO existe en BD, middleware y tiene layout propio
- Stubs marcados como "En construcción"

---

## Semana 2 — Narrativa: gamificación, formalización y dashboard Estado

### Objetivo
Implementar la narrativa "formalización = mejores clientes" en la UI del taller. Reconstruir el dashboard Estado con los KPIs del piloto. Conectar stubs admin prioritarios.

### Gerardo
- **A11** — Ubicación estandarizada: código postal o coordenadas INDEC (Media)
- **D5** — Comparación social: "X talleres de tu zona están en nivel PLATA" (Baja) — query por zona
- **D6** — Notificación al admin cuando un taller sube un documento (Baja)
- **E2** — Dashboard Estado sección "¿Dónde hay que actuar?": denuncias sin resolver, talleres sin actividad 30d (Media) — queries nuevas
- **E3** — Dashboard Estado sección "¿Qué está funcionando?": certificados este mes, subidas de nivel (Media) — queries nuevas
- **E4** — Guard de rol ESTADO en `/estado/*` (Baja)
- **H1** — WhatsApp como canal de notificaciones: definir qué eventos disparan wa.me links (Media)
- **H2** — Email templates reutilizables: bienvenida, doc aprobado/rechazado, certificado, asignación (Media)

### Sergio
- **D1** — Renombrar pasos formalización a lenguaje del taller (Baja)
- **D2** — Asistente contextual en cada paso: para qué sirve, cómo obtenerlo, links y costos (Media)
- **D3** — Barra de progreso con próximo beneficio visible en dashboard taller (Media)
- **D4** — Notificación de logro al subir de nivel (celebración visual) (Baja)
- **D7** — Auto-save entre pasos del wizard perfil productivo (Media)
- **E1** — Reconstruir `/estado` según spec 0.10: sección "¿Cómo está el sector?" (Media)
- **F5** — Crear `/contenido/colecciones` (copiar de admin, adaptar permisos) (Baja) — depende de F4
- **F6** — Crear `/contenido/colecciones/[id]` y videos (Baja) — depende de F5
- **F7** — Crear `/contenido/evaluaciones` (Baja) — depende de F5

### Criterio de avance
- Dashboard taller muestra barra de progreso con próximo beneficio y comparación social
- Formalización tiene nombres amigables y asistente contextual en cada paso
- Dashboard Estado tiene las 3 secciones con datos reales
- Rol CONTENIDO tiene sus páginas de colecciones y evaluaciones funcionando
- WhatsApp definido como canal y templates de email creadas

---

## Semana 3 — Completar: ENCONTRAR, FISCALIZAR, APRENDER y admin

### Objetivo
Cerrar los flujos que faltan para el piloto. Conectar stubs admin. Implementar denuncias y exportes. Generar PDF y QR.

### Gerardo
- **B6** — Notificación al taller cuando le asignan una orden (email + WA) (Media)
- **B7** — Notificación a la marca cuando el taller acepta/rechaza/completa (Media)
- **C1** — Generar PDF de certificado con @react-pdf/renderer (Media)
- **C2** — Generar imagen QR con librería qrcode (Baja)
- **E8** — Exportar reportes reales con Puppeteer (PDF/Excel) desde `/estado/exportar` (Alta)
- **H3** — Tests de integración para flujos críticos: registro, login, pedidos, nivel (Alta)
- **H4** — Tests de integración para seguridad API (Media) — depende de H3
- **F10** — Dashboard de impacto contenido: métricas por colección (Alta)

### Sergio
- **B1** — Botón "Contactar" WhatsApp con contexto pre-cargado en perfiles taller (Baja)
- **B2** — Modal perfil mínimo marca al primer contacto (Media)
- **B3** — Directorio público: agregar filtros, búsqueda y paginación (Media)
- **B4** — Perfil público taller: traer certificados, agregar botón contactar (Baja) — depende de B1
- **B5** — Construir perfil público marca con datos reales (Media)
- **B8** — Ordenar directorio por nivel (ORO primero) (Baja)
- **C3** — Botón "Descargar PDF" en admin/certificados conectado al generador (Baja) — depende de C1
- **C4** — Botón "Revocar" en admin/certificados conectado a API PATCH (Baja)
- **E5** — UI pública de denuncia (formulario → POST /api/denuncias) (Media)
- **E6** — UI consulta estado denuncia por código (Baja)
- **E7** — Conectar `/admin/auditorias` a datos reales (Alta)
- **G1** — Conectar `/admin/procesos` a API real (Media)
- **G2** — Conectar `/admin/documentos` (tipos) a API real (Media)

### Criterio de avance
- Notificaciones funcionan en flujo de pedidos (asignación, aceptar, completar)
- Certificados generan PDF descargable y QR verificable
- Estado puede exportar reportes reales en PDF
- Denuncia pública funciona end-to-end (formulario → consulta por código)
- Auditorías admin conectadas a datos reales
- Tests de integración pasan para flujos críticos
- Dashboard de impacto muestra métricas por colección

---

## Semana 4 — Pruebas, fixes y preparación piloto

### Objetivo
Cero funcionalidades nuevas. Solo testing, corrección de bugs, datos de demo y preparación para el piloto.

### Gerardo
- **H5** — Migración incremental de gaps del schema Prisma (los más críticos) (Alta — parcial)
- Corregir bugs encontrados en testing
- Revisar seguridad: segunda pasada de endpoints nuevos (notificaciones, notas, exportar)
- Verificar deploy en Vercel: todas las env vars, build OK, rutas funcionan
- Documentar en `.claude/specs/handover/` las decisiones de infraestructura

### Sergio
- **G3** — Conectar `/admin/configuracion` read path (Baja)
- **G4** — Conectar botones editar/suspender/resetear en `/admin/usuarios` (Media)
- **H7** — Responsive/mobile-first para registro, formalización y academia (Media)
- **H8** — Seed de datos realistas actualizado para demo del piloto (Baja)
- Corregir bugs de UI encontrados en testing
- Testing manual de todos los flujos por rol (TALLER, MARCA, ESTADO, CONTENIDO, ADMIN)

### Criterio de avance
- Todos los flujos críticos testeados manualmente por rol
- Build pasa sin errores ni warnings críticos
- Seed genera datos realistas para demo
- Deploy en Vercel funcional con datos de prueba
- Cero stubs que aparenten ser funcionales sin serlo

---

## Resumen de carga

| Semana | Gerardo | Sergio | Total |
|---|---|---|---|
| 1 | 8 tareas (1 Alta, 3 Media, 4 Baja) | 7 tareas (1 Alta, 1 Media, 5 Baja) | 15 |
| 2 | 8 tareas (0 Alta, 4 Media, 4 Baja) | 9 tareas (0 Alta, 3 Media, 6 Baja) | 17 |
| 3 | 8 tareas (3 Alta, 4 Media, 1 Baja) | 13 tareas (1 Alta, 5 Media, 7 Baja) | 21 |
| 4 | Fixes + schema + handover | 4 tareas + testing + bugs | — |
| **Total** | **24 + fixes** | **33 + testing** | **53 + fixes** |

---

## Tareas que quedan FUERA del mes (Escenario 1)

Estas tareas se sacrifican si algo se atrasa, ordenadas de menos a más importante:

1. **F8** — `/contenido/notificaciones` masivas por segmento (Alta) — requiere endpoint de envío real, se puede postergar
2. **F9** — `/contenido/mensajes` textos institucionales (Media) — nice-to-have, no bloquea piloto
3. **F11** — Opción crear usuario CONTENIDO desde admin (Baja) — se crea por BD mientras tanto
4. **G5** — Conectar `/admin/reportes` a datos reales (Alta) — dashboard Estado cubre lo urgente
5. **H6** — Migrar middleware.ts a proxy.ts (Media) — no bloqueante, post-piloto
6. **H5** — Schema gaps completos (Alta) — se hace parcial en semana 4, el resto post-piloto

### Si semana 3 se atrasa, mover a post-piloto:
- E8 (exportes Puppeteer) — Estado puede ver KPIs en dashboard sin exportar
- F10 (dashboard impacto contenido) — rol CONTENIDO funciona sin métricas
- B5 (perfil público marca) — no es crítico para piloto

### Si semana 2 se atrasa, mover a semana 3:
- D7 (auto-save wizard) — funciona sin auto-save, solo es UX
- F5/F6/F7 (páginas contenido) — CONTENIDO usa admin mientras tanto

---

## Tareas del Escenario 2 — NO entran en este mes

Todas las tareas I1-I18 quedan para el mes siguiente. El Escenario 2 (publicación, matching, cotizaciones, acuerdos, RAG) depende de que el Escenario 1 esté estable y en piloto.

Excepción: **I1** (agregar PUBLICADO al enum) e **I6** (modelo Cotizacion) son migraciones simples que Gerardo puede hacer en semana 4 si hay margen, para adelantar schema sin implementar funcionalidad.
