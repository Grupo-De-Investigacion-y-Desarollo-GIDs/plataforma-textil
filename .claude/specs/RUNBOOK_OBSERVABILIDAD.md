# Runbook — Observabilidad del piloto

Prerrequisito del deploy del piloto (pedido de Sergio: "si algo se rompe en el
piloto necesito poder verlo"). Observabilidad **barata** para 4 talleres: detectar
caídas y errores sin montar infraestructura pesada.

Dos columnas de trabajo:
- **Código/config (ya hecho, en este PR):** endpoint `/api/health`, bitácora.
- **Cuentas externas (las hace Gerardo):** lo de abajo. Claude no puede crear
  cuentas — esta es la guía paso a paso.

Los incidentes que se detecten se registran en `.claude/BITACORA_PROD.md`.

---

## 0. Qué ya quedó montado en el repo (sin acción externa)

| Pieza | Qué hace | Dónde |
|-------|----------|-------|
| `GET /api/health` | `SELECT 1` a la DB → `200 {status:ok,db:up}` o `503 {db:down}`. Lo pinguea la sonda de uptime. | `src/app/api/health/route.ts` |
| `GET /api/health/version` | Reporta SHA/env/ref del deploy (no toca DB). Sirve para confirmar qué commit está en prod. | `src/app/api/health/version/route.ts` |
| `.claude/BITACORA_PROD.md` | Registro de deploys/incidentes. Lectura previa de la revisión semanal. | `.claude/` |

URL del health en prod (confirmar dominio canónico): **`https://plataformatextil.com.ar/api/health`**
(si el canónico sigue siendo `plataforma-textil.vercel.app`, usar ese).

---

## 1. Alertas nativas de Vercel (las activa Gerardo en el dashboard)

### Qué ofrece Vercel (y qué NO)

| Capacidad | Disponible | Notas |
|-----------|-----------|-------|
| **Email de deploy fallido** | ✅ nativo, automático | Vercel manda email al owner del proyecto cuando un build falla. Solo hay que confirmar que las notificaciones están activas. |
| **Notificación de deploy (éxito/fallo) a Slack** | ✅ integración | Vercel Slack app: postea estado de cada deploy en un canal. |
| **Logs de runtime / function errors** | ✅ ver, ⚠️ alertar | En el plan Hobby/Pro se ven en la pestaña **Observability / Logs**, pero la retención es corta y **no hay alerta automática por error-rate** salvo en planes altos (Log Drains / Monitoring son Pro+/Enterprise). Esta es la brecha que tapan uptime + (opcional) Sentry. |
| **Alerta por caída del sitio** | ❌ no nativo | Vercel no hace uptime monitoring. Por eso usamos UptimeRobot (sección 2). |

### Pasos manuales para Gerardo

1. **Confirmar email de deploy fallido**
   - Vercel → avatar → **Account Settings → Notifications** (o **Project Settings →
     Notifications**).
   - Verificar que "Deployment failed" / "Deployment error" estén en ON para el
     proyecto `plataforma-textil`.

2. **(Opcional) Notificaciones de deploy a un canal**
   - Vercel → **Integrations** → buscar **Slack** (o el canal elegido en §3) →
     **Add Integration** → elegir el proyecto y el canal.
   - Resultado: cada deploy a prod postea estado (Building → Ready / Error).

3. **Saber dónde mirar los errores de runtime**
   - Vercel → proyecto → pestaña **Observability** (o **Logs**) → filtrar por
     `Production` + status `5xx`.
   - Esto es **manual** (no alerta sola). El disparador real para venir a mirar acá
     es la alerta de UptimeRobot (§2) o un reporte de taller.

---

## 2. Uptime monitoring — UptimeRobot (lo crea Gerardo)

**Recomendación: UptimeRobot** (gratis, 50 monitores, intervalo 5 min en el plan
free, integra Telegram/Slack/email/webhook). Alternativas equivalentes:
Better Stack (ex Better Uptime) free, Pingdom (pago). Para el piloto, UptimeRobot
free alcanza.

### Pasos exactos

1. Crear cuenta gratis en https://uptimerobot.com (con el email institucional).
2. **+ Add New Monitor**:
   - **Monitor Type:** `HTTP(s)` — o mejor **`Keyword`** (verifica contenido, no
     solo el status).
   - **URL:** `https://plataformatextil.com.ar/api/health`
   - Si es tipo **Keyword:** Keyword = `"db":"up"`, Alert when = **Keyword Not
     Exists**. Así una respuesta 503 (`db:down`) o un cuelgue dispara alerta
     aunque el server conteste algo.
   - **Monitoring Interval:** `5 minutes` (mínimo del plan free; suficiente para
     4 talleres).
   - **Monitor Timeout:** 30s.
3. **Alert Contacts To Notify:** seleccionar el canal de §3 (Telegram/Slack) +
   email de respaldo.
4. (Opcional) Segundo monitor a la **home** `https://plataformatextil.com.ar/`
   tipo HTTP(s) — confirma que el front carga, no solo la API.

> Por qué `/api/health` y no la home: la home es un server component pesado y
> cacheable; puede responder 200 con la DB caída. `/api/health` hace `SELECT 1`
> real → caza caídas de DB, que es el modo de falla más probable (Supabase).

---

## 3. Canal de alertas — Telegram vs Slack (decide Gerardo/Sergio)

**Recomendación: Telegram** — el más simple de montar gratis y al que tanto
UptimeRobot como (opcional) los webhooks de Vercel se conectan sin fricción.
Slack es igual de válido si el equipo ya lo usa a diario.

### Opción A — Telegram (recomendada)

1. En Telegram, hablar con **@BotFather** → `/newbot` → nombre + username →
   guarda el **bot token**.
2. Crear un grupo "PDT Alertas" y agregar el bot.
3. En **UptimeRobot → My Settings → Add Alert Contact → Telegram** → seguir el
   flujo (autoriza el bot al chat). Asignar ese contacto a los monitores de §2.
4. (Opcional) Para mandar también los deploy de Vercel a Telegram: usar la
   integración Slack de Vercel hacia un canal, o un webhook intermedio. Para el
   piloto alcanza con el email de deploy fallido (§1) + uptime en Telegram.

### Opción B — Slack

1. Crear (o usar) un workspace + canal `#pdt-alertas`.
2. **UptimeRobot → Add Alert Contact → Slack** → autorizar el canal.
3. **Vercel → Integrations → Slack** → conectar el proyecto al mismo canal
   (cubre los deploy; §1 paso 2).

> Decisión pendiente de Gerardo/Sergio: qué canal. Todo lo demás (uptime, health,
> deploy email) ya está listo para enchufarse a cualquiera de los dos.

---

## 4. Error tracking (Sentry) — evaluación honesta

**Recomendación: NO montarlo ahora. Las alertas nativas de Vercel + uptime +
`/api/health` alcanzan para un piloto de 4 talleres.**

| | Sin Sentry (lo que tenemos) | Con Sentry |
|---|---|---|
| Caída del sitio / DB | ✅ UptimeRobot en ≤5 min | ✅ igual |
| Deploy fallido | ✅ email Vercel | ✅ igual |
| Error 500 puntual de un usuario | ⚠️ visible en logs Vercel (manual, retención corta) | ✅ stack trace + contexto + alerta automática |
| Error de JS en el browser del taller | ❌ invisible | ✅ capturado |
| Setup | 0 (ya hecho) | ~1h (`@sentry/nextjs` wizard) + 1 cuenta + 1 env var |

**Cuándo sí montar Sentry:** si durante el piloto aparece un bug que un taller
reporta pero que **no podemos reproducir ni encontrar en los logs de Vercel**
(típico de errores de browser o intermitentes). Ahí el stack trace de Sentry paga
su setup. Free tier: 5k errores/mes, suficiente.

> No montarlo sin decisión explícita. Si se decide, es `npx @sentry/wizard@latest
> -i nextjs` + agregar `SENTRY_DSN` a las env vars de Vercel — Claude lo puede
> hacer en un PR aparte.

---

## Resumen — qué necesita decisión/acción de Gerardo antes del deploy

1. **Confirmar dominio canónico de prod** para la URL del health (`plataformatextil.com.ar` vs `plataforma-textil.vercel.app`).
2. **Activar/confirmar** notificaciones de deploy fallido en Vercel (§1).
3. **Crear** el monitor de UptimeRobot apuntando a `/api/health` (§2).
4. **Elegir canal** (Telegram recomendado) y conectarlo a UptimeRobot (§3).
5. **Decidir** sobre Sentry — recomendación: diferir (§4).
