---
spec: v3-error-boundaries
version: V3
bloque: 4
titulo: "Error Boundaries en todos los layouts"
fecha: 2026-04-29
autor: Gerardo (Claude Code)
verificacion_dev: Pendiente
---

# QA: Error Boundaries (Q-02)

## Eje 1 — Paginas de error amigables

### 1.1 Pagina 404 global funciona
- [ ] Abrir https://plataforma-textil-dev.vercel.app/ruta-que-no-existe en incognito
- [ ] Verificar que aparece: titulo "Pagina no encontrada", boton "Volver al inicio"
- [ ] Hacer click en "Volver al inicio" y verificar que lleva a la pagina principal `/`

### 1.2 Pagina 404 en /admin funciona
- [ ] Login como admin (lucia.fernandez@pdt.org.ar / pdt2026)
- [ ] Navegar a https://plataforma-textil-dev.vercel.app/admin/pagina-que-no-existe
- [ ] Verificar que aparece: titulo "Pagina no encontrada", mensaje "Esta pagina de administracion no existe"
- [ ] Hacer click en "Volver al inicio" y verificar que lleva a `/admin`

### 1.3 Pagina 404 en /taller funciona
- [ ] Login como taller (roberto.gimenez@pdt.org.ar / pdt2026)
- [ ] Navegar a https://plataforma-textil-dev.vercel.app/taller/pagina-que-no-existe
- [ ] Verificar que aparece: titulo "Pagina no encontrada", mensaje "No encontramos lo que buscas"
- [ ] Hacer click en "Volver al inicio" y verificar que lleva a `/taller`

### 1.4 Pagina 404 en /marca funciona
- [ ] Login como marca (martin.echevarria@pdt.org.ar / pdt2026)
- [ ] Navegar a https://plataforma-textil-dev.vercel.app/marca/pagina-que-no-existe
- [ ] Verificar que aparece: titulo "Pagina no encontrada"
- [ ] Hacer click en "Volver al inicio" y verificar que lleva a `/marca`

### 1.5 Pagina 404 en /estado funciona
- [ ] Login como estado (anabelen.torres@pdt.org.ar / pdt2026)
- [ ] Navegar a https://plataforma-textil-dev.vercel.app/estado/pagina-que-no-existe
- [ ] Verificar que aparece: titulo "Pagina no encontrada"
- [ ] Hacer click en "Volver al inicio" y verificar que lleva a `/estado`

## Eje 2 — Componentes de error en el codigo

### 2.1 Componente ErrorPage existe y usa Button del design system
- [ ] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/compartido/componentes/error-page.tsx
- [ ] Verificar que el archivo existe y contiene: "Algo salio mal", "Intentar de nuevo", "Volver al inicio", "reportarlo aca"

### 2.2 Componente NotFoundPage existe
- [ ] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/compartido/componentes/not-found-page.tsx
- [ ] Verificar que el archivo existe y contiene: "Pagina no encontrada", "Volver al inicio"

### 2.3 error.tsx existe en cada seccion de la plataforma
- [ ] Abrir cada uno de estos links y verificar que el archivo existe:
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/error.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/global-error.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(admin)/error.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(taller)/error.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(marca)/error.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(estado)/error.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(contenido)/error.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(auth)/error.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(public)/error.tsx

### 2.4 not-found.tsx existe en cada seccion de la plataforma
- [ ] Abrir cada uno de estos links y verificar que el archivo existe:
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/not-found.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(admin)/not-found.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(taller)/not-found.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(marca)/not-found.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(estado)/not-found.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(contenido)/not-found.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(auth)/not-found.tsx
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/(public)/not-found.tsx

## Eje 3 — Logging de errores

### 3.1 Endpoint /api/log-error existe
- [ ] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/log-error/route.ts
- [ ] Verificar que el archivo existe y contiene: `logearError`, `auth()`, `NextResponse.json`

### 3.2 Helper logearError existe
- [ ] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/compartido/lib/error-logger.ts
- [ ] Verificar que el archivo existe y contiene: `logActividad`, `console.error`, `ERROR_RENDER`

## Eje 4 — Feedback widget integrado

### 4.1 Feedback widget se abre desde la pagina de error
- [ ] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/compartido/componentes/feedback-widget.tsx
- [ ] Buscar (Ctrl+F) "open-feedback" y verificar que existe un `addEventListener` para ese evento
- [ ] Buscar "setAbierto(true)" dentro del handler del evento — esto confirma que el widget se abre cuando ErrorPage lo solicita

## Eje 5 — Tests automatizados

### 5.1 Tests Vitest pasan
- [ ] Abrir GitHub Actions y verificar que el ultimo CI en develop esta verde
- [ ] Verificar que existen estos archivos de test en GitHub:
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/__tests__/error-logger.test.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/__tests__/log-error-route.test.ts

### 5.2 Tests E2E de 404 existen
- [ ] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/tests/e2e/error-boundaries.spec.ts
- [ ] Verificar que contiene tests para: ruta inexistente global, admin, taller, marca

## Eje 6 — Validacion de dominio

No aplica — este spec es puramente tecnico.
