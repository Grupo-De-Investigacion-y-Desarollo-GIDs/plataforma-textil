# Discovery — Bloque B (Mobile / Responsive)

**Fecha:** 2026-06-18
**Tipo:** Discovery (medición de gap real vs estimación del master). **NO implementa.**
**Branch base:** develop @ `615acdc`
**Autor:** Claude (discovery), revisa Gerardo.

---

## TL;DR

| | Master (V4_BACKLOG Bloque B) | Gap REAL medido |
|---|---|---|
| **M-01** Auditoría mobile (30+ pantallas) | 6h | **~0h** — esta discovery ES la auditoría |
| **M-02** Reactivar E2E mobile | 4h | **~4-5h** (se mantiene) |
| **M-03** Fixes de UX mobile | 12h | **~4-6h** (la base ya es responsive) |
| **TOTAL** | **~22h** | **~8-11h** |

**El master sobreestima ~2x, igual que en Nivel 5 y W-A.** Razón: el master asume que mobile está "sin tocar", pero la base de componentes (header, sidebar, footer, modal, cards, breadcrumbs, notif-bell) ya se construyó responsive a lo largo de V3/V4. Lo que queda son **fixes puntuales en pantallas concretas + reactivar los tests**, no una reescritura.

**NINGÚN bloqueo de piloto duro:** casi nada está técnicamente "roto". El flujo del taller en celular **funciona**; hay fricción (un wizard largo e incómodo, un par de grids apretados), no pantallas inutilizables.

**Autonomía:** 100%. No depende de Sergio ni de OIT (a diferencia del rediseño visual, que sí).

---

## 1. Estado actual del responsive

**Veredicto: existe PARCIALMENTE pero con base SÓLIDA (~75-85% de los componentes base ya son mobile-ready). NO es "casi nada".**

### Sistema de breakpoints
- Tailwind v4. Se usan `sm:` / `md:` / `lg:` pero **de forma no totalmente sistemática**: conviven mobile-first (`grid-cols-1 md:grid-cols-3`) con desktop-first (`hidden lg:flex`). `xl:` casi no se usa.
- Conteo aproximado en `src/`: `lg:` ~21, `sm:` ~16, `md:` ~7 (sobre los componentes base). El resto de las pantallas hereda responsividad de los componentes compartidos.
- **Implicancia:** no hay que "instaurar" un sistema de breakpoints; ya existe. Hay que **rellenar los huecos** (grids sin prefijo) y pulir 2-3 pantallas.

### Componentes base compartidos — `src/compartido/componentes/`

| Componente | Estado mobile | Nota |
|---|---|---|
| `layout/header.tsx` | ✅ OK | Hamburguesa `lg:hidden` (l.133); tabs con `overflow-x-auto` (l.235) |
| `layout/user-sidebar.tsx` | ✅ Excelente | Drawer mobile (`fixed lg:static`, `-translate-x-full`→`translate-x-0`, l.142-148) |
| `layout/header-public.tsx` | 🟡 Parcial | **Sin hamburguesa**; nav `hidden lg:flex` desaparece en mobile (l.40). Nav es secundaria → degradado, no roto |
| `layout/footer.tsx` | ✅ Excelente | Mobile-first `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |
| `layout/notificaciones-bell.tsx` | ✅ Excelente | `max-sm:w-[calc(100vw-2rem)]` |
| `ui/modal.tsx` | ✅ OK | `w-full mx-4` + `max-w-*`, scroll interno |
| `ui/breadcrumbs.tsx` | ✅ Excelente | Reducción inteligente `sm:hidden` / `hidden sm:flex` |
| `ui/data-table.tsx` | 🟡 Parcial | `overflow-x-auto` (l.59) funciona pero UX comprimida; sin vista de cards |
| `ui/button` `input` `card` `badge` `empty-state` `kpi-card` `skeleton` | ✅ OK | `w-full`, sizes escalables, sin anchos fijos |

**No se encontraron anti-patrones graves** (`w-[NNNpx]` grandes, grids sin prefijo en componentes base, tablas sin scroll). Lo que hay son huecos puntuales en páginas concretas (ver §2).

---

## 2. Pantallas críticas del flujo del taller (uso desde celular)

Estas son las que bloquean el piloto si fallan. **Conclusión: 3 de 5 andan bien; 2 tienen fricción, ninguna está inutilizable.**

| # | Pantalla | Archivo | Estado | Detalle |
|---|---|---|---|---|
| 1 | **Login** | `(auth)/login/page.tsx` | 🟢 Anda | Card `max-w-md` OK. Único roce: form magic-link `flex gap-2` sin wrap (l.50) → input + botón apretados en 320px |
| 2 | **Registro** | `(auth)/registro/page.tsx` | 🟢 OK | Steps `space-y-4`, role select `grid-cols-1`, botones nav `flex gap-3` — todo stackea bien |
| 3 | **Dashboard taller** | `(taller)/taller/page.tsx` | 🟡 Menor | **Bug real (l.273): `grid grid-cols-2 gap-4` sin breakpoint** → 4 KPIs con `text-3xl` apretados en 320px. Debería ser `grid-cols-1 sm:grid-cols-2`. (l.239 y l.329 sí son responsive) |
| 4 | **Wizard perfil productivo (14 pasos)** | `(taller)/taller/perfil/completar/page.tsx` | 🔴 **Mayor riesgo** | Usable pero incómodo. Detalle abajo ↓ |
| 5 | **Ver pedidos disponibles** | `(taller)/taller/pedidos/disponibles/page.tsx` | 🟢 OK | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (l.82), banner `flex-col sm:flex-row` |
| 6 | **Crear cotización** | (flujo de cotización taller) | ⚪ A verificar | No auditado en profundidad en esta discovery; el patrón de forms del proyecto es responsive. Verificar en M-01b antes de cerrar |

### El wizard de 14 pasos — detalle (el item que más importa)

`(taller)/taller/perfil/completar/page.tsx`. **No está "roto" (no crashea, se puede completar), pero la UX en 320-375px es mala** y un taller podría abandonar:

- **l.258** — indicador de 14 pasos en fila con `overflow-x-auto`: funciona con scroll, pero apretado.
- **l.332** — fila de 5 botones de tamaño de equipo (`flex gap-2`, cada uno `flex-1`): en 320px quedan estrechos, textos como "11-20"/"+20" cuesta leer. Debería `grid-cols-2 md:grid-cols-5` o `flex-wrap`.
- **l.706** — navegación Atrás/Siguiente `flex justify-between` **sin sticky footer**: en un wizard largo con scroll vertical, los botones quedan lejos al final de cada paso.
- Grids de máquinas (l.308) y roles (l.342/626): `grid-cols-2 sm:grid-cols-3` — aceptables, apretados en 320px.

**Es el único item que justifica trabajo real de UX mobile (no solo un fix de clase).**

---

## 3. Patrones de apalancamiento

**Para el flujo crítico del taller, el apalancamiento YA está cobrado:** header (hamburguesa), sidebar (drawer) y cards/grids responsive ya resuelven la mayoría de las pantallas del taller de una. Por eso quedan tan pocos fixes.

Apalancamiento restante, por relevancia para el piloto:

1. **`ui/data-table.tsx`** — vista de cards en mobile. **PERO se usa en 6 páginas, TODAS de `(admin)`** (certificados, marcas, pedidos, procesos, talleres, usuarios). Admin es desktop-primary → **este apalancamiento NO toca el flujo taller-en-celular**. Es IMPORTANTE para pulido admin/estado, no CRÍTICO para el piloto.
2. **`header-public.tsx`** — agregar menú mobile (hamburguesa). Toca toda la cara pública. IMPORTANTE (capta marcas/talleres que llegan desde el celular), nav actual es secundaria así que no bloquea.
3. **9 usos de `<table>` crudo** fuera de DataTable (mayormente admin/estado) — envolver en `overflow-x-auto` donde falte. MENOR.

---

## 4. Inventario por criticidad

### CRÍTICO (flujo taller en celular — toca el piloto)
- Wizard `completar` mobile UX: sticky footer nav + `flex-wrap`/grid en fila de botones (l.332) + revisar pasos largos. **~2.5-3.5h** (único trabajo de UX real).
- Dashboard taller KPI grid `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` (l.273). **~10 min.**
- Login magic-link `flex-wrap` / `flex-col sm:flex-row` (l.50). **~10 min.**
- Verificar "Crear cotización" en mobile (no auditado a fondo). **~30 min verificación + fix si hace falta.**

### IMPORTANTE (marca/estado/público en mobile — menos crítico, esos usan más desktop)
- `header-public.tsx`: menú hamburguesa mobile. **~1.5-2h.**
- `data-table.tsx`: vista cards mobile (beneficia 6 páginas admin). **~2-3h** si se quiere; **OPCIONAL para el piloto.**

### MENOR (pulido)
- `<table>` crudos sin `overflow-x-auto`. **~1h.**
- Header tabs: dropdown/collapse en vez de scroll horizontal (cosmético). **~1h.**

---

## 5. Estado de los tests E2E mobile (M-02)

- `playwright.config.ts` (l.27-39): solo `setup` + `chromium` (`Desktop Chrome`). **NO hay proyectos mobile** — V3 los quitó limpio. Único vestigio: comentario `// Mobile testing se agrega en V4 (UX-04)` (l.38). Sin `devices['iPhone...']` / `devices['Pixel...']`.
- Tests reales en `tests/e2e/` (~32 specs), con `auth.setup.ts` (storageState) y `_helpers/`. Locators mayormente seguros (`getByRole`, scoped). **Ninguno asume viewport mobile.**
- **Reactivar = (a)** agregar 2 projects (`mobile-chrome` Pixel 5, `mobile-safari` iPhone 12) con `dependencies:['setup']` (~10 min) **+ (b)** ajustar los tests que buscan elementos ocultos en mobile (nav header `hidden lg:flex`, tabs) — ~5-10 specs (~2-3h) **+ (c)** costo CI +30-40% (3 browsers).
- **Estimación M-02: ~4-5h** (la del master, 4h, es realista).
- Ojo (skill `playwright-e2e`): los locators de header/nav fallarán en mobile porque esos elementos están ocultos por diseño — habrá que scopear a `main` o ajustar asserts, no es bug de la app.

---

## 6. Gap real + estimación ajustada

| Tramo | Master | Real | Por qué |
|---|---|---|---|
| Auditoría (M-01) | 6h | **~0h** | Hecha en esta discovery. Queda solo verificar "crear cotización" (~30 min) |
| Fixes UX (M-03) | 12h | **~4-6h** | Base ya responsive; solo wizard (3h) + 2 fixes de clase (20 min) + opcionales (header-public 2h) |
| E2E mobile (M-02) | 4h | **~4-5h** | Se mantiene |
| **TOTAL** | **~22h** | **~8-11h** | Sobreestimación ~2x (patrón conocido) |

Rango: **~8h** si se hace solo lo CRÍTICO + M-02; **~11h** sumando header-public y data-table cards.

---

## 7. Orden de ataque propuesto

1. **Fixes críticos del flujo taller** (~4h): wizard mobile UX (sticky footer + wrap botones), dashboard KPI grid, login magic-link, verificar crear-cotización. → Esto es lo que destraba el piloto en celular.
2. **Reactivar E2E mobile** (M-02, ~4-5h): agregar projects + ajustar locators. → Bloquea regresiones de lo anterior y deja red de seguridad.
3. **Opcionales / pulido** (~3-5h, post-MVP o si sobra tiempo): header-public hamburguesa, data-table vista cards (admin), `<table>` crudos.

**Justificación:** 1 y 2 son el verdadero Bloque B para el piloto (~8-9h). El paso 3 es polish que no bloquea talleres en celular (data-table es admin, header-public nav es secundaria).

**Relación con el rediseño visual:** el master nota que mobile "debería hacerse sobre la nueva UI para no auditar dos veces". Pero el rediseño depende de OIT/feedback piloto (no autónomo) y no tiene fecha. Los fixes críticos (1) son cambios de layout/clases que sobreviven a un rediseño de estilos — conviene hacerlos ya y no rehacer el wizard dos veces. La reactivación E2E (2) también es independiente del estilo.

---

## 8. Riesgos

- **"Crear cotización" no auditado a fondo** — único hueco de la auditoría; verificar antes de dar Bloque B por cerrado (~30 min).
- **E2E mobile puede destapar flakies** — los tests actuales no corren en viewport chico; al activarlos pueden saltar asserts de elementos ocultos por diseño (no bugs de app). Presupuestar tiempo de ajuste de locators (ya contado en M-02).
- **Tentación de gold-plating** — data-table cards y header-public son lindos pero NO bloquean el piloto (admin/nav secundaria). Mantenerlos como opcionales para no inflar el bloque de vuelta a 22h.
- **Touch targets** — varios botones de paginación/acciones son <44px; aceptable pero a vigilar si el piloto reporta fricción táctil. No bloqueante.

---

## 9. ¿Algo que necesite decisión de Gerardo?

1. **¿Alcance del Bloque B = solo CRÍTICO + E2E (~8-9h), o incluye opcionales (header-public + data-table cards, ~11h)?** Recomendación: cerrar el bloque con lo crítico + E2E; mover data-table cards y header-public a pulido post-MVP.
2. **¿Antes o después del rediseño visual?** Recomendación: los fixes críticos (wizard/dashboard/login) **ya**, porque son layout (no estilo) y el rediseño no tiene fecha (depende de OIT).
3. **¿Convertir esta discovery en specs M-01b/M-03 implementables?** Si Gerardo da OK, el siguiente paso es escribir el spec de implementación con las prescripciones por archivo (formato spec PDT).
