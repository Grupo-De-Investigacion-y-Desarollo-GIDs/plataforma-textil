# REVIEW: Migracion email SendGrid a Resend (INT-02)

**Spec:** v3-int-02-email-resend
**Fecha:** 2026-05-04
**Implemento:** Gerardo (Claude Code)

---

## Changelog

### Archivos modificados
- `src/compartido/lib/email.ts` — Reemplazado fetch SendGrid por Resend SDK. Nueva interface de retorno `{ exito, id?, error? }`. Retry automatico (1 intento). Dev stub con console.log.
- `src/compartido/lib/auth.ts` — Removido SMTP config SendGrid de EmailProvider. Mantiene `sendVerificationRequest` custom.
- `src/compartido/lib/arca.ts` — `[contacto-pdt]` reemplazado por `process.env.EMAIL_SUPPORT`. `MENSAJES_ERROR` const → `getMensajesError()` function (lazy).
- `.env.example` — SENDGRID_API_KEY → RESEND_API_KEY + EMAIL_FROM_NAME + EMAIL_SUPPORT + EMAIL_REPLY_TO
- `package.json` — +resend, -nodemailer

### Archivos nuevos
- `src/__tests__/email-resend.test.ts` — 6 tests Vitest
- `.claude/auditorias/QA_v3-email-resend.md`
- `.claude/auditorias/REVIEW_v3-email-resend.md`

### No se tocaron
- Los 12 templates HTML existentes (buildBienvenidaEmail, buildMagicLinkEmail, etc.)
- Los 8 consumidores de sendEmail (auth, registro, notificaciones, aprobacion, invitaciones, certificados, admin, password reset)
- La interface publica de sendEmail (to, subject, html)

---

## Decisiones

1. **No se migro a React Email.** Los 12 templates HTML funcionan. React Email queda para V4 si se necesita edicion visual.
2. **Retry 1 vez con delay 1s.** Suficiente para errores temporales sin bloquear al usuario. Fire-and-forget en los callers sigue funcionando.
3. **`MENSAJES_ERROR` → `getMensajesError()`** para que lea `EMAIL_SUPPORT` lazily en runtime, no al importar el modulo.
4. **No se agrego logging a LogActividad** en sendEmail. Los callers ya logguean sus acciones. Si se necesita tracking de emails, se agrega en V4.

---

## Variables de entorno

| Variable | Antes | Ahora |
|---|---|---|
| `SENDGRID_API_KEY` | Nunca configurada | Eliminada |
| `RESEND_API_KEY` | No existia | Preview + Production |
| `EMAIL_FROM` | `noreply@pdt.org.ar` | `onboarding@resend.dev` |
| `EMAIL_FROM_NAME` | No existia | `Plataforma Textil` |
| `EMAIL_SUPPORT` | No existia (placeholder `[contacto-pdt]`) | `gbreard@gmail.com` |
| `EMAIL_REPLY_TO` | No existia | `gbreard@gmail.com` |

---

## Limitaciones conocidas

- `onboarding@resend.dev` solo envia a `gbreard@gmail.com`. Para el piloto se necesita dominio propio.
- Sin DKIM/SPF, emails pueden caer en spam.
- Free tier: 3.000 emails/mes (estimacion piloto: ~300/mes, sobra margen).

---

## Tests

- 6 tests Vitest nuevos (email-resend.test.ts)
- 233 tests totales pasando (23 archivos)
