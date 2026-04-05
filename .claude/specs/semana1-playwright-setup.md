# Spec: Setup de Playwright para tests E2E

- **Semana:** 1
- **Asignado a:** Gerardo
- **Prioridad:** PRIMERO — antes que cualquier otro spec de la semana
- **Dependencias:** Ninguna

## 1. Contexto

Los specs del proyecto incluyen tests E2E que requieren Playwright. Sin el setup, esos tests nunca se ejecutan. Este spec configura Playwright con usuarios de prueba del seed y flujos basicos por rol. Los tests E2E corren contra el servidor de desarrollo local.

## 2. Que construir

- Instalar y configurar Playwright
- Helpers de autenticacion por rol
- Tests E2E para los flujos criticos de cada rol
- Script en package.json para correr los tests

## 3. Datos

Credenciales del seed (ya existen en la DB):

| Email | Password | Rol |
|-------|----------|-----|
| lucia.fernandez@pdt.org.ar | pdt2026 | ADMIN |
| roberto.gimenez@pdt.org.ar | pdt2026 | TALLER BRONCE |
| carlos.mendoza@pdt.org.ar | pdt2026 | TALLER ORO |
| martin.echevarria@pdt.org.ar | pdt2026 | MARCA mediana |
| anabelen.torres@pdt.org.ar | pdt2026 | ESTADO |

## 4. Prescripciones tecnicas

### Instalar Playwright:

```bash
npm init playwright@latest -- --quiet --browser=chromium --lang=TypeScript --no-examples
```

Cuando pregunte donde poner los tests: `e2e/`
Cuando pregunte si agregar GitHub Actions: No

### Archivo de configuracion — `playwright.config.ts` (en raiz):

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
```

### Scripts en package.json:

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed"
```

### Archivo nuevo — `e2e/helpers/auth.ts`

```typescript
import { Page } from '@playwright/test'

export async function loginAs(page: Page, role: 'admin' | 'taller_bronce' | 'taller_oro' | 'marca' | 'estado') {
  const credentials = {
    admin: { email: 'lucia.fernandez@pdt.org.ar', password: 'pdt2026' },
    taller_bronce: { email: 'roberto.gimenez@pdt.org.ar', password: 'pdt2026' },
    taller_oro: { email: 'carlos.mendoza@pdt.org.ar', password: 'pdt2026' },
    marca: { email: 'martin.echevarria@pdt.org.ar', password: 'pdt2026' },
    estado: { email: 'anabelen.torres@pdt.org.ar', password: 'pdt2026' },
  }
  const { email, password } = credentials[role]
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(taller|marca|estado|admin)/)
}
```

Nota: los inputs usan react-hook-form con `{...register('email')}` que genera `name="email"` en el DOM. El selector `input[name="email"]` funciona.

### Archivo nuevo — `e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('taller puede loguearse y llega al dashboard', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await expect(page).toHaveURL(/\/taller/)
})

test('marca puede loguearse y llega al directorio', async ({ page }) => {
  await loginAs(page, 'marca')
  await expect(page).toHaveURL(/\/marca/)
})

test('estado puede loguearse y llega al dashboard', async ({ page }) => {
  await loginAs(page, 'estado')
  await expect(page).toHaveURL(/\/estado/)
})

test('admin puede loguearse y llega al panel', async ({ page }) => {
  await loginAs(page, 'admin')
  await expect(page).toHaveURL(/\/admin/)
})

test('usuario sin sesion es redirigido al login', async ({ page }) => {
  await page.goto('/taller')
  await expect(page).toHaveURL(/\/login/)
})

test('taller no puede acceder a /admin', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/unauthorized/)
})
```

### Archivo nuevo — `e2e/taller.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('taller ve su nivel en el dashboard', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await expect(page.getByText('BRONCE')).toBeVisible()
})

test('taller puede navegar a formalizacion', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/taller/formalizacion')
  await expect(page.getByText('Registrate en ARCA')).toBeVisible()
})

test('taller puede navegar a academia', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/taller/aprender')
  await expect(page).toHaveURL(/\/taller\/aprender/)
})
```

### Archivo nuevo — `e2e/marca.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('marca puede ver el directorio de talleres', async ({ page }) => {
  await loginAs(page, 'marca')
  await page.goto('/marca/directorio')
  await expect(page.getByText('Corte Sur')).toBeVisible()
})

test('marca puede crear un pedido', async ({ page }) => {
  await loginAs(page, 'marca')
  await page.goto('/marca/pedidos/nuevo')
  await expect(page).toHaveURL(/\/marca\/pedidos\/nuevo/)
})
```

### Archivo nuevo — `e2e/publico.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test('landing carga correctamente', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Plataforma Digital Textil')).toBeVisible()
})

test('directorio publico carga sin login', async ({ page }) => {
  await page.goto('/directorio')
  await expect(page).toHaveURL('/directorio')
  await expect(page).not.toHaveURL(/\/login/)
})

test('verificar certificado con codigo invalido muestra error', async ({ page }) => {
  await page.goto('/verificar?code=INVALIDO')
  await expect(page.getByText(/no encontrado/i)).toBeVisible()
})
```

### Agregar a `.gitignore`:

```
# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

## 5. Casos borde

- El servidor debe estar corriendo en `localhost:3000` antes de ejecutar los tests
- Si el seed no fue ejecutado, los tests de login fallan — documentar en README
- Los tests son secuenciales (`workers: 1`) para evitar conflictos en la DB
- En CI se puede agregar `webServer` config para levantar el servidor automaticamente — fuera de scope del piloto

## 6. Criterio de aceptacion

- [ ] `npm run test:e2e` corre sin errores con el servidor levantado
- [ ] Los 6 tests de `auth.spec.ts` pasan
- [ ] Los 3 tests de `taller.spec.ts` pasan
- [ ] Los 2 tests de `marca.spec.ts` pasan
- [ ] Los 3 tests de `publico.spec.ts` pasan
- [ ] `npm run build` sigue pasando sin errores

## 7. Instrucciones para correr los tests

```bash
# 1. Asegurarse que el servidor esta corriendo
npm run dev

# 2. En otra terminal, correr los tests
npm run test:e2e

# 3. Ver el reporte HTML
npx playwright show-report
```
