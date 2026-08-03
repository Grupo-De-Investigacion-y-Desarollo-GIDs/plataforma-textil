# Inventario de accesos y cuentas

> Parte técnica del punto **d) Configuración, acceso y credenciales** del Handover Package.
> Documenta **qué cuenta/servicio vive dónde y para qué**, sin exponer valores de secretos.
>
> **Titularidad institucional: PENDIENTE de definición por OIT / UNTREF.** La transferencia
> de cuentas al receptor institucional la coordina **Sergio** con Matías y OIT. Este
> documento provee el inventario técnico para esa transferencia; **no** decide quién es el
> titular final.
>
> Estado a **2026-08-03**.

## Regla de oro

Este archivo **no contiene ningún valor de secreto** (ni API keys, ni tokens, ni
contraseñas, ni connection strings). Sólo nombres de variables, servicios y titulares. Los
valores viven en los dashboards de cada proveedor y en Vercel/GitHub como secretos cifrados.
No commitear valores acá nunca.

---

## 1. Servicios y cuentas (dónde vive qué)

| Servicio | Rol en la plataforma | Titular / cuenta actual | Titularidad institucional |
|----------|----------------------|-------------------------|---------------------------|
| **GitHub** | Repositorio + CI (Actions) | Org `Grupo-De-Investigacion-y-Desarollo-GIDs`, repo `plataforma-textil` | PENDIENTE (OIT/UNTREF) |
| **Vercel** | Hosting, build, deploy, cron, analytics | Cuenta `gbreard` (gbreard@gmail.com), proyecto `plataforma-textil` | PENDIENTE |
| **Supabase** | PostgreSQL + Storage + infra de auth | Cuenta del equipo; org con proyectos DEV/PROD (sa-east-1) | PENDIENTE |
| **Resend** | Email transaccional | Cuenta del equipo; dominio `plataformatextil.com.ar` | PENDIENTE |
| **Google Cloud** | OAuth (login con Google) | Proyecto GCP con OAuth client | PENDIENTE |
| **AFIP SDK** (afipsdk.com) | Verificación de CUIT vs. padrón ARCA/AFIP | Cuenta con token de servicio | PENDIENTE |
| **Anthropic** | API de Claude (RAG / asistencia) | API key del equipo | PENDIENTE |
| **Voyage AI** | Embeddings para RAG | API key del equipo | PENDIENTE |
| **Upstash** | Redis serverless (rate limiting) | Cuenta del equipo | PENDIENTE |
| **Registrador del dominio** | `plataformatextil.com.ar` | A confirmar (registrador NIC.ar / intermediario) | PENDIENTE |

> "Titular / cuenta actual" ≠ "Titularidad institucional". La columna de la derecha es lo
> que Sergio debe cerrar con OIT/UNTREF: a qué cuenta institucional se transfiere cada
> servicio y quién queda como owner.

---

## 2. Proyectos Supabase

| Entorno | Ref del proyecto | Región | Uso |
|---------|------------------|--------|-----|
| DEV / Preview | `fjddgukwydsdcrqoxvns` | sa-east-1 | Desarrollo, preview de `develop`, e2e |
| PROD | `nefbhacmjrzynnhvgfnl` | sa-east-1 | Producción (`main`) |

- Motor: PostgreSQL **17.6**. ~44 tablas en `public`. 37 migraciones versionadas.
- Connection strings: `DATABASE_URL` (pooler) y `DIRECT_URL` (session pooler, puerto 5432,
  el que usa Prisma migrate y `pg_dump`).
- Storage: bucket de documentos (privado, ver K-02).
- Backups: ver `docs/handover/BACKUP_RESTORE.md`.

---

## 3. Variables de entorno por dónde viven

Las variables de runtime viven en **Vercel** (scopeadas por entorno: Production / Preview /
Development). Las de CI viven en **GitHub Actions secrets**. Localmente, en `.env.local`
(runtime Next) y `.env` (sólo Prisma CLI) — ambos gitignored y **apuntando siempre a DEV**.

| Variable | Para qué | Scope esperado | Notas de seguridad |
|----------|----------|----------------|--------------------|
| `DATABASE_URL` / `DIRECT_URL` | Conexión Postgres (pooler / directa) | Todos, por entorno | Distintos por entorno (DEV vs PROD) |
| `NEXTAUTH_SECRET` | Firma de JWT de sesión | Todos | **Debe separarse por entorno** (ver hallazgo 1.2). Rotar invalida sesiones |
| `NEXTAUTH_URL` | URL base de auth | Por entorno | — |
| `RESEND_API_KEY` | Envío de emails | Prod + Preview | Sin ella, email cae a modo dev (log, no manda) |
| `EMAIL_FROM` (+ `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO`) | Remitente | Prod + Preview | Dominio propio `notificaciones@plataformatextil.com.ar` |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Storage / service role | Por entorno | Service role bypassa RLS — tratar como secreto de máxima sensibilidad |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Rate limiting | Prod + Preview | **Presentes en Prod** → rate-limit no falla abierto |
| `AFIP_SDK_TOKEN` | Token de afipsdk.com | Por entorno | Origen del incidente 1.4; mantener una sola entrada válida por entorno |
| `AFIP_SDK_ENV` | `production` vs homologación | Prod = `production` | Ausente → cae a homologación |
| `AFIP_CERT` / `AFIP_KEY` / `AFIP_CUIT_PLATAFORMA` / `ARCA_ENABLED` / `ARCA_PROVIDER` | Config ARCA | Por entorno | `ARCA_PROVIDER`: PROD real, DEV mock+`?real=1` |
| `CRON_SECRET` | Protege el cron de gracia CUIT | **Prod (requerido)** | Sin ella el cron queda desprotegido |
| `CI_BYPASS_TOKEN` | Bypass de rate-limit / endpoints de test | **Sólo Preview/Dev** | **AUSENTE en Prod por diseño** |
| `ANTHROPIC_API_KEY` / `VOYAGE_API_KEY` | RAG | Por entorno | — |

> Valores: **no** en este repo. Para rotación y re-scope: `.claude/specs/RUNBOOK_RESCOPE_SECRETS.md`.

---

## 4. DNS, dominios y certificados

| Ítem | Estado |
|------|--------|
| Dominio propio | `plataformatextil.com.ar` (apunta al proyecto Vercel) |
| Alias Vercel | `plataforma-textil.vercel.app`, `plataforma-textil-git-main-...vercel.app` |
| Certificados TLS | Gestionados automáticamente por Vercel |
| Registrador / propietario del dominio | **PENDIENTE de documentar** (registrador, contacto, renovación) |
| Registros DNS (A/CNAME/TXT/MX) | **PENDIENTE de inventariar** (cuando se defina titularidad) |

---

## 5. Contactos de escalamiento por proveedor

| Proveedor | Soporte / status | Escalamiento |
|-----------|------------------|--------------|
| Vercel | status.vercel.com · dashboard del proyecto | Owner de la cuenta (hoy gbreard) |
| Supabase | status.supabase.com · dashboard del proyecto | Owner de la org |
| Resend | dashboard Resend | Owner de la cuenta |
| Upstash | dashboard Upstash | Owner de la cuenta |
| AFIP SDK | afipsdk.com | Cuenta de servicio |
| Registrador dominio | PENDIENTE | PENDIENTE |

---

## 6. Gaps de este inventario (para cerrar con Sergio / OIT)

1. **Titularidad institucional** de cada servicio (a qué cuenta de OIT/UNTREF se transfiere).
2. **Registrador y propietario del dominio** + inventario DNS completo.
3. **Política y calendario de rotación** de credenciales (por proveedor).
4. **Planes/tiers** contratados de cada SaaS (para presupuesto y límites).
5. Re-scope de `NEXTAUTH_SECRET` (hallazgo de seguridad 1.2) y confirmación de scopes ARCA.

> Una vez que Sergio confirme titularidad y receptores, Gerardo cierra la parte técnica
> (transferencia efectiva de owners, DNS y calendario de rotación).
