# Spec: Auditoría — página de detalle e informe

- **Semana:** 3
- **Asignado a:** Sergio
- **Dependencias:** Ninguna

## 1. Contexto

La página `/admin/auditorias` lista las auditorías con datos reales y funciona correctamente. El link "Cargar informe" apunta a `/admin/auditorias/[id]` que no existe. Este spec crea esa página — permite al inspector ver el detalle de la auditoría y cargar el resultado, hallazgos y acciones correctivas.

## 2. Qué construir

- Página `/admin/auditorias/[id]` — detalle con formulario de informe
- El inspector puede cambiar el estado, cargar hallazgos y resultado
- Acceso: ADMIN y ESTADO

## 3. Datos

- `GET /api/auditorias/[id]` ya existe — retorna auditoría con taller, inspector y acciones
- `PUT /api/auditorias/[id]` ya existe — acepta `estado`, `resultado`, `hallazgos`
- Sin cambios de schema ni APIs

## 4. Prescripciones técnicas

### Archivo nuevo — `src/app/(admin)/admin/auditorias/[id]/page.tsx`

Server component:

```typescript
import { auth } from '@/compartido/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/compartido/lib/prisma'
import { AuditoriaInformeClient } from './informe-client'

export default async function AuditoriaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && role !== 'ESTADO') redirect('/unauthorized')

  const { id } = await params
  const auditoria = await prisma.auditoria.findUnique({
    where: { id },
    include: {
      taller: { select: { nombre: true, ubicacion: true, nivel: true, cuit: true } },
      inspector: { select: { name: true, email: true } },
      acciones: true,
    },
  })
  if (!auditoria) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin/auditorias" className="text-brand-blue hover:underline text-sm">
          ← Volver a auditorías
        </a>
      </div>

      <div>
        <h1 className="text-3xl font-bold font-overpass text-brand-blue">
          Auditoría — {auditoria.taller.nombre}
        </h1>
        <p className="text-gray-500 mt-1">
          {auditoria.tipo.replace(/_/g, ' ')} · {auditoria.fecha
            ? new Date(auditoria.fecha).toLocaleDateString('es-AR')
            : 'Sin fecha'}
        </p>
      </div>

      {/* Datos del taller */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-overpass font-bold text-gray-800 mb-3">Taller auditado</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Nombre:</span> <span className="font-medium">{auditoria.taller.nombre}</span></div>
          <div><span className="text-gray-500">CUIT:</span> <span className="font-medium">{auditoria.taller.cuit}</span></div>
          <div><span className="text-gray-500">Nivel:</span> <span className="font-medium">{auditoria.taller.nivel}</span></div>
          <div><span className="text-gray-500">Ubicación:</span> <span className="font-medium">{auditoria.taller.ubicacion ?? '—'}</span></div>
        </div>
      </div>

      {/* Formulario de informe — client component */}
      <AuditoriaInformeClient
        auditoriaId={auditoria.id}
        estadoInicial={auditoria.estado}
        resultadoInicial={auditoria.resultado}
        hallazgosInicial={auditoria.hallazgos}
        acciones={auditoria.acciones}
      />
    </div>
  )
}
```

### Archivo nuevo — `src/app/(admin)/admin/auditorias/[id]/informe-client.tsx`

Client component con el formulario. Recibe props primitivos/serializables en lugar del objeto completo de Prisma (evita errores de serialización de Date y Json):

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ESTADOS = [
  { value: 'PROGRAMADA', label: 'Programada' },
  { value: 'EN_CURSO', label: 'En curso' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

interface AccionCorrectiva {
  id: string
  descripcion: string
  estado: string
  plazo: string | null
}

interface AuditoriaInformeClientProps {
  auditoriaId: string
  estadoInicial: string
  resultadoInicial: string | null
  hallazgosInicial: unknown
  acciones: AccionCorrectiva[]
}

export function AuditoriaInformeClient({
  auditoriaId,
  estadoInicial,
  resultadoInicial,
  hallazgosInicial,
  acciones,
}: AuditoriaInformeClientProps) {
  const router = useRouter()
  const [estado, setEstado] = useState(estadoInicial)
  const [resultado, setResultado] = useState(resultadoInicial ?? '')
  const [hallazgos, setHallazgos] = useState(
    hallazgosInicial ? JSON.stringify(hallazgosInicial, null, 2) : ''
  )
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGuardar() {
    setGuardando(true)
    setExito(false)
    setError(null)

    // Validar JSON si hay contenido
    let hallazgosParsed = null
    if (hallazgos.trim()) {
      try {
        hallazgosParsed = JSON.parse(hallazgos)
      } catch {
        setError('El JSON de hallazgos no es válido. Verificá el formato.')
        setGuardando(false)
        return
      }
    }

    try {
      const res = await fetch(`/api/auditorias/${auditoriaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado,
          resultado: resultado || null,
          hallazgos: hallazgosParsed,
        }),
      })
      if (res.ok) {
        setExito(true)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Error al guardar el informe')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <h2 className="font-overpass font-bold text-gray-800">Informe de auditoría</h2>

      <div>
        <label className="text-sm font-medium text-gray-700">Estado</label>
        <select value={estado} onChange={e => setEstado(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Resultado</label>
        <textarea value={resultado} onChange={e => setResultado(e.target.value)}
          placeholder="Describí el resultado general de la auditoría..."
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Hallazgos (JSON opcional)</label>
        <textarea value={hallazgos} onChange={e => setHallazgos(e.target.value)}
          placeholder='{"incumplimientos": [], "observaciones": []}'
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono resize-none" />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {exito && (
        <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          Informe guardado correctamente
        </p>
      )}

      <button onClick={handleGuardar} disabled={guardando}
        className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90 disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Guardar informe'}
      </button>

      {/* Acciones correctivas existentes (read-only) */}
      {acciones.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-medium text-gray-700 mb-2">Acciones correctivas</h3>
          <div className="space-y-2">
            {acciones.map(accion => (
              <div key={accion.id} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                <span className="font-medium">{accion.estado}</span> — {accion.descripcion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

## 5. Casos borde

- Auditoría no encontrada → `notFound()` — muestra página 404
- Usuario sin rol ADMIN/ESTADO → redirect a `/unauthorized`
- JSON inválido en hallazgos → try/catch con mensaje de error inline antes de llamar la API
- Auditoría COMPLETADA → el formulario sigue editable (el admin puede corregir)
- Error de red al guardar → mensaje de error genérico

## 6. Criterio de aceptación

- [ ] `/admin/auditorias/[id]` carga con datos reales del taller e inspector
- [ ] El formulario permite cambiar estado, resultado y hallazgos
- [ ] Guardar llama `PUT /api/auditorias/[id]` y muestra confirmación
- [ ] Link "Cargar informe" desde el listado funciona
- [ ] JSON inválido en hallazgos muestra error inline sin llamar la API
- [ ] Usuario sin ADMIN/ESTADO ve `/unauthorized`
- [ ] Build pasa sin errores

## 7. Tests (verificación manual)

1. Ir a `/admin/auditorias` → click en "Cargar informe" → verificar que carga la página de detalle
2. Cambiar estado a EN_CURSO → guardar → verificar cambio en Supabase
3. Cargar resultado → guardar → verificar feedback de éxito
4. Intentar JSON inválido en hallazgos → verificar error inline
