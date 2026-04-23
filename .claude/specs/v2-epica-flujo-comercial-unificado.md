# Spec: Épica Flujo Comercial Unificado

**Versión:** v2
**Asignado a:** Gerardo (schema + backend) + Sergio (UI)
**Prioridad:** P0 — desbloquea épica de contenido visual y cierra H-07 y H-08
**Resuelve:** H-07, H-08, S2-01, S2-02, S2-03, FC-01

---

## 1. Contexto

El flujo comercial tiene dos problemas críticos:

- **H-07** — `AsignarTaller` bypasea el flujo: la marca puede asignar un taller directamente sin cotización, saltando publicación y cotización. El pedido pasa de `BORRADOR` a `EN_EJECUCION` sin trazabilidad.
- **H-08** — Cotizaciones invisibles: al aceptar una cotización y pasar el pedido a `EN_EJECUCION`, las cotizaciones desaparecen de la UI — la query filtra por `estado === 'PUBLICADO'`.

La decisión de arquitectura en `v2-decision-flujo-comercial-unificado.md` fusiona E1 y E2 en un **flujo único donde siempre hay cotización**.

**Sorpresa positiva del relevamiento**: el 80% del flujo ya existe y está bien hecho. `PUT /api/cotizaciones/[id]` con transacción atómica de 4 pasos ya es correcto (aceptar cotización + rechazar las demás + crear orden + transicionar pedido + notificaciones). Solo hay que eliminar el atajo de `AsignarTaller`, agregar trazabilidad con `cotizacionId`, y construir el flujo nuevo de "Invitar a cotizar".

---

## 2. Decisiones de arquitectura

- **`AsignarTaller` se elimina completamente** — 2 archivos afectados, riesgo mínimo (grep confirmó solo 2 referencias en todo el codebase).
- **`POST /api/pedidos/[id]/ordenes` se elimina** — solo queda el `GET`.
- **`montoTotal` y `presupuesto`** quedan deprecados en el schema (no se eliminan para no romper órdenes históricas, no se usan en código nuevo).
- **`cotizacionId` se agrega a `OrdenManufactura` como nullable** — tolera las órdenes históricas creadas por `AsignarTaller`.
- **Nuevo campo `visibilidad`** en `Pedido` distingue `INVITACION` vs `PUBLICO`.
- **Invitados como tabla pivot `PedidoInvitacion`** — más limpio y extensible que `String[]`.
- **El endpoint `POST /api/cotizaciones` debe validar invitación** — sin esta validación, el sistema de invitaciones es solo UX, no seguridad.

---

## 3. Cambios de schema

**Archivo:** `prisma/schema.prisma`

### 3.1 Nuevo enum

```prisma
enum VisibilidadPedido {
  PUBLICO
  INVITACION
}
```

### 3.2 Agregar campos a `Pedido`

```prisma
model Pedido {
  // ... campos existentes sin cambios ...
  visibilidad   VisibilidadPedido  @default(PUBLICO)
  invitaciones  PedidoInvitacion[]
  // montoTotal y presupuesto se mantienen pero DEPRECADOS — no usar en código nuevo
}
```

### 3.3 Nueva tabla pivot `PedidoInvitacion`

```prisma
model PedidoInvitacion {
  id        String   @id @default(cuid())
  pedidoId  String
  tallerId  String
  createdAt DateTime @default(now())

  pedido Pedido @relation(fields: [pedidoId], references: [id], onDelete: Cascade)
  taller Taller @relation(fields: [tallerId], references: [id], onDelete: Cascade)

  @@unique([pedidoId, tallerId])
  @@map("pedido_invitaciones")
}
```

### 3.4 Agregar `cotizacionId` a `OrdenManufactura`

```prisma
model OrdenManufactura {
  // ... campos existentes sin cambios ...
  cotizacionId String?     @unique
  cotizacion   Cotizacion? @relation(fields: [cotizacionId], references: [id], onDelete: SetNull)
}
```

> El `@unique` garantiza 1:1 cotización-orden. El `SetNull` evita romper la orden si la cotización se borra. Nullable para tolerar órdenes históricas creadas por `AsignarTaller`.

### 3.5 Agregar relación inversa a `Cotizacion`

```prisma
model Cotizacion {
  // ... campos existentes sin cambios ...
  ordenManufactura OrdenManufactura?
}
```

### 3.6 Agregar relación inversa a `Taller`

```prisma
model Taller {
  // ... campos existentes sin cambios ...
  pedidosInvitado PedidoInvitacion[]
}
```

### Migración (solo Gerardo)

```bash
npx prisma migrate dev --name flujo_comercial_unificado
```

---

## 4. Cambios de backend — Gerardo

### Acción 1 — Eliminar el handler `POST` de `src/app/api/pedidos/[id]/ordenes/route.ts`

Mantener **solo** el handler `GET`. Eliminar el handler `POST` completo (líneas ~40-75), incluyendo la auto-transición `BORRADOR → EN_EJECUCION`. Esta transición queda a cargo del `PUT /api/cotizaciones/[id]` rama `ACEPTAR` que ya hace esa transición correctamente.

### Acción 2 — Agregar `cotizacionId` al create en `PUT /api/cotizaciones/[id]`

**Archivo:** `src/app/api/cotizaciones/[id]/route.ts`

En el paso 3 de la transacción atómica (líneas ~59-68), agregar una línea:

```ts
prisma.ordenManufactura.create({
  data: {
    moId,
    pedidoId: cotizacion.pedidoId,
    tallerId: cotizacion.tallerId,
    proceso: cotizacion.proceso,
    precio: cotizacion.precio,
    plazoDias: cotizacion.plazoDias,
    cotizacionId: cotizacion.id,   // ← NUEVO: trazabilidad
  },
}),
```

Una sola línea. El resto de la transacción atómica y las notificaciones post-commit no se tocan — ya funcionan bien.

### Acción 3 — Crear endpoint `POST /api/pedidos/[id]/invitaciones`

**Archivo nuevo:** `src/app/api/pedidos/[id]/invitaciones/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { sendEmail, buildInvitacionCotizarEmail } from '@/compartido/lib/email'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const { tallerIds } = body as { tallerIds: string[] }

    if (!tallerIds?.length) {
      return NextResponse.json({ error: 'Seleccioná al menos un taller' }, { status: 400 })
    }

    // Verificar ownership del pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: { marca: { select: { userId: true, nombre: true } } },
    })
    if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN' && pedido.marca.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (pedido.estado !== 'BORRADOR') {
      return NextResponse.json(
        { error: 'Solo se puede invitar desde BORRADOR' },
        { status: 400 }
      )
    }

    // Pre-validar que todos los tallerIds existen, filtrar los inválidos
    // (evita que createMany rompa por FK si viene un ID inválido del cliente)
    const talleresConUser = await prisma.taller.findMany({
      where: { id: { in: tallerIds } },
      include: { user: { select: { id: true, email: true } } },
    })
    const idsValidos = talleresConUser.map(t => t.id)

    if (idsValidos.length === 0) {
      return NextResponse.json(
        { error: 'Ninguno de los talleres seleccionados existe' },
        { status: 400 }
      )
    }

    // Transaction: crear invitaciones + transicionar pedido a PUBLICADO con visibilidad INVITACION
    await prisma.$transaction([
      prisma.pedidoInvitacion.createMany({
        data: idsValidos.map(tallerId => ({ pedidoId: id, tallerId })),
        skipDuplicates: true,
      }),
      prisma.pedido.update({
        where: { id },
        data: {
          visibilidad: 'INVITACION',
          estado: 'PUBLICADO',
        },
      }),
    ])

    // Notificar a cada taller invitado (fire-and-forget)
    // Usamos la lista ya traída arriba para evitar N+1
    for (const taller of talleresConUser) {
      prisma.notificacion.create({
        data: {
          userId: taller.user.id,
          tipo: 'PEDIDO_INVITACION',
          titulo: `Te invitaron a cotizar: ${pedido.tipoPrenda}`,
          mensaje: `${pedido.marca.nombre} te invitó a cotizar un pedido de ${pedido.cantidad} unidades de ${pedido.tipoPrenda}.`,
          canal: 'PLATAFORMA',
        },
      }).catch((err) => console.error('[invitaciones] Error creando notificación:', err))

      sendEmail({
        to: taller.user.email,
        ...buildInvitacionCotizarEmail({
          nombreTaller: taller.nombre,
          nombreMarca: pedido.marca.nombre,
          tipoPrenda: pedido.tipoPrenda,
          cantidad: pedido.cantidad,
          pedidoUrl: `${process.env.NEXTAUTH_URL}/taller/pedidos/disponibles/${id}`,
        }),
      }).catch((err) => console.error('[invitaciones] Error enviando email:', err))
    }

    return NextResponse.json({ ok: true, invitados: idsValidos.length })
  } catch (error) {
    console.error('[invitaciones] Error en POST /api/pedidos/[id]/invitaciones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
```

Notas de implementación:

- **Pre-validación con `findMany`**: evita que `createMany` rompa por foreign key si el cliente manda un ID inválido. `skipDuplicates: true` solo cubre violaciones de `@@unique`, no de FK.
- **Sin N+1 en notificaciones**: el `findMany` inicial trae los talleres con su `user` incluido, así el loop de notificaciones no hace más queries.
- **Taller no existe** (ej: borrado entre el buscador del cliente y el POST): se filtra silenciosamente, el resto de invitaciones se crean igual.

### Acción 4 — Agregar builder `buildInvitacionCotizarEmail` en `lib/email.ts`

**Archivo:** `src/compartido/lib/email.ts`

Siguiendo el patrón de los otros builders (`buildCertificadoEmail`, `buildPedidoDisponibleEmail`, etc.), usando las funciones privadas `emailWrapper` y `btnPrimario`:

```ts
export function buildInvitacionCotizarEmail(data: {
  nombreTaller: string
  nombreMarca: string
  tipoPrenda: string
  cantidad: number
  pedidoUrl: string
}): { subject: string; html: string } {
  return {
    subject: `Te invitaron a cotizar: ${data.tipoPrenda}`,
    html: emailWrapper(`
      <h2>Hola ${data.nombreTaller}</h2>
      <p>${data.nombreMarca} te invitó a cotizar un pedido de <strong>${data.cantidad} unidades de ${data.tipoPrenda}</strong>.</p>
      <p>Solo vos y los talleres invitados pueden ver este pedido.</p>
      ${btnPrimario(data.pedidoUrl, 'Ver pedido y cotizar')}
    `),
  }
}
```

### Acción 5 — Modificar `/taller/pedidos/disponibles/page.tsx`

**Archivo:** `src/app/(taller)/taller/pedidos/disponibles/page.tsx`

Actualizar la query para mostrar pedidos donde el taller fue invitado, e incluir las invitaciones filtradas por el taller actual (necesario para el badge de UI-5):

```ts
const taller = await prisma.taller.findFirst({ where: { userId: session.user.id } })

const pedidosDisponibles = await prisma.pedido.findMany({
  where: {
    estado: 'PUBLICADO',
    OR: [
      { visibilidad: 'PUBLICO' },
      { invitaciones: { some: { tallerId: taller!.id } } },
    ],
  },
  include: {
    marca: { select: { nombre: true, tipo: true, ubicacion: true } },
    invitaciones: {
      where: { tallerId: taller!.id },
      select: { id: true },
    },
  },
  orderBy: { createdAt: 'desc' },
})
```

> El `include` de `invitaciones` filtra solo las del taller actual (en la mayoría de los casos es 0 o 1 fila). El componente de UI-5 chequea `pedido.invitaciones.length > 0` para mostrar el badge "Te invitaron". Sin este include, la propiedad `invitaciones` queda `undefined` y el badge nunca aparece.

### Acción 6 — Modificar `/marca/pedidos/[id]/page.tsx` — fix H-08

**Archivo:** `src/app/(marca)/marca/pedidos/[id]/page.tsx`

Eliminar el filtro por estado en la query de cotizaciones:

```ts
// ANTES (líneas 89-95):
const cotizaciones = pedido.estado === 'PUBLICADO'
  ? await prisma.cotizacion.findMany({
      where: { pedidoId: pedido.id },
      include: { taller: { select: { nombre: true, nivel: true } } },
      orderBy: { createdAt: 'desc' },
    })
  : []

// DESPUÉS — traer siempre:
const cotizaciones = await prisma.cotizacion.findMany({
  where: { pedidoId: pedido.id },
  include: { taller: { select: { nombre: true, nivel: true } } },
  orderBy: { createdAt: 'desc' },
})
```

Nada más en la query — el resto de la sección de cotizaciones en el JSX se actualiza en UI-4.

### Acción 7 — Validar invitación en `POST /api/cotizaciones` 🔴 CRÍTICO

**Archivo:** `src/app/api/cotizaciones/route.ts` (el handler de **creación** de cotización, no confundir con `/api/cotizaciones/[id]/route.ts` que es el de aceptar/rechazar).

**Por qué es crítico**: sin este check, cualquier taller puede hacer `fetch('/api/cotizaciones', { method: 'POST', body: { pedidoId, ... } })` directamente y cotizar un pedido `INVITACION` aunque no haya sido invitado. El filtrado del sistema de invitaciones quedaría solo en la UI (en `/taller/pedidos/disponibles`) — un taller malicioso que conozca el `pedidoId` bypasea todo el sistema. Esto hace que todo el mecanismo de invitaciones sea teatro y no seguridad.

Agregar el siguiente check después del gate de autenticación y antes de crear la cotización:

```ts
const pedido = await prisma.pedido.findUnique({
  where: { id: pedidoId },
  select: { estado: true, visibilidad: true },
})
if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

if (pedido.estado !== 'PUBLICADO') {
  return NextResponse.json(
    { error: 'El pedido no está publicado' },
    { status: 400 }
  )
}

// Si el pedido es INVITACION, validar que este taller fue invitado
if (pedido.visibilidad === 'INVITACION') {
  const invitacion = await prisma.pedidoInvitacion.findUnique({
    where: { pedidoId_tallerId: { pedidoId, tallerId: taller.id } },
  })
  if (!invitacion) {
    return NextResponse.json(
      { error: 'No fuiste invitado a cotizar este pedido' },
      { status: 403 }
    )
  }
}
```

> El `findUnique` usa el compound key `pedidoId_tallerId` generado automáticamente por Prisma gracias al `@@unique([pedidoId, tallerId])` del modelo `PedidoInvitacion` (§3.3). Es una sola query indexada, no agrega latencia significativa.

Si el `POST /api/cotizaciones/route.ts` aún no existe o el ownership del taller se verifica distinto, adaptar al patrón existente — lo crítico es que la validación de invitación ocurra **antes** del `prisma.cotizacion.create`.

---

## 5. Cambios de UI — Sergio

### ⚠️ Pre-requisitos antes de arrancar

- [ ] Migración `flujo_comercial_unificado` mergeada (Gerardo)
- [ ] `POST /api/pedidos/[id]/invitaciones` disponible (Gerardo)
- [ ] Acciones 1, 2, 5, 6 y 7 del §4 implementadas (Gerardo)
- [ ] `AsignarTaller` eliminado del endpoint (Gerardo, Acción 1)

### UI-1 — Eliminar `AsignarTaller` de `/marca/pedidos/[id]/page.tsx`

**Archivo:** `src/app/(marca)/marca/pedidos/[id]/page.tsx`

Eliminar el import (línea 10):

```ts
// Eliminar:
import { AsignarTaller } from '@/marca/componentes/asignar-taller'
```

Eliminar el uso condicional (líneas 198-200):

```tsx
// Eliminar:
{(pedido.estado === 'BORRADOR' || pedido.estado === 'PUBLICADO') && (
  <AsignarTaller pedidoId={pedido.id} />
)}
```

Luego eliminar el archivo completo:

```bash
rm src/marca/componentes/asignar-taller.tsx
```

El grep confirmó que no hay otras referencias en el codebase.

### UI-2 — Crear `src/marca/componentes/invitar-a-cotizar.tsx`

Client component con modal de dos pasos (Buscar → Confirmar).

**Paso 1 — Buscar talleres:**
- Input de búsqueda → debounce de 300ms → `fetch('/api/talleres?q=...&limit=10')`
- Lista de resultados con checkbox por taller (permite selección múltiple)
- Cada ítem muestra: nombre, badge de nivel, ubicación, capacidadMensual
- Lista separada de "Seleccionados" abajo del buscador

**Paso 2 — Confirmar:**
- Lista de talleres seleccionados (sin opción de editar, solo "Volver")
- Texto informativo: *"Solo los talleres invitados verán este pedido."*
- Botón "Invitar a cotizar" → `POST /api/pedidos/${pedidoId}/invitaciones`
- Al éxito: cerrar modal + `router.refresh()`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { Modal } from '@/compartido/componentes/ui/modal'
import { Badge } from '@/compartido/componentes/ui/badge'

interface Taller {
  id: string
  nombre: string
  nivel: string
  ubicacion: string | null
  capacidadMensual: number
}

export function InvitarACotizar({ pedidoId }: { pedidoId: string }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [paso, setPaso] = useState<'buscar' | 'confirmar'>('buscar')
  const [query, setQuery] = useState('')
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [seleccionados, setSeleccionados] = useState<Taller[]>([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  // Debounce básico del fetch de búsqueda
  useEffect(() => {
    if (query.length < 2) { setTalleres([]); return }
    const timer = setTimeout(() => {
      fetch(`/api/talleres?q=${encodeURIComponent(query)}&limit=10`)
        .then(r => r.json())
        .then(data => setTalleres(data.talleres ?? []))
        .catch(() => setTalleres([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function toggleSeleccion(taller: Taller) {
    setSeleccionados(prev =>
      prev.some(t => t.id === taller.id)
        ? prev.filter(t => t.id !== taller.id)
        : [...prev, taller]
    )
  }

  async function handleInvitar() {
    if (!seleccionados.length) return
    setEnviando(true)
    setError('')
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}/invitaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tallerIds: seleccionados.map(t => t.id) }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al invitar')
        return
      }
      setAbierto(false)
      setSeleccionados([])
      setPaso('buscar')
      setQuery('')
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-2 border border-brand-blue text-brand-blue px-4 py-2 rounded-lg hover:bg-brand-blue/5 text-sm font-medium"
      >
        <UserPlus className="w-4 h-4" />
        Invitar a cotizar
      </button>

      <Modal open={abierto} onClose={() => setAbierto(false)} title="Invitar talleres a cotizar" size="md">
        {paso === 'buscar' ? (
          <div className="space-y-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar taller por nombre..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />

            <div className="max-h-80 overflow-y-auto space-y-2">
              {talleres.map(t => {
                const isSelected = seleccionados.some(s => s.id === t.id)
                return (
                  <label
                    key={t.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? 'border-brand-blue bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSeleccion(t)}
                      className="accent-brand-blue"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {t.ubicacion} · {t.capacidadMensual} prendas/mes
                      </p>
                    </div>
                    <Badge variant="muted">{t.nivel}</Badge>
                  </label>
                )
              })}
              {query.length >= 2 && talleres.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Sin resultados</p>
              )}
            </div>

            {seleccionados.length > 0 && (
              <p className="text-xs text-brand-blue font-semibold">
                {seleccionados.length} taller{seleccionados.length !== 1 ? 'es' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAbierto(false)}
                className="flex-1 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => setPaso('confirmar')}
                disabled={!seleccionados.length}
                className="flex-1 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                Continuar ({seleccionados.length})
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Se invitará a estos talleres a cotizar el pedido:</p>
            <div className="space-y-2">
              {seleccionados.map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                  <span>{t.nombre}</span>
                  <Badge variant="muted">{t.nivel}</Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Solo los talleres invitados verán este pedido.</p>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPaso('buscar')}
                className="flex-1 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm"
              >
                Volver
              </button>
              <button
                onClick={handleInvitar}
                disabled={enviando}
                className="flex-1 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {enviando ? 'Invitando...' : 'Invitar a cotizar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
```

### UI-3 — Actualizar bloque de acciones en `/marca/pedidos/[id]/page.tsx`

Reemplazar las líneas 193-204 con:

```tsx
<div className="flex flex-wrap items-center gap-3">
  {/* Publicar al mercado: solo si BORRADOR */}
  {pedido.estado === 'BORRADOR' && (
    <PublicarPedido pedidoId={pedido.id} />
  )}

  {/* Invitar a cotizar: solo si BORRADOR */}
  {pedido.estado === 'BORRADOR' && (
    <InvitarACotizar pedidoId={pedido.id} />
  )}

  {/* Cancelar: BORRADOR, PUBLICADO o EN_EJECUCION */}
  {['BORRADOR', 'PUBLICADO', 'EN_EJECUCION'].includes(pedido.estado) && (
    <CancelarPedido pedidoId={pedido.id} />
  )}
</div>
```

Y agregar el import arriba:

```ts
import { InvitarACotizar } from '@/marca/componentes/invitar-a-cotizar'
```

> **Nota importante**: `PublicarPedido` **no requiere cambios**. El campo `visibilidad` ya tiene default `PUBLICO` en el schema (§3.2) — el flujo de "Publicar al mercado" sigue funcionando con el componente existente sin tocarlo. Cuando `PublicarPedido` transiciona el pedido de `BORRADOR` a `PUBLICADO`, el campo `visibilidad` queda en su default `PUBLICO` automáticamente.

### UI-4 — Actualizar sección de cotizaciones en `/marca/pedidos/[id]/page.tsx`

La sección actual (líneas 207-247) está condicionada a `pedido.estado === 'PUBLICADO'`. Eliminar esa condición y destacar visualmente la cotización `ACEPTADA`:

```tsx
{cotizaciones.length > 0 && (
  <Card title={`Cotizaciones (${cotizaciones.length})`}>
    <div className="space-y-3">
      {cotizaciones.map(cot => (
        <div
          key={cot.id}
          className={`border rounded-lg p-4 ${
            cot.estado === 'ACEPTADA'
              ? 'border-green-300 bg-green-50'
              : 'border-gray-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium text-gray-800">{cot.taller.nombre}</p>
              <Badge variant={cot.taller.nivel === 'ORO' ? 'success' : cot.taller.nivel === 'PLATA' ? 'default' : 'warning'}>
                {cot.taller.nivel}
              </Badge>
            </div>
            <Badge variant={
              cot.estado === 'ENVIADA' ? 'default' :
              cot.estado === 'ACEPTADA' ? 'success' :
              cot.estado === 'RECHAZADA' ? 'error' : 'muted'
            }>
              {cot.estado}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-sm">
            <div><span className="text-gray-500">Proceso:</span> <span className="font-medium">{cot.proceso}</span></div>
            <div><span className="text-gray-500">Precio:</span> <span className="font-medium">$ {cot.precio.toLocaleString('es-AR')}</span></div>
            <div><span className="text-gray-500">Plazo:</span> <span className="font-medium">{cot.plazoDias} días</span></div>
          </div>
          {cot.mensaje && <p className="text-sm text-gray-600 mt-2 italic">{cot.mensaje}</p>}

          {/* Botones solo si la cotización está ENVIADA Y el pedido sigue PUBLICADO */}
          {cot.estado === 'ENVIADA' && pedido.estado === 'PUBLICADO' && (
            <div className="flex gap-2 mt-3">
              <AceptarCotizacion cotizacionId={cot.id} />
              <RechazarCotizacion cotizacionId={cot.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
)}
```

Resultado: la sección se muestra en **todos** los estados del pedido (fix H-08). Las cotizaciones históricas (ACEPTADA, RECHAZADA) quedan siempre visibles. La ACEPTADA se destaca en verde.

### UI-5 — Badge "Te invitaron" en `/taller/pedidos/disponibles/page.tsx`

Para pedidos donde el taller fue invitado, mostrar un badge distintivo. Como la query del Acción 5 ahora trae `invitaciones` filtradas por el taller actual:

```tsx
{pedido.invitaciones.length > 0 && (
  <Badge variant="default">Te invitaron</Badge>
)}
```

Si `pedido.invitaciones` tiene al menos una fila, significa que **este taller** fue invitado explícitamente al pedido (por el `where: { tallerId: taller!.id }` del include). Si está vacío (length === 0), es un pedido público o el taller no fue invitado.

---

## 6. Casos borde

- **Pedido ya PUBLICADO** → no se puede invitar. El endpoint de invitaciones retorna 400 *"Solo se puede invitar desde BORRADOR"*. Si la marca quiere sumar más talleres después de publicar, tiene que cancelar + re-crear el pedido. Limitación conocida para el piloto.
- **Taller ya invitado** → `createMany` con `skipDuplicates: true` ignora silenciosamente los duplicados, no falla.
- **`tallerIds` con IDs inválidos** → el `findMany` previo filtra los válidos. Si **todos** son inválidos, 400. Si algunos son válidos, se crean los que corresponden sin error.
- **Taller cotiza pedido `INVITACION` sin ser invitado** → Acción 7 rechaza con 403 *"No fuiste invitado a cotizar este pedido"*.
- **`cotizacionId` nullable** → órdenes creadas con `AsignarTaller` antes de esta épica quedan con `cotizacionId = null`. No rompen nada. Ningún código nuevo las consulta.
- **Cotización vence** → el endpoint existente `PUT /api/cotizaciones/[id]` ya valida `venceEn` antes de aceptar (línea 38 del handler actual). No hay cambios ahí.
- **`montoTotal` y `presupuesto` deprecados** → siguen en el schema pero no deben usarse en código nuevo. Considerar un comentario `// DEPRECATED: ...` en el schema al lado de cada campo.
- **Notificación falla post-commit** → el endpoint de invitaciones usa fire-and-forget con `.catch(console.error)`. Si el email no llega, la invitación igual se crea y el taller la ve al entrar a la plataforma.

---

## 7. Criterio de aceptación

- [ ] Migración `flujo_comercial_unificado` aplicada sin errores en local y producción
- [ ] No existe el archivo `src/marca/componentes/asignar-taller.tsx`
- [ ] No existe el botón "Asignar taller" en ninguna pantalla
- [ ] `POST /api/pedidos/[id]/ordenes` retorna 405 (handler removido) o no responde
- [ ] Botón "Invitar a cotizar" aparece en pedidos en estado `BORRADOR`
- [ ] Al invitar: pedido pasa a `PUBLICADO` con `visibilidad = INVITACION`, talleres invitados reciben notificación in-app + email
- [ ] Talleres invitados ven el pedido en `/taller/pedidos/disponibles` con badge "Te invitaron"
- [ ] Talleres **no** invitados NO ven el pedido si `visibilidad === 'INVITACION'`
- [ ] Taller no invitado que intenta cotizar via `POST /api/cotizaciones` recibe 403
- [ ] Las cotizaciones se muestran en TODOS los estados del pedido (fix H-08)
- [ ] La cotización `ACEPTADA` se destaca visualmente en verde
- [ ] Al aceptar cotización, `OrdenManufactura.cotizacionId` queda seteado correctamente
- [ ] Órdenes históricas (de `AsignarTaller`) mantienen `cotizacionId = null` sin romper nada
- [ ] Build de TypeScript pasa sin errores
- [ ] Tests E2E existentes pasan contra producción (no rompemos nada)

---

## 8. Tests (verificación manual)

1. **AsignarTaller eliminado**:
   - Login como Martín Echevarría (MARCA)
   - Ir a un pedido en `BORRADOR` → verificar que **no** aparece el botón "Asignar taller"
   - Verificar que aparecen los botones "Publicar al mercado", "Invitar a cotizar" y "Cancelar"
2. **Flujo de invitación completo**:
   - Click en "Invitar a cotizar" → buscar "Corte" → seleccionar Corte Sur SRL + Cooperativa Hilos del Sur → Continuar → Confirmar
   - Verificar que el pedido pasa a `PUBLICADO` y el botón "Invitar a cotizar" desaparece
   - Verificar en DB que hay 2 filas en `pedido_invitaciones` con el mismo `pedidoId`
3. **Badge "Te invitaron"**:
   - Login como Carlos Mendoza (TALLER ORO = Corte Sur SRL)
   - Ir a `/taller/pedidos/disponibles` → el pedido recién invitado aparece con badge "Te invitaron"
4. **Taller no invitado no ve el pedido**:
   - Login como Roberto Giménez (TALLER BRONCE, no invitado)
   - Ir a `/taller/pedidos/disponibles` → el pedido `INVITACION` **no** aparece en la lista
5. **Taller no invitado NO puede cotizar via API** (seguridad):
   - Como Roberto Giménez, intentar en consola del browser:
     ```js
     fetch('/api/cotizaciones', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ pedidoId: '<el_id_del_pedido_invitacion>', precio: 100, plazoDias: 30, proceso: 'confeccion' }),
     }).then(r => r.json()).then(console.log)
     ```
   - Verificar que responde **403** con mensaje "No fuiste invitado a cotizar este pedido"
6. **Cotización aceptada crea orden con trazabilidad**:
   - Como Carlos Mendoza, cotizar el pedido
   - Login como Martín Echevarría, aceptar la cotización
   - Verificar en DB: `ordenes_manufactura` tiene una fila con el `cotizacionId` apuntando a la cotización original
   - En `/marca/pedidos/[id]` ver que la cotización **aceptada** sigue visible, destacada en verde
7. **Trazabilidad post-ejecución (fix H-08)**:
   - Con el pedido en `EN_EJECUCION`, volver a abrir `/marca/pedidos/[id]`
   - La sección "Cotizaciones (N)" sigue visible con las 2 cotizaciones históricas (1 ACEPTADA en verde, 1 RECHAZADA)

---

## 9. Archivos tocados

| Archivo | Cambios | Responsable |
|---|---|---|
| `prisma/schema.prisma` | Nuevos campos, enum, tabla pivot, relaciones | Gerardo |
| `src/compartido/lib/email.ts` | Nuevo builder `buildInvitacionCotizarEmail` | Gerardo |
| `src/app/api/pedidos/[id]/ordenes/route.ts` | **Eliminar** handler POST | Gerardo |
| `src/app/api/cotizaciones/route.ts` | **Acción 7**: validar invitación antes del create | Gerardo |
| `src/app/api/cotizaciones/[id]/route.ts` | Agregar `cotizacionId` al create (1 línea) | Gerardo |
| `src/app/api/pedidos/[id]/invitaciones/route.ts` | **Nuevo** endpoint completo | Gerardo |
| `src/app/(taller)/taller/pedidos/disponibles/page.tsx` | Query con OR + include de invitaciones + UI del badge | Gerardo (query) + Sergio (UI) |
| `src/app/(marca)/marca/pedidos/[id]/page.tsx` | Eliminar `AsignarTaller`, agregar `InvitarACotizar`, fix H-08, card verde de ACEPTADA | Sergio |
| `src/marca/componentes/asignar-taller.tsx` | **Eliminar archivo completo** | Sergio |
| `src/marca/componentes/invitar-a-cotizar.tsx` | **Nuevo archivo** completo | Sergio |

**Total**: 1 archivo nuevo de backend, 1 archivo nuevo de UI, 6 archivos modificados, 1 archivo eliminado.
