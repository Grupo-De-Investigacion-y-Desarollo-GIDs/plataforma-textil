# QA: Logs de auditoria para acciones sensibles del admin

**Spec:** `v3-logs-admin-auditoria.md` (S-04)
**Commit de implementacion:** `8423747`
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-04-26
**Auditor(es):** Sergio (tecnico)
**Incluye Eje 6 de validacion de dominio:** no

---

## Contexto institucional

Este spec agrega trazabilidad completa a las acciones del admin y del Estado sobre la plataforma. Para el piloto con OIT, es critico que cada decision (aprobar un documento, revocar un certificado, editar datos de un taller) quede registrada con quien la ejecuto, cuando y por que. Esto habilita accountability institucional y auditorias externas.

---

## Objetivo de este QA

Verificar que las 14 acciones sensibles generan logs consistentes con entidad/entidadId, que la UI de /admin/logs tiene filtros funcionales, y que el export CSV funciona correctamente.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante
5. Si el resultado no es ok → abri el widget azul "Feedback" → describí que paso
6. Al terminar, completa el resultado global y commitea este archivo actualizado

---

## Credenciales de prueba

| Rol | Email | Password | URL de entrada |
|-----|-------|----------|----------------|
| ADMIN | `lucia.fernandez@pdt.org.ar` | `pdt2026` | `/admin` |
| TALLER Bronce | `roberto.gimenez@pdt.org.ar` | `pdt2026` | `/taller` |
| MARCA | `martin.echevarria@pdt.org.ar` | `pdt2026` | `/marca` |
| ESTADO | `anabelen.torres@pdt.org.ar` | `pdt2026` | `/estado` |

---

## Resultado global

- [ ] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar / fix inmediato / abrir item v4 ]
**Issues abiertos:** #

---

## Eje 1 — Funcionalidad

> **Nota:** Los items marcados **DEV** los verifica Gerardo desde el codigo o la terminal — no son verificables desde el browser. El auditor solo verifica los items marcados **QA**.

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Wrapper `logAccionAdmin` agregado a `src/compartido/lib/log.ts` con tipado estricto | DEV | | |
| 2 | `logActividad` existente NO se modifica — los callers existentes siguen funcionando | DEV | | |
| 3 | Aprobar validacion genera log con entidad/entidadId | QA | | |
| 4 | Rechazar validacion genera log con motivo | QA | | |
| 5 | Revocar validacion sin motivo retorna error (campo required en UI) | QA | | |
| 6 | Revocar validacion con motivo genera log con motivo | QA | | |
| 7 | Revocar certificado genera log con motivo | QA | | |
| 8 | Emitir certificado genera log | QA | | |
| 9 | Crear usuario genera log | QA | | |
| 10 | Editar usuario genera log | QA | | |
| 11 | Desactivar usuario genera log | QA | | |
| 12 | Editar taller (como admin) genera log | QA | | |
| 13 | Editar/borrar coleccion genera log | QA | | |
| 14 | Crear nota interna genera log (ir a /admin/talleres, click en un taller, seccion "Notas internas" al final, escribir texto y guardar. Luego verificar en /admin/logs que aparece NOTA_INTERNA_CREADA) | QA | | |
| 15 | Crear/desactivar documento RAG genera log | DEV | | |
| 16 | Exportar datos genera log DATOS_EXPORTADOS | QA | | |
| 17 | UI `/admin/logs` tiene filtros por usuario, accion, entidad y fecha | QA | | |
| 18 | UI muestra badges de sensibilidad (critica/alta/media/baja) | QA | | |
| 19 | `toCsv` extraido a `src/compartido/lib/csv.ts` y usado en ambos endpoints | DEV | | |
| 20 | `GET /api/admin/logs?export=csv` retorna CSV valido | QA | | |
| 21 | Build sin errores de TypeScript | DEV | | |
| 22 | Logs existentes siguen siendo compatibles (el cambio es aditivo) | DEV | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Verificar logs de validacion

- **Rol:** ADMIN (`lucia.fernandez@pdt.org.ar`)
- **URL de inicio:** `/admin/talleres`
- **Verificador:** QA
- **Accion:** Entrar a un taller con validacion PENDIENTE. Aprobar la validacion. Ir a `/admin/logs`.
- **Esperado:** El log aparece con accion VALIDACION_APROBADA, entidad "validacion", sensibilidad "Alta"
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Verificar filtros de logs

- **Rol:** ADMIN
- **URL de inicio:** `/admin/logs`
- **Verificador:** QA
- **Accion:** Filtrar por entidad "validacion". Filtrar por usuario. Filtrar por rango de fechas.
- **Esperado:** La tabla se actualiza mostrando solo los logs que coinciden con el filtro
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Verificar export CSV

- **Rol:** ADMIN
- **URL de inicio:** `/admin/logs`
- **Verificador:** QA
- **Accion:** Aplicar algun filtro. Click en "Exportar CSV".
- **Esperado:** Se descarga un archivo CSV con headers: fecha, usuario_email, usuario_rol, accion, entidad, entidad_id, motivo, detalles
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Verificar log de exportacion de datos

- **Rol:** ADMIN o ESTADO
- **URL de inicio:** `/admin` o `/estado`
- **Verificador:** QA
- **Accion:** Ir a exportar datos (talleres, marcas, etc). Exportar. Ir a `/admin/logs`.
- **Esperado:** Aparece log DATOS_EXPORTADOS con entidad "exportacion"
- **Resultado:** [ ]
- **Notas:**

### Paso 5 — Verificar detalle expandible

- **Rol:** ADMIN
- **URL de inicio:** `/admin/logs`
- **Verificador:** QA
- **Accion:** Click en el chevron de un log que tenga detalles.
- **Esperado:** Se expande mostrando el JSON completo de detalles
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Logs antiguos sin entidad/entidadId | Ver logs previos a esta implementacion en `/admin/logs` | Muestran "—" en columnas entidad y motivo | QA | |
| 2 | Filtrar sin resultados | Aplicar filtros que no matchean ningun log | Mensaje "No hay logs para mostrar" | QA | |
| 3 | CSV con filtros vacios | Exportar CSV sin filtros | Se exportan todos los logs (hasta 10000) | QA | |
| 4 | Paginacion funciona | Navegar paginas en una lista larga de logs | Navegacion fluida, contadores correctos | QA | |
| 5 | logActividad generico sigue funcionando | Verificar que acciones como COTIZACION_RECIBIDA, LOGIN_SUCCESS siguen generando logs | Logs genericos aparecen en la lista | DEV | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| `/admin/logs` carga en menos de 3 segundos | Abrir DevTools > Network > recargar | QA | |
| Filtros responden rapido | Cambiar filtro y medir tiempo de respuesta | QA | |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | |
| Export CSV descarga en tiempo razonable | Click exportar, medir descarga | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | | |
| Colores del design system (brand-blue, brand-red) | | |
| Badges de sensibilidad tienen colores distinguibles | | |
| Estados vacios tienen mensaje descriptivo (en /admin/logs, aplicar un filtro que no devuelva resultados — verificar que aparece "No hay logs para mostrar" en vez de tabla vacia) | | |
| Textos en espanol argentino | | |
| Sin texto en ingles visible al usuario | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |
|-------|------|-------------|------------------------|-----------|

---

## Notas de los auditores

**Sergio (tecnico):**
[observaciones tecnicas sobre implementacion, seguridad, performance]

**Perfiles interdisciplinarios:**
No aplica — spec puramente tecnico.

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
