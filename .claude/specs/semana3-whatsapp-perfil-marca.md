# Spec: WhatsApp con contexto + perfil mínimo marca

- **Semana:** 3
- **Asignado a:** Sergio
- **Dependencias:** Ninguna

## 1. Contexto

El botón "Contactar por WhatsApp" en el perfil del taller existe pero es decorativo — no tiene href ni lógica. Además la marca puede no tener tipo, ubicación ni volumen completados. La decisión de diseño dice que antes de contactar un taller, la marca debe tener esos 3 campos. Este spec implementa ambas cosas: el modal de perfil mínimo y el link de WhatsApp funcional.

## 2. Qué construir

- Modal "Completá tu perfil" que aparece cuando la marca intenta contactar sin tener tipo/ubicación/volumen
- Link de WhatsApp funcional con contexto pre-cargado
- Actualizar la query de `/marca/directorio/[id]` para traer el teléfono del taller

## 3. Datos

- Campos a completar: `marca.tipo`, `marca.ubicacion`, `marca.volumenMensual`
- El teléfono del taller está en `taller.user.phone`
- La API `PUT /api/marcas/[id]` ya existe y acepta `tipo`, `ubicacion`, `volumenMensual`
- El link de WhatsApp sigue el patrón: `https://wa.me/{phone}?text={mensaje}`

## 4. Prescripciones técnicas

### Archivo nuevo — `src/marca/componentes/contactar-taller.tsx`

Client component que maneja toda la lógica:

```typescript
'use client'
import { useState } from 'react'
import { Modal } from '@/compartido/componentes/ui/modal'
import { MessageCircle } from 'lucide-react'

interface ContactarTallerProps {
  taller: {
    id: string
    nombre: string
    nivel: string
    phone: string | null
  }
  marca: {
    id: string
    tipo: string | null
    ubicacion: string | null
    volumenMensual: number
  }
}

export function ContactarTaller({ taller, marca }: ContactarTallerProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipo, setTipo] = useState(marca.tipo ?? '')
  const [ubicacion, setUbicacion] = useState(marca.ubicacion ?? '')
  const [volumen, setVolumen] = useState(marca.volumenMensual > 0 ? String(marca.volumenMensual) : '')
  const [guardando, setGuardando] = useState(false)

  // Verificar si el perfil mínimo está completo
  const perfilCompleto = !!marca.tipo && !!marca.ubicacion && marca.volumenMensual > 0

  function handleContactar() {
    if (!perfilCompleto) {
      setModalAbierto(true)
      return
    }
    abrirWhatsApp()
  }

  function abrirWhatsApp() {
    if (!taller.phone) {
      alert('Este taller no tiene teléfono registrado. Intentá contactarlo por otro medio.')
      return
    }
    const phoneClean = taller.phone.replace(/\D/g, '')
    const mensaje = encodeURIComponent(
      `Hola ${taller.nombre}, te contacto desde la Plataforma Digital Textil (PDT). ` +
      `Soy una marca de indumentaria y me interesa trabajar con tu taller.`
    )
    window.open(`https://wa.me/${phoneClean}?text=${mensaje}`, '_blank')
  }

  async function handleGuardarPerfil() {
    if (!tipo || !ubicacion || !volumen) return
    setGuardando(true)
    const res = await fetch(`/api/marcas/${marca.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo,
        ubicacion,
        volumenMensual: parseInt(volumen),
      }),
    })
    setGuardando(false)
    if (res.ok) {
      setModalAbierto(false)
      abrirWhatsApp()
    }
  }

  return (
    <>
      <button
        onClick={handleContactar}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
      >
        <MessageCircle className="w-4 h-4" />
        Contactar por WhatsApp
      </button>

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Completá tu perfil para contactar"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Para que el taller sepa quién los contacta, necesitamos algunos datos de tu marca.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo de marca</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccioná...</option>
              <option value="Diseño independiente">Diseño independiente</option>
              <option value="Marca comercial">Marca comercial</option>
              <option value="Indumentaria deportiva">Indumentaria deportiva</option>
              <option value="Ropa de trabajo">Ropa de trabajo</option>
              <option value="Moda infantil">Moda infantil</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Ubicación</label>
            <input type="text" value={ubicacion} onChange={e => setUbicacion(e.target.value)}
              placeholder="Ej: Palermo, CABA"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Volumen mensual aproximado (unidades)</label>
            <input type="number" value={volumen} onChange={e => setVolumen(e.target.value)}
              placeholder="Ej: 500"
              min="1"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={() => setModalAbierto(false)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleGuardarPerfil}
            disabled={!tipo || !ubicacion || !volumen || guardando}
            className="flex-1 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90 disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Guardar y contactar'}
          </button>
        </div>
      </Modal>
    </>
  )
}
```

### Archivo a modificar — `src/app/(marca)/marca/directorio/[id]/page.tsx`

**Cambio 1 — Agregar imports de `auth`, `redirect` y el componente (al inicio del archivo):**

```typescript
import { auth } from '@/compartido/lib/auth'
import { redirect } from 'next/navigation'
import { ContactarTaller } from '@/marca/componentes/contactar-taller'
```

**Cambio 2 — Agregar `user: { select: { phone: true } }` al include de la query del taller (línea 17):**

```typescript
const taller = await prisma.taller.findUnique({
  where: { id },
  include: {
    user: { select: { phone: true } },  // ← agregar esta línea
    procesos: { include: { proceso: true } },
    prendas: { include: { prenda: true } },
    maquinaria: true,
    certificaciones: { where: { activa: true } },
    certificados: { include: { coleccion: true } },
  },
})
```

**Cambio 3 — Agregar auth guard y query de marca después de obtener el taller (después de la línea `if (!taller) notFound()`):**

```typescript
const session = await auth()
if (!session?.user) redirect('/login')

const marca = await prisma.marca.findFirst({
  where: { userId: session.user.id },
  select: { id: true, tipo: true, ubicacion: true, volumenMensual: true },
})
```

**Cambio 4 — Reemplazar el botón decorativo (línea 49) por el componente:**

```tsx
// Reemplazar:
<Button size="sm" icon={<MessageCircle className="w-4 h-4" />}>Contactar por WhatsApp</Button>

// Por:
{marca && (
  <ContactarTaller
    taller={{
      id: taller.id,
      nombre: taller.nombre,
      nivel: taller.nivel,
      phone: taller.user.phone,
    }}
    marca={marca}
  />
)}
```

**Cambio 5 — Remover imports no usados:** quitar `MessageCircle` del import de lucide-react y `Button` si ya no se usa en la página.

## 5. Casos borde

- Taller sin teléfono registrado → mensaje de alerta "Este taller no tiene teléfono registrado"
- Marca sin perfil completo → modal aparece antes de abrir WhatsApp
- Marca con perfil ya completo → WhatsApp abre directamente sin modal
- Error al guardar el perfil → no abrir WhatsApp, mantener modal abierto
- Usuario no logueado en `/marca/directorio/[id]` → `redirect('/login')`

## 6. Criterio de aceptación

- [ ] Click en "Contactar por WhatsApp" sin perfil completo → abre modal
- [ ] Completar el modal y guardar → abre WhatsApp con mensaje pre-cargado
- [ ] Click en "Contactar por WhatsApp" con perfil completo → abre WhatsApp directamente
- [ ] El mensaje de WhatsApp incluye nombre del taller
- [ ] Taller sin teléfono muestra alerta en lugar de link roto
- [ ] Build pasa sin errores

## 7. Tests (verificación manual)

1. Loguearse como marca sin tipo/ubicación/volumen → ir a perfil de un taller → click "Contactar" → verificar que abre el modal
2. Completar el modal → verificar que se guarda en DB y abre WhatsApp
3. Loguearse como marca con perfil completo → click "Contactar" → verificar que abre WhatsApp directamente
4. Verificar el mensaje pre-cargado en WhatsApp incluye el nombre del taller
