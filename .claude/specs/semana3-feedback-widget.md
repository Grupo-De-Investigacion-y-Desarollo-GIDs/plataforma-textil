# Spec: Widget de feedback in-app

- **Semana:** 3
- **Asignado a:** Gerardo (API) + Sergio (UI)
- **Dependencias:** Ninguna

## 1. Contexto

Los usuarios del piloto necesitan una forma de reportar problemas, sugerir mejoras e indicar que falta — directamente desde la plataforma sin salir de lo que estan haciendo. El feedback se guarda en LogActividad y opcionalmente crea un issue en GitHub para que el equipo de desarrollo lo vea.

## 2. Que construir

- API `POST /api/feedback` — guarda en LogActividad y crea issue en GitHub
- Widget flotante `FeedbackWidget` visible en todas las paginas para usuarios logueados
- Variable de entorno `GITHUB_TOKEN` para crear issues

## 3. Datos

No hay migracion — se usa LogActividad existente:

```typescript
await logActividad('FEEDBACK', userId, {
  tipo,        // 'bug' | 'mejora' | 'falta' | 'confusion'
  mensaje,     // texto libre del usuario
  pagina,      // URL actual
  rol,         // rol del usuario
  userAgent,   // navegador
})
```

Variables de entorno a agregar a `.env.example`:

```
GITHUB_TOKEN=          # Personal Access Token con scope repo
GITHUB_REPO=           # ej: Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil
```

## 4. Prescripciones tecnicas

### Archivo nuevo (Gerardo) — `src/app/api/feedback/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { logActividad } from '@/compartido/lib/log'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { tipo, mensaje, pagina } = body

  if (!tipo || !mensaje || mensaje.length < 10) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
  }

  const role = (session.user as { role?: string }).role

  // 1. Guardar en LogActividad
  logActividad('FEEDBACK', session.user.id, {
    tipo,
    mensaje,
    pagina,
    rol: role,
    userAgent: request.headers.get('user-agent') ?? '',
  })

  // 2. Crear issue en GitHub (fire-and-forget)
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
    const labels: Record<string, string[]> = {
      bug: ['bug', 'piloto'],
      mejora: ['enhancement', 'piloto'],
      falta: ['feature-request', 'piloto'],
      confusion: ['ux', 'piloto'],
    }
    fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: `[${tipo.toUpperCase()}] ${mensaje.slice(0, 60)}${mensaje.length > 60 ? '...' : ''}`,
        body: `**Tipo:** ${tipo}\n**Rol:** ${role}\n**Pagina:** ${pagina}\n\n**Descripcion:**\n${mensaje}`,
        labels: labels[tipo] ?? ['piloto'],
      }),
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
```

### Archivo nuevo (Sergio) — `src/compartido/componentes/feedback-widget.tsx`

```typescript
'use client'
import { useState } from 'react'
import { MessageSquarePlus, X, Send, Loader2, CheckCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'

const TIPOS = [
  { value: 'bug', label: '🐛 Algo no funciona', color: 'text-red-600' },
  { value: 'mejora', label: '✨ Podria mejorar', color: 'text-blue-600' },
  { value: 'falta', label: '🔍 Me falta algo', color: 'text-amber-600' },
  { value: 'confusion', label: '😕 No entendi como usar esto', color: 'text-purple-600' },
]

export function FeedbackWidget() {
  const pathname = usePathname()
  const [abierto, setAbierto] = useState(false)
  const [tipo, setTipo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEnviar() {
    if (!tipo || mensaje.length < 10) {
      setError('Elegi un tipo y escribi al menos 10 caracteres')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, mensaje, pagina: pathname }),
      })
      if (!res.ok) throw new Error()
      setEnviado(true)
      setTimeout(() => {
        setAbierto(false)
        setEnviado(false)
        setTipo('')
        setMensaje('')
      }, 2000)
    } catch {
      setError('Error al enviar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {abierto && (
        <div className="mb-3 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-brand-blue">
            <span className="text-white text-sm font-medium font-overpass">Contanos tu experiencia</span>
            <button onClick={() => setAbierto(false)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {enviado ? (
            <div className="p-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Gracias por tu feedback!</p>
              <p className="text-xs text-gray-500 mt-1">Lo revisaremos pronto</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {TIPOS.map(t => (
                  <button key={t.value} onClick={() => setTipo(t.value)}
                    className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                      tipo === t.value ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span className={t.color}>{t.label}</span>
                  </button>
                ))}
              </div>
              <textarea value={mensaje} onChange={e => setMensaje(e.target.value)}
                placeholder="Describi lo que paso o lo que necesitas..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button onClick={handleEnviar} disabled={enviando}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90 disabled:opacity-50">
                {enviando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                {enviando ? 'Enviando...' : 'Enviar feedback'}
              </button>
              <p className="text-xs text-gray-400 text-center">Pagina actual: {pathname}</p>
            </div>
          )}
        </div>
      )}

      <button onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-brand-blue/90 transition-colors">
        <MessageSquarePlus className="w-4 h-4" />
        <span className="text-sm font-medium">Feedback</span>
      </button>
    </div>
  )
}
```

### Archivo nuevo (Sergio) — `src/compartido/componentes/feedback-widget-wrapper.tsx`

```typescript
'use client'
import { useSession } from 'next-auth/react'
import { FeedbackWidget } from './feedback-widget'

export function FeedbackWidgetWrapper() {
  const { data: session } = useSession()
  if (!session?.user) return null
  return <FeedbackWidget />
}
```

`SessionProvider` ya envuelve la app en `src/app/providers.tsx` — `useSession()` funciona sin configuracion extra.

### Archivo a modificar (Sergio) — `src/app/layout.tsx`

Agregar el wrapper dentro del body, despues de `<Providers>`:

```tsx
import { FeedbackWidgetWrapper } from '@/compartido/componentes/feedback-widget-wrapper'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>
          {children}
          <FeedbackWidgetWrapper />
        </Providers>
      </body>
    </html>
  )
}
```

### Archivo a modificar (Gerardo) — `.env.example`

Agregar:

```
GITHUB_TOKEN=          # Personal Access Token con scope repo (para feedback → issues)
GITHUB_REPO=Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil
```

## 5. Casos borde

- Usuario no logueado → `FeedbackWidgetWrapper` retorna null, widget no aparece
- `GITHUB_TOKEN` no configurado → feedback se guarda igual en LogActividad, issue no se crea
- Mensaje menor a 10 chars → error inline sin llamar la API
- GitHub API falla → feedback guardado igual, error silencioso (fire-and-forget)
- `logActividad` es fire-and-forget — no bloquea la respuesta

## 6. Criterio de aceptacion

- [ ] Widget flotante aparece en todas las paginas para usuarios logueados
- [ ] Widget NO aparece sin sesion
- [ ] Enviar feedback guarda en LogActividad con accion FEEDBACK
- [ ] Si `GITHUB_TOKEN` configurado → se crea issue en GitHub
- [ ] Mensaje de exito aparece y el panel se cierra automaticamente
- [ ] Build pasa sin errores

## 7. Tests (verificacion manual)

1. Loguearse como taller → verificar que aparece el boton "Feedback" en esquina inferior derecha
2. Click → elegir tipo "Bug" → escribir descripcion → enviar → verificar mensaje de exito
3. Verificar en Supabase que se creo LogActividad con accion FEEDBACK
4. Si `GITHUB_TOKEN` configurado → verificar que se creo el issue en GitHub
5. Sin sesion → verificar que el boton no aparece
