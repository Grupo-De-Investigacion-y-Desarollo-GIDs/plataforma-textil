# U-06: Clasificación automática de pedidos (COMERCIAL / SUBCONTRATACION)

## Contexto

Parte del bloque **U** (multi-rol "Airbnb": un mismo `User` puede operar como
taller **y** como marca — ver `v4-u-01-analisis-multi-rol-airbnb.md` y
`v4-u-02-schema-multi-rol.md`).

**Necesidad de negocio:** el Estado / coordinación necesita distinguir dos tipos
de demanda en la plataforma:

- **COMERCIAL** — un pedido publicado por una marca "pura" (el dueño del pedido
  *solo* tiene perfil de Marca). Es demanda real del mercado hacia los talleres.
- **SUBCONTRATACION** — un pedido publicado por un `User` que *también* es taller
  (tiene perfil de Taller además del de Marca). Es un taller que terceriza
  trabajo, no demanda comercial nueva.

La clasificación es **automática e invisible** para quien publica: se calcula en
el servidor al crear el pedido y queda persistida. No hay UI de selección, ni se
muestra a marcas ni a talleres. Solo el Estado/coordinación la ve en reportes
agregados.

Bajo el modelo **1-CUIT-1-User** la clasificación se decide mirando si el **dueño
del pedido** (el `User` propietario de la `Marca`) tiene además un `Taller`:

- el dueño tiene `Taller` → **SUBCONTRATACION**
- el dueño solo tiene `Marca` → **COMERCIAL**

> **Independencia de U-03/U-04:** la regla keya sobre la **existencia** de un
> `Taller` para ese `userId`, no sobre `activeMode` ni sobre ningún modo activo.
> Por eso U-06 no depende de U-03/U-04 y se puede implementar ya.

## Que construir

### 1. Schema — enum + campo en `Pedido`

- **Archivo:** `prisma/schema.prisma`
- **Enum nuevo** (junto a los otros enums de pedidos, p. ej. cerca de
  `EstadoPedido` línea 29 / `VisibilidadPedido` línea 95):
  ```prisma
  enum TipoPedido {
    COMERCIAL
    SUBCONTRATACION
  }
  ```
- **Campo nuevo** en `model Pedido` (línea 439). Aditivo, con default seguro:
  ```prisma
  tipo TipoPedido @default(COMERCIAL)
  ```
  Ubicarlo junto a `estado` / `visibilidad` (líneas 448-449) para mantener
  agrupados los campos de clasificación.

### 2. Migración aditiva

- **No tocar a mano la DB.** Generar con Prisma:
  ```bash
  npx prisma migrate dev --name agregar_tipo_pedido
  ```
- Resultado esperado: crea el tipo enum `TipoPedido` y agrega la columna `tipo`
  a `pedidos` con default `'COMERCIAL'`. Como tiene default, **los pedidos
  existentes quedan COMERCIAL** sin pasos extra (ver Backfill).
- Recordar: Prisma CLI lee `.env` (no `.env.local`) — ya configurado en el repo.

### 3. Lógica de clasificación al crear el pedido

- **Archivo:** `src/app/api/pedidos/route.ts`, handler `POST` (único punto de
  creación en runtime; confirmado por discovery — el resto de `pedido.create`
  está solo en `prisma/seed.ts`).
- **Punto exacto:** entre la resolución de `resolvedMarcaId` (líneas 83-98) y el
  `prisma.pedido.create` (línea 100).
- **Cómo resolver el dueño (`ownerUserId`):** OJO — el clasificador es el dueño
  de la **Marca**, *no* `session.user.id`. En el rol ADMIN un admin puede crear
  el pedido en nombre de otra marca, así que hay que usar el `userId` de la marca
  resuelta, no el del que dispara la request.
  - Rama **MARCA** (líneas 84-90): la query de la marca hoy selecciona solo
    `{ id: true }`. Agregar `userId`:
    ```ts
    const marca = await prisma.marca.findUnique({
      where: { userId: session.user.id },
      select: { id: true, userId: true },
    })
    ...
    // ownerUserId = marca.userId  (== session.user.id, pero lo usamos explícito)
    ```
  - Rama **ADMIN** (líneas 91-95): **camino no usado actualmente.** El discovery
    confirmó que ningún UI ni test postea `/api/pedidos` como ADMIN — la rama es
    scaffolding simétrico (espejo del role-switch del `GET`), introducida en
    `a710bde` sin spec que la pida; el diseño canaliza la manipulación admin de
    pedidos por Prisma Studio (ver `semana2-schema-e2.md`). **No se testea.** Se
    clasifica **defensivamente** igual, con una query para obtener el dueño:
    ```ts
    // Rama no usada en producción (admin no publica vía API). Clasificación
    // defensiva. Limpieza de la rama pendiente en PR de housekeeping aparte.
    const marcaTarget = await prisma.marca.findUnique({
      where: { id: body.marcaId },
      select: { id: true, userId: true },
    })
    if (!marcaTarget) return errorNotFound('marca')
    // ownerUserId = marcaTarget.userId
    ```
- **Clasificación:**
  ```ts
  const ownerTaller = await prisma.taller.findFirst({
    where: { userId: ownerUserId },
    select: { id: true },
  })
  const tipo = ownerTaller ? 'SUBCONTRATACION' : 'COMERCIAL'
  ```
- **Persistir:** agregar `tipo` al objeto `data` del `prisma.pedido.create`
  (línea 100):
  ```ts
  data: {
    ...,
    tipo,
  }
  ```
- **No exponer en la respuesta de forma destacada:** el `create` ya devuelve el
  objeto completo, lo cual es aceptable (el campo no es secreto, solo no se
  muestra en UI de marca/taller). No agregar lógica de ocultamiento.

### 4. Backfill de pedidos existentes

- **Default cubre el caso base:** la migración deja todos los pedidos previos en
  `COMERCIAL`. Para la mayoría del dataset actual (seed single-role) eso es
  correcto.
- **Recalculo opcional (recomendado, idempotente):** marcar como
  `SUBCONTRATACION` los pedidos cuyo dueño de marca ya tiene taller. Script SQL
  one-shot dentro de la misma migración o como `prisma db execute`:
  ```sql
  UPDATE pedidos p
  SET tipo = 'SUBCONTRATACION'
  FROM marcas m
  JOIN talleres t ON t."userId" = m."userId"
  WHERE p."marcaId" = m.id;
  ```
  Hoy no hay usuarios duales en el seed, así que este UPDATE no cambia filas,
  pero deja la data consistente para cuando llegue el fixture dual (U-08) y para
  prod si ya hubiera algún user dual.

### 5. Visualización — DIFERIDA (fuera del alcance de U-06)

**Decisión tomada (Gerardo):** U-06 entrega **solo el campo** — clasificación +
backfill. **La vista de reporte queda diferida a Etapa 2/3**, donde la narrativa
defina quién la consume (COORD / POLÍTICO). No se construye card en este spec.

El campo queda **persistido y correcto**, listo para cuando se especifique la
vista. Candidatas ya relevadas para ese spec futuro (no implementar ahora):

- `src/app/(admin)/admin/reportes/page.tsx` — patrón `groupBy` + `StatCard`;
  encajaría `prisma.pedido.groupBy({ by: ['tipo'], _count: true })`.
- `src/app/(estado)/estado/sector/page.tsx` — patrón `BarChart` para rol ESTADO.

## Datos

- **Tabla afectada:** `pedidos` — columna nueva `tipo` (`TipoPedido`, default
  `COMERCIAL`, NOT NULL por el default).
- **Enum nuevo:** `TipoPedido { COMERCIAL, SUBCONTRATACION }`.
- **Queries nuevas:**
  - `prisma.taller.findFirst({ where: { userId: ownerUserId }, select: { id: true } })`
    al crear (clasificación).
  - rama ADMIN: `prisma.marca.findUnique` para obtener `userId` del dueño.
  - opcional reporte: `prisma.pedido.groupBy({ by: ['tipo'], _count: true })`.
- **Sin cambios** en `Cotizacion`, `OrdenManufactura`, ni en los flujos de
  taller/marca existentes.

## Prescripciones técnicas

- **Schema es exclusivo de Gerardo** (regla CLAUDE.md): el cambio de
  `schema.prisma` + la migración los hace Gerardo. Sergio implementa la lógica de
  `route.ts` y, si se decide, el card de reporte.
- **No** crear UI de selección de tipo. **No** aceptar `tipo` desde `body` (no
  confiar en el cliente — la clasificación es autoritativa server-side).
- Mantener el estilo de errores del archivo (`errorResponse` / `errorNotFound`
  de `@/compartido/lib/api-errors`).
- La query de clasificación va **antes** del `create`; no usar transacción (una
  sola escritura).
- Reusar el patrón `StatCard` / `groupBy` ya presente en `admin/reportes` si se
  hace el card.

## Casos borde

| Caso | Comportamiento esperado |
|------|-------------------------|
| Marca pura crea pedido | `tipo = COMERCIAL` |
| User dual (Marca + Taller) crea pedido como marca | `tipo = SUBCONTRATACION` |
| ADMIN crea pedido en nombre de una marca dual | `tipo = SUBCONTRATACION` (keya sobre el dueño de la marca, no sobre el admin) |
| ADMIN crea pedido en nombre de una marca pura | `tipo = COMERCIAL` |
| `body.marcaId` inexistente (ADMIN) | `errorNotFound('marca')` antes de clasificar |
| Pedidos preexistentes | `COMERCIAL` por default; `SUBCONTRATACION` si corre el backfill y el dueño tiene taller |
| User crea marca, luego crea taller, luego publica pedido | `SUBCONTRATACION` (taller ya existe al momento de crear) |
| User publica pedido y *después* se da de alta como taller | El pedido queda `COMERCIAL` (clasificación es en el momento de crear, no reactiva). Aceptable: no se reclasifica retroactivamente. |

## Criterio de aceptación

- [ ] `schema.prisma` tiene el enum `TipoPedido` y el campo `Pedido.tipo`
      (`@default(COMERCIAL)`).
- [ ] Migración `agregar_tipo_pedido` aplicada; `pedidos.tipo` existe en DB con
      default `COMERCIAL`.
- [ ] Al crear un pedido como marca pura → `tipo = COMERCIAL`.
- [ ] Al crear un pedido cuyo dueño tiene taller → `tipo = SUBCONTRATACION`
      (verificable cuando exista fixture dual; hasta entonces, test unitario de la
      rama de clasificación con un user dual creado ad-hoc).
- [ ] La clasificación **no** se puede forzar desde `body` (se ignora cualquier
      `tipo` enviado por el cliente).
- [ ] Backfill (si se corre) no rompe pedidos existentes.
- [ ] Vista de reporte **diferida** — fuera del alcance de U-06 (Etapa 2/3).
- [ ] `npm run build` + typecheck en verde (Vercel CI autoritativo).

## Tests

- **Unit/integración (Vitest):** la rama de clasificación — dado un `ownerUserId`
  con taller → `SUBCONTRATACION`; sin taller → `COMERCIAL`. Mockeando
  `prisma.taller.findFirst`.
- **E2E (Playwright):**
  - **Regresión (con seed single-role actual):** marca pura crea pedido → al
    leerlo en DB / reporte, `tipo = COMERCIAL`. No rompe el flujo de creación
    existente.
  - **Caso dual (`test.fixme`, TODO U-08):** requiere `User` con Marca + Taller
    (no existe en el seed). Crear pedido como ese user → `SUBCONTRATACION`.
    Dejar trackeado como `fixme` igual que en `e2e/u-07-anti-incesto.spec.ts`.
- **No forzar un fixture dual a medias** que rompa otros tests (misma disciplina
  que U-07). El fixture dual llega en U-08.

---

Refs: `.claude/specs/v4-u-01-analisis-multi-rol-airbnb.md`,
`.claude/specs/v4-u-02-schema-multi-rol.md`,
`.claude/specs/v4-u-07-anti-incesto.md`
