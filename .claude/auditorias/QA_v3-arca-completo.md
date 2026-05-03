# QA: Integracion completa con ARCA/AFIP

**Spec:** `v3-arca-completo` (INT-01 + INT-02 unificados)
**Commit de implementacion:** (pendiente — pre-push)
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-05-02
**Auditor(es):** Sergio (tecnico)
**Incluye Eje 6 de validacion de dominio:** no

---

## Contexto institucional

La plataforma necesita diferenciar entre dato autodeclarado por el taller y dato verificado por el Estado (ARCA/AFIP). Esta integracion consulta el padron de ARCA al registrarse un taller, trae datos fiscales completos (tipo inscripcion, actividades, domicilio fiscal), y permite al ESTADO re-verificar y sincronizar talleres existentes. Los datos verificados se muestran con badge "Verificado por ARCA" y se distinguen visualmente de los autodeclarados.

---

## Objetivo de este QA

Verificar que: (1) el registro usa datos de ARCA correctamente, (2) los mensajes de error son claros y no bloquean cuando ARCA no responde, (3) ESTADO puede re-verificar y sincronizar, (4) los badges se muestran en las vistas correctas, (5) el mock funciona en dev sin consumir API real.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Segui los pasos en orden
3. Marca cada resultado con ok, bug o bloqueante
4. Si el resultado no es ok → abri el widget azul "Feedback" → describi que paso
5. Al terminar, completa el resultado global y commitea este archivo actualizado

---

## Resultado global

- [ ] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar INT-01 / fix inmediato / abrir item v4 ]
**Issues abiertos:** # (links a GitHub)

---

## Eje 1 — Funcionalidad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Schema tiene 9 campos nuevos en Taller + 2 enums + tabla ConsultaArca | DEV | ok | |
| 2 | consultarPadron retorna datos completos para CUIT activo | DEV | ok | |
| 3 | consultarPadron retorna CUIT_INEXISTENTE para CUIT que no existe | DEV | ok | |
| 4 | consultarPadron retorna CUIT_INACTIVO para estadoClave INACTIVO | DEV | ok | |
| 5 | consultarPadron retorna CUIT_INACTIVO para estadoClave BAJA | DEV | ok | |
| 6 | consultarPadron retorna CUIT_SIN_ACTIVIDAD para actividades vacias | DEV | ok | |
| 7 | consultarPadron retorna ARCA_NO_RESPONDE en timeout | DEV | ok | |
| 8 | consultarPadron retorna AFIPSDK_ERROR en error 401 | DEV | ok | |
| 9 | Cada consulta se registra en ConsultaArca (con y sin tallerId) | DEV | ok | |
| 10 | Cada consulta se loguea con accion AFIP_VERIFICACION | DEV | ok | |
| 11 | Mock funciona con ARCA_ENABLED=false | DEV | ok | |
| 12 | sincronizarTaller actualiza campos ARCA al verificar | DEV | ok | |
| 13 | sincronizarTaller respeta ventana de 30 dias | DEV | ok | |
| 14 | Errores bloqueantes (INEXISTENTE/INACTIVO/SIN_ACTIVIDAD) bloquean registro | DEV | ok | |
| 15 | Errores no bloqueantes (ARCA_NO_RESPONDE/AFIPSDK_ERROR) permiten continuar | DEV | ok | |
| 16 | Registro crea taller con datos ARCA extendidos (tipoInscripcion, actividades, domicilio) | DEV | ok | |
| 17 | Registro usa nombre de ARCA preferido sobre autodeclarado | DEV | ok | |
| 18 | GET /api/auth/verificar-cuit retorna datos extendidos (tipoInscripcion, estadoCuit) | QA | | # |
| 19 | GET /api/auth/verificar-cuit retorna mensaje de error legible para cada codigo | QA | | # |
| 20 | POST /api/estado/arca sincroniza todos los talleres | QA | | # |
| 21 | GET /api/estado/arca retorna stats de consultas del ultimo mes | QA | | # |
| 22 | POST /api/estado/arca/reverificar/[id] re-verifica un taller individual | QA | | # |
| 23 | Solo ESTADO/ADMIN puede acceder a las rutas de /api/estado/arca | QA | | # |

---

## Eje 2 — Navegabilidad

### Paso 1 — ESTADO ve card de verificacion ARCA en talleres

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** /estado/talleres
- **Verificador:** QA
- **Accion:** Verificar que aparece la card "Verificacion ARCA" con conteos y boton "Sincronizar todos con ARCA"
- **Esperado:** Card visible con X verificados, Y pendientes. Boton "Sincronizar todos" funcional.
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — ESTADO ve BadgeArca en tabla de talleres

- **Rol:** ESTADO
- **URL de inicio:** /estado/talleres
- **Verificador:** QA
- **Accion:** Verificar que cada taller muestra badge "Verificado por ARCA" o "Pendiente de verificacion"
- **Esperado:** Badge visible junto al CUIT en cada fila
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — ESTADO ve datos ARCA en detalle de taller

- **Rol:** ESTADO
- **URL de inicio:** /estado/talleres/[id] (tab Datos del taller)
- **Verificador:** QA
- **Accion:** Click en tab "Datos del taller". Verificar seccion "Datos verificados por ARCA" con tipo inscripcion, categoria monotributo, actividades, domicilio fiscal. Verificar boton "Re-verificar contra ARCA".
- **Esperado:** Datos ARCA visibles (o "Pendiente de verificacion" si no verificado). Boton funcional.
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Directorio publico prioriza verificados

- **Rol:** Sin login
- **URL de inicio:** /directorio
- **Verificador:** QA
- **Accion:** Verificar que talleres verificados aparecen primero. Verificar badge "Verificado por ARCA" en tarjetas de talleres verificados.
- **Esperado:** Talleres con verificadoAfip:true primero. Badge visible.
- **Resultado:** [ ]
- **Notas:**

### Paso 5 — Perfil publico muestra badge ARCA

- **Rol:** Sin login
- **URL de inicio:** /perfil/[id de taller verificado]
- **Verificador:** QA
- **Accion:** Click en un taller verificado desde directorio. Verificar badge "Verificado por ARCA".
- **Esperado:** Badge visible en el header del perfil.
- **Resultado:** [ ]
- **Notas:**

### Paso 6 — Marca directorio prioriza verificados

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** /marca/directorio
- **Verificador:** QA
- **Accion:** Verificar que talleres verificados aparecen primero. Badge "Verificado por ARCA" visible.
- **Esperado:** Mismo comportamiento que directorio publico.
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Registro con ARCA_ENABLED=false | Registrar taller en dev (mock activo) | Registro exitoso, datos mock | DEV | ok |
| 2 | Re-verificacion de taller ya verificado | Click re-verificar en taller con verificadoAfip:true | Se actualiza verificadoAfipAt | QA | |
| 3 | Sincronizacion masiva con 25 talleres | Click "Sincronizar todos" | Todos procesados, resultados visibles | QA | |
| 4 | Taller sin CUIT | sincronizarTaller para taller sin CUIT | Retorna error sin CUIT, no crashea | DEV | ok |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| /estado/talleres carga en menos de 3 segundos | DevTools > Network > recargar | QA | |
| Re-verificacion individual tarda menos de 5 segundos | Click + medir | QA | |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| BadgeArca usa colores coherentes (blue para verificado, amber para pendiente) | | |
| BadgeArca tiene iconos ShieldCheck/ShieldAlert | | |
| Boton "Sincronizar todos" usa brand-blue con icono RefreshCw | | |
| Boton "Re-verificar" usa brand-blue con icono RefreshCw | | |
| Datos ARCA en detalle muestran labels claros (tipo inscripcion, actividades, domicilio) | | |
| Textos en espanol argentino (vos/tenes/podes) | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Prioridad |
|-------|------|-------------|-----------|
| | | | |

---

## Notas de los auditores

**Sergio (tecnico):**
[observaciones tecnicas sobre implementacion, seguridad, performance]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion verificados (23 items)
- [ ] Casos borde probados (4 items)
- [ ] Performance revisada en desktop y movil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
