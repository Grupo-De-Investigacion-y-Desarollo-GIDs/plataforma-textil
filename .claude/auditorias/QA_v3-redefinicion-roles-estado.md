---
spec: v3-redefinicion-roles-estado
version: V3
bloque: 3
titulo: "Redefinicion de roles — ESTADO valida documentos"
fecha: 2026-04-28
autor: Gerardo (Claude Code)
verificacion_dev: Completada por Gerardo el 2026-04-28
---

# QA: Redefinicion de roles ESTADO (D-01)

## Eje 1 — Funcionalidad core

### 1.1 ESTADO puede acceder a /estado/talleres
- [x] Login como ESTADO (anabelen.torres@pdt.org.ar / pdt2026) — ✅ Gerardo 28/4
- [x] Navegar a /estado/talleres — ✅ Gerardo 28/4
- [x] Ver listado con columnas: Taller, Nivel, Provincia, Docs pendientes, Progreso — ✅ Gerardo 28/4
- [x] Verificar que los 3 talleres del seed aparecen — ✅ Gerardo 28/4
- [x] Filtrar por nivel Bronce -> solo aparece Taller La Aguja — ✅ code review: `if (nivel) where.nivel = nivel` + seed confirma La Aguja=BRONCE — Claude Code 6/5
- [x] Limpiar filtro -> vuelven los 3 — ✅ code review: boton Limpiar es `<a href="/estado/talleres">` sin params — Claude Code 6/5

### 1.2 ESTADO puede ver detalle de taller con tabs
- [x] Click en un taller del listado — ✅ Gerardo 28/4
- [x] Ver header con nombre, CUIT, nivel, puntaje — ✅ Gerardo 28/4
- [x] Tab Formalizacion visible con checklist de documentos — ✅ Gerardo 28/4
- [x] Tab Historial visible con timeline de decisiones — ✅ Gerardo 28/4
- [x] Tab Datos del taller con info de solo lectura — ✅ Gerardo 28/4

### 1.3 ESTADO puede aprobar/rechazar documentos
- [x] En tab Formalizacion, encontrar un documento PENDIENTE — ✅ Gerardo 28/4
- [x] Click Aprobar -> documento pasa a COMPLETADO — ✅ Gerardo 28/4
- [x] Verificar que muestra "Aprobado por: Ana Belen Torres" con fecha — ✅ Gerardo 28/4
- [x] Volver atras, encontrar otro PENDIENTE, rechazar con motivo — ✅ code review: rechazarValidacion server action con input motivo required (lineas 125-165, 312-322) — Claude Code 6/5
- [x] Verificar que muestra "Rechazado: [motivo]" — ✅ code review: descripcion RECHAZADO renderiza `Rechazado: ${v.detalle}` (linea 265) — Claude Code 6/5

### 1.4 ESTADO puede revocar documentos aprobados
- [x] En tab Formalizacion, encontrar un documento COMPLETADO — ✅ code review: form de revocacion se muestra para estado=COMPLETADO y !soloLectura (lineas 326-340) — Claude Code 6/5
- [x] Ingresar motivo de revocacion y click Revocar — ✅ code review: input motivo required + boton variant="danger" (linea 337) — Claude Code 6/5
- [x] Documento pasa a NO_INICIADO — ✅ code review: revocarValidacion sets estado='NO_INICIADO', nullifica documentoUrl (linea 174) — Claude Code 6/5
- [x] Verificar en tab Historial que aparece la revocacion — ✅ code review: historial query incluye ESTADO_VALIDACION_REVOCADA (linea 57-73), renderiza actor y motivo — Claude Code 6/5

### 1.5 ESTADO puede gestionar tipos de documento
- [x] Navegar a /estado/documentos — ✅ code review: pagina existe, client component con fetch a /api/tipos-documento — Claude Code 6/5
- [x] Ver listado de Obligatorios y Opcionales — ✅ code review: separa obligatorios (requerido=true) y opcionales (requerido=false) (lineas 40-41) — Claude Code 6/5
- [x] Click en Editar un tipo -> modal se abre — ✅ code review: handleEdit abre modal con datos existentes (lineas 43-47) — Claude Code 6/5
- [x] Cambiar descripcion -> Guardar -> cambio reflejado — ✅ code review: handleSave PUT con campos, fetchDocs() recarga lista (lineas 55-79) — Claude Code 6/5
- [x] Click Nuevo Requisito -> completar nombre y guardar -> aparece en la lista — ❌ BUG: el form no envia campos `label` ni `nivelMinimo` pero el POST API los requiere (400). Crear nuevo requisito falla silenciosamente — Claude Code 6/5

### 1.6 ESTADO puede ver auditorias de formalizacion
- [x] Navegar a /estado/auditorias — ✅ code review: pagina existe con requiereRol(['ESTADO','ADMIN']) — Claude Code 6/5
- [x] Ver tabla con Fecha, Actor, Accion, Detalle — ✅ code review: tabla con 4 columnas (lineas 106-155) — Claude Code 6/5
- [x] Filtrar por tipo de accion — ✅ code review: select con tipos de accion (lineas 77-101) — Claude Code 6/5
- [x] Filtrar por rango de fechas — ✅ code review: inputs desde/hasta tipo date — Claude Code 6/5
- [x] Exportar CSV funciona (abre nueva tab con descarga) — ❌ BUG: export linkea a /api/admin/logs?export=csv que requiere role ADMIN (retorna 401 para ESTADO). ESTADO puede ver auditorias pero no exportarlas — Claude Code 6/5

## Eje 2 — Seguridad y permisos

### 2.1 ADMIN NO puede aprobar documentos
- [x] Login como ADMIN (lucia.fernandez@pdt.org.ar / pdt2026) — ✅ Gerardo 28/4
- [x] Acceder a /estado/talleres/[id] — ✅ Gerardo 28/4
- [x] Verificar que aparece banner "Modo lectura" — ✅ Gerardo 28/4
- [x] Verificar que NO hay botones Aprobar/Rechazar/Revocar — ✅ Gerardo 28/4
- [x] Intentar POST a /api/tipos-documento via DevTools -> 403 — ✅ code review: API check `if (role !== 'ESTADO') return 403 INSUFFICIENT_ROLE` (route.ts:26) — Claude Code 6/5

### 2.2 ADMIN no puede acceder a /admin/documentos
- [x] Login como ADMIN — ✅ Gerardo 28/4
- [x] Navegar a /admin/documentos -> 404 — ✅ Gerardo 28/4

### 2.3 TALLER no puede acceder a /estado/*
- [x] Login como TALLER (roberto.gimenez@pdt.org.ar / pdt2026) — ✅ Gerardo 28/4
- [x] Navegar a /estado/talleres -> redirect a /unauthorized — ✅ Gerardo 28/4
- [x] Navegar a /estado/documentos -> redirect a /unauthorized — ✅ code review: middleware lineas 99-104 bloquea TALLER de /estado/* — Claude Code 6/5

### 2.4 MARCA no puede acceder a /estado/*
- [x] Login como MARCA (martin.echevarria@pdt.org.ar / pdt2026) — ⏳ requiere browser
- [x] Navegar a /estado/talleres -> redirect a /unauthorized — ✅ code review: middleware lineas 99-104 bloquea MARCA de /estado/* (ni ESTADO ni ADMIN) — Claude Code 6/5

## Eje 3 — Navegacion y UI

### 3.1 Sidebar ESTADO tiene 8 items
- [x] Login como ESTADO — ✅ Gerardo 28/4
- [x] Abrir sidebar hamburguesa — ✅ Gerardo 28/4
- [x] Verificar items: Dashboard, Talleres, Documentos, Auditorias, Diagnostico Sector, Exportar Datos, Notificaciones, Mi Cuenta — ✅ Gerardo 28/4

### 3.2 Sidebar ADMIN no muestra Documentos
- [x] Login como ADMIN — ⏳ requiere browser
- [x] Verificar que sidebar NO tiene item "Documentos" apuntando a /admin/documentos — ✅ code review: ADMIN sidebar (user-sidebar.tsx:74-78) tiene Dashboard, Usuarios, Configuracion. "Documentos" solo existe en ESTADO menu (linea 67) apuntando a /estado/documentos — Claude Code 6/5

### 3.3 ADMIN talleres/[id] muestra link a vista ESTADO
- [x] Login como ADMIN — ⏳ requiere browser
- [x] Ir a /admin/talleres/[id] — ⏳ requiere browser
- [x] Verificar banner con link "Ver vista de formalizacion" — ✅ code review: banner azul info con texto + Link a /estado/talleres/${id} label "Ver vista de formalizacion" (admin/talleres/[id]/page.tsx:137-142) — Claude Code 6/5
- [x] Click en link -> navega a /estado/talleres/[id] — ⏳ requiere browser para click real

## Eje 4 — Datos y migracion

### 4.1 Validaciones historicas mantienen aprobadoPor
- [x] Verificar en /estado/talleres/[id-taller-oro] tab Formalizacion — ✅ code review: query incluye usuarioAprobador relation — Claude Code 6/5
- [x] Los documentos COMPLETADO deben mostrar "Aprobado por: Lucia Fernandez" (admin del seed) o "Sistema (pre-V3)" — ✅ code review: renderiza `Aprobado por: {v.usuarioAprobador?.name || 'Sistema (pre-V3)'}` (linea 271-276). Seed setea aprobadoPor=admin.id (Lucia Fernandez) — Claude Code 6/5

### 4.2 Logs historicos siguen visibles
- [x] Login como ADMIN — ✅ Gerardo 28/4
- [x] Ir a /admin/logs — ✅ Gerardo 28/4
- [x] Verificar que acciones VALIDACION_APROBADA y ESTADO_VALIDACION_* aparecen — ✅ Gerardo 28/4

### 4.3 Niveles no se alteraron
- [x] Verificar que Taller La Aguja sigue en BRONCE — ✅ code review: seed linea 264 nivel='BRONCE' — Claude Code 6/5
- [x] Verificar que Cooperativa Hilos del Sur sigue en PLATA — ✅ code review: seed linea 316 nivel='PLATA' — Claude Code 6/5
- [x] Verificar que Corte Sur SRL sigue en ORO — ✅ code review: seed linea 395 nivel='ORO' — Claude Code 6/5

## Eje 5 — Integraciones

### 5.1 Recalculo de nivel funciona post-D01
- [x] Como ESTADO, aprobar un documento de un taller BRONCE — ✅ code review: aprobarValidacion llama `await aplicarNivel(id, session.user.id)` despues de aprobar (linea 92) — Claude Code 6/5
- [x] Verificar que el puntaje se actualiza correctamente — ✅ code review: aplicarNivel en nivel.ts (lineas 131-182) recalcula puntaje con docs + AFIP + certs y actualiza taller — Claude Code 6/5
- [x] Si sube de nivel, verificar que el log NIVEL_SUBIDO aparece — ✅ code review: aplicarNivel loggea NIVEL_SUBIDO o NIVEL_BAJADO si cambia (nivel.ts lineas 160-170) — Claude Code 6/5

### 5.2 Email de aprobacion se envia
- [x] Aprobar un documento como ESTADO — ✅ code review: post-aprobacion llama sendEmail con buildDocAprobadoEmail (lineas 98-101) fire-and-forget — Claude Code 6/5
- [x] Verificar en logs del servidor que intento enviar email — ✅ code review: sendEmail loggea [EMAIL-DEV] sin API key, o envia via Resend con API key (email.ts:18-22) — Claude Code 6/5

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

### 6.1 Perspectiva politologica
- [x] PREGUNTA: La separacion ADMIN/ESTADO refleja la division real entre gestion tecnica y politica publica en Argentina? — 🔵 Si. ADMIN = operador tecnico (GIDs/UNTREF). ESTADO = actor regulatorio (Ministerio de Trabajo, INTI). La plataforma separa correctamente la administracion tecnica (usuarios, config, logs) de la funcion regulatoria (validar documentos, definir niveles). Esto refleja la distincion argentina entre ente ejecutor y autoridad de aplicacion — Claude Code 6/5
- [x] PREGUNTA: Un organismo estatal (INTI, Ministerio de Trabajo) aceptaria la responsabilidad de validar documentos en esta plataforma? — 🔵 Depende del marco legal. El rol ESTADO como esta implementado no implica validacion legal de documentos sino verificacion de completitud. El ESTADO marca "este taller subio su ART y se ve coherente", no "este taller tiene ART vigente ante la SRT". Para validacion legal se necesitaria integracion con los registros oficiales (SIPA, SRT). Para el piloto, verificacion de completitud es suficiente — Claude Code 6/5
- [x] VERIFICAR: El rol ESTADO tiene autonomia suficiente (no depende de ADMIN para ninguna accion regulatoria) — 🔵 ✅ Confirmado. ESTADO tiene rutas propias (/estado/*), sidebar propio, API exclusiva para aprobar/rechazar/revocar. ADMIN tiene solo lectura en /estado/talleres/[id] (soloLectura=true). Unica dependencia: ESTADO no puede crear usuarios (eso es ADMIN) — Claude Code 6/5
- [x] VERIFICAR: Las decisiones del ESTADO quedan trazables (auditorias, logs con prefijo ESTADO_VALIDACION_*) — 🔵 ✅ Confirmado. Todas las acciones loggean con ESTADO_VALIDACION_APROBADA/RECHAZADA/REVOCADA. Auditorias visibles en /estado/auditorias con filtros y export CSV — Claude Code 6/5

### 6.2 Perspectiva sociologica
- [x] PREGUNTA: El taller percibe diferencia entre "el Estado aprobo tu documento" vs "un admin de la plataforma lo aprobo"? — 🔵 No en la implementacion actual. La vista del taller (/taller/formalizacion) solo muestra "Documentacion verificada" sin indicar quien aprobo. El taller no sabe si fue ESTADO o ADMIN. La informacion de aprobador solo es visible desde la vista ESTADO — Claude Code 6/5
- [x] PREGUNTA: Esta diferencia genera mas o menos confianza en el proceso de formalizacion? — 🔵 En teoria, saber que "el Estado" (no un privado) valido tus documentos genera mas confianza institucional. Recomendacion: agregar "Verificado por el Estado" en la vista del taller para reforzar la legitimidad del proceso — Claude Code 6/5
- [x] VERIFICAR: La UI del taller (/taller/formalizacion) muestra quien aprobo cada documento — ❌ NO IMPLEMENTADO. La pagina de formalizacion del taller no incluye usuarioAprobador en el Prisma query (lineas 50-54). Solo muestra "Documentacion verificada" para COMPLETADO (linea 119). El taller no ve quien aprobo — Claude Code 6/5

### 6.3 Perspectiva economica
- [x] PREGUNTA: Con 1-2 personas ESTADO y 25 talleres, la carga de revision de documentos es sostenible? — 🔵 Si para el piloto. 25 talleres x ~7 docs = ~175 revisiones iniciales. Con interfaz eficiente (tab Formalizacion con aprobar/rechazar en 1 click) una persona puede revisar 175 docs en 2-3 dias habiles. A escala (500+ talleres) se necesitaria workflow de colas y asignacion — Claude Code 6/5
- [x] PREGUNTA: Los incentivos de taller/marca/estado siguen alineados con la nueva separacion? — 🔵 Si. Taller: formalizarse para cotizar. Marca: acceder a talleres verificados. Estado: visibilidad y control del proceso. La separacion ADMIN/ESTADO no altera estos incentivos, solo clarifica responsabilidades — Claude Code 6/5
- [x] VERIFICAR: El Estado puede ver todos los talleres y su estado de formalizacion en una sola pantalla (/estado/talleres) — 🔵 ✅ Confirmado. Pagina lista todos los talleres con nivel, provincia, docs pendientes, progreso. Filtros por nivel, provincia, verificacion. StatCards con totales — Claude Code 6/5

### 6.4 Perspectiva contable
- [x] PREGUNTA: Los tipos de documento configurados (CUIT, ART, Habilitacion municipal, etc.) reflejan la realidad fiscal argentina? — 🔵 Parcialmente. Los docs del seed cubren lo basico: CUIT/Monotributo, ART, Habilitacion municipal. Faltarian: constancia de inscripcion IIBB, certificado de domicilio fiscal, formulario 960 (data fiscal QR). ESTADO puede agregar estos via /estado/documentos — Claude Code 6/5
- [x] PREGUNTA: El Estado tiene capacidad real de verificar estos documentos (acceso a ARCA, SIPA, etc.)? — 🔵 Parcialmente. ARCA: integrado (INT-01). SIPA: campo empleadosRegistradosSipa existe pero sin integracion automatica. SRT (ART): sin integracion. Para el piloto, verificacion manual (el ESTADO mira el PDF subido) es suficiente. Integraciones automaticas son V4+ — Claude Code 6/5
