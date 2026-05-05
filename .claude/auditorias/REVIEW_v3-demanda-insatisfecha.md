# REVIEW: F-05 Dashboard de demanda insatisfecha

**Spec:** v3-demanda-insatisfecha
**Fecha:** 2026-05-04
**Implemento:** Gerardo (Claude Code)

---

## Changelog

### Archivos nuevos
- `src/compartido/lib/demanda-insatisfecha.ts` — Helpers: `registrarMotivoNoMatch`, `buscarTalleresCerca`, `calcularStatsAgregadas`, `generarRecomendaciones`, `obtenerDetallePorCategoria`, `obtenerTalleresCerca`, `exportarMotivosCSV`
- `src/app/api/estado/demanda-insatisfecha/route.ts` — GET: stats agregadas + recomendaciones
- `src/app/api/estado/demanda-insatisfecha/detalle/route.ts` — GET: detalle por categoria o talleres cerca
- `src/app/api/estado/demanda-insatisfecha/exportar/route.ts` — GET: CSV con rate limit
- `src/app/(estado)/estado/demanda-insatisfecha/page.tsx` — Dashboard con 3 vistas: resumen, detalle por categoria, talleres cerca
- `src/app/(estado)/estado/demanda-insatisfecha/loading.tsx` — Skeleton loading
- `src/__tests__/demanda-insatisfecha.test.ts` — 11 tests Vitest
- `src/__tests__/notificaciones-matching.test.ts` — 6 tests Vitest
- `tests/e2e/demanda-insatisfecha.spec.ts` — 6 tests Playwright
- `.claude/auditorias/QA_v3-demanda-insatisfecha.md`
- `.claude/auditorias/REVIEW_v3-demanda-insatisfecha.md`

### Archivos modificados
- `prisma/schema.prisma` — +model MotivoNoMatch, +enum MotivoCategoria, +relacion en Pedido
- `src/compartido/lib/notificaciones.ts` — `notificarTalleresCompatibles()`: agregado filtro procesosRequeridos post-query, registro de MotivoNoMatch en caso de 0 matches
- `src/compartido/lib/ratelimit.ts` — +limiter `exportar` (5/hora)
- `src/compartido/componentes/layout/header.tsx` — +tab "Demanda insatisfecha" en menu ESTADO

### No se tocaron
- `src/compartido/lib/nivel.ts` — se usa `calcularProximoNivel()` como dependencia, sin modificar
- `src/compartido/lib/csv.ts` — se usa `toCsv()` como dependencia, sin modificar
- `src/compartido/lib/api-errors.ts` — se usa `apiHandler`, `errorResponse` como dependencia

---

## Decisiones

1. **procesosRequeridos ahora se filtra en matching.** El spec no lo incluia explicitamente, pero Gerardo pidio incluirlo si era chico (~20 lineas). Se hace post-query: traemos 50 talleres, filtramos por procesos en JS, limitamos a 20. Match aproximado por string inclusion (same as in registrarMotivoNoMatch).

2. **Una sola pagina con vistas via searchParams.** En lugar de 4 paginas separadas, la pagina `/estado/demanda-insatisfecha` usa `?motivoCategoria=X` y `?vista=talleres-cerca` para las vistas detalladas. Menos archivos, misma UX.

3. **Migracion via raw SQL.** `prisma db push` falla por columna `vector(512)` en DocumentoRag (pgvector no disponible en shadow DB). La tabla se creo con `$executeRaw` via DIRECT_URL. Schema de Prisma actualizado y `prisma generate` exitoso.

4. **registrarMotivoNoMatch es fire-and-forget.** Si falla, no bloquea el flujo de matching. Se loggea el error a console.error con prefijo `[F-05]`.

5. **calcularProximoNivel puede fallar para talleres sin ReglaNivel.** El helper `buscarTalleresCerca` captura el error con try/catch y retorna `faltaPara: 'sin_datos'` — no crashea.

6. **Metrica principal = unidades, no pesos.** El campo `presupuesto` es opcional y muchos pedidos no lo tienen. Mostrar pesos parciales como metrica principal seria engañoso para politica publica. Se muestra como metrica secundaria con aclaracion.

---

## Variables de entorno

Ninguna nueva. Todo usa DB existente.

---

## Tests

| Archivo | Tests | Resultado |
|---------|-------|-----------|
| `src/__tests__/demanda-insatisfecha.test.ts` | 11 | PASS |
| `src/__tests__/notificaciones-matching.test.ts` | 6 | PASS |
| `tests/e2e/demanda-insatisfecha.spec.ts` | 6 | pendiente CI |
| Suite completa Vitest | 259 | PASS |

---

## Riesgos

- **Datos vacios en piloto.** El dashboard va a mostrar 0/0/0 hasta que se publiquen pedidos que no encuentren talleres. El estado vacio tiene mensaje explicativo.
- **Match aproximado por string.** `procesosRequeridos` del Pedido es `String[]` libre, no FK. El match con `TallerProceso.proceso.nombre` es por `includes()`, puede dar falsos negativos con nombres parciales. Aceptable para V3, normalizar en V4.
- **Talleres cerca limitados a 5.** Solo se buscan 5 talleres BRONCE con capacidad suficiente. Si hay mas, se pierden del detalle. Aceptable para piloto de 25 talleres.
