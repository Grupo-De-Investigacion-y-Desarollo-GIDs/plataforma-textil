# SPEC V4 — X-04b v2: CMS de Novedades (CRUD simple) — CORREGIDO POST PRE-FLIGHT

> **Versión corregida** tras pre-flight checks. 7 correcciones técnicas + 4 decisiones de diseño aplicadas.
>
> Cambios respecto a v1:
> - C1: campo `imagen` → `imagenUrl`
> - C2: eliminado campo `url` (no existe en schema)
> - C3: campo `fechaPublicacion` → `fecha`
> - C4: enum `NOVEDAD` → `NOTICIA`
> - C5: enum `CURSO` → `CASO`
> - C6: agregar campo `slug` (auto-generado)
> - C7: forzar `publicado: true` en create (default DB es false)
> - D1: slug auto-generado con timestamp en colisión
> - D2: sin campo url
> - D3: check inline en lugar de ConfiguracionUpload
> - D4: ADMIN usa `/contenido/novedades` directamente

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **ID** | X-04b |
| **Versión** | v4 (spec v2 post-discovery) |
| **Slug** | cms-novedades-simple |
| **Estimación** | 3-4h |
| **Riesgo** | Bajo (todos los problemas corregidos en spec) |
| **Branch** | `feature/v4-x-04b-cms-novedades` |

---

## 2. Schema real de Novedad (de pre-flight)

```prisma
model Novedad {
  id          String      @id @default(cuid())
  tipo        TipoNovedad
  titulo      String
  slug        String      @unique   // ← OBLIGATORIO
  descripcion String      @db.Text
  fecha       DateTime    @default(now())  // ← NO "fechaPublicacion"
  imagenUrl   String?                       // ← NO "imagen"
  publicado   Boolean     @default(false)   // ← Default es false, forzar true en create
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum TipoNovedad {
  NOTICIA    // ← NO "NOVEDAD"
  CASO       // ← NO "CURSO"
  INDICADOR
}
```

### Labels amigables para el form

```ts
const TIPO_LABELS = {
  NOTICIA: 'Noticia',
  CASO: 'Caso de éxito',
  INDICADOR: 'Indicador',
} as const
```

---

## 3. Outputs (corregidos)

1. **`/contenido/novedades`** — Listado (server component)
2. **`/contenido/novedades/nueva`** — Form de creación
3. **`/contenido/novedades/[id]/editar`** — Form de edición
4. **`/api/contenido/novedades`** — Endpoints GET, POST
5. **`/api/contenido/novedades/[id]`** — Endpoints PATCH, DELETE
6. **`/api/contenido/novedades/upload`** — Endpoint POST upload
7. **Componente `FormularioNovedad`** — Compartido entre nueva/editar
8. **Agregar "Novedades" al `ContenidoSidebar`**

---

## 4. Prescripciones técnicas

### 4.1 — Utility para slugify

```ts
// src/compartido/lib/slugify.ts (si no existe)
import { prisma } from '@/lib/prisma'

function basicSlugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quitar tildes
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

export async function generarSlugUnico(titulo: string, excludeId?: string): Promise<string> {
  const baseSlug = basicSlugify(titulo)
  
  // Verificar si existe
  const existing = await prisma.novedad.findFirst({
    where: {
      slug: baseSlug,
      ...(excludeId && { NOT: { id: excludeId } }),
    },
  })
  
  if (!existing) return baseSlug
  
  // Si colisiona, append timestamp
  const timestamp = Date.now().toString().slice(-6)
  return `${baseSlug}-${timestamp}`
}
```

### 4.2 — Endpoint POST `/api/contenido/novedades/upload`

```ts
// src/app/api/contenido/novedades/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadFile } from '@/compartido/lib/storage'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024  // 5MB

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user || !['CONTENIDO', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  
  // Check inline (decision D3: bypass ConfiguracionUpload)
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Tipo de archivo no permitido. Use JPEG, PNG o WebP.' }, 
      { status: 400 }
    )
  }
  
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'Archivo muy grande. Máximo 5MB.' }, 
      { status: 400 }
    )
  }
  
  const buffer = Buffer.from(await file.arrayBuffer())
  const timestamp = Date.now()
  const ext = file.name.split('.').pop()
  const path = `novedades/${timestamp}.${ext}`
  
  const url = await uploadFile(buffer, path, file.type, 'imagenes')
  
  return NextResponse.json({ url })
}
```

### 4.3 — Endpoint `/api/contenido/novedades` (GET, POST)

```ts
// src/app/api/contenido/novedades/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generarSlugUnico } from '@/compartido/lib/slugify'

function checkAuth(session: any) {
  if (!session?.user || !['CONTENIDO', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function GET() {
  const session = await auth()
  const authError = checkAuth(session)
  if (authError) return authError
  
  const novedades = await prisma.novedad.findMany({
    orderBy: { createdAt: 'desc' },
  })
  
  return NextResponse.json({ novedades })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const authError = checkAuth(session)
  if (authError) return authError
  
  const body = await req.json()
  
  // Validación
  if (!body.titulo || !body.descripcion || !body.tipo) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }
  
  if (!['NOTICIA', 'CASO', 'INDICADOR'].includes(body.tipo)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }
  
  // Generar slug único (decision D1)
  const slug = await generarSlugUnico(body.titulo)
  
  const novedad = await prisma.novedad.create({
    data: {
      titulo: body.titulo,
      slug,
      descripcion: body.descripcion,
      tipo: body.tipo,
      imagenUrl: body.imagenUrl ?? null,
      fecha: body.fecha ? new Date(body.fecha) : new Date(),
      publicado: true,  // ← C7: forzar true (default DB es false)
    },
  })
  
  return NextResponse.json({ novedad })
}
```

### 4.4 — Endpoint `/api/contenido/novedades/[id]`

```ts
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const authError = checkAuth(session)
  if (authError) return authError
  
  const { id } = await params
  const body = await req.json()
  
  // Si cambió el título, regenerar slug
  const updates: any = {
    titulo: body.titulo,
    descripcion: body.descripcion,
    tipo: body.tipo,
    imagenUrl: body.imagenUrl ?? null,
  }
  
  if (body.titulo) {
    const currentNovedad = await prisma.novedad.findUnique({ where: { id } })
    if (currentNovedad && currentNovedad.titulo !== body.titulo) {
      updates.slug = await generarSlugUnico(body.titulo, id)
    }
  }
  
  const novedad = await prisma.novedad.update({
    where: { id },
    data: updates,
  })
  
  return NextResponse.json({ novedad })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const authError = checkAuth(session)
  if (authError) return authError
  
  const { id } = await params
  
  await prisma.novedad.delete({ where: { id } })
  
  return NextResponse.json({ ok: true })
}
```

### 4.5 — Listado `/contenido/novedades/page.tsx`

Server component (patrón Observaciones):

```tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { Newspaper, Plus, Edit, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

const TIPO_LABELS = {
  NOTICIA: 'Noticia',
  CASO: 'Caso de éxito',
  INDICADOR: 'Indicador',
} as const

const TIPO_COLOR = {
  NOTICIA: 'bg-pastel-green text-green-900',
  CASO: 'bg-pastel-blue text-brand-blue',
  INDICADOR: 'bg-pastel-purple text-purple-900',
} as const

export default async function NovedadesPage() {
  const novedades = await prisma.novedad.findMany({
    orderBy: { createdAt: 'desc' },
  })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-primary">Novedades</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestionar novedades del landing
          </p>
        </div>
        <Link
          href="/contenido/novedades/nueva"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-md font-overpass font-medium text-sm hover:bg-brand-blue-dark"
        >
          <Plus className="w-4 h-4" />
          Nueva novedad
        </Link>
      </div>
      
      {novedades.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="w-12 h-12 text-gray-400" />}
          titulo="Aún no hay novedades"
          mensaje="Crear la primera novedad para que aparezca en el landing."
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-overpass font-bold uppercase text-gray-600">Imagen</th>
                <th className="text-left px-4 py-3 text-xs font-overpass font-bold uppercase text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-overpass font-bold uppercase text-gray-600">Título</th>
                <th className="text-left px-4 py-3 text-xs font-overpass font-bold uppercase text-gray-600">Fecha</th>
                <th className="text-right px-4 py-3 text-xs font-overpass font-bold uppercase text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {novedades.map(n => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {n.imagenUrl ? (
                      <img src={n.imagenUrl} alt="" className="w-16 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-overpass font-bold uppercase ${TIPO_COLOR[n.tipo]}`}>
                      {TIPO_LABELS[n.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-primary">{n.titulo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(n.fecha).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/contenido/novedades/${n.id}/editar`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm text-brand-blue hover:bg-pastel-blue rounded"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

### 4.6 — Form compartido `FormularioNovedad.tsx`

Componente client para reutilizar en `/nueva` y `/[id]/editar`:

```tsx
'use client'

import { useState, useRouter } from 'react'
// ...

interface Props {
  novedad?: {
    id: string
    tipo: 'NOTICIA' | 'CASO' | 'INDICADOR'
    titulo: string
    descripcion: string
    imagenUrl: string | null
    fecha: Date
  }
}

export function FormularioNovedad({ novedad }: Props) {
  const router = useRouter()
  const isEdit = !!novedad
  
  const [tipo, setTipo] = useState(novedad?.tipo ?? 'NOTICIA')
  const [titulo, setTitulo] = useState(novedad?.titulo ?? '')
  const [descripcion, setDescripcion] = useState(novedad?.descripcion ?? '')
  const [imagenUrl, setImagenUrl] = useState(novedad?.imagenUrl ?? null)
  const [fecha, setFecha] = useState(
    novedad?.fecha ? new Date(novedad.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Upload de imagen
  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await fetch('/api/contenido/novedades/upload', {
      method: 'POST',
      body: formData,
    })
    
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error subiendo imagen')
    }
    
    const { url } = await res.json()
    setImagenUrl(url)
  }
  
  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const url = isEdit 
        ? `/api/contenido/novedades/${novedad.id}`
        : '/api/contenido/novedades'
      
      const method = isEdit ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          titulo,
          descripcion,
          imagenUrl,
          fecha,
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error guardando')
      }
      
      router.push('/contenido/novedades')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // Delete
  const handleDelete = async () => {
    if (!isEdit) return
    setLoading(true)
    
    try {
      const res = await fetch(`/api/contenido/novedades/${novedad.id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Error eliminando')
      
      router.push('/contenido/novedades')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Tipo */}
      <div>
        <label className="block text-sm font-overpass font-medium text-ink-primary mb-1">
          Tipo *
        </label>
        <select
          value={tipo}
          onChange={e => setTipo(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="NOTICIA">Noticia</option>
          <option value="CASO">Caso de éxito</option>
          <option value="INDICADOR">Indicador</option>
        </select>
      </div>
      
      {/* Título */}
      <div>
        <label className="block text-sm font-overpass font-medium text-ink-primary mb-1">
          Título *
        </label>
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      {/* Descripción */}
      <div>
        <label className="block text-sm font-overpass font-medium text-ink-primary mb-1">
          Descripción *
        </label>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          maxLength={2000}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      {/* Imagen */}
      <div>
        <label className="block text-sm font-overpass font-medium text-ink-primary mb-1">
          Imagen
        </label>
        {imagenUrl ? (
          <div className="space-y-2">
            <img src={imagenUrl} alt="" className="max-w-xs rounded border border-gray-200" />
            <button type="button" onClick={() => setImagenUrl(null)} className="text-sm text-red-600">
              Quitar imagen
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                try {
                  await handleUpload(file)
                } catch (err: any) {
                  setError(err.message)
                }
              }
            }}
          />
        )}
      </div>
      
      {/* Fecha */}
      <div>
        <label className="block text-sm font-overpass font-medium text-ink-primary mb-1">
          Fecha
        </label>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      {/* Acciones */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-brand-blue text-white rounded-md font-overpass font-medium disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear novedad'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/contenido/novedades')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-overpass font-medium"
          >
            Cancelar
          </button>
        </div>
        
        {isEdit && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="text-sm text-red-600 font-overpass font-medium"
          >
            Eliminar novedad
          </button>
        )}
      </div>
      
      {/* Modal de delete */}
      {showDeleteModal && (
        <Modal title="Eliminar novedad" onClose={() => setShowDeleteModal(false)}>
          <p>¿Estás seguro? Esta acción no se puede deshacer.</p>
          <div className="flex gap-2 mt-4">
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">
              Sí, eliminar
            </button>
            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-md">
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </form>
  )
}
```

### 4.7 — Páginas `/nueva` y `/[id]/editar`

```tsx
// src/app/(contenido)/contenido/novedades/nueva/page.tsx
import { FormularioNovedad } from './formulario-novedad'

export default function NuevaNovedadPage() {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-ink-primary mb-6">
        Nueva novedad
      </h1>
      <FormularioNovedad />
    </div>
  )
}
```

```tsx
// src/app/(contenido)/contenido/novedades/[id]/editar/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FormularioNovedad } from '../../nueva/formulario-novedad'

export default async function EditarNovedadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const novedad = await prisma.novedad.findUnique({ where: { id } })
  
  if (!novedad) notFound()
  
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-ink-primary mb-6">
        Editar novedad
      </h1>
      <FormularioNovedad novedad={novedad} />
    </div>
  )
}
```

### 4.8 — Agregar "Novedades" al ContenidoSidebar

```tsx
// src/compartido/componentes/layout/contenido-sidebar.tsx

// Agregar al array de items:
{
  label: 'Novedades',
  href: '/contenido/novedades',
  icon: Newspaper,
}
```

---

## 5. Casos borde

| # | Caso | Comportamiento |
|---|------|----------------|
| 1 | Usuario sin permiso accede a `/contenido/novedades` | Middleware lo bloquea (ya configurado) |
| 2 | Crear sin imagen | OK (imagen es opcional) |
| 3 | Crear con título duplicado | Slug se genera con timestamp diferenciador |
| 4 | Upload > 5MB | Error 400 con mensaje |
| 5 | Upload tipo inválido | Error 400 con mensaje |
| 6 | Eliminar novedad que aparece en landing | Próximo refresh ya no la muestra |
| 7 | Editar título → slug cambia | Verificar unicidad excluyendo la novedad actual |
| 8 | DB sin novedades | EmptyState con "Crear la primera" |

---

## 6. Criterios de aceptación

- [ ] `/contenido/novedades` lista todas las novedades
- [ ] Botón "Nueva novedad" funciona
- [ ] Crear novedad genera slug único
- [ ] Crear novedad con imagen funciona
- [ ] Editar novedad funciona
- [ ] Eliminar con confirmación funciona
- [ ] La novedad creada aparece en el landing público
- [ ] ADMIN puede acceder a `/contenido/novedades`
- [ ] TALLER/MARCA/ESTADO NO pueden acceder
- [ ] "Novedades" aparece en ContenidoSidebar
- [ ] CI verde

---

## 7. Plan de implementación

1. **Setup (10 min)** — Branch, utility slugify
2. **Endpoint upload (20 min)** — Reutilizar `uploadFile()` del storage
3. **Endpoints CRUD (30 min)** — GET, POST, PATCH, DELETE
4. **Listado (30 min)** — Server component con tabla
5. **Form compartido (45 min)** — Crear/editar con upload
6. **Páginas `/nueva` y `/[id]/editar` (15 min)** — Wrappers del form
7. **Sidebar update (5 min)** — Agregar Novedades
8. **Verificación visual (15 min)** — Probar como Sofía
9. **Tests E2E (10 min)** — Correr suite (cero tests afectados según pre-flight)
10. **Commit + PR (15 min)**

**Total estimado: 3h 15min** (vs 3-4h en spec original)

---

## 8. Selectores críticos (Sección 13 del template)

| Selector / Concepto | Dónde se usa | Riesgo si se rompe |
|---|---|---|
| `prisma.novedad.findMany({ where: { publicado: true } })` | src/app/page.tsx | Landing deja de mostrar novedades |
| `n.slug → /novedades/${n.slug}` | src/app/page.tsx | Links del carrusel se rompen |
| `n.imagenUrl` | src/app/page.tsx, carrusel | Imágenes desaparecen |
| `TipoNovedad: NOTICIA, CASO, INDICADOR` | Schema + queries | Enum inválido = build error |
| `TIPO_BADGE_COLOR` mapping | carrusel-novedades.tsx | Badges con colores wrongs |
| `ContenidoSidebar items` | contenido-sidebar.tsx | Navegación rota |
| `uploadFile(buffer, path, contentType, 'imagenes')` | storage.ts | Upload al bucket correcto |

---

**Fin del SPEC X-04b v2 (post-discovery)**

> Todos los problemas técnicos identificados en pre-flight están corregidos.
> Decisiones de Gerardo aplicadas.
> Estimación de implementación: 3h 15min.
