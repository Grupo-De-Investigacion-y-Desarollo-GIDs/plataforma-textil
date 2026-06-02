# SPEC V4 — X-06b: Mejoras de copy y estructura del landing público

> **Versión final** consolidando:
> - Spec X-06b preparado por Gerardo (2026-05-18)
> - 4 cambios agregados tras revisión Sergio + Claude Code (2026-05-18):
>   1. Imagen del diagrama de proceso en sección "Así funciona"
>   2. Nuevo logo PNG (`logo_header.png`) para reemplazar logo CSS
>   3. Observaciones sobre links rotos del carrusel
>   4. Confirmación expresa: canal de denuncia removido del scope V4

---

## 0. Pre-flight checks (BLOQUEANTE)

### 0.1 Verificar entorno

- [ ] X-06 mergeado (SHA `e775a95`) — landing actual
- [ ] X-04b mergeado — CMS de Novedades operativo
- [ ] Develop al día
- [ ] Branch creado: `feature/v4-x-06b-mejoras-landing`

### 0.2 Discovery de impacto E2E

```bash
# Tests E2E que verifican textos del landing actual
grep -rn "Soy taller\|Soy marca\|Conocé nuestro impacto\|Sumate a la transformación" tests/e2e/

# Tests que verifican secciones que vamos a eliminar
grep -rn "Para Taller\|Para Marca\|DOS CAMINOS\|UN ECOSISTEMA" tests/e2e/

# Tests que verifican textos del hero
grep -rn "Formalizá, conectá y trazá\|10\+ verificados\|Trazabilidad completa" tests/e2e/

# Tests del carrusel de novedades
grep -rn "Ver todas las novedades\|Novedades y capacitaciones" tests/e2e/
```

**REPORTAR:**
- Tests que se romperán con los cambios de copy
- Selectores E2E que dependen del copy actual
- Estimación de fixes en tests

### 0.3 Discovery de impacto técnico (incluye lección del enum X-06)

```bash
# Schema actual de tablas usadas en queries
grep -A 20 "^model Taller " prisma/schema.prisma
grep -A 20 "^model Marca " prisma/schema.prisma
grep -A 20 "^model Coleccion " prisma/schema.prisma
grep -A 20 "^model Pedido " prisma/schema.prisma

# Verificar si existe ContactoMarcaTaller (para stat #4)
grep -A 10 "model.*Contacto\|model.*Encuentro" prisma/schema.prisma

# VERIFICAR VALORES DE ENUMS (lección X-06)
grep -A 20 "enum EstadoPedido" prisma/schema.prisma
grep -A 10 "enum.*Coleccion" prisma/schema.prisma

# Estado actual del page.tsx (X-06 implementado)
wc -l src/app/page.tsx
grep -n "Soy taller\|Soy marca\|10\+ verificados\|DOS CAMINOS" src/app/page.tsx

# HeaderPublic actual: ¿tiene prop showPilotPill?
cat src/compartido/componentes/layout/header-public.tsx | grep -A 3 "interface.*Props\|showPilotPill"

# Layout (public) actual: ¿calcula showPilotPill server-side?
cat src/app/\(public\)/layout.tsx | grep -A 5 "showPilotPill\|VERCEL_ENV"

# Componente LogoPDT actual: ¿usa imagen o div CSS?
cat src/compartido/componentes/ui/logo-pdt.tsx 2>/dev/null | head -30

# Imágenes del carrusel
ls public/images/landing/ 2>/dev/null
ls public/seed/novedades/ 2>/dev/null

# Imagen del proceso (NUEVA) y logo (NUEVO) — verificar que se hayan subido
ls public/landing/proceso-textil.* 2>/dev/null
ls public/logo-pdt.* 2>/dev/null
```

**REPORTAR:**
- ¿Existe tabla ContactoMarcaTaller para stat #4? (decisión técnica)
- Si NO existe, ¿qué query usar como fallback?
- ¿HeaderPublic actual ya tiene prop showPilotPill? (probablemente NO)
- ¿Componente `<LogoPDT>` ya existe (X-02) y cómo renderiza el logo?
- ¿Las imágenes nuevas (proceso + logo) están subidas a `public/`?

### 0.4 Discovery de diseño / contenido

```bash
# Master V4 — verificar decisiones 3.1, 3.7, 3.8, 3.9, 3.10, 3.11
grep -B 2 -A 10 "3\.[1789]\|3\.10\|3\.11" .claude/specs/MASTER_V4.md 2>/dev/null

# Verificar que los anchors propuestos no choquen con otros
grep -rn "id=\"como-funciona\"\|id=\"impacto\"" src/app/
```

### 0.5 Output bloqueante

PAUSAR. Reportar a Gerardo. **NO avanzar sin aprobación explícita.**

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **ID** | X-06b |
| **Versión** | v4 |
| **Slug** | mejoras-landing |
| **Estimación** | 4-5h (sin contar generación de imágenes — ya están listas) |
| **Riesgo** | Bajo (1 archivo principal + HeaderPublic + LogoPDT + 2 assets a subir) |
| **Dependencias** | X-06 + X-04b — TODOS MERGEADOS |
| **Branch** | `feature/v4-x-06b-mejoras-landing` |

---

## 2. Contexto y motivación

### Por qué este spec

El landing implementado en X-06 replicó el mockup-v6 de Sergio **sin pasar por revisión de copy contra el master V4**. Sergio detectó 6 problemas al revisar dev:

1. **Choque con master 3.7** (narrativa Showcase + acompañamiento, no ranking): bullet "Capacitate y crecé de nivel" + card "10+ verificados"
2. **Choque con master 3.1** (Showcase + Match): H1 con jerga ("trazá"), stats V3
3. **CTAs vacíos:** "/impacto", "/novedades", "Para taller", "Para marcas" no existen
4. **Falta sección "Cómo funciona"** que explique el proceso
5. **Lenguaje no inclusivo** (excluye talleres en recorrido de formalización)
6. **Logo genérico:** se renderiza con `<div>` CSS + texto "PDT", sin usar el logo oficial con gradiente/profundidad

### Decisiones tomadas

```
Conflicto 1: Card flotante "10+ Talleres"
→ Decisión: REEMPLAZAR TEXTO pero mantener formato visual
→ Texto nuevo: "Acompañamos talleres del sector / Cada paso del recorrido cuenta con respaldo institucional"

Conflicto 2: Sección "Para Talleres / Para Marcas"
→ Decisión: ELIMINAR
→ Su función queda cubierta por nueva sección "Así funciona"

Conflicto 3: Banner final "Sumate a la transformación"
→ Decisión: ELIMINAR
→ Reemplazado por disclaimer institucional "Programa piloto en curso"

Conflicto 4 (NUEVO): Sección "Así funciona" texto vs imagen
→ Decisión: USAR IMAGEN del diagrama de proceso (3 nodos circulares)
   generada por IA + textos cortos como caption debajo de cada nodo
→ Archivo: public/landing/proceso-textil.webp (provisto por Sergio)

Conflicto 5 (NUEVO): Logo del header/footer
→ Decisión: REEMPLAZAR div CSS por imagen oficial
→ Archivo: public/logo-pdt.png (provisto por Sergio)

Conflicto 6 (NUEVO): Canal de denuncia en footer
→ Decisión: NO incluir en V4
→ Removido del scope por decisión institucional. Si OIT lo pide
   posteriormente, spec separado.
```

### Adicional: pill "Ambiente piloto" en HeaderPublic

Detectado por Gerardo: el HeaderPublic (X-06) NO muestra ningún indicador de ambiente. En dev/preview, alguien que entra al landing piensa que es producción real.

Solución: agregar pill condicional "Ambiente piloto" igual que en HeaderApp (X-05).

---

## 3. Validación interdisciplinaria

| Perspectiva | ¿Aplica? | Justificación |
|---|---|---|
| **Politólogo** | SÍ | Landing es cara pública de iniciativa OIT-UNTREF. Copy nuevo refleja tono institucional. Eliminación de banner "Sumate" baja tono comercial. |
| **Sociólogo** | SÍ | Copy nuevo no estigmatiza talleres en proceso de formalización. Inclusión sin idealización del informal. |
| **Sectorial** | SÍ | Sergio validó cada cambio contra master V4 línea por línea (decisiones 3.1, 3.7, 3.8, 3.9, 3.10, 3.11). Imagen del proceso revisada 2 veces (versión 1 tenía estrellas de rating que se eliminaron). |

---

## 4. Qué construir

### Archivos a modificar

1. **`src/app/page.tsx`** — La gran mayoría de cambios (copy, secciones, queries, integración de imagen)
2. **`src/compartido/componentes/layout/header-public.tsx`** — Agregar prop `showPilotPill`
3. **`src/app/(public)/layout.tsx`** — Calcular `showPilotPill` server-side
4. **`src/compartido/componentes/ui/logo-pdt.tsx`** — Refactor para usar `next/image` con PNG nuevo (si componente ya existe de X-02)

### Archivos NUEVOS a subir (assets)

5. **`public/logo-pdt.png`** — Logo oficial circular azul con "PDT" (provisto: `C:\Users\Sergio\Downloads\logo_header.png`)
6. **`public/landing/proceso-textil.webp`** — Diagrama de proceso de 3 nodos (provisto: `C:\Users\Sergio\Downloads\proceso_limpio_LANDING.png`, convertir a webp con [squoosh.app](https://squoosh.app))

### Estructura final del landing (7 secciones)

```
1. HeaderPublic (con LOGO NUEVO + pill "Ambiente piloto" si aplica)
2. Hero (con copy nuevo, 2 cards flotantes con textos nuevos)
3. Así funciona (SECCIÓN NUEVA — con IMAGEN del diagrama)
4. Impacto (con stats reformuladas)
5. Novedades y capacitaciones (sin "Ver todas")
6. Disclaimer piloto (BANDA NUEVA)
7. Footer (con LOGO NUEVO + links limpios)

ELIMINADAS:
- Sección "Para Talleres / Para Marcas" (las 2 cards lado a lado)
- Banner CTA final "Sumate a la transformación"
```

---

## 5. Prescripciones técnicas detalladas

### 5.1 — Subir assets

**Antes de tocar código:**

1. Tomar `C:\Users\Sergio\Downloads\logo_header.png` y guardarlo como `public/logo-pdt.png` en el repo
2. Tomar `C:\Users\Sergio\Downloads\proceso_limpio_LANDING.png`, convertirlo a `.webp` (compresión calidad 85, target <100KB), guardarlo como `public/landing/proceso-textil.webp`
3. Verificar:
   - `ls -lh public/logo-pdt.png` → ~10-30 KB
   - `ls -lh public/landing/proceso-textil.webp` → ~80-150 KB

### 5.2 — Componente `<LogoPDT>` (X-02 ya lo creó, hay que actualizarlo)

**Archivo:** `src/compartido/componentes/ui/logo-pdt.tsx`

Si el componente ya existe (de X-02), actualizar para usar `next/image`:

```tsx
import Image from 'next/image'

interface LogoPDTProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'full'
  className?: string
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
}

export function LogoPDT({ size = 'md', variant = 'icon', className = '' }: LogoPDTProps) {
  const px = sizeMap[size]
  return (
    <Image
      src="/logo-pdt.png"
      alt="Plataforma Digital Textil"
      width={px}
      height={px}
      priority={size !== 'sm'}
      className={className}
    />
  )
}
```

Si el componente NO existe todavía, crearlo siguiendo este patrón.

**Reemplazar en todas las apariciones del logo CSS en `page.tsx`:**

```tsx
// ANTES
<div className="rounded-full bg-brand-blue text-white flex items-center justify-center w-10 h-10">
  <span className="font-overpass font-bold text-xs">PDT</span>
</div>

// DESPUÉS
<LogoPDT size="md" />
```

### 5.3 — HeaderPublic con pill "Ambiente piloto"

**Archivo:** `src/compartido/componentes/layout/header-public.tsx`

```tsx
interface HeaderPublicProps {
  showPilotPill?: boolean
}

export function HeaderPublic({ showPilotPill = false }: HeaderPublicProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Izquierda: logo + nombre + PILL CONDICIONAL */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <LogoPDT size="md" />
              <div className="flex flex-col leading-tight">
                <span className="font-serif font-bold text-base text-ink-primary">
                  {INSTITUTIONAL.brandName}
                </span>
                <span className="font-overpass font-bold text-[10px] text-terra-600 uppercase tracking-wider">
                  {INSTITUTIONAL.brandSubtitle}
                </span>
              </div>
            </Link>

            {showPilotPill && (
              <span className="hidden md:inline-flex items-center px-2 py-1 rounded-full bg-pastel-yellow text-yellow-900 text-[10px] font-overpass font-bold uppercase tracking-wider">
                Ambiente piloto
              </span>
            )}
          </div>

          {/* Resto del header igual (nav reducido a 2 anchors) */}
          ...
        </div>
      </div>
    </header>
  )
}
```

**Layout (public):** verificar en pre-flight si calcula `showPilotPill`. Si no:

```tsx
// src/app/(public)/layout.tsx
const isMain = process.env.VERCEL_ENV === 'production'
const isLocal = !process.env.VERCEL_ENV
const showPilotPill = !isMain && !isLocal

<HeaderPublic showPilotPill={showPilotPill} />
```

### 5.4 — Nav del header: reducido a 2 links

```tsx
const HEADER_PUBLIC_NAV = [
  { label: '¿Cómo funciona?', href: '#como-funciona' },
  { label: 'Impacto', href: '#impacto' },
] as const

// ELIMINAR: 'Para taller', 'Para marcas', 'Recursos'
```

### 5.5 — Hero

```tsx
{/* ❌ ELIMINAR pill "Iniciativa de OIT y UNTREF" */}

{/* H1 nuevo */}
<h1 className="font-serif font-bold text-5xl lg:text-7xl text-ink-primary leading-tight">
  Hacé crecer tu taller. Conectá tu marca. <em className="italic">Empezá desde donde estés.</em>
</h1>

{/* Subtítulo nuevo */}
<p className="text-lg text-ink-secondary mt-6 max-w-xl">
  Plataforma pública de OIT y UNTREF que acompaña a talleres y marcas del sector textil argentino. Capacitaciones gratuitas, perfil profesional y conexión directa entre quienes producen y quienes buscan.
</p>

{/* Mantener 2 CTAs */}
<div className="flex gap-3 mt-8">
  <Link href="/registro?rol=TALLER" className="...">Soy taller</Link>
  <Link href="/registro?rol=MARCA" className="...">Soy marca</Link>
</div>

{/* Card flotante 1: NUEVO TEXTO */}
<div className="card-flotante-1">
  <h3 className="font-serif font-bold">Acompañamiento institucional</h3>
  <p>OIT y UNTREF respaldan tu recorrido</p>
</div>

{/* Card flotante 2: MANTENER con texto nuevo (decisión 2026-05-18) */}
<div className="card-flotante-2">
  <p className="font-serif font-bold">Acompañamos talleres del sector</p>
  <p className="text-sm">Cada paso del recorrido cuenta con respaldo institucional.</p>
</div>
{/* NO mostrar el "10+" — eliminamos la métrica de ranking */}
```

### 5.6 — Sección "Así funciona" (NUEVA, CON IMAGEN)

**Cambio respecto a versión anterior del spec:** la sección ya no son 3 párrafos narrativos sino una **imagen del diagrama** (3 nodos circulares conectados por flechas) + 3 columnas con caption corto debajo.

```tsx
<section id="como-funciona" className="bg-white py-24">
  <div className="max-w-6xl mx-auto px-6 lg:px-8">
    <div className="text-center mb-12">
      <p className="text-xs uppercase tracking-widest font-overpass font-bold text-terra-600 mb-2">
        Así funciona
      </p>
      <h2 className="font-serif font-bold text-4xl lg:text-5xl text-ink-primary mb-4">
        Acompañamos al sector textil en cada paso del recorrido.
      </h2>
    </div>

    {/* Imagen del diagrama de proceso */}
    <div className="mb-10">
      <Image
        src="/landing/proceso-textil.webp"
        alt="Diagrama del proceso: un taller textil se suma, una marca lo descubre, se contactan y trabajan juntos"
        width={1600}
        height={900}
        className="w-full h-auto"
        priority={false}
      />
    </div>

    {/* Captions debajo de cada nodo — grid 3 cols en desktop, 1 col en mobile */}
    <div className="grid md:grid-cols-3 gap-8 mt-8">
      <div className="text-center">
        <h3 className="font-serif font-bold text-lg text-ink-primary mb-2">
          1. Un taller textil se suma
        </h3>
        <p className="text-sm text-ink-secondary">
          Aprende con cursos gratuitos, arma su perfil y muestra lo que sabe hacer.
        </p>
      </div>
      <div className="text-center">
        <h3 className="font-serif font-bold text-lg text-ink-primary mb-2">
          2. Una marca lo descubre
        </h3>
        <p className="text-sm text-ink-secondary">
          Lo encuentra en el directorio y conoce sus capacidades, su trayectoria y su recorrido.
        </p>
      </div>
      <div className="text-center">
        <h3 className="font-serif font-bold text-lg text-ink-primary mb-2">
          3. Se contactan y trabajan juntos
        </h3>
        <p className="text-sm text-ink-secondary">
          Se conectan de forma directa y empiezan a trabajar juntos.
        </p>
      </div>
    </div>
  </div>
</section>
```

**Notas:**
- La imagen NO tiene texto incrustado (decisión confirmada al revisar versión 2 del diagrama)
- En mobile, los 3 captions se apilan verticalmente. La imagen se reduce proporcionalmente.
- Importante: `alt` text describe el diagrama para accesibilidad

### 5.7 — Sección Impacto

**Mantener:** kicker, H2, subtítulo, fondo oscuro.

**Eliminar:** CTA "Conocé nuestro impacto" (link a página que no existe).

**Reformular las 4 stats:**

```ts
const [
  vidrierasPublicadas,
  marcasExplorando,
  cursosPublicados,
  encuentrosGenerados,
] = await Promise.all([
  prisma.taller.count({ where: { verificadoAfip: true } }),
  prisma.marca.count(),
  prisma.coleccion.count({ where: { activa: true } }),
  // Decisión técnica en pre-flight: si existe ContactoMarcaTaller usar esa,
  // si no fallback a prisma.pedido.count()
  prisma.pedido.count(),
])

const STATS = [
  { value: vidrierasPublicadas, label: 'Vidrieras de talleres publicadas' },
  { value: marcasExplorando, label: 'Marcas explorando proveedores formales' },
  { value: cursosPublicados, label: 'Cursos publicados' },
  { value: encuentrosGenerados, label: 'Encuentros generados' },
]
```

**Fecha:** "Datos a mayo 2026" (estático por ahora).

### 5.8 — Carrusel Novedades

Mantener prácticamente igual. Solo:

- ❌ Eliminar link "Ver todas las novedades y cursos" al final
- ⚠️ **Observación:** las cards del carrusel apuntan a `/novedades/[slug]` y `/academia-publica` que NO EXISTEN (404). Ver sección **Observaciones** al final.

### 5.9 — ❌ ELIMINAR sección "Para Talleres / Para Marcas"

Eliminar el bloque completo con:
- Kicker "DOS CAMINOS · UN ECOSISTEMA"
- H2 "Para talleres y marcas del sector textil"
- 2 cards lado a lado (Talleres + Marcas con bullets)

Su función queda cubierta por la nueva sección "Así funciona".

### 5.10 — ❌ ELIMINAR Banner CTA "Sumate"

Eliminar el bloque completo con fondo brand-blue, título "Sumate a la transformación..." y los 2 botones.

### 5.11 — Disclaimer piloto (NUEVO)

Antes del footer:

```tsx
<section className="bg-pastel-yellow border-t border-yellow-200/50 py-4">
  <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
    <p className="text-xs text-ink-secondary">
      <span className="font-overpass font-bold">Programa piloto en curso.</span>{' '}
      Plataforma Digital Textil es una iniciativa de OIT Argentina y UNTREF
      en fase de piloto, Conurbano Sur, mayo 2026. Los datos y funcionalidades
      pueden evolucionar durante esta etapa.
    </p>
  </div>
</section>
```

### 5.12 — Footer: limpiar links muertos + usar logo nuevo

**Reemplazar el div CSS del logo en el footer por `<LogoPDT size="md" />`.**

**Columna Plataforma:**
- ❌ Eliminar: "Para taller", "Para marcas"
- ✅ Mantener: "¿Cómo funciona?" → #como-funciona
- ✅ Mantener: "Impacto" → #impacto

**Columna Recursos:**
- ❌ Eliminar: "Academia", "Novedades", "Guías y manuales"
- ✅ Mantener: "Centro de ayuda" → /ayuda
- ✅ Mantener: "Contacto" → mailto:soporte@plataformatextil.ar

**Columna Legal:**
- ❌ Eliminar: "Accesibilidad"
- ✅ Mantener: "Términos y condiciones" → /terminos
- ✅ Mantener: "Política de privacidad" → /privacidad

**❌ NO sumar canal de denuncia.** Decisión institucional: queda fuera del scope V4.

---

## 6. Casos borde

| # | Caso | Comportamiento |
|---|------|----------------|
| 1 | Counts en cero | Mostrar "0" igual. El disclaimer piloto explica el contexto. |
| 2 | Tabla ContactoMarcaTaller no existe | Usar `prisma.pedido.count()` con etiqueta "Encuentros generados" |
| 3 | Academia con < 4 cursos | Mostrar los que hay. Si hay < 2, ocultar sección |
| 4 | Imágenes carrusel no existen | Placeholder pastel + icono |
| 5 | Disclaimer "mayo 2026" se vuelve obsoleto | Aceptado: revisión manual cada trimestre. Documentado en KNOWN_ISSUES. |
| 6 | Production deploy (main) | Pill "Ambiente piloto" NO se muestra (showPilotPill=false) |
| 7 | Tests E2E rompen por copy nuevo | Actualizar tests en mismo PR |
| 8 | **(NUEVO)** Imagen del proceso no carga | `next/image` muestra placeholder; verificar visualmente en preview |
| 9 | **(NUEVO)** Logo PNG no carga | `next/image` muestra alt text "Plataforma Digital Textil"; verificar |
| 10 | **(NUEVO)** Imagen del proceso >200KB | Re-comprimir con squoosh.app; aceptar hasta 250KB si justificado |

---

## 7. Criterios de aceptación

### Assets subidos
- [ ] `public/logo-pdt.png` existe (~10-30 KB)
- [ ] `public/landing/proceso-textil.webp` existe (~80-150 KB)

### Logo
- [ ] `<LogoPDT>` usa `<Image src="/logo-pdt.png">` (no más `<div>` CSS)
- [ ] Logo visible en header y footer del landing
- [ ] Alt text: "Plataforma Digital Textil"

### Hero
- [ ] Pill "Iniciativa de OIT y UNTREF" eliminada
- [ ] H1: "Hacé crecer tu taller. Conectá tu marca. *Empezá desde donde estés.*"
- [ ] Subtítulo nuevo según 5.5
- [ ] Card flotante 1: "Acompañamiento institucional - OIT y UNTREF..."
- [ ] Card flotante 2: "Acompañamos talleres del sector / Cada paso del recorrido..."
- [ ] Sin "10+" en hero

### HeaderPublic
- [ ] Acepta prop `showPilotPill`
- [ ] Pill "Ambiente piloto" visible en dev/preview
- [ ] Pill NO visible en producción
- [ ] Nav reducido a 2 anchors: #como-funciona, #impacto
- [ ] Usa `<LogoPDT>` (no `<div>` CSS)

### Sección "Así funciona"
- [ ] Existe con `id="como-funciona"`
- [ ] Entre Hero e Impacto
- [ ] **Imagen** del diagrama presente (no 3 párrafos narrativos)
- [ ] 3 captions debajo (1. Un taller / 2. Una marca / 3. Se contactan)
- [ ] En mobile, captions se apilan verticalmente
- [ ] Alt text de la imagen describe el diagrama

### Impacto
- [ ] 4 stats reformuladas
- [ ] CTA "Conocé nuestro impacto" eliminado
- [ ] Fecha "Datos a mayo 2026"
- [ ] Anchor `id="impacto"` presente

### Novedades
- [ ] Sección mantenida
- [ ] Link "Ver todas" eliminado

### Eliminaciones
- [ ] Sección "Para Talleres / Para Marcas" ELIMINADA
- [ ] Banner "Sumate" ELIMINADO

### Disclaimer + Footer
- [ ] Disclaimer "Programa piloto en curso" agregado antes del footer
- [ ] Footer con links limpios (sin destinos 404)
- [ ] Footer usa `<LogoPDT>` (no `<div>` CSS)
- [ ] **NO hay link a denuncia** (confirmación explícita)

### Build y tests
- [ ] `npm run build` pasa
- [ ] Tests E2E actualizados si rompían
- [ ] CI verde
- [ ] Verificación visual en preview
- [ ] Lighthouse: imagen del proceso no degrada performance > 5 puntos

---

## 8. Plan de implementación

1. **Pre-flight checks (15 min)** — Sección 0
2. **Subir assets (10 min)** — Mover logo_header.png y convertir proceso_limpio_LANDING.png a webp
3. **Actualizar `<LogoPDT>` (15 min)** — Refactor a next/image
4. **HeaderPublic con showPilotPill (20 min)**
5. **Layout (public) o page.tsx según corresponda (10 min)** — Calcular showPilotPill
6. **Hero rediseñado (30 min)** — H1, subtítulo, cards flotantes, usar `<LogoPDT>`
7. **Sección "Así funciona" con imagen (25 min)** — Nueva sección con `<Image>` + grid de captions
8. **Impacto reformulado (20 min)** — Stats, queries, eliminar CTA
9. **Eliminar secciones obsoletas (15 min)** — Para Talleres/Marcas, Banner Sumate
10. **Disclaimer piloto (10 min)**
11. **Limpiar nav y footer (15 min)** — Links muertos + usar `<LogoPDT>`
12. **Tests E2E (30 min)** — Actualizar tests si rompen
13. **Verificación visual (30 min)** — Probar en preview
14. **Commit + PR (15 min)**

**Total estimado: 4h 20min**

---

## 9. Selectores críticos (a completar en pre-flight)

[A COMPLETAR DESPUÉS DE SECCIÓN 0]

Posibles selectores que pueden requerir cuidado:
- Tests que buscan "Soy taller" / "Soy marca" en el landing
- Tests que verifican textos de stats
- Tests del nav del header público
- Tests de existencia de las secciones que vamos a eliminar
- Tests que esperen renderizado del logo como `<div>` (cambiarán al ser `<Image>`)

---

## 10. Observaciones (no son blockers de este spec)

### 10.1 Links rotos en el carrusel — pendiente para spec siguiente

El carrusel de novedades del landing tiene 3 cards que apuntan a páginas que NO EXISTEN:

| Link | Estado | Origen |
|---|---|---|
| `/academia-publica` | ❌ 404 | Card "Curso" del carrusel |
| `/novedades/capacitaciones-costura-inti` | ❌ 404 | Card "Novedad" del carrusel |
| `/novedades/indicador-127-talleres` | ❌ 404 | Card "Indicador" del carrusel |

**Estado actual:**
- X-04 creó solo el endpoint `GET /api/novedades` y modelo Prisma, pero NO las páginas públicas individuales
- No hay página `/academia-publica` ni `/novedades/[slug]`

**Recomendación:**
- En este spec X-06b, mantener el carrusel pero **hacer no clickeables las cards** (sin `<Link>`) o **cambiar el href a `#`** hasta que existan las páginas
- Crear spec separado (X-06c o equivalente) que cree `/novedades/[slug]` y `/academia-publica` como páginas públicas alimentadas por el endpoint X-04

### 10.2 Canal de denuncia: removido del scope V4

Decisión institucional (2026-05-18): el canal de denuncia público **no se incluye en V4**. La página `/denunciar` existe en el código (`src/app/(public)/denunciar/page.tsx`) pero NO se enlaza desde el landing público.

Si OIT lo requiere posteriormente como requisito normativo, abrir spec separado.

### 10.3 Verificación pública de certificados: no enlazada

La página `/verificar` existe en el código pero tampoco se enlaza desde el landing. Decisión similar a la denuncia: queda como funcionalidad disponible vía URL directa pero sin presencia en landing público.

### 10.4 Validación con OIT pendiente

Antes del merge a `main` (no a develop), conviene validar con OIT:

1. H1 final ("Hacé crecer tu taller. Conectá tu marca. Empezá desde donde estés.")
2. Etiqueta del stat #4 ("Encuentros generados")
3. Texto del disclaimer piloto

---

**Fin del SPEC X-06b — Mejoras de copy y estructura del landing (versión FINAL)**

> Spec consolidado: Gerardo (X-06b base) + Sergio (decisiones de copy + imagen del proceso + logo nuevo + observaciones)
> Próximo paso: ejecutar Sección 0 (pre-flight checks) antes de implementar
