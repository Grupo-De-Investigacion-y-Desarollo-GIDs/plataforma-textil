# Arquitectura — Plataforma Digital Textil

Este documento describe la arquitectura técnica del proyecto. Se actualiza a medida que se implementan cambios significativos.

---

## Design tokens V4

**Spec:** X-01 (Tokens visuales V4)
**Archivo:** `src/app/globals.css`
**Fuentes:** `public/fonts/`

### Sistema de tokens

PDT V4 usa `@theme inline` de Tailwind v4 para definir tokens de diseño como variables CSS que generan clases utilitarias automáticamente.

```
@theme inline {
  --color-brand-blue: #1E2DBE;     → bg-brand-blue, text-brand-blue, etc.
  --color-terra-600: #C2410C;      → bg-terra-600, text-terra-600, etc.
  --font-serif: 'Source Serif 4';  → font-serif
  --radius-card: 1rem;             → rounded-card (vía @utility si se define)
  --shadow-card: ...;              → shadow-card
}
```

### Paleta de colores

| Grupo | Tokens | Uso |
|---|---|---|
| **Brand** | `brand-blue`, `brand-blue-dark`, `brand-blue-hover`, `brand-red`, `brand-bg-light`, `brand-topbar`, `brand-tabnav` | Identidad institucional, header, botones primarios |
| **Terracotta** | `terra-50` a `terra-700` | Acento editorial del sector textil (pills, badges, acentos) |
| **Pastels** | `pastel-blue`, `pastel-green`, `pastel-purple`, `pastel-yellow`, `pastel-terra`, `pastel-red` | Fondos de íconos circulares, backgrounds suaves |
| **Ink** | `ink-primary`, `ink-secondary`, `ink-muted` | Texto: casi-negro (#0F0F1E), gris medio, gris claro |
| **Status** | `status-success`, `status-warning`, `status-error`, `status-info`, `status-muted` | Semáforos semánticos |

### Tipografía (3 fuentes)

| Fuente | Token | Uso | Formato |
|---|---|---|---|
| **Inter** | `--font-sans` | Body text, párrafos, descripciones | Variable woff2, self-hosted |
| **Source Serif 4** | `--font-serif` | Titulares H1 (editorial) | Variable woff2, self-hosted |
| **Overpass** | `--font-overpass` | UI: botones, labels, captions, nav, H2-H6 | Static woff2, self-hosted |

Jerarquía CSS:
- `body` → Inter
- `h1` → Source Serif 4
- `h2-h6`, `nav`, `button`, `select`, `input`, `label` → Overpass

### Self-hosting de fuentes

Todas las fuentes están en `public/fonts/` como archivos `.woff2`. No se usa Google Fonts CDN.

Archivos actuales:
- `Inter-Variable.woff2` (~100-130 KB)
- `SourceSerif4-Variable.woff2` (~80-100 KB)
- `NotoSans-latin.woff2` (35 KB, legacy)
- `NotoSans-latin-ext.woff2` (165 KB, legacy)
- `Overpass-latin.woff2` (39 KB)
- `Overpass-latin-ext.woff2` (45 KB)

Noto Sans se mantiene como legacy pero ya no se asigna a body. Migración gradual a Inter en specs futuros.

### Variables legacy (compatibilidad)

En `:root` se mantienen variables CSS planas para código que usa `var(--brand-blue)` directamente:

```css
:root {
  --brand-blue: #1E2DBE;
  --brand-red: #FA3C4B;
  --brand-bg-light: #EBF2FE;
}
```

Estas NO generan clases Tailwind (eso lo hace `@theme inline`).

### Sombras

| Token | Uso |
|---|---|
| `shadow-soft` | Elementos sutiles |
| `shadow-card` | Cards en reposo |
| `shadow-card-hover` | Cards en hover |
| `shadow-modal` | Modales y overlays |

### Radios

| Token | Valor | Uso |
|---|---|---|
| `radius-card` | 1rem (16px) | Cards |
| `radius-button` | 0.625rem (10px) | Botones |
| `radius-icon` | 9999px | Íconos circulares |
| `radius-input` | 0.5rem (8px) | Inputs |

---

**Última actualización:** Mayo 2026 (Spec X-01)
