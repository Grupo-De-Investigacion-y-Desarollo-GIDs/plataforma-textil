# REVIEW: Exportes Estado - CSV/Excel unificado con filtros

**Spec:** v3-exportes-estado
**Fecha:** 2026-05-05
**Implemento:** Gerardo (Claude Code)

---

## Changelog

### Archivos nuevos
- `src/compartido/lib/exportes.ts` — Helper generarXlsx + HojaExportable interface + re-export toCsv
- `src/app/api/estado/exportar/route.ts` — GET endpoint unificado con formato csv/xlsx, filtros, rate limit, maxDuration=120
- `src/app/api/estado/exportar/data.ts` — Logica de 10 tipos de exporte con queries Prisma
- `src/__tests__/exportes.test.ts` — 11 tests Vitest (generarXlsx, multi-hoja, formatos, tipos validos)
- `tests/e2e/exportes-estado.spec.ts` — 5 tests Playwright
- `.claude/auditorias/QA_v3-exportes-estado.md`
- `.claude/auditorias/REVIEW_v3-exportes-estado.md`

### Archivos modificados
- `package.json` / `package-lock.json` — +exceljs@4.4.0
- `src/app/(estado)/estado/exportar/page.tsx` — Rediseno completo: tarjetas por tipo, filtros (provincia/nivel/periodo), selector formato CSV/Excel, seccion informe mensual, Breadcrumbs, Toast feedback

### No se tocaron (excluidos por decision)
- `src/app/api/exportar/route.ts` — Endpoint legacy, se mantiene para retrocompatibilidad temporal. La UI ahora apunta al nuevo `/api/estado/exportar`
- `src/compartido/lib/csv.ts` — Se usa via re-export desde exportes.ts, sin modificaciones
- `src/compartido/lib/demanda-insatisfecha.ts` — Se usa exportarMotivosCSV() como dependencia, sin modificaciones

---

## Decisiones

1. **Endpoint nuevo en `/api/estado/exportar/` en lugar de modificar `/api/exportar/`.** El legacy se mantiene para no romper nada. Eventualmente migrar los call sites internos y deprecar.

2. **ADMIN mantiene acceso.** Decision de Gerardo, no del spec original que decia ESTADO only. ADMIN debe poder leer todo por consistencia con D-01.

3. **maxDuration=120 (Vercel Pro).** Suficiente para el piloto de ~25 talleres. En V4 con escala mayor evaluar si necesita mas.

4. **BOM UTF-8 (\uFEFF) agregado al CSV.** Para que Excel interprete correctamente tildes y enes al abrir. Sin esto, los archivos se muestran con caracteres rotos en Excel Windows.

5. **exceljs 4.4.0 elegido por compatibilidad con Vercel serverless.** Sin deps nativas. Agrega ~2MB al bundle de la ruta — aceptable.

6. **Informe mensual reutiliza las mismas funciones de los exportes individuales** (talleres, marcas, etc.) en paralelo. No duplica logica.

7. **Los 4 tipos legacy (capacitaciones, acompanamiento, pedidos, denuncias) se mantuvieron sin ampliar.** No estaban en el scope del spec pero se incluyeron en el nuevo endpoint para unificar.

---

## Variables de entorno

Ninguna nueva.

---

## Tests

| Archivo | Tests | Resultado |
|---------|-------|-----------|
| `src/__tests__/exportes.test.ts` | 11 | PASS |
| `tests/e2e/exportes-estado.spec.ts` | 5 | pendiente CI |
| Suite completa Vitest | 287 | PASS |

---

## Riesgos

- **exceljs bundle size (~2MB).** Aumenta cold start de la ruta ~500ms. Aceptable para piloto.
- **node_modules/xmlchars distribucion rota en Node 24.** Se resolvio instalando en Linux FS y copiando. En CI no deberia ser problema (Ubuntu nativo).
- **Endpoint legacy /api/exportar sigue existente.** Eventualmente migrar los call sites internos y deprecar.
