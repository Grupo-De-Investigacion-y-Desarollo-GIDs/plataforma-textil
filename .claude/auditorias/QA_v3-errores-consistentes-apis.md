---
spec: v3-errores-consistentes-apis
version: V3
bloque: 4
titulo: "Errores consistentes en APIs"
fecha: 2026-04-29
autor: Gerardo (Claude Code)
verificacion_dev: Pendiente
---

# QA: Errores consistentes en APIs (Q-03)

## Eje 1 — Formato de error nuevo funciona

### 1.1 Registro con datos invalidos muestra error amigable
- [ ] Abrir https://plataforma-textil-dev.vercel.app/registro en incognito
- [ ] Completar el formulario con un email invalido (ej: "hola") y enviar
- [ ] Verificar que aparece un mensaje de error legible (no "Internal Server Error")
- [ ] Abrir DevTools > Network > ver la respuesta del POST a /api/auth/registro
- [ ] Verificar que la respuesta tiene este formato: `{ "error": { "code": "INVALID_INPUT", "message": "...", "digest": "err_..." } }`

### 1.2 Registro duplicado muestra error de conflicto
- [ ] Abrir https://plataforma-textil-dev.vercel.app/registro en incognito
- [ ] Intentar registrarse con un email que ya existe (ej: roberto.gimenez@pdt.org.ar)
- [ ] Verificar que aparece un mensaje claro sobre email duplicado
- [ ] En DevTools, verificar que la respuesta tiene `"code": "CONFLICT"`

### 1.3 Login como taller y crear cotizacion — error de negocio
- [ ] Login como taller (roberto.gimenez@pdt.org.ar / pdt2026)
- [ ] Ir a un pedido ya cotizado e intentar cotizar de nuevo
- [ ] Verificar que el mensaje de error es claro ("Ya tenes una cotizacion activa para este pedido")

## Eje 2 — Helpers de error en el codigo

### 2.1 Archivo api-errors.ts existe con helpers
- [ ] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/compartido/lib/api-errors.ts
- [ ] Verificar que contiene: `errorResponse`, `errorAuthRequired`, `errorForbidden`, `errorNotFound`, `errorInvalidInput`, `errorConflict`, `errorRateLimited`, `errorInternal`, `errorExternalService`, `apiHandler`

### 2.2 Archivo api-client.ts existe con helper de frontend
- [ ] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/compartido/lib/api-client.ts
- [ ] Verificar que contiene: `getErrorMessage`, `getErrorCode`

### 2.3 README del formato de error existe
- [ ] Abrir https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/README.md
- [ ] Verificar que documenta: codigos de error, formato de respuesta, ejemplo de uso

## Eje 3 — Endpoints migrados usan apiHandler

### 3.1 Los 11 endpoints criticos usan el formato nuevo
- [ ] Abrir cada uno de estos archivos en GitHub y buscar `apiHandler` o `errorResponse`:
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/auth/registro/route.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/pedidos/route.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/pedidos/%5Bid%5D/route.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/cotizaciones/route.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/cotizaciones/%5Bid%5D/route.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/validaciones/%5Bid%5D/route.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/validaciones/%5Bid%5D/upload/route.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/feedback/route.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/chat/route.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/talleres/me/route.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/app/api/pedidos/%5Bid%5D/ordenes/route.ts

## Eje 4 — Tests automatizados

### 4.1 Tests Vitest pasan
- [ ] Verificar que el CI en develop esta verde
- [ ] Verificar que existen estos archivos de test:
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/__tests__/api-errors.test.ts
  - https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/blob/develop/src/__tests__/api-client.test.ts

## Eje 5 — Verificacion funcional en la plataforma

### 5.1 Flujo comercial completo sigue funcionando
- [ ] Login como marca (martin.echevarria@pdt.org.ar / pdt2026)
- [ ] Crear un pedido nuevo → verificar que se crea sin error
- [ ] Publicar el pedido → verificar que cambia a Publicado sin error
- [ ] Login como taller (roberto.gimenez@pdt.org.ar / pdt2026)
- [ ] Ir a pedidos disponibles → verificar que el pedido aparece
- [ ] Cotizar el pedido → verificar que la cotizacion se envia sin error
- [ ] Login como marca → aceptar la cotizacion → verificar que funciona

### 5.2 Asistente RAG sigue funcionando
- [ ] Login como taller
- [ ] Ir a /taller/aprender y abrir el asistente
- [ ] Hacer una pregunta → verificar que responde (o muestra "no disponible" si esta deshabilitado)

### 5.3 Feedback widget sigue funcionando
- [ ] En cualquier pagina, abrir el widget azul "Feedback"
- [ ] Completar tipo + mensaje (>10 chars) → enviar → verificar que funciona

## Eje 6 — Validacion de dominio

No aplica — este spec es puramente tecnico.
