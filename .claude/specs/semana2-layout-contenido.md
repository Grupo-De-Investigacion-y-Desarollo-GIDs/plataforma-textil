# Spec: Layout y paginas base del rol CONTENIDO

- **Semana:** 2
- **Asignado a:** Sergio
- **Dependencias:** semana1-infra-contenido (Gerardo debe haber mergeado primero — LogoutButton compartido debe existir en `src/compartido/componentes/ui/logout-button.tsx`)

---

## ANTES DE ARRANCAR

Verificar que estos commits estan en develop antes de tocar codigo:

- [ ] semana1-infra-contenido (Gerardo) — commit con mensaje `feat: agregar rol CONTENIDO al schema y middleware`
- [ ] Verificar que existe `src/compartido/componentes/ui/logout-button.tsx`

Si no estan mergeados, NO arrancar. Avisarle a Gerardo.

---

## 1. Contexto

El rol CONTENIDO necesita su propio panel con sidebar y navegacion. Sigue el mismo patron que el layout admin (server component con sidebar fijo en desktop) pero con solo 3 secciones. Agregar deteccion de pathname activo que el admin no tiene pero deberia.

---

## 2. Que construir

- Layout principal `src/app/(contenido)/layout.tsx` con header, sidebar y auth guard
- Pagina raiz `src/app/(contenido)/contenido/page.tsx` que redirige a `/contenido/colecciones`
- Paginas stub para las 3 secciones — se conectan a datos reales en specs posteriores:
  - `src/app/(contenido)/contenido/colecciones/page.tsx`
  - `src/app/(contenido)/contenido/evaluaciones/page.tsx`
  - `src/app/(contenido)/contenido/notificaciones/page.tsx`

---

## 3. Datos

- No hay cambios de schema ni APIs
- El layout lee la sesion con `auth()` para el auth guard
- Las paginas stub no hacen queries — muestran un placeholder hasta que se conecten

---

## 4. Prescripciones tecnicas

### Archivo nuevo — `src/app/(contenido)/contenido-sidebar.tsx`

Client component con items definidos internamente. Los iconos de Lucide no son serializables entre server → client boundary, por lo que no se pueden pasar como props desde el layout.

```typescript
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ClipboardList, Bell } from 'lucide-react'

const sidebarItems = [
  { label: 'Colecciones', href: '/contenido/colecciones', icon: BookOpen },
  { label: 'Evaluaciones', href: '/contenido/evaluaciones', icon: ClipboardList },
  { label: 'Notificaciones', href: '/contenido/notificaciones', icon: Bell },
]

export function ContenidoSidebar() {
  const pathname = usePathname()
  return (
    <nav className="p-4 space-y-1">
      {sidebarItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-overpass transition-colors ${
              pathname.startsWith(item.href)
                ? 'bg-brand-blue text-white'
                : 'text-gray-700 hover:bg-brand-bg-light hover:text-brand-blue'
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
```

### Archivo nuevo — `src/app/(contenido)/layout.tsx`

Server component. Seguir exactamente el mismo patron que `src/app/(admin)/layout.tsx` con estas diferencias:

```typescript
import { auth } from '@/compartido/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/compartido/componentes/ui/logout-button'
import { ContenidoSidebar } from './contenido-sidebar'

export default async function ContenidoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'CONTENIDO' && session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-blue text-white sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="font-overpass font-bold text-brand-blue text-sm">PDT</span>
            </div>
            <span className="font-overpass font-bold text-lg">Panel de Contenidos</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:text-blue-200 transition-colors">
              Volver al sitio
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden lg:block">
          <ContenidoSidebar />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
```

### Archivo nuevo — `src/app/(contenido)/contenido/page.tsx`

```typescript
import { redirect } from 'next/navigation'

export default function ContenidoPage() {
  redirect('/contenido/colecciones')
}
```

### Archivos nuevos — paginas stub (3 archivos)

Cada una muestra un placeholder con el titulo de la seccion. Patron identico para las 3:

**`src/app/(contenido)/contenido/colecciones/page.tsx`**

```typescript
import { Card } from '@/compartido/componentes/ui/card'
import { BookOpen } from 'lucide-react'

export default function ContenidoColeccionesPage() {
  return (
    <div>
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-4">Colecciones</h1>
      <Card>
        <div className="flex items-center gap-3 text-gray-400">
          <BookOpen className="w-6 h-6" />
          <p className="text-sm">En construccion — conectar datos en spec siguiente.</p>
        </div>
      </Card>
    </div>
  )
}
```

**`src/app/(contenido)/contenido/evaluaciones/page.tsx`** — mismo patron con titulo "Evaluaciones" e icono `ClipboardList`.

**`src/app/(contenido)/contenido/notificaciones/page.tsx`** — mismo patron con titulo "Notificaciones" e icono `Bell`.

---

## 5. Casos borde

- **Usuario ADMIN accede a `/contenido`** → debe poder acceder (auth guard lo permite)
- **Usuario TALLER accede a `/contenido`** → redirect a `/unauthorized` (middleware ya lo maneja, el auth guard en el layout es redundante pero defensivo)
- **En mobile el sidebar esta oculto** (`hidden lg:block`) igual que el admin — no hay sidebar mobile por ahora

---

## 6. Criterio de aceptacion

- [ ] Usuario CONTENIDO puede loguearse y ve el panel con los 3 items en el sidebar
- [ ] El item activo se resalta visualmente (`bg-brand-blue text-white`) al navegar entre secciones
- [ ] Usuario ADMIN puede acceder a `/contenido`
- [ ] Usuario TALLER ve `/unauthorized` al intentar acceder a `/contenido`
- [ ] `/contenido` redirige automaticamente a `/contenido/colecciones`
- [ ] Las 3 paginas stub renderizan sin error
- [ ] `ContenidoSidebar` define los items internamente (no recibe props)
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Loguearse con usuario CONTENIDO → verificar que llega a `/contenido/colecciones`
2. Navegar entre las 3 secciones → verificar que el item activo se resalta con fondo azul
3. Loguearse con usuario TALLER e intentar `/contenido` → debe ver `/unauthorized`
4. Loguearse con usuario ADMIN e intentar `/contenido` → debe poder acceder
5. Verificar que el header dice "Panel de Contenidos" y usa `LogoutButton` compartido
