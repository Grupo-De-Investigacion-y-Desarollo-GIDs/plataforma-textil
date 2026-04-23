# Spec: Fix de tests E2E de seguridad + ampliación de cobertura

**Versión:** v2
**Asignado a:** Sergio
**Prioridad:** P0 — los tests reportan falsos positivos como bugs críticos de seguridad

---

## 1. Contexto

Los hallazgos **H-22, H-23 y H-24** reportaron que TALLER puede acceder a `/admin` y `/estado`, y que MARCA puede acceder a `/taller`. **Son falsos positivos.** El middleware funciona correctamente — redirige a `/unauthorized` en los 3 casos. El problema está en los tests de Playwright: las condiciones del assertion no contemplan `/unauthorized` ni matchean el texto real de esa página.

**Verificado** contra `src/middleware.ts` y `src/app/unauthorized/page.tsx`:

- El middleware redirige a `/unauthorized` con `NextResponse.redirect(new URL('/unauthorized', nextUrl))` para todos los cruces de rol prohibidos.
- La página `/unauthorized` muestra literalmente *"Acceso No Autorizado"* (con "N" mayúscula) y *"No tienes permiso para acceder a esta sección de la plataforma"*.
- Los tests actuales buscan `body.includes('No autorizado')` (con "a" minúscula) y `body.includes('Acceso denegado')` (texto que la página nunca contiene). Ninguna de las dos condiciones matchea.

**No hay cambios en `middleware.ts` ni `auth.config.ts`** — el sistema de seguridad es funcional. Este spec solo arregla los tests y amplía la cobertura.

---

## 2. El bug en los tests

Los 3 tests en `e2e/checklist-sec7-8.spec.ts` (Sec 8, items 8.1, 8.2, 8.3) usan este patrón:

```ts
const blocked = url.includes('/login') || url.includes('/taller') ||
  body?.includes('No autorizado') || body?.includes('no autorizado') ||
  body?.includes('Acceso denegado')
```

Ninguna condición matchea lo que realmente pasa:

| Condición del test | Realidad |
|---|---|
| `url.includes('/login')` | La URL final es `/unauthorized`, no `/login` |
| `url.includes('/taller')` / `url.includes('/marca')` | Idem, la URL es `/unauthorized` |
| `body.includes('No autorizado')` | La página dice *"Acceso **No** Autorizado"* — `.includes()` es case-sensitive y no matchea `"No autorizado"` con "a" minúscula |
| `body.includes('no autorizado')` | Mismo problema de case — "N" de la página vs "n" del test |
| `body.includes('Acceso denegado')` | La página no contiene esa frase en ningún lado |

---

## 3. Fix — helper `assertAccesoBloqueado`

**Archivo a modificar:** `e2e/helpers/auth.ts`

Agregar al final del archivo:

```ts
export function assertAccesoBloqueado(url: string, body: string | null): boolean {
  const bodyLower = body?.toLowerCase() ?? ''
  return (
    url.includes('/login') ||
    url.includes('/unauthorized') ||
    bodyLower.includes('no autorizado') ||
    bodyLower.includes('no tienes permiso') ||
    bodyLower.includes('acceso denegado')
  )
}
```

El `toLowerCase()` resuelve el case-sensitivity del bug original: *"Acceso No Autorizado"* pasa a *"acceso no autorizado"*, que contiene `"no autorizado"`.

Las 5 condiciones juntas cubren:

- `/login` (por si el middleware redirige como no autenticado)
- `/unauthorized` (el caso real del middleware actual)
- Texto "no autorizado" (matchea el h1 de la página)
- Texto "no tienes permiso" (matchea el párrafo de la página)
- Texto "acceso denegado" (por si se agrega una variante futura)

---

## 4. Fix — extender `loginAs` para soportar rol CONTENIDO

**Archivo a modificar:** `e2e/helpers/auth.ts`

Los tests nuevos de §6 llaman `loginAs(page, 'contenido')`. Hoy el helper no soporta ese valor — TypeScript falla.

### Cambio 1 — extender el union type del parámetro `role`

En la línea 3:

```ts
// ANTES:
export async function loginAs(page: Page, role: 'admin' | 'taller_bronce' | 'taller_oro' | 'marca' | 'estado') {

// DESPUÉS:
export async function loginAs(page: Page, role: 'admin' | 'taller_bronce' | 'taller_oro' | 'marca' | 'estado' | 'contenido') {
```

### Cambio 2 — agregar `contenido` al record `credentials`

En el objeto `credentials` (líneas 4-10), **agregar solo** la clave `contenido`. La clave `estado` **ya existe** en `auth.ts:9` — no tocar, no duplicar:

```ts
const credentials = {
  admin:         { email: 'lucia.fernandez@pdt.org.ar',   password: 'pdt2026' },
  taller_bronce: { email: 'roberto.gimenez@pdt.org.ar',   password: 'pdt2026' },
  taller_oro:    { email: 'carlos.mendoza@pdt.org.ar',    password: 'pdt2026' },
  marca:         { email: 'martin.echevarria@pdt.org.ar', password: 'pdt2026' },
  estado:        { email: 'anabelen.torres@pdt.org.ar',   password: 'pdt2026' },
  contenido:     { email: 'sofia.martinez@pdt.org.ar',    password: 'pdt2026' },  // ← nuevo
}
```

> **Importante:** los dos cambios son obligatorios. Si solo se agrega al record y no al union type, TypeScript falla en los tests nuevos con *"Argument of type '\"contenido\"' is not assignable"*.

---

## 5. Fix — reescribir los 3 tests existentes

**Archivo a modificar:** `e2e/checklist-sec7-8.spec.ts` (tests 8.1, 8.2, 8.3 de `test.describe('Sec 8: SEGURIDAD', ...)`)

Agregar `assertAccesoBloqueado` al import:

```ts
import { loginAs, assertAccesoBloqueado } from './helpers/auth'
```

Y reescribir los tests:

```ts
test('8.1 Taller NO puede acceder a /admin', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/admin')
  await page.waitForLoadState('networkidle')
  const url = page.url()
  const body = await page.locator('body').textContent()
  expect(assertAccesoBloqueado(url, body)).toBeTruthy()
})

test('8.2 Taller NO puede acceder a /estado', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/estado')
  await page.waitForLoadState('networkidle')
  const url = page.url()
  const body = await page.locator('body').textContent()
  expect(assertAccesoBloqueado(url, body)).toBeTruthy()
})

test('8.3 Marca NO puede acceder a /taller', async ({ page }) => {
  await loginAs(page, 'marca')
  await page.goto('/taller')
  await page.waitForLoadState('networkidle')
  const url = page.url()
  const body = await page.locator('body').textContent()
  expect(assertAccesoBloqueado(url, body)).toBeTruthy()
})
```

El test 8.4 (*"Sin sesion redirige a /login"*) no se toca — ya funciona.

---

## 6. Ampliación — archivo nuevo `e2e/seguridad-roles.spec.ts`

### 6.1 Prerequisito — verificar que las rutas existen

Antes de implementar los tests positivos (ESTADO → `/admin/auditorias`, CONTENIDO → `/admin/colecciones`, ESTADO no puede a `/admin/usuarios`), **verificar que los 3 paths existen** en el codebase:

```bash
ls src/app/\(admin\)/admin/auditorias/
ls src/app/\(admin\)/admin/usuarios/
ls src/app/\(admin\)/admin/colecciones/
```

Si alguna página no existe:

- La ruta da 404 → el test falla por razón equivocada (no por middleware)
- Decisión: elegir otra ruta equivalente del mismo scope, o remover ese test

Si las 3 existen, seguir adelante con los tests de §6.2.

### 6.2 Tests

```ts
import { test, expect } from '@playwright/test'
import { loginAs, assertAccesoBloqueado } from './helpers/auth'

test.describe('Seguridad: control de acceso por rol', () => {

  // ========== Casos que DEBEN bloquear ==========

  test('ESTADO no puede acceder a /admin general', async ({ page }) => {
    await loginAs(page, 'estado')
    await page.goto('/admin/usuarios')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('CONTENIDO no puede acceder a /admin/usuarios', async ({ page }) => {
    await loginAs(page, 'contenido')
    await page.goto('/admin/usuarios')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('CONTENIDO no puede acceder a /taller', async ({ page }) => {
    await loginAs(page, 'contenido')
    await page.goto('/taller')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('MARCA no puede acceder a /estado', async ({ page }) => {
    await loginAs(page, 'marca')
    await page.goto('/estado')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('MARCA no puede acceder a /admin', async ({ page }) => {
    await loginAs(page, 'marca')
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('TALLER no puede acceder a /marca', async ({ page }) => {
    await loginAs(page, 'taller_bronce')
    await page.goto('/marca')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  // ========== Casos que DEBEN permitir ==========

  test('ESTADO SÍ puede acceder a /admin/auditorias', async ({ page }) => {
    await loginAs(page, 'estado')
    await page.goto('/admin/auditorias')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/auditorias')
  })

  test('CONTENIDO SÍ puede acceder a /admin/colecciones', async ({ page }) => {
    await loginAs(page, 'contenido')
    await page.goto('/admin/colecciones')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/colecciones')
  })

  test('ADMIN SÍ puede acceder a /estado', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/estado')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/estado')
  })

  test('ADMIN SÍ puede acceder a /contenido', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/contenido')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/contenido')
  })

})
```

Total: 10 tests nuevos (6 negativos + 4 positivos).

---

## 7. Cómo ejecutar los tests

**Los tests de seguridad deben ejecutarse contra producción, NO contra localhost:3000.**

Razón: el helper `loginAs` (líneas 24-33 de `e2e/helpers/auth.ts`) tiene un throw explícito cuando NextAuth v5 + Next.js 16 en dev mode redirige a `/api/auth/error`. En local dev, el login falla antes de que los tests puedan ejecutarse. Contra producción funciona normalmente.

### Comando exacto

```bash
BASE_URL=https://plataforma-textil.vercel.app npx playwright test e2e/checklist-sec7-8.spec.ts e2e/seguridad-roles.spec.ts
```

Esto corre **solo los tests de seguridad**, saltando el resto de la suite. Útil para iterar rápido durante el desarrollo del fix.

Para correr toda la suite de seguridad más los tests originales de Sec 7 y 8:

```bash
BASE_URL=https://plataforma-textil.vercel.app npx playwright test e2e/checklist-sec7-8.spec.ts
```

### Qué esperar

- Con el fix aplicado: **13 tests en verde** (3 originales corregidos + 10 nuevos). El test 8.4 (*"Sin sesion redirige a /login"*) también debería pasar sin cambios.
- Sin el fix: los 3 originales siguen fallando como hoy (falsos positivos), los 10 nuevos no existen.

---

## 8. Criterio de aceptación

- [ ] Helper `assertAccesoBloqueado` agregado a `e2e/helpers/auth.ts`
- [ ] Union type de `loginAs` extendido con `| 'contenido'`
- [ ] Credencial `contenido` agregada al record (sin duplicar `estado` que ya existe)
- [ ] Los 3 tests originales (8.1, 8.2, 8.3) de `e2e/checklist-sec7-8.spec.ts` reescritos usando el helper
- [ ] Archivo nuevo `e2e/seguridad-roles.spec.ts` con los 10 tests de ampliación
- [ ] Las 3 rutas asumidas (`/admin/auditorias`, `/admin/usuarios`, `/admin/colecciones`) verificadas como existentes antes de implementar los tests positivos
- [ ] `BASE_URL=https://plataforma-textil.vercel.app npx playwright test e2e/checklist-sec7-8.spec.ts e2e/seguridad-roles.spec.ts` corre en verde (13 tests de seguridad)
- [ ] Build de TypeScript pasa sin errores

> **"Pasan"** significa explícitamente **contra producción** con el `BASE_URL` de arriba. Contra `localhost:3000` los tests no ejecutan por el issue conocido de NextAuth v5 + Next.js 16 en dev mode.

---

## 9. Nota importante: si un test nuevo falla

Los 10 tests nuevos son **cobertura adicional** — si alguno falla en producción, eso indicaría un bug real en el middleware que el análisis estático no capturó. En ese caso:

1. **No seguir implementando más tests** — parar.
2. Capturar: URL final, body de la página, role del usuario, ruta atacada.
3. Reportar a Gerardo con el detalle para que revise `src/middleware.ts` — probablemente hay una excepción o un typo en la lógica de `pathname.startsWith(...)`.
4. No modificar el middleware sin coordinar — los cambios en ese archivo son críticos.

Los 3 tests originales (H-22/23/24) **sí** son falsos positivos confirmados y pueden arreglarse sin consultar.

---

## 10. Archivos tocados

| Archivo | Cambios |
|---|---|
| `e2e/helpers/auth.ts` | Agregar `assertAccesoBloqueado`, extender union type de `loginAs`, agregar credencial `contenido` |
| `e2e/checklist-sec7-8.spec.ts` | Reescribir tests 8.1, 8.2, 8.3. Agregar import de `assertAccesoBloqueado` |
| `e2e/seguridad-roles.spec.ts` | **Nuevo archivo** con 10 tests de cobertura ampliada |

No se toca código de producción. No hay migraciones. No hay cambios de schema.
