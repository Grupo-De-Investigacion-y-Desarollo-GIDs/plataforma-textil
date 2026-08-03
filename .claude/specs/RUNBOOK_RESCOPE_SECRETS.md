# RUNBOOK — Re-scope de secrets compartidos entre Preview (DEV) y Production (PROD)

> **Tipo:** Runbook operativo (dashboard Vercel — ejecuta Gerardo)
> **Origen:** Handoff de seguridad, ítem "separar bases dev/prod" — Etapa 1 del plan
> **Estado:** REDACTADO — pendiente de ejecución. NO ejecutado.
> **Fecha:** 2026-07-16
> **Alcance:** SOLO variables de entorno en Vercel. No toca código ni migraciones.

---

## 0. Por qué existe

I-01 (junio) separó las **bases de datos** (dos Supabase, scopes de `DATABASE_URL`/`DIRECT_URL`/`SUPABASE_*` diferenciados Preview vs Production) y agregó los guards anti-PROD. Lo que **quedó compartido** son varios secrets de aplicación que hoy tienen el mismo valor en ambos ambientes. El más grave (`NEXTAUTH_SECRET`) permite que una sesión firmada en DEV valide en PROD.

Este runbook los enumera, explica el riesgo de cada uno, y da el procedimiento exacto de re-scope **con la ventana y el orden correctos** para no desloguear al piloto ni romper el CI.

**Verificación de partida (2026-07-16, `vercel env ls`):**

| Variable | Scope hoy | Acción |
|---|---|---|
| `NEXTAUTH_SECRET` | Production + Preview + Development (**una entrada, mismo valor**) | 🔴 **SEPARAR** |
| `RESEND_API_KEY` | Production + Preview | 🟡 evaluar separar |
| `CRON_SECRET` | Production + Preview | 🟡 evaluar separar |
| `UPSTASH_REDIS_REST_URL` + `_TOKEN` | Production + Preview | 🟢 opcional |
| `ARCA_PROVIDER` | Production + Preview (**una entrada**) | ⚠️ **AUDITAR VALOR EFECTIVO PRIMERO** |
| `AFIP_SDK_ENV` | Production / Preview+Development (dos entradas) | ⚠️ confirmar coherencia con ARCA_PROVIDER |

> Las bases de datos (`DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) **ya están separadas** por scope — no se tocan en este runbook.

---

## 1. `NEXTAUTH_SECRET` — el crítico (P0)

### 1.1 Riesgo concreto

NextAuth v5 corre en strategy **JWT**. El token de sesión se firma con `NEXTAUTH_SECRET` y el `middleware.ts` gatea **solo leyendo el token** (`decodeSessionToken`), sin lookup a la DB. Como el secret es idéntico en DEV y PROD:

- Una cookie de sesión obtenida en DEV (registro abierto — ver spec de allowlist) **valida en el dominio de PROD**.
- El gating de PROD acepta los `roles`/`activeMode` que trae ese token DEV.
- Los endpoints de admin de PROD re-hidratan datos reales de PROD contra ese token.

Escalar hasta ADMIN por autoservicio en DEV no es trivial (el registro solo crea TALLER/MARCA), pero la superficie es real y es exactamente lo que un handoff de seguridad marca como bloqueante.

### 1.2 Qué rompe rotar/separar el secret

Cambiar el valor de `NEXTAUTH_SECRET` en **un** ambiente **invalida todas las sesiones JWT vivas de ese ambiente** (las cookies dejan de verificar → los usuarios quedan deslogueados y tienen que volver a entrar).

- Separar **solo el de Preview** (dejar PROD intacto): **no afecta a PROD**. Solo desloguea sesiones abiertas en el preview/DEV (Sergio, los 4 compañeros, cuentas de prueba). Impacto bajo y aceptable.
- **NO** tocar el valor de Production en esta etapa — desloguearía al piloto real.

### 1.3 Procedimiento (Gerardo, dashboard)

1. Generar un secret nuevo, fuerte y distinto del actual:
   ```bash
   openssl rand -base64 32
   ```
   Guardar en el password manager rotulado `NEXTAUTH_SECRET — PREVIEW (DEV)`.
2. Vercel → Project Settings → Environment Variables → `NEXTAUTH_SECRET`.
3. La entrada actual cubre Production + Preview + Development. **Editarla para que quede SOLO Production** (destildar Preview y Development).
4. **Crear una entrada nueva** `NEXTAUTH_SECRET` con scope **Preview + Development** y el valor recién generado.
5. Guardar. Redeploy del preview (cualquier push a `develop`, o "Redeploy" desde el dashboard) para que tome el valor nuevo.
6. **Verificación:** loguearse en el preview → funciona con credenciales seed (`pdt2026`). Copiar esa cookie de sesión al dominio de PROD → PROD la **rechaza** (redirige a login). Ese rechazo es la prueba de que el cross-ambiente se cerró.

### 1.4 Ventana

Fuera de horario de uso del piloto **no aplica** (PROD no se toca). Sí conviene avisar a Sergio y los compañeros que la próxima vez que entren al preview van a tener que reloguearse. Sin urgencia horaria.

---

## 2. `ARCA_PROVIDER` / `AFIP_SDK_ENV` — auditar ANTES de tocar

### 2.1 Por qué es delicado

El código lee (`src/compartido/lib/arca.ts:14,17`):

```ts
provider: (process.env.ARCA_PROVIDER as 'afipsdk' | 'mock') ?? 'afipsdk',
production: process.env.AFIP_SDK_ENV?.trim() === 'production',
```

Dos trampas conocidas:

- **`??` no atrapa el string vacío.** Si `ARCA_PROVIDER=""` (vacío, no ausente), `?? 'afipsdk'` NO dispara y el provider queda `""` → cae en la rama real de AFIP. Este footgun ya rompió el mock del preview en una sesión anterior.
- `ARCA_PROVIDER` figura como **una sola entrada Production + Preview**. Si es literalmente el mismo valor, entonces **o** Preview corre ARCA real (fuga de CUITs reales a AFIP desde demos y datos sintéticos), **o** Production corre el mock (no verifica de verdad los CUITs del piloto). Las dos son malas y opuestas.

### 2.2 Qué verificar (Gerardo, dashboard — SOLO LECTURA por ahora)

1. En Vercel → Environment Variables → `ARCA_PROVIDER`: abrir la entrada y confirmar **el valor efectivo por scope**. ¿Preview y Production comparten el mismo valor? ¿Cuál es?
2. Idem `ARCA_ENABLED` y `AFIP_SDK_ENV`.
3. Contrastar con la expectativa correcta:

| Ambiente | `ARCA_PROVIDER` esperado | `AFIP_SDK_ENV` esperado | Efecto |
|---|---|---|---|
| **Preview (DEV / demos)** | `mock` | (irrelevante) | valida cualquier CUIT bien formado excepto los reservados; no pega a AFIP |
| **Production (piloto real)** | `afipsdk` | `production` | verificación real contra el padrón AFIP |

4. Si el valor efectivo NO coincide con la tabla, **separar en dos entradas** (Preview → `mock`, Production → `afipsdk`), nunca dejar `""`. Confirmar que ninguna de las dos quede vacía.

> **No cambiar nada en esta etapa sin confirmar el valor leído primero.** El objetivo de la Etapa 1 es diagnóstico; el cambio de `ARCA_PROVIDER` puede ir junto con la separación del secret o en un paso aparte, pero siempre después de ver qué hay hoy.

---

## 3. `CRON_SECRET` — separar recomendado

**Riesgo:** compartido Production + Preview. El endpoint del cron de gracia (`/api/cron/gracia-cuit`) se autentica con este secret. Quien conozca el del preview puede disparar el cron de **PROD** (inactivaciones/reactivaciones de talleres reales).

**Acción:** mismo patrón que §1.3 — editar la entrada actual a **solo Production**, crear una nueva **Preview + Development** con un `openssl rand -base64 32` distinto. **No rompe nada:** el cron lo dispara Vercel Cron (Production) y las corridas manuales de QA (Preview) usan cada una su propio valor.

**Cuidado:** si hay un `vercel.ts`/`vercel.json` con `crons[]` apuntando al endpoint, no depende del valor del secret (Vercel inyecta el header automáticamente en Production). Verificar que el QA manual del preview use el secret nuevo de Preview.

---

## 4. `RESEND_API_KEY` — evaluar (no urgente)

**Riesgo:** compartido → DEV puede mandar emails reales desde el dominio de producción (`notificaciones@plataformatextil.com.ar`). Un flujo de prueba en el preview que dispare un email real le llega a una persona real.

**Opciones:**
- (a) Dejar compartido y confiar en que DEV cae a modo dev cuando no hay flujo real de envío. Riesgo residual: cualquier acción de QA que mande email de verdad.
- (b) Separar: Preview usa una API key de Resend en **modo test/sandbox** o un dominio `dev.` distinto. Más limpio, requiere config en Resend.

**Recomendación:** (b) si el evento de agosto va sobre DEV (público mandando datos → riesgo de emails salientes reales). Si el evento va a un tercer entorno demo, (a) es tolerable para el piloto. **Decisión de producto — queda para Sergio**, no la fuerzo acá.

---

## 5. `UPSTASH_REDIS_*` — opcional (bajo)

**Riesgo:** compartido → el estado de rate-limit de DEV y PROD vive en la misma instancia Redis. Contaminación cruzada: un barrido de QA en DEV puede consumir cuota que cuenta contra PROD, y viceversa. Impacto bajo (los limiters usan claves por IP/acción, colisión improbable pero posible).

**Acción:** opcional. Separar solo si se crea el tercer entorno demo (que sí conviene aislar del rate-limit del piloto). Para DEV/PROD del día a día, tolerable.

---

## 6. Orden de ejecución recomendado

1. **Auditar `ARCA_PROVIDER`/`AFIP_SDK_ENV`** (§2.2, solo lectura) — saber qué hay hoy antes de nada.
2. **Separar `NEXTAUTH_SECRET`** (§1.3) — el P0. Solo desloguea DEV.
3. **Separar `CRON_SECRET`** (§3) — junto con lo anterior, no rompe nada.
4. **Corregir `ARCA_PROVIDER`** si la auditoría del paso 1 mostró incoherencia.
5. **`RESEND` / `UPSTASH`** — diferir a la decisión del entorno de agosto (§4, §5).

**Todo esto es dashboard de Vercel (Gerardo).** El agente no puede leer los valores `Encrypted` ni rotar secrets. Lo que el agente sí entrega es este runbook y el checklist de verificación de cada paso.

---

## 7. Checklist de verificación post-ejecución

- [ ] `ARCA_PROVIDER` efectivo: Preview = `mock`, Production = `afipsdk` (ninguno vacío)
- [ ] `NEXTAUTH_SECRET`: dos entradas, valores distintos, Preview separado de Production
- [ ] Cookie de sesión de DEV **rechazada** en el dominio de PROD (prueba manual)
- [ ] Login en preview sigue funcionando con cuentas seed (`pdt2026`)
- [ ] Piloto en PROD **no** deslogueado (no se tocó el secret de Production)
- [ ] `CRON_SECRET`: Preview separado; QA manual del cron del preview usa el valor nuevo
- [ ] CI e2e verde tras el redeploy del preview (no depende del secret, pero confirmar)
- [ ] Decisión tomada sobre `RESEND`/`UPSTASH` según entorno de agosto

---

## 8. Referencias

- `.claude/specs/v3-separar-ambientes.md` — I-01, separación de bases (ya ejecutado)
- `.claude/specs/k-01-rls-supabase.md` — RLS DEV cerrado (#389), PROD pendiente
- `src/middleware.ts` — gating read-only por JWT (por qué el secret compartido es P0)
- `src/compartido/lib/arca.ts:14,17` — lectura de `ARCA_PROVIDER`/`AFIP_SDK_ENV`
- Memoria: `project_env_db_safety` (dev=`fjddgukwydsdcrqoxvns` / prod=`nefbhacmjrzynnhvgfnl`)
