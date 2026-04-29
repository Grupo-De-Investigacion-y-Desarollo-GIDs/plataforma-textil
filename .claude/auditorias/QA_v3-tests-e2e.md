---
spec: v3-tests-e2e
version: V3
bloque: 4
titulo: "Tests E2E con Playwright"
fecha: 2026-04-29
autor: Gerardo (Claude Code)
verificacion_dev: Completada por Gerardo el 2026-04-29
---

# QA: Tests E2E (Q-01)

## Eje 1 — CI verde y cobertura de flujos criticos

### 1.1 Suite E2E pasa en CI
- [x] Abrir GitHub Actions: https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/actions/workflows/e2e.yml y verificar que el ultimo run en `main` esta en verde — ✅ Gerardo 29/4
- [ ] Si el ultimo run esta en rojo, abrir el detalle y reportar que test fallo

### 1.2 Los tests cubren los flujos criticos del piloto
- [x] Abrir la carpeta de tests en GitHub: https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/tree/main/tests/e2e y verificar que existen estos 13 archivos .spec.ts — ✅ Gerardo 29/4
- [ ] Verificar que existe `registro-taller.spec.ts` (flujo: taller se registra en 3 pasos y llega a su dashboard)
- [ ] Verificar que existe `registro-marca.spec.ts` (flujo: marca se registra y llega a su dashboard)
- [ ] Verificar que existe `auth-roles.spec.ts` (flujo: login de taller, marca, admin, estado + credenciales invalidas)
- [ ] Verificar que existe `flujo-comercial.spec.ts` (flujo: marca crea pedido → publica → taller cotiza → marca acepta)
- [ ] Verificar que existe `aprobacion-documento.spec.ts` (flujo: ESTADO aprueba documento + ADMIN no puede aprobar)

### 1.3 Tiempo de ejecucion del suite
- [x] Abrir el ultimo run verde en GitHub Actions y verificar que el job `e2e` tardo menos de 10 minutos — ✅ Gerardo 29/4
- [ ] Si tardo mas de 10 minutos, reportar como issue

## Eje 2 — Atributos data-* en componentes

### 2.1 Boton "Publicar pedido" tiene data-action
- [x] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/main/src/marca/componentes/publicar-pedido.tsx y buscar `data-action="publicar"` en el boton — ✅ Gerardo 29/4
- [ ] Verificar que la linea existe (buscar con Ctrl+F "data-action")

### 2.2 Boton "Enviar cotizacion" tiene data-action
- [x] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/main/src/taller/componentes/cotizar-form.tsx y buscar `data-action="enviar-cotizacion"` — ✅ Gerardo 29/4
- [ ] Verificar que la linea existe

### 2.3 Botones "Aceptar" y "Confirmar" en cotizaciones
- [x] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/main/src/marca/componentes/aceptar-cotizacion.tsx y buscar `data-action="aceptar-cotizacion"` y `data-action="confirmar-aceptacion"` — ✅ Gerardo 29/4
- [ ] Verificar que ambos atributos existen en el archivo

### 2.4 Toggle buttons de procesos tienen data-testid
- [x] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/main/src/app/(marca)/marca/pedidos/nuevo/nuevo-pedido-form.tsx y buscar `data-testid="proceso-"` — ✅ Gerardo 29/4
- [ ] Verificar que el atributo existe en los botones de seleccion de proceso

### 2.5 Contenedores de cotizacion tienen data-estado
- [x] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/main/src/app/(marca)/marca/pedidos/%5Bid%5D/page.tsx y buscar `data-estado={cot.estado}` — ✅ Gerardo 29/4
- [ ] Verificar que el atributo existe en el contenedor de cada cotizacion

## Eje 3 — Infraestructura de tests

### 3.1 Helper de autenticacion
- [x] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/main/tests/e2e/_helpers/auth.ts y verificar que tiene funciones `loginAs` y `logout` — ✅ Gerardo 29/4
- [ ] Verificar que `loginAs` acepta 4 roles: taller, marca, admin, estado

### 3.2 Proteccion contra produccion
- [x] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/main/tests/e2e/_helpers/safety.ts y verificar que tiene la funcion `ensureNotProduction` — ✅ Gerardo 29/4
- [ ] Verificar que la funcion bloquea si la URL contiene `plataforma-textil.vercel.app` (sin -dev)

### 3.3 GitHub Action configurada
- [x] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/main/.github/workflows/e2e.yml y verificar que existe — ✅ Gerardo 29/4
- [ ] Verificar que se ejecuta en push y pull_request a `develop` y `main`
- [ ] Verificar que instala Chromium (`npx playwright install --with-deps chromium`)

## Eje 4 — Verificacion funcional en la plataforma

### 4.1 Registro de taller funciona
- [ ] Abrir https://plataforma-textil-dev.vercel.app/registro en incognito
- [ ] Seleccionar "Taller" → completar nombre, email, password → avanzar → completar nombre del taller y CUIT → crear cuenta
- [ ] Verificar que redirige al dashboard del taller con nivel BRONCE

### 4.2 Login de los 4 roles funciona
- [ ] Login como taller (roberto.gimenez@pdt.org.ar / pdt2026) → llega a /taller
- [ ] Login como marca (martin.echevarria@pdt.org.ar / pdt2026) → llega a /marca
- [ ] Login como admin (lucia.fernandez@pdt.org.ar / pdt2026) → llega a /admin
- [ ] Login como estado (anabelen.torres@pdt.org.ar / pdt2026) → llega a /estado

### 4.3 Flujo comercial basico funciona
- [ ] Login como marca → crear pedido nuevo → verificar que aparece como Borrador
- [ ] Publicar el pedido → verificar que cambia a Publicado
- [ ] Login como taller → ir a Pedidos disponibles → verificar que el pedido aparece
