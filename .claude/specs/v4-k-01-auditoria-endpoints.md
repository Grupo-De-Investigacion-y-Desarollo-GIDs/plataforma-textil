# K-01 — Auditoría completa de endpoints

> **Tipo:** Auditoría (cero cambios de código). Insumo directo de **K-02** (test pattern de auth: matriz 401/403/200) y **K-05** (select explícito).
> **Fecha:** 2026-06-11 · **Rama:** `develop` · **Refs:** MASTER_V4 Bloque K, spec 19.
> **Método:** inventario por filesystem (App Router = fuente de verdad) + lectura del código real de cada `route.ts` (no por nombre ni por analogía). El middleware **excluye `/api`** (discovery B-05), por lo que **ninguna ruta está protegida por middleware** — cada `route.ts` se defiende sola, y así se clasificó.

---

## 1. Resumen ejecutivo

| Métrica | Valor |
|---|---|
| Archivos `route.ts` inventariados | **86** |
| Server actions (`"use server"`) | **0** (todas las mutaciones pasan por `/api`) |
| Páginas con mutación directa fuera de `/api` | 0 (las páginas públicas leen Prisma server-side; no mutan) |
| Combinaciones endpoint × método clasificadas | **~112** |
| 🔴 CRÍTICOS | **4** |
| 🟡 MEJORABLES | **~56** |
| 🟢 OK | **~52** |

*(El conteo de 🟡/🟢 es a granularidad endpoint×método, agrupando métodos con clasificación idéntica en una fila. Los 4 críticos están verificados leyendo el archivo línea por línea.)*

### Hallazgos que requieren acción inmediata (🔴)

> **ESTADO (2026-06-11):** C1/C2/C3 **RESUELTOS** en el hotfix quirúrgico **#414** (squash `0758fad`, mergeado a develop). C4 y los 🟡 quedan como plan ordenado del bloque K (K-02 + K-05 + barrido de rate-limit). Ver §3 para el detalle de cada fix.

| # | Endpoint | Problema | Anónimo explotable | Severidad | Estado |
|---|---|---|---|---|---|
| C1 | `GET /api/marcas/[id]` | Sin auth. Devuelve **PII** (email, teléfono, CUIT, pedidos) de cualquier marca por ID | **Sí** | Alta | ✅ RESUELTO (#414) |
| C2 | `GET /api/talleres/[id]` | Sin auth. Devuelve **PII** (email, teléfono, nombre del dueño) de cualquier taller por ID | **Sí** | Alta | ✅ RESUELTO (#414) |
| C3 | `GET /api/colecciones/[id]` | Sin auth. `include: { evaluacion: true }` filtra el **answer-key** (`preguntas[].correcta`) de las evaluaciones | **Sí** | Alta (integridad de certificación) | ✅ RESUELTO (#414) |
| C4 | `GET /api/exportar` | Auth ADMIN/ESTADO OK, pero **sin rate-limit** y export de PII masiva (email/teléfono/CUIT de todo el padrón). Inconsistente con su gemelo `/api/estado/exportar` que sí limita | No (requiere rol) | Media (insider / cuenta comprometida) | ⏳ Plan bloque K |

**Mitigante clave para C1/C2/C3 (verificado en el hotfix):** las páginas públicas (`(public)/perfil/[id]`, `(public)/directorio`, `(public)/perfil-marca/[id]`) **consultan Prisma directamente server-side**, NO a través de estos endpoints. Además, al re-verificar callers se confirmó que **los GET de C1 y C2 no tienen ningún caller de `fetch`** (solo se usa el PUT de cada recurso — ver §6 "código muerto") y que el único caller del GET de C3 (panel CONTENIDO) no lee `evaluacion`. → cerrarlos con auth no rompió ninguna funcionalidad.

---

## 2. Matriz completa

Leyenda — Auth: `RRA`=`requiereRolApi`, `auth()`=chequeo manual de sesión, `NONE`=sin auth. Rol: membresía (`tieneAlgunRol` sobre `roles[]`) salvo donde diga "modo activo". Owner: ✅ verifica pertenencia / N/A / ❌ IDOR.

### 2.1 Admin

| Endpoint | Métodos | Auth | Rol | Owner | Input | Datos / select | RL | Clasif |
|---|---|---|---|---|---|---|---|---|
| `/api/admin/config` | GET, PUT | RRA | ADMIN | N/A | raw (sin zod) | full ConfigSistema (k/v, posible secreto) | no | 🟡 |
| `/api/admin/configuracion-upload/[id]` | PUT | RRA | ADMIN | N/A | manual | full (config) | no | 🟢 |
| `/api/admin/configuracion-upload` | GET | RRA | ADMIN | N/A | — | full (config) | no | 🟢 |
| `/api/admin/logs` | GET | RRA | ADMIN, ESTADO | N/A | fechas raw | email+role actores + `detalles` JSON crudo (CSV) | no | 🟡 |
| `/api/admin/mensajes-individuales` | POST | RRA | ADMIN, ESTADO | parcial | zod | select acotado | sí (inline) | 🟢 |
| `/api/admin/notas-seguimiento` | GET, POST | RRA | ADMIN, ESTADO | N/A | zod (POST) | include acotado | no | 🟢 |
| `/api/admin/notas` | GET, POST | RRA | ADMIN | trust IDs | manual | full NotaInterna | no | 🟡 |
| `/api/admin/notificaciones` | POST | RRA | ADMIN | N/A | manual | `tipo`/`canal` raw; dispara mail/WA masivo | no | 🟡 |
| `/api/admin/observaciones/[id]` | GET | RRA | ADMIN, ESTADO | N/A | — | expone `user.email` del observado | no | 🟡 |
| `/api/admin/observaciones/[id]` | PATCH, DELETE | RRA | ADMIN, ESTADO | ✅ autor/ADMIN | zod | select {id,name} | no | 🟢 |
| `/api/admin/observaciones` | GET | RRA | ADMIN, ESTADO | N/A | clamp | expone emails en listado | no | 🟡 |
| `/api/admin/observaciones` | POST | RRA | ADMIN, ESTADO | trust userId | zod | select {id,name} | no | 🟢 |
| `/api/admin/onboarding/reenviar-invitacion` | POST | RRA+auth() | ADMIN, ESTADO | lookup id | zod | select acotado | no | 🟢 |
| `/api/admin/rag/[id]` | DELETE | RRA | ADMIN, CONTENIDO | sin findUnique | — | {ok} | no | 🟡 |
| `/api/admin/rag` | GET, POST | RRA | ADMIN, CONTENIDO | N/A | zod (POST) | select excl. embedding | no | 🟢 |
| `/api/admin/reporte-mensual` | GET | RRA | ADMIN, ESTADO | N/A | regex mes | XLSX agregados | no | 🟢 |
| `/api/admin/reporte-piloto` | GET | RRA | ADMIN, ESTADO | N/A | fechas raw | XLSX con CUIT+email (a ADMIN/ESTADO) | no | 🟡 |
| `/api/admin/stats` | GET | RRA | ADMIN | N/A | — | counts | no | 🟢 |
| `/api/admin/usuarios-buscar` | GET | RRA | ADMIN, ESTADO | N/A | q.len≥2 | select {id,name,email,role} | no | 🟡 |
| `/api/admin/usuarios/[id]` | GET, DELETE | RRA | ADMIN | N/A | — | select acotado; DELETE soft | no | 🟢 |
| `/api/admin/usuarios/[id]` | PUT | RRA | ADMIN | N/A | raw (`role` sin enum) | select acotado | no | 🟡 |
| `/api/admin/usuarios` | GET | RRA | ADMIN | N/A | parseInt | select {id,email,name,role,active,phone} | no | 🟢 |
| `/api/admin/usuarios` | POST | RRA | ADMIN | N/A | raw (sin zod) | hashea pass; select acotado | no | 🟡 |
| `/api/admin/whatsapp` | GET | RRA | ADMIN, ESTADO | N/A | — | select con **phone** | no | 🟡 |
| `/api/admin/whatsapp` | PUT | RRA | ADMIN, ESTADO | valida id | manual | {ok} | no | 🟢 |

### 2.2 Auth / cuenta

| Endpoint | Métodos | Auth | Rol | Owner | Input | Datos / select | RL | Clasif |
|---|---|---|---|---|---|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth + wrapper | — | N/A | NextAuth | sesión | **sí** `login`+`magicLink` (IP) | 🟢 |
| `/api/auth/mi-cuenta` | GET | auth() | self | ✅ | — | select propio | no | 🟢 |
| `/api/auth/mi-cuenta` | PUT | auth() | self | ✅ | manual | select acotado | **no** | 🟡 |
| `/api/auth/password-reset` | POST | NONE (público) | — | N/A | manual | {ok} (anti-enum) | **no** | 🟡 |
| `/api/auth/password-reset/[token]` | POST | NONE (token) | — | token=cred | manual | {ok} | **no** | 🟡 |
| `/api/auth/registro` | POST | NONE (público) | — | N/A | zod | select {id,email,name,role} | **sí** `registro` | 🟢 |
| `/api/auth/registro/completar` | POST | auth() | self | ✅ | zod | {ok} | **no** | 🟡 |
| `/api/auth/verificar-cuit` | GET | NONE (público) | — | N/A | len 11 | razónSocial+domicilio AFIP | **sí** `verificarCuit` | 🟡 |
| `/api/auth/verificar-email` | GET | NONE (público) | — | N/A | manual | `{disponible}` | **sí** `verificarEmail` | 🟡 |
| `/api/cuenta` | PUT | auth() | self | ✅ | manual | {ok} | no | 🟢 |
| `/api/usuarios/me/active-mode` | PATCH | auth() | self | ✅ | enum | `{activeMode}` (anti-escalada vs DB) | no | 🟢 |
| `/api/usuarios/me/roles` | POST | auth() | self | ✅ | zod | unión explícita (anti-escalada) | no | 🟢 |

### 2.3 Estado

| Endpoint | Métodos | Auth | Rol | Owner | Input | Datos / select | RL | Clasif |
|---|---|---|---|---|---|---|---|---|
| `/api/estado/arca` | GET, POST | RRA | ESTADO, ADMIN | N/A | manual | counts / resultados | no | 🟢 |
| `/api/estado/arca/reverificar/[id]` | POST | RRA | ESTADO, ADMIN | N/A | raw id | select acotado | no | 🟢 |
| `/api/estado/configuracion-niveles` | GET | RRA | ESTADO, ADMIN | N/A | — | full reglaNivel | no | 🟡 |
| `/api/estado/configuracion-niveles/[id]` | PUT | RRA | **ESTADO (sin ADMIN)** | N/A | manual | full regla | no | 🟡 |
| `/api/estado/configuracion-niveles/preview` | POST | RRA | **ESTADO (sin ADMIN)** | N/A | raw | detalle cambios | no | 🟡 |
| `/api/estado/demanda-insatisfecha` | GET | RRA | ESTADO, ADMIN | N/A | fechas raw | agregados | no | 🟢 |
| `/api/estado/demanda-insatisfecha/detalle` | GET | RRA | ESTADO, ADMIN | N/A | whitelist+fechas raw | agregados | no | 🟡 |
| `/api/estado/exportar` | GET | RRA | ESTADO, ADMIN | N/A | whitelist | export sistema | **sí** `exportar` | 🟢 |

### 2.4 Pedidos / cotizaciones / órdenes

| Endpoint | Métodos | Auth | Rol | Owner | Input | Datos / select | RL | Clasif |
|---|---|---|---|---|---|---|---|---|
| `/api/pedidos` | GET, POST | RRA | GET ADMIN/MARCA; POST MARCA | ✅ scope marca | manual | include marca {id,nombre} | **sí** `pedidos` (POST) | 🟢 |
| `/api/pedidos/[id]` | GET, PUT | auth() | modoActivo: ADMIN/dueño/(GET taller asignado) | ✅ | manual | GET strippea userId; PUT full pedido | no | 🟡 |
| `/api/pedidos/[id]/ordenes` | GET | auth() | ADMIN/dueño marca | ✅ `checkPedidoAccess` | — | include taller {id,nombre} | no | 🟢 |
| `/api/pedidos/[id]/invitaciones` | POST | auth() | ADMIN/dueño marca | ✅ + estado BORRADOR + anti-incesto | manual | — | **no** | 🟡 |
| `/api/cotizaciones` | GET | RRA | TALLER/MARCA/ADMIN (modo activo) | ✅ scope | manual | select acotado | no | 🟢 |
| `/api/cotizaciones` | POST | RRA | TALLER (modo activo) | ✅ no auto-cotiza | zod | full cotizacion | **sí** `cotizaciones` | 🟢 |
| `/api/cotizaciones/[id]` | PUT | auth() | ADMIN/owner por acción | ✅ | raw (`accion`) | {ok} | **no** | 🟡 |
| `/api/ordenes/[id]` | PUT | RRA | ADMIN/TALLER (modo activo) | ✅ `taller.userId` | manual | full orden | no | 🟡 |

### 2.5 Talleres / marcas / validaciones

| Endpoint | Métodos | Auth | Rol | Owner | Input | Datos / select | RL | Clasif |
|---|---|---|---|---|---|---|---|---|
| `/api/talleres` | GET | RRA | ADMIN/ESTADO/MARCA | scope `verificadoAfip` | manual | MARCA: full taller (escalares implícitos); ADMIN/ESTADO: +PII user | no | 🟡 |
| `/api/talleres/me` | GET | auth() | self (su taller) | ✅ implícito | — | full taller propio | no | 🟢 |
| `/api/talleres/[id]` | GET | ~~NONE~~ → auth() | dueño/ADMIN/ESTADO | ✅ `taller.userId` | — | full taller + user PII (ya gated) | no | ✅ C2 (#414) |
| `/api/talleres/[id]` | PUT | auth() | modoActivo dueño/ADMIN | ✅ | whitelist campos | re-fetch acotado | no | 🟢 |
| `/api/marcas` | GET | RRA | ADMIN | N/A | clamp | full marca + user PII | no | 🟡 |
| `/api/marcas/[id]` | GET | ~~NONE~~ → auth() | dueño/ADMIN/ESTADO | ✅ `marca.userId` | — | marca + user PII + pedidos (select explícito, gated) | no | ✅ C1 (#414) |
| `/api/marcas/[id]` | PUT | auth() | dueño/ADMIN | ✅ `existing.userId` | raw | full marca | no | 🟡 |
| `/api/validaciones` | GET | RRA | ADMIN, ESTADO | N/A | manual | include taller {id,nombre} | no | 🟢 |
| `/api/validaciones` | POST | RRA | ADMIN | N/A | raw (tallerId sin validar) | full | no | 🟡 |
| `/api/validaciones/[id]` | PUT | auth() | ESTADO u owner | ✅ `taller.userId` | raw (mass-assign parcial) | full Validacion | no | 🟡 |
| `/api/validaciones/[id]/signed-url` | GET | auth() | ADMIN/ESTADO u owner | ✅ | — | `{url}` (signed 1h; fallback público) | **no** | 🟡 |
| `/api/validaciones/[id]/upload` | POST | auth() | owner | ✅ estricto | `validarArchivo` | full | **sí** `upload` | 🟢 |

### 2.6 Contenido / academia / catálogos

| Endpoint | Métodos | Auth | Rol | Owner | Input | Datos / select | RL | Clasif |
|---|---|---|---|---|---|---|---|---|
| `/api/colecciones` | GET | NONE (público) | — | N/A | parseInt sin guard | full coleccion + _count | no | 🟡 |
| `/api/colecciones` | POST | RRA | ADMIN, CONTENIDO | N/A | manual | full | no | 🟢 |
| `/api/colecciones/[id]` | GET | ~~NONE~~ → RRA | ADMIN, CONTENIDO | N/A | — | coleccion + videos (evaluacion removido) | no | ✅ C3 (#414) |
| `/api/colecciones/[id]` | PUT, DELETE | RRA | ADMIN, CONTENIDO | N/A | raw (PUT) | full | no | 🟢 |
| `/api/colecciones/[id]/upload` | POST | RRA | ADMIN, CONTENIDO | N/A | MIME+5MB | `{url}` | no | 🟢 |
| `/api/colecciones/[id]/videos` | POST, DELETE | RRA | ADMIN, CONTENIDO | ✅ scope coleccionId | manual | full video | no | 🟢 |
| `/api/colecciones/[id]/evaluacion` | GET, PUT | RRA | ADMIN, CONTENIDO | N/A | raw | evaluacion + `preguntas` | no | 🟡 |
| `/api/colecciones/[id]/evaluacion` | POST | RRA | TALLER | ✅ taller del userId | raw | corrección server-side | no | 🟢 |
| `/api/colecciones/[id]/progreso` | POST | RRA | TALLER | ✅ + cuenta videos server-side | clamp | progreso propio | no | 🟢 |
| `/api/contenido/novedades` | GET | RRA | CONTENIDO, ADMIN | N/A | — | full novedad | no | 🟡 |
| `/api/contenido/novedades` | POST | RRA | CONTENIDO, ADMIN | N/A | manual (valida) | full | no | 🟢 |
| `/api/contenido/novedades/[id]` | PATCH | RRA | CONTENIDO, ADMIN | N/A | raw (sin validar) | full | no | 🟡 |
| `/api/contenido/novedades/[id]` | DELETE | RRA | CONTENIDO, ADMIN | N/A | — | {ok} | no | 🟢 |
| `/api/contenido/novedades/upload` | POST | RRA | CONTENIDO, ADMIN | N/A | MIME+size | `{url}` | **no** | 🟡 |
| `/api/certificados` | GET, PATCH, POST | RRA | GET ADMIN/ESTADO; PATCH/POST ADMIN | N/A | raw | include acotado | no | 🟡 |
| `/api/certificados/[id]` | GET | NONE (verif. pública) | — | N/A | param | full certificado (pdfUrl, qrCode) | no | 🟡 |
| `/api/catalogos` | GET | NONE | — | N/A | — | full proceso/prenda | no | 🟡 |
| `/api/procesos` | GET, POST, PUT | GET auth(); POST/PUT RRA | GET logueado; POST/PUT ADMIN | N/A | manual | full proceso + _count | no | 🟢 |
| `/api/tipos-documento` | GET | auth() | logueado (sin rol) | N/A | — | full TipoDocumento | no | 🟡 |
| `/api/tipos-documento` | POST, PUT | RRA | ESTADO | N/A | manual | full | no | 🟡 |
| `/api/auditorias` | GET, POST | RRA | ADMIN, ESTADO | N/A | raw (POST) | full auditoria + include | no | 🟡 |
| `/api/auditorias/[id]` | GET, PUT | RRA | ADMIN, ESTADO | N/A | raw (PUT) | full auditoria | no | 🟡 |

### 2.7 Público / utilitario / denuncias

| Endpoint | Métodos | Auth | Rol | Owner | Input | Datos / select | RL | Clasif |
|---|---|---|---|---|---|---|---|---|
| `/api/denuncias` | POST | NONE (anónimo) | — | N/A | raw | full | **sí** `denuncias` | 🟡 |
| `/api/denuncias` | GET | RRA | ADMIN, ESTADO | N/A | parseInt | full denuncia (descripcion, evidencia) | no | 🟡 |
| `/api/denuncias/[codigo]` | GET | NONE (tracking anónimo) | — | N/A (código opaco) | manual | select acotado {codigo,tipo,estado,...} | no | 🟢 |
| `/api/exportar` | GET | RRA | ADMIN, ESTADO | N/A | `tipo` sin whitelist estricta | **CSV con email/phone/CUIT** | **no** | **🔴 C4** (plan K) |
| `/api/novedades` | GET | NONE (público) | — | N/A | clamp 1-20 | select explícito, sin PII | no | 🟢 |
| `/api/notificaciones` | GET | auth() | logueado | ✅ where userId | parseInt sin clamp | propias | no | 🟡 |
| `/api/notificaciones` | PUT | auth() | logueado | ✅ verifica userId | manual | propia | no | 🟢 |
| `/api/feedback` | POST | auth() opcional | rol del body (auditores) | N/A | manual len≥10 | crea issue GitHub | **sí** `feedback` | 🟡 |
| `/api/feedback/all-qa-v3` | GET | NONE (público) | — | N/A | — | agregados QA (sin token) | no | 🟢 |
| `/api/feedback/by-qa/[qaSlug]` | GET | NONE (público) | — | N/A | urlencode→label | issues GitHub (SSRF acotado a repo fijo) | no | 🟡 |
| `/api/health/version` | GET | NONE (público) | — | N/A | — | sha/env build | no | 🟢 |
| `/api/log-error` | POST | auth() opcional | — | N/A | raw | escribe a log | **no** | 🟡 |
| `/api/qr/[code]` | GET | NONE (público) | — | N/A | code trim | PNG (no consulta DB) | no | 🟢 |
| `/api/stats/public` | GET | NONE (público) | — | N/A | — | counts agregados | no | 🟢 |
| `/api/upload/imagenes` | POST | auth() | logueado | ✅ taller/marca/pedido; **❌ cotizacion laxo** | `validarArchivo` (magic bytes) | `{url}` | **sí** `upload` | 🟡 |
| `/api/test-utils/reset-seed-state` | POST | doble guard | allowlist cerrado | N/A | key vs allowlist | {ok,user} | guard equiv. | 🟢 |
| `/api/chat` | POST | auth() | membresía (ADMIN/ESTADO saltan RL) | N/A | zod | `{respuesta,fuentes}` | **sí** `chat` | 🟢 |

---

## 3. 🔴 Críticos — detalle, explotación y fix propuesto (sin implementar)

### C1 — `GET /api/marcas/[id]` expone PII sin autenticación (IDOR + PII leak)
- **Archivo:** `src/app/api/marcas/[id]/route.ts:6-27`.
- **Qué expone:** el handler GET no llama a `auth()` ni `requiereRolApi`. Devuelve `findUnique` con el objeto **Marca completo** (incluye `cuit`, `ubicacion`, `website`, `volumenMensual`, `frecuenciaCompra`) + `user: { email, name, phone, avatar }` + lista de `pedidos`.
- **Escenario concreto:** un atacante anónimo itera/adivina IDs de marca (`curl https://.../api/marcas/<id>`) y cosecha email + teléfono + CUIT de todas las marcas → padrón comercial completo con datos de contacto para phishing/scraping.
- **Mitigante:** consumido solo por `src/marca/componentes/contactar-taller.tsx:55`, y ese caller usa **PUT**, no GET → el GET no tenía ningún caller (ver §6 "código muerto"). Las páginas públicas usan Prisma directo.
- **✅ RESUELTO (#414, `0758fad`, 2026-06-11):** se agregó `auth()` + gate dueño-o-`ADMIN`/`ESTADO` (mismo modelo que el PUT del archivo) + `select` explícito. Test de regresión `src/__tests__/k-01-criticos.test.ts` (401/403/200 + no-leak).

### C2 — `GET /api/talleres/[id]` expone PII sin autenticación
- **Archivo:** `src/app/api/talleres/[id]/route.ts:7-32`.
- **Qué expone:** sin auth. `include: { user: { select: { email, phone, name } }, ... }` + objeto taller completo, maquinaria, certificaciones, validaciones.
- **Escenario concreto:** anónimo enumera IDs de taller y cosecha email + teléfono + nombre del dueño de cada taller (los IDs son visibles desde el directorio público).
- **Mitigante:** los 4 callers (`taller/perfil/completar`, `editar-form`, `portfolio-manager` ×2) usan **PUT**, no GET → el GET no tenía ningún caller (ver §6 "código muerto"). La página pública `(public)/perfil/[id]` lee Prisma directo.
- **✅ RESUELTO (#414, `0758fad`, 2026-06-11):** se agregó `auth()` + gate dueño-o-`ADMIN`/`ESTADO` (mismo modelo que el PUT del archivo). El `user` ya estaba en `select` explícito; ahora queda detrás del gate. Test de regresión incluido.

### C3 — `GET /api/colecciones/[id]` filtra el answer-key de las evaluaciones (sin auth)
- **Archivo:** `src/app/api/colecciones/[id]/route.ts:6-26` (`include: { evaluacion: true }`).
- **Qué expone:** el modelo `Evaluacion.preguntas` (Json) almacena el índice de la opción correcta — confirmado por el corrector en `colecciones/[id]/evaluacion/route.ts:94` (`preguntas as Array<{ correcta: number }>`). El GET es anónimo y serializa `evaluacion` completa.
- **Escenario concreto:** un TALLER (o cualquier anónimo) hace `GET /api/colecciones/<id>`, lee `evaluacion.preguntas[].correcta`, y luego `POST .../evaluacion` con 100% → certificado válido que **sube el nivel del taller** (`aplicarNivel`) sin haber visto el curso. Rompe la integridad de toda la academia/certificación.
- **Mitigante:** único caller del GET = panel `(contenido)/colecciones/[id]/page.tsx:47`, que consume solo escalares + `videos` (nunca `evaluacion`). La corrección ocurre server-side (`POST .../evaluacion`: el cliente manda solo `respuestas: number[]`), así que el cliente **nunca necesita** `correcta`.
- **✅ RESUELTO (#414, `0758fad`, 2026-06-11):** gate `requiereRolApi(['ADMIN','CONTENIDO'])` (igual que PUT/DELETE del archivo y su único caller) + se eliminó `evaluacion` del `include`. No hubo que tocar la corrección (ya era server-side). Test verifica que el response no contiene `evaluacion`/`correcta`.

### C4 — `GET /api/exportar` exporta PII sin rate-limit
- **Archivo:** `src/app/api/exportar/route.ts:7-37` (y ramas de marcas/acompañamiento más abajo).
- **Qué expone:** auth `requiereRolApi(['ADMIN','ESTADO'])` presente (línea 9), pero **sin `rateLimit`** y genera CSVs con email + teléfono + CUIT de todo el padrón de talleres/marcas. Además `tipo` no tiene whitelist estricta (un `tipo` desconocido cae a CSV vacío en vez de 400).
- **Escenario concreto:** una cuenta ESTADO/ADMIN comprometida o un insider exfiltra el padrón completo con PII en bucle sin throttling. Su gemelo `/api/estado/exportar` **sí** aplica `rateLimit(req,'exportar',...)`, lo que evidencia la omisión.
- **Severidad menor que C1-C3:** requiere rol (no es anónimo). **Queda para el plan ordenado del bloque K** (barrido de rate-limit), no entró en el hotfix #414.
- **Fix propuesto:** insertar `const rl = await rateLimit(req, 'exportar', getClientIp(req)); if (rl) return rl` tras el chequeo de rol (igual que `estado/exportar/route.ts:14`), y validar `tipo` contra whitelist explícita con 400 ante valores no reconocidos.

---

## 4. 🟡 Mejorables — patrones (insumo K-05 y validación de input)

### 4.1 K-05 — Endpoints SIN `select` explícito (devuelven objeto Prisma completo)
Estos retornan el modelo completo en `findUnique`/`findMany`/`create`/`update`. Riesgo: si el schema gana campos sensibles, se filtran automáticamente. **Lista exacta para K-05:**

1. `/api/admin/config` (GET, PUT) — full ConfigSistema (posibles secretos en `valor`)
2. `/api/admin/logs` (GET) — `detalles` JSON crudo + email actores
3. `/api/admin/notas` (GET, POST) — full NotaInterna
4. `/api/auditorias` (GET, POST) y `/api/auditorias/[id]` (GET, PUT) — full Auditoria
5. `/api/catalogos` (GET) — full ProcesoProductivo / TipoPrenda
6. `/api/certificados/[id]` (GET) — full Certificado (pdfUrl, qrCode, calificacion)
7. `/api/colecciones` (GET) y `/api/colecciones/[id]` (GET) — full Coleccion (+ evaluacion → ver C3)
8. `/api/contenido/novedades` (GET) y `/[id]` (PATCH) — full Novedad
9. `/api/cotizaciones/[id]` (PUT) — devuelve objeto tras mutar
10. `/api/denuncias` (GET) — full Denuncia (descripcion, evidenciaUrl)
11. `/api/estado/configuracion-niveles` (GET) y `/[id]` (PUT) — full ReglaNivel
12. `/api/marcas` (GET) y `/api/marcas/[id]` (GET, PUT) — full Marca + user PII
13. `/api/ordenes/[id]` (PUT) — full Orden
14. `/api/pedidos/[id]` (PUT) — full Pedido
15. `/api/talleres` (GET, rama MARCA — escalares implícitos) y `/api/talleres/[id]` (GET) — full Taller
16. `/api/tipos-documento` (GET, POST, PUT) — full TipoDocumento
17. `/api/validaciones` (POST) y `/api/validaciones/[id]` (PUT) — full Validacion
18. `/api/auth/mi-cuenta`, `/api/admin/usuarios*`, `/api/cotizaciones` (GET) — **ya usan select** (referencia de buen patrón)

### 4.2 Validación de input ausente (raw body sin zod)
PUT/POST que pasan `body.*` directo a Prisma sin schema: `/api/admin/config` PUT, `/api/admin/notas` POST, `/api/admin/notificaciones` POST, `/api/admin/usuarios` POST + `/[id]` PUT, `/api/auditorias` POST + PUT, `/api/certificados` PATCH/POST, `/api/colecciones/[id]/evaluacion` PUT/POST, `/api/contenido/novedades/[id]` PATCH, `/api/cotizaciones/[id]` PUT, `/api/denuncias` POST, `/api/validaciones` POST + `/[id]` PUT, `/api/ordenes/[id]` PUT, `/api/pedidos/[id]` PUT. (Casi todos detrás de auth/rol → riesgo de integridad, no de escalada; excepto `/api/denuncias` POST que es anónimo.)

### 4.3 Mutaciones costosas sin rate-limit
`/api/auth/mi-cuenta` PUT (bcrypt), `/api/auth/password-reset` (+`/[token]`), `/api/auth/registro/completar` (AFIP), `/api/cotizaciones/[id]` PUT, `/api/pedidos/[id]/invitaciones` POST (dispara emails), `/api/contenido/novedades/upload`, `/api/estado/arca` POST (loop O(N) AFIP), `/api/log-error` (anónimo, log-flood), `/api/validaciones/[id]/signed-url`.

### 4.4 PII a rol ESTADO (decisión de negocio a confirmar)
`/api/admin/logs`, `/api/admin/reporte-piloto`, `/api/admin/usuarios-buscar`, `/api/admin/whatsapp`, `/api/admin/observaciones*` exponen email/teléfono/CUIT a usuarios con membresía ESTADO. No es leak anónimo — se marca 🟡 para **confirmar** que ESTADO debe ver PII de contacto.

---

## 5. Insumo para K-02 — Matriz 401/403/200 esperada

Para cada endpoint protegido, el comportamiento esperado por rol que K-02 debe testear sistemáticamente. `401`=anónimo, `403`=logueado sin el rol, `200`=rol correcto.

| Endpoint (método) | Anónimo | TALLER | MARCA | ESTADO | ADMIN | CONTENIDO |
|---|---|---|---|---|---|---|
| `/api/admin/*` (la mayoría) | 401 | 403 | 403 | 403* | 200 | 403 |
| `/api/admin/logs`, `observaciones`, `whatsapp`, `reporte-*`, `usuarios-buscar`, `mensajes`, `notas-seguimiento` | 401 | 403 | 403 | **200** | 200 | 403 |
| `/api/admin/rag*` | 401 | 403 | 403 | 403 | 200 | **200** |
| `/api/estado/*` | 401 | 403 | 403 | 200 | 200 | 403 |
| `/api/estado/configuracion-niveles/[id]` PUT, `/preview` | 401 | 403 | 403 | 200 | **403** ⚠ | 403 |
| `/api/exportar` | 401 | 403 | 403 | 200 | 200 | 403 |
| `/api/pedidos` POST | 401 | 403 | 200 | 403 | 403 | 403 |
| `/api/pedidos` GET | 401 | 403 | 200(scope) | 403 | 200 | 403 |
| `/api/pedidos/[id]` GET/PUT | 401 | 200 si asignado(GET) | 200 si dueño | 403 | 200 | 403 |
| `/api/pedidos/[id]/invitaciones` POST | 401 | 403 | 200 si dueño | 403 | 200 | 403 |
| `/api/cotizaciones` POST | 401 | 200(modo activo) | 403 | 403 | 403 | 403 |
| `/api/cotizaciones` GET | 401 | 200(scope) | 200(scope) | 403 | 200 | 403 |
| `/api/ordenes/[id]` PUT | 401 | 200 si dueño | 403 | 403 | 200 | 403 |
| `/api/colecciones` POST, `/[id]` PUT/DELETE, `/videos`, `/upload` | 401 | 403 | 403 | 403 | 200 | **200** |
| `/api/colecciones/[id]/evaluacion` POST, `/progreso` POST | 401 | 200 | 403 | 403 | 403 | 403 |
| `/api/colecciones/[id]/evaluacion` GET/PUT | 401 | 403 | 403 | 403 | 200 | 200 |
| `/api/contenido/novedades*` (mutación) | 401 | 403 | 403 | 403 | 200 | 200 |
| `/api/validaciones` GET | 401 | 403 | 403 | 200 | 200 | 403 |
| `/api/validaciones` POST | 401 | 403 | 403 | 403 | 200 | 403 |
| `/api/validaciones/[id]` PUT, `/signed-url`, `/upload` | 401 | 200 si owner | 403 | 200(PUT/signed) | 200(signed) | 403 |
| `/api/talleres` GET | 401 | 403 | 200 | 200 | 200 | 403 |
| `/api/marcas` GET | 401 | 403 | 403 | 403 | 200 | 403 |
| `/api/usuarios/me/active-mode`, `/me/roles`, `/api/cuenta`, `/api/notificaciones`, `/api/tipos-documento` GET, `/api/chat` | 401 | 200 | 200 | 200 | 200 | 200 |

*\*ESTADO obtiene 403 en los `/api/admin/*` que solo permiten `['ADMIN']`; 200 en los que permiten `['ADMIN','ESTADO']` (segunda fila).*
*⚠ Inconsistencia detectada: `configuracion-niveles/[id]` PUT y `/preview` excluyen ADMIN (solo `['ESTADO']`), a diferencia del resto de `/api/estado/*`.*

**Endpoints públicos (deben dar 200 sin sesión) — K-02 verifica que NO exijan auth:** `/api/auth/registro`, `/api/auth/verificar-cuit`, `/api/auth/verificar-email`, `/api/auth/password-reset(+/[token])`, `/api/catalogos`, `/api/certificados/[id]`, `/api/denuncias` (POST/`[codigo]`), `/api/novedades`, `/api/stats/public`, `/api/health/version`, `/api/qr/[code]`, `/api/feedback*`, `/api/log-error`, `/api/colecciones` (GET).

**Endpoints que eran públicos pero NO debían (los 🔴 — RESUELTOS en #414):** `/api/marcas/[id]` GET, `/api/talleres/[id]` GET, `/api/colecciones/[id]` GET ahora exigen sesión. K-02 debe codificar el estado correcto: anónimo → **401**, rol sin permiso → **403**, rol correcto → **200** (ya cubierto por `src/__tests__/k-01-criticos.test.ts`, que es el embrión de esa matriz).

### 5.1 Estado K-02 — cobertura del test pattern (`src/__tests__/k-02-auth-matrix.test.ts`)

> **Tanda 1 ✅ MERGEADA (#415, `39159eb`, 2026-06-12, CI verde).** 110 tests sobre 20 endpoints de auth-por-rol. La **tanda 2 (matriz IDOR)** queda pendiente — ver §8 "Plan restante del bloque K".

El helper `authMatrix` (en `src/__tests__/_helpers/auth-matrix.ts`) genera, por endpoint, los casos `anónimo→401 / rol-sin-permiso→403 / rol-ok→2xx`, mockeando `auth()` para ejercitar el gating real (`requiereRolApi → tieneAlgunRol`). Endpoints con ✓ ya están testeados sistemáticamente:

| Endpoint (método) | Roles OK | K-02 |
|---|---|---|
| `/api/admin/stats` GET | ADMIN | ✓ |
| `/api/admin/usuarios` GET | ADMIN | ✓ (no-leak PII) |
| `/api/admin/usuarios-buscar` GET | ADMIN, ESTADO | ✓ |
| `/api/admin/whatsapp` GET | ADMIN, ESTADO | ✓ |
| `/api/admin/rag` GET | ADMIN, CONTENIDO | ✓ |
| `/api/admin/config` GET | ADMIN | ✓ |
| `/api/marcas` GET | ADMIN | ✓ (no-leak PII) |
| `/api/talleres` GET | ADMIN, ESTADO, MARCA | ✓ |
| `/api/validaciones` GET | ADMIN, ESTADO | ✓ |
| `/api/validaciones` POST | ADMIN | ✓ (201) |
| `/api/contenido/novedades` GET | CONTENIDO, ADMIN | ✓ |
| `/api/colecciones/[id]/evaluacion` GET | ADMIN, CONTENIDO | ✓ (no-leak `correcta`) |
| `/api/colecciones/[id]/evaluacion` POST | TALLER | ✓ (gate) |
| `/api/auditorias` GET | ADMIN, ESTADO | ✓ |
| `/api/estado/configuracion-niveles` GET | ESTADO, ADMIN | ✓ |
| `/api/estado/configuracion-niveles/[id]` PUT | **ESTADO (ADMIN→403)** | ✓ ⚠ inconsistencia fotografiada |
| `/api/estado/demanda-insatisfecha` GET | ESTADO, ADMIN | ✓ |
| `/api/exportar` GET | ADMIN, ESTADO | ✓ (no-leak PII; C4 rate-limit sigue pendiente) |
| `/api/marcas/[id]` GET, `/api/talleres/[id]` GET, `/api/colecciones/[id]` GET | (los 🔴) | ✓ vía `k-01-criticos.test.ts` |
| `/api/stats/public` GET, `/api/health/version` GET | público | ✓ (anónimo→200, sin gate) |

**Hallazgo de K-02 tanda 1 (punto 4 del reporte):** ningún test reveló un crítico nuevo. La única discrepancia es la ya documentada en §5/§8.3(b): `configuracion-niveles/[id]` PUT (y `/preview`) excluyen ADMIN (`requiereRolApi(['ESTADO'])`), a diferencia del resto de `/api/estado/*`. El test **fotografía** el comportamiento real (`ADMIN→403`) en vez de corregirlo; cambiar el endpoint es decisión post-promoción.

### 5.2 Estado K-02 tanda 2 — matriz IDOR (`src/__tests__/k-02-idor-matrix.test.ts`)

Helper hermano `ownershipMatrix` (mismo archivo `_helpers/auth-matrix.ts`): para cada recurso, `anónimo→401 / owner→2xx / no-owner mismo-rol→403|404 / transversal→no-403`. El recurso mockeado es el mismo; cambia la identidad de la sesión.

| Endpoint (método) | Owner | Transversal | No-owner | IDOR |
|---|---|---|---|---|
| `/api/pedidos/[id]` GET | marca dueña / taller asignado | ADMIN | 403 | ✓ bloqueado |
| `/api/pedidos/[id]` PUT | marca dueña | ADMIN | 403 | ✓ bloqueado |
| `/api/cotizaciones/[id]` PUT ACEPTAR/RECHAZAR | marca dueña | ADMIN | 403 | ✓ bloqueado |
| `/api/cotizaciones/[id]` PUT RETIRAR | taller dueño | ADMIN | 403 | ✓ bloqueado |
| `/api/ordenes/[id]` PUT | taller asignado | ADMIN | 403 | ✓ bloqueado |
| `/api/validaciones/[id]` PUT | taller dueño | **ESTADO (NO ADMIN)** | 403 | ✓ bloqueado |
| `/api/validaciones/[id]/signed-url` GET | taller dueño | ADMIN, ESTADO | 403 | ✓ bloqueado |
| `/api/validaciones/[id]/upload` POST | taller dueño | **ninguno (owner-only)** | 403 | ✓ bloqueado |
| `/api/pedidos/[id]/invitaciones` POST | marca dueña | ADMIN | 403 | ✓ bloqueado |
| `/api/notificaciones` PUT | dueño de la notif | ninguno | **403 (incl. inexistente)** | ✓ bloqueado |
| `/api/upload/imagenes` POST `portfolio`/`pedido` | ata `entityId` al caller | — | 403 | ✓ bloqueado |
| **`/api/upload/imagenes` POST `cotizacion`** | taller elegible para el pedido | — | **403** | **✅ C5 RESUELTO** |

**Convención 403 vs 404 (fotografiada):** las rutas `[id]` de recurso (pedidos, cotizaciones, ordenes, validaciones, invitaciones) devuelven **404 si no existe** y **403 si existe pero no sos dueño** (revela existencia). `notificaciones` PUT devuelve **403 también para inexistente** (no revela). Inconsistencia menor; no es bug, se documenta.

**Endpoints sin superficie IDOR (self-scoped, verificados):** `/api/colecciones/[id]/progreso` POST, `/api/colecciones/[id]/evaluacion` POST, `/api/auth/mi-cuenta`, `/api/cuenta`, `/api/usuarios/me/*` — el recurso se deriva de la sesión (`findFirst({ userId })`), no de un id del cliente → no hay IDOR posible. La lista `cotizaciones` GET / `pedidos` GET filtran por scope en el `where`, no por `[id]`.

#### ✅ C5 — `POST /api/upload/imagenes` contexto `cotizacion`: IDOR de escritura — RESUELTO
- **Archivo:** `src/app/api/upload/imagenes/route.ts` (rama `cotizacion`).
- **Qué pasaba:** los contextos `portfolio` y `pedido` atan el `entityId` al caller. El contexto **`cotizacion` NO usaba `entityId`** — solo chequeaba `taller.findFirst({ where: { userId } })` ("¿el caller posee algún taller?"). Cualquier TALLER autenticado podía subir un objeto validado (imagen) a la ruta `cotizacion/<entityId-ajeno>/...` de cualquier pedido.
- **Semántica del hallazgo (clave para el fix):** el `entityId` de este contexto es el **`pedidoId`** que el taller está cotizando (ver `src/taller/componentes/cotizar-form.tsx:32`), y la imagen se sube **antes** de crear la cotización. Por eso el gate correcto no es *ownership* de una cotización (no existe aún) sino **elegibilidad para cotizar el pedido**.
- **✅ RESUELTO (diseño A — elegibilidad, decisión de Gerardo, PR (squash SHA al mergear)):** se extrajo el criterio de elegibilidad de `POST /api/cotizaciones` a `elegibilidadCotizar(callerUserId, tallerId, pedidoId)` en `src/compartido/lib/cotizaciones.ts` (pedido existe + no-propio + `PUBLICADO` + invitación si `INVITACION`). `POST /api/cotizaciones` ahora la usa (refactor sin cambio de comportamiento; sus tests `acceso-verificado.test.ts` siguen verdes sin tocarse). La rama `cotizacion` del upload resuelve `entityId` como pedidoId y aplica `elegibilidadCotizar` → no elegible **403**. Es **elegibilidad, no ownership** — el taller no posee el pedido.
- **Test:** `k-02-idor-matrix.test.ts` des-fotografiado: el caso no-elegible pasa de `200` a **403**; se sumó el caso positivo (taller elegible → **200**, flujo legítimo intacto). `cotizaciones-elegibilidad.test.ts` cubre el contrato de la función compartida.

---

## 6. Patrones transversales y sus excepciones

> Las **excepciones** al patrón son donde viven los bugs. Cada 🔴 es la excepción a un patrón sano.

1. **Auth por `requiereRolApi([roles])` (membresía sobre `roles[]`).** 50/86 archivos lo usan. → **Excepciones peligrosas:** las rutas de detalle `[id]` GET (`marcas`, `talleres`, `colecciones`) que omitían el chequeo por completo (C1/C2/C3). El patrón "lista usa RRA pero el detalle GET no" fue la firma de los tres críticos — **ya cerrados en #414**.

2. **Gating por membresía, no por modo activo.** Casi todo usa `tieneAlgunRol(roles[])`. Algunas rutas (cotizaciones, pedidos, ordenes, talleres/[id] PUT) usan `modoActivo`. → Inconsistencia a decidir: ¿acciones elevadas requieren que el rol sea el modo activo, o basta la membresía? Hoy basta membresía en la mayoría.

3. **Ownership derivado de la sesión (anti-IDOR).** Patrón sano consistente: `findFirst({ where: { userId } })` para resolver el taller/marca del caller (cotizaciones, progreso, evaluacion, validaciones/upload, signed-url, pedidos). → **Excepción (ya cerrada, C5):** `/api/upload/imagenes` contexto `cotizacion` no ataba el `entityId` al caller — escritura de objetos bajo cotización ajena. **RESUELTO** gateando por elegibilidad-para-cotizar el pedido (`elegibilidadCotizar`, ver §5.2).

4. **`include` vs `select` explícito.** Las rutas nuevas (novedades GET, denuncias/[codigo], cotizaciones GET, validaciones GET) usan `select` acotado. Las más viejas usan `include`/objeto completo. → La sección §4.1 es la lista de excepciones (insumo K-05). El patrón correcto ya existe en el repo; falta propagarlo.

5. **Rate-limit en endpoints sensibles.** Login, registro, cuit, email, cotizaciones, pedidos, denuncias, chat, upload, exportar(estado) lo tienen. → **Excepciones:** `/api/exportar` (C4), password-reset, mi-cuenta PUT, invitaciones, log-error. Nota: `rateLimit` **falla abierto** si Redis no está configurado (`ratelimit.ts:165`) — confirmar `UPSTASH_*` en prod o el rate-limit es decorativo.

6. **Validación de input con zod.** Presente en mensajes, observaciones, rag, registro, chat, me/roles, cotizaciones POST. → Ausente en la mayoría de mutaciones admin/estado (§4.2). El único caso de **input crudo en endpoint anónimo** es `/api/denuncias` POST (mitigado por rate-limit, pero `codigo` por `count()+1` tiene race).

7. **Guards de test/seed separados a propósito (defensa en profundidad).** `isTestMutationAllowed` ≠ `isCiBypass` (función distinta para que relajar el bypass de rate-limit no ensanche la autorización destructiva). `reset-seed-state` tiene doble guard (404 en prod + token CI) + allowlist cerrado. Patrón ejemplar, sin excepciones.

8. **Código muerto que era superficie de ataque (hallazgo del hotfix #414).** Al re-verificar callers se confirmó que **los GET de `/api/marcas/[id]` y `/api/talleres/[id]` no tienen ningún caller de `fetch`** en el código: solo se usa el **PUT** de cada recurso (contactar-taller usa PUT; los editores de perfil del taller usan PUT). Eran handlers de lectura escritos por simetría con el PUT, nunca consumidos — una superficie anónima de fuga de PII sin función. En #414 quedaron **protegidos** con auth (defensivo, no resta nada operativo). **Decisión diferida a K-05:** si K-05 confirma que siguen sin uso, **eliminar el GET por completo es aún más seguro que mantenerlo protegido** (menos superficie, menos código que auditar). Evaluar en ese momento. (C3 no aplica: su GET sí tiene un caller real, el panel CONTENIDO.)

---

## 7. Casos testigo (control de calidad del método)

Los 5 testigos conocidos fueron encontrados y clasificados correctamente:

1. **`/api/test-utils/reset-seed-state`** → 🟢. Doble guard (`VERCEL_ENV==='production'`→404, luego `isTestMutationAllowed`→404) + allowlist cerrado `{u09, julieta}`; clave desconocida→400. No acepta userId/email arbitrario. (B-04 confirmado.)
2. **`/api/usuarios/me/active-mode` + `/me/roles`** → 🟢. Cookie/modo seteado server-side; anti-escalada leyendo `roles[]` **de la DB** (no de la sesión); `me/roles` restringe con `z.enum(['TALLER','MARCA'])` (imposible pedir ADMIN/ESTADO). (B-05 confirmado.)
3. **`/api/pedidos/[id]/invitaciones`** → 🟡 (guard correcto, falta rate-limit). Estado BORRADOR + anti-incesto (rechaza invitar talleres cuyo dueño es la propia marca) + solo `verificadoAfip`. (Ejercido por e2e u-07/u-08.)
4. **`/api/auth/[...nextauth]`** (magic-link / login) → 🟢. Rate-limit `login` + `magicLink` por IP en el wrapper POST (`route.ts:14,20`); el helper de session-cookie es compartido. (El rate-limit vive en la route, no en `auth.ts`.)
5. **Login / credentials** → 🟢. Rate-limit `login` (5/15m sliding window) confirmado.

---

## 8. Decisiones de Gerardo

1. **Hotfix de C1/C2/C3 — ✅ RESUELTO (#414, `0758fad`, 2026-06-11).** Se cerraron los 3 críticos con auth + select, scope quirúrgico, antes de K-02. La matriz 401/403/200 de K-02 ya parte del estado correcto (test de regresión `src/__tests__/k-01-criticos.test.ts`).
2. **C4 (`/api/exportar` sin rate-limit) — ⏳ plan bloque K.** Queda para el barrido de rate-limit (§4.3): añadir `rateLimit('exportar')` + whitelist de `tipo`.
2bis. **C5 (`/api/upload/imagenes` contexto `cotizacion`, IDOR de escritura) — ✅ RESUELTO (diseño A — elegibilidad, PR (squash SHA al mergear)).** Gate por `elegibilidadCotizar` (fuente única compartida con `POST /api/cotizaciones`). Ver §5.2.
3. **Confirmaciones de negocio (pendientes, no son bugs):** (a) ¿ESTADO debe ver PII de contacto (§4.4)? (b) ¿la exclusión de ADMIN en `configuracion-niveles/[id]`/`preview` es deliberada o un descuido? (c) ¿`CONTENIDO` con permisos de RAG y colecciones es intencional?

> **TODO rastreable (ref §8.3.b + §5.1):** `PUT /api/estado/configuracion-niveles/[id]` y `POST .../preview` excluyen ADMIN (`requiereRolApi(['ESTADO'])`), a diferencia del resto de `/api/estado/*`. El test `src/__tests__/k-02-auth-matrix.test.ts` **fotografía** el comportamiento real (`ADMIN→403`) con comentario que apunta a esta sección. **Si la decisión es incluir ADMIN:** cambiar el endpoint y el test juntos (el test fallará y recordará actualizarlo). Decisión post-promoción.

### Plan restante del bloque K
- **K-02 tanda 1 — ✅ HECHA (#415, `39159eb`, 2026-06-12).** Helper reutilizable `authMatrix` (`src/__tests__/_helpers/auth-matrix.ts`) + 20 endpoints de auth-por-rol cubiertos, 110 tests (ver §5.1). CI verde. Sin cambios de comportamiento.
- **K-02 tanda 2 — ✅ HECHA (matriz IDOR, §5.2).** Helper hermano `ownershipMatrix` + 12 recursos cubiertos. Hallazgo **C5** (`upload/imagenes` contexto `cotizacion`) → **✅ RESUELTO** (diseño A, elegibilidad). El resto de los recursos con ownership bloquean correctamente al no-owner (403).
- **K-05:** `select` explícito en los ~17 endpoints de §4.1. **Reevaluar** ahí si los GET de `/api/marcas/[id]` y `/api/talleres/[id]` (código muerto, §6.8) se eliminan en vez de mantenerse protegidos.
- **Barrido de rate-limit:** C4 (`/api/exportar`) + los faltantes de §4.3.

