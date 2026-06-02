# SPEC V4 — X-06: HeaderPublic + Landing rediseñado (v2 — corregido post-discovery)

> **Versión corregida** tras pre-flight checks (sección 0). Las 9 correcciones identificadas están aplicadas.
> **Estrategia arquitectural: Opción B** — HeaderPublic se importa inline en page.tsx y en cada stub. No se modifica middleware ni layout (public).
>
> Cambios respecto a v1:
> - Eliminada lógica condicional en layout (public)
> - Eliminada modificación del middleware
> - Corregidos nombres de campos Prisma (`publicado`, no `publicada`)
> - Eliminada referencia a `visibilidadPublica` (no existe en Coleccion)
> - Agregar tokens CSS faltantes (`pattern-grid`, `card-lift`)
> - Estrategia clara para imágenes de novedades (placeholder)
> - Compresión obligatoria de hero-taller.png
> - Agregar 7 rutas a publicRoutes del middleware
> - Tabla de selectores críticos completada

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **ID** | X-06 |
| **Versión** | v4 |
| **Slug** | header-public-landing |
| **Estimación** | 3.5h (reducida de 5h gracias a pre-flight) |
| **Riesgo** | Bajo (todos los problemas identificados se corrigen pre-implementación) |
| **Dependencias** | X-01, X-02, X-04, X-05 — TODOS MERGEADOS |
| **Branch** | `feature/v4-x-06-header-public-landing` |
| **PR target** | `develop` |

---

## 2. Contexto y motivación

[Mantener igual que v1 — no cambia]

---

## 3. Validación interdisciplinaria

[Mantener igual que v1 — no cambia]

---

## 4. Qué construir

### Outputs del spec (corregidos)

1. **Crear `src/compartido/componentes/layout/header-public.tsx`** (NUEVO)
2. **Reemplazar `src/app/page.tsx`** completamente:
   - Importar HeaderPublic + Footer inline
   - Mantener redirect de autenticados
3. **Actualizar 8 páginas stub** (creadas en X-05) para que importen HeaderPublic + Footer
4. **Crear `src/compartido/componentes/ui/carrusel-novedades.tsx`** (NUEVO)
5. **Comprimir y copiar imagen** `public/images/landing/hero-taller.png` (target: <500KB)
6. **Crear imagen placeholder** `public/images/landing/placeholder-novedad.jpg` (para novedades sin imagen propia)
7. **Extender `institutional.ts`** con textos del landing
8. **Modificar `src/middleware.ts`**: agregar 7 rutas a `publicRoutes`
9. **Agregar a `globals.css`**: utilities `pattern-grid` y `card-lift`

### NO incluye (sin cambios)

- Modificar layout (public)
- Modificar lógica de redirect del middleware (solo agregar rutas)
- Modificar HeaderApp ni Footer ya existentes

---

## 5. Datos (corregidos)

### Queries Prisma corregidas

```ts
// Stats del hero (sin cambios)
const talleresCount = await prisma.taller.count({ where: { verificadoAfip: true } })
const marcasCount = await prisma.marca.count()

// Sección impacto (4 stats)
const talleresActivos = await prisma.taller.count({ where: { verificadoAfip: true } })
const marcasRegistradas = await prisma.marca.count()
const cursosPublicados = await prisma.coleccion.count({ where: { activa: true } })  // ← CORRECCIÓN C2: sin visibilidadPublica
const pedidosEnProceso = await prisma.pedido.count({ 
  where: { estado: { in: ['EN_PROCESO', 'PUBLICADO'] } } 
})

// Carrusel mixto: 4 items mezclando novedades + colecciones
const novedades = await prisma.novedad.findMany({
  where: { publicado: true },  // ← CORRECCIÓN C1: campo correcto
  orderBy: { createdAt: 'desc' },
  take: 2,
})

const colecciones = await prisma.coleccion.findMany({
  where: { activa: true },  // ← CORRECCIÓN C2: sin visibilidadPublica
  orderBy: { createdAt: 'desc' },
  take: 2,
})
```

### Textos hardcoded en institutional.ts

[Mantener igual que v1 — `LANDING_COPY`, `HEADER_PUBLIC_NAV`, `HEADER_PUBLIC_CTAS`]

---

## 6. Prescripciones técnicas (corregidas)

### 6.1 — Extender `institutional.ts`

Sin cambios respecto a v1.

### 6.2 — `header-public.tsx` (NUEVO)

Componente exactamente igual que v1. Es un componente "tonto" que se importa donde haga falta.

### 6.3 — Layout (public) — NO TOCAR ⚡ CAMBIO IMPORTANTE

**Opción B aplicada:** El layout (public) **NO se modifica**. Sigue como está hoy.

HeaderPublic se monta directamente en:
- `src/app/page.tsx` (landing)
- Las 8 páginas stub creadas en X-05

### 6.4 — Modificar `src/middleware.ts` (CORRECCIÓN C3)

Agregar las 7 rutas marketing a `publicRoutes`:

```ts
// src/middleware.ts (modificación mínima)

const publicRoutes = [
  '/',
  '/login',
  '/registro',
  '/directorio',
  '/verificar',
  '/denunciar',
  // ↓ NUEVAS rutas (X-06 + stubs de X-05)
  '/taller-info',
  '/marca-info',
  '/impacto',
  '/recursos',
  '/academia-publica',
  '/novedades',
  '/contacto',
  '/accesibilidad',
  '/ayuda',
  '/terminos',
  '/privacidad',
]
```

**NO modificar más nada del middleware.** No agregar `x-pathname` ni nada. Solo extender la lista de `publicRoutes`.

### 6.5 — Agregar utilities CSS a `globals.css` (CORRECCIONES C5 y C6)

Agregar al final del archivo:

```css
/* Pattern grid (fondo de puntos sutil para hero) */
@utility pattern-grid {
  background-image: radial-gradient(circle, rgba(30, 45, 190, 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Card lift (efecto hover translate) */
@utility card-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

@utility card-lift:hover {
  transform: translateY(-2px);
}
```

**Verificar primero** que la sintaxis `@utility` está soportada en la versión de Tailwind del proyecto (Tailwind v4 sí la soporta).

### 6.6 — Reemplazar `src/app/page.tsx` (Opción B)

**Estructura clave:**

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { HeaderPublic } from '@/compartido/componentes/layout/header-public'
import { Footer } from '@/compartido/componentes/layout/footer'
import { CarruselNovedades } from '@/compartido/componentes/ui/carrusel-novedades'
import { LANDING_COPY } from '@/compartido/lib/content/institutional'
// ... otros imports

export default async function LandingPage() {
  // 1. Mantener redirect de autenticados (lógica actual)
  const session = await auth()
  if (session?.user) {
    const role = session.user.role
    if (role === 'TALLER') redirect('/taller')
    if (role === 'MARCA') redirect('/marca')
    if (role === 'ESTADO') redirect('/estado')
    if (role === 'ADMIN') redirect('/admin')
    if (role === 'CONTENIDO') redirect('/contenido')
  }
  
  // 2. Queries para stats reales
  const [talleresCount, marcasCount, talleresActivos, marcasRegistradas, 
         cursosPublicados, pedidosEnProceso, novedades, colecciones] = await Promise.all([
    prisma.taller.count({ where: { verificadoAfip: true } }),
    prisma.marca.count(),
    prisma.taller.count({ where: { verificadoAfip: true } }),
    prisma.marca.count(),
    prisma.coleccion.count({ where: { activa: true } }),
    prisma.pedido.count({ where: { estado: { in: ['EN_PROCESO', 'PUBLICADO'] } } }),
    prisma.novedad.findMany({ 
      where: { publicado: true }, 
      orderBy: { createdAt: 'desc' }, 
      take: 2 
    }),
    prisma.coleccion.findMany({ 
      where: { activa: true }, 
      orderBy: { createdAt: 'desc' }, 
      take: 2 
    }),
  ])
  
  // 3. Combinar novedades + colecciones para el carrusel
  const carruselItems = [
    ...novedades.map(n => ({
      id: n.id,
      tipo: 'NOVEDAD' as const,
      titulo: n.titulo,
      subtitulo: n.fechaPublicacion ? new Date(n.fechaPublicacion).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : undefined,
      imagen: n.imagen || '/images/landing/placeholder-novedad.jpg',  // ← fallback
      href: n.url || '#',
    })),
    ...colecciones.map(c => ({
      id: c.id,
      tipo: 'CURSO' as const,
      titulo: c.titulo,
      subtitulo: c.duracionTotal ? `${c.cantidadVideos} videos · ${c.duracionTotal}` : undefined,
      imagen: c.imagen || '/images/landing/placeholder-novedad.jpg',  // ← fallback
      href: `/academia-publica/${c.slug}`,
    })),
  ]
  
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderPublic />  {/* ← OPCIÓN B: inline */}
      
      <main className="flex-grow">
        {/* Sección 1: Hero asimétrico */}
        <section className="relative pattern-grid">
          {/* ... contenido del hero según mockup-v6 */}
        </section>
        
        {/* Sección 2: Para cada actor */}
        <section className="py-16 bg-white">
          {/* ... 2 cards (Talleres + Marcas) */}
        </section>
        
        {/* Sección 3: Impacto (fondo oscuro) */}
        <section className="py-16 bg-ink-primary text-white">
          {/* ... 4 stats grid 2x2 */}
        </section>
        
        {/* Sección 4: Carrusel novedades + cursos */}
        <section className="py-16 bg-gray-50">
          <CarruselNovedades items={carruselItems} />
        </section>
        
        {/* Sección 5: Banner CTA azul */}
        <section className="py-16 bg-brand-blue text-white pattern-weave">
          {/* ... banner final */}
        </section>
      </main>
      
      <Footer />  {/* ← OPCIÓN B: inline */}
    </div>
  )
}
```

### 6.7 — Actualizar las 8 páginas stub de X-05

Cada stub debe importar HeaderPublic + Footer:

```tsx
// Ejemplo: src/app/(public)/taller-info/page.tsx

import { HeaderPublic } from '@/compartido/componentes/layout/header-public'
import { Footer } from '@/compartido/componentes/layout/footer'
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { Construction } from 'lucide-react'

export default function PaginaEnConstruccion() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderPublic />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <EmptyState
            icon={<Construction className="w-12 h-12 text-gray-400" />}
            titulo="Página en construcción"
            mensaje="Esta sección estará disponible próximamente."
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

Repetir para los 8 stubs:
- `/taller-info`
- `/marca-info`
- `/impacto`
- `/recursos`
- `/academia-publica`
- `/novedades`
- `/contacto`
- `/accesibilidad`

### 6.8 — Imágenes (CORRECCIONES C7 y C8)

**Hero image (CORRECCIÓN C7):**

```bash
# Crear directorio
mkdir -p public/images/landing

# Comprimir antes de copiar (la imagen original pesa 1.9MB)
# Opción 1: usar sharp
npx sharp "docs/Diseño/.../hero-taller.png" -o public/images/landing/hero-taller.jpg --jpeg quality=80

# Opción 2: si no hay sharp, comprimir manual con squoosh.app
# Target: < 500KB en formato JPEG calidad 80
```

Verificar: `ls -lh public/images/landing/hero-taller.jpg` → debe ser < 500KB.

**Placeholder de novedades (CORRECCIÓN C8):**

Crear o copiar una imagen genérica para novedades sin imagen propia:

```bash
# Opción 1: imagen genérica del tipo "estamos preparando contenido"
# Color sólido con logo PDT centrado, exportada como JPG
# Tamaño: 800x600px, < 100KB
# Path: public/images/landing/placeholder-novedad.jpg

# Opción 2: SI prisma seed tiene paths a /seed/novedades/*.jpg,
# crear ese directorio con placeholders en cada path para no romper seed
mkdir -p public/seed/novedades
# Copiar el mismo placeholder a cada path referenciado por el seed
```

**Decisión:** Claude Code verifica qué imágenes referencia el seed y crea los archivos correspondientes.

---

## 7. Casos borde

[Mantener igual que v1 — los 10 casos siguen aplicando]

Caso nuevo:
- **#11:** Stub abierto sin login → ve HeaderPublic + Footer + "En construcción" (caso normal).
- **#12:** Stub abierto con usuario logueado → middleware lo deja pasar (es publicRoute). Ve HeaderPublic + Footer + "En construcción". Esto es OK porque la página es genuinamente pública.

---

## 8. Criterios de aceptación

[Mantener igual que v1, agregando:]

### Checklist técnico (extendido)

- [ ] `header-public.tsx` creado
- [ ] `page.tsx` reemplazado (con HeaderPublic + Footer inline)
- [ ] 8 stubs actualizados (cada uno con HeaderPublic + Footer)
- [ ] `carrusel-novedades.tsx` creado
- [ ] `middleware.ts` actualizado con 7 publicRoutes nuevas
- [ ] `globals.css` actualizado con `pattern-grid` y `card-lift`
- [ ] `institutional.ts` extendido
- [ ] Imagen hero comprimida y copiada
- [ ] Placeholder de novedades creado
- [ ] **NO** modificar layout (public) (verificar diff)
- [ ] **NO** modificar middleware más allá de publicRoutes (verificar diff)
- [ ] Build TypeScript pasa sin errores
- [ ] Tests E2E pasan
- [ ] CI verde

---

## 9. Tests manuales

[Mantener igual que v1]

---

## 10. Riesgos (actualizados)

| # | Riesgo original | Estado |
|---|----|-------|
| 1 | `headers().get('x-pathname')` no funciona | ELIMINADO con Opción B |
| 2 | Tests E2E rompen | Mantenido (impacto bajo según discovery) |
| 3 | Imagen pesa mucho (LCP) | RESUELTO con C7 (compresión obligatoria) |
| 4 | DB sin novedades en demo | Resuelto: seed tiene 5 |
| 5 | Redirect rompe | Mantenido |
| 6 | pattern-grid no existe | RESUELTO con C5 (definirlo) |
| 7 | Layout (public) tiene lógica inesperada | ELIMINADO con Opción B |
| 8 | Cards flotantes z-index | Mantenido |

### Riesgos nuevos identificados en pre-flight

| # | Riesgo | Mitigación |
|---|--------|------------|
| 9 | Stubs de X-05 quedan inaccesibles para anónimos | Agregar a publicRoutes (C3) |
| 10 | Seed referencia imágenes en `/seed/novedades/` que no existen | Crear placeholder o reemplazar paths (C8) |
| 11 | Tailwind v4 syntax `@utility` puede no soportar todo | Verificar antes de aplicar C5/C6 |

---

## 11. Plan de implementación (actualizado)

### Orden recomendado

1. **Setup + tokens CSS faltantes (15 min)**
   - Crear branch
   - Agregar `pattern-grid` y `card-lift` a globals.css
   - Verificar build

2. **Extensión institutional.ts (10 min)**
   - Agregar LANDING_COPY, HEADER_PUBLIC_NAV, HEADER_PUBLIC_CTAS

3. **HeaderPublic component (20 min)**
   - Crear header-public.tsx
   - Verificar visual con `npm run dev`

4. **Middleware (5 min)**
   - Agregar 7 publicRoutes nuevas
   - Verificar que las rutas siguen funcionando

5. **Imágenes (10 min)**
   - Comprimir hero-taller.png a JPEG
   - Crear placeholder de novedades
   - Crear /seed/novedades/ si el seed lo necesita

6. **Stubs (15 min)**
   - Actualizar 8 stubs con HeaderPublic + Footer
   - Verificar cada uno carga

7. **Carrusel de novedades (40 min)**
   - Crear carrusel-novedades.tsx con flechas prev/next
   - Probar con 4 items mock

8. **Landing nuevo (1h 30min)**
   - Reemplazar page.tsx
   - Implementar 5 secciones
   - Mantener redirect

9. **Tests E2E + ajustes (20 min)**
   - Correr suite
   - Ajustar si es necesario
   - Confirmar CI verde

10. **Commit + PR (15 min)**

**Total estimado: 3h 40min** (vs 5h en v1)

---

## 12. Definición de "Done"

[Mantener igual que v1]

---

## 13. Selectores críticos (NO MODIFICAR)

Completados en pre-flight:

| Selector | Test / Sistema | Acción si necesito cambiarlo |
|---|---|---|
| `form:has(button:has-text("Ingresar"))` | auth-roles.spec.ts:37, _helpers/auth.ts:73 | N/A (no tocamos /login) |
| `page.locator('h1').first().toContainText('Plataforma Digital Textil')` | onboarding.spec.ts:44 | Verificar que H1 sigue en /ayuda/onboarding-taller |
| `header.getByText('Mis pedidos')`, `header.getByText('Mi perfil')` | smoke.spec.ts:31-32 | N/A (es HeaderApp, no HeaderPublic) |
| `button[aria-label="Abrir menú"]` | smoke.spec.ts:33, roles-estado.spec.ts:42 | N/A (HeaderApp, no HeaderPublic) |
| `aside[aria-label="Menú de navegación personal"]` | roles-estado.spec.ts:49 | N/A (sidebar, no se toca) |
| `publicRoutes` array en middleware | Toda suite E2E | Agregar las 7 rutas marketing |
| `page.waitForURL(/\/taller/)` | smoke.spec.ts, _helpers/auth.ts | Mantener redirect del middleware |

---

**Fin del SPEC X-06 v2 (post-discovery)**

> Cambios respecto a v1 documentados en sección "9 correcciones" arriba.
> Pre-flight checks ya ejecutados. Listo para implementación directa.
