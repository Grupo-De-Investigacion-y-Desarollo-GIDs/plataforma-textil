# SPEC V4 — X-05: Header app + Footer institucional

> **Spec generado siguiendo `TEMPLATE_SPEC_V4.md`** (metodología V4 con 7 secciones obligatorias).
> Quinta implementación del Bloque X (identidad visual V4).
> Toca: `src/compartido/componentes/layout/header.tsx` (refactor) + crear `footer.tsx` + 8 stubs para páginas inexistentes + cambios en layouts.

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **ID** | X-05 |
| **Versión** | v4 |
| **Slug** | header-app-footer |
| **Título completo** | Header app simplificado (2 bandas) + Footer institucional |
| **Bloque** | X — Identidad visual V4 |
| **Categoría** | MVP no negociable |
| **Estimación** | 3h |
| **Riesgo** | Bajo |
| **Dependencias** | X-01 (tokens), X-02 (componentes UI), X-03 (componentes nuevos), X-04 (modelo Novedad) — **TODOS MERGEADOS** |
| **Bloquea a** | X-06 (header público + landing rediseñada), X-07 (aplicar a dashboards) |
| **Branch** | `feature/v4-x-05-header-footer` |
| **PR target** | `develop` |

---

## 2. Contexto y motivación

### Situación actual

El header actual de la app autenticada (`src/compartido/componentes/layout/header.tsx`) tiene **3 bandas y 178 líneas**:

1. **Topbar oscura:** menú, idioma, V2.0, bell, user
2. **Banda brand-blue:** logo grande 56px, "ROL: nombre"
3. **Tabnav:** tabs + search

Adicionalmente:
- Hay un `AmbienteBanner` full-width amarillo en root layout (invasivo)
- Admin tiene **header propio inline** Y sidebar (redundancia)
- El footer **no existe como componente compartido** — solo hay un footer inline en el landing público

Esto resulta en:
- **Identidad visual fragmentada:** cada rol ve un header distinto, el footer aparece/desaparece
- **Sobrecarga visual:** 3 bandas + banner = ~180px de UI antes del contenido
- **Inconsistencia institucional:** la leyenda "Desarrollado por UNTREF con el apoyo de la OIT" solo aparece en el landing
- **Falta de unidad:** admin separado del resto

### Decisión 3.14 del Master V4

> "Header simplificado (4 → 2 bandas), Footer institucional (no existe hoy)"

### Decisión 3.19 del Master V4

> Leyenda institucional confirmada por OIT: **"Desarrollado por UNTREF con el apoyo de la OIT"**
> Aplicada en footer global, certificados, PDFs, landing.

### Por qué este spec

- Aplica la **identidad institucional** a todas las pantallas autenticadas (no solo al landing)
- **Simplifica el header** de 3 bandas a 2 (más respiración, menos ruido)
- **Centraliza el footer** como componente compartido reutilizable
- Implementa la pill **"Ambiente piloto"** reemplazando el banner invasivo
- Es **bloqueante de X-07** (aplicar paleta a dashboards): primero la estructura, después el contenido

---

## 3. Validación interdisciplinaria

### Perspectivas que aplican

| Perspectiva | ¿Aplica? | Decisión tomada |
|---|---|---|
| **Politólogo** | SÍ | El subtítulo "OIT · UNTREF" en header y el sello "Con el respaldo de OIT · UNTREF" en footer comunican respaldo institucional en cada pantalla, no solo en el landing. Refuerza legitimidad ante el usuario. |
| **Sociólogo** | SÍ | La leyenda confirmada por OIT ("Desarrollado por UNTREF con el apoyo de la OIT") es la forma acordada con los actores institucionales. No usar logos visibles (decisión 3.19) respeta la autorización formal pendiente DCOMM. |
| **Economista** | N/A | No aplica |
| **Contador** | N/A | No aplica |
| **Sectorial** | SÍ | Sergio (diseñador del equipo) definió la estructura completa en `docs/Diseño/propuesta-visual-pdt-v4/propuesta-visual-pdt-v4/04-header-y-layout.md` y mockup-v6.html. Validado al adoptarse decisión 3.14. |

### Decisiones de diseño que se respetan

1. **2 bandas en HeaderApp** (vs 3 actuales) — más respiración
2. **Pill "Ambiente piloto"** en topbar (vs banner full-width) — menos invasivo
3. **Avatar con iniciales** en topbar — mejor que solo nombre
4. **Subtítulo "OIT · UNTREF"** debajo del nombre — institucional sin invadir
5. **Footer con 4 columnas** — branding + Plataforma + Recursos + Legal
6. **Sello "Con el respaldo de OIT · UNTREF"** en footer border-t
7. **Año dinámico** en copyright (`new Date().getFullYear()`)
8. **No mostrar footer en admin** (admin tiene sidebar propio + uso muy distinto)
9. **Admin sin tabs en HeaderApp** (usa sidebar exclusivamente)

---

## 4. Qué construir

### Outputs del spec

1. **Refactor de `src/compartido/componentes/layout/header.tsx`** → HeaderApp simplificado (2 bandas)
2. **Crear `src/compartido/componentes/layout/footer.tsx`** → Footer institucional 4 columnas
3. **8 páginas stub** para los links del footer que no existen
4. **Eliminar `AmbienteBanner`** del root layout (la pill lo reemplaza)
5. **Actualizar layouts** que montan footer: `(public)`, `(auth)`, `(taller)`, `(marca)`, `(estado)`
6. **NO tocar `(admin)`** (mantiene su sidebar propio sin footer)

### NO incluye

- **HeaderPublic** (es X-06 — landing rediseñada)
- **Cambios en componentes UI base** (eso fue X-02/X-03)
- **Rediseño del landing** (es X-06)
- **CMS para los textos del footer** (esto va a `X-04b` post-spec — los textos quedan en constantes preparadas para migración futura)

---

## 5. Datos

### Sin cambios de schema

Este spec no toca Prisma. Solo UI.

### Textos hardcodeados (preparados para CMS futuro)

Crear un archivo nuevo `src/compartido/lib/content/institutional.ts` que centralice:

```ts
export const INSTITUTIONAL = {
  brandName: 'Plataforma Digital Textil',
  brandSubtitle: 'OIT · UNTREF',
  brandDescription: 'Una iniciativa de OIT Argentina y la Universidad Nacional de Tres de Febrero.',
  developedBy: 'Desarrollado por UNTREF con el apoyo de la OIT',
  copyrightHolder: 'Plataforma Digital Textil',
  endorsement: 'Con el respaldo de OIT · UNTREF',
} as const

export const FOOTER_LINKS = {
  plataforma: [
    { label: '¿Cómo funciona?', href: '/#como-funciona' },
    { label: 'Para taller', href: '/taller-info' },
    { label: 'Para marcas', href: '/marca-info' },
    { label: 'Impacto', href: '/impacto' },
  ],
  recursos: [
    { label: 'Centro de ayuda', href: '/ayuda' },
    { label: 'Academia', href: '/academia-publica' },
    { label: 'Novedades', href: '/novedades' },
    { label: 'Contacto', href: '/contacto' },
  ],
  legal: [
    { label: 'Términos y condiciones', href: '/terminos' },
    { label: 'Política de privacidad', href: '/privacidad' },
    { label: 'Accesibilidad', href: '/accesibilidad' },
  ],
} as const

export const TABS_BY_ROLE = {
  TALLER: [
    { label: 'Tablero', href: '/taller' },
    { label: 'Mis pedidos', href: '/taller/pedidos' },
    { label: 'Mi formalización', href: '/taller/formalizacion' },
    { label: 'Mi perfil', href: '/taller/perfil' },
    { label: 'Academia', href: '/taller/aprender' },
  ],
  MARCA: [
    { label: 'Tablero', href: '/marca' },
    { label: 'Directorio', href: '/marca/directorio' },
    { label: 'Mis pedidos', href: '/marca/pedidos' },
    { label: 'Mi perfil', href: '/marca/perfil' },
  ],
  ESTADO: [
    { label: 'Dashboard', href: '/estado' },
    { label: 'Demanda insatisfecha', href: '/estado/demanda-insatisfecha' },
    { label: 'Datos sectoriales', href: '/estado/sector' },
    { label: 'Exportar', href: '/estado/exportar' },
  ],
  CONTENIDO: [
    { label: 'Colecciones', href: '/contenido/colecciones' },
    { label: 'Evaluaciones', href: '/contenido/evaluaciones' },
    { label: 'Notificaciones', href: '/contenido/notificaciones' },
  ],
} as const
```

**Cuando se implemente el CMS futuro**, solo cambia la fuente de estos datos (DB en vez de constantes). La estructura queda idéntica.

---

## 6. Prescripciones técnicas

### 6.1 — `src/compartido/lib/content/institutional.ts` (NUEVO)

Crear el archivo con el contenido del punto 5 arriba. Centraliza textos institucionales para fácil migración a CMS.

### 6.2 — `src/compartido/componentes/layout/header.tsx` (REEMPLAZAR completamente)

Header simplificado de **2 bandas** según mockup-v6.html y `04-header-y-layout.md` §2.

**Estructura:**

```tsx
'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { LogoPDT } from '@/compartido/componentes/ui/logo-pdt'
import { NotificacionesBell } from './notificaciones-bell'
import { UserSidebar } from './user-sidebar'
import { Menu } from 'lucide-react'
import { INSTITUTIONAL, TABS_BY_ROLE } from '@/compartido/lib/content/institutional'

interface HeaderProps {
  userRole?: 'TALLER' | 'MARCA' | 'ESTADO' | 'CONTENIDO'
}

export function Header({ userRole }: HeaderProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  // Iniciales del usuario para avatar
  const userName = session?.user?.name ?? 'Usuario'
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  
  // Tabs según rol
  const tabs = userRole ? TABS_BY_ROLE[userRole] ?? [] : []
  
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      {/* Banda 1: topbar */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Izquierda: menú + logo + nombre */}
            <div className="flex items-center gap-3">
              <UserSidebar />
              <Link href={userRole ? `/${userRole.toLowerCase()}` : '/'} className="flex items-center gap-2">
                <LogoPDT variant="icon" size="sm" />
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="font-serif font-bold text-sm text-ink-primary">
                    {INSTITUTIONAL.brandName}
                  </span>
                  <span className="font-overpass font-bold text-[9px] text-terra-600 uppercase tracking-wider">
                    {INSTITUTIONAL.brandSubtitle}
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Derecha: pill ambiente + bell + avatar */}
            <div className="flex items-center gap-3">
              {/* Pill "Ambiente piloto" — reemplaza al AmbienteBanner */}
              <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-overpass font-medium bg-pastel-yellow text-amber-900">
                Ambiente piloto
              </span>
              
              <NotificacionesBell />
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-overpass font-bold text-xs">
                  {initials}
                </div>
                <span className="hidden lg:inline text-sm text-gray-700 font-overpass">
                  {userName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Banda 2: tabs (oculta para admin y si no hay tabs) */}
      {tabs.length > 0 && (
        <nav className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex gap-1 overflow-x-auto">
              {tabs.map(tab => {
                const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
                return (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      className={`
                        inline-flex items-center px-4 py-3 text-sm font-overpass font-medium whitespace-nowrap
                        border-b-2 transition-colors
                        ${isActive 
                          ? 'border-brand-blue text-brand-blue' 
                          : 'border-transparent text-gray-600 hover:text-ink-primary hover:border-gray-300'
                        }
                      `}
                    >
                      {tab.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
      )}
    </header>
  )
}
```

**Cambios respecto al header actual:**
- ❌ Eliminar banda topbar oscura
- ❌ Eliminar banda brand-blue con logo grande 56px
- ❌ Eliminar tabs admin (admin usa sidebar)
- ❌ Eliminar search inline (no estaba en uso real)
- ✅ Agregar pill "Ambiente piloto"
- ✅ Agregar avatar con iniciales
- ✅ Agregar subtítulo "OIT · UNTREF" en font-overpass

### 6.3 — `src/compartido/componentes/layout/footer.tsx` (NUEVO)

```tsx
import Link from 'next/link'
import { LogoPDT } from '@/compartido/componentes/ui/logo-pdt'
import { INSTITUTIONAL, FOOTER_LINKS } from '@/compartido/lib/content/institutional'

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-ink-primary text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1 — Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                <LogoPDT variant="icon" size="md" />
              </div>
              <div>
                <div className="font-serif font-bold text-white text-base">
                  {INSTITUTIONAL.brandName}
                </div>
                <div className="font-overpass text-[10px] text-terra-300 uppercase tracking-wider">
                  {INSTITUTIONAL.brandSubtitle}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              {INSTITUTIONAL.brandDescription}
            </p>
          </div>
          
          {/* Col 2 — Plataforma */}
          <div>
            <h3 className="font-overpass font-bold text-white text-sm mb-4">
              Plataforma
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.plataforma.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Col 3 — Recursos */}
          <div>
            <h3 className="font-overpass font-bold text-white text-sm mb-4">
              Recursos
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.recursos.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Col 4 — Legal */}
          <div>
            <h3 className="font-overpass font-bold text-white text-sm mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.legal.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
        </div>
        
        {/* Separator + bottom row */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-xs text-gray-400 font-overpass">
            © {currentYear} {INSTITUTIONAL.copyrightHolder}. Todos los derechos reservados.
          </p>
          <p className="text-xs font-overpass font-bold text-gray-300">
            {INSTITUTIONAL.endorsement}
          </p>
        </div>
      </div>
    </footer>
  )
}
```

### 6.4 — Eliminar `AmbienteBanner` del root layout

En `src/app/layout.tsx`:

- Buscar `<AmbienteBanner />` y eliminarlo
- Eliminar el import correspondiente
- Verificar que no rompe nada

La pill "Ambiente piloto" en el HeaderApp lo reemplaza.

### 6.5 — Layouts que deben montar el Footer

Modificar los siguientes layouts para incluir `<Footer />` antes de cerrar el body:

- `src/app/(public)/layout.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(taller)/layout.tsx`
- `src/app/(marca)/layout.tsx`
- `src/app/(estado)/layout.tsx`

Patrón:

```tsx
<div className="min-h-screen flex flex-col">
  <Header userRole="TALLER" />
  <main className="flex-grow">{children}</main>
  <Footer />
</div>
```

**NO modificar:** `src/app/(admin)/layout.tsx` ni `src/app/(contenido)/layout.tsx` (este último puede llevar footer si lo decidimos, pero por ahora seguir el patrón del master: admin no, el resto sí).

> Actualización: incluir `(contenido)/layout.tsx` también con Footer (es role-equivalente a CONTENIDO operativo). Solo admin queda sin footer.

### 6.6 — 8 páginas stub para links que no existen

Crear `src/app/(public)/[ruta]/page.tsx` para cada uno:

- `src/app/(public)/taller-info/page.tsx`
- `src/app/(public)/marca-info/page.tsx`
- `src/app/(public)/impacto/page.tsx`
- `src/app/(public)/recursos/page.tsx`
- `src/app/(public)/academia-publica/page.tsx`
- `src/app/(public)/novedades/page.tsx`
- `src/app/(public)/contacto/page.tsx`
- `src/app/(public)/accesibilidad/page.tsx`

Cada uno usa el componente común `EmptyState` con un mensaje claro:

```tsx
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { Construction } from 'lucide-react'

export default function PaginaEnConstruccion() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <EmptyState
        icon={<Construction className="w-12 h-12 text-gray-400" />}
        title="Página en construcción"
        description="Esta sección estará disponible próximamente. Gracias por tu paciencia."
      />
    </div>
  )
}
```

**Importante:** estos stubs son temporales. Cuando se cree el contenido real, se reemplazan.

### 6.7 — Verificar que LogoPDT existe y funciona

```bash
ls src/compartido/componentes/ui/logo-pdt.tsx
```

Si existe (debería, viene de X-02/X-03): OK.
Si no existe: error, X-02 no se mergeó correctamente.

### 6.8 — Verificar que Source Serif 4 funciona

El header usa `font-serif` (Source Serif 4 desde X-01). Verificar visualmente que el nombre "Plataforma Digital Textil" aparece en serif y no en sans.

---

## 7. Casos borde

| # | Caso | Comportamiento esperado |
|---|------|-------------------------|
| 1 | Usuario sin nombre (null) en sesión | Avatar muestra "??" |
| 2 | Usuario sin rol | Header renderiza sin banda de tabs (solo topbar) |
| 3 | Pantalla mobile (sm) | Pill "Ambiente piloto" oculta. Avatar sin nombre al lado. Tabs scrollean horizontal. |
| 4 | Pantalla muy pequeña (< 380px) | Nombre de plataforma se oculta. Solo logo + iniciales del usuario. |
| 5 | Admin entra a su layout | Ve su sidebar propio. NO ve header compartido (admin tiene su layout independiente). |
| 6 | Footer en admin | NO se monta footer en admin. |
| 7 | Link del footer apunta a página stub | Renderiza "Página en construcción" con EmptyState. |
| 8 | Año cambia (ej: enero 2027) | Copyright muestra "© 2027 ..." automáticamente. |
| 9 | Token tiene un rol no esperado (ej: nuevo rol futuro) | tabs.length = 0 → solo topbar, sin banda de tabs (graceful). |
| 10 | Avatar de usuario con caracteres especiales (acentos) | Iniciales correctas: "Lucía Fernández" → "LF". |

---

## 8. Criterios de aceptación

### Checklist técnico

- [ ] `src/compartido/lib/content/institutional.ts` creado con INSTITUTIONAL, FOOTER_LINKS, TABS_BY_ROLE
- [ ] `header.tsx` refactorizado a 2 bandas con pill "Ambiente piloto"
- [ ] `footer.tsx` creado con 4 columnas y sello institucional
- [ ] `AmbienteBanner` eliminado del root layout
- [ ] 8 páginas stub creadas
- [ ] 6 layouts modificados para incluir Footer (public, auth, taller, marca, estado, contenido)
- [ ] Layout admin NO modificado
- [ ] Build TypeScript pasa sin errores
- [ ] E2E tests pasan (las tabs y links existentes siguen funcionando)
- [ ] CI verde

### Checklist visual (verificación manual en preview)

- [ ] Login como TALLER → ver header con 5 tabs (Tablero, Mis pedidos, Mi formalización, Mi perfil, Academia)
- [ ] Login como MARCA → ver header con 4 tabs (Tablero, Directorio, Mis pedidos, Mi perfil)
- [ ] Login como ESTADO → ver header con 4 tabs (Dashboard, Demanda insatisfecha, Datos sectoriales, Exportar)
- [ ] Login como CONTENIDO → ver header con 3 tabs (Colecciones, Evaluaciones, Notificaciones)
- [ ] Login como ADMIN → ver sidebar propio, SIN tabs en header, SIN footer
- [ ] Pill "Ambiente piloto" visible en desktop, oculta en mobile
- [ ] Avatar con iniciales correctas para cada usuario
- [ ] Subtítulo "OIT · UNTREF" en terra-600 visible en header
- [ ] Footer aparece en /, /login, /taller, /marca, /estado, /contenido
- [ ] Footer NO aparece en /admin/*
- [ ] Links del footer funcionan (incluso si van a stubs)
- [ ] Página stub muestra "Página en construcción" con icono
- [ ] Año del copyright = año actual
- [ ] Sello "Con el respaldo de OIT · UNTREF" visible en footer

### Checklist responsive

- [ ] Desktop (≥ 1024px): todo visible
- [ ] Tablet (768-1023px): pill oculta, nombre usuario oculto
- [ ] Mobile (< 768px): nombre plataforma oculto, tabs scrollean horizontal

---

## 9. Tests manuales

### Test 1 — Login como cada rol

1. Login como Lucía Fernández (ADMIN) → ver sidebar, sin tabs, sin footer
2. Login como Roberto Giménez (TALLER) → ver 5 tabs, footer abajo
3. Login como Valentina Ramos (MARCA) → ver 4 tabs, footer
4. Login como Anabelén Torres (ESTADO) → ver 4 tabs, footer
5. Login como Sofía Martínez (CONTENIDO) → ver 3 tabs, footer

### Test 2 — Navegación por tabs

Como TALLER:
1. Click en cada tab → la página correspondiente carga
2. La tab activa se ve con border-b-2 brand-blue

### Test 3 — Footer responsive

1. Abrir landing en desktop → ver 4 columnas
2. Reducir a tablet → ver 2 columnas
3. Reducir a mobile → ver 1 columna apilada
4. Click en cada link del footer → cargar página (real o stub)

### Test 4 — Pill ambiente

1. Desktop → ver "Ambiente piloto" amarillo en topbar
2. Mobile → no se ve
3. Producción (cuando se haga deploy a main) → la pill no debería aparecer (TODO: condicional según ambiente)

> **Nota TODO:** La pill se muestra siempre en este spec. En un spec futuro, condicionar según variable de entorno `NEXT_PUBLIC_AMBIENTE`. Por ahora siempre visible.

### Test 5 — Iniciales del avatar

1. Lucía Fernández → "LF"
2. Roberto Giménez → "RG"
3. Sofía Martínez → "SM"
4. Usuario con un solo nombre (ej: "Admin") → "A"

---

## 10. Riesgos

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|-----|---------|------------|
| 1 | Tests E2E rompen porque buscan selectores del header viejo | Media | Medio | Antes del merge, correr los tests E2E del bloque taller/marca/estado y ajustar selectores. |
| 2 | Footer ocupa demasiado espacio en mobile y reduce área de contenido | Baja | Bajo | El footer es `mt-auto` y con `min-h-screen flex flex-col`, queda al final naturalmente. |
| 3 | Stubs de páginas crean rutas que NextAuth no protege | Baja | Bajo | Son rutas en `(public)` — middleware ya las trata como públicas. |
| 4 | Eliminar AmbienteBanner rompe alguna referencia | Baja | Bajo | Buscar todas las referencias con grep antes de eliminar. |
| 5 | Tab "Datos sectoriales" no existe como ruta `/estado/sector` (verificar) | Media | Bajo | Verificar antes de implementar. Si no existe, crear stub o ajustar el path. |
| 6 | Iniciales fallan con usuarios cuyo nombre tiene apóstrofes o caracteres especiales | Baja | Bajo | Test 5 cubre esto. Si falla, agregar regex de limpieza. |
| 7 | UserSidebar (mobile) tiene referencias al header viejo | Media | Medio | Revisar el código de UserSidebar y ajustar si depende de la estructura previa. |
| 8 | CSS de `font-serif` no aplica si la fuente no se cargó | Baja | Bajo | Verificar en preview que el nombre se ve en serif. |

---

## 11. Plan de implementación

### Orden recomendado

1. **Setup (10 min):**
   - Crear branch `feature/v4-x-05-header-footer` desde `develop` actualizado
   - Crear `institutional.ts` con todos los datos

2. **Footer + stubs (45 min):**
   - Crear `footer.tsx`
   - Crear las 8 páginas stub
   - Verificar visual con `npm run dev`

3. **Refactor Header (60 min):**
   - Reemplazar `header.tsx` con la nueva estructura
   - Eliminar `AmbienteBanner` del root layout
   - Verificar que cada rol ve sus tabs correctos

4. **Layouts (30 min):**
   - Modificar los 6 layouts para incluir Footer
   - Verificar que admin NO tiene footer

5. **Validación (30 min):**
   - Test visual con cada rol
   - Verificar responsive
   - Correr `npm run build` para confirmar TypeScript

6. **Tests E2E + ajustes (30 min):**
   - Correr suite completa
   - Ajustar selectores si rompen
   - Confirmar CI verde

7. **Commit + PR (15 min):**
   - Commits granulares por sección
   - Push y crear PR
   - Esperar CI verde

**Total estimado: 3h 20min** (cercano a las 3h del master)

---

## 12. Definición de "Done"

X-05 se considera terminado cuando:

- [ ] PR mergeado a develop
- [ ] CI verde
- [ ] Verificación visual manual completa en preview (los 5 roles + responsive)
- [ ] El footer aparece en todas las pantallas excepto admin
- [ ] La pill "Ambiente piloto" reemplazó al banner
- [ ] Las 8 páginas stub son accesibles
- [ ] DECISIONS.md actualizado con notas del spec (si aplica)

---

**Fin del SPEC X-05 — Header app + Footer institucional**

> Referencias:
> - Propuesta visual completa: `docs/Diseño/propuesta-visual-pdt-v4/propuesta-visual-pdt-v4/04-header-y-layout.md`
> - Mockup: `docs/Diseño/propuesta-visual-pdt-v4/propuesta-visual-pdt-v4/mockup/mockup-v6.html`
> - Master V4 — Decisión 3.14 (identidad visual) y 3.19 (leyenda institucional)
