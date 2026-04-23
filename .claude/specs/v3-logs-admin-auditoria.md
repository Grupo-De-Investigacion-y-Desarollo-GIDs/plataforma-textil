# Spec: Logs de auditoría para acciones sensibles del admin

- **Versión:** V3
- **Origen:** V3_BACKLOG S-04
- **Asignado a:** Gerardo
- **Prioridad:** Media — necesario para accountability en piloto OIT

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG I-01 mergeado (ambientes separados)
- [ ] Modelo `LogActividad` y helper `logActividad()` ya existen en el proyecto (V2)

---

## 1. Contexto

Hoy el helper `logActividad()` se usa en algunas acciones pero no sistemáticamente. Acciones sensibles del admin como:

- Revocar certificado
- Aprobar/rechazar validación de documento
- Modificar datos de un taller
- Acceder a datos de otro usuario

...no siempre generan logs detallados que registren quién las ejecutó, cuándo y con qué parámetros.

Para el piloto con OIT esto es crítico porque:

- **Accountability institucional** — si un admin toma una decisión controversial (ej: rechazar el documento de un taller), tiene que quedar registro de quién fue y por qué
- **Auditoría externa** — OIT puede pedir en cualquier momento el historial completo de acciones tomadas sobre un taller específico
- **Detección de mal uso** — si alguien con rol ADMIN abusa de sus permisos, los logs son la única forma de detectarlo

Este spec hace un barrido completo de los endpoints sensibles y agrega logging consistente a todos.

---

## 2. Qué construir

1. **Inventario de acciones sensibles** — documentar las ~14 acciones del admin/estado que deben loguearse
2. **Patrón estándar de logging** — wrapper tipado para acciones sensibles del admin
3. **Aplicación sistemática en endpoints** — agregar logging donde falta
4. **UI mejorada en `/admin/logs`** — filtros por usuario, acción, fecha, entidad afectada
5. **Export de logs a CSV** — reutilizando lógica existente de `/api/exportar`

---

## 3. Inventario de acciones sensibles

> **Nota:** Este inventario refleja los endpoints que realmente existen en el codebase. Las rutas verificadas son las del proyecto actual — varias de las que se planificaron originalmente (desactivar/activar usuario, cambiar nivel manual, suspender taller, feature flags) no se implementaron en V2 y no tienen endpoint ni UI.

### Gestión de usuarios
| Acción | Endpoint real | Sensibilidad | Ya tiene log |
|--------|---------------|--------------|--------------|
| Crear usuario | `POST /api/admin/usuarios` | Alta | Verificar |
| Editar usuario (rol, estado) | `PUT /api/admin/usuarios/[id]` | Alta | Verificar |
| Desactivar usuario | `DELETE /api/admin/usuarios/[id]` (setea `active: false`) | Alta | Verificar |

### Gestión de talleres
| Acción | Endpoint real | Sensibilidad | Ya tiene log |
|--------|---------------|--------------|--------------|
| Editar datos del taller | `PUT /api/talleres/[id]` | Media | Verificar |
| Ver datos sensibles (CUIT, DNI) | Page server component `admin/talleres/[id]/page.tsx` | Baja | No (no hay API, es page) |

### Validaciones de documentos
| Acción | Endpoint real | Sensibilidad | Ya tiene log |
|--------|---------------|--------------|--------------|
| Aprobar validación | `PUT /api/validaciones/[id]` (body: `estado: 'COMPLETADO'`) | Alta | Sí (`ADMIN_VALIDACION_COMPLETADO`) |
| Rechazar validación | `PUT /api/validaciones/[id]` (body: `estado: 'RECHAZADO'`) | Alta | Sí (`ADMIN_VALIDACION_RECHAZADO`) |
| Revocar validación | Server action en `admin/talleres/[id]/page.tsx` | Crítica | Verificar |

### Certificados y academia
| Acción | Endpoint real | Sensibilidad | Ya tiene log |
|--------|---------------|--------------|--------------|
| Emitir certificado | `POST /api/certificados` | Alta | Sí (`CERTIFICADO_EMITIDO`) |
| Revocar certificado | `PATCH /api/certificados` (body: `{ id, motivo }`) | Crítica | Verificar |
| Editar/borrar colección | `PUT/DELETE /api/colecciones/[id]` | Media | No |

### Notas y gestión interna
| Acción | Endpoint real | Sensibilidad | Ya tiene log |
|--------|---------------|--------------|--------------|
| Crear nota interna | `POST /api/admin/notas` | Media | Verificar |
| Gestionar documentos RAG | `POST/DELETE /api/admin/rag/[id]` | Media | Verificar |
| Borrar denuncia | `DELETE /api/denuncias/[id]` | Alta | No |

### Acciones del Estado
| Acción | Endpoint real | Sensibilidad | Ya tiene log |
|--------|---------------|--------------|--------------|
| Exportar datos | `GET /api/exportar?tipo=talleres|marcas|resumen|...` | Alta | No |

---

## 4. Patrón estándar de logging

### 4.1 — Cuándo loguear

Una acción es "sensible" si cumple al menos uno de estos criterios:

1. **Modifica datos de otro usuario** (un admin cambiando algo de un taller)
2. **Afecta visibilidad o reputación** (revocar certificado)
3. **Cambia configuración del sistema** (tipos de documento)
4. **Accede a datos personales** (CUIT, DNI, teléfono — solo log de acceso, no del contenido)
5. **Ejecuta operaciones destructivas** (borrar, revocar)

### 4.2 — Formato del log

```typescript
logAccionAdmin(
  'ACCION_EN_MAYUSCULAS',     // string único por tipo de acción
  session.user.id,              // quién ejecutó
  {
    entidad: 'taller' | 'usuario' | 'pedido' | 'validacion' | etc,
    entidadId: string,          // ID del recurso afectado
    cambios: { ... },           // diff de antes/después cuando aplique
    motivo: string | null,      // motivo si el admin lo proporcionó
    metadata: { ... },          // info adicional relevante
  }
)
```

### 4.3 — Ejemplos

**Aprobación de validación:**
```typescript
logAccionAdmin('VALIDACION_APROBADA', session.user.id, {
  entidad: 'validacion',
  entidadId: validacion.id,
  metadata: {
    tallerId: validacion.tallerId,
    tipoDocumento: validacion.tipo,
  },
})
```

**Revocación de certificado:**
```typescript
logAccionAdmin('CERTIFICADO_REVOCADO', session.user.id, {
  entidad: 'certificado',
  entidadId: certificado.id,
  motivo: body.motivo,
  metadata: {
    tallerId: certificado.tallerId,
    coleccionId: certificado.coleccionId,
  },
})
```

**Exportación de datos:**
```typescript
logAccionAdmin('DATOS_EXPORTADOS', session.user.id, {
  entidad: 'exportacion',
  entidadId: tipo,  // 'talleres', 'marcas', etc
  metadata: { formato: 'csv' },
})
```

### 4.4 — Motivo obligatorio en acciones críticas

Las acciones marcadas como **Crítica** en el inventario requieren `motivo` obligatorio:

- **Revocar validación** — ya tiene campo `motivo` obligatorio en la UI (`admin/talleres/[id]/page.tsx:391-405`, input text con `required`)
- **Revocar certificado** — ya tiene campo `motivo` obligatorio en la UI (`admin/certificados/page.tsx:102-121`, select con 4 opciones predefinidas)

Ambas UIs fueron implementadas en V2. La acción de este spec es **verificar que los motivos existentes se logueen consistentemente** con `logAccionAdmin`, no agregar campos nuevos a la UI.

> **Nota:** "Cambiar nivel manualmente" no es una operación que exista en la plataforma. El nivel se calcula automáticamente via `aplicarNivel()` cuando se aprueban/revocan validaciones. No hay override manual, ni UI, ni endpoint.

---

## 5. Prescripciones técnicas

### 5.1 — Wrapper tipado (no cambiar firma existente)

El helper `logActividad` actual tiene firma genérica:

```typescript
export function logActividad(
  accion: string,
  userId?: string | null,
  detalles?: Prisma.InputJsonValue,
)
```

**No cambiar esta firma.** Hay 18 callers existentes que pasan shapes distintos de `detalles` (ninguno tiene `entidad`/`entidadId` excepto feedback). Cambiar el tipo a uno estricto rompe 17 de 18 callers.

En su lugar, agregar un wrapper tipado para acciones del admin:

```typescript
// src/compartido/lib/log.ts — agregar al final del archivo

type EntidadAfectada = 'taller' | 'marca' | 'usuario' | 'pedido' | 'cotizacion'
  | 'validacion' | 'certificado' | 'coleccion' | 'configuracion' | 'exportacion'
  | 'nota' | 'rag' | 'denuncia'

interface LogAdminDetails {
  entidad: EntidadAfectada
  entidadId: string
  motivo?: string
  cambios?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/**
 * Wrapper tipado para acciones sensibles del admin.
 * Fuerza entidad y entidadId como campos requeridos.
 * Internamente usa logActividad (fire-and-forget).
 */
export function logAccionAdmin(
  accion: string,
  userId: string,
  detalles: LogAdminDetails
) {
  logActividad(accion, userId, detalles)
}
```

Los 18 callers existentes siguen usando `logActividad` genérico sin cambios. Las acciones nuevas del spec usan `logAccionAdmin` con tipado estricto.

### 5.2 — Aplicación sistemática

Para cada endpoint del inventario (sección 3) que no tenga logging:

1. Importar `logAccionAdmin` de `@/compartido/lib/log`
2. Agregar la llamada al final del handler (después del update/create/delete exitoso)
3. Usar el formato estándar de sección 4.2

Para endpoints que ya tienen `logActividad` (como `ADMIN_VALIDACION_*` o `CERTIFICADO_EMITIDO`), evaluar caso por caso si vale migrar a `logAccionAdmin` o dejar como está. Priorizar consistencia sin romper logs existentes.

### 5.3 — UI de `/admin/logs` mejorada

Modificar `src/app/(admin)/admin/logs/page.tsx`:

**Filtros nuevos:**
- Por usuario que ejecutó (dropdown con ADMIN/ESTADO)
- Por tipo de acción (dropdown con las ~14 acciones del inventario)
- Por entidad afectada (taller, marca, validación, etc)
- Por fecha (rango)

**Columnas:**
- Fecha/hora
- Usuario
- Acción (badge con color según sensibilidad)
- Entidad afectada (link al recurso)
- Motivo (si aplica)
- Ver detalles (expande metadata)

**Tamaño de página:** 50 logs. Paginación existente.

### 5.4 — Export a CSV

**Extraer `toCsv` a utility compartido.** La función ya existe inline en `src/app/api/exportar/route.ts`. Moverla a:

Archivo nuevo: `src/compartido/lib/csv.ts`

```typescript
/**
 * Genera un string CSV a partir de headers y filas.
 * Escapa comillas y caracteres especiales según RFC 4180.
 */
export function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [headers.map(escape).join(',')]
  for (const row of rows) {
    lines.push(row.map(escape).join(','))
  }
  return lines.join('\n')
}
```

Actualizar `src/app/api/exportar/route.ts` para importar de `@/compartido/lib/csv` en vez de tener la función inline.

**Agregar export CSV al endpoint de logs existente.** No crear endpoint nuevo — extender `GET /api/admin/logs` con query param `export=csv`:

```
GET /api/admin/logs?export=csv&desde=2026-04-01&hasta=2026-04-23
```

Cuando `export=csv` está presente:
- Ignora paginación (trae todos los logs del rango)
- Retorna CSV con headers: `fecha,usuario_email,usuario_rol,accion,entidad,entidad_id,motivo,detalles`
- Content-Type: `text/csv; charset=utf-8`
- Content-Disposition: `attachment; filename="logs_2026-04-01_2026-04-23.csv"`

Rate limit: 5 exportaciones por hora (del spec S-02 de rate limiting).

---

## 6. Casos borde

- **logActividad falla (DB caída)** — el helper ya tiene `.catch()` que imprime en consola pero no bloquea la acción. Comportamiento correcto — no queremos que una caída del logging impida aprobar una validación.

- **Acción ejecutada por ESTADO, no ADMIN** — el log se guarda igual con el userId del ESTADO. El filtro por rol en la UI permite ver solo acciones de ESTADO o solo de ADMIN.

- **Acción en cadena (ej: aprobar validación → recalcular nivel)** — cada paso se loguea por separado (VALIDACION_APROBADA y NIVEL_SUBIDO/BAJADO). Permite reconstruir la secuencia.

- **Motivo muy largo** — limitar a 500 caracteres en UI y endpoint. Suficiente para contexto.

- **Logs de hace mucho tiempo** — sin límite de retención por ahora. Para V4 evaluar archivar logs >1 año a storage.

- **Privacy: el motivo contiene datos sensibles** — el motivo lo escribe el admin, asumimos responsabilidad institucional sobre lo que escribe. Mismo criterio que emails internos.

- **Migración de logs existentes** — los logs creados con `logActividad` genérico (sin `entidad`/`entidadId`) siguen siendo consultables. La UI muestra "—" en las columnas que no tienen esos campos. No hay migración retroactiva.

---

## 7. Criterios de aceptación

- [ ] Inventario de ~14 acciones sensibles documentado y verificado contra el codebase
- [ ] Wrapper `logAccionAdmin` agregado a `src/compartido/lib/log.ts` con tipado estricto
- [ ] `logActividad` existente NO se modifica — los 18 callers siguen funcionando
- [ ] Las ~14 acciones del inventario generan logs consistentes
- [ ] 2 acciones críticas (revocar validación, revocar certificado) loguean motivo correctamente
- [ ] UI `/admin/logs` tiene filtros por usuario, acción, entidad y fecha
- [ ] UI muestra badges de sensibilidad (crítica/alta/media/baja)
- [ ] `toCsv` extraído a `src/compartido/lib/csv.ts` y usado en ambos endpoints
- [ ] `GET /api/admin/logs?export=csv` retorna CSV válido con rate limit
- [ ] Build sin errores de TypeScript
- [ ] Logs existentes siguen siendo compatibles (el cambio es aditivo)

---

## 8. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | Aprobar validación genera log con entidad/entidadId | Aprobar desde admin, verificar log en /admin/logs | QA |
| 2 | Revocar validación sin motivo retorna error | Ya implementado — verificar que sigue funcionando | DEV |
| 3 | Revocar con motivo genera log con motivo | Revocar con motivo "Documento vencido", verificar | QA |
| 4 | Filtro por usuario funciona | Filtrar logs por admin específico | QA |
| 5 | Filtro por fecha funciona | Seleccionar rango, verificar resultados | QA |
| 6 | Export CSV descarga archivo con datos correctos | Click en "Exportar", abrir CSV | QA |
| 7 | Rate limit de export se aplica | 6 exports rápidos, último da 429 | DEV |
| 8 | logActividad genérico sigue funcionando | Verificar que acciones existentes (COTIZACION_RECIBIDA, etc) siguen generando logs | DEV |
| 9 | Logs sin entidad/entidadId se muestran con "—" | Verificar logs antiguos en la UI | QA |
| 10 | Borrar denuncia genera log | Borrar denuncia desde admin, verificar log | DEV |

---

## 9. Deuda técnica que resuelve

- Accountability institucional para OIT
- Detección de mal uso por parte de admins
- Base para auditoría externa
- Trazabilidad completa de cambios críticos

---

## 10. Referencias

- V3_BACKLOG → S-04
- Modelo `LogActividad` en `prisma/schema.prisma`
- Helper `logActividad` en `src/compartido/lib/log.ts`
- Utility `toCsv` en `src/app/api/exportar/route.ts` (a extraer)
