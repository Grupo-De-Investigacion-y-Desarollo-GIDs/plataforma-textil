# Spec: Notificaciones accionables con deep links

**Versión:** v2
**Asignado a:** Gerardo (schema + backend) + Sergio (UI)
**Prioridad:** P1
**Resuelve:** H-19 — notificaciones sin leer sin acceso a la acción correspondiente

**Nota de coordinación:** este spec agrega campo `link` al modelo `Notificacion`. El spec `v2-epica-notificaciones.md` agrega `createdById` y `batchId` al mismo modelo. Si se implementan en la misma semana, **fusionar en una sola migración**.

---

## 1. Contexto

Las notificaciones existen pero son **texto inerte** — no llevan al usuario a ningún lado. El taller ve *"Recibiste una cotización"* pero no puede hacer click para ir al pedido. La bandeja de `/cuenta/notificaciones` renderiza `<article>` sin links ni acciones individuales.

Este spec agrega un campo `link` nullable y actualiza los 3 creadores de notificaciones para popularlo con la URL de destino. Al hacer click en una notificación con link, el usuario navega al destino y la notificación se marca como leída automáticamente.

**Badge dinámico en el sidebar: fuera de alcance** — el sidebar actual tiene `badge: 0` hardcodeado. Cambiar eso requiere modificar la arquitectura del layout (el count de no-leídas tiene que bajar desde un server component root). Post-piloto.

---

## 2. Cambios de schema

**Archivo:** `prisma/schema.prisma`

Agregar campo `link` a `Notificacion`:

```prisma
model Notificacion {
  // ... campos existentes ...
  link  String?   // URL de destino — null si la notificación no tiene acción
}
```

### Migración

```bash
# Si v2-epica-notificaciones aún no fue implementado — fusionar en una sola migración:
npx prisma migrate dev --name add_notificacion_link_created_by_batch

# Si v2-epica-notificaciones ya fue implementado — solo link:
npx prisma migrate dev --name add_notificacion_link
```

Es un campo `String?` nullable — no rompe filas existentes, no requiere reset.

---

## 3. Cambios de backend — Gerardo

### Acción 1 — Extender `NotificacionData` para incluir el `id` del pedido

**Archivo:** `src/compartido/lib/notificaciones.ts`

La interface actual (líneas 6-11) solo tiene `omId` en el objeto `pedido`:

```ts
// ANTES:
interface NotificacionData {
  cotizacion: { id: string; precio: number; plazoDias: number; proceso: string }
  taller: { nombre: string; userId?: string }
  marca: { nombre: string; userId?: string }
  pedido: { omId: string }
}

// DESPUÉS — agregar id:
interface NotificacionData {
  cotizacion: { id: string; precio: number; plazoDias: number; proceso: string }
  taller: { nombre: string; userId?: string }
  marca: { nombre: string; userId?: string }
  pedido: { omId: string; id: string }              // ← agregar id (cuid)
}
```

> **Por qué hace falta `id`**: la página `/marca/pedidos/[id]` usa `prisma.pedido.findUnique({ where: { id } })` con el cuid de Prisma, no con el `omId` (que es `OM-2026-XXXXXXXX`). Si el link usara `omId`, el destino daría 404.

### Acción 2 — Actualizar los callers de `notificarCotizacion`

Los callers viven en `src/app/api/cotizaciones/[id]/route.ts`. Buscar todas las llamadas a `notificarCotizacion` y agregar `id` al objeto `pedido`:

```ts
// ANTES (ejemplo línea ~76):
notificarCotizacion('ACEPTADA', {
  cotizacion,
  taller: { nombre: cotizacion.taller.nombre, userId: cotizacion.taller.userId },
  marca: { nombre: cotizacion.pedido.marca.nombre },
  pedido: { omId: cotizacion.pedido.omId },
})

// DESPUÉS:
notificarCotizacion('ACEPTADA', {
  cotizacion,
  taller: { nombre: cotizacion.taller.nombre, userId: cotizacion.taller.userId },
  marca: { nombre: cotizacion.pedido.marca.nombre },
  pedido: { omId: cotizacion.pedido.omId, id: cotizacion.pedidoId },  // ← agregar id
})
```

Hacer lo mismo para las llamadas de `RECHAZADA` (línea ~95 del mismo archivo). Y para `RECIBIDA` si existe otro caller.

### Acción 3 — Agregar `link` a `notificarCotizacion`

**Archivo:** `src/compartido/lib/notificaciones.ts`

En el `prisma.notificacion.create` (línea ~33-41), agregar el campo `link` según el tipo:

```ts
prisma.notificacion.create({
  data: {
    userId: destinoUserId,
    tipo: 'COTIZACION',
    titulo: titulos[tipo],
    mensaje: mensajes[tipo],
    canal: 'PLATAFORMA',
    // NUEVO: deep link según tipo de cotización
    link: tipo === 'RECIBIDA'
      ? `/marca/pedidos/${data.pedido.id}`      // marca ve el pedido con las cotizaciones
      : tipo === 'ACEPTADA'
        ? `/taller/pedidos`                      // taller ve sus pedidos
        : tipo === 'RECHAZADA'
          ? `/taller/pedidos`
          : null,
  },
}).catch((err) => console.error('Error creando notificacion:', err))
```

> **ACEPTADA y RECHAZADA** apuntan a `/taller/pedidos` (listing) porque el taller no tiene una vista de detalle de pedido propio. Si se crea `/taller/pedidos/[id]` en el futuro, cambiar el link.

### Acción 4 — Agregar `link` a `notificarTalleresCompatibles`

**Archivo:** `src/compartido/lib/notificaciones.ts`

En la función `notificarTalleresCompatibles`, dentro del loop de talleres (línea ~102-110):

```ts
prisma.notificacion.create({
  data: {
    userId: taller.user.id,
    tipo: 'PEDIDO_DISPONIBLE',
    titulo: `Nuevo pedido disponible: ${pedido.tipoPrenda}`,
    mensaje: `${pedido.marca.nombre} publicó un pedido de ${pedido.cantidad} unidades de ${pedido.tipoPrenda}. Podés cotizar!`,
    canal: 'PLATAFORMA',
    link: `/taller/pedidos/disponibles/${pedidoId}`,   // ← NUEVO
  },
}).catch(() => {})
```

El parámetro `pedidoId` ya está disponible como argumento de la función — es el cuid correcto.

### Acción 5 — Agregar `link` al endpoint del admin

**Archivo:** `src/app/api/admin/notificaciones/route.ts`

En el body destructuring, agregar `link`:

```ts
const { titulo, mensaje, tipo, canal, segmento, link } = body
```

En el `createMany` (o la versión actualizada del spec de notificaciones):

```ts
data: usuarios.map(u => ({
  userId: u.id,
  tipo: tipo || 'ADMIN_ENVIO',
  titulo,
  mensaje,
  canal: canal || 'PLATAFORMA',
  link: link || null,              // ← NUEVO: URL opcional del admin
  // + createdById y batchId si v2-epica-notificaciones está implementado
})),
```

### Acción 6 — Agregar `link` a la notificación de invitación (spec flujo comercial)

Cuando Gerardo implemente el endpoint `POST /api/pedidos/[id]/invitaciones` del spec `v2-epica-flujo-comercial-unificado`, agregar `link` al create de la notificación `PEDIDO_INVITACION`:

```ts
prisma.notificacion.create({
  data: {
    userId: taller.user.id,
    tipo: 'PEDIDO_INVITACION',
    titulo: `Te invitaron a cotizar: ${pedido.tipoPrenda}`,
    mensaje: `...`,
    canal: 'PLATAFORMA',
    link: `/taller/pedidos/disponibles/${id}`,   // ← id del pedido
  },
}).catch(...)
```

> Nota: este cambio solo aplica si el spec de flujo comercial se implementa. Si no, esta acción no existe.

---

## 4. Cambios de UI — Sergio

### ⚠️ Antes de arrancar

- [ ] Migración con campo `link` mergeada (Gerardo)
- [ ] `NotificacionData` extendida con `pedido.id` (Gerardo, Acción 1-2)
- [ ] Los 3 creadores de notificaciones populan `link` (Gerardo, Acciones 3-5)

### UI-1 — Separar `/cuenta/notificaciones` en server + client

La página actual es un server component con server actions. Para agregar `onClick` handlers (necesarios para mark-as-read al click), hay que separar:

#### Archivo 1: `src/app/(public)/cuenta/notificaciones/page.tsx` (server component)

Simplificar a fetch de datos + render del client component:

```tsx
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { NotificacionesLista } from './notificaciones-lista'

export default async function NotificacionesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=%2Fcuenta%2Fnotificaciones')

  const notificaciones = await prisma.notificacion.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return <NotificacionesLista notificaciones={notificaciones} />
}
```

#### Archivo 2: `src/app/(public)/cuenta/notificaciones/notificaciones-lista.tsx` (client component)

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, CheckCircle2 } from 'lucide-react'

interface Notificacion {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  link: string | null
  createdAt: string | Date
}

const labelPorTipo: Record<string, string> = {
  COTIZACION: 'Ver pedido',
  PEDIDO_DISPONIBLE: 'Ver pedido disponible',
  PEDIDO_INVITACION: 'Ver pedido',
  ADMIN_ENVIO: 'Ir al enlace',
}

function marcarLeida(notificacionId: string) {
  fetch('/api/notificaciones', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: notificacionId }),
  }).catch(() => {})
}

function marcarTodasLeidas() {
  return fetch('/api/notificaciones', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marcarTodas: true }),
  })
}

export function NotificacionesLista({ notificaciones: initial }: { notificaciones: Notificacion[] }) {
  const router = useRouter()
  const [notificaciones, setNotificaciones] = useState(initial)

  const sinLeer = notificaciones.filter(n => !n.leida).length

  async function handleMarcarTodas() {
    await marcarTodasLeidas()
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  function handleClickNotificacion(n: Notificacion) {
    if (!n.leida) {
      marcarLeida(n.id)
      setNotificaciones(prev =>
        prev.map(notif => notif.id === n.id ? { ...notif, leida: true } : notif)
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Notificaciones</h1>
        {sinLeer > 0 && (
          <button
            onClick={handleMarcarTodas}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-overpass font-semibold text-brand-blue hover:bg-gray-50 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Marcar todas como leídas
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600">
        Total: {notificaciones.length} | Sin leer: {sinLeer}
      </p>

      {notificaciones.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Bell className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No tenés notificaciones por ahora.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificaciones.map(n => {
            const contenido = (
              <>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="font-overpass font-semibold text-brand-blue">{n.titulo}</h2>
                  {!n.leida && (
                    <span className="text-xs font-overpass font-semibold text-brand-red">NUEVA</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-1">{n.mensaje}</p>
                {n.link && (
                  <span className="text-xs text-brand-blue font-medium">
                    {labelPorTipo[n.tipo] ?? 'Ver'} →
                  </span>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(n.createdAt).toLocaleString('es-AR')}
                </p>
              </>
            )

            const baseClasses = `block rounded-xl border p-4 transition-colors ${
              n.leida
                ? 'border-gray-200 bg-white'
                : 'border-brand-blue/30 bg-brand-blue/5'
            }`

            if (!n.link) {
              return (
                <div key={n.id} className={baseClasses}>
                  {contenido}
                </div>
              )
            }

            const isExternal = n.link.startsWith('http')

            if (isExternal) {
              return (
                <a
                  key={n.id}
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClickNotificacion(n)}
                  className={`${baseClasses} cursor-pointer hover:bg-gray-50`}
                >
                  {contenido}
                </a>
              )
            }

            return (
              <Link
                key={n.id}
                href={n.link}
                onClick={() => handleClickNotificacion(n)}
                className={`${baseClasses} cursor-pointer hover:bg-gray-50`}
              >
                {contenido}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

Puntos de diseño:

- **Links internos** (empiezan con `/`): usan `<Link>` de `next/link` para navegación client-side sin full reload.
- **Links externos** (empiezan con `http`): usan `<a target="_blank">` para abrir en nueva pestaña.
- **Sin link**: `<div>` sin cursor pointer ni hover — texto puro como hoy.
- **`handleClickNotificacion`**: marca como leída vía `fetch` fire-and-forget y actualiza el estado local inmediatamente (optimistic update). Usa el endpoint **existente** `PUT /api/notificaciones` con `{ id }`.
- **`labelPorTipo`**: muestra *"Ver pedido →"* en lugar de parsear la URL (que mostraría cuids).
- **`handleMarcarTodas`**: reemplaza el server action por un fetch + optimistic update del state local.

> **No se crea endpoint nuevo** `PUT /api/notificaciones/[id]/leer` — el existente `PUT /api/notificaciones` con `{ id }` ya lo resuelve. Menos archivos, menos duplicación.

### UI-2 — Agregar campo `link` al formulario admin

**Archivo:** `src/app/(admin)/admin/notificaciones/notificaciones-client.tsx`

Agregar al state del form:

```ts
const [form, setForm] = useState({
  asunto: '',
  mensaje: '',
  segmento: 'todos' as Segmento,
  canal: 'PLATAFORMA' as string,
  link: '',                                        // ← NUEVO
})
```

Agregar input debajo del textarea de mensaje:

```tsx
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Link de destino <span className="text-gray-400 font-normal">(opcional)</span>
  </label>
  <input
    type="url"
    value={form.link}
    onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
    placeholder="/taller/aprender o https://..."
    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
  />
  <p className="text-xs text-gray-400 mt-1">
    Si completás este campo, los usuarios pueden hacer click en la notificación para ir al destino
  </p>
</div>
```

Incluir `link` en el body del fetch al enviar:

```ts
body: JSON.stringify({
  titulo: form.asunto,
  mensaje: form.mensaje,
  tipo: 'ADMIN_ENVIO',
  canal: form.canal,
  segmento: form.segmento,
  link: form.link || null,                         // ← NUEVO
}),
```

---

## 5. Casos borde

- **Notificación sin link** → se renderiza como `<div>` sin cursor pointer ni link. Backward compatible con todas las notificaciones existentes.
- **Link relativo** (`/taller/pedidos`) → funciona con `<Link>` de Next.js para navegación client-side.
- **Link externo** (`https://...`) → se abre en nueva pestaña con `target="_blank"`.
- **Link con pedidoId inválido** (ej: pedido borrado) → el usuario llega a una página 404. Aceptable — no se puede garantizar que el destino exista para siempre.
- **Mark-as-read race condition** → el `fetch` de `marcarLeida` se dispara en `onClick` antes de la navegación. En la mayoría de los browsers, el request se completa aunque la página navegue. **Next.js client-side navigation con `<Link>` no cancela fetches en-flight**. Para el piloto es suficiente. Post-piloto: evaluar `navigator.sendBeacon` para garantía absoluta.
- **Notificaciones históricas** (`link: null`) → se muestran sin link como hoy. Ningún cambio visual.
- **Admin envía link vacío** → `link: form.link || null` normaliza strings vacíos a `null`. Sin link en la notificación.
- **Optimistic update del leída** → al hacer click, el state local marca la notificación como leída inmediatamente (sin esperar la respuesta del fetch). Si el fetch falla, la UI muestra como leída pero la DB no se actualizó. Al recargar la página, vuelve a aparecer como no leída. Aceptable para piloto.

---

## 6. Criterio de aceptación

- [ ] Campo `link String?` agregado al modelo `Notificacion` y migración aplicada
- [ ] `NotificacionData.pedido` incluye `id` además de `omId`
- [ ] Las notificaciones de cotización `RECIBIDA` tienen link a `/marca/pedidos/{pedidoId}`
- [ ] Las notificaciones `ACEPTADA` y `RECHAZADA` tienen link a `/taller/pedidos`
- [ ] Las notificaciones `PEDIDO_DISPONIBLE` tienen link a `/taller/pedidos/disponibles/{pedidoId}`
- [ ] Hacer click en una notificación con link navega al destino
- [ ] Al hacer click, la notificación se marca como leída (optimistic + fetch al endpoint existente)
- [ ] Notificaciones sin link se muestran como antes — sin interacción, sin cursor pointer
- [ ] Links internos usan `<Link>` (client-side navigation), links externos usan `<a target="_blank">`
- [ ] El indicador textual muestra label por tipo (*"Ver pedido →"*), no cuids parseados de la URL
- [ ] El admin puede incluir un link opcional al enviar notificaciones masivas
- [ ] Build de TypeScript pasa sin errores

---

## 7. Tests (verificación manual)

1. **Notificación de pedido disponible con link**:
   - Como admin, verificar que hay un pedido publicado (o publicar uno)
   - Login como taller PLATA/ORO → `/cuenta/notificaciones`
   - Verificar que la notificación *"Nuevo pedido disponible"* tiene el texto *"Ver pedido disponible →"*
   - Click → navega a `/taller/pedidos/disponibles/{id}` sin full reload
   - Volver a `/cuenta/notificaciones` → la notificación aparece como leída
2. **Notificación de cotización con link**:
   - Como taller, cotizar un pedido publicado
   - Login como marca → `/cuenta/notificaciones`
   - Verificar que la notificación *"Nueva cotización recibida"* tiene el texto *"Ver pedido →"*
   - Click → navega a `/marca/pedidos/{id}`
3. **Notificación sin link (backward compat)**:
   - Verificar que las notificaciones históricas (sin `link`) se muestran sin cursor pointer ni texto *"Ver →"*
4. **Admin con link**:
   - Login como admin → enviar notificación masiva con link `/taller/aprender`
   - Login como taller → `/cuenta/notificaciones` → verificar que la notificación tiene *"Ir al enlace →"*
   - Click → navega a `/taller/aprender`
5. **Admin sin link**:
   - Enviar notificación sin completar el campo link → la notificación se muestra sin *"→"* ni interacción

---

## 8. Archivos tocados

| Archivo | Cambios | Responsable |
|---|---|---|
| `prisma/schema.prisma` | Agregar `link String?` a `Notificacion` | Gerardo |
| `src/compartido/lib/notificaciones.ts` | Extender `NotificacionData` + agregar `link` a los 2 creadores | Gerardo |
| `src/app/api/cotizaciones/[id]/route.ts` | Agregar `id: cotizacion.pedidoId` al objeto `pedido` en los 3 callers | Gerardo |
| `src/app/api/admin/notificaciones/route.ts` | Agregar `link` al body destructuring y al `createMany` | Gerardo |
| `src/app/(public)/cuenta/notificaciones/page.tsx` | Simplificar a server wrapper | Sergio |
| `src/app/(public)/cuenta/notificaciones/notificaciones-lista.tsx` | **Nuevo**: client component con links, mark-as-read, labels por tipo | Sergio |
| `src/app/(admin)/admin/notificaciones/notificaciones-client.tsx` | Agregar input `link` al form del admin | Sergio |

**1 archivo nuevo, 6 archivos modificados, 0 migraciones destructivas.**
