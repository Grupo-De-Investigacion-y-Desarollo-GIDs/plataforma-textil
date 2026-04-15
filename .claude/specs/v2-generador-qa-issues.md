# Spec: Generador QA Parte 2 — GitHub Pages + botón crear issue

- **Semana:** v2 / tooling
- **Asignado a:** Gerardo
- **Dependencias:** `v2-generador-qa-html` mergeado (script `tools/generate-qa.js` funcionando)

---

## ANTES DE ARRANCAR

- [ ] `tools/generate-qa.js` existe y genera HTMLs correctamente
- [ ] `tools/generate-qa.test.js` pasa 106/106 tests
- [ ] El repo es público en GitHub
- [ ] `GITHUB_TOKEN` y `GITHUB_REPO` están configurados en Vercel (ya existían para el widget de feedback)
- [ ] `/api/feedback` acepta requests sin autenticación (ya implementado)

---

## 1. Contexto

La Parte 1 generó HTMLs interactivos que Sergio puede usar para ejecutar auditorías. El problema pendiente es el acceso: los HTMLs viven en la máquina de Gerardo y Sergio no puede accederlos sin que se los manden manualmente.

Este spec resuelve dos cosas:

1. **Acceso automático para Sergio** — GitHub Pages publica los HTMLs en una URL pública cada vez que Gerardo pushea un `QA_v2-*.md` nuevo o modificado a `develop`
2. **Creación de issues desde el HTML** — cada ítem fallido tiene un botón "Crear issue" que llama a `/api/feedback` (el mismo endpoint del widget), con el contexto del spec pre-cargado

---

## 2. Qué construir

- GitHub Action `.github/workflows/qa-pages.yml` que regenera los HTMLs y los publica en `gh-pages`
- Modificación de `tools/generate-qa.js` para agregar botón "Crear issue" por ítem
- URL final: `https://grupo-de-investigacion-y-desarollo-gids.github.io/plataforma-textil/`

---

## 3. GitHub Action

### Archivo: `.github/workflows/qa-pages.yml`

La Action se dispara cuando se pushea a `develop` y hay cambios en `.claude/auditorias/QA_v2-*.md`.

```yaml
name: Publicar QA Interactivos

on:
  push:
    branches: [develop]
    paths:
      - '.claude/auditorias/QA_v2-*.md'
      - 'tools/generate-qa.js'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Generar todos los HTMLs
        run: |
          for f in .claude/auditorias/QA_v2-*.md; do
            node tools/generate-qa.js "$f"
          done
          node tools/generate-qa.js --index .claude/auditorias/

      - name: Copiar solo HTMLs a carpeta temporal
        run: |
          mkdir -p _qa_publish
          cp .claude/auditorias/*.html _qa_publish/

      - name: Publicar en GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: _qa_publish
```

**Notas:**
- `GITHUB_TOKEN` en la Action es el token automático de GitHub — no el mismo que el de Vercel. No requiere configuración manual.
- `peaceiris/actions-gh-pages@v3` es la Action estándar para publicar en `gh-pages` — no requiere setup adicional.
- La primera vez que corre, crea la rama `gh-pages` automáticamente.
- GitHub Pages debe habilitarse manualmente en Settings → Pages → Source: `gh-pages` branch (una sola vez, después es automático).

---

## 4. Botón "Crear issue" en el HTML

### Comportamiento

Cada ítem de Eje 1, Eje 2 y Eje 3 tiene un botón "📋 Crear issue" que aparece cuando Sergio selecciona 🐛 o ❌.

Al hacer click:
1. El botón muestra "Enviando..."
2. Hace `fetch` a `https://plataforma-textil.vercel.app/api/feedback` con este body:

```json
{
  "tipo": "bug | bloqueante",
  "mensaje": "[texto que Sergio escribió en Observaciones]",
  "pagina": "[URL de inicio del paso, o URL de prueba del QA si no aplica]",
  "auditorNombre": "Sergio",
  "auditorRol": "QA",
  "contextoQA": {
    "spec": "[nombre del spec, ej: v2-epica-academia]",
    "eje": "[Eje 1 / Eje 2 / Eje 3]",
    "item": "[número y texto del criterio o paso]",
    "resultado": "[🐛 o ❌]"
  }
}
```

3. Si la respuesta es 200: el botón muestra "✅ Issue creado" y queda deshabilitado
4. Si la respuesta es error: el botón muestra "❌ Error — reintentá" y vuelve a habilitarse

### Modificación en `/api/feedback/route.ts`

Agregar soporte para el campo `contextoQA` en el body. Si existe, incluirlo en el cuerpo del issue de GitHub como sección adicional:

```markdown
## Contexto QA
- **Spec:** v2-epica-academia
- **Eje:** Eje 2 — Navegabilidad
- **Ítem:** Paso 3 — Gate real del backend (403 al forzar quiz)
- **Resultado:** 🐛
```

El campo `contextoQA` es opcional — si no viene (feedback normal del widget), el endpoint sigue funcionando igual que hoy.

---

## 5. Cambios en `tools/generate-qa.js`

El script necesita conocer la URL de la plataforma para que el fetch del botón apunte al lugar correcto. Agregar soporte para variable de entorno:

```bash
PLATAFORMA_URL=https://plataforma-textil.vercel.app node tools/generate-qa.js archivo.md
```

Si no se pasa `PLATAFORMA_URL`, usar `https://plataforma-textil.vercel.app` como default.

---

## 6. Configuración manual en GitHub (una sola vez)

Después de que la Action corra por primera vez y cree la rama `gh-pages`:

1. Ir a `github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/settings/pages`
2. Source: `Deploy from a branch`
3. Branch: `gh-pages` / `/ (root)`
4. Save

URL resultante: `https://grupo-de-investigacion-y-desarollo-gids.github.io/plataforma-textil/auditorias/`

---

## 7. Tests

### Tests de la Action (verificación manual)
| # | Verificación | Cómo |
|---|-------------|------|
| 1 | La Action corre al pushear un `QA_v2-*.md` | Ver pestaña Actions en GitHub |
| 2 | La rama `gh-pages` contiene los HTMLs generados | Navegar rama `gh-pages` en GitHub |
| 3 | La URL de GitHub Pages carga el `index.html` | Abrir URL en browser |
| 4 | Cada card del index abre el HTML individual | Click en card |

### Tests del botón "Crear issue" — `tools/generate-qa.test.js`
Agregar estos casos al test suite existente:

| # | Qué testear | Esperado |
|---|-------------|----------|
| 10 | HTML generado contiene botón "Crear issue" en ítems de Eje 1 | String `Crear issue` presente en el HTML |
| 11 | HTML generado contiene la URL de la plataforma en el fetch | `plataforma-textil.vercel.app` presente en el HTML |
| 12 | HTML generado con `PLATAFORMA_URL` custom usa esa URL | URL custom presente en el HTML |

### Tests del endpoint `/api/feedback`
Agregar a los tests manuales existentes:

| # | Acción | Esperado |
|---|--------|----------|
| 13 | POST a `/api/feedback` con campo `contextoQA` incluido | Issue creado en GitHub con sección "Contexto QA" |
| 14 | POST a `/api/feedback` sin campo `contextoQA` | Funciona igual que hoy, sin sección extra |

---

## 8. Criterios de aceptación

- [ ] Pushear un `QA_v2-*.md` a `develop` dispara la Action automáticamente
- [ ] La Action completa sin errores (verde en GitHub Actions)
- [ ] `https://grupo-de-investigacion-y-desarollo-gids.github.io/plataforma-textil/auditorias/` carga el index
- [ ] Desde el index se puede navegar a cualquier QA individual
- [ ] En un ítem de Eje 1/2/3 marcado como 🐛, aparece el botón "Crear issue"
- [ ] Click en "Crear issue" con observaciones escritas → issue aparece en GitHub con contexto del spec
- [ ] Click en "Crear issue" sin observaciones → botón deshabilitado con tooltip "Escribí una observación primero"
- [ ] El endpoint `/api/feedback` sin `contextoQA` sigue funcionando igual (no rompe el widget existente)
- [ ] Tests 10, 11, 12 pasan en `generate-qa.test.js`
