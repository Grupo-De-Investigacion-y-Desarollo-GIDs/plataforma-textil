# Etapa 2.3 — Discovery + Diseño (gracia 60 días + vidriera mínima)

> **Estado:** DISCOVERY + DISEÑO. **A (vidriera mínima) = HECHO** (PR #448, squash `9062603` en develop, 2026-07-02, CI verde unit+e2e). **B (gracia) = PENDIENTE** (decisiones ya resueltas, ver §3/§6).
> Decisión de proceso: diseñar primero, no implementar y ajustar en QA.
> Toda afirmación de "qué ya existe" está anclada con `archivo:línea`.

La Etapa 2.3 tiene **dos piezas net-new independientes**:

- **A — Vidriera mínima ✅ HECHO (`9062603`):** 4 requisitos + CUIT verificado para aparecer en el directorio. Sin gracia: si no la completás, no aparecés (sin desactivación).
- **B — Gracia 60 días ⏳ PENDIENTE:** si pasan 60 días sin verificar CUIT → cuenta "pendiente formalización" (recuperable). Email recordatorio ~día 50. Recuperación automática al verificar.

---

## 1. ESTADO ACTUAL — qué de A y B ya existe vs net-new

### A — Vidriera mínima (los 4 requisitos)

| Req | ¿Existe hoy? | Evidencia |
|---|---|---|
| (1) Descripción ≥50 chars | **Campo sí, umbral no.** `Taller.descripcion String? @db.Text` (`prisma/schema.prisma:257`). El onboarding chequea solo *presencia*, sin umbral 50 (`src/compartido/lib/onboarding.ts:87`). No se usa para gatear el directorio. |
| (2) Ubicación declarada | **Campos sí, validación no.** `ubicacion` (`schema.prisma:252`), `provincia` (`:254`), `partido` (`:255`), `ubicacionDetalle` (`:256`). No se validan ni gatean aparición. |
| (3) ≥1 rubro o capacidad | **SÍ — y más estricto.** `tallerElegibleDirectorio` (R-DIR) ya exige ≥1 proceso **o** prenda **con su toggle de visibilidad ON** (`src/compartido/lib/visibilidad-vidriera.ts:236-247`). Es el único de los 4 implementado como gate real. Ver §2 para el matiz "capacidad". |
| (4) Foto del taller | **No como gate.** Único campo de imágenes: `Taller.portfolioFotos String[]` (`schema.prisma:277`). No hay campo dedicado `foto`/`logo`. Sin foto, el directorio muestra un ícono `<Factory>`, **no** un placeholder institucional (`src/app/(public)/directorio/page.tsx:126-129`). |

**Gate efectivo del directorio HOY** (idéntico en público y marca):

```ts
// src/app/(public)/directorio/page.tsx:33-43  (marca: marca/directorio/page.tsx:59-73)
const tallerWhere = { verificadoAfip: true, /* + filtros de búsqueda opcionales */ }
const candidatos = await prisma.taller.findMany({ where: tallerWhere, ... })
const elegibles = candidatos.filter(tallerElegibleDirectorio)  // :75 (marca :91)
```

→ **Gate = `verificadoAfip` (CUIT ARCA) + R-DIR (≥1 rubro/proceso visible).** Requisitos (1), (2) y (4) tienen campos en el schema pero **ninguna función los valida ni los aplica al filtro**. No existe una "vidriera mínima" nombrada; lo más cercano es el checklist de `onboarding.ts` (2 campos, sin umbrales). Esto confirma y corrige la mención "chequea 2 de 5": son 2 (`capacidadMensual` + `descripcion` presentes), no 2 de 5.

**Net-new de A:** la función que evalúa los 4 reqs, su cableado en el filtro del directorio, el placeholder institucional, y (recomendado) el feedback al taller de qué le falta.

### B — Gracia 60 días

| Pieza | ¿Existe hoy? | Evidencia |
|---|---|---|
| Timestamp de registro (contar 60 días) | **SÍ.** `Taller.createdAt @default(now())` (`schema.prisma:306`) y `User.createdAt` (`:175`). |
| Estado/timestamp de verificación CUIT | **SÍ.** `verificadoAfip Boolean` + `verificadoAfipAt DateTime?` en Taller (`:261,:264`) y User (`:164-165`). `estadoCuitAfip EstadoCuit?` (`:267`). |
| Estado de cuenta "inactiva / pendiente formalización" | **NO.** No hay enum ni campo. Lo único es `User.active Boolean @default(true)` (`schema.prisma:153`) — booleano binario, sin matiz "recuperable por gracia". |
| **Login respeta `active`** | **NO — hallazgo crítico.** `authorize()` chequea solo email+password y devuelve el user (`src/compartido/lib/auth.ts:37-58`). **No lee `user.active`.** `signIn()` tampoco (`auth.ts:79-92`). El único uso de `active` es el soft-delete de admin (`src/app/api/admin/usuarios/[id]/route.ts:52`) y filtros de queries (`active: true`). **Hoy, poner `active=false` NO bloquea el login.** |
| Email recordatorio día 50 | **NO.** 13 plantillas en `email.ts`, ninguna de recordatorio/CUIT (ver §3). |
| Vercel Cron | **NO existe ninguno.** Sin dir `api/cron/`, sin `CRON_SECRET`, sin key `crons` en `vercel.json`. |
| Idempotencia (flag "ya enviado") | **NO existe** ningún `recordatorioEnviado`/similar. Sí existe el **patrón** de diff-de-días reusable (`arca.ts:168-174`). |

**Net-new de B:** migración de schema (estado de cuenta + flags de idempotencia), enforcement del estado en login/acciones comerciales, el cron, la plantilla de email, el hook de recuperación automática, y los tests.

---

## 2. VIDRIERA MÍNIMA — diseño

### Cómo y dónde se evalúan los 4 reqs

**Decisión: evaluar en render, NO como campo calculado en DB.** Mismo razonamiento que R-DIR: la visibilidad vive en JSONB no-queryable, ya hay filtrado post-query, y un campo calculado introduciría migración + staleness (habría que recalcular en cada edición de perfil). Evaluar al filtrar el directorio es consistente con lo existente y sin migración.

**Función nueva** (junto a `tallerElegibleDirectorio`, en `src/compartido/lib/visibilidad-vidriera.ts`):

```ts
// Pseudocódigo del diseño — NO implementar aún
const FOTO_OBLIGATORIA = false  // piloto: opcional. Post-piloto: configurable.

export function vidrieraMinimaCompleta(taller): { completa: boolean; faltan: string[] } {
  const faltan = []
  if ((taller.descripcion?.trim().length ?? 0) < 50) faltan.push('descripcion')
  if (!tieneUbicacion(taller))            faltan.push('ubicacion')   // ubicacion || (provincia && partido)
  if (!tallerElegibleDirectorio(taller))  faltan.push('rubro')        // reusa R-DIR (req 3)
  if (FOTO_OBLIGATORIA && (taller.portfolioFotos?.length ?? 0) === 0) faltan.push('foto')
  return { completa: faltan.length === 0, faltan }
}
```

**Gate nuevo del directorio** = `verificadoAfip` (sigue en el `where` SQL) **+ `vidrieraMinimaCompleta(taller).completa`** (reemplaza la llamada suelta a `tallerElegibleDirectorio` en el `.filter`, que queda subsumida en req 3). Se aplica en **ambos** directorios (público `:75` y marca `:91`).

### Relación con R-DIR de 2.2-C1

**Extiende, no reemplaza.** R-DIR (`visibilidad-vidriera.ts:236-247`) ya cubre el req (3) y de forma **más estricta** que la letra de Sergio: exige no solo tener un rubro sino tenerlo **con el toggle visible**. Se reutiliza tal cual como el chequeo del req 3. La vidriera mínima le suma los reqs (1), (2) y (4).

⚠️ **Matiz a decidir (Decisión #3):** Sergio escribió *"≥1 rubro **o capacidad**"*. R-DIR no contempla "capacidad" (`capacidadMensual > 0`) como alternativa: exige un proceso/prenda visible. Dos opciones:
- **(a) Mantener R-DIR estricto** (rubro/proceso visible) — recomendado: una capacidad sin un rubro visible no da nada que mostrar en la tarjeta del directorio.
- **(b) Ampliar req 3** a `R-DIR || capacidadMensual > 0`.

### Foto opcional con placeholder (piloto)

- Piloto: `FOTO_OBLIGATORIA = false` → la foto **no** gatea. Si el taller no subió foto, la tarjeta usa un **placeholder institucional** (asset de marca PDT) en vez del ícono `<Factory>` genérico actual (`directorio/page.tsx:126-129`).
- **Falta el asset:** hoy no existe placeholder institucional en el repo. Hay que sumar uno (`public/`), e idealmente usarlo también en la tarjeta sin foto.
- Post-piloto: flipear `FOTO_OBLIGATORIA` (constante o env `VIDRIERA_FOTO_OBLIGATORIA`) la vuelve gate. **Decisión #4:** constante vs env, y qué asset.

### Feedback al taller (recomendado, mismo espíritu que 2.2-C2)

`vidrieraMinimaCompleta` devuelve `faltan[]`, así que en **Mi vidriera** se puede mostrar un aviso accionable *"Para aparecer en el directorio te falta: descripción (mín. 50), ubicación…"* con links a donde se carga cada dato (reusando el patrón `IndicadorEdicion` de 2.2-C2). Cierra el loop de descubribilidad. Scope opcional de A; recomendado en el mismo PR.

---

## 3. GRACIA + INACTIVACIÓN — diseño

### 3.1 Modelo de datos (requiere migración — dominio de Gerardo)

El hallazgo crítico (§1) condiciona todo: **`User.active` está inerte en login y, además, colisiona semánticamente** con el baneo de admin (que ya usa `active=false`). Un taller "pendiente de formalización por gracia" (recuperable, puede seguir aprendiendo) **no es** lo mismo que un usuario baneado por admin.

**Recomendación:** campo dedicado de ciclo de vida, no reusar `active`. Por ejemplo:

```prisma
// Diseño propuesto — Gerardo valida y migra
enum EstadoCuenta { ACTIVA, PENDIENTE_FORMALIZACION }   // ampliable

model User {
  // ...
  estadoCuenta              EstadoCuenta @default(ACTIVA)
  inactivadaAt              DateTime?    // cuándo pasó a PENDIENTE_FORMALIZACION
  recordatorioCuitEnviadoAt DateTime?    // idempotencia del email día 50
}
```

- `createdAt` ya existe (`:175`) → base del conteo de 60 días.
- `recordatorioCuitEnviadoAt`: sin esto el cron remandaría el email cada corrida (no hay flag hoy).
- Se mantiene `active` para el baneo de admin (semántica separada).

**Decisión #2 (Gerardo):** enum `EstadoCuenta` nuevo vs flags sueltos vs reusar `active`. Nunca tocar el schema sin Gerardo (regla del proyecto).

### 3.2 Qué significa "inactiva" funcionalmente — el matiz clave

Sergio: *"puede Academia + Recursos, no aparece en directorio, no cotiza"*. Esto **NO es un bloqueo de login** — si pudiera seguir en Academia, sigue entrando. Entonces "inactiva" = **estado restringido**, no puerta cerrada:

| Acción | Cuenta ACTIVA | PENDIENTE_FORMALIZACION |
|---|---|---|
| Login | ✅ | ✅ (sigue entrando) |
| Academia / Recursos | ✅ | ✅ |
| Aparecer en directorio | ✅ (si vidriera mínima) | ❌ |
| Cotizar / operar comercialmente | ✅ | ❌ |
| Banner "pendiente de formalización" | — | ✅ (CTA verificar CUIT) |

**Observación importante:** el directorio **ya** excluye `!verificadoAfip` (`directorio/page.tsx:34`). Un taller sin CUIT verificado **ya no aparece**, esté en gracia o inactivo. Entonces lo que el estado inactivo agrega *de nuevo* es: **bloquear cotizar/operar comercialmente** + el **banner**. **Decisión #1 + gap de discovery:** hay que mapear qué acciones comerciales hoy NO gatean en `verificadoAfip` y deberían bloquearse en estado inactivo (cotizar, crear/aceptar órdenes). Sin ese enforcement, "inactivar" no cambia nada observable más allá del banner.

### 3.3 El Vercel Cron

- **Ruta:** `src/app/api/cron/gracia-cuit/route.ts`, `export const runtime = 'nodejs'` + `dynamic = 'force-dynamic'` (Prisma necesita Node, no Edge — mismo patrón que `api/health/route.ts:9-10`).
- **Protección:** `Authorization: Bearer ${process.env.CRON_SECRET}`. Vercel Cron inyecta ese header automáticamente si la env var existe. **Patrón nuevo** (no hay `CRON_SECRET` hoy) → sumar la env var en Vercel.
- **Schedule (`vercel.json`):** 1 cron diario, dentro del máximo de 2 en Hobby (ya confirmado viable):
  ```json
  { "crons": [ { "path": "/api/cron/gracia-cuit", "schedule": "0 8 * * *" } ] }
  ```
  (`vercel.json` hoy solo tiene `regions` + `ignoreCommand` → se agrega la sección `crons`.) **Decisión #8:** hora/timezone (Vercel cron corre en UTC).
- **Qué hace cada corrida** (una sola query + dos branches, idempotentes):
  1. `talleres` con `!verificadoAfip` y `estadoCuenta = ACTIVA` (join a User).
  2. `dias = (now - createdAt) / 86400000` en UTC.
  3. **Ventana día 50** (`dias >= 50 && dias < 60 && recordatorioCuitEnviadoAt == null`) → `buildRecordatorioCuitEmail` + `sendEmail` + setear `recordatorioCuitEnviadoAt`. (Ventana, no `== 50`, para tolerar una corrida perdida.)
  4. **Día 60** (`dias >= 60`) → `estadoCuenta = PENDIENTE_FORMALIZACION`, `inactivadaAt = now`.
  - Recomendado: emitir notificación in-app además del email (patrón dual de `notificaciones.ts:36-50`). **Decisión #7.**

### 3.4 Recuperación automática al verificar CUIT

Engancharse en los puntos que ya persisten la verificación: registro (`api/auth/registro/route.ts:111-115`), `sincronizarTaller` (`arca.ts`) y reverificación de ESTADO (`api/estado/arca/reverificar/[id]/route.ts:27`). Cuando `verificadoAfip` pasa a `true`: `estadoCuenta = ACTIVA`, `inactivadaAt = null`, `recordatorioCuitEnviadoAt = null` (reset, sin trámite extra). Centralizar en un helper para no duplicarlo en los 3 sitios.

### 3.5 La plantilla de email día 50

Nueva `buildRecordatorioCuitEmail(nombre, diasRestantes)` en `src/compartido/lib/email.ts`, reusando `emailWrapper` (`:65-78`) + `btnPrimario` (`:80-82`) → link a verificar CUIT. Devuelve `{ subject, html }` como todas (`email.ts:84-313`); el cron la combina con `sendEmail`. **Modo dev sin `RESEND_API_KEY` ya es seguro:** loguea y devuelve `{ exito: true }` (`email.ts:21-25`) → el cron en dev/preview no manda mails reales ni rompe.

---

## 4. RIESGOS

| Riesgo | Mitigación |
|---|---|
| **`active`/estado inerte** — inactivar no hace nada sin enforcement. | Definir y cablear el enforcement (login banner + bloqueo de cotizar/operar). Es trabajo real, no "flag flip". (Decisión #1) |
| **Backfill al lanzar** — talleres existentes con `createdAt` > 60 días y sin verificar se inactivarían TODOS en la 1ª corrida. | **Crítico.** Contar la gracia desde `max(createdAt, FECHA_LANZAMIENTO_2_3)`, o amnistía única, o backfill de `createdAt`. (Decisión #5) |
| **Email duplicado** | `recordatorioCuitEnviadoAt` + ventana día 50 (no `==`). Patrón de diff-de-días ya probado (`arca.ts:168-174`). |
| **Inactivación duplicada** | Filtrar por `estadoCuenta = ACTIVA` en la query → naturalmente idempotente; correr 2× = no-op. |
| **Cron falla / corrida perdida** | Ventana (≥50, ≥60) en vez de día exacto → la corrida siguiente alcanza. Loguear resultado y enganchar a la bitácora/observabilidad piloto (`api/health`). Alerta si 0 procesados varios días. |
| **Timezone** | `createdAt` es UTC; hacer el cálculo de días en UTC y documentarlo. Cron corre en UTC. |
| **Placeholder ausente** | Sumar el asset institucional antes de que la foto sea gate. |
| **Mandar emails es sensible** | Dev/preview ya cae a modo log (no manda). Probar primero en preview con secret manual. |

### Cómo se testea sin esperar 60 días

La selección es función pura de `(createdAt, now, verificadoAfip, estadoCuenta, recordatorioCuitEnviadoAt)`. Tres capas:

1. **Unit (Vitest):** extraer la lógica de selección a una función pura `clasificarGracia(taller, ahora)` → testear con fechas fabricadas (creado hace 49/50/59/60/61 días, con/sin recordatorio, verificado/no). Sin esperar nada, sin DB.
2. **Integración del endpoint:** seedear talleres con `createdAt` retrodatado (hace 51 y 61 días, sin verificar) → `POST/GET` al cron con `Authorization: Bearer <CRON_SECRET>` en preview → assert: el de 51 recibe email (log dev) + `recordatorioCuitEnviadoAt` seteado; el de 61 queda `PENDIENTE_FORMALIZACION`. **Idempotencia:** correr 2× → 2ª corrida no-op. **Recuperación:** verificar CUIT del inactivo → vuelve `ACTIVA`.
3. **Override de umbral:** `GRACIA_DIAS` por env (default 60) para forzar escenarios cortos en preview sin retrodatar (ej. `GRACIA_DIAS=0`).

---

## 5. PLAN DE PRs

**A y B son independientes** (no comparten datos ni código) → **separables**. Corte recomendado:

- **PR A — Vidriera mínima ✅ HECHO (#448, squash `9062603`, mergeado 2026-07-02, CI verde unit+e2e):** función `tallerCumpleVidrieraMinima`/`evaluarVidrieraMinima` + helpers + `DESCRIPCION_MIN_CHARS`/`FOTO_OBLIGATORIA` (en `visibilidad-vidriera.ts`); cableado en ambos directorios (público + marca); `TallerFotoPlaceholder` institucional; `VidrieraMinimaAviso` (feedback al taller en Mi vidriera). Req 2 = provincia+partido. Foto opcional en piloto (`FOTO_OBLIGATORIA=false`). Tests unit (14 casos) + e2e. **QA de Sergio (post-merge de la 1a versión) corrigió 2 bugs incluidos en el mismo PR:** Bug 1 CRÍTICO (regresión V4 #4) — Credenciales de la vidriera exponía las validaciones privadas del recorrido en 3 superficies (vidriera pública, Mi vidriera, detalle marca) → ahora SOLO Etapa + ARCA (render + query removidos; e2e `credenciales-vidriera.spec.ts`); Bug 2 — padding del listado /directorio anónimo. R-DIR (req 3) reutilizado intacto.
- **PR B0 — Schema + enforcement** (Gerardo): migración (`EstadoCuenta` + `inactivadaAt` + `recordatorioCuitEnviadoAt`) + enforcement del estado (banner login + bloqueo cotizar/operar) + helper de recuperación. Es el prerequisito de B1 y el que necesita las decisiones #1/#2/#5.
- **PR B1 — Cron + email + recuperación + tests** (Sergio): endpoint `api/cron/gracia-cuit` + `CRON_SECRET` + `crons` en `vercel.json` + `buildRecordatorioCuitEmail` + hook de recuperación en los 3 puntos de verificación + tests (las 3 capas de §4).

Orden: ~~**A** en paralelo (independiente)~~ ✅ hecho. **B0 → B1** secuencial. B no arranca hasta cerrar Decisiones #1, #2, #5.

---

## 6. ESTIMACIÓN + decisiones requeridas antes de implementar

**Estimación gruesa:** A ≈ 1 PR chico-mediano (función + cableado + asset + tests). B ≈ 2 PRs (B0 schema/enforcement mediano + sensible; B1 cron/email/tests mediano). B es claramente el net-new más grande y sensible de la Etapa 2.

**Decisiones que necesito de Gerardo/Sergio antes de codear:**

1. **(Sergio) ¿Qué bloquea exactamente "inactiva"?** Confirmar soft-restricted (Academia+Recursos sí; directorio+cotizar no; banner). Y listar las acciones comerciales a bloquear (cotizar, crear/aceptar órdenes…). Sin esto, inactivar no cambia nada observable.
2. **(Gerardo) Modelo de datos:** enum `EstadoCuenta` nuevo (recomendado) vs reusar `active` (colisiona con baneo admin). Define la migración.
3. **(Sergio) Req 3 vidriera mínima:** R-DIR estricto (rubro/proceso visible, recomendado) vs ampliar a `|| capacidadMensual > 0`.
4. **(Sergio/Gerardo) Foto:** confirmar opcional en piloto con placeholder; qué asset institucional; constante vs env `VIDRIERA_FOTO_OBLIGATORIA` para flipearla post-piloto.
5. **(Gerardo) Backfill/amnistía:** qué pasa con talleres existentes >60 días sin verificar al lanzar la 2.3 (contar desde fecha de lanzamiento / amnistía única / backfill). **Crítico** para no inactivar masivamente en la 1ª corrida.
6. **(Sergio) Umbral descripción:** 50 chars con `trim`, ¿exacto?
7. **(Sergio) Recordatorio:** ¿solo email o también notificación in-app (patrón dual)?
8. **(Sergio) Cron:** hora del schedule (UTC) y si 1 corrida diaria alcanza.

---

## Apéndice — REPORTAR (respuestas directas)

1. **Estado actual:** **A** — 1 de 4 reqs ya es gate (req 3, vía R-DIR, incluso más estricto); reqs 1/2/4 tienen campos pero ninguna validación los aplica. El "2 de 5" real es el checklist de onboarding (`onboarding.ts:87`): 2 campos presentes, sin umbrales. **B** — casi nada: existen `createdAt` y `verificadoAfip/At`, pero **no** hay estado de cuenta recuperable, **no** hay cron, **no** hay `CRON_SECRET`, **no** hay plantilla de email, y `User.active` **no bloquea login** (`auth.ts:37-58`).
2. **Vidriera mínima:** **se solapa con R-DIR solo en el req 3** (R-DIR lo cubre y de más). La extiende con reqs 1/2/4. Se evalúan **en render** (filtro post-query del directorio), no como campo calculado — sin migración, consistente con lo existente.
3. **Gracia:** modelo de datos = **migración nueva** (enum `EstadoCuenta` + `inactivadaAt` + `recordatorioCuitEnviadoAt`); reusar `active` colisiona con el baneo admin. Cron = `api/cron/gracia-cuit` (`nodejs`+`force-dynamic`), protegido por `Authorization: Bearer ${CRON_SECRET}`, 1 entrada diaria en `vercel.json#crons`. Idempotencia = filtrar por `estadoCuenta=ACTIVA` (inactivación no-op repetible) + `recordatorioCuitEnviadoAt` con **ventana** día 50 (no día exacto).
4. **Testear sin 60 días:** función pura `clasificarGracia(taller, ahora)` con fechas fabricadas (Vitest) + seed retrodatado (51 y 61 días) golpeando el endpoint con el secret en preview + override `GRACIA_DIAS` por env. Idempotencia y recuperación cubiertas por test.
5. **Plan de PRs:** **A y B separables.** A (sin migración) primero; B = B0 (Gerardo: schema+enforcement) → B1 (cron+email+tests).
6. **Decisiones necesarias:** las 8 de §6 — las bloqueantes para arrancar B son **#1 (qué bloquea inactiva)**, **#2 (schema)** y **#5 (backfill al lanzar)**.
