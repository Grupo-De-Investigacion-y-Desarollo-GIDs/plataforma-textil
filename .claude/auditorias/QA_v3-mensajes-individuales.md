# QA: F-07 Mensajes individuales a taller/marca desde admin

**Spec:** `v3-mensajes-individuales`
**Commit de implementacion:** pendiente
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-05-05
**Auditor(es):** Sergio (tecnico) + politologo + economista + sociologo + contador
**Incluye Eje 6 de validacion de dominio:** no (sin requisitos de accesibilidad en spec)
**Perfiles aplicables:** politologo, economista, sociologo, contador

---

## Contexto institucional

Los talleres textiles informales necesitan comunicacion directa y personalizada del Estado. Hasta ahora el admin solo podia enviar comunicaciones masivas por segmento. Este spec agrega la capacidad de enviar mensajes individuales a un usuario especifico desde el detalle de taller, marca o la lista de usuarios. El destinatario lo ve en su bandeja de notificaciones con badge "Mensaje del equipo". Opcionalmente se puede enviar tambien por WhatsApp usando la infraestructura de F-02.

---

## Objetivo de este QA

Verificar que: (1) el endpoint crea notificaciones correctamente, (2) el editor de mensaje funciona con preview en vivo, (3) el boton esta integrado en las 3 paginas, (4) los tabs de admin/notificaciones separan masivas e individuales, (5) el destinatario ve el mensaje con badge diferenciado, (6) la seguridad y rate limit funcionan.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante

---

## Checklist de verificacion

### Bloque 1 — Envio de mensaje individual

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 1 | Login como ADMIN. Ir a /admin/talleres. Click en un taller | Se abre la pagina de detalle del taller | DEV | |
| 2 | Verificar que el boton "Enviar mensaje" esta visible junto a los badges | Boton con icono de mensaje visible | QA | |
| 3 | Click en "Enviar mensaje" | Se abre modal con titulo "Mensaje a {nombre}" y badge de rol | QA | |
| 4 | Escribir titulo (menos de 3 chars) e intentar enviar | Boton "Enviar mensaje" deshabilitado | QA | |
| 5 | Escribir titulo valido y mensaje (mas de 10 chars) | Boton se habilita | QA | |
| 6 | Observar la vista previa mientras se escribe | Preview actualiza en vivo titulo y mensaje | QA | |
| 7 | Click "Enviar mensaje" | Toast "Mensaje enviado" aparece, modal se cierra | QA | |

### Bloque 2 — Sugerencias de link

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 8 | Abrir editor para un TALLER. Marcar "Adjuntar link" | Aparece campo de link con 3 sugerencias: Su perfil, Su formalizacion, Su dashboard | QA | |
| 9 | Click en "Su formalizacion" | Campo se rellena con /taller/formalizacion | QA | |
| 10 | Abrir editor para una MARCA. Marcar "Adjuntar link" | Aparece campo con 2 sugerencias: Sus pedidos, Su panel | QA | |

### Bloque 3 — WhatsApp integrado

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 11 | Abrir editor para usuario CON telefono | Checkbox "Enviar tambien por WhatsApp" visible | QA | |
| 12 | Abrir editor para usuario SIN telefono | Texto "El destinatario no tiene telefono cargado" visible, sin checkbox | QA | |
| 13 | Enviar mensaje con WhatsApp marcado | MensajeWhatsapp creado en DB con template mensaje_admin | DEV | |

### Bloque 4 — Integracion en paginas

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 14 | Ir a /admin/marcas/[id] | Boton "Enviar mensaje" visible junto a badges | QA | |
| 15 | Click "Enviar mensaje" desde marca | Modal se abre con badge MARCA y sugerencias de marca | QA | |
| 16 | Ir a /admin/usuarios. Click en ojo (detalle) de un usuario | Modal de detalle muestra boton "Enviar mensaje" | QA | |
| 17 | Click "Enviar mensaje" desde modal de usuario | Editor se abre sobre el modal de detalle | QA | |

### Bloque 5 — Vista del destinatario

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 18 | Login como el TALLER al que se envio el mensaje. Ir a /cuenta/notificaciones | Mensaje visible con badge "Mensaje del equipo" azul | QA | |
| 19 | Verificar que muestra "De: {nombre del admin}" debajo del titulo | Nombre del admin visible | QA | |
| 20 | Click en la notificacion si tiene link | Navega al destino correcto | QA | |
| 21 | Click en la notificacion sin link | Expande/colapsa el mensaje completo | QA | |

### Bloque 6 — Tabs en admin/notificaciones

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 22 | Login como ADMIN. Ir a /admin/notificaciones | Tabs "Comunicaciones masivas" y "Mensajes individuales" visibles | QA | |
| 23 | Click en "Mensajes individuales" | Tabla con columnas: Fecha, Destinatario, Titulo, Via, Leido | QA | |
| 24 | Verificar que el mensaje enviado en Bloque 1 aparece | Fila con datos correctos visible | QA | |
| 25 | Si no hay mensajes, tab muestra EmptyState | EmptyState con texto descriptivo | QA | |

### Bloque 7 — Seguridad y rate limit

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 26 | Intentar POST /api/admin/mensajes-individuales sin auth (curl) | 401 AUTH_REQUIRED | DEV | |
| 27 | Login como TALLER. POST al endpoint | 403 FORBIDDEN | DEV | |
| 28 | Intentar enviar con link "javascript:alert(1)" | Rechazado por validacion | DEV | |
| 29 | Intentar enviar a usuario inactivo | 404 NOT_FOUND | DEV | |
| 30 | Enviar 51 mensajes en menos de 1 hora | Mensaje 51 retorna 429 con toast "Limite de envio alcanzado" | DEV | |

### Bloque 8 — Tests automatizados

| # | Verificacion | Verificador | Estado |
|---|-------------|-------------|--------|
| 31 | 23 Vitest tests pasan (npx vitest run src/__tests__/mensajes-individuales.test.ts) | DEV | |
| 32 | TypeScript compila sin errores (npx tsc --noEmit) | DEV | |
| 33 | 5 E2E tests pasan en CI (tests/e2e/mensajes-individuales.spec.ts) | DEV | |

---

## Validacion de dominio (seccion 12 del spec)

### Politologo

| # | Pregunta | Respuesta | Estado |
|---|----------|-----------|--------|
| P1 | Permitir que ESTADO mande mensajes individuales puede generar percepcion de "presion informal"? | | |
| P2 | Hay riesgo de que estos mensajes sean usados para evadir procedimientos formales? | | |

### Economista

| # | Pregunta | Respuesta | Estado |
|---|----------|-----------|--------|
| E1 | Esta capacidad incrementa el costo operativo del admin de forma significativa? | | |
| E2 | Vale la pena el desarrollo para 25 talleres del piloto? | | |

### Sociologo

| # | Pregunta | Respuesta | Estado |
|---|----------|-----------|--------|
| S1 | El tono "mensaje del equipo" se percibe como cercano o como burocratico? | | |
| S2 | El destinatario puede sentirse vigilado al recibir mensajes individuales? | | |
| S3 | Hay formas de uso del canal que pueden generar dependencia o paternalismo? | | |

### Contador

| # | Pregunta | Respuesta | Estado |
|---|----------|-----------|--------|
| C1 | Los mensajes individuales del ESTADO sobre temas fiscales tienen valor legal/probatorio? | | |
| C2 | Habria que dejar registro escrito formal ademas del mensaje en plataforma? | | |

---

## Resumen

| Bloque | Items | Verificador principal |
|--------|-------|----------------------|
| 1. Envio | 7 | QA + DEV |
| 2. Sugerencias link | 3 | QA |
| 3. WhatsApp | 3 | QA + DEV |
| 4. Integracion | 4 | QA |
| 5. Vista destinatario | 4 | QA |
| 6. Tabs admin | 4 | QA |
| 7. Seguridad | 5 | DEV |
| 8. Tests | 3 | DEV |
| **Total** | **33** | |
| Validacion dominio | 7 preguntas | politologo, economista, sociologo, contador |
