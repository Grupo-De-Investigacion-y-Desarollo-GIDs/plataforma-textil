# QA: Badge de notificaciones en header global

**Spec:** `v3-badge-notificaciones-header`
**Commit de implementacion:** pendiente
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-05-05
**Auditor(es):** Sergio (tecnico) + politologo + economista + sociologo
**Incluye Eje 6 de validacion de dominio:** no (UX puro, sin requisitos de accesibilidad en spec)
**Perfiles aplicables:** politologo, economista, sociologo

---

## Contexto institucional

Los talleres textiles informales reciben notificaciones de la plataforma (comunicaciones masivas, mensajes individuales del Estado, actualizaciones de pedidos) pero hasta ahora no tenian forma de saber que habia notificaciones nuevas sin entrar manualmente a /cuenta/notificaciones. Esto hacia que mensajes importantes del Estado — como recordatorios de documentacion pendiente o seguimiento de formalizacion — pasaran desapercibidos. El badge en el header resuelve esto mostrando un indicador numerico rojo en la campana del header, con un dropdown de acceso rapido a las ultimas 5 notificaciones.

---

## Objetivo de este QA

Verificar que: (1) el badge rojo aparece cuando hay notificaciones sin leer, (2) el dropdown muestra las ultimas 5 notificaciones correctamente, (3) marcar como leida actualiza el badge sin refresh, (4) funciona en todos los roles (TALLER, MARCA, ESTADO, ADMIN), (5) el sidebar muestra badge real, (6) el polling actualiza el count cada 30s.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante

---

## Checklist de verificacion

### Bloque 1 — Badge visible en header

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 1 | Login como TALLER. Ir a /taller | Header visible con icono de campana | QA | |
| 2 | Si hay notificaciones sin leer, verificar badge rojo con numero | Badge rojo con count visible junto a la campana | QA | |
| 3 | Si no hay notificaciones sin leer, verificar que NO hay badge | Solo campana sin numero | QA | |
| 4 | Login como MARCA. Ir a /marca | Campana con badge visible en header | QA | |
| 5 | Login como ESTADO. Ir a /estado | Campana con badge visible en header | QA | |
| 6 | Login como ADMIN. Ir a /admin | Campana con badge visible en barra superior del admin | QA | |

### Bloque 2 — Dropdown de notificaciones

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 7 | Click en la campana | Dropdown se abre debajo de la campana con lista de notificaciones | QA | |
| 8 | Verificar que muestra maximo 5 notificaciones | No mas de 5 items en el dropdown | QA | |
| 9 | Cada notificacion muestra titulo, mensaje truncado, y tiempo relativo | Formato: titulo en negrita, mensaje en gris, "hace Xm/Xh/Xd" | QA | |
| 10 | Notificaciones no leidas tienen borde azul y punto azul | Diferenciacion visual clara entre leidas y no leidas | QA | |
| 11 | Boton "Ver todas las notificaciones" visible al final | Link azul centrado en el footer del dropdown | QA | |
| 12 | Click en "Ver todas las notificaciones" | Navega a /cuenta/notificaciones y cierra dropdown | QA | |

### Bloque 3 — Mensajes individuales en dropdown

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 13 | Enviar mensaje individual desde admin (F-07) a un taller | Mensaje enviado exitosamente | QA | |
| 14 | Login como el taller receptor. Verificar badge en campana | Badge muestra count actualizado (o aparece si era 0) | QA | |
| 15 | Click en campana. Verificar mensaje individual en dropdown | Badge "Mensaje del equipo" azul + "De: {nombre admin}" visible | QA | |

### Bloque 4 — Interaccion y reactividad

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 16 | Click en notificacion con link en el dropdown | Marca como leida + navega al destino. Badge decrementa | QA | |
| 17 | Click en notificacion sin link en el dropdown | Marca como leida + cierra dropdown. Badge decrementa | QA | |
| 18 | Click fuera del dropdown (en cualquier parte de la pagina) | Dropdown se cierra | QA | |
| 19 | Presionar ESC con dropdown abierto | Dropdown se cierra | QA | |
| 20 | Marcar todas como leidas desde /cuenta/notificaciones, volver al header | Badge desaparece (0 sin leer) | QA | |

### Bloque 5 — Skeleton y estados vacios

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 21 | Click en campana mientras carga (primera vez) | Skeleton loading (3 barras animadas) visible brevemente | QA | |
| 22 | Si no hay notificaciones, click en campana | Texto "Estas al dia — Sin notificaciones nuevas" centrado | QA | |

### Bloque 6 — Sidebar (menu lateral)

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 23 | Login como TALLER. Click en "Menu" (hamburguesa) | Sidebar se abre | QA | |
| 24 | Verificar item "Notificaciones" en el sidebar | Badge rojo con count real (no 0 hardcodeado) si hay no leidas | QA | |
| 25 | Si no hay no leidas, badge no se muestra en sidebar | Sin badge numerico | QA | |

### Bloque 7 — Polling y actualizacion

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 26 | Abrir plataforma en 2 pestanas. Marcar leida en una | Volver a la otra pestana: badge se actualiza automaticamente | QA | |
| 27 | Dejar la pagina abierta 30+ segundos | Badge se actualiza solo (polling cada 30s) | DEV | |

### Bloque 8 — Mobile responsive

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 28 | Abrir en celular o viewport angosto (<768px). Menu mobile | Campana visible en el menu mobile con badge | QA | |
| 29 | Click en campana en mobile | Dropdown se abre y es usable (no se corta ni desborda) | QA | |

### Bloque 9 — Tests automatizados

| # | Verificacion | Verificador | Estado |
|---|-------------|-------------|--------|
| 30 | 18 Vitest tests pasan (npx vitest run src/__tests__/notificaciones-bell.test.ts) | DEV | |
| 31 | TypeScript compila sin errores (npx tsc --noEmit) | DEV | |
| 32 | 5 E2E tests pasan en CI (tests/e2e/notificaciones-bell.spec.ts) | DEV | |

---

## Validacion de dominio (seccion 12 del spec)

### Politologo

| # | Pregunta | Respuesta | Estado |
|---|----------|-----------|--------|
| P1 | El badge de notificaciones puede generar ansiedad o sensacion de vigilancia en talleres informales? | | |
| P2 | El indicador numerico rojo tiene connotaciones negativas en el contexto de notificaciones estatales? | | |

### Economista

| # | Pregunta | Respuesta | Estado |
|---|----------|-----------|--------|
| E1 | El fetch adicional en cada carga de pagina (+ polling cada 30s) tiene impacto en costos de hosting? | | |

### Sociologo

| # | Pregunta | Respuesta | Estado |
|---|----------|-----------|--------|
| S1 | El dropdown de 5 notificaciones es suficiente como primer contacto, o genera frustracion por no ver el historial completo? | | |
| S2 | El badge "Mensaje del equipo" en el dropdown refuerza la sensacion de cercania o de control? | | |

---

## Resumen

| Bloque | Items | Verificador principal |
|--------|-------|----------------------|
| 1. Badge visible | 6 | QA |
| 2. Dropdown | 6 | QA |
| 3. Mensajes individuales | 3 | QA |
| 4. Interaccion | 5 | QA |
| 5. Skeleton/empty | 2 | QA |
| 6. Sidebar | 3 | QA |
| 7. Polling | 2 | QA + DEV |
| 8. Mobile | 2 | QA |
| 9. Tests | 3 | DEV |
| **Total** | **32** | |
| Validacion dominio | 5 preguntas | politologo, economista, sociologo |
