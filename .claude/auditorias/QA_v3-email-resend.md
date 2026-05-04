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
| 10 | nodemailer eliminado de dependencies | DEV | ok | |
| 11 | Dry-run: magic link llega a gbreard@gmail.com | QA (Gerardo) | | # |
| 12 | Dry-run: email de bienvenida llega post-registro | QA (Gerardo) | | # |
| 13 | Dry-run: contenido del email es correcto (subject, body, boton) | QA (Gerardo) | | # |

---

## Eje 2 — Navegabilidad

### Paso 1 — Login con magic link

- **Rol:** Sin login
- **URL de inicio:** /login
- **Verificador:** Gerardo (dry-run)
- **Accion:** Ingresar gbreard@gmail.com en el campo de magic link, enviar, verificar que llega el email, click en el link
- **Esperado:** Email llega en menos de 30 segundos. Link redirige a la plataforma logueado.
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Registro de taller con email de bienvenida

- **Rol:** Nuevo usuario
- **URL de inicio:** /registro
- **Verificador:** Gerardo (dry-run)
- **Accion:** Registrar taller nuevo con gbreard@gmail.com, verificar que llega email de bienvenida
- **Esperado:** Email de bienvenida llega con subject "Bienvenido/a a la Plataforma Digital Textil"
- **Resultado:** [ ]
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
| Email llega en menos de 30 segundos | Medir tiempo entre submit y recepcion | Gerardo | |
| Registro no tarda mas de lo habitual | Comparar con registro sin email | Gerardo | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Email de bienvenida tiene header azul PDT | | |
| Boton "Ir a mi panel" funciona | | |
| Magic link tiene boton "Ingresar a PDT" | | |
| Footer muestra "Plataforma Digital Textil" | | |
| Emails no caen en spam (verificar carpeta spam) | | |

---

## Checklist de cierre

- [ ] Dry-run magic link exitoso (Gerardo)
- [ ] Dry-run bienvenida exitoso (Gerardo)
- [ ] 6 tests Vitest nuevos pasan
- [ ] CI verde
- [ ] Issues abiertos en GitHub si aplica
- [ ] Resultado global definido
