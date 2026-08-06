# HARDENING — Controles de seguridad aplicados

**Plataforma Digital Textil (PDT)** · Registro de los controles **ya aplicados** (no es un plan;
documenta lo existente) + los pendientes con fecha. **Versión:** 1.0 · **Fecha:** 2026-08-06.

> El stack es **serverless gestionado** (Vercel + Supabase): el hardening tradicional (nginx,
> firewall, patcheo de SO, contenedores) **no aplica** — lo gestiona el proveedor. El hardening
> relevante es el de la capa Next.js + Vercel + Supabase RLS + gestión de secretos. Los hallazgos
> detallados y la superficie de ataque viven en el consolidado de seguridad y el ISRA (**canal
> separado**, no en el repo).

---

## 1. Gestión de secretos (saga completa)

### 1.1 `NEXTAUTH_SECRET` — separado por entorno (CERRADO 2026-08-03)
Era **una sola entrada compartida** entre Production y Preview → un JWT firmado en Preview
**validaba en Production** (escalada cross-ambiente, P0). **Re-scope ejecutado:** entradas
separadas de **Production** y **Preview** (sin Development: el candado del plan no permite ese
scope y no se usa `vercel dev`). Runbook: `.claude/specs/RUNBOOK_RESCOPE_SECRETS.md`.

### 1.2 `CRON_SECRET` — separado (CERRADO 2026-08-03)
El cron de gracia (`/api/cron/gracia-cuit`) se protege con `Authorization: Bearer ${CRON_SECRET}`
y **no falla abierto** (401 si falta; cubierto por test). Separado: **Production** con el valor
original, **Preview** con valor nuevo.

### 1.3 ARCA — provider por ambiente + token
- **PROD → siempre real** (`ARCA_PROVIDER=afipsdk`); DEV/Preview → mock por defecto para e2e/demos.
- El override de consulta real en dev (`?real=1`) está **gateado por token** para que el público
  del evento no dispare llamadas reales a AFIP (costo/rate). `AFIP_SDK_TOKEN` presente en prod.

### 1.4 Base de datos y `.env` local
- **DBs separadas:** dev (`fjddgukwydsdcrqoxvns`) y prod (`nefbhacmjrzynnhvgfnl`), ambos `sa-east-1`.
- **Política `.env` local → DEV:** el Prisma CLI lee `.env` (ignora `.env.local`). `.env` **debe
  apuntar a dev**. **Casi-incidente (2026-08-05):** se detectó `.env` apuntando a **prod** — un
  `prisma migrate` directo apuntó a prod (solo falló por password rotada). **Corregido:** `.env`
  reducido a `DATABASE_URL`/`DIRECT_URL` de **dev**.
- **Guards anti-PROD (commiteados):** `scripts/check-db-ref.ts` bloquea `db:migrate/push/reset` si
  la URL apunta al ref de prod; `prisma/seed.ts` se niega a correr contra prod. Bypass deliberado:
  `ALLOW_PROD=1` / `ALLOW_PROD_SEED=1`.
- **Connection strings:** runtime por **transaction pooler :6543** (`pgbouncer=true`); migraciones
  y scripts por **session pooler :5432**. La password de prod **no** sale por `vercel env pull`
  (Sensitive) — se obtiene del dashboard de Supabase.

### 1.5 Password del DB de prod — rotada (2026-08-05)
Rotada durante la migración del piloto. `DATABASE_URL`/`DIRECT_URL` recreadas en Vercel
(Production) y app reconectada (`/api/health` = `db:up`). Registrar en el inventario de accesos.

## 2. Row Level Security (RLS) — K-01
- **`anon` revocado** sobre `public.*` (migración `k01_rls_revoke_anon`, en prod desde el release
  de junio). La app lee vía el rol **owner** (bypassa RLS), pero el cliente anónimo no puede leer
  datos directamente.
- Cierra el leak de lectura anónima detectado en la auditoría K-01. Rollback documentado.

## 3. Autorización de endpoints (K-01/K-05)
- **86 endpoints auditados** y clasificados. Los GET sensibles (`validaciones/[id]/signed-url`,
  `admin/usuarios/[id]`, `colecciones/[id]/evaluacion`, etc.) devuelven **401 a anónimos**
  (verificado en prod post-deploy). Las mutaciones (PUT/POST) también.
- **K-05 — select explícito por rol:** los listados (`/api/talleres`, `/api/marcas`) piden a
  Prisma **solo** los campos que el caller consume, para no filtrar PII de más (guard con test de
  no-leak). El filtro `verificadoAfip` es obligatorio para MARCA/público (no ven talleres sin
  verificar) y opcional para ADMIN/ESTADO.

## 4. Rate limiting y CORS
- **Rate limiting** con **Upstash Redis** (`UPSTASH_*` presente en prod → no falla abierto) en
  registro, denuncias, sync ARCA masiva, etc.
- **CORS** configurado y testeado.

## 5. Autenticación de correo (anti-spoofing)
Sobre `plataformatextil.com.ar` (DNS en Cloudflare): **SPF** (subdominio `send.` → `amazonses.com`),
**DKIM** (`resend._domainkey`), **DMARC** (`p=none`, monitoreo; `rua` institucional). Entrante por
Cloudflare Email Routing (forwarding). **Pendiente:** subir DMARC a `quarantine`.

## 6. Otros controles aplicados
- **Contraseñas:** hash **bcrypt** (cost 10). Nunca en texto plano.
- **Sesión:** JWT (NextAuth v5); cookies con flags seguros (ver `docs/seguridad/cookies.md`).
- **Certificados:** endpoint público de verificación por `codigo` (no expone `pdfUrl`/`qrCode`).
- **Denuncias:** flag apagado para el lanzamiento (superficie reducida hasta definir canal con OIT).
- **Registro dev:** gate por ambiente + allowlist (spec v4-a) — cierra el registro abierto de preview.

## 7. Pendientes (con estado)

| Control | Estado | Ref |
|---|---|---|
| **CSP + security headers** (`headers()` en `next.config.ts`: CSP, HSTS, X-Frame-Options) | **PENDIENTE** (~3 h) | Hallazgo 4.1 / DEUDA_Y_ROADMAP |
| DMARC `p=none` → `quarantine` | Pendiente (post-monitoreo) | §5 |
| `rua` de DMARC a casilla institucional (hoy re-apuntado a `admin@`) | Hecho parcial | §5 |
| Automatizar snapshot pre-deploy | Pendiente | Runbook |
| Purga de docs sensibles del historial de git al transferir | Pendiente (transferencia) | DEUDA_Y_ROADMAP |

## 8. Estado post-auditoría (fechas)

- **K-01 (RLS + endpoints):** auditoría cerrada; críticos C1/C2/C3 resueltos; `anon` revocado en prod (jun-2026).
- **Re-scope de secrets:** NEXTAUTH_SECRET + CRON_SECRET separados por entorno (**2026-08-03**).
- **`.env` local → dev:** corregido tras el casi-incidente (**2026-08-05**).
- **Password prod:** rotada (**2026-08-05**).
- **Deploy a prod v2.0.0:** verificación de seguridad post-deploy OK — 401 anónimos, cron protegido, health `db:up` (**2026-08-04**).

---

*HARDENING v1.0 — 2026-08-06. Documenta controles existentes. La superficie de ataque y los
hallazgos con detalle van en el ISRA / consolidado de seguridad (canal separado).*
