# PDT - Checklist Completo de Desarrollo

Estado: OK | PARCIAL | STUB | FALTA
Prioridad: P0 = bloqueante | P1 = critico | P2 = importante | P3 = deseable

---

## 1. PANTALLAS POR ROL

### 1.1 Auth y Onboarding

**Login** `/login` — **OK**
Form con email + password, validacion Zod, signIn('credentials') via NextAuth. Muestra banner verde si viene de registro (?registered=true). Maneja callbackUrl para redirect post-login. Bug menor: password min 6 en frontend pero API exige min 8.

**Registro** `/registro` — **PARCIAL** — P1
Wizard de 3 pasos implementado en UI (contradice CLAUDE.md que dice "1 paso"): Paso 1 elige rol (TALLER/MARCA), Paso 2 datos personales (nombre, email, password, phone), Paso 3 datos de taller o marca (nombre, CUIT, ubicacion, capacidad/tipo). POST a /api/auth/registro crea User + Taller/Marca en transaccion. Falta: CUIT no valida formato (acepta cualquier string), ubicacion es texto libre sin selector de provincia/ciudad, no hay checkbox terminos y condiciones, password min 6 en frontend vs 8 en API causa error confuso, si se vuelve del paso 3 al 2 y se avanza se pierden los datos del paso 3.

**Registro Paso 2 (CUIT)** — **FALTA** — P1
El wireframe MVP pide un paso dedicado a verificacion CUIT contra ARCA. Actualmente CUIT se pide como texto libre en paso 3. Requiere integracion ARCA.

**Registro Paso 3 (Rol)** — **N/A**
La seleccion de rol ya esta en paso 1 del wizard actual. No se necesita paso separado.

**Olvide contrasena** `/olvide-contrasena` — **STUB** — P1
UI completa: form pide email, muestra mensaje "Email enviado" con icono verde. PERO el onSubmit no hace nada — solo setea estado local `enviado=true`. No hay API call, no se envia email, no se genera token. Todo es visual sin backend.

**Restablecer contrasena** — **FALTA** — P1
No existe pagina `/restablecer/[token]`. La ruta esta registrada como publica en middleware.ts pero no hay page.tsx. Se necesita: pagina con form de nueva password, API para validar token y actualizar password.

**Mi cuenta** `/mi-cuenta` — **PARCIAL** — P2
UI con 2 secciones: editar perfil (nombre, telefono) y cambiar password. Ambas llaman PUT /api/auth/mi-cuenta que funciona (Prisma real). Problemas: 1) El telefono siempre inicia vacio porque la session no lo trae y no hay GET para pre-cargar, 2) despues de guardar nombre la session no se refresca (no hay router.refresh()), 3) la pagina esta en el layout (auth) centrado en vez de en un layout protegido con sidebar, 4) loading state compartido entre ambos forms.

**Tour primer uso** — **FALTA** — P3
Overlay/wizard de onboarding para primer login. No hay implementacion. Necesitaria flag hasSeenTour en user o session.

---

### 1.2 Taller

**Dashboard** `/taller` — **PARCIAL** — P1
Muestra nombre, nivel, puntaje y capacidad mensual desde Prisma real. Pero es solo lectura estatica — no hay pedidos recientes, alertas, actividad, progreso hacia siguiente nivel, ni acciones rapidas. Si el taller no tiene registro muestra datos fake (fallback "BRONCE", puntaje 0) en vez de redirigir a completar perfil. Esencialmente un stub con 3 stat cards.

**Mi perfil** `/taller/perfil` — **OK**
Carga datos completos del taller desde Prisma (con procesos, prendas, maquinaria, certificaciones). Calcula completitud del perfil (10 campos, muestra %). Muestra ProgressRing real. Si no hay taller creado, muestra empty state con link a /taller/perfil/completar. Solo lectura — el boton "Editar" redirige al wizard. No hay edicion inline ni upload de avatar/foto.

**Mi formalizacion** `/taller/formalizacion` — **PARCIAL** — P1
Carga validaciones reales desde Prisma y las mapea contra 8 tipos hardcodeados. Progress ring y conteo completadas/total son reales. Badges de estado por item (completado/pendiente/vencido/rechazado) funcionan. PERO: el boton "Subir documento" no tiene onClick ni action — es un boton muerto. No hay input type="file", no hay upload presigned URL, no hay integracion con storage. El taller no puede hacer nada desde esta pagina.

**Academia colecciones** `/taller/aprender` — **OK**
Lista real de colecciones desde Prisma (donde activa=true). Muestra conteo de videos, progreso real (ProgresoCapacitacion), certificados obtenidos. Botones "Empezar"/"Continuar"/"Revisar" dinamicos segun estado. Stats cards (cursos, videos, certificados) desde datos reales.

**Academia detalle** `/taller/aprender/[id]` — **OK**
Server component carga coleccion real con videos ordenados y evaluacion. AcademiaCliente (client): iframe YouTube embed real, lista de videos clickeable, marcar visto via POST /api/colecciones/[id]/progreso (upsert en BD), quiz/evaluacion via POST /api/colecciones/[id]/evaluacion (corrige respuestas, genera certificado si aprueba con codigo unico). Muestra estado certificado si ya existe. Progreso pre-cargado desde BD.

**Pedidos recibidos** `/taller/pedidos` — **OK**
Lista real de OrdenManufactura asignadas al taller desde Prisma. 4 stat cards (total, pendientes, en ejecucion, completadas) calculadas de datos reales. Cada orden muestra moId, pedido, marca, proceso, precio, barra de progreso y badge de estado. Solo lectura — no hay detalle clickeable ni forma de actualizar progreso/estado. Falta acentos en "En ejecucion".

**Completar perfil wizard** `/taller/perfil/completar` — **OK** — P1
Wizard de 14 pasos (indices 0-13): bienvenida, maquinaria, equipo, experiencia, organizacion, espacio, sam, sam-quiz, eficiencia, resultado, gestion, procesos, prendas, resumen.
Formula de capacidad: ((horas*60)/SAM)*eficiencia*maquinas*22. Score calculado desde respuestas reales (5 dimensiones). Pre-carga datos existentes desde /api/talleres/me. Guarda via PUT /api/talleres/[id] incluyendo maquinaria, procesosIds, prendasIds, puntaje. Botones en resumen: "Ver mi perfil" y "Guardar e ir a Academia". "Completar mas tarde" en bienvenida guarda y redirige a /taller. Pendiente: no hay auto-save entre pasos intermedios.

---

### 1.3 Marca

**Directorio talleres** `/marca/directorio` — **OK**
Carga talleres desde Prisma con filtros server-side via searchParams: busqueda texto (nombre/ubicacion), nivel (BRONCE/PLATA/ORO), proceso, prenda. Selects de proceso y prenda cargados desde BD. Grid de cards con nombre, nivel badge, ubicacion, rating, procesos, prendas, capacidad. Link "Ver perfil" funciona. Boton "Contactar" existe pero no tiene handler — muerto.

**Perfil taller (vista marca)** `/marca/directorio/[id]` — **OK**
Carga taller completo con procesos, prendas, maquinaria, certificaciones, certificados. No requiere auth (publico por URL). Header con avatar letra-based, stats (rating, trabajadores, capacidad, on-time). Secciones condicionales para procesos, prendas, certificaciones con link "Verificar QR" a /verificar. Boton "Contactar por WhatsApp" renderizado pero sin action — muerto.

**Pedidos lista** `/marca/pedidos` — **OK**
Lista real de pedidos de la marca con filtros (texto + estado) via searchParams. 4 stat cards reales. Cada pedido es un Link clickeable a /marca/pedidos/[id]. Muestra omId, prenda, cantidad, fecha, ordenes count, estado badge. Banner success despues de crear pedido (?created=1). Boton "Crear pedido" linkea a /nuevo.

**Nuevo pedido** `/marca/pedidos/nuevo` — **OK**
Server Action createPedido completa: valida session + rol MARCA, resuelve marca.id, genera omId (OM-YYYY-UUID), crea Pedido con estado BORRADOR en BD. Form con tipoPrenda, cantidad, fechaObjetivo, montoTotal. Redirect a /marca/pedidos?created=1 on success.

**Detalle pedido** `/marca/pedidos/[id]` — **OK**
Verifica ownership (pedido.marcaId === marca.id). Stat grid: unidades, progreso %, monto, fecha. Lista de ordenes de manufactura con taller, proceso, precio, progreso bar, estado badge. Solo lectura — no hay acciones de cancelar o editar.

**Mi perfil marca** `/marca/perfil` — **OK**
Server Action updateMarca actualiza nombre, tipo, ubicacion, website, frecuenciaCompra, volumenMensual. Stats read-only: CUIT, pedidos, rating. Funciona pero no da feedback visual despues de guardar (sin toast ni banner success). Falla silenciosa si nombre esta vacio.

**Perfil publico marca** — **FALTA** — P2
Como los talleres ven el perfil de una marca. No existe.

---

### 1.4 Estado

**Dashboard** `/estado` — **PARCIAL** — P2
Ejecuta 5 counts en $transaction (totalTalleres, totalMarcas, bronce, plata, oro). Muestra 4 stat cards (talleres, marcas, bronce, plata) — falta card de Oro. Barra de distribucion por nivel con porcentajes calculados. No hay guard de rol ESTADO (cualquier usuario logueado puede verlo). No hay link a /estado/exportar. No hay pedidos, certificados, ni metricas de capacitacion.

**Exportar reporte** `/estado/exportar` — **STUB** — P2
Client component con UI completa: 4 tipos de reporte (radio), formato (PDF/Excel/CSV), periodo (mes/trimestre/ano/todo). Boton "Generar Reporte" simula 2 segundos de espera con setTimeout y luego muestra "Reporte generado". Boton "Descargar" no tiene handler. Cero API calls, cero generacion real.

---

### 1.5 Publicas

**Verificar certificado** `/verificar` — **OK**
Client component con Suspense. Lee ?code= de URL (pre-llena input y busca automaticamente). 3 estados: valido (verde, datos completos), revocado (rojo), no encontrado (rojo). Llama GET /api/certificados/[codigo] real. Funciona desde links QR de perfiles. Falta generacion de QR real (imagen).

**Config notificaciones** `/cuenta/notificaciones` — **STUB** — P3
Existe el directorio y page pero no fue analizado en detalle.

**FAQ/Ayuda** `/ayuda` — **OK** — Contenido estatico.
**Terminos** `/terminos` — **OK** — Contenido estatico.
**Privacidad** `/privacidad` — **OK** — Contenido estatico.
**404** — **OK**
**Error generico** — **OK**

**Directorio publico** `/directorio` — **PARCIAL** — P2
Carga todos los talleres desde Prisma con procesos, ordenado por rating desc. Grid de 3 columnas. Cada card muestra nombre, nivel, zona, rating, trabajadores, capacidad, procesos. Card entera es Link a /perfil/[id]. Sin paginacion, sin filtros, sin busqueda. Usa campo `zona` (vs `ubicacion` en marca/directorio — posible inconsistencia).

**Perfil publico** `/perfil/[id]` — **PARCIAL** — P2
Carga taller con procesos, maquinaria, certificaciones. Header con nombre + nivel + ubicacion. Stats: rating, trabajadores, capacidad, on-time. Secciones condicionales. Mas simple que la version /marca/directorio/[id]: no trae certificados (cursos), no tiene boton contactar, no tiene link volver. No requiere auth.

**Mi cuenta hub** `/cuenta` — **OK**
Auth-protected. Muestra resumen (nombre, email, tel, rol, fecha alta, notificaciones sin leer). Tiles de navegacion a /mi-cuenta y /cuenta/notificaciones. Banner info sobre servicios externos no integrados.

---

### 1.6 Admin

**Dashboard** `/admin` — **PARCIAL** — P2
Redirect a /admin/dashboard. El dashboard es client component que llama GET /api/admin/stats (counts reales: talleres, marcas, colecciones, certificados) y GET /api/admin/logs?limit=5 (logs reales). StatCards con datos en vivo. Grid de navegacion a 18 sub-secciones. Sin graficos, sin filtro de periodo, sin tendencias.

**Colecciones lista** `/admin/colecciones` — **OK**
Fetch GET /api/colecciones real. Busqueda client-side por titulo. Muestra titulo, institucion, video count, badge activa/borrador. Links a editar y videos. Sin delete, sin paginacion.

**Crear coleccion** `/admin/colecciones/nueva` — **OK**
Form controlado con titulo, descripcion, categoria, institucion, duracion. POST /api/colecciones funcional. Redirect a editar on success.

**Editar coleccion** `/admin/colecciones/[id]` — **OK**
useEffect carga datos desde GET /api/colecciones/[id] al montar (titulo, descripcion, institucion, categoria, duracion, activa, videos). Lista de videos reales con delete via DELETE /api/colecciones/[id]/videos?videoId=. Guarda via PUT. Toggle publicada/borrador funcional. Link a /videos para agregar.

**Agregar video** `/admin/colecciones/[id]/videos` — **OK**
Input URL YouTube con validacion regex, preview iframe en vivo, campo titulo manual. Checkboxes verificacion de contenido (bloquean submit hasta marcar los 3). Guarda via POST /api/colecciones/[id]/videos (calcula orden automatico). No extrae metadata de YouTube API — titulo se ingresa manualmente.

**Evaluaciones** `/admin/evaluaciones` — **STUB** — P2
100% client-side mock. Select de coleccion con 3 opciones hardcodeadas (no fetch). 2 preguntas mock en useState. CRUD completo in-memory (agregar/editar/borrar preguntas, editar opciones, marcar correcta, agregar explicacion). Boton "Guardar Evaluacion" no hace nada. Cero persistencia.

**Certificados** `/admin/certificados` — **PARCIAL** — P2
Fetch GET /api/certificados real. DataTable con busqueda, stats (total, este mes). Modal vista previa con datos reales. Modal revocar con selector de motivo PERO el boton "Revocar" solo cierra el modal — no llama API. Boton "Descargar PDF" no hace nada.

**Usuarios** `/admin/usuarios` — **PARCIAL** — P2
Fetch GET /api/admin/usuarios real. Filtros por nombre/email y rol. 3 stats (total, talleres, marcas) reales. DataTable con badge rol y activo. Modal detalle (ojo) con datos reales. Iconos editar y suspender renderizados pero sin handler — stubs. Botones modal "Cambiar rol", "Resetear password", "Suspender" sin onClick.

**FAQ admin** `/admin/faq` — **STUB** — P3
No analizado en detalle. Probablemente mock in-memory.

**Talleres lista** `/admin/talleres` — **OK**
Fetch GET /api/talleres real. Filtros por nombre/CUIT/email y nivel. 4 stats (total, Oro, Plata, Bronce) reales. DataTable con link a detalle. Botones "Exportar CSV/Excel" sin handler.

**Marcas lista** `/admin/marcas` — **OK**
Fetch GET /api/marcas real. Busqueda. 2 stats (total, activas). Link a detalle. Boton editar sin handler.

**Detalle taller** `/admin/talleres/[id]` — **OK**
Carga taller real con user, validaciones, maquinaria, certificados. Header: nombre, CUIT, zona, email, phone, nivel badge, puntaje, activo/inactivo. Stats: SAM, capacidad, organizacion, trabajadores (condicional). 3 tabs via searchParams: Formalizacion (checklist validaciones reales con aprobar/rechazar via Server Actions), Documentos (pendientes con URL), Actividad (logs reales). Notas internas via Server Action. Aprobar/rechazar recalcula nivel con aplicarNivel().

**Detalle marca** `/admin/marcas/[id]` — **STUB** — P2
Mismo patron: ignora params.id, muestra mockMarca "Comercial Textil SRL" siempre. Stats (pedidos:5, favoritos:3, contactos:12) hardcodeados. 4 actividades mock. "Sin notas" estatico. Botones sin handlers.

**Procesos** `/admin/procesos` — **STUB** — P2
Mock in-memory: 6 procesos hardcodeados (Corte, Confeccion, etc.). CRUD in-memory con modal. El _count (talleres usando el proceso) es hardcodeado. Sin API, sin persistencia.

**Documentos** `/admin/documentos` — **STUB** — P2
Mock in-memory: 7 tipos de documento por nivel (Bronce/Plata/Oro). CRUD in-memory con modal. Drag-and-drop renderizado pero no funcional. Sin API, sin persistencia.

**Configuracion** `/admin/configuracion` — **PARCIAL** — P3
3 tabs: General, Emails (redirige a integraciones), Integraciones (redirige). Form General con campos: nombre plataforma, email soporte, WhatsApp soporte, toggles registro, prefijo certificado, institucion firmante. Valores iniciales HARDCODEADOS (no lee de BD). PERO el guardar si funciona: llama PUT /api/admin/config por cada clave — el write path es real. El read no.

**Pedidos** `/admin/pedidos` — **OK**
Fetch GET /api/pedidos real. Busqueda por marca/OM. Filtro estado. 4 stats reales. DataTable completa. Icono detalle (ojo) renderizado pero sin handler. Boton "Exportar reporte" sin handler.

**Auditorias** `/admin/auditorias` — **STUB** — P2
Mock in-memory: 3 auditorias hardcodeadas. Stats calculadas del mock. Placeholder "Calendario interactivo (proximamente)". Listas proximas auditorias y pendientes informe del mock. Modal "Programar Auditoria" con form pero el boton solo cierra el modal. Sin API, sin persistencia.

**Reportes** `/admin/reportes` — **STUB** — P2
100% estatico: selector de periodo visual sin efecto. Stats hardcodeadas (24 talleres, 8 marcas, 45 certificados, 156 videos). Grafico distribucion nivel (33%/50%/17%) hardcodeado. Grafico registros por mes con alturas fijas. Botones PDF/Excel simulan 2s de carga y no generan nada.

**Notificaciones** `/admin/notificaciones` — **STUB** — P3
Mock: 2 envios pasados hardcodeados con open/click rates. Form compose: asunto, mensaje, segmento (todos/talleres/marcas), canal (email/WhatsApp/in-app). Botones "Vista previa", "Programar", "Enviar ahora" sin handlers. Icono detalle en historial sin handler.

**Logs** `/admin/logs` — **OK**
Fetch GET /api/admin/logs real con paginacion (20 por pagina). Busqueda y filtro por tipo (AUTH/CRUD/ADMIN/ERROR). Tabla manual con timestamp, tipo badge, usuario, accion, detalles JSON. Prev/next funcionales. Botones "Exportar CSV/JSON" sin handler.

**Roles** `/admin/roles` — **STUB** — P3
Mock in-memory: 3 roles hardcodeados (ADMIN, ESTADO, AUDITOR) con listas de permisos. Toggle permisos individuales con checkboxes. Agregar nuevo rol in-memory. Roles sistema tienen nombre disabled. Sin persistencia.

**Database** `/admin/database` — **STUB** — P3
Mock: 8 tablas hardcodeadas con row counts y tamanos falsos. 3 backups mock. SQL textarea donde "ejecutar" siempre retorna "Consulta ejecutada. 0 filas afectadas. (mock)". Botones backup/importar/restaurar sin handlers.

**Integraciones index** `/admin/integraciones` — **STUB** — P3
Lista estatica de 4 servicios (ARCA, LLM, SendGrid, WhatsApp) con badges hardcodeados ("configurado"/"pendiente"). Links a sub-paginas.

**Config ARCA** `/admin/integraciones/arca` — **STUB** — P3
Form con API URL y key pre-llenados hardcodeados. "Probar Conexion" simula 1.5s y dice "ok". "Guardar" sin handler. Status "Activo, ultima verificacion hace 2 horas" hardcodeado.

**Config Email** `/admin/integraciones/email` — **STUB** — P3
Form con API key, fromEmail, fromName hardcodeados. "Enviar Email de Prueba" simulado. "Guardar" sin handler. "Editar Templates" linkea a /admin/templates. "156 emails este mes" hardcodeado.

**Config LLM** `/admin/integraciones/llm` — **STUB** — P3
Form con provider (OpenAI/Anthropic/local), API key, model, max tokens. System prompt pre-llenado. Checkboxes chatbot. "Guardar" sin handler.

**Config WhatsApp** `/admin/integraciones/whatsapp` — **STUB** — P3
Form con Phone Number ID, Access Token, Business Account ID vacios. Checkboxes tipos mensaje. "Enviar Test" simulado. "Guardar" sin handler. Status "Pendiente / No configurado".

**Templates** `/admin/templates` — **STUB** — P3
Mock in-memory: 6 templates email hardcodeados (bienvenida, verificar email, recuperar password, certificado, documentos por vencer, auditoria). Modal editar (nombre, asunto, body) in-memory. Modal preview con variables {nombre}, {empresa} reemplazadas por valores sample. Sin persistencia.

---

## 2. BACKEND Y API

### 2.1 APIs existentes — estado actual

**GET/PUT /api/admin/config** — OK, ADMIN only. Lee/escribe configuracion_sistema. Upsert por clave.

**GET /api/admin/logs** — OK, ADMIN only. Logs reales con paginacion. Filtro por accion. Sin filtro por fecha.

**GET /api/admin/stats** — OK, ADMIN only. 7 counts paralelos + groupBy estado/nivel. Sin filtro temporal ni agregaciones monetarias.

**GET/PUT/DELETE /api/admin/usuarios/[id]** — PARCIAL, ADMIN only. GET y PUT funcionan. DELETE es soft-delete (active=false). Sin audit log.

**GET/POST /api/admin/usuarios** — PARCIAL, ADMIN only. Lista con filtros. POST crea usuario pero NO crea Taller/Marca asociado (a diferencia de /registro). Sin Zod.

**GET/PUT /api/auditorias/[id]** — OK, ADMIN/ESTADO only. Auth + role check implementado (Sprint 1).

**GET/POST /api/auditorias** — OK, ADMIN/ESTADO only. Auth + role check implementado (Sprint 1).

**PUT /api/auth/mi-cuenta** — OK, requiere session. Actualiza nombre/phone y/o password con bcrypt. Falta GET para pre-cargar datos.

**POST /api/auth/registro** — OK, publico. Zod completo. Crea User + Taller/Marca en transaccion. Solo roles TALLER/MARCA. Sin verificacion email, sin rate limiting.

**GET /api/certificados/[codigo]** — OK, publico (intencionalmente). Lookup por codigo unico.

**GET/POST/PATCH /api/certificados** — OK, POST y PATCH requieren ADMIN. Llama aplicarNivel() al crear/revocar (Sprint 1).

**GET/PUT/DELETE /api/colecciones/[id]** — PROBLEMA: DELETE sin auth. PUT solo verifica session sin verificar rol.

**GET /api/colecciones** — OK, publico. Sin filtro por activa (muestra todo a todos).

**GET /api/denuncias/[codigo]** — OK, publico. Solo retorna campos seguros (codigo, tipo, estado).

**GET/POST /api/denuncias** — OK, GET requiere ADMIN/ESTADO. POST publico (intencionalmente, para denuncias anonimas) (Sprint 1).

**GET/PUT /api/marcas/[id]** — OK, PUT con ownership check (userId match o ADMIN) (Sprint 1).

**GET /api/marcas** — OK, ADMIN only.

**GET/PUT /api/notificaciones** — PROBLEMA: userId viene del client sin validar contra session. Un usuario puede leer notificaciones de otro.

**GET/POST /api/pedidos/[id]/ordenes** — OK, auth + ownership via checkPedidoAccess() (Sprint 1).

**GET/PUT /api/pedidos/[id]** — OK, PUT con ownership check (marca.userId match o ADMIN) (Sprint 1).

**GET/POST /api/pedidos** — OK, role-aware (ADMIN ve todo, MARCA ve solo suyas). Taller bloqueado con 403.

**GET/PUT /api/talleres/[id]** — OK, PUT con ownership check (userId match o ADMIN) (Sprint 1). Nota: no actualiza relaciones (procesos, prendas, maquinaria) — se hace via wizard.

**GET /api/talleres** — OK, publico (directorio).

**PUT /api/validaciones/[id]** — OK, ownership check + solo ADMIN puede cambiar estado (previene self-approve). Talleres solo pueden modificar sus propias validaciones (Sprint 1).

**GET/POST /api/validaciones** — OK, GET requiere ADMIN/ESTADO, POST requiere ADMIN (Sprint 1).

### 2.2 APIs faltantes

| Endpoint | Prio | Estado |
|----------|------|--------|
| ~~`POST /api/auth/password-reset`~~ | P1 | **HECHO** (Sprint 1) — genera token + envia email via lib/email.ts |
| ~~`POST /api/auth/password-reset/[token]`~~ | P1 | **HECHO** (Sprint 1) — valida token, actualiza password, borra token |
| `POST /api/auth/verify-email` | P2 | FALTA — confirma email post-registro |
| `POST /api/arca/verificar-cuit` | P1 | FALTA — llama ARCA, retorna razon social + condicion fiscal |
| ~~`POST /api/validaciones/[id]/approve`~~ | P1 | **HECHO** (Sprint 1) — via Server Actions en admin/talleres/[id] |
| ~~`POST /api/validaciones/[id]/reject`~~ | P1 | **HECHO** (Sprint 1) — via Server Actions en admin/talleres/[id] |
| ~~`PATCH /api/talleres/[id]/nivel`~~ | P1 | **HECHO** (Sprint 1) — lib/nivel.ts calcularNivel() + aplicarNivel() |
| `POST /api/certificados/generate` | P1 | FALTA — genera codigo PDT-CERT-YYYY-XXXXXX + QR |
| `GET /api/certificados/[codigo]/pdf` | P2 | FALTA — genera y retorna PDF del certificado |
| ~~`POST /api/colecciones/[id]/evaluacion`~~ | P2 | **HECHO** — corrige respuestas, genera certificado si aprueba |
| ~~`POST /api/colecciones/[id]/progreso`~~ | P2 | **HECHO** — marca video como visto, actualiza % |
| `POST /api/auditorias/[id]/informe` | P2 | FALTA — checklist + fotos + resultado de auditoria |
| `GET/POST/PUT/DELETE /api/procesos-productivos` | P2 | FALTA — CRUD para admin |
| `GET/POST/PUT/DELETE /api/tipos-documento` | P2 | FALTA — CRUD para admin |
| `GET/POST/PUT/DELETE /api/faq` | P3 | FALTA — CRUD FAQ |
| `POST /api/admin/notificaciones/send` | P3 | FALTA — envio masivo email/WA/in-app |
| ~~`POST /api/taller/perfil/completar`~~ | P1 | **HECHO** — via PUT /api/talleres/[id] desde wizard |
| `GET /api/auth/mi-cuenta` | P2 | FALTA — pre-carga datos de cuenta (phone, etc.) |

### 2.3 Problemas de seguridad en APIs existentes

| Problema | Endpoints afectados | Estado |
|----------|---------------------|--------|
| ~~Sin auth~~ | ~~auditorias, validaciones, pedidos/[id]/ordenes, denuncias GET~~ | **RESUELTO** (Sprint 1) |
| ~~Sin ownership check~~ | ~~talleres/[id] PUT, marcas/[id] PUT, pedidos/[id] PUT~~ | **RESUELTO** (Sprint 1) |
| ~~Certificados POST sin auth~~ | ~~/api/certificados POST~~ | **RESUELTO** (Sprint 1) |
| ~~Denuncias GET expone todo~~ | ~~/api/denuncias GET sin auth~~ | **RESUELTO** (Sprint 1) |
| Notificaciones userId no validado | /api/notificaciones | PENDIENTE P1 |
| ~~Colecciones DELETE sin auth~~ | ~~/api/colecciones/[id] DELETE~~ | **RESUELTO** (Sprint 1) |
| ~~Validaciones self-approve~~ | ~~/api/validaciones/[id] PUT sin role check~~ | **RESUELTO** (Sprint 1) |

### 2.4 Logica de negocio

**Motor calculo nivel** — **OK** (Sprint 1)
lib/nivel.ts: calcularNivel() + aplicarNivel(). Calcula BRONCE/PLATA/ORO basado en validaciones + certificados. Se invoca al crear/revocar certificado y al aprobar/rechazar validacion desde admin.

**Progreso formalizacion %** — **OK** (Sprint 1)
La pagina taller/formalizacion calcula % desde validaciones reales. aplicarNivel() persiste nivel y puntaje en taller.

**Generacion codigo certificado** — PARCIAL — P1
Certificados se crean desde academia (evaluacion aprobada) con codigo unico. Falta formato estandarizado PDT-CERT-YYYY-XXXXXX y generacion QR image.

**Scoring/reputacion taller** — FALTA — P2
Combinar ontimeRate + retrabajoRate + rating + formalizacion % con pesos configurables.

**State machine ordenes** — PARCIAL — P2
PUT /api/pedidos/[id] acepta cualquier estado sin validar transiciones (ej: de COMPLETADO a PENDIENTE seria valido).

**Alertas vencimiento documentos** — FALTA — P2
Cron que revise validaciones con fechaVencimiento proxima y envie notificacion.

**Logging actividad** — PARCIAL — P2
Tabla log_actividad existe, API GET funciona, pero ninguna ruta escribe logs al mutar datos.

---

## 3. INTEGRACIONES EXTERNAS

**ARCA (ex-AFIP)** — FALTA — P1
Se necesita: lib/arca.ts con client API (cert-based auth), endpoint POST /api/arca/verificar-cuit, mock para dev, env vars (ARCA_CUIT, ARCA_TOKEN, ARCA_CERT_PATH). Usado en: registro paso 2, admin detalle taller (verificar), formalizacion.

**SendGrid (email)** — PARCIAL — P1 (Sprint 1)
lib/email.ts existe con wrapper SendGrid. Template password-reset implementado. Faltan: bienvenida, doc aprobado/rechazado, certificado emitido, vencimiento proximo, auditoria programada, notificacion masiva, verificar email. Motor de variables {{nombre}}, {{empresa}}, {{url}}. Env: SENDGRID_API_KEY, EMAIL_FROM.

**QR Code** — FALTA — P1
Package `qrcode`, lib/qr.ts que genera QR apuntando a https://[dominio]/verificar/[codigo]. Usado en: certificado preview/download, pagina publica verificar.

**WhatsApp Business** — FALTA — P2
lib/whatsapp.ts con Meta/Twilio API. Env: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID. Notificaciones: auditoria programada, doc aprobado/rechazado, certificado emitido.

**PDF generation** — FALTA — P2
Certificados (layout con QR + datos + firma) + reportes estado (metricas + graficos). @react-pdf/renderer o puppeteer.

**OpenAI / LLM** — FALTA — P3
lib/llm.ts, POST /api/assistant/chat, RAG con normativa. Sidebar en academia/[id]. Env: OPENAI_API_KEY.

**Google Maps** — FALTA — P3
lib/maps.ts geocoding. Mapa embed en perfil publico taller. Env: GOOGLE_MAPS_API_KEY.

---

## 4. AUTH Y SEGURIDAD

**Login NextAuth + JWT** — OK. Credentials provider con bcrypt. Session strategy JWT. auth.config.ts (Edge) + auth.ts (server).

**Middleware proteccion por roles** — OK. Rutas publicas listadas. /admin→ADMIN, /taller→TALLER, /marca→MARCA, /estado→ESTADO. Redirect a /unauthorized si rol incorrecto. Root / redirige segun rol.

**Password reset completo** — **OK** (Sprint 1). POST /api/auth/password-reset genera token + envia email. POST /api/auth/password-reset/[token] valida y actualiza. Pagina /restablecer/[token] con form completo.

**Verificacion email** — FALTA — P2. Campo emailVerified existe en User. VerificationToken model existe. Flujo no conectado.

**Rate limiting** — FALTA — P2. Endpoints /registro, /login, /arca/verificar-cuit necesitan rate limit. Upstash Redis o similar.

**Upload validation** — **OK** (Sprint 1). POST /api/validaciones/[id]/upload con auth + ownership check. Valida MIME (PDF/JPG/PNG/WEBP), max 5MB. Usa Supabase Storage (lib/storage.ts). Graceful fallback si storage no configurado.

**Session max age** — PARCIAL — P2. JWT strategy pero maxAge no configurado explicitamente en auth.ts.

**Sub-roles admin** — FALTA — P3. Solo existe ADMIN. MVP especifica SUPER_ADMIN, AUDITOR, CURADOR.

---

## 5. SCHEMA / BASE DE DATOS

**24 modelos existentes:** User, Account, Session, VerificationToken, Taller, TallerProceso, TallerPrenda, Maquinaria, TallerCertificacion, Marca, ProcesoProductivo, TipoPrenda, PrendaProceso, Pedido, OrdenManufactura, EscrowHito, Validacion, TipoDocumento, Coleccion, Video, Evaluacion, Certificado, ProgresoCapacitacion, Auditoria, AccionCorrectiva, Denuncia, Notificacion, ConfiguracionSistema, LogActividad.

**10 enums:** UserRole, NivelTaller, EstadoPedido, EstadoOrdenManufactura, EstadoEscrow, EstadoValidacion, TipoAuditoria, EstadoAuditoria, EstadoDenuncia, CanalNotificacion, EstadoAccionCorrectiva.

### Gaps identificados

| Gap | Prio | Descripcion |
|-----|------|-------------|
| VerificationToken sin campo `type` | P1 | No puede distinguir reset password vs verify email |
| Auditoria.inspectorId sin FK | P2 | String suelto, no relation a User. Sin integridad referencial |
| Pedido.tipoPrenda es String | P2 | No es FK a TipoPrenda. Denormalizado |
| OrdenManufactura.proceso es String | P2 | No es FK a ProcesoProductivo. Denormalizado |
| TipoDocumento sin relacion a Validacion | P2 | Catalogo desconectado de los registros |
| Modelo FAQ | P3 | No existe. Necesita: pregunta, respuesta, categoria, orden, activo |
| Modelo NotaInterna | P3 | Para notas admin en talleres/marcas |
| Modelo IntentoEvaluacion | P2 | Tracking multiples intentos quiz por taller por coleccion |
| Modelo CampanaNotificacion | P3 | Tracking envio masivo (sent/delivered/opened/clicked) |
| Relacion MarcaTallerFavorito | P3 | M:M para favoritos |
| Modelo ESTADO profile | P3 | TALLER tiene Taller, MARCA tiene Marca, ESTADO no tiene perfil |
| Modelo Mensaje/Chat | P3 | Comunicacion marca-taller mencionada en flujos |

---

## 6. UX Y FRONTEND

### 6.1 Componentes UI existentes (13)

badge, button, card, input, select, modal, data-table, progress-ring, stat-card, checklist-item, info-card, file-upload, search-input.

**file-upload:** Drag-and-drop con validacion tamano. Existe pero NO se usa en ninguna pagina (formalizacion no lo integra).

**search-input:** Debounced search. Existe pero las paginas usan inputs nativos + form method="get" en su lugar.

### 6.2 Estado UX

| Item | Estado | Prio | Descripcion actual |
|------|--------|------|-------------------|
| Header tabs dinamicos | OK | — | usePathname() detecta tab activo por ruta |
| Menu mobile hamburger | OK | — | Funciona en header, verificar todos los roles |
| Layout taller activeTab | BUG | P1 | taller/layout.tsx pasa `activeTab="tablero"` hardcodeado al Header. El Header lo ignora y usa pathname, pero el prop es un dead code que confunde |
| Empty states | PARCIAL | P2 | Marca pedidos, taller pedidos y aprender tienen empty states. Otros no |
| Loading states | PARCIAL | P2 | Solo existe loading.tsx root. No hay loading.tsx en (taller), (marca), (admin), (estado), (auth), (public) |
| Error boundaries | PARCIAL | P2 | Solo error.tsx root. Un error en /admin/integraciones/arca crashea todo el admin |
| Toast/feedback | FALTA | P2 | Ningun form da feedback visual despues de guardar. marca/perfil guarda silenciosamente |
| Tables responsive | PARCIAL | P2 | DataTable tiene overflow-x-auto. Tablas manuales (logs) necesitan revision |
| Fonts next/font/google | PARCIAL | P2 | Verificar que Overpass y Noto Sans cargan via next/font, no via link externo |
| Wizard progress bar | FALTA | P1 | El wizard /taller/perfil/completar no tiene indicador visual de pasos (barra superior) |
| Comparacion social | FALTA | P3 | Dashboard "vs promedio talleres similares" requiere query agregada |
| lib/utils.ts | MINIMO | P2 | Solo 3 funciones (cn, formatPercent, formatFraction). Faltan: formatDate, formatCurrency, etc. |

---

## 7. TESTING

No existe ningun test en el proyecto. No hay directorio __tests__, no hay archivos .test.ts, no hay configuracion de Jest/Vitest/Playwright.

| Item | Prio | Notas |
|------|------|-------|
| Setup test framework (Vitest) | P2 | Configurar vitest + test utils |
| Unit: motor calculo nivel | P2 | BRONCE/PLATA/ORO |
| Unit: scoring reputacion | P2 | Formula ponderada |
| Unit: generacion codigo certificado | P2 | Formato + unicidad |
| API: rutas auth (login, registro, reset) | P2 | Happy path + errores |
| API: rutas CRUD (pedidos, talleres, validaciones) | P2 | Auth + ownership |
| E2E: registro completo | P2 | 3 pasos + redirect login |
| E2E: crear pedido marca | P2 | Form + redirect + lista |
| E2E: flujo certificacion | P2 | Videos → quiz → cert → verificar QR |
| E2E: admin aprueba documento | P2 | Upload → review → approve → nivel recalculado |
| Accesibilidad WCAG 2.1 AA | P3 | Paginas publicas: verificar, directorio, perfil |
| Performance Lighthouse | P3 | Target: >80 en dashboards y directorio |

---

## 8. DEPLOY E INFRAESTRUCTURA

**GitHub repo** — OK. github.com/sergiandat/textil.

**Vercel deploy** — OK. pdt-nine.vercel.app. Build OK.

**Supabase PostgreSQL** — OK. sa-east-1. Schema en sync (prisma db push).

**Env vars basicas** — OK. DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL configuradas en Vercel.

**Env vars integraciones** — FALTA — P1. Cuando se implementen: SENDGRID_API_KEY, EMAIL_FROM, ARCA_CUIT, ARCA_TOKEN, ARCA_CERT (base64), WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, OPENAI_API_KEY, GOOGLE_MAPS_API_KEY.

**File storage** — FALTA — P1. No hay mecanismo de upload de archivos. Documentos de formalizacion, fotos auditoria, portfolio taller necesitan storage. Opciones: Vercel Blob, Supabase Storage, S3.

**Prisma migrate en build** — PARCIAL — P1. Actualmente se usa `prisma db push`. Para produccion deberia ser `prisma migrate deploy` en build command.

**Cron jobs** — FALTA — P2. Alertas de vencimiento documentos (cada 24h). Opciones: Vercel Cron (vercel.json) o Supabase Edge Functions.

**Dominio custom** — FALTA — P2. plataformatextil.ar necesita configurarse en Vercel.

**next/image remotePatterns** — FALTA — P2. Para fotos de talleres y portfolio. Configurar dominios permitidos.

**Backups** — PARCIAL — P3. Supabase ofrece PITR en plan Pro. La UI admin/database/backups es mock.

**Middleware < 1MB** — OK. auth.config.ts separado de Prisma/bcrypt.

---

## RESUMEN GENERAL (actualizado 2026-02-25)

| Categoria | OK | PARCIAL | STUB | FALTA |
|-----------|-----|---------|------|-------|
| 1. Pantallas (70) | 21 | 9 | 20 | 20 |
| 2. Backend/API (26 rutas + 10 faltantes) | 18 | 4 | 0 | 10 |
| 3. Integraciones (7) | 0 | 1 | 0 | 6 |
| 4. Auth/Seguridad (8) | 5 | 1 | 0 | 2 |
| 5. Schema (12 gaps) | — | 2 | 0 | 10 |
| 6. UX/Frontend (12) | 2 | 5 | 0 | 5 |
| 7. Testing (12) | 0 | 0 | 0 | 12 |
| 8. Deploy/Infra (11) | 5 | 2 | 0 | 4 |

**Problemas criticos (P0):** ~~7 endpoints sin auth~~ → RESUELTO en Sprint 1. Queda pendiente: notificaciones userId no validado (P1).

---

## SPRINTS SUGERIDOS

### Sprint 1 — Seguridad + Flujos criticos — ✅ COMPLETADO (2026-02-25)
1. ~~Corregir auth en APIs expuestas (auditorias, validaciones, denuncias, certificados POST, ordenes)~~ ✅
2. ~~Agregar ownership checks en PUT (talleres, marcas, pedidos, validaciones)~~ ✅
3. ~~Password reset completo (API + lib/email.ts + pagina /restablecer/[token])~~ ✅
4. ~~Wizard perfil taller: conectar submit a API~~ ✅ (guarda via PUT /api/talleres/[id])
5. ~~Formalizacion: integrar file-upload + Supabase Storage~~ ✅
6. ~~Admin detalle taller: cargar datos reales + aprobar/rechazar documentos (Server Actions)~~ ✅
7. ~~Motor calculo nivel BRONCE/PLATA/ORO (lib/nivel.ts)~~ ✅
8. ~~Fix middleware: landing page / accesible sin auth~~ ✅

### Sprint 2 — Integraciones core (SIGUIENTE)
1. SendGrid: ampliar lib/email.ts con templates (bienvenida, doc aprobado/rechazado, certificado, vencimiento)
2. ARCA: lib/arca.ts + verificacion CUIT en registro
3. QR: lib/qr.ts + generacion certificados
4. ~~Academia detalle: reescribir con datos Prisma reales + progreso + evaluacion~~ ✅ (ya hecho)
5. ~~Verificar certificado: consumir ?code= URL param + mostrar QR~~ ✅ (ya hecho)
6. Dashboard taller con datos reales (pedidos recientes, alertas, progreso)
7. Notificaciones: fix userId validation contra session

### Sprint 3 — Admin funcional
1. ~~Admin talleres/[id]: cargar datos reales + aprobar/rechazar~~ ✅ (ya hecho)
2. ~~Admin colecciones/[id]: pre-cargar datos existentes~~ ✅ (ya hecho)
3. ~~Admin evaluaciones: conectar a BD~~ ✅ (ya hecho)
4. Admin marcas/[id]: cargar datos reales (actualmente mock)
5. Admin procesos + documentos: conectar a BD
6. Admin reportes con datos reales + export PDF/Excel
7. Logging actividad en mutaciones API
8. Estado exportar con generacion real

### Sprint 4 — Polish + Testing
1. Loading states por seccion
2. Error boundaries por seccion
3. Toast feedback post-acciones
4. Setup Vitest + tests unitarios logica negocio
5. E2E flujos criticos (Playwright)
6. WhatsApp integration
7. Performance + accesibilidad

### Sprint 5 — Nice to have
1. LLM chatbot en academia
2. Google Maps en perfil
3. Tour onboarding
4. Sub-roles admin
5. Database explorer real
6. Cron alertas vencimiento
7. Dominio custom

---

Docs de referencia:
- `mvp_2/PANTALLAS_MVP.md` — 70 wireframes con specs detalladas
- `textil/NAVEGACION_POR_BARRERAS.md` — Flujos por rol (B1-B7)
- `mvp_2/DESIGN_SYSTEM.md` — Tokens, tipografia, colores
- `CLAUDE.md` — Convenciones del proyecto
