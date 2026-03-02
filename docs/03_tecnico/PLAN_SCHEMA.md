# Plan de Rediseño del Schema Prisma

Fecha: 2026-03-01 (actualizado tras análisis de código de Sergio)
Referencia: DEC-010 (DECISIONES.md)
Estado actual: Documentado en CHECKLIST.md sección 5

---

## Contexto

El schema actual tiene 29 modelos y 11 enums. Fue diseñado antes de las decisiones
DEC-003 (PAGAR fuera del MVP), DEC-008 (COMPLIANCE -> ACOMPAÑAR) y DEC-009 (5 funciones MVP).
El CHECKLIST identifica 12 gaps que deben resolverse antes de seguir implementando.

**Funciones MVP:** REGISTRAR, ENCONTRAR, APRENDER, ACOMPAÑAR, FISCALIZAR
**Funciones FUERA del MVP:** ACORDAR, EJECUTAR, VERIFICAR, LOGÍSTICA, PAGAR, GOBERNAR

---

## Lo que Sergio ya implementó (commits cfb0ed3 y 8bda346)

Sergio avanzó en el flujo de pedidos con dos decisiones de diseño que incorporamos:

### Estado derivado de órdenes (ADOPTAR)
El estado del pedido se calcula automáticamente a partir del estado de sus órdenes.
No hay transiciones manuales excepto CANCELADO. Esto es mejor que transiciones
manuales porque evita inconsistencias entre el estado del pedido y sus órdenes.

### Solo CANCELADO manual (ADOPTAR)
La API PUT /api/pedidos/[id] rechaza cualquier cambio de estado que no sea CANCELADO.
Al cancelar, cascadea a todas las órdenes pendientes en una transacción.

### Lo que falta alinear
- El enum `EstadoPedido` en Prisma todavía tiene `ESPERANDO_ENTREGA` (no se usa)
- Los procesos están hardcodeados como array de strings en `asignar-taller.tsx`
  (`['Corte', 'Costura', 'Bordado', ...]`) en vez de venir del catálogo `ProcesoProductivo`
- Las queries todavía incluyen `hitos: true` (EscrowHito) que queremos remover
- `tipoPrenda` sigue siendo String libre en la UI y API

---

## Fase 1 — Seguridad (P1)

### 1.1 Agregar tipo a VerificationToken

**Problema:** No se puede distinguir un token de password reset de uno de verificación
de email. Si se implementa email verification, un token podría usarse para el flujo
equivocado.

**Cambio:**

```
enum TipoToken {
  PASSWORD_RESET
  EMAIL_VERIFICATION
}

model VerificationToken {
  identifier String
  token      String   @unique
  type       TipoToken          // NUEVO
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

**Impacto en código:**
- `POST /api/auth/password-reset` — agregar `type: PASSWORD_RESET` al crear token
- `POST /api/auth/password-reset/[token]` — validar `type === PASSWORD_RESET`
- Migration: agregar columna con default `PASSWORD_RESET` para tokens existentes

---

## Fase 2 — Integridad referencial (P2)

### 2.1 Pedido.tipoPrenda: String -> FK a TipoPrenda

**Problema:** `tipoPrenda` es un String libre. El catálogo `TipoPrenda` existe pero
no se referencia. Genera inconsistencias ("remera" vs "Remera/Camiseta").

**Cambio:**

```
model Pedido {
  // ANTES: tipoPrenda String
  tipoPrendaId String                    // NUEVO
  tipoPrenda   TipoPrenda @relation(fields: [tipoPrendaId], references: [id])
  // ... resto igual
}

model TipoPrenda {
  // agregar relación inversa
  pedidos TallerPrenda[]
  pedidosRelacionados Pedido[]           // NUEVO
}
```

**Impacto en código:**
- `/marca/pedidos/nuevo` — cambiar input de texto por select cargado desde catálogo
- `POST /api/pedidos` — recibir `tipoPrendaId` en vez de `tipoPrenda`
- Migration: mapear strings existentes a IDs del catálogo

### 2.2 OrdenManufactura.proceso: String -> FK a ProcesoProductivo

**Problema:** Mismo caso que 2.1. El catálogo `ProcesoProductivo` existe pero no se usa.
Además, `asignar-taller.tsx` tiene los procesos hardcodeados como array de strings
(`['Corte', 'Costura', 'Bordado', ...]`) en vez de cargarlos de la BD.

**Cambio:**

```
model OrdenManufactura {
  // ANTES: proceso String
  procesoId String                       // NUEVO
  proceso   ProcesoProductivo @relation(fields: [procesoId], references: [id])
  // remover: hitos EscrowHito[]         // REMOVER (PAGAR fuera MVP)
  // ... resto igual
}

model ProcesoProductivo {
  // agregar relación inversa
  ordenesManufactura OrdenManufactura[]  // NUEVO
}
```

**Impacto en código:**
- `asignar-taller.tsx` — reemplazar `const PROCESOS = [...]` por fetch a `GET /api/procesos`
- `POST /api/pedidos/[id]/ordenes` — recibir `procesoId` en vez de `proceso` string
- `GET /api/pedidos/[id]` y `/ordenes` — hacer `include: { proceso: true }` para traer nombre
- Migration: mapear strings existentes a IDs del catálogo ProcesoProductivo

### 2.3 Validacion.tipo: String -> FK a TipoDocumento

**Problema:** `TipoDocumento` es un catálogo desconectado. La página de formalización
hardcodea 8 tipos de documento en vez de leerlos del catálogo.

**Cambio:**

```
model Validacion {
  // ANTES: tipo String
  tipoDocumentoId String                 // NUEVO
  tipoDocumento   TipoDocumento @relation(fields: [tipoDocumentoId], references: [id])

  // ANTES: @@unique([tallerId, tipo])
  @@unique([tallerId, tipoDocumentoId])  // ACTUALIZAR
}

model TipoDocumento {
  validaciones Validacion[]              // NUEVO
}
```

**Impacto en código:**
- `/taller/formalizacion` — cargar tipos desde catálogo, no hardcodeados
- `PUT /api/validaciones/[id]` — buscar por `tipoDocumentoId`
- Admin podrá agregar/quitar tipos de documento sin cambiar código

### 2.4 Auditoria.inspectorId: String -> FK real a User

**Problema:** `inspectorId` es un String suelto sin `@relation`. No hay integridad
referencial ni se puede hacer `include: { inspector: true }`.

**Cambio:**

```
model Auditoria {
  inspectorId String?
  inspector   User? @relation("auditorias_inspector", fields: [inspectorId], references: [id])
  // ... resto igual
}

model User {
  // agregar relación inversa
  auditoriasAsignadas Auditoria[] @relation("auditorias_inspector")
}
```

**Impacto en código:**
- Admin auditorías — poder asignar inspectores con select de usuarios rol ESTADO
- Dashboard Estado — "mis auditorías asignadas"

---

## Fase 3 — Modelo nuevo para APRENDER (P2)

### 3.1 IntentoEvaluacion

**Problema:** No hay tracking de intentos de quiz. Solo se sabe si aprobó (tiene
certificado) o no. No hay datos para mejorar las evaluaciones.

**Cambio:**

```
model IntentoEvaluacion {
  id           String   @id @default(cuid())
  tallerId     String
  coleccionId  String
  calificacion Int
  aprobado     Boolean
  respuestas   Json
  createdAt    DateTime @default(now())

  taller    Taller    @relation(fields: [tallerId], references: [id], onDelete: Cascade)
  coleccion Coleccion @relation(fields: [coleccionId], references: [id], onDelete: Cascade)

  @@map("intentos_evaluacion")
}
```

**Relaciones inversas a agregar:**
- `Taller.intentosEvaluacion IntentoEvaluacion[]`
- `Coleccion.intentos IntentoEvaluacion[]`

**Impacto en código:**
- `POST /api/colecciones/[id]/evaluacion` — crear IntentoEvaluacion antes de crear Certificado
- Admin evaluaciones — poder ver estadísticas de intentos por colección

---

## Fase 4 — Limpieza PAGAR + alinear estados de pedidos (P2)

### 4.1 Remover EscrowHito y EstadoEscrow

**Razón:** Función PAGAR fuera del MVP (DEC-003). No hay circuito de pagos.

**Remover:**
- Modelo `EscrowHito`
- Enum `EstadoEscrow`
- Relación `OrdenManufactura.hitos`

**Impacto en código:**
- `GET /api/pedidos/[id]` — quitar `include: { hitos: true }` de las queries de órdenes
- `GET /api/pedidos/[id]/ordenes` — quitar `include: { hitos: true }`
- Migration: verificar que la tabla `escrow_hitos` esté vacía antes de eliminar

### 4.2 Simplificar EstadoPedido

**Estado actual de la implementación de Sergio:**
Sergio ya simplificó el flujo en UI (3 pasos: Borrador → En ejecución → Completado)
y eliminó `ESPERANDO_ENTREGA` del timeline visual. El estado se calcula automáticamente
desde las órdenes. Solo CANCELADO es manual. Pero el enum en Prisma NO se actualizó.

**Decisión de diseño:** Mantener la filosofía de Sergio (estado derivado de órdenes)
pero limpiar el enum para que refleje la realidad.

```
// ANTES (enum Prisma actual)
enum EstadoPedido {
  BORRADOR
  EN_EJECUCION         // Sergio lo usa como "hay órdenes asignadas"
  ESPERANDO_ENTREGA    // NO SE USA — Sergio lo eliminó del UI
  COMPLETADO
  CANCELADO
}

// DESPUÉS
enum EstadoPedido {
  BORRADOR             // Marca creó el pedido, sin órdenes asignadas
  EN_EJECUCION         // Hay al menos una orden asignada (auto-transición)
  COMPLETADO           // Todas las órdenes completadas (auto-transición)
  CANCELADO            // Única transición manual permitida
}
```

**Nota:** Se mantiene `EN_EJECUCION` en vez de renombrarlo a `ACEPTADO` porque
Sergio ya tiene UI, badges, filtros y lógica de auto-transición funcionando con
este nombre. Cambiarlo generaría reescritura innecesaria. El significado es el
mismo: "hay talleres asignados trabajando".

**Reglas de transición (ya implementadas por Sergio, documentar):**
```
BORRADOR ──[POST ordenes: asignar taller]──> EN_EJECUCION  (automático)
EN_EJECUCION ──[todas las órdenes completadas]──> COMPLETADO  (automático)
BORRADOR|EN_EJECUCION ──[PUT pedidos: cancelar]──> CANCELADO  (manual)
CANCELADO ──> cascadea a órdenes pendientes  (automático)
COMPLETADO|CANCELADO ──> bloqueado  (no se puede cambiar)
```

**Impacto en código:**
- Solo remover `ESPERANDO_ENTREGA` del enum Prisma
- Quitar `ESPERANDO_ENTREGA` de cualquier filtro o dropdown que todavía lo tenga
- Migration: si hay pedidos con estado `ESPERANDO_ENTREGA` en BD, mapear a `EN_EJECUCION`

### 4.3 Limpiar array hardcodeado de procesos en asignar-taller.tsx

**Problema:** `asignar-taller.tsx` tiene los procesos hardcodeados:
```
const PROCESOS = ['Corte', 'Costura', 'Bordado', 'Estampado', 'Terminación', 'Lavado', 'Planchado']
```
Esto se desalinea del catálogo `ProcesoProductivo` en la BD y refuerza la
denormalización del GAP 4 (proceso como String libre).

**Cambio:** Después de aplicar Fase 2.2 (FK a ProcesoProductivo), este componente
debe cargar los procesos desde `GET /api/procesos` y usar `procesoId` en vez de
un string. Se resuelve junto con la Fase 2.

---

## Fase 5 — Nice to have (P3)

### 5.1 Faq

```
model Faq {
  id        String  @id @default(cuid())
  pregunta  String
  respuesta String  @db.Text
  categoria String?
  orden     Int     @default(0)
  activo    Boolean @default(true)

  @@map("faqs")
}
```

### 5.2 NotaInterna

```
model NotaInterna {
  id          String   @id @default(cuid())
  entidadTipo String               // "TALLER" | "MARCA"
  entidadId   String
  autorId     String
  contenido   String   @db.Text
  createdAt   DateTime @default(now())

  autor User @relation(fields: [autorId], references: [id])

  @@map("notas_internas")
}
```

### 5.3 Modelos que NO se agregan en MVP

| Modelo | Razón |
|--------|-------|
| `MarcaTallerFavorito` | P3, ENCONTRAR funciona sin esto |
| `PerfilEstado` | P3, pocos usuarios Estado en piloto |
| `Mensaje/Chat` | DEC-004: WhatsApp wa.me, sin chat in-app |
| `CampanaNotificacion` | P3, admin/notificaciones es stub |

---

## Notas de migración

Cada fase genera un `prisma migrate dev` que altera la BD de producción (Supabase).

**Precauciones:**
1. Hacer backup de Supabase ANTES de cada migration
2. Las denormalizaciones (Fase 2) requieren script de datos: mapear strings existentes a IDs del catálogo
3. Remover modelos (Fase 4) requiere verificar que no haya datos en esas tablas
4. Coordinar con Sergio: él maneja el deploy en Vercel y la BD

**Orden recomendado:** Fase 1 -> 2 -> 3 -> 4 -> 5 (cada una en su propia migration)

---

## Resumen

| Fase | Cambios | Prioridad | Modelos afectados |
|------|---------|-----------|-------------------|
| 1 | Campo `type` en VerificationToken | P1 | 1 modelo, 1 enum nuevo |
| 2 | 4 FK denormalizadas | P2 | 4 modelos + asignar-taller.tsx |
| 3 | IntentoEvaluacion | P2 | 1 modelo nuevo |
| 4 | Remover EscrowHito, limpiar EstadoPedido, limpiar queries | P2 | 2 modelos, 2 enums, 3 archivos |
| 5 | Faq, NotaInterna | P3 | 2 modelos nuevos |

---

## Trabajo de Sergio ya incorporado

| Lo que hizo | Estado | Acción nuestra |
|-------------|--------|---------------|
| Estado del pedido derivado de órdenes | Implementado | Adoptar como patrón oficial |
| Solo CANCELADO como transición manual | Implementado | Adoptar, documentar reglas |
| Timeline visual de 3 pasos (sin ESPERANDO_ENTREGA) | Implementado en UI | Alinear enum Prisma (Fase 4.2) |
| Auto-transición BORRADOR→EN_EJECUCION al asignar taller | Implementado | Mantener nombre EN_EJECUCION |
| Cancelar cascadea a órdenes pendientes | Implementado | Mantener |

| Lo que falta alinear | Fase |
|---------------------|------|
| `ESPERANDO_ENTREGA` sigue en enum Prisma | 4.2 |
| Procesos hardcodeados en asignar-taller.tsx | 2.2 + 4.3 |
| Queries con `include: { hitos: true }` (EscrowHito) | 4.1 |
| `tipoPrenda` sigue como String libre | 2.1 |
