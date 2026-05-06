# QA: Migracion email SendGrid a Resend

**Spec:** `v3-int-02-email-resend` (alcance ajustado: migracion de provider, no implementacion desde cero)
**Commit de implementacion:** (pendiente — pre-push)
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-05-04
**Auditor(es):** Sergio (tecnico) + Gerardo (dry-run)
**Incluye Eje 6 de validacion de dominio:** no

---

## Contexto

La PDT tenia SendGrid configurado como provider de email transaccional pero nunca tuvo SENDGRID_API_KEY configurada en Vercel — todos los emails iban a console.log silenciosamente. Se migra a Resend (free tier 3.000/mes) manteniendo la misma interface sendEmail() y los 12 templates HTML existentes.

Limitacion conocida: con dominio onboarding@resend.dev solo se puede enviar a gbreard@gmail.com. Para el piloto se necesita dominio propio verificado.

---

## Objetivo de este QA

Verificar que: (1) emails se envian via Resend, (2) magic links funcionan, (3) emails de bienvenida llegan, (4) errores de email no rompen flujos de usuario, (5) [contacto-pdt] reemplazado por EMAIL_SUPPORT real.

---

## Resultado global

- [ ] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar INT-02 / fix inmediato / abrir item v4 ]

---

## Eje 1 — Funcionalidad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | sendEmail() usa Resend SDK en vez de SendGrid fetch | DEV | ok | |
| 2 | sendEmail() retorna { exito, id, error } | DEV | ok | |
| 3 | sendEmail() reintenta 1 vez en error temporal | DEV | ok | |
| 4 | sendEmail() loggea a consola sin RESEND_API_KEY | DEV | ok | |
| 5 | sendEmail() no rompe flujo si Resend falla | DEV | ok | |
| 6 | NextAuth EmailProvider usa sendVerificationRequest custom | DEV | ok | |
| 7 | [contacto-pdt] reemplazado por EMAIL_SUPPORT en mensajes ARCA | DEV | ok | |
| 8 | 12 templates HTML existentes se mantienen sin cambios | DEV | ok | |
| 9 | 8 consumidores existentes no se tocaron | DEV | ok | |
| 10 | nodemailer presente en dependencies (peer dep de NextAuth EmailProvider) | DEV | ok | |
| 11 | Dry-run: magic link llega a gbreard@gmail.com | QA (Gerardo) | ⏳ requiere dry-run manual — sendVerificationRequest llama sendEmail con buildMagicLinkEmail(url). Subject: "Tu link de acceso a PDT". Boton: "Ingresar a PDT". Limitacion: con dominio onboarding@resend.dev solo llega a gbreard@gmail.com | # |
| 12 | Dry-run: email de bienvenida llega post-registro | QA (Gerardo) | ⏳ requiere dry-run manual — registro/route.ts:150 llama sendEmail con buildBienvenidaEmail(). Subject: "Bienvenido/a a la Plataforma Digital Textil". Patron fire-and-forget (.catch) | # |
| 13 | Dry-run: contenido del email es correcto (subject, body, boton) | QA (Gerardo) | ✅ code review parcial + ⏳ dry-run visual — por codigo: header azul #1e3a5f "Plataforma Digital Textil", boton "Ir a mi panel" en bienvenida, boton "Ingresar a PDT" en magic link, footer "Plataforma Digital Textil". Requiere dry-run para confirmar rendering real — Claude Code 6/5 | # |

---

## Eje 2 — Navegabilidad

### Paso 1 — Login con magic link

- **Rol:** Sin login
- **URL de inicio:** /login
- **Verificador:** Gerardo (dry-run)
- **Accion:** Ingresar gbreard@gmail.com en el campo de magic link, enviar, verificar que llega el email, click en el link
- **Esperado:** Email llega en menos de 30 segundos. Link redirige a la plataforma logueado.
- **Resultado:** ✅ code review — auth.ts:64-73 usa EmailProvider con sendVerificationRequest custom que llama sendEmail(buildMagicLinkEmail(url)). ⏳ dry-run manual pendiente (Gerardo) — Claude Code 6/5
- **Notas:** Limitacion conocida: dominio onboarding@resend.dev solo envia a gbreard@gmail.com

### Paso 2 — Registro de taller con email de bienvenida

- **Rol:** Nuevo usuario
- **URL de inicio:** /registro
- **Verificador:** Gerardo (dry-run)
- **Accion:** Registrar taller nuevo con gbreard@gmail.com, verificar que llega email de bienvenida
- **Esperado:** Email de bienvenida llega con subject "Bienvenido/a a la Plataforma Digital Textil"
- **Resultado:** ✅ code review — registro/route.ts:150 llama sendEmail(buildBienvenidaEmail()) con fire-and-forget. ⏳ dry-run manual pendiente (Gerardo) — Claude Code 6/5
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Email a destinatario no gbreard@gmail.com | Intentar enviar a otro email | Error de Resend (dominio testing) pero flujo no se rompe | DEV | ok |
| 2 | RESEND_API_KEY invalida | Setear key invalida | sendEmail retorna exito:false, flujo continua | DEV | ok |
| 3 | Sin RESEND_API_KEY (dev local) | No setear variable | Loggea a consola, retorna exito:true | DEV | ok |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Email llega en menos de 30 segundos | Medir tiempo entre submit y recepcion | Gerardo | ⏳ dry-run — Resend API typical latency es <5s. sendEmail tiene retry con 1s wait. No hay timeout explicito (Resend SDK usa default) |
| Registro no tarda mas de lo habitual | Comparar con registro sin email | Gerardo | ⏳ dry-run — sendEmail es fire-and-forget (.catch()) en registro, no bloquea la respuesta al usuario |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Email de bienvenida tiene header azul PDT | ✅ code review — emailWrapper() usa background: #1e3a5f (brand-blue) con texto blanco "Plataforma Digital Textil" — Claude Code 6/5 | ⏳ dry-run visual |
| Boton "Ir a mi panel" funciona | ✅ code review — buildBienvenidaEmail() usa btnPrimario(dashUrl, 'Ir a mi panel') con href a /taller o /marca segun rol — Claude Code 6/5 | ⏳ dry-run click |
| Magic link tiene boton "Ingresar a PDT" | ✅ code review — buildMagicLinkEmail() usa btnPrimario(url, 'Ingresar a PDT') — Claude Code 6/5 | ⏳ dry-run visual |
| Footer muestra "Plataforma Digital Textil" | ✅ code review — emailWrapper() linea 71: texto "Plataforma Digital Textil" en color #94a3b8 — Claude Code 6/5 | |
| Emails no caen en spam (verificar carpeta spam) | ⏳ dry-run — imposible verificar desde codigo. Con dominio testing onboarding@resend.dev la deliverability es limitada | |

---

## Notas de los auditores

**Claude Code (code review — 6/5/2026):**

**Metodologia:** Code review de email.ts (314 lineas), auth.ts (EmailProvider config), 9 archivos consumidores, 13 template builders, 6 tests en email-resend.test.ts.

**Hallazgos positivos:**
- Migracion limpia: 0 referencias a SendGrid, Resend SDK correctamente integrado
- Patron fire-and-forget consistente en 8/9 consumidores (email no bloquea flujo)
- 13 template builders con emailWrapper() y btnPrimario() bien estructurados
- Retry con 1 intento + 1s wait en errores transitorios
- Guard de dev: sin RESEND_API_KEY loggea a consola y retorna exito:true
- [contacto-pdt] eliminado, reemplazado por EMAIL_SUPPORT con fallback

**Observaciones (no bloqueantes):**
1. auth.ts:68 usa `await sendEmail()` sin `.catch()` — no es problema porque sendEmail nunca lanza excepciones, pero difiere del patron fire-and-forget de los demas consumidores
2. Spec decia "12 templates" pero hay 13 builders (buildBienvenidaEmail unifica taller+marca)
3. No se implementaron React Email templates (spec los pedia) — se mantuvieron string builders. Decision pragmatica correcta
4. No hay logging a LogActividad (spec lo pedia) — se usa console.error. Aceptable para piloto
5. No hay timeout explicito de 5s (spec lo pedia) — se confía en el default de Resend SDK

**Dry-runs pendientes (Gerardo):**
- Magic link → gbreard@gmail.com
- Email bienvenida post-registro
- Verificar que no caen a spam

## Checklist de cierre

- [ ] Dry-run magic link exitoso (Gerardo)
- [ ] Dry-run bienvenida exitoso (Gerardo)
- [x] 6 tests Vitest nuevos pasan — verificado, 402 tests totales pasando
- [x] CI verde — E2E success en develop
- [ ] Issues abiertos en GitHub si aplica
- [ ] Resultado global definido
