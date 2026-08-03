# Arquitectura de despliegue — PDT (Plataforma Digital Textil)

Documento de handover institucional (OIT + UNTREF). Describe cómo está desplegada
la Plataforma Digital Textil: hosting, base de datos, integración continua,
variables de entorno, servicios de terceros y tareas programadas.

- **Repositorio:** `Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil` (repo `pdt`)
- **Stack:** Next.js 16.1.6 (App Router, Turbopack, React 19.2.3), TypeScript, Tailwind v4,
  Prisma 6.19, PostgreSQL (Supabase), NextAuth v5 beta (sesiones JWT), Vercel.
  Testing con Vitest (unit) y Playwright (e2e).
- **Modelo de infraestructura:** serverless gestionado. No hay servidores propios,
  ni contenedores, ni scripts de deploy a mantener: Vercel construye y publica desde Git.

Para titularidad de cuentas, propietarios de cada credencial y procedimiento de
rotación, ver los documentos complementarios `INVENTARIO_ACCESOS.md` y
`RUNBOOK_RESCOPE_SECRETS.md`.

---

## 1. Vista general

Git es la única fuente de verdad. Un push a una rama observada dispara un build en
Vercel; el build aplica las migraciones de Prisma contra la base del entorno y, si
todo pasa, publica. La aplicación en runtime habla con Supabase (datos) y con varios
SaaS externos.

```
                        GitHub (repo pdt)
                 ┌──────────────┴──────────────┐
             push main                     push develop
                 │                              │
                 ▼                              ▼
        ┌──────────────────┐          ┌──────────────────┐
        │  Vercel BUILD    │          │  Vercel BUILD    │
        │  prisma migrate  │          │  prisma migrate  │
        │  deploy          │          │  deploy          │
        │  prisma generate │          │  prisma generate │
        │  next build      │          │  next build      │
        └────────┬─────────┘          └────────┬─────────┘
       migra+publica si OK           migra+publica si OK
                 │                              │
                 ▼                              ▼
        ┌──────────────────┐          ┌──────────────────┐
        │   PRODUCCIÓN     │          │     PREVIEW      │
        │ plataformatextil │          │  URL por deploy  │
        │    .com.ar       │          │   (rama/PR)      │
        └────────┬─────────┘          └────────┬─────────┘
                 │                              │
                 ▼                              ▼
        ┌──────────────────┐          ┌──────────────────┐
        │ Supabase PROD    │          │ Supabase DEV     │
        │ nefbhacmjrzy...  │          │ fjddgukwydsd...  │
        │ PostgreSQL 17.6  │          │ PostgreSQL 17.6  │
        │   (sa-east-1)    │          │   (sa-east-1)    │
        └──────────────────┘          └──────────────────┘

  App en runtime (ambos entornos) ──▶ SaaS externos:
    Resend (email) · Upstash Redis (rate-limit) · Anthropic + Voyage (RAG/IA)
    Google OAuth (login) · AFIP SDK / ARCA (verificación CUIT)
```

Punto clave: **el build de Vercel corre las migraciones antes de publicar**. Si una
migración falla, el build falla y el entorno se queda en el deploy anterior. Nunca se
publica una app a medias contra una base migrada parcialmente.

---

## 2. Hosting — Vercel

- **Proyecto Vercel:** `plataforma-textil`. Usuario/owner: **gbreard** (gbreard@gmail.com).
- **Región de ejecución:** `gru1` (São Paulo), fijada en `vercel.json` (`"regions": ["gru1"]`).
  Se elige por cercanía a la base de datos (Supabase sa-east-1) y a los usuarios en Argentina.
- **Framework preset:** Next.js. La build corre con Turbopack.

### Dominios y DNS

| Dominio | Rol |
|---|---|
| `https://plataformatextil.com.ar` | Dominio propio de Producción |
| `https://plataforma-textil.vercel.app` | Dominio Vercel de Producción |
| `plataforma-textil-git-main-gbreards-projects.vercel.app` | Alias git de la rama `main` |

Los certificados TLS/SSL de todos los dominios los **emite y renueva Vercel
automáticamente**; no hay certificados que gestionar a mano. Los registros DNS del
dominio propio apuntan a Vercel en modo "DNS only" para que Vercel maneje su propio
CDN y SSL.

### Mapeo rama → entorno

| Rama Git | Entorno Vercel | Resultado |
|---|---|---|
| `main` | **Production** | Auto-deploy a `plataformatextil.com.ar` |
| `develop` | **Preview** | Deploy de preview con URL propia |
| cualquier rama / PR | **Preview** | Deploy de preview con URL única por commit |

La *Production Branch* configurada en Vercel es `main`. No hay branch protection sobre
`main` a nivel GitHub; la promoción a producción se hace igualmente por PR (convención
de equipo, no obligación técnica).

> Nota: `vercel.json` incluye un `ignoreCommand` que cancela el build cuando la rama es
> `gh-pages` (esa rama la produce el workflow de QA Pages y no debe desplegarse como app).

---

## 3. Base de datos — Supabase

Dos proyectos Supabase independientes, ambos en la región **sa-east-1**, PostgreSQL **17.6**:

| Entorno | Ref del proyecto Supabase | Usado por |
|---|---|---|
| **DEV** | `fjddgukwydsdcrqoxvns` | Preview / desarrollo local |
| **PROD** | `nefbhacmjrzynnhvgfnl` | Producción (`main`) |

Mantener dos proyectos separados evita que los datos de desarrollo contaminen
producción y viceversa.

### Connection strings: pooler vs. directa

Prisma usa dos cadenas de conexión distintas por entorno:

- **`DATABASE_URL`** — conexión vía **pooler** (Transaction mode) de Supabase. Es la que
  usa la app en runtime; soporta el modelo serverless (muchas conexiones cortas).
- **`DIRECT_URL`** — conexión **directa** a Postgres, sin pooler. La usan las operaciones
  de esquema de Prisma (migraciones), que requieren una sesión directa.

### Migraciones

- El proyecto tiene **37 migraciones Prisma** versionadas en `prisma/migrations/`.
- Se aplican **durante el build de Vercel** vía el `build` de `package.json`:
  `prisma migrate deploy && prisma generate && next build`. Cada deploy sincroniza el
  esquema del entorno con las migraciones del commit antes de publicar.
- **En local no se migra contra producción.** El Prisma CLI lee `.env` (no `.env.local`),
  que por convención apunta a DEV. Hay guards commiteados (`scripts/check-db-ref.ts`) que
  bloquean `db:migrate` / `db:push` / `db:reset` si `DATABASE_URL` apunta al ref de PROD, y
  `prisma/seed.ts` se niega a correr contra PROD. El bypass deliberado es `ALLOW_PROD=1`
  (scripts `db:*`) o `ALLOW_PROD_SEED=1` (`db:seed`). El `build` no lleva guard porque es
  Vercel quien lo corre legítimamente contra PROD.

Además de Postgres, Supabase provee **Storage** (imágenes públicas servidas desde
`*.supabase.co/storage/v1/object/public/**`, habilitado en `next.config.ts`).

---

## 4. Pipeline CI/CD

Tres workflows de GitHub Actions, más el deploy que hace Vercel por su cuenta.

### `test.yml` — Unit tests (Vitest)

- **Dispara en:** `pull_request` hacia `develop` o `main`, y `push` a `develop`.
- **Corre:** `npm ci`, `npx prisma generate`, `npm run test` (Vitest).
- **Modo informativo:** reporta verde/rojo pero **no es required check** todavía, así que
  no bloquea merges. La intención es promoverlo a required una vez estabilizado.

### `e2e.yml` — End-to-end (Playwright)

- **Dispara en:** `pull_request` hacia `develop` o `main`, y `push` a `develop`.
- **Corre contra el deploy real de Vercel**, no contra un server local:
  1. Espera a que el deploy de Vercel esté listo. En push a `develop` hace polling de
     `TEST_BASE_URL` hasta que `/api/health/version` devuelva el SHA esperado; en PR busca
     la URL de preview vía la GitHub Deployments API y valida el mismo SHA.
  2. "Warm up" de funciones serverless: golpea páginas públicas y luego, con login por rol
     (TALLER, MARCA, ESTADO, ADMIN) usando `CI_BYPASS_TOKEN`, precalienta páginas
     autenticadas para evitar cold starts en los tests.
  3. `npx playwright test` contra esa URL. Si falla, sube el `playwright-report` como artifact.
- **Secrets que consume:** credenciales de test por rol (`TEST_*_EMAIL/PASSWORD`), Upstash de
  test (`UPSTASH_REDIS_REST_URL_TEST` / `_TOKEN_TEST`) y `CI_BYPASS_TOKEN`.

### `qa-pages.yml` — Publicación de QA interactivos

- **Dispara en:** `push` a `develop` que toque `.claude/auditorias/QA_v2-*.md`,
  `QA_v3-*.md`, `QA_v4-*.md` o `tools/generate-qa.js`.
- **Corre:** regenera los HTML de QA con `tools/generate-qa.js`, arma el índice y los
  publica en **GitHub Pages** (rama `gh-pages`, vía `peaceiris/actions-gh-pages`).
- URL pública: `https://grupo-de-investigacion-y-desarollo-gids.github.io/plataforma-textil/`.

### Promoción develop → main

Flujo habitual:

1. Rama feature → PR contra `develop`. Corren `test.yml` y `e2e.yml` (contra el preview).
2. Merge a `develop` → Vercel publica el Preview; `qa-pages.yml` actualiza los QA si aplica.
3. Validación en preview / QA.
4. PR de `develop` a `main` → corren de nuevo los checks.
5. Merge a `main` → Vercel construye (aplicando migraciones) y publica a producción.

**Rollback:** revertir el commit en `main` (nuevo deploy) o promover un deploy anterior
desde la UI de Vercel. No hay scripts de rollback propios (ver sección 8).

---

## 5. Variables de entorno

Se configuran en Vercel y se **scopean por entorno** (Production / Preview / Development).
Esta tabla lista para qué sirve cada una; **no contiene valores**. Para titularidad de
cada credencial y procedimiento de rotación, ver `INVENTARIO_ACCESOS.md` y
`RUNBOOK_RESCOPE_SECRETS.md`.

| Variable | Para qué | Scope | Notas |
|---|---|---|---|
| `DATABASE_URL` | Conexión Postgres (pooler) para la app | Prod / Preview | Distinta por entorno (PROD vs DEV) |
| `DIRECT_URL` | Conexión Postgres directa para migraciones Prisma | Prod / Preview | Distinta por entorno |
| `NEXTAUTH_SECRET` | Firma de sesiones JWT de NextAuth | Prod / Preview | Único por entorno |
| `NEXTAUTH_URL` | URL canónica para callbacks de auth | Prod / Preview | Apunta al dominio de cada entorno |
| `SUPABASE_URL` | Endpoint del proyecto Supabase | Prod / Preview | Distinta por entorno |
| `SUPABASE_SERVICE_ROLE_KEY` | Acceso server-side a Supabase (Storage/admin) | Prod / Preview | Secreto de alto privilegio |
| `RESEND_API_KEY` | Envío de email transaccional (Resend) | Prod / Preview | Sin ella, email cae a modo dev (log) |
| `EMAIL_FROM` | Remitente de los emails | Prod / Preview | Dominio propio `notificaciones@plataformatextil.com.ar` |
| `UPSTASH_REDIS_REST_URL` | Endpoint Redis para rate-limiting | Prod / Preview | Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Token de acceso a Upstash Redis | Prod / Preview | — |
| `AFIP_*` / `ARCA_*` | Integración de verificación CUIT (AFIP SDK / ARCA) | Prod / Preview | Incluye credenciales/certificados del proveedor |
| `CRON_SECRET` | Autentica las llamadas de Vercel Cron a los endpoints | Prod | Ver sección 7 |
| `CI_BYPASS_TOKEN` | Bypass de login para el warmup/e2e en CI | **Preview / Dev únicamente** | **Ausente en Producción** por diseño |

Variables adicionales relacionadas con IA/OAuth (Anthropic, Voyage, Google OAuth) siguen
el mismo criterio de scoping por entorno; el detalle de titularidad está en
`INVENTARIO_ACCESOS.md`.

> Regla de seguridad importante: `CI_BYPASS_TOKEN` **no existe en Producción**. Es un
> mecanismo exclusivo de CI/preview para evitar el flujo de login real durante los tests.

---

## 6. Servicios de terceros (SaaS)

Todos consumidos en runtime por la app; cada uno cubre una capacidad que no vive en Vercel:

| Servicio | Rol en runtime |
|---|---|
| **Supabase** | Base de datos PostgreSQL + Storage (imágenes) |
| **Resend** | Email transaccional (magic links, notificaciones) desde `notificaciones@plataformatextil.com.ar` |
| **Upstash (Redis)** | Rate-limiting de requests por usuario/endpoint |
| **Anthropic (Claude API)** | Motor del asistente / generación en el RAG |
| **Voyage AI** | Embeddings para el RAG |
| **Google OAuth** | Proveedor de login social |
| **AFIP SDK (afipsdk.com) / ARCA** | Verificación de CUIT contra padrón AFIP |

---

## 7. Cron jobs

- Definidos en `vercel.json` como **Vercel Cron**. Actualmente hay uno:

  | Path | Schedule (UTC) | Función |
  |---|---|---|
  | `/api/cron/gracia-cuit` | `0 11 * * *` (diario, 11:00 UTC) | Período de gracia CUIT: recordatorio, inactivación y reactivación de talleres según su estado de verificación |

- **Seguridad:** el endpoint valida `CRON_SECRET`. Vercel invoca el cron incluyendo ese
  secreto; una llamada externa sin el secreto se rechaza. Por eso `CRON_SECRET` debe estar
  presente en el entorno de Producción para que el cron funcione.

---

## 8. Ítems N/A por diseño serverless

Cosas que en una infraestructura tradicional habría que documentar/operar y que aquí
**no aplican** porque Vercel + Supabase las gestionan:

- **Infraestructura como código (IaC):** no hay Terraform/Pulumi/CloudFormation. El
  hosting es un proyecto Vercel conectado a Git; la config vive en `vercel.json`,
  `next.config.ts` y las variables de entorno de Vercel.
- **Contenedores / Dockerfile:** no hay. Vercel construye y ejecuta funciones serverless;
  no se empaquetan ni orquestan contenedores.
- **Scripts propios de deploy:** no hay. El deploy es el push a Git; Vercel detecta,
  construye (aplicando migraciones) y publica.
- **Scripts propios de rollback:** no hay. El rollback es revertir el commit en `main`
  o promover un deploy anterior desde la UI de Vercel.
- **Gestión manual de certificados TLS:** no aplica. Vercel emite y renueva los
  certificados de todos los dominios automáticamente.
- **Aprovisionamiento/patching de servidores, balanceadores, autoscaling:** los gestiona
  la plataforma (Vercel para cómputo, Supabase para la base).

---

*Documento de handover — PDT (OIT + UNTREF). Complementa a `INVENTARIO_ACCESOS.md`
(titularidad de cuentas y credenciales) y `RUNBOOK_RESCOPE_SECRETS.md` (rotación de
secretos). Los hechos se basan en el estado del repo a la fecha del handover.*
