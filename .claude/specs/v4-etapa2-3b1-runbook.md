# Runbook — Etapa 2.3-B1 (cron de gracia + emails + reactivación)

Cierre de la Etapa 2. Pone en movimiento el modelo de B0 (enum `EstadoCuenta`,
`clasificarGracia`, banners). Este doc es el runbook operativo + la guía de QA para Sergio.

## Piezas

| Pieza | Archivo | Qué hace |
|---|---|---|
| Cron diario | `src/app/api/cron/gracia-cuit/route.ts` | Recordatorio día ~50 + inactivación día 60 |
| Email lanzamiento (one-off) | `src/app/api/cron/gracia-lanzamiento/route.ts` | Aviso masivo "tenés 60 días", disparo manual |
| Decisión pura | `src/compartido/lib/gracia.ts` → `planificarAccionGracia` | NADA / RECORDATORIO / INACTIVAR (testeada) |
| Reactivación | `src/compartido/lib/arca.ts` → `sincronizarTaller` | Verificar CUIT → ACTIVA + reloj limpio |
| Emails | `src/compartido/lib/email.ts` | `buildRecordatorioCuitEmail`, `buildCuentaInactivaEmail`, `buildLanzamientoGraciaEmail` |
| Schedule | `vercel.json#crons` | `0 11 * * *` (08:00 ART) |

## 1. CRON_SECRET (env var — ✅ SETEADO)

El cron y el endpoint de lanzamiento se protegen con `Authorization: Bearer ${CRON_SECRET}`.
Vercel adjunta ese header automáticamente a los crons si la env var existe. **Sin
`CRON_SECRET` configurado, el endpoint responde 401** (no queda abierto por omisión).

**Estado:** seteado en Vercel (**Production + Preview**) desde el cierre de B1, probado
funcionando (el curl de la demo B1 devolvió `inactivaciones:1` contra el preview). Es
`sensitive` → no se lee desde el dashboard, pero está activo. **No hay prerequisito pendiente**
para disparar el cron manualmente.

Para pruebas locales/curl fuera de Vercel, agregar `CRON_SECRET` a `.env.local`.

## 2. Qué hace cada corrida

Sobre los talleres con `estadoCuenta = EN_GRACIA`, en este orden:

0. **Reintento ARCA (Pieza D — desde PR #452).** Para cada taller sin verificar con CUIT,
   `sincronizarTaller(force=true)` **antes** de clasificar. Si ARCA valida → el taller se
   reactiva solo (`ACTIVA` + reloj limpio) y sale de la gracia **sin recordatorio ni
   inactivación esa corrida**. Autocura el "CUIT correcto que falló por ARCA caído al
   registrarse". Reintento **diario sin backoff**. Un fallo de ARCA (no responde / CUIT malo)
   **no** cuenta como error del cron: cae al flujo normal de abajo.
1. **Ventana [50, 60) días y sin recordatorio previo** → email recordatorio + sella
   `recordatorioCuitEnviadoAt` (idempotencia: no re-envía).
2. **≥ 60 días** → `estadoCuenta = INACTIVA` + `inactivadaAt = NOW` + email de inactivación.
   Al salir de `EN_GRACIA`, la próxima corrida ya no lo toca (inactivación no-op repetible).

La ventana (no el día exacto) tolera corridas perdidas: si el cron se saltea el día 50,
los días 51..59 siguen mandando el recordatorio. Si salta directo a ≥60, inactiva (la
inactivación tiene prioridad sobre el recordatorio).

Cada corrida loguea un resumen: `{ evaluados, reintentosArca, reactivacionesAuto,
recordatorios, inactivaciones, sinEmail, errores }` (consola + `logActividad('CRON_GRACIA_CUIT')`
para la bitácora). `reintentosArca`/`reactivacionesAuto` son de la Pieza D.

## 3. Disparar el cron manualmente (QA / debug)

```bash
curl -i https://<preview-o-prod>/api/cron/gracia-cuit \
  -H "Authorization: Bearer $CRON_SECRET"
# Sin el header → 401
```

## 4. Demo de Sergio — Pieza D (reintento ARCA en el cron)

> Guion secuencial sobre el taller demo `demo-gracia-taller-001` (hoy `INACTIVA` post-demo B1).
> Se dispara contra el **preview de PR #452**. En DEV, ARCA está **mockeado**: valida cualquier
> CUIT bien formado, y reserva dos CUITs para forzar error → `11111111111` (`CUIT_INACTIVO`),
> `00000000000` (`CUIT_INEXISTENTE`).
>
> **Nota de conteos:** el cron procesa **todos** los talleres `EN_GRACIA` del entorno, así que
> `reactivacionesAuto` / `inactivaciones` son **totales del batch**. La verdad sobre el taller
> demo se confirma con el `SELECT` de verificación (por `id`), no solo con los agregados.

### Paso 0 — capturar estado y CUIT original (una vez, antes de empezar)

```sql
SELECT id, "cuit", "estadoCuenta", "verificadoAfip",
       "inicioGracia", "inactivadaAt", "recordatorioCuitEnviadoAt"
FROM "talleres" WHERE id = 'demo-gracia-taller-001';
```

Anotá el `cuit` original (bien formado) — DEMO 2 lo pisa con `11111111111`; para re-correr
DEMO 1 después hay que restaurarlo. (Si el `SELECT` da 0 filas, el id no existe en este
entorno; buscalo por email: `... JOIN "User" u ON u.id = t."userId" WHERE u.email = 'demo.gracia@pdt.org.ar'`.)

### DEMO 1 — D rescata (happy path)

Taller `EN_GRACIA` día 55 (ventana del recordatorio: **sin D recibiría el email "se te vence"**),
sin verificar, con su CUIT actual (bien formado → el mock valida).

```sql
-- DEMO 1: EN_GRACIA día 55, sin verificar, CUIT actual intacto
UPDATE "talleres"
SET "estadoCuenta"               = 'EN_GRACIA',
    "verificadoAfip"            = false,
    "inicioGracia"              = NOW() - INTERVAL '55 days',
    "recordatorioCuitEnviadoAt"  = NULL,
    "inactivadaAt"              = NULL
WHERE id = 'demo-gracia-taller-001';
-- (si ya corriste DEMO 2, agregá:  "cuit" = '<CUIT_ORIGINAL del Paso 0>')
```

```bash
# Disparar el cron
curl -s "https://<preview-#452>/api/cron/gracia-cuit" \
  -H "Authorization: Bearer $CRON_SECRET" | jq
```

**Esperado** — response: `reactivacionesAuto ≥ 1` (incluye este taller), `recordatorios: 0`
para este taller, `reintentosArca ≥ 1`. Verificar el taller:

```sql
SELECT "estadoCuenta", "verificadoAfip", "inicioGracia", "recordatorioCuitEnviadoAt"
FROM "talleres" WHERE id = 'demo-gracia-taller-001';
-- Esperado: ACTIVA | true | NULL | NULL   → se autocuró, sin email de vencimiento.
```

Narrativa: *el taller que estaba por recibir el aviso de vencimiento fue reactivado en silencio.*

### DEMO 2 — D no inventa salidas (contraste)

Taller `EN_GRACIA` día 61 con un **CUIT reservado-malo** → el reintento ARCA falla y el taller
sigue el flujo normal de inactivación.

```sql
-- DEMO 2: EN_GRACIA día 61, CUIT reservado-malo (mock → CUIT_INACTIVO)
UPDATE "talleres"
SET "estadoCuenta"               = 'EN_GRACIA',
    "verificadoAfip"            = false,
    "inicioGracia"              = NOW() - INTERVAL '61 days',
    "recordatorioCuitEnviadoAt"  = NULL,
    "inactivadaAt"              = NULL,
    "cuit"                      = '11111111111'
WHERE id = 'demo-gracia-taller-001';
```

```bash
curl -s "https://<preview-#452>/api/cron/gracia-cuit" \
  -H "Authorization: Bearer $CRON_SECRET" | jq
```

**Esperado** — response: `reintentosArca ≥ 1`, `reactivacionesAuto: 0` para este taller,
`inactivaciones ≥ 1` (incluye este taller). Verificar:

```sql
SELECT "estadoCuenta", "verificadoAfip", "inactivadaAt", "estadoCuitAfip"
FROM "talleres" WHERE id = 'demo-gracia-taller-001';
-- Esperado: INACTIVA | false | <ahora> | INACTIVO   → se inactivó + email de inactivación.
```

En el dashboard del taller demo: **banner rojo "Tu cuenta está inactiva"** + sale del directorio.

Narrativa: *D no inventa salidas — un CUIT que ARCA rechaza sigue el camino de los 60 días.*

### 4.3 Insight — demostrar inactivación/recordatorio con D activo (⚠ el guion viejo quedó obsoleto)

Con **D activo** y el mock validando cualquier CUIT bien formado, **ningún taller en gracia
llega a inactivarse en DEV con su CUIT real** — D lo rescata en la corrida siguiente. Por eso:

- El **guion viejo** (correr el reloj a 65 días con el CUIT bueno y esperar `INACTIVA`)
  **ya NO funciona**: hoy terminaría en **reactivación**, no en inactivación.
- Para demostrar **inactivación** (o el **recordatorio** día ~50) en DEV hay que usar un
  **CUIT reservado-malo**: `11111111111` (`CUIT_INACTIVO`) o `00000000000` (`CUIT_INEXISTENTE`).
  Es lo que hace DEMO 2.
- Para ver la **reactivación** por la vía normal (no la de D): verificar el CUIT desde el flujo
  ARCA / `sincronizarTaller` → `ACTIVA` + reloj limpio.

Restaurar el taller demo a un estado limpio tras las demos: `estadoCuenta='ACTIVA'`,
`verificadoAfip=true`, `inicioGracia=NULL`, `inactivadaAt=NULL`, `recordatorioCuitEnviadoAt=NULL`,
y el `cuit` original del Paso 0.

## 5. Email de lanzamiento (one-off manual)

**NO** es parte del cron. Se dispara **una sola vez**, poco después de promover B0 a prod
(cuando el backfill ya arrancó el reloj de los talleres existentes sin verificar). Avisa
"tenés 60 días desde hoy". No toca `inicioGracia` — solo notifica.

```bash
curl -i -X POST "https://plataforma-textil.vercel.app/api/cron/gracia-lanzamiento?confirmar=SI" \
  -H "Authorization: Bearer $CRON_SECRET"
```

- Requiere `?confirmar=SI` (evita un disparo accidental de envío masivo).
- **No es idempotente**: dispararlo dos veces manda dos emails. Por eso es manual y una vez.
- Lo dispara **Gerardo** cuando decide. Queda documentado, no automático.

## 6. A dónde van los emails en DEV/preview

- **Unit tests**: `sendEmail` está mockeado — no sale ningún email real.
- **DEV/preview**: si `RESEND_API_KEY` no está seteada, `sendEmail` cae a modo dev (log por
  consola, no envía). Los talleres del seed usan direcciones `@pdt.org.ar` (dominio no real,
  no entregable) → aunque Resend estuviera activo, no se spamea a ninguna persona real.
- **Prod**: `EMAIL_FROM = notificaciones@plataformatextil.com.ar` (dominio propio verificado).

## 7. Tests

- `src/__tests__/gracia.test.ts` — `planificarAccionGracia` (día 49/50/55/60/65, recordatorio
  ya enviado, corrida perdida, no-EN_GRACIA) + `datosReactivacion`.
- `src/__tests__/cron-gracia.test.ts` — route: 401 sin/con secret malo/sin CRON_SECRET;
  recordatorio + sello; inactivación; batch mixto; sin email; **idempotencia (doble corrida)**.
- `src/__tests__/arca.test.ts` — `sincronizarTaller` reactiva (ACTIVA + reloj limpio).
