# REVIEW: Reporte de campo del piloto (T-02)

**Spec:** `v3-reporte-campo.md`
**Fecha:** 2026-05-06
**Revisor:** Gerardo (tech lead)

---

## Resumen

Implementacion completa del spec T-02: herramienta de reporte de campo para el piloto OIT. Permite al equipo (ADMIN/ESTADO) registrar observaciones cualitativas categorizadas, filtrarlas por multiples criterios, y generar reportes Excel multi-hoja que integran datos cuantitativos y cualitativos.

---

## Archivos creados/modificados

### Schema y migracion
- `prisma/schema.prisma` — 3 enums nuevos (TipoObservacion, FuenteObservacion, Sentimiento) + modelo ObservacionCampo + 2 relaciones en User
- `prisma/migrations/20260505160000_add_observacion_campo/migration.sql` — SQL raw (pgvector workaround)

### API endpoints (5)
- `src/app/api/admin/observaciones/route.ts` — GET (listar con filtros + hasSome) + POST (crear)
- `src/app/api/admin/observaciones/[id]/route.ts` — GET (individual) + PATCH (editar) + DELETE (borrar)
- `src/app/api/admin/usuarios-buscar/route.ts` — GET (search para autocomplete, ADMIN+ESTADO)
- `src/app/api/admin/reporte-mensual/route.ts` — GET (Excel 6 hojas: metricas + onboarding + demanda + observaciones + resumen)
- `src/app/api/admin/reporte-piloto/route.ts` — GET (Excel 9 hojas: reporte completo del piloto para OIT)

### Paginas admin (3 + formulario compartido)
- `src/app/(admin)/admin/observaciones/page.tsx` — Listado con 5 filtros (tipo, fuente, sentimiento, periodo, tags)
- `src/app/(admin)/admin/observaciones/nueva/page.tsx` — Wrapper con Breadcrumbs
- `src/app/(admin)/admin/observaciones/[id]/editar/page.tsx` — Edicion con permisos (autor o ADMIN)
- `src/app/(admin)/admin/observaciones/formulario-observacion.tsx` — Formulario reutilizable: 10 campos, user search autocomplete, tags clickeables, estrellas interactivas
- `src/app/(admin)/admin/observaciones/[id]/editar/eliminar-observacion.tsx` — Boton eliminar con confirmacion

### UX (skeletons + sidebar)
- `src/app/(admin)/admin/observaciones/loading.tsx` — Skeleton listado
- `src/app/(admin)/admin/observaciones/nueva/loading.tsx` — Skeleton formulario
- `src/app/(admin)/admin/observaciones/[id]/editar/loading.tsx` — Skeleton edicion
- `src/app/(admin)/layout.tsx` — Agregado "Observaciones" con icono Eye en sidebar

### Tests
- `src/__tests__/observaciones-campo.test.ts` — 26 tests: schema, Zod validation, tags, permisos, filtros, archivos
- `tests/e2e/observaciones-campo.spec.ts` — 10 E2E tests: auth 401/403, 404, validation 400, page loads
- `src/__tests__/whatsapp.test.ts` — Fix: actualizado de 6 a 8 templates (post T-03)

---

## Decisiones tecnicas

1. **Tags como String[] con hasSome:** Primer uso de operadores de filtrado sobre arrays nativos de PostgreSQL en el codebase. Precedente para otros filtros similares.

2. **Formulario como pagina dedicada (no Modal):** El formulario tiene 10 campos incluyendo textarea, user search, radio buttons, tag input, date picker, y star selector. Sigue el patron del codebase: formularios 8+ campos usan paginas dedicadas.

3. **FormularioObservacion reutilizable:** Componente compartido entre /nueva y /[id]/editar con prop `initial` para pre-cargar datos en edicion.

4. **User search como API separada:** Creado `/api/admin/usuarios-buscar` porque el existente `/api/admin/usuarios` es ADMIN-only. El nuevo endpoint permite ADMIN+ESTADO para el autocomplete del formulario.

5. **onDelete: SetNull en ambas relaciones:** Las observaciones son evidencia institucional — persisten aunque se elimine el autor o el usuario observado.

6. **Reportes integran multiples fuentes:** reporte-mensual usa F-04 (exportarMotivosCSV), T-03 (calcularEtapa), y observaciones propias. reporte-piloto agrega recomendaciones de F-05 (generarRecomendaciones).

---

## Reutilizacion efectiva

| Componente | Origen | Uso en T-02 |
|-----------|--------|-------------|
| `generarXlsx` + `HojaExportable` | F-04 | Ambos reportes Excel |
| `apiHandler` | Q-03 | Todos los endpoints API |
| `logAccionAdmin` | S-04 | Logging de CRUD y reportes |
| `calcularEtapa` + `ETAPA_LABELS` | T-03 | Hojas de onboarding en reportes |
| `exportarMotivosCSV` | F-05 | Hoja demanda insatisfecha |
| `calcularStatsAgregadas` + `generarRecomendaciones` | F-05 | Hoja recomendaciones piloto |
| `Badge`, `EmptyState`, `Button`, `Breadcrumbs`, `Toast` | UX V3 | Todas las paginas |

---

## Checklist UX V3

- [x] Toast para feedback (crear, editar, eliminar, errores)
- [x] Loading/Skeleton en las 3 paginas
- [x] EmptyState en listado vacio
- [x] Breadcrumbs en sub-paginas (nueva, editar)
- [x] Layout (admin) correcto con sidebar y header
- [x] No componentes custom innecesarios

---

## Riesgos conocidos

- **WSL2 I/O errors:** Build local falla intermitentemente por errores de I/O de WSL2/NTFS. No afecta Vercel (Linux nativo). TypeScript y tests pasan clean.
- **ESTADO sin UI propia:** ESTADO accede via APIs pero no tiene panel dedicado. Para V3 es suficiente (usa panel admin si tiene acceso). Evaluar para V4.

---

## Verificacion

- [x] `tsc --noEmit` — 0 errores
- [x] `vitest run` — 400/400 tests (26 nuevos T-02 + 1 fix whatsapp)
- [x] Migracion aplicada en produccion (Supabase)
- [ ] Build Vercel — pendiente push (WSL2 I/O impide build local)
- [ ] Verificacion visual en Vercel — pendiente deploy
