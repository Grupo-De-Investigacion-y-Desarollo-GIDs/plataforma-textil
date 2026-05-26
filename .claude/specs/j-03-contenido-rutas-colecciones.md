# SPEC J-03 — Rutas propias de colecciones para rol CONTENIDO

> **Bloque:** J (Rol CONTENIDO completo)
> **Tipo:** Bug fix (#355)
> **Prioridad:** URGENTE (Sofia carga cursos en vivo en la demo)
> **Fecha:** 25-mayo-2026
> **Estado:** En progreso

## Problema

El rol CONTENIDO no puede crear, editar ni cargar videos en colecciones.

**Causa raiz:** Las paginas de gestion (nueva, editar, agregar video) viven bajo
`src/app/(admin)/admin/colecciones/` cuyo layout ejecuta:
```ts
if (session.user.role !== 'ADMIN') redirect('/unauthorized')
```

El middleware tiene una excepcion para CONTENIDO en `/admin/colecciones`, pero el layout
bloquea antes de que la pagina se renderice. Resultado: CONTENIDO ve la lista de colecciones
pero no puede accionar nada.

## Contexto

- **APIs:** ya permiten CONTENIDO (POST/PUT/DELETE en `/api/colecciones` y `/api/colecciones/[id]/videos`)
- **Middleware:** tiene excepcion (linea 83-84) — se elimina como parte de este fix
- **Sidebar contenido:** ya tiene "Colecciones" -> `/contenido/colecciones`
- **Lista contenido:** existe en `/contenido/colecciones/page.tsx` pero sus botones apuntan a `/admin/colecciones/*`

## Que construir

### Estrategia: MOVER + REDIRECT (no copiar)

Se mueven las 3 paginas de gestion de `(admin)/admin/colecciones/` a `(contenido)/contenido/colecciones/`.
En su lugar, se dejan redirects para que links viejos no den 404.

### Paginas a mover

| Origen | Destino | Cambios post-move |
|--------|---------|-------------------|
| `(admin)/admin/colecciones/nueva/page.tsx` | `(contenido)/contenido/colecciones/nueva/page.tsx` | Links -> `/contenido/colecciones/*`, Breadcrumbs: "Contenido > Colecciones > Nueva" |
| `(admin)/admin/colecciones/[id]/page.tsx` | `(contenido)/contenido/colecciones/[id]/page.tsx` | Links -> `/contenido/colecciones/*`, Breadcrumbs: "Contenido > Colecciones > {titulo}" |
| `(admin)/admin/colecciones/[id]/videos/page.tsx` | `(contenido)/contenido/colecciones/[id]/videos/page.tsx` | Links -> `/contenido/colecciones/*`, Breadcrumbs: "Contenido > Colecciones > Videos" |

### Redirects en rutas admin vaciadas

| Ruta admin (ahora vacia) | Redirect a |
|---------------------------|-----------|
| `/admin/colecciones/nueva` | `/contenido/colecciones/nueva` |
| `/admin/colecciones/[id]` | `/contenido/colecciones/[id]` |
| `/admin/colecciones/[id]/videos` | `/contenido/colecciones/[id]/videos` |
| `/admin/colecciones` (lista) | `/contenido/colecciones` |

Cada redirect es un server component minimo:
```tsx
import { redirect } from 'next/navigation'
export default function Page() { redirect('/contenido/colecciones') }
```
(Para rutas dinamicas, pasar params al destino)

### Actualizar pagina existente

- **`(contenido)/contenido/colecciones/page.tsx`** — cambiar 3 links:
  - `href="/admin/colecciones/nueva"` -> `href="/contenido/colecciones/nueva"`
  - `href={/admin/colecciones/${col.id}}` -> `href={/contenido/colecciones/${col.id}}`
  - `href={/admin/colecciones/${col.id}/videos}` -> `href={/contenido/colecciones/${col.id}/videos}`

### Limpieza

- **Middleware:** eliminar la excepcion de CONTENIDO para `/admin/colecciones` (ya no es necesaria)
- **Admin layout sidebar:** actualizar link de "Colecciones" a `/contenido/colecciones` (ADMIN accede a contenido via middleware, que lo permite)
- **Admin dashboard:** actualizar link de "Colecciones" a `/contenido/colecciones`

### NO tocar

- **APIs** — ya permiten CONTENIDO, no hay cambios
- **Schema Prisma** — no se necesitan campos nuevos

## Prescripciones tecnicas

1. Las 3 paginas movidas son `'use client'` (ya lo eran)
2. Usar mismos componentes UI: `Card`, `Button`, `Input`, `Select`, `Badge`, `Breadcrumbs`, `SearchInput`
3. Breadcrumbs: primer item `{ label: 'Contenido', href: '/contenido' }` en vez de `{ label: 'Admin', href: '/admin' }`
4. Todos los links de navegacion internos usan `/contenido/colecciones/...`
5. El boton "Cancelar" en cada form -> `router.push('/contenido/colecciones')` o `router.push('/contenido/colecciones/${id}')`
6. Redirects: server components con `import { redirect } from 'next/navigation'`

## Edge cases

| Caso | Comportamiento |
|------|---------------|
| ADMIN accede a `/admin/colecciones/*` (link viejo) | Redirect automatico a `/contenido/colecciones/*` |
| ADMIN accede a `/contenido/colecciones/*` | Middleware permite (ADMIN tiene acceso a rutas contenido). Funciona. |
| Coleccion creada por ADMIN y editada por CONTENIDO | La API no distingue creador — ambos pueden editar/eliminar (J-04 decidira si restringir) |
| CONTENIDO elimina coleccion publicada | Funciona (la API lo permite). Decision de negocio para J-04. |

## Criterios de aceptacion

- [ ] Sofia (CONTENIDO) puede navegar a `/contenido/colecciones`
- [ ] Desde ahi puede hacer clic en "Nueva Coleccion" y crear una
- [ ] Puede editar titulo, descripcion, institucion, categoria, duracion
- [ ] Puede publicar/despublicar una coleccion
- [ ] Puede agregar un video con URL de YouTube + titulo + duracion
- [ ] Puede eliminar un video existente
- [ ] Puede eliminar una coleccion completa
- [ ] Los breadcrumbs muestran "Contenido > Colecciones > ..." (no "Admin")
- [ ] ADMIN accede a `/admin/colecciones` y es redirigido a `/contenido/colecciones` sin error
- [ ] La coleccion publicada aparece en el carrusel del landing

## Flujos para QA

### Flujo 1 — Crear coleccion completa
1. Login como CONTENIDO (sofia@test.com)
2. Ir a `/contenido/colecciones`
3. Click "Nueva Coleccion"
4. Completar titulo + institucion + categoria
5. Se redirige a editar coleccion
6. Agregar 2 videos con URLs de YouTube validas
7. Marcar como "Publicada"
8. Guardar
9. Verificar en landing que aparece en el carrusel con badge "Curso"

### Flujo 2 — Editar y eliminar
1. Login como CONTENIDO
2. Ir a `/contenido/colecciones`
3. Click "Editar" en una coleccion existente
4. Cambiar titulo y guardar
5. Eliminar un video
6. Eliminar la coleccion completa
7. Verificar que desaparece de la lista

### Flujo 3 — Redirects admin funcionan
1. Login como ADMIN
2. Ir manualmente a `/admin/colecciones`
3. Verificar que redirige a `/contenido/colecciones`
4. Crear coleccion, editar, agregar video — todo funciona

## Estimacion

~1.5h (mover 3 archivos + adaptar links + 4 redirects + limpiar middleware)

## Dependencias

- Ninguna hacia adelante (no necesita schema, no necesita APIs nuevas)
- Desbloquea: issue #355, punto 14 (cursos reales en Academia para la demo)
