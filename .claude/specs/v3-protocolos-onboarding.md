# Spec: Protocolos de onboarding (T-03 + T-05 unificados)

- **Versión:** V3
- **Origen:** V3_BACKLOG T-03 (talleres) + T-05 (marcas)
- **Asignado a:** Gerardo
- **Prioridad:** Alta — sin protocolos claros, el piloto del 1/mayo arranca sin estructura

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG D-01 mergeado (rol ESTADO definido)
- [ ] V3_BACKLOG INT-01 mergeado (verificación ARCA funcionando)
- [ ] V3_BACKLOG F-02 mergeado (WhatsApp como canal de notificación)

---

## 1. Contexto

El piloto OIT arranca el **1 de mayo de 2026** con:
- 4 compañeros interdisciplinarios actuando como talleres y marcas (semana 1)
- 25 talleres reales identificados por OIT (a partir de semana 2)
- 5 marcas reales (Mercado Libre Moda, etc.)

V2 cerró sin protocolos formales para esta transición. Las preguntas abiertas:

- ¿**Quién** contacta a los talleres reales? ¿Cómo?
- ¿**Qué materiales** reciben? ¿Quién los prepara?
- ¿**Qué pasos** sigue cada taller para registrarse y arrancar?
- ¿**Qué hace el ESTADO** cuando un taller se atasca?
- ¿**Cómo se mide** el éxito del onboarding?

Sin esto, el primer mes es caótico — talleres con dudas que no saben a quién consultar, ESTADO sin información de quién está en qué etapa, OIT sin métricas para informes.

---

## 2. Qué construir

Este spec es **híbrido técnico/operativo** — no todo es código:

1. **Páginas de onboarding** — guías paso a paso para talleres y marcas (JSX en rutas `/ayuda/`)
2. **Materiales de comunicación** — plantilla de email inicial, mensaje WhatsApp, instructivo PDF
3. **Vista admin de "estado de onboarding"** — dashboard `/admin/onboarding` con tracking de cada usuario
4. **Checklist en el dashboard del usuario** — banner que guía los primeros pasos
5. **Métricas de onboarding** — qué % completó qué paso
6. **Protocolo de soporte 1-a-1** — cuándo intervenir, quién, cómo

---

## 3. Páginas de onboarding

> **Decisión de arquitectura:** `/docs/` ya existe con 29 archivos .md de documentación interna del proyecto (AS_IS_MAP, GAP_MATRIX, ROADMAP, etc.) — NO es documentación de usuario. Los contenidos de onboarding van como **páginas JSX directas** en rutas bajo `/ayuda/`, no como archivos .md leídos con fs. Los textos son cortos y esta opción es más performant y no requiere infraestructura de lectura de archivos.

### 3.1 — `/ayuda/onboarding-taller` (nueva ruta)

Archivo: `src/app/(public)/ayuda/onboarding-taller/page.tsx`

Server component con JSX directo. Contenido:

```
# Cómo empezar en la Plataforma Digital Textil

¡Bienvenido! Esta guía te lleva por los primeros pasos para empezar a recibir
pedidos de marcas formales en la plataforma.

## Antes de empezar

Necesitás tener a mano:
- Tu CUIT (de tu monotributo o IVA)
- Tu email
- Tu celular con WhatsApp
- Un documento que pruebe tu CUIT (constancia de inscripción)

## Paso 1: Registrarte (5 minutos)

1. Entrá a https://plataforma-textil.vercel.app/registro
2. Completá tus datos básicos
3. Verificamos tu CUIT con ARCA automáticamente
4. Confirmás tu email haciendo click en el link que te llega

> ⚠️ Si tu CUIT da error: probablemente estás como Empleado en relación de
> dependencia, no como Monotributo. Hablá con tu contador o consultá AFIP.

## Paso 2: Completar tu perfil (10 minutos)

Una vez adentro, completá:

- **Tu taller**: nombre comercial, ubicación, descripción
- **Tu capacidad**: cuántas piezas mensuales podés producir
- **Procesos que hacés**: confección, estampado, bordado, etc.
- **Tipos de prendas**: remeras, camperas, vestidos, etc.

Esto nos permite hacer match con los pedidos correctos.

## Paso 3: Subir tus primeros documentos (15 minutos)

En la sección **Formalización**, subí:

- Constancia de monotributo o inscripción IVA
- Habilitación municipal (si la tenés)
- Constancia de ART (si tenés empleados)

El Estado los revisa y aprueba en 24-48hs hábiles.

## Paso 4: Cuando recibís un pedido

Te notificamos por WhatsApp y por la plataforma. Tenés que:

1. Abrir el pedido y ver los detalles
2. Calcular si podés hacerlo (tiempo, capacidad, precio)
3. Cotizar dentro del plazo (generalmente 48hs)
4. Esperar la respuesta de la marca

## Niveles del taller

A medida que completás documentos y trabajos, subís de nivel:

- **🥉 BRONCE**: nivel inicial al registrarte
- **🥈 PLATA**: con documentos clave aprobados + 1 capacitación
- **🥇 ORO**: tope, con todos los documentos + capacitaciones avanzadas

Cada nivel te da acceso a mejores pedidos.

## ¿Necesitás ayuda?

- 💬 Asistente IA dentro de la plataforma (botón 💬 abajo a la derecha)
- 📧 soporte@plataformatextil.org.ar
- 📱 WhatsApp del equipo: [número]
```

### 3.2 — `/ayuda/onboarding-marca` (nueva ruta)

Archivo: `src/app/(public)/ayuda/onboarding-marca/page.tsx`

Server component con JSX directo. Contenido equivalente para marcas:

- Cómo crear un pedido
- Cómo recibir y comparar cotizaciones
- Cómo aceptar y dar seguimiento
- Qué información buscar en cada taller (badges de verificación, nivel)

### 3.3 — Integración con `/ayuda` existente

La página `src/app/(public)/ayuda/page.tsx` ya existe como JSX hardcodeado. Agregar links a las dos páginas nuevas:

- "📘 Guía para talleres" → `/ayuda/onboarding-taller`
- "📘 Guía para marcas" → `/ayuda/onboarding-marca`

### 3.4 — Contenido adicional (en la misma estructura JSX)

Si se necesita glosario, FAQs o normativa rápida, se crean como rutas adicionales bajo `/ayuda/`:
- `/ayuda/glosario`
- `/ayuda/preguntas-frecuentes` (complementa las 4 FAQs ya existentes en `/ayuda`)
- `/ayuda/normativa-rapida`

---

## 4. Materiales de comunicación

### 4.1 — Email inicial al taller

```
Asunto: 🧵 Te invitamos a la Plataforma Digital Textil — OIT

Hola [Nombre],

Soy [Nombre del referente] de OIT/UNTREF. Estamos lanzando la
**Plataforma Digital Textil**, una herramienta gratuita que conecta
talleres como el tuyo con marcas formales.

Tu taller fue identificado por OIT como referente del sector y queremos
invitarte a sumarte al piloto.

**¿Qué te ofrece la plataforma?**
- Acceso a pedidos de marcas formales (Mercado Libre Moda y otras)
- Visibilidad institucional (sello "Verificado por ARCA")
- Acompañamiento gratuito para formalización
- Capacitaciones gratuitas

**¿Qué necesitás para empezar?**
- 30 minutos de tu tiempo
- Tu CUIT y un documento que lo respalde

**Pasos:**
1. Leé esta guía: [link al PDF]
2. Registrate en: [link]
3. Si tenés dudas, escribime: [contacto]

Estoy disponible para una llamada de 15 minutos para acompañarte en el
primer paso si lo necesitás.

Saludos,
[Nombre]
[Cargo en OIT/UNTREF]
```

### 4.2 — Mensaje WhatsApp inicial

Versión más corta para enviar por WhatsApp después del email:

```
Hola [Nombre], soy [Referente] de OIT. Te mandé un mail con info sobre la
Plataforma Digital Textil. ¿Tenés un rato para que te explique en 5 minutos?
Es totalmente gratis y te puede dar acceso a pedidos de marcas formales.
```

### 4.3 — Instructivo PDF de 1 página

Diseñado para imprimir o enviar como adjunto. Contiene:

- Qué es la plataforma (1 párrafo)
- 4 pasos visuales para arrancar
- Beneficios concretos (visibilidad, pedidos, capacitación)
- Datos de contacto

---

## 5. Dashboard `/admin/onboarding`

### 5.1 — Vista principal

Lista de usuarios con su progreso de onboarding:

```
┌──────────────────────────────────────────────────────────────────────┐
│ Estado del onboarding                                                  │
│                                                                        │
│ ┌────────────┬────────────┬────────────┬────────────┬───────────────┐│
│ │  Total: 25 │ Activos: 8 │ Activos: 12│ Activos: 4 │ Inactivos: 1  ││
│ │ Invitados  │ Registrados│ Perfil     │ Cotizando  │ Sin actividad ││
│ │            │            │ completo   │            │ 7+ días        ││
│ └────────────┴────────────┴────────────┴────────────┴───────────────┘│
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ Filtros: [Todos] [Talleres] [Marcas] [Sin actividad]            │   │
│ ├────────────────────────────────────────────────────────────────┤   │
│ │ Nombre              Estado              Etapa actual            │   │
│ │ Roberto Giménez     🟢 Activo            Cotizando              │   │
│ │ Marta Pérez (DM)    🟢 Activa            Pedidos abiertos       │   │
│ │ Luis Rodríguez      🟡 Sin actividad 5d  Perfil incompleto      │   │
│ │ Susana Castro       🔴 No accedió        Solo invitada           │   │
│ │ ...                                                              │   │
│ └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 — Lógica de etapas

```typescript
type EtapaOnboarding =
  | 'INVITADO'           // recibió email pero no se registró
  | 'REGISTRADO'         // creó cuenta pero no completó perfil
  | 'PERFIL_COMPLETO'    // perfil ok pero sin actividad
  | 'ACTIVO'             // cotizando / publicando
  | 'INACTIVO'           // sin actividad 7+ días
  | 'BAJA'               // marcado como retirado
```

**Campos reales del schema y cómo obtenerlos:**

- **`user.lastLogin`** — NO existe en el schema. Obtener última actividad con:
  ```typescript
  // Opción 1: query a LogActividad (más preciso)
  const ultimoLogin = await prisma.logActividad.findFirst({
    where: { userId: user.id, accion: 'LOGIN' },
    orderBy: { timestamp: 'desc' }
  })
  // Opción 2: usar user.updatedAt como proxy (más simple, menos preciso)
  ```
- **`taller.cotizacionesEnviadas`** — NO existe como campo. Usar `_count`:
  ```typescript
  const taller = await prisma.taller.findUnique({
    where: { userId: user.id },
    include: { _count: { select: { cotizaciones: true } } }
  })
  // Acceder como: taller._count.cotizaciones
  ```
- **`marca.pedidosPublicados`** — NO existe como campo. Usar `_count`:
  ```typescript
  const marca = await prisma.marca.findUnique({
    where: { userId: user.id },
    include: { _count: { select: { pedidos: true } } }
  })
  // Acceder como: marca._count.pedidos
  ```

**Función corregida:**

```typescript
// src/compartido/lib/onboarding.ts

async function calcularEtapa(user: User): Promise<EtapaOnboarding> {
  // Verificar si el usuario accedió alguna vez
  const ultimoLogin = await prisma.logActividad.findFirst({
    where: { userId: user.id, accion: 'LOGIN' },
    orderBy: { timestamp: 'desc' }
  })

  if (!ultimoLogin) return 'INVITADO'

  if (user.role === 'TALLER') {
    const taller = await prisma.taller.findUnique({
      where: { userId: user.id },
      include: { _count: { select: { cotizaciones: true } } }
    })
    if (!taller || !taller.capacidadMensual) return 'REGISTRADO'
    if (taller._count.cotizaciones === 0 && diasDesdeRegistro(user) > 7) {
      return 'PERFIL_COMPLETO'
    }
    if (diasDesdeUltimaActividad(ultimoLogin.timestamp) > 7) return 'INACTIVO'
    return 'ACTIVO'
  }

  if (user.role === 'MARCA') {
    const marca = await prisma.marca.findUnique({
      where: { userId: user.id },
      include: { _count: { select: { pedidos: true } } }
    })
    if (!marca) return 'REGISTRADO'
    if (marca._count.pedidos === 0 && diasDesdeRegistro(user) > 7) {
      return 'PERFIL_COMPLETO'
    }
    if (diasDesdeUltimaActividad(ultimoLogin.timestamp) > 7) return 'INACTIVO'
    return 'ACTIVO'
  }

  return 'ACTIVO'
}
```

### 5.3 — Acciones del admin desde el dashboard

Click en una fila lleva al detalle del usuario con sugerencias:

- Si está en `INVITADO` → "Hace 5 días que no se registra. ¿Reenviar invitación?"
- Si está en `REGISTRADO` → "Está registrado pero no completó el perfil. ¿Mensaje recordatorio?" (usa F-07)
- Si está en `INACTIVO` → "Sin actividad hace 10 días. ¿Querés contactarlo?"

Cada sugerencia es un botón directo para enviar el mensaje correspondiente.

**"Reenviar invitación" se refiere a la invitación de REGISTRO** (email de OIT al taller que no se registró), NO a la invitación a cotizar un pedido (que ya existe en `/api/pedidos/[id]/invitaciones`).

**Implementación:**

1. **Nuevo builder de email** en `src/compartido/lib/email.ts`:
   - `buildInvitacionRegistroEmail()` — usa la plantilla de la sección 4.1
   - Se agrega a los 13 builders existentes (SendGrid, mismo patrón)

2. **Nuevo endpoint**:
   - `POST /api/admin/onboarding/reenviar-invitacion`
   - Body: `{ userId: string }`
   - Auth: solo ADMIN o ESTADO
   - Busca el email del usuario, envía `buildInvitacionRegistroEmail()`, registra en LogActividad

---

## 6. Checklist en dashboard del usuario

### 6.1 — Para taller (`/taller`)

**Posición:** DESPUÉS del header (bienvenida + nivel actual), ANTES del grid de progreso (ProgressRing + stat cards).

**Convivencia con F-01 (ProximoNivelCard):** El checklist de onboarding y `ProximoNivelCard` (F-01) ocupan la misma posición en el dashboard. **Mientras el checklist esté visible (hay pasos ⬜ pendientes), `ProximoNivelCard` NO se muestra.** Cuando todos los pasos del checklist son ✅, el checklist se oculta automáticamente y `ProximoNivelCard` toma el lugar. La condición en el dashboard es: `const onboardingCompleto = pasos.every(p => p.completado)` — si es `true`, renderizar `<ProximoNivelCard>`, si es `false`, renderizar `<ChecklistOnboarding>`. Esta regla está documentada simétricamente en F-01 §5.4.

Banner sticky, solo visible mientras hay pasos pendientes:

```
┌──────────────────────────────────────────────────────────────────┐
│ 🚀 Tus primeros pasos en la plataforma                            │
│                                                                    │
│ ✅ Crear cuenta                                                    │
│ ✅ Verificar email                                                 │
│ ⬜ Completá tu perfil del taller (capacidad, procesos)             │
│ ⬜ Subí tu primer documento de formalización                       │
│ ⬜ Recibí tu primera cotización aceptada                           │
│                                                                    │
│ [Continuar paso siguiente →]                                       │
└──────────────────────────────────────────────────────────────────┘
```

Click en el botón lleva al taller a la página correspondiente al primer paso ⬜.

Cuando todos los pasos están ✅, el banner se oculta automáticamente.

### 6.2 — Para marca (`/marca`)

**Posición:** DESPUÉS del header, ANTES de la alerta de perfil incompleto (si existe) o de los stats cards.

```
┌──────────────────────────────────────────────────────────────────┐
│ 🚀 Tus primeros pasos en la plataforma                            │
│                                                                    │
│ ✅ Crear cuenta                                                    │
│ ✅ Verificar email                                                 │
│ ⬜ Completá los datos de tu marca                                  │
│ ⬜ Publicá tu primer pedido                                        │
│ ⬜ Recibí tu primera cotización                                    │
│                                                                    │
│ [Continuar paso siguiente →]                                       │
└──────────────────────────────────────────────────────────────────┘
```

### 6.3 — Implementación

```typescript
// src/compartido/lib/onboarding.ts

export interface PasoOnboarding {
  id: string
  texto: string
  completado: boolean
  href: string
}

export async function calcularPasosTaller(user: User): Promise<PasoOnboarding[]> {
  const taller = await prisma.taller.findUnique({
    where: { userId: user.id },
    include: { _count: { select: { validaciones: true } } }
  })

  return [
    {
      id: 'cuenta',
      texto: 'Crear cuenta',
      completado: true,
      href: '/cuenta'
    },
    {
      id: 'email',
      texto: 'Verificar email',
      completado: !!user.emailVerified,
      href: '/cuenta'
    },
    {
      id: 'perfil',
      texto: 'Completar perfil del taller',
      completado: !!(taller?.capacidadMensual && taller.descripcion),
      href: '/taller/perfil'
    },
    {
      id: 'documentos',
      texto: 'Subir tu primer documento',
      completado: (taller?._count.validaciones ?? 0) > 0,
      href: '/taller/formalizacion'
    },
    {
      id: 'cotizacion',
      texto: 'Recibir tu primera cotización aceptada',
      completado: false,  // calculado aparte con query a cotizaciones aceptadas
      href: '/taller/pedidos/disponibles'
    },
  ]
}
```

> **Nota:** `taller._count.validaciones` funciona correctamente — la relación `validaciones Validacion[]` existe en el modelo Taller.

---

## 7. Métricas de onboarding

### 7.1 — Qué medir

- **Tasa de conversión email → registro:** % de invitados que crearon cuenta
- **Tasa de finalización del perfil:** % de registrados que completaron perfil
- **Tiempo promedio hasta primera cotización (talleres)**
- **Tiempo promedio hasta primer pedido (marcas)**
- **Tasa de abandono:** usuarios que se registraron pero no volvieron en 7+ días

### 7.2 — Dashboard de métricas

Sección en `/admin/onboarding`:

```
┌──────────────────────────────────────────────────────────────────┐
│ Métricas del piloto                                               │
│                                                                    │
│ Funnel de adopción:                                               │
│ Invitados:           25 (100%)                                    │
│ Registraron:         20 (80%)                                     │
│ Completaron perfil:  16 (64%)                                     │
│ Hicieron actividad:  12 (48%)                                     │
│                                                                    │
│ Tiempo hasta primera cotización (talleres):                       │
│ - Mediana: 8 días                                                 │
│ - Promedio: 12 días                                               │
│                                                                    │
│ [Exportar como CSV] [Exportar como Excel]                         │
└──────────────────────────────────────────────────────────────────┘
```

### 7.3 — Reporte mensual

Auto-generado el día 1 de cada mes, sumarizado por:
- Métricas del mes
- Comparación con mes anterior
- Talleres/marcas que avanzaron etapa
- Talleres/marcas inactivos para seguimiento

---

## 8. Protocolo de soporte 1-a-1

### 8.1 — Cuándo el admin/ESTADO interviene activamente

| Disparador | Quién | Acción |
|-----------|-------|--------|
| Usuario en `INVITADO` 5+ días | OIT | Enviar recordatorio del email |
| Usuario en `REGISTRADO` 5+ días | OIT/Admin | Mensaje individual ofreciendo ayuda |
| Usuario en `INACTIVO` 14+ días | OIT/Admin | Llamada de seguimiento |
| Documento rechazado 2+ veces | ESTADO | Mensaje explicando motivo y ofreciendo ayuda |
| Taller cotiza pero nunca le aceptan | OIT | Revisar perfil, sugerir mejoras |

### 8.2 — Cómo registrar el contacto

Cada vez que el admin/OIT/ESTADO hace contacto extra-plataforma (llamada, WhatsApp directo), lo registra en `/admin/usuarios/[id]` en el tab "Notas":

```
┌──────────────────────────────────────────────────────────────────┐
│ Notas de seguimiento                                              │
│                                                                    │
│ [+ Agregar nota]                                                   │
│                                                                    │
│ Hace 3 días — Lucía Fernández (Admin)                             │
│ Llamada de 10 min. Roberto tenía dudas sobre el monotributo,      │
│ le expliqué y prometió subir el documento esta semana.            │
│                                                                    │
│ Hace 12 días — Anabelen Torres (Estado)                           │
│ Email enviado con info de capacitación gratuita.                  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 8.3 — Modelo NotaSeguimiento

```prisma
model NotaSeguimiento {
  id            String   @id @default(cuid())
  userId        String   // sobre quién es la nota
  user          User     @relation(name: "userNotas", fields: [userId], references: [id])
  autorId       String
  autor         User     @relation(name: "autorNotas", fields: [autorId], references: [id])
  contenido     String   @db.Text
  createdAt     DateTime @default(now())

  @@index([userId])
  @@map("notas_seguimiento")
}
```

**Relaciones bidireccionales:** Este patrón de dos relaciones a User con `@relation(name: ...)` ya tiene precedente en el schema — Notificacion usa `@relation("NotificacionDestinatario")` y `@relation("NotificacionCreador")`.

**IMPORTANTE — agregar al modelo User:**

```prisma
model User {
  // ... campos existentes ...
  notasSeguimientoRecibidas  NotaSeguimiento[] @relation("userNotas")
  notasSeguimientoCreadas    NotaSeguimiento[] @relation("autorNotas")
}
```

Sin estos dos arrays, Prisma rechaza la migración por ambigüedad.

---

## 9. Casos borde

- **Talleres que se invitan pero nunca se contactan** — quedan en `INVITADO` indefinidamente. El dashboard los muestra. OIT decide cuándo darse por vencido. No hay auto-eliminación.

- **Usuarios que cambian de etapa hacia atrás** — un taller activo que deja de cotizar 7 días pasa a `INACTIVO`. La etapa se recalcula en cada vista del dashboard, no se persiste.

- **Datos incompletos en seed inicial** — los 4 compañeros interdisciplinarios tienen perfiles parciales. Es OK — sirven para probar el sistema.

- **Marca que publica pedidos sin completar perfil** — el perfil de marca se considera completo si tiene `nombre` y `tipo` (campo `String?` en el modelo Marca). Pedidos pueden publicarse sin completar otras cosas — el dashboard lo refleja.

- **Confidencialidad de las notas de seguimiento** — solo ADMIN y ESTADO ven las notas. Talleres y marcas NO ven sus propias notas (es feedback interno del equipo, no comunicación al usuario).

- **Talleres sin email funcional** — algunos talleres familiares no usan email. Para esos casos, OIT tiene su contacto WhatsApp y los registra desde el admin con una clave temporal que el taller cambia al primer login.

- **Bilingüismo o variantes regionales** — el piloto es solo Argentina, español rioplatense. No aplica.

---

## 10. Criterios de aceptación

- [ ] Páginas `/ayuda/onboarding-taller` y `/ayuda/onboarding-marca` creadas como JSX
- [ ] Links a las guías agregados en `/ayuda`
- [ ] Plantillas de email y mensaje WhatsApp documentadas
- [ ] Instructivo PDF generado (puede ser por separado, este spec solo lo prescribe)
- [ ] Dashboard `/admin/onboarding` con stats por etapa
- [ ] Lógica `calcularEtapa` implementada con queries reales (LogActividad, _count)
- [ ] `buildInvitacionRegistroEmail()` creado en `email.ts`
- [ ] Endpoint `POST /api/admin/onboarding/reenviar-invitacion` (auth: ADMIN/ESTADO)
- [ ] Acciones rápidas desde el dashboard (reenviar invitación, mensaje recordatorio)
- [ ] Banner de checklist en `/taller` (posición: después de header, antes de grid de progreso)
- [ ] Banner de checklist en `/marca` (posición: después de header, antes de stats)
- [ ] Banner contextual del taller desactivado mientras checklist esté visible
- [ ] Función `calcularPasosTaller` y `calcularPasosMarca` con campos reales del schema
- [ ] Métricas de funnel calculadas y mostradas
- [ ] Reporte mensual auto-generado
- [ ] Modelo `NotaSeguimiento` agregado a Prisma con ambas relaciones a User
- [ ] UI de notas en `/admin/usuarios/[id]` y `/admin/talleres/[id]`
- [ ] Solo ADMIN y ESTADO ven las notas
- [ ] Build sin errores de TypeScript

---

## 11. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | calcularEtapa devuelve etapa correcta para cada caso | Tests unit con mocks | DEV |
| 2 | Banner de checklist desaparece al completar todo | Completar 5 pasos, verificar | QA |
| 3 | Click en paso lleva a página correcta | Click en cada item del banner | QA |
| 4 | Dashboard muestra stats correctas | Comparar con queries manuales | QA |
| 5 | Acción "Reenviar invitación" envía email de registro | Click, verificar en logs | QA |
| 6 | Notas de seguimiento se guardan | Crear nota, recargar, verificar | QA |
| 7 | Solo ADMIN/ESTADO ven notas | Login como TALLER, intentar ver notas | DEV |
| 8 | Métricas se calculan correctamente | Datos conocidos, comparar | DEV |
| 9 | Reporte mensual incluye todos los datos | Generar, abrir CSV | QA |
| 10 | Páginas de onboarding accesibles desde `/ayuda` | Navegar al link | QA |
| 11 | Banner contextual desactivado mientras checklist visible | Verificar con perfil incompleto | QA |

---

## 12. Validación de dominio (perfiles interdisciplinarios)

**Politólogo:**
- ¿Las etapas y métricas son las apropiadas para reportar a OIT?
- ¿La intervención del ESTADO en `INACTIVO` 14+ días es proporcional o invasiva?

**Economista:**
- ¿Las métricas del funnel son las correctas para evaluar el impacto del piloto?
- ¿Falta alguna métrica económica (volumen de cotizaciones, monto promedio)?

**Sociólogo:**
- ¿Los textos de email y WhatsApp suenan invitadores o burocráticos?
- ¿La gamificación de "completar pasos" es apropiada para usuarios que no son nativos digitales?
- ¿El protocolo de seguimiento puede generar sensación de vigilancia?

**Contador:**
- ¿La guía explica correctamente los temas de monotributo y formalización?
- ¿Hay info crítica para el sector textil que falta?

---

## 13. Referencias

- V3_BACKLOG → T-03 (talleres) + T-05 (marcas)
- F-07 — los mensajes individuales se usan para los recordatorios
- F-02 — WhatsApp es canal clave del onboarding
- D-01 — define rol ESTADO para protocolo de soporte
