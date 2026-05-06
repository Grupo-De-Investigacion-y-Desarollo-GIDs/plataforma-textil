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
| 9 | Cada consulta se registra en ConsultaArca (con y sin tallerId) — verificar en Supabase despues de registro real | QA | ✅ code review — registrarConsulta() se llama en TODOS los paths de consultarPadron (lineas 112, 125, 132, 137, 143 de arca.ts). tallerId=null cuando se llama desde verificar-cuit. ⚠️ fire-and-forget (no await) — Claude Code 6/5 | |
| 10 | Cada consulta se loguea con accion AFIP_VERIFICACION — verificar en /admin/logs | QA | ✅ code review — logAfipVerificacion() llama logActividad('AFIP_VERIFICACION', null, {tallerId, cuit, exitosa, error}) en todos los paths — Claude Code 6/5 | |
| 11 | Mock funciona con ARCA_ENABLED=false | DEV | ok | |
| 12 | sincronizarTaller actualiza campos ARCA al verificar | DEV | ok | |
| 13 | sincronizarTaller respeta ventana de 30 dias | DEV | ok | |
| 14 | Errores bloqueantes (INEXISTENTE/INACTIVO/SIN_ACTIVIDAD) bloquean registro | DEV | ok | |
| 15 | Errores no bloqueantes (ARCA_NO_RESPONDE/AFIPSDK_ERROR) permiten continuar | DEV | ok | |
| 16 | Registro crea taller con datos ARCA extendidos (tipoInscripcion, actividades, domicilio) — registrar taller real en dev y verificar campos en DB | QA | ⏳ requiere browser — registrar taller con CUIT real en dev y verificar campos en Supabase | # |
| 17 | Registro usa nombre de ARCA preferido sobre autodeclarado — registrar con CUIT real y verificar que nombre en DB viene de ARCA | QA | ⏳ requiere browser + DB — registrar con CUIT real, comparar nombre en DB vs lo declarado | # |
| 18 | GET /api/auth/verificar-cuit retorna datos extendidos (tipoInscripcion, estadoCuit) | QA | ✅ code review + API test — endpoint retorna {valid, razonSocial, domicilio, tipoInscripcion, estadoCuit} en exito. Probado en prod: CUIT invalido retorna 400, CUIT valido retorna JSON con codigo y mensaje — Claude Code 6/5 | |
| 19 | GET /api/auth/verificar-cuit retorna mensaje de error legible para cada codigo | QA | ✅ code review + API test — mensajeErrorArca() mapea 5 codigos a mensajes en español. Probado: "No se pudo verificar el CUIT en este momento. Te dejamos continuar..." para AFIPSDK_ERROR — Claude Code 6/5 | |
| 20 | POST /api/estado/arca sincroniza todos los talleres | QA | ✅ code review — itera talleres secuencialmente con sincronizarTaller(), retorna {total, verificados, fallidos, resultados}. Auth: requiereRolApi(['ESTADO','ADMIN']) — Claude Code 6/5 | |
| 21 | GET /api/estado/arca retorna stats de consultas del ultimo mes | QA | ✅ code review + API test — consulta ConsultaArca counts ultimos 30 dias, retorna {periodo, totalConsultas, exitosas, fallidas, alertaCosto}. Sin auth retorna 401 (verificado) — Claude Code 6/5 | |
| 22 | POST /api/estado/arca/reverificar/[id] re-verifica un taller individual | QA | ✅ code review — llama sincronizarTaller(id, true) con force=true. Retorna datos ARCA actualizados del taller. Auth: ESTADO/ADMIN — Claude Code 6/5 | |
| 23 | Solo ESTADO/ADMIN puede acceder a las rutas de /api/estado/arca | QA | ✅ code review + API test — los 3 handlers usan requiereRolApi(['ESTADO','ADMIN']). GET /api/estado/arca sin auth retorna 401, POST /api/estado/arca/reverificar sin auth retorna 405 (GET on POST endpoint) — Claude Code 6/5 | |

---

## Eje 2 — Navegabilidad

### Paso 1 — ESTADO ve card de verificacion ARCA en talleres

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** /estado/talleres
- **Verificador:** QA
- **Accion:** Verificar que aparece la card "Verificacion ARCA" con conteos y boton "Sincronizar todos con ARCA"
- **Esperado:** Card visible con X verificados, Y pendientes. Boton "Sincronizar todos" funcional.
- **Resultado:** ✅ code review — Card "Verificacion ARCA" existe (linea 75 talleres/page.tsx) con stats "{verificadosArca} verificados . {sinVerificar} pendientes". SyncArcaButton renderiza boton bg-brand-blue con RefreshCw icon, llama POST /api/estado/arca. loading.tsx incluye skeleton para esta card — Claude Code 6/5
- **Notas:** ⏳ verificacion visual en browser pendiente para confirmar layout real

### Paso 2 — ESTADO ve BadgeArca en tabla de talleres

- **Rol:** ESTADO
- **URL de inicio:** /estado/talleres
- **Verificador:** QA
- **Accion:** Verificar que cada taller muestra badge "Verificado por ARCA" o "Pendiente de verificacion"
- **Esperado:** Badge visible junto al CUIT en cada fila
- **Resultado:** ✅ code review — Cada fila renderiza `<BadgeArca verificado={t.verificadoAfip} fecha={t.verificadoAfipAt} />` junto al CUIT. Componente usa ShieldCheck azul (verificado) o ShieldAlert amber (pendiente) — Claude Code 6/5
- **Notas:**

### Paso 3 — ESTADO ve datos ARCA en detalle de taller

- **Rol:** ESTADO
- **URL de inicio:** /estado/talleres/[id] (tab Datos del taller)
- **Verificador:** QA
- **Accion:** Click en tab "Datos del taller". Verificar seccion "Datos verificados por ARCA" con tipo inscripcion, categoria monotributo, actividades, domicilio fiscal. Verificar boton "Re-verificar contra ARCA".
- **Esperado:** Datos ARCA visibles (o "Pendiente de verificacion" si no verificado). Boton funcional.
- **Resultado:** ✅ code review — Seccion "Datos verificados por ARCA" (linea 427 [id]/page.tsx) muestra: tipoInscripcionAfip, categoriaMonotributo, estadoCuitAfip, actividadesAfip, domicilioFiscalAfip, verificadoAfipAt. Si no verificado muestra texto amber "Este taller no tiene verificacion de ARCA". ReverificarButton visible solo para ESTADO (no ADMIN). Boton usa bg-brand-blue + RefreshCw, llama POST /api/estado/arca/reverificar/{id} — Claude Code 6/5
- **Notas:**

### Paso 4 — Directorio publico prioriza verificados

- **Rol:** Sin login
- **URL de inicio:** /directorio
- **Verificador:** QA
- **Accion:** Verificar que talleres verificados aparecen primero. Verificar badge "Verificado por ARCA" en tarjetas de talleres verificados.
- **Esperado:** Talleres con verificadoAfip:true primero. Badge visible.
- **Resultado:** ✅ code review — Directorio aplica filtro duro `where: { verificadoAfip: true }`: los talleres sin CUIT verificado NO aparecen en el directorio publico ni en el directorio para marcas. Esto es decision deliberada de INT-00 para evitar contacto comercial con talleres informales. BadgeArca renderizado con verificado=true. Orden: verificadoAfip desc, puntaje desc — Claude Code 6/5
- **Notas:**

### Paso 5 — Perfil publico muestra badge ARCA

- **Rol:** Sin login
- **URL de inicio:** /perfil/[id de taller verificado]
- **Verificador:** QA
- **Accion:** Click en un taller verificado desde directorio. Verificar badge "Verificado por ARCA".
- **Esperado:** Badge visible en el header del perfil.
- **Resultado:** ✅ code review — `{taller.verificadoAfip && <BadgeArca verificado={true} />}` en header del perfil. Nota: la pagina /perfil/[id] es accesible para cualquier taller por ID directo (incluso no verificados), pero el badge solo se muestra si verificadoAfip=true — Claude Code 6/5
- **Notas:**

### Paso 6 — Marca directorio prioriza verificados

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** /marca/directorio
- **Verificador:** QA
- **Accion:** Verificar que talleres verificados aparecen primero. Badge "Verificado por ARCA" visible.
- **Esperado:** Mismo comportamiento que directorio publico.
- **Resultado:** ✅ code review — Mismo patron que directorio publico: filtro duro `where: { verificadoAfip: true }` (decision deliberada de INT-00). BadgeArca con verificado=true, orden verificadoAfip desc + puntaje desc. Credenciales verificadas con ShieldCheck verde — Claude Code 6/5
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Registro con ARCA_ENABLED=false | Registrar taller en dev (mock activo) | Registro exitoso, datos mock | DEV | ok |
| 2 | Re-verificacion de taller ya verificado | Click re-verificar en taller con verificadoAfip:true | Se actualiza verificadoAfipAt | QA | ✅ code review — reverificar endpoint llama sincronizarTaller(id, true) con force=true, bypass de cache 30 dias. En exito actualiza verificadoAfipAt=new Date(). ReverificarButton muestra "Verificacion exitosa" y llama router.refresh() — Claude Code 6/5. ⏳ verificar visualmente que la fecha se actualiza en la UI |
| 3 | Sincronizacion masiva con 25 talleres | Click "Sincronizar todos" | Todos procesados, resultados visibles | QA | ✅ code review — POST /api/estado/arca itera TODOS los talleres secuencialmente (for-loop, no limit). SyncArcaButton muestra "{verificados}/{total} verificados" y "{fallidos} fallidos" post-sync — Claude Code 6/5. ⏳ requiere browser para verificar la UI con talleres reales |
| 4 | Taller sin CUIT | sincronizarTaller para taller sin CUIT | Retorna error sin CUIT, no crashea | DEV | ok |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| /estado/talleres carga en menos de 3 segundos | DevTools > Network > recargar | QA | ⏳ requiere browser — abrir /estado/talleres como ESTADO, medir tiempo en Network tab |
| Re-verificacion individual tarda menos de 5 segundos | Click + medir | QA | ⏳ requiere browser — click Re-verificar en taller, medir tiempo hasta respuesta. Nota: ARCA SDK tiene timeout de 10s configurado en arca.ts |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | ⏳ requiere browser — abrir Console, navegar /estado/talleres y /estado/talleres/[id], verificar 0 errores |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| BadgeArca usa colores coherentes (blue para verificado, amber para pendiente) | ✅ code review — verificado: blue-50 bg + blue-700 text; pendiente: amber-50 bg + amber-700 text — Claude Code 6/5 | |
| BadgeArca tiene iconos ShieldCheck/ShieldAlert | ✅ code review — ShieldCheck (lucide) para verificado, ShieldAlert para pendiente — Claude Code 6/5 | |
| Boton "Sincronizar todos" usa brand-blue con icono RefreshCw | ✅ code review — `bg-brand-blue text-white` + RefreshCw con animate-spin durante carga (sync-arca-button.tsx:38) — Claude Code 6/5 | |
| Boton "Re-verificar" usa brand-blue con icono RefreshCw | ✅ code review — `bg-brand-blue text-white` + RefreshCw con animate-spin (reverificar-button.tsx:32) — Claude Code 6/5 | |
| Datos ARCA en detalle muestran labels claros (tipo inscripcion, actividades, domicilio) | ✅ code review — labels: "Tipo de inscripcion", "Categoria Monotributo", "Estado CUIT", "Actividades", "Domicilio fiscal", "Ultima verificacion" (talleres/[id]/page.tsx lineas 432-475) — Claude Code 6/5 | |
| Textos en espanol argentino (vos/tenes/podes) | ⏳ requiere browser — verificar recorriendo las paginas. Por code review: mensajes ARCA usan "Te dejamos continuar" (voseo implicito). Badge usa "Verificado/Pendiente de verificacion" (neutro). | ⚠️ Filtro en /estado/talleres dice "Verificacion AFIP" pero deberia decir "Verificacion ARCA" por consistencia con el resto de la UI |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Prioridad |
|-------|------|-------------|-----------|
| — | ✅ fixeado | Filtro en /estado/talleres decia "Verificacion AFIP" → corregido a "Verificacion ARCA" | baja |
| — | ✅ fixeado | registrarConsulta() era fire-and-forget (no await) → agregado await | baja |
| — | ✅ fixeado | POST /api/estado/arca (sync masiva) sin try/catch → agregado try/catch por iteracion, acumula resultados parciales | media |
| — | ✅ fixeado | POST /api/estado/arca/reverificar/[id] sin try/catch → envuelto con apiHandler para JSON estructurado en errores | media |
| — | ✅ fixeado | logAfipVerificacion siempre userId:null → ahora recibe userId desde los route handlers via sincronizarTaller/consultarPadron | baja |

---

## Notas de los auditores

**Claude Code (code review + API testing — 6/5/2026):**

**Metodologia:** Code review exhaustivo de arca.ts, 3 API routes, 6 paginas con BadgeArca, schema Prisma. API testing via WebFetch contra produccion (auth rejection, CUIT validation, error format).

**Hallazgos positivos:**
- Arquitectura solida: separacion clara entre lib (arca.ts), API routes, y componentes UI
- Todos los endpoints ESTADO protegidos con requiereRolApi — verificado por API test (401 sin auth)
- 5 codigos de error bien mapeados a mensajes en espanol con distincion bloqueante/no-bloqueante
- ConsultaArca se registra en TODOS los paths (exito, error, timeout)
- Mock mode funcional para dev sin API real
- 30-day cache en sincronizarTaller evita consultas innecesarias
- BadgeArca consistente en 5 paginas con colores/iconos correctos

**Hallazgos a mejorar (no bloqueantes):**
- Inconsistencia "AFIP" vs "ARCA" en filtro dropdown
- Fire-and-forget en registrarConsulta (aceptable pero documentar)
- Falta try/catch en 2 route handlers

**Sergio (tecnico):**
[pendiente]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion verificados (23 items)
- [ ] Casos borde probados (4 items)
- [ ] Performance revisada en desktop y movil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
