---
name: playwright-e2e-patterns
description: |
  Patrones para tests E2E con Playwright en Next.js 16 + React 19 + NextAuth v5.
  Cubre locators seguros para streaming SSR, auth setup con storageState,
  manejo de Server Components pesados, y verificaciones previas a debugging.
trigger: |
  Cuando se va a crear, modificar o debuggear tests E2E en tests/e2e/.
  Cuando hay flakies con "strict mode violation" o timeouts de auth.
  Cuando se va a modificar tests/e2e/_helpers/auth.ts o auth.setup.ts.
  Cuando aparecen tests intermitentes en CI.
---

# Playwright E2E patterns para PDT

Este skill captura lecciones aprendidas durante la implementación de V4. Su objetivo es **evitar que se repitan bugs ya solucionados**.

---

## 1. Locators seguros con React 19 streaming SSR

### Problema

React 19 con Server Components hace **streaming SSR**: el HTML se envía progresivamente. Durante la hidratación, brevemente coexisten:

- El elemento **visible** dentro de `<main>`
- Una copia en un **div hidden** con `id="S:1"` o similar (contenido streamed pendiente de hidratación)

Los locators genéricos matchean **ambos** elementos y disparan `strict mode violation`.

### Regla

**NUNCA usar locators genéricos sin scope para elementos que pueden estar duplicados durante streaming.**

### Patrones correctos

```typescript
// ❌ INCORRECTO — puede matchear div hidden de streaming
await expect(page.getByText('Exportar CSV')).toBeVisible()
await expect(page.locator('h1')).toBeVisible()
await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible()

// ✅ CORRECTO — scopear a <main>
await expect(page.locator('main').getByText('Exportar CSV')).toBeVisible()
await expect(page.locator('main h1')).toBeVisible()
await expect(page.locator('main nav[aria-label="Breadcrumb"]')).toBeVisible()

// ✅ TAMBIÉN CORRECTO — selectores más específicos
await expect(page.getByRole('heading', { name: 'Talleres', exact: true })).toBeVisible()
await expect(page.locator('header').getByText('Demanda insatisfecha')).toBeVisible()
```

### Patrones a evitar

```typescript
// ❌ .first() oculta el problema, no lo soluciona
await expect(page.getByText('Foo').first()).toBeVisible()

// ❌ Texto largo que matchea múltiples elementos parciales
await expect(page.getByText('Talleres')).toBeVisible()  // matchea 5 elementos: sidebar, headings, descripciones
```

### Bugs históricos resueltos por este patrón

- PR #316: breadcrumb duplicado
- PR #318: h1 duplicado, "Exportar CSV" duplicado, "Talleres" matcheando 5 elementos

---

## 2. Auth setup con storageState

### Regla

**Para login en tests, usar el patrón `storageState` de Playwright.** Una vez por rol al inicio del run, todos los tests reutilizan la sesión.

### Implementación correcta

`tests/e2e/auth.setup.ts`:

```typescript
import { test as setup } from '@playwright/test'
import path from 'path'

const authDir = path.join(__dirname, '..', '..', '.auth')

const roles = {
  taller: {
    email: process.env.TEST_TALLER_EMAIL!,
    password: process.env.TEST_TALLER_PASSWORD!,
    targetPath: '/taller',
  },
  marca: {
    email: process.env.TEST_MARCA_EMAIL!,
    password: process.env.TEST_MARCA_PASSWORD!,
    targetPath: '/marca/directorio',
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL!,
    password: process.env.TEST_ADMIN_PASSWORD!,
    targetPath: '/admin',
  },
  estado: {
    email: process.env.TEST_ESTADO_EMAIL!,
    password: process.env.TEST_ESTADO_PASSWORD!,
    targetPath: '/estado/talleres',  // ruta liviana, no /estado (pesado con 16 queries)
  },
}

for (const [rol, config] of Object.entries(roles)) {
  setup(`authenticate as ${rol}`, async ({ page }) => {
    await page.goto('/login')
    await page.locator('form input[name="email"]').fill(config.email)
    await page.locator('form input[name="password"]').fill(config.password)
    await page.getByRole('button', { name: 'Ingresar' }).click()

    // Esperar que URL salga de /login
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 30_000,
      waitUntil: 'commit'
    })

    // Navegación full-page explícita (evita client-side router hang en páginas pesadas)
    await page.goto(config.targetPath, { waitUntil: 'load', timeout: 60_000 })

    await page.context().storageState({ path: `${authDir}/${rol}.json` })
  })
}
```

`playwright.config.ts`:

```typescript
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    dependencies: ['setup'],
  },
]
```

### Patrones a evitar

```typescript
// ❌ page.request.post() para auth de NextAuth
// Bug conocido: cookies con prefijo __Host- y __Secure- no se manejan bien
await page.request.post('/api/auth/callback/credentials', { data: {...} })

// ❌ Hacer login en CADA test (lento y causa contención de sesiones)
test('mi test', async ({ page }) => {
  await loginAs(page, 'estado')  // 5s × cada test = mucho tiempo
  // ...
})
```

### Bug histórico

PR #318: tests de ESTADO timeoutean por:
- Login por test causa concurrencia → contención
- `/estado` es Server Component pesado (16 queries) que no termina de renderizar con client-side router de Next.js + Playwright

**Solución: storageState + navegación full-page explícita a ruta liviana.**

---

## 3. Server Components pesados y client-side router

### Problema

Páginas con muchas queries Server Components + `force-dynamic` se cuelgan cuando se accede via **client-side navigation** (`router.push('/')`) en el contexto de Playwright. El RSC fetch no completa, la URL nunca cambia.

### Síntoma

```
TimeoutError: page.waitForURL: Timeout 60000ms exceeded
waiting for navigation until "load"
```

### Regla

**Después del login, hacer navegación full-page explícita con `page.goto()`.** No esperar que el client-side router complete.

```typescript
// ❌ Esperar redirect del client-side router
await page.getByRole('button', { name: 'Ingresar' }).click()
await page.waitForURL(/\/estado/, { timeout: 60_000 })  // se cuelga

// ✅ Confirmar login + navegación explícita
await page.getByRole('button', { name: 'Ingresar' }).click()
await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 })
await page.goto('/estado/talleres', { waitUntil: 'load' })  // navegación full-page
```

### Verificación rápida si tenés dudas

Usar curl o PowerShell con cookies del login y medir tiempo de respuesta directa:

```powershell
# PowerShell — medir tiempo de página después de login
$timer = Measure-Command {
    $response = Invoke-WebRequest -Uri "https://dev.plataformatextil.com.ar/estado" -WebSession $session -UseBasicParsing
}
Write-Host "Tiempo: $($timer.TotalSeconds) segundos"
```

**Si el HTTP directo responde en <2s pero Playwright se cuelga**: el problema es client-side navigation, no el backend.

---

## 4. Verificaciones previas a debugging

### Regla

**Antes de buscar bugs sofisticados, verificar lo básico.**

### Checklist en orden

Cuando un test falla y no está claro por qué:

1. **¿Las credenciales son correctas?**
   - Verificar valores reales de secrets en GitHub
   - Probar manualmente con curl o PowerShell
   - **El email del secret debe coincidir EXACTAMENTE con el del seed**

2. **¿El backend responde correctamente?**
   - Hacer request directo con curl (sin Playwright)
   - Medir tiempo de respuesta
   - Si responde rápido y bien: el problema es Playwright o el test

3. **¿El warmup del workflow funciona?**
   - Verificar logs del step "Warm up preview functions"
   - Buscar líneas con `login -> 200` o `login -> 405`
   - Si algún rol devuelve 405: revisar workflow YAML (probablemente `-X POST` en curl con redirects)

4. **¿El error es timeout o assertion?**
   - Timeout puro = problema de tiempo (cold start, queries lentas, network)
   - Strict mode violation = problema de locator (múltiples elementos)
   - Element not found = problema de selector o data
   - 4xx/5xx = problema de backend o API

5. **¿Es preexistente o nuevo?**
   - Mirar runs anteriores del mismo test
   - Si fallaba antes con success por retries: es preexistente, oculto
   - Si solo falla en este PR: investigar qué cambió

### Comandos útiles

```bash
# Ver runs recientes de un branch
gh run list --branch [BRANCH] --workflow e2e.yml --limit 10

# Ver logs detallados de un run
gh run view [RUN_ID] --log-failed

# Descargar reporte de Playwright
gh run download [RUN_ID] -n playwright-report

# Listar secrets del repo (no muestra valores)
gh secret list --repo Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil
```

---

## 5. No confundir retries con éxito

### Regla

**Si Playwright tiene `retries: 2`, los tests que pasan en retry NO son "verdes verdes". Son flakies enmascarados.**

### Diferencia crítica

```
Reporte que dice "76 passed" puede significar:
- 76 passed en intento 1 (verde de verdad)
- 56 passed en intento 1 + 20 en retry (20 flakies escondidos)

Para saberlo, mirar el contador de "flaky" del reporte.
```

### Acción al ver flakies

NO ignorarlos. Para cada flaky:

1. Identificar el test y el error del intento 1
2. Categorizar: timeout / strict mode / assertion / API
3. Aplicar el fix correspondiente (ver patrones en este skill)
4. Si es problema preexistente difícil: documentar en `KNOWN_ISSUES.md` pero NO mergear ignorando

### Bug histórico

PR #318: durante la primera mitad del día, "76 passed, 0 failed" enmascaraba 20 flakies de timeout de ESTADO. Al investigarlos, descubrimos un bug de credenciales mal cargadas en GitHub Secrets que estaba ahí desde V3.

---

## 6. Patrones específicos del proyecto PDT

### Roles disponibles

```
TALLER  → loginAs(page, 'taller')   → redirect a /taller
MARCA   → loginAs(page, 'marca')    → redirect a /marca/directorio
ESTADO  → loginAs(page, 'estado')   → redirect a /estado (pero usar /estado/talleres en setup)
ADMIN   → loginAs(page, 'admin')    → redirect a /admin
```

### Credenciales del seed (dev)

```
ADMIN:   lucia.fernandez@pdt.org.ar    / pdt2026
TALLER:  roberto.gimenez@pdt.org.ar    / pdt2026
TALLER:  graciela.sosa@pdt.org.ar      / pdt2026
TALLER:  carlos.mendoza@pdt.org.ar     / pdt2026
MARCA:   valentina.ramos@pdt.org.ar    / pdt2026
MARCA:   martin.echevarria@pdt.org.ar  / pdt2026
ESTADO:  anabelen.torres@pdt.org.ar    / pdt2026
CONTENIDO: sofia.martinez@pdt.org.ar   / pdt2026
```

**IMPORTANTE: los secrets `TEST_*_EMAIL` y `TEST_*_PASSWORD` en GitHub deben coincidir EXACTAMENTE con estos valores.**

### Headers especiales

- `x-ci-bypass: $CI_BYPASS_TOKEN` → bypass de rate limiting para CI en preview/dev (NO funciona en producción)

### Rutas que requieren cuidado especial

- `/estado` → 16 queries en $transaction con `force-dynamic`. NO usar como ruta target en auth setup.
- `/estado/talleres` → ruta liviana. Usar para setup de ESTADO.
- `/admin` → Client Component, rápido.
- `/taller`, `/marca/directorio` → Server Components normales.

---

## Resumen ejecutivo

| Patrón | Regla |
|---|---|
| Locators con elementos duplicables | Scopear a `main` |
| Auth en tests | `storageState`, no login por test |
| Cookies NextAuth | `page.goto + form`, NO `page.request.post` |
| Server Components pesados | `page.goto` explícito después del login |
| Antes de debugging | Verificar credenciales, backend directo, warmup |
| Retries en Playwright | Si hay flakies, investigar; no ignorar |
| Roles del proyecto | ESTADO usa `/estado/talleres` para setup |
