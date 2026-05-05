# Componentes UX — Referencia rapida

Componentes reutilizables introducidos en V3 (spec UX-mejoras). Usar en todos los specs siguientes (F-04, F-02, F-07, T-03, T-02).

---

## `<Loading>`

**Archivo:** `src/compartido/componentes/ui/loading.tsx`

Spinner complementario para uso inline en componentes. NO reemplaza `SkeletonPage` (que se usa en `loading.tsx` de rutas).

```tsx
import { Loading } from '@/compartido/componentes/ui/loading'

// Spinner centrado (default)
<Loading />

// Con mensaje
<Loading mensaje="Cargando datos..." />

// Inline (dentro de un boton o texto)
<Loading variant="inline" mensaje="Procesando" />

// Pagina completa
<Loading variant="fullPage" mensaje="Preparando tu cuenta" />
```

**Variantes:** `spinner` (default), `fullPage`, `inline`

**Cuando usar:**
- `spinner` — dentro de cards o secciones que cargan datos parciales
- `inline` — dentro de un parrafo o junto a un boton
- `fullPage` — pantallas de transicion (raro, preferir `SkeletonPage`)

---

## `<EmptyState>`

**Archivo:** `src/compartido/componentes/ui/empty-state.tsx`

Estado vacio estandarizado para listas sin resultados.

```tsx
import { EmptyState } from '@/compartido/componentes/ui/empty-state'

// Basico
<EmptyState
  titulo="Sin pedidos"
  mensaje="Todavia no tenes pedidos creados."
/>

// Con CTA (link)
<EmptyState
  titulo="Sin ordenes"
  mensaje="Explora los pedidos disponibles para cotizar."
  accion={{ texto: 'Ver pedidos', href: '/taller/pedidos/disponibles' }}
/>

// Con CTA (onClick) — requiere 'use client'
<EmptyState
  titulo="Sin resultados"
  mensaje="No hay talleres para esos filtros."
  accion={{ texto: 'Limpiar filtros', onClick: () => resetFiltros() }}
/>
```

**Props:**
- `titulo` (string) — titulo en negrita
- `mensaje` (string) — texto descriptivo
- `accion` (opcional) — `{ texto, href? , onClick? }`

**Cuando usar:**
- Listas vacias (pedidos, talleres, cotizaciones, notificaciones)
- Resultados de busqueda sin matches
- NO usar cuando la lista esta cargando (usar Loading en su lugar)

---

## `<Breadcrumbs>`

**Archivo:** `src/compartido/componentes/ui/breadcrumbs.tsx`

Navegacion jeraquica que reemplaza el patron `<ArrowLeft /> Volver a...`.

```tsx
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'

<Breadcrumbs items={[
  { label: 'Admin', href: '/admin' },
  { label: 'Talleres', href: '/admin/talleres' },
  { label: taller.nombre },  // ultimo item sin href = pagina actual
]} />
```

**Props:**
- `items` — array de `{ label: string, href?: string }`
- El ultimo item NO lleva `href` (es la pagina actual, se renderiza en negrita)

**Comportamiento mobile:**
- En pantallas < 640px muestra solo un link al padre con chevron izquierdo
- En desktop muestra la cadena completa separada por chevrons
- Labels > 30 caracteres se truncan con "..."

**Cuando usar:**
- Todas las paginas de detalle (2+ niveles de profundidad)
- Las paginas raiz (/admin, /marca, /taller, /estado) NO necesitan breadcrumbs

---

## Toast extendido

**Archivo:** `src/compartido/componentes/ui/toast.tsx`

Sistema de notificaciones temporales. Extendido en V3 con variantes warning/info, description y action button.

```tsx
'use client'
import { useToast } from '@/compartido/componentes/ui/toast'

function MiComponente() {
  const { toast } = useToast()

  // Firma simple (retrocompatible con V2)
  toast('Operacion exitosa', 'success')
  toast('Algo fallo', 'error')

  // Nuevas variantes
  toast('Atencion: datos incompletos', 'warning')
  toast('Nuevo mensaje disponible', 'info')

  // Firma extendida con description
  toast({
    mensaje: 'Ya cotizaste este pedido',
    tipo: 'warning',
    description: 'Si queres actualizarla, editala desde tu lista.',
  })

  // Con action button
  toast({
    mensaje: 'Cotizacion enviada',
    tipo: 'success',
    accion: {
      texto: 'Ver mis cotizaciones',
      onClick: () => router.push('/taller/pedidos'),
    },
  })
}
```

**Variantes:** `success` (verde), `error` (rojo), `warning` (ambar), `info` (azul)

**Comportamiento:**
- Auto-dismiss a los 5 segundos
- Maximo 3 toasts visibles simultaneamente (los viejos se descartan)
- Boton de dismiss manual (X)
- Posicion: bottom-right, animacion slide-in

**Cuando usar:**
- Confirmacion de acciones exitosas (publicar, cotizar, aceptar, guardar)
- Errores en formularios que no requieren campo especifico
- Warnings (ej: "taller sin telefono")
- Info (ej: "nueva funcionalidad disponible")
- NO usar para errores de validacion de campo (usar estado local del form)

---

## `<Skeleton>`, `<SkeletonCard>`, `<SkeletonTable>`

**Archivo:** `src/compartido/componentes/ui/skeleton.tsx`

Placeholders animados para contenido que esta cargando.

```tsx
import { Skeleton, SkeletonCard, SkeletonTable } from '@/compartido/componentes/ui/skeleton'

// Linea individual (util para texto)
<Skeleton className="h-4 w-3/4" />

// Card completa (titulo + 2 lineas)
<SkeletonCard />

// Tabla con N filas
<SkeletonTable rows={5} />
```

**Cuando usar:**
- Como `fallback` de `<Suspense>` en server components
- Dentro de `loading.tsx` de rutas (alternativa a SkeletonPage para tablas)
- NO usar para botones o inputs (usar el prop `loading` de Button)

---

## Patron Suspense

Para paginas con queries async, extraer la query a un child component y envolverlo en Suspense:

```tsx
import { Suspense } from 'react'
import { SkeletonTable } from '@/compartido/componentes/ui/skeleton'

// El page.tsx NO es async
export default function MiPagina() {
  return (
    <div>
      <h1>Titulo</h1>
      <Suspense fallback={<SkeletonTable rows={5} />}>
        <ListaDatos />
      </Suspense>
    </div>
  )
}

// Child component async con la query
async function ListaDatos() {
  const datos = await prisma.tabla.findMany(...)
  return <div>{datos.map(...)}</div>
}
```
