# REVIEW: F-07 Mensajes individuales

**Spec:** `v3-mensajes-individuales`
**Fecha:** 2026-05-05
**Autor:** Gerardo (implementacion completa)

---

## Resumen de cambios

Implementacion completa del spec F-07: mensajes individuales a taller/marca desde admin/estado.

### Archivos nuevos (6)
- `src/app/api/admin/mensajes-individuales/route.ts` — POST endpoint con validacion Zod, rate limit inline, integracion WhatsApp
- `src/admin/componentes/editor-mensaje-individual.tsx` — Modal editor con preview en vivo, sugerencias de link por rol, checkbox WhatsApp
- `src/admin/componentes/boton-enviar-mensaje.tsx` — Wrapper client para usar en server components
- `src/__tests__/mensajes-individuales.test.ts` — 23 tests unitarios
- `tests/e2e/mensajes-individuales.spec.ts` — 5 tests E2E
- `.claude/auditorias/QA_v3-mensajes-individuales.md` — QA interactivo con validacion de dominio

### Archivos modificados (5)
- `src/app/(admin)/admin/usuarios/page.tsx` — Boton "Enviar mensaje" en modal de detalle
- `src/app/(admin)/admin/talleres/[id]/page.tsx` — Boton + user.id en select
- `src/app/(admin)/admin/marcas/[id]/page.tsx` — Boton + user.id en select
- `src/app/(admin)/admin/notificaciones/page.tsx` — Tabs masivas/individuales + tabla de mensajes
- `src/app/(public)/cuenta/notificaciones/notificaciones-lista.tsx` — Badge "Mensaje del equipo" + sender info
- `src/app/(public)/cuenta/notificaciones/page.tsx` — Include creadaPor en query

### Archivos de documentacion (2)
- `.claude/auditorias/PRUEBAS_PENDIENTES.md` — Seccion F-07 agregada
- `.claude/auditorias/REVIEW_v3-mensajes-individuales.md` — Este archivo

---

## Decisiones tecnicas

### 1. Sin migracion de schema
Reutiliza modelo `Notificacion` existente con `tipo: 'mensaje_individual'`. No se crea modelo nuevo. Filtros por `tipo` son suficientes para separar individuales de masivos.

### 2. Rate limit inline
El spec prescribe depender de S-02 actualizado. En su lugar se implementa rate limit inline (3 lineas): count de mensajes del admin en la ultima hora. Motivacion: evitar bloquear F-07 por dependencia de otro spec. El rate limit es funcional y testeable.

### 3. Seguridad URL
Zod `.url()` acepta `javascript:` como URL valida. Se agrego `.refine()` para rechazar protocolos que no sean `http/https`. Test unitario cubre este caso.

### 4. Directorio src/admin/componentes/
Se crea `src/admin/componentes/` como directorio nuevo para componentes admin-only client-side, siguiendo el patron de `src/marca/componentes/`, `src/taller/componentes/`, `src/estado/componentes/`.

### 5. Toast en vez de alert
EditorMensajeIndividual usa el Toast V3 (useToast) para feedback de exito/error/warning. Componente no tiene ningun `alert()`.

---

## Cobertura de tests

### Unitarios (23 tests)
- Schema Zod: 10 casos (valido, limites, URL maliciosa, string vacia)
- Imports: 2 (editor + boton)
- Tipo mensaje_individual: 1
- Rate limit logica: 1
- Sugerencias por rol: 4 (TALLER, MARCA, ADMIN, ESTADO)
- Template WhatsApp: 2 (existencia + render)
- Label por tipo: 1
- Sin alert(): 2

### E2E (5 tests)
- POST sin auth → 401
- TALLER POST → 403
- Tab "Mensajes individuales" visible
- Boton en /admin/talleres/[id]
- Boton en /admin/marcas/[id]

---

## Dependencias cumplidas

- [x] D-01 mergeado (roles ADMIN/ESTADO)
- [x] F-02 mergeado (template mensaje_admin, generarMensajeWhatsapp)
- [x] Q-03 mergeado (apiHandler, errorForbidden, errorNotFound, etc.)
- [x] S-02 — rate limit inline en vez de dependencia (documentado)

---

## Deuda tecnica

- Multi-select de destinatarios (spec 6.3) queda para V4
- Rate limit admin deberia migrar a S-02 centralizado cuando se actualice
