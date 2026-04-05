# Spec: Chat RAG — UI del asistente

- **Semana:** 3
- **Asignado a:** Sergio
- **Dependencias:** semana2-rag-decision-pipeline mergeado (backend /api/chat debe existir)

## ⚠️ ANTES DE ARRANCAR

- `semana2-rag-decision-pipeline` (Gerardo) — verificar que existe `POST /api/chat` y retorna `{ respuesta, fuentes }`
- Verificar que `ANTHROPIC_API_KEY` y `VOYAGE_API_KEY` están en `.env.local`

## 1. Contexto

El backend del RAG está completo — `POST /api/chat` recibe una pregunta y retorna respuesta con fuentes. Este spec implementa el componente de chat embebido en la página del curso (`/taller/aprender/[id]`). El chat es un card colapsable al final de la página con una pregunta simple y la respuesta de Claude.

## 2. Qué construir

- Componente `AsistenteChat` en `src/taller/componentes/asistente-chat.tsx`
- Embeber el componente en `/taller/aprender/[id]` debajo del `AcademiaCliente`

## 3. Datos

- No hay cambios de schema
- El componente llama a `POST /api/chat` con `{ pregunta: string }`
- La respuesta es `{ respuesta: string, fuentes: string[] }`

## 4. Prescripciones técnicas

### Archivo nuevo — `src/taller/componentes/asistente-chat.tsx`

```typescript
'use client'
import { useState } from 'react'
import { MessageCircle, ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react'

export function AsistenteChat() {
  const [abierto, setAbierto] = useState(false)
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState<string | null>(null)
  const [fuentes, setFuentes] = useState<string[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePreguntar() {
    if (!pregunta.trim() || pregunta.length < 10) {
      setError('La pregunta debe tener al menos 10 caracteres')
      return
    }
    setCargando(true)
    setError(null)
    setRespuesta(null)
    setFuentes([])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al consultar el asistente')
        return
      }
      const data = await res.json()
      setRespuesta(data.respuesta)
      setFuentes(data.fuentes ?? [])
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mt-8 border border-brand-blue/20 rounded-xl overflow-hidden">
      {/* Header colapsable */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-3 bg-brand-blue/5 hover:bg-brand-blue/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-brand-blue" />
          <span className="text-sm font-medium text-brand-blue font-overpass">
            ¿Tenés dudas? Preguntá al asistente
          </span>
        </div>
        {abierto ? (
          <ChevronUp className="w-4 h-4 text-brand-blue" />
        ) : (
          <ChevronDown className="w-4 h-4 text-brand-blue" />
        )}
      </button>

      {/* Contenido */}
      {abierto && (
        <div className="p-4 space-y-4">
          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={pregunta}
              onChange={e => setPregunta(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !cargando && handlePreguntar()}
              placeholder="Ej: ¿Cómo calculo el SAM de una remera?"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              disabled={cargando}
              maxLength={500}
            />
            <button
              onClick={handlePreguntar}
              disabled={cargando || !pregunta.trim()}
              className="bg-brand-blue text-white px-3 py-2 rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
            >
              {cargando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Respuesta */}
          {respuesta && (
            <div className="space-y-2">
              <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed">
                {respuesta}
              </div>
              {fuentes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-gray-400">Fuentes:</span>
                  {fuentes.map((f, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cargando */}
          {cargando && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Consultando al asistente...</span>
            </div>
          )}

          <p className="text-xs text-gray-400">
            El asistente responde basándose en el contenido de la plataforma. Para consultas específicas escribí a soporte@plataformatextil.ar
          </p>
        </div>
      )}
    </div>
  )
}
```

### Archivo a modificar — `src/app/(taller)/taller/aprender/[id]/page.tsx`

**Cambio 1 — Agregar import (después de línea 8):**

```typescript
import { AsistenteChat } from '@/taller/componentes/asistente-chat'
```

**Cambio 2 — Agregar el componente al final del JSX, después de `<AcademiaCliente>` (después de línea 83, antes del cierre `</div>`):**

```tsx
<AsistenteChat />
```

El contenedor padre tiene `space-y-6` que maneja el espaciado automáticamente.

## 5. Casos borde

- API keys no configuradas → `/api/chat` retorna 503 → el componente muestra "El asistente no está disponible en este momento"
- Pregunta menor a 10 chars → error inline antes de llamar la API
- Error de red → mensaje "Error de conexión. Intentá de nuevo."
- Respuesta muy larga → el texto se wrappea dentro del card (no hay límite de altura)
- El chat se cierra al navegar entre videos — es stateless, cada apertura empieza limpio

## 6. Criterio de aceptación

- [ ] El card colapsable aparece al final de `/taller/aprender/[id]`
- [ ] Al abrir y escribir una pregunta, el asistente responde
- [ ] Las fuentes aparecen debajo de la respuesta
- [ ] Pregunta menor a 10 chars muestra error sin llamar la API
- [ ] Estado de carga visible mientras espera respuesta
- [ ] Build pasa sin errores

## 7. Tests (verificación manual)

1. Loguearse como taller → ir a `/taller/aprender/[id]`
2. Verificar que aparece el card "¿Tenés dudas?" al final
3. Click para abrir → escribir "¿Cómo calculo el SAM?" → verificar respuesta
4. Escribir pregunta corta (<10 chars) → verificar error inline
