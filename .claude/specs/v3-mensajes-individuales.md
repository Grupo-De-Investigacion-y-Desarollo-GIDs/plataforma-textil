# Spec: Mensajes individuales a taller/marca desde admin

- **Version:** V3
- **Origen:** V3_BACKLOG F-07 (issue #98)
- **Asignado a:** Gerardo
- **Prioridad:** Media — completa la caja de herramientas del admin para soporte directo

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG D-01 mergeado (definicion clara de roles ADMIN vs ESTADO)
- [ ] V3_BACKLOG F-02 mergeado (templates de WhatsApp con `mensaje_admin`)
- [ ] V3_BACKLOG Q-03 mergeado (formato de errores — este endpoint DEBE usarlo)
- [ ] S-02 actualizado con rate limit para `/api/admin/mensajes-individuales` (50/hora por admin) — ver seccion 9.2

---

## 1. Contexto

Hoy el sistema de notificaciones del admin solo permite envios masivos por segmento ("todos los talleres BRONCE", "todas las marcas activas", etc). No hay forma de enviar un mensaje individual a un usuario especifico.

Esto crea friccion en casos de uso reales:

- **Soporte:** un taller pregunta por email como subir un documento. El admin no puede contestarle dentro de la plataforma — tiene que responder por email externo
- **Seguimiento:** el ESTADO ve un taller con CUIT pendiente y quiere recordarle "completa la verificacion"
- **Pedidos puntuales:** una marca tiene un caso especial y necesita instrucciones especificas
- **Investigacion de issues:** un usuario reporta un bug, el admin quiere pedirle mas detalles

V2 cerro el issue #98 documentando la falta. Este spec lo resuelve.

---

## 2. Que construir

1. **Endpoint nuevo** `POST /api/admin/mensajes-individuales` — crear notificacion dirigida a un solo usuario
2. **UI en modal de detalle de `/admin/usuarios`** — boton "Enviar mensaje" dentro del modal existente (la pagina `/admin/usuarios/[id]` no existe)
3. **UI en `/admin/talleres/[id]` y `/admin/marcas/[id]`** — mismo boton en el detalle (wrapper `'use client'`)
4. **Editor de mensaje con preview** — textarea + opcion de incluir link interno + checkbox "enviar tambien por WhatsApp"
5. **Bandeja del usuario receptor** — el mensaje aparece en `/cuenta/notificaciones` con indicador "Mensaje individual"
6. **Trazabilidad** — log de que admin mando que a quien

---

## 3. Modelo de datos

### 3.1 — Reutilizacion del modelo `Notificacion` existente

No se crea modelo nuevo. La tabla `Notificacion` ya tiene los campos que necesitamos:

```prisma
// Modelo existente — referencia (campos reales del schema)
model Notificacion {
  id            String            @id @default(cuid())
  userId        String            // destinatario
  tipo          String            // ej: "mensaje_individual"
  titulo        String
  mensaje       String            @db.Text
  leida         Boolean           @default(false)
  canal         CanalNotificacion @default(PLATAFORMA)
  createdById   String?           // userId del admin que la creo
  batchId       String?           // null para mensajes individuales
  link          String?           // URL interna a la que lleva el boton "ver"
  createdAt     DateTime          @default(now())

  user          User  @relation("NotificacionDestinatario", ...)
  creadaPor     User? @relation("NotificacionCreador", ...)
}
```

**Lo unico que cambia:** se introduce un nuevo valor de `tipo`: `'mensaje_individual'`. La UI lo trata diferente para distinguirlo de notificaciones automaticas del sistema.

### 3.2 — Sin campo adicional

No se agrega `esMensajeIndividual: Boolean`. Filtrar por `tipo: 'mensaje_individual'` es equivalente, no requiere migracion, y el campo `tipo` ya es String libre. Todas las queries de este spec filtran por `tipo`.

---

## 4. Endpoint `POST /api/admin/mensajes-individuales`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { apiHandler, errorAuthRequired, errorForbidden, errorInvalidInput, errorNotFound } from '@/compartido/lib/api-errors'
import { auth } from '@/compartido/lib/auth'
import { z } from 'zod'
import { prisma } from '@/compartido/lib/prisma'
import { logAccionAdmin } from '@/compartido/lib/log'
import { generarMensajeWhatsapp } from '@/compartido/lib/whatsapp'

const SchemaCrearMensaje = z.object({
  destinatarioId: z.string().min(1),
  titulo: z.string().min(3).max(120),
  mensaje: z.string().min(10).max(2000),
  link: z.string().url().optional().or(z.literal('')),
  enviarPorWhatsapp: z.boolean().default(false),
})

export const POST = apiHandler(async (req) => {
  const session = await auth()

  // ADMIN o ESTADO pueden enviar mensajes individuales
  if (!session?.user) return errorAuthRequired()
  if (!['ADMIN', 'ESTADO'].includes(session.user.role)) {
    return errorForbidden('ADMIN o ESTADO')
  }

  // Rate limit: 50 mensajes/hora por admin
  // Implementacion depende de S-02 actualizado — ver seccion 9.2
  // ...

  const body = await req.json()
  const parsed = SchemaCrearMensaje.safeParse(body)

  if (!parsed.success) return errorInvalidInput(parsed.error)

  const { destinatarioId, titulo, mensaje, link, enviarPorWhatsapp } = parsed.data

  // Verificar que el destinatario existe y esta activo
  const destinatario = await prisma.user.findUnique({
    where: { id: destinatarioId },
    select: { id: true, name: true, phone: true, role: true, active: true }
  })

  if (!destinatario || !destinatario.active) {
    return errorNotFound('destinatario')
  }

  // Crear la notificacion
  const notificacion = await prisma.notificacion.create({
    data: {
      userId: destinatarioId,
      tipo: 'mensaje_individual',
      titulo,
      mensaje,
      link: link || null,
      createdById: session.user.id,
      // batchId queda null — no es envio masivo
      // canal queda PLATAFORMA (default)
    }
  })

  // Si se solicito WhatsApp y el destinatario tiene phone, generar mensaje
  // generarMensajeWhatsapp es de F-02 — dependencia bloqueante
  // Firma F-02: { userId, template, datos: Record<string, string | string[]>, destino, notificacionId? }
  if (enviarPorWhatsapp && destinatario.phone) {
    await generarMensajeWhatsapp({
      userId: destinatarioId,
      template: 'mensaje_admin',  // template introducido por F-02
      datos: {
        texto: titulo + '\n\n' + mensaje.slice(0, 200) + (mensaje.length > 200 ? '...' : ''),
      },
      destino: link || '/cuenta/notificaciones',
      notificacionId: notificacion.id,
    })
  }

  // Log de auditoria
  await logAccionAdmin('MENSAJE_INDIVIDUAL_ENVIADO', session.user.id, {
    entidad: 'usuario',
    entidadId: destinatarioId,
    metadata: {
      titulo,
      enviadoPorWhatsapp: enviarPorWhatsapp,
      destinatarioRol: destinatario.role,
    }
  })

  return NextResponse.json({
    success: true,
    notificacionId: notificacion.id
  })
})
```

**Dependencia F-02:** el template `mensaje_admin` y la funcion `generarMensajeWhatsapp` son introducidos por el spec F-02 (`v3-whatsapp-notificaciones.md`). Si F-02 no esta mergeado, la opcion WhatsApp no esta disponible — el checkbox no debe mostrarse en la UI.

---

## 5. UI del editor

### 5.1 — Componente `EditorMensajeIndividual`

Archivo nuevo: `src/admin/componentes/editor-mensaje-individual.tsx`

Modal que se abre con click en "Enviar mensaje". Usa el componente `Modal` existente (`src/compartido/componentes/ui/modal.tsx`) que es monolitico — las secciones internas se resuelven con divs y clases Tailwind. Los componentes `Field`, `Textarea`, `Checkbox` y `Hint` **no existen** en el design system — usar HTML nativo con clases Tailwind.

```tsx
'use client'

import { useState, useMemo } from 'react'
import { Modal } from '@/compartido/componentes/ui/modal'
import { Input } from '@/compartido/componentes/ui/input'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Button } from '@/compartido/componentes/ui/button'

interface Props {
  destinatarioId: string
  destinatarioNombre: string
  destinatarioRol: 'TALLER' | 'MARCA' | 'ADMIN' | 'ESTADO' | 'CONTENIDO'
  destinatarioTienePhone: boolean
  onCerrar: () => void
}

export function EditorMensajeIndividual({
  destinatarioId,
  destinatarioNombre,
  destinatarioRol,
  destinatarioTienePhone,
  onCerrar
}: Props) {
  const [titulo, setTitulo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [incluirLink, setIncluirLink] = useState(false)
  const [link, setLink] = useState('')
  const [enviarPorWhatsapp, setEnviarPorWhatsapp] = useState(false)
  const [enviando, setEnviando] = useState(false)

  // Sugerencias de URLs segun rol del destinatario
  const sugerenciasLinks = useMemo(() => {
    if (destinatarioRol === 'TALLER') {
      return [
        { label: 'Su perfil', url: '/taller/perfil' },
        { label: 'Su formalizacion', url: '/taller/formalizacion' },
        { label: 'Su dashboard', url: '/taller' },
      ]
    }
    if (destinatarioRol === 'MARCA') {
      return [
        { label: 'Sus pedidos', url: '/marca/pedidos' },
        { label: 'Su panel', url: '/marca' },
      ]
    }
    return []
  }, [destinatarioRol])

  return (
    <Modal onClose={onCerrar}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">Mensaje a {destinatarioNombre}</h2>
        <Badge>{destinatarioRol}</Badge>
      </div>

      {/* Body */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Titulo <span className="text-red-500">*</span>
          </label>
          <Input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            maxLength={120}
            placeholder="Ej: Pedido de informacion sobre tu CUIT"
          />
          <p className="text-xs text-zinc-500 mt-1">{titulo.length}/120</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mensaje <span className="text-red-500">*</span>
          </label>
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            maxLength={2000}
            rows={6}
            placeholder="Escribi el mensaje al usuario. Acepta texto plano."
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <p className="text-xs text-zinc-500 mt-1">{mensaje.length}/2000</p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={incluirLink}
              onChange={e => setIncluirLink(e.target.checked)}
              className="rounded border-zinc-300"
            />
            Adjuntar link a pagina especifica de la plataforma
          </label>

          {incluirLink && (
            <div className="mt-2">
              <Input
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="/taller/formalizacion"
              />
              {sugerenciasLinks.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {sugerenciasLinks.map(s => (
                    <button
                      key={s.url}
                      onClick={() => setLink(s.url)}
                      className="text-xs bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {destinatarioTienePhone && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enviarPorWhatsapp}
              onChange={e => setEnviarPorWhatsapp(e.target.checked)}
              className="rounded border-zinc-300"
            />
            Enviar tambien por WhatsApp (el destinatario tambien lo vera en su bandeja)
          </label>
        )}

        {!destinatarioTienePhone && (
          <p className="text-xs text-zinc-500">
            El destinatario no tiene telefono cargado, solo se enviara por la plataforma.
          </p>
        )}

        <PreviewMensaje titulo={titulo} mensaje={mensaje} link={incluirLink ? link : null} />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
        <Button variant="ghost" onClick={onCerrar}>Cancelar</Button>
        <Button
          onClick={enviar}
          disabled={!titulo || !mensaje || enviando}
        >
          {enviando ? 'Enviando...' : 'Enviar mensaje'}
        </Button>
      </div>
    </Modal>
  )
}
```

### 5.2 — Preview en vivo

```tsx
function PreviewMensaje({ titulo, mensaje, link }: { titulo: string; mensaje: string; link: string | null }) {
  return (
    <div className="border rounded-lg p-4 bg-zinc-50 mt-4">
      <p className="text-xs text-zinc-500 mb-2">Vista previa de como lo vera el destinatario:</p>

      <div className="bg-white rounded p-3 border">
        <h3 className="font-semibold text-sm">{titulo || '[Titulo]'}</h3>
        <p className="text-sm text-zinc-700 mt-2 whitespace-pre-wrap">
          {mensaje || '[Contenido del mensaje]'}
        </p>
        {link && (
          <span className="text-violet-600 text-sm underline mt-2 inline-block">
            Ver detalles →
          </span>
        )}
      </div>
    </div>
  )
}
```

---

## 6. Integracion en paginas

### 6.1 — En `/admin/usuarios` (modal de detalle)

**La pagina `/admin/usuarios/[id]` no existe.** La lista `/admin/usuarios` tiene un modal de detalle que se abre al hacer click en un usuario. El boton "Enviar mensaje" va dentro de ese modal existente:

```tsx
{/* Dentro del modal de detalle de usuario existente */}
<div className="flex items-center gap-2">
  <h2>{usuario.name}</h2>
  <Badge>{usuario.role}</Badge>

  <Button onClick={() => setMostrarEditor(true)}>
    Enviar mensaje
  </Button>
</div>

{mostrarEditor && (
  <EditorMensajeIndividual
    destinatarioId={usuario.id}
    destinatarioNombre={usuario.name}
    destinatarioRol={usuario.role}
    destinatarioTienePhone={!!usuario.phone}
    onCerrar={() => setMostrarEditor(false)}
  />
)}
```

Como la lista de usuarios ya es `'use client'`, no se necesita wrapper adicional.

### 6.2 — En `/admin/talleres/[id]` y `/admin/marcas/[id]`

Ambas paginas **existen y son server components**. El boton "Enviar mensaje" requiere un wrapper `'use client'` que maneje el estado del modal:

```tsx
// src/admin/componentes/boton-enviar-mensaje.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/compartido/componentes/ui/button'
import { EditorMensajeIndividual } from './editor-mensaje-individual'

interface Props {
  destinatarioId: string
  destinatarioNombre: string
  destinatarioRol: 'TALLER' | 'MARCA' | 'ADMIN' | 'ESTADO' | 'CONTENIDO'
  destinatarioTienePhone: boolean
}

export function BotonEnviarMensaje(props: Props) {
  const [mostrarEditor, setMostrarEditor] = useState(false)

  return (
    <>
      <Button onClick={() => setMostrarEditor(true)}>
        Enviar mensaje
      </Button>
      {mostrarEditor && (
        <EditorMensajeIndividual
          {...props}
          onCerrar={() => setMostrarEditor(false)}
        />
      )}
    </>
  )
}
```

Los datos del usuario se obtienen de `taller.user` o `marca.user` (relaciones existentes que ya cargan `phone`).

### 6.3 — Para multiples destinatarios

En el listado `/admin/usuarios`, agregar checkbox por fila + accion "Enviar mensaje a seleccionados". Esto crea **multiples mensajes individuales** (uno por destinatario) — no es un mensaje masivo (que ya existe).

Para V3 dejar fuera de scope: priorizar 1-a-1. Para V4 evaluar.

---

## 7. Vista del destinatario

### 7.1 — En `/cuenta/notificaciones`

Las notificaciones de tipo `mensaje_individual` se muestran con:

- Badge "Mensaje" (color distinto a notificaciones automaticas)
- Avatar/nombre del admin que lo envio (via relacion `creadaPor`)
- Titulo destacado
- Cuerpo expandible (collapsed por defecto si es largo)
- Boton "Ver" si hay `link`
- Timestamp

```tsx
function NotificacionItem({ notif }: { notif: Notificacion }) {
  const esMensajeIndividual = notif.tipo === 'mensaje_individual'

  return (
    <div className="border rounded-lg p-4 mb-3">
      <div className="flex items-start gap-3">
        {esMensajeIndividual && (
          <Badge variant="info">Mensaje del equipo</Badge>
        )}

        <div className="flex-1">
          <h3 className="font-semibold">{notif.titulo}</h3>

          {esMensajeIndividual && notif.creadaPor && (
            <p className="text-xs text-zinc-500">
              De: {notif.creadaPor.name}
            </p>
          )}

          <p className="text-sm mt-2 whitespace-pre-wrap">{notif.mensaje}</p>

          {notif.link && (
            <Link href={notif.link} className="text-violet-600 text-sm mt-2 inline-block">
              Ver detalles →
            </Link>
          )}

          <p className="text-xs text-zinc-400 mt-2">
            {formatearFechaRelativa(notif.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 7.2 — Indicador de no leidas

El menu de notificaciones (campana en header) ya muestra badge con count de no leidas. Los mensajes individuales se cuentan igual.

---

## 8. Trazabilidad y auditoria

### 8.1 — Logs de envio

Cada mensaje generado se loguea via `logAccionAdmin` (de S-04):

```typescript
await logAccionAdmin('MENSAJE_INDIVIDUAL_ENVIADO', adminId, {
  entidad: 'usuario',
  entidadId: destinatarioId,
  metadata: {
    titulo,
    enviadoPorWhatsapp,
    destinatarioRol,
  }
})
```

Esto aparece en `/admin/logs` para auditoria.

### 8.2 — Vista de mensajes enviados por admin

Nueva seccion en `/admin/notificaciones` via **tabs con query params** (replica el patron existente en `/cuenta/notificaciones`).

**La pagina `/admin/notificaciones` hoy no tiene tabs** — es una vista unica de comunicaciones masivas (batches). Se agregan dos tabs:

```tsx
// Patron existente en /cuenta/notificaciones — replicar en /admin/notificaciones
const tab = searchParams.tab ?? 'masivas'

<div className="flex gap-2 mb-6">
  <Link
    href="/admin/notificaciones?tab=masivas"
    className={tab === 'masivas' ? 'font-semibold border-b-2 border-brand-blue' : 'text-zinc-500'}
  >
    Comunicaciones masivas
  </Link>
  <Link
    href="/admin/notificaciones?tab=individuales"
    className={tab === 'individuales' ? 'font-semibold border-b-2 border-brand-blue' : 'text-zinc-500'}
  >
    Mensajes individuales
  </Link>
</div>

{tab === 'masivas' && <ComunicacionesTab />}  {/* vista actual sin cambios */}
{tab === 'individuales' && <MensajesIndividualesTab />}
```

El tab "Mensajes individuales" lista todos los mensajes enviados:

| Fecha | Destinatario | Rol | Titulo | Via | Leido |
|-------|--------------|-----|--------|-----|-------|
| Hoy 14:30 | Roberto Gimenez | TALLER | Documentos pendientes | Plataforma + WhatsApp | Si |
| Ayer 11:15 | Marta Perez | MARCA | Pedido cancelado | Solo plataforma | No |

Query: `prisma.notificacion.findMany({ where: { tipo: 'mensaje_individual' }, include: { user: true, creadaPor: true }, orderBy: { createdAt: 'desc' } })`

Click en una fila lleva al detalle del mensaje (read-only — no se puede editar).

---

## 9. Casos borde

### 9.1 — Casos funcionales

- **Destinatario inactivo** — el endpoint rechaza con 404 ("Destinatario no existe o esta inactivo"). El admin debe activarlo primero si quiere mandarle algo.

- **Destinatario sin telefono pero admin marca "enviar por WhatsApp"** — el frontend no muestra el checkbox si `phone` es null. Si se manipula via API (curl), el backend ignora la opcion y solo crea la notificacion in-app.

- **Mensaje muy largo (>2000 chars)** — el editor lo limita visualmente y el endpoint lo rechaza. Para casos largos, sugerir incluir un link a un documento mas completo.

- **Admin se equivoca de destinatario** — no hay forma de "deshacer" un mensaje enviado. Mitigacion: el preview en el editor ayuda. El admin puede mandar otro mensaje aclarando el error.

- **Spam de mensajes** — un admin malicioso podria mandar muchos mensajes a usuarios. Mitigacion: rate limit de 50/hora por admin (ver 9.2). Logs visibles en `/admin/logs` permiten detectar patrones.

- **Mensaje a otro admin** — el endpoint no restringe por rol del destinatario. ADMIN puede mandar mensaje a ESTADO y viceversa. Util para coordinacion interna.

- **Notificacion in-app + WhatsApp duplicacion** — si el admin marca "enviar por WhatsApp", el destinatario recibe ambos: notificacion in-app y WhatsApp. Esto es comportamiento deseado (WhatsApp como recordatorio que lleva a la notificacion in-app mas rica).

- **Destinatario tiene WhatsApp deshabilitado en sus preferencias** — la funcion `generarMensajeWhatsapp` chequea ese flag y no envia si esta OFF. La notificacion in-app se crea igual.

- **Links invalidos** — el editor valida que sea URL relativa interna o URL completa. Si pone "javascript:alert(1)", Zod lo rechaza. Las URLs externas se permiten pero el destinatario sale de la plataforma — es decision del admin.

### 9.2 — Rate limit: dependencia de S-02

El spec S-02 (`v3-rate-limiting.md`) hoy **exime explicitamente** a los endpoints de admin del rate limiting (la logica es: "ya requieren rol ADMIN/ESTADO").

Este spec necesita una excepcion: `/api/admin/mensajes-individuales` debe tener limite de **50 mensajes/hora por admin** para prevenir spam.

**Resolucion:** se actualizara S-02 en un PR aparte agregando esta excepcion especifica. El endpoint de F-07 debe implementar el rate limit prescrito por S-02 actualizado — no implementar inline.

---

## 10. Criterios de aceptacion

- [ ] Endpoint `POST /api/admin/mensajes-individuales` funcional con validacion Zod
- [ ] Auth: ADMIN o ESTADO pueden enviarlos
- [ ] Tipo `'mensaje_individual'` usado en la tabla Notificacion existente (sin migracion)
- [ ] Editor de mensaje implementado en `src/admin/componentes/editor-mensaje-individual.tsx`
- [ ] Preview en vivo en el editor
- [ ] Sugerencias de links segun rol del destinatario
- [ ] Boton "Enviar mensaje" en modal de detalle de `/admin/usuarios`, y en `/admin/talleres/[id]` y `/admin/marcas/[id]` (wrapper `'use client'`)
- [ ] Vista del destinatario en `/cuenta/notificaciones` con badge "Mensaje del equipo"
- [ ] Tabs en `/admin/notificaciones`: "Comunicaciones masivas" (actual) + "Mensajes individuales" (nuevo) con `?tab=` query params
- [ ] Integracion con WhatsApp (F-02) opcional via checkbox — solo si F-02 esta mergeado
- [ ] Rate limit: 50 mensajes/hora por admin (implementacion segun S-02 actualizado)
- [ ] Log de auditoria con `logAccionAdmin` de S-04
- [ ] Build sin errores de TypeScript

---

## 11. Tests

| # | Que testear | Como | Verificador |
|---|-------------|------|-------------|
| 1 | Admin envia mensaje a taller — taller lo ve | Login como admin, mandar mensaje, login como taller | QA |
| 2 | Mensaje aparece con badge "Mensaje del equipo" | Verificar UI en /cuenta/notificaciones | QA |
| 3 | Sugerencias de link cambian segun rol | Probar con destinatarios TALLER y MARCA | QA |
| 4 | Preview muestra como se vera | Editar titulo y mensaje, verificar preview | QA |
| 5 | Enviar por WhatsApp crea MensajeWhatsapp | Verificar tabla despues del envio | DEV |
| 6 | Checkbox WhatsApp no aparece si destinatario sin phone | Probar con user sin phone | QA |
| 7 | Rate limit funciona | 51 mensajes seguidos, ultimo da 429 | DEV |
| 8 | Log aparece en /admin/logs | Despues de envio, verificar | QA |
| 9 | URL maliciosa es rechazada | Intentar `javascript:alert(1)` | DEV |
| 10 | Destinatario inactivo retorna 404 | Desactivar user, intentar enviar | DEV |
| 11 | Tab "Mensajes individuales" en /admin/notificaciones muestra historial | Enviar mensaje, ir a tab | QA |
| 12 | Boton funciona desde modal de /admin/usuarios | Abrir modal, enviar mensaje | QA |

---

## 12. Validacion de dominio (perfiles interdisciplinarios)

**Politologo:**
- Permitir que ESTADO mande mensajes individuales puede generar percepcion de "presion informal"?
- Hay riesgo de que estos mensajes sean usados para evadir procedimientos formales?

**Economista:**
- Esta capacidad incrementa el costo operativo del admin de forma significativa?
- Vale la pena el desarrollo para 25 talleres del piloto?

**Sociologo:**
- El tono "mensaje del equipo" se percibe como cercano o como burocratico?
- El destinatario puede sentirse vigilado al recibir mensajes individuales?
- Hay formas de uso del canal que pueden generar dependencia o paternalismo?

**Contador:**
- Los mensajes individuales del ESTADO sobre temas fiscales tienen valor legal/probatorio?
- Habria que dejar registro escrito formal ademas del mensaje en plataforma?

---

## 13. Referencias

- V3_BACKLOG → F-07 (registrado a partir del issue #98 de V2)
- F-02 — usa los templates de WhatsApp y la integracion existente (dependencia bloqueante)
- S-02 — requiere actualizacion para rate limit de mensajes individuales (PR aparte)
- S-04 — usa el wrapper `logAccionAdmin` para auditoria
- D-01 — define que roles pueden enviar mensajes individuales
