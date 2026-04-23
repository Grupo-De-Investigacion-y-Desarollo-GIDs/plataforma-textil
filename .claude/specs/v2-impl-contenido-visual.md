# Spec: Implementación de Contenido Visual

**Versión:** v2
**Asignado a:** Gerardo (schema + infra + APIs) + Sergio (UI)
**Prioridad:** P1
**Dependencias:**
- `v2-epica-storage-documentos` mergeado (storage.ts multi-bucket, bucket público)
- `v2-epica-flujo-comercial-unificado` mergeado (schema Pedido/Cotizacion actualizados)

**Referencia de diseño:** `v2-epica-contenido-visual.md` (wireframes W1-W7 y tabla de vistas)

**Fases:** 1 (infra) + 2 (portfolio taller) + 3 (imágenes en pedidos y cotizaciones). Fase 4 (instalaciones) post-piloto.

---

## ⚠️ ANTES DE ARRANCAR

- [ ] Bucket `imagenes` creado en Supabase (`v2-config-piloto-pre-deploy` §2)
- [ ] `storage.ts` extendido a multi-bucket (`v2-epica-storage-documentos`)
- [ ] `v2-epica-flujo-comercial-unificado` mergeado (schema Pedido tiene campo `visibilidad`, `invitaciones`, etc.)
- [ ] **Gerardo verificó y adaptó** `POST /api/pedidos` para aceptar `imagenes: string[]`, `procesosRequeridos: string[]`, `descripcion: string` — si el endpoint no los acepta, adaptarlos **antes** de que Sergio implemente §6
- [ ] **Gerardo verificó y adaptó** `POST /api/cotizaciones` para aceptar `imagenes: string[]` — **antes** de que Sergio implemente §7
- [ ] **Sergio verificó** que `src/taller/componentes/cotizar-form.tsx` existe. Si no existe, crearlo como client component con los campos `precio`, `plazoDias`, `proceso`, `mensaje`, `imagenes`

---

## 1. Cambios de schema — Gerardo

**Archivo:** `prisma/schema.prisma`

### 1.1 Agregar campos a `Pedido`

```prisma
model Pedido {
  // ... campos existentes ...
  imagenes           String[]   // URLs de imágenes de referencia (max 5)
  procesosRequeridos String[]   // IDs de procesos productivos requeridos
  // descripcion ya existe (String? @db.Text) — solo exponer en el form
  // montoTotal queda deprecado — no usar en código nuevo
}
```

### 1.2 Agregar campo a `Cotizacion`

```prisma
model Cotizacion {
  // ... campos existentes ...
  imagenes  String[]   // URLs de fotos de trabajos similares (max 3)
}
```

### 1.3 `portfolioFotos` ya existe en `Taller`

```prisma
portfolioFotos  String[]   // schema.prisma:188 — existe, sin usar, no requiere migración
```

### Migración

```bash
npx prisma migrate dev --name contenido_visual_imagenes
```

Son 3 campos `String[]` nuevos que PostgreSQL crea como arrays con default `{}` (vacío). No requiere reset ni backfill.

---

## 2. Extender `storage.ts` — Gerardo

**Archivo:** `src/compartido/lib/storage.ts`

> Nota: si `v2-epica-storage-documentos` ya extendió este archivo a multi-bucket, verificar que la implementación es compatible con lo de abajo. Si no, aplicar este cambio.

```ts
const BUCKETS = {
  documentos: 'documentos',
  imagenes: 'imagenes',
} as const

type Bucket = keyof typeof BUCKETS

export async function uploadFile(
  buffer: Buffer,
  path: string,
  contentType: string,
  bucket: Bucket = 'documentos'   // default backward compatible
): Promise<string> {
  const { error } = await getSupabase().storage
    .from(BUCKETS[bucket])
    .upload(path, buffer, { contentType, upsert: true })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = getSupabase().storage.from(BUCKETS[bucket]).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteFile(path: string, bucket: Bucket = 'documentos'): Promise<void> {
  const { error } = await getSupabase().storage.from(BUCKETS[bucket]).remove([path])
  if (error) throw new Error(`Delete failed: ${error.message}`)
}
```

Los callers existentes (upload de documentos de formalización) no necesitan cambios — el default `'documentos'` los cubre.

---

## 3. Extender `file-upload.tsx` — Sergio

**Archivo:** `src/compartido/componentes/ui/file-upload.tsx`

### 3.1 Ampliar interface

```ts
interface FileUploadProps {
  accept?: string
  maxSizeMB?: number
  maxFiles?: number           // NUEVO — límite de cantidad de archivos
  showPreviews?: boolean      // NUEVO — mostrar thumbnails de imágenes
  onChange: (files: File[]) => void
  className?: string
}
```

### 3.2 Validación de límite en `addFiles`

```ts
function addFiles(newFiles: FileList | null) {
  if (!newFiles) return
  const filtered = Array.from(newFiles).filter(f => f.size <= maxSizeMB * 1024 * 1024)
  const combined = [...files, ...filtered]
  // Respetar el límite maxFiles
  const limited = maxFiles ? combined.slice(0, maxFiles) : combined
  setFiles(limited)
  onChange(limited)
}
```

### 3.3 Preview de imágenes

En el listado de archivos, si `showPreviews` y el archivo es imagen, mostrar thumbnail:

```tsx
{files.map((file, i) => (
  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
    <div className="flex items-center gap-2">
      {showPreviews && file.type.startsWith('image/') ? (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
        />
      ) : (
        <FileText className="w-5 h-5 text-gray-400" />
      )}
      <span className="text-sm truncate">{file.name}</span>
      <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
    </div>
    <button onClick={() => removeFile(i)} className="p-1 hover:bg-gray-200 rounded">
      <X className="w-4 h-4 text-gray-500" />
    </button>
  </div>
))}
```

### 3.4 Indicador de límite alcanzado

```tsx
{maxFiles && files.length >= maxFiles && (
  <p className="text-xs text-gray-400 mt-2">
    Máximo {maxFiles} archivos alcanzado
  </p>
)}
```

> **Nota sobre blob URLs**: `URL.createObjectURL` genera blob URLs que persisten en memoria hasta `URL.revokeObjectURL`. Para el piloto con 3-10 archivos el leak es negligible. Post-piloto: agregar cleanup con `URL.revokeObjectURL` en `removeFile` y en el unmount del componente (vía `useEffect` cleanup).

---

## 4. API de upload de imágenes — Gerardo

**Archivo nuevo:** `src/app/api/upload/imagenes/route.ts`

Endpoint **seguro** para subir imágenes al bucket `imagenes`. El path se construye **server-side** para evitar que un usuario suba archivos al namespace de otro.

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { uploadFile } from '@/compartido/lib/storage'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024  // 5MB

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const contexto = formData.get('contexto') as string    // 'portfolio' | 'pedido' | 'cotizacion'
    const entityId = formData.get('entityId') as string    // tallerId, pedidoId

    if (!file || !contexto || !entityId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no soportado. Usá JPG, PNG o WebP.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'La imagen no puede superar 5MB' },
        { status: 400 }
      )
    }

    // Validar ownership según contexto — el usuario solo puede subir a su propia entidad
    if (contexto === 'portfolio') {
      const taller = await prisma.taller.findFirst({
        where: { id: entityId, userId: session.user.id },
      })
      if (!taller) {
        return NextResponse.json({ error: 'Sin acceso a este taller' }, { status: 403 })
      }
    } else if (contexto === 'pedido') {
      const pedido = await prisma.pedido.findUnique({
        where: { id: entityId },
        include: { marca: { select: { userId: true } } },
      })
      if (!pedido || pedido.marca.userId !== session.user.id) {
        return NextResponse.json({ error: 'Sin acceso a este pedido' }, { status: 403 })
      }
    } else if (contexto === 'cotizacion') {
      // Para cotizaciones, el entityId es el pedidoId (la cotización aún no existe)
      const taller = await prisma.taller.findFirst({
        where: { userId: session.user.id },
      })
      if (!taller) {
        return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Contexto inválido' }, { status: 400 })
    }

    // Construir path seguro server-side — el cliente NUNCA controla el path
    const ext = file.name.split('.').pop() ?? 'jpg'
    const timestamp = Date.now()
    const path = `${contexto}/${entityId}/${timestamp}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadFile(buffer, path, file.type, 'imagenes')

    return NextResponse.json({ url })
  } catch (error) {
    console.error('[upload/imagenes]', error)
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 502 })
  }
}
```

> **Seguridad**: el cliente envía `contexto` + `entityId`, no un path libre. El servidor valida ownership de la entidad antes de aceptar el upload, y construye el path completo internamente. Un taller no puede subir al namespace de otro taller, ni una marca al namespace de otra marca.

### Helper de upload para client components

**Archivo nuevo:** `src/compartido/lib/upload-imagen.ts`

```ts
export async function uploadImagen(
  file: File,
  contexto: 'portfolio' | 'pedido' | 'cotizacion',
  entityId: string,
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('contexto', contexto)
  formData.append('entityId', entityId)

  const res = await fetch('/api/upload/imagenes', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? 'Error al subir imagen')
  }

  const { url } = await res.json()
  return url
}
```

Los callers usan:

```ts
const url = await uploadImagen(file, 'portfolio', tallerId)
const url = await uploadImagen(file, 'pedido', pedidoId)
const url = await uploadImagen(file, 'cotizacion', pedidoId)
```

---

## 5. Componente `ImageLightbox` — Sergio

**Archivo nuevo:** `src/compartido/componentes/ui/image-lightbox.tsx`

Lightbox simple con `<dialog>` nativo — sin dependencia externa. Usado en todas las galerías del spec.

```tsx
'use client'

export function ImageLightbox({
  src,
  onClose,
}: {
  src: string
  onClose: () => void
}) {
  return (
    <dialog
      open
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 cursor-pointer"
      style={{
        width: '100vw',
        height: '100vh',
        maxWidth: 'unset',
        maxHeight: 'unset',
        border: 'none',
        margin: 0,
        padding: '2rem',
      }}
    >
      <img
        src={src}
        alt="Ampliada"
        loading="lazy"
        className="max-w-full max-h-full object-contain rounded-lg cursor-default"
        onClick={(e) => e.stopPropagation()}
      />
    </dialog>
  )
}
```

### Patrón de uso en todas las galerías

Cada galería que necesite lightbox:

```tsx
const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null)

// En el grid de imágenes:
<img
  src={url}
  alt="..."
  loading="lazy"
  className="cursor-pointer hover:opacity-90 ..."
  onClick={() => setImagenAmpliada(url)}
/>

// Al final del componente:
{imagenAmpliada && (
  <ImageLightbox src={imagenAmpliada} onClose={() => setImagenAmpliada(null)} />
)}
```

Se usa en: portfolio del taller (§6.1), perfil público (§6.2), detalle de pedido (§7.3), y cotizaciones de la marca (§8.2).

---

## 6. Portfolio del taller — Sergio

### ⚠️ Antes de arrancar esta sección

- [ ] `storage.ts` extendido (Gerardo §2)
- [ ] API `/api/upload/imagenes` disponible (Gerardo §4)
- [ ] `file-upload.tsx` con `maxFiles` y `showPreviews` (Sergio §3)
- [ ] `ImageLightbox` disponible (Sergio §5)

### 6.1 Sección portfolio en `/taller/perfil/page.tsx`

Agregar sección **después de "Tipos de Prenda"** y **antes de "Certificaciones"**:

```tsx
import { ImageLightbox } from '@/compartido/componentes/ui/image-lightbox'

// En el server component, portfolioFotos ya está disponible (campo scalar de Taller)

{/* Portfolio de trabajos */}
<Card title="Mi portfolio">
  <PortfolioManager tallerId={taller.id} fotosActuales={taller.portfolioFotos} />
</Card>
```

### Archivo nuevo: `src/taller/componentes/portfolio-manager.tsx`

Client component para ver, agregar y eliminar fotos del portfolio:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageIcon, Plus } from 'lucide-react'
import { FileUpload } from '@/compartido/componentes/ui/file-upload'
import { ImageLightbox } from '@/compartido/componentes/ui/image-lightbox'
import { Button } from '@/compartido/componentes/ui/button'
import { uploadImagen } from '@/compartido/lib/upload-imagen'

interface Props {
  tallerId: string
  fotosActuales: string[]
}

export function PortfolioManager({ tallerId, fotosActuales }: Props) {
  const router = useRouter()
  const [subiendo, setSubiendo] = useState(false)
  const [mostrarUploader, setMostrarUploader] = useState(false)
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null)

  const maxFotos = 10
  const puedeAgregar = fotosActuales.length < maxFotos

  async function handleUpload(files: File[]) {
    if (files.length === 0) return
    setSubiendo(true)
    try {
      const nuevasUrls: string[] = []
      for (const file of files) {
        const url = await uploadImagen(file, 'portfolio', tallerId)
        nuevasUrls.push(url)
      }
      // Persistir en el taller
      await fetch(`/api/talleres/${tallerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioFotos: [...fotosActuales, ...nuevasUrls],
        }),
      })
      router.refresh()
    } catch (err) {
      console.error('[portfolio] Error subiendo fotos:', err)
    } finally {
      setSubiendo(false)
      setMostrarUploader(false)
    }
  }

  async function eliminarFoto(urlAEliminar: string) {
    const nuevas = fotosActuales.filter(url => url !== urlAEliminar)
    await fetch(`/api/talleres/${tallerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioFotos: nuevas }),
    })
    router.refresh()
  }

  if (fotosActuales.length === 0 && !mostrarUploader) {
    return (
      <div className="text-center py-6">
        <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Agregá fotos de tus trabajos</p>
        <p className="text-xs text-gray-400 mt-1">
          Los talleres con portfolio reciben 3x más contactos
        </p>
        <Button
          onClick={() => setMostrarUploader(true)}
          variant="secondary"
          size="sm"
          className="mt-3"
          icon={<Plus className="w-4 h-4" />}
        >
          Agregar fotos
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Grid de fotos existentes */}
      {fotosActuales.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {fotosActuales.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <img
                src={url}
                alt={`Trabajo ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90"
                onClick={() => setImagenAmpliada(url)}
              />
              <button
                onClick={() => eliminarFoto(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Uploader */}
      {puedeAgregar && (
        mostrarUploader ? (
          <div className="space-y-3">
            <FileUpload
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={5}
              maxFiles={maxFotos - fotosActuales.length}
              showPreviews={true}
              onChange={handleUpload}
            />
            {subiendo && <p className="text-sm text-gray-500">Subiendo fotos...</p>}
          </div>
        ) : (
          <Button
            onClick={() => setMostrarUploader(true)}
            variant="secondary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Agregar fotos ({fotosActuales.length}/{maxFotos})
          </Button>
        )
      )}

      {/* Lightbox */}
      {imagenAmpliada && (
        <ImageLightbox src={imagenAmpliada} onClose={() => setImagenAmpliada(null)} />
      )}
    </div>
  )
}
```

> **Nota**: el `PUT /api/talleres/{tallerId}` ya acepta `portfolioFotos` en la allowlist (verificar — si no está, Gerardo debe agregarlo en el array `fields` del endpoint).

### 6.2 Portfolio en perfil público `/perfil/[id]/page.tsx`

`portfolioFotos` es un campo scalar de `Taller` — ya está disponible en la query existente sin cambios.

Agregar sección **después de "Tipos de prenda"** y **antes de "Certificaciones"**:

```tsx
{taller.portfolioFotos.length > 0 && (
  <Card title="Trabajos realizados">
    <GaleriaFotos fotos={taller.portfolioFotos} />
  </Card>
)}
```

`GaleriaFotos` es un client component mínimo que solo maneja el lightbox:

```tsx
'use client'
import { useState } from 'react'
import { ImageLightbox } from '@/compartido/componentes/ui/image-lightbox'

export function GaleriaFotos({ fotos }: { fotos: string[] }) {
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null)
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {fotos.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`Trabajo ${i + 1}`}
            loading="lazy"
            className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90"
            onClick={() => setImagenAmpliada(url)}
          />
        ))}
      </div>
      {imagenAmpliada && (
        <ImageLightbox src={imagenAmpliada} onClose={() => setImagenAmpliada(null)} />
      )}
    </>
  )
}
```

### 6.3 Foto destacada en tarjetas del directorio

En `/directorio/page.tsx` y `/marca/directorio/page.tsx`, agregar la primera foto del portfolio como imagen de tarjeta:

```tsx
{/* En cada tarjeta de taller, arriba del nombre */}
<div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
  {taller.portfolioFotos?.[0] ? (
    <img
      src={taller.portfolioFotos[0]}
      alt={taller.nombre}
      loading="lazy"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <Factory className="w-8 h-8 text-gray-300" />
    </div>
  )}
</div>
```

Talleres sin portfolio muestran un placeholder con ícono genérico.

---

## 7. Imágenes en pedidos — Sergio + Gerardo

### 7.1 Convertir `/marca/pedidos/nuevo` a client component con upload

**Separar en dos archivos** (patrón server + client):

#### `page.tsx` (server wrapper)

```tsx
export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { NuevoPedidoForm } from './nuevo-pedido-form'

export default async function MarcaNuevoPedidoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'MARCA') redirect('/unauthorized')

  const marca = await prisma.marca.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!marca) redirect('/unauthorized')

  const procesos = await prisma.procesoProductivo.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' },
  })

  return <NuevoPedidoForm marcaId={marca.id} procesos={procesos} />
}
```

#### `nuevo-pedido-form.tsx` (client component)

Campos del formulario actualizado:

```
Existentes:
  - tipoPrenda (texto libre)
  - cantidad (number, requerido)
  - fechaObjetivo (date, opcional)

ELIMINADO del form:
  - montoTotal (deprecated — el precio lo define la cotización)

NUEVOS:
  - descripcion (textarea — especificaciones técnicas: tela, talles, terminaciones)
  - procesosRequeridos (multi-select del catálogo ProcesoProductivo)
  - imagenes (FileUpload con maxFiles=5, showPreviews=true, accept='image/jpeg,image/png,image/webp')
```

Flow de submit:

```ts
async function handleSubmit() {
  setGuardando(true)
  try {
    // 1. Subir imágenes primero (si hay)
    const imagenesUrls: string[] = []
    // NOTA: usamos 'pedido' + marcaId como entityId temporal porque el pedido aún no existe.
    // El path real en Storage será pedido/{marcaId}/{timestamp}.jpg
    // Alternativa: crear el pedido sin imágenes, subir con pedidoId, y luego actualizar.
    // Para el piloto la opción temporal es aceptable.
    for (const file of imagenesFiles) {
      const url = await uploadImagen(file, 'pedido', marcaId)
      imagenesUrls.push(url)
    }

    // 2. Crear el pedido con las URLs
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipoPrenda,
        cantidad: parseInt(cantidad),
        fechaObjetivo: fechaObjetivo || null,
        descripcion: descripcion || null,
        procesosRequeridos: procesosSeleccionados,
        imagenes: imagenesUrls,
      }),
    })

    if (res.ok) {
      router.push('/marca/pedidos?created=1')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al crear el pedido')
    }
  } catch {
    setError('Error de conexión')
  } finally {
    setGuardando(false)
  }
}
```

### 7.2 Mostrar imágenes en marketplace `/taller/pedidos/disponibles`

En la tarjeta de cada pedido, si tiene `imagenes[0]`:

```tsx
<div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
  {pedido.imagenes?.[0] ? (
    <img
      src={pedido.imagenes[0]}
      alt={pedido.tipoPrenda}
      loading="lazy"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <Package className="w-8 h-8 text-gray-300" />
    </div>
  )}
</div>
```

### 7.3 Galería de imágenes en detalle del pedido

En `/taller/pedidos/disponibles/[id]/page.tsx` y `/marca/pedidos/[id]/page.tsx`, si el pedido tiene imágenes:

```tsx
{pedido.imagenes.length > 0 && (
  <GaleriaFotos fotos={pedido.imagenes} />
)}
```

Reutilizar el componente `GaleriaFotos` del §6.2 (ya incluye lightbox).

---

## 8. Imágenes en cotizaciones — Sergio

### 8.1 Agregar upload de imágenes al form de cotización

**Archivo:** `src/taller/componentes/cotizar-form.tsx` (verificar que existe — si no, crearlo)

Agregar sección de imágenes opcionales:

```tsx
<div>
  <label className="text-sm font-medium text-gray-700">
    Fotos de trabajos similares <span className="text-gray-400">(opcional, máx 3)</span>
  </label>
  <FileUpload
    accept="image/jpeg,image/png,image/webp"
    maxSizeMB={5}
    maxFiles={3}
    showPreviews={true}
    onChange={setImagenesFiles}
    className="mt-2"
  />
</div>
```

Flow de submit — subir imágenes antes de crear la cotización:

```ts
// Antes del fetch a POST /api/cotizaciones:
const imagenesUrls: string[] = []
for (const file of imagenesFiles) {
  const url = await uploadImagen(file, 'cotizacion', pedidoId)
  imagenesUrls.push(url)
}

// Incluir en el body:
body: JSON.stringify({
  pedidoId,
  precio,
  plazoDias,
  proceso,
  mensaje,
  imagenes: imagenesUrls,
})
```

### 8.2 Mostrar imágenes en vista de cotizaciones de la marca

En `/marca/pedidos/[id]/page.tsx`, en cada cotización:

```tsx
{cot.imagenes && cot.imagenes.length > 0 && (
  <div className="flex gap-2 mt-3">
    {cot.imagenes.map((url, i) => (
      <img
        key={i}
        src={url}
        alt={`Trabajo similar ${i + 1}`}
        loading="lazy"
        className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-90"
        onClick={() => setImagenAmpliada(url)}
      />
    ))}
  </div>
)}
```

Agregar el `useState<string | null>` para `imagenAmpliada` y el `<ImageLightbox>` al final del componente (el mismo patrón del §5).

---

## 9. Casos borde

- **Archivo mayor a 5MB** → error claro del endpoint (*"La imagen no puede superar 5MB"*) antes del upload.
- **Formato no soportado** → validación en el `accept` del input del browser + en el endpoint (`ALLOWED_TYPES`). Doble check.
- **Upload falla a mitad** → las URLs ya subidas se quedan en Storage sin referencia desde la DB. Para el piloto es aceptable — las imágenes huérfanas no afectan el funcionamiento. Post-piloto: cleanup periódico de archivos sin referencia.
- **Taller con 10 fotos intenta agregar más** → `maxFiles = 10 - fotosActuales.length` en el `FileUpload`, y el indicador "Máximo 10 archivos alcanzado". El botón desaparece.
- **Pedido sin imágenes** → no se bloquea. Las imágenes son opcionales en todos los contextos. El array `imagenes` queda vacío (`{}`).
- **Cotización sin imágenes** → idem. El taller puede cotizar sin adjuntar fotos.
- **Taller sin portfolio** → placeholder genérico en el directorio. La sección "Mi portfolio" muestra CTA de agregar fotos.
- **URL.createObjectURL memory leak** → `URL.createObjectURL` genera blob URLs que persisten en memoria. Para el piloto con 3-10 archivos es negligible. Post-piloto: agregar cleanup con `URL.revokeObjectURL` en `removeFile` y en el unmount del componente.
- **`portfolioFotos` no está en la allowlist del PUT** → verificar que `PUT /api/talleres/[id]` acepta `portfolioFotos` en el array `fields`. Si no está, Gerardo debe agregarlo.
- **Path de imágenes usa `marcaId` como entityId para pedidos** → porque el pedido no existe aún al momento del upload. Los archivos quedan en `pedido/{marcaId}/{timestamp}.jpg` en Storage. Funcional pero no organizado por pedidoId. Aceptable para piloto.

---

## 10. Criterio de aceptación

- [ ] Migración `contenido_visual_imagenes` aplicada sin errores
- [ ] `POST /api/upload/imagenes` valida ownership antes de aceptar upload (no acepta path libre del cliente)
- [ ] Taller puede subir hasta 10 fotos desde `/taller/perfil` con preview
- [ ] Portfolio visible en `/perfil/[id]` público con lightbox al click
- [ ] Foto destacada del portfolio aparece en tarjetas del directorio
- [ ] Talleres sin portfolio muestran placeholder genérico
- [ ] Marca puede subir hasta 5 imágenes al crear un pedido
- [ ] Campo `montoTotal` eliminado del form de nuevo pedido
- [ ] Campo `descripcion` (textarea) y `procesosRequeridos` (multi-select) presentes en el form
- [ ] Imágenes del pedido visibles como thumbnail en el marketplace y galería en el detalle
- [ ] Taller puede adjuntar hasta 3 fotos al cotizar
- [ ] Marca ve fotos del taller al comparar cotizaciones
- [ ] Todas las `<img>` tienen `loading="lazy"`
- [ ] Click en cualquier imagen de galería abre el lightbox
- [ ] Build de TypeScript pasa sin errores

---

## 11. Tests (verificación manual)

1. **Portfolio del taller**:
   - Login como Carlos Mendoza (ORO) → `/taller/perfil` → click "Agregar fotos"
   - Subir 3 imágenes JPG → verificar preview con thumbnails
   - Guardar → las fotos aparecen en el grid del perfil
   - Click en una foto → lightbox con imagen ampliada → click fuera cierra
   - Hover sobre foto → botón × aparece → click elimina la foto
2. **Directorio con fotos**:
   - Sin login → `/directorio` → la tarjeta de Carlos muestra su primera foto como imagen destacada
   - Roberto (sin portfolio) muestra placeholder con ícono genérico
3. **Perfil público**:
   - `/perfil/[carlos_id]` → sección "Trabajos realizados" con el grid de fotos y lightbox
4. **Crear pedido con imágenes**:
   - Login como Martín (MARCA) → `/marca/pedidos/nuevo`
   - Completar tipo prenda + cantidad + descripción + seleccionar 2 procesos + subir 2 fotos
   - Verificar que el campo "Monto total estimado" **no aparece**
   - Crear pedido → verificar que se crea con las 2 URLs en `imagenes`
5. **Marketplace con thumbnails**:
   - Login como taller → `/taller/pedidos/disponibles` → el pedido con fotos muestra thumbnail
6. **Cotización con fotos**:
   - Login como taller → cotizar un pedido → adjuntar 2 fotos de trabajos similares → enviar
   - Login como marca → ver cotización → las 2 fotos aparecen debajo de la oferta
   - Click en foto → lightbox
7. **Seguridad del upload**:
   - Login como taller A → intentar en consola:
     ```js
     const fd = new FormData()
     fd.append('file', new Blob(['test']), 'test.jpg')
     fd.append('contexto', 'portfolio')
     fd.append('entityId', 'ID_DE_OTRO_TALLER')
     fetch('/api/upload/imagenes', { method: 'POST', body: fd })
     ```
   - Verificar que retorna **403** "Sin acceso a este taller"

---

## 12. Archivos tocados

| Archivo | Cambios | Responsable |
|---|---|---|
| `prisma/schema.prisma` | `imagenes String[]` en Pedido + Cotizacion | Gerardo |
| `src/compartido/lib/storage.ts` | Multi-bucket con parámetro `bucket` | Gerardo |
| `src/app/api/upload/imagenes/route.ts` | **Nuevo**: endpoint seguro con ownership validation | Gerardo |
| `src/compartido/lib/upload-imagen.ts` | **Nuevo**: helper client `uploadImagen(file, contexto, entityId)` | Gerardo |
| `src/compartido/componentes/ui/file-upload.tsx` | `maxFiles` + `showPreviews` + thumbnail previews | Sergio |
| `src/compartido/componentes/ui/image-lightbox.tsx` | **Nuevo**: lightbox con `<dialog>` nativo | Sergio |
| `src/taller/componentes/portfolio-manager.tsx` | **Nuevo**: gestión de portfolio con upload + grid + eliminar | Sergio |
| `src/taller/componentes/galeria-fotos.tsx` | **Nuevo**: grid de fotos con lightbox (reutilizable) | Sergio |
| `src/app/(taller)/taller/perfil/page.tsx` | Sección portfolio con `PortfolioManager` | Sergio |
| `src/app/(public)/perfil/[id]/page.tsx` | Sección "Trabajos realizados" con `GaleriaFotos` | Sergio |
| `src/app/(public)/directorio/page.tsx` | Foto destacada en tarjetas | Sergio |
| `src/app/(marca)/marca/directorio/page.tsx` | Foto destacada en tarjetas | Sergio |
| `src/app/(marca)/marca/pedidos/nuevo/page.tsx` | Server wrapper → client form | Sergio |
| `src/app/(marca)/marca/pedidos/nuevo/nuevo-pedido-form.tsx` | **Nuevo**: form con imágenes + descripción + procesos | Sergio |
| `src/taller/componentes/cotizar-form.tsx` | Agregar `FileUpload` para 3 fotos | Sergio |
| `src/app/(marca)/marca/pedidos/[id]/page.tsx` | Galería del pedido + fotos en cotizaciones + lightbox | Sergio |
| `src/app/(taller)/taller/pedidos/disponibles/page.tsx` | Thumbnail de imagen en tarjetas | Sergio |

**6 archivos nuevos, 11 archivos modificados, 1 migración.**
