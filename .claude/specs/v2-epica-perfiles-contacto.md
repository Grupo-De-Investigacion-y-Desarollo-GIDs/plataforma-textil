# Spec: Épica Perfiles y Contacto

**Versión:** v2
**Asignado a:** Gerardo (backend) + Sergio (UI)
**Prioridad:** P1
**Resuelve:** H-10, H-11, H-12, H-13 + fix de seguridad `puntaje` en allowlist
**Sin cambios de schema — 0 migraciones**

---

## 1. Contexto

Cuatro hallazgos relacionados:

- **H-10 / H-11**: el nombre del responsable (`user.name`) está en las queries del admin de talleres y marcas pero **nunca se renderiza**. El admin no sabe quién está detrás de cada empresa. Email y teléfono están enterrados en una línea de metadata sin label ni link clickeable.
- **H-12 / H-13**: el botón "Editar" en `/taller/perfil` apunta al wizard de 14 pasos (`/taller/perfil/completar`). El wizard **no edita datos básicos** (nombre, ubicación, descripción, teléfono). El taller no tiene forma de actualizar esa información.

**Buena noticia del relevamiento**: el endpoint `PUT /api/talleres/[id]` (líneas 53-60) **ya acepta** `nombre`, `ubicacion`, `zona`, `descripcion` y `fundado` en su allowlist. Solo falta una UI que los envíe, y ampliar el endpoint para `user.name` y `user.phone`.

**Fix de seguridad colateral**: el campo `puntaje` está en la allowlist del endpoint (línea 59). Cualquier taller puede auto-asignarse puntaje con un `fetch` directo al endpoint, bypaseando `nivel.ts` por completo. Se elimina de la allowlist — el puntaje lo calcula exclusivamente `aplicarNivel`.

---

## 2. Cambios de backend — Gerardo

**Archivo:** `src/app/api/talleres/[id]/route.ts`

### Cambio 1 — Eliminar `'puntaje'` de la allowlist

Buscar el array `fields` (línea ~53-60):

```ts
// ANTES:
const fields = [
  'nombre', 'ubicacion', 'zona', 'descripcion',
  'capacidadMensual', 'trabajadoresRegistrados', 'fundado',
  // Wizard fields
  'sam', 'prendaPrincipal', 'organizacion', 'metrosCuadrados',
  'areas', 'experienciaPromedio', 'polivalencia', 'horario',
  'registroProduccion', 'escalabilidad', 'paradasFrecuencia', 'puntaje',
]

// DESPUÉS — eliminar 'puntaje' del array:
const fields = [
  'nombre', 'ubicacion', 'zona', 'descripcion',
  'capacidadMensual', 'trabajadoresRegistrados', 'fundado',
  'sam', 'prendaPrincipal', 'organizacion', 'metrosCuadrados',
  'areas', 'experienciaPromedio', 'polivalencia', 'horario',
  'registroProduccion', 'escalabilidad', 'paradasFrecuencia',
]
```

> El puntaje lo calcula exclusivamente `aplicarNivel` en `nivel.ts`. Nunca debe poder setearse desde un request del cliente.

### Cambio 2 — Envolver TODO en `$transaction` + agregar edición de `user.name` y `user.phone`

El endpoint actual tiene 4 bloques de mutaciones **separados sin transacción** (maquinaria, procesos, prendas, taller.update). Si uno falla después de que otro commitó, quedan inconsistencias. Este spec envuelve todo en una transacción atómica y agrega el update del user:

Reemplazar el bloque desde la línea ~66 hasta la línea ~110 (las 4 operaciones + el update final) por:

```ts
// Construir data del taller (allowlist — sin cambios)
const data: Record<string, unknown> = {}
const fields = [/* ... array sin 'puntaje' ... */]
for (const f of fields) {
  if (body[f] !== undefined) data[f] = body[f]
}

// Todo en una transacción atómica — si cualquier paso falla, rollback completo
await prisma.$transaction(async (tx) => {
  // Maquinaria: replace all if provided
  if (Array.isArray(body.maquinaria)) {
    await tx.maquinaria.deleteMany({ where: { tallerId: id } })
    if (body.maquinaria.length > 0) {
      await tx.maquinaria.createMany({
        data: body.maquinaria.map((m: { nombre: string; cantidad?: number; tipo?: string }) => ({
          tallerId: id,
          nombre: m.nombre,
          cantidad: m.cantidad ?? 1,
          tipo: m.tipo,
        })),
      })
    }
  }

  // Procesos: replace all if provided
  if (Array.isArray(body.procesosIds)) {
    await tx.tallerProceso.deleteMany({ where: { tallerId: id } })
    if (body.procesosIds.length > 0) {
      await tx.tallerProceso.createMany({
        data: body.procesosIds.map((procesoId: string) => ({ tallerId: id, procesoId })),
        skipDuplicates: true,
      })
    }
  }

  // Prendas: replace all if provided
  if (Array.isArray(body.prendasIds)) {
    await tx.tallerPrenda.deleteMany({ where: { tallerId: id } })
    if (body.prendasIds.length > 0) {
      await tx.tallerPrenda.createMany({
        data: body.prendasIds.map((prendaId: string) => ({ tallerId: id, prendaId })),
        skipDuplicates: true,
      })
    }
  }

  // Taller update (mantener el nombre existente de la variable: data)
  await tx.taller.update({ where: { id }, data })

  // User update — NUEVO: solo name y phone, con validación de tipo
  if (body.user && typeof body.user === 'object') {
    const userData: Record<string, unknown> = {}
    if (typeof body.user.name === 'string') {
      userData.name = body.user.name.trim() || null
    }
    if (typeof body.user.phone === 'string') {
      userData.phone = body.user.phone.trim() || null
    }
    // NO permitir: email (requiere verificación), role, active
    if (Object.keys(userData).length > 0) {
      await tx.user.update({
        where: { id: existing.userId },
        data: userData,
      })
    }
  }
})

// Re-fetch con includes para el response (fuera del transaction, solo lectura)
const taller = await prisma.taller.findUnique({
  where: { id },
  include: {
    maquinaria: true,
    procesos: { include: { proceso: true } },
    prendas: { include: { prenda: true } },
  },
})

return NextResponse.json(taller)
```

> **Nota sobre la variable `data`**: se mantiene el nombre existente (`data`) de la línea 52 del código actual. No se renombra a `tallerData` — menos diff, menos confusión.

> **Nota sobre `typeof === 'string'`**: protege contra `body.user.name = null` o `body.user.name = 123`. El trim convierte `"  "` (solo espacios) a `""`, y el `|| null` lo normaliza a `null` en DB — esto evita guardar strings vacíos de whitespace como nombres válidos.

> **Nota sobre `user.email`**: se ignora silenciosamente aunque se envíe — el código solo verifica `body.user.name` y `body.user.phone`. Cambiar el email de login requiere un flow separado de verificación, fuera de alcance.

---

## 3. Cambios de UI — Sergio

### ⚠️ Antes de arrancar

- [ ] Cambio 1 y 2 del backend (Gerardo) mergeados y deployados
- [ ] Verificar que `PUT /api/talleres/[id]` con `{ user: { name: 'Test' } }` devuelve 200 y actualiza el nombre en DB

### UI-1 — Crear página de edición básica del taller

**Dos archivos** — patrón server component + client form:

#### Archivo 1: `src/app/(taller)/taller/perfil/editar/page.tsx` (server component)

Carga los datos del taller con Prisma y pasa como props al form client:

```tsx
export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { EditarPerfilForm } from './editar-form'

export default async function EditarPerfilPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    include: {
      user: { select: { email: true, name: true, phone: true } },
    },
  })

  if (!taller) redirect('/taller/perfil/completar')

  return <EditarPerfilForm taller={taller} />
}
```

#### Archivo 2: `src/app/(taller)/taller/perfil/editar/editar-form.tsx` (client component)

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/compartido/componentes/ui/button'
import Link from 'next/link'

interface Props {
  taller: {
    id: string
    nombre: string
    ubicacion: string | null
    zona: string | null
    descripcion: string | null
    fundado: number | null
    user: {
      email: string
      name: string | null
      phone: string | null
    }
  }
}

export function EditarPerfilForm({ taller }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Controlled inputs
  const [nombre, setNombre] = useState(taller.nombre)
  const [ubicacion, setUbicacion] = useState(taller.ubicacion ?? '')
  const [zona, setZona] = useState(taller.zona ?? '')
  const [descripcion, setDescripcion] = useState(taller.descripcion ?? '')
  const [fundado, setFundado] = useState(taller.fundado?.toString() ?? '')
  const [userName, setUserName] = useState(taller.user.name ?? '')
  const [userPhone, setUserPhone] = useState(taller.user.phone ?? '')

  async function handleGuardar() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/talleres/${taller.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          ubicacion: ubicacion || null,
          zona: zona || null,
          descripcion: descripcion || null,
          fundado: fundado ? parseInt(fundado) : null,
          user: {
            name: userName,
            phone: userPhone,
          },
        }),
      })
      if (res.ok) {
        router.push('/taller/perfil')
      } else {
        const data = await res.json()
        setError(data.error ?? 'Error al guardar los cambios')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/taller/perfil" className="text-brand-blue hover:underline text-sm">
          ← Volver al perfil
        </Link>
      </div>
      <h1 className="text-2xl font-bold font-overpass text-brand-blue">Editar datos básicos</h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Sección: Datos de la empresa */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-overpass font-bold text-gray-800">Datos de la empresa</h2>
        <div>
          <label className="text-sm font-medium text-gray-700">Nombre del taller</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Ubicación</label>
          <input
            value={ubicacion}
            onChange={e => setUbicacion(e.target.value)}
            placeholder="Ej: Av. Corrientes 1234, CABA"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Zona / Barrio</label>
          <input
            value={zona}
            onChange={e => setZona(e.target.value)}
            placeholder="Ej: La Matanza, Zona Oeste"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Descripción del taller</label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Contá brevemente qué hace tu taller, en qué se especializa..."
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Año de fundación</label>
          <input
            type="number"
            value={fundado}
            onChange={e => setFundado(e.target.value)}
            placeholder="Ej: 2015"
            min={1900}
            max={new Date().getFullYear()}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Sección: Datos del responsable */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-overpass font-bold text-gray-800">Datos del responsable</h2>
        <div>
          <label className="text-sm font-medium text-gray-700">Nombre completo</label>
          <input
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Nombre y apellido del responsable"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Teléfono de contacto</label>
          <input
            value={userPhone}
            onChange={e => setUserPhone(e.target.value)}
            placeholder="Ej: +54 11 1234-5678"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            value={taller.user.email}
            disabled
            className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            El email es tu credencial de login. Para cambiarlo escribí a soporte.
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <Link
          href="/taller/perfil"
          className="flex-1 text-center border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50"
        >
          Cancelar
        </Link>
        <button
          onClick={handleGuardar}
          disabled={saving || !nombre.trim()}
          className="flex-1 bg-brand-blue text-white px-4 py-2.5 rounded-lg text-sm hover:bg-brand-blue/90 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
```

> **Patrón**: server component + client form. Es el mismo que usan `academia-cliente.tsx`, `notificaciones-client.tsx` y `invitar-a-cotizar.tsx`. El server component hace el Prisma query (con auth check), el client component maneja el state y el submit.

> **Validación mínima**: `nombre` es requerido (`disabled={!nombre.trim()}`). El resto es opcional — se manda como `null` si vacío.

### UI-2 — Actualizar `/taller/perfil/page.tsx` para separar los dos botones

**Archivo:** `src/app/(taller)/taller/perfil/page.tsx`

Reemplazar el botón único "Editar" (líneas 69-71):

```tsx
// ANTES:
<Link href="/taller/perfil/completar">
  <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />}>Editar</Button>
</Link>

// DESPUÉS:
<div className="flex gap-2">
  <Link href="/taller/perfil/editar">
    <Button variant="secondary" size="sm">Editar datos básicos</Button>
  </Link>
  <Link href="/taller/perfil/completar">
    <Button variant="outline" size="sm">Perfil productivo</Button>
  </Link>
</div>
```

El ícono `Edit` ya está importado en el archivo — se puede mantener en uno de los dos botones o quitar, a criterio de Sergio.

### UI-3 — Sección "Responsable / Contacto" en `/admin/talleres/[id]`

**Archivo:** `src/app/(admin)/admin/talleres/[id]/page.tsx`

#### Cambio 3.1 — Agregar `AlertTriangle` y `Calendar` al import de lucide-react

```ts
// ANTES (línea 13):
import { ArrowLeft, MapPin, Mail, Phone } from 'lucide-react'

// DESPUÉS:
import { ArrowLeft, MapPin, Mail, Phone, AlertTriangle, Calendar } from 'lucide-react'
```

#### Cambio 3.2 — Agregar `createdAt` al select de user en la query

```ts
// ANTES (línea 38):
user: { select: { email: true, phone: true, name: true, active: true } },

// DESPUÉS:
user: { select: { email: true, phone: true, name: true, active: true, createdAt: true } },
```

#### Cambio 3.3 — Agregar Card "Responsable / Contacto" después del header

Insertar después del cierre de la Card del header (línea ~158) y antes de los tabs (línea ~160):

```tsx
{/* Sección Responsable / Contacto — prominente, antes de los tabs */}
<Card title="Responsable / Contacto" className="mb-6">
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <p className="text-gray-500">Responsable</p>
      <p className="font-medium text-gray-800">
        {taller.user.name ?? (
          <span className="text-gray-400 italic">Sin nombre registrado</span>
        )}
      </p>
    </div>
    <div>
      <p className="text-gray-500">Fecha de registro</p>
      <p className="font-medium text-gray-800">
        {new Date(taller.user.createdAt).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </p>
    </div>
    <div>
      <p className="text-gray-500">Email</p>
      <a
        href={`mailto:${taller.user.email}`}
        className="text-brand-blue hover:underline font-medium"
      >
        {taller.user.email}
      </a>
    </div>
    <div>
      <p className="text-gray-500">Teléfono</p>
      {taller.user.phone ? (
        <a
          href={`tel:${taller.user.phone}`}
          className="text-brand-blue hover:underline font-medium"
        >
          {taller.user.phone}
        </a>
      ) : (
        <span className="text-gray-400 italic">Sin teléfono</span>
      )}
    </div>
  </div>

  {/* Badge de datos incompletos */}
  {(!taller.user.name || !taller.user.phone || !taller.ubicacion) && (
    <div className="mt-3 flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg">
      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
      Datos de contacto incompletos — el taller puede completarlos desde su perfil
    </div>
  )}
</Card>
```

> Los campos de email y teléfono que antes estaban en la línea de metadata del header **se mantienen ahí** también (no hay que borrarlos) — sirven como reference rápida sin scrollear. La Card es la versión prominente y completa.

### UI-4 — Sección "Responsable / Contacto" en `/admin/marcas/[id]`

**Archivo:** `src/app/(admin)/admin/marcas/[id]/page.tsx`

#### Cambio 4.1 — Agregar `AlertTriangle` al import

```ts
// ANTES (línea 11):
import { ArrowLeft, MapPin, Mail, Phone, Globe, Calendar } from 'lucide-react'

// DESPUÉS:
import { ArrowLeft, MapPin, Mail, Phone, Globe, Calendar, AlertTriangle } from 'lucide-react'
```

#### Cambio 4.2 — La query de marcas ya tiene `createdAt` en el select de user

```ts
user: { select: { email: true, phone: true, name: true, active: true, createdAt: true } }
```

**No hay que modificar la query** — ya trae `createdAt`. Solo agregar la Card al JSX.

#### Cambio 4.3 — Agregar Card "Responsable / Contacto" después del header

Insertar después del cierre de la Card del header (línea ~134) y antes de los Stats (línea ~136):

```tsx
<Card title="Responsable / Contacto" className="mb-6">
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <p className="text-gray-500">Responsable</p>
      <p className="font-medium text-gray-800">
        {marca.user.name ?? (
          <span className="text-gray-400 italic">Sin nombre registrado</span>
        )}
      </p>
    </div>
    <div>
      <p className="text-gray-500">Fecha de registro</p>
      <p className="font-medium text-gray-800">
        {new Date(marca.user.createdAt).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </p>
    </div>
    <div>
      <p className="text-gray-500">Email</p>
      <a
        href={`mailto:${marca.user.email}`}
        className="text-brand-blue hover:underline font-medium"
      >
        {marca.user.email}
      </a>
    </div>
    <div>
      <p className="text-gray-500">Teléfono</p>
      {marca.user.phone ? (
        <a
          href={`tel:${marca.user.phone}`}
          className="text-brand-blue hover:underline font-medium"
        >
          {marca.user.phone}
        </a>
      ) : (
        <span className="text-gray-400 italic">Sin teléfono</span>
      )}
    </div>

    {/* Website — incluir en la Card de Contacto, es otra forma de contacto */}
    {marca.website && (
      <div>
        <p className="text-gray-500">Website</p>
        <a
          href={marca.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-blue hover:underline font-medium inline-flex items-center gap-1"
        >
          <Globe className="w-3.5 h-3.5" />
          {marca.website.replace(/^https?:\/\//, '')}
        </a>
      </div>
    )}
  </div>

  {(!marca.user.name || !marca.user.phone) && (
    <div className="mt-3 flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg">
      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
      Datos de contacto incompletos
    </div>
  )}
</Card>
```

> **Decisión de scope**: `website` va en la Card de Contacto (es otra forma de contactar a la marca). Los campos `tipo`, `frecuenciaCompra` y `volumenMensual` **NO** van en la Card — son metadata de la marca que ya se muestran como badges en el header y stats. No tocarlos.

---

## 4. Nota sobre edición de perfil de marca

La edición básica del perfil de marca (equivalente a `/taller/perfil/editar` para marcas) **está fuera del alcance de este spec**. Si `/marca/perfil` tiene el mismo bug H-12/H-13 (botón editar apunta a un wizard o no existe), crear `v2-marca-edicion-basica` como spec separado post-piloto.

Este spec se enfoca en la experiencia del **taller** (el actor principal del piloto) y en la visibilidad del **admin** (que necesita datos de contacto de ambos roles).

---

## 5. Casos borde

- **Email read-only**: se muestra en el form pero disabled. Si alguien manda `body.user.email` al endpoint, se ignora silenciosamente (el código solo verifica `name` y `phone`).
- **CUIT inmutable**: no aparece en el form de edición. Si alguien manda `body.cuit`, la allowlist no lo incluye — se ignora.
- **`user.name` vacío**: en el admin muestra *"Sin nombre registrado"* en itálica gris. En el form, se envía como string vacío → `trim() || null` → `null` en DB.
- **`user.phone` vacío**: en el admin muestra *"Sin teléfono"* sin link `tel:`.
- **`fundado` con año futuro**: el input tiene `max={new Date().getFullYear()}`. El navegador valida client-side. El backend no valida, pero la allowlist lo acepta como `Int?` — si viene `2099` se guarda. Aceptable para piloto.
- **Transaction falla**: si `tx.user.update` rompe, **todo rollbackea** (incluidas maquinaria, procesos, prendas si fueron enviadas). El cliente recibe 500 y no queda nada a medias.
- **`body.user = null`**: el check `body.user && typeof body.user === 'object'` evalúa `null && ...` → falsy. No entra al if. Sin error.
- **`body.user = { name: 123 }`**: `typeof 123 !== 'string'` → se ignora. Sin error. Solo strings se aceptan.
- **Badge "Datos incompletos"** en el admin: aparece si falta `user.name` O `user.phone` O `taller.ubicacion`. Es un incentivo pasivo, no bloquea nada.

---

## 6. Criterio de aceptación

- [ ] El botón "Editar" en `/taller/perfil` se reemplaza por dos: "Editar datos básicos" y "Perfil productivo"
- [ ] `/taller/perfil/editar` carga con los datos actuales del taller y del responsable
- [ ] El form permite cambiar: nombre del taller, ubicación, zona, descripción, año de fundación, nombre del responsable, teléfono
- [ ] El email es read-only en el form con nota explicativa
- [ ] "Guardar cambios" actualiza correctamente Taller + User en la DB (en una transacción atómica)
- [ ] `/admin/talleres/[id]` muestra Card "Responsable / Contacto" con nombre del responsable, email clickeable (`mailto:`), teléfono clickeable (`tel:`), fecha de registro
- [ ] `/admin/marcas/[id]` muestra la misma Card con los mismos datos + website clickeable si existe
- [ ] Badge "Datos de contacto incompletos" aparece cuando faltan `user.name`, `user.phone` o `taller.ubicacion`
- [ ] El campo `puntaje` ya no está en la allowlist del endpoint `PUT /api/talleres/[id]`
- [ ] `PUT /api/talleres/[id]` con `{ puntaje: 100 }` devuelve 200 pero el puntaje **no cambia** en DB
- [ ] Build de TypeScript pasa sin errores

---

## 7. Tests (verificación manual)

1. **Split de botones**:
   - Login como Roberto Giménez (TALLER BRONCE) → `/taller/perfil`
   - Verificar que hay 2 botones: "Editar datos básicos" y "Perfil productivo"
   - Click en "Perfil productivo" → lleva al wizard (sin cambios)
2. **Form de edición básica**:
   - Click en "Editar datos básicos" → `/taller/perfil/editar`
   - Cambiar nombre del taller, ubicación, zona, descripción, nombre del responsable y teléfono
   - Click "Guardar cambios" → redirige a `/taller/perfil`
   - Verificar que los cambios se reflejan en la página del perfil
3. **Datos del responsable en admin talleres**:
   - Login como Lucía Fernández (ADMIN) → `/admin/talleres/[roberto_id]`
   - Verificar Card "Responsable / Contacto" con nombre del responsable, email (clickeable), teléfono, fecha de registro
   - Click en email → abre cliente de correo con `mailto:`
   - Click en teléfono → abre dialer con `tel:`
4. **Datos del responsable en admin marcas**:
   - Ir a `/admin/marcas/[martin_id]`
   - Verificar la misma Card con datos de Martín Echevarría + website clickeable
5. **Badge de datos incompletos**:
   - En DB, poner `user.name = null` para un taller
   - Recargar `/admin/talleres/[id]` → verificar badge amarillo "Datos de contacto incompletos"
6. **Fix de seguridad del puntaje**:
   - Login como taller → en consola del browser:
     ```js
     fetch('/api/talleres/<mi_id>', {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ puntaje: 999 }),
     }).then(r => r.json()).then(console.log)
     ```
   - El endpoint retorna 200 (la request no falla) pero verificar en DB que el puntaje **no cambió**

---

## 8. Archivos tocados

| Archivo | Cambios | Responsable |
|---|---|---|
| `src/app/api/talleres/[id]/route.ts` | Quitar `puntaje` de allowlist, envolver todo en `$transaction`, agregar `body.user` handling | Gerardo |
| `src/app/(taller)/taller/perfil/editar/page.tsx` | **Nuevo**: server component wrapper | Sergio |
| `src/app/(taller)/taller/perfil/editar/editar-form.tsx` | **Nuevo**: client form con controlled inputs | Sergio |
| `src/app/(taller)/taller/perfil/page.tsx` | Split botón "Editar" en 2 | Sergio |
| `src/app/(admin)/admin/talleres/[id]/page.tsx` | Card "Responsable / Contacto" + imports + `createdAt` en select | Sergio |
| `src/app/(admin)/admin/marcas/[id]/page.tsx` | Card "Responsable / Contacto" con website + import `AlertTriangle` | Sergio |

**2 archivos nuevos, 4 archivos modificados, 0 migraciones.**
