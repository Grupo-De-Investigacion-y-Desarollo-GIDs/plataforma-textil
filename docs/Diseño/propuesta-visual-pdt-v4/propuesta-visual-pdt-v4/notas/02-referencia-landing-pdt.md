# Análisis de referencia: Landing PDT (rediseño)

**Archivo:** `benchmark/landing-pdt-referencia.png`
**Origen:** aportada por Sergio (pendiente confirmar si es propuesta interna del equipo o inspiración externa)
**Relevancia:** ALTA — es una versión madura de la misma identidad visual de PDT

---

## Diagnóstico rápido

Esta referencia mantiene la identidad de marca actual (azul brand, logo PDT, paleta institucional) pero **resuelve casi todos los problemas** que detectamos en Fase 1. Es exactamente el tipo de "facelift Nivel 1+2+3" que recomendé para v4.

---

## Lo que toma de lo actual y respeta

- ✅ **Color brand-blue** mantenido como identidad
- ✅ **Logo PDT circular** (pero usado mejor)
- ✅ **Mensaje OIT+UNTREF** como sello institucional
- ✅ **División por roles** (Taller / Marca / Estado)
- ✅ **Niveles Bronce/Plata/Oro** (implícito en la propuesta)

## Lo que cambia respecto al actual

### Header (Nivel 3)
| Actual | Referencia |
|---|---|
| 4 bandas verticales (~150px) | 1 banda blanca limpia (~70px) |
| Logo PDT + título "Plataforma Digital Textil" en banner azul gigante | Logo PDT chico + título en 2 líneas a la izquierda |
| Tabs azules abajo | Nav horizontal en la misma banda |
| Sin botones de CTA | 2 botones siempre visibles: "Soy taller" + "Soy marca" |

**Implementable:** sí, es exactamente el patrón Nivel 3 del header que propuse.

### Tipografía (Nivel 1)
- Títulos **grandes y bold** (probablemente 3-4rem para H1)
- **Palabra clave del hero en color brand** ("trazá" en azul)
- Body regular en gris oscuro / negro (no azul como el actual)
- **Mayor contraste de jerarquía** entre H1, H2, body

**Cambio en globals.css:**
- Body color: `#1e2dbe` → `#1a1a2e` o gris oscuro
- H1 size: `2.5rem` → `3.5rem`
- Mantener Overpass para headings, Noto Sans para body

### Sistema de iconos (Nivel 2 — nuevo)
- **Iconos circulares con fondo pastel**:
  - Azul claro pastel para Taller / "Para cada actor"
  - Verde claro pastel para Marca / Trazabilidad
  - Lila/púrpura claro pastel para Estado / Capacitación
- Cada ícono dentro de un círculo de ~80px
- Tres niveles de pastel para diferenciar roles/funciones

**Implementación:**
```jsx
<div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
  <FactoryIcon className="w-8 h-8 text-brand-blue" />
</div>
```

### Cards (Nivel 2)
- Border más sutil
- Sombra muy suave
- Padding generoso (más respiración)
- Lista interna con checkmarks verdes
- Link al fondo "Quiero formalizarme →" como CTA terciario

### Color coding por audiencia (Nivel 1)
- **Talleres** → azul brand
- **Marcas** → verde
- **Estado** → lila/púrpura
- Aplicado en: bordes de card, color del ícono, link

**Importante:** esto es coherente con el código actual (las tabs y badges ya usan distintos colores por rol). Hay que extender el patrón.

### Imágenes (Nivel 2)
- **Foto real** de taller textil (humana, contextual) en lugar de ilustraciones
- Recorte circular/orgánico (la imagen está dentro de un círculo blando, no rectangular)
- Card flotante encima de la imagen → patrón "image + overlay card"

**Recurso:** habría que tener un banco de fotos del sector. Una sola foto buena en hero alcanza para arrancar.

### Stats / Números (Nivel 1)
- Número grande, font-bold, color negro
- Label chico debajo en gris
- Ícono circular pastel arriba
- 4 stats en fila

Vs actual: en el dashboard actual los números están en colores random (rojo, verde, azul). Acá: **números en negro/gris oscuro**, el ícono pastel da el color por categoría.

### Footer (nuevo)
La plataforma actual NO tiene footer real. La referencia sí:
- 4 columnas: Logo+descripción / Navegación / Recursos / Legal + Social
- Copyright al fondo

Es contenido nuevo pero estructuralmente trivial. **Vale la pena agregarlo.**

### CTA banner antes del footer
Banner azul brand a ancho completo: "Sumate a la transformación del sector textil" + 2 botones blancos (Soy taller / Soy marca).

Patrón usable también en pantallas internas como banner de "próxima acción recomendada".

---

## Tokens visuales que extraigo (sirven para rediseño completo)

### Paleta extendida
```css
--color-brand-blue: #1E2DBE;        /* mantener */
--color-brand-blue-dark: #161D8F;    /* topbar, hover */

/* Pastels nuevos */
--color-pastel-blue: #EBF2FE;        /* fondo ícono taller */
--color-pastel-green: #E6F5EE;       /* fondo ícono marca */
--color-pastel-purple: #F0EBFA;      /* fondo ícono estado */
--color-pastel-yellow: #FEF6E5;      /* fondo destacados */

/* Texto */
--color-text-primary: #1A1A2E;       /* casi negro, NO azul brand */
--color-text-secondary: #6B7280;     /* gris para subtítulos */
--color-text-muted: #9CA3AF;         /* gris claro para captions */
```

### Tipografía
```css
/* H1 hero */ font-overpass font-bold text-5xl    /* 3rem */
/* H1 página */ font-overpass font-bold text-4xl  /* 2.25rem */
/* H2 sección */ font-overpass font-bold text-3xl /* 1.875rem */
/* H3 card */ font-overpass font-semibold text-xl /* 1.25rem */
/* body */ font-sans text-base text-gray-700      /* gris oscuro */
/* small */ font-sans text-sm text-gray-500
```

### Iconografía
- Lucide React ya está instalado (`lucide-react`) — perfecto
- Tamaños: 32px (hero/sección), 24px (cards), 20px (lista), 16px (inline)
- Patrón consistente: ícono dentro de círculo pastel

### Border radius / sombras
```css
--radius-card: 1rem;      /* rounded-2xl */
--radius-button: 0.625rem; /* rounded-lg */
--radius-icon: 9999px;    /* rounded-full */

--shadow-card: 0 4px 12px 0 rgb(0 0 0 / 0.04);
--shadow-card-hover: 0 8px 24px 0 rgb(0 0 0 / 0.08);
```

---

## Cómo aplicar a las pantallas internas (lo más relevante)

La referencia es una landing pública, pero los principios se aplican al app interno:

| Aplica a | Cómo |
|---|---|
| **Header de TALLER/MARCA/ESTADO** | Reducir las 4 bandas a 1 (logo + nav + user) |
| **Dashboard cards** | Ícono pastel circular + número grande negro + label gris |
| **Acciones rápidas** | Cards con ícono pastel + título + descripción |
| **CTAs primarios** | Botón azul brand fuerte (ya está) — mantener |
| **CTAs secundarios** | Botón outline azul (vs el actual gris) |
| **Body text** | Cambiar de azul a gris oscuro/negro |
| **Footer** | Agregar (no existe) |

---

## Lo que NO sirve copiar tal cual

- **Hero con imagen** → solo aplica al landing público y registro/login. En dashboards internos no va imagen grande.
- **Timeline "¿Cómo funciona?"** → es de marketing. En el app interno no aplica.
- **Testimonios** → solo landing.
- **CTA banner final** → adaptable como "Próxima acción recomendada" en dashboards.

---

## Decisión clave para el equipo

**Pregunta abierta:** esta referencia ¿es:

(a) Una **propuesta interna** ya hecha por alguien (Gerardo / equipo / diseñador externo)?
   → Si es así, la propuesta v4 es esencialmente "implementemos esto"

(b) Una **inspiración externa** que Sergio encontró en alguna parte?
   → Si es así, la usamos como referencia y construimos desde ella

**Esto cambia el alcance del trabajo:**
- Caso (a): el doc final para Gerardo es básicamente un plan de implementación tomando esta referencia como ground truth
- Caso (b): seguimos con Fase 2 (más benchmarking) para no quedarnos con una sola fuente
