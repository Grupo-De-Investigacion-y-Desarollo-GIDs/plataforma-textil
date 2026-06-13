# Known Issues

## CI - Tests E2E (RESUELTO 2026-05-18)

### Investigacion del patron de tests "flaky" preexistentes

**Sintoma:** 55% tasa de falla en CI develop (11/20 ultimos runs).
Cada PR tenia tests rojos que aparentemente no tenian relacion con
el cambio. La hipotesis inicial era "tests flaky preexistentes".

**Investigacion (17-18 mayo 2026):** los 4 tests fallidos tenian
causas raiz DISTINTAS entre si, todas arreglables:

| Test | Frecuencia | Causa raiz |
|------|------------|------------|
| smoke admin/logs | 11/11 | Doble navegacion (toHaveURL + goto) genera ERR_ABORTED |
| file-validation JPEG | 6/11 | State leak cross-run: config DB desactivada por otro test sin restaurar |
| demanda-insatisfecha tab | 4/11 | Locator `header` matchea tabs Y sidebar |
| exportes-estado informe | 2/11 | `getByText` matchea h2 Y div padre por substring |

### Fix aplicado (PR #346 + commit 7183d39)

1. **smoke:** simplificar el test (1 sola navegacion, assertions semanticas con getByRole)
2. **file-validation:** beforeAll que restaura config `imagenes-portfolio` al inicio
3. **demanda-insatisfecha:** locator `header nav` en vez de `header`
4. **exportes-estado:** `getByRole('heading')` en vez de `getByText`

### Lecciones operativas

1. **"Tests flaky preexistentes" suele ser bug arreglable, no inevitable.**
   No aceptar "preexistente" como diagnostico final sin investigacion.

2. **`page.goto()` defaultea a `waitUntil: 'load'`.**
   Eliminar el param explicito no cambia el comportamiento.
   La causa del ERR_ABORTED era la doble navegacion, no el param.

3. **Tests deben usar selectores semanticos** (getByRole, getByLabel)
   en vez de getByText cuando el texto puede aparecer en multiples elementos.

4. **`afterEach` con try/catch best-effort no protege contra state leaks.**
   Si el test falla antes del afterEach, el estado queda corrupto en DB compartida.
   Solucion: agregar `beforeAll` que garantice estado limpio al inicio.

### Deuda tecnica pendiente

- **DB compartida entre runs de CI** causa polucion potencial.
  - Mitigacion actual: `beforeAll` en tests mutables (file-validation)
  - Solucion ideal (no urgente): DB por preview o tests stateless

### Como detectar futuros "flaky" similares

```bash
# Listar tests que fallan recurrente en develop
gh run list --branch develop --limit 30 --json conclusion,databaseId --jq '.[] | select(.conclusion=="failure")'

# Para cada run fallido, ver tests fallidos
gh run view <id> --log-failed | grep -E "FAIL|✘"

# Si UN mismo test aparece en >50% de los fallos: bug deterministico
# Si tests DISTINTOS aparecen cada vez: state leak o timing
```

---

## React Server Components streaming duplication (descubierto 20-mayo-2026)

### Sintoma

Tests E2E con `getByText` en headers, navs o tabs fallan intermitentemente
con "strict mode violation: resolved to 2 elements" en Vercel preview.
El re-run muchas veces pasa.

### Causa raiz

Next.js RSC streaming usa suspense boundaries (`<div id="S:0">`) para
stream HTML al cliente. Durante el SSR streaming:

1. HTML del componente se inserta en `<div id="S:0">`
2. React lo mueve al lugar correcto via JS
3. Entre estos 2 momentos, el DOM tiene 2 COPIAS del componente
4. Tests que evaluan el DOM en esa ventana ven 2 elementos

La ventana es mas larga en Vercel preview (cold-start) que en
ambientes con cache caliente (develop deploy fijo).

### Como identificar

Si el test falla con "resolved to 2 elements" en preview pero pasa
en develop, verificar los parent chains:
- Match 0: `... < body`
- Match 1: `... < div#S:0` ← este es el indicador de RSC streaming

### Verificacion empirica (script de reproduccion)

```js
// Ejecutar con: NODE_PATH="$PWD/node_modules" node script.js
const { chromium } = require('playwright-core')
async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await (await browser.newContext()).newPage()
  // login...
  await page.goto(BASE + '/estado')
  await page.waitForLoadState('domcontentloaded')
  const matches = await page.locator('header nav').getByText('Demanda insatisfecha').all()
  for (const m of matches) {
    const chain = await m.evaluate(el => {
      const c = []; let p = el
      for (let i = 0; i < 8 && p; i++) { c.push(p.tagName + (p.id ? '#' + p.id : '')); p = p.parentElement }
      return c.join(' < ')
    })
    console.log(chain) // Si ves "DIV#S:0" en un chain, es RSC streaming
  }
  await browser.close()
}
```

### Soluciones (segun caso)

Opcion A — waitForLoadState (cuando el test necesita estabilizacion):

```ts
await page.goto('/...')
await page.waitForLoadState('networkidle')  // espera a que streaming termine
await expect(...).toBeVisible(...)
```

Opcion B — .first() (cuando aceptamos primer match):

```ts
await expect(page.getByText('...').first()).toBeVisible(...)
```

Opcion C — Scope a main (cuando el elemento esta en main, no en header):

```ts
await expect(page.locator('main').getByText('...')).toBeVisible(...)
```

### Cuando usar cada opcion

- **waitForLoadState**: tests que verifican elementos del header/nav
- **.first()**: tests rapidos (smoke) o cuando hay OR de selectores
- **Scope a main**: solo si el elemento esta confirmado dentro de main

### NO usar como solucion

- Aumentar timeouts no funciona: los 2 elementos coexisten durante toda la ventana de streaming.
- Aceptar "es flaky" sin investigar. Investigar siempre primero.

### Tests arreglados con este patron (20-mayo-2026)

| Test | Archivo:linea | Fix aplicado |
|------|--------------|-------------|
| Tab Demanda insatisfecha | demanda-insatisfecha.spec.ts:47 | waitForLoadState |
| Directorio Proveedores | acceso-verificado.spec.ts:10 | waitForLoadState |
| Boton Abrir menu | roles-estado.spec.ts:42 | .first() |
| Header Mis pedidos | smoke.spec.ts:28 | .first() |
| Header Mi perfil | smoke.spec.ts:29 | .first() |

### Tests ya protegidos (sin tocar)

- layout-consistency: wrapped en try/catch → test.skip()
- notificaciones-bell: usa .first() en todos los selectores
- desglose-plantilla: usa { waitUntil: 'load' } en page.goto()
- exportes-estado: usa waitForLoadState + scoped a main
