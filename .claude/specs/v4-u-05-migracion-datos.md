# SPEC U-05: Migración de datos existentes (poblar `roles[]` / `activeMode` + cerrar la fuente)

> **Plantilla V4.** Spec puramente técnico-interno (sin UI). Las 14 secciones están completas.
> SECCIÓN 0 (pre-flight) y SECCIÓN 13 (selectores críticos) ya se completaron durante el discovery.

---

## 0. Pre-flight checks (BLOQUEANTE)

### 0.1 Verificación de dependencias

- [x] **U-02** (campos `roles[]`/`activeMode`/ARCA en `User`) — MERGEADO. Migración `20260519200000_agregar_multirol_y_arca_a_user`.
- [x] **U-03** (auth multi-rol, `rolesEfectivos`/`modoActivo` en `roles.ts`) — MERGEADO.
- [x] **U-04** (toggle) — MERGEADO. Primer user con `roles[]` poblado (Julieta, seed).
- [~] **U-09** (PR #398, abierto) — **dependencia blanda de secuenciación.** U-09 ya arregla la *fuente* del bug de validaciones en `/registro/completar` y reescribe esa transacción. El backfill de validaciones de U-05 (paso secundario) debe correr **después** de mergear U-09 para no chocar el mismo archivo. El backfill de `roles[]`/`activeMode` (núcleo) NO depende de U-09.
- [x] Branch base `develop` actualizada (sincronizada en discovery).

### 0.2 Verificación de schema y datos

- [x] `User.role UserRole @default(TALLER)` — **NOT nullable** (no hay `role=null` posible).
- [x] `User.roles UserRole[] @default([])` · `User.activeMode UserRole?` — confirmados en `schema.prisma:157-158`.
- [x] `Validacion` — campos reales: `id(cuid)`, `tallerId`, `tipo(String)`, `tipoDocumentoId`, `estado(EstadoValidacion @default(NO_INICIADO))`. **`@@unique([tallerId, tipo])`** (la unicidad es por `tipo`, NO por `tipoDocumentoId`). `tipo` = `TipoDocumento.nombre` (ver `registro/route.ts:147`).
- [x] `enum EstadoValidacion`: `NO_INICIADO | PENDIENTE | COMPLETADO | VENCIDO | RECHAZADO`.
- [x] `TipoDocumento.activo Boolean @default(true)` — el conjunto de validaciones por taller = `tipos activos` (hoy **7** en dev).

### 0.3 Discovery de impacto técnico

**Hallazgo central (cambia el framing del spec):** la migración U-02 **ya hizo el backfill** de `roles`/`activeMode` desde `role` en su momento (`20260519200000.../migration.sql`):

```sql
UPDATE "users" SET "roles" = ARRAY["role"::"UserRole"];
UPDATE "users" SET "activeMode" = "role";
```

El problema **se regenera** porque la *fuente* nunca setea estos campos:
- `registro/route.ts:85` (`user.create`) → NO setea `roles`/`activeMode`.
- `registro/completar/route.ts:56` (`user.update`) → solo setea `{ role, registroCompleto }`.
- `prisma/seed.ts` → solo el user dual (Julieta) tiene `roles`/`activeMode` explícitos; los otros 24 creates no.

Por eso: en **dev re-seedeado** vuelven a quedar `[]`/null; en **prod**, los users que existían al deploy de U-02 quedaron sanos por el backfill de build, pero **cada registro nuevo posterior** vuelve a entrar con `[]`/null.

→ **U-05 NO es solo una migración de datos: es (a) un backfill idempotente + (b) el cierre de la fuente.** Sin (b), el dato se vuelve a desincronizar.

**Por qué importa hoy si no rompe nada visible:** el callback `jwt` normaliza en el borde de sesión (`rolesEfectivos` deriva desde `role`), así que un single-rol con `[]`/null se comporta idéntico a uno sano. Es un **safety net que hoy es load-bearing**: si se toca el callback, los users con `[]`/null quedan rotos. U-05 mueve la verdad al dato (DB) y deja el fallback como cinturón-y-tiradores.

### 0.4 Verificación de patrones

- [x] **Precedentes de data migration en SQL:** `20260428100001_backfill_aprobado_por_validacion` (UPDATE...FROM), `20260428200001_seed_reglas_nivel` (INSERT...ON CONFLICT), y el propio backfill de U-02. Patrón establecido y aceptado.
- [x] **Build aplica migraciones:** `package.json` → `"build": "prisma migrate deploy && prisma generate && next build"`. Vercel corre `migrate deploy` contra **prod** en cada build → una migración SQL en `prisma/migrations/` se aplica **automáticamente** en el próximo deploy. El guard anti-PROD NO afecta `build` (es legítimo).
- [x] **Guards CLI:** `scripts/check-db-ref.ts` bloquea `db:migrate/push/reset` contra prod; bypass `ALLOW_PROD=1`. Patrón a reusar para el script de auditoría.

### 0.5 Reporte pre-flight

**TODO pasa.** Única condición de orden: el paso secundario (validaciones) se ejecuta tras mergear U-09 (#398). Se procede.

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **Tipo** | bug fix / data migration / hardening |
| **Bloque** | U (multi-rol) |
| **Categoría** | MVP no negociable (integridad de datos) |
| **Estimación** | ~3h |
| **Riesgo** | Bajo (backfill idempotente, guardado, fail-safe en build) |
| **Dependencias** | U-02, U-03, U-04 (mergeados). U-09 #398 (secuencia: mergear antes del paso de validaciones) |
| **Branch** | `feature/v4-u-05-migracion-datos` |
| **Validación sectorial** | N/A |
| **Perspectivas relevantes** | N/A — técnico-interno |
| **Autor** | Gerardo Breard |
| **Fecha de creación** | 2026-06-05 |
| **Aprobado por** | Pendiente (Gerardo revisa este spec) |
| **Issue GitHub vinculado** | N/A |
| **PR vinculado** | Pendiente |

---

## 2. Contexto

### Por qué existe este spec

U-02 introdujo `roles[]`/`activeMode` y los backfilleó una vez. Pero ni `registro`, ni `registro/completar`, ni `seed` setean esos campos al crear users → el dato se desincroniza de nuevo (dev en cada seed; prod en cada registro nuevo). Hoy 16/17 users en dev tienen `roles=[]`/`activeMode=null`. El sistema no se rompe porque el callback `jwt` lo deriva desde `role`, pero ese fallback es la única red: si se toca, esos users quedan rotos. Además, cualquier código futuro que lea `User.roles` directo de DB (no a través de la sesión normalizada) ve datos inconsistentes.

U-09 destapó además un bug pre-existente colateral: talleres creados vía `/registro/completar` quedaron **sin `Validacion`** (sin checklist). U-09 arregla la fuente; queda evaluar el backfill del dato histórico.

### Qué resuelve

1. Pone la verdad en la DB: todo user single-rol tendrá `roles=[role]` y `activeMode=role` (invariante `role == activeMode`, `role ∈ roles`).
2. Cierra la fuente: registro, completar y seed dejan de generar users desincronizados.
3. (Secundario, gated) Repara talleres históricos sin checklist de validaciones.

### Documentación de referencia

- `prisma/migrations/20260519200000_agregar_multirol_y_arca_a_user/migration.sql` — el backfill original (a espejar).
- `src/compartido/lib/roles.ts` — `rolesEfectivos`/`modoActivo` (el fallback que hoy sostiene el dato sucio).
- Memoria `project_u03_auth_multirol` — "Para U-04 habrá que poblar `roles[]` en DB al otorgar un segundo rol" (este spec lo formaliza).

---

## 3. Validación interdisciplinaria

**N/A — Spec puramente técnico-interno sin impacto interdisciplinario.**

---

## 4. Qué construir

### Funcionalidades

**A. Backfill núcleo (`roles[]` / `activeMode`)** — migración SQL idempotente que aplica build automáticamente:
- `roles = ARRAY[role]` donde `cardinality(roles) = 0`.
- `activeMode = role` donde `activeMode IS NULL`.
- No toca filas ya sanas (no pisa decisiones deliberadas como la de Julieta).

**B. Cierre de la fuente (código)** — para que el dato no se vuelva a ensuciar:
- `registro/route.ts` (`user.create`) setea `roles: [role]`, `activeMode: role`.
- `registro/completar/route.ts` (`user.update`) agrega `roles: [role]`, `activeMode: role` (coordinar con U-09, que reescribe esa transacción).
- `prisma/seed.ts` produce users sanos (normalización post-seed o por-create).

**C. Script de auditoría/dry-run** (`scripts/u05-audit.ts`):
- `--dry-run` (default): imprime el cuadro de estado (counts antes), NO escribe.
- `--verify`: chequea post-condiciones (0 con `roles=[]`, 0 con `activeMode=null`, invariante OK) y sale ≠0 si falla.
- Guard anti-PROD reusando `check-db-ref.ts`; bypass `ALLOW_PROD=1` para correr el dry-run contra prod y dimensionar antes del deploy.

**D. Backfill validaciones (secundario, gated, post-U-09)** — `scripts/u05-backfill-validaciones.ts`:
- Crea las `Validacion` `NO_INICIADO` faltantes (por cada `TipoDocumento.activo`) para talleres sin checklist.
- Idempotente: solo inserta el par `(tallerId, tipo)` que no existe.
- `--dry-run` default + `--apply` + `ALLOW_PROD=1`. Reusa prisma (cuids correctos), mismo criterio que `registro/route.ts:140-151`.

### Wireframes

N/A — sin UI.

---

## 5. Datos

### Migración SQL (paso A — núcleo)

`prisma/migrations/<timestamp>_u05_backfill_roles_activemode/migration.sql`:

```sql
-- U-05: re-sincroniza roles[]/activeMode con el escalar role.
-- Idempotente y guardado: solo toca filas desincronizadas, nunca pisa decisiones
-- deliberadas (dual-role, activeMode elegido por el toggle). Espeja el backfill de U-02.

-- roles[] vacío -> [role]
UPDATE "users"
   SET "roles" = ARRAY["role"::"UserRole"]
 WHERE cardinality("roles") = 0;

-- activeMode null -> role  (invariante role == activeMode)
UPDATE "users"
   SET "activeMode" = "role"
 WHERE "activeMode" IS NULL;
```

> El guard `cardinality("roles") = 0` protege a Julieta (`["TALLER","MARCA"]`). El guard `activeMode IS NULL` protege cualquier modo elegido por el toggle.

### Backfill validaciones (paso D — vía script prisma, NO SQL crudo)

Lógica del script (no SQL, para usar cuids y el conjunto `activo` exacto):

```ts
const tiposActivos = await prisma.tipoDocumento.findMany({ where: { activo: true }, select: { id: true, nombre: true } })
const talleres = await prisma.taller.findMany({ select: { id: true, validaciones: { select: { tipo: true } } } })
for (const t of talleres) {
  const existentes = new Set(t.validaciones.map(v => v.tipo))
  const faltantes = tiposActivos.filter(td => !existentes.has(td.nombre))   // dedupe por (tallerId, tipo) = unique
  if (!faltantes.length) continue
  // dry-run: log y continue; apply: createMany NO_INICIADO
  await prisma.validacion.createMany({
    data: faltantes.map(td => ({ tallerId: t.id, tipo: td.nombre, tipoDocumentoId: td.id, estado: 'NO_INICIADO' as const })),
  })
}
```

> Maneja el caso parcial (taller con algunas validaciones pero no todas), no solo el de 0.

### Cambios en schema

**Ninguno.** U-05 no toca `schema.prisma` (solo datos + código de fuente).

---

## 6. Prescripciones técnicas

- **Backfill núcleo = migración SQL** en `prisma/migrations/` (NO script tsx), para que `prisma migrate deploy` lo aplique solo en el build de Vercel contra prod. Espejar literalmente los UPDATE de U-02 (ya probados seguros).
- **Backfill validaciones = script tsx** con prisma (NO SQL crudo): para generar cuids correctos y leer `TipoDocumento.activo` dinámicamente. SQL crudo necesitaría `gen_random_uuid()` (id no-cuid) y hardcodear tipos.
- **Idempotencia obligatoria** en todo: los UPDATE llevan `WHERE` de desincronización; el script de validaciones filtra por `(tallerId, tipo)` inexistente. Correr 2 veces = no-op.
- **Cierre de fuente — invariante:** en los 3 puntos (registro, completar, seed) setear SIEMPRE `roles: [role]` y `activeMode: role` juntos, manteniendo `role == activeMode` y `role ∈ roles`. NO usar `push`; setear el array completo.
- **completar (coordinación U-09):** si #398 mergea primero (esperado), aplicar el cambio sobre la transacción interactiva nueva de U-09. Si U-05 se adelanta, aplicar sobre la `$transaction([...])` actual. Rebasar tras el merge de #398.
- **seed:** preferir una normalización post-seed (un `updateMany`/loop al final que espeje la migración) sobre tocar los 24 creates uno por uno — menos ruido, misma garantía.
- **Script de auditoría:** reusar `scripts/check-db-ref.ts` para el guard anti-PROD; `--dry-run` es el default (nunca escribir sin flag explícito).
- **Logging:** cada update/insert del script loguea `email`/`tallerId` afectado; counts pre y post.

### Librerías

Ninguna nueva. `tsx`, `@prisma/client`, `dotenv` ya están.

---

## 7. Edge cases

| # | Caso límite | Comportamiento esperado |
|---|---|---|
| 1 | User `role=TALLER` **sin** entidad `Taller` (registro abandonado — ej. `srodriguezunq@gmail.com`) | Se migra igual: `roles=[TALLER]`, `activeMode=TALLER`. El toggle no aparece (1 rol); dashboards vacíos por falta de entidad es ortogonal y pre-existente. **NO** se especial-casa ni se bloquea. |
| 2 | Users de equipo `ADMIN`/`ESTADO`/`CONTENIDO` | Se migran uniforme: `roles=[role]`. Toggle oculto (1 rol). Consistencia de dato. |
| 3 | User dual ya sano (Julieta, `roles=["TALLER","MARCA"]`, `activeMode` elegido) | **No se toca** (guards `cardinality=0` / `IS NULL`). |
| 4 | `role` inesperado/null | Imposible: `role` es NOT NULL con default `TALLER`. Sin rama de bloqueo necesaria. |
| 5 | Migración corre 2+ veces (re-deploy) | No-op por los `WHERE` de desincronización. |
| 6 | Taller con checklist parcial (algunas validaciones, no todas) | El script de paso D completa solo las faltantes (dedupe por `(tallerId, tipo)`). |
| 7 | Prod tiene N talleres-sin-validaciones >> dev | El `--dry-run` lo dimensiona antes de aplicar; si el universo es grande/anómalo, se escinde a **U-05b**. Decisión informada por el count real. |
| 8 | Concurrencia (registro nuevo mientras corre el backfill) | El registro nuevo ya entra sano (cierre de fuente aplicado en el mismo PR); el backfill solo toca filas viejas desincronizadas. Sin carrera. |

---

## 8. Validación sectorial

**N/A — Diferida a validación grupal post-MVP V4.**

---

## 9. Criterios de aceptación

- [ ] Build de producción pasa (`npm run build`) — incluye `migrate deploy` con la migración nueva.
- [ ] Tests unit + E2E existentes verdes.
- [ ] Sin warnings nuevos de TS/ESLint.
- [ ] Migración SQL idempotente verificada (correr dev 2×: segunda = 0 filas afectadas).
- [ ] Post-condición en dev: **0** users con `roles=[]`, **0** con `activeMode=null`, invariante `role==activeMode` y `role ∈ roles` para el 100%.
- [ ] `registro`, `registro/completar` y `seed` setean `roles`/`activeMode` (tests unit lo cubren).
- [ ] `db:seed` produce un dataset 100% sano (re-seed no reintroduce `[]`/null).
- [ ] Script de auditoría: `--dry-run` no escribe; `--verify` pasa post-migración.
- [ ] Paso D (validaciones): dry-run de prod reportado; aplicado solo tras mergear U-09; talleres reportados quedan con checklist completo.
- [ ] Handover actualizado.
- [ ] PR mergeado a develop + merge a main.

---

## 10. Tests (flujos)

### Flujo 1: Backfill idempotente (núcleo)
- **Rol:** N/A (migración).
- **Precondiciones:** dev con users `roles=[]`/`activeMode=null` (estado actual).
- **Pasos:** aplicar migración → correr `u05-audit --verify` → re-aplicar migración.
- **Resultado:** 1ª corrida sincroniza; verify pasa; 2ª corrida = 0 filas afectadas.
- **Tipo:** manual + script.

### Flujo 2: Re-seed produce dataset sano
- **Pasos:** `npm run db:seed` (dev) → `u05-audit --verify`.
- **Resultado:** 0 users con `roles=[]`/`activeMode=null` sin necesidad de correr la migración aparte.
- **Tipo:** manual + script.

### Flujo 3: Registro nuevo entra sano
- **Rol:** no autenticado → TALLER.
- **Pasos:** registro de un taller nuevo → inspeccionar el user creado.
- **Resultado:** `roles=["TALLER"]`, `activeMode="TALLER"` desde el create.
- **Tipo:** automatizado (unit del handler) + opcional e2e.

### Flujo 4: Dual no se pisa
- **Precondición:** Julieta `roles=["TALLER","MARCA"]`, `activeMode="MARCA"`.
- **Pasos:** aplicar migración.
- **Resultado:** Julieta intacta.
- **Tipo:** automatizado (unit sobre la lógica del WHERE) + manual.

### Flujo 5: Validaciones backfill (post-U-09)
- **Precondición:** ≥1 taller sin checklist.
- **Pasos:** `u05-backfill-validaciones --dry-run` (reporta) → `--apply`.
- **Resultado:** cada taller queda con 1 `Validacion NO_INICIADO` por tipo activo; segunda corrida = 0.
- **Tipo:** manual + script; unit del filtro de faltantes.

### Flujo 6: Edge — taller sin entidad
- **Precondición:** user `role=TALLER` sin `Taller`.
- **Resultado:** `roles=["TALLER"]`/`activeMode="TALLER"`; no crashea; sin entidad sigue sin entidad.
- **Tipo:** manual.

---

## 11. Impacto en handover

- **`.claude/specs/handover/`** → documentar: U-05 cierra la deuda de U-02 (fuente + backfill); el patrón "setear `roles`/`activeMode` al crear user" queda como invariante para futuros flujos de alta de usuarios.
- Memoria `project_u03_auth_multirol` → marcar U-05 al mergear.

---

## 12. Riesgos y mitigaciones

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| 1 | Colisión del cambio en `completar` con U-09 (#398) | Media | Bajo | Secuenciar: mergear #398 primero, rebasar U-05. Documentado en 0.1 / 6. |
| 2 | Universo prod de talleres-sin-validaciones grande/anómalo | Baja | Medio | `--dry-run` contra prod antes de aplicar; escindir a U-05b si supera umbral (~50) o muestra rarezas. |
| 3 | SQL de migración mal formado | Baja | Bajo (fail-safe) | Falla el `migrate deploy` → falla el build → **no hay deploy** (no corrompe prod). Espeja UPDATE ya probados en U-02. |
| 4 | Olvido de aplicar el cierre de fuente → dato se re-ensucia | Media | Medio | Tests unit de registro/completar/seed + criterio "re-seed produce dataset sano". |
| 5 | Script escribe en prod sin querer | Baja | Alto | `--dry-run` default; guard `check-db-ref.ts`; escritura requiere `--apply` + `ALLOW_PROD=1`. |

---

## 13. Selectores críticos (NO MODIFICAR en implementación)

| Selector / Concepto | Dónde se usa | Riesgo si se rompe |
|---|---|---|
| `UPDATE users SET roles=ARRAY[role]` con `WHERE cardinality(roles)=0` | migración SQL | Sin el WHERE, pisa al dual (Julieta) y corrompe multi-rol |
| `WHERE activeMode IS NULL` | migración SQL | Sin el guard, pisa el modo elegido por el toggle (U-04) |
| `tipo = TipoDocumento.nombre` + `@@unique([tallerId, tipo])` | script validaciones | Usar `tipoDocumentoId` en vez de `tipo` rompe la dedupe y duplica/falla |
| `roles: [role], activeMode: role` (invariante) | registro / completar / seed | Romperlo regenera el dato sucio o viola `role==activeMode` |
| `rolesEfectivos`/`modoActivo` (`roles.ts`) | callback jwt | El fallback que hoy sostiene el dato `[]`/null; no tocar hasta que el dato esté migrado |
| `"build": "prisma migrate deploy ..."` | `package.json` | Si cambia, la migración deja de auto-aplicarse en prod |

---

## 14. Plan de implementación

1. **Migración SQL núcleo (20 min)** — crear `prisma/migrations/<ts>_u05_backfill_roles_activemode/migration.sql` espejando U-02. Aplicar en dev (`prisma migrate dev`). Commit atómico.
2. **Script de auditoría (45 min)** — `scripts/u05-audit.ts` con `--dry-run`/`--verify` + guard anti-PROD. Verificar dev post-migración. Commit.
3. **Cierre de fuente (45 min)** — `registro/route.ts` + `registro/completar/route.ts` (coordinar U-09) + `seed.ts` (normalización post-seed). Commit.
4. **Tests (40 min)** — unit: WHERE de la migración (dual no se pisa), registro/completar/seed setean los campos; verify post-condiciones. Commit.
5. **Backfill validaciones (30 min, post-U-09)** — `scripts/u05-backfill-validaciones.ts` (dry-run/apply/guard). Dry-run prod → reporte → apply. Commit.
6. **Aplicar + verificar + PR (20 min)** — `db:seed` dev limpio, `u05-audit --verify`, PR, dry-run prod reportado, merge.

**Total estimado: ~3h 20min** (sin contar la espera del merge de U-09).

---

**Fin del SPEC U-05**

> QA correspondiente: `.claude/auditorias/QA_v4-u-05-migracion-datos.md` (mayormente verificación de dato/script; poca UI).
