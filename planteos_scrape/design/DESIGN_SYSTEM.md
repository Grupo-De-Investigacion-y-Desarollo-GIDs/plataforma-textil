# DESIGN SYSTEM - Plataforma Digital Textil OIT

> Documentación para replicar el diseño en Next.js + Tailwind CSS

---

## 1. PALETA DE COLORES

### Colores Principales (CSS Variables)
```css
:root {
  --brand-blue: #1e2dbe;      /* Azul principal - headers, títulos, navegación */
  --brand-red: #fa3c4b;       /* Rojo/Rosa - acentos, indicadores activos */
  --brand-bg-light: #ebf5fd;  /* Fondo claro azulado - cards, secciones */
  --text-main: #1e2dbe;       /* Texto principal */
}
```

### Tailwind Config Sugerido
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1e2dbe',
          red: '#fa3c4b',
          'bg-light': '#ebf5fd',
        },
        // Estados
        success: '#22c55e',    // Verde - completado
        warning: '#f97316',    // Naranja - pendiente
        muted: '#9ca3af',      // Gris - no iniciado
      }
    }
  }
}
```

### Colores por Uso
| Elemento | Color | Hex |
|----------|-------|-----|
| Header background | Azul oscuro | `#1e2dbe` |
| Top bar | Azul más oscuro | `#161d8f` |
| Tab activo | Blanco con borde rojo inferior | `#ffffff` + border `#fa3c4b` |
| Texto títulos | Azul brand | `#1e2dbe` |
| Badge "En proceso" | Borde naranja, texto naranja | `#f97316` |
| Completado | Verde | `#22c55e` |
| Pendiente | Naranja | `#f97316` |
| No iniciado | Gris | `#9ca3af` |
| Fondo cards | Azul muy claro | `#ebf5fd` |
| Botón primario | Azul brand | `#1e2dbe` |
| Botón CTA | Verde | `#22c55e` |

---

## 2. TIPOGRAFÍA

### Fuentes
```css
/* Fuente principal para body */
font-family: 'Noto Sans', sans-serif;

/* Fuente para headings, nav, botones, inputs */
font-family: 'Overpass', sans-serif;
```

### Google Fonts Import
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Overpass:wght@600;700;800;900&display=swap" rel="stylesheet">
```

### Tailwind Config
```js
fontFamily: {
  sans: ['Noto Sans', 'sans-serif'],
  overpass: ['Overpass', 'sans-serif'],
}
```

### Jerarquía Tipográfica
| Elemento | Font | Weight | Size | Clase Tailwind |
|----------|------|--------|------|----------------|
| H1 (página) | Overpass | 700 | 2.5rem | `font-overpass font-bold text-4xl` |
| H2 (sección) | Overpass | 700 | 1.5rem | `font-overpass font-bold text-2xl` |
| H3 (card) | Overpass | 600 | 1.25rem | `font-overpass font-semibold text-xl` |
| Body | Noto Sans | 400 | 1rem | `font-sans text-base` |
| Small/Caption | Noto Sans | 400 | 0.875rem | `font-sans text-sm` |
| Label | Overpass | 500 | 0.75rem | `font-overpass font-medium text-xs uppercase tracking-wider` |

---

## 3. LAYOUT Y ESTRUCTURA

### Header Principal
```
┌─────────────────────────────────────────────────────────────────┐
│ [Top Bar - azul oscuro]                                         │
│ 🌐 ESPAÑOL  |  Auditorías  Capacitaciones  Mi Perfil  V1.3 Salir│
├─────────────────────────────────────────────────────────────────┤
│ [Header - azul]                                                 │
│ [Logo PDT]  Plataforma Digital Textil                           │
│             MARCA: URBANO KIDS                                  │
├─────────────────────────────────────────────────────────────────┤
│ [Tabs - fondo oscuro, tab activo blanco]                        │
│ Tablero | Mi Formalización* | Crear pedido | Mis pedidos | ...  │
│         └── borde rojo inferior cuando activo                   │
└─────────────────────────────────────────────────────────────────┘
```

### Navegación Principal (Tabs)
- **Items:** Tablero, Mi Formalización, Crear pedido, Mis pedidos, Explorar talleres, Más +
- **Tab activo:** fondo blanco, borde inferior rojo (#fa3c4b), texto azul
- **Tab inactivo:** fondo transparente, texto blanco

### Grid Principal
```jsx
// Layout de 2 columnas en desktop
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Contenido principal */}
  </div>
  <div className="lg:col-span-1">
    {/* Sidebar derecho */}
  </div>
</div>
```

---

## 4. COMPONENTES

### 4.1 Logo PDT
```jsx
<div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
  <span className="font-overpass font-bold text-brand-blue text-lg">PDT</span>
</div>
```

### 4.2 Badge de Estado
```jsx
// Estado: En Proceso
<span className="px-4 py-2 rounded-full border-2 border-orange-500 text-orange-500 font-overpass font-semibold text-sm">
  ESTADO: EN PROCESO (40%)
</span>

// Estado: Completado
<span className="text-green-500 font-semibold text-sm">
  COMPLETADO
</span>
```

### 4.3 Progress Ring (Gráfico Circular)
```jsx
// SVG circular progress - 40% completado
<div className="relative w-40 h-40">
  <svg className="w-full h-full transform -rotate-90">
    {/* Background circle */}
    <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none"/>
    {/* Progress circle */}
    <circle cx="80" cy="80" r="70" stroke="#fa3c4b" strokeWidth="12" fill="none"
      strokeDasharray="440" strokeDashoffset="264" strokeLinecap="round"/>
  </svg>
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <span className="text-4xl font-overpass font-bold text-brand-red">40%</span>
    <span className="text-xs text-gray-400 tracking-widest">COMPLETADO</span>
  </div>
</div>
```

### 4.4 Stat Card (Métricas)
```jsx
<div className="text-center">
  <div className="text-3xl font-overpass font-bold text-green-500">7/8</div>
  <div className="text-xs text-gray-500 uppercase tracking-wider">COMPLETADAS</div>
  <div className="w-full h-1 bg-green-500 rounded mt-2"/>
</div>
```

### 4.5 Checklist Item
```jsx
<div className="flex items-center justify-between py-4 border-b border-gray-100">
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
      <CheckIcon className="w-4 h-4 text-green-500"/>
    </div>
    <div>
      <div className="font-overpass font-semibold text-brand-blue">CUIT válido</div>
      <div className="text-sm text-gray-500">VERIFICADO CON ARCA - 30-12345678-9</div>
    </div>
  </div>
  <span className="text-green-500 font-semibold text-sm">COMPLETADO</span>
</div>
```

### 4.6 Info Card (Mensaje destacado)
```jsx
<div className="bg-brand-bg-light rounded-lg p-4 border-l-4 border-brand-red">
  <div className="flex gap-3">
    <span className="text-2xl">🚀</span>
    <div>
      <span className="font-semibold text-brand-blue">¡Excelente posicionamiento!</span>
      <span className="text-gray-600"> Al superar el </span>
      <span className="text-brand-red font-bold">80%</span>
      <span className="text-gray-600">, tu taller aparece primero...</span>
    </div>
  </div>
</div>
```

### 4.7 Sidebar Card
```jsx
<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
  <h3 className="font-overpass font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">
    TU POSICIÓN
  </h3>
  <div className="text-4xl font-overpass font-bold text-brand-red mb-1">41%</div>
  <div className="text-xs text-gray-500 uppercase">TU PROGRESO ACTUAL</div>

  <div className="mt-4 space-y-2 text-sm">
    <div className="flex justify-between">
      <span className="text-gray-500">PROMEDIO TALLERES SIMILARES:</span>
      <span className="text-brand-blue font-semibold">78%</span>
    </div>
  </div>
</div>
```

### 4.8 CTA Button
```jsx
<button className="w-full bg-green-500 hover:bg-green-600 text-white font-overpass font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
  <PhoneIcon className="w-5 h-5"/>
  AGENDAR LLAMADA
</button>
```

---

## 5. ESPACIADO Y BORDES

### Espaciado Base
- **Gap entre secciones:** `gap-6` (1.5rem)
- **Padding cards:** `p-6` (1.5rem)
- **Padding contenedor:** `px-6 lg:px-8`
- **Margen entre items lista:** `space-y-4`

### Border Radius
- **Cards:** `rounded-xl` (0.75rem)
- **Botones:** `rounded-lg` (0.5rem)
- **Badges:** `rounded-full`
- **Inputs:** `rounded-lg`

### Sombras
```js
boxShadow: {
  'card': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
}
```

---

## 6. RESPONSIVE BREAKPOINTS

### Mobile First
```jsx
// Ejemplo de grid responsive
<div className="
  grid
  grid-cols-1           // Mobile: 1 columna
  md:grid-cols-2        // Tablet: 2 columnas
  lg:grid-cols-3        // Desktop: 3 columnas
  gap-4
  md:gap-6
">
```

### Header Mobile
- Logo y título se apilan verticalmente
- Navegación colapsa en menú hamburguesa
- Top bar se simplifica

---

## 7. ICONOS

Usar **Lucide React** o **Heroicons**:
- Check circle (completado)
- Clock (pendiente)
- AlertTriangle (warning)
- Phone (agendar llamada)
- Search (buscar)
- Globe (idioma)
- ChevronDown (expandir)
- Menu (hamburguesa)

---

## 8. ANIMACIONES

```js
// tailwind.config.js
animation: {
  'progress': 'progress 1s ease-out forwards',
},
keyframes: {
  progress: {
    '0%': { strokeDashoffset: '440' },
    '100%': { strokeDashoffset: 'var(--progress-value)' },
  }
}
```

---

## 9. ESTRUCTURA DE CARPETAS NEXT.JS SUGERIDA

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── tablero/
│   ├── formalizacion/
│   ├── pedidos/
│   ├── academia/
│   └── explorar/
├── components/
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressRing.tsx
│   │   └── StatCard.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── TopBar.tsx
│   │   ├── TabNav.tsx
│   │   └── Sidebar.tsx
│   └── features/
│       ├── formalizacion/
│       │   ├── ChecklistItem.tsx
│       │   └── ProgressCard.tsx
│       └── talleres/
├── lib/
│   └── utils.ts
└── styles/
    └── globals.css
```

---

## 10. CÓDIGO BASE TAILWIND

### globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --brand-blue: #1e2dbe;
  --brand-red: #fa3c4b;
  --brand-bg-light: #ebf5fd;
  --text-main: #1e2dbe;
}

body {
  font-family: 'Noto Sans', sans-serif;
  background-color: #fff;
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6,
nav, button, select, input, label,
.font-overpass {
  font-family: 'Overpass', sans-serif !important;
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: var(--brand-blue);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--brand-red);
}
```
