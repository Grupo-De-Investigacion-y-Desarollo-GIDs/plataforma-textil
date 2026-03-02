# Plan de Rediseño del Schema Prisma

Fecha: 2026-03-01
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
- APIs que crean/leen OrdenManufactura
- Migration: mapear strings existentes a IDs

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

## Fase 4 — Limpieza PAGAR/ACORDAR (P2)

### 4.1 Remover EscrowHito y EstadoEscrow

**Razón:** Función PAGAR fuera del MVP (DEC-003). No hay circuito de pagos.

**Remover:**
- Modelo `EscrowHito`
- Enum `EstadoEscrow`
- Relación `OrdenManufactura.hitos`

**Impacto:** Ningún código actual usa escrow (todo era planificación futura).

### 4.2 Simplificar EstadoPedido

**Problema:** Los estados actuales incluyen `EN_EJECUCION` y `ESPERANDO_ENTREGA`
que pertenecen a la función EJECUTAR (fuera del MVP). En MVP un pedido es una
solicitud de conexión entre marca y taller.

**Cambio:**

```
// ANTES
enum EstadoPedido {
  BORRADOR
  EN_EJECUCION
  ESPERANDO_ENTREGA
  COMPLETADO
  CANCELADO
}

// DESPUÉS
enum EstadoPedido {
  BORRADOR
  ENVIADO              // Marca publicó el pedido
  ACEPTADO             // Taller aceptó
  RECHAZADO            // Taller rechazó
  COMPLETADO           // Entrega confirmada (manual)
  CANCELADO
}
```

**Impacto en código:**
- Todas las pantallas que muestran badges de estado de pedido
- APIs que hacen transiciones de estado
- Migration: mapear `EN_EJECUCION` -> `ACEPTADO`, `ESPERANDO_ENTREGA` -> `COMPLETADO`

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
| 2 | 4 FK denormalizadas | P2 | 4 modelos |
| 3 | IntentoEvaluacion | P2 | 1 modelo nuevo |
| 4 | Remover EscrowHito, simplificar estados | P2 | 2 modelos, 2 enums |
| 5 | Faq, NotaInterna | P3 | 2 modelos nuevos |
