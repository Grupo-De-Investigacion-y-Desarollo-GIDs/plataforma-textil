# Circuito CUIT — Spec de implementación (enfoque A+D+B)

> **Estado:** ✅✅ **CIRCUITO CUIT COMPLETO — D + A + B mergeados a develop.**
> **Análisis de origen:** [`v4-circuito-cuit-discovery.md`](./v4-circuito-cuit-discovery.md) — ese doc es el *discovery* (por qué existe el limbo); **éste** es el *cómo se construyó*.
> **Corte de PRs:** **PR-1 = D** ✅ HECHO (squash `02ed22d`, #452) · **PR-2 = A + B** ✅ HECHO (squash `7b49a36`, #453, con QA + re-QA de Sergio: auditoría visible en Historial, botones ARCA renombrados, copy de independencia documental — opción a). Queda **PR-3** (normalización de formato de CUIT, `fix/cuit-normalizacion`) como seguimiento del circuito.
>
> **Nota (QA #453):** la cuenta `csamaniego@ciaindumentaria.com.ar` (MARCA, creada 13-jul en DEV) fue identificada — contacto del sector vía Alan. **La cuenta queda** (no es basura de prueba; la de prueba `srodriguezunq@gmail.com` sí se eliminó con OK de Gerardo).

---

## 0. Contexto (resumen del discovery)

El **limbo** es real: un taller con **CUIT mal tipeado** (o correcto pero registrado con ARCA caído) queda `EN_GRACIA`, `verificadoAfip=false`, y **no tiene HOY ningún camino de salida dentro del producto**. Las tres piezas —**CUIT almacenado**, **`verificadoAfip`**, y **la aprobación documental por COORD**— viven totalmente desacopladas (ver discovery §2). Este spec cierra los **4 huecos** con tres piezas coordinadas:

- **D** — el cron reintenta ARCA antes de inactivar (autocura del CUIT correcto que falló por ARCA caído). **Prioridad 1 de Sergio: "el caso invisible que nadie atiende".**
- **A** — el taller corrige su CUIT y re-verifica (self-service, gated por estado).
- **B** — COORD corrige + re-verifica desde su panel, con comparación lado a lado contra el PDF de la constancia.

A y B comparten **un solo endpoint** con autorización por rol.

---

## 1. INVARIANTES (principios ratificados por Sergio — no negociables)

Toda la implementación DEBE respetar:

1. **ARCA es la fuente de verdad.** `verificadoAfip=true` **SOLO** lo escribe una verificación ARCA exitosa (`consultarPadron` → `exitosa`). **Nunca** un click humano directo, nunca la aprobación de una constancia. Hoy el único write de `verificadoAfip=true` es `sincronizarTaller` (`arca.ts:183`) — **ese debe seguir siendo el único**.
2. **Aprobación documental ↔ verificación ARCA siguen independientes.** Este spec **NO toca** `validaciones/[id]/route.ts` ni `nivel.ts` ni el flujo de constancias. La constancia le da a COORD el CUIT real *como dato para tipear* (Pieza B), no un disparador automático.
3. **El gate comercial no se toca.** Todo lo que cuelga de `verificadoAfip` (directorio, cotizar, banners) queda igual. Solo agregamos **caminos para llegar a `verificadoAfip=true` legítimamente**.
4. **Corregir el CUIT solo si NO está verificado.** Un taller `verificadoAfip=true` **no puede** tocar su CUIT (previene swap de identidad sobre una cuenta ya validada). Gating estricto en A y B.

---

## 2. PIEZA D — Reintento automático de ARCA en el cron (PRIORIDAD 1)

**Qué:** antes de evaluar recordatorio/inactivación, el cron reintenta la verificación ARCA de cada taller `EN_GRACIA` sin verificar. Si ARCA valida en el reintento, `sincronizarTaller` ya reactiva solo (maquinaria existente) y el taller **sale de la gracia sin recibir el email del día 50 ni inactivarse**.

### 2.1 Archivo y punto de inserción

- **`src/app/api/cron/gracia-cuit/route.ts`** — dentro del `for (const taller of talleres)` (`:58`), **ANTES** de `planificarAccionGracia` (`:59`).
- El `findMany` (`:40-51`) ya trae solo `EN_GRACIA`. Agregar `cuit: true` al `select` para decidir la elegibilidad del reintento (tiene CUIT, no verificado) sin un query extra. `sincronizarTaller` re-lee lo suyo internamente.

### 2.2 Orden dentro de la corrida (crítico)

```
para cada taller EN_GRACIA:
  1. ¿elegible para reintento ARCA? (verificadoAfip=false, tiene cuit)
       → sincronizarTaller(taller.id, force=true)
       → si exitosa: datosReactivacion() ya lo puso ACTIVA. CONTINUE (no recordatorio, no inactivar).
  2. planificarAccionGracia sobre el estado actual (lógica actual, intacta)
  3. RECORDATORIO / INACTIVAR (lógica actual, intacta)
```

**Por qué el orden importa:** un taller que valida en el reintento **no debe** recibir el email del día 50 ni inactivarse en la misma corrida. Como `sincronizarTaller` con éxito escribe `estadoCuenta='ACTIVA'` (via `datosReactivacion()`, `gracia.ts:97-102`), el `taller` en memoria queda desactualizado — por eso, tras un reintento exitoso, **`continue`** directo (no re-evaluar). Tras un reintento fallido o no-elegible, seguir con la lógica actual sin cambios.

### 2.3 Política de reintento — **DECIDIDO: DIARIO, sin backoff**

**Decisión de Gerardo:** reintentar **en cada corrida** (diario, el cron ya corre 1×/día por `vercel.json#crons`) a **todos** los talleres `EN_GRACIA` con `verificadoAfip=false` y CUIT. **Sin backoff.**

**Razón:** la población en gracia del piloto es chica → el costo de pegarle a ARCA (`consultarPadron`, AFIP SDK, timeout 10s `arca.ts:104-110`) es trivial. Simplicidad primero: no hay reloj de reintento ni umbral que testear. La ventana es toda la gracia (día 0–60), así un CUIT correcto-por-ARCA-caído sana lo antes posible.

- **No** reusar `verificadoAfipAt` como reloj de reintento (se descartó el backoff): el cron llama `sincronizarTaller(taller.id, force=true)` directo para cada taller elegible, sin gate temporal propio. `force=true` saltea el gate de 30 días interno de `sincronizarTaller` (`arca.ts:170-174`) — que es lo que queremos: reintentar en serio cada día.
- **Elegibilidad** = `verificadoAfip === false && !!taller.cuit`. (El `findMany` ya filtra `EN_GRACIA`; un taller sin CUIT no tiene qué reintentar y `sincronizarTaller` ya devuelve `'Taller sin CUIT'` — igual lo salteamos antes para no gastar la llamada.)

> **Post-piloto:** si la población en gracia crece y el volumen de llamadas ARCA molesta (rate-limit / costo), agregar backoff **entonces** (ej. cada N días por taller, con una marca de "último intento" propia — no `verificadoAfipAt`). Anotado como consideración post-piloto, fuera de alcance de este PR.

### 2.4 Idempotencia y no-romper lo existente

- El reintento es **naturalmente idempotente**: consultar ARCA dos veces no daña. `sincronizarTaller` con éxito escribe `datosReactivacion()` que es idempotente sobre un taller ya ACTIVA (`gracia.ts` docstring `:87-89`).
- **No rompe recordatorios/inactivaciones:** si el reintento **no** valida (ARCA sigue caído o CUIT sigue malo), el taller queda `EN_GRACIA` y la lógica actual corre igual. El `try/catch` por taller (`route.ts:65-101`) ya aísla fallos; el reintento va **dentro** de ese `try` para que un error de ARCA no aborte el batch.
- **Cuidado con el contador `errores`:** un fallo de `consultarPadron` por ARCA caído **no es un error del cron** (es lo esperado). El reintento no debe incrementar `errores` (`route.ts:99`) por un `ARCA_NO_RESPONDE`; distinguir en el resumen con un contador nuevo, ej. `reintentosArca` / `reactivacionesAuto`.
- Extender el `resumen` (`route.ts:104-112`) con: `reintentosArca`, `reactivacionesAuto` — para la bitácora/observabilidad.

### 2.5 Casos borde D

- **CUIT sigue malo** → reintento falla → sigue el flujo normal (recordatorio/inactivación). Correcto: D no inventa salida para un CUIT genuinamente mal tipeado (eso lo resuelve A/B).
- **ARCA caído durante toda la gracia** → nunca valida → se inactiva al día 60 igual. D reduce la probabilidad pero no la elimina; es aceptable (el CUIT correcto puede reactivarse post-inactivación con A/B).
- **`sincronizarTaller` devuelve `CUIT_INACTIVO`/`CUIT_INEXISTENTE`** → escribe `verificadoAfip=false` + `verificadoAfipAt` (`arca.ts:198-207`) pero **no** cambia `estadoCuenta` → sigue `EN_GRACIA`, sigue el flujo. OK.

---

## 3. PIEZA A — Taller corrige su CUIT + re-verifica (self-service)

**Qué:** una acción en `/taller/formalizacion` que muestra el CUIT actual (el que falla), permite corregirlo, y verifica contra ARCA. Si valida: persiste el CUIT nuevo + `verificadoAfip=true` + reactivación automática. **Arregla de paso el CTA muerto** del banner de inactiva (hueco #2: "Verificar mi CUIT →" hoy va a formalización y no hay nada que verifique).

### 3.1 Dónde vive

- **Página:** `src/app/(taller)/taller/formalizacion/page.tsx` — agregar un bloque/Card **arriba** de las cards de etapas, visible **solo** cuando aplica el gating (3.3). El banner de inactiva ya apunta acá (`banner-gracia.tsx:38` y `:59`), así que el CTA queda cableado sin tocar el banner.
- **Componente cliente:** nuevo `src/taller/componentes/corregir-cuit-form.tsx` (`'use client'`) — muestra CUIT actual, input para el corregido, botón "Verificar contra ARCA", maneja estados (loading/éxito/error) con `useToast`.
- **Backend:** endpoint compartido con B (ver §5).

### 3.2 El flujo

1. Muestra el **CUIT actual** (read-only, el que está fallando) — el taller ve exactamente qué número tiene cargado.
2. Input para el **CUIT corregido** (pre-cargado con el actual, editable; 11 dígitos sin guiones).
3. Botón **"Verificar contra ARCA"** → `POST` al endpoint compartido con `{ cuit: nuevoCuit }`.
4. Backend: `consultarPadron(nuevoCuit)`:
   - **Éxito** → actualizar `taller.cuit = nuevoCuit` + todo lo que hoy escribe `sincronizarTaller` en el path exitoso (`verificadoAfip`, `datosReactivacion()`, campos ARCA) → **reactivación automática**. Toast de éxito, refrescar.
   - **Fallo** → mensaje claro de ARCA vía `mensajeErrorArca(codigo)` (`arca.ts:382`), sin cambiar nada.

> **Nota de diseño clave:** `sincronizarTaller` re-consulta con el `taller.cuit` **almacenado** (`arca.ts:177`) — **no sirve** para un CUIT corregido no persistido. El endpoint nuevo debe: (a) validar el CUIT candidato con `consultarPadron(candidato)` **antes** de persistir, y (b) persistir el `cuit` nuevo **solo si valida**. Ver §5 para el helper compartido.

### 3.3 Gating estricto (invariante #4)

Mostrar el form / aceptar el POST **SOLO si `verificadoAfip === false`**. Un taller verificado no puede tocar su CUIT.

- **UI:** en `page.tsx`, cargar `verificadoAfip` del taller (hoy el `select` de `:30` no lo trae — agregar) y renderizar el bloque solo si `!verificadoAfip`.
- **Backend:** el endpoint re-chequea `verificadoAfip === false` server-side (no confiar en que la UI lo ocultó) → si ya está verificado, `409 Conflict` "Tu CUIT ya está verificado".

### 3.4 Doble uso: corregir **o** solo reintentar

El caso "mi CUIT está bien pero no verifica" (ARCA estaba caído al registrarse) = el mismo botón **sin cambiar el número** = re-disparo manual. La UI debe contemplar ambos usos:

- Copy del botón que funcione para ambos: **"Verificar contra ARCA"** (no "Corregir CUIT", que asume que está mal).
- Si el candidato `=== cuit actual`, es un simple reintento (equivale a lo que hace `sincronizarTaller` hoy, pero disparado por el taller). Igual pasa por `consultarPadron`.

### 3.5 Colisión `@unique` (invariante de datos)

`cuit` es `@unique` en `Taller` (`prisma/schema.prisma`, ~`:175`). Si el CUIT corregido **ya existe en otra cuenta**:

- Detectar **antes** de intentar el update, o capturar el `P2002` de Prisma.
- Mensaje claro **sin filtrar datos del otro taller**: "Este CUIT ya está registrado en otra cuenta. Si creés que es un error, escribinos a soporte." **Nunca** revelar nombre/email/id del taller dueño.
- Orden recomendado: validar contra ARCA primero (si el CUIT ni existe en ARCA, ni hace falta chequear colisión), luego chequear colisión, luego persistir — todo dentro de una transacción para evitar TOCTOU.

### 3.6 Copy explícito (refinamiento de Sergio)

El taller debe entender **"esto es lo que te falta para reactivarte / aparecer en el directorio"**. Conectar con el lenguaje de los banners de gracia/inactiva (`banner-gracia.tsx`):

- Título del bloque: algo como **"Verificá tu CUIT para reactivar tu cuenta"** (INACTIVA) / **"Verificá tu CUIT para aparecer en el directorio"** (EN_GRACIA).
- Texto de apoyo que explique: el CUIT que tenés cargado no pudo verificarse contra ARCA; corregilo o reintentá; una vez verificado, tu cuenta se reactiva y aparecés en el directorio.
- Reusar el mismo lenguaje que ya acordamos en los banners (evitar inventar términos nuevos).

### 3.7 Casos borde A

- Taller sin `cuit` en DB (no debería pasar, pero defensivo) → mostrar input vacío, no romper.
- CUIT con formato inválido (no 11 dígitos) → validar client-side + server-side antes de pegarle a ARCA.
- ARCA caído durante la corrección → `ARCA_NO_RESPONDE` → toast "ARCA no responde ahora, reintentá en un rato", no persistir.
- Doble submit / spam del botón → deshabilitar mientras carga; el logActividad y `consultaArca` quedan registrados igual. **Rate-limit del botón: NO para el piloto** (decisión de Gerardo, §8.4) — consideración post-piloto. Deshabilitar-mientras-carga alcanza como mitigación básica.

---

## 4. PIEZA B — COORD corrige + re-verifica desde el panel ARCA

**Qué:** extender el panel ARCA de ESTADO/COORD (donde hoy vive `reverificar/[id]`) para que COORD pueda **ver el CUIT declarado y tipear el CUIT corregido (el del PDF de la constancia) lado a lado**, y verificar. Es el fallback operativo para los que no se autoservicien (típicamente backfilleados que no vuelven a entrar).

### 4.1 UI — comparación lado a lado (refinamiento de Sergio)

- Ubicación: el panel ARCA de ESTADO donde ya está el botón de reverificar (el que llama `POST /api/estado/arca/reverificar/[id]`). Localizar la página que lo consume y extenderla.
- Mostrar: **CUIT declarado** (el almacenado, que falla) **|** **CUIT corregido** (input, que COORD copia del PDF) — comparación **explícita** para que la corrección no sea a ciegas.
- Botón: "Verificar CUIT corregido contra ARCA".

### 4.2 Backend — mismo endpoint que A (§5)

**Un solo endpoint compartido** con autorización por rol, no dos implementaciones:
- Taller (dueño) → corrige **su** taller, gated por `verificadoAfip=false`.
- ESTADO/ADMIN → corrige **cualquier** taller (el `[id]`), mismo gating de `verificadoAfip=false`.

El endpoint actual `reverificar/[id]` **no acepta CUIT override** (solo re-consulta el almacenado, `arca.ts:177`) y **queda intacto**. El nuevo `POST /api/arca/corregir-cuit/[id]` (DECIDIDO, §5.3) acepta `{ cuit }` con autorización dual (dueño **o** ESTADO/ADMIN). Ver §5 para la forma exacta.

### 4.3 Auditoría (evento sensible)

El cambio de CUIT debe quedar **trazado**. Usar `logActividad` (`log.ts:8`) — o `logAccionAdmin` (`log.ts:43`) cuando el actor es ADMIN/ESTADO:

- Acción nueva, ej. `CUIT_CORREGIDO`.
- Detalles: **quién** corrigió (`userId` + rol: taller-dueño vs COORD/ADMIN), **cuándo** (timestamp lo pone el log), **CUIT anterior** y **CUIT nuevo**, resultado de la verificación (exitosa/error).
- Para B (COORD/ADMIN sobre taller ajeno) usar `logAccionAdmin('CUIT_CORREGIDO', userId, { entidad:'taller', entidadId, cambios:{ cuitAnterior, cuitNuevo }, metadata:{ exitosa } })` — el tipado ya soporta `entidad:'taller'` (`log.ts:26`).

### 4.4 Casos borde B

- COORD tipea un CUIT que tampoco valida → error de ARCA, no persiste, queda registrado el intento.
- Colisión `@unique` → mismo manejo que A (§3.5), sin filtrar datos del otro taller.
- COORD sobre un taller ya verificado → mismo `409` (invariante #4) — COORD tampoco puede re-tocar un CUIT verificado sin un flujo aparte (fuera de alcance).

---

## 5. Endpoint compartido (A + B) — diseño

**Un handler, autorización dual, un helper de dominio.** Evita dos implementaciones de "validar CUIT candidato → persistir si valida → reactivar".

### 5.1 Helper de dominio (nuevo, en `arca.ts`)

`sincronizarTaller` no sirve tal cual (usa el CUIT almacenado). Agregar en `src/compartido/lib/arca.ts` un helper hermano:

```
corregirYVerificarCuit(tallerId, cuitCandidato, actorUserId): ResultadoConsulta
  1. cargar taller { cuit, verificadoAfip }
  2. si verificadoAfip === true  → { exitosa:false, error:'YA_VERIFICADO' }   // invariante #4
  3. consultarPadron(cuitCandidato, tallerId, actorUserId)
  4. si NO exitosa → devolver el error (mensajeErrorArca lo traduce), NO persistir
  5. si exitosa → transacción:
       - chequear colisión @unique del cuitCandidato (P2002 → 'CUIT_EN_USO')
       - update taller: { cuit: cuitCandidato, verificadoAfip:true, verificadoAfipAt,
                          ...datosReactivacion(), ...campos ARCA de resultado.datos }
       - logActividad('CUIT_CORREGIDO', actorUserId, { tallerId, cuitAnterior, cuitNuevo, exitosa:true })
  6. devolver resultado
```

Este helper es **el único write nuevo de `verificadoAfip=true`** — reusa exactamente el mismo bloque de campos que `sincronizarTaller` en su path exitoso (`arca.ts:180-197`), respetando el invariante #1. Considerar refactorizar ese bloque a una función común (`aplicarDatosArca(datos)`) para no duplicar el mapeo de campos.

### 5.2 Route

`POST /api/arca/corregir-cuit/[id]` con `body: { cuit: string }`:
- Auth: cargar sesión; permitir si **es dueño del taller `[id]`** (`taller.userId === session.user.id`) **o** rol ∈ {ESTADO, ADMIN} (via `modoActivo` / `requiereRolApi`).
- Validar formato de `cuit` (11 dígitos).
- Llamar `corregirYVerificarCuit(id, cuit, session.user.id)`.
- Mapear resultado → JSON: `exitosa` + (en error) `mensajeErrorArca(error)` para la UI; `409` para `YA_VERIFICADO` / `CUIT_EN_USO`.
- Usar `apiHandler` (`api-errors.ts`) como `reverificar/[id]` (`route.ts:9`).

### 5.3 Endpoint — **DECIDIDO: `corregir-cuit/[id]` NUEVO**

**Decisión de Gerardo:** endpoint **nuevo** `POST /api/arca/corregir-cuit/[id]`, con **semántica y permisos separados** de `reverificar/[id]`. `reverificar/[id]` queda intacto (reintento del CUIT almacenado, solo ESTADO/ADMIN). El nuevo acepta `{ cuit }` y tiene autorización dual (dueño **o** ESTADO/ADMIN). Dos responsabilidades, dos rutas — sin mezclar autorizaciones en un solo handler.

---

## 6. Plan de PRs — **DECIDIDO: PR-1 = D · PR-2 = A + B**

**Decisión de Gerardo:** dos PRs. D sola primero (protección del piloto, no depende de nada); A y B juntos en el segundo (comparten backend, QA de Sergio en una sola pasada).

| PR | Contenido | Depende de | Estimación |
|---|---|---|---|
| **PR-1 — D** ✅ HECHO (`02ed22d`, #452) | Reintento ARCA diario en el cron (§2) + contadores `reintentosArca`/`reactivacionesAuto` en el resumen + tests | — | S |
| **PR-2 — A + B** ✅ HECHO (`7b49a36`, #453) | Helper `corregirYVerificarCuit` + refactor `aplicarDatosArca` + endpoint nuevo `corregir-cuit/[id]` (auth dual) · **A:** form self-service en `/taller/formalizacion` + cablear CTA del banner · **B:** UI comparación lado a lado en el panel ARCA de ESTADO + auditoría `CUIT_CORREGIDO` · tests · + fixes del QA de Sergio (Historial muestra `CUIT_CORREGIDO`; renombres "Re-consultar ARCA (CUIT actual)" / "Abrir el trámite en ARCA"; copy independencia documental en paso CUIT/Monotributo) | PR-1 no bloquea (solo evitar choque en `arca.ts`) | M |

**PR-1 arranca ya** (este spec, §2). PR-2 después, sobre `arca.ts` ya tocado por PR-1 (rebasar si hace falta).

Por qué A+B juntos: comparten el helper, el endpoint y el mapeo de campos ARCA; separarlos duplicaría el diff de review. Sergio hace un QA único del circuito de corrección (taller + COORD) en vez de dos pasadas.

---

## 7. Tests (Vitest + Playwright, obligatorios por spec)

### Pieza D (unit sobre la lógica del cron)
- **Reintento exitoso no dispara email ni inactivación:** taller día 55 (VENCE_PRONTO), mock ARCA que valida → tras la corrida está `ACTIVA`, `recordatorioCuitEnviadoAt` sigue null, `reactivacionesAuto=1`, `recordatorios=0`.
- **Reintento fallido cae al flujo normal:** taller día 55, mock ARCA que falla (`ARCA_NO_RESPONDE`) → recibe el recordatorio (`recordatorios=1`), `errores=0` (el fallo ARCA no cuenta como error del cron).
- **Reintento día 60 que valida evita la inactivación:** taller día 61, mock ARCA que valida → `ACTIVA`, `inactivaciones=0`.
- **Taller sin CUIT no se reintenta:** `verificadoAfip=false` pero `cuit=null` → no se llama ARCA, cae al flujo normal.
- **Idempotencia:** dos corridas seguidas sobre un taller ya reactivado → sin cambios, sin doble email.

### Pieza A (unit del helper + e2e del flujo)
- **Corregir-y-validar reactiva:** taller `EN_GRACIA`, `verificadoAfip=false`, CUIT malo → `corregirYVerificarCuit` con CUIT mock válido → `taller.cuit` actualizado, `verificadoAfip=true`, `estadoCuenta='ACTIVA'`, reloj limpio.
- **Colisión `@unique`:** CUIT corregido ya usado por otro taller → error `CUIT_EN_USO`, **no** persiste, mensaje no filtra datos del otro.
- **Gating por estado:** taller `verificadoAfip=true` intenta corregir → `409 YA_VERIFICADO`, sin cambios.
- **Reintento sin cambiar el número (ARCA caído):** mismo CUIT, mock que ahora valida → reactiva.
- **CUIT que no valida:** mock `CUIT_INEXISTENTE` → no persiste, devuelve mensaje de error.
- **e2e (Playwright):** login taller inactivo → banner "Verificar mi CUIT" → formalización → form → corregir → verificar → cuenta reactivada (usar CUIT mock `mockConsulta`).

### Pieza B (unit de autorización + auditoría)
- **Override de COORD auditado:** ESTADO corrige el CUIT de un taller ajeno → valida → persiste + `logActividad('CUIT_CORREGIDO', ...)` con `cuitAnterior`/`cuitNuevo` y actor.
- **Autorización dual:** un taller NO puede corregir el CUIT de **otro** taller (403); ESTADO/ADMIN sí.
- **COORD sobre taller verificado:** `409`.

---

## 8. Decisiones (cerradas por Gerardo) ✅

1. **Reintento de D → DIARIO, sin backoff** (§2.3). Población en gracia chica en el piloto; simplicidad primero. Se quitó el uso prestado de `verificadoAfipAt` como reloj. Si crece post-piloto, se agrega backoff entonces.
2. **Endpoint → `corregir-cuit/[id]` NUEVO** (§5.3). Semántica y permisos separados de `reverificar/[id]` (que queda intacto).
3. **Corte de PRs → PR-1 = D · PR-2 = A + B** (§6). D sola primero (protección del piloto); A+B juntos comparten backend y QA de Sergio en una pasada.
4. **Rate-limit del self-service → NO para el piloto** (§3.7). Consideración post-piloto, fuera de alcance.

> **Estado: DECIDIDO.** PR-1 (D) arranca ya. PR-2 (A+B) queda listo para implementar sobre este spec.
