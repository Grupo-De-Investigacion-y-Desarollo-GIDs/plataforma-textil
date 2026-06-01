# U-07: Regla anti-incesto (bloque multi-rol)

## Contexto

Parte del bloque **U** (multi-rol "Airbnb": un mismo `User` puede operar como
taller **y** como marca — ver `v4-u-01-analisis-multi-rol-airbnb.md` y
`v4-u-02-schema-multi-rol.md`).

**Regla de negocio (RN del U-01):** un `User` que tiene perfil de taller **y**
de marca no puede cotizar pedidos que él mismo publicó como marca. Es decir, no
puede "cotizarse a sí mismo".

Bajo el modelo **1-CUIT-1-User** (un usuario = un CUIT = un par Taller/Marca),
basta con comparar `userId` para detectar el caso: si el dueño del pedido
(`pedido.marca.userId`) es el mismo usuario que está cotizando
(`session.user.id`), es auto-cotización y debe bloquearse.

> **Nota de alcance:** el discovery global preveía guard en `POST /api/cotizaciones`
> + filtros de UI. Durante este discovery puntual apareció un **segundo punto de
> entrada** no contemplado: la **auto-invitación** desde el flujo de marca
> (`POST /api/pedidos/[id]/invitaciones`). Se incluye abajo. Ver "Casos borde".

## Que construir

### 1. Guard server-side en `POST /api/cotizaciones` (autoritativo)

Es **el guard que importa** — la UI puede esquivarse, este no.

- **Archivo:** `src/app/api/cotizaciones/route.ts`
- **Ubicación exacta:** dentro del handler `POST`, justo **después** de obtener
  el pedido y validar que existe (actual línea 110,
  `if (!pedido) return errorNotFound('pedido')`) y **antes** de la validación de
  `visibilidad === 'INVITACION'` (línea 115).
- **Dato ya en scope:** `pedido.marca.userId` ya viene en el `select`
  (línea 108). No hace falta modificar la query.
- **Lógica:**
  ```ts
  if (pedido.marca.userId === session.user.id) {
    return errorResponse({
      code: 'AUTO_COTIZACION',
      message: 'No podés cotizar un pedido que publicaste como marca.',
      status: 403,
    })
  }
  ```
- Reusar el helper `errorResponse` ya importado (línea 8). Código nuevo
  `AUTO_COTIZACION` (string libre, consistente con los existentes
  `TALLER_NO_VERIFICADO`, `INVALID_INPUT`).

### 2. Guard server-side en `POST /api/pedidos/[id]/invitaciones` (auto-invitación)

Evita que una marca invite a su **propio** taller a cotizar (que crearía una
invitación que después el guard #1 rechazaría igual, pero deja la UI inconsistente).

- **Archivo:** `src/app/api/pedidos/[id]/invitaciones/route.ts`
- **Ubicación:** la query `talleresConUser` (línea 39-42) ya incluye
  `user: { select: { id: true, email: true } }`. Después de cargarla y antes de
  `idsValidos`, filtrar/rechazar el taller cuyo `user.id === pedido.marca.userId`.
- **Decisión de comportamiento (pendiente de Gerardo):** ante un taller propio
  en la selección, ¿se **rechaza toda la operación** con error (consistente con
  el patrón "no verificados" de línea 44-50) o se **filtra silenciosamente**?
  Recomendación: rechazar con mensaje claro, igual que `noVerificados`, porque
  es un error del usuario y conviene que lo vea.
  ```ts
  const propios = talleresConUser.filter(t => t.user.id === pedido.marca.userId)
  if (propios.length > 0) {
    return NextResponse.json(
      { error: 'No podés invitarte a vos mismo a cotizar tu propio pedido.' },
      { status: 400 }
    )
  }
  ```

### 3. Filtros de UI (no autoritativos — UX, evitan que el usuario llegue al error)

**3a. Detalle de pedido — ocultar `CotizarForm`**
- **Archivo:** `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`
- La query del pedido (línea 17-20) hoy **no** trae `marca.userId`. Agregarlo al
  `select` de `marca`.
- En la cascada de render (línea 85-120), agregar una rama: si
  `pedido.marca.userId === session.user.id`, mostrar un `Card` informativo
  ("Este es un pedido que publicaste como marca — no podés cotizarlo") **en lugar**
  del `CotizarForm`. Va **antes** de la rama `!taller.verificadoAfip`.

**3b. Listado de disponibles — excluir pedidos propios**
- **Archivo:** `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
- En el `where` (línea 21-28), agregar `NOT: { marca: { userId: session.user.id } }`.
  Ojo: combinar con el `NOT` existente de `tipoPrenda` (usar `AND` o un array de
  `NOT`). Aplica también al `count` (mismo `where`). El usuario logueado ya está
  disponible vía `session.user.id` (línea 16-17).

**3c. Invitador de marca — excluir taller propio de la búsqueda**
- **Archivo:** `src/marca/componentes/invitar-a-cotizar.tsx` (consume
  `/api/talleres?q=...`).
- El guard #2 ya cubre el server. Para UX, el endpoint `/api/talleres` podría
  excluir el taller del propio usuario de los resultados. **Marcar como opcional**
  — requiere tocar `/api/talleres` (fuera del scope mínimo). Si se omite, el
  usuario igual recibe el error claro del guard #2 al confirmar.

## Datos

- **Sin cambios de schema.** No se toca Prisma.
- Campos ya existentes usados: `Pedido.marca.userId` (relación `Marca.userId`),
  `Taller.user.id`, `session.user.id`.
- Comparación por `userId` (no por CUIT): suficiente bajo 1-CUIT-1-User. Ver
  casos borde.

## Prescripciones tecnicas

- **Patrón:** guards server-side en API routes (no server actions). Reusar los
  helpers existentes: `errorResponse` en cotizaciones, `NextResponse.json(...,
  { status })` en invitaciones (mantener el estilo de cada archivo).
- **No** agregar dependencias.
- **No** modificar queries salvo agregar `marca.userId` al `select` del detalle
  (3a) — los demás datos ya están en scope.
- Mensajes de error en español, tono de la plataforma (ver mensajes vecinos).
- El guard #1 es **obligatorio**; #2 obligatorio; #3a y #3b recomendados (UX);
  #3c opcional.

## Casos borde

1. **User con SOLO rol taller** (no tiene Marca) → ningún pedido tiene
   `marca.userId === session.user.id` → la regla nunca dispara. Flujo normal.
2. **User con ambos perfiles mirando un pedido de OTRA marca** →
   `marca.userId !== session.user.id` → puede cotizar normal.
3. **¿`userId` alcanza o conviene comparar `User.cuit`?** Bajo 1-CUIT-1-User,
   `userId` alcanza y es lo correcto: un mismo User es la misma persona/CUIT.
   Comparar CUIT solo importaría si dos `User` distintos compartieran CUIT, lo
   que el modelo prohíbe. **Confirmado: comparar `userId`.**
4. **Pedido por INVITACIÓN a sí mismo:** si por un bug previo existiera una
   `PedidoInvitacion` del taller propio, el guard #1 igual bloquea la cotización
   (corre después de validar existencia del pedido, antes de chequear invitación).
   El guard #2 previene crear ese estado a futuro.
5. **(Hallazgo nuevo del discovery)** **Auto-invitación:** sin el guard #2, una
   marca podía invitar a su propio taller; se creaba la invitación y el pedido
   aparecía en "disponibles" del taller, pero al cotizar saltaba el error. UX
   inconsistente. Cubierto por guard #2.
6. **ADMIN cotizando/invitando en nombre de otro:** el POST de cotizaciones exige
   `role === 'TALLER'` (línea 79), así que ADMIN no cotiza. En invitaciones, ADMIN
   omite el ownership (línea 27) pero el chequeo de "taller propio de la marca"
   sigue siendo correcto (compara contra `pedido.marca.userId`, no contra el admin).

## Criterio de aceptacion

- [ ] `POST /api/cotizaciones` devuelve **403 `AUTO_COTIZACION`** cuando
  `pedido.marca.userId === session.user.id`.
- [ ] Un taller cotizando un pedido de **otra** marca sigue funcionando (201).
- [ ] `POST /api/pedidos/[id]/invitaciones` devuelve **400** si se incluye el
  taller propio del dueño del pedido.
- [ ] Detalle de pedido propio: se muestra el aviso informativo, **no** el
  `CotizarForm`.
- [ ] Listado "Pedidos disponibles" **no** lista pedidos propios del usuario.
- [ ] User con solo rol taller: sin cambios de comportamiento.
- [ ] `npm run build` y e2e existentes verdes.

## Tests

- **Vitest / e2e (Playwright):**
  - Cotizar pedido propio → 403 `AUTO_COTIZACION` (caso central).
  - Cotizar pedido ajeno → 201 (regresión, no romper flujo normal).
  - Invitar taller propio → 400.
  - Listado disponibles de un user multi-rol no incluye su pedido.
  - User solo-taller: cotiza normal (regresión).
- Setup: requiere un fixture de `User` con Taller **y** Marca (modelo multi-rol).
  Si el seed actual no lo tiene, el spec de implementación debe crear el fixture
  (coordinar con `v4-u-02-schema-multi-rol`).
