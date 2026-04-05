# Spec: Publicacion de pedidos — UI

- **Semana:** 2
- **Asignado a:** Sergio
- **Dependencias:**
  - semana2-schema-e2 (Gerardo — estado PUBLICADO debe existir en el enum)
  - semana2-api-cotizaciones (Gerardo — el formulario de cotizacion necesita esta API)

---

## ANTES DE ARRANCAR

Verificar que estos commits estan en develop antes de tocar codigo:

- [ ] semana2-schema-e2 (Gerardo) — commit con mensaje `feat: agregar estado PUBLICADO y modelo Cotizacion`
- [ ] semana2-api-cotizaciones (Gerardo) — commit con mensaje `feat: API cotizaciones`
- [ ] Verificar que `EstadoPedido` incluye `PUBLICADO` en el schema
- [ ] Verificar que `POST /api/cotizaciones` responde (no 404)

Si no estan mergeados, NO arrancar. Avisarle a Gerardo.

---

## 1. Contexto

El Escenario 2 requiere que las marcas publiquen pedidos para que los talleres los vean y coticen. Hay que agregar el boton de publicar en el detalle del pedido de la marca, actualizar las condiciones de UI para el estado PUBLICADO, y crear la vista de marketplace para el taller.

---

## 2. Que construir

- Boton "Publicar pedido" en `/marca/pedidos/[id]` para pedidos en BORRADOR
- Actualizar timeline de estados para incluir PUBLICADO
- Actualizar condiciones de acciones segun estado PUBLICADO
- Nueva pagina `/taller/pedidos/disponibles` — marketplace de pedidos publicados
- Pagina de detalle `/taller/pedidos/disponibles/[id]` con formulario de cotizacion
- Actualizar sidebar del taller con links a pedidos y marketplace

---

## 3. Datos

- La transicion BORRADOR → PUBLICADO ya existe en `PUT /api/pedidos/[id]` (spec semana2-schema-e2)
- Los pedidos PUBLICADOS se obtienen con: `prisma.pedido.findMany({ where: { estado: 'PUBLICADO' } })`
- `POST /api/cotizaciones` ya existe (spec semana2-api-cotizaciones)
- No hay queries nuevas — solo UI que consume APIs existentes

---

## 4. Prescripciones tecnicas

### Archivo a modificar — `src/app/(marca)/marca/pedidos/[id]/page.tsx`

#### Cambio 1 — Actualizar label/variant maps

Reemplazar los maps existentes (lineas 13-25) con los 6 estados completos:

```typescript
const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error' | 'muted'> = {
  BORRADOR: 'muted',
  PUBLICADO: 'warning',
  EN_EJECUCION: 'default',
  ESPERANDO_ENTREGA: 'warning',
  COMPLETADO: 'success',
  CANCELADO: 'error',
}

const statusLabel: Record<string, string> = {
  BORRADOR: 'Borrador',
  PUBLICADO: 'Publicado',
  EN_EJECUCION: 'En ejecucion',
  ESPERANDO_ENTREGA: 'Esperando entrega',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}
```

#### Cambio 2 — Actualizar FLOW_STEPS

Reemplazar (lineas 42-46):

```typescript
const FLOW_STEPS = [
  { key: 'BORRADOR', label: 'Borrador' },
  { key: 'PUBLICADO', label: 'Publicado' },
  { key: 'EN_EJECUCION', label: 'En ejecucion' },
  { key: 'ESPERANDO_ENTREGA', label: 'Esperando entrega' },
  { key: 'COMPLETADO', label: 'Completado' },
]
```

#### Cambio 3 — Agregar boton Publicar y actualizar condiciones de acciones

Agregar import:

```typescript
import { PublicarPedido } from '@/marca/componentes/publicar-pedido'
```

Reemplazar el bloque de acciones (lineas 177-184):

```tsx
<div className="flex flex-wrap items-center gap-3">
  {/* Publicar: solo si BORRADOR */}
  {pedido.estado === 'BORRADOR' && (
    <PublicarPedido pedidoId={pedido.id} />
  )}

  {/* Asignar taller: BORRADOR o PUBLICADO (asignacion directa sigue disponible) */}
  {(pedido.estado === 'BORRADOR' || pedido.estado === 'PUBLICADO') && (
    <AsignarTaller pedidoId={pedido.id} />
  )}

  {/* Cancelar: BORRADOR, PUBLICADO o EN_EJECUCION */}
  {['BORRADOR', 'PUBLICADO', 'EN_EJECUCION'].includes(pedido.estado) && (
    <CancelarPedido pedidoId={pedido.id} />
  )}
</div>
```

### Archivo nuevo — `src/marca/componentes/publicar-pedido.tsx`

Client component:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { Button } from '@/compartido/componentes/ui/button'

export function PublicarPedido({ pedidoId }: { pedidoId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePublicar() {
    if (!confirm('Publicar este pedido? Los talleres compatibles podran verlo y cotizar.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'PUBLICADO' }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al publicar el pedido')
      }
    } catch {
      alert('Error de conexion')
    }
    setLoading(false)
  }

  return (
    <Button onClick={handlePublicar} loading={loading} icon={<Send className="w-4 h-4" />}>
      Publicar pedido
    </Button>
  )
}
```

### Archivo nuevo — `src/app/(taller)/taller/pedidos/disponibles/page.tsx`

Server component — marketplace de pedidos publicados:

```typescript
export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Package, MapPin, Calendar } from 'lucide-react'

export default async function PedidosDisponiblesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const pedidosDisponibles = await prisma.pedido.findMany({
    where: { estado: 'PUBLICADO' },
    include: {
      marca: { select: { nombre: true, tipo: true, ubicacion: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Pedidos disponibles</h1>
        <p className="text-gray-500 mt-1">Pedidos publicados por marcas que buscan talleres</p>
      </div>

      {pedidosDisponibles.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No hay pedidos disponibles por ahora.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pedidosDisponibles.map((pedido) => (
            <Card key={pedido.id}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-overpass font-bold text-gray-800">{pedido.tipoPrenda}</p>
                  <p className="text-sm text-gray-500">
                    {pedido.marca.nombre}
                    {pedido.marca.ubicacion && (
                      <span className="inline-flex items-center gap-1 ml-2">
                        <MapPin className="w-3 h-3" /> {pedido.marca.ubicacion}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> {pedido.cantidad.toLocaleString()} unidades
                    </span>
                    {pedido.fechaObjetivo && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Fecha objetivo: {new Date(pedido.fechaObjetivo).toLocaleDateString('es-AR')}
                      </span>
                    )}
                  </div>
                  {pedido.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">{pedido.descripcion}</p>
                  )}
                  {pedido.presupuesto && (
                    <p className="text-sm font-medium text-green-700 mt-1">
                      Presupuesto: ${pedido.presupuesto.toLocaleString('es-AR')}
                    </p>
                  )}
                </div>
                <Link
                  href={`/taller/pedidos/disponibles/${pedido.id}`}
                  className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-overpass font-semibold hover:bg-blue-800 transition-colors shrink-0"
                >
                  Ver y cotizar
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Archivo nuevo — `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`

Server component — detalle del pedido publico con formulario de cotizacion:

```typescript
export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { ArrowLeft, Package, Calendar, DollarSign } from 'lucide-react'
import { CotizarForm } from '@/taller/componentes/cotizar-form'

export default async function PedidoDisponibleDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const pedido = await prisma.pedido.findFirst({
    where: { id, estado: 'PUBLICADO' },
    include: { marca: { select: { nombre: true, tipo: true, ubicacion: true } } },
  })

  if (!pedido) notFound()

  // Verificar si el taller ya cotizo este pedido
  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })
  const cotizacionExistente = taller
    ? await prisma.cotizacion.findFirst({
        where: { pedidoId: id, tallerId: taller.id, estado: { in: ['ENVIADA', 'ACEPTADA'] } },
      })
    : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/taller/pedidos/disponibles" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline">
        <ArrowLeft className="w-4 h-4" /> Volver a pedidos disponibles
      </Link>

      <div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">{pedido.tipoPrenda}</h1>
        <p className="text-gray-500 mt-1">Publicado por {pedido.marca.nombre}</p>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Cantidad</p>
            <p className="font-overpass font-bold text-lg">{pedido.cantidad.toLocaleString()} unidades</p>
          </div>
          {pedido.fechaObjetivo && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Fecha objetivo</p>
              <p className="font-overpass font-bold text-lg">{new Date(pedido.fechaObjetivo).toLocaleDateString('es-AR')}</p>
            </div>
          )}
          {pedido.presupuesto && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Presupuesto</p>
              <p className="font-overpass font-bold text-lg text-green-700">${pedido.presupuesto.toLocaleString('es-AR')}</p>
            </div>
          )}
          {pedido.marca.ubicacion && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Ubicacion marca</p>
              <p className="font-overpass font-bold text-lg">{pedido.marca.ubicacion}</p>
            </div>
          )}
        </div>
        {pedido.descripcion && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Descripcion</p>
            <p className="text-sm text-gray-700">{pedido.descripcion}</p>
          </div>
        )}
      </Card>

      {/* Formulario de cotizacion */}
      {cotizacionExistente ? (
        <Card>
          <div className="text-center py-4">
            <p className="font-overpass font-semibold text-brand-blue">Ya enviaste una cotizacion para este pedido</p>
            <p className="text-sm text-gray-500 mt-1">
              Precio: ${cotizacionExistente.precio.toLocaleString('es-AR')} · Plazo: {cotizacionExistente.plazoDias} dias
            </p>
          </div>
        </Card>
      ) : (
        <Card title="Enviar cotizacion">
          <CotizarForm pedidoId={pedido.id} />
        </Card>
      )}
    </div>
  )
}
```

### Archivo nuevo — `src/taller/componentes/cotizar-form.tsx`

Client component:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/compartido/componentes/ui/input'
import { Button } from '@/compartido/componentes/ui/button'
import { Send } from 'lucide-react'

export function CotizarForm({ pedidoId }: { pedidoId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [precio, setPrecio] = useState('')
  const [plazoDias, setPlazoDias] = useState('')
  const [proceso, setProceso] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId,
          precio: parseFloat(precio),
          plazoDias: parseInt(plazoDias),
          proceso,
          mensaje: mensaje || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setError('Ya tenes una cotizacion activa para este pedido.')
        } else {
          setError(data.error || 'Error al enviar la cotizacion.')
        }
        setLoading(false)
        return
      }

      router.push('/taller/pedidos')
      router.refresh()
    } catch {
      setError('Error de conexion. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Precio ($)"
          type="number"
          min="1"
          step="0.01"
          placeholder="50000"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />
        <Input
          label="Plazo (dias)"
          type="number"
          min="1"
          placeholder="15"
          value={plazoDias}
          onChange={(e) => setPlazoDias(e.target.value)}
          required
        />
      </div>

      <Input
        label="Proceso"
        placeholder="Ej: Corte y confeccion de remeras"
        value={proceso}
        onChange={(e) => setProceso(e.target.value)}
        required
      />

      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">
          Mensaje (opcional)
        </label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Detalle adicional sobre tu cotizacion..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        />
      </div>

      <Button type="submit" loading={loading} icon={<Send className="w-4 h-4" />} className="w-full">
        Enviar cotizacion
      </Button>
    </form>
  )
}
```

### Archivo a modificar — `src/compartido/componentes/layout/user-sidebar.tsx`

En los items del taller (`menuItemsByRole.TALLER`, lineas 43-49), agregar despues de "Academia" y antes de "Notificaciones":

```typescript
{ id: 'pedidos', label: 'Mis Pedidos', href: '/taller/pedidos', icon: ClipboardList },
{ id: 'disponibles', label: 'Pedidos disponibles', href: '/taller/pedidos/disponibles', icon: Search },
```

Verificar que `ClipboardList` y `Search` estan en los imports de lucide-react del archivo (linea 21 ya importa `Search`). Agregar `ClipboardList` si no esta.

---

## 5. Casos borde

- **Pedido ya publicado** → boton "Publicar" no aparece (condicion `=== 'BORRADOR'` lo cubre)
- **Taller que intenta cotizar un pedido ya en EN_EJECUCION** → la pagina `disponibles/[id]` hace `findFirst({ where: { estado: 'PUBLICADO' } })` → retorna `notFound()`. La API retorna 400 como segunda barrera.
- **Sin pedidos disponibles** → mostrar estado vacio con mensaje
- **Taller que ya cotizo** → mostrar resumen de la cotizacion existente en vez del formulario
- **CancelarPedido NO se muestra para ESPERANDO_ENTREGA** → decision de diseno: si el pedido ya esta en camino, cancelarlo seria destructivo. El admin puede cancelarlo manualmente desde Prisma Studio si es necesario.
- **Error 409 en cotizacion** → formulario muestra "Ya tenes una cotizacion activa para este pedido"

---

## 6. Criterio de aceptacion

- [ ] Boton "Publicar pedido" aparece solo en pedidos BORRADOR
- [ ] Al publicar: pedido pasa a PUBLICADO y se refresca la pagina
- [ ] El timeline muestra 5 pasos: BORRADOR → PUBLICADO → EN_EJECUCION → ESPERANDO_ENTREGA → COMPLETADO
- [ ] AsignarTaller aparece en BORRADOR y PUBLICADO
- [ ] CancelarPedido aparece en BORRADOR, PUBLICADO y EN_EJECUCION (no en ESPERANDO_ENTREGA)
- [ ] `/taller/pedidos/disponibles` muestra pedidos PUBLICADOS
- [ ] `/taller/pedidos/disponibles/[id]` muestra detalle + formulario de cotizacion
- [ ] Si el taller ya cotizo, muestra resumen en vez del formulario
- [ ] El formulario valida campos y llama a `POST /api/cotizaciones`
- [ ] El sidebar del taller tiene "Mis Pedidos" y "Pedidos disponibles"
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Loguearse como marca → ir a un pedido BORRADOR → click "Publicar pedido" → verificar que pasa a PUBLICADO
2. Verificar que el timeline ahora muestra PUBLICADO resaltado
3. Loguearse como taller → ir a `/taller/pedidos/disponibles` → verificar que aparece el pedido publicado
4. Click en "Ver y cotizar" → verificar que muestra los datos del pedido + formulario
5. Completar formulario (precio, plazo, proceso) → submit → verificar redirect a `/taller/pedidos`
6. Volver a `/taller/pedidos/disponibles/[id]` → verificar que muestra resumen "Ya enviaste una cotizacion"
7. Verificar que el sidebar del taller muestra ambos links (Mis Pedidos + Pedidos disponibles)
