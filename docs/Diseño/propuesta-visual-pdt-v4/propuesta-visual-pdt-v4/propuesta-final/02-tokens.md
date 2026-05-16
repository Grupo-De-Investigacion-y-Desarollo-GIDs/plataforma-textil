# Design tokens — PDT v4

Listo para pegar en `src/app/globals.css`. Usa la sintaxis de Tailwind v4 con `@theme inline`.

---

## Imports de fuentes (mantener locales)

Los archivos `Overpass-*.woff2` y `NotoSans-*.woff2` ya están en `public/fonts/`. **Agregar dos fuentes nuevas locales:**

1. **Source Serif 4** (Adobe, OFL) — para titulares
   - Descargar: https://fonts.google.com/specimen/Source+Serif+4
   - Pesos: 400 / 600 / 700 (variable opcional)
2. **Inter** (Rasmus Andersson, OFL) — para body
   - Descargar: https://fonts.google.com/specimen/Inter
   - Pesos: 400 / 500 / 600 / 700

Bajar a `public/fonts/` y agregar `@font-face` similares a los existentes.

> Alternativa rápida (NO recomendada para producción): usar Google Fonts CDN. Pero el equipo ya optó por self-hosting, así que mantener esa decisión.

---

## globals.css — bloque `@theme inline` completo

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* --- Local @font-face declarations existentes (Noto Sans, Overpass) --- */
/* ... mantener los existentes ... */

/* --- NUEVAS @font-face --- */

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

@theme inline {
  /* ─────────────────────────────────────────── */
  /* COLORES — paleta semántica                  */
  /* ─────────────────────────────────────────── */

  /* Brand */
  --color-brand-blue: #1E2DBE;
  --color-brand-blue-dark: #161D8F;
  --color-brand-blue-hover: #1A27A8;

  /* Acento NUEVO */
  --color-terra-50: #FFF4ED;
  --color-terra-100: #FFE4D3;
  --color-terra-300: #FDB088;
  --color-terra-600: #C2410C;
  --color-terra-700: #9A3412;

  /* Pastels (íconos + backgrounds suaves) */
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

  /* ─────────────────────────────────────────── */
  /* TIPOGRAFÍA                                  */
  /* ─────────────────────────────────────────── */
  --font-sans: 'Inter', sans-serif;          /* body */
  --font-overpass: 'Overpass', sans-serif;   /* UI: botones, labels, captions */
  --font-serif: 'Source Serif 4', serif;     /* titulares: H1, H2, H3 destacados */

  /* ─────────────────────────────────────────── */
  /* RADIOS                                      */
  /* ─────────────────────────────────────────── */
  --radius-card: 1rem;        /* rounded-card → 16px */
  --radius-button: 0.625rem;  /* rounded-lg → 10px */
  --radius-icon: 9999px;      /* rounded-full */
  --radius-input: 0.5rem;     /* rounded-md → 8px */

  /* ─────────────────────────────────────────── */
  /* SOMBRAS                                     */
  /* ─────────────────────────────────────────── */
  --shadow-soft: 0 2px 8px 0 rgb(15 15 30 / 0.04);
  --shadow-card: 0 4px 20px 0 rgb(15 15 30 / 0.04);
  --shadow-card-hover: 0 12px 32px 0 rgb(15 15 30 / 0.10);
  --shadow-modal: 0 24px 48px 0 rgb(15 15 30 / 0.16);
}

/* ─────────────────────────────────────────── */
/* RESETS Y BASE                               */
/* ─────────────────────────────────────────── */
:root {
  /* mantener compat con código que use var(--brand-blue) */
  --brand-blue: #1E2DBE;
  --brand-red: #FA3C4B;
  --brand-bg-light: #EBF2FE;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: #F8F9FB;
  color: #0F0F1E;          /* IMPORTANTE: era #1e2dbe (azul). Ahora casi-negro. */
  -webkit-font-smoothing: antialiased;
}

/* H1 grandes en serif por defecto, los demás en Overpass */
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

/* Scrollbar más sutil */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(15, 15, 30, 0.1); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(15, 15, 30, 0.2); }

/* Pattern textil sutil — clase utilitaria opcional */
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

---

## Cambios respecto al `globals.css` actual

| Token actual | Cambia a | Por qué |
|---|---|---|
| `body color: #1e2dbe` | `body color: #0F0F1E` | El azul brand como color de body bajaba contraste/jerarquía. |
| Sin `--font-serif` | Source Serif 4 | Carácter editorial sobrio para titulares importantes. |
| Sin `--color-terra-*` | 5 tonos terracotta | Color de acento nuevo, coherente con sector textil. |
| Sin `--color-pastel-*` | 6 pastels | Sistema de fondos suaves para íconos circulares. |
| Sin `--color-ink-*` | 3 tonos de gris | Reemplaza el azul brand como color de texto body. |
| `--shadow-card: 0 1px 3px ...` | `0 4px 20px 0 rgb(15 15 30 / 0.04)` | Más blando, menos "sticker". |

---

## Checklist de migración (Gerardo)

- [ ] Bajar `Source Serif 4` y `Inter` a `public/fonts/` como `.woff2`
- [ ] Reemplazar bloque `@theme inline` en `src/app/globals.css`
- [ ] Cambiar `body { color: #1e2dbe }` a `color: #0F0F1E`
- [ ] Build y verificar que las fuentes cargan (network tab del browser)
- [ ] Run `next dev` y abrir cualquier página — verificar que el body text se ve gris oscuro, no azul
- [ ] Si todo OK: commit como `feat(visual): tokens v4 (paleta extendida + tipografías Source Serif/Inter)`

**Sin componentes tocados todavía** — los tokens se propagan solos al resto. Las pantallas se van a ver "casi igual" excepto por el color del body text (más legible).
