# Spec: Vistas de cotizaciones — taller y marca

- **Semana:** 3
- **Asignado a:** Sergio
- **Dependencias:** semana2-api-cotizaciones + semana2-publicacion-pedidos-ui mergeados

## ⚠️ ANTES DE ARRANCAR

- `semana2-api-cotizaciones` (Gerardo) — `POST`/`GET`/`PUT /api/cotizaciones` deben existir
- `semana2-publicacion-pedidos-ui` (Sergio) — `/taller/pedidos/disponibles/page.tsx` y `CotizarForm` deben existir. **Si no existen, crearlos como parte de este spec** siguiendo las indicaciones del punto 4.

## 1. Contexto

El marketplace de pedidos disponibles existe a nivel de API pero las páginas de UI no se crearon todavía. Este spec crea la vista de detalle del pedido para el taller (con formulario de cotización) y la sección de cotizaciones recibidas para la marca.

## 2. Qué construir

- `/taller/pedidos/disponibles/[id]` — detalle del pedido con formulario `CotizarForm`
- `CotizarForm` — si no existe, crearlo como client component
- Sección "Cotizaciones recibidas" en `/marca/pedidos/[id]` para pedidos PUBLICADOS
- Botones aceptar/rechazar cotización en la vista de marca

## 3. Datos

- `GET /api/cotizaciones?pedidoId=` retorna cotizaciones del pedido
- `POST /api/cotizaciones` acepta: `{ pedidoId, precio, plazoDias, proceso, mensaje? }`
- `PUT /api/cotizaciones/[id]` con `{ accion: 'ACEPTAR' | 'RECHAZAR' | 'RETIRAR' }`
- Cotización tiene: `id`, `precio`, `plazoDias`, `proceso`, `mensaje?`, `estado`, `venceEn`, `createdAt`

## 4. Prescripciones técnicas

### Archivo nuevo (si no existe) — `src/taller/componentes/cotizar-form.tsx`

Client component. Solo crearlo si no existe tras la implementación de `semana2-publicacion-pedidos-ui`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/compartido/componentes/ui/button'

interface CotizarFormProps {
  pedidoId: string
}

export function CotizarForm({ pedidoId }: CotizarFormProps) {
  const router = useRouter()
  const [proceso, setProceso] = useState('')
  const [precio, setPrecio] = useState('')
  const [plazoDias, setPlazoDias] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  async function handleEnviar() {
    if (!proceso || !precio || !plazoDias) {
      setError('Proceso, precio y plazo son obligatorios')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId,
          proceso,
          precio: parseFloat(precio),
          plazoDias: parseInt(plazoDias),
          mensaje: mensaje || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al enviar cotización')
        return
      }
      setExito(true)
      router.refresh()
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (exito) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 font-medium">Cotización enviada correctamente</p>
        <p className="text-green-600 text-sm mt-1">La marca será notificada.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Proceso *</label>
        <input type="text" value={proceso} onChange={e => setProceso(e.target.value)}
          placeholder="Ej: Corte y confección completa"
          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700">Precio (ARS) *</label>
          <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
            placeholder="Ej: 150000" min="1"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Plazo (días) *</label>
          <input type="number" value={plazoDias} onChange={e => setPlazoDias(e.target.value)}
            placeholder="Ej: 30" min="1"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Mensaje (opcional)</label>
        <textarea value={mensaje} onChange={e => setMensaje(e.target.value)}
          placeholder="Detalle adicional sobre tu cotización..."
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <Button onClick={handleEnviar} disabled={enviando}>
        {enviando ? 'Enviando...' : 'Enviar cotización'}
      </Button>
    </div>
  )
}
```

### Archivo nuevo — `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`

Server component:

```typescript
export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { Badge } from '@/compartido/componentes/ui/badge'
import { CotizarForm } from '@/taller/componentes/cotizar-form'

export default async function PedidoDisponibleDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  // Verificar que el pedido está PUBLICADO
  const pedido = await prisma.pedido.findFirst({
    where: { id, estado: 'PUBLICADO' },
    include: {
      marca: { select: { nombre: true, tipo: true, ubicacion: true } },
    },
  })
  if (!pedido) notFound()

  // Verificar si el taller ya cotizó este pedido
  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })
  const cotizacionExistente = taller ? await prisma.cotizacion.findFirst({
    where: { pedidoId: id, tallerId: taller.id, estado: { in: ['ENVIADA', 'ACEPTADA'] } },
  }) : null

  return (
    <div className="space-y-6">
      <a href="/taller/pedidos/disponibles" className="text-brand-blue hover:underline text-sm">
        ← Volver a pedidos disponibles
      </a>

      {/* Datos del pedido */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold font-overpass text-brand-blue">{pedido.tipoPrenda}</h1>
            <p className="text-gray-500 mt-1">{pedido.marca.nombre}{pedido.marca.ubicacion ? ` · ${pedido.marca.ubicacion}` : ''}</p>
          </div>
          <Badge variant="warning">Publicado</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div><span className="text-gray-500">Cantidad:</span> <span className="font-medium">{pedido.cantidad.toLocaleString()} unidades</span></div>
          {pedido.fechaObjetivo && (
            <div><span className="text-gray-500">Fecha objetivo:</span> <span className="font-medium">{new Date(pedido.fechaObjetivo).toLocaleDateString('es-AR')}</span></div>
          )}
          {pedido.presupuesto && (
            <div><span className="text-gray-500">Presupuesto:</span> <span className="font-medium">$ {pedido.presupuesto.toLocaleString('es-AR')}</span></div>
          )}
          {pedido.descripcion && (
            <div className="col-span-2"><span className="text-gray-500">Descripción:</span> <span className="font-medium">{pedido.descripcion}</span></div>
          )}
        </div>
      </div>

      {/* Formulario de cotización o estado actual */}
      {cotizacionExistente ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800 font-medium">Ya enviaste una cotización para este pedido</p>
          <p className="text-green-600 text-sm mt-1">Estado: {cotizacionExistente.estado}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-overpass font-bold text-gray-800 mb-4">Enviar cotización</h2>
          <CotizarForm pedidoId={pedido.id} />
        </div>
      )}
    </div>
  )
}
```

### Archivos nuevos — `src/marca/componentes/aceptar-cotizacion.tsx` y `rechazar-cotizacion.tsx`

Seguir el patrón exacto de `src/marca/componentes/cancelar-pedido.tsx`: prop con ID, `useState` para loading/confirmación, fetch PUT, `router.refresh()`.

**`aceptar-cotizacion.tsx`:**

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AceptarCotizacion({ cotizacionId }: { cotizacionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [error, setError] = useState('')

  async function handleAceptar() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'ACEPTAR' }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al aceptar')
        return
      }
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
      setConfirmar(false)
    }
  }

  if (confirmar) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={handleAceptar} disabled={loading}
          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Aceptando...' : 'Confirmar'}
        </button>
        <button onClick={() => setConfirmar(false)}
          className="text-xs text-gray-500 hover:underline">
          Cancelar
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  return (
    <button onClick={() => setConfirmar(true)}
      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700">
      Aceptar
    </button>
  )
}
```

**`rechazar-cotizacion.tsx`:**

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RechazarCotizacion({ cotizacionId }: { cotizacionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [error, setError] = useState('')

  async function handleRechazar() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'RECHAZAR' }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al rechazar')
        return
      }
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
      setConfirmar(false)
    }
  }

  if (confirmar) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={handleRechazar} disabled={loading}
          className="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50">
          {loading ? 'Rechazando...' : 'Confirmar'}
        </button>
        <button onClick={() => setConfirmar(false)}
          className="text-xs text-gray-500 hover:underline">
          Cancelar
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  return (
    <button onClick={() => setConfirmar(true)}
      className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50">
      Rechazar
    </button>
  )
}
```

### Archivo a modificar — `src/app/(marca)/marca/pedidos/[id]/page.tsx`

**Cambio 1 — Agregar imports (al inicio del archivo):**

```typescript
import { AceptarCotizacion } from '@/marca/componentes/aceptar-cotizacion'
import { RechazarCotizacion } from '@/marca/componentes/rechazar-cotizacion'
```

**Cambio 2 — Agregar query de cotizaciones después de la query del pedido (después de línea 83):**

```typescript
const cotizaciones = pedido.estado === 'PUBLICADO'
  ? await prisma.cotizacion.findMany({
      where: { pedidoId: pedido.id },
      include: { taller: { select: { nombre: true, nivel: true } } },
      orderBy: { createdAt: 'desc' },
    })
  : []
```

**Cambio 3 — Agregar sección de cotizaciones entre las acciones (línea 190) y las órdenes (línea 193):**

```tsx
{pedido.estado === 'PUBLICADO' && (
  <Card title={`Cotizaciones recibidas (${cotizaciones.length})`}>
    {cotizaciones.length === 0 ? (
      <p className="text-gray-500 text-sm py-4">
        Todavía no recibiste cotizaciones. Los talleres compatibles fueron notificados.
      </p>
    ) : (
      <div className="space-y-3">
        {cotizaciones.map(cot => (
          <div key={cot.id} className="border border-gray-100 rounded-lg p-4">
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
              }>{cot.estado}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
              <div><span className="text-gray-500">Proceso:</span> <span className="font-medium">{cot.proceso}</span></div>
              <div><span className="text-gray-500">Precio:</span> <span className="font-medium">$ {cot.precio.toLocaleString('es-AR')}</span></div>
              <div><span className="text-gray-500">Plazo:</span> <span className="font-medium">{cot.plazoDias} días</span></div>
            </div>
            {cot.mensaje && <p className="text-sm text-gray-600 mt-2 italic">{cot.mensaje}</p>}
            {cot.estado === 'ENVIADA' && (
              <div className="flex gap-2 mt-3">
                <AceptarCotizacion cotizacionId={cot.id} />
                <RechazarCotizacion cotizacionId={cot.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </Card>
)}
```

## 5. Casos borde

- Taller ya cotizó → mostrar estado de la cotización existente en vez del formulario
- Pedido ya no PUBLICADO cuando el taller entra → `notFound()`
- Cotización vencida → la API la marcó VENCIDA (lazy check en GET), mostrar badge "VENCIDA" sin botones de acción
- Error al aceptar → mostrar mensaje del servidor en el componente de confirmación
- `marca.ubicacion` puede ser null → mostrar solo nombre sin separador

## 6. Criterio de aceptación

- [ ] `/taller/pedidos/disponibles/[id]` carga con datos del pedido y formulario de cotización
- [ ] Si ya cotizó muestra el estado de la cotización existente
- [ ] `/marca/pedidos/[id]` muestra sección de cotizaciones cuando estado === PUBLICADO
- [ ] Botones aceptar/rechazar aparecen solo para cotizaciones ENVIADA
- [ ] Al aceptar una cotización la página se refresca y muestra la orden creada
- [ ] Build pasa sin errores

## 7. Tests (verificación manual)

1. Publicar un pedido como marca → verificar que aparece la sección "Cotizaciones recibidas" vacía
2. Loguearse como taller → ir a `/taller/pedidos/disponibles` → click en el pedido → enviar cotización
3. Volver a la marca → verificar que aparece la cotización en la sección
4. Click en "Aceptar" → verificar que la orden se crea y el pedido pasa a EN_EJECUCION
