# QA: F-02 Notificaciones WhatsApp

**Spec:** `v3-whatsapp-notificaciones`
**Commit de implementacion:** pendiente
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-05-05
**Auditor(es):** Sergio (tecnico) + politologo + economista + sociologo + contador
**Incluye Eje 6 de validacion de dominio:** si
**Perfiles aplicables:** politologo, economista, sociologo, contador

---

## Contexto institucional

Los talleres textiles informales en Argentina usan WhatsApp como canal principal de comunicacion profesional. La PDT necesita llegar a ellos donde ya estan, sin obligarlos a instalar apps ni revisar emails que muchos no usan. Este spec implementa un sistema de notificaciones WhatsApp con dos modos: Modo A (manual, via wa.me links que el admin abre uno a uno) y Modo B (futuro, API de WhatsApp Business). Incluye magic links para auto-login sin password, reduciendo la friccion de acceso para talleres con baja alfabetizacion digital.

---

## Objetivo de este QA

Verificar que: (1) los 6 eventos generan MensajeWhatsapp correctamente, (2) el wizard de envio manual funciona paso a paso, (3) los magic links auto-loguean y expiran correctamente, (4) las notificaciones in-app nuevas se crean, (5) el formulario de phone/toggle WhatsApp funciona en /cuenta y /registro, (6) la seguridad de magic links es robusta.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante
5. Si el resultado no es ok → abri el widget azul "Feedback" → describi que paso
6. Al terminar, completa el resultado global y commitea este archivo actualizado

---

## Resultado global

- [ ] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar v3 / fix inmediato / abrir item v4 ]
**Issues abiertos:** # (links a GitHub)

---

## Eje 1 — Funcionalidad

> **Nota:** Los items marcados **DEV** los verifica Gerardo desde el codigo o la terminal — no son verificables desde el browser. El auditor solo verifica los items marcados **QA**.

### Schema / migration

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Tabla MensajeWhatsapp con enum EstadoMensajeWhatsapp | DEV | ok — Gerardo 5/5 | |
| 2 | Tabla MagicLink con token unico e indice | DEV | ok — Gerardo 5/5 | |
| 3 | Campo User.notificacionesWhatsapp (default true) | DEV | ok — Gerardo 5/5 | |

### Helpers

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 4 | generarMensajeWhatsapp en whatsapp.ts con abstraccion A/B (proveedor wa-me\|business-api) | DEV | ok — Gerardo 5/5 | |
| 5 | normalizarTelefonoArgentino acepta formatos argentinos | DEV | ok — Gerardo 5/5 | |
| 6 | generarUrlWaMe genera URL wa.me correcta | DEV | ok — Gerardo 5/5 | |
| 7 | 6 templates en whatsapp-templates.ts | DEV | ok — Gerardo 5/5 | |
| 8 | generarMagicLink genera token 32 bytes base64url | DEV | ok — Gerardo 5/5 | |

### Endpoint magic link

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 9 | /n/[token] auto-login con encode() de NextAuth | DEV | ok — Gerardo 5/5 | |
| 10 | Token payload incluye role, id, registroCompleto | DEV | ok — Gerardo 5/5 | |
| 11 | Cookie name correcto segun ambiente (production vs dev) | DEV | ok — Gerardo 5/5 | |
| 12 | Magic link expirado redirige a /login?error=link_expirado | DEV | ok — Gerardo 5/5 | |
| 13 | Magic link usado redirige sin auto-login | DEV | ok — Gerardo 5/5 | |

### Triggers (6 eventos)

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 14 | Pedido nuevo genera MensajeWhatsapp para talleres compatibles | DEV | ok — Gerardo 5/5 | |
| 15 | Cotizacion aceptada genera MensajeWhatsapp | DEV | ok — Gerardo 5/5 | |
| 16 | Documento aprobado genera Notificacion + MensajeWhatsapp | DEV | ok — Gerardo 5/5 | |
| 17 | Documento rechazado genera Notificacion + MensajeWhatsapp | DEV | ok — Gerardo 5/5 | |
| 18 | Nivel subido genera Notificacion + MensajeWhatsapp | DEV | ok — Gerardo 5/5 | |
| 19 | Mensaje admin genera MensajeWhatsapp para cada destinatario | DEV | ok — Gerardo 5/5 | |

### Notificaciones in-app nuevas

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 20 | Notificacion in-app para documento aprobado (no existia) | DEV | ok — Gerardo 5/5 | |
| 21 | Notificacion in-app para documento rechazado (no existia) | DEV | ok — Gerardo 5/5 | |
| 22 | Notificacion in-app para nivel subido (no existia) | DEV | ok — Gerardo 5/5 | |

### UI

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 23 | Wizard secuencial en admin (paso a paso, 1 click por destinatario) | QA | | # |
| 24 | Boton "Abrir chat" genera URL wa.me y abre en nueva pestana | QA | | # |
| 25 | Boton "Copiar mensaje" copia al clipboard | QA | | # |
| 26 | Checkbox "Marcar como enviado" actualiza estado en DB | QA | | # |
| 27 | Resumen al final del wizard (enviados vs total) | QA | | # |
| 28 | Phone en registro con label "Telefono WhatsApp" y tooltip educativo | QA | | # |
| 29 | Formulario /cuenta con phone + toggle WhatsApp | QA | | # |
| 30 | Toggle "Recibir notificaciones por WhatsApp" funciona | QA | | # |

### Seguridad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 31 | User sin phone no genera WhatsApp (log warning) | DEV | ok — Gerardo 5/5 | |
| 32 | User con notificacionesWhatsapp=false no genera WhatsApp | DEV | ok — Gerardo 5/5 | |
| 33 | next-auth pinned a 5.0.0-beta.30 | DEV | ok — Gerardo 5/5 | |

### General

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 34 | Build sin errores TypeScript | DEV | ok — Gerardo 5/5 | |
| 35 | Suite Vitest completa (309 tests) | DEV | ok — Gerardo 5/5 | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Verificar formulario phone + toggle WhatsApp en /cuenta

- **Rol:** TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Login como TALLER. Navegar a /cuenta. Verificar que aparece el campo de telefono y el toggle "Recibir notificaciones por WhatsApp". Editar el phone, guardar. Activar/desactivar el toggle.
- **Esperado:** Campo phone se guarda correctamente. Toggle cambia el estado y persiste al recargar la pagina.
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Aprobar documento y verificar Notificacion + MensajeWhatsapp

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** /estado/talleres
- **Verificador:** QA
- **Accion:** Login como ESTADO. Ir a un taller con documentos pendientes. Aprobar un documento. Verificar en la DB que se creo una Notificacion y un MensajeWhatsapp.
- **Esperado:** Al aprobar, se genera Notificacion in-app para el taller Y un registro MensajeWhatsapp con estado PENDIENTE.
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Magic link invalido redirige a /login

- **Rol:** Sin login
- **URL de inicio:** /n/token-invalido-12345
- **Verificador:** QA
- **Accion:** Abrir directamente una URL con un token invalido.
- **Esperado:** Redirige a /login?error=link_invalido. No se crea sesion.
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Wizard de envio WhatsApp en admin

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** /admin
- **Verificador:** QA
- **Accion:** Login como ADMIN. Ir a admin/notificaciones. Verificar si hay mensajes WhatsApp pendientes. Usar el wizard secuencial: click "Abrir chat" (abre wa.me), "Copiar mensaje" (copia al clipboard), "Marcar como enviado" (actualiza DB). Avanzar al siguiente destinatario. Al final, verificar resumen.
- **Esperado:** Wizard muestra un destinatario a la vez. Botones funcionan. Al terminar, resumen muestra enviados vs total.
- **Resultado:** [ ]
- **Notas:**

### Paso 5 — Campo "Telefono WhatsApp" en registro

- **Rol:** Sin login
- **URL de inicio:** /registro
- **Verificador:** QA
- **Accion:** Ir a /registro. Buscar el campo de telefono. Verificar que el label dice "Telefono WhatsApp" y que hay un tooltip educativo explicando para que se usa.
- **Esperado:** Label "Telefono WhatsApp" visible. Tooltip con texto explicativo al hacer hover/click en el icono de ayuda.
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | User sin phone: evento dispara, WhatsApp NO se genera | Disparar evento (ej: aprobar documento) para un taller sin phone | MensajeWhatsapp NO se crea. Notificacion in-app SI se crea. Log warning en consola. | DEV | |
| 2 | Phone mal formateado ("abc123") | Intentar guardar "abc123" como phone en /cuenta | Validacion rechaza con mensaje de error. No se guarda. | QA | |
| 3 | Magic link compartido: primer uso auto-loguea, segundo redirige sin login | Usar un magic link valido. Luego abrir el mismo link en otra pestana. | Primera vez: auto-login exitoso. Segunda vez: redirige sin crear sesion (link marcado como usado). | QA | |
| 4 | Magic link expirado (>24h) | Intentar usar un magic link con mas de 24h de creado | Redirige a /login?error=link_expirado. No se crea sesion. | DEV | |
| 5 | Toggle WhatsApp desactivado | Desactivar toggle en /cuenta. Luego disparar un evento. | No se genera MensajeWhatsapp para ese user. Notificacion in-app SI se genera. | DEV | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Pagina carga en menos de 3 segundos | DevTools > Network > recargar | QA | |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | | |
| Colores del design system (brand-blue, brand-red) | | |
| Estados vacios tienen mensaje descriptivo | | |
| Textos en espanol argentino (vos/tenes) | | |
| Wizard muestra progreso claro (paso X de Y) | | |
| Botones "Abrir chat" y "Copiar mensaje" distinguibles visualmente | | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Usar WhatsApp genera dependencia institucional con Meta? Para V4 evaluar SMS como canal alternativo. | | |
| 2 | Los textos de los mensajes mantienen tono institucional (no comercial)? | | |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La friccion del flujo (click → auto-login → ver pedido) es baja para el taller tipico? | | |
| 2 | Hay riesgo de spam si un taller recibe muchos mensajes por dia? | | |

### Sociologo — Lenguaje y accesibilidad

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | El tono de los mensajes es apropiado para un taller familiar? | | |
| 2 | Hay riesgo de que los mensajes se perciban como spam comercial? | | |
| 3 | La firma "PDT" es suficiente o hay que decir "Plataforma Digital Textil" completo? | | |

### Contador — Flujos fiscales y operativos

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los mensajes sobre formalizacion usan vocabulario fiscal correcto? | | |
| 2 | Falta algun evento critico que deberia generar WhatsApp (vencimiento monotributo, ART)? | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |

---

## Notas de los auditores

**Sergio (tecnico):**
[observaciones tecnicas sobre implementacion, seguridad, performance]

**Perfiles interdisciplinarios:**
[observaciones sobre logica institucional, lenguaje, incentivos, contexto del sector]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Eje 6 completado por cada perfil aplicable
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
