# Revisión Cruzada de Specs V3

**Fecha:** 2026-04-25
**Specs analizados:** 23 archivos `v3-*.md` en `.claude/specs/`
**Autor:** Gerardo (via Claude)

> **Nota:** Se encontraron 23 archivos, no 22. `v3-validacion-archivos.md` y `v3-validacion-archivos-v2.md` coexisten (ver hallazgo C-01).

---

## 1. CONTRADICCIONES

### C-01 — Dos specs S-03 coexisten sin indicar cuál es canónico
- **Specs:** `v3-validacion-archivos.md` y `v3-validacion-archivos-v2.md`
- **Secciones:** Todo el archivo
- **Conflicto:** Ambos son el spec S-03. La versión original soporta 8 tipos de archivo (incluyendo xlsx y docx con magic bytes compartidos con ZIP). La v2 reduce a 6 tipos (sin xlsx/docx, pospuestos a V4). No hay ningún marcador que indique cuál es el canónico ni que el original está deprecado.
- **Severidad:** BLOQUEANTE
- **Resolución:** ~~Renombrar `v3-validacion-archivos.md` a `v3-validacion-archivos-DEPRECADO.md` o eliminarlo. La v2 es la versión corregida.~~ **RESUELTO:** original eliminado, v2 renombrada a `v3-validacion-archivos.md`.

### C-02 — F-07 usa formato de error viejo, Q-03 lo lista como API que DEBE usar formato nuevo
- **Specs:** `v3-mensajes-individuales.md` (F-07) y `v3-errores-consistentes-apis.md` (Q-03)
- **Secciones:** F-07 §4 (todo el endpoint) vs Q-03 §8.2 (lista de APIs nuevas V3)
- **Conflicto:** F-07 usa `NextResponse.json({ error: 'No autorizado' }, { status: 403 })` y `NextResponse.json({ error: 'Datos invalidos', detalles: ... })` en todo el endpoint. Q-03 §8.2 lista explícitamente `POST /api/admin/mensajes-individuales (F-07)` como API que debe usar `apiHandler` + `errorResponse` desde el día 1.
- **Severidad:** ALTA
- **Resolución:** ~~Reescribir el endpoint de F-07 §4 usando `apiHandler`, `errorForbidden()`, `errorInvalidInput()`, `errorNotFound()` de Q-03.~~ **RESUELTO:** endpoint reescrito con `apiHandler` + helpers Q-03, dependencia Q-03 agregada al ANTES DE ARRANCAR.

### C-03 — F-04 usa formato de error viejo
- **Specs:** `v3-exportes-estado.md` (F-04) y `v3-errores-consistentes-apis.md` (Q-03)
- **Secciones:** F-04 §4.3 vs Q-03 §8.2
- **Conflicto:** F-04 usa `NextResponse.json({ error: 'Solo ESTADO' }, { status: 403 })` y `NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })`. Q-03 §8.2 lista `GET /api/estado/exportar (F-04)` como API V3 que debe usar el formato nuevo.
- **Severidad:** ALTA
- **Resolución:** ~~Reescribir error handling de F-04 §4.3 usando `errorForbidden('ESTADO')`, `errorResponse({ code: 'INVALID_INPUT', ... })`.~~ **RESUELTO:** endpoint reescrito con `apiHandler` + helpers Q-03, dependencias Q-03 y S-04 agregadas al ANTES DE ARRANCAR.

### C-04 — F-01 y T-03 definen elementos en la misma posición del dashboard taller
- **Specs:** `v3-proximo-nivel-dashboard.md` (F-01) y `v3-protocolos-onboarding.md` (T-03)
- **Secciones:** F-01 §5.4 vs T-03 §6.1
- **Conflicto:** F-01 dice "Posicionar ProximoNivelCard entre el header de bienvenida y el grid de progreso principal". T-03 dice "Banner de checklist: DESPUÉS del header, ANTES del grid de progreso". Misma posición exacta. T-03 tiene una nota vaga: "Nota futura (F-01): definir prioridad", pero no la define. F-01 dice "Remover el banner contextual inline de V2" sin mencionar el checklist de T-03.
- **Severidad:** ALTA
- **Resolución:** ~~Definir regla explícita: si `calcularPasosTaller()` tiene pasos ⬜ pendientes, mostrar checklist T-03 y ocultar ProximoNivelCard. Cuando todos los pasos son ✅, ocultar checklist y mostrar ProximoNivelCard. Documentar en ambos specs.~~ **RESUELTO:** regla de convivencia documentada simétricamente en F-01 §5.4 y T-03 §6.1 con condición exacta `pasos.every(p => p.completado)`.

### C-05 — S-04 nombra `logAccionAdmin` pero ESTADO también lo usa
- **Specs:** `v3-logs-admin-auditoria.md` (S-04) y `v3-redefinicion-roles-estado.md` (D-01)
- **Secciones:** S-04 §4.2 (nombre del wrapper) vs D-01 §2 (ESTADO valida documentos)
- **Conflicto:** El wrapper se llama `logAccionAdmin` pero post-D-01 las acciones de validación las ejecuta ESTADO, no ADMIN. S-04 §6 reconoce "Acción ejecutada por ESTADO — el log se guarda igual" pero el nombre del helper es confuso.
- **Severidad:** BAJA
- **Resolución:** Renombrar a `logAccionSensible` o dejar `logAccionAdmin` con un comentario en el código. No bloqueante.

---

## 2. DEPENDENCIAS NO DECLARADAS

### D-01 — F-04 depende de F-05 para el exporte "demanda"
- **Specs:** `v3-exportes-estado.md` (F-04)
- **Secciones:** F-04 §3.2 (exporte `demanda-insatisfecha.csv`) y §4.4 (case `'demanda'`)
- **Conflicto:** F-04 exporta datos de demanda insatisfecha que vienen de la tabla `MotivoNoMatch` creada por F-05. F-04 ANTES DE ARRANCAR lista D-01 y INT-01, pero NO lista F-05.
- **Severidad:** BLOQUEANTE
- **Resolución:** ~~Agregar `- [ ] V3_BACKLOG F-05 mergeado (tabla MotivoNoMatch disponible)` al ANTES DE ARRANCAR de F-04.~~ **RESUELTO:** dependencia agregada a F-04 ANTES DE ARRANCAR.

### D-02 — F-04 depende de S-04 para `logAccionAdmin`
- **Specs:** `v3-exportes-estado.md` (F-04)
- **Secciones:** F-04 §6.2 (usa `logAccionAdmin`)
- **Conflicto:** F-04 usa `logAccionAdmin('EXPORTE_GENERADO', ...)` que es creado por S-04. F-04 ANTES DE ARRANCAR no lista S-04.
- **Severidad:** ALTA
- **Resolución:** ~~Agregar `- [ ] V3_BACKLOG S-04 mergeado (logAccionAdmin disponible)` al ANTES DE ARRANCAR de F-04.~~ **RESUELTO:** S-04 agregado al ANTES DE ARRANCAR de F-04.

### D-03 — F-07 debería depender de Q-03 para formato de errores
- **Specs:** `v3-mensajes-individuales.md` (F-07)
- **Secciones:** F-07 §4 (endpoint) y ANTES DE ARRANCAR
- **Conflicto:** F-07 es un endpoint nuevo de V3 que Q-03 lista como obligatorio de usar el formato nuevo. F-07 ANTES DE ARRANCAR lista D-01, F-02 y S-02, pero no Q-03.
- **Severidad:** ALTA
- **Resolución:** ~~Agregar `- [ ] V3_BACKLOG Q-03 mergeado (formato de errores — este endpoint DEBE usarlo)` al ANTES DE ARRANCAR de F-07.~~ **RESUELTO:** Q-03 agregado al ANTES DE ARRANCAR de F-07.

### D-04 — T-03 usa F-07 para mensajes recordatorio pero no lo declara
- **Specs:** `v3-protocolos-onboarding.md` (T-03)
- **Secciones:** T-03 §5.3 ("¿Mensaje recordatorio?" usa F-07) y §13 (referencias: "F-07 — los mensajes individuales se usan para los recordatorios")
- **Conflicto:** T-03 referencia F-07 en §13 pero NO lo lista en ANTES DE ARRANCAR. Las acciones del dashboard de onboarding ("¿Reenviar invitación?", "¿Mensaje recordatorio?") dependen de F-07 para funcionar.
- **Severidad:** MEDIA
- **Resolución:** Agregar `- [ ] V3_BACKLOG F-07 mergeado (mensajes individuales para recordatorios)` al ANTES DE ARRANCAR de T-03, o marcar esas acciones como "disponibles solo si F-07 está mergeado".

### D-05 — T-03 endpoint de reenvío debería usar Q-03
- **Specs:** `v3-protocolos-onboarding.md` (T-03)
- **Secciones:** T-03 §5.3 (nuevo endpoint `POST /api/admin/onboarding/reenviar-invitacion`)
- **Conflicto:** T-03 crea un endpoint nuevo de V3 pero no declara Q-03 como dependencia. Según Q-03 §8.2, todos los endpoints nuevos de V3 deben usar `apiHandler`.
- **Severidad:** MEDIA
- **Resolución:** Agregar Q-03 al ANTES DE ARRANCAR de T-03 o prescribir explícitamente que el endpoint use `apiHandler`.

### D-06 — F-05 endpoints deberían usar Q-03
- **Specs:** `v3-demanda-insatisfecha.md` (F-05)
- **Secciones:** F-05 §7.1-7.3 (3 endpoints nuevos)
- **Conflicto:** F-05 crea 3 endpoints nuevos (`GET /api/estado/demanda-insatisfecha`, `GET .../detalle`, `GET .../exportar`). Q-03 §8.2 lista el primero como API que debe usar formato nuevo. F-05 ANTES DE ARRANCAR no lista Q-03.
- **Severidad:** MEDIA
- **Resolución:** Agregar Q-03 al ANTES DE ARRANCAR de F-05 o prescribir `apiHandler` en los endpoints.

### D-07 — QA estado issues debería depender de QA formato (parcialmente declarado)
- **Specs:** `v3-qa-estado-issues.md`
- **Secciones:** ANTES DE ARRANCAR
- **Conflicto:** El spec dice "V3_BACKLOG QA formato ampliado implementado" pero el spec del QA formato se llama `v3-qa-formato-ampliado.md` y no tiene ID de V3_BACKLOG. La referencia es textual pero no formal.
- **Severidad:** BAJA
- **Resolución:** La dependencia está implícitamente declarada. Solo formalizar con nombre exacto del spec.

---

## 3. DEPENDENCIAS CIRCULARES

**No se detectaron dependencias circulares.**

El grafo de dependencias es un DAG (directed acyclic graph) con estas cadenas principales:

```
I-01 ──→ S-04 ──→ D-01 ──→ D-02 ──→ F-01
I-01 ──→ S-01
I-01 ──→ S-02
I-01 ──→ S-03
I-01 ──→ INT-01 ──→ F-04
I-01 ──→ F-02 ──→ F-07
I-01 ──→ F-06
D-01 ──→ Q-02 ──→ Q-03
D-01 ──→ Q-01
D-01 ──→ F-05
D-01 ──→ UX-01..04
T-03 ──→ (depende de D-01, INT-01, F-02)
T-02 ──→ (depende de T-03, F-04, F-05)
```

---

## 4. CONFLICTOS DE UI

### U-01 — Posición compartida en dashboard taller (ya descrito en C-04)
- **Specs:** F-01 y T-03
- **Secciones:** F-01 §5.4 y T-03 §6.1
- **Conflicto:** Ambos ocupan "después del header, antes del grid de progreso" en `/taller`.
- **Severidad:** ALTA
- **Resolución:** Ver C-04.

### U-02 — T-03 banner compite con banner contextual existente Y con F-01
- **Specs:** `v3-protocolos-onboarding.md` (T-03) y `v3-proximo-nivel-dashboard.md` (F-01)
- **Secciones:** T-03 §6.1 ("banner contextual se desactiva") vs F-01 §5.4 ("Remover el banner contextual inline de V2")
- **Conflicto:** T-03 dice "Mientras el checklist esté visible, el banner contextual se desactiva". F-01 dice "Remover el banner contextual inline de V2" permanentemente. Si F-01 lo elimina, T-03 no puede "desactivarlo" condicionalmente — ya no existe. El orden de implementación determina quién gana, pero el resultado es incoherente.
- **Severidad:** MEDIA
- **Resolución:** F-01 reemplaza el banner contextual de V2 con ProximoNivelCard. T-03 debería decir: "Mientras el checklist esté visible, ProximoNivelCard no se muestra" (no "banner contextual"). Actualizar T-03 §6.1.

### U-03 — F-01 y D-02 ambos quieren actualizar constantes en taller/page.tsx
- **Specs:** `v3-proximo-nivel-dashboard.md` (F-01) y `v3-tipos-documento-db.md` (D-02)
- **Secciones:** F-01 §5.4 ("constantes PTS_* se eliminan como parte de D-02") y D-02 §4.1 ("constantes hardcodeadas")
- **Conflicto:** F-01 reconoce que las constantes se eliminan en D-02, pero el card de "Puntaje" (líneas 296-314 de taller/page.tsx) que las usa "se actualiza en D-02, no en este spec". Esto es correcto pero requiere que D-02 se implemente ANTES de F-01.
- **Severidad:** BAJA
- **Resolución:** Ya correctamente declarado en F-01 ANTES DE ARRANCAR. Solo verificar que el orden se respete.

---

## 5. CONFLICTOS DE MIGRACIÓN

### M-01 — 6 specs agregan arrays al modelo User simultáneamente
- **Specs:** T-03, T-02, F-02 (y potencialmente INT-01, F-05 vía relaciones indirectas)
- **Secciones:** T-03 §8.3 (notasSeguimiento*), T-02 §3 (observaciones*), F-02 §3.1-3.2 (mensajesWhatsapp, magicLinks)
- **Conflicto:** No es un conflicto de incompatibilidad — todos son aditivos. Pero si se implementan en paralelo, las migraciones pueden colisionar (cada branch modifica `schema.prisma` en la misma zona del modelo User).
- **Severidad:** MEDIA
- **Resolución:** Implementar secuencialmente, no en paralelo. O agrupar todas las adiciones al modelo User en una sola migración si los specs se implementan en la misma ventana temporal.

### M-02 — INT-01 agrega 9 campos + 2 enums al modelo Taller
- **Specs:** `v3-arca-completo.md` (INT-01)
- **Secciones:** INT-01 §4.1
- **Conflicto:** Migración pesada (9 campos nuevos + 2 enums + 1 tabla nueva). No conflicta con otros specs pero es la migración más grande y debe correr antes de que F-04 (exportes) intente leer esos campos.
- **Severidad:** BAJA
- **Resolución:** Ya declarado correctamente como dependencia de F-04.

### M-03 — D-02 modifica TipoDocumento + crea ReglaNivel
- **Specs:** `v3-tipos-documento-db.md` (D-02)
- **Secciones:** D-02 §3.1-3.2
- **Conflicto:** Ningún otro spec modifica TipoDocumento. D-02 es el único que toca este modelo.
- **Severidad:** BAJA (informativo)
- **Resolución:** Ninguna — no hay conflicto.

---

## 6. ROLES INCONSISTENTES

### R-01 — Q-03 ejemplo usa check de ADMIN para acción que D-01 mueve a ESTADO
- **Specs:** `v3-errores-consistentes-apis.md` (Q-03) y `v3-redefinicion-roles-estado.md` (D-01)
- **Secciones:** Q-03 §6.3 (ejemplo de uso con `session.user.role !== 'ADMIN'`)
- **Conflicto:** Q-03 muestra un ejemplo genérico con `errorForbidden('ADMIN')`. Post-D-01, algunos de esos endpoints requieren ESTADO, no ADMIN. El ejemplo no es incorrecto (es genérico), pero puede confundir al implementador.
- **Severidad:** BAJA
- **Resolución:** Agregar nota en Q-03 §6.3: "El rol requerido depende del endpoint — consultar D-01 para la definición de permisos por rol."

### R-02 — S-02 exime admin de rate limit, pero F-07 necesita rate limit para admin
- **Specs:** `v3-rate-limiting.md` (S-02) y `v3-mensajes-individuales.md` (F-07)
- **Secciones:** S-02 §3 ("Endpoints internos del admin — ya requieren rol ADMIN/ESTADO") vs F-07 §9.2
- **Conflicto:** S-02 dice que endpoints admin no necesitan rate limit. F-07 §9.2 reconoce este conflicto y dice: "Este spec necesita una excepción: 50 mensajes/hora por admin. Se actualizar�� S-02 en un PR aparte." Pero S-02 NO fue actualizado con esta excepción.
- **Severidad:** ALTA
- **Resolución:** ~~Actualizar S-02 agregando `mensajesIndividuales` al mapa de limiters (50 requests, 1 hora, por session.user.id).~~ **RESUELTO:** limiter `mensajesIndividuales` agregado a §5.3, endpoint agregado a tabla §3, excepción documentada en "Endpoints sin rate limiting".

### R-03 — RAG access post-D-01
- **Specs:** `v3-rag-completo.md` (F-06) y `v3-redefinicion-roles-estado.md` (D-01)
- **Secciones:** F-06 §4.2 (auth: `ADMIN | ESTADO | CONTENIDO`)
- **Conflicto:** D-01 no menciona explícitamente quién gestiona el RAG. F-06 amplía el acceso a ESTADO para carga de documentos. No es contradictorio, pero D-01 no contempla esta decisión.
- **Severidad:** BAJA
- **Resolución:** Agregar en D-01 §1 (tabla de responsabilidades): "Gestión de corpus RAG: ADMIN + ESTADO + CONTENIDO".

---

## 7. FORMATO DE ERRORES (viejo vs Q-03)

### E-01 — F-07 usa formato viejo (ya cubierto en C-02)
- **Severidad:** ALTA

### E-02 — F-04 usa formato viejo (ya cubierto en C-03)
- **Severidad:** ALTA

### E-03 — T-03 endpoint sin prescripción de formato
- **Specs:** `v3-protocolos-onboarding.md` (T-03)
- **Secciones:** T-03 §5.3 (endpoint `POST /api/admin/onboarding/reenviar-invitacion`)
- **Conflicto:** No muestra código de error handling. No prescribe Q-03.
- **Severidad:** MEDIA
- **Resolución:** Prescribir `apiHandler` explícitamente en §5.3.

### E-04 — F-05 endpoints sin prescripción de formato
- **Specs:** `v3-demanda-insatisfecha.md` (F-05)
- **Secciones:** F-05 §7.1-7.3 (3 endpoints)
- **Conflicto:** Define response shapes pero no muestra error handling ni prescribe Q-03.
- **Severidad:** MEDIA
- **Resolución:** Agregar nota en §7: "Todos los endpoints usan `apiHandler` de Q-03."

### E-05 — S-02 rate limit response vs Q-03 `errorRateLimited()`
- **Specs:** `v3-rate-limiting.md` (S-02) y `v3-errores-consistentes-apis.md` (Q-03)
- **Secciones:** S-02 §5.3 (helper rateLimit retorna 429) vs Q-03 §5.1 (`errorRateLimited()`)
- **Conflicto:** S-02 tiene su propio formato de 429 response. Q-03 define `errorRateLimited()` con el formato estándar. Si S-02 se implementa primero, usa formato viejo. Q-03 luego lo debería migrar, pero no lo menciona explícitamente en §8.3 (APIs viejas).
- **Severidad:** MEDIA
- **Resolución:** En S-02 §5.3, importar y usar `errorRateLimited()` de Q-03. O si S-02 se implementa antes de Q-03, marcar en §5.3: "Post Q-03, migrar esta response al formato estándar."

### E-06 — QA estado issues usa formato distinto (justificado)
- **Specs:** `v3-qa-estado-issues.md`
- **Secciones:** §4.2 (endpoint público sin auth)
- **Conflicto:** Retorna `{ issues: [], error: '...' }` — no usa Q-03. Esto es un endpoint público para QA HTMLs en GitHub Pages, no una API user-facing.
- **Severidad:** BAJA
- **Resolución:** Aceptable como excepción documentada. Agregar comentario en el spec.

---

## Resumen de hallazgos por severidad

| Severidad | Cantidad |
|-----------|----------|
| BLOQUEANTE | 2 |
| ALTA | 8 |
| MEDIA | 8 |
| BAJA | 7 |
| **Total** | **25** |

### BLOQUEANTES (resolver antes de implementar)

1. **C-01** — Dos specs S-03 coexisten sin canónico
2. **D-01** — F-04 depende de F-05 pero no lo declara — **RESUELTO:** F-05 agregado al ANTES DE ARRANCAR de F-04

### ALTA (resolver antes de implementar el spec afectado)

1. **C-02** — F-07 usa formato viejo (contradice Q-03) — **RESUELTO:** endpoint reescrito con apiHandler
2. **C-03** — F-04 usa formato viejo (contradice Q-03) — **RESUELTO:** endpoint reescrito con apiHandler
3. **C-04/U-01** — F-01 y T-03 en misma posición del dashboard — **RESUELTO:** regla de convivencia documentada simétricamente
4. **D-02** — F-04 depende de S-04 sin declararlo — **RESUELTO:** S-04 agregado al ANTES DE ARRANCAR de F-04
5. **D-03** — F-07 no declara dependencia de Q-03 — **RESUELTO:** Q-03 agregado al ANTES DE ARRANCAR de F-07
6. **R-02** — S-02 no tiene la excepción de rate limit para F-07 — **RESUELTO:** limiter mensajesIndividuales + excepción documentada

---

## Specs sin conflictos detectados

Los siguientes specs no presentaron ningún conflicto en las 7 categorías analizadas:

1. **`v3-separar-ambientes.md`** (I-01) — Base de todo, sin dependencias cruzadas problemáticas
2. **`v3-cookies-seguridad.md`** (S-01) — Spec autocontenido de hardening
3. **`v3-tests-e2e.md`** (Q-01) — Spec autocontenido, pospone test 7 correctamente hasta D-01

---

## Notas adicionales

### Sobre el ORDEN_IMPLEMENTACION
El archivo `ORDEN_IMPLEMENTACION.md` actual es de V2, no de V3. No existe un grafo de dependencias actualizado para los 23 specs de V3. Recomendación: generar un ORDEN_IMPLEMENTACION_V3.md basado en las dependencias declaradas (y las corregidas por esta revisión).

### Sobre los 6 modelos nuevos
V3 agrega 6 tablas nuevas al schema: `ReglaNivel` (D-02), `MensajeWhatsapp` + `MagicLink` (F-02), `MotivoNoMatch` (F-05), `NotaSeguimiento` (T-03), `ObservacionCampo` (T-02), `ConsultaArca` (INT-01), `ConfiguracionUpload` (S-03). Más la modificación de `Taller` (9 campos nuevos de INT-01) y `TipoDocumento` (2 campos nuevos de D-02). Coordinar el orden de migraciones es crítico.
