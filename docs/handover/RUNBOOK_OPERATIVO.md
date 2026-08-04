# Runbook operativo — PDT (Plataforma Digital Textil)

> Documento consolidado para operación de la plataforma en producción.
> Entregable OIT/UNTREF. Escrito para quien esté de guardia ante un incidente.
>
> Este runbook **resume** los procedimientos y remite al runbook fuente (por ruta)
> para el detalle completo. No reemplaza a los runbooks originales: los orquesta.

---

## 1. Introducción — mapa de runbooks

La operación de PDT está documentada en runbooks temáticos que viven en
`.claude/specs/`. Este documento los consolida en un solo índice operativo y resume
cada procedimiento; para el paso a paso largo, ir siempre al fuente indicado.

| Tema | Runbook fuente | Qué cubre |
|------|----------------|-----------|
| Promoción a producción | `.claude/specs/RUNBOOK_PROMOCION_PROD.md` | snapshot `pg_dump`, pipeline `develop → main`, migraciones en el build, rollback, smoke |
| Re-scope / rotación de secrets | `.claude/specs/RUNBOOK_RESCOPE_SECRETS.md` | separar/rotar `NEXTAUTH_SECRET`, `ARCA_PROVIDER`, `CRON_SECRET`, `RESEND`, `UPSTASH` entre Preview y Production |
| Observabilidad | `.claude/specs/RUNBOOK_OBSERVABILIDAD.md` | `/api/health`, UptimeRobot, alertas Vercel, canal Telegram/Slack, bitácora |
| Evento OIT / modo demo | `.claude/specs/v4-a-proteger-registro-dev.md` | allowlist de registro + flag `MODO_EVENTO` para el evento público de agosto |

Documentos de handover complementarios (mismo directorio):

- `docs/handover/ARQUITECTURA_DEPLOY.md` — hosting, DB, pipeline, env vars, terceros.
- `docs/handover/BACKUP_RESTORE.md` — estrategia de backup, `pg_dump`, restore, retención.
- `docs/handover/GUIA_DESARROLLO.md` — levantar el entorno local, tests, CI.

### Arquitectura en una línea

Next.js 16 + Prisma 6 sobre PostgreSQL 17.6 (Supabase, `sa-east-1`), desplegado en
Vercel (región `gru1`). Auth NextAuth v5 en modo JWT. Rate limit en Upstash Redis.
Email transaccional en Resend.

- **`main` → Producción.** Vercel auto-deploya y **aplica las migraciones en el build**
  (`prisma migrate deploy`). Dominio: **https://plataformatextil.com.ar**.
- **`develop` → Preview.** Ambiente de validación de Sergio y compañeros.
- Supabase: DEV ref `fjddgukwydsdcrqoxvns` · PROD ref `nefbhacmjrzynnhvgfnl`.

---

## 2. Monitoreo y salud

### Endpoint de health

| Endpoint | Qué hace | Respuesta |
|----------|----------|-----------|
| `GET /api/health` | `SELECT 1` real contra la DB | `200 {status:ok,db:up}` si la DB responde; `503 {db:down}` si no |
| `GET /api/health/version` | Reporta SHA/env/ref del deploy (no toca DB) | Confirma qué commit está publicado en prod |

URL en prod: **https://plataformatextil.com.ar/api/health**

Chequeo manual rápido:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://plataformatextil.com.ar/api/health
```

- `200` → app y DB OK.
- `503` → app arriba, **DB caída** (ver §5, caída de Supabase).
- timeout / no responde → app caída (ver §4, caída de Vercel).

> Por qué `/api/health` y no la home: la home es un server component pesado y cacheable
> que puede responder `200` con la DB caída. El health hace `SELECT 1` real y caza el
> modo de falla más probable (Supabase).

### Qué revisar y dónde

| Señal | Dónde | Notas |
|-------|-------|-------|
| Uptime / caída del sitio | **UptimeRobot** (monitor tipo Keyword a `/api/health`, intervalo 5 min, alerta si falta `"db":"up"`) | Alerta al canal Telegram/Slack. Es el disparador para venir a mirar. |
| Deploy fallido | **Vercel → Notifications** (email automático al owner) + integración Slack opcional | Ver §6 (migración fallida). |
| Errores de runtime / 5xx | **Vercel dashboard → proyecto → Observability / Logs** → filtrar `Production` + status `5xx` | Manual (no alerta sola en plan Pro). Retención corta. |
| Errores/latencia de DB | **Supabase → proyecto PROD → Logs** (y **Reports**) | Para diagnosticar el `503` del health. |
| Incidentes registrados | `.claude/BITACORA_PROD.md` | Bitácora de deploys/incidentes; lectura previa de la revisión semanal. Anotar todo incidente acá. |

Sentry **no está montado** (decisión deliberada para el piloto). Montarlo solo si
aparece un bug reportado por un taller que no se reproduce ni figura en los logs de
Vercel. Detalle y evaluación en `.claude/specs/RUNBOOK_OBSERVABILIDAD.md` §4.

---

## 3. Escenario — Promoción a producción

**Resumen.** Promover = mergear `develop → main` (vía PR). Vercel buildea y, dentro
del build, corre `prisma migrate deploy` contra la DB de prod **antes** de publicar.

Pasos, en orden:

1. **Snapshot previo (obligatorio).** `pg_dump` de prod con cliente **≥ 17** (el
   servidor es PG 17.6; el `pg_dump` v14 de Ubuntu falla con `server version mismatch`).
   Usar el `DIRECT_URL` de prod (session pooler, **puerto 5432**, no el 6543).
   Verificar integridad con `pg_restore --list` y copiar el `.dump` a dos destinos.
2. **Merge `develop → main`.** El build aplica las migraciones pendientes y publica.
   - **Propiedad de seguridad:** si una migración falla, el build falla y **prod queda
     en el deploy viejo** (no se publica a medias). Cada migración corre en su
     transacción. Ver §6.
3. **Verificación técnica post-deploy.** Home `200`, login de cada rol entra al
   dashboard, GET sensibles sin sesión dan `401`, queries de control de las migraciones
   aplicadas.
4. **Smoke de Sergio.** Checklist ampliado (cubre las features que entran por primera
   vez a prod).
5. **Rollback** disponible si el smoke falla (ver §6 y el runbook fuente §4).

> El detalle completo (comandos exactos de `pg_dump`/`pg_restore`, tabla de migraciones
> pendientes, checklist de verificación técnica, smoke ampliado de Sergio, saneo
> one-time de CUITs) está en **`.claude/specs/RUNBOOK_PROMOCION_PROD.md`**. No promover
> sin leerlo. También `docs/handover/BACKUP_RESTORE.md` para el mecanismo de snapshot.

---

## 4. Escenario — Caída de Vercel

**Síntomas:** el sitio no responde o da `5xx` en todas las rutas; `/api/health` no
contesta (timeout, no un `503` limpio); UptimeRobot alerta caída.

**Diagnóstico y respuesta:**

1. Verificar **https://www.vercel-status.com** (status.vercel.com). Si hay incidente
   declarado de plataforma, es de Vercel: esperar y comunicar. No hay acción de código.
2. Si Vercel está OK pero la app cae, revisar **Vercel → proyecto → Deployments**: ¿el
   último deploy a producción está en estado `Error` o `Ready`? ¿Hubo un deploy reciente
   que rompió algo?
3. **Rollback a un deploy anterior desde la UI:** Vercel → Deployments → elegir el
   último deploy `Ready` que funcionaba → menú (⋯) → **Promote to Production** /
   **Rollback**. Prod vuelve a ese build al instante (no rebuildea).
   - El **DNS y el dominio siguen en Vercel**: no hay que tocar registros DNS ni el
     dominio. El rollback solo reapunta el alias de producción a otro build.
4. Si el problema vino de un merge a `main`, además hacer el rollback de código (ver §6
   / §3) para que el próximo deploy no repita el fallo.

---

## 5. Escenario — Caída de Supabase (base de datos)

**Síntomas:** `/api/health` devuelve **`503 {db:down}`**; la app carga el front pero
las operaciones con datos fallan; errores de conexión en los logs de Vercel.

**Diagnóstico y respuesta:**

1. Confirmar con el health: `503` = app arriba, DB no responde.
2. Verificar **https://status.supabase.com** y el **dashboard del proyecto PROD**
   (`nefbhacmjrzynnhvgfnl` → Reports / Logs): ¿el proyecto está pausado, sin cómputo,
   al límite de conexiones, o hay incidente de región `sa-east-1`?
3. La app queda en **modo degradado** (front sirve, datos fallan). No hay failover.
4. **No hay failover automático de base de datos** — declarado explícitamente. No existe
   una réplica que tome el tráfico. La respuesta es **esperar** a que Supabase se
   recupere o **escalar** con el soporte de Supabase / reactivar el proyecto desde el
   dashboard si quedó pausado.
5. Registrar el incidente en `.claude/BITACORA_PROD.md`.

> Si la caída es por límite de conexiones y no un incidente de Supabase, revisar el uso
> del pooler. La restauración desde snapshot (`pg_dump`) es un procedimiento aparte de
> recuperación de datos, **no** un failover; ver `docs/handover/BACKUP_RESTORE.md` §3.

---

## 6. Escenario — Migración fallida en el deploy

**Contexto:** el build de producción corre `prisma migrate deploy && prisma generate &&
next build`. Si una migración falla, `prisma migrate deploy` corta con error y el build
entero falla.

**Propiedad de seguridad (por qué no es catastrófico):**

- El build falla → **Vercel no publica el deploy nuevo → prod sigue sirviendo el deploy
  viejo, intacto.** No hay ventana de sitio roto por la migración.
- **La DB no queda a medias:** cada migración corre en su propia transacción. La que
  falla se revierte entera; las anteriores (que ya aplicaron OK) quedan aplicadas.

**Respuesta:**

1. Abrir **Vercel → Deployments → el build fallido → Build Logs** y localizar el error
   de `prisma migrate deploy` (qué migración, qué statement SQL falló).
2. Investigar la causa (conflicto de schema, dato que viola una constraint, orden de
   migraciones, etc.). Corregir la migración en `develop`.
3. Re-deployar (nuevo merge/push a `main`). `prisma migrate deploy` reintenta desde la
   migración pendiente; las ya aplicadas se saltan (idempotente por la tabla
   `_prisma_migrations`).
4. Prod estuvo en el deploy viejo todo el tiempo: cero downtime por la migración.

> Detalle de la tabla de migraciones esperadas y sus tipos (aditivas / data-only) en
> `.claude/specs/RUNBOOK_PROMOCION_PROD.md` §2. La aditividad de las migraciones es lo
> que hace que el rollback sea "solo código": ver §3 de ese runbook y el escenario
> siguiente de rotación de secrets para no confundir rollback de DB con rollback de app.

---

## 7. Escenario — Rotación de un secret

**Resumen.** Rotar un secret = generar el valor nuevo en el proveedor, actualizarlo en
Vercel **por scope** (Production vs Preview/Development) y redeployar el ambiente afectado.

Patrón general:

1. Generar el valor nuevo en el dashboard del proveedor (o `openssl rand -base64 32`
   para secrets internos como `NEXTAUTH_SECRET` / `CRON_SECRET`). Guardarlo en el
   password manager rotulado por ambiente.
2. **Vercel → Project Settings → Environment Variables** → editar la entrada del secret.
   Respetar el **scope**: separar Production de Preview/Development si comparten valor.
3. **Redeploy** del ambiente afectado para que tome el valor nuevo.
4. Verificar con el checklist del runbook fuente.

**Caso especial — `NEXTAUTH_SECRET` (P0):**

- La sesión NextAuth es JWT firmada con este secret; el middleware gatea leyendo solo el
  token. Si el secret es idéntico en DEV y PROD, una cookie firmada en DEV valida en PROD.
- **Rotar/cambiar el valor invalida todas las sesiones JWT vivas de ese ambiente** →
  esos usuarios quedan deslogueados.
- Por eso se separa **solo el de Preview** (deja PROD intacto): desloguea DEV (Sergio +
  compañeros), no al piloto real. **No** tocar el valor de Production salvo necesidad
  explícita.

> Enumeración completa de secrets compartidos, riesgo de cada uno, orden de ejecución y
> checklist de verificación en **`.claude/specs/RUNBOOK_RESCOPE_SECRETS.md`**. Incluye el
> caso delicado de `ARCA_PROVIDER` / `AFIP_SDK_ENV` (auditar el valor efectivo **antes**
> de tocar; nunca dejarlo en `""`, que cae en la rama real de AFIP) y `CRON_SECRET`.

---

## 8. Escenario — Evento OIT / modo demo

**Contexto.** En agosto hay un evento público de la OIT donde el ambiente de demo
(probablemente DEV/Preview) se abre a público general **desde tablets, con datos
sintéticos**. El registro real de producción queda gateado y no se toca.

**Resumen del mecanismo (spec `v4-a-proteger-registro-dev.md`):**

- El endpoint `POST /api/auth/registro` se pone detrás de un gate por ambiente:
  - `VERCEL_ENV = production` → **abierto**, igual que hoy (no-op en el piloto).
  - Preview/Development sin flag → **allowlist**: solo emails/dominios en
    `REGISTRO_ALLOWLIST` se registran; el resto recibe `403`.
  - Preview/Development con **`MODO_EVENTO=on`** → **abierto (modo evento)**: cualquiera
    se registra y el alta queda marcada como sintética
    (`logActividad('REGISTRO_MODO_EVENTO', …)`) para limpieza post-evento.
- Variables nuevas (solo Preview/Development, **no** en Production): `REGISTRO_ALLOWLIST`
  (CSV de emails y dominios `@x.com`) y `MODO_EVENTO` (`"on"` para activar).

**Operación del evento:**

1. Antes del evento: setear `MODO_EVENTO=on` (o cargar la allowlist) en el ambiente demo.
2. Durante: el público registra cuentas sintéticas desde las tablets.
3. **Después del evento (checklist obligatorio): apagar `MODO_EVENTO`.** Si queda
   prendido, el registro de DEV sigue abierto (higiene, no riesgo de PROD — el flag no se
   lee en producción). Las altas del evento se barren por
   `WHERE accion = 'REGISTRO_MODO_EVENTO'`.

> Comportamiento por ambiente, reglas de match de la allowlist, helper
> `registro-gate.ts`, casos borde y criterios de aceptación en
> **`.claude/specs/v4-a-proteger-registro-dev.md`**. Se complementa con el re-scope de
> `NEXTAUTH_SECRET` (§7): cerrar el registro reduce la superficie, separar el secret
> cierra la escalada cross-ambiente.

---

## 9. Contactos de escalamiento por proveedor

Ante un incidente, escalar al proveedor correspondiente. La **titularidad institucional
de las cuentas está PENDIENTE de definición OIT/UNTREF** donde se indica; el detalle de
accesos, owners y credenciales va en `INVENTARIO_ACCESOS.md` (a mantener por Gerardo).

| Proveedor | Rol en la plataforma | Status page / soporte | Titularidad de la cuenta |
|-----------|----------------------|-----------------------|--------------------------|
| **Vercel** | Hosting, CI/CD, dominio | https://www.vercel-status.com · soporte desde el dashboard | Cuenta `gbreard` (gbreard@gmail.com). Titularidad institucional **PENDIENTE definición OIT/UNTREF** |
| **Supabase** | PostgreSQL 17.6 + Storage (PROD `nefbhacmjrzynnhvgfnl`, `sa-east-1`) | https://status.supabase.com · dashboard del proyecto | Titularidad institucional **PENDIENTE definición OIT/UNTREF** |
| **Resend** | Email transaccional (dominio `plataformatextil.com.ar`) | https://resend.com/ · dashboard | Titularidad institucional **PENDIENTE definición OIT/UNTREF** |
| **Upstash** | Redis (rate limiting) | https://status.upstash.com · dashboard | Titularidad institucional **PENDIENTE definición OIT/UNTREF** |
| **Dominio** `plataformatextil.com.ar` | DNS gestionado en Vercel | Registrador del `.com.ar` (NIC Argentina / registrador) + Vercel para DNS | Titularidad del dominio **PENDIENTE definición OIT/UNTREF** |
| **UptimeRobot** | Uptime monitoring + alertas | https://uptimerobot.com/ | Cuenta con email institucional (recomendado) |

> El inventario detallado de accesos (quién es owner de cada cuenta, cómo se recuperan
> credenciales, qué falta transferir a OIT/UNTREF) se mantiene en
> **`INVENTARIO_ACCESOS.md`**. Este runbook solo lista el punto de escalamiento por
> proveedor; para la titularidad y el traspaso institucional, remitir a ese inventario.
