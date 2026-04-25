# Spec: WhatsApp como canal de notificacion (sin API)

- **Version:** V3
- **Origen:** V3_BACKLOG F-02
- **Asignado a:** Gerardo
- **Prioridad:** Critica — sin canal WhatsApp los talleres reales no usan la plataforma

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG I-01 mergeado (ambientes separados)
- [ ] Modelo `Notificacion` ya existe en DB (de V2)

---

## 1. Contexto

**El problema central del piloto:**

Los talleres familiares argentinos viven en WhatsApp. No abren browsers, no revisan emails, no entran a una "plataforma web" salvo que algo concreto los lleve. Si la plataforma manda solo notificaciones in-app, el taller nunca sabe que tiene un pedido nuevo o que un documento fue aprobado.

**Lo que NO vamos a hacer en V3:**

Construir un chatbot completo con WhatsApp Business API. Esa decision ya se tomo:
- Costo: $25-100/mes por numero + complejidad de aprobacion de templates por Meta
- Tiempo: 2-3 semanas de desarrollo del bot
- Mantenimiento: cada plantilla nueva requiere aprobacion manual de Meta

**Lo que SI vamos a hacer:**

Usar WhatsApp como **canal de notificacion con links profundos** que llevan al taller a la plataforma web cuando hay algo que requiere su atencion. El taller recibe un mensaje en WhatsApp, hace tap en el link, y entra a la pagina especifica de la plataforma ya autenticado.

**Ejemplo de flujo:**

1. Marca crea pedido compatible con Taller La Aguja
2. Sistema genera notificacion + WhatsApp message
3. Roberto (dueno del taller) recibe WhatsApp:
   > "PDT — Tenes un pedido nuevo de DulceModa: 800 remeras basicas, costura premium. Mira los detalles -> https://plataforma-textil.vercel.app/n/abc123"
4. Roberto hace tap, entra autenticado a la plataforma, ve el pedido y cotiza

Sin chatbot, sin API. Solo links que abren el browser del celular.

---

## 2. Que construir

1. **Generador de mensajes WhatsApp** — formatea el texto con preview optimizado para WhatsApp
2. **Links profundos con magic auth** — URLs que auto-loguean al taller (validas por 24hs)
3. **Configuracion de telefono por usuario** — campo `User.phone` ya existe (opcional), validar que este en formato internacional
4. **Triggers desde eventos clave** — el sistema arma el WhatsApp cuando ocurre algo notificable
5. **UI para que el admin/estado dispare manualmente** — wizard de envio secuencial por WhatsApp
6. **Modo de envio:** dos opciones que se eligen en runtime

### 2.1 — Modos de envio

**Modo A: link `wa.me` (default V3)**
- Genera URL `https://wa.me/541123456789?text=...`
- El admin/marca/sistema hace click -> abre WhatsApp Web/app con el mensaje pre-cargado
- El admin presiona enviar manualmente
- **Ventaja:** zero infraestructura, zero costo
- **Desventaja:** requiere accion humana del lado del admin

**Modo B: WhatsApp Business cloud API (futuro V4)**
- Envio automatico sin intervencion humana
- Requiere numero verificado, plantillas aprobadas, webhook
- **Decision V3:** dejar la abstraccion lista pero implementar solo Modo A

El codigo se disena para que cambiar A->B sea cambiar una variable de entorno (`WHATSAPP_PROVIDER=wa-me|business-api`) sin tocar logica de negocio.

---

## 3. Modelo de datos

### 3.1 — Tabla nueva `MensajeWhatsapp`

Registra cada mensaje generado para trazabilidad y deduplicacion.

```prisma
model MensajeWhatsapp {
  id                String   @id @default(cuid())

  // Destinatario
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  phone             String   // snapshot del phone al momento de generar

  // Contenido
  template          String   // identificador del template ('pedido_nuevo', 'documento_aprobado', etc)
  mensaje           String   // mensaje final renderizado (texto + link)
  enlaceProfundo    String?  // URL con magic token

  // Estado
  estado            EstadoMensajeWhatsapp @default(GENERADO)
  // GENERADO: listo para enviar
  // ENVIADO: alguien clickeo "enviar" o se envio por API
  // ENTREGADO: confirmacion de WhatsApp (solo Modo B)
  // FALLIDO: error en envio

  // Provider info
  proveedor         String   // 'wa-me' | 'business-api'
  proveedorId       String?  // message_id de Business API (Modo B)

  // Trazabilidad
  notificacionId    String?  @unique  // FK a Notificacion si fue gatillado por una
  notificacion      Notificacion? @relation(fields: [notificacionId], references: [id])

  enviadoPor        String?  // userId del admin que clickeo "enviar" (Modo A)

  createdAt         DateTime @default(now())
  enviadoAt         DateTime?

  @@index([userId])
  @@index([estado])
  @@map("mensajes_whatsapp")
}

enum EstadoMensajeWhatsapp {
  GENERADO
  ENVIADO
  ENTREGADO
  FALLIDO
}
```

### 3.2 — Tabla nueva `MagicLink`

Para los links profundos que auto-loguean al usuario.

```prisma
model MagicLink {
  id          String   @id @default(cuid())
  token       String   @unique  // random 32 bytes
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  destino     String   // ruta interna a la que redirige (/taller/pedidos/disponibles/abc123)
  usadoEn     DateTime?
  expira      DateTime  // 24 horas desde creacion

  createdAt   DateTime @default(now())

  @@index([token])
  @@index([userId])
  @@map("magic_links")
}
```

---

## 4. Triggers de eventos

### 4.1 — Eventos que disparan WhatsApp

| Evento | Destinatario | Template | Ejemplo de mensaje |
|--------|-------------|----------|--------------------|
| Pedido nuevo compatible | Talleres del match | `pedido_nuevo` | "Tenes un pedido nuevo de [Marca]: [resumen]. Mira los detalles -> [link]" |
| Cotizacion aceptada | Taller cotizante | `cotizacion_aceptada` | "Felicitaciones! [Marca] acepto tu cotizacion del pedido [X]. Revisa los proximos pasos -> [link]" |
| Documento aprobado | Taller dueno | `documento_aprobado` | "El Estado aprobo tu [tipo de documento]. Sumaste [N] puntos. -> [link]" |
| Documento rechazado | Taller dueno | `documento_rechazado` | "Tu [tipo de documento] necesita correcciones. Motivo: [...]. -> [link]" |
| Subio de nivel | Taller | `nivel_subido` | "Subiste a nivel [nivel]! Ahora tenes acceso a [beneficios]. -> [link]" |
| Mensaje individual del admin | Usuario destinatario | `mensaje_admin` | (texto custom + link) |

### 4.2 — Implementacion del trigger

Cada evento que dispara una notificacion in-app **tambien** dispara un mensaje de WhatsApp. Hay dos casos: eventos que ya crean `Notificacion` y eventos que hoy solo loguean con `logActividad`.

#### Triggers que YA crean Notificacion (agregar WhatsApp)

**Pedido nuevo compatible** — `src/compartido/lib/notificaciones.ts:108-119`

Ya crea `Notificacion` en linea 109. Agregar `generarMensajeWhatsapp` despues de linea 118 (despues del `.catch()` del create), dentro del `for` loop:

```typescript
// notificaciones.ts — dentro del for de notificarTalleresCompatibles()
// linea 109-118: crear notificacion in-app (existente)
prisma.notificacion.create({
  data: { /* ... existente ... */ },
}).catch(() => {})

// NUEVO V3: WhatsApp
generarMensajeWhatsapp({
  userId: taller.user.id,
  template: 'pedido_nuevo',
  datos: { marca: pedido.marca.nombre, resumen: `${pedido.cantidad} ${pedido.tipoPrenda}` },
  destino: `/taller/pedidos/disponibles/${pedidoId}`,
}).catch(() => {})

// linea 120-129: email (existente, no tocar)
```

**Cotizacion aceptada** — `src/compartido/lib/notificaciones.ts:32-48`

Ya crea `Notificacion` en linea 33. Agregar `generarMensajeWhatsapp` despues de linea 48 (despues del `.catch()` del create):

```typescript
// notificaciones.ts — dentro de notificarCotizacion(), solo cuando tipo === 'ACEPTADA'
// linea 33-48: crear notificacion in-app (existente)

// NUEVO V3: WhatsApp solo para ACEPTADA (no RECIBIDA ni RECHAZADA)
if (tipo === 'ACEPTADA') {
  generarMensajeWhatsapp({
    userId: destinoUserId,
    template: 'cotizacion_aceptada',
    datos: { marca: data.marca.nombre, pedido: data.pedido.omId },
    destino: `/taller/pedidos`,
  }).catch(() => {})
}
```

**Mensaje admin** — `src/app/api/admin/notificaciones/route.ts:57`

Ya crea `Notificacion` con `createMany` en linea 57. Agregar WhatsApp despues:

```typescript
// api/admin/notificaciones/route.ts — despues del createMany
// Para cada userId que recibio notificacion:
for (const userId of userIds) {
  generarMensajeWhatsapp({
    userId,
    template: 'mensaje_admin',
    datos: { texto: body.mensaje },
    destino: body.link ?? '/taller',
  }).catch(() => {})
}
```

#### Triggers que HOY NO crean Notificacion (crear ambas)

**Documento aprobado/rechazado** — `src/app/api/validaciones/[id]/route.ts:64-68`

Hoy solo ejecuta `logActividad` y `aplicarNivel`. NO crea `Notificacion`. Hay que crear ambas:

```typescript
// api/validaciones/[id]/route.ts — despues de linea 67
if (role === 'ADMIN' && body.estado) {
  logActividad('ADMIN_VALIDACION_' + body.estado, session.user.id, { /* existente */ })
  aplicarNivel(existing.tallerId, session.user.id)

  // NUEVO V3: Notificacion in-app + WhatsApp
  if (body.estado === 'COMPLETADO' || body.estado === 'RECHAZADO') {
    const tipoDocNombre = existing.tipo  // nombre del tipo de documento
    const esAprobado = body.estado === 'COMPLETADO'

    prisma.notificacion.create({
      data: {
        userId: existing.taller.userId,
        tipo: 'VALIDACION',
        titulo: esAprobado ? `Documento aprobado: ${tipoDocNombre}` : `Documento rechazado: ${tipoDocNombre}`,
        mensaje: esAprobado
          ? `El Estado aprobo tu ${tipoDocNombre}.`
          : `Tu ${tipoDocNombre} necesita correcciones.`,
        canal: 'PLATAFORMA',
        link: '/taller/formalizacion',
      },
    }).catch(() => {})

    generarMensajeWhatsapp({
      userId: existing.taller.userId,
      template: esAprobado ? 'documento_aprobado' : 'documento_rechazado',
      datos: {
        tipoDocumento: tipoDocNombre,
        ...(esAprobado ? { puntos: '10' } : { motivo: body.detalle ?? 'Ver detalles en la plataforma' }),
      },
      destino: '/taller/formalizacion',
    }).catch(() => {})
  }
}
```

> **Nota:** Las server actions inline de `admin/talleres/[id]/page.tsx` (lineas 82-93 aprobar, 104-116 rechazar) ejecutan la misma logica via llamada directa a Prisma + `aplicarNivel()`. Estas tambien deben agregar Notificacion + WhatsApp. El patron es identico al de arriba.

**Nivel subido** — `src/compartido/lib/nivel.ts:120-128`

Hoy solo ejecuta `logActividad`. Agregar Notificacion + WhatsApp dentro del bloque `if (nivelAnterior !== resultado.nivel)`:

```typescript
// nivel.ts — dentro del if de cambio de nivel, despues de logActividad (linea 127)
if (nivelAnterior !== resultado.nivel) {
  const orden: Record<string, number> = { BRONCE: 0, PLATA: 1, ORO: 2 }
  const accion = orden[resultado.nivel] > orden[nivelAnterior] ? 'NIVEL_SUBIDO' : 'NIVEL_BAJADO'
  logActividad(accion, userId, { tallerId, nivelAnterior, nivelNuevo: resultado.nivel })

  // NUEVO V3: Notificacion + WhatsApp solo si SUBIO
  if (accion === 'NIVEL_SUBIDO') {
    // Obtener userId del taller para la notificacion
    const tallerUser = await prisma.taller.findUnique({
      where: { id: tallerId },
      select: { userId: true },
    })
    if (tallerUser) {
      prisma.notificacion.create({
        data: {
          userId: tallerUser.userId,
          tipo: 'NIVEL',
          titulo: `Subiste a nivel ${resultado.nivel}!`,
          mensaje: `Felicitaciones! Ahora sos nivel ${resultado.nivel}.`,
          canal: 'PLATAFORMA',
          link: '/taller',
        },
      }).catch(() => {})

      generarMensajeWhatsapp({
        userId: tallerUser.userId,
        template: 'nivel_subido',
        datos: { nivel: resultado.nivel, beneficios: [] },
        destino: '/taller',
      }).catch(() => {})
    }
  }
}
```

> **Nota:** `aplicarNivel()` hoy no es async en el bloque de logging (fire-and-forget). La query extra para obtener `tallerUser.userId` es necesaria porque la firma de `aplicarNivel(tallerId, userId?)` recibe `userId` del admin que ejecuto la accion, no del taller. El `tallerId` es el ID del taller, no del user.

### 4.3 — Funcion `generarMensajeWhatsapp`

Archivo nuevo: `src/compartido/lib/whatsapp.ts`

```typescript
import { prisma } from './prisma'
import { generarMagicLink } from './magic-link'
import { renderTemplate, TEMPLATES } from './whatsapp-templates'

interface GenerarOpts {
  userId: string
  template: keyof typeof TEMPLATES
  datos: Record<string, string | string[]>
  destino: string  // ruta interna
  notificacionId?: string
}

export async function generarMensajeWhatsapp(opts: GenerarOpts) {
  // Verificar preferencia del usuario
  const user = await prisma.user.findUnique({
    where: { id: opts.userId },
    select: { id: true, phone: true, name: true, notificacionesWhatsapp: true }
  })

  if (!user?.notificacionesWhatsapp) {
    return null  // usuario desactivo WhatsApp
  }

  if (!user.phone) {
    console.warn(`[whatsapp] User ${opts.userId} sin phone — saltado`)
    return null
  }

  const phoneNormalizado = normalizarTelefonoArgentino(user.phone)
  if (!phoneNormalizado) {
    console.warn(`[whatsapp] Phone invalido para user ${opts.userId}: ${user.phone}`)
    return null
  }

  // Generar magic link
  const magicLink = await generarMagicLink({
    userId: opts.userId,
    destino: opts.destino,
  })

  // Renderizar template
  const mensaje = renderTemplate(opts.template, {
    ...opts.datos,
    nombre: user.name ?? '',
    enlace: magicLink.url,
  })

  // Persistir
  return prisma.mensajeWhatsapp.create({
    data: {
      userId: user.id,
      phone: phoneNormalizado,
      template: opts.template,
      mensaje,
      enlaceProfundo: magicLink.url,
      estado: 'GENERADO',
      proveedor: process.env.WHATSAPP_PROVIDER ?? 'wa-me',
      notificacionId: opts.notificacionId ?? null,
    }
  })
}

export function normalizarTelefonoArgentino(raw: string): string | null {
  const digitos = raw.replace(/\D/g, '')
  // 12 digitos con 54 = codigo de pais completo (54 + 10 digitos)
  if (digitos.length === 12 && digitos.startsWith('54')) return digitos
  // 11 digitos con 54 = formato viejo sin 9 (54 + 9 digitos)
  if (digitos.length === 11 && digitos.startsWith('54')) return digitos
  // 10 digitos = falta codigo de pais, agregar 54
  if (digitos.length === 10) return '54' + digitos
  return null
}

export function generarUrlWaMe(phone: string, mensaje: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`
}
```

### 4.4 — Templates

Archivo nuevo: `src/compartido/lib/whatsapp-templates.ts`

```typescript
export const TEMPLATES = {
  pedido_nuevo: ({ marca, resumen, enlace }: any) =>
    `PDT — Tenes un pedido nuevo de ${marca}: ${resumen}. Mira los detalles -> ${enlace}`,

  cotizacion_aceptada: ({ marca, pedido, enlace }: any) =>
    `Felicitaciones! ${marca} acepto tu cotizacion del pedido "${pedido}". Revisa los proximos pasos -> ${enlace}`,

  documento_aprobado: ({ tipoDocumento, puntos, enlace }: any) =>
    `El Estado aprobo tu ${tipoDocumento}. Sumaste ${puntos} puntos. Mira tu progreso -> ${enlace}`,

  documento_rechazado: ({ tipoDocumento, motivo, enlace }: any) =>
    `Tu ${tipoDocumento} necesita correcciones.\nMotivo: ${motivo}\n\nIngresa para corregir -> ${enlace}`,

  nivel_subido: ({ nivel, beneficios, enlace }: any) =>
    `Subiste a nivel ${nivel}!${Array.isArray(beneficios) && beneficios.length > 0 ? `\n\nAhora tenes acceso a:\n${beneficios.map((b: string) => `- ${b}`).join('\n')}` : ''}\n\nEntra a la plataforma -> ${enlace}`,

  mensaje_admin: ({ texto, enlace }: any) =>
    `PDT — ${texto}\n\nIngresa -> ${enlace}`,
} as const

export function renderTemplate<K extends keyof typeof TEMPLATES>(
  template: K,
  datos: Parameters<typeof TEMPLATES[K]>[0]
): string {
  return TEMPLATES[template](datos)
}
```

---

## 5. Magic links

### 5.1 — Generacion

Archivo nuevo: `src/compartido/lib/magic-link.ts`

```typescript
import { randomBytes } from 'crypto'
import { prisma } from './prisma'

export async function generarMagicLink(opts: { userId: string; destino: string }) {
  const token = randomBytes(32).toString('base64url')
  const expira = new Date(Date.now() + 24 * 60 * 60 * 1000)  // 24 horas

  const link = await prisma.magicLink.create({
    data: {
      token,
      userId: opts.userId,
      destino: opts.destino,
      expira,
    }
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://plataforma-textil.vercel.app'

  return {
    token: link.token,
    url: `${baseUrl}/n/${link.token}`,
  }
}
```

> **Runtime:** `randomBytes` y `.toString('base64url')` son APIs estables de Node.js disponibles desde v16+. El proyecto usa Next.js 16.1.6 con runtime Node.js exclusivo (no hay edge en ningun archivo). Sin riesgo.

### 5.2 — Endpoint de redireccion

Archivo nuevo: `src/app/n/[token]/route.ts`

> **IMPORTANTE — Auth.js beta:** El proyecto usa `next-auth@5.0.0-beta.30` con estrategia `jwt` (configurada en `auth.ts:29`). La funcion `encode()` de `next-auth/jwt` produce un token JWT encriptado valido como cookie de sesion. Esta integracion tiene riesgo de breaking changes en upgrades futuros de Auth.js. Pin a `beta.30` en `package.json` y no actualizar sin verificar la firma de `encode()`.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { encode } from 'next-auth/jwt'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const magicLink = await prisma.magicLink.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!magicLink) {
    return NextResponse.redirect(new URL('/login?error=link_invalido', req.url))
  }

  if (magicLink.expira < new Date()) {
    return NextResponse.redirect(new URL('/login?error=link_expirado', req.url))
  }

  if (magicLink.usadoEn) {
    // Link ya fue usado — redirigir directo al destino, no auto-loguear de nuevo
    return NextResponse.redirect(new URL(magicLink.destino, req.url))
  }

  // Marcar como usado
  await prisma.magicLink.update({
    where: { id: magicLink.id },
    data: { usadoEn: new Date() }
  })

  // Nombre de cookie segun ambiente (debe coincidir con Auth.js defaults)
  const cookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  // Crear sesion NextAuth manualmente
  // El salt DEBE coincidir con el nombre de la cookie para que decode() funcione
  const sessionToken = await encode({
    token: {
      sub: magicLink.user.id,
      email: magicLink.user.email,
      name: magicLink.user.name,
      role: magicLink.user.role,
      id: magicLink.user.id,
      registroCompleto: magicLink.user.registroCompleto,  // sin esto el middleware redirige a /registro/completar
    },
    secret: process.env.NEXTAUTH_SECRET!,
    salt: cookieName,
  })

  // Setear cookie de sesion y redirigir al destino
  const response = NextResponse.redirect(new URL(magicLink.destino, req.url))
  response.cookies.set({
    name: cookieName,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,  // 7 dias (igual que sesion normal)
  })

  return response
}
```

> **Claims custom del proyecto:** El callback `jwt` en `auth.config.ts:22-28` enriquece tokens con `role`, `id` y `registroCompleto`. Los tres campos DEBEN estar en el token payload de `encode()`. Sin `registroCompleto: true`, el middleware (`middleware.ts:59`) redirige al usuario a `/registro/completar` en lugar del destino deseado.

### 5.3 — Limitaciones de los magic links

- **Solo 1 uso para auto-login** — despues del primer uso, el link sigue funcionando como redirect pero no auto-loguea (evita robo de link)
- **24 horas de validez** — suficiente para el caso de uso (notificacion -> click)
- **Limpieza periodica** — cron job opcional V4 para eliminar links expirados

---

## 6. UI para envio manual (Modo A)

### 6.1 — Wizard de envio secuencial en `/admin/notificaciones`

> **Restriccion de browsers:** Los browsers modernos (Chrome, Firefox, Safari) bloquean `window.open()` llamado en loop como proteccion anti-popup. Solo la primera ventana se abre — el resto se bloquea silenciosamente. Por esto, "Abrir todos los chats de una vez" no es viable.

En la lista de notificaciones del admin, cada notificacion con `MensajeWhatsapp` asociado en estado `GENERADO` muestra un boton:

```
+--------------------------------------------------------------+
| Pedido nuevo: 800 remeras de DulceModa                        |
| Para: 12 talleres compatibles - creada hace 2 min             |
|                                                                |
| [Enviar por WhatsApp (12)]  [Ver detalles ->]                |
+--------------------------------------------------------------+
```

Click en "Enviar por WhatsApp" abre un **wizard paso a paso** (modal):

```
+--------------------------------------------------------------+
| Enviar por WhatsApp — Paso 1 de 12                            |
|                                                                |
| Destinatario: Roberto (La Aguja)                              |
| Telefono: +54 11 2345-6789                                    |
|                                                                |
| Preview del mensaje:                                          |
| "PDT — Tenes un pedido nuevo de DulceModa:                   |
|  800 remeras basicas. Mira los detalles -> ..."              |
|                                                                |
| [Abrir chat con Roberto]    [Copiar mensaje]                  |
|                                                                |
| [ ] Marcar como enviado                                       |
|                                                                |
|                            [<- Anterior]  [Siguiente ->]      |
+--------------------------------------------------------------+
```

**Flujo del wizard:**

1. Muestra al primer destinatario con preview del mensaje
2. Admin clickea "Abrir chat con Roberto" -> se abre `wa.me/...` en nueva pestana (1 click = 1 ventana, no hay bloqueo)
3. Admin envia el mensaje en WhatsApp, vuelve a la pestana de la plataforma
4. Marca checkbox "Marcar como enviado" (actualiza estado a `ENVIADO` en DB)
5. Click "Siguiente" -> muestra el segundo destinatario
6. Repite hasta el ultimo

**Alternativa "Copiar mensaje":** para casos donde el admin prefiere copiar el texto y pegarlo en un chat de WhatsApp existente (ej: ya tiene conversacion abierta con el taller). Copia al clipboard con `navigator.clipboard.writeText()`.

**Resumen al final del wizard:**
```
Enviados: 10 de 12
Pendientes: 2 (sin telefono valido)
[Cerrar]
```

Para 12 talleres son ~12 clicks espaciados, ~2 minutos de trabajo del admin.

### 6.2 — Boton individual en `/admin/usuarios/[id]`

En el detalle de cada usuario, si tiene phone valido:

```
[Enviar mensaje por WhatsApp]
```

Abre un editor con:
- Textarea para el mensaje
- Vista previa de como se vera en WhatsApp
- Toggle "incluir link a /taller" o "incluir link a pagina especifica"
- Boton "Generar y enviar"

Esto permite al admin contactar individualmente a un taller (caso de soporte, urgencia, etc).

---

## 7. Casos borde

- **Usuario sin phone** — el sistema loguea warning pero no falla. La notificacion in-app sigue creandose. El admin deberia pedirle al taller que actualice su phone en `/cuenta`.

- **Phone mal formateado** — `normalizarTelefonoArgentino` maneja varios formatos. Si no puede normalizar, loguea y descarta. UI de admin muestra el phone invalido para que pueda corregirlo manualmente.

- **Magic link interceptado** — el link es de 1 uso para auto-login. Si alguien copia el link de un WhatsApp interceptado y lo abre antes que el destinatario, gana la sesion. **Mitigacion V3:** validez 24hs y solo redirige al destino especifico (no acceso completo a la cuenta del usuario). Para V4 evaluar bind a IP.

- **Usuario hace logout y vuelve a clickear el link** — ya fue usado, redirige al destino sin auto-login -> muestra `/login`. El usuario tiene que loguearse normalmente.

- **Link compartido en chat grupal por error del admin** — todos los del grupo pueden auto-loguearse como el destinatario hasta que se use. Riesgo educativo. Mitigacion: agregar nota en la UI de admin "El link auto-loguea al destinatario, no lo compartas en chats grupales".

- **Cambio de phone despues de generar el mensaje** — el `MensajeWhatsapp` tiene snapshot del phone al momento de generar. Si el user cambio, el mensaje se genera con el viejo. Aceptable — el admin puede regenerar.

- **Modo B (Business API) en el futuro** — el codigo ya soporta la abstraccion. Para activar, instalar SDK de Meta, agregar provider y switchear `WHATSAPP_PROVIDER=business-api`. Cero cambios en logica de negocio.

- **Volumen de mensajes para un solo evento** — un pedido nuevo puede notificar a 50 talleres -> 50 mensajes WhatsApp. El wizard secuencial evita el bloqueo de popups y da feedback al admin de su progreso. V4 puede automatizar con Modo B.

- **Evento crea Notificacion pero no WhatsApp (usuario sin phone o con WhatsApp desactivado)** — la Notificacion in-app se crea siempre. El WhatsApp se intenta solo si el usuario tiene phone valido y `notificacionesWhatsapp: true`. Ambos caminos son independientes.

---

## 8. Configuracion del usuario

### 8.1 — Campo existente `User.phone`

El campo `User.phone` ya existe en `prisma/schema.prisma` (linea 110) como `String?` (opcional). **No se llama `telefono`** — usar `phone` en toda la logica.

Estado actual del campo:
- **No se pide en el registro** — ningun formulario de registro captura phone
- **No hay formulario funcional de edicion** — `/cuenta` lo menciona en texto descriptivo pero no hay form handler
- **No hay validacion de formato** — zero logica de validacion

### 8.2 — Campo nuevo `User.notificacionesWhatsapp`

```prisma
model User {
  // ... campos existentes
  notificacionesWhatsapp Boolean @default(true)
}
```

Reutilizar el enum existente `CanalNotificacion` (linea 74 del schema) que ya tiene valor `WHATSAPP`. El campo `Notificacion.canal` ya puede ser `WHATSAPP` — los mensajes generados por este spec usan `canal: 'PLATAFORMA'` para la notificacion in-app y crean un `MensajeWhatsapp` separado para el canal WhatsApp.

### 8.3 — Agregar phone al formulario de registro

Archivo: `src/app/(auth)/registro/page.tsx` (o el componente de formulario que use)

- Agregar campo `phone` al formulario con label "Telefono (WhatsApp)"
- Placeholder: "Ej: 11 2345 6789"
- Validacion client-side: solo digitos, 10-12 caracteres despues de limpiar
- Validacion server-side: `normalizarTelefonoArgentino()` retorna null si invalido -> error 400
- Tooltip educativo: "Te vamos a enviar avisos importantes por WhatsApp (pedidos nuevos, aprobaciones de documentos)"
- Campo opcional — si el taller no lo pone al registrarse, se lo pedimos despues

### 8.4 — Crear formulario funcional en `/cuenta`

Archivo: `src/app/(public)/cuenta/page.tsx`

Hoy la pagina menciona "telefono" en texto descriptivo pero no tiene un form handler que persista el campo. Agregar:

- Input de phone con misma validacion que registro
- Toggle "Recibir notificaciones por WhatsApp" (controla `notificacionesWhatsapp`, default ON)
- Boton "Guardar" que llama a `PUT /api/cuenta` (o server action) para actualizar ambos campos
- Mensaje de exito al guardar

### 8.5 — Endpoint de actualizacion

Si no existe `PUT /api/cuenta`, crear uno. Si ya existe, agregar `phone` y `notificacionesWhatsapp` a los campos actualizables con validacion via `normalizarTelefonoArgentino()`.

---

## 9. Criterios de aceptacion

- [ ] Migracion nueva con tablas `MensajeWhatsapp`, `MagicLink`, enum `EstadoMensajeWhatsapp`
- [ ] Campo `notificacionesWhatsapp` agregado a `User`
- [ ] Helper `generarMensajeWhatsapp` en `src/compartido/lib/whatsapp.ts`
- [ ] Templates en `src/compartido/lib/whatsapp-templates.ts` (6 templates iniciales)
- [ ] Helper `generarMagicLink` en `src/compartido/lib/magic-link.ts`
- [ ] Endpoint `/n/[token]` para auto-login y redirect con `encode()` + `salt` correcto
- [ ] Token payload incluye `role`, `id`, `registroCompleto` (claims custom de auth.config.ts)
- [ ] Triggers desde 6 eventos clave con Notificacion + WhatsApp
- [ ] Notificaciones in-app NUEVAS para documento aprobado/rechazado y nivel subido (no existian)
- [ ] Wizard secuencial en `/admin/notificaciones` (1 click por destinatario, no popups multiples)
- [ ] UI en `/admin/usuarios/[id]` con boton individual de envio
- [ ] Phone agregado al formulario de registro con validacion argentina
- [ ] Formulario funcional en `/cuenta` para editar phone + toggle WhatsApp
- [ ] `normalizarTelefonoArgentino()` exportada y usada en registro, /cuenta, y generacion de mensajes
- [ ] Limpieza de magic links expirados (puede ser manual V3, automatizable V4)
- [ ] `next-auth` pinned a `5.0.0-beta.30` en package.json
- [ ] Build sin errores de TypeScript

---

## 10. Tests

| # | Que testear | Como | Verificador |
|---|-------------|------|-------------|
| 1 | Pedido nuevo genera MensajeWhatsapp para talleres compatibles | Crear pedido, verificar tabla | DEV |
| 2 | Magic link redirige y auto-loguea | Crear link, abrir en browser sin sesion | QA |
| 3 | Magic link expirado muestra error | Esperar 24+ hs, intentar usar | DEV |
| 4 | Magic link usado dos veces no auto-loguea la segunda | Usar dos veces, verificar que pide login | DEV |
| 5 | Wizard secuencial abre wa.me por destinatario | Click en admin, verificar que abre 1 chat por click | QA |
| 6 | Documento aprobado crea Notificacion + MensajeWhatsapp | ESTADO aprueba documento, verificar ambas tablas | DEV |
| 7 | User sin phone no genera WhatsApp | Notificar a user sin phone, verificar warning en logs | DEV |
| 8 | Phone mal formateado se rechaza con mensaje claro | Intentar guardar "abc123" en /cuenta | QA |
| 9 | Toggle "no recibir WhatsApp" funciona | Desactivar en /cuenta, generar evento, verificar que no se crea mensaje | QA |
| 10 | Sesion creada por magic link tiene role y registroCompleto correctos | Auto-login via /n/token, verificar que middleware no redirige a /registro/completar | DEV |
| 11 | Nivel subido genera Notificacion + WhatsApp | Aprobar validacion que sube nivel, verificar ambas tablas | DEV |
| 12 | Phone se valida al registrar | Intentar registrar con "123" (muy corto), verificar error | QA |

---

## 11. Validacion de dominio (perfiles interdisciplinarios)

**Politologo:**
- Usar WhatsApp como canal genera dependencia institucional con una empresa privada (Meta)? Para V4 evaluar tambien SMS.
- Los textos de los mensajes mantienen tono institucional (no comercial)?

**Economista:**
- La friction de "click en link -> auto-login -> ver pedido" es lo suficientemente baja para que el taller la complete?
- Hay riesgo de que el taller ignore los WhatsApp si recibe muchos por dia?

**Sociologo:**
- El tono de los mensajes es apropiado para la realidad cultural del taller familiar?
- Hay riesgo de que el taller perciba los mensajes como spam comercial?
- La firma "PDT" es suficiente o hay que decir "Plataforma Digital Textil" completo?

**Contador:**
- Los mensajes sobre documentos y formalizacion usan el vocabulario fiscal correcto?
- Falta algun evento critico que deberia notificarse (vencimiento de monotributo, ART proximo a vencer)?

---

## 12. Costos y volumen estimado

**Volumen estimado piloto (25 talleres + 5 marcas):**
- Pedidos nuevos: ~5 por semana x 10 talleres compatibles = 50 mensajes/semana
- Documentos aprobados: ~10 por semana = 10 mensajes/semana
- Cotizaciones aceptadas: ~5 por semana = 5 mensajes/semana
- Otros: ~5 por semana

**Total: ~70 mensajes/semana = ~280/mes**

Para Modo A (wa.me) el costo es **cero** — solo requiere que el admin haga click. El admin invierte ~5 segundos por mensaje x 70 mensajes/semana = ~6 minutos/semana. Con el wizard secuencial el flujo es rapido: click -> envia -> siguiente.

Para Modo B (Business API) se estima:
- Plan inicial: $25/mes
- Tarifa por mensaje: ~$0.005 USD
- 280 mensajes/mes x $0.005 = $1.40/mes
- **Total: ~$26.40/mes**

V3 va con Modo A. V4 evalua Modo B si el volumen supera 1000 mensajes/mes o el admin no puede sostener el envio manual.

---

## 13. Referencias

- V3_BACKLOG -> F-02
- WhatsApp Click-to-Chat: https://faq.whatsapp.com/5913398998672934
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- F-07 (mensajes individuales) — depende de los templates `mensaje_admin` definidos aca
- Auth.js JWT encode: documentacion interna de `next-auth@5.0.0-beta.30` (beta, sujeta a cambios)
