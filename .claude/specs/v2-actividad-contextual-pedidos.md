# Spec: Actividad contextual en pedidos — timeline por entidad

- **Semana:** v2 / UX
- **Asignado a:** Sergio (UI) + Gerardo (query de logs)
- **Origen:** Issue #33 — observación de Sergio como analista funcional
- **Dependencias:** ninguna

---

## ANTES DE ARRANCAR

- [ ] `v2-epica-notificaciones` mergeado
- [ ] `v2-log-niveles-bidireccional` mergeado
- [ ] Tabla `LogActividad` existe con campos `accion`, `detalles`, `timestamp`, `userId`

---

## 1. Contexto

Hoy `/admin/notificaciones` mezcla dos cosas distintas en el mismo lugar:
- **Comunicaciones del admin** — mensajes redactados y enviados a segmentos
- **Historial del sistema** — logs automáticos de flujos (pedido publicado, cotización recibida, etc.)

Esta mezcla confunde al admin y no le sirve a los actores del flujo comercial (marca y taller) que no tienen visibilidad de lo que pasó en su pedido u orden.

La solución es mover el historial al contexto donde ocurre: cada pedido muestra su propia actividad, cada orden muestra la suya.

---

## 2. Qué construir

### 2.1 — Limpiar `/admin/notificaciones`
Eliminar el tab "Notificaciones del sistema". La página queda con un solo tab: "Comunicaciones del admin". El admin que necesite ver logs del sistema usa `/admin/logs` que ya existe.

### 2.2 — Sección "Actividad" en `/marca/pedidos/[id]`
Timeline de eventos del pedido visible para la marca. Muestra qué pasó y cuándo desde que se creó el pedido.

### 2.3 — Sección "Actividad" en `/taller/pedidos/[id]`
Timeline de eventos de la orden visible para el taller. Muestra qué pasó con su orden específica.

---

## 3. Datos

### Query de actividad para marca (pedido)

```typescript
// src/app/(marca)/marca/pedidos/[id]/page.tsx
const actividad = await prisma.logActividad.findMany({
  where: {
    accion: {
      in: [
        'PEDIDO_PUBLICADO',
        'COTIZACION_RECIBIDA',
        'COTIZACION_ACEPTADA',
        'COTIZACION_RECHAZADA',
        'ORDEN_CREADA',
        'PROGRESO_ACTUALIZADO',
        'ORDEN_COMPLETADA',
        'PEDIDO_COMPLETADO',
        'PEDIDO_CANCELADO',
      ]
    },
    detalles: { path: ['pedidoId'], equals: pedidoId }
  },
  orderBy: { timestamp: 'desc' },
  take: 50,
  include: { user: { select: { name: true } } }
})
```

### Query de actividad para taller (orden)

```typescript
// src/app/(taller)/taller/pedidos/[id]/page.tsx
const actividad = await prisma.logActividad.findMany({
  where: {
    accion: {
      in: [
        'ORDEN_ASIGNADA',
        'ORDEN_ACEPTADA',
        'ORDEN_RECHAZADA',
        'PROGRESO_ACTUALIZADO',
        'ORDEN_COMPLETADA',
      ]
    },
    detalles: { path: ['ordenId'], equals: ordenId }
  },
  orderBy: { timestamp: 'desc' },
  take: 20,
  include: { user: { select: { name: true } } }
})
```

**Nota:** si `LogActividad` no registra estos eventos todavía, Gerardo agrega los logs en los endpoints correspondientes antes de que Sergio construya la UI.

---

## 4. Prescripciones técnicas

### 4.1 — Eliminar tab en `/admin/notificaciones`

Archivo: `src/app/(admin)/admin/notificaciones/page.tsx`

- Eliminar el tab "Notificaciones del sistema" y su lógica de filtro
- Eliminar el `searchParams.tab` — la página queda sin tabs
- El título de la página pasa a ser "Comunicaciones" en lugar de "Notificaciones"
- Agregar nota al pie: *"Para ver la actividad del sistema, ir a [Logs del sistema](/admin/logs)"*

### 4.2 — Componente `ActivityTimeline`

Archivo nuevo: `src/compartido/componentes/activity-timeline.tsx`

Componente reutilizable para marca y taller:

```tsx
interface ActivityEvent {
  id: string
  accion: string
  timestamp: Date
  userName?: string
  detalles?: Record<string, unknown>
}

interface ActivityTimelineProps {
  eventos: ActivityEvent[]
  emptyMessage?: string
}
```

**Renderizado de cada evento:**
- Ícono según tipo de acción (check verde para completados, info azul para transiciones, warning amarillo para rechazos)
- Texto descriptivo en español argentino (ver tabla de labels abajo)
- Fecha relativa (ej: "hace 2 horas") con tooltip de fecha exacta
- Nombre del usuario si aplica (ej: "Lucía Fernández aprobó")

**Labels por acción:**

| Acción | Label para marca | Label para taller |
|--------|-----------------|-------------------|
| `PEDIDO_PUBLICADO` | "Pedido publicado — en búsqueda de taller" | — |
| `COTIZACION_RECIBIDA` | "Cotización recibida de [taller]" | — |
| `COTIZACION_ACEPTADA` | "Cotización aceptada — orden creada" | "Tu cotización fue aceptada" |
| `COTIZACION_RECHAZADA` | "Cotización rechazada" | "Tu cotización fue rechazada" |
| `ORDEN_ASIGNADA` | — | "Orden asignada a tu taller" |
| `ORDEN_ACEPTADA` | "Taller aceptó la orden" | "Aceptaste la orden" |
| `ORDEN_RECHAZADA` | "Taller rechazó la orden" | "Rechazaste la orden" |
| `PROGRESO_ACTUALIZADO` | "Progreso actualizado a [N]%" | "Actualizaste el progreso a [N]%" |
| `ORDEN_COMPLETADA` | "Orden completada por [taller]" | "Marcaste la orden como completada" |
| `PEDIDO_COMPLETADO` | "Pedido completado" | — |
| `PEDIDO_CANCELADO` | "Pedido cancelado" | — |

### 4.3 — Integrar en `/marca/pedidos/[id]`

Archivo: `src/app/(marca)/marca/pedidos/[id]/page.tsx`

Agregar sección "Actividad" después de las órdenes de manufactura:

```tsx
{actividad.length > 0 && (
  <Card>
    <h2 className="font-overpass font-bold text-brand-blue mb-3">
      Actividad del pedido
    </h2>
    <ActivityTimeline eventos={actividad} />
  </Card>
)}
```

Si no hay actividad registrada todavía (pedido recién creado), no mostrar la sección.

### 4.4 — Integrar en `/taller/pedidos/[id]`

Archivo: `src/app/(taller)/taller/pedidos/[id]/page.tsx`

Misma lógica que 4.3 pero con la query de orden y los labels del taller:

```tsx
{actividad.length > 0 && (
  <Card>
    <h2 className="font-overpass font-bold text-brand-blue mb-3">
      Actividad de tu orden
    </h2>
    <ActivityTimeline eventos={actividad} emptyMessage="Sin actividad registrada." />
  </Card>
)}
```

---

## 5. Casos borde

- **Pedido sin actividad en logs** — la sección no aparece (condicional `actividad.length > 0`)
- **Log con `detalles` null** — el componente maneja `detalles?.progreso ?? ''` sin crashear
- **Usuario eliminado** — mostrar "Sistema" si `userName` es null
- **Muchos eventos** — límite de 50 para marca, 20 para taller. Si supera, mostrar "Ver historial completo" que lleva a `/admin/logs` (solo para admin — para marca/taller no mostrar el link)

---

## 6. Criterios de aceptación

- [ ] Tab "Notificaciones del sistema" eliminado de `/admin/notificaciones`
- [ ] Nota al pie en `/admin/notificaciones` con link a `/admin/logs`
- [ ] Componente `ActivityTimeline` creado y reutilizable
- [ ] Marca ve sección "Actividad del pedido" en `/marca/pedidos/[id]`
- [ ] Taller ve sección "Actividad de tu orden" en `/taller/pedidos/[id]`
- [ ] Labels en español argentino según tabla
- [ ] Sección no aparece si no hay actividad
- [ ] Build sin errores de TypeScript

---

## 7. Tests

| # | Qué testear | Verificador |
|---|-------------|-------------|
| 1 | `/admin/notificaciones` no muestra tab "Sistema" | QA |
| 2 | Link a `/admin/logs` aparece al pie de `/admin/notificaciones` | QA |
| 3 | Marca ve actividad en pedido con historial | QA |
| 4 | Taller ve actividad en orden con historial | QA |
| 5 | Pedido sin actividad no muestra la sección | QA |
| 6 | Labels en español argentino correctos por tipo de evento | QA |
| 7 | Si `LogActividad` no tiene eventos del pedido, query devuelve array vacío sin error | DEV |
| 8 | Componente no crashea con `detalles: null` | DEV |
