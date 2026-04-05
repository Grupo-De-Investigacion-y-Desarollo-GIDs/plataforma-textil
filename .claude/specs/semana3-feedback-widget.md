# Spec: Widget de feedback in-app

- **Semana:** 3
- **Asignado a:** Gerardo (API + admin) + Sergio (UI widget)
- **Dependencias:** Ninguna

## 1. Contexto

Los usuarios del piloto necesitan una forma de reportar problemas, sugerir mejoras e indicar que falta — directamente desde la plataforma sin salir de lo que estan haciendo. El feedback se guarda en LogActividad y opcionalmente crea un issue en GitHub para que el equipo de desarrollo lo vea. El admin puede ver todos los feedbacks en `/admin/feedback`.

## 2. Que construir

- API `POST /api/feedback` — guarda en LogActividad y crea issue en GitHub
- Widget flotante `FeedbackWidget` visible en todas las paginas para usuarios logueados
- Parseo automatico de entidad desde la URL (pedido, taller, coleccion, etc.)
- Pagina `/admin/feedback` con tabla de feedbacks, filtro por tipo y badges de color
- Link "Feedback" en el sidebar del admin
- Variable de entorno `GITHUB_TOKEN` para crear issues

## 3. Datos

No hay migracion — se usa LogActividad existente:

```typescript
logActividad('FEEDBACK', userId, {
  tipo,        // 'bug' | 'mejora' | 'falta' | 'confusion'
  mensaje,     // texto libre del usuario
  pagina,      // URL actual
  entidad,     // entidad parseada de la URL (ej: 'pedido')
  entidadId,   // ID de la entidad (ej: 'abc123')
  rol,         // rol del usuario
  userAgent,   // navegador
})
```

Variables de entorno:

```
GITHUB_TOKEN=          # Personal Access Token con scope repo
GITHUB_REPO=Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil
```

## 4. Prescripciones tecnicas

### Archivo a modificar (Gerardo) — `src/app/api/feedback/route.ts`

Agregar `entidad` y `entidadId` al body y al log:

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { logActividad } from '@/compartido/lib/log'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { tipo, mensaje, pagina, entidad, entidadId } = body

  if (!tipo || !mensaje || mensaje.length < 10) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
  }

  const role = (session.user as { role?: string }).role

  logActividad('FEEDBACK', session.user.id, {
    tipo,
    mensaje,
    pagina,
    entidad: entidad ?? null,
    entidadId: entidadId ?? null,
    rol: role,
    userAgent: request.headers.get('user-agent') ?? '',
  })

  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
    const labels: Record<string, string[]> = {
      bug: ['bug', 'piloto'],
      mejora: ['enhancement', 'piloto'],
      falta: ['feature-request', 'piloto'],
      confusion: ['ux', 'piloto'],
    }
    const entidadLine = entidad ? `**Entidad:** ${entidad} ${entidadId}\n` : ''
    fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: `[${tipo.toUpperCase()}] ${mensaje.slice(0, 60)}${mensaje.length > 60 ? '...' : ''}`,
        body: `**Tipo:** ${tipo}\n**Rol:** ${role}\n**Pagina:** ${pagina}\n${entidadLine}\n**Descripcion:**\n${mensaje}`,
        labels: labels[tipo] ?? ['piloto'],
      }),
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
```

### Archivo a modificar (Sergio) — `src/compartido/componentes/feedback-widget.tsx`

Agregar funcion `parsearEntidad` y enviar entidad en el POST:

```typescript
function parsearEntidad(pathname: string): { entidad: string; id: string } | null {
  const patrones = [
    { regex: /\/taller\/pedidos\/disponibles\/([^/]+)/, entidad: 'pedido_disponible' },
    { regex: /\/taller\/pedidos\/([^/]+)/, entidad: 'pedido' },
    { regex: /\/taller\/aprender\/([^/]+)/, entidad: 'coleccion' },
    { regex: /\/marca\/directorio\/([^/]+)/, entidad: 'taller' },
    { regex: /\/marca\/pedidos\/([^/]+)/, entidad: 'pedido' },
    { regex: /\/admin\/talleres\/([^/]+)/, entidad: 'taller' },
    { regex: /\/admin\/marcas\/([^/]+)/, entidad: 'marca' },
    { regex: /\/admin\/auditorias\/([^/]+)/, entidad: 'auditoria' },
  ]
  for (const { regex, entidad } of patrones) {
    const match = pathname.match(regex)
    if (match) return { entidad, id: match[1] }
  }
  return null
}
```

Nota: `pedidos/disponibles/[id]` debe ir ANTES de `pedidos/[id]` en el array para que matchee primero.

En `handleEnviar`, agregar la entidad al body:

```typescript
const entidadParseada = parsearEntidad(pathname)
body: JSON.stringify({
  tipo,
  mensaje,
  pagina: pathname,
  entidad: entidadParseada?.entidad ?? null,
  entidadId: entidadParseada?.id ?? null,
}),
```

Mostrar la entidad detectada debajo del textarea si existe:

```tsx
{entidadParseada && (
  <p className="text-xs text-gray-400">
    Entidad detectada: <span className="font-medium">{entidadParseada.entidad}</span> {entidadParseada.id.slice(0, 8)}...
  </p>
)}
```

### Archivo existente (Sergio) — `src/compartido/componentes/feedback-widget-wrapper.tsx`

Sin cambios — ya esta implementado.

### Archivo existente (Sergio) — `src/app/layout.tsx`

Sin cambios — ya tiene FeedbackWidgetWrapper.

### Archivo nuevo (Gerardo) — `src/app/(admin)/admin/feedback/page.tsx`

Server component:

```typescript
export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { MessageSquare } from 'lucide-react'

const tipoBadge: Record<string, 'error' | 'default' | 'warning' | 'muted'> = {
  bug: 'error',
  mejora: 'default',
  falta: 'warning',
  confusion: 'muted',
}

export default async function AdminFeedbackPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const feedbacks = await prisma.logActividad.findMany({
    where: { accion: 'FEEDBACK' },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { timestamp: 'desc' },
    take: 50,
  })

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-brand-blue" />
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue">Feedback del piloto</h1>
          <p className="text-gray-500 text-sm">Ultimos 50 feedbacks de los usuarios</p>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No hay feedbacks todavia.</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Tipo</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Mensaje</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Rol</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Pagina</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Entidad</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Usuario</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbacks.map(fb => {
                  const d = fb.detalles as Record<string, string> | null
                  return (
                    <tr key={fb.id}>
                      <td className="py-2 px-3">
                        <Badge variant={tipoBadge[d?.tipo ?? ''] ?? 'muted'}>{d?.tipo ?? '—'}</Badge>
                      </td>
                      <td className="py-2 px-3 max-w-xs truncate">{d?.mensaje ?? '—'}</td>
                      <td className="py-2 px-3">{d?.rol ?? '—'}</td>
                      <td className="py-2 px-3 text-xs text-gray-500 max-w-[150px] truncate">{d?.pagina ?? '—'}</td>
                      <td className="py-2 px-3 text-xs">
                        {d?.entidad ? `${d.entidad} ${(d.entidadId ?? '').slice(0, 8)}...` : '—'}
                      </td>
                      <td className="py-2 px-3 text-xs">{fb.user?.name ?? fb.user?.email ?? '—'}</td>
                      <td className="py-2 px-3 text-xs text-gray-400">{fb.timestamp.toLocaleDateString('es-AR')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
```

### Archivo a modificar (Gerardo) — sidebar admin

En `src/app/(admin)/layout.tsx` o donde esten los items del sidebar admin, agregar link a `/admin/feedback` con icono `MessageSquare`.

## 5. Casos borde

- Usuario no logueado → FeedbackWidgetWrapper retorna null, widget no aparece
- GITHUB_TOKEN no configurado → feedback se guarda igual en LogActividad, issue no se crea
- Mensaje menor a 10 chars → error inline sin llamar la API
- GitHub API falla → feedback guardado igual, error silencioso
- Pagina sin entidad (ej: /taller) → entidad es null, no se muestra en el widget
- Pagina con entidad (ej: /taller/pedidos/abc) → muestra "Entidad detectada: pedido abc..."
- Admin feedback vacio → muestra "No hay feedbacks todavia"

## 6. Criterio de aceptacion

- [ ] Widget flotante aparece en todas las paginas para usuarios logueados
- [ ] Widget NO aparece sin sesion
- [ ] Enviar feedback guarda en LogActividad con accion FEEDBACK, incluyendo entidad y entidadId
- [ ] Si GITHUB_TOKEN configurado → issue incluye entidad en el body
- [ ] /admin/feedback muestra tabla con los ultimos 50 feedbacks
- [ ] Badges de color por tipo: bug rojo, mejora azul, falta amarillo, confusion gris
- [ ] Link "Feedback" visible en el sidebar admin
- [ ] Build pasa sin errores

## 7. Tests (verificacion manual)

1. Loguearse como taller → ir a /taller/pedidos/[id] → abrir feedback → verificar que muestra "Entidad detectada: pedido"
2. Enviar feedback → verificar en Supabase que LogActividad tiene entidad y entidadId
3. Si GITHUB_TOKEN configurado → verificar que el issue incluye "Entidad: pedido abc123"
4. Loguearse como admin → ir a /admin/feedback → verificar tabla con feedbacks
5. Verificar badges de color por tipo en la tabla
6. Sin sesion → verificar que el boton Feedback no aparece
