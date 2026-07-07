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

## 1. CRON_SECRET (env var — pendiente de setear)

El cron y el endpoint de lanzamiento se protegen con `Authorization: Bearer ${CRON_SECRET}`.
Vercel adjunta ese header automáticamente a los crons si la env var existe. **Sin
`CRON_SECRET` configurado, el endpoint responde 401** (no queda abierto por omisión).

**Setear en Vercel** (Production + Preview) — lo hace Gerardo (requiere acceso al dashboard):

```
vercel env add CRON_SECRET production
vercel env add CRON_SECRET preview
# valor: un secreto largo aleatorio, ej: openssl rand -hex 32
```

Y en `.env.local` para pruebas locales/curl.

## 2. Qué hace cada corrida

Sobre los talleres con `estadoCuenta = EN_GRACIA` (fuente: `planificarAccionGracia`):

- **Ventana [50, 60) días y sin recordatorio previo** → email recordatorio + sella
  `recordatorioCuitEnviadoAt` (idempotencia: no re-envía).
- **≥ 60 días** → `estadoCuenta = INACTIVA` + `inactivadaAt = NOW` + email de inactivación.
  Al salir de `EN_GRACIA`, la próxima corrida ya no lo toca (inactivación no-op repetible).

La ventana (no el día exacto) tolera corridas perdidas: si el cron se saltea el día 50,
los días 51..59 siguen mandando el recordatorio. Si salta directo a ≥60, inactiva (la
inactivación tiene prioridad sobre el recordatorio).

Cada corrida loguea un resumen: `{ evaluados, recordatorios, inactivaciones, sinEmail, errores }`
(consola + `logActividad('CRON_GRACIA_CUIT')` para la bitácora).

## 3. Disparar el cron manualmente (QA / debug)

```bash
curl -i https://<preview-o-prod>/api/cron/gracia-cuit \
  -H "Authorization: Bearer $CRON_SECRET"
# Sin el header → 401
```

## 4. Demo de Sergio — ver INACTIVA con el cron

Usa el taller de demo dedicado (`demo.gracia`, retrodatado a 55 días en B0). Pasos:

```sql
-- 1) Correr el reloj a 65 días para que el cron lo inactive
UPDATE "talleres"
SET "inicioGracia" = NOW() - INTERVAL '65 days'
WHERE id = (SELECT id FROM "talleres" t JOIN "User" u ON u.id = t."userId"
            WHERE u.email = 'demo.gracia@pdt.org.ar');
```

```bash
# 2) Disparar el cron
curl -s https://<preview>/api/cron/gracia-cuit -H "Authorization: Bearer $CRON_SECRET"
# → { ..., inactivaciones: 1 }
```

3) En el dashboard del taller demo: **banner rojo "Tu cuenta está inactiva"** + el taller
   deja de aparecer en el directorio. Se mandó el email de inactivación.

4) Para ver la **reactivación**: verificar el CUIT desde el flujo ARCA (o `sincronizarTaller`)
   → vuelve a `estadoCuenta = ACTIVA`, banner desaparece, elegible de nuevo para el directorio
   (si cumple vidriera mínima).

Para volver a probar el **recordatorio**: `inicioGracia = NOW() - INTERVAL '55 days'` +
`recordatorioCuitEnviadoAt = NULL` + `estadoCuenta = 'EN_GRACIA'`, y disparar el cron.

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
