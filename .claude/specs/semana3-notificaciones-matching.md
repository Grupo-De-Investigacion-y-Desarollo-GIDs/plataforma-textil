# Spec: Notificaciones a talleres compatibles al publicar pedido

- **Semana:** 3
- **Asignado a:** Gerardo
- **Dependencias:** semana2-schema-e2 + semana2-api-cotizaciones mergeados

---

## ANTES DE ARRANCAR

- [ ] semana2-schema-e2 — estado PUBLICADO existe en enum, API de pedidos tiene transiciones explicitas
- [ ] semana2-api-cotizaciones — helper `notificarCotizacion` existe en `src/compartido/lib/notificaciones.ts`

---

## 1. Contexto

Cuando una marca publica un pedido (BORRADOR → PUBLICADO), el sistema debe notificar automaticamente a los talleres compatibles. El matching se basa en la prenda del pedido, la capacidad del taller y su nivel de formalizacion. Solo PLATA y ORO reciben notificaciones de pedidos.

---

## 2. Que construir

- Funcion `notificarTalleresCompatibles(pedidoId)` en `src/compartido/lib/notificaciones.ts`
- Llamar la funcion desde `PUT /api/pedidos/[id]` cuando el estado cambia a PUBLICADO
- Template de email para notificacion de pedido disponible
- Registro en tabla `Notificacion` para cada taller notificado

---

## 3. Datos

- Matching por `tipoPrendaId` via `TallerPrenda` si existe, fallback a PLATA/ORO sin filtro de prenda
- Filtro de capacidad: `taller.capacidadMensual >= pedido.cantidad`
- Filtro de nivel: solo PLATA y ORO
- Ordenar por puntaje descendente
- Maximo 20 talleres notificados por pedido (evitar spam)

---

## 4. Prescripciones tecnicas

### Archivo a modificar — `src/compartido/lib/notificaciones.ts`

Agregar funcion despues de `notificarCotizacion`:

```typescript
export async function notificarTalleresCompatibles(pedidoId: string): Promise<void> {
  // 1. Obtener pedido con marca
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { marca: { select: { nombre: true } } },
  })
  if (!pedido) return

  // 2. Construir where clause para talleres compatibles
  const whereClause: Prisma.TallerWhereInput = {
    nivel: { in: ['PLATA', 'ORO'] },
    capacidadMensual: { gte: pedido.cantidad },
    user: { active: true },
    ...(pedido.tipoPrendaId
      ? { prendas: { some: { prendaId: pedido.tipoPrendaId } } }
      : {}),
  }

  // 3. Buscar talleres compatibles ordenados por puntaje
  const talleres = await prisma.taller.findMany({
    where: whereClause,
    include: { user: { select: { id: true, email: true } } },
    orderBy: { puntaje: 'desc' },
    take: 20,
  })

  if (talleres.length === 0) return

  // 4. Crear notificaciones y enviar emails fire-and-forget
  for (const taller of talleres) {
    // Notificacion in-app
    prisma.notificacion.create({
      data: {
        userId: taller.user.id,
        tipo: 'PEDIDO_DISPONIBLE',
        titulo: `Nuevo pedido disponible: ${pedido.tipoPrenda}`,
        mensaje: `${pedido.marca.nombre} publico un pedido de ${pedido.cantidad} unidades de ${pedido.tipoPrenda}. Podes cotizar!`,
        canal: 'PLATAFORMA',
      },
    }).catch(() => {})

    // Email
    sendEmail({
      to: taller.user.email!,
      ...buildPedidoDisponibleEmail({
        nombreTaller: taller.nombre,
        nombreMarca: pedido.marca.nombre,
        tipoPrenda: pedido.tipoPrenda,
        cantidad: pedido.cantidad,
        pedidoUrl: `${process.env.NEXTAUTH_URL}/taller/pedidos/disponibles/${pedido.id}`,
      }),
    }).catch(() => {})
  }
}
```

### Archivo a modificar — `src/compartido/lib/email.ts`

Agregar template al final del archivo:

```typescript
export function buildPedidoDisponibleEmail(data: {
  nombreTaller: string
  nombreMarca: string
  tipoPrenda: string
  cantidad: number
  pedidoUrl: string
}): { subject: string; html: string } {
  return {
    subject: `Nuevo pedido disponible: ${data.tipoPrenda} - PDT`,
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px;">Nuevo pedido disponible</h2>
      <p>Hola <strong>${data.nombreTaller}</strong>, ${data.nombreMarca} publico un pedido de <strong>${data.cantidad} unidades de ${data.tipoPrenda}</strong>.</p>
      <p>Podes ver el pedido y enviar tu cotizacion desde la plataforma.</p>
      ${btnPrimario(data.pedidoUrl, 'Ver pedido y cotizar')}
      <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">Solo recibis este email porque tu taller es compatible con este pedido.</p>
    `),
  }
}
```

### Archivo a modificar — `src/app/api/pedidos/[id]/route.ts`

Despues del merge de `semana2-schema-e2`, la API ya tiene transiciones explicitas con un mapa. Ubicar la seccion donde se hace el update exitoso de estado y agregar la llamada fire-and-forget **despues del update de Prisma y antes del return**, solo cuando el nuevo estado es PUBLICADO:

```typescript
import { notificarTalleresCompatibles } from '@/compartido/lib/notificaciones'

// Dentro del bloque de transicion de estado, despues del update exitoso:
const pedido = await prisma.pedido.update({
  where: { id },
  data: { estado: body.estado },
})

// Notificar talleres compatibles cuando se publica
if (body.estado === 'PUBLICADO') {
  notificarTalleresCompatibles(id).catch(() => {})
}

return NextResponse.json(pedido)
```

La llamada es fire-and-forget — si la notificacion falla, el pedido ya se publico exitosamente y la respuesta se retorna sin bloquear.

---

## 5. Casos borde

- **Sin talleres compatibles** → funcion retorna sin error, no se envia nada
- **Taller sin email** → `sendEmail` falla silenciosamente con `.catch(() => {})`
- **`tipoPrendaId` null** → fallback: notifica a PLATA/ORO sin filtro de prenda (reciben todos los compatibles por capacidad)
- **`capacidadMensual = 0`** → taller no recibe notificaciones (0 >= cantidad siempre es false). Si todos los talleres compatibles tienen `capacidadMensual = 0`, ninguno recibe notificacion. La capacidad es responsabilidad del taller actualizarla en su perfil. El admin puede actualizarla manualmente desde Prisma Studio si hay problemas en el piloto.
- **Pedido ya PUBLICADO que se intenta publicar de nuevo** → API retorna 400 por transicion invalida (la logica de transiciones del spec schema-e2 lo bloquea)
- **Mas de 20 talleres compatibles** → `take: 20` limita a los 20 con mayor puntaje

---

## 6. Criterio de aceptacion

- [ ] Al publicar un pedido de Remeras, los talleres PLATA y ORO que trabajan Remera y tienen capacidad suficiente reciben notificacion
- [ ] Taller BRONCE no recibe notificacion
- [ ] Taller con `capacidadMensual < cantidad` del pedido no recibe notificacion
- [ ] Notificacion creada en tabla `Notificacion` con `tipo: 'PEDIDO_DISPONIBLE'` y `canal: 'PLATAFORMA'` para cada taller notificado
- [ ] Email enviado a cada taller notificado con template correcto
- [ ] Si no hay talleres compatibles, no se crea ninguna notificacion
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Publicar pedido de 500 Remeras desde marca de prueba
2. Verificar en Supabase tabla `notificaciones` que se crearon registros para talleres PLATA y ORO con Remera
3. Verificar que taller BRONCE NO tiene notificacion
4. Verificar que el email llego (o aparece en consola en development)
5. Publicar pedido con `tipoPrendaId = null` → verificar que se notifica a todos los PLATA/ORO con capacidad suficiente
6. Verificar que no se crearon mas de 20 notificaciones
