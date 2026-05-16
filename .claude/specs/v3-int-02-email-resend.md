# v3-int-02-email-resend

**Bloque:** 5 — Integraciones externas
**Tipo:** Infraestructura
**Estimación:** 4-6 horas
**Eje 6 (validación de dominio):** No aplica — spec técnico
**Depende de:** Ninguno
**Bloquea:** Cierre de INT-01 (reemplazo de `[contacto-pdt]` por `EMAIL_SUPPORT`), magic links de NextAuth funcionando para usuarios fuera de la organización

---

## Contexto

La PDT no tiene servicio de email transaccional configurado. Hoy depende del SMTP por defecto de Supabase, que tiene 2 limitaciones críticas:

- Solo manda emails a miembros de la organización del proyecto Supabase
- Límite de 2 emails por hora
- Sin SLA de delivery

Esto bloquea:

- Magic links de NextAuth para usuarios fuera de la organización
- Cualquier prueba de OIT registrándose con sus emails reales
- Notificaciones a marcas y talleres
- Mensajes de error con contacto de soporte (placeholder `[contacto-pdt]` en INT-01)
- Confirmaciones post-registro

Sin email funcionando, el piloto del 15/5 no es viable.

---

## Decisión

Implementar **Resend** como servicio de email transaccional.

**Por qué Resend:**
- Free tier de 3.000 emails/mes (suficiente para piloto)
- API moderna y simple
- Integración nativa con Next.js
- Setup rápido sin DNS (en testing) o con DNS para producción
- React Email para templates (mismo stack del proyecto)

**Configuración inicial:**
- **Dominio:** `onboarding@resend.dev` (testing — no requiere DNS)
- **Limitación conocida:** solo se pueden enviar emails al email registrado en Resend (`gbreard@gmail.com`)
- **Antes del piloto:** migrar a dominio propio (decisión pendiente, ver sección "Pendientes pre-piloto")

---

## Alcance V3

### Implementar

#### 1. Cliente Resend centralizado

Archivo: `src/compartido/lib/email.ts`

Función principal:

```typescript
async function enviarEmail({
  to: string,
  subject: string,
  html: string,
  text?: string,
  replyTo?: string,
}): Promise<{ exito: boolean, id?: string, error?: string }>
```

Características:
- Usa Resend SDK (`resend` npm package)
- Manejo de errores robusto: NUNCA debe romper el flujo del usuario si email falla
- Logging en `LogActividad` con `accion: 'EMAIL_ENVIADO'` o `accion: 'EMAIL_FALLIDO'`
- Retry automático en caso de error temporal (1 reintento con delay de 1s)
- Timeout de 5 segundos por intento
- En desarrollo local sin `RESEND_API_KEY`, loggea el email a consola en lugar de enviar

#### 2. Templates con React Email

Carpeta: `src/compartido/emails/`

Templates iniciales:
- `magic-link.tsx` — Email de login sin password
- `bienvenida-taller.tsx` — Confirmación post-registro de taller
- `bienvenida-marca.tsx` — Confirmación post-registro de marca

Cada template:
- Diseño minimalista (sin logo aún, color primario de la PDT)
- Texto en español argentino (vos/tenés/podés)
- Footer con email de soporte (`EMAIL_SUPPORT`)
- Link "darse de baja" preparado pero no funcional aún (V4)
- Responsive (se ve bien en móvil)

Variables esperadas por cada template:
- `magic-link.tsx`: `{ enlace: string, expiraEn: string }`
- `bienvenida-taller.tsx`: `{ nombreTaller: string, urlDashboard: string }`
- `bienvenida-marca.tsx`: `{ nombreMarca: string, urlDashboard: string }`

#### 3. Integración con NextAuth

- Configurar `EmailProvider` de NextAuth para usar Resend
- Reemplazar configuración de SMTP de Supabase
- Magic link envía template `magic-link.tsx`
- Mantener compatibilidad con CredentialsProvider y OAuth existentes

#### 4. Hooks de bienvenida

En el endpoint `POST /api/auth/registro`:
- Si registro de taller exitoso → enviar `bienvenida-taller`
- Si registro de marca exitoso → enviar `bienvenida-marca`
- Async/fire-and-forget: NO bloquea la respuesta al usuario
- Si email falla, registro sigue siendo exitoso

#### 5. Variables de entorno

| Variable | Valor inicial | Scope |
|----------|---------------|-------|
| `RESEND_API_KEY` | (generada por vos en Resend) | Preview + Development (NO Production aún) |
| `EMAIL_FROM` | `onboarding@resend.dev` | All Environments |
| `EMAIL_FROM_NAME` | `Plataforma Textil` | All Environments |
| `EMAIL_SUPPORT` | `gbreard@gmail.com` | All Environments |
| `EMAIL_REPLY_TO` | `gbreard@gmail.com` | All Environments |

### NO implementar (queda para V4 o specs futuros)

- Sistema de cola de envío
- Preferencias de notificación por usuario
- UI admin para configurar emails
- UI admin para ver logs de envío (los logs están en `LogActividad`, accesibles vía DB)
- Recordatorios automáticos por cron
- Resúmenes diarios/semanales
- Templates para todos los eventos del sistema (se agregan con cada feature que los necesite)
- Multi-canal (WhatsApp/SMS) — eso queda para F-02
- Editor visual de templates
- Dominio verificado con DKIM/SPF/DMARC (queda como pendiente pre-piloto)
- Tracking de aperturas/clicks

---

## Casos de error

| Caso | Acción |
|------|--------|
| API key inválida o ausente | Log error, retorna `{ exito: false }`, no rompe flujo del usuario |
| Cuota mensual de Resend excedida | Log error, retorna `{ exito: false }`, alerta visible en logs |
| Email destino inválido | Log error, retorna `{ exito: false }` |
| Resend API caído / timeout | 1 retry automático con delay de 1s, después log y `{ exito: false }` |
| Template renderiza con error | Log error, retorna `{ exito: false }` |
| `RESEND_API_KEY` vacía en desarrollo local | Loggear contenido del email a consola, retornar `{ exito: true }` para no romper flujo |

**Principio:** un error de email NUNCA debe romper el flujo del usuario. El usuario ve éxito en su acción, y el email se loggea como fallido para revisión posterior.

---

## Tests Vitest

1. `enviarEmail` con datos válidos retorna `{ exito: true }`
2. `enviarEmail` con email inválido retorna `{ exito: false }` y loggea
3. `enviarEmail` cuando Resend retorna error retorna `{ exito: false }` y loggea
4. `enviarEmail` cuando Resend timeout, hace retry 1 vez antes de fallar
5. `enviarEmail` sin `RESEND_API_KEY` en dev local loggea a consola
6. Template `magic-link` renderiza con variables esperadas
7. Template `bienvenida-taller` renderiza con variables esperadas
8. Template `bienvenida-marca` renderiza con variables esperadas

Mocks: usar mock de Resend SDK para no consumir cupo real durante tests.

---

## Tests E2E

NO se incluyen E2E porque:
- Requeriría email real para verificar recepción
- El flujo de magic link end-to-end es difícil de testear automáticamente
- Cubierto manualmente en pruebas pre-piloto (item agregado en `PRUEBAS_PENDIENTES.md`)

---

## Migración de INT-01

Después de implementar Resend, actualizar INT-01:
- Reemplazar `[contacto-pdt]` por `process.env.EMAIL_SUPPORT` en todos los mensajes de error de ARCA
- Los 4 mensajes específicos quedan con el email real (`gbreard@gmail.com` por ahora)

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Dominio testing solo permite emails a `gbreard@gmail.com` | Documentado. Migrar a dominio propio antes del piloto |
| 3.000 emails/mes free se queda corto | Estimación piloto: ~300 emails/mes. Sobra mucho margen. Si crece, plan pago $20/mes por 50.000 emails |
| Resend cae justo cuando OIT prueba | Falla silenciosa, usuario ve éxito en pantalla, email se loggea como fallido. Investigar manualmente |
| Templates feos sin diseñador | Aceptable para V3. Si OIT pide mejoras, se actualizan en sprints después del piloto |
| Email termina en spam por dominio testing | Usar dominio propio antes del piloto reduce este riesgo |
| Magic links no llegan, usuarios no pueden loguearse | Para el piloto, dominio propio + DKIM/SPF correctos. Monitorear en LogActividad |

---

## Pendientes pre-piloto (no bloquean este merge)

- [ ] Decidir y comprar dominio propio (ej: `plataformadigitaltextil.org`)
- [ ] Configurar registros DNS (DKIM, SPF, DMARC) en proveedor del dominio
- [ ] Verificar dominio en Resend
- [ ] Cambiar `EMAIL_FROM` a `noreply@dominio-propio`
- [ ] Cambiar `EMAIL_SUPPORT` a `soporte@dominio-propio` (o el que se defina)
- [ ] Cambiar `EMAIL_REPLY_TO` a `soporte@dominio-propio`
- [ ] Activar `RESEND_API_KEY` en scope Production
- [ ] Definir si el email de soporte lo provee UNTREF/OIT
- [ ] Revisar templates con OIT (branding, tono, contenido)
- [ ] Si volumen real supera 3.000/mes, evaluar plan pago de Resend
- [ ] Documentar proceso de rotación de `RESEND_API_KEY` (lección aprendida con AfipSDK)

---

## Pendientes V4

- [ ] UI admin para editar `EMAIL_SUPPORT` sin redeploy
- [ ] UI admin para ver logs de emails enviados/fallidos
- [ ] Sistema de preferencias de notificación por usuario
- [ ] Templates adicionales según features que los requieran
- [ ] Recordatorios automáticos (plazos, documentos por vencer)
- [ ] Resúmenes diarios/semanales para ESTADO

---

## Plan de implementación

| Paso | Acción | Responsable | Tiempo |
|------|--------|-------------|--------|
| 1 | Crear cuenta en resend.com con `gbreard@gmail.com` | Gerardo | 5 min |
| 2 | Generar API key con permission "Sending access" | Gerardo | 2 min |
| 3 | Configurar 5 variables en Vercel | Gerardo | 5 min |
| 4 | Auditoría: confirmar que no hay otra integración de email actual | Claude Code | 15 min |
| 5 | Implementar cliente `email.ts` con manejo de errores | Claude Code | 1h |
| 6 | Instalar `react-email` y dependencias necesarias | Claude Code | 10 min |
| 7 | Crear 3 templates con React Email | Claude Code | 1h |
| 8 | Integrar con NextAuth EmailProvider | Claude Code | 30 min |
| 9 | Hooks de bienvenida en `/api/auth/registro` | Claude Code | 30 min |
| 10 | Tests Vitest (8 tests) | Claude Code | 30 min |
| 11 | Push a develop, esperar CI verde | Claude Code | 10 min |
| 12 | Dry-run: registrarse desde dev con `gbreard@gmail.com`, verificar magic link | Gerardo | 10 min |
| 13 | Actualizar INT-01 reemplazando `[contacto-pdt]` con `EMAIL_SUPPORT` | Claude Code | 15 min |
| 14 | QA HTML + REVIEW + PRUEBAS_PENDIENTES actualizado | Claude Code | 30 min |
| 15 | Merge ambos (Resend primero, INT-01 después) a main | Claude Code | 10 min |

**Total: ~5 horas (4h Claude Code + 30 min Gerardo + tiempo de testing)**

---

## Criterios de aceptación

- [ ] Cliente `enviarEmail` implementado y testeado
- [ ] 3 templates funcionando: magic-link, bienvenida-taller, bienvenida-marca
- [ ] NextAuth usa Resend para magic links
- [ ] Registro de taller dispara email de bienvenida
- [ ] Registro de marca dispara email de bienvenida
- [ ] Errores de email NO rompen flujos de usuario
- [ ] Logs de email en `LogActividad`
- [ ] 8 tests Vitest pasan
- [ ] CI verde
- [ ] Dry-run manual exitoso (Gerardo recibe magic link y completa login)
- [ ] INT-01 actualizado con `EMAIL_SUPPORT` real
