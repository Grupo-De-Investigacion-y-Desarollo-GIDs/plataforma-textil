# Spec: UI denuncia pública

- **Semana:** 3
- **Asignado a:** Sergio
- **Dependencias:** Ninguna

## 1. Contexto

La API de denuncias existe y funciona pero no hay UI pública para que un trabajador denuncie. El denunciante tampoco puede consultar qué pasó con su denuncia. Hay que crear dos páginas públicas siguiendo el mismo patrón que `/verificar`.

## 2. Qué construir

- `/denunciar` — formulario público para enviar una denuncia anónima
- `/consultar-denuncia` — consulta el estado de una denuncia por código
- Link a ambas páginas desde `/ayuda`

## 3. Datos

- `POST /api/denuncias` acepta: `tipo`, `tallerId` (opcional), `descripcion`, `anonima`
- `GET /api/denuncias/[codigo]` retorna: `codigo`, `tipo`, `estado`, `createdAt`, `anonima`
- Sin autenticación — páginas completamente públicas
- Enum `EstadoDenuncia`: `RECIBIDA`, `EN_INVESTIGACION`, `RESUELTA`, `DESESTIMADA`
- Tipos de denuncia: definidos como constante en el componente (no están en el schema)

## 4. Prescripciones técnicas

### Archivo nuevo — `src/app/(public)/denunciar/page.tsx`

Client component **sin** `min-h-screen` ni `flex justify-center` — el layout `(public)` ya provee header y padding. Usar el mismo patrón de layout que `/verificar`: `text-center mb-8` para encabezado + `max-w-md mx-auto` para el form.

```typescript
'use client'
import { useState } from 'react'
import { Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/compartido/componentes/ui/button'
import { Card } from '@/compartido/componentes/ui/card'

const TIPOS_DENUNCIA = [
  'Trabajo no registrado',
  'Trabajo infantil',
  'Condiciones insalubres',
  'No pago de salarios',
  'Acoso laboral',
  'Incumplimiento de normas de seguridad',
  'Otro',
]

export default function DenunciarPage() {
  const [tipo, setTipo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{ codigo: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleEnviar() {
    if (!tipo || !descripcion || descripcion.length < 20) {
      setError('Completá el tipo y la descripción (mínimo 20 caracteres)')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch('/api/denuncias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, descripcion, anonima: true }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      const data = await res.json()
      setResultado({ codigo: data.codigo })
    } catch {
      setError('Ocurrió un error al enviar la denuncia. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (resultado) {
    return (
      <div>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-overpass font-bold text-3xl text-green-700 mb-2">Denuncia recibida</h1>
          <p className="text-gray-600">Tu denuncia fue registrada de forma anónima.</p>
        </div>
        <Card className="max-w-md mx-auto">
          <p className="text-sm text-gray-600 mb-3">
            Guardá este código para consultar el estado de tu denuncia:
          </p>
          <div className="bg-brand-blue/10 rounded-lg px-4 py-3 text-center">
            <p className="text-xl font-bold font-overpass text-brand-blue">{resultado.codigo}</p>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Podés consultar el estado en{' '}
            <a href="/consultar-denuncia" className="text-brand-blue underline">
              consultar-denuncia
            </a>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-brand-blue" />
        </div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">Hacer una denuncia</h1>
        <p className="text-gray-600">Tu denuncia es anónima. Nadie sabrá quién la realizó.</p>
      </div>

      <Card className="max-w-md mx-auto">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo de situación</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccioná el tipo...</option>
              {TIPOS_DENUNCIA.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Describí la situación con el mayor detalle posible..."
              rows={5}
              maxLength={500}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            <p className="text-xs text-gray-400 mt-1">{descripcion.length}/500 caracteres — mínimo 20</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button onClick={handleEnviar} disabled={enviando} className="w-full">
            {enviando ? 'Enviando...' : 'Enviar denuncia de forma anónima'}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            Esta denuncia será revisada por el equipo de la Plataforma Digital Textil y los organismos competentes.
          </p>
        </div>
      </Card>
    </div>
  )
}
```

### Archivo nuevo — `src/app/(public)/consultar-denuncia/page.tsx`

Seguir **exactamente** el patrón de `/verificar/page.tsx`: client component interno + `Suspense` wrapper + `useSearchParams` para `?codigo=`.

```typescript
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Shield, XCircle } from 'lucide-react'
import { Button, Input, Card } from '@/compartido/componentes/ui'

const estadoLabel: Record<string, string> = {
  RECIBIDA: 'Recibida — en espera de revisión',
  EN_INVESTIGACION: 'En investigación',
  RESUELTA: 'Resuelta',
  DESESTIMADA: 'Desestimada',
}

const estadoColor: Record<string, string> = {
  RECIBIDA: 'text-yellow-700',
  EN_INVESTIGACION: 'text-blue-700',
  RESUELTA: 'text-green-700',
  DESESTIMADA: 'text-gray-500',
}

interface DenunciaResult {
  codigo: string
  tipo: string
  estado: string
  createdAt: string
  anonima: boolean
}

function ConsultarContent() {
  const searchParams = useSearchParams()
  const [codigo, setCodigo] = useState(searchParams.get('codigo') ?? '')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<DenunciaResult | null>(null)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [buscado, setBuscado] = useState(false)

  useEffect(() => {
    const code = searchParams.get('codigo')
    if (code) buscar(code)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function buscar(valor: string) {
    if (!valor.trim()) return
    setLoading(true)
    setResultado(null)
    setNoEncontrado(false)
    try {
      const res = await fetch(`/api/denuncias/${encodeURIComponent(valor.trim())}`)
      if (res.ok) setResultado(await res.json())
      else setNoEncontrado(true)
    } catch {
      setNoEncontrado(true)
    } finally {
      setLoading(false)
      setBuscado(true)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await buscar(codigo)
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-brand-blue" />
        </div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">Consultar denuncia</h1>
        <p className="text-gray-600">Ingresá el código de tu denuncia para ver su estado.</p>
      </div>

      <Card className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: DEN-2026-00001"
              label="Código de denuncia"
            />
          </div>
          <div className="sm:self-end">
            <Button type="submit" loading={loading} icon={<Search className="w-4 h-4" />}>
              Consultar
            </Button>
          </div>
        </form>
      </Card>

      {/* Denuncia encontrada */}
      {buscado && resultado && (
        <Card className="max-w-xl mx-auto mt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-brand-blue" />
            </div>
            <div className="flex-1">
              <h2 className="font-overpass font-bold text-lg text-brand-blue mb-1">
                Denuncia encontrada
              </h2>
              <div className="space-y-2 text-sm mt-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Código</span>
                  <span className="font-semibold text-brand-blue">{resultado.codigo}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Tipo</span>
                  <span className="font-semibold text-gray-900">{resultado.tipo}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Estado</span>
                  <span className={`font-semibold ${estadoColor[resultado.estado] ?? 'text-gray-900'}`}>
                    {estadoLabel[resultado.estado] ?? resultado.estado}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Fecha de recepción</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(resultado.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* No encontrada */}
      {buscado && noEncontrado && (
        <Card className="max-w-xl mx-auto mt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="font-overpass font-bold text-lg text-red-700 mb-1">
                Denuncia no encontrada
              </h2>
              <p className="text-sm text-gray-500">
                No se encontró ninguna denuncia con ese código. Verificá que sea correcto e intentá de nuevo.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function ConsultarDenunciaPage() {
  return (
    <Suspense>
      <ConsultarContent />
    </Suspense>
  )
}
```

### Archivo a modificar — `src/app/(public)/ayuda/page.tsx`

Agregar sección de denuncias al final del JSX, antes del cierre `</div>` principal (después de la sección "Contacto", línea 80):

```tsx
<section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
  <h2 className="font-overpass font-bold text-xl text-amber-800 mb-2">¿Querés reportar una situación?</h2>
  <p className="text-sm text-amber-700 mb-4">
    Podés hacer una denuncia de forma anónima o consultar el estado de una denuncia existente.
  </p>
  <div className="flex gap-3">
    <a href="/denunciar"
      className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold text-sm bg-amber-600 text-white px-4 py-2 hover:bg-amber-700 transition-colors">
      Hacer una denuncia
    </a>
    <a href="/consultar-denuncia"
      className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold text-sm border border-amber-600 text-amber-700 px-4 py-2 hover:bg-amber-100 transition-colors">
      Consultar estado
    </a>
  </div>
</section>
```

## 5. Casos borde

- Descripción menor a 20 chars → error inline sin llamar la API
- Código de denuncia no encontrado → mensaje claro sin revelar si existe o no
- API retorna error 500 → mensaje genérico "Error al enviar. Intentá de nuevo."
- La denuncia es siempre anónima: `anonima: true` hardcodeado — no dar opción al usuario
- Descripción se limita a 500 chars con `maxLength` en el textarea

## 6. Criterio de aceptación

- [ ] `/denunciar` carga sin auth
- [ ] Enviar denuncia con tipo y descripción válidos muestra el código generado
- [ ] El código se muestra claramente para que el usuario lo guarde
- [ ] `/consultar-denuncia` busca por código y muestra estado
- [ ] Código no encontrado muestra mensaje claro
- [ ] Links a `/denunciar` y `/consultar-denuncia` aparecen en `/ayuda`
- [ ] Build pasa sin errores

## 7. Tests (verificación manual)

1. Ir a `/denunciar` sin login → verificar que carga
2. Enviar denuncia con descripción válida → verificar que muestra el código
3. Ir a `/consultar-denuncia` → ingresar el código recibido → verificar estado "Recibida"
4. Ingresar código inválido → verificar mensaje de error
5. Verificar que `/ayuda` tiene los links a ambas páginas
