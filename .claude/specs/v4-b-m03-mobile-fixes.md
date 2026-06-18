# Spec M-03 — Fixes mobile del flujo crítico del taller

**Deriva de:** `v4-b-mobile-discovery.md` (Bloque B, §4 CRÍTICO).
**Alcance (decisión Gerardo):** SOLO bloque CRÍTICO + (en PASO SIGUIENTE) E2E mobile. Opcionales (header-public hamburguesa, data-table cards) → post-MVP.
**Momento (decisión Gerardo):** ahora, antes del rediseño visual. Estos son fixes de **layout** (breakpoints, wrap, sticky), sobreviven a un rediseño de estilos.
**Regla dura:** NO tocar colores / tipografía / identidad visual. Solo que funcione bien en pantalla chica (320 / 375 / 414px).
**Branch:** `feature/m03-mobile-flujo-taller`.

> **ESTADO: ✅ HECHO — mergeado a `develop` en PR #431 (squash `bafcc2a`).** FIX 1a / 1b / 2 / 3 implementados; FIX 4 verificado sin cambios. Los 4 verificados visualmente en preview de Vercel (Playwright, viewports 320/375/414). Verde unit+e2e+Vercel.
>
> **🟢 BLOQUE B CRÍTICO — CERRADO.** Fixes de layout (#431 `bafcc2a`) + red de seguridad E2E mobile (#433 `b834835`: projects `mobile-chrome` 393px + `mobile-small` 320px, 8 tests que protegen cada fix; desktop intacto en 134 tests). Verde unit+e2e+Vercel en develop.
> **Pendiente del Bloque B = solo opcionales post-MVP:** header-public hamburguesa, data-table cards (vista mobile). NO bloquean el piloto.
> **Hallazgo abierto (no #431):** ~17px de desborde horizontal en `/taller` a 320px (contenedor `fixed` de toasts) → ver `DEUDA_TECNICA.md` F-05.

---

## Contexto

El discovery midió que la base responsive ya está (~85% de componentes). Quedan fixes puntuales en el flujo que el taller usa **desde el celular**. Ninguno es un bug que rompa; son fricciones de layout en pantallas chicas. Este spec los lista uno por uno con archivo:línea, cambio y criterio de "hecho".

---

## Fixes

### FIX 1 — Wizard perfil productivo (mayor riesgo UX)
**Archivo:** `src/app/(taller)/taller/perfil/completar/page.tsx`

#### 1a. Fila de 5 botones de tamaño de equipo sin wrap — ✅ HECHO (`bafcc2a`)
- **Dónde:** l.332 (contenedor) y l.334-335 (botones). Paso 3 "Equipo".
- **Hoy:** `<div className="flex gap-2 mb-4">` con 5 botones `flex-1` (`1-2`, `3-5`, `6-10`, `11-20`, `+20`). En 320px quedan estrechos e ilegibles.
- **Cambio:** contenedor → `grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4`. Quitar `flex-1` del botón (no-op en grid). En mobile: 3+2 botones; en sm+ idéntico a hoy (5 en fila, anchos iguales).
- **Hecho cuando:** en 320-375px los 5 botones se ven completos y legibles en 2 filas; en ≥640px siguen en una fila igual que antes.

#### 1b. Navegación Atrás/Siguiente sin sticky en mobile — ✅ HECHO (`bafcc2a`)
- **Dónde:** l.705-710.
- **Hoy:** `<div className="flex justify-between mt-6">` — al final del contenido; en pasos largos hay que scrollear hasta abajo para encontrarla.
- **Cambio:** hacerla sticky-bottom SOLO en mobile, estática en desktop. Contenedor →
  `flex justify-between mt-6 sticky bottom-0 -mx-4 px-4 py-3 bg-white/95 backdrop-blur border-t border-gray-100 sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0`.
  El `-mx-4 px-4` extiende la barra hasta los bordes (el padre tiene `px-4`); en sm+ se resetea todo a como está hoy. No cambia colores de marca (usa blanco/gris neutro de fondo de barra, no identidad).
- **Hecho cuando:** en mobile los botones quedan fijos abajo mientras se scrollea el paso; en desktop se ven exactamente como hoy (sin barra, sin borde, estáticos).

#### 1c. Revisión de los 14 pasos en 320-375px — ✅ HECHO (sin cambios adicionales)
- **Acción:** recorrer los pasos verificando que inputs, grids (`grid-cols-2 sm:grid-cols-3` en máquinas/roles/prendas), step-indicators (`overflow-x-auto`, l.258) y cards no desborden horizontalmente.
- **Esperado:** sin cambios adicionales salvo que aparezca un desborde real. Los grids ya tienen prefijo; los indicadores ya scrollean.
- **Hecho cuando:** ningún paso produce scroll horizontal de página en 320px.

### FIX 2 — Dashboard taller: KPI grid sin breakpoint — ✅ HECHO (`bafcc2a`)
**Archivo:** `src/app/(taller)/taller/page.tsx`
- **Dónde:** l.273.
- **Hoy:** `<div className="grid grid-cols-2 gap-4">` con 4 cards de stats `text-3xl`. En 320px los números grandes quedan apretados.
- **Cambio:** → `grid grid-cols-1 sm:grid-cols-2 gap-4` (mismo patrón que ya usa l.329 en este archivo). 1 columna en pantallas chicas, 2 en sm+.
- **Hecho cuando:** en 320-375px las 4 cards se ven una por fila sin apretar el `text-3xl`; en ≥640px quedan en 2×2 como hoy.

### FIX 3 — Login: form magic-link sin wrap — ✅ HECHO (`bafcc2a`)
**Archivo:** `src/app/(auth)/login/page.tsx`
- **Dónde:** l.50.
- **Hoy:** `<form ... className="mt-3 flex gap-2">` (input `flex-1` + botón). En 320px input y botón quedan apretados en una fila.
- **Cambio:** → `mt-3 flex flex-col sm:flex-row gap-2`. En mobile el input se apila arriba del botón; en sm+ quedan en fila como hoy.
  - Nota: `flex-wrap` puro NO sirve acá porque el input es `flex-1` (se encoge a 0 y nunca fuerza el wrap). El stack `flex-col sm:flex-row` es la realización efectiva del "wrap" pedido.
- **Hecho cuando:** en 320px input full-width arriba, botón debajo; en ≥640px en fila igual que hoy.

### FIX 4 — Verificar "Crear cotización" en mobile — ✅ VERIFICADO OK (sin cambios de código)
**Archivos:** `src/taller/componentes/cotizar-form.tsx` + host `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx`
- **Resultado de la verificación (este discovery):** **el form YA es responsive** — `grid grid-cols-1 sm:grid-cols-2` para precio/plazo (l.73), inputs/textarea/FileUpload/submit todos `w-full`. **No requiere cambios.**
- El info-grid del pedido (host l.47, `grid-cols-2` con label/valor cortos en `text-lg`) funciona en 320px (valores cortos, ubicación larga wrappea sin desbordar). Se deja como está — consistente con cómo el discovery juzgó `grid-cols-2 md:grid-cols-4` de perfil (aceptable).
- **Hecho cuando:** documentado como verificado-OK (este punto). Sin fix de código.

---

## Casos borde
- **Sticky footer + teclado mobile:** al enfocar un input, el teclado virtual puede tapar la barra sticky. Aceptable (el usuario cierra teclado o scrollea); no se agrega lógica de viewport.
- **Sticky en pasos cortos:** si un paso entra completo en viewport, `sticky bottom-0` simplemente queda al final (sin "flotar"), comportamiento correcto.
- **Paso 0 y 13:** no tienen la barra de navegación (condición `step > 0 && step < 13`), no afectados por 1b.

## Criterio de aceptación (todo el PR)
1. FIX 1a/1b/2/3 aplicados; FIX 4 verificado y documentado.
2. Cero cambios de color/tipografía/identidad (solo clases de layout: grid/flex/sticky/breakpoints).
3. Sin scroll horizontal de página en 320px en: wizard (todos los pasos), dashboard taller, login, crear cotización.
4. Desktop (≥640px) visualmente idéntico a antes en las 4 pantallas.
5. `unit` + `e2e` + Vercel build verdes.

## Tests
- No se agregan tests automatizados en este PR (los E2E mobile son el PASO SIGUIENTE, Acción 3, branch aparte para no mezclar fixes con infraestructura de test).
- Verificación responsive manual documentada (viewport 320/375/414) — ver método en el reporte del PR.
