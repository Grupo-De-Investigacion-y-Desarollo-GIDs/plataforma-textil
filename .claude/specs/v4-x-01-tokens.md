# SPEC V4 — X-01: Tokens visuales (paleta extendida + tipografías)

> **Spec generado siguiendo `TEMPLATE_SPEC_V4.md`** (metodología V4 con 12 secciones obligatorias).
> Primera implementación visible del rediseño visual de PDT V4.
> Toca solo `src/app/globals.css` + `public/fonts/`. No toca componentes.

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **ID** | X-01 |
| **Versión** | v4 |
| **Slug** | tokens |
| **Título completo** | Tokens visuales V4 — paleta extendida + tipografías Source Serif 4 e Inter |
| **Bloque** | X — Identidad visual V4 |
| **Categoría** | MVP no negociable |
| **Estimación** | 2h |
| **Riesgo** | Bajo |
| **Dependencias** | Fase 0 ✅ completada (dominio operativo + dev separado) |
| **Bloquea a** | X-02 (componentes UI base), X-03 (componentes nuevos), X-05 (header app), X-06 (header público), todas las pantallas que apliquen rediseño visual |
| **Branch** | `feature/v4-x-01-tokens` |
| **PR target** | `develop` |

---

## 2. Contexto y motivación

### Situación actual

El sistema visual actual de PDT (heredado de V3) tiene un sistema de tokens limitado:

- **Paleta:** solo brand blue + brand red + brand-bg-light + 3 colores semánticos (success/warning/muted)
- **Tipografía:** 2 fuentes (Noto Sans para body, Overpass para UI)
- **Body color:** azul brand (`#1e2dbe`) → baja jerarquía y contraste pobre para lectura prolongada
- **Sin sistema de pastels, ink, terracotta** → cada pantalla que necesita un color suave usa Tailwind generic (`slate-50`, `gray-200`) sin coherencia
- **Sin tipografía serif** → titulares grandes pierden carácter editorial

Esto se traduce en una estética cercana a **SaaS B2B genérico**, cuando PDT necesita transmitir **respaldo institucional con cercanía** (principio #1 de la propuesta visual V4).

### Decisión 3.14 del Master V4

> "Se adopta la propuesta visual completa de Sergio. Implementación en 11 fases incrementales (~34.5h estimadas). Cambios principales: paleta extendida (terracotta como acento + 6 pastels + 3 grises), 3 fuentes (Source Serif 4 titulares + Inter body + Overpass UI), componentes nuevos y refrescados, header simplificado, footer institucional, landing pública rediseñada."

Este spec implementa **la primera fase**: los tokens base. Todas las pantallas heredan automáticamente la nueva identidad sin tocar componentes individuales.

### Por qué empezar por acá

- Es **el "lego base"** de los 10 specs siguientes del Bloque X
- Es **bajo riesgo** porque solo cambia estilos, no toca lógica
- Genera **impacto visible inmediato** (body color, fuentes nuevas en H1)
- Permite a OIT ver progreso visual concreto en la reunión del martes

---

## 3. Validación interdisciplinaria

> Según METODOLOGIA_V4: documentar qué perspectivas aplican y qué decisiones tomar.

### Perspectivas que aplican

| Perspectiva | ¿Aplica? | Decisión tomada |
|---|---|---|
| **Politólogo** | SÍ | El cambio de body color de azul brand a casi-negro reduce la dominancia visual del brand sobre el contenido institucional. Esto refuerza el principio #1 de la propuesta: "respaldado por instituciones serias sin caer en frialdad gov.ar". |
| **Sociólogo** | SÍ | El terracotta como acento conecta con el imaginario del **sector textil** (telar, tierra, materialidad de la prenda). Refuerza identificación visual del usuario taller con la plataforma. |
| **Economista** | N/A | No aplica — los tokens son una decisión de diseño, no afectan modelo de incentivos ni costos. |
| **Contador** | N/A | No aplica — los tokens no tienen implicaciones tributarias ni de costos operativos. |
| **Sectorial** | SÍ | Sergio (diseñador del equipo) consultó referencias del sector textil argentino y propuso terracotta+ink+pastels. Validado al adoptarse decisión 3.14. |

### Decisiones de diseño que se respetan

1. **Body color casi-negro (`#0F0F1E`)** en lugar de azul brand — mejor legibilidad y menos densidad visual
2. **Source Serif 4 para H1 grandes** — carácter editorial sobrio, no decorativo
3. **Inter para body** — alta legibilidad en pantalla, neutralidad
4. **Overpass solo para UI (botones, labels)** — mantiene continuidad con V3
5. **Terracotta como acento** (no brand blue) — espacio para diferenciar pills institucionales sin saturar el azul
6. **Pastels solo para fondos de íconos circulares y backgrounds suaves** — no para texto ni botones
7. **Self-hosting de fuentes** (no Google Fonts CDN) — coherente con decisión previa del equipo, mejor performance y privacidad

---

## 4. Qué construir

### Output del spec

Dos cambios concretos:

1. **`public/fonts/`** — agregar 2 archivos `.woff2`:
   - `SourceSerif4-Variable.woff2` (fuente variable, ~80KB)
   - `Inter-Variable.woff2` (fuente variable, ~100KB)

2. **`src/app/globals.css`** — reemplazar completamente el bloque de tokens actual por el sistema V4 (paleta extendida + 3 tipografías + radios + sombras + scrollbar refinado).

### Lo que NO se toca

- Componentes (Button, Card, Badge, Input) — eso es Spec X-02
- Componentes nuevos (KpiCard, FilterPills, EmptyState) — eso es Spec X-03
- Header, Footer, Layout — eso son Specs X-05 y X-06
- Páginas individuales — heredan los tokens automáticamente
- Lógica de la app, schema, endpoints — sin cambios

### Lo que se ve después de aplicar

| Cambio | Visible |
|---|---|
| Body text en gris oscuro (`#0F0F1E`) en lugar de azul brand | SÍ — todas las páginas |
| Source Serif 4 en H1 grandes (donde se use `<h1>`) | SÍ — landing, dashboards |
| Inter en body text | SÍ — todo el contenido de texto largo |
| Overpass se mantiene en botones y labels | Sin cambio visible |
| Nuevos colores terracotta y pastels disponibles | SOLO si algún componente los usa (vendrá en X-02/X-03) |
| Scrollbar más sutil | SÍ — barras de scroll del navegador |

---

## 5. Datos

**N/A** — Spec no toca base de datos ni modelos Prisma.

---

## 6. Prescripciones técnicas

### 6.1 Descarga de fuentes

#### Source Serif 4 (variable)

1. Ir a https://fonts.google.com/specimen/Source+Serif+4
2. Click en "Download family" (descarga el ZIP completo)
3. Del ZIP descargado, extraer el archivo variable estático:
   - `Source_Serif_4/SourceSerif4-VariableFont_opsz,wght.ttf`
4. Convertir a `.woff2` usando una herramienta online o local:
   - Online: https://cloudconvert.com/ttf-to-woff2 (privacidad: usar herramienta offline si los archivos contienen metadata sensible)
   - Local: `npm install -g ttf2woff2 && ttf2woff2 < input.ttf > output.woff2`
5. Renombrar a `SourceSerif4-Variable.woff2`
6. Mover a `public/fonts/SourceSerif4-Variable.woff2`

#### Inter (variable)

1. Ir a https://fonts.google.com/specimen/Inter
2. Click en "Download family"
3. Del ZIP extraer:
   - `Inter/Inter-VariableFont_opsz,wght.ttf`
4. Convertir a `.woff2`
5. Renombrar a `Inter-Variable.woff2`
6. Mover a `public/fonts/Inter-Variable.woff2`

**Verificación post-descarga:**

```bash
ls -lh public/fonts/SourceSerif4-Variable.woff2 public/fonts/Inter-Variable.woff2
```

Tamaños esperados aproximados:
- `SourceSerif4-Variable.woff2`: 80-100 KB
- `Inter-Variable.woff2`: 100-130 KB

Si alguno excede 200 KB, verificar que se subió la versión variable correcta (no la TTF estática con todos los pesos).

### 6.2 Modificación de `src/app/globals.css`

Reemplazar completamente el archivo con el siguiente contenido. Los `@font-face` existentes de Overpass y Noto Sans se mantienen pero se documentan al inicio.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* ─────────────────────────────────────────── */
/* @font-face — fuentes locales                */
/* ─────────────────────────────────────────── */

/* Existentes (mantener tal cual están en globals.css actual) */
/* Overpass: 600, 700, 800, 900 */
/* Noto Sans: 300, 400, 500, 600, 700 (uso legacy, ir migrando a Inter) */

/* NUEVAS */

@font-face {
  font-family: 'Source Serif 4';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/SourceSerif4-Variable.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
}

/* ─────────────────────────────────────────── */
/* @theme inline — tokens V4                   */
/* ─────────────────────────────────────────── */

@theme inline {
  /* COLORES — paleta semántica */

  /* Brand */
  --color-brand-blue: #1E2DBE;
  --color-brand-blue-dark: #161D8F;
  --color-brand-blue-hover: #1A27A8;
  --color-brand-red: #FA3C4B;
  --color-brand-bg-light: #EBF2FE;
  --color-brand-topbar: #161D8F;
  --color-brand-tabnav: #1A27A8;

  /* Acento NUEVO — terracotta (sector textil) */
  --color-terra-50: #FFF4ED;
  --color-terra-100: #FFE4D3;
  --color-terra-300: #FDB088;
  --color-terra-600: #C2410C;
  --color-terra-700: #9A3412;

  /* Pastels (íconos circulares + backgrounds suaves) */
  --color-pastel-blue: #EBF2FE;
  --color-pastel-green: #E6F5EE;
  --color-pastel-purple: #F0EBFA;
  --color-pastel-yellow: #FEF6E5;
  --color-pastel-terra: #FFF4ED;
  --color-pastel-red: #FDECEC;

  /* Texto — IMPORTANTE: cambia de azul brand a casi-negro */
  --color-ink-primary: #0F0F1E;
  --color-ink-secondary: #4B5563;
  --color-ink-muted: #9CA3AF;

  /* Status (semántico) */
  --color-status-success: #22C55E;
  --color-status-warning: #F59E0B;
  --color-status-error: #EF4444;
  --color-status-info: #3B82F6;
  --color-status-muted: #9CA3AF;

  /* TIPOGRAFÍA */
  --font-sans: 'Inter', sans-serif;          /* body text */
  --font-overpass: 'Overpass', sans-serif;   /* UI: botones, labels, captions */
  --font-serif: 'Source Serif 4', serif;     /* titulares: H1 grandes */

  /* RADIOS */
  --radius-card: 1rem;        /* rounded-card → 16px */
  --radius-button: 0.625rem;  /* rounded-lg → 10px */
  --radius-icon: 9999px;      /* rounded-full */
  --radius-input: 0.5rem;     /* rounded-md → 8px */

  /* SOMBRAS */
  --shadow-soft: 0 2px 8px 0 rgb(15 15 30 / 0.04);
  --shadow-card: 0 4px 20px 0 rgb(15 15 30 / 0.04);
  --shadow-card-hover: 0 12px 32px 0 rgb(15 15 30 / 0.10);
  --shadow-modal: 0 24px 48px 0 rgb(15 15 30 / 0.16);

  /* ANIMACIONES */
  --animate-progress-fill: progress-fill 1s ease-out forwards;
}

/* ─────────────────────────────────────────── */
/* COMPAT — mantener variables legacy          */
/* ─────────────────────────────────────────── */

:root {
  /* Compat con código que use var(--brand-blue) o similares */
  --brand-blue: #1E2DBE;
  --brand-red: #FA3C4B;
  --brand-bg-light: #EBF2FE;
}

/* ─────────────────────────────────────────── */
/* RESETS Y BASE                               */
/* ─────────────────────────────────────────── */

body {
  font-family: 'Inter', sans-serif;
  background-color: #F8F9FB;
  color: #0F0F1E;          /* IMPORTANTE: era #1e2dbe (azul brand). Ahora casi-negro. */
  -webkit-font-smoothing: antialiased;
}

/* Jerarquía tipográfica */
h1 {
  font-family: 'Source Serif 4', serif;
  font-weight: 700;
  font-optical-sizing: auto;
}

h2, h3, h4, h5, h6 {
  font-family: 'Overpass', sans-serif;
}

nav, button, select, input, label {
  font-family: 'Overpass', sans-serif;
}

/* Scrollbar refinado */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(15, 15, 30, 0.1); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(15, 15, 30, 0.2); }

/* ─────────────────────────────────────────── */
/* ANIMACIONES                                 */
/* ─────────────────────────────────────────── */

@keyframes progress-fill {
  0% { stroke-dashoffset: 440; }
  100% { stroke-dashoffset: var(--progress-offset); }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

/* Pattern textil sutil — clase utilitaria opcional para futuros usos */
.pattern-weave {
  background-image:
    linear-gradient(135deg, rgba(30, 45, 190, 0.04) 25%, transparent 25%),
    linear-gradient(225deg, rgba(30, 45, 190, 0.04) 25%, transparent 25%),
    linear-gradient(45deg, rgba(30, 45, 190, 0.04) 25%, transparent 25%),
    linear-gradient(315deg, rgba(30, 45, 190, 0.04) 25%, transparent 25%);
  background-position: 10px 0, 10px 0, 0 0, 0 0;
  background-size: 20px 20px;
  background-repeat: repeat;
}
```

### 6.3 Verificaciones de build

#### Verificar versión de Tailwind

El bloque `@theme inline` requiere **Tailwind v4**. Confirmar:

```bash
cat package.json | grep tailwindcss
```

Resultado esperado: `"tailwindcss": "^4.x"` o similar. Si es Tailwind v3, paralo y reportá antes de seguir.

#### Verificar carga de fuentes en producción

Después del deploy a preview, abrir DevTools → Network tab y filtrar por "font". Debería verse:

- `SourceSerif4-Variable.woff2` → 200 OK
- `Inter-Variable.woff2` → 200 OK
- Tamaños menores a 200 KB cada uno

Si alguna devuelve 404, verificar:
- Path correcto en `@font-face`: `/fonts/SourceSerif4-Variable.woff2`
- Archivo presente en `public/fonts/`
- Build incluye assets de `public/`

#### Verificar Tailwind no compila clases viejas que ya no existen

Buscar referencias a tokens viejos del DESIGN_SYSTEM V3 que podrían romperse:

```bash
grep -rn "brand-bg-light" src/ --include="*.tsx" --include="*.ts" | head -20
grep -rn "text-text-main" src/ --include="*.tsx" --include="*.ts" | head -20
```

Si aparecen muchas referencias a `brand-bg-light`, mantener la variable en `:root` (ya está incluida en el bloque compat). Si alguna falla, agregar a la sección compat.

### 6.4 Manejo de fuente Noto Sans

Se mantiene `Noto Sans` como `@font-face` declarado **pero ya no se asigna a body**. Se queda como fuente disponible para casos legacy donde se haya usado `font-sans-noto` explícito.

En specs futuros del Bloque X, ir migrando referencias de Noto Sans a Inter.

---

## 7. Edge cases

### 7.1 FOIT (Flash of Invisible Text) al cargar fuentes nuevas

**Problema posible:** Cuando un usuario carga una página por primera vez, las fuentes nuevas tardan unos ms en bajarse. Durante ese tiempo, el navegador puede mostrar texto invisible (FOIT) o un fallback feo (FOUT).

**Mitigación:** `font-display: swap` ya está incluido en cada `@font-face`. Esto fuerza al navegador a:
1. Mostrar la fuente fallback inmediatamente (Inter → sans-serif, Source Serif 4 → serif)
2. Cambiar a la fuente real cuando termine de cargar
3. No bloquear el render

**Verificación:** abrir DevTools → Network → habilitar "Slow 3G" → reload. El texto debería ser visible siempre (fallback primero, fuente real después).

### 7.2 Cache busting de fuentes

Si después del deploy las fuentes no aparecen, puede ser cache del CDN de Vercel. Forzar invalidación:

```bash
# Hard reload en el browser: Ctrl+Shift+R (Cmd+Shift+R en Mac)
# O agregar query string a la URL: ?v=2
```

Vercel suele invalidar cache de assets en `public/` automáticamente con cada deploy, pero confirmar si hay duda.

### 7.3 Compatibilidad con tests E2E existentes

**Riesgo:** algunos tests E2E verifican el color o tipografía con assertions específicas (ej: `expect(body).toHaveCSS('color', 'rgb(30, 45, 190)')`).

**Mitigación:** después del deploy a preview del PR, correr E2E completo y verificar:
- Si fallan tests por color → buscar el test, actualizar la assertion al nuevo color (`rgb(15, 15, 30)`)
- Si fallan tests por tipografía → similar, actualizar

**Lista de archivos sospechosos a revisar antes de mergear:**

```bash
grep -rn "toHaveCSS.*color" tests/e2e/ | head -10
grep -rn "font-family" tests/e2e/ | head -10
```

### 7.4 Componentes inline con estilos hardcodeados

Algunos componentes pueden tener `style={{ color: '#1e2dbe' }}` hardcodeado en JSX. Esos NO se actualizan con el cambio de globals.css.

**Acción:** NO arreglarlos en este spec. Se documentan como TODO para Spec X-02 (refactor de componentes UI base).

```bash
grep -rn "color: '#1e2dbe'" src/ --include="*.tsx" | head -10
grep -rn "color: '#FA3C4B'" src/ --include="*.tsx" | head -10
```

### 7.5 Browsers viejos

`@theme inline` (Tailwind v4) requiere navegadores modernos:
- Chrome ≥ 111
- Firefox ≥ 128
- Safari ≥ 16.4

**Mitigación:** todos los browsers actuales soportan esto. Los celulares de los talleres (target principal) usan Chrome Android o Safari iOS actualizados. No es un riesgo real para el piloto.

### 7.6 Cambio de background body de blanco a gris muy claro

**Problema posible:** El body pasa de `#fff` (blanco puro) a `#F8F9FB` (gris muy claro). Cards blancas que antes se fundían con el fondo ahora ganan contraste visual, lo cual es positivo. Sin embargo, componentes que no declaran `bg-white` explícitamente pueden heredar el gris claro y perder separación visual del fondo.

**Mitigación:** Verificar visualmente en preview después del deploy. Si alguna card o sección pierde legibilidad, agregar `bg-white` explícito en el componente afectado (scope de Spec X-02 si no es crítico).

### 7.7 H1 cambia de Overpass (sans-serif) a Source Serif 4 (serif)

**Problema posible:** Todos los `<h1>` de la app cambian de Overpass a Source Serif 4. En la landing y dashboards esto puede generar un contraste tipográfico fuerte entre el H1 serif y los H2/H3 sans-serif. Algunos títulos de página que usan `<h1>` pero funcionan más como labels de sección pueden verse desproporcionados con la fuente serif.

**Mitigación:** Verificar visualmente en preview. Si algún H1 se ve fuera de lugar, se puede overridear con `className="font-overpass"` puntualmente. Pero el cambio es intencional — Source Serif 4 en H1 refuerza la identidad editorial de PDT.

---

## 8. Validación sectorial

**N/A — Diferida a validación grupal post-MVP V4.**

Justificación: los tokens visuales son una decisión de diseño que afecta percepción estética. No requiere validación con talleres/marcas individualmente antes de aplicarse. La validación sectorial se hace de forma agregada cuando el rediseño visual completo esté aplicado (después de Spec X-11).

---

## 9. Criterios de aceptación

Condiciones técnicas binarias que deben cumplirse para considerar el spec terminado:

- [ ] `Source Serif 4-Variable.woff2` presente en `public/fonts/` (~80-100 KB)
- [ ] `Inter-Variable.woff2` presente en `public/fonts/` (~100-130 KB)
- [ ] Bloque `@theme inline` actualizado en `src/app/globals.css` con paleta V4 completa
- [ ] `body { color: #0F0F1E }` aplicado (era `#1e2dbe`)
- [ ] `body { font-family: 'Inter', sans-serif }` aplicado
- [ ] `h1 { font-family: 'Source Serif 4', serif }` aplicado
- [ ] Variables legacy mantenidas en `:root` para compat (`--brand-blue`, `--brand-red`, `--brand-bg-light`)
- [ ] Build de producción pasa sin errores (`npm run build`)
- [ ] No hay warnings nuevos de TypeScript
- [ ] No hay warnings nuevos de ESLint
- [ ] Tests E2E pasan en CI (76 verdes, 0 failed, 0 flaky idealmente)
- [ ] Fuentes cargan correctamente en preview (200 OK en Network tab)
- [ ] Verificación visual en `dev.plataformatextil.com.ar` OK (body gris oscuro, no azul)
- [ ] Documentación de handover actualizada (ver sección 11)
- [ ] PR creado, revisado y mergeado a `develop`
- [ ] Merge a `main` exitoso (cuando se decida llevar el Bloque X completo a producción)

---

## 10. Tests (QAs basados en flujos)

Como es un spec de refactor visual chiquito (2h), tiene 3 flujos manuales. **No requiere automatización con Playwright** porque los tests existentes ya cubren funcionalidad.

### Flujo 1: Verificación visual landing pública

- **Rol:** no autenticado
- **Precondiciones:** PR desplegado en preview URL de Vercel
- **Pasos:**
  1. Abrir preview URL en navegador (Chrome o Firefox actualizado)
  2. Verificar visualmente la landing
  3. Abrir DevTools → Network → filtrar por "font"
  4. Reload la página
- **Resultado esperado:**
  - Body text se ve gris oscuro casi-negro (no azul brand)
  - H1 "Plataforma Digital Textil" (o equivalente del header de landing) se ve en serif (Source Serif 4)
  - Body text se ve en sans-serif (Inter)
  - Network tab muestra `Inter-Variable.woff2` y `SourceSerif4-Variable.woff2` con código 200
- **Verificaciones cruzadas:** N/A (vista pública)
- **Tipo:** manual

### Flujo 2: Verificación visual dashboard taller (logueado)

- **Rol:** taller
- **Precondiciones:** Usuario taller del seed logueado en preview URL
- **Pasos:**
  1. Login con cuenta taller del seed (ej: `roberto.gimenez@pdt.org.ar` / `pdt2026`)
  2. Verificar dashboard
  3. Navegar a "Mi formalización"
  4. Navegar a "Mis pedidos"
- **Resultado esperado:**
  - Todo el body text en Inter, color gris oscuro
  - Botones siguen en Overpass (no cambia)
  - Heading "Mi formalización", "Mis pedidos" siguen en Overpass (son H2/H3, no H1)
  - Las pantallas se ven "casi igual" que antes excepto por el color del body text más legible
- **Verificaciones cruzadas:** N/A
- **Tipo:** manual

### Flujo 3: Verificación de no regresión (E2E automático)

- **Rol:** todos (TALLER, MARCA, ESTADO, ADMIN)
- **Precondiciones:** PR desplegado en preview, CI corriendo
- **Pasos:**
  1. Esperar a que el workflow E2E termine en el PR
  2. Verificar resultados del job "E2E Tests"
- **Resultado esperado:**
  - 76 tests pasan
  - 0 failed
  - 0 flaky idealmente (≤2 flaky aceptable como tolerancia)
  - Si algún test falla por color/tipografía, actualizar el test al nuevo valor antes de mergear
- **Verificaciones cruzadas:** los 4 roles deben funcionar normalmente
- **Tipo:** automatizado Playwright

---

## 11. Impacto en handover

Documentos de `.claude/specs/handover/` a actualizar al terminar este spec:

- **ARCHITECTURE.md** → crear (no existe todavía) o agregar sección "Design tokens V4" describiendo:
  - Paleta extendida (brand + terracotta + pastels + ink + status)
  - 3 fuentes (Inter body / Source Serif 4 titulares / Overpass UI)
  - Self-hosting de fuentes en `public/fonts/`
  - Token system con `@theme inline` (Tailwind v4)
- **DECISIONS.md** → agregar entrada:
  - "Adopción del sistema de tokens V4 — paleta extendida + tipografías Source Serif 4 e Inter (Spec X-01, fecha YYYY-MM-DD)"
- **KNOWN_ISSUES.md** → N/A (no se descubrieron issues nuevos en este spec)
- **DEPLOY.md** → N/A (no cambia el proceso de despliegue)
- **HOW_TO_ADD_SPEC.md** → N/A (no cambia la metodología)

---

## 12. Riesgos y mitigaciones

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| 1 | FOIT (Flash of Invisible Text) al cargar fuentes nuevas en primera visita | Media | Bajo | `font-display: swap` configurado en cada `@font-face`. Fallbacks definidos (sans-serif, serif). |
| 2 | Tests E2E fallan por assertions hardcodeadas de color/tipografía | Baja | Medio | Buscar assertions sospechosas antes (`grep -rn "toHaveCSS.*color"`). Actualizar tests si fallan, no revertir el spec. |
| 3 | Browsers viejos no soportan `@theme inline` (Tailwind v4) | Muy baja | Alto | Verificar Tailwind v4 está en `package.json`. Confirmar que browsers target son modernos (Chrome ≥ 111, Firefox ≥ 128, Safari ≥ 16.4). |
| 4 | Componentes con `style={{}}` inline hardcodeado no heredan los tokens | Alta | Bajo | Documentado como TODO para Spec X-02. NO arreglarlos en este spec. |
| 5 | Fuentes mal convertidas a `.woff2` (corrupted) generan 200 pero no renderizan | Baja | Medio | Verificar visualmente en preview después del deploy. Si las fuentes no se ven, repetir conversión con otra herramienta. |
| 6 | `status-warning` cambia de naranja (`#f97316`) a ámbar (`#F59E0B`) | N/A (intencional) | Bajo | Cambio sutil de tono visual. No rompe funcionalidad. Verificar visualmente que badges de warning sigan siendo distinguibles. |
| 7 | Cambio de body color rompe contraste accesible en algún componente | Baja | Bajo | El nuevo color `#0F0F1E` (casi-negro) tiene mejor contraste que el azul brand. AAA WCAG en fondos claros. |
| 8 | Tokens de uso activo eliminados del `@theme inline` original (`brand-red`, `brand-topbar`, `brand-tabnav`, `brand-bg-light`, `status-muted`) | Era Alta → **Mitigada** | Alto | Detectado en análisis de factibilidad. Los 5 tokens se preservaron en el `@theme inline` corregido. 7 componentes usan `brand-red`, 2 el header (`brand-topbar`/`brand-tabnav`), 1 `stat-card` (`status-muted`), 7 usan `brand-bg-light`. |
| 9 | Animaciones eliminadas (`progress-fill`, `slide-in-right`) | Era Alta → **Mitigada** | Medio | Detectado en análisis de factibilidad. Keyframes y clase `.animate-slide-in-right` preservados en el CSS corregido. Usados por `progress-ring.tsx` y `toast.tsx`. |

---

## Notas finales

### Sobre la implementación

- Este spec es **explícitamente chiquito** (2h) y de **bajo riesgo** para que sea **el primer spec V4 implementado** y validar la metodología antes de tackleear specs más grandes.
- **NO toca componentes**: si después de aplicar los tokens algo se ve raro, eso es scope del Spec X-02 (refactor de componentes UI base), NO de este spec.
- **NO requiere validación sectorial**: la decisión 3.14 del master ya adopta la propuesta visual de Sergio. Este spec implementa lo decidido.

### Sobre las fuentes

- Si la descarga de Source Serif 4 o Inter resulta complicada, **se puede saltar temporalmente** este spec y mover X-01 a un "X-01-a tokens sin fuentes" y "X-01-b agregar fuentes" después. Sin embargo, no debería ser necesario — Google Fonts permite descarga directa del ZIP.

### Sobre el body color

- El cambio de `#1e2dbe` a `#0F0F1E` es el **cambio visible más importante** del spec.
- Pantallas que tenían texto en azul brand por herencia del body ahora van a verse en gris oscuro → **mejor legibilidad y jerarquía**.
- Botones, links, headings que tenían azul brand **explícito** (con clase Tailwind `text-brand-blue`) se mantienen igual.

### Para Claude Code

Cuando implemente este spec, debe:

1. Crear el branch `feature/v4-x-01-tokens` desde `develop` actualizado
2. Descargar las fuentes (o pedirle a Gerardo que las descargue manualmente si la conversión a `.woff2` es problemática)
3. Aplicar el reemplazo del bloque `@theme inline` en `globals.css`
4. Hacer commit con mensaje descriptivo (sugerido en sección 6 del archivo `02-tokens.md` de Sergio)
5. Push y crear PR contra `develop`
6. Esperar CI verde
7. Verificación manual de los 3 flujos
8. Actualizar `ARCHITECTURE.md` y `DECISIONS.md` (sección 11)
9. Mergear cuando todo esté OK

### Referencias

- Propuesta visual completa de Sergio: `docs/Diseño/propuesta-visual-pdt-v4/propuesta-final/02-tokens.md`
- Master V4 — Decisión 3.14: adopción de propuesta visual
- Principios visuales: `docs/Diseño/propuesta-visual-pdt-v4/propuesta-final/01-principios.md`
- TEMPLATE_SPEC_V4 y METODOLOGIA_V4 en `.claude/`

---

**Fin del SPEC X-01 — Tokens visuales V4**

> Una vez terminado el spec, el QA correspondiente se crea como `.claude/auditorias/QA_v4-x-01-tokens.md` siguiendo `TEMPLATE_QA_V4.md`.
