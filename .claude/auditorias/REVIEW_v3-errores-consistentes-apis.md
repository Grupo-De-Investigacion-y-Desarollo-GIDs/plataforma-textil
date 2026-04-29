# REVIEW: Errores consistentes en APIs (Q-03)

**Spec:** `.claude/specs/v3-errores-consistentes-apis.md`
**Fecha:** 2026-04-29
**Implementador:** Gerardo (Claude Code)

---

## Archivos creados

| Archivo | Descripcion |
|---------|-------------|
| `src/compartido/lib/api-errors.ts` | Helpers backend: errorResponse, apiHandler, 8 helpers especificos |
| `src/compartido/lib/api-client.ts` | Helpers frontend: getErrorMessage, getErrorCode |
| `src/app/api/README.md` | Documentacion del formato de error y codigos estandar |
| `src/__tests__/api-errors.test.ts` | 18 tests: helpers, apiHandler, Prisma codes |
| `src/__tests__/api-client.test.ts` | 9 tests: parsing V3, legacy, edge cases |

## Archivos modificados — Endpoints migrados (11)

| Endpoint | Metodos | Cambio |
|----------|---------|--------|
| `/api/auth/registro` | POST | apiHandler + errorConflict P2002 especifico (email/CUIT) |
| `/api/pedidos` | GET, POST | apiHandler + helpers |
| `/api/pedidos/[id]` | GET, PUT | apiHandler + helpers |
| `/api/cotizaciones` | GET, POST | apiHandler + errorConflict P2002 (cotizacion duplicada) |
| `/api/cotizaciones/[id]` | PUT | apiHandler + helpers |
| `/api/validaciones/[id]` | PUT | apiHandler + errorForbidden (reemplaza INSUFFICIENT_ROLE) |
| `/api/validaciones/[id]/upload` | POST | apiHandler + errorExternalService para storage |
| `/api/feedback` | POST | errorResponse inline (CORS headers impiden apiHandler) |
| `/api/chat` | POST | apiHandler + EXTERNAL_SERVICE_ERROR para 503 |
| `/api/talleres/me` | GET | apiHandler + helpers |
| `/api/pedidos/[id]/ordenes` | GET | apiHandler + helpers |

## Archivos modificados — Frontend consumidores (10)

| Archivo | Cambio |
|---------|--------|
| `registro/page.tsx` | `typeof data.error === 'string'` guard para .toLowerCase() |
| `asistente-chat.tsx` | getErrorCode para detectar EXTERNAL_SERVICE_ERROR (reemplaza === string) |
| `publicar-pedido.tsx` | getErrorMessage (reemplaza alert(data.error)) |
| `upload-imagen.ts` | typeof guard para throw new Error() |
| `aceptar-cotizacion.tsx` | getErrorMessage |
| `rechazar-cotizacion.tsx` | getErrorMessage |
| `cancelar-pedido.tsx` | getErrorMessage |
| `cotizar-form.tsx` | typeof guard |
| `orden-actions.tsx` | typeof guard |
| `nuevo-pedido-form.tsx` | typeof guard |

## Archivos modificados — Tests existentes

| Archivo | Cambio |
|---------|--------|
| `revocar-validacion.test.ts` | Actualizado: body.code → body.error.code, body.error string → body.error.message |

## Decisiones arquitectonicas

### 1. No usar legacy compat (legacyError field)
Se descarto agregar un campo `legacyError: "string"` de compatibilidad. En su lugar, se migro el frontend de cada endpoint migrado. Esto es mas trabajo pero no deja deuda oculta — cada endpoint funciona con un solo formato.

### 2. Feedback no usa apiHandler
El endpoint `/api/feedback` agrega CORS headers a cada respuesta (tanto exito como error). `apiHandler` no soporta headers custom, asi que feedback usa `errorResponse()` inline + agrega CORS headers manualmente. Solo tiene 1 error response, asi que la complejidad es baja.

### 3. Registro conserva P2002 especifico
El `apiHandler` generico convierte P2002 a "Ya existe un registro con esos datos". Pero registro necesita diferenciar email vs CUIT duplicado para mostrar el error correcto al usuario. Se conserva el try/catch interno con mensajes especificos, y apiHandler captura todo lo demas.

### 4. Chat usa EXTERNAL_SERVICE_ERROR para 503
Los errores "Asistente no disponible" y "deshabilitado temporalmente" ahora retornan `code: EXTERNAL_SERVICE_ERROR`. El frontend usa `getErrorCode()` para detectar este tipo de error y mostrar el estado permanente de no-disponibilidad (en vez de comparar strings).

### 5. getErrorMessage vs inline typeof
Para frontends que importan de `@/compartido/lib/api-client`, se usa `getErrorMessage()`. Para archivos donde agregar un import seria excesivo (solo 1 linea de cambio), se usa `typeof data.error === 'string' ? data.error : data.error?.message` inline. Ambos manejan ambos formatos.

## Metricas

| Metrica | Valor |
|---------|-------|
| Archivos creados | 5 |
| Archivos modificados (endpoints) | 11 |
| Archivos modificados (frontend) | 10 |
| Archivos modificados (tests) | 1 |
| Tests Vitest nuevos | 27 (18 + 9) |
| Total tests Vitest suite | 204 (todos pasan) |
| TypeScript | 0 errores |
| Instancias data.error migradas en frontend | 14 |
| Instancias data.error restantes (endpoints no migrados) | 18 (en 16 archivos) |
| Endpoints migrados | 11 de 68 (16%) |
| Endpoints con formato legacy | 57 (diferidos a V4 T-08) |

## Deuda para V4

- **T-08:** Migrar los 57 endpoints restantes al formato consistente (~10h)
- Los 18 frontends con `data.error` legacy se migran junto con sus endpoints en T-08
