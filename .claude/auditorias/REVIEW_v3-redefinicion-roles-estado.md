# REVIEW: v3-redefinicion-roles-estado (D-01)

**Spec:** v3-redefinicion-roles-estado.md
**Implementado por:** Gerardo (Claude Code)
**Fecha:** 2026-04-28
**Branch:** develop

---

## Resumen de cambios

D-01 redefine la separacion entre ADMIN y ESTADO. ESTADO pasa a ser el actor institucional que valida documentos de formalizacion. ADMIN queda como operador tecnico.

## Archivos creados

| Archivo | Proposito |
|---------|-----------|
| `src/compartido/lib/permisos.ts` | Helper `requiereRol` (server components) y `requiereRolApi` (API routes) con formato 403 INSUFFICIENT_ROLE |
| `src/app/(estado)/estado/talleres/page.tsx` | Listado de talleres con vista regulatoria (docs pendientes, progreso) |
| `src/app/(estado)/estado/talleres/[id]/page.tsx` | Detalle taller con tabs Formalizacion/Historial/Datos, server actions aprobar/rechazar/revocar, modo lectura para ADMIN |
| `src/app/(estado)/estado/documentos/page.tsx` | Gestion de tipos de documento (movida desde admin/documentos) |
| `src/app/(estado)/estado/auditorias/page.tsx` | Historial de decisiones de formalizacion con filtros y export CSV |
| `prisma/migrations/20260428100000_agregar_aprobado_por_validacion/migration.sql` | Agrega campos `aprobadoPor` y `aprobadoEn` a validaciones |
| `prisma/migrations/20260428100001_backfill_aprobado_por_validacion/migration.sql` | Backfill desde LogActividad para validaciones historicas |
| `scripts/verificar-migracion-d01.sql` | Script de verificacion post-migracion |
| `src/__tests__/permisos.test.ts` | 10 tests para helper de autorizacion |
| `src/__tests__/tipos-documento-permisos.test.ts` | 9 tests para permisos de tipos de documento |
| `tests/e2e/roles-estado.spec.ts` | 7 tests E2E para flujos ESTADO |
| `tests/e2e/admin-no-regression.spec.ts` | 5 tests E2E para verificar que ADMIN no se rompio |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `prisma/schema.prisma` | Campos `aprobadoPor`, `aprobadoEn`, relacion `usuarioAprobador` en Validacion; `validacionesAprobadas` en User |
| `prisma/seed.ts` | Validaciones COMPLETADO incluyen `aprobadoPor` y `aprobadoEn` del admin |
| `src/app/api/validaciones/[id]/route.ts` | ADMIN -> ESTADO para cambio de estado; graba `aprobadoPor`/`aprobadoEn`; logs con prefijo ESTADO_VALIDACION_* |
| `src/app/api/tipos-documento/route.ts` | POST y PUT: ADMIN -> ESTADO; formato 403 con INSUFFICIENT_ROLE |
| `src/app/(admin)/admin/talleres/[id]/page.tsx` | Removido tab Formalizacion y server actions aprobar/rechazar/revocar; agregado banner con link a vista ESTADO; tab default cambiado a historial |
| `src/middleware.ts` | Removida excepcion ESTADO para /admin/auditorias |
| `src/compartido/componentes/layout/user-sidebar.tsx` | ESTADO: 5 -> 8 items (talleres, documentos, auditorias, sector) |
| `src/app/(admin)/admin/logs/page.tsx` | Sensibilidad para ESTADO_VALIDACION_* |
| `src/__tests__/revocar-validacion.test.ts` | Actualizado: ADMIN -> 403, ESTADO -> aprueba |

## Archivos eliminados

| Archivo | Razon |
|---------|-------|
| `src/app/(admin)/admin/documentos/page.tsx` | Mudada a /estado/documentos |

## Decisiones arquitectonicas

### 1. Helper de autorizacion como funcion pura (no decorator/wrapper)
`requiereRol` y `requiereRolApi` son funciones simples que se llaman al inicio de cada handler. No wrappean el handler completo. Esto mantiene consistencia con el patron inline existente en 53+ callers y permite composicion flexible (ej: soloLectura = role === 'ADMIN').

### 2. Formato 403 con `code: 'INSUFFICIENT_ROLE'`
Preparado para Q-03 (Bloque 4 — errores consistentes). Incluye `code`, `error` en espanol, y `rolesRequeridos` como array. Los endpoints existentes mantienen su formato legacy por ahora.

### 3. Server actions con cierre sobre `session`
Las server actions en estado/talleres/[id] capturan `session` del scope de la pagina (closures). Esto es el mismo patron que tenia admin/talleres/[id] — funciona correctamente con Next.js App Router.

### 4. No se refactorizaron callers existentes
Los 53+ endpoints con patron inline `if (role !== 'ADMIN')` siguen igual. Solo las nuevas rutas usan `requiereRol`/`requiereRolApi`. Evita changeset masivo que contamina el diff de D-01.

### 5. ADMIN puede acceder a todas las rutas /estado/*
El middleware permite ADMIN en /estado para troubleshooting. La logica de solo-lectura es responsabilidad de cada pagina (no del middleware).

## Riesgos no cubiertos

1. **Cuello de botella ESTADO**: Solo hay 1 usuario ESTADO en el seed (Anabelen Torres). Si el piloto escala, ADMIN puede crear mas usuarios ESTADO desde /admin/usuarios.

2. **Rollback complejo**: Si hay que revertir D-01, requiere re-migrar las server actions a ADMIN y cambiar checks de rol. Los campos aprobadoPor/aprobadoEn son aditivos y no molestan.

3. **Emails de aprobacion**: Los emails dicen "fue aprobado" pero no especifican por quien (Estado vs Admin). En V3 esto es correcto porque solo ESTADO aprueba. Si se revierte, el email seguiria siendo correcto.

4. **Acciones historicas sin prefijo ESTADO_**: Los logs pre-V3 usan `VALIDACION_APROBADA` y `ADMIN_VALIDACION_COMPLETADO`. Los nuevos usan `ESTADO_VALIDACION_*`. La pagina de auditorias filtra por ambos conjuntos.

## Migracion de datos historicos

### Resultados del script de verificacion

> **PENDIENTE**: Ejecutar `scripts/verificar-migracion-d01.sql` despues del deploy y documentar aqui.

Formato esperado:
```
Total COMPLETADO/RECHAZADO: N
Con aprobadoPor poblado: M
Sin aprobadoPor (pre-V3): N-M
```

Las validaciones sin `aprobadoPor` muestran "Sistema (pre-V3)" en la UI. No requieren accion — son validaciones aprobadas antes de que existiera el tracking.

---

## Checklist de verificacion manual D-01

### Login como ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
1. [ ] Sidebar muestra los 8 items previstos (Dashboard, Talleres, Documentos, Auditorias, Diagnostico Sector, Exportar Datos, Notificaciones, Mi Cuenta)
2. [ ] Click en /estado/talleres -> ver listado con filtros por nivel/provincia/pendientes
3. [ ] Click en un taller -> ver tabs Formalizacion / Historial / Datos del taller
4. [ ] En Formalizacion: verificar que documentos COMPLETADO muestran "Aprobado por: [nombre]"
5. [ ] En /estado/documentos -> ver tipos de documento, editar uno, verificar que guarda

### Login como ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
6. [ ] Acceder a /estado/talleres/[id] -> ver banner "Modo lectura", sin botones Aprobar/Rechazar
7. [ ] Acceder a /admin/documentos -> debe dar 404 (mudada a /estado/documentos)
8. [ ] /admin/logs -> siguen apareciendo los logs de validacion (historicos y nuevos ESTADO_VALIDACION_*)
9. [ ] /admin/talleres/[id] -> ver banner con link "Ver vista de formalizacion", sin tab Formalizacion

### Login como TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
10. [ ] Acceder a /estado/talleres -> redirect a /unauthorized
