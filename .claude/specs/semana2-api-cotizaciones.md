# Spec: API Cotizaciones

- **Semana:** 2
- **Asignado a:** Gerardo
- **Dependencias:** semana2-schema-e2 mergeado (modelo Cotizacion debe existir)

---

## 1. Contexto

El Escenario 2 requiere que los talleres puedan cotizar pedidos publicados por marcas. El modelo Cotizacion ya existe en el schema (spec semana2-schema-e2). Este spec implementa el CRUD completo con ownership, vencimiento lazy y notificaciones automaticas por email + registro en tabla Notificacion.

---

## 2. Que construir

- `GET /api/cotizaciones` — lista cotizaciones (taller ve las suyas, marca ve las de sus pedidos, admin ve todas)
- `POST /api/cotizaciones` — taller crea cotizacion sobre un pedido PUBLICADO
- `PUT /api/cotizaciones/[id]` — marca acepta o rechaza, taller retira
- Vencimiento lazy: al consultar cotizaciones, marcar VENCIDA si `venceEn < now()`
- Notificacion email + Notificacion en DB en eventos clave
- Templates de email nuevos para cotizaciones

---

## 3. Datos

- Modelo `Cotizacion` ya existe (spec semana2-schema-e2)
- Tabla `Notificacion` ya existe en schema
- `sendEmail()` ya funciona en `src/compartido/lib/email.ts`
- Agregar 3 templates de email en `email.ts`:
  - `buildCotizacionRecibidaEmail` — para la marca cuando recibe cotizacion
  - `buildCotizacionAceptadaEmail` — para el taller cuando la marca acepta
  - `buildCotizacionRechazadaEmail` — para el taller cuando la marca rechaza

---

## 4. Prescripciones tecnicas

### Coexistencia de rutas de asignacion

Este spec crea una nueva ruta para cotizaciones que maneja la transicion `PUBLICADO → EN_EJECUCION` al aceptar una cotizacion. La ruta existente `POST /api/pedidos/[id]/ordenes` mantiene la auto-transicion `BORRADOR → EN_EJECUCION` para asignacion directa por admin (sin pasar por cotizaciones). No hay conflicto — son dos flujos distintos para dos estados iniciales distintos.

### Archivo nuevo — `src/app/api/cotizaciones/route.ts`

#### GET /api/cotizaciones

Query params opcionales: `pedidoId`, `tallerId`.

Antes de retornar resultados, marcar cotizaciones vencidas (check lazy):

```typescript
await prisma.cotizacion.updateMany({
  where: {
    estado: 'ENVIADA',
    venceEn: { lt: new Date() },
  },
  data: { estado: 'VENCIDA' },
})
```

Filtro por rol:

```typescript
const session = await auth()
const role = (session.user as { role?: string }).role
const userId = session.user.id!

const { searchParams } = req.nextUrl
const pedidoId = searchParams.get('pedidoId')
const tallerId = searchParams.get('tallerId')

let where: Prisma.CotizacionWhereInput = {}

if (role === 'TALLER') {
  // Taller ve solo sus cotizaciones
  const taller = await prisma.taller.findUnique({ where: { userId }, select: { id: true } })
  if (!taller) return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
  where = { tallerId: taller.id, ...(pedidoId ? { pedidoId } : {}) }
} else if (role === 'MARCA') {
  // Marca ve cotizaciones de todos sus pedidos, con filtro opcional por pedidoId
  where = {
    pedido: { marca: { userId } },
    ...(pedidoId ? { pedidoId } : {}),
  }
} else if (role === 'ADMIN') {
  // Admin ve todas, con filtros opcionales
  where = {
    ...(pedidoId ? { pedidoId } : {}),
    ...(tallerId ? { tallerId } : {}),
  }
} else {
  return NextResponse.json({ error: 'Rol no autorizado' }, { status: 403 })
}

const cotizaciones = await prisma.cotizacion.findMany({
  where,
  include: {
    taller: { select: { id: true, nombre: true, nivel: true } },
    pedido: { select: { id: true, omId: true, tipoPrenda: true, cantidad: true, estado: true } },
  },
  orderBy: { createdAt: 'desc' },
})
```

#### POST /api/cotizaciones

Solo TALLER puede crear. Validar con Zod:

```typescript
import { z } from 'zod'

const cotizacionSchema = z.object({
  pedidoId: z.string().min(1, 'pedidoId requerido'),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  plazoDias: z.number().int().positive('El plazo debe ser al menos 1 dia'),
  proceso: z.string().min(3, 'Proceso debe tener al menos 3 caracteres'),
  mensaje: z.string().optional(),
})
```

Logica:

```typescript
const session = await auth()
const role = (session.user as { role?: string }).role
if (role !== 'TALLER') {
  return NextResponse.json({ error: 'Solo talleres pueden cotizar' }, { status: 403 })
}

const taller = await prisma.taller.findUnique({
  where: { userId: session.user.id! },
  select: { id: true, nombre: true },
})
if (!taller) return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })

const body = await req.json()
const parsed = cotizacionSchema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
}
const data = parsed.data

// Verificar que el pedido existe y esta PUBLICADO
const pedido = await prisma.pedido.findUnique({
  where: { id: data.pedidoId },
  include: { marca: { select: { userId: true, nombre: true } } },
})
if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
if (pedido.estado !== 'PUBLICADO') {
  return NextResponse.json({ error: 'El pedido no esta disponible para cotizar' }, { status: 400 })
}

// Calcular vencimiento: 7 dias desde ahora
const venceEn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

try {
  const cotizacion = await prisma.cotizacion.create({
    data: {
      pedidoId: data.pedidoId,
      tallerId: taller.id,
      precio: data.precio,
      plazoDias: data.plazoDias,
      proceso: data.proceso,
      mensaje: data.mensaje ?? null,
      venceEn,
    },
  })

  // Notificar a la marca (fire-and-forget, despues del create exitoso)
  notificarCotizacion('RECIBIDA', {
    cotizacion,
    taller: { nombre: taller.nombre },
    marca: { userId: pedido.marca.userId, nombre: pedido.marca.nombre },
    pedido: { omId: pedido.omId },
  })

  return NextResponse.json(cotizacion, { status: 201 })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return NextResponse.json(
      { error: 'Ya tenes una cotizacion activa para este pedido' },
      { status: 409 }
    )
  }
  throw error
}
```

### Archivo nuevo — `src/app/api/cotizaciones/[id]/route.ts`

#### PUT /api/cotizaciones/[id]

Recibe `{ accion: 'ACEPTAR' | 'RECHAZAR' | 'RETIRAR' }`.

```typescript
const session = await auth()
const role = (session.user as { role?: string }).role
const userId = session.user.id!
const { id } = await params

const cotizacion = await prisma.cotizacion.findUnique({
  where: { id },
  include: {
    pedido: {
      include: { marca: { select: { userId: true, nombre: true } } },
    },
    taller: { select: { id: true, userId: true, nombre: true } },
  },
})

if (!cotizacion) return NextResponse.json({ error: 'Cotizacion no encontrada' }, { status: 404 })

const body = await req.json()
const accion = body.accion // 'ACEPTAR' | 'RECHAZAR' | 'RETIRAR'

// --- ACEPTAR (solo MARCA duena del pedido o ADMIN) ---
if (accion === 'ACEPTAR') {
  const isMarcaOwner = cotizacion.pedido.marca.userId === userId
  if (role !== 'ADMIN' && !isMarcaOwner) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }
  if (cotizacion.estado !== 'ENVIADA') {
    return NextResponse.json({ error: 'Solo se puede aceptar una cotizacion en estado ENVIADA' }, { status: 400 })
  }
  if (cotizacion.venceEn < new Date()) {
    return NextResponse.json({ error: 'La cotizacion vencio' }, { status: 400 })
  }

  // Generar moId con formato existente
  const moId = `MO-${new Date().getFullYear()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`

  // Transaccion atomica: 4 operaciones
  await prisma.$transaction([
    prisma.cotizacion.update({
      where: { id },
      data: { estado: 'ACEPTADA' },
    }),
    prisma.cotizacion.updateMany({
      where: {
        pedidoId: cotizacion.pedidoId,
        id: { not: id },
        estado: 'ENVIADA',
      },
      data: { estado: 'RECHAZADA' },
    }),
    prisma.ordenManufactura.create({
      data: {
        moId,
        pedidoId: cotizacion.pedidoId,
        tallerId: cotizacion.tallerId,
        proceso: cotizacion.proceso,
        precio: cotizacion.precio,
        plazoDias: cotizacion.plazoDias,
      },
    }),
    prisma.pedido.update({
      where: { id: cotizacion.pedidoId },
      data: { estado: 'EN_EJECUCION' },
    }),
  ])

  // Despues del commit: notificaciones fire-and-forget
  // 1. Notificar al taller ganador
  notificarCotizacion('ACEPTADA', {
    cotizacion,
    taller: { nombre: cotizacion.taller.nombre, userId: cotizacion.taller.userId },
    marca: { nombre: cotizacion.pedido.marca.nombre },
    pedido: { omId: cotizacion.pedido.omId },
  })

  // 2. Notificar a talleres rechazados
  const rechazadas = await prisma.cotizacion.findMany({
    where: {
      pedidoId: cotizacion.pedidoId,
      id: { not: id },
      estado: 'RECHAZADA',
    },
    include: {
      taller: { select: { nombre: true, userId: true, user: { select: { email: true } } } },
    },
  })
  for (const cot of rechazadas) {
    notificarCotizacion('RECHAZADA', {
      cotizacion: cot,
      taller: { nombre: cot.taller.nombre, userId: cot.taller.userId },
      marca: { nombre: cotizacion.pedido.marca.nombre },
      pedido: { omId: cotizacion.pedido.omId },
    })
  }

  return NextResponse.json({ ok: true, moId })
}

// --- RECHAZAR (solo MARCA duena o ADMIN) ---
if (accion === 'RECHAZAR') {
  const isMarcaOwner = cotizacion.pedido.marca.userId === userId
  if (role !== 'ADMIN' && !isMarcaOwner) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }
  if (cotizacion.estado !== 'ENVIADA') {
    return NextResponse.json({ error: 'Solo se puede rechazar una cotizacion en estado ENVIADA' }, { status: 400 })
  }

  await prisma.cotizacion.update({ where: { id }, data: { estado: 'RECHAZADA' } })

  notificarCotizacion('RECHAZADA', {
    cotizacion,
    taller: { nombre: cotizacion.taller.nombre, userId: cotizacion.taller.userId },
    marca: { nombre: cotizacion.pedido.marca.nombre },
    pedido: { omId: cotizacion.pedido.omId },
  })

  return NextResponse.json({ ok: true })
}

// --- RETIRAR (solo TALLER dueno de la cotizacion) ---
if (accion === 'RETIRAR') {
  const isTallerOwner = cotizacion.taller.userId === userId
  if (role !== 'ADMIN' && !isTallerOwner) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }
  if (cotizacion.estado !== 'ENVIADA') {
    return NextResponse.json({ error: 'Solo se puede retirar una cotizacion en estado ENVIADA' }, { status: 400 })
  }

  await prisma.cotizacion.update({ where: { id }, data: { estado: 'RECHAZADA' } })

  return NextResponse.json({ ok: true })
}

return NextResponse.json({ error: 'Accion invalida. Usar ACEPTAR, RECHAZAR o RETIRAR' }, { status: 400 })
```

### Archivo nuevo — `src/compartido/lib/notificaciones.ts`

Helper centralizado para notificaciones de cotizaciones:

```typescript
import { prisma } from './prisma'
import { sendEmail, buildCotizacionRecibidaEmail, buildCotizacionAceptadaEmail, buildCotizacionRechazadaEmail } from './email'

interface NotificacionData {
  cotizacion: { id: string; precio: number; plazoDias: number; proceso: string }
  taller: { nombre: string; userId?: string }
  marca: { nombre: string; userId?: string }
  pedido: { omId: string }
}

export function notificarCotizacion(
  tipo: 'RECIBIDA' | 'ACEPTADA' | 'RECHAZADA',
  data: NotificacionData,
) {
  const titulos = {
    RECIBIDA: 'Nueva cotizacion recibida',
    ACEPTADA: 'Tu cotizacion fue aceptada',
    RECHAZADA: 'Cotizacion no seleccionada',
  }
  const mensajes = {
    RECIBIDA: `${data.taller.nombre} cotizo tu pedido ${data.pedido.omId}: $${data.cotizacion.precio} en ${data.cotizacion.plazoDias} dias.`,
    ACEPTADA: `${data.marca.nombre} acepto tu cotizacion para el pedido ${data.pedido.omId}. Precio: $${data.cotizacion.precio}.`,
    RECHAZADA: `La marca ${data.marca.nombre} selecciono otra cotizacion para el pedido ${data.pedido.omId}.`,
  }

  // Destino: RECIBIDA va a la marca, ACEPTADA/RECHAZADA va al taller
  const destinoUserId = tipo === 'RECIBIDA' ? data.marca.userId : data.taller.userId
  if (!destinoUserId) return

  // 1. Crear notificacion in-app (canal PLATAFORMA)
  prisma.notificacion.create({
    data: {
      userId: destinoUserId,
      tipo: 'COTIZACION',
      titulo: titulos[tipo],
      mensaje: mensajes[tipo],
      canal: 'PLATAFORMA',
    },
  }).catch((err) => console.error('Error creando notificacion:', err))

  // 2. Enviar email fire-and-forget
  prisma.user.findUnique({
    where: { id: destinoUserId },
    select: { email: true },
  }).then((user) => {
    if (!user?.email) return
    const builders = {
      RECIBIDA: () => buildCotizacionRecibidaEmail({
        nombreMarca: data.marca.nombre,
        nombreTaller: data.taller.nombre,
        proceso: data.cotizacion.proceso,
        precio: data.cotizacion.precio,
        plazoDias: data.cotizacion.plazoDias,
      }),
      ACEPTADA: () => buildCotizacionAceptadaEmail({
        nombreTaller: data.taller.nombre,
        nombreMarca: data.marca.nombre,
        proceso: data.cotizacion.proceso,
        precio: data.cotizacion.precio,
        plazoDias: data.cotizacion.plazoDias,
      }),
      RECHAZADA: () => buildCotizacionRechazadaEmail({
        nombreTaller: data.taller.nombre,
        nombreMarca: data.marca.nombre,
        proceso: data.cotizacion.proceso,
      }),
    }
    sendEmail({ to: user.email, ...builders[tipo]() }).catch(() => {})
  }).catch(() => {})
}
```

Este helper es fire-and-forget — no usa `await`, no bloquea la respuesta de la API.

### Archivo a modificar — `src/compartido/lib/email.ts`

Agregar 3 templates al final del archivo, reutilizando `emailWrapper` y `btnPrimario`:

```typescript
export function buildCotizacionRecibidaEmail(data: {
  nombreMarca: string
  nombreTaller: string
  proceso: string
  precio: number
  plazoDias: number
}): { subject: string; html: string } {
  return {
    subject: `Nueva cotizacion de ${data.nombreTaller} - PDT`,
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px;">Nueva cotizacion recibida</h2>
      <p>Hola <strong>${data.nombreMarca}</strong>, el taller <strong>${data.nombreTaller}</strong> cotizo tu pedido:</p>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Proceso:</strong> ${data.proceso}</p>
        <p style="margin: 4px 0;"><strong>Precio:</strong> $${data.precio.toLocaleString('es-AR')}</p>
        <p style="margin: 4px 0;"><strong>Plazo:</strong> ${data.plazoDias} dias</p>
      </div>
      ${btnPrimario(`${process.env.NEXTAUTH_URL ?? ''}/marca/pedidos`, 'Ver cotizaciones')}
    `),
  }
}

export function buildCotizacionAceptadaEmail(data: {
  nombreTaller: string
  nombreMarca: string
  proceso: string
  precio: number
  plazoDias: number
}): { subject: string; html: string } {
  return {
    subject: 'Tu cotizacion fue aceptada - PDT',
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px; color: #16a34a;">Cotizacion aceptada</h2>
      <p>Felicitaciones <strong>${data.nombreTaller}</strong>, la marca <strong>${data.nombreMarca}</strong> acepto tu cotizacion:</p>
      <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Proceso:</strong> ${data.proceso}</p>
        <p style="margin: 4px 0;"><strong>Precio:</strong> $${data.precio.toLocaleString('es-AR')}</p>
        <p style="margin: 4px 0;"><strong>Plazo:</strong> ${data.plazoDias} dias</p>
      </div>
      <p>Ya se creo la orden de manufactura. Revisa los detalles en tu panel.</p>
      ${btnPrimario(`${process.env.NEXTAUTH_URL ?? ''}/taller/pedidos`, 'Ver mis pedidos')}
    `),
  }
}

export function buildCotizacionRechazadaEmail(data: {
  nombreTaller: string
  nombreMarca: string
  proceso: string
}): { subject: string; html: string } {
  return {
    subject: 'Actualizacion sobre tu cotizacion - PDT',
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px;">Cotizacion no seleccionada</h2>
      <p>Hola <strong>${data.nombreTaller}</strong>, la marca <strong>${data.nombreMarca}</strong> selecciono otra cotizacion para el proceso <strong>${data.proceso}</strong>.</p>
      <p>Segui cotizando otros pedidos disponibles en la plataforma.</p>
      ${btnPrimario(`${process.env.NEXTAUTH_URL ?? ''}/taller/pedidos`, 'Ver pedidos disponibles')}
    `),
  }
}
```

---

## 5. Casos borde

- **Taller intenta cotizar pedido en estado BORRADOR** → 400 "El pedido no esta disponible para cotizar"
- **Taller intenta cotizar por segunda vez el mismo pedido** → Prisma P2002 unique constraint → 409 "Ya tenes una cotizacion activa para este pedido"
- **Marca acepta cotizacion ya vencida** → 400 "La cotizacion vencio" (check explicito de `venceEn < now()` antes de aceptar)
- **Marca acepta cotizacion y falla la creacion de OrdenManufactura** → rollback completo con `$transaction` — ninguna de las 4 operaciones se aplica
- **Cotizacion vencida aparece como ENVIADA hasta que alguien consulta** → comportamiento esperado del check lazy. El `updateMany` al inicio del GET corrige el estado.
- **Taller sin telefono** → email es el unico canal, no bloquea
- **Marca consulta GET sin pedidoId** → ve cotizaciones de TODOS sus pedidos (join via `pedido.marca.userId`)
- **Emails a talleres rechazados** → se envian despues del `$transaction` exitoso, fire-and-forget. Si un email falla, los demas se siguen enviando (iteracion independiente con `.catch()` individual)
- **moId duplicado** → extremadamente improbable con UUID. Si ocurre, el `$transaction` hace rollback y retorna error 500.

---

## 6. Criterio de aceptacion

- [ ] `POST /api/cotizaciones` crea cotizacion con `venceEn = now() + 7 dias`
- [ ] `POST /api/cotizaciones` valida body con Zod — precio positivo, plazoDias entero positivo, proceso min 3 chars
- [ ] `GET /api/cotizaciones` marca VENCIDA si `venceEn < now()` (check lazy)
- [ ] `GET /api/cotizaciones` como MARCA sin pedidoId retorna cotizaciones de todos sus pedidos
- [ ] `GET /api/cotizaciones` como TALLER retorna solo sus cotizaciones
- [ ] Taller no puede cotizar pedido no PUBLICADO → 400
- [ ] Segunda cotizacion del mismo taller al mismo pedido → 409
- [ ] Al aceptar cotizacion: OrdenManufactura creada con moId generado, pedido pasa a EN_EJECUCION, otras cotizaciones rechazadas
- [ ] Aceptar cotizacion vencida → 400
- [ ] Notificacion en DB creada con `canal: 'PLATAFORMA'` en cada evento
- [ ] Email enviado fire-and-forget en cada evento
- [ ] Emails a talleres rechazados se envian despues del commit, no dentro del `$transaction`
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Crear pedido PUBLICADO desde marca de prueba
2. Como taller: `POST /api/cotizaciones` con body valido → verificar `venceEn` y notificacion en tabla `notificaciones`
3. Como taller: intentar segunda cotizacion al mismo pedido → debe retornar 409
4. Como taller: intentar cotizar pedido en BORRADOR → debe retornar 400
5. Como marca: `GET /api/cotizaciones` sin pedidoId → debe ver cotizaciones de todos sus pedidos
6. Como marca: `PUT /api/cotizaciones/[id]` con `{ accion: 'ACEPTAR' }` → verificar OrdenManufactura creada con moId + pedido EN_EJECUCION
7. Verificar que las otras cotizaciones del pedido pasaron a RECHAZADA
8. Verificar notificaciones en tabla `notificaciones` — canal debe ser `PLATAFORMA`
9. Verificar emails en consola (dev) o bandeja (produccion) para taller aceptado y rechazados
10. Esperar 7 dias (o modificar `venceEn` manualmente en DB) y hacer `GET` → cotizacion debe aparecer como VENCIDA
