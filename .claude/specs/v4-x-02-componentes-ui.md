# SPEC X-02 + X-03: Componentes UI V4 (refactor + nuevos)

> **Spec V4** — Combina los specs X-02 y X-03 del MASTER_V4 en una sola entrega.
> El motivo de la combinacion: Sergio es el capitan del diseno y prefiere ver el sistema de componentes completo de una vez. Los 9 componentes son cohesivos visualmente y se prueban mejor juntos.

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **Tipo** | refactor visual + componentes nuevos |
| **Bloque** | X (identidad visual) |
| **Categoria** | MVP no negociable |
| **Estimacion** | 6h (3h refactor + 3h nuevos) |
| **Riesgo** | Bajo (backwards compatible) |
| **Dependencias** | X-01 (tokens visuales mergeados) |
| **Branch** | `feature/v4-x-02-componentes-ui` |
| **Validacion sectorial** | N/A — Diferida a validacion grupal post-MVP V4 |
| **Perspectivas relevantes** | Sectorial (propuesta visual de Sergio, capitan del diseno) |
| **Autor** | Gerardo Breard |
| **Fecha de creacion** | 2026-05-15 |
| **Aprobado por** | Gerardo (delegando criterio visual a Sergio) |
| **Issue GitHub vinculado** | N/A |
| **PR vinculado** | Pendiente |

---

## 2. Contexto

### Por que existe este spec

X-01 dejo listos los tokens visuales V4 (paleta terracotta + pastels + ink, fuentes Source Serif 4 + Inter, sombras y radios nuevos). Pero los **componentes UI base** (Button, Card, Badge, Input) siguen con estilos hardcoded de la paleta antigua, y faltan componentes nuevos definidos en la propuesta visual de Sergio (KpiCard, FilterPills, EmptyState refactorizado, iconos custom, LogoPDT).

Sin estos componentes:
- Las pantallas que se actualicen en X-07/X-08/X-09 no tendran los building blocks correctos
- El equipo de QA (Sergio + colegas) no puede validar el sistema visual completo en dev
- Los specs siguientes del bloque X dependen de tener esta base lista

### Que resuelve

Despues de implementar este spec:

1. **4 componentes existentes** (Button, Card, Badge, Input) usan los tokens V4 con las variantes nuevas que propuso Sergio
2. **5 componentes nuevos** (KpiCard, FilterPills, EmptyState refactorizado, 12 iconos SVG custom, LogoPDT) estan listos para usarse en specs posteriores
3. **Backwards compatibility:** los 176 usos existentes de los 4 componentes refactorizados siguen funcionando sin cambios en su API
4. **Sistema visual coherente:** todas las pantallas heredan el look V4 automaticamente cuando se apliquen los componentes en X-07/X-08/X-09

### Documentacion de referencia

- `docs/Diseno/propuesta-visual-pdt-v4/propuesta-final/03-componentes.md` (propuesta de Sergio)
- `docs/Diseno/propuesta-visual-pdt-v4/propuesta-final/mockup/mockup-v6.html` (mockup navegable con SVGs de iconos)
- `.claude/specs/v4-x-01-tokens.md` (spec previo de tokens)

---

## 3. Validacion interdisciplinaria

### Perspectivas relevantes para este spec

**Politologo:** N/A — no toca politicas publicas ni marco normativo.

**Sociologo:** N/A — no afecta narrativa ni lenguaje del usuario. Eso se aborda en X-07/X-09.

**Economista:** N/A — sin impacto en modelo economico ni costos.

**Contador:** N/A — sin impacto fiscal.

**Sectorial:** APLICA.
- Observacion: Sergio (capitan del diseno, conoce el rubro textil) elaboro una propuesta visual completa con cambios especificos a cada componente.
- Decision tomada en el spec: adoptar la propuesta de Sergio tal cual, sin reinterpretarla. Sergio decide el que visual, este spec implementa el como tecnico.

---

## 4. Que construir

### 4.1 Refactor de los 4 componentes existentes

#### Button

**Variantes actuales:** `primary` | `secondary` | `success` | `danger` | `ghost`

**Variantes nuevas a agregar:** `outline-dark` | `terra`

**Cambios visuales (manteniendo API):**
- `primary`: agregar `shadow-soft` (sombra suave)
- `secondary`: usar `border-2 border-brand-blue` en lugar de `border border-gray-300`
- `outline-dark` (nueva): fondo blanco, border `ink-secondary`, texto `ink-primary`, hover bg `gray-50`
- `terra` (nueva): fondo `terra-600`, texto blanco, hover `terra-700`
- Hover mas sutil en todas las variantes

**Sizes:** mantener `sm` | `md` | `lg` sin cambios.

**Props extras:** mantener `loading`, `icon` sin cambios.

#### Card

**Cambios:**
- `rounded-card` (16px) en lugar de `rounded-xl` (12px)
- Titulo: cambiar `text-brand-blue` por `text-ink-primary`
- Sombra: usar `shadow-card` del token V4 (ya esta)

**Prop nueva:** `accent`
- Tipo: `'blue' | 'green' | 'purple' | 'terra' | 'yellow' | undefined`
- Cuando se setea: agrega barra de color superior de 3px de altura (`h-[3px]`)
- Cuando no se setea (undefined): comportamiento actual sin cambios

**Colores del accent:**

| Valor | Clase |
|---|---|
| `blue` | `bg-brand-blue` |
| `green` | `bg-green-700` |
| `purple` | `bg-purple-700` |
| `terra` | `bg-terra-600` |
| `yellow` | `bg-yellow-600` |

#### Badge

**Variantes actuales:** `default` | `success` | `warning` | `error` | `outline` | `muted`

**Cambios:**
- Cambiar estilo de `default`, `success`, `warning`, `error` a pastel-bg + dark-text (mas legibles)
- **MANTENER `muted` con estilo propio** (baja prioridad, 20+ usos en admin)
- **MANTENER `outline` con estilo propio** (informativo neutro, 3 usos)
- Tamano: `text-[11px] uppercase tracking-wider font-bold` (mas formal)
- Padding: `px-3 py-1` (mas compacto que el actual `px-4 py-2`)

**Variantes nuevas:** `info` | `terra`

**Tabla de estilos por variante:**

| Variante | Background | Text color |
|---|---|---|
| `default` | `bg-pastel-blue` | `text-brand-blue` |
| `success` | `bg-pastel-green` | `text-green-700` |
| `warning` | `bg-pastel-yellow` | `text-yellow-700` |
| `error` | `bg-pastel-red` | `text-red-700` |
| `info` (nueva) | `bg-pastel-purple` | `text-purple-700` |
| `terra` (nueva) | `bg-pastel-terra` | `text-terra-700` |
| `muted` (MANTIENE estilo propio) | `bg-gray-100` | `text-ink-secondary` |
| `outline` (MANTIENE estilo propio) | `bg-transparent border border-ink-muted/40` | `text-ink-secondary` |

**Razon para mantener `muted` y `outline`:**
- `muted` se usa 20+ veces en admin para "Inactivo", "Proximamente", "Plataforma", etc. Convertirlo a pastel-blue le sube la prominencia visual — opuesto a su semantica.
- `outline` se usa en 3 lugares con semantica "informativo neutro con enfasis" (puntaje, rol). Necesita borde visible.

#### Input

**Cambios minimos:**
- `rounded-input` (8px) — ya existe como token `--radius-input` en globals.css
- Focus ring: cambiar `ring-2 ring-brand-blue` por `ring-2 ring-brand-blue/30` (mas sutil)
- Texto: usar `text-ink-primary` explicito
- Placeholder: `placeholder:text-ink-muted`

**Resto:** sin cambios en label, error, helperText, error state.

### 4.2 Componentes nuevos a crear

#### KpiCard

Componente para mostrar metricas destacadas en dashboards. Coexiste con `stat-card` (no lo borra; cleanup va en X-10).

**Props (API de Sergio):**
- `label: string` — texto descriptivo (ej: "Talleres registrados")
- `value: string | number` — valor principal (ej: "127" o "3.2")
- `unit?: string` — unidad al lado del valor (ej: "/5", "prendas/mes")
- `icon?: ReactNode` — icono opcional
- `iconColor?: 'blue' | 'green' | 'purple' | 'terra' | 'yellow'` — color del circulo de fondo del icono
- `delta?: { value: string, trend: 'up' | 'down' | 'neutral' }` — tendencia opcional
- `footnote?: string` — nota al pie (ej: "ultimos 6 meses")
- `className?: string`

**Estructura visual:**
```
+-------------------------------------------+
|                                           |
|  [circulo pastel]   delta (+12%)  ↑       |
|  [  icono adentro ]                       |
|                                           |
|  TALLERES REGISTRADOS                     |
|  127 /5                                   |
|  (footnote)                               |
|                                           |
+-------------------------------------------+
```

**Colores del iconColor:**

| Valor | Bg circulo | Text icono |
|---|---|---|
| `blue` | `bg-pastel-blue` | `text-brand-blue` |
| `green` | `bg-pastel-green` | `text-green-700` |
| `purple` | `bg-pastel-purple` | `text-purple-700` |
| `terra` | `bg-pastel-terra` | `text-terra-600` |
| `yellow` | `bg-pastel-yellow` | `text-yellow-700` |

**Colores del delta:**

| Trend | Color |
|---|---|
| `up` | `text-status-success` |
| `down` | `text-status-error` |
| `neutral` | `text-ink-muted` |

#### FilterPills

Componente para filtrar listados. Single-select solamente (sin multi — YAGNI).

**Props:**
- `options: Array<{ label: string, value: string, count?: number }>`
- `active: string` — valor actualmente seleccionado
- `onChange: (value: string) => void`
- `className?: string`

**Estructura visual:**
```
( Todos: 127 )  ( Bronce: 45 )  ( Plata: 52 )  ( Oro: 30 )
   activo          inactivo        inactivo       inactivo
```

**Estilos:**
- Pill activo: `bg-brand-blue text-white shadow-soft`
- Pill inactivo: `bg-white border border-gray-200 text-ink-secondary hover:bg-pastel-blue`
- Transicion suave entre estados

#### EmptyState (refactor)

**REGLA: mantener API existente en espanol (backwards compat con 27 usos)**

**Props actuales (NO CAMBIAR):**
- `titulo: string`
- `mensaje: string`
- `accion?: { texto: string, href?: string, onClick?: () => void }`

**Props nuevas OPCIONALES (agregar):**
- `variant?: 'default' | 'highlighted'` (default: `'default'`)
- `icon?: ReactNode | string` — puede ser componente icono o emoji string

**Cambios visuales:**
- Variante `default` (sin icon): mantener layout actual (centrado, heading + description + action)
- Variante `default` (con icon): icon grande en circulo pastel + heading + description + action
- Variante `highlighted`: fondo `bg-pastel-blue` y border `border-brand-blue/20`
- Tipografias V4 (heading `font-overpass font-bold`, body `text-ink-secondary`)

**Los 27 usos existentes que solo pasan `titulo`/`mensaje`/`accion` se ven igual o mejor automaticamente.**

#### 12 iconos custom SVG

Crear directorio `src/compartido/iconos/` con 12 componentes React de iconos SVG inline.

**Iconos a crear (SVGs reales extraidos del mockup de Sergio `mockup-v6.html`):**

| # | Componente | Source ID en mockup | Descripcion |
|---|---|---|---|
| 1 | `IconTaller` | `ic-taller` | Aguja con hilo |
| 2 | `IconMarca` | `ic-marca` | Documento/etiqueta |
| 3 | `IconEstado` | `ic-estado` | Edificio institucional |
| 4 | `IconTrazabilidad` | `ic-trazabilidad` | Nodos conectados (diamante) |
| 5 | `IconVerificado` | `ic-verificado` | Escudo con check |
| 6 | `IconPedido` | `ic-pedido` | Caja 3D |
| 7 | `IconStats` | `ic-stats` | Grafico de barras con linea |
| 8 | `IconCapacitacion` | `ic-capacitacion` | Libro abierto |
| 9 | `IconTiempo` | `ic-tiempo` | Reloj |
| 10 | `IconSpark` | `ic-spark` | Chispa/radiacion |
| 11 | `IconTrendUp` | `ic-trend-up` | Flecha de tendencia ascendente |
| 12 | `IconBell` | `ic-bell` | Campana de notificacion |

**Atributos consistentes en todos:**
- `viewBox="0 0 24 24"`
- `fill="none"`
- `stroke="currentColor"`
- `strokeWidth={1.5}`
- `strokeLinecap="round"`
- `strokeLinejoin="round"`
- Props: `{ className?: string } & SVGProps<SVGSVGElement>`
- Default className: `"w-5 h-5"`

**Estructura de cada componente:**
```tsx
import { cn } from '@/compartido/lib/utils'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function IconNombre({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('w-5 h-5', className)}
      {...props}
    >
      {/* paths del mockup-v6.html */}
    </svg>
  )
}
```

#### LogoPDT

Componente para el logo de la plataforma. Usa el SVG del mockup (`logo-pdt` symbol con trama tejida + nodo digital).

**Props:**
- `variant?: 'full' | 'icon'` (default: `'full'`)
- `size?: 'sm' | 'md' | 'lg'` (default: `'md'`)
- `className?: string`

**Variantes:**
- `full`: SVG del logo + texto "PDT" al lado (font-overpass font-bold)
- `icon`: solo el SVG circular (para favicon contexts, header compacto)

**Tamanos:**

| Size | Dimension del SVG | Uso tipico |
|---|---|---|
| `sm` | `w-8 h-8` | Header app |
| `md` | `w-12 h-12` | Footer, landing |
| `lg` | `w-16 h-16` | Splash, OG image placeholder |

**SVG del logo (del mockup):**
```svg
<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.06"/>
  <path d="M14 22h36M14 32h36M14 42h36" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
  <path d="M22 14v36M32 14v36M42 14v36" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
  <circle cx="32" cy="32" r="5" fill="currentColor"/>
  <circle cx="22" cy="22" r="2" fill="currentColor"/>
  <circle cx="42" cy="22" r="2" fill="currentColor"/>
  <circle cx="22" cy="42" r="2" fill="currentColor"/>
  <circle cx="42" cy="42" r="2" fill="currentColor"/>
</svg>
```

### 4.3 Wireframes

Ver mockup navegable de Sergio: `docs/Diseno/propuesta-visual-pdt-v4/propuesta-final/mockup/mockup-v6.html`

---

## 5. Datos

**N/A** — Spec puramente visual sin cambios en schema, modelos, queries ni seeds.

---

## 6. Prescripciones tecnicas

### 6.1 Estructura de archivos

```
src/compartido/componentes/ui/
+-- button.tsx              # MODIFICADO
+-- card.tsx                # MODIFICADO
+-- badge.tsx               # MODIFICADO
+-- input.tsx               # MODIFICADO
+-- kpi-card.tsx            # NUEVO
+-- filter-pills.tsx        # NUEVO
+-- empty-state.tsx         # MODIFICADO (refactor)
+-- logo-pdt.tsx            # NUEVO
+-- index.ts                # ACTUALIZADO (exportar nuevos)

src/compartido/iconos/      # NUEVO directorio
+-- index.ts                # NUEVO (re-exporta todos)
+-- icon-taller.tsx
+-- icon-marca.tsx
+-- icon-estado.tsx
+-- icon-trazabilidad.tsx
+-- icon-verificado.tsx
+-- icon-pedido.tsx
+-- icon-stats.tsx
+-- icon-capacitacion.tsx
+-- icon-tiempo.tsx
+-- icon-spark.tsx
+-- icon-trend-up.tsx
+-- icon-bell.tsx
```

### 6.2 Backwards compatibility obligatoria

**Regla absoluta:** los 176 usos existentes (52 Button + 58 Card + 45 Badge + 21 Input) + 27 EmptyState deben seguir funcionando sin modificacion.

Esto significa:
- Mantener todos los nombres de variantes existentes (`primary`, `secondary`, `success`, `danger`, `ghost`, `default`, `warning`, `error`, `outline`, `muted`)
- Si una variante cambia visualmente, eso es aceptable. **No es aceptable que rompa la prop o el tipo.**
- Mantener todas las props existentes con la misma firma TypeScript
- Si se agregan props nuevas, deben ser opcionales con default razonable
- EmptyState: mantener `titulo`, `mensaje`, `accion` (espanol) — NO renombrar

### 6.3 Tokens V4 a usar

Solo usar tokens definidos en `globals.css` (introducidos por X-01). NO agregar colores hardcoded.

**Tokens disponibles (verificados en globals.css):**

Colores:
- `brand-blue`, `brand-blue-dark`, `brand-blue-hover`
- `terra-50`, `terra-100`, `terra-300`, `terra-600`, `terra-700`
- `pastel-blue`, `pastel-green`, `pastel-purple`, `pastel-yellow`, `pastel-terra`, `pastel-red`
- `ink-primary`, `ink-secondary`, `ink-muted`
- `status-success`, `status-warning`, `status-error`, `status-info`

Tipografia:
- `font-sans` (Inter)
- `font-serif` (Source Serif 4)
- `font-overpass` (Overpass)

Radios (ya existen):
- `--radius-card: 1rem` (16px) — uso: `rounded-[--radius-card]` o `rounded-card` si Tailwind lo resuelve
- `--radius-input: 0.5rem` (8px)

Sombras (ya existen):
- `--shadow-soft: 0 2px 8px 0 rgb(15 15 30 / 0.04)`
- `--shadow-card: 0 4px 20px 0 rgb(15 15 30 / 0.04)`
- `--shadow-card-hover: 0 12px 32px 0 rgb(15 15 30 / 0.10)`

### 6.4 TypeScript

- Todos los componentes deben tener tipos exportados
- Props con discriminated unions cuando aplique
- `forwardRef` en componentes que envuelven elementos HTML nativos (Button, Input)
- Iconos: `interface IconProps extends React.SVGProps<SVGSVGElement>`

### 6.5 Performance

- Iconos como componentes React inline, NO como `<img>` o SVG externo (mejor tree-shaking)
- LogoPDT usa SVG inline (no next/image dado que tenemos el SVG directo)
- NO agregar dependencias nuevas a `package.json`

### 6.6 Estructura de commits

**2 commits dentro del mismo PR:**

```
Commit 1: refactor(ui): componentes V4 base (Button, Card, Badge, Input)
  - Mantiene API existente (backwards compat)
  - Agrega variantes terra, outline-dark, info
  - Cambia tokens internos a paleta V4
  - 4 archivos modificados

Commit 2: feat(ui): componentes V4 nuevos (KpiCard, FilterPills, EmptyState, iconos, LogoPDT)
  - 12 iconos custom en src/compartido/iconos/
  - 3 componentes nuevos + 1 refactor (EmptyState)
  - Listos para usar en X-07/X-08/X-09
  - ~17 archivos nuevos + 2 modificados
```

---

## 7. Edge cases

### 7.1 Componentes con `className` custom externo

Algunos usos de Button/Card/etc. pasan `className` para overrides puntuales:

```tsx
<Button className="w-full mt-4">...</Button>
<Card className="bg-pastel-yellow">...</Card>
```

**Regla:** mantener `cn()` para que el `className` externo siga haciendo merge correctamente.

### 7.2 Card con prop `accent` no especificada

Si el caller no pasa `accent`, la card NO debe tener barra superior. Los 58 usos existentes NO especifican accent -> se ven sin barra -> comportamiento identico al actual.

### 7.3 Badge con texto largo

Las variantes con pastel-bg usan `text-[11px] uppercase tracking-wider`. Esto puede romper layouts si el texto es largo. Aceptable porque los 45 usos existentes pasan texto corto. Pantallas futuras (X-07+) usaran textos adaptados.

### 7.4 Badge `muted` — semantica preservada

Los 20+ usos de `muted` en admin (ej: "Inactivo", "Proximamente") mantienen su apariencia gris-sutil. NO se convierten en pastel-blue. Esto es una decision explicita: `muted` = baja prioridad visual.

### 7.5 EmptyState — API existente intacta

Los 27 usos existentes con `titulo`/`mensaje`/`accion` siguen funcionando identicamente. Las props nuevas (`variant`, `icon`) son opcionales con defaults que reproducen el comportamiento actual.

### 7.6 Tests E2E existentes

Si algun test E2E hace assertions sobre texto o estructura de los componentes:
- Verificar que no hay assertions sobre colores hex especificos en Badge/Button
- Si las hay y fallan: actualizar el test, NO revertir el cambio visual
- Documentar en commit message que tests se actualizaron

---

## 8. Validacion sectorial

**N/A** — Diferida a validacion grupal post-MVP V4.

Sergio (capitan del diseno) ya valido la propuesta visual. La validacion sectorial con usuarios reales (talleres, marcas) se hace despues del MVP completo.

---

## 9. Criterios de aceptacion

### Refactor de existentes

- [ ] `Button` mantiene las 5 variantes existentes funcionando + 2 nuevas (`outline-dark`, `terra`)
- [ ] `Button` con `loading` y `icon` sigue funcionando
- [ ] `Card` con titulo mantiene API + agrega prop `accent` opcional
- [ ] `Card` sin `accent` se ve identica a la actual (sin barra superior)
- [ ] `Badge` mantiene 6 variantes existentes + agrega 2 nuevas (`info`, `terra`)
- [ ] `Badge variant="muted"` sigue con estilo gris-sutil (no pastel-blue)
- [ ] `Badge variant="outline"` sigue con borde visible + bg transparente
- [ ] `Input` mantiene API completa (label, error, helperText, props HTML)
- [ ] Todos los componentes usan SOLO tokens V4 (no hex hardcoded)

### Componentes nuevos

- [ ] `KpiCard` se crea con props (label, value, unit, icon, iconColor, delta, footnote)
- [ ] `FilterPills` se crea con props (options, active, onChange) — sin multi
- [ ] `EmptyState` mantiene props espanol (titulo, mensaje, accion) + agrega variant e icon opcionales
- [ ] 12 iconos SVG se crean en `src/compartido/iconos/` con paths reales del mockup
- [ ] `LogoPDT` se crea con SVG inline del mockup + 2 variantes (full, icon)
- [ ] `src/compartido/iconos/index.ts` exporta los 12 iconos
- [ ] `src/compartido/componentes/ui/index.ts` exporta los nuevos componentes

### Calidad tecnica

- [ ] `npx tsc --noEmit --skipLibCheck` pasa sin errores
- [ ] `npm run build` pasa sin warnings nuevos
- [ ] Tests E2E pasan en CI (<=1 flaky no relacionado, 0 failed)
- [ ] Ningun uso existente de Button/Card/Badge/Input/EmptyState se rompe

---

## 10. Tests (QAs basados en flujos)

### Flujo 1 — Pantalla existente sigue viendose bien

**Pasos:**
1. Acceder al preview deploy despues del push
2. Login como admin
3. Ir a `/admin/dashboard`
4. Verificar que la pagina carga sin errores visuales obvios

**Esperado:** la pagina se ve similar a antes (puede haber cambios por nueva paleta en badges, pero nada esta roto).

### Flujo 2 — Button con variante nueva `terra`

**Pasos:**
1. En dev tools o pantalla de prueba, renderizar `<Button variant="terra">Test</Button>`

**Esperado:** boton con fondo terra-600, texto blanco, hover terra-700.

### Flujo 3 — Card con accent

**Pasos:**
1. Renderizar `<Card accent="blue" title="Test">Contenido</Card>`
2. Renderizar `<Card title="Sin accent">Contenido</Card>`

**Esperado:** la primera tiene barra azul de 3px arriba, la segunda no tiene barra.

### Flujo 4 — Badge con variantes nuevas y legacy

**Pasos:**
1. Renderizar `<Badge variant="info">Nuevo</Badge>`
2. Renderizar `<Badge variant="terra">Especial</Badge>`
3. Renderizar `<Badge variant="muted">Inactivo</Badge>`
4. Renderizar `<Badge variant="outline">Rol</Badge>`

**Esperado:** info y terra con pastel-bg + dark-text. muted con gris sutil. outline con borde visible + bg transparente.

### Flujo 5 — KpiCard basico

**Pasos:**
1. Renderizar:
```tsx
<KpiCard
  label="Talleres registrados"
  value={127}
  icon={<IconTaller />}
  iconColor="blue"
  delta={{ value: '+12%', trend: 'up' }}
/>
```

**Esperado:** card con circulo pastel-blue conteniendo icono, numero grande, label en uppercase, indicador verde con flecha.

### Flujo 6 — FilterPills single-select

**Pasos:**
1. Renderizar:
```tsx
<FilterPills
  options={[
    { label: 'Todos', value: 'all', count: 127 },
    { label: 'Bronce', value: 'bronce', count: 45 },
  ]}
  active="all"
  onChange={...}
/>
```
2. Click en "Bronce"

**Esperado:** "Bronce" pasa a estado activo (azul), "Todos" a inactivo (blanco con borde). `onChange` se dispara con `'bronce'`.

### Flujo 7 — EmptyState con icon y variant

**Pasos:**
1. Renderizar:
```tsx
<EmptyState
  variant="highlighted"
  icon={<IconPedido className="w-8 h-8" />}
  titulo="No hay pedidos disponibles"
  mensaje="Cuando haya nuevos pedidos que coincidan con tu perfil, apareceran aca."
  accion={{ texto: 'Completar perfil', href: '/taller/perfil' }}
/>
```

**Esperado:** fondo pastel-blue, border brand-blue/20, icono en circulo, heading, description, boton.

### Flujo 8 — EmptyState sin props nuevas (backwards compat)

**Pasos:**
1. Renderizar:
```tsx
<EmptyState
  titulo="Sin auditorias programadas"
  mensaje="No hay auditorias pendientes."
/>
```

**Esperado:** se ve igual que antes (centrado, texto simple, sin icon ni fondo especial).

### Flujo 9 — Iconos custom se renderizan

**Pasos:**
1. Importar y renderizar `<IconTaller className="w-6 h-6 text-brand-blue" />`

**Esperado:** SVG inline con color brand-blue, forma reconocible (aguja con hilo).

### Flujo 10 — LogoPDT en 2 variantes

**Pasos:**
1. Renderizar `<LogoPDT variant="full" size="md" />`
2. Renderizar `<LogoPDT variant="icon" size="sm" />`

**Esperado:** full muestra SVG + texto "PDT". icon muestra solo el SVG circular.

---

## 11. Impacto en handover

### Documentos a actualizar

- [ ] `.claude/specs/handover/ARCHITECTURE.md` — agregar seccion "Sistema de componentes UI V4"
- [ ] `.claude/auditorias/QA_v4-x-02-componentes-ui.md` creado siguiendo TEMPLATE_QA_V4

### Documentos NO afectados

- `KNOWN_ISSUES.md`: no se agregan issues nuevos esperables
- `DEPLOY.md`: sin cambios

---

## 12. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|---|---|---|---|
| Algun uso de Button/Card/Badge/Input se rompe visualmente | Media | Alto | Validacion visual en preview URL del PR. |
| Tests E2E con assertions de estilo fallan | Baja | Bajo | Actualizar los tests en el mismo PR. |
| Badge `muted` con pastel-bg seria regresion visual | N/A (mitigado) | N/A | Decision: mantener `muted` con estilo gris propio. |
| EmptyState rompe 27 usos por renombrar props | N/A (mitigado) | N/A | Decision: mantener `titulo`/`mensaje`/`accion`. |
| Iconos del mockup no encajan bien en 24x24 | Baja | Bajo | Ya son viewBox 24x24 en el mockup. |
| LogoPDT se ve raro sin archivo PNG final | N/A | N/A | Usa SVG inline del mockup, no necesita PNG. |

---

## Decisiones explicitas tomadas en este spec

1. **Combinar X-02 y X-03 del master original** — razon: Sergio prefiere ver el sistema completo
2. **Backwards compatibility obligatoria** — 176 usos de componentes + 27 de EmptyState no se tocan
3. **2 commits dentro del PR** — refactor primero, nuevos despues
4. **EmptyState mantiene API espanol** — `titulo`/`mensaje`/`accion` intactos, props nuevas opcionales
5. **Badge `muted` y `outline` mantienen estilo propio** — no fusionar con default
6. **Iconos adoptan nombres y SVGs del mockup de Sergio** — 12 iconos con paths reales
7. **KpiCard usa API de Sergio** — iconColor/delta/unit/footnote (no accent/trend del draft original)
8. **FilterPills sin multi-select** — YAGNI, solo single-select por ahora
9. **LogoPDT usa SVG inline** — no depende de PNG externo

---

## Notas para la implementacion

- **Tokens verificados:** `rounded-card`, `rounded-input`, `shadow-soft` ya existen en globals.css (X-01 los dejo)
- **SVGs de iconos:** extraer de `docs/Diseno/propuesta-visual-pdt-v4/propuesta-visual-pdt-v4/mockup/mockup-v6.html` lineas 95-213 (bloque `<defs>`)
- **No modificar componentes** fuera de los 4 listados aqui — eso va en X-10 (cleanup final)
- **Validacion final:** preview URL del PR debe ser revisada visualmente antes de mergear a develop
