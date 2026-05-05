# REVIEW: F-02 Notificaciones WhatsApp

**Spec:** v3-whatsapp-notificaciones
**Fecha:** 2026-05-05
**Implemento:** Gerardo (Claude Code)
**Review:** interno

---

## Changelog

### Archivos nuevos
- `src/compartido/lib/whatsapp.ts` — generarMensajeWhatsapp, normalizarTelefonoArgentino, generarUrlWaMe, abstraccion A/B (WHATSAPP_PROVIDER: wa-me | business-api)
- `src/compartido/lib/magic-link.ts` — generarMagicLink con token 32 bytes base64url, 24h expiry
- `src/compartido/lib/whatsapp-templates.ts` — 6 templates: pedido_nuevo, cotizacion_aceptada, documento_aprobado, documento_rechazado, nivel_subido, mensaje_admin
- `src/app/n/[token]/route.ts` — Magic link auto-login con encode() + cookie setup
- `src/compartido/componentes/whatsapp-wizard.tsx` — Wizard paso-a-paso para envio manual
- `src/compartido/componentes/cuenta-whatsapp-form.tsx` — Form phone + toggle WhatsApp
- `src/app/api/admin/whatsapp/route.ts` — GET pending messages, PUT mark as sent
- `src/app/api/cuenta/route.ts` — PUT phone + notificacionesWhatsapp
- `src/__tests__/whatsapp.test.ts` — 22 tests
- `tests/e2e/whatsapp-notificaciones.spec.ts` — 5 tests E2E

### Archivos modificados
- `prisma/schema.prisma` — +MensajeWhatsapp, +MagicLink, +EstadoMensajeWhatsapp enum, +User.notificacionesWhatsapp, +relations
- `src/compartido/lib/notificaciones.ts` — +WhatsApp trigger en pedido_nuevo y cotizacion_aceptada
- `src/compartido/lib/nivel.ts` — +Notificacion + WhatsApp en NIVEL_SUBIDO
- `src/app/(estado)/estado/talleres/[id]/page.tsx` — +Notificacion + WhatsApp en aprobar/rechazar validacion
- `src/app/api/admin/notificaciones/route.ts` — +WhatsApp trigger en mensaje_admin
- `src/app/(public)/cuenta/page.tsx` — +CuentaWhatsappForm
- `src/app/(auth)/registro/page.tsx` — phone label "Telefono WhatsApp" + tooltip educativo
- `src/__tests__/nivel.test.ts` — +mock whatsapp + prisma.notificacion

---

## Decisiones de arquitectura

1. **Abstraccion A/B implementada completa.** `WHATSAPP_PROVIDER` env var (default `wa-me`) determina proveedor. `MensajeWhatsapp.proveedor` persiste el valor usado. Cambiar a business-api en V4 es cambiar una env var — el codigo ya soporta ambos paths.

2. **Magic link usa randomBytes(32).toString('base64url'), no encode() para el token.** `encode()` de NextAuth se usa solo en `/n/[token]` para crear la sesion JWT a partir del token validado. Separar generacion de token de creacion de sesion.

3. **Notificaciones in-app NUEVAS creadas para doc aprobado/rechazado y nivel subido.** Antes estos eventos solo se logueaban con `logActividad` — ahora generan `Notificacion` in-app ademas de `MensajeWhatsapp`.

4. **WhatsApp trigger es fire-and-forget (.catch()).** Si la creacion del `MensajeWhatsapp` falla, la notificacion in-app y el email (si existe) siguen funcionando. No se rompe el flujo principal.

5. **Phone en registro: label cambiado a "Telefono WhatsApp" con tooltip.** El campo sigue siendo opcional. El tooltip explica que el numero se usa para notificaciones de nuevos pedidos y actualizaciones.

6. **next-auth pinned a 5.0.0-beta.30** por riesgo de breaking changes en `encode()`. Si Auth.js cambia la firma de encode/decode en una beta posterior, los magic links dejarian de funcionar.

---

## Tests

| Archivo | Tests | Resultado |
|---------|-------|-----------|
| src/__tests__/whatsapp.test.ts | 22 | PASS |
| tests/e2e/whatsapp-notificaciones.spec.ts | 5 | pendiente CI |
| Suite completa Vitest | 309 | PASS |

---

## Riesgos y pendientes

| Riesgo | Mitigacion | Pendiente |
|--------|-----------|-----------|
| encode() de next-auth beta: si Auth.js cambia la firma en un upgrade, magic links dejan de funcionar | Pin a beta.30, test especifico para encode/decode | Monitorear releases de next-auth |
| Magic link de 1 uso: si alguien intercepta el link antes que el destinatario, gana la sesion | Validez 24h, token de 1 uso, destino especifico en el payload | Considerar HTTPS-only cookies en V4 |
| Volumen: un pedido puede generar 50 MensajeWhatsapp (1 por taller compatible) | El wizard secuencial maneja esto pero es trabajo manual para el admin | Modo B (V4) automatiza el envio |

---

## Variables de entorno

| Variable | Valor | Donde |
|----------|-------|-------|
| WHATSAPP_PROVIDER | `wa-me` (default) | Opcional — no requiere configuracion para Modo A |
| NEXTAUTH_SECRET | (existente) | Necesario para encode() de magic links |
| NEXTAUTH_URL | (existente) | Necesario para construir URLs de magic links |
