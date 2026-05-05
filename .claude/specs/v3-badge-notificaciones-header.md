# Spec: Badge de notificaciones en header global

- **Version:** V3
- **Origen:** Descubierto durante validacion de F-07 — mensajes individuales sin descubribilidad
- **Asignado a:** Gerardo
- **Prioridad:** Alta — sin esto, F-07 pierde valor operativo (mensajes que no se descubren = mensajes que no se reciben)

---

## ANTES DE ARRANCAR

- [ ] F-07 mergeado en develop (mensajes individuales — ya listo)

---

## 1. Contexto

El header global tiene un icono de campana (`Bell` de lucide-react) que es un `<Link>` plano a `/cuenta/notificaciones`. No hay badge numerico, no hay dropdown, no hay indicador visual de que hay notificaciones sin leer.

Esto significa que un taller que recibe un mensaje individual de F-07 no tiene forma de saberlo sin navegar manualmente a `/cuenta/notificaciones`. Para el piloto con 25 talleres, esto es critico: el ESTADO manda un mensaje de seguimiento y el taller no se entera.

### Componentes afectados

1. **Header global** (`src/compartido/componentes/layout/header.tsx`) — usado por TALLER, MARCA, ESTADO via layouts `(taller)`, `(marca)`, `(estado)`. Ya es `'use client'`.
2. **UserSidebar** (`src/compartido/componentes/layout/user-sidebar.tsx`) — sidebar deslizable con Bell y `badge: 0` hardcodeado. Tambien `'use client'`.
3. **Admin layout** (`src/app/(admin)/layout.tsx`) — server component con sidebar propio. Bell es un `<Link>` plano a `/admin/notificaciones`. **No necesita badge de no-leidas** porque ADMIN ve sus propias notificaciones admin en otro lugar.

### API existente

GET `/api/notificaciones` ya devuelve `sinLeer` (count de no leidas del usuario) y lista paginada. No hace falta endpoint nuevo.

---

## 2. Que construir

1. **Componente `NotificacionesBell`** — reemplaza el Bell plano del header con campana + badge numerico + dropdown
2. **Dropdown con ultimas 5 notificaciones** — titulo, sender (si mensaje individual), tiempo relativo
3. **Cada notificacion clickeable** — marca como leida + navega al destino
4. **Badge rojo numerico** — count de no leidas, desaparece cuando es 0
5. **Boton "Ver todas"** — navega a `/cuenta/notificaciones`
6. **Update reactivo** — al marcar leida desde el dropdown, badge se actualiza sin refresh
7. **Integracion en UserSidebar** — badge real en el menu item de Notificaciones (hoy hardcodeado a 0)

### Fuera de scope

- Admin layout: no se modifica. El admin tiene su propio sistema de notificaciones en `/admin/notificaciones`.
- Contenido layout: no se modifica. Misma razon.
- WebSocket/SSE/polling automatico: no hay infraestructura de realtime. El count se actualiza al montar el componente y al interactuar con el dropdown. Refetch en `visibilitychange` (cuando el usuario vuelve a la pestana).
- Sonido o vibracion: fuera de scope.

---

## 3. Modelo de datos

### 3.1 — Sin cambios al schema

No se crean campos ni tablas. Se reutiliza lo que existe:
- `Notificacion.leida` (Boolean) para el count
- `Notificacion.userId` para filtrar
- `Notificacion.tipo`, `titulo`, `mensaje`, `link`, `createdAt`, `creadaPor` para el dropdown

### 3.2 — Index de performance

Agregar index compuesto en Prisma schema para optimizar el count de no-leidas:

```prisma
@@index([userId, leida])
```

Hoy el unico index es `@@index([batchId])`. El count query `WHERE userId = ? AND leida = false` se ejecuta en cada render del header — sin index, es table scan. Con 25 talleres no es problema, pero con 500+ se nota.

**Migracion:** `npx prisma migrate dev --name add-notificacion-userId-leida-index`

---

## 4. Componente `NotificacionesBell`

Archivo nuevo: `src/compartido/componentes/layout/notificaciones-bell.tsx`

```tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

interface NotificacionPreview {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  link: string | null
  createdAt: string
  creadaPor?: { name: string | null } | null
}

interface Props {
  className?: string
}

export function NotificacionesBell({ className }: Props) {
  const [sinLeer, setSinLeer] = useState(0)
  const [notificaciones, setNotificaciones] = useState<NotificacionPreview[]>([])
  const [open, setOpen] = useState(false)
  const [cargando, setCargando] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch count + ultimas 5 al montar
  const fetchNotificaciones = useCallback(async () => {
    try {
      const res = await fetch('/api/notificaciones?limit=5')
      if (!res.ok) return
      const data = await res.json()
      setSinLeer(data.sinLeer ?? 0)
      setNotificaciones(data.notificaciones ?? [])
    } catch { /* silencioso */ }
  }, [])

  useEffect(() => {
    fetchNotificaciones()
  }, [fetchNotificaciones])

  // Refetch cuando el usuario vuelve a la pestana
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchNotificaciones()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [fetchNotificaciones])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Marcar una notificacion como leida
  async function marcarLeida(id: string) {
    await fetch('/api/notificaciones', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})

    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    )
    setSinLeer(prev => Math.max(0, prev - 1))
  }

  // Tiempo relativo simple
  function tiempoRelativo(fecha: string): string {
    const diff = Date.now() - new Date(fecha).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `hace ${mins}m`
    const horas = Math.floor(mins / 60)
    if (horas < 24) return `hace ${horas}h`
    const dias = Math.floor(horas / 24)
    return `hace ${dias}d`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Boton de campana */}
      <button
        onClick={() => {
          setOpen(prev => !prev)
          if (!open) fetchNotificaciones()
        }}
        className={className ?? "hover:text-blue-200 transition-colors relative"}
        aria-label={`Notificaciones${sinLeer > 0 ? ` (${sinLeer} sin leer)` : ''}`}
      >
        <Bell className="w-4 h-4" />
        {sinLeer > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-brand-red text-white text-[10px] font-bold rounded-full px-1">
            {sinLeer > 99 ? '99+' : sinLeer}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header del dropdown */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-overpass font-semibold text-sm text-gray-900">
              Notificaciones
            </h3>
            {sinLeer > 0 && (
              <span className="text-xs text-brand-blue font-medium">
                {sinLeer} sin leer
              </span>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No tenes notificaciones
              </div>
            ) : (
              notificaciones.map(n => {
                const esMensajeIndividual = n.tipo === 'mensaje_individual'

                return (
                  <NotificacionItem
                    key={n.id}
                    notificacion={n}
                    esMensajeIndividual={esMensajeIndividual}
                    tiempoRelativo={tiempoRelativo}
                    onClick={() => {
                      if (!n.leida) marcarLeida(n.id)
                      setOpen(false)
                    }}
                  />
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100">
            <Link
              href="/cuenta/notificaciones"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-center text-sm font-overpass font-medium text-brand-blue hover:bg-gray-50 transition-colors"
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 4.1 — Sub-componente `NotificacionItem` (en el mismo archivo)

```tsx
function NotificacionItem({
  notificacion: n,
  esMensajeIndividual,
  tiempoRelativo,
  onClick,
}: {
  notificacion: NotificacionPreview
  esMensajeIndividual: boolean
  tiempoRelativo: (fecha: string) => string
  onClick: () => void
}) {
  const contenido = (
    <div className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-2 ${
      n.leida ? 'border-transparent' : 'border-brand-blue bg-brand-blue/5'
    }`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {esMensajeIndividual && (
            <span className="inline-block text-[10px] font-semibold text-white bg-brand-blue rounded px-1.5 py-0.5 mb-1">
              Mensaje del equipo
            </span>
          )}
          <p className="text-sm font-medium text-gray-900 truncate">{n.titulo}</p>
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{n.mensaje}</p>
          <div className="flex items-center gap-2 mt-1">
            {esMensajeIndividual && n.creadaPor?.name && (
              <span className="text-[11px] text-gray-400">De: {n.creadaPor.name}</span>
            )}
            <span className="text-[11px] text-gray-400">{tiempoRelativo(n.createdAt)}</span>
          </div>
        </div>
        {!n.leida && (
          <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0" />
        )}
      </div>
    </div>
  )

  if (n.link) {
    const isExternal = n.link.startsWith('http')
    if (isExternal) {
      return (
        <a href={n.link} target="_blank" rel="noopener noreferrer" onClick={onClick}>
          {contenido}
        </a>
      )
    }
    return (
      <Link href={n.link} onClick={onClick}>
        {contenido}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {contenido}
    </button>
  )
}
```

---

## 5. Integracion en header.tsx

### 5.1 — Desktop (lineas 99-107 actuales)

Reemplazar el `<Link>` plano del Bell por el componente `NotificacionesBell`:

```tsx
// ANTES (lineas 101-107):
<Link
  href="/cuenta/notificaciones"
  className="hover:text-blue-200 transition-colors relative"
  aria-label="Notificaciones"
>
  <Bell className="w-4 h-4" />
</Link>

// DESPUES:
<NotificacionesBell />
```

### 5.2 — Mobile (lineas 174-180 actuales)

En el menu mobile, reemplazar el Link de notificaciones por `NotificacionesBell` con clase adicional:

```tsx
// ANTES (lineas 174-180):
<Link
  href="/cuenta/notificaciones"
  className="flex items-center gap-2 px-4 py-3 font-overpass font-medium rounded-lg text-white hover:bg-white/10"
>
  <Bell className="w-4 h-4" />
  Notificaciones
</Link>

// DESPUES:
<div className="flex items-center gap-2 px-4 py-3 font-overpass font-medium rounded-lg text-white">
  <NotificacionesBell className="flex items-center gap-2 w-full text-left hover:bg-white/10 rounded-lg" />
</div>
```

**Nota sobre mobile:** el dropdown necesita abrir hacia abajo y estar posicionado correctamente. En mobile no hay `hidden md:flex` — esta dentro del `mobileMenuOpen` conditional. El dropdown se posiciona con `absolute right-0 top-full` que funciona en ambos contextos.

**Alternativa mobile mas simple:** si el dropdown es incomodo en mobile, el Bell mobile puede seguir siendo un Link plano a `/cuenta/notificaciones` pero con el badge numerico. Dejar la decision al implementador — lo importante es que el badge rojo sea visible.

### 5.3 — Import

Agregar al inicio de `header.tsx`:

```tsx
import { NotificacionesBell } from './notificaciones-bell'
```

Se puede quitar `Bell` del import de lucide-react si ya no se usa directamente en header.tsx.

---

## 6. Integracion en UserSidebar

### 6.1 — Badge real en el menu item

El sidebar tiene `badge: 0` hardcodeado en los menu items de Notificaciones (lineas 52, 60, 71). Para que muestre el count real:

**Opcion A (recomendada):** El Header ya monta `NotificacionesBell` que hace el fetch. Pasar `sinLeer` como prop al `UserSidebar`. Esto evita un segundo fetch:

```tsx
// En header.tsx:
// NotificacionesBell expone sinLeer via callback
<UserSidebar
  ...
  notificacionesSinLeer={sinLeer}
/>

// En user-sidebar.tsx:
// Recibir como prop y usarlo para el badge de Notificaciones
```

**Opcion B (mas simple):** El sidebar hace su propio fetch leve (`GET /api/notificaciones?limit=1`) cuando se abre (`isOpen` pasa a true). Dado que el sidebar se abre raramente, el impacto es minimo:

```tsx
useEffect(() => {
  if (isOpen) {
    fetch('/api/notificaciones?limit=1')
      .then(r => r.json())
      .then(data => setBadgeCount(data.sinLeer ?? 0))
      .catch(() => {})
  }
}, [isOpen])
```

**Elegir Opcion B.** Es mas simple, no acopla sidebar con header, y el sidebar ya es `'use client'`.

### 6.2 — Cambios en UserSidebar

1. Agregar estado: `const [badgeCount, setBadgeCount] = useState(0)`
2. Agregar effect que fetch cuando `isOpen === true`
3. Reemplazar los `badge: 0` hardcodeados por `badge: undefined` en la config
4. Inyectar `badgeCount` en el item de Notificaciones antes de renderizar:

```tsx
const menuItemsConBadge = menuItems.map(item =>
  item.id === 'notificaciones' ? { ...item, badge: badgeCount } : item
)
```

---

## 7. API — Sin endpoint nuevo

GET `/api/notificaciones?limit=5` ya devuelve:
- `notificaciones[]` — las ultimas 5
- `sinLeer` — count total de no leidas
- `total`, `page`, `totalPages` — metadata de paginacion

Lo unico que falta es incluir `creadaPor` en la query del GET para que el dropdown pueda mostrar "De: {nombre}". Agregar `include` en la query existente:

```typescript
// En /api/notificaciones/route.ts, linea 16:
// ANTES:
prisma.notificacion.findMany({
  where: { userId },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
})

// DESPUES:
prisma.notificacion.findMany({
  where: { userId },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
  include: { creadaPor: { select: { name: true } } },
})
```

---

## 8. Casos borde

### 8.1 — Funcionales

- **0 notificaciones** — el badge no se muestra. El dropdown dice "No tenes notificaciones".
- **100+ sin leer** — badge muestra "99+".
- **Click en notificacion con link** — marca leida + navega. El badge decrementa.
- **Click en notificacion sin link** — marca leida. El badge decrementa. No navega — podria expandir texto pero para el dropdown, solo marca leida. Para ver el mensaje completo, ir a `/cuenta/notificaciones`.
- **Multiples pestanas** — si el usuario tiene la plataforma abierta en 2 tabs y marca como leida en una, la otra se actualiza cuando vuelve a esa pestana (via `visibilitychange`).
- **Session expirada** — el fetch devuelve 401, se ignora silenciosamente. El badge queda en 0.
- **Error de red** — el fetch falla silenciosamente. El badge queda en 0. No se muestra error — es un indicador, no un feature critico.
- **Click fuera del dropdown** — se cierra.
- **ESC** — NO cierra el dropdown (no hay handler). Implementar opcionalmente.

### 8.2 — Performance

- El fetch ocurre 1 vez al montar el Header (por navegacion) + 1 vez al abrir el dropdown + en cada `visibilitychange`.
- Con SPA navigation de Next.js, el Header se monta 1 vez y persiste. El count se refresca al abrir el dropdown.
- `limit=5` mantiene el payload chico (~1KB).
- El index `@@index([userId, leida])` hace el count O(log n) en vez de O(n).

---

## 9. Criterios de aceptacion

- [ ] Componente `NotificacionesBell` en `src/compartido/componentes/layout/notificaciones-bell.tsx`
- [ ] Bell con badge rojo numerico visible en header desktop y mobile (TALLER, MARCA, ESTADO)
- [ ] Badge desaparece cuando count es 0
- [ ] Badge muestra "99+" si hay mas de 99 sin leer
- [ ] Click en Bell abre dropdown con ultimas 5 notificaciones
- [ ] Cada notificacion muestra titulo, mensaje (truncado), tiempo relativo
- [ ] Mensajes individuales muestran badge "Mensaje del equipo" y sender
- [ ] Click en notificacion con link → marca leida + navega al destino
- [ ] Click en notificacion sin link → marca leida
- [ ] Badge se actualiza reactivamente al marcar leida (sin refresh)
- [ ] Click fuera del dropdown lo cierra
- [ ] Boton "Ver todas las notificaciones" navega a `/cuenta/notificaciones`
- [ ] UserSidebar muestra badge real (no hardcoded 0) al abrirse
- [ ] GET `/api/notificaciones` incluye `creadaPor` en la respuesta
- [ ] Index `@@index([userId, leida])` en modelo Notificacion
- [ ] Refetch al volver a la pestana (`visibilitychange`)
- [ ] Build sin errores TypeScript

---

## 10. Tests

| # | Que testear | Como | Verificador |
|---|-------------|------|-------------|
| 1 | Badge muestra count correcto | Crear 3 notificaciones no leidas, verificar badge dice "3" | QA |
| 2 | Badge desaparece con 0 no leidas | Marcar todas como leidas, verificar que badge no existe | QA |
| 3 | Dropdown lista 5 notificaciones | Crear 7, abrir dropdown, verificar que muestra 5 | QA |
| 4 | Click marca leida y navega | Click en notificacion con link, verificar navegacion + badge -1 | QA |
| 5 | Mensaje individual muestra badge "Mensaje del equipo" | Enviar mensaje individual, verificar en dropdown | QA |
| 6 | "Ver todas" navega a /cuenta/notificaciones | Click en boton, verificar ruta | QA |
| 7 | Click fuera cierra dropdown | Abrir dropdown, click en body | QA |
| 8 | Badge en UserSidebar muestra count real | Abrir sidebar con notificaciones sin leer | QA |
| 9 | NotificacionesBell importa correctamente | Import test | DEV |
| 10 | tiempoRelativo formatea bien | Unit test: "ahora", "hace 5m", "hace 2h", "hace 3d" | DEV |
| 11 | Dropdown no se renderiza si open=false | Unit test | DEV |
| 12 | GET /api/notificaciones incluye creadaPor | E2E: verificar response shape | DEV |

---

## 11. Dependencias

- F-07 mergeado en develop (mensajes individuales — para que los mensajes del equipo aparezcan en el dropdown)
- No depende de S-02 ni de ningun otro spec pendiente
- Bell icon ya existe en lucide-react (importado en header.tsx)
- API GET `/api/notificaciones` ya funcional

---

## 12. Validacion de dominio (perfiles interdisciplinarios)

**Politologo:**
- El badge de notificaciones puede generar ansiedad o sensacion de vigilancia en talleres informales?
- El indicador numerico rojo tiene connotaciones negativas en el contexto de notificaciones estatales?

**Economista:**
- El fetch adicional en cada carga de pagina tiene impacto en costos de hosting?

**Sociologo:**
- El dropdown de 5 notificaciones es suficiente como primer contacto, o genera frustracion por no ver el historial completo?
- El badge "Mensaje del equipo" en el dropdown refuerza la sensacion de cercanía o de control?

**Contador:**
- No aplica para este spec (componente de UI, no de datos fiscales)

---

## 13. Referencias

- F-07 (`v3-mensajes-individuales.md`) — el motivador directo de este spec
- Header actual: `src/compartido/componentes/layout/header.tsx`
- UserSidebar: `src/compartido/componentes/layout/user-sidebar.tsx`
- API: `src/app/api/notificaciones/route.ts`
- Prisma schema: `prisma/schema.prisma` → model `Notificacion`
