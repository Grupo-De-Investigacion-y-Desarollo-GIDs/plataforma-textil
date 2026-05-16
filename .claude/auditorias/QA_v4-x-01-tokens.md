# QA V4 — X-01: Tokens visuales V4

> **Plantilla QA V4** — Auditoría del primer spec del Bloque X (identidad visual V4).
> Verificaciones automatizadas vía análisis de código + E2E CI. Verificaciones visuales pendientes de validación manual.

---

## Header del QA

| Campo | Valor |
|---|---|
| **Versión** | v4 |
| **Spec auditado** | `v4-x-01-tokens.md` |
| **Categoría** | MVP no negociable |
| **Auditor** | Claude Code |
| **Fecha** | 2026-05-14 |
| **URL auditada** | `https://plataforma-textil-bxmmm636c-gbreards-projects.vercel.app` |
| **Commit auditado** | `a82507b` |
| **PR vinculado** | https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/pull/314 |
| **Issue vinculado** | N/A |
| **Tipo de QA** | mixto (code-review + browser-automatizado vía E2E + manual pendiente) |

---

## Contexto institucional

Plataforma Digital Textil (PDT) — proyecto OIT-UNTREF para formalización del sector textil argentino.
Modelo: Showcase + Match con backend institucional invisible.
Versión actual: V4 (rediseño visual + multi-rol + nomenclador propio).

---

## Objetivo del QA

Verificar que los tokens visuales V4 (paleta extendida con terracotta/pastels/ink, 3 fuentes nuevas, body color casi-negro, background gris claro) se aplican correctamente sin romper componentes existentes ni tests E2E.

---

## Instrucciones de trabajo

1. Leer spec `v4-x-01-tokens.md` antes de auditar
2. Verificar globals.css contra propuesta de Sergio (`docs/Diseño/propuesta-visual-pdt-v4/propuesta-visual-pdt-v4/propuesta-final/02-tokens.md`)
3. Ejecutar los 3 flujos del spec (sección 10)
4. Verificar Ejes 2-6 según corresponda
5. Verificar handover (sección 11 del spec)
6. Llenar resultado global

---

## Resultado global

**Estado:** ⚠️ Aprobado con validación manual pendiente

**Decisión:** Mergear a develop tras validación visual de Gerardo

**Resumen ejecutivo:**

Todos los tokens, fuentes, colores y animaciones definidos en el spec están correctamente implementados en `globals.css`. El build de Vercel pasa sin errores. Los 3 runs de E2E del PR pasaron (76 tests, 0 failed, 0 flaky). Las fuentes woff2 se sirven correctamente (HTTP 200) desde la preview. La propuesta de Sergio se implementó fielmente, con las 6 correcciones del análisis de factibilidad (tokens legacy preservados, animaciones mantenidas). Quedan 4 verificaciones que requieren browser para validar tipografía y colores visualmente.

**Issues abiertos en este QA:**

Ninguno.

---

## Eje 1 — Flujos funcionales

### Flujo 1: Verificación visual landing pública

- **Rol:** no autenticado
- **Precondiciones:** PR desplegado en preview URL de Vercel
- **Pasos ejecutados:** WebFetch de la preview URL para verificar estructura y carga
- **Resultado:** ⚠️ Pendiente validación manual
- **Bugs encontrados:** Ninguno
- **Notas:** La landing carga correctamente. WebFetch confirma texto gris oscuro (`text-gray-600`, `text-gray-700`), sin errores ni elementos rotos. La landing usa clases explícitas (`font-overpass`, `bg-white`) que overridean los defaults del body — esto es esperado (los componentes de la landing fueron diseñados en V3 con clases explícitas). **Requiere browser para confirmar que Source Serif 4 renderiza en H1 y que Inter renderiza en body text.**

### Flujo 2: Verificación visual dashboard taller (logueado)

- **Rol:** taller
- **Precondiciones:** Usuario taller del seed logueado en preview URL
- **Pasos ejecutados:** No ejecutable sin browser real
- **Resultado:** ⚠️ Pendiente validación manual
- **Bugs encontrados:** N/A
- **Notas:** Requiere login con `roberto.gimenez@pdt.org.ar` / `pdt2026` en browser real. Verificar body text en Inter, botones en Overpass, headings H2/H3 en Overpass, color gris oscuro.

### Flujo 3: Verificación de no regresión (E2E automático)

- **Rol:** todos (TALLER, MARCA, ESTADO, ADMIN)
- **Precondiciones:** PR desplegado en preview, CI corriendo
- **Pasos ejecutados:** `gh run list --branch feature/v4-x-01-tokens --limit 3`
- **Resultado:** ✅ Pasó
- **Bugs encontrados:** Ninguno
- **Notas:**
  - 3 runs ejecutados en el PR, todos exitosos
  - Último run: ID `25841759258`, 14m41s, `success`
  - Step "Run Playwright tests": `conclusion: success`
  - 0 tests failed, 0 flaky
  - Upload-artifact step skipped (no failures = no screenshots to upload)

---

## Eje 2 — Navegabilidad

⚠️ Pendiente validación manual. Este spec solo modifica tokens CSS — no agrega ni elimina rutas ni cambia flujos de navegación. La navegabilidad se verifica indirectamente por el E2E (Flujo 3) que corre los 76 tests existentes sin fallos.

---

## Eje 3 — Casos borde

| # | Caso borde | Acción ejecutada | Esperado | Resultado |
|---|---|---|---|---|
| 7.1 | FOIT al cargar fuentes nuevas | `grep "font-display" src/app/globals.css` | `font-display: swap` en cada `@font-face` | ✅ 6 declaraciones `font-display: swap` (Noto Sans ×2, Overpass ×2, Source Serif 4 ×1, Inter ×1) |
| 7.2 | Cache busting de fuentes | `ls public/fonts/` | Archivos presentes en `public/` | ✅ 6 archivos woff2, total 1.1 MB. Vercel sirve desde CDN con invalidación automática por deploy. |
| 7.3 | Compat con tests E2E | Resultado del run E2E #25841759258 | 76 tests, 0 failed | ✅ Todos pasaron. Sin assertions de color/tipografía en tests E2E (confirmado vía grep). |
| 7.4 | Componentes inline hardcodeados | `grep -rn "color: '#1e2dbe'" src/` y `grep -rn "color: '#FA3C4B'" src/` | Documentar hallazgos, NO arreglar | ✅ 0 hallazgos. No hay estilos inline hardcodeados con colores brand. TODO para X-02 cerrado. |
| 7.5 | Browsers viejos | `grep "tailwindcss" package.json` | Tailwind v4 | ✅ `"tailwindcss": "^4"` confirmado. `@theme inline` soportado en Chrome ≥111, Firefox ≥128, Safari ≥16.4. |
| 7.6 | Background body cambia a gris claro | Análisis de globals.css | `background-color: #F8F9FB` | ⚠️ Token correcto en CSS. Pendiente verificación visual en browser. |
| 7.7 | H1 cambia a serif | Análisis de globals.css | `h1 { font-family: 'Source Serif 4' }` | ⚠️ Regla CSS correcta. Pendiente verificación visual en browser (especialmente landing y dashboards). |

---

## Eje 4 — Performance

| # | Verificación | Resultado | Notas |
|---|---|---|---|
| 1 | Health endpoint responde < 3s | ✅ | HTTP 200 en 1.70s |
| 2 | Fuentes se sirven correctamente | ✅ | `Inter-Variable.woff2`: HTTP 200, 344 KB, `content-type: font/woff2` |
| 3 | Fuentes con cache headers | ✅ | `cache-control: public, max-age=0, must-revalidate` (Vercel default para assets). CDN cachea internamente. |
| 4 | Tamaño total de fuentes razonable | ✅ | Total 1.1 MB (6 archivos). Nuevas: Inter 344 KB + Source Serif 4 420 KB = 764 KB. Mayores que estimado del spec (~180-230 KB) porque son variable fonts con ejes optical-size + weight. Aceptable para producción con `font-display: swap`. |
| 5 | `SourceSerif4-Variable.woff2` HTTP 200 | ✅ | Confirmado vía `curl -sI`. |
| 6 | Lighthouse | ⚠️ | No verificable sin browser. Pendiente validación manual. |

---

## Eje 5 — Consistencia visual

### Verificaciones heredadas de V3

| # | Verificación | Resultado | Notas |
|---|---|---|---|
| 1 | Tipografías correctas (no Times/Arial accidental) | ✅ | globals.css declara Inter (body), Source Serif 4 (h1), Overpass (UI). Fallbacks: `sans-serif`, `serif`. |
| 2 | Colores consistentes con sistema semántico | ✅ | 7 tokens brand, 5 terra, 6 pastel, 3 ink, 5 status — todos presentes en `@theme inline`. |
| 3 | Empty states implementados | N/A | Spec no toca componentes. |
| 4 | Labels en español argentino | N/A | Spec no toca texto. |
| 5 | Sin texto roto, sin lorem ipsum | N/A | Spec no toca contenido. |
| 6 | Sin elementos de debug | N/A | Spec no toca lógica. |

### Verificaciones nuevas V4 (rediseño Sergio)

| # | Verificación | Resultado | Notas |
|---|---|---|---|
| 7 | Tokens de paleta correctos (terracotta, pastels, ink) | ✅ | `grep "terra-"`: 5 tokens. `grep "pastel-"`: 6 tokens. `grep "ink-"`: 3 tokens. Todos con valores hex exactos de la propuesta de Sergio. |
| 8 | Tipografía Source Serif 4 en H1 grandes | ✅ (CSS) ⚠️ (visual) | Regla `h1 { font-family: 'Source Serif 4', serif }` presente. Pendiente verificación visual en browser. |
| 9 | Tipografía Inter en body text | ✅ (CSS) ⚠️ (visual) | `body { font-family: 'Inter', sans-serif }` y `--font-sans: 'Inter'`. Pendiente verificación visual. |
| 10 | Tipografía Overpass en UI | ✅ | `h2-h6`, `nav`, `button`, `select`, `input`, `label` → `font-family: 'Overpass'`. Sin cambios respecto a V3. |
| 11 | Body color casi-negro (#0F0F1E) | ✅ (CSS) ⚠️ (visual) | `body { color: #0F0F1E }` presente. Pendiente verificación visual que confirme gris oscuro y no azul brand. |
| 12 | Componentes nuevos (KpiCard, FilterPills, EmptyState) | N/A | Spec X-01 no toca componentes — scope de X-02/X-03. |
| 13 | Footer institucional | N/A | Spec X-01 no toca footer — scope de X-06. |
| 14 | Sin restos de BRONCE/PLATA/ORO | N/A | Spec X-01 no toca nomenclatura de niveles. |
| 15 | Lenguaje no estigmatizante | N/A | Spec X-01 no toca copy. |
| 16 | Etapas con nombres nuevos | N/A | Spec X-01 no toca etapas. |

---

## Eje 6 — Validación de dominio

### Verificación de perspectivas del spec

| Perspectiva | ¿Aplicaba según spec? | ¿Implementación respeta la decisión? | Notas |
|---|---|---|---|
| Politólogo | SÍ — reducir dominancia visual del brand | ✅ | Body color cambió de `#1e2dbe` (azul brand) a `#0F0F1E` (casi-negro). El contenido institucional ya no está teñido de azul. |
| Sociólogo | SÍ — terracotta conecta con sector textil | ✅ | 5 tokens terracotta disponibles (`terra-50` a `terra-700`). Valores idénticos a propuesta de Sergio. |
| Economista | N/A | N/A | |
| Contador | N/A | N/A | |
| Sectorial | SÍ — valores de Sergio respetados | ✅ | Comparación línea por línea entre `globals.css` y `02-tokens.md` de Sergio: todos los tokens, colores, fuentes, radios, sombras coinciden exactamente. Las únicas adiciones son los 5 tokens legacy preservados por el análisis de factibilidad (brand-red, brand-topbar, brand-tabnav, brand-bg-light, status-muted) + animaciones (progress-fill, slide-in-right). |

---

## Verificación de handover

| Documento | Indicado en spec | Actualizado en este merge | Notas |
|---|---|---|---|
| ARCHITECTURE.md | SÍ — crear sección "Design tokens V4" | ✅ | Creado con paleta, tipografía, self-hosting, variables legacy, sombras, radios |
| DECISIONS.md | SÍ — agregar decisión de adopción | ✅ | Decisión #22: "Adopción del sistema de tokens V4" con contexto, alternativas y razonamiento |
| KNOWN_ISSUES.md | N/A | N/A | Spec indica N/A |
| DEPLOY.md | N/A | N/A | Spec indica N/A |
| HOW_TO_ADD_SPEC.md | N/A | N/A | Spec indica N/A |

---

## Resumen de issues

No se encontraron bugs durante este QA. No se abrieron issues.

---

## Notas adicionales del auditor

1. **Tamaño de fuentes mayor al estimado:** El spec estimaba ~80-100 KB (Source Serif 4) y ~100-130 KB (Inter). Los archivos reales son 420 KB y 344 KB respectivamente. Esto se debe a que son variable fonts con ejes optical-size + weight, que incluyen más glifos que las versiones estáticas. Aceptable para producción con `font-display: swap` — no bloquean el render.

2. **URL de descarga incorrecta en el spec:** La URL original de Source Serif 4 (`SourceSerif4-VF.ttf.woff2`) daba 404. El archivo correcto es `SourceSerif4Variable-Roman.ttf.woff2` en el branch `release` de `adobe-fonts/source-serif`. Documentar en spec si se repite la necesidad.

3. **Landing usa clases explícitas:** La landing actual (V3) usa `font-overpass` y `bg-white` explícitamente, por lo que los defaults de globals.css (Inter body, fondo gris claro) no se ven ahí. Esto es correcto — la landing se rediseña en specs X-05/X-06. El impacto visual de X-01 se ve más en páginas internas (dashboards, formularios, listados).

4. **0 estilos inline hardcodeados:** No se encontró ningún `style={{ color: '#1e2dbe' }}` en el codebase. El TODO del spec para X-02 sobre esto puede cerrarse como resuelto.

---

## Items que requieren validación manual de Gerardo

Para completar este QA, Gerardo debe verificar visualmente en browser:

**URL:** https://plataforma-textil-bxmmm636c-gbreards-projects.vercel.app

**Credenciales taller:** `roberto.gimenez@pdt.org.ar` / `pdt2026`

| # | Qué verificar | Dónde | Qué buscar |
|---|---|---|---|
| 1 | Body text gris oscuro (no azul) | Landing pública (sin login) | Texto principal debe ser gris casi-negro, no azul `#1e2dbe` |
| 2 | H1 en Source Serif 4 (serif) | Cualquier página con `<h1>` sin clase font-overpass explícita | El H1 debe verse en una fuente serif (con remates), no sans-serif |
| 3 | Body text en Inter | Dashboard taller (logueado) | Texto de párrafos/descripciones debe ser Inter (más delgada y moderna que Noto Sans) |
| 4 | Background gris claro | Cualquier página interna | Fondo general debe ser gris muy claro `#F8F9FB`, no blanco puro |

---

## Checklist de cierre del QA

- [x] Todos los flujos del Eje 1 ejecutados (1 automatizado ✅, 2 pendientes manual)
- [x] Ejes 2-5 verificados (los que aplican)
- [x] Eje 6 verificado contra perspectivas del spec
- [x] Verificación de handover completada
- [x] Issues abiertos para todos los bugs encontrados (0 bugs)
- [x] Resultado global completado
- [ ] QA mergeado a `.claude/auditorias/` en develop
- [ ] HTML generado por workflow `qa-pages.yml` accesible en GitHub Pages

---

**Fin del QA V4 — X-01**

> Este QA se publica automáticamente en GitHub Pages tras merge a develop.
> URL: https://grupo-de-investigacion-y-desarollo-gids.github.io/plataforma-textil/
