# Spec: Redefinición de roles — ESTADO valida documentos

- **Versión:** V3
- **Origen:** V3_BACKLOG D-01
- **Asignado a:** Gerardo
- **Prioridad:** Crítica — define la arquitectura institucional de V3

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG I-01 mergeado (ambientes separados)
- [ ] V3_BACKLOG S-04 mergeado (logs admin auditoría) — facilita tracking del cambio
- [ ] Backup completo de DB de producción antes de tocar nada

---

## 1. Contexto

Hoy el rol ADMIN hace todo:

- Aprueba/rechaza documentos de formalización
- Configura los tipos de documento requeridos por nivel
- Gestiona talleres y marcas
- Ve logs del sistema
- Configura feature flags e integraciones

El rol ESTADO hoy solo tiene 3 páginas de lectura:
- `/estado` — dashboard con estadísticas
- `/estado/sector` — diagnóstico del sector
- `/estado/exportar` — exportes en CSV

Esto es un error arquitectural grave para el piloto con OIT:

**Por qué es un error:**
1. **La formalización es competencia del Estado, no de una plataforma** — quien dice "este documento es válido" debería ser el Estado (el ente regulador), no un admin técnico de la plataforma
2. **Los documentos requeridos por nivel son política pública** — decidir que PLATA requiere ART es una decisión regulatoria, no de configuración técnica
3. **La OIT necesita trazabilidad institucional** — si hay una observación externa, el Estado debe poder defender las decisiones tomadas sobre formalización

**Qué debería hacer cada rol:**

| Responsabilidad | Hoy | V3 |
|----------------|-----|-----|
| Aprobar/rechazar documentos | ADMIN | **ESTADO** |
| Configurar tipos de documento por nivel | ADMIN | **ESTADO** |
| Ver dashboard sector textil | ESTADO | ESTADO |
| Exportar datos del sector | ESTADO | ESTADO |
| Gestión de usuarios | ADMIN | ADMIN |
| Gestión técnica (feature flags, integraciones) | ADMIN | ADMIN |
| Configuración de archivos permitidos | ADMIN | ADMIN |
| Logs del sistema | ADMIN | ADMIN (con acceso ESTADO en su propio scope) |
| Gestión de talleres/marcas (datos básicos) | ADMIN | ADMIN (pero sin decisión sobre niveles) |

**ESTADO se convierte en el actor institucional** que regula la formalización. ADMIN se convierte en el operador técnico que mantiene la plataforma funcionando. Esta separación refleja la realidad institucional.

---

## 2. Qué construir

1. **Mover rutas de validación de `/admin/` a `/estado/`**
   - `/admin/talleres/[id]` → mantener en ADMIN (gestión técnica) + crear `/estado/talleres/[id]` (visión regulatoria)
   - `/admin/documentos` → `/estado/documentos` (configuración de tipos por nivel)
   - `/admin/auditorias` → `/estado/auditorias` + dejar acceso ADMIN de solo lectura
2. **Redefinir permisos de endpoints de validación**
   - `PUT /api/validaciones/[id]` (aprobar/rechazar/revocar) — ahora requiere rol ESTADO, no ADMIN
   - `/api/tipos-documento` (POST y PUT) — cambiar check de `role !== 'ADMIN'` a `role !== 'ESTADO'`. GET se mantiene accesible para ambos roles (ADMIN y ESTADO)
3. **Nuevas páginas ESTADO**
   - `/estado/talleres` — listado con filtros por nivel, provincia, estado de formalización
   - `/estado/talleres/[id]` — detalle de taller con foco en formalización (documentos pendientes, historial)
   - `/estado/documentos` — CRUD de tipos de documento por nivel (mover UI desde `admin/documentos/page.tsx` sin cambiar las URLs del fetch a `/api/tipos-documento`)
   - `/estado/auditorias` — historial de decisiones de validación
4. **Limpieza de ADMIN**
   - Eliminar tab "Formalización" de `/admin/talleres/[id]` (mover a ESTADO)
   - Eliminar `/admin/documentos` (mover a ESTADO)
   - Dejar acceso de lectura ADMIN a estas rutas del ESTADO para troubleshooting
5. **Migración de datos**
   - Agregar campo `aprobadoPor` a tabla `Validacion` (ver sección 5.2)
   - Los logs existentes de aprobaciones hechas por ADMIN quedan como están
   - Marcar en el log qué rol hizo cada acción

---

## 3. Cambios en permisos

### 3.1 — Middleware (páginas)

Archivo: `src/middleware.ts`

El middleware actual ya tiene la estructura correcta con bloques `if (pathname.startsWith('/...'))`. No requiere rewrite — solo ajustes puntuales a los bloques existentes:

**Bloque ADMIN (líneas 69-81 actuales):**

```typescript
// Antes:
if (pathname.startsWith('/admin')) {
  if (userRole === 'ADMIN') return NextResponse.next()
  if (userRole === 'CONTENIDO' && (...)) return NextResponse.next()
  if (userRole === 'ESTADO' && pathname.startsWith('/admin/auditorias')) return NextResponse.next()
  return NextResponse.redirect(new URL('/unauthorized', nextUrl))
}

// Después: eliminar la excepción de ESTADO para /admin/auditorias
// (ESTADO tendrá su propia ruta /estado/auditorias)
if (pathname.startsWith('/admin')) {
  if (userRole === 'ADMIN') return NextResponse.next()
  if (userRole === 'CONTENIDO' && (
    pathname.startsWith('/admin/colecciones') ||
    pathname.startsWith('/admin/evaluaciones')
  )) return NextResponse.next()
  return NextResponse.redirect(new URL('/unauthorized', nextUrl))
}
```

**Bloque ESTADO (líneas 99-105 actuales):**

```typescript
// Antes:
if (pathname.startsWith('/estado')) {
  if (userRole !== 'ESTADO' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl))
  }
  return NextResponse.next()
}

// Después: agregar lógica de solo-lectura para ADMIN en rutas específicas
if (pathname.startsWith('/estado')) {
  if (userRole === 'ESTADO') return NextResponse.next()
  if (userRole === 'ADMIN') return NextResponse.next() // acceso lectura para troubleshooting
  return NextResponse.redirect(new URL('/unauthorized', nextUrl))
}
```

> **Nota:** El `matcher` del middleware (línea 142) excluye rutas `/api`. Los permisos de endpoints API se controlan inline en cada route handler (ver sección 3.2), no en el middleware.

### 3.2 — Endpoints API (inline en cada route handler)

Los cambios de permisos en endpoints se hacen modificando el check de rol inline en cada handler:

| Endpoint actual | Archivo | Rol actual | Rol V3 | Cambio |
|-----------------|---------|------------|--------|--------|
| `PUT /api/validaciones/[id]` (aprobar/rechazar/revocar) | `src/app/api/validaciones/[id]/route.ts` | ADMIN (línea 31, 44, 64) | **ESTADO** | Cambiar `role !== 'ADMIN'` → `role !== 'ESTADO'` en 3 lugares |
| `POST /api/tipos-documento` (crear tipo) | `src/app/api/tipos-documento/route.ts` | ADMIN (línea 25) | **ESTADO** | Cambiar `role !== 'ADMIN'` → `role !== 'ESTADO'` |
| `PUT /api/tipos-documento` (editar tipo) | `src/app/api/tipos-documento/route.ts` | ADMIN (línea 60) | **ESTADO** | Cambiar `role !== 'ADMIN'` → `role !== 'ESTADO'` |
| `GET /api/tipos-documento` (listar tipos) | `src/app/api/tipos-documento/route.ts` | Cualquier autenticado (línea 8) | ADMIN + ESTADO | Sin cambio (ya funciona para ambos) |
| `GET /api/admin/talleres/[id]` | `src/app/api/admin/talleres/[id]/route.ts` | ADMIN | ADMIN + **ESTADO** | Agregar check `role !== 'ADMIN' && role !== 'ESTADO'` |

**Patrón general:** las acciones de **validación regulatoria** van a ESTADO, las acciones de **gestión técnica** siguen en ADMIN.

---

## 4. Cambios en la UI

### 4.1 — Nuevas páginas ESTADO

#### `/estado/talleres/page.tsx`

Listado de talleres con vista institucional:
- Columnas: Nombre, Nivel, Provincia, Documentos pendientes, Última actividad
- Filtros: Nivel (Bronce/Plata/Oro), Provincia, Estado de formalización (verificado AFIP, pendiente)
- Link a detalle de cada taller

#### `/estado/talleres/[id]/page.tsx`

Detalle con pestañas:
- **Formalización** (tab principal) — checklist de documentos con botones Aprobar/Rechazar/Revocar
- **Historial** — timeline de decisiones tomadas
- **Datos del taller** — solo lectura (el ADMIN puede editarlos desde `/admin/talleres/[id]`)

**Sobre las server actions:** las 3 actions de validación (`aprobarValidacion`, `rechazarValidacion`, `revocarValidacion`) están definidas inline en `admin/talleres/[id]/page.tsx` (líneas 82-145), no en archivos separados. Prescripción:

1. **Mover** las 3 server actions al nuevo `estado/talleres/[id]/page.tsx`
2. **Cambiar** el check `role === 'ADMIN'` a `role === 'ESTADO'` en cada action
3. **Eliminar** esas 3 actions y la UI del tab "Formalización" del page de ADMIN
4. `guardarNota()` (líneas 147-167) **queda en ADMIN** — las notas internas son responsabilidad de gestión técnica, no del Estado

#### `/estado/documentos/page.tsx`

Mover la UI desde `admin/documentos/page.tsx` (156 líneas, `'use client'`). Esta página llama a `/api/tipos-documento` — las URLs del fetch no cambian, solo se mueve el archivo de `(admin)/admin/documentos/` a `(estado)/estado/documentos/`.

Contenido:
- Lista actual con: Nombre, Nivel mínimo (BRONCE/PLATA/ORO), Requerido (sí/no), Enlace trámite, Puntos otorgados
- Botones: Editar, Agregar nuevo, Activar/desactivar

#### `/estado/auditorias/page.tsx`

Historial completo de decisiones del Estado:
- Filtros: Fecha, Auditor, Acción (aprobado/rechazado/revocado), Taller afectado
- Export a CSV
- Link a cada auditoría específica

### 4.2 — Cambios en ADMIN

**Remover de `/admin/talleres/[id]`:**
- Tab "Formalización" completa (botones Aprobar/Rechazar quedan solo en ESTADO)
- Server actions `aprobarValidacion`, `rechazarValidacion`, `revocarValidacion` (líneas 82-145 del page actual)
- Badge de "X documentos pendientes" (mover a ESTADO)

**Dejar en `/admin/talleres/[id]`:**
- Datos del taller (editables)
- Tab "Historial" de acceso a la plataforma
- Tab "Actividad" (logs recientes)
- Notas internas con server action `guardarNota()` (solo admin)

**Eliminar:**
- `/admin/documentos` y su navegación (la UI se muda a `/estado/documentos`)
- Link a "Documentos" en el sidebar ADMIN (si existe)

### 4.3 — Navegación

Sidebar ESTADO pasa de 5 items a 8 (`src/compartido/componentes/layout/user-sidebar.tsx` líneas 61-67):

```typescript
ESTADO: [
  { id: 'dashboard', label: 'Dashboard', href: '/estado', icon: Home },
  { id: 'talleres', label: 'Talleres', href: '/estado/talleres', icon: Building2 },       // ← nuevo
  { id: 'documentos', label: 'Documentos', href: '/estado/documentos', icon: FileText },   // ← nuevo
  { id: 'auditorias', label: 'Auditorías', href: '/estado/auditorias', icon: ClipboardCheck }, // ← antes apuntaba a /admin/auditorias
  { id: 'sector', label: 'Diagnóstico Sector', href: '/estado/sector', icon: BarChart },   // ← ya existía la página pero NO estaba en el sidebar
  { id: 'exportar', label: 'Exportar Datos', href: '/estado/exportar', icon: Download },
  { id: 'notificaciones', label: 'Notificaciones', href: '/cuenta/notificaciones', icon: Bell, badge: 0 },
  { id: 'cuenta', label: 'Mi Cuenta', href: '/cuenta', icon: Settings },
]
```

> **Nota:** `/estado/sector` ya existe como página (259 líneas) pero no estaba incluida en el sidebar de ESTADO. Este spec aprovecha para corregir esa inconsistencia.

Sidebar ADMIN pierde:
- "Documentos" (si existía como item directo)

---

## 5. Migración y retrocompatibilidad

### 5.1 — Usuarios con rol ESTADO existente

En el seed hay 1 usuario con rol ESTADO: `anabelen.torres@pdt.org.ar`. No se modifica. Al deployar V3, automáticamente tiene acceso a las nuevas rutas.

### 5.2 — Trazabilidad de validaciones: agregar campo `aprobadoPor`

**Situación actual:** el modelo `Validacion` en Prisma **NO tiene** un campo `aprobadoPor`. Los campos actuales son:

```
id, tallerId, tipo, tipoDocumentoId, estado, detalle, documentoUrl, fechaVencimiento, createdAt, updatedAt
```

Quién aprobó/rechazó una validación se registra **solo** en `LogActividad` (acción `ADMIN_VALIDACION_COMPLETADO`/`RECHAZADO` con `userId`). Esto es frágil para la vista de auditoría porque requiere correlacionar logs por timestamp.

**Decisión: agregar el campo `aprobadoPor`** para trazabilidad directa:

```prisma
model Validacion {
  // ... campos existentes ...
  aprobadoPor     String?
  aprobadoEn      DateTime?
  usuarioAprobador Usuario? @relation("validacionesAprobadas", fields: [aprobadoPor], references: [id])
}
```

**Migración Prisma:**

```sql
ALTER TABLE "Validacion" ADD COLUMN "aprobadoPor" TEXT;
ALTER TABLE "Validacion" ADD COLUMN "aprobadoEn" TIMESTAMP;
ALTER TABLE "Validacion" ADD CONSTRAINT "Validacion_aprobadoPor_fkey"
  FOREIGN KEY ("aprobadoPor") REFERENCES "Usuario"("id") ON DELETE SET NULL;
```

**Migración de datos históricos:**

```sql
-- Extraer userId de LogActividad para validaciones ya aprobadas/rechazadas
UPDATE "Validacion" v
SET "aprobadoPor" = la."userId",
    "aprobadoEn" = la."createdAt"
FROM "LogActividad" la
WHERE la."accion" IN ('ADMIN_VALIDACION_COMPLETADO', 'ADMIN_VALIDACION_RECHAZADO')
  AND (la."detalles"->>'validacionId')::text = v."id"
  AND v."estado" IN ('COMPLETADO', 'RECHAZADO')
  AND v."aprobadoPor" IS NULL;
```

> **Nota:** esta migración de datos es best-effort. Si algún log fue purgado o no tiene `validacionId` en detalles, la validación queda con `aprobadoPor = NULL` (fue aprobada antes del tracking). La UI muestra "Sistema (pre-V3)" en esos casos.

### 5.3 — Logs existentes

Los logs en `LogActividad` con acciones `ADMIN_VALIDACION_*` no se migran. Van a mostrar el userId del admin que hizo la acción en su momento. Los nuevos logs usan `ESTADO_VALIDACION_*` como prefijo para distinguir.

---

## 6. Casos borde

- **ADMIN intenta aprobar un documento después de V3** — el endpoint retorna 403: "Esta acción requiere rol ESTADO". Mensaje claro para que el admin sepa dónde pedir acción.

- **Un solo usuario con rol ESTADO en producción** — Anabelen Torres se convierte en cuello de botella durante el piloto. El admin puede crear más usuarios ESTADO desde `/admin/usuarios`, asignándoles el rol.

- **Conflicto de responsabilidades** — si ADMIN intenta crear un tipo de documento via `/api/tipos-documento` POST, el endpoint rechaza con 403. Solo ESTADO configura tipos.

- **ESTADO elimina un tipo de documento activo** — los talleres que tienen validaciones para ese tipo mantienen sus puntos pero el tipo se marca como "descontinuado". No se puede pedir en adelante, pero las decisiones históricas se respetan.

- **Admin de soporte necesita ver formalización urgente** — `/estado/talleres/[id]` es accesible para ADMIN en modo solo lectura (sin botones de acción). El middleware permite ADMIN en rutas `/estado`.

---

## 7. Prescripciones técnicas

### 7.1 — Orden de implementación

1. **Migración Prisma** — agregar campos `aprobadoPor` y `aprobadoEn` a Validacion
2. **Migración de datos históricos** — ejecutar UPDATE para popular `aprobadoPor` desde LogActividad
3. Crear nuevas rutas ESTADO sin romper las de ADMIN (paralelas)
4. Crear helper `requiereRol` / `requiereRolApi`
5. Actualizar middleware para ajustar permisos de páginas
6. Actualizar endpoints API para cambiar checks de rol
7. Migrar la UI ADMIN para redirigir acciones de aprobación a rutas ESTADO
8. Una vez verificado, remover UI obsoleta de ADMIN
9. Actualizar sidebar de ESTADO y ADMIN

Este orden minimiza riesgo — siempre hay un camino funcional.

### 7.2 — Helper de autorización

Nuevo archivo: `src/compartido/lib/permisos.ts`

```typescript
import { auth } from './auth'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

/**
 * Para uso en Server Components.
 * Verifica que el usuario tiene uno de los roles permitidos.
 */
export async function requiereRol(
  rolesPermitidos: ('ADMIN' | 'ESTADO' | 'CONTENIDO' | 'MARCA' | 'TALLER')[]
) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  if (!rolesPermitidos.includes(session.user.role)) {
    redirect('/unauthorized')
  }
  return session
}

/**
 * Para uso en API routes.
 * Retorna la sesión o un NextResponse con error.
 */
export async function requiereRolApi(
  rolesPermitidos: string[]
): Promise<NextResponse | { userId: string; role: string }> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!rolesPermitidos.includes(session.user.role)) {
    return NextResponse.json(
      { error: `Requiere rol: ${rolesPermitidos.join(' o ')}` },
      { status: 403 }
    )
  }
  return { userId: session.user.id, role: session.user.role }
}
```

> **Nota:** Este helper se usa solo en rutas nuevas de V3. Los 53+ callers existentes con el patrón inline (`const role = (session.user as { role?: string }).role; if (role !== 'ADMIN') ...`) no se refactorizan en este spec — eso es un PR aparte para evitar un changeset masivo.

Uso:

```typescript
// En página ESTADO
export default async function Page() {
  await requiereRol(['ESTADO'])
  // ...
}

// En página con acceso dual (ESTADO actúa, ADMIN lee)
export default async function Page() {
  const session = await requiereRol(['ESTADO', 'ADMIN'])
  const soloLectura = session.user.role === 'ADMIN'
  // ...
}

// En API route
export async function PUT(req: NextRequest) {
  const authResult = await requiereRolApi(['ESTADO'])
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult
  // ...
}
```

---

## 8. Criterios de aceptación

- [ ] Migración Prisma: campos `aprobadoPor` y `aprobadoEn` agregados a Validacion
- [ ] Migración de datos: validaciones históricas tienen `aprobadoPor` populado desde LogActividad
- [ ] Nuevas rutas ESTADO creadas: `/estado/talleres`, `/estado/talleres/[id]`, `/estado/documentos`, `/estado/auditorias`
- [ ] Middleware actualizado con las nuevas reglas de permisos (sin objeto `reglas`, ajustes puntuales)
- [ ] Endpoints de validación (`PUT /api/validaciones/[id]`) requieren rol ESTADO
- [ ] Endpoints de tipos de documento (`POST/PUT /api/tipos-documento`) requieren rol ESTADO; GET accesible para ambos
- [ ] UI ADMIN sin tab Formalización en talleres/[id] (server actions movidas a ESTADO)
- [ ] `guardarNota` server action permanece en ADMIN
- [ ] UI ADMIN sin menú de Documentos en sidebar
- [ ] Sidebar ESTADO con 8 items (incluyendo Sector que faltaba)
- [ ] Helper `requiereRol` y `requiereRolApi` creado y usado en todas las nuevas rutas
- [ ] ADMIN puede acceder a `/estado/talleres/[id]` en modo lectura (sin botones de acción)
- [ ] Logs de acciones de validación usan prefijo `ESTADO_VALIDACION_*`
- [ ] Build sin errores de TypeScript
- [ ] Validaciones históricas aprobadas por ADMIN se mantienen vigentes

---

## 9. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | ESTADO puede aprobar validación | Login como Anabelen, aprobar documento de taller | QA |
| 2 | ADMIN recibe 403 al aprobar validación | Login como Lucía, intentar aprobar por API | DEV |
| 3 | ADMIN puede ver detalle taller en modo lectura | Login como Lucía, acceder a `/estado/talleres/[id]` | QA |
| 4 | ADMIN no ve botones de aprobar en modo lectura | Misma página, verificar botones ocultos | QA |
| 5 | ESTADO crea nuevo tipo de documento | Login como Anabelen, ir a `/estado/documentos` | QA |
| 6 | ADMIN recibe 403 al crear tipo de documento | Login como Lucía, POST a `/api/tipos-documento` | DEV |
| 7 | Sidebar ESTADO tiene 8 items (incluyendo Sector) | Login como Anabelen, verificar menú | QA |
| 8 | Sidebar ADMIN no tiene Documentos | Login como Lucía, verificar menú | QA |
| 9 | Validación histórica aprobada por ADMIN sigue vigente | Verificar que talleres mantienen su nivel actual | QA |
| 10 | Campo `aprobadoPor` populado en validaciones históricas | Query directa a DB | DEV |
| 11 | Log de aprobación muestra prefijo ESTADO_VALIDACION_* | Aprobar como Anabelen, verificar log | DEV |
| 12 | Taller BRONCE no puede acceder a /estado | Login como Roberto, intentar ir a `/estado/talleres` | QA |

---

## 10. Impacto en otros specs

- **v3-tipos-documento-db (D-02)** — depende de este spec. Los tipos se configuran desde `/estado/documentos`, no desde `/admin/documentos`.
- **v3-proximo-nivel-dashboard (F-01)** — los tipos requeridos se leen de DB (configurados por ESTADO). Este spec es prerequisito.
- **v3-arca-completo (INT-01)** — la integración ARCA pre-carga datos que el ESTADO valida. Ver flujo completo.
- **v3-logs-admin-auditoria (S-04)** — el inventario de acciones sensibles ahora incluye acciones de ESTADO, no solo ADMIN. Actualizar.

---

## 11. Validación de dominio (perfiles interdisciplinarios)

**Politólogo:**
- ¿La separación ADMIN/ESTADO refleja correctamente la división entre gestión técnica y política pública?
- ¿Un Estado real (OIT o autoridad argentina) aceptaría esta responsabilidad sobre la plataforma?

**Economista:**
- ¿Los incentivos de los actores (taller, marca, ADMIN, ESTADO) siguen alineados con esta redefinición?
- ¿La carga de trabajo del ESTADO es sostenible con 1-2 personas para 25 talleres?

**Sociólogo:**
- ¿El taller percibe claramente la diferencia entre "el Estado aprobó mi documento" vs "un técnico de la plataforma lo aprobó"?
- ¿Esta diferencia genera más o menos confianza en el proceso de formalización?

**Contador:**
- ¿Qué documentos de formalización deben estar en esta lista según la realidad fiscal argentina?
- ¿El Estado tiene capacidad real de validar estos documentos (monotributo, ART, habilitación municipal)?

---

## 12. Referencias

- V3_BACKLOG → D-01
- V2 issues #81, #82, #83 — casos donde el middleware no permitía acceso cruzado (resuelto en V2, pero reveló el problema arquitectural)
- OIT — Estrategia de integración Estado + sector privado
