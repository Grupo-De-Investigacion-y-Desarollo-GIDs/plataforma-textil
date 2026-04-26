# Tests E2E — Plataforma Digital Textil

## Setup rapido

```bash
# Instalar browsers (solo la primera vez)
npx playwright install --with-deps chromium

# Correr tests contra dev server local
npx playwright test

# Correr con UI interactiva (debug)
npx playwright test --ui

# Correr solo un test
npx playwright test smoke

# Correr con browser visible
npx playwright test --headed

# Ver reporte HTML de la ultima corrida
npx playwright show-report
```

## Variables de entorno

Los tests usan credenciales del seed por defecto. Para override, crear `.env.test` (no se commitea):

```bash
# Apuntar a Preview en vez de localhost
TEST_BASE_URL=https://plataforma-textil-dev.vercel.app

# Override de credenciales (solo si cambian del seed)
TEST_ADMIN_EMAIL=lucia.fernandez@pdt.org.ar
TEST_ADMIN_PASSWORD=pdt2026
TEST_TALLER_EMAIL=roberto.gimenez@pdt.org.ar
TEST_TALLER_PASSWORD=pdt2026
TEST_MARCA_EMAIL=martin.echevarria@pdt.org.ar
TEST_MARCA_PASSWORD=pdt2026
TEST_ESTADO_EMAIL=anabelen.torres@pdt.org.ar
TEST_ESTADO_PASSWORD=pdt2026
```

Para correr con env file:

```bash
# Linux/Mac
env $(cat .env.test | xargs) npx playwright test

# O simplemente setear TEST_BASE_URL inline
TEST_BASE_URL=https://plataforma-textil-dev.vercel.app npx playwright test
```

## Estructura

```
tests/e2e/
  _helpers/
    auth.ts       — loginAs(page, rol), logout(page)
    safety.ts     — ensureNotProduction(page)
    cleanup.ts    — helpers para limpiar datos de test
  smoke.spec.ts   — test basico que verifica que el setup funciona
  README.md       — este archivo
```

## Helpers disponibles

### `loginAs(page, rol)`
Login como `'taller' | 'marca' | 'admin' | 'estado'`. Usa credenciales de env vars con fallback al seed.

### `logout(page)`
Click en "Cerrar sesion" en la UI. NO usa `/api/auth/signout` (NextAuth v5 no tiene form POST ahi).

### `ensureNotProduction(page)`
Hard-stop si `TEST_BASE_URL` apunta a produccion. Llamar al principio de cada test.

### `limpiarPedidoTest(page, omId)` / `limpiarUsuarioTest(page, email)`
Cleanup de datos via API. Requiere estar logueado como ADMIN.

## CI/CD

Los tests corren automaticamente via GitHub Actions (`.github/workflows/e2e.yml`) en:
- Cada PR a `develop` o `main`
- Cada push a `develop` o `main`

Los secrets necesarios estan configurados en el repo de GitHub:
- `TEST_BASE_URL` — URL de Preview
- `TEST_*_EMAIL` / `TEST_*_PASSWORD` — credenciales por rol

## Seguridad

- `ensureNotProduction()` impide que los tests corran contra el dominio de produccion
- Las credenciales hardcodeadas son de seed (solo validas en dev/preview)
- Preview tiene su propia DB (I-01), no hay riesgo de contaminar produccion

## Debug de tests que fallan

1. Correr con `--headed` para ver el browser
2. Correr con `--ui` para el modo interactivo de Playwright
3. Correr con `--debug` para pausar en cada paso
4. Ver screenshots y videos en `test-results/` (se generan en fallas)
5. Ver reporte HTML: `npx playwright show-report`

## Agregar tests nuevos

Crear un archivo `tests/e2e/nombre.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test('descripcion del test', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'admin')
  // ... assertions
})
```

## Convencion a partir de S-01

A partir de S-01, cada spec V3 debe incluir tests E2E especificos del flujo que toca, ademas de tests Vitest. El archivo de test se nombra segun el spec:

```
tests/e2e/v3-nombre-spec.spec.ts
```

Q-01 final (al terminar Bloque 4) solo agregara los tests core que falten cubrir. No rehace la infraestructura ni duplica tests ya escritos por specs individuales.
