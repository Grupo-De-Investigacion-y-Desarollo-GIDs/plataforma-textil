# DISCOVERY — Nivel 5 / X-07·X-08·X-09 (aplicación visual a dashboards, listados, detalle + Mi Formalización)

> **Tipo:** discovery + reconciliación master ↔ narrativa V4. **NO implementa.**
> **Fecha:** 2026-06-08 · **Autor:** Gerardo (vía Claude) · **Estado:** **EJECUTADO** — 5 decisiones de scope tomadas (§9) + cierre niveles implementado (§11). **Nivel 5 (X-07/X-09) archivado como cumplido.**
> **Fuente autoritativa:** en copy/narrativa/formalización manda la **Narrativa V4** (`narrativa-V4-consolidado-niveles-1-a-4.md`). El **master** (`docs/Diseño/MASTER_V4.md-v2.pdf`, mayo 2026) manda en el **patrón visual** (paleta, componentes, tipografía) que la narrativa no toca.

---

## Decisiones cerradas (Gerardo, 2026-06-08)

1. **Re-scope confirmado:** de ~14h (master) a **~2-5h reales (cierre niveles)**. El diseño visual V4 ya está 85-90% hecho (PRs #347, #358, helper `nivelAEtapa`, #403). **X-07 y X-09 del master se archivan como cumplidos.**
2. **F-1 (Historial muestra "BRONCE → PLATA" crudo al taller, viola 3.8):** se arregla **junto con el cierre niveles** (no fragmentar — toca `taller/page.tsx`).
3. **X-08 "listados" = es §1.4 de la narrativa** (vitrina con info de marca en `pedidos/disponibles`), **no** un spec visual nuevo. **X-08 del master se archiva como cubierto** por §1.4.
4. **X-07b cosmético** (grays / serif H3 / public-auth): **backlog post-piloto** → anotado como **F-04** en `DEUDA_TECNICA.md`.
5. **Skill `niveles-formalizacion` stale:** se **actualiza dentro del cierre niveles** (no se abre T-06 aparte).

**→ Trabajo restante real:** un spec chico **"cierre niveles" (~2h)** = arreglar F-1 + actualizar la skill. El resto: **§1.4** (spec narrativa propio) y **cosmético** (backlog F-04).

---

## 0. TL;DR (leer esto primero)

**La premisa del master — "X-07/08/09 = aplicar el diseño V4 + integrar el refactor narrativa 3.7-3.10" (≈14h) — ya está implementada en ~85-90%.** No es trabajo nuevo de 14h; es un **cierre** de ~2-5h.

- ✅ **Paleta visual V4 a dashboards (X-07a)** — mergeado **#347** (`2d914d6`). H1/H2 con `font-serif`, tokens `brand-blue/brand-red`, ProgressRing y componentes UI ya en tokens.
- ✅ **Ocultar niveles en ESTADO/ADMIN (X-07c fase 2)** — mergeado **#358** (`2593f03`).
- ✅ **Lenguaje de etapas en TALLER** — ya vive vía helper `nivelAEtapa()` (`src/compartido/lib/formalizacion.ts`): BRONCE→"Etapa inicial", PLATA→"En proceso de formalización", ORO→"Formalización consolidada". Dashboard taller, Mi recorrido y ProximoNivelCard ya lo usan.
- ✅ **Vidriera pública sin "X de 7" (3.10 → narrativa #4)** — implementado en **#403** (narrativa Etapa 1, en QA, sin mergear).
- ✅ **Lenguaje de ranking eliminado** ("Subí de nivel", "Sin verificar", "Ganá puntos") — grep en superficies de usuario = **0 ocurrencias**.

**Lo que REALMENTE falta** (chico): un par de fugas residuales de nivel crudo en la UI del taller + los refinamientos visuales diferidos de X-07b. Detalle en §6.

---

## 1. La colisión de nombres "Nivel 5" (aclarar antes de seguir)

Hay **dos "Nivel 5" distintos** que el framing del pedido mezcla:

| | Master V4 | Narrativa V4 |
|---|---|---|
| **Qué llama "Nivel 5"** | Aplicación **visual** (X-07 dashboards / X-08 listados / X-09 detalle) + integrar refactor narrativa 3.7-3.10 | **Copy / micro** (frases ancla, copy por rol, mensajes de estado, emails) — §1 línea 36 y §8 |
| **Estado** | ~85-90% hecho (ver §0) | Pendiente, lo trabaja **Sergio** en sub-bloques |
| **Dominio** | Técnico (Gerardo) | Narrativo (Sergio) |

📌 **Recomendación:** dejar de hablar de "Nivel 5" a secas. Usar **"cierre X-07/08/09"** para lo visual/técnico (este doc) y **"Nivel 5 copy"** para lo de Sergio. No son el mismo entregable.

---

## 2. Reconciliación master 3.7-3.10 ↔ narrativa V4 (quién gana)

Las decisiones del master que el pedido cita textualmente:

| Master | Qué dice | Narrativa V4 | ¿Contradicción? | Quién gana | Estado en código |
|---|---|---|---|---|---|
| **3.7** Showcase + acompañamiento (no ranking) | Eliminar de la UI "Nivel BRONCE/PLATA/ORO", "Subí de nivel", "Ganá puntos", "Sin verificar", "No puede cotizar". Reemplazar por "recorrido de formalización", "X de 7 requisitos", "Pendiente de validación"… | §2.7, §6: mismo principio (no-ranking, logros no obligaciones) | **No** — narrativa refuerza | Coinciden | ✅ Hecho (lenguaje limpio; helper `nivelAEtapa`) |
| **3.8** Niveles ocultos en UI, mantenidos para analítica | Bronce/Plata/Oro siguen en DB para ESTADO/OIT, NO se muestran al usuario | §6 (vidriera = resultado agregado, no proceso) | **No** | Coinciden | ✅ Casi — 1 fuga residual (§6 F-1) |
| **3.9** Etapas visibles con nombres nuevos | "Etapa inicial / En proceso de formalización / Formalización consolidada" | §3.2 umbrales (Registrado/Visible/Apto) — vocabulario distinto pero compatible | Parcial (vocabulario) | Conviven | ✅ `MAPA_ETAPAS` ya usa los nombres de 3.9 |
| **3.10** Vista del taller en directorio para marcas | **"X de 7 requisitos verificados" + tooltip VISIBLE en el directorio público** | §1.2 + diff **#4**: **QUITAR "X de 7" del público**; solo Etapa + ARCA. "X de 7" queda **privado** en Mi recorrido | **SÍ — única contradicción real** | **Narrativa V4 GANA** | ✅ Hecho en #403 (quita las 2 líneas públicas; conserva la privada) |

📌 **Única contradicción real = 3.10.** El master quería "X de 7" público; la narrativa lo protege (solo privado). Ya resuelto por #403. El resto del refactor 3.7-3.9 **no se contradice** — la narrativa lo extiende y el código ya lo refleja.

---

## 3. Qué del "refactor narrativa" ya hizo cada PR

| Pieza | PR | Estado |
|---|---|---|
| Paleta V4 a dashboards (font-serif H1/H2, tokens brand) | #347 (`2d914d6`) | ✅ merged |
| Ocultar niveles en ESTADO/ADMIN | #358 (`2593f03`) | ✅ merged |
| Helper `nivelAEtapa()` + uso en dashboard/recorrido/ProximoNivelCard | (pre-existente) | ✅ en develop |
| Quitar "X de 7" de vidriera pública (3.10 → #4) | #403 narrativa E1 | 🟠 en QA, sin mergear |
| Renombres+reorden tabs, h1 alineados | #403 narrativa E1 | 🟠 en QA |

**Riesgo de re-hacer:** **bajo**, salvo coordinación con #403. Cualquier spec nuevo de X-07/08/09 debe partir de develop **con #403 ya mergeado** para no pisar los renombres de tabs ni re-tocar las cards del directorio. Si se arranca antes, conflicto en `marca/directorio/page.tsx`, `(public)/directorio/page.tsx`, `institutional.ts`.

---

## 4. Estado actual de dashboards, listados y detalle

### Dashboards (X-07)
- **Taller** (`(taller)/taller/page.tsx`, 448L): dashboard diseñado — ProgressRing, grid de stats, secciones, `font-serif`, tokens brand. H1 "Bienvenido, {nombre}". Usa `nivelAEtapa()`.
- **Marca** (`(marca)/marca/page.tsx`, 120L): más simple (3 stats + 2 acciones + alerts), pero ya V4.
- **ESTADO** (`(estado)/estado/page.tsx`, 306L): 3 secciones temáticas con KPIs; niveles ya ocultos (#358).
**Conclusión X-07:** el "diseño aplicado" que pedía el master **ya está**. Quedan residuos V3 inline (~14 líneas, §6 B).

### Listados (X-08)
- Pedidos taller (`taller/pedidos/page.tsx`): grid de stats + lista de órdenes enlazables con `EmptyState`, badges, mini progress. Ya V4.
- Directorio / Explorar talleres: cards con ARCA, etapa; "X de 7" público removido por #403.
**Conclusión X-08:** patrón visual presente. El delta real es la **vitrina con info de marca** en `pedidos/disponibles` — que **es §1.4 de la narrativa, diferido**, no un spec visual.

### Detalle de pedido + Mi Formalización (X-09)
- Detalle pedido (`taller/pedidos/[id]/page.tsx`): Breadcrumbs + 2 secciones + `ActivityTimeline`. Ya V4.
- **Mi recorrido** (`taller/formalizacion/page.tsx`, 200L): H1 "Mi recorrido", ProgressRing, loop por `['BRONCE','PLATA','ORO']` que renderiza **`nivelAEtapa(nivel)`** como título (no el enum), "Etapa inicial / En proceso", ChecklistItems. El "X de 7" privado **se conserva** (correcto).
**Conclusión X-09:** ya usa lenguaje de etapas. Sin trabajo visual pendiente salgo de §1.4.

### Componentes de patrón visual — todos existen
`FilterPills`, `EmptyState`, `Breadcrumbs`, `StatCard`, `DataTable`, `Badge`, `BadgeArca`, `Skeleton`, `KpiCard`, `ProgressRing` — todos en `src/compartido/componentes/ui/`. **No hay que crear ninguno.**

---

## 5. Dependencias con §1.3 / §1.4 (diferidos de la narrativa)

| Sub-cambio narrativa | ¿Bloquea X-07/08/09? | Nota |
|---|---|---|
| **§1.3 Modelo B** (visibilidad por grupo del perfil productivo, requiere schema) | **No bloquea** el cierre visual ni el refactor de niveles. Sí toca "Mi taller/vidriera" cuando se haga. | Spec propio pendiente. |
| **§1.4 Vitrina info de marca** en `pedidos/disponibles` (requiere query/lógica) | **Es el verdadero "X-08/X-09 listado/detalle" que falta.** Lo que el master metía bajo "listados/detalle" hoy = esto. | **Recomendación:** NO crear un X-08 visual aparte; hacer §1.4 como su spec y dar por cubierto el "listado/detalle" del master. |

📌 X-09 (detalle) **no** depende del "lenguaje no estigmatizante" de §1.3 — ese ya está vía `nivelAEtapa()`. No hay bloqueo duro.

---

## 6. Lo que REALMENTE queda pendiente (el cierre)

### A. Fugas residuales de nivel crudo en UI de TALLER (3.8) — ~1-2h
- **F-1 (real):** `(taller)/taller/page.tsx` bloque **"Historial de nivel"** (líneas ~295-320):
  - Heading literal **"Historial de nivel"** (usa la palabra "nivel").
  - Línea ~313 renderiza **`{detalles.nivelAnterior} → {detalles.nivelNuevo}`** = muestra **"BRONCE → PLATA"** crudo al taller. **Viola 3.7/3.8.**
  - Fix: envolver con `nivelAEtapa()` y renombrar heading (p.ej. "Historial de tu recorrido").
- **F-2 (cosmético/dead code):** `(taller)/layout.tsx` pasa `userLevel` a `<UserSidebar>` (default 'Bronce'), pero `user-sidebar.tsx` **no lo renderiza** (post-F3 el sidebar solo tiene accesos personales). Prop muerta — limpiar o ignorar. Sin fuga visible.
- Verificar `proximo-nivel-card.tsx`/`sincronizar-nivel.tsx`: muestran **etapa** (`nivelAEtapa`), nombres internos OK.

### B. X-07b — refinamientos visuales diferidos (nunca se especificó ni mergeó) — ~3-4h, prioridad baja
Diferido explícitamente por X-07a §"NO incluye": **78 grays inline** (mapeo gray→ink-*), **serif en H3/eyebrows/subtítulos**, **public/auth pages**, **recharts** (verificar uso). Puro pulido cosmético, no narrativa. **Specs X-08/X-09 no existen** en `.claude/specs/`.

### C. Deuda de documentación
La **skill `niveles-formalizacion`** todavía instruye mostrar badges **bronce/plata/oro al usuario** en perfil/directorio/dashboard — **stale** vs master 3.7/3.8 y narrativa #4. Actualizar para que diga "etapa visible vía `nivelAEtapa`, nivel solo interno". (Anotar como deuda, no bloquea.)

---

## 7. Estimación realista (vs master)

| Ítem | Master decía | Realidad |
|---|---|---|
| X-07 dashboards | 6h | ✅ hecho (#347) → **0h** |
| X-08 listados | 4h | visual hecho; el delta real = **§1.4** (spec propio narrativa) |
| X-09 detalle + Mi Formalización | 4h | ✅ etapa-language hecho → **0h** salvo §1.4 |
| **Cierre nuevo** | — | **A. fugas nivel ~1-2h** + **B. X-07b refinamientos ~3-4h (opcional)** |

**Total realista del "cierre X-07/08/09": ~1-2h (crítico) + 3-4h (cosmético opcional).** No 14h.

---

## 8. Estrategia de implementación recomendada

1. **Mergear #403 primero** (narrativa E1) — desbloquea y evita conflictos.
2. **Spec chico "X-cierre-niveles"** (~1-2h): arreglar F-1 (Historial de nivel → etapa), limpiar F-2, actualizar skill `niveles-formalizacion` (deuda C). **Esto cierra el refactor 3.7-3.10 al 100%.**
3. **§1.4 (vitrina info marca)** como su propio spec narrativa = cubre el "listado/detalle" del master. **No** crear un X-08 visual separado.
4. **X-07b** (refinamientos grays/serif/public-auth): backlog cosmético, post-piloto o cuando haya hueco. Bajo impacto OIT (los dashboards ya se ven V4).
5. **NO** re-hacer X-07/X-09 como specs de 6h+4h — el master quedó viejo ahí; el código ya los cumple.

---

## 9. Decisiones de scope — RESUELTAS (Gerardo, 2026-06-08)

| # | Pregunta original | Decisión |
|---|---|---|
| 1 | ¿Re-scope 14h → ~2-5h? ¿Archivar X-07/X-09 del master? | **SÍ.** Cierre niveles ~2-5h. X-07/X-09 archivados como cumplidos. |
| 2 | F-1 (Historial "BRONCE → PLATA" crudo): ¿arreglar ya o en el cierre? | **En el cierre niveles** (no fragmentar, toca `taller/page.tsx`). |
| 3 | X-08 "listados": ¿es §1.4 y no un spec visual nuevo? | **SÍ — es §1.4** (vitrina info marca). X-08 del master archivado como cubierto. |
| 4 | X-07b cosmético: ¿V4/piloto o backlog? | **Backlog post-piloto** → `DEUDA_TECNICA.md` **F-04**. |
| 5 | Skill `niveles-formalizacion` stale: ¿en el cierre o T-06 aparte? | **En el cierre niveles** (no T-06). |

Ver el resumen ejecutable en "Decisiones cerradas" (arriba). El próximo entregable concreto es el spec **"cierre niveles"** (F-1 + skill, ~2h).

---

## 10. Riesgos

| # | Riesgo | Mitigación |
|---|---|---|
| R-1 | Arrancar antes de mergear #403 → conflictos en directorio/tabs | ✅ Resuelto: #403 mergeado a develop (`18efed4`, 2026-06-08). Gate levantado. |
| R-2 | Re-implementar X-07/X-09 "por seguir el master" duplicando lo hecho (#347/#358 + `nivelAEtapa`) | Este discovery lo documenta; el master 3.14 ya decía "se INTEGRA en X-07/08/09" y eso ya ocurrió |
| R-3 | Confundir "Nivel 5 visual" (técnico, casi listo) con "Nivel 5 copy" (Sergio, pendiente) | §1: nombrarlos distinto |
| R-4 | Skill `niveles-formalizacion` stale induce a re-poner badges bronce/plata/oro al usuario | Actualizar skill (deuda C / decisión §9.5) |
| R-5 | §1.4 toca `pedidos/disponibles` igual que un eventual X-08 visual → doble trabajo | Unificar: §1.4 ES el listado/detalle del master (§5, §8.3) |

---

**Fin del discovery.** No se tocó código ni schema. Decisiones §9 **cerradas**. Próximos entregables: (1) spec **"cierre niveles"** (F-1 + skill `niveles-formalizacion`, ~2h); (2) **§1.4** vitrina info marca (spec narrativa propio); (3) **F-04** cosmético en backlog post-piloto.

---

## 11. Cierre niveles — EJECUTADO (2026-06-11)

Implementado en `fix/cierre-niveles-f1` (scope: SOLO F-1 + skill stale, según decisiones §9.2 y §9.5).

- ✅ **F-1 arreglada:** `(taller)/taller/page.tsx`, bloque "Historial de nivel" → renombrado a
  **"Historial de tu recorrido"**; `{nivelAnterior} → {nivelNuevo}` ahora envuelve ambos extremos con
  **`nivelAEtapa()`**. El taller ya no ve "BRONCE → PLATA" crudo.
- ✅ **Barrido de seguridad** (`grep BRONCE|PLATA|ORO` en `src/app` + componentes): **única fuga
  user-facing era F-1.** El resto son: lógica interna (`taller.nivel ?? 'BRONCE'` → `nivelAEtapa`),
  `value=` de filtros, vistas de ESTADO/ADMIN (analítica, decisión 3.8) y el propio helper. La vista de
  detalle de ADMIN (`admin/talleres/[id]`) muestra el enum crudo en su log de actividad interna — es
  **staff/analítica, no usuario**, por eso queda fuera del scope de F-1 (anotable como pulido interno).
- ✅ **Skill `niveles-formalizacion` actualizada** (deuda C / decisión §9.5): banner de regla de
  presentación arriba (niveles = internos; al usuario siempre etapa vía `nivelAEtapa`; sin badges de
  medalla; sin lenguaje de ranking) + sección "Visualización" reescrita (antes instruía badges
  bronze/silver/gold al usuario). Referencia a master 3.7-3.10 y Narrativa V4.
- ✅ **Test de regresión:** `tests/e2e/cierre-niveles-f1.spec.ts` — el dashboard del taller no expone
  `\b(BRONCE|PLATA|ORO)\b`. Seed: a `tallerOro` (Carlos Mendoza) se le añadió un 2º paso de recorrido
  (BRONCE→PLATA→ORO) para que renderice el bloque "Historial de tu recorrido" (requiere `length > 1`) y
  el test cubra la superficie exacta de F-1.

**F-2 (prop muerta `userLevel` en `(taller)/layout.tsx` → `UserSidebar`):** sin fuga visible (no se
renderiza). Fuera del scope acordado (SOLO F-1) → se deja como está. **X-07b cosmético = F-04 backlog.**
**§1.4 vitrina info marca = spec narrativa propio.** Con esto **X-07/X-09 del master quedan archivados
como cumplidos**; X-08 cubierto por §1.4.
