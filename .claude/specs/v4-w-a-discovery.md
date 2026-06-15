# Discovery W-A — Formulario del taller (reconciliación vs estado real)

> **Tipo:** Discovery (análisis, NO implementación). · **Fecha:** 2026-06-13 · **Rama:** `develop` (post-deploy a prod del release mayor).
> **Objetivo:** medir cuánto de W-A (refactor del formulario `/taller/perfil/completar`, issues #297–#304) queda por hacer, reconciliando el master V4 contra lo que ya está en el código y deployado a prod.

---

## 0. TL;DR

**W-A está 100% implementado y deployado a prod.** La estimación del master (~11h) ya se consumió: el trabajo se hizo en **PR #326 (W-A1)** + **PR #363 (W-A2–W-A5)**, con specs retroactivos (`v4-w-a1-desglose-plantilla.md`, `v4-w-a-formulario-taller.md`) y al menos un e2e (`tests/e2e/desglose-plantilla.spec.ts`). El schema entró por dos migraciones (mayo) que ya están en prod desde el deploy de hoy.

**Lo único que queda NO es implementación:**
1. **Housekeeping:** issues **#299–#304 siguen OPEN** pese a estar implementados en #363 (solo #297/#298 se cerraron). → cerrarlos referenciando #363.
2. **Validación sectorial diferida** (depende de OIT/equipo sectorial, no de código) — probablemente la razón por la que los issues quedaron abiertos.
3. **(Opcional)** e2e de W-A2–W-A5 (hoy solo W-A1 tiene e2e dedicado) y un pulido cosmético de labels en W-A1 — ambos descartables.

**Gap real de implementación: ~0h.** Estimación ajustada: **0–1h** (cerrar issues) + **2–3h opcionales** (e2e W-A2–A5).

---

## 1. Estado actual del formulario

- **Dónde vive:** `src/app/(taller)/taller/perfil/completar/page.tsx` — wizard de **14 pasos** (índices 0–13). Carga datos existentes (modo edición) vía `GET /api/talleres/me` y persiste vía `PUT /api/talleres/[id]` (que ya whitelistea todos los campos W-A: `organizacion`, `organizacionDetalle`, `disponibilidad`, `escalabilidad`, `rolesFuncionales`, `plantilla`).
- **Schema en prod:** dos migraciones ya aplicadas (entraron en el deploy de hoy, fechadas mayo):
  - `20260516120000_desglose_plantilla_taller` → tabla `taller_plantilla` + enum `CategoriaOficioTextil` (APRENDIZ/MEDIO_OFICIAL/OFICIAL/OFICIAL_CALIFICADO). **= W-A1**.
  - `20260525180000_agregar_campos_formulario_taller` → columnas `organizacionDetalle` (W-A2), `disponibilidad` (W-A4), `rolesFuncionales` JSONB (W-A5), + limpieza de `escalabilidad` (W-A4). Los comentarios del SQL referencian explícitamente "W-A2/W-A4/W-A5".

---

## 2. Issues #297–#304 — uno por uno (hecho/falta)

| Issue | Item | Estado GitHub | Estado en código | Veredicto |
|---|---|---|---|---|
| **#297** | Nomenclatura: sacar "novato"/paréntesis genéricos | **CLOSED** (2026-05-16) | Step 3: categorías APRENDIZ/MEDIO_OFICIAL/OFICIAL/OFICIAL_CALIFICADO | ✅ **HECHO** (#326) |
| **#298** | Antigüedad: rangos de años | **CLOSED** | Step 3: "Aprendices / Menos de 1 año", "Medio oficial / 1 a 3 años", "Oficial / 3 a 5 años", "Oficial calificado / Más de 5 años" | ✅ **HECHO** (#326) |
| **#299** | Org. productiva: agregar "Organización mixta" + campo abierto | **OPEN** | Step 4: opción `mixta` "Organización mixta" + `Input` condicional `organizacionDetalle` | ✅ **HECHO** (#363) — issue sin cerrar |
| **#300** | Registro producción: agregar "Sin registro sistemático" | **OPEN** | Step 10: opción `sin-sistematico` "Sin registro sistemático" presente | ✅ **HECHO** (#363) — issue sin cerrar |
| **#301** | Desdoblar la pregunta de capacidad en 2 | **OPEN** | Step 10: ya son DOS preguntas (Disponibilidad + Cómo aumentar) | ✅ **HECHO** (#363) — issue sin cerrar |
| **#302** | Pregunta 1 (disponibilidad): 4 opciones | **OPEN** | Step 10 P1: `sin-cambios` / `con-limites` / `baja` / `no-puede` → campo `disponibilidad` | ✅ **HECHO** (#363) — issue sin cerrar |
| **#303** | Pregunta 2 (cómo aumentar): 4 opciones | **OPEN** | Step 10 P2: `turnos` / `contratar` / `tercerizar` / `maquinaria` → campo `escalabilidad` | ✅ **HECHO** (#363) — issue sin cerrar |
| **#304** | Ampliar roles funcionales a 10 | **OPEN** | Step 2: `ROLES_EQUIPO` = los 10 roles exactos del master → campo `rolesFuncionales` | ✅ **HECHO** (#363) — issue sin cerrar |

**Conclusión:** 8/8 issues implementados. 2 cerrados, **6 abiertos por housekeeping** (no por trabajo pendiente).

### Detalle de los 10 roles (W-A5 / #304) — match exacto con el master
Moldería/desarrollo de moldes · Tizado/marcada · Corte · Confección/costura · Terminación y planchado · Control de calidad · Coordinación/encargado de taller · Administración/gestión de pedidos · Compras/gestión de insumos · Logística/entregas.

---

## 3. Gap real + estimación ajustada

| Frente | Master decía | Estado real | Gap | Estimación ajustada |
|---|---|---|---|---|
| Schema (W-A1/A2/A4/A5) | nuevo, riesgo medio | **en prod** (2 migraciones mayo) | 0 | 0h |
| API persistencia | — | `PUT /api/talleres/[id]` ya whitelistea todo | 0 | 0h |
| Wizard UI (W-A1–A5) | ~11h | **implementado** (#326 + #363) | 0 | 0h |
| e2e | — | solo W-A1 (`desglose-plantilla.spec.ts`) | W-A2–A5 sin e2e dedicado | 2–3h (opcional) |
| Cosmético W-A1 | "(menos de 1 año)" inline | label + `desc` separado (semántica idéntica) | nulo | 0h (descartar) |
| Cierre de issues | — | #299–#304 OPEN | housekeeping | ~0.5h |

**Estimación ajustada: ~0–1h** (cerrar issues) **+ 2–3h opcionales** (e2e de W-A2–A5). **vs ~11h del master → ya consumidas.**

---

## 4. Dependencias (Sergio/OIT)

- **Implementación:** autónoma, ya hecha. **No depende de nadie.**
- **Validación sectorial:** el spec `v4-w-a-formulario-taller.md` marca *"Validación sectorial: N/A — Diferida a validación grupal post-MVP V4"*. Es **muy probable** que los issues #299–#304 sigan abiertos esperando esa validación grupal (OIT/sectorial), no trabajo de código. → **Decisión de Gerardo:** ¿se cierran ya (implementados) o se dejan abiertos como recordatorio de la validación sectorial pendiente?

---

## 5. Decisiones de scope (con recomendación)

1. **Cierre de issues #299–#304** — *Recomendado:* cerrarlos con comentario "implementado en #363, deployado a prod 2026-06-13", y abrir UN issue nuevo de seguimiento "validación sectorial W-A" si esa validación sigue pendiente. Separa "código hecho" de "validación pendiente".
2. **e2e W-A2–W-A5** — *Recomendado opcional:* sumar un `tests/e2e/w-a-formulario.spec.ts` que recorra el wizard y asserte las opciones nuevas (mixta+detalle, sin-sistematico, 2 preguntas de capacidad, 10 roles) y que el `PUT` persiste. ~2–3h. Cierra la deuda de test de W-A2–A5. No bloquea nada.
3. **Cosmético W-A1 labels** — *Recomendado:* NO hacer. El `label`+`desc` actual es igual o mejor que el paréntesis inline del master.

---

## 6. Riesgos

- **Bajo.** Todo está en prod y funcionando. El único riesgo real es **dejar los issues abiertos sin contexto** → futura confusión ("¿esto está hecho?"). Lo mitiga el cierre con referencia a #363.
- **Datos:** la migración limpió valores viejos de `escalabilidad` (`no-puedo`/`horas-extra`) — ya aplicada en prod, sin acción.
- **Acoplamiento W-A ↔ W-B:** el master advierte que W-A (formulario) y W-B (reporte sectorial) deben ir acoplados ("cambiar el formulario sin el reporte genera datos sucios"). **W-A está hecho; conviene confirmar el estado de W-B** (reporte sectorial agregado, ~22h en el master) en un discovery aparte — si W-B no refleja las categorías nuevas, el reporte sectorial puede estar mostrando datos viejos. **No es parte de este discovery** pero es el siguiente hilo lógico.

---

## 7. Recomendación final

W-A **no requiere implementación**. Acciones sugeridas, todas livianas:
1. Cerrar #299–#304 (referenciando #363) — housekeeping, ~0.5h.
2. (Opcional) e2e de W-A2–A5 — ~2–3h.
3. Lanzar un **discovery de W-B** (reporte sectorial) — es el acoplado y probablemente el verdadero trabajo pendiente del Bloque W.
