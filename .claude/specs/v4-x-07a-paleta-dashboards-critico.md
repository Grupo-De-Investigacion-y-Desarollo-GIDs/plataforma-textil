# SPEC V4 — X-07a: Paleta V4 a dashboards (CRÍTICO para OIT)

> **TEMPLATE_SPEC_V4_v2 oficial aplicado** (pre-flight ya ejecutado, sección 0 documentada).
> **Spec dividido** en X-07a (CRÍTICO, hoy) + X-07b (REFINAMIENTOS, post-OIT).
> **Alcance acotado:** componentes base + tipografía H1/H2 + páginas con blue inline. Suficiente para que dashboards no se vean V3 viejo.

---

## 0. Pre-flight checks (YA EJECUTADO 18-05-2026)

✅ CI verde en develop (post-fix 18-mayo)
✅ X-01, X-02, X-05 mergeados
✅ 0 tests E2E con `toHaveCSS` o screenshots (cero riesgo de regresión de tests)
✅ Mapeo de componentes V3/V4 completado
✅ Decisiones tomadas con Gerardo (6 preguntas)

### Hallazgos clave del pre-flight aplicados

```
13 componentes UI requieren refactor (1.5h + 45min)
font-serif gap masivo: 0 archivos de dashboard lo usan
StatCard (V3, 45 instancias en 9 páginas) → migrar
18 páginas tienen text-blue inline (no via componente)
2 hex hardcoded en progress-ring.tsx
PDFs (certificado, orden): NO TOCAR (X-08 aparte)
```

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **ID** | X-07a |
| **Versión** | v4 |
| **Slug** | paleta-dashboards-critico |
| **Estimación** | 3-4h |
| **Riesgo** | Bajo (sin lógica, cero tests CSS afectados) |
| **Bloquea** | X-07b (refinamientos) |
| **Branch** | `feature/v4-x-07a-paleta-dashboards-critico` |

---

## 2. Qué construir (con prioridades de X-07a)

### Capa 1 — Componentes UI base (refactor sistémico)

| # | Componente | V3 residuales | Páginas auto-actualizadas |
|---|---|---|---|
| 1 | `stat-card.tsx` | FULL V3 | 9 páginas (45 instancias) |
| 2 | `data-table.tsx` | 7 | 6 páginas |
| 3 | `breadcrumbs.tsx` | 3 | 27 páginas |
| 4 | `modal.tsx` | 2 | 11 páginas |
| 5 | `button.tsx` | 1 | 42 páginas |
| 6 | `badge.tsx` | 1 | 44 páginas |
| 7 | `input.tsx` | 1 | 26 páginas |
| 8 | `select.tsx` | 1 | 10 páginas |
| 9 | `toast.tsx` | FULL V3 | 9 páginas |

### Capa 2 — Componentes layout/otros

| # | Componente | Acción |
|---|---|---|
| 10 | `progress-ring.tsx` | Reemplazar 2 hex (#e5e7eb, #fa3c4b) por tokens |
| 11 | `skeleton-page.tsx` | Migrar a V4 |
| 12 | `activity-timeline.tsx` | Migrar a V4 |
| 13 | `badge-arca.tsx` | Migrar a V4 |
| 14 | Layout: header, sidebar, footer, notificaciones-bell | Limpiar residuales V3 |

### Capa 3 — Páginas con blue inline (18 archivos)

Solo para `text-blue-*` / `bg-blue-*` inline. **NO tocar grays todavía** (eso es X-07b).

### Capa 4 — Tipografía SOLO H1 y H2

Agregar `font-serif font-bold` a:
- Todos los H1 de dashboards
- Todos los H2 de dashboards

**NO tocar** H3, eyebrows, sub-titulares (X-07b).

### NO incluye X-07a

- ❌ H3, eyebrows, sub-titulares con serif (→ X-07b)
- ❌ 78 grays inline (→ X-07b)
- ❌ public/auth pages (→ X-07b)
- ❌ recharts (→ verificar primero, después X-07b si aplica)
- ❌ PDFs con hex hardcoded (→ X-08)

---

## 3. Prescripciones técnicas

### 3.1 — Sustitución sistemática en componentes

```
Antiguo (V3)              →  Nuevo (V4)
─────────────────────────────────────────
text-blue-600             →  text-brand-blue
text-blue-700             →  text-brand-blue-dark
bg-blue-600               →  bg-brand-blue
bg-blue-700               →  bg-brand-blue-dark
hover:bg-blue-700         →  hover:bg-brand-blue-dark
hover:text-blue-700       →  hover:text-brand-blue-dark
border-blue-600           →  border-brand-blue
```

**NO tocar grays en esta fase** (la herramienta de búsqueda puede romper jerarquía visual sutil).

### 3.2 — StatCard migración

Editar `src/compartido/componentes/ui/stat-card.tsx`:
- Mantener API (props, structure) idéntica
- Solo cambiar clases internas a tokens V4
- Verificar que las 9 páginas que lo usan siguen funcionando visualmente

### 3.3 — progress-ring.tsx

```tsx
// ANTES (hardcoded)
stroke="#e5e7eb"   // gray-200
stroke="#fa3c4b"   // rojo custom

// DESPUÉS (tokens semánticos)
stroke="currentColor"  // hereda del padre
// O usar variables CSS:
stroke="var(--color-gray-200)"
stroke="var(--color-brand-blue)"  // si era acento V4
```

### 3.4 — H1/H2 con font-serif

Para cada dashboard, buscar:

```bash
grep -rn "<h1\|<h2" src/app/\(taller\)/ src/app/\(marca\)/ src/app/\(estado\)/ src/app/\(admin\)/ src/app/\(contenido\)/
```

Agregar `font-serif font-bold` (combinable con clases existentes):

```tsx
// ANTES
<h1 className="text-2xl text-gray-900">Bienvenido</h1>

// DESPUÉS
<h1 className="font-serif font-bold text-2xl text-gray-900">Bienvenido</h1>
```

**No tocar otros aspectos** (color, size, weight extra). Solo agregar `font-serif`.

---

## 4. Plan de implementación

### Fase 1: Componentes UI base (1.5h)

Orden recomendado (de mayor impacto a menor):

1. **button.tsx** (42 páginas) — 5 min
2. **badge.tsx** (44 páginas) — 5 min
3. **input.tsx** (26 páginas) — 5 min
4. **select.tsx** (10 páginas) — 5 min
5. **modal.tsx** (11 páginas) — 10 min
6. **breadcrumbs.tsx** (27 páginas) — 10 min
7. **stat-card.tsx** (9 páginas, 45 instancias) — 15 min
8. **data-table.tsx** (6 páginas) — 20 min
9. **toast.tsx** (9 páginas) — 10 min

Verificar build cada 2-3 componentes:
```bash
npx tsc --noEmit --pretty 2>&1 | grep -v "ws" | head -5
```

Commit: `git commit -m "feat(x-07a): paleta V4 en 9 componentes UI base"`

### Fase 2: Componentes layout/otros (45 min)

1. progress-ring.tsx (hex → tokens) — 10 min
2. skeleton-page.tsx — 10 min
3. activity-timeline.tsx — 10 min
4. badge-arca.tsx — 5 min
5. Layout residuales (header, sidebar, footer, notificaciones-bell) — 10 min

Verificar build, commit:
`feat(x-07a): paleta V4 en componentes layout y secundarios`

### Fase 3: 18 páginas con blue inline (1h)

```bash
# Identificar las páginas exactas
grep -rln "text-blue-\|bg-blue-" \
  src/app/\(taller\)/ src/app/\(marca\)/ src/app/\(estado\)/ \
  src/app/\(admin\)/ src/app/\(contenido\)/
```

Para cada página:
- Reemplazar text-blue-* → text-brand-blue (y variantes)
- Reemplazar bg-blue-* → bg-brand-blue
- Verificar build cada 3-5 páginas

Commit: `feat(x-07a): paleta V4 en 18 paginas con clases inline`

### Fase 4: font-serif en H1/H2 (1h)

```bash
# Buscar todos los H1 en dashboards
grep -rn "<h1\b" \
  src/app/\(taller\)/ src/app/\(marca\)/ src/app/\(estado\)/ \
  src/app/\(admin\)/ src/app/\(contenido\)/

# Idem H2
grep -rn "<h2\b" \
  src/app/\(taller\)/ src/app/\(marca\)/ src/app/\(estado\)/ \
  src/app/\(admin\)/ src/app/\(contenido\)/
```

Para cada H1/H2:
- Si NO tiene font-serif: agregarlo
- Si ya tiene: ignorar
- Mantener clases existentes (color, size, etc.)

Commit: `feat(x-07a): font-serif en titulares H1/H2 de dashboards`

### Fase 5: Verificación visual + tests (30 min)

```bash
# Build
npx tsc --noEmit --pretty 2>&1 | grep -v "ws"
npm run build

# Tests E2E
npx playwright test --grep "smoke|admin"  # los críticos
```

Verificar visualmente en `npm run dev`:
1. Login como TALLER → dashboard /taller (H1 con serif, botones V4)
2. Login como MARCA → dashboard /marca
3. Login como ESTADO → dashboard /estado
4. Login como ADMIN → dashboard /admin
5. Login como CONTENIDO → dashboard /contenido

### Fase 6: Push + PR (15 min)

```bash
git push -u origin feature/v4-x-07a-paleta-dashboards-critico

gh pr create --title "feat: X-07a paleta V4 a dashboards (critico)" \
  --body "Aplica paleta V4 a:
- 13 componentes UI base (refactor sistémico)
- 18 páginas con clases inline
- H1/H2 con font-serif en todos los dashboards
- progress-ring sin hex hardcoded

NO incluye (queda para X-07b):
- H3/eyebrows/subtítulos con serif
- 78 grays inline (mapeo gray → ink-*)
- public/auth pages
- recharts (verificar uso primero)

Tests E2E: 0 afectados (no usan toHaveCSS ni screenshots).
Pre-flight: ejecutado, decisiones documentadas en transcripción 18-05."
```

Esperar CI verde antes de mergear.

**Total estimado: 3h 45min**

---

## 5. Criterios de aceptación

### Build y tests
- [ ] `npm run build` pasa
- [ ] Tests E2E pasan (0 afectados según pre-flight)
- [ ] CI verde en primera o segunda iteración

### Verificación visual en preview

Cada rol (TALLER, MARCA, ESTADO, ADMIN, CONTENIDO):
- [ ] H1 del dashboard tiene tipografía serif (notable, no genérica)
- [ ] H2 también con serif
- [ ] Botones primarios con color brand-blue (no blue-600)
- [ ] Badges con paleta V4
- [ ] No hay clases "text-blue-*" residuales en el HTML inspeccionado

### Sin regresiones
- [ ] Funcionalidad existente funciona igual
- [ ] No hay layouts rotos por la tipografía serif
- [ ] Modals, dropdowns, breadcrumbs siguen funcionando

---

## 6. Riesgos identificados

| # | Riesgo | Mitigación |
|---|--------|------------|
| 1 | Cambiar serif altera altura de línea, rompe layouts | Verificar visualmente cada dashboard tras Fase 4 |
| 2 | Componente refactor rompe algún uso específico | Commits granulares, verificar build cada 2-3 |
| 3 | StatCard tiene 45 instancias, alguna podría romperse | Mantener API idéntica, solo cambiar clases internas |
| 4 | data-table tiene 7 residuales V3, refactor complejo | Tomarse los 20 min sin apuro |
| 5 | Hex tokens no existen | Verificar tokens disponibles en globals.css antes |

---

## 7. Selectores críticos (NO MODIFICAR)

| Selector | Test/Sistema | Acción |
|---|---|---|
| `getByRole('button')` | Tests E2E múltiples | Mantener `<button>` semántico, solo cambiar clases |
| `getByText('...')` | Tests con texto exacto | NO cambiar texto, solo estilos |
| API de componentes (props) | Importadores | Mantener props idénticas |
| `data-testid="..."` | Tests específicos | NO eliminar atributos data-* |

---

## 8. Definición de "Done"

- [ ] PR mergeado a develop
- [ ] CI verde
- [ ] Verificación visual en 5 roles
- [ ] Dashboards visualmente consistentes con landing (V4)
- [ ] Documentar X-07b pendiente con sus tareas específicas
- [ ] Listo para promocionar develop → main cuando Gerardo decida

---

**Fin del SPEC X-07a — Paleta V4 dashboards (crítico)**

> X-07b queda pendiente: 78 grays inline + serif en H3/eyebrows + public/auth + recharts.
> Crear X-07b como tarea separada después de validar X-07a en preview.
