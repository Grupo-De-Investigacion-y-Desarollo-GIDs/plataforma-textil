# Spec: Error boundaries en todos los layouts

- **Version:** V3
- **Origen:** V3_BACKLOG Q-02
- **Asignado a:** Gerardo
- **Prioridad:** Media — UX degradada pero no bloqueante. Prioritario antes del piloto OIT

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG D-01 mergeado (rutas ESTADO definidas)
- [ ] Next.js App Router en uso (todos los layouts y pages son server components o client components)

---

## 1. Contexto

Hoy si una query falla en produccion (DB caida, timeout, error inesperado en server component), el usuario ve la pagina de error generica de Next.js. Esto es feo, no informativo, y peor: rompe la confianza institucional.

**Ejemplos reales de V2:**

- Sergio reporto multiples veces "pagina rota" cuando una query Prisma fallaba
- Cuando AfipSDK devolvia HTML, los componentes que dependian del taller verificado tronaban
- Si Supabase Storage tarda mucho en responder, la pagina queda en blanco

**Lo que necesita V3 con OIT:**

Cuando algo falla, el usuario debe ver:

1. Un mensaje claro de que paso ("Tuvimos un problema cargando esta pagina")
2. Una accion util ("Volve a intentar" / "Volve al inicio")
3. Un canal para reportar ("Avisanos que hacias cuando paso")
4. Tono institucional, no tecnico ("Algo salio mal" no "Internal Server Error 500")

Y por debajo, los errores deben loguearse para que el admin/dev los vea.

---

## 2. Que construir

1. **`error.tsx` en cada layout principal** — reemplazar los existentes con version que usa `ErrorPage`
2. **`global-error.tsx`** — fallback final si nada mas capturo
3. **Componente `ErrorPage` reutilizable** — UI consistente para todos los errores
4. **`not-found.tsx` en cada layout** — para paginas que no existen (ninguno existe hoy)
5. **Logging server-side de errores** — via endpoint `/api/log-error` que llama a `logActividad`
6. **Componente `Boundary` para client components** — error boundaries de React con `react-error-boundary`
7. **Listener `open-feedback`** — agregar al feedback widget para que ErrorPage pueda abrirlo

---

## 3. Estructura de archivos y cobertura

### 3.1 — Estado actual y prescripcion

Los `error.tsx` **ya existen** en casi todos los route groups. Este spec prescribe **reemplazarlos** con la nueva version que usa el componente `ErrorPage`. Los `not-found.tsx` **no existen en ningun grupo** — se crean nuevos.

| Route group | layout.tsx | error.tsx actual | Prescripcion error.tsx | not-found.tsx actual | Prescripcion not-found.tsx |
|---|---|---|---|---|---|
| `(admin)/admin/` | Si | Si | **Reemplazar** | No | **Crear** |
| `(taller)/taller/` | Si | Si | **Reemplazar** | No | **Crear** |
| `(marca)/marca/` | Si | Si | **Reemplazar** | No | **Crear** |
| `(estado)/estado/` | Si | Si | **Reemplazar** | No | **Crear** |
| `(auth)/` | Si | Si | **Reemplazar** | No | **Crear** |
| `(contenido)/contenido/` | Si | No | **Crear** | No | **Crear** |
| `(public)/` | Si | Si | **Reemplazar** | No | **Crear** |

Ademas, a nivel raiz:

| Archivo | Existe | Prescripcion |
|---|---|---|
| `src/app/error.tsx` | No | **Crear** |
| `src/app/global-error.tsx` | No | **Crear** |
| `src/app/not-found.tsx` | No | **Crear** |

### 3.2 — Estructura de archivos resultante

```
src/app/
├── error.tsx                    <- crear (global, despues de root layout)
├── global-error.tsx             <- crear (error del root layout mismo)
├── not-found.tsx                <- crear (404 global)
│
├── (admin)/
│   └── admin/
│       ├── error.tsx            <- REEMPLAZAR existente
│       ├── not-found.tsx        <- crear
│       └── ...
│
├── (taller)/
│   └── taller/
│       ├── error.tsx            <- REEMPLAZAR existente
│       ├── not-found.tsx        <- crear
│       └── ...
│
├── (marca)/
│   └── marca/
│       ├── error.tsx            <- REEMPLAZAR existente
│       ├── not-found.tsx        <- crear
│       └── ...
│
├── (estado)/
│   └── estado/
│       ├── error.tsx            <- REEMPLAZAR existente
│       ├── not-found.tsx        <- crear
│       └── ...
│
├── (auth)/
│   └── ...
│       └── error.tsx            <- REEMPLAZAR existente
│
├── (contenido)/
│   └── contenido/
│       ├── error.tsx            <- CREAR (no existe hoy)
│       ├── not-found.tsx        <- crear
│       └── ...
│
└── (public)/
    └── ...
        ├── error.tsx            <- REEMPLAZAR existente
        ├── not-found.tsx        <- crear
        └── ...
```

---

## 4. Componente `ErrorPage` reutilizable

Archivo nuevo: `src/compartido/componentes/error-page.tsx`

```tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from './ui/button'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
  contexto?: 'admin' | 'taller' | 'marca' | 'estado' | 'contenido' | 'publico'
}

export function ErrorPage({ error, reset, contexto = 'publico' }: Props) {
  useEffect(() => {
    // Log al servidor via endpoint — error.tsx es client component,
    // console.error aca solo va al browser, no a Vercel Logs.
    // El flujo es: fetch -> /api/log-error -> logearError() -> logActividad() (DB)
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contexto,
        digest: error.digest,
        mensaje: error.message,
        ruta: window.location.pathname,
      })
    }).catch(() => {})
  }, [error, contexto])

  const rutaInicio = {
    admin: '/admin',
    taller: '/taller',
    marca: '/marca',
    estado: '/estado',
    contenido: '/admin/contenido',
    publico: '/',
  }[contexto]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border rounded-lg shadow-sm p-6 text-center">
        <div className="text-4xl mb-4">Warning</div>

        <h1 className="text-xl font-semibold mb-2">
          Algo salio mal
        </h1>

        <p className="text-sm text-zinc-600 mb-6">
          Tuvimos un problema cargando esta pagina. Ya se lo notificamos al equipo.
        </p>

        {error.digest && (
          <p className="text-xs text-zinc-400 mb-4 font-mono">
            Codigo de error: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={reset} variant="primary">
            Intentar de nuevo
          </Button>

          {/* Button no es polimorfico (no acepta as="a").
              Patron del proyecto: Link envolviendo Button. */}
          <Link href={rutaInicio}>
            <Button variant="ghost">
              Volver al inicio
            </Button>
          </Link>
        </div>

        <p className="text-xs text-zinc-500 mt-6">
          Si el problema persiste, podes{' '}
          <button
            onClick={() => abrirFeedback(error.digest)}
            className="underline text-violet-600"
          >
            reportarlo aca
          </button>
        </p>
      </div>
    </div>
  )
}

function abrirFeedback(digest?: string) {
  // Abre el widget de feedback con el digest pre-cargado.
  // El feedback widget escucha este evento — ver cambio prescrito
  // en src/compartido/componentes/feedback-widget.tsx (seccion 4.2).
  const evento = new CustomEvent('open-feedback', {
    detail: { contexto: `error:${digest ?? 'unknown'}` }
  })
  window.dispatchEvent(evento)
}
```

### 4.1 — Nota sobre Button

El componente `Button` (`src/compartido/componentes/ui/button.tsx`) **no es polimorfico** — no acepta prop `as="a"`. El patron establecido en el proyecto para botones que navegan es envolver con `<Link>`:

```tsx
// Correcto (patron del proyecto):
<Link href={rutaInicio}><Button variant="ghost">Volver al inicio</Button></Link>

// Incorrecto (no funciona):
<Button as="a" href={rutaInicio} variant="ghost">Volver al inicio</Button>
```

Las variantes `variant="primary"` y `variant="ghost"` existen y no cambian.

### 4.2 — Cambio requerido en feedback widget

El feedback widget (`src/compartido/componentes/feedback-widget.tsx`) hoy es **self-contained**: se abre con click en su boton flotante, no acepta props ni escucha eventos externos.

**Cambio prescrito:** agregar un `addEventListener` para que `ErrorPage` pueda abrirlo programaticamente:

```tsx
// En src/compartido/componentes/feedback-widget.tsx
// Agregar dentro del componente, junto a los otros useEffect:

useEffect(() => {
  const handler = (e: CustomEvent<{ contexto?: string }>) => {
    setAbierto(true)
    // Opcionalmente pre-llenar el contexto del error
    if (e.detail?.contexto) {
      setMensaje(`[Error: ${e.detail.contexto}] `)
    }
  }

  window.addEventListener('open-feedback', handler as EventListener)
  return () => window.removeEventListener('open-feedback', handler as EventListener)
}, [])
```

Este cambio es retrocompatible — el widget sigue funcionando igual con click manual, pero ahora tambien responde al custom event.

---

## 5. Implementacion por layout

### 5.1 — `src/app/error.tsx` (global, fuera de grupos)

```tsx
'use client'
import { ErrorPage } from '@/compartido/componentes/error-page'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorPage error={error} reset={reset} contexto="publico" />
}
```

### 5.2 — `src/app/global-error.tsx`

Captura errores que ocurren incluso en el root layout (raros pero posibles).

```tsx
'use client'
import { ErrorPage } from '@/compartido/componentes/error-page'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <ErrorPage error={error} reset={reset} contexto="publico" />
      </body>
    </html>
  )
}
```

### 5.3 — Por grupo de rutas

Todos los `error.tsx` por grupo siguen el mismo patron. **Reemplazar** los existentes:

`src/app/(admin)/admin/error.tsx`:

```tsx
'use client'
import { ErrorPage } from '@/compartido/componentes/error-page'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorPage error={error} reset={reset} contexto="admin" />
}
```

Mismo patron para:
- `(taller)/taller/error.tsx` con `contexto="taller"`
- `(marca)/marca/error.tsx` con `contexto="marca"`
- `(estado)/estado/error.tsx` con `contexto="estado"`
- `(contenido)/contenido/error.tsx` con `contexto="contenido"` (crear nuevo)
- `(public)/.../error.tsx` con `contexto="publico"` (reemplazar)
- `(auth)/.../error.tsx` con `contexto="publico"` (reemplazar)

---

## 6. `not-found.tsx`

### 6.1 — Componente reutilizable

```tsx
// src/compartido/componentes/not-found-page.tsx
import Link from 'next/link'
import { Button } from './ui/button'

interface Props {
  contexto?: 'admin' | 'taller' | 'marca' | 'estado' | 'contenido' | 'publico'
  mensaje?: string
}

export function NotFoundPage({ contexto = 'publico', mensaje }: Props) {
  const rutaInicio = {
    admin: '/admin',
    taller: '/taller',
    marca: '/marca',
    estado: '/estado',
    contenido: '/admin/contenido',
    publico: '/',
  }[contexto]

  const mensajeDefault = {
    admin: 'Esta pagina de admin no existe',
    taller: 'No encontramos lo que buscas',
    marca: 'No encontramos lo que buscas',
    estado: 'Esta pagina no existe',
    contenido: 'Esta pagina de contenido no existe',
    publico: 'Pagina no encontrada',
  }[contexto]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-xl font-semibold mb-2">404 — No encontrada</h1>
        <p className="text-sm text-zinc-600 mb-6">{mensaje ?? mensajeDefault}</p>

        <Link href={rutaInicio}>
          <Button variant="primary">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  )
}
```

### 6.2 — Aplicacion

`src/app/not-found.tsx`:
```tsx
import { NotFoundPage } from '@/compartido/componentes/not-found-page'
export default function NotFound() {
  return <NotFoundPage contexto="publico" />
}
```

Y en cada grupo (todos son nuevos — ninguno existe hoy):
- `(admin)/admin/not-found.tsx` con `contexto="admin"`
- `(taller)/taller/not-found.tsx` con `contexto="taller"`
- `(marca)/marca/not-found.tsx` con `contexto="marca"`
- `(estado)/estado/not-found.tsx` con `contexto="estado"`
- `(contenido)/contenido/not-found.tsx` con `contexto="contenido"`
- `(public)/.../not-found.tsx` con `contexto="publico"`

---

## 7. Logging de errores

### 7.1 — Flujo completo

Los `error.tsx` son siempre `'use client'`. Un `console.error` en un client component **solo va al browser**, no a Vercel Logs. Por eso el logging pasa por un endpoint server-side:

```
error.tsx (client) → fetch('/api/log-error') → endpoint (server) → logearError() → logActividad() (DB + console)
```

**`logearError()` se llama SOLO desde el endpoint server-side, nunca desde client components.**

### 7.2 — Helper server-side `logearError`

Archivo nuevo: `src/compartido/lib/error-logger.ts`

```typescript
import { logActividad } from './log'

interface ContextoError {
  contexto: 'admin' | 'taller' | 'marca' | 'estado' | 'contenido' | 'publico' | 'api'
  ruta?: string
  userId?: string
  digest?: string
}

export function logearError(error: Error, ctx: ContextoError) {
  // Log a console (visible en Vercel Logs porque corre server-side)
  console.error('[error]', {
    contexto: ctx.contexto,
    ruta: ctx.ruta,
    userId: ctx.userId,
    digest: ctx.digest,
    message: error.message,
    stack: error.stack?.split('\n').slice(0, 5).join('\n'), // primeras 5 lineas
  })

  // Persistir en DB via logActividad existente
  // Firma: logActividad(accion: string, userId?: string | null, detalles?: Prisma.InputJsonValue)
  if (ctx.contexto !== 'publico') {  // no logueamos errores de paginas publicas
    logActividad('ERROR_RENDER', ctx.userId ?? null, {
      contexto: ctx.contexto,
      ruta: ctx.ruta,
      digest: ctx.digest,
      mensaje: error.message,
    }).catch(() => {})  // no propagar fallas del logger
  }
}
```

**Nota:** `logAccionAdmin` (mencionado en S-04) no existe todavia en el codebase — se crea como parte de S-04. Este spec solo usa `logActividad` que si existe en `src/compartido/lib/log.ts` con firma `logActividad(accion, userId?, detalles?)`.

### 7.3 — Endpoint `/api/log-error`

Archivo nuevo: `src/app/api/log-error/route.ts`

Este endpoint **no existe hoy** — se crea nuevo. No hay conflicto con los 22 API routes existentes.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { logearError } from '@/compartido/lib/error-logger'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()

    // logearError corre server-side — console.error va a Vercel Logs
    logearError(
      new Error(body.mensaje ?? 'Unknown error'),
      {
        contexto: body.contexto ?? 'publico',
        ruta: body.ruta,
        userId: session?.user?.id,
        digest: body.digest,
      }
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
```

---

## 8. Error boundaries en client components especificos

Para componentes complejos que pueden fallar (charts, widgets de chat RAG, etc.), agregar error boundaries de React con `react-error-boundary`.

**Instalacion requerida:**

```bash
npm install react-error-boundary
```

La libreria **no esta instalada hoy**. Bundle: ~2KB minified. Compatible con React 19.2.3 y Next.js 16.1.6.

```tsx
import { ErrorBoundary } from 'react-error-boundary'

function FallbackUI({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="border rounded p-4 bg-amber-50">
      <p className="text-sm text-amber-900 mb-2">No pudimos cargar esta seccion</p>
      <button onClick={resetErrorBoundary} className="text-xs underline">
        Reintentar
      </button>
    </div>
  )
}

// En el componente padre:
<ErrorBoundary FallbackComponent={FallbackUI}>
  <DashboardChart />  // si esto falla, no rompe toda la pagina
</ErrorBoundary>
```

Aplicar en componentes que sabemos que pueden fallar (charts, asistente RAG, widget de WhatsApp, etc.).

---

## 9. Casos borde

- **Error en `error.tsx` mismo** — Next.js usa `global-error.tsx` como fallback. Si ese tambien falla, el browser muestra una pagina blanca con error en consola.

- **Error en `layout.tsx`** — solo `global-error.tsx` lo captura. Por eso el `error.tsx` de cada grupo NO captura errores del layout, solo de sus children.

- **Error durante hidratacion** — los `useEffect` del componente Error se ejecutan despues de hidratar, asi que podes contar con `window` y otros browser APIs.

- **Error sin `error.digest`** — algunos errores client-side no tienen digest. Mostrar "Codigo no disponible" o omitir la seccion.

- **Logging falla** — el `console.error` server-side siempre funciona, el log a DB puede fallar (con catch silencioso). No importa que falle — al menos los logs de Vercel quedan.

- **Loop de errores** — si `reset()` llama de nuevo a la misma pagina y esa falla otra vez, el usuario queda atrapado. Mitigacion: la UI ofrece "Volver al inicio" como salida segura.

- **Error sensible filtrado al usuario** — el mensaje de `error.message` puede contener info tecnica (paths, queries SQL). El `ErrorPage` NO muestra `error.message` directamente — solo "Algo salio mal" + digest. Solo el dev ve `error.message` en los logs de Vercel.

- **Error en produccion vs desarrollo** — Next.js en produccion oculta detalles tecnicos del error. En desarrollo muestra todo. El `ErrorPage` se comporta igual en ambos — siempre muestra mensaje generico al usuario, los detalles van a Vercel Logs via `/api/log-error`.

- **Errores en API routes** — los `error.tsx` no aplican a API routes. Las APIs deben tener su propio manejo con try/catch + retorno consistente (Q-03 cubre esto).

---

## 10. Criterios de aceptacion

- [ ] `src/compartido/componentes/error-page.tsx` reutilizable con `<Link><Button>` (no `as="a"`)
- [ ] `src/compartido/componentes/not-found-page.tsx` reutilizable
- [ ] `src/app/error.tsx` global
- [ ] `src/app/global-error.tsx` para errores en root layout
- [ ] `src/app/not-found.tsx` global
- [ ] `error.tsx` reemplazado en 6 grupos: admin, taller, marca, estado, auth, public
- [ ] `error.tsx` creado en 1 grupo: contenido
- [ ] `not-found.tsx` creado en 7 grupos: admin, taller, marca, estado, contenido, public, auth
- [ ] Feedback widget actualizado con listener `open-feedback` en `feedback-widget.tsx`
- [ ] Helper `logearError` server-side en `src/compartido/lib/error-logger.ts`
- [ ] Endpoint nuevo `/api/log-error` que llama a `logearError()` -> `logActividad()`
- [ ] `react-error-boundary` instalada (~2KB, React 19 compatible)
- [ ] Error boundaries client-side en componentes complejos (charts, RAG, etc.)
- [ ] Logs de error llegan a Vercel Logs via endpoint server-side (no console.error client)
- [ ] Logs de error opcionalmente persistidos en `LogActividad`
- [ ] Mensaje del error no se filtra al usuario (solo digest)
- [ ] Build sin errores de TypeScript

---

## 11. Tests

| # | Que testear | Como | Verificador |
|---|-------------|------|-------------|
| 1 | Error en pagina de admin muestra ErrorPage con contexto admin | Forzar error en `/admin/talleres`, verificar | DEV |
| 2 | Boton "Intentar de nuevo" funciona | Click en boton, verificar reset | QA |
| 3 | Boton "Volver al inicio" lleva al dashboard correcto | Click, verificar URL | QA |
| 4 | Digest del error se muestra | Verificar visible en error | QA |
| 5 | Error.message NO se muestra al usuario | Inspeccionar UI, no debe estar | DEV |
| 6 | Logs aparecen en Vercel Logs via /api/log-error | Forzar error, ver logs | DEV |
| 7 | not-found dentro de admin muestra contexto admin | `/admin/no-existe` | QA |
| 8 | Error en client component no rompe toda la pagina | Componente con ErrorBoundary | DEV |
| 9 | Endpoint `/api/log-error` recibe correctamente | Llamar con curl, verificar log | DEV |
| 10 | Error sin digest se maneja sin romper UI | Forzar error sin digest | DEV |
| 11 | "Reportarlo aca" abre el feedback widget | Click, verificar widget abierto | QA |
| 12 | Cobertura de 7 route groups | Forzar error en cada uno | DEV |

---

## 12. Validacion de dominio

Este spec es puramente tecnico — no aplica el Eje 6.

---

## 13. Referencias

- V3_BACKLOG -> Q-02
- Next.js error handling: https://nextjs.org/docs/app/building-your-application/routing/error-handling
- react-error-boundary: https://github.com/bvaughn/react-error-boundary
- `logActividad` existente: `src/compartido/lib/log.ts` — firma: `logActividad(accion, userId?, detalles?)`
- `logAccionAdmin` (S-04): no existe todavia, se crea en S-04. Este spec no lo usa
