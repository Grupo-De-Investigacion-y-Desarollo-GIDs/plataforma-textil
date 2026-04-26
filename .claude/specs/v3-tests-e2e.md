# Spec: Tests E2E con Playwright

- **Version:** V3
- **Origen:** V3_BACKLOG Q-01
- **Asignado a:** Gerardo
- **Prioridad:** Alta — garantia antes de cada demo con OIT y antes de cada deploy a produccion

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG I-01 mergeado (ambientes separados — los tests corren contra Preview)
- [ ] V3_BACKLOG D-01 mergeado (rutas ESTADO definidas) — sin esto, el test 6.4 queda pospuesto
- [ ] Playwright ya instalado (`@playwright/test: ^1.59.1` — ya esta en devDependencies)

---

## 1. Contexto

V2 cerro sin tests E2E automatizados. Cada deploy era una apuesta:

- Sergio probaba manualmente los flujos criticos
- Bugs de regresion aparecian dias despues en produccion
- No habia confianza para hacer cambios grandes (refactor de roles, etc.)
- Cada vez que una marca demostraba la plataforma, habia que re-probar todo manualmente

Para V3 con OIT esto es inaceptable. La plataforma se va a presentar formalmente y va a tener usuarios reales. Cada cambio puede romper algo critico (registro, login, validaciones, matching).

**Lo que NO vamos a hacer:**

Cobertura del 100%. Eso es ilusorio en 8 dias y agrega mas mantenimiento del que aporta valor.

**Lo que SI vamos a hacer:**

Tests **minimos pero estrategicos** sobre los **flujos criticos** que si se rompen, el piloto no funciona. Si los tests pasan, hay confianza razonable para deployar.

---

## 2. Que construir

1. **Configuracion de Playwright** — adaptar `playwright.config.ts` para apuntar a Preview y Production
2. **Helpers de auth y data** — utilidades que reutilizamos en muchos tests
3. **Tests de los flujos criticos** — 8 tests que cubren los caminos felices del piloto
4. **CI/CD** — los tests corren automaticamente en cada PR a `develop` y al deployar a `main`
5. **Reporte HTML de fallas** — para que sea facil ver que paso

---

## 3. Que se considera "flujo critico"

Un flujo es critico si su fallo bloquea el piloto. Los identificamos:

| # | Flujo | Cubre | Estado |
|---|-------|-------|--------|
| 1 | **Registro y primer login del taller** | Onboarding basico | Implementable |
| 2 | **Registro y primer login de la marca** | Onboarding marca | Implementable |
| 3 | **Login de los 4 roles principales** | Auth funcionando | Implementable |
| 4 | **Marca crea pedido** | Generar demanda | Implementable |
| 5 | **Taller cotiza pedido disponible** | Generar oferta | Implementable |
| 6 | **Marca acepta cotizacion** | Cierre comercial | Implementable |
| 7 | **Estado aprueba documento de validacion** | Formalizacion | **Pospuesto hasta D-01** |
| 8 | **Taller sube de nivel** | Gamificacion | Implementable |

**8 tests, no 50.** Cada uno cubre un flujo end-to-end completo, sin probar variantes ni edge cases. Para esos, hay tests unitarios o pruebas manuales.

---

## 4. Configuracion

### 4.1 — Variables de entorno para tests

```bash
# .env.test (no se commitea — se setea en CI)
TEST_BASE_URL=https://plataforma-textil-preview.vercel.app
TEST_TIMEOUT=30000
TEST_HEADLESS=true

# Credenciales de seed (solo validas en dev/preview, no en prod)
TEST_TALLER_EMAIL=roberto.gimenez@laaguja.test
TEST_TALLER_PASSWORD=pdt2026
TEST_MARCA_EMAIL=marta.perez@dulcemoda.test
TEST_MARCA_PASSWORD=pdt2026
TEST_ADMIN_EMAIL=lucia.fernandez@pdt.org.ar
TEST_ADMIN_PASSWORD=pdt2026
TEST_ESTADO_EMAIL=anabelen.torres@pdt.org.ar
TEST_ESTADO_PASSWORD=pdt2026
```

### 4.2 — `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // npm run dev ejecuta "next dev" — confirmado en package.json
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
```

### 4.3 — Stop si DB es production

Cada test arranca con un check defensivo:

```typescript
// tests/e2e/_helpers/safety.ts
export async function ensureNotProduction(page: Page) {
  const url = page.url()
  if (url.includes('plataforma-textil.vercel.app') && !url.includes('preview')) {
    throw new Error('REFUSED: Tests no pueden correr contra produccion')
  }
}
```

Llamado al principio de cada test. Hard-stop si alguien apunta `TEST_BASE_URL` a prod por error.

### 4.4 — Referencia de campos reales en formularios

Los tests usan selectores basados en los `name` attributes reales de cada formulario. Referencia:

**Login** (`src/app/(auth)/login/page.tsx`) — react-hook-form con `register()`:
- `input[name="email"]` — correcto
- `input[name="password"]` — correcto

**Registro** (`src/app/(auth)/registro/page.tsx`) — react-hook-form, **formulario multi-step**:
- Step 1 (info personal): `nombre`, `email`, `password`, `confirmPassword`, `phone`, `terminos`
- Step 2 (info de entidad): `nombreEntidad`, `cuit`
- Los tests deben navegar entre pasos (no se puede completar todo de una vez)

**Pedido nuevo** (`src/marca/componentes/publicar-pedido.tsx`) — **controlled components con useState, sin `name` attributes**:
- Usar `page.getByLabel()` o `page.getByPlaceholder()` para los campos
- Los procesos se seleccionan con **toggle buttons** (no checkboxes con `value`). Agregar `data-testid="proceso-confeccion"` al toggle correspondiente

**Cotizacion** (`src/taller/componentes/cotizar-form.tsx`) — **controlled components con useState, sin `name` attributes**:
- El campo de texto libre se llama `mensaje` (no "comentario")
- Usar `page.getByLabel()` o `page.getByPlaceholder()` para los campos

---

## 5. Helpers reutilizables

### 5.1 — Auth helper

```typescript
// tests/e2e/_helpers/auth.ts
import { Page } from '@playwright/test'

export async function loginAs(page: Page, rol: 'taller' | 'marca' | 'admin' | 'estado') {
  const credenciales = {
    taller: {
      email: process.env.TEST_TALLER_EMAIL!,
      password: process.env.TEST_TALLER_PASSWORD!,
      rutaEsperada: /\/taller/,
    },
    marca: {
      email: process.env.TEST_MARCA_EMAIL!,
      password: process.env.TEST_MARCA_PASSWORD!,
      rutaEsperada: /\/marca/,
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL!,
      password: process.env.TEST_ADMIN_PASSWORD!,
      rutaEsperada: /\/admin/,
    },
    estado: {
      email: process.env.TEST_ESTADO_EMAIL!,
      password: process.env.TEST_ESTADO_PASSWORD!,
      rutaEsperada: /\/estado/,
    },
  }[rol]

  await page.goto('/login')
  await page.fill('input[name="email"]', credenciales.email)
  await page.fill('input[name="password"]', credenciales.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(credenciales.rutaEsperada, { timeout: 15000 })
}

export async function logout(page: Page) {
  // NextAuth v5 usa signOut({ callbackUrl: '/login' }) client-side.
  // No hay pagina intermedia con button[type="submit"] en /api/auth/signout.
  // El logout se dispara desde botones "Cerrar Sesion" en la UI
  // (user-sidebar.tsx, logout-button.tsx).
  //
  // Para tests confiables, hacer click en el boton visible:
  await page.click('button:has-text("Cerrar")')
  await page.waitForURL('/login', { timeout: 10000 })
}
```

### 5.2 — Cleanup de datos de prueba

Cada test que crea datos los limpia al terminar.

```typescript
// tests/e2e/_helpers/cleanup.ts
import { prisma } from '@/compartido/lib/prisma'

export async function limpiarPedidoTest(omId: string) {
  await prisma.pedido.deleteMany({
    where: { omId, /* algun flag para identificar test data */ }
  })
}
```

**Importante:** los tests se ejecutan contra Preview, que tiene su propia DB (de I-01). No hay riesgo de contaminar produccion.

---

## 6. Tests de flujos criticos

### 6.0 — Atributos `data-*` requeridos

Los tests usan `data-action`, `data-filter` y `data-estado` como selectores estables. **Ninguno existe hoy en los componentes.** Antes de ejecutar los tests, agregar estos atributos en los archivos indicados:

| Atributo | Archivo | Elemento |
|---|---|---|
| `data-action="publicar"` | `src/marca/componentes/publicar-pedido.tsx` | Boton submit de publicar pedido |
| `data-action="enviar-cotizacion"` | `src/taller/componentes/cotizar-form.tsx` | Boton submit de enviar cotizacion |
| `data-action="ver-cotizaciones"` | `src/app/(marca)/marca/pedidos/[id]/page.tsx` | Seccion/boton que abre lista de cotizaciones |
| `data-action="aceptar-cotizacion"` | `src/marca/componentes/aceptar-cotizacion.tsx` | Boton principal de aceptar |
| `data-action="confirmar-aceptacion"` | `src/marca/componentes/aceptar-cotizacion.tsx` | Boton confirmar dentro del modal |
| `data-filter="con-pendientes"` | `src/app/(estado)/estado/page.tsx` | Boton de filtro para talleres con pendientes |
| `data-estado="PENDIENTE"` / `"COMPLETADO"` | `src/app/(marca)/marca/pedidos/[id]/page.tsx` | Contenedores de estado de documentos |
| `data-action="confirmar-aprobacion"` | `src/taller/componentes/orden-actions.tsx` | Boton confirmar aprobacion |
| `data-testid="proceso-confeccion"` | `src/marca/componentes/publicar-pedido.tsx` | Toggle button del proceso Confeccion |

Estos atributos no afectan comportamiento ni estilos — solo agregan hooks para selectores E2E.

### 6.1 — Test 1: Registro y primer login del taller

```typescript
// tests/e2e/registro-taller.spec.ts
import { test, expect } from '@playwright/test'

test('Taller se registra y hace primer login', async ({ page }) => {
  // CUIT unico para evitar colisiones
  const cuit = `20${Date.now().toString().slice(-9)}5`
  const email = `test-taller-${Date.now()}@laaguja.test`

  // Paso 1: ir al registro
  await page.goto('/registro')

  // Paso 2: completar step 1 (info personal)
  // Registro usa react-hook-form multi-step
  await page.fill('input[name="nombre"]', `Taller Test ${Date.now()}`)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', 'pdt2026')
  await page.fill('input[name="confirmPassword"]', 'pdt2026')
  await page.fill('input[name="phone"]', '11 1234-5678')

  // Aceptar terminos
  await page.click('input[type="checkbox"][name="terminos"]')

  // Avanzar al step 2
  await page.click('button[type="submit"]')

  // Paso 3: completar step 2 (info de entidad)
  await page.fill('input[name="nombreEntidad"]', `Taller E2E ${Date.now()}`)
  await page.fill('input[name="cuit"]', cuit)

  // Submit final
  await page.click('button[type="submit"]')

  // Paso 4: verificar que llego al dashboard del taller
  await expect(page).toHaveURL(/\/taller/, { timeout: 15000 })

  // Paso 5: verificar elementos clave del dashboard
  await expect(page.getByText('Tu proximo nivel')).toBeVisible()
  await expect(page.getByText('BRONCE')).toBeVisible()
})
```

### 6.2 — Test 2: Login de 4 roles

```typescript
// tests/e2e/auth-roles.spec.ts
import { test, expect } from '@playwright/test'
import { loginAs } from './_helpers/auth'

test.describe('Auth multi-rol', () => {
  test('Taller llega a /taller', async ({ page }) => {
    await loginAs(page, 'taller')
    await expect(page).toHaveURL(/\/taller/)
  })

  test('Marca llega a /marca', async ({ page }) => {
    await loginAs(page, 'marca')
    await expect(page).toHaveURL(/\/marca/)
  })

  test('Admin llega a /admin', async ({ page }) => {
    await loginAs(page, 'admin')
    await expect(page).toHaveURL(/\/admin/)
  })

  test('Estado llega a /estado', async ({ page }) => {
    await loginAs(page, 'estado')
    await expect(page).toHaveURL(/\/estado/)
  })

  test('Credenciales invalidas muestran error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'fake@test.com')
    await page.fill('input[name="password"]', 'wrongpass')
    await page.click('button[type="submit"]')
    await expect(page.getByText(/credenciales/i)).toBeVisible({ timeout: 10000 })
  })
})
```

### 6.3 — Test 3: Marca crea pedido y taller cotiza

```typescript
// tests/e2e/flujo-comercial.spec.ts
import { test, expect } from '@playwright/test'
import { loginAs, logout } from './_helpers/auth'

test('Flujo completo: marca crea pedido -> taller cotiza -> marca acepta', async ({ page }) => {
  // === Marca crea pedido ===
  await loginAs(page, 'marca')

  await page.goto('/marca/pedidos/nuevo')

  // Formulario usa controlled components (useState), no name attributes.
  // Usar getByLabel o getByPlaceholder para los campos.
  await page.getByLabel(/tipo de prenda/i).fill('Remera deportiva')
  await page.getByLabel(/cantidad/i).fill('500')
  await page.getByLabel(/descripcion/i).fill('Test E2E - pedido temporal')

  // Procesos se seleccionan con toggle buttons, no checkboxes.
  // Requiere data-testid="proceso-confeccion" agregado al componente.
  await page.getByTestId('proceso-confeccion').click()

  await page.click('button[data-action="publicar"]')

  // Capturar el ID del pedido creado
  await page.waitForURL(/\/marca\/pedidos\/[\w-]+$/, { timeout: 15000 })
  const pedidoUrl = page.url()
  const pedidoId = pedidoUrl.split('/').pop()

  await expect(page.getByText(/publicado/i)).toBeVisible()

  await logout(page)

  // === Taller cotiza ===
  await loginAs(page, 'taller')

  await page.goto('/taller/pedidos/disponibles')
  await page.click(`a[href*="${pedidoId}"]`)

  // Cotizacion usa controlled components, sin name attributes.
  // El campo de texto se llama "mensaje" (no "comentario").
  await page.getByLabel(/precio/i).fill('15000')
  await page.getByLabel(/mensaje/i).fill('Cotizacion test')
  await page.click('button[data-action="enviar-cotizacion"]')

  await expect(page.getByText(/cotizacion enviada/i)).toBeVisible({ timeout: 10000 })

  await logout(page)

  // === Marca acepta cotizacion ===
  await loginAs(page, 'marca')

  await page.goto(pedidoUrl)
  await page.click('button[data-action="ver-cotizaciones"]')
  await page.click('button[data-action="aceptar-cotizacion"]')

  // Confirmar en modal
  await page.click('button[data-action="confirmar-aceptacion"]')

  await expect(page.getByText(/cotizacion aceptada/i)).toBeVisible({ timeout: 10000 })

  // Verificar que el pedido cambio de estado
  await page.reload()
  await expect(page.getByText(/en ejecucion|esperando confirmacion/i)).toBeVisible()
})
```

### 6.4 — Test 4: Estado aprueba documento

**DEPENDENCIA BLOQUEANTE: D-01 (redefinicion de roles ESTADO)**

Este test usa `/estado/talleres/[id]` con tab `?tab=formalizacion`, que es definido por el spec D-01 (`v3-redefinicion-roles-estado.md`) pero **no esta implementado todavia**. Las paginas `/estado/talleres/` y `/estado/talleres/[id]` no existen.

**No se puede escribir ni ejecutar hasta que D-01 este mergeado.** Hasta entonces, mantener el flujo equivalente como test alternativo usando `/admin/talleres/[id]` que si existe con tab formalizacion.

#### Test alternativo (mientras D-01 no esta implementado)

```typescript
// tests/e2e/aprobacion-documento.spec.ts
test('Admin aprueba documento de taller (alternativo hasta D-01)', async ({ page }) => {
  // Usa /admin/talleres/[id] que SI existe con tab formalizacion
  await loginAs(page, 'admin')

  await page.goto('/admin/talleres')

  // Click en el primer taller
  await page.click('table tbody tr:first-child a')

  // Ir a tab Formalizacion (existe en admin)
  await page.click('a[href*="?tab=formalizacion"]')

  // Click en aprobar el primer documento PENDIENTE
  const primerDocPendiente = page.locator('[data-estado="PENDIENTE"]:has-text("Ver documento")').first()
  const aprobar = primerDocPendiente.locator('button:has-text("Aprobar")')
  await aprobar.click()

  // Confirmar en modal
  await page.getByLabel(/comentario/i).fill('Test E2E - aprobacion')
  await page.click('button[data-action="confirmar-aprobacion"]')

  // Verificar success
  await expect(page.getByText(/aprobada correctamente/i)).toBeVisible({ timeout: 10000 })

  // Verificar que el documento ahora aparece como COMPLETADO
  await page.waitForTimeout(1000)  // breve espera para refresh
  await expect(primerDocPendiente).toHaveAttribute('data-estado', 'COMPLETADO')
})
```

#### Test definitivo (cuando D-01 este mergeado)

```typescript
// tests/e2e/aprobacion-documento-estado.spec.ts
// POSPUESTO: activar cuando D-01 (v3-redefinicion-roles-estado) este mergeado
test.skip('Estado aprueba documento de taller — sube de nivel', async ({ page }) => {
  await loginAs(page, 'estado')

  await page.goto('/estado/talleres')

  // Filtrar por talleres con documentos pendientes
  await page.click('button[data-filter="con-pendientes"]')

  // Click en el primer taller con pendientes
  await page.click('table tbody tr:first-child a')

  // Ir a tab Formalizacion
  await page.click('a[href*="?tab=formalizacion"]')

  // Click en aprobar el primer documento PENDIENTE
  const primerDocPendiente = page.locator('[data-estado="PENDIENTE"]:has-text("Ver documento")').first()
  const aprobar = primerDocPendiente.locator('button:has-text("Aprobar")')
  await aprobar.click()

  // Confirmar en modal
  await page.getByLabel(/comentario/i).fill('Test E2E - aprobacion')
  await page.click('button[data-action="confirmar-aprobacion"]')

  // Verificar success
  await expect(page.getByText(/aprobada correctamente/i)).toBeVisible({ timeout: 10000 })

  // Verificar que el documento ahora aparece como COMPLETADO
  await page.waitForTimeout(1000)  // breve espera para refresh
  await expect(primerDocPendiente).toHaveAttribute('data-estado', 'COMPLETADO')
})
```

---

## 7. Patrones aprendidos

### 7.1 — Selectores estables

Usar `data-action`, `data-filter`, `data-estado`, `data-testid` en lugar de clases CSS o textos exactos:

Si `page.click('button[data-action="aceptar-cotizacion"]')`
No `page.click('button.btn-primary.bg-violet-600')`
No `page.click('button:has-text("Aceptar")')` (puede haber varios)

**Los componentes existentes deben ser modificados** para incluir estos atributos. Ver tabla completa en seccion 6.0.

Para formularios con controlled components (sin `name`), usar `page.getByLabel()` o `page.getByPlaceholder()` en vez de `input[name="..."]`.

### 7.2 — Esperas explicitas, no fijas

Si `await expect(page.getByText(/cotizacion aceptada/i)).toBeVisible({ timeout: 10000 })`
No `await page.waitForTimeout(5000)`

### 7.3 — Tests independientes

Cada test debe poder correr aislado. Si depende de otro test, refactorizar en helper compartido.

### 7.4 — Datos generados con timestamp

Para evitar colisiones entre runs:
```typescript
const cuit = `20${Date.now().toString().slice(-9)}5`
const email = `test-${Date.now()}@example.com`
```

---

## 8. Integracion con CI/CD

### 8.1 — GitHub Action

Archivo: `.github/workflows/e2e.yml`

**No hay conflicto con `qa-pages.yml`:** ese workflow solo se dispara con push a `develop` filtrado por paths (`QA_v2-*.md` y `generate-qa.js`), no ejecuta `npm ci`, y deploya a GitHub Pages. Los workflows son completamente independientes.

```yaml
name: E2E Tests

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    env:
      TEST_BASE_URL: ${{ secrets.TEST_BASE_URL }}
      TEST_TALLER_EMAIL: ${{ secrets.TEST_TALLER_EMAIL }}
      TEST_TALLER_PASSWORD: ${{ secrets.TEST_TALLER_PASSWORD }}
      # ... resto de credenciales

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - run: npx playwright install --with-deps chromium

      - run: npx playwright test
        continue-on-error: false

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### 8.2 — Bloqueo de merge

Configurar branch protection en GitHub:
- Require status checks: E2E Tests
- Require branches up to date

---

## 9. Casos borde

- **Tests fallan en CI pero pasan localmente** — flakiness por timing. Mitigacion: las esperas son explicitas, no fijas. Los `retries: 2` en CI absorben fallos transitorios.

- **Preview no responde durante el test** — timeout de 30s por defecto. Si Preview esta lento, los tests fallan. Mitigacion: verificar deploy de Preview antes de mergear.

- **Datos de seed cambian** — si alguien modifica el seed y no actualiza los tests, los tests con credenciales fijas fallan. Mitigacion: mantener `TEST_*` en sync con seed. Documentar en `tests/e2e/README.md`.

- **CUIT generado por test ya existe** — improbable porque incluye `Date.now()`. Si pasa, el test falla con mensaje claro.

- **Test E2E corre contra DB compartida** — riesgo de tests pisando datos. Mitigacion: I-01 garantiza que Preview tiene su propia DB.

- **Tests dependientes** — si un test crea data y otro la usa, son fragiles. Cada test debe ser autonomo.

- **Formularios sin `name` attributes** — los formularios de pedido y cotizacion usan controlled components con useState. Los selectores `input[name="..."]` no funcionan ahi. Usar `getByLabel()`, `getByPlaceholder()` o `data-testid`.

---

## 10. Criterios de aceptacion

- [ ] `playwright.config.ts` actualizado con multi-environment
- [ ] Helper `loginAs(page, rol)` implementado
- [ ] Helper `logout(page)` implementado (click en boton "Cerrar Sesion", no POST a /api/auth/signout)
- [ ] Helper `ensureNotProduction(page)` implementado
- [ ] 7 tests criticos implementados y pasando localmente (test 7 pospuesto hasta D-01)
- [ ] Test alternativo de aprobacion via `/admin/talleres/[id]` funcionando
- [ ] `data-action`, `data-filter`, `data-estado`, `data-testid` agregados a los 9 componentes listados en seccion 6.0
- [ ] GitHub Action `e2e.yml` configurada (sin conflicto con `qa-pages.yml`)
- [ ] Tests corren en cada PR a `develop` y `main`
- [ ] Branch protection bloquea merge si tests fallan
- [ ] Variables de entorno configuradas en GitHub Secrets
- [ ] `tests/e2e/README.md` documentando como correr local y debug
- [ ] Reporte HTML generado en cada falla
- [ ] Build sin errores de TypeScript

---

## 11. Tests del propio framework

Antes de declarar "tests funcionando", validar:

| # | Que validar | Como | Verificador |
|---|------------|------|-------------|
| 1 | Tests pasan localmente | `npm run test:e2e` (script ya existe en package.json) | DEV |
| 2 | Tests pasan en CI | Push a una branch, ver Actions | DEV |
| 3 | Falla intencional muestra reporte | Romper assertion, verificar HTML report | DEV |
| 4 | Hard-stop contra prod funciona | Setear `TEST_BASE_URL` a prod, ver error | DEV |
| 5 | Branch protection bloquea merge | Romper test, intentar merge | DEV |
| 6 | Retries absorben fallas transitorias | Simular timeout, ver retry | DEV |

---

## 12. Mantenimiento de los tests

- Cada vez que se cambie un flujo critico (ej: agregar paso al wizard de registro), actualizar el test correspondiente
- Cada vez que se agregue un atributo `data-*` por test, mantenerlo en futuras refactorizaciones
- Si un test falla en CI consistentemente y es flakiness real, investigar antes de skipearlo
- No agregar tests nuevos a la suite "critica" sin justificacion — es ruido
- Cuando D-01 se mergee, activar el test definitivo de estado (seccion 6.4) y retirar el alternativo

---

## 13. Validacion de dominio (perfiles interdisciplinarios)

**Politologo:** este spec es puramente tecnico, no aplica.

**Economista:** este spec es puramente tecnico, no aplica.

**Sociologo:** este spec es puramente tecnico, no aplica.

**Contador:** este spec es puramente tecnico, no aplica.

(El Eje 6 de validacion de dominio del formato ampliado se omite — este spec no tiene aspectos de dominio textil/institucional.)

---

## 14. Referencias

- V3_BACKLOG -> Q-01
- Playwright docs: https://playwright.dev
- I-01 — define que tests corren contra Preview, no produccion
- D-01 — define rutas de ESTADO usadas en test 6.4 (dependencia bloqueante — no implementado aun)
- F-02 — los tests no verifican WhatsApp (manual)
