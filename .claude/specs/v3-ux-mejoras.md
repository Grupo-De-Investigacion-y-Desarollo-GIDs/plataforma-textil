# Spec: Mejoras UX agrupadas (UX-01 a UX-04)

- **Versión:** V3
- **Origen:** V3_BACKLOG UX-01, UX-02, UX-03, UX-04
- **Asignado a:** Gerardo
- **Prioridad:** Media — fricciones identificadas durante V2 que mejoran sustancialmente la experiencia, sin ser bloqueantes

---

## ANTES DE ARRANCAR

- [ ] Q-02 mergeado (componentes de error/loading consistentes)
- [ ] Q-03 mergeado (define `apiFetch` con códigos de error usados en mensajes — `src/compartido/lib/api-client.ts`)
- [ ] D-01 mergeado (define rutas `/estado/talleres` y `/estado/talleres/[id]` requeridas para empty states y breadcrumbs)
- [ ] Diseño de `Loading` y `EmptyState` decidido (puede haber variantes simples para V3)

---

## 1. Contexto

V2 funciona pero tiene fricciones de UX que el QA y los compañeros interdisciplinarios identificaron. No son bugs críticos — son **cosas que sumadas hacen que la plataforma se sienta menos profesional**:

- **UX-01:** estados de carga inconsistentes — algunas páginas tienen spinner, otras quedan en blanco, otras saltan abruptamente
- **UX-02:** estados vacíos sin guía — "no hay pedidos" sin explicar qué hacer
- **UX-03:** mensajes de error sin contexto — "Error al guardar" sin info útil
- **UX-04:** breadcrumbs y navegación inconsistente — el usuario se pierde, especialmente en admin

Para V3 con OIT estas cosas suman al "feel" institucional de la plataforma. La diferencia entre "esto parece un proyecto académico" y "esto está listo para producción" muchas veces está en estos detalles.

**Lo que NO vamos a hacer:**

Rediseño visual completo. El design system de V2 está bien.

**Lo que SÍ vamos a hacer:**

Estandarizar 4 patrones específicos en toda la plataforma con componentes reutilizables.

---

## 2. Qué construir

### UX-01 — Estados de carga consistentes

1. **Componente `<Loading>` complementario** con variantes (spinner, fullPage, inline) — para uso en componentes, NO reemplaza SkeletonPage existente
2. **`<Suspense>` con fallback** en páginas con queries — requiere extraer queries a child components async
3. **Skeletons específicos** para listados grandes (talleres, marcas, pedidos)

### UX-02 — Estados vacíos con guía

4. **Componente `<EmptyState>`** con icono, mensaje, y CTA opcional
5. **Aplicación en 8 listados clave** (pedidos, talleres, marcas, etc.)

### UX-03 — Mensajes de error contextuales

6. **Extender toast custom existente** con variantes (warning, info), description y action button
7. **Mensajes de error específicos** en formularios críticos usando códigos de Q-03

### UX-04 — Breadcrumbs y navegación

8. **Componente `<Breadcrumbs>`** manual con items
9. **Aplicación en todas las páginas de detalle**, reemplazando el patrón `<ArrowLeft /> Volver a...`

---

## 3. UX-01: Estados de carga

### 3.1 — Sistema existente (NO tocar)

El codebase ya tiene un sistema de loading consistente que funciona bien:

- **`src/compartido/componentes/ui/skeleton-page.tsx`** — componente compartido con cards configurables, usado por todos los loading.tsx
- **7 archivos `loading.tsx`** (root + admin, auth, estado, marca, public, taller) — todos usan SkeletonPage
- **`Button` con prop `loading`** — muestra `Loader2` con `animate-spin` de lucide-react
- **5 componentes** usan `Loader2` manualmente (marcar-realizado-button, upload-button, ver-documento-button, asistente-chat, feedback-widget) — aceptable porque son botones, no páginas

**SkeletonPage se usa para páginas completas. No crear competencia.**

Si hace falta agregar variantes a SkeletonPage (por ejemplo un skeleton de tabla vs cards), se expande ese componente. No se crea otro componente de skeleton de página.

### 3.2 — Componente `<Loading>` (COMPLEMENTARIO)

Archivo nuevo: `src/compartido/componentes/ui/loading.tsx`

Este componente es para uso **inline en componentes**, no para loading de páginas (eso ya lo maneja SkeletonPage + loading.tsx).

```tsx
import { cn } from '@/compartido/lib/utils'

interface LoadingProps {
  variant?: 'spinner' | 'fullPage' | 'inline'
  mensaje?: string
  className?: string
}

export function Loading({ variant = 'spinner', mensaje, className }: LoadingProps) {
  if (variant === 'fullPage') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        {mensaje && <p className="text-sm text-zinc-600">{mensaje}</p>}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <Spinner size="sm" />
        {mensaje && <span className="text-sm">{mensaje}</span>}
      </span>
    )
  }

  // spinner default
  return (
    <div className={cn("flex items-center justify-center py-8 gap-2", className)}>
      <Spinner />
      {mensaje && <p className="text-sm text-zinc-600">{mensaje}</p>}
    </div>
  )
}

function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }

  return (
    <div
      className={cn(
        sizes[size],
        "border-2 border-zinc-300 border-t-violet-600 rounded-full animate-spin"
      )}
    />
  )
}
```

### 3.3 — Skeletons para listados

```tsx
// src/compartido/componentes/ui/skeleton.tsx

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-zinc-200 rounded",
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}
```

### 3.4 — Aplicación de Suspense en páginas

**Prerequisito:** Las queries actuales están inline en la función `async` del `page.tsx`. No se puede meter `<Suspense>` alrededor de algo que ya se awaiteó en el parent. **Primero hay que extraer las queries a child components async**, luego envolverlos en Suspense.

**Modelo a seguir:** `admin/notificaciones/page.tsx` ya tiene `async function ComunicacionesTab()` como child component async — es el patrón correcto.

**Patrón de refactoring:**

```tsx
// ANTES (inline en page.tsx — no admite Suspense)
export default async function PedidosDisponibles() {
  const [pedidos, totalCount] = await Promise.all([...])
  return <div>... {pedidos.map(...)} ...</div>
}

// DESPUÉS (query extraída a child component async)
export default function PedidosDisponibles() {
  return (
    <div>
      <h1>Pedidos disponibles</h1>
      <Suspense fallback={<SkeletonTable rows={5} />}>
        <ListaPedidos />
      </Suspense>
    </div>
  )
}

async function ListaPedidos() {
  const [pedidos, totalCount] = await Promise.all([...])
  return <div>{pedidos.map(...)}</div>
}
```

**Tabla de dificultad por página:**

| Página | Dificultad | Trabajo requerido |
|--------|------------|-------------------|
| `taller/pedidos/disponibles` | BAJA | Extraer 1 Promise.all a child component |
| `taller/pedidos` | BAJA | Extraer lista de órdenes a child component |
| `admin/auditorias` | BAJA | Extraer stats + lista a 2-3 children |
| `marca/pedidos` | MEDIA | Extraer KPIs + lista filtrada a 2 children |
| `estado/page` | ALTA | 13 queries en `$transaction` — splitear en secciones |
| `admin/dashboard` | EXCEPCIÓN | Es `'use client'` — no aplica Suspense con server components |

**Páginas con dificultad BAJA:** aplicar en esta spec.
**Páginas con dificultad MEDIA:** aplicar en esta spec.
**Páginas con dificultad ALTA (estado/page):** evaluar si vale la pena para V3. El $transaction con 13 queries hace que el split sea complejo.
**Excepciones (admin/dashboard):** no tocar — es client component, la estrategia de loading es diferente.

---

## 4. UX-02: Estados vacíos con guía

### 4.1 — Componente `<EmptyState>`

```tsx
// src/compartido/componentes/ui/empty-state.tsx

interface EmptyStateProps {
  icono: string                      // emoji o ícono
  titulo: string
  mensaje: string
  accion?: {
    texto: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icono, titulo, mensaje, accion }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-5xl mb-4">{icono}</div>
      <h3 className="font-semibold mb-2">{titulo}</h3>
      <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">{mensaje}</p>

      {accion && (
        accion.href ? (
          <Link href={accion.href}>
            <Button>{accion.texto}</Button>
          </Link>
        ) : (
          <Button onClick={accion.onClick}>{accion.texto}</Button>
        )
      )}
    </div>
  )
}
```

### 4.2 — Aplicación en 8 listados clave

| Página | Path real | Empty state | Notas |
|--------|-----------|-------------|-------|
| Pedidos disponibles (taller) | `/taller/pedidos/disponibles` | "Por ahora no hay pedidos compatibles. Te avisamos cuando aparezcan." | Existe inline, reemplazar con componente |
| Órdenes de manufactura (taller) | `/taller/pedidos` | "Todavía no tenés órdenes de manufactura. [Ver pedidos disponibles]" | Existe inline, reemplazar con componente |
| Pedidos (marca) | `/marca/pedidos` | "No tenés pedidos publicados. [Crear uno]" | Existe inline con condicional, reemplazar |
| Cotizaciones de un pedido (marca) | `/marca/pedidos/[id]` (sección inline) | "Todavía no recibiste cotizaciones. Los talleres compatibles ya fueron notificados." | Las cotizaciones se muestran inline en la página del pedido. Hoy se oculta la sección si count=0 — cambiar a mostrar EmptyState |
| Talleres (admin) | `/admin/talleres` | "No hay talleres registrados aún." | Existe inline, reemplazar |
| Notificaciones (admin) | `/admin/notificaciones` | "No hay notificaciones programadas." | Existe con ícono, reemplazar con componente |
| Talleres pendientes (estado) | ⏸ Pendiente D-01 — `/estado/talleres` | "No hay talleres pendientes de validación." | Ruta no existe aún. Implementar cuando D-01 esté mergeado |
| Notificaciones (cuenta) | `/cuenta/notificaciones` | "Estás al día. No tenés notificaciones nuevas." | Existe con ícono, reemplazar con componente |

Cada empty state usa el componente con icono apropiado y CTA cuando aplica.

---

## 5. UX-03: Mensajes de error contextuales

### 5.1 — Extender toast custom existente

**Sistema actual:** `src/compartido/componentes/ui/toast.tsx` con Context API. Hook `useToast()` con firma `toast(message: string, type?: 'success' | 'error')`. `ToastProvider` montado en `src/app/providers.tsx`. 14 call sites existentes.

**NO instalar sonner.** Extender el sistema custom existente. Razones:
- Ya funciona y los 14 call sites no requieren migración
- Menos dependencias externas
- El componente custom se adapta mejor al design system de la plataforma

**Cambios a aplicar al toast existente:**

1. **Agregar variantes `warning` e `info`** al type union (hoy solo tiene `success` | `error`)
2. **Agregar soporte para `description`** — texto secundario opcional debajo del mensaje principal
3. **Agregar opción de `accion`** — botón con texto + onClick dentro del toast
4. **Limitar a 3 toasts visibles** — si hay más, los viejos se descartan

**Nueva firma del hook (retrocompatible):**

```tsx
// Uso simple (sin cambios, retrocompatible con los 14 call sites)
toast('Cotización enviada', 'success')

// Uso extendido (nuevo)
toast({
  mensaje: 'Ya cotizaste este pedido',
  tipo: 'warning',
  description: 'Si querés actualizar tu cotización, editala desde tu lista.',
  accion: {
    texto: 'Ver mis cotizaciones',
    onClick: () => router.push('/taller/pedidos')
  }
})
```

**Tarea adicional:** Migrar 4 usos de `alert()` nativo al toast extendido:
- `src/app/(taller)/taller/perfil/completar/page.tsx` — "Error al guardar..."
- `src/marca/componentes/contactar-taller.tsx` — "Este taller no tiene telefono..."
- `src/marca/componentes/publicar-pedido.tsx` — 2 alerts (error y network failure)

### 5.2 — Mensajes específicos en formularios críticos

**Dependencia: Q-03 debe estar mergeado** (define `apiFetch` con códigos de error estructurados).

Mejorar los mensajes de error en formularios usando los códigos de Q-03:

```tsx
const result = await apiFetch('/api/cotizaciones', { ... })

if (!result.ok) {
  if (result.error?.code === 'CONFLICT') {
    toast({
      mensaje: 'Ya cotizaste este pedido',
      tipo: 'error',
      description: 'Si querés actualizar tu cotización, editala desde tu lista de cotizaciones.',
      accion: {
        texto: 'Ver mis cotizaciones',
        onClick: () => router.push('/taller/pedidos')
      }
    })
  } else if (result.error?.code === 'INVALID_INPUT') {
    // Mostrar errores en campos
    setErrores(result.error.details)
  } else {
    toast({
      mensaje: 'No pudimos guardar tu cotización',
      tipo: 'error',
      description: result.error?.message || 'Algo salió mal. Intentá de nuevo.',
    })
  }
}
```

### 5.3 — Mensajes positivos

Cada acción exitosa importante también muestra toast de confirmación:

- "Cotización enviada" — al cotizar
- "Pedido publicado" — al publicar
- "Documento aprobado" — al aprobar (para ESTADO)
- "Mensaje enviado" — al mandar mensaje individual
- "Datos actualizados" — al editar perfil

---

## 6. UX-04: Breadcrumbs

### 6.1 — Componente `<Breadcrumbs>`

```tsx
// src/compartido/componentes/ui/breadcrumbs.tsx

interface Breadcrumb {
  label: string
  href?: string  // si no hay href, es el current
}

interface Props {
  items: Breadcrumb[]
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-zinc-600 mb-4">
      {items.map((item, idx) => (
        <Fragment key={idx}>
          {idx > 0 && <ChevronRight className="w-3 h-3 text-zinc-400" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-zinc-900">
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-900 font-medium">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
```

### 6.2 — Reemplazo del patrón "Volver a..."

**Los breadcrumbs reemplazan** el patrón actual de `<ArrowLeft /> Volver a...` que existe en 37 archivos. **NO conviven** — el breadcrumb es más rico y reemplaza el ArrowLeft.

Patrón actual a reemplazar:
```tsx
// ANTES (en 37 archivos)
<Link href="/admin/talleres" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
  <ArrowLeft className="w-4 h-4" /> Volver a talleres
</Link>

// DESPUÉS
<Breadcrumbs items={[
  { label: 'Admin', href: '/admin' },
  { label: 'Talleres', href: '/admin/talleres' },
  { label: taller.nombre },
]} />
```

### 6.3 — Páginas que adoptan breadcrumbs

Aplicar en todas las páginas de **detalle** (2+ niveles abajo). Las páginas raíz (`/admin`, `/marca`, etc.) no necesitan breadcrumbs.

| Página | Path | Breadcrumb items |
|--------|------|------------------|
| Detalle taller (admin) | `/admin/talleres/[id]` | Admin → Talleres → {nombre} |
| Detalle marca (admin) | `/admin/marcas/[id]` | Admin → Marcas → {nombre} |
| Detalle pedido (marca) | `/marca/pedidos/[id]` | Marca → Pedidos → Pedido {omId} |
| Detalle pedido disponible (taller) | `/taller/pedidos/disponibles/[id]` | Taller → Pedidos disponibles → {tipoPrenda} |
| Detalle orden (taller) | `/taller/pedidos/[id]` | Taller → Mis órdenes → Orden {id} |
| Detalle auditoría (admin) | `/admin/auditorias/[id]` | Admin → Auditorías → Auditoría {id} |
| ⏸ Detalle taller (estado) | `/estado/talleres/[id]` | Estado → Talleres → {nombre} — Pendiente D-01 |

Adicionalmente, verificar si hay otras páginas de detalle con `<ArrowLeft />` que no estén en esta lista y aplicar breadcrumbs también.

---

## 7. Casos borde

- **Loading muy rápido (<200ms)** — el spinner aparece y desaparece haciendo flicker. Mitigación: para V3 mantenerlo simple — Suspense lo maneja razonablemente. No agregar delay artificial.

- **Empty state durante loading** — si la query aún no terminó pero la lista está vacía, mostrar Loading, no EmptyState. El componente padre decide.

- **Toast con muchos mensajes simultáneos** — el toast extendido limita a 3 visibles. Los viejos se descartan.

- **Breadcrumbs con labels largos** — "Pedido 800-remeras-deportivas-dulcemoda" puede romper el layout. Truncar a 30 chars con tooltip.

- **Skeletons que no matchean el contenido real** — si el skeleton tiene 3 columnas y el contenido real tiene 5, el "salto" es visible. Mitigación: skeletons aproximados son OK para V3, no necesitan ser pixel-perfect.

- **Empty state con CTA que no resuelve** — un empty state que dice "No hay pedidos. Crear uno" pero el usuario no es marca → ir al destino correcto según rol del usuario actual.

- **Error messages con datos sensibles** — un toast de error puede leakear info técnica. El toast siempre usa el `message` user-friendly del formato Q-03, nunca el error raw.

- **Breadcrumbs en mobile** — pueden romper el layout. Para mobile, mostrar solo el último level con un ← hacia el padre.

---

## 8. Criterios de aceptación

### UX-01
- [ ] Componente `<Loading>` con 3 variantes (spinner, fullPage, inline) — complementario a SkeletonPage
- [ ] Componente `<Skeleton>`, `<SkeletonCard>`, `<SkeletonTable>`
- [ ] Suspense con fallback aplicado en al menos 5 páginas (queries extraídas a child components async)
- [ ] `admin/dashboard` NO tocado (es client component, excepción)

### UX-02
- [ ] Componente `<EmptyState>` reutilizable
- [ ] 7 listados con empty state aplicado (8vo pendiente D-01)

### UX-03
- [ ] Toast extendido con variantes warning/info, description y action button
- [ ] Firma retrocompatible — los 14 call sites existentes siguen funcionando
- [ ] 4 `alert()` nativos migrados a toast
- [ ] Mensajes específicos en al menos 5 formularios críticos (requiere Q-03)
- [ ] Toasts de éxito en acciones importantes

### UX-04
- [ ] Componente `<Breadcrumbs>` reutilizable
- [ ] Breadcrumbs aplicados en al menos 6 páginas de detalle (7ma pendiente D-01)
- [ ] Patrón `<ArrowLeft /> Volver a...` eliminado de todas las páginas con breadcrumbs

### General
- [ ] Build sin errores de TypeScript
- [ ] Mobile-friendly (todos los componentes funcionan en viewport pequeño)

---

## 9. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | Loading aparece mientras la query carga | Página con query lenta, ver spinner | QA |
| 2 | EmptyState aparece cuando no hay datos | Filtrar a algo sin resultados | QA |
| 3 | EmptyState con CTA lleva al destino correcto | Click en botón | QA |
| 4 | Toast de éxito aparece al cotizar | Crear cotización | QA |
| 5 | Toast de error con código CONFLICT muestra mensaje específico | Cotizar dos veces el mismo pedido | QA |
| 6 | Toast warning/info se renderizan correctamente | Disparar manualmente | DEV |
| 7 | Toast con action button funciona | Click en acción del toast | QA |
| 8 | Breadcrumbs llevan al nivel anterior | Click en breadcrumb intermedio | QA |
| 9 | Breadcrumbs en mobile no rompen layout | DevTools mobile, verificar | QA |
| 10 | Skeleton no parpadea en queries rápidas | Cargar página con datos en cache | DEV |
| 11 | Múltiples toasts no se superponen (max 3) | Disparar 4 toasts seguidos | QA |
| 12 | Los 4 alert() migrados funcionan como toast | Provocar cada caso | QA |

---

## 10. Validación de dominio (perfiles interdisciplinarios)

**Politólogo:** este spec es puramente técnico/UX, no aplica.

**Economista:** este spec es puramente técnico/UX, no aplica.

**Sociólogo:**
- ¿Los mensajes de empty state son comprensibles para usuarios de baja alfabetización digital?
- ¿Los toasts son percibidos como ayudas o como interrupciones?
- ¿Los breadcrumbs ayudan a la orientación o son ruido visual?

**Contador:** este spec es puramente técnico/UX, no aplica.

---

## 11. Referencias

- V3_BACKLOG → UX-01, UX-02, UX-03, UX-04
- V2 hallazgos del QA y feedback de compañeros interdisciplinarios
- Q-02 — error boundaries (filosofía consistente)
- Q-03 — códigos de error y `apiFetch` para mensajes específicos
- D-01 — rutas de estado necesarias para empty states y breadcrumbs
