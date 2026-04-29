# REVIEW: Error Boundaries (Q-02)

**Spec:** `.claude/specs/v3-error-boundaries.md`
**Fecha:** 2026-04-29
**Implementador:** Gerardo (Claude Code)

---

## Archivos creados

| Archivo | Descripcion |
|---------|-------------|
| `src/compartido/componentes/error-page.tsx` | Componente reutilizable de error con logging, reset, feedback |
| `src/compartido/componentes/not-found-page.tsx` | Componente reutilizable de 404 contextualizado por rol |
| `src/app/global-error.tsx` | Fallback final si el root layout falla |
| `src/app/(contenido)/error.tsx` | Error boundary para seccion contenido (no existia) |
| `src/app/(admin)/not-found.tsx` | 404 para admin |
| `src/app/(taller)/not-found.tsx` | 404 para taller |
| `src/app/(marca)/not-found.tsx` | 404 para marca |
| `src/app/(estado)/not-found.tsx` | 404 para estado |
| `src/app/(auth)/not-found.tsx` | 404 para auth |
| `src/app/(public)/not-found.tsx` | 404 para publico |
| `src/app/(contenido)/not-found.tsx` | 404 para contenido |
| `src/compartido/lib/error-logger.ts` | Helper server-side logearError() |
| `src/app/api/log-error/route.ts` | Endpoint POST para logging desde client |
| `src/__tests__/error-logger.test.ts` | 6 tests para logearError |
| `src/__tests__/log-error-route.test.ts` | 5 tests para endpoint |
| `tests/e2e/error-boundaries.spec.ts` | 4 tests E2E para 404 |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/app/error.tsx` | Reemplazado: usa ErrorPage en vez de UI inline |
| `src/app/not-found.tsx` | Reemplazado: usa NotFoundPage en vez de UI inline |
| `src/app/(admin)/error.tsx` | Reemplazado: usa ErrorPage con contexto="admin" |
| `src/app/(taller)/error.tsx` | Reemplazado: usa ErrorPage con contexto="taller" |
| `src/app/(marca)/error.tsx` | Reemplazado: usa ErrorPage con contexto="marca" |
| `src/app/(estado)/error.tsx` | Reemplazado: usa ErrorPage con contexto="estado" |
| `src/app/(auth)/error.tsx` | Reemplazado: usa ErrorPage con contexto="publico" |
| `src/app/(public)/error.tsx` | Reemplazado: usa ErrorPage con contexto="publico" |
| `src/compartido/componentes/feedback-widget.tsx` | Agregado useEffect + addEventListener para open-feedback |
| `package.json` / `package-lock.json` | react-error-boundary instalada |

## Decisiones arquitectonicas

### 1. Ubicacion de error.tsx: route group vs nested
El spec prescribe `(admin)/admin/error.tsx` pero los archivos existentes estan en `(admin)/error.tsx` (un nivel arriba). Mantuve la ubicacion existente porque moverlos romperia el catch de Next.js — el error.tsx en el route group captura errores de TODOS los children incluyendo el subdirectorio admin/.

### 2. react-error-boundary sin targets
La lib esta instalada (~2KB) pero no se envuelve ningun componente porque no hay targets reales hoy (no hay charts, RAG ni WhatsApp). Se aplicara cuando lleguen:
- F-02: Widget WhatsApp
- F-04: Dashboard charts
- F-06: Asistente RAG

### 3. Tests Vitest vs component tests
El proyecto usa Vitest con environment=node (sin jsdom ni @testing-library/react). Agregar RTL para 2 tests de presentacion seria over-engineering. Los componentes ErrorPage y NotFoundPage se verifican via E2E (navegando a rutas inexistentes).

### 4. not-found.tsx a nivel de route group
Next.js App Router solo activa not-found.tsx dentro de un route group cuando el page.tsx del segmento llama a `notFound()`. Para rutas completamente inexistentes, siempre se activa el not-found.tsx global (raiz). Los not-found.tsx por grupo son utiles si en el futuro un page.tsx llama a `notFound()` (ej: pedido no encontrado).

### 5. Logging publico vs no-publico
logearError() no persiste en DB para contexto="publico" (solo console.error). Razon: las paginas publicas reciben trafico anonimo y bots que generarian ruido en LogActividad. Los errores publicos igual van a Vercel Logs via console.error server-side.

## Metricas

| Metrica | Valor |
|---------|-------|
| Archivos creados | 16 |
| Archivos modificados | 10 |
| Tests Vitest nuevos | 11 (6 + 5) |
| Tests E2E nuevos | 4 |
| Total tests Vitest suite | 177 (todos pasan) |
| Bundle adicional | ~2KB (react-error-boundary) |
| TypeScript | 0 errores |

## Gaps spec vs realidad

| Item del spec | Estado | Nota |
|---------------|--------|------|
| ErrorPage reutilizable | Implementado | |
| NotFoundPage reutilizable | Implementado | |
| error.tsx en 9 ubicaciones | Implementado | 7 reemplazados + 2 nuevos |
| not-found.tsx en 8 ubicaciones | Implementado | 1 reemplazado + 7 nuevos |
| global-error.tsx | Implementado | |
| Feedback widget listener | Implementado | |
| logearError server-side | Implementado | |
| Endpoint /api/log-error | Implementado | |
| react-error-boundary | Instalada | Sin targets actuales |
| ErrorBoundary en charts/RAG | No aplica | No hay componentes complejos |
| error.message no filtrado al user | Implementado | Solo digest visible |

## Riesgos

- **not-found.tsx por route group** puede no activarse para rutas completamente inexistentes (Next.js siempre usa el global). Se activa cuando un page.tsx llama a `notFound()`.
- **Logging silencioso** — si la DB esta caida, logearError() falla silenciosamente. Siempre queda console.error como fallback en Vercel Logs.
