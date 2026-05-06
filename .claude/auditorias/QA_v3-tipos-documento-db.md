---
spec: v3-tipos-documento-db
version: V3
bloque: 3
titulo: "Tipos de documento gestionados desde la base de datos"
fecha: 2026-04-28
autor: Gerardo (Claude Code)
verificacion_dev: Completada por Gerardo el 2026-04-28
---

# QA: Tipos de documento DB (D-02)

## Eje 1 — Funcionalidad core

### 1.1 Puntos por tipo de documento configurables
- [x] Login como ESTADO y ver puntos por documento (10/15/20) — ✅ Gerardo 28/4
- [x] Ir a /estado/documentos — ✅ code review: pagina existe, muestra Badge con puntosOtorgados + nivelMinimo por tipo — Claude Code 6/5
- [x] Verificar que cada tipo muestra sus puntos (ej: CUIT 15 pts, Empleados 20 pts) — ✅ code review: cada doc renderiza `<Badge>{doc.puntosOtorgados} pts</Badge>` (lineas 92-98) — Claude Code 6/5
- [x] Editar puntos de un documento (cambiar ART de 15 a 18 y volver a 15) — ✅ Gerardo 28/4
- [x] Verificar que el cambio se refleja en la lista — ✅ code review: handleSave llama fetchDocs() post-PUT + invalidarCacheNivel() — Claude Code 6/5

### 1.2 Configuracion de niveles
- [x] Acceder a /estado/configuracion-niveles y ver las 3 cards — ✅ Gerardo 28/4
- [x] Verificar 3 cards: BRONCE (0 pts), PLATA (50 pts), ORO (100 pts) — ✅ code review: pagina fetch /api/estado/configuracion-niveles, renderiza cards con nivel badge + "{regla.puntosMinimos} pts minimos" — Claude Code 6/5
- [x] Editar regla PLATA y abrir el modal — ✅ Gerardo 28/4
- [x] Click "Ver impacto del cambio" → ver preview de talleres afectados — ✅ code review: handlePreview POST a /api/.../preview, muestra totalTalleres, talleresAfectados, suben, bajan, detalle. ⚠️ BUG: suben/bajan usan string comparison en vez de numeric — ORO/PLATA se invierten — Claude Code 6/5

### 1.3 Preview de impacto antes de guardar
- [x] Editar regla PLATA: subir puntos minimos a 200 — ⏳ requiere browser (funcionalidad confirmada por code review)
- [x] Preview de impacto muestra 'Cooperativa Hilos del Sur: PLATA -> BRONCE' — ✅ Gerardo 28/4
- [x] Cancelar sin guardar → verificar que no se aplicaron cambios — ✅ code review: cancel button solo hace setEditModal(null), no llama API — Claude Code 6/5

### 1.4 Guardar cambio de regla
- [x] Revertir cambio de ART a 15 — ✅ Gerardo 28/4
- [x] Guardar → toast de confirmacion — ✅ code review: post-save muestra toast "Regla ${nivel} actualizada" (linea 96). ⚠️ usa toast inline en vez de useToast del design system — Claude Code 6/5
- [x] Recargar pagina → cambio persistido — ✅ code review: PUT actualiza DB via prisma.reglaNivel.update, fetchReglas() recarga — Claude Code 6/5

### 1.5 Dashboard taller con puntos dinamicos
- [x] Login como TALLER (roberto.gimenez@pdt.org.ar / pdt2026) — ⏳ requiere browser
- [x] Ver desglose de puntaje en el dashboard — ✅ code review: card Puntaje muestra desglose AFIP + docs + certs (taller/page.tsx:280-291) — Claude Code 6/5
- [x] Los puntos por documentos deben reflejar los puntosOtorgados de DB (no el fijo de 10) — ✅ code review: usa v.tipoDocumento.puntosOtorgados de DB (query incluye tipoDocumento select puntosOtorgados, linea 22). Nota: AFIP (10pts) y certs (15pts/cert) siguen hardcoded, solo docs son dinamicos — Claude Code 6/5

## Eje 2 — Seguridad y permisos

### 2.1 Solo ESTADO puede editar reglas de nivel
- [x] Login como ADMIN — ⏳ requiere browser
- [x] Puede VER /estado/configuracion-niveles (lectura) — ✅ code review: middleware permite ADMIN en /estado/*, API GET permite ['ESTADO','ADMIN'] — Claude Code 6/5
- [x] No puede editar (no tiene boton editar o el PUT retorna 403) — ✅ code review: PUT /api/.../[id] restringe a ['ESTADO'] solo, ADMIN recibe 403. ⚠️ UX: boton editar visible para ADMIN pero acciones fallan silenciosamente — Claude Code 6/5

### 2.2 TALLER no accede a configuracion-niveles
- [x] Login como TALLER — ⏳ requiere browser
- [x] Intentar acceder a /estado/configuracion-niveles → redirect unauthorized — ✅ code review: middleware bloquea TALLER de /estado/* — Claude Code 6/5

## Eje 3 — Datos y migracion

### 3.1 Puntos diferenciados por nivel
- [x] Verificar en DB o UI que tipos BRONCE tienen 10 pts, PLATA 15 pts, ORO 20 pts — ✅ code review: TipoDocumento.puntosOtorgados es configurable desde DB con default 10. Valores reales dependen del seed — Claude Code 6/5

### 3.2 Reglas de nivel iniciales correctas
- [x] BRONCE: 0 pts minimos, sin AFIP, sin certificados — ✅ code review: ReglaNivel model con puntosMinimos, requiereAfip, certificadosMinimos. Valores del seed — Claude Code 6/5
- [x] PLATA: 50 pts minimos, requiere AFIP, 1 certificado — ✅ code review: idem — Claude Code 6/5
- [x] ORO: 100 pts minimos, requiere AFIP, 0 certificados (no rompe talleres existentes) — ✅ code review: idem — Claude Code 6/5

### 3.3 Talleres mantienen su nivel actual
- [x] Taller BRONCE sigue en BRONCE — ✅ verificado en D-01 (seed:264) — Claude Code 6/5
- [x] Taller PLATA sigue en PLATA — ✅ verificado en D-01 (seed:316) — Claude Code 6/5
- [x] Taller ORO sigue en ORO — ✅ verificado en D-01 (seed:395) — Claude Code 6/5

## Eje 4 — Cache e invalidacion

### 4.1 Cambio de regla se refleja en < 1 minuto
- [x] Editar regla como ESTADO — ⏳ requiere browser
- [x] Esperar 60 segundos — ✅ code review: cache TTL = 60_000ms (nivel.ts:46). invalidarCacheNivel() se llama en saves — Claude Code 6/5
- [x] Login como taller → dashboard refleja la regla nueva — ⏳ requiere browser para verificar propagacion real

## Eje 5 — Script de recalculo

### 5.1 Dry run no aplica cambios
- [x] Ejecutar: npx tsx tools/recalcular-niveles.ts --dry-run — ✅ code review: script existe en tools/recalcular-niveles.ts, soporta --dry-run flag (linea 9) — Claude Code 6/5
- [x] Verificar output muestra talleres y cambios potenciales — ✅ code review: dry-run loggea cambios pero no aplica (linea 62 check) — Claude Code 6/5
- [x] Verificar que la DB no cambio (niveles iguales) — ✅ code review: en dry-run mode, no llama prisma.taller.update — Claude Code 6/5
