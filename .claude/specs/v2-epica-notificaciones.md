# Spec: Épica Notificaciones — Centro de comunicaciones + Historial

**Versión:** v2
**Asignado a:** Gerardo (schema + backend) + Sergio (UI)

---

## 1. Contexto

La página `/admin/notificaciones` mezcla dos conceptos distintos en la misma vista:

- **Notificaciones de sistema** — generadas automáticamente por flujos (pedido publicado, cotización recibida, documento aprobado).
- **Comunicaciones del admin** — mensajes redactados manualmente y enviados a segmentos.

Además tiene 5 problemas:

1. **Sin distinción en DB entre sistema vs admin** — el único indicador es el string `tipo: 'ADMIN_ENVIO'`, frágil.
2. **Canal EMAIL no envía emails reales** — se guarda en DB con `canal = EMAIL` pero nadie llama SendGrid. Teatro.
3. **Sin gate de autorización** — `page.tsx` solo hace `redirect('/login')` si no hay sesión, no verifica `role === 'ADMIN'`.
4. **Segmentación limitada** — solo `todos | talleres | marcas`, sin filtro por nivel.
5. **Envíos masivos duplicados** — un envío a 500 usuarios crea 500 filas en `Notificacion`, y la UI no tiene forma de agruparlos.

---

## 2. Decisiones de arquitectura

- Agregar `createdById` FK nullable a `Notificacion` — `null = sistema`, `not null = admin que la envió`.
- Agregar `batchId String?` a `Notificacion` — permite agrupar envíos masivos del admin en la UI sin crear tabla nueva.
- Arreglar el canal EMAIL para enviar emails reales via SendGrid.
- Agregar segmentación por nivel BRONCE/PLATA/ORO.
- Cerrar el bug de autorización en la página.
- Tabs con `searchParams` (patrón del repo, server component sin client wrapper).
- Crear builder `buildComunicacionAdminEmail` en `lib/email.ts` siguiendo el patrón de los otros builders.

**Sin tabla `Comunicacion` separada** — `batchId + createdById` cubre el piloto.

---

## 3. Cambios de schema

**Archivo:** `prisma/schema.prisma`

### 3.1 Modelo `Notificacion`

```prisma
model Notificacion {
  id          String            @id @default(cuid())
  userId      String
  tipo        String
  titulo      String
  mensaje     String            @db.Text
  leida       Boolean           @default(false)
  canal       CanalNotificacion @default(PLATAFORMA)
  createdById String?                                    // null = sistema
  batchId     String?                                    // agrupa envíos masivos del admin
  createdAt   DateTime          @default(now())

  user      User  @relation("NotificacionDestinatario", fields: [userId],      references: [id], onDelete: Cascade)
  creadaPor User? @relation("NotificacionCreador",      fields: [createdById], references: [id], onDelete: SetNull)

  @@index([batchId])
  @@map("notificaciones")
}
```

### 3.2 Modelo `User` — **eliminar la relación vieja y agregar las dos nombradas**

La línea existente `notificaciones Notificacion[]` (línea 117 del schema actual) **debe reemplazarse** — Prisma no permite dos relaciones sin nombre a la misma tabla junto con nuevas relaciones nombradas.

```prisma
model User {
  // ... campos existentes sin cambios ...

  // ELIMINAR: notificaciones Notificacion[]

  // AGREGAR:
  notificacionesRecibidas Notificacion[] @relation("NotificacionDestinatario")
  notificacionesEnviadas  Notificacion[] @relation("NotificacionCreador")
}
```

### 3.3 Verificar usos de `user.notificaciones` en el código

**Antes de correr la migración**, hacer un grep de `user.notificaciones` en `src/**/*.{ts,tsx}` y renombrar ocurrencias a `user.notificacionesRecibidas`. Gerardo debe hacer este sweep antes de aplicar la migración.

### 3.4 Migración (solo Gerardo)

```bash
npx prisma migrate dev --name add_notificacion_created_by_batch
```

---

## 4. Cambios de backend

### 4.1 Nuevo builder de email — `src/compartido/lib/email.ts`

Agregar al archivo, siguiendo el patrón de los otros builders. **Importante**: `emailWrapper` y `btnPrimario` son funciones **privadas** del módulo — no exportarlas. Usarlas internamente desde el nuevo builder.

```ts
export function buildComunicacionAdminEmail(data: {
  titulo: string
  mensaje: string
  nombreUsuario: string
}): { subject: string; html: string } {
  const dashUrl = process.env.NEXTAUTH_URL ?? ''
  return {
    subject: data.titulo,
    html: emailWrapper(`
      <h2>Hola ${data.nombreUsuario}</h2>
      <p>${data.mensaje.replace(/\n/g, '<br>')}</p>
      ${btnPrimario(dashUrl, 'Ir a la plataforma')}
    `),
  }
}
```

### 4.2 Endpoint `POST /api/admin/notificaciones`

**Archivo:** `src/app/api/admin/notificaciones/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { logActividad } from '@/compartido/lib/log'
import { sendEmail, buildComunicacionAdminEmail } from '@/compartido/lib/email'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

    const body = await req.json()
    const { titulo, mensaje, tipo, canal, segmento } = body

    if (!titulo || !mensaje) {
      return NextResponse.json({ error: 'Título y mensaje son obligatorios' }, { status: 400 })
    }

    // Construir el filtro con typing de Prisma
    const where: Prisma.UserWhereInput = { active: true }

    if (segmento === 'talleres') {
      where.role = 'TALLER'
    } else if (segmento === 'marcas') {
      where.role = 'MARCA'
    } else if (segmento === 'talleres_bronce') {
      where.role = 'TALLER'
      where.taller = { nivel: 'BRONCE' }
    } else if (segmento === 'talleres_plata') {
      where.role = 'TALLER'
      where.taller = { nivel: 'PLATA' }
    } else if (segmento === 'talleres_oro') {
      where.role = 'TALLER'
      where.taller = { nivel: 'ORO' }
    }
    // 'todos' → sin filtro de rol

    const usuarios = await prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true },
    })

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: 'No hay destinatarios para el segmento seleccionado' },
        { status: 400 }
      )
    }

    // batchId único para agrupar este envío en la UI
    const batchId = randomUUID()

    await prisma.notificacion.createMany({
      data: usuarios.map(u => ({
        userId: u.id,
        tipo: tipo || 'ADMIN_ENVIO',
        titulo,
        mensaje,
        canal: canal || 'PLATAFORMA',
        createdById: session.user!.id!,
        batchId,
      })),
    })

    // Si el canal es EMAIL, enviar emails reales (fire-and-forget con logging)
    // Nota: para el piloto con <100 usuarios, el fire-and-forget es aceptable.
    // Para volúmenes mayores, envolver en waitUntil de @vercel/functions.
    if (canal === 'EMAIL') {
      Promise.allSettled(
        usuarios.map(u =>
          sendEmail({
            to: u.email,
            ...buildComunicacionAdminEmail({
              titulo,
              mensaje,
              nombreUsuario: u.name ?? 'usuario',
            }),
          })
        )
      ).then(results => {
        const fallidos = results.filter(r => r.status === 'rejected').length
        if (fallidos > 0) {
          console.error(
            `[notificaciones] ${fallidos} emails fallaron de ${results.length} en batch ${batchId}`
          )
        }
      }).catch(err => {
        console.error('[notificaciones] Error global enviando emails:', err)
      })
    }

    await logActividad(session.user!.id!, 'NOTIFICACION_MASIVA', {
      titulo,
      segmento,
      canal,
      destinatarios: usuarios.length,
      batchId,
    })

    return NextResponse.json(
      { ok: true, enviadas: usuarios.length, batchId },
      { status: 201 }
    )
  } catch (error) {
    console.error('[notificaciones] Error en POST /api/admin/notificaciones:', error)
    return NextResponse.json({ error: 'Error al enviar notificaciones' }, { status: 500 })
  }
}
```

> **Notas importantes**:
> - `email` no es nullable en `User` (es `String @unique`), así que **no hace falta filtrar por `email: { not: null }`** — rompe el typecheck y es innecesario.
> - `emailWrapper` y `btnPrimario` son privadas en `lib/email.ts` — usar el nuevo `buildComunicacionAdminEmail`.
> - El filtro `where.taller = { nivel: 'BRONCE' }` funciona porque el modelo `User` ya tiene la relación `taller Taller?`.

---

## 5. Cambios de UI — `page.tsx`

**Archivo:** `src/app/(admin)/admin/notificaciones/page.tsx`

### 5.1 Cerrar el bug de autorización

Al inicio del componente, después de `const session = await auth()`:

```ts
if (!session?.user) redirect('/login')
const role = (session.user as { role?: string }).role
if (role !== 'ADMIN') redirect('/unauthorized')
```

### 5.2 Tabs con `searchParams` (server component, sin onClick)

`page.tsx` es un server component. No se puede usar `useState` ni `onClick`. El patrón correcto en este repo es `searchParams + <Link>` — lo usa `/admin/talleres/[id]?tab=formalizacion`, alineado con CLAUDE.md (*"Filtros: searchParams + form method='get' + Prisma where dinamico"*).

```tsx
type Tab = 'comunicaciones' | 'historial'

export default async function AdminNotificacionesPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }> | { tab?: string }
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') redirect('/unauthorized')

  const params = await Promise.resolve(searchParams ?? {})
  const tab: Tab = params.tab === 'historial' ? 'historial' : 'comunicaciones'

  // ... queries específicas por tab ...

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header con stats y botón Nueva Notificación sin cambios */}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Link
          href="?tab=comunicaciones"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'comunicaciones' ? 'bg-brand-blue text-white' : 'border border-gray-300 text-gray-600'
          }`}
        >
          Comunicaciones del admin
        </Link>
        <Link
          href="?tab=historial"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'historial' ? 'bg-brand-blue text-white' : 'border border-gray-300 text-gray-600'
          }`}
        >
          Notificaciones del sistema
        </Link>
      </div>

      {tab === 'comunicaciones' && <ComunicacionesList ... />}
      {tab === 'historial' && <HistorialList ... />}
    </div>
  )
}
```

### 5.3 Query del tab "Comunicaciones del admin" — agrupada por `batchId`

```ts
// Tab "comunicaciones": traer un representante por batchId con count de destinatarios.
// Esto evita mostrar 500 filas idénticas cuando el admin mandó a 500 usuarios.
const batches = await prisma.notificacion.groupBy({
  by: ['batchId'],
  where: { createdById: { not: null }, batchId: { not: null } },
  _count: true,
  _max: { createdAt: true },
  orderBy: { _max: { createdAt: 'desc' } },
  take: 30,
})

// Para cada batch, traer el titulo, mensaje y nombre del admin (una fila de ejemplo)
const batchIds = batches.map(b => b.batchId!).filter(Boolean)
const ejemplos = await prisma.notificacion.findMany({
  where: { batchId: { in: batchIds } },
  distinct: ['batchId'],
  select: {
    batchId: true,
    titulo: true,
    mensaje: true,
    canal: true,
    createdAt: true,
    creadaPor: { select: { name: true } },
  },
})

// Joinear en JS: batches tiene count, ejemplos tiene los datos del mensaje
const comunicaciones = batches.map(b => {
  const ej = ejemplos.find(e => e.batchId === b.batchId)
  return {
    batchId: b.batchId!,
    destinatarios: b._count,
    titulo: ej?.titulo ?? '(sin título)',
    mensaje: ej?.mensaje ?? '',
    canal: ej?.canal ?? 'PLATAFORMA',
    createdAt: ej?.createdAt ?? new Date(),
    enviadoPor: ej?.creadaPor?.name ?? 'Admin',
  }
})
```

Cada item del tab "Comunicaciones" muestra:

- **Título** del mensaje
- **Mensaje** (line-clamp-2)
- **Enviado por**: {nombre del admin}
- **Destinatarios**: {count} usuarios
- **Canal**: {PLATAFORMA | EMAIL}
- **Fecha**

### 5.4 Query del tab "Notificaciones del sistema" — sin cambios mayores

```ts
const notificaciones = await prisma.notificacion.findMany({
  where: { createdById: null },
  include: {
    user: { select: { name: true, role: true } },
  },
  orderBy: { createdAt: 'desc' },
  take: 30,
})
```

Mismo formato de lista que la página actual, pero filtrada a `createdById: null`.

### 5.5 Estado vacío

- Tab "Comunicaciones" vacía → "Todavía no enviaste ninguna comunicación" + CTA "Nueva Notificación".
- Tab "Historial del sistema" vacío → "El sistema no generó notificaciones todavía".

---

## 6. Cambios de UI — formulario

**Archivo:** `src/app/(admin)/admin/notificaciones/notificaciones-client.tsx`

> El path correcto es ese — no `src/taller/componentes/`.

### 6.1 Agregar 3 opciones de segmentación por nivel

```tsx
const segmentos = [
  { value: 'todos',           label: 'Todos los usuarios' },
  { value: 'talleres',        label: 'Todos los talleres' },
  { value: 'talleres_bronce', label: 'Talleres Bronce' },
  { value: 'talleres_plata',  label: 'Talleres Plata' },
  { value: 'talleres_oro',    label: 'Talleres Oro' },
  { value: 'marcas',          label: 'Todas las marcas' },
] as const

type Segmento = typeof segmentos[number]['value']
```

Reemplazar el radio group del spec actual (líneas 96-111 del client) por este array mapeado.

### 6.2 Descripciones claras en el selector de canal

```tsx
<label className="block text-sm font-semibold text-gray-700 mb-2">Canal</label>
<div className="space-y-2">
  <label className="flex items-start gap-2 cursor-pointer">
    <input
      type="radio"
      name="canal"
      value="PLATAFORMA"
      checked={form.canal === 'PLATAFORMA'}
      onChange={() => setForm(f => ({ ...f, canal: 'PLATAFORMA' }))}
    />
    <div>
      <span className="text-sm font-medium">Solo en plataforma</span>
      <p className="text-xs text-gray-400">Aparece en la bandeja del usuario. No se envía email.</p>
    </div>
  </label>
  <label className="flex items-start gap-2 cursor-pointer">
    <input
      type="radio"
      name="canal"
      value="EMAIL"
      checked={form.canal === 'EMAIL'}
      onChange={() => setForm(f => ({ ...f, canal: 'EMAIL' }))}
    />
    <div>
      <span className="text-sm font-medium">Email + plataforma</span>
      <p className="text-xs text-gray-400">Se envía por email y también queda en la bandeja.</p>
    </div>
  </label>
</div>
```

---

## 7. Casos borde

- **Admin envía a `talleres_bronce` sin talleres BRONCE activos** → endpoint retorna 400 *"No hay destinatarios para el segmento seleccionado"*.
- **Canal EMAIL con 25 destinatarios** → `Promise.allSettled` no bloquea la respuesta, el admin ve "enviado" inmediatamente, los emails se procesan post-response.
- **Email falla para 3 de 25 usuarios** → se loguea `[notificaciones] 3 emails fallaron de 25 en batch <batchId>`. El resto llega. La notificación in-app se creó para los 25 igual.
- **`createdById` con usuario eliminado** → `onDelete: SetNull` deja el campo en null. En la UI, `creadaPor?.name ?? 'Sistema'` → se muestra como "Sistema" cuando el admin creador fue eliminado. Ligera ambigüedad pero aceptable.
- **Tab "Comunicaciones" vacía** → estado vacío con CTA "Envía tu primera comunicación".
- **Envío a "todos" con `N` grande** → el `Promise.allSettled` puede tocar rate limits de SendGrid para `N > ~100`. **Riesgo conocido para piloto**: si pasa, batchear en chunks de 50 con `await`. No resolver ahora.
- **Fire-and-forget post-response**: con Fluid Compute (default en Vercel) hay graceful shutdown. Para piloto con <100 usuarios es suficiente. **Upgrade futuro**: envolver en `waitUntil` de `@vercel/functions` para garantizar completitud.

---

## 8. Criterio de aceptación

- [ ] `/admin/notificaciones` redirige a `/unauthorized` si el usuario no tiene rol ADMIN
- [ ] La página tiene dos tabs: "Comunicaciones del admin" y "Notificaciones del sistema", navegables con `?tab=...`
- [ ] Tab "Comunicaciones" muestra envíos agrupados por `batchId` (un item por masiva, no uno por destinatario)
- [ ] Cada item del tab "Comunicaciones" muestra título, mensaje, enviado por, count de destinatarios, canal y fecha
- [ ] Tab "Historial del sistema" muestra solo notificaciones con `createdById IS NULL`
- [ ] El formulario tiene 6 opciones de segmentación (todos, talleres, BRONCE, PLATA, ORO, marcas)
- [ ] Al enviar con canal EMAIL se envían emails reales via SendGrid usando `buildComunicacionAdminEmail`
- [ ] Los errores de email se loguean con prefijo `[notificaciones]` sin bloquear la respuesta
- [ ] El schema tiene `createdById` y `batchId` nuevos, con las relaciones nombradas en User
- [ ] El código que usaba `user.notificaciones` fue renombrado a `user.notificacionesRecibidas`
- [ ] Build pasa sin errores de TypeScript ni de Prisma

---

## 9. Tests (verificación manual)

1. **Gate de autorización**:
   - Login como taller → ir a `/admin/notificaciones` → redirige a `/unauthorized`
   - Login como admin → accede normalmente
2. **Segmentación por nivel**:
   - Login como admin → nueva notificación → segmento "Talleres Bronce" → canal "Solo plataforma" → enviar
   - Verificar en DB que solo se crearon filas para talleres con `nivel = 'BRONCE'`
   - Login como taller PLATA → bandeja no muestra la notificación
   - Login como taller BRONCE → bandeja la muestra
3. **Envío real de email**:
   - Nueva notificación → canal "Email + plataforma" → segmento "Todos los talleres"
   - Verificar en Mailtrap/SendGrid que los emails llegaron
   - Verificar en logs de Vercel que no hay errores `[notificaciones]`
4. **Agrupación por batch**:
   - Enviar un masivo a 10+ destinatarios
   - Tab "Comunicaciones del admin" debe mostrar **1 ítem** (no 10), con "10 destinatarios"
5. **Tabs con searchParams**:
   - Ir a `/admin/notificaciones?tab=historial` → solo notifs del sistema
   - Ir a `/admin/notificaciones?tab=comunicaciones` → solo envíos del admin
   - Click en el tab correspondiente debe cambiar la URL sin romper
6. **Tab vacío**:
   - En un entorno fresco, tab "Comunicaciones" → estado vacío con CTA
7. **Fallback de admin eliminado**:
   - Borrar al admin que envió una comunicación
   - Recargar la página → el ítem sigue apareciendo, con "Enviado por: Sistema" (fallback del null)

---

## 10. Archivos tocados

| Archivo | Cambios | Responsable |
|---|---|---|
| `prisma/schema.prisma` | Nuevos campos + relaciones nombradas | Gerardo |
| `src/compartido/lib/email.ts` | Nuevo builder `buildComunicacionAdminEmail` | Gerardo |
| `src/app/api/admin/notificaciones/route.ts` | Segmentación, batchId, email real | Gerardo |
| `src/app/(admin)/admin/notificaciones/page.tsx` | Auth gate, tabs, queries por batch | Sergio |
| `src/app/(admin)/admin/notificaciones/notificaciones-client.tsx` | 6 segmentos, descripciones de canal | Sergio |
| `src/**/*.{ts,tsx}` (grep) | Renombrar `user.notificaciones` → `user.notificacionesRecibidas` | Gerardo (sweep) |

No se crean tablas nuevas.
