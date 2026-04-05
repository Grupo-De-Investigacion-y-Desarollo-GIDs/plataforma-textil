# Spec: Schema Escenario 2 — EstadoPedido + Cotizacion

- **Semana:** 2
- **Asignado a:** Gerardo
- **Dependencias:** Ninguna — puede hacerse desde el dia 1 de la semana 2

---

## 1. Contexto

El Escenario 2 requiere que las marcas puedan publicar pedidos para que los talleres los vean y coticen. Hoy el pedido solo tiene BORRADOR como estado inicial y no hay modelo de cotizacion. Ademas hay un bug en `admin/marcas/[id]` que referencia estados `PUBLICADO` y `EN_PROCESO` que no existen en el enum, y otros 3 archivos que no incluyen los estados `PUBLICADO` ni `ESPERANDO_ENTREGA` en sus label/variant maps. Hay que corregir todo en esta migracion.

---

## 2. Que construir

- Agregar `PUBLICADO` al enum `EstadoPedido`
- Agregar campos de descripcion y presupuesto al modelo `Pedido`
- Nuevo modelo `Cotizacion` con ciclo de vida completo
- Corregir labels y variants de `EstadoPedido` en los 4 archivos afectados
- Reescribir logica de transiciones de estado en la API de pedidos

---

## 3. Datos

### Cambio 1 — enum EstadoPedido

```prisma
enum EstadoPedido {
  BORRADOR
  PUBLICADO
  EN_EJECUCION
  ESPERANDO_ENTREGA
  COMPLETADO
  CANCELADO
}
```

### Cambio 2 — modelo Pedido, agregar campos

```prisma
model Pedido {
  // campos existentes se mantienen igual
  descripcion     String?   @db.Text
  presupuesto     Float?
  cotizaciones    Cotizacion[]
}
```

### Nuevo modelo — Cotizacion

```prisma
enum EstadoCotizacion {
  ENVIADA
  ACEPTADA
  RECHAZADA
  VENCIDA
}

model Cotizacion {
  id          String            @id @default(cuid())
  pedidoId    String
  tallerId    String
  precio      Float
  plazoDias   Int
  proceso     String
  mensaje     String?           @db.Text
  estado      EstadoCotizacion  @default(ENVIADA)
  venceEn     DateTime
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  pedido      Pedido            @relation(fields: [pedidoId], references: [id], onDelete: Cascade)
  taller      Taller            @relation(fields: [tallerId], references: [id], onDelete: Cascade)

  @@unique([pedidoId, tallerId])
  @@map("cotizaciones")
}
```

Nota sobre `proceso`: es texto libre (String). El catalogo de procesos lo carga el admin desde `/admin/procesos` como referencia, pero el taller escribe el proceso libremente en la cotizacion. En una fase posterior se puede migrar a FK opcional contra `ProcesoProductivo` si se necesita filtrar cotizaciones por proceso.

### Relacion inversa en Taller

Agregar en `model Taller` (linea 215, antes de `@@map("talleres")`):

```prisma
cotizaciones          Cotizacion[]
```

### Migracion

```bash
npx prisma migrate dev --name agregar_publicado_y_cotizaciones
```

---

## 4. Prescripciones tecnicas

### Archivo a modificar — `src/app/(admin)/admin/marcas/[id]/page.tsx`

**Linea 69** — filtro de pedidos activos (bug: usa `PUBLICADO` y `EN_PROCESO` que no existian):

```typescript
// Antes (incorrecto):
['BORRADOR', 'PUBLICADO', 'EN_PROCESO'].includes(p.estado)

// Despues:
['BORRADOR', 'PUBLICADO', 'EN_EJECUCION', 'ESPERANDO_ENTREGA'].includes(p.estado)
```

**Lineas 76-88** — label map y variant map completos:

```typescript
const estadoLabel: Record<string, string> = {
  BORRADOR: 'Borrador',
  PUBLICADO: 'Publicado',
  EN_EJECUCION: 'En ejecucion',
  ESPERANDO_ENTREGA: 'Esperando entrega',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}
const estadoVariant: Record<string, 'success' | 'warning' | 'muted' | 'default' | 'error'> = {
  BORRADOR: 'muted',
  PUBLICADO: 'warning',
  EN_EJECUCION: 'default',
  ESPERANDO_ENTREGA: 'warning',
  COMPLETADO: 'success',
  CANCELADO: 'error',
}
```

### Archivo a modificar — `src/app/(admin)/admin/pedidos/page.tsx`

**Lineas 24-28** — variant map, agregar estados faltantes:

```typescript
const estadoVariant: Record<string, 'success' | 'warning' | 'default' | 'muted' | 'error'> = {
  BORRADOR: 'muted',
  PUBLICADO: 'warning',
  EN_EJECUCION: 'default',
  ESPERANDO_ENTREGA: 'warning',
  COMPLETADO: 'success',
  CANCELADO: 'error',
}
```

**Lineas 83-87** — select de filtro, agregar opciones:

```typescript
{ value: '', label: 'Todos los estados' },
{ value: 'BORRADOR', label: 'Borrador' },
{ value: 'PUBLICADO', label: 'Publicado' },
{ value: 'EN_EJECUCION', label: 'En ejecucion' },
{ value: 'ESPERANDO_ENTREGA', label: 'Esperando entrega' },
{ value: 'COMPLETADO', label: 'Completado' },
{ value: 'CANCELADO', label: 'Cancelado' },
```

**Linea 74** — stat card, agregar contador de publicados:

```typescript
<StatCard value={String(byEstado('PUBLICADO'))} label="Publicados" variant="warning" />
```

### Archivo a modificar — `src/app/(marca)/marca/pedidos/page.tsx`

**Lineas 11-21** — variant map y label map:

```typescript
const estadoVariant: Record<string, 'default' | 'warning' | 'success' | 'muted' | 'error'> = {
  BORRADOR: 'muted',
  PUBLICADO: 'warning',
  EN_EJECUCION: 'default',
  ESPERANDO_ENTREGA: 'warning',
  COMPLETADO: 'success',
  CANCELADO: 'error',
}
const estadoLabel: Record<string, string> = {
  BORRADOR: 'Borrador',
  PUBLICADO: 'Publicado',
  EN_EJECUCION: 'En ejecucion',
  ESPERANDO_ENTREGA: 'Esperando entrega',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}
```

**Linea 24** — allowed estados:

```typescript
const allowedEstados = ['BORRADOR', 'PUBLICADO', 'EN_EJECUCION', 'ESPERANDO_ENTREGA', 'COMPLETADO', 'CANCELADO'] as const
```

**Lineas 76-78** — agregar contador de publicados:

```typescript
const publicados = pedidos.filter(p => p.estado === 'PUBLICADO').length
```

**Lineas 145-148** — select de filtro, agregar opciones:

```typescript
<option value="BORRADOR">Borrador</option>
<option value="PUBLICADO">Publicado</option>
<option value="EN_EJECUCION">En ejecucion</option>
<option value="ESPERANDO_ENTREGA">Esperando entrega</option>
<option value="COMPLETADO">Completado</option>
<option value="CANCELADO">Cancelado</option>
```

### Archivo a modificar — `src/app/(marca)/marca/pedidos/[id]/page.tsx`

**Lineas 14-17** — variant map:

```typescript
const estadoVariant: Record<string, 'default' | 'warning' | 'success' | 'error' | 'muted'> = {
  BORRADOR: 'muted',
  PUBLICADO: 'warning',
  EN_EJECUCION: 'default',
  ESPERANDO_ENTREGA: 'warning',
  COMPLETADO: 'success',
  CANCELADO: 'error',
}
```

**Lineas 21-24** — label map:

```typescript
const estadoLabel: Record<string, string> = {
  BORRADOR: 'Borrador',
  PUBLICADO: 'Publicado',
  EN_EJECUCION: 'En ejecucion',
  ESPERANDO_ENTREGA: 'Esperando entrega',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}
```

**Lineas 28-38** — orden label y variant maps (para ordenes de manufactura), agregar ESPERANDO_ENTREGA si falta.

**Lineas 43-45** — timeline steps, agregar PUBLICADO:

```typescript
const pasos = [
  { key: 'BORRADOR', label: 'Borrador' },
  { key: 'PUBLICADO', label: 'Publicado' },
  { key: 'EN_EJECUCION', label: 'En ejecucion' },
  { key: 'ESPERANDO_ENTREGA', label: 'Esperando entrega' },
  { key: 'COMPLETADO', label: 'Completado' },
]
```

Nota: las condiciones de estado en la UI de este archivo (lineas 178-191 que muestran botones segun `pedido.estado === 'BORRADOR'`) se actualizan en el spec `semana2-publicacion-pedidos-ui`, no en este spec. Este spec solo corrige los maps de labels y variants.

### Archivo a modificar — `src/app/api/pedidos/[id]/route.ts`

Reescribir la logica de transiciones de estado en el PUT handler (lineas 72-109). Reemplazar el bloqueo actual que solo permite CANCELADO por transiciones explicitas:

```typescript
// Reemplazar lineas 72-109 con:
if (body.estado) {
  const pedidoActual = await prisma.pedido.findUnique({
    where: { id },
    select: { estado: true },
  })
  if (!pedidoActual) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  // Transiciones validas
  const transiciones: Record<string, string[]> = {
    BORRADOR: ['PUBLICADO', 'CANCELADO'],
    PUBLICADO: ['CANCELADO'],
    EN_EJECUCION: ['ESPERANDO_ENTREGA', 'CANCELADO'],
    ESPERANDO_ENTREGA: ['COMPLETADO', 'CANCELADO'],
    COMPLETADO: [],
    CANCELADO: [],
  }

  const permitidas = transiciones[pedidoActual.estado] ?? []
  if (!permitidas.includes(body.estado)) {
    return NextResponse.json(
      { error: `No se puede pasar de ${pedidoActual.estado} a ${body.estado}` },
      { status: 400 }
    )
  }

  // Si se cancela, cascadear a ordenes no completadas
  if (body.estado === 'CANCELADO') {
    const [pedido] = await prisma.$transaction([
      prisma.pedido.update({
        where: { id },
        data: { estado: 'CANCELADO' },
      }),
      prisma.ordenManufactura.updateMany({
        where: {
          pedidoId: id,
          estado: { notIn: ['COMPLETADO', 'CANCELADO'] },
        },
        data: { estado: 'CANCELADO' },
      }),
    ])
    return NextResponse.json(pedido)
  }

  const pedido = await prisma.pedido.update({
    where: { id },
    data: { estado: body.estado },
  })
  return NextResponse.json(pedido)
}
```

Nota: la transicion `PUBLICADO → EN_EJECUCION` no esta en la lista de transiciones manuales — es automatica y se activa al asignar el primer taller (se implementa en el spec `semana2-publicacion-pedidos-ui` cuando se acepta una cotizacion). Si un admin necesita forzar esta transicion, puede hacerlo desde Prisma Studio.

---

## 5. Casos borde

- **Un pedido PUBLICADO no puede volver a BORRADOR** — la transicion es unidireccional. Si la marca quiere editar, debe cancelar y crear uno nuevo.
- **Si una cotizacion se acepta, el pedido pasa automaticamente a EN_EJECUCION** — esta logica se implementa en el spec de publicacion, no aca.
- **El constraint `@@unique([pedidoId, tallerId])` evita que un taller cotice dos veces el mismo pedido** — segundo intento retorna error P2002.
- **`venceEn` se calcula al crear la cotizacion:** `DateTime.now() + 7 dias` por defecto — la logica de creacion esta en el spec de publicacion.
- **PUBLICADO → EN_EJECUCION manual bloqueado** — solo ocurre automaticamente al aceptar cotizacion. Esto evita que una marca marque como "en ejecucion" sin taller asignado.
- **Pedidos existentes con `descripcion: null` y `presupuesto: null`** — ambos campos son nullable, no afecta datos existentes.

---

## 6. Criterio de aceptacion

- [ ] Migracion corre sin errores
- [ ] `prisma.pedido.create` con estado `PUBLICADO` funciona sin error
- [ ] `prisma.cotizacion.create` funciona con los campos requeridos
- [ ] El constraint unico `pedidoId + tallerId` funciona — segundo intento retorna error P2002
- [ ] En `admin/marcas/[id]` los pedidos `EN_EJECUCION` aparecen como activos (bug corregido)
- [ ] En `admin/pedidos` el select de filtro tiene los 6 estados
- [ ] En `marca/pedidos` el select de filtro tiene los 6 estados
- [ ] En `marca/pedidos/[id]` la timeline muestra los 5 pasos incluyendo PUBLICADO
- [ ] La API `PUT /api/pedidos/[id]` con `{ estado: 'PUBLICADO' }` funciona desde BORRADOR
- [ ] La API `PUT /api/pedidos/[id]` con `{ estado: 'BORRADOR' }` desde PUBLICADO retorna 400
- [ ] Variantes de Badge usan solo variantes validas (`muted`, `warning`, `default`, `success`, `error`)
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Correr migracion y verificar en Supabase que existen la tabla `cotizaciones` y el enum tiene `PUBLICADO`
2. Desde Prisma Studio: crear un pedido con estado `PUBLICADO`
3. Desde Prisma Studio: crear una cotizacion vinculada al pedido
4. Intentar crear segunda cotizacion del mismo taller al mismo pedido — debe fallar con P2002
5. Verificar en `/admin/marcas/[id]` que pedidos `EN_EJECUCION` aparecen en la seccion activos
6. Verificar en `/admin/pedidos` que el filtro muestra los 6 estados
7. Verificar en `/marca/pedidos` que los badges usan las variantes correctas
8. Desde Thunder Client: `PUT /api/pedidos/[id]` con `{ estado: 'PUBLICADO' }` desde BORRADOR → 200
9. Desde Thunder Client: `PUT /api/pedidos/[id]` con `{ estado: 'BORRADOR' }` desde PUBLICADO → 400
