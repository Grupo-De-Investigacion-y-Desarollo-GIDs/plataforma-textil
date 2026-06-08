# U-08: Tests E2E con seed dual (cierre del bloque U)

## 1. Contexto

Cierra el **bloque U** (multi-rol "Airbnb": un mismo `User` opera como taller **y**
marca — ver `v4-u-01-analisis-multi-rol-airbnb.md`). Las piezas funcionales ya
están construidas; falta la **cobertura E2E** que valide los flujos multi-rol de
extremo a extremo contra el deploy de preview.

Estado de las dependencias al momento de este discovery:

| Spec | Qué aporta | Estado |
|------|-----------|--------|
| U-03 | gating por membresía en `roles[]`, invariante `role==activeMode` | mergeado (#391/#393/#396) |
| U-04 | toggle "Operando como…" | mergeado (#397) |
| U-06 | clasificación COMERCIAL/SUBCONTRATACION | mergeado |
| U-07 | guards anti-incesto (cotización + invitación) | **código mergeado**, e2e en `fixme` |
| U-09 | agregar 2º rol desde `/cuenta` + fix D (skip ARCA) | **PR #398 abierto** (espera QA/merge) |
| U-05 | migración de datos | spec (#399), implementación pendiente de #398 |

**Decisión de negocio que U-08 valida (RN del U-01):** un `User` con perfil de
taller **y** marca no puede cotizar/invitarse a sí mismo en pedidos que él mismo
publicó como marca (comparación por `userId`, modelo 1-CUIT-1-User).

### Objetivo

Llevar la cobertura E2E del multi-rol de "parcial con placeholders" a "completa y
verde en CI", **sin duplicar** lo que ya cubren los tests unitarios.

---

## 2. Mapa de cobertura: existente vs gaps (PASOS 1-2)

### 2.1 Tests E2E existentes relacionados con multi-rol

| Archivo | Tests | Estado | Cubre |
|---------|-------|--------|-------|
| `e2e/u-04-toggle-multi-rol.spec.ts` | 4 | ✅ activos | Toggle visible solo multi-rol; cambio de modo Taller⇄Marca con redirect; persistencia de `activeMode` en DB; single-rol NO ve toggle. Usa fixture `dual` (Julieta). |
| `e2e/u-07-anti-incesto.spec.ts` | 1 activo + 3 `fixme` | ⚠️ parcial | Activo: taller viendo pedido **ajeno** no ve el aviso anti-incesto (regresión). `fixme`: cotizar propio→403, invitar taller propio→400, listado disponibles sin pedidos propios. |
| `e2e/u-06-clasificacion-pedidos.spec.ts` | 2 `fixme` | ⛔ bloqueado | marca pura→COMERCIAL y dual→SUBCONTRATACION **visibles en reporte**. Doble bloqueo: seed dual + vista de reporte (diferida Etapa 2/3). |
| `e2e/u-09-agregar-segundo-rol.spec.ts` | 1 | 🔜 activo al mergear #398 | Flujo completo single→dual desde `/cuenta` (vive en branch `feature/u-09-agregar-segundo-rol`). |

Fixture helper `e2e/helpers/auth.ts`: hoy define `dual` = `julieta.benitez@pdt.org.ar`.
**No** define `u09` en develop (llega con #398).

### 2.2 Cobertura por caso crítico (1-8 del discovery)

| # | Caso | E2E | Unit | Veredicto U-08 |
|---|------|-----|------|----------------|
| 1 | Toggle: single no ve, multi sí | ✅ u-04 | ✅ roles-multirol | **Cubierto.** No tocar. |
| 2 | Cambio de modo: redirect + persistencia | ✅ u-04 | ✅ u-04-active-mode | **Cubierto.** No tocar. |
| 3 | Agregar 2º rol single→dual | 🔜 u-09 (#398) | ✅ u-09-agregar-rol | **Cubierto** (al mergear #398). No tocar. |
| 4 | Gating de áreas: dual entra a `/taller` **Y** `/marca` | ❌ | ✅ roles-multirol (membresía) | **GAP → test E2E nuevo.** |
| 5 | Anti-incesto (cotizar/invitar/listar propios) | ⚠️ 3 `fixme` | ❌ **sin unit** | **GAP → des-fixmear + completar (3) + seed.** |
| 6 | Endpoints API con dual por membresía | ❌ | ✅ roles-multirol + u-03-pr2b | **Cubierto por unit. NO duplicar en E2E.** |
| 7 | `/cuenta` multi-rol: copy "Roles: X, Y" + cards de perfiles | ❌ (u-09 solo verifica que la card desaparece) | — | **GAP → test E2E nuevo.** |
| 8 | Skip ARCA del CUIT verificado (U-09 fix D) | ⚠️ indirecto (CUIT pre-cargado dispara el skip en u-09) | ✅ u-09-agregar-rol (4 casos D) | **Cubierto por unit. NO E2E dedicado.** |

**Resumen:** 5/8 cubiertos (1,2,3,6,8). Gaps reales: **4** y **7** (tests nuevos),
**5** (des-fixmear + completar 3). El caso **6** y **8** se cubren a nivel unit y
**no se duplican**. El caso de u-06 (reporte) queda fuera de scope (ver §5).

### 2.3 Duplicación / gaps detectados

- **Sin duplicación** entre unit y e2e hoy: unit cubre la matriz roles×membresía y
  la lógica de skip; e2e cubre flujos de UI. Mantener esa división.
- **Gap notable:** la regla anti-incesto (U-07) **no tiene NINGÚN test automatizado
  hoy** — ni unit ni e2e activo (solo el `fixme`). Es el riesgo de regresión más
  alto del bloque y la prioridad de U-08.
- **Bloqueador físico del seed:** la `Marca Benítez` de Julieta (`prisma/seed.ts`
  ~L609) se crea con `await prisma.marca.create({...})` **sin asignar a variable** y
  **no publica ningún pedido**. Sin un pedido publicado por esa marca es imposible
  testear anti-incesto E2E (no hay "pedido propio" que cotizar).

---

## 3. Diseño del seed dual ampliado (PASO 3)

### 3.1 Inventario actual de users multi-rol

| User | Origen | roles[] | Entidades | Mutable? |
|------|--------|---------|-----------|----------|
| Julieta Benítez | seed (estable) | `[TALLER, MARCA]` | Taller La Hormiga + Marca Benítez (sin pedido) | read-only en tests |
| u09.test (Tomás) | seed (#398) | `[TALLER]` → el test lo vuelve dual | Taller U09 | **mutado por u-09 e2e** |
| Roberto + otro | mutados a mano en DB de dev durante QA de Sergio | ad-hoc | — | **NO reproducible** (no está en seed) |

> Los users mutados a mano por Sergio **no se usan en U-08**: no están en el seed,
> no se reproducen en CI y contaminan resultados. U-08 se apoya solo en seed.

### 3.2 Cambios requeridos al seed

1. **Asignar la marca dual a variable y darle un pedido publicado.** En
   `prisma/seed.ts`, cambiar `await prisma.marca.create({...})` (Marca Benítez) por
   `const marcaBenitez = await prisma.marca.create({...})` y agregar:
   ```ts
   // U-08: pedido publicado por la marca del user dual (Julieta), para testear
   // anti-incesto. Julieta en modo TALLER NO debe poder cotizarlo ni verlo en
   // /taller/pedidos/disponibles (pedido.marca.userId === su propio userId).
   await prisma.pedido.create({
     data: {
       omId: 'OM-2026-DUAL1',
       marcaId: marcaBenitez.id,
       estado: 'PUBLICADO',
       visibilidad: 'PUBLICA',
       tipoPrenda: '...', cantidad: ..., // campos obligatorios según schema vigente
       // ...resto de campos requeridos, copiar de un pedido PUBLICADO existente
     },
   })
   ```
   (Gerardo ajusta los campos exactos contra el schema; Sergio NO toca el schema.)

2. **No se necesitan users dual adicionales.** Un dual estable (Julieta) cubre
   gating (#4), `/cuenta` multi-rol (#7) y anti-incesto-lectura (#5). El flujo
   single→dual (#3) usa su user dedicado u09.test (#398). Crear más users dual
   agrega superficie de contaminación sin cobertura nueva.

### 3.3 Aislamiento entre tests

- **Read-only sobre Julieta** (gating #4, `/cuenta` #7): no mutan estado → seguros
  en paralelo.
- **Anti-incesto (#5):** los POST devuelven 403/400 **sin crear** filas (cotización
  ni invitación) → no contaminan. Seguros.
- **u-09 (#3) MUTA `roles`/`activeMode` de u09.test** (single→dual, irreversible sin
  re-seed). En **CI es seguro**: cada corrida hace `db:seed` fresco. **Localmente NO
  es repetible** sin re-seed previo (la 2ª corrida no ve la `agregar-rol-card`).
  Documentar en el spec del test. No mezclar u09.test con otros tests.
- **Riesgo de `activeMode` persistente (Julieta):** u-04 deja a Julieta en modo
  **MARCA** al final (3er test). Cualquier test que asuma "Julieta arranca en
  TALLER" se contamina según el orden de ejecución.
  **Regla de aislamiento U-08:** los tests nuevos **no asumen `activeMode` inicial**;
  navegan al área que quieren probar de forma explícita (`page.goto('/taller')` /
  `'/marca'`) y, si el caso lo requiere, fijan el modo vía el toggle al principio del
  test. No depender del orden de archivos.

---

## 4. Decisiones de scope (PASO 4)

1. **Des-fixmear anti-incesto (u-07): SÍ, dentro de U-08.** Mismo dominio multi-rol,
   ya están trackeados como `fixme` "para U-08", y es la cobertura con mayor valor
   (hoy cero tests de la regla). _(Sugerencia del prompt aceptada.)_
2. **Matriz endpoints×roles: NO duplicar en E2E.** Ya cubierta por unit
   (`roles-multirol.test.ts` + `u-03-pr2b-ownership.test.ts`). U-08 agrega **un solo
   E2E representativo de gating** (#4), no la matriz completa. _(Sugerencia aceptada.)_
3. **E2E ataca el deploy de preview (no local): mantener.** El login en dev redirige
   a `/api/auth/error` (limitación conocida NextAuth v5 + Next 16, ya documentada en
   `helpers/auth.ts`). Correr contra `BASE_URL` de preview/prod, como hoy.
4. **u-06 (reporte) queda `fixme`, FUERA de scope.** Doble bloqueo: además del seed
   dual (que U-08 resuelve), depende de la **vista de reporte** que expone
   `Pedido.tipo`, diferida a Etapa 2/3. La lógica ya está cubierta por unit
   (`u-06-clasificacion-pedidos.test.ts`). Se deja el `fixme` con nota actualizada.
5. **Skip ARCA (#8): sin E2E dedicado.** Cubierto por los 4 casos D del unit de u-09
   y disparado indirectamente por el e2e de u-09 (CUIT pre-cargado). Agregar un E2E
   solo para el skip sería frágil (depende del modo mock de ARCA) sin cobertura nueva.

---

## 5. Lista concreta de tests a agregar / completar

### 5.1 NUEVO — `e2e/u-08-gating-dual.spec.ts` (caso #4)

- `dual entra a /taller (área taller cargada, sin redirect a login/unauthorized)`
- `dual entra a /marca (área marca cargada, sin redirect)`
- `single-rol (taller_bronce) entra a /taller pero /marca queda bloqueado`
  (reusar `assertAccesoBloqueado` de `helpers/auth.ts`)

### 5.2 NUEVO — `e2e/u-08-cuenta-multirol.spec.ts` (caso #7)

> Depende de la UI de `/cuenta` que trae #398 (cards "Tus perfiles" + copy
> "Roles:"/"Rol activo:"). No implementar antes del merge de #398.

- `multi-rol: /cuenta muestra "Roles: TALLER, MARCA" y "Rol activo: X" (líneas separadas)`
- `multi-rol: /cuenta muestra las cards de Taller La Hormiga y Marca Benítez`
- `multi-rol: /cuenta NO muestra la card "agregar rol"` (`agregar-rol-card` count 0)
- `single-rol: /cuenta muestra "Rol: X" (singular) y SÍ ofrece agregar rol`

### 5.3 COMPLETAR (des-fixmear) — `e2e/u-07-anti-incesto.spec.ts` (caso #5)

> Requiere el pedido publicado por Marca Benítez (§3.2). Patrón para POST
> autenticado: tras `loginAs(page, 'dual')`, usar **`page.request.post(...)`** —
> comparte las cookies de sesión del context de Playwright. Resolver primero el id
> del pedido propio (navegando o vía un GET) y, para el caso de cotización, asegurar
> `activeMode` TALLER al inicio del test (fijarlo con el toggle, no asumirlo).

- des-fixmear `cotizar pedido propio devuelve 403 AUTO_COTIZACION`
  (`POST /api/cotizaciones` con `pedidoId` del pedido de Marca Benítez → 403, body
  `code: 'AUTO_COTIZACION'`)
- des-fixmear `invitar al taller propio devuelve 400`
  (`POST /api/pedidos/[id]/invitaciones` incluyendo el taller propio → 400)
- des-fixmear `listado de disponibles no incluye los pedidos propios del user dual`
  (Julieta en modo TALLER en `/taller/pedidos/disponibles` no lista `OM-2026-DUAL1`)

### 5.4 Cambios de soporte

- `prisma/seed.ts`: asignar `marcaBenitez` + pedido publicado (§3.2). **Solo Gerardo**
  define los campos contra el schema.
- `e2e/helpers/auth.ts`: confirmar que `u09` ya existe tras #398; no agregar fixtures
  nuevos (Julieta y u09 alcanzan).
- `e2e/u-06-clasificacion-pedidos.spec.ts`: actualizar la nota del `fixme` aclarando
  que el bloqueo restante es la vista de reporte (no el seed, ya resuelto).

---

## 6. Casos borde

- **CI re-seedea fresco** ⇒ los tests mutantes (u-09) pasan; **localmente** una 2ª
  corrida sin re-seed falla. Documentarlo en el encabezado del test.
- **`activeMode` persistente de Julieta** entre tests ⇒ no asumir modo inicial
  (§3.3). Riesgo de flaky por orden de ejecución.
- **POST autenticado en Playwright** ⇒ usar `page.request` (cookies del context); el
  `request` fixture aislado no lleva la sesión.
- **Modo mock de ARCA en CI** ⇒ no construir asserts E2E sobre el skip de ARCA (#8).
- **Pedido propio debe estar `PUBLICADO` y `PUBLICA`** ⇒ si queda en BORRADOR, el
  guard de estado (`!== 'PUBLICADO'`) dispara antes que el anti-incesto y el test
  verde por la razón equivocada. Verificar el `code` del 403, no solo el status.

---

## 7. Criterio de aceptación

- [ ] `e2e/u-08-gating-dual.spec.ts` creado y verde (3 tests).
- [ ] `e2e/u-08-cuenta-multirol.spec.ts` creado y verde (4 tests).
- [ ] Los 3 `fixme` de `e2e/u-07-anti-incesto.spec.ts` des-fixmeados y verdes.
- [ ] `prisma/seed.ts`: Marca Benítez asignada a variable + pedido `OM-2026-DUAL1`
      publicado por ella.
- [ ] `e2e/u-06-...`: nota del `fixme` actualizada (sin des-fixmear).
- [ ] `unit + e2e + Vercel` verdes en el PR.
- [ ] Sin duplicar la matriz endpoints×roles en E2E (decisión §4.2).

## 8. Tests (meta)

La entrega **es** tests; el "test del test" es la corrida verde en CI contra preview
+ la verificación manual de que los 3 anti-incesto fallan correctamente si se
revierte el guard (sanity: comentar el guard de `cotizaciones/route.ts` localmente y
ver el test en rojo, luego restaurar). No commitear esa reversión.

## 9. Estimación

| Tarea | Estimación |
|-------|-----------|
| Seed dual ampliado (var + pedido publicado + idempotencia) | ~1h |
| `u-08-gating-dual.spec.ts` | ~1h |
| `u-08-cuenta-multirol.spec.ts` | ~1h |
| Des-fixmear 3 anti-incesto (POST autenticado es lo más fino) | ~2h |
| Estabilización CI / aislamiento / verde | ~1h |
| **Total** | **~6h** (coincide con el master) |

## 10. Dependencias y riesgos

- **BLOQUEANTE: merge de #398 (U-09).** Aporta (a) `u09.test` en seed, (b) la UI de
  `/cuenta` multi-rol que testea §5.2 y (c) el e2e de u-09 (caso #3). U-08 **no
  arranca** hasta que #398 esté en develop.
- **No bloqueante:** U-05 (migración) es independiente de U-08.
- **U-07 ya está en código** (guards en `cotizaciones/route.ts`,
  `pedidos/[id]/invitaciones/route.ts`, `taller/.../[id]/page.tsx`) ⇒ los tests solo
  los ejercitan, no implementan lógica.
- **Riesgo medio:** POST autenticado en Playwright + resolución del id del pedido
  propio (patrón `page.request`, §5.3).
- **Riesgo bajo-medio:** flakiness por `activeMode` persistente de Julieta (mitigado
  por la regla de aislamiento §3.3).
- **Riesgo bajo:** repetibilidad local del test mutante de u-09 (CI no afectado).
