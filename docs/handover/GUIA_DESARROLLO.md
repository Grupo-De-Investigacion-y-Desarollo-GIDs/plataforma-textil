# Guía de desarrollo — PDT

Guía para un desarrollador que recibe la **Plataforma Digital Textil (PDT)** y necesita levantarla, entenderla y trabajar sobre ella. Iniciativa de la OIT y la UNTREF (repo `pdt` v0.1.0, org GitHub `Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil`).

Para convenciones de código, commits y flujo de PRs ver [CONTRIBUTING.md](../../CONTRIBUTING.md).

---

## 1. Requisitos previos

- **Node.js 20 o superior** (la CI corre en Node 20).
- **npm 10 o superior** (el repo usa `package-lock.json`; la CI usa `npm ci`).
- **Vercel CLI** con acceso al proyecto, para bajar las variables de entorno con `vercel env pull`. Usuario del proyecto: `gbreard`.
- **Acceso a PostgreSQL vía Supabase** (región sa-east-1). No hace falta instalar Postgres local: se trabaja contra la base de **DEV** en Supabase. Hay dos proyectos Supabase separados, DEV y PROD.

---

## 2. Levantar el entorno local paso a paso

```bash
# 1. Clonar
git clone https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil.git
cd plataforma-textil

# 2. Instalar dependencias
npm install

# 3. Traer las variables de entorno (todas las vars de runtime, apuntan a DEV)
vercel env pull --environment=preview .env.local

# 4. Configurar .env para el Prisma CLI (apuntando a DEV)
#    .env sólo necesita DATABASE_URL y DIRECT_URL, copiadas de .env.local.
#    El Prisma CLI NO lee .env.local, por eso hace falta este archivo aparte.

# 5. Generar el cliente Prisma
npx prisma generate

# 6. (Opcional) cargar datos de prueba en DEV
npm run db:seed

# 7. Levantar el servidor de desarrollo
npm run dev
```

La app queda en http://localhost:3000.

Ambos archivos, `.env.local` y `.env`, están en `.gitignore` y **deben apuntar a DEV**. La razón está explicada en la sección de base de datos.

---

## 3. Estructura del proyecto

```
src/
  app/(admin)/admin/...    # Panel admin (20+ pages)
  app/(taller)/taller/...  # Vista taller (Bronce/Plata/Oro)
  app/(marca)/marca/...    # Vista marca
  app/(estado)/estado/...  # Vista estado (métricas de formalización)
  app/(auth)/              # login, registro, olvide-contrasena, mi-cuenta
  app/(public)/            # directorio, perfil/[id], ayuda, terminos, privacidad
  app/api/                 # API routes
  components/ui/           # componentes base (button, card, badge, modal, data-table...)
  components/layout/       # header, user-sidebar
  compartido/              # componentes y librerías compartidas (import via @/compartido/...)
  lib/                     # auth.ts, auth.config.ts, prisma.ts, utils.ts, email, etc.
  __tests__/               # tests unitarios (Vitest)
  middleware.ts            # protección por roles (usa auth.config.ts para Edge)

prisma/
  schema.prisma            # schema de PostgreSQL
  migrations/              # 37 migraciones
  seed.ts                  # datos de prueba (con guard anti-PROD)

tests/e2e/                 # tests e2e (Playwright, 37 specs)
scripts/                   # utilidades (check-db-ref.ts, etc.)
.github/workflows/         # CI (test.yml, e2e.yml, qa-pages.yml)
```

Roles del sistema: **TALLER** (Bronce/Plata/Oro), **MARCA**, **ESTADO**, **ADMIN**. Cada grupo de layout `(...)` de App Router agrupa las páginas de un rol; las páginas multi-rol viven en `(public)/` con layout condicional. Detalle de la convención de páginas nuevas en [CONTRIBUTING.md](../../CONTRIBUTING.md).

---

## 4. Base de datos

- **ORM:** Prisma 6. El schema está en `prisma/schema.prisma`. **No se toca el schema sin el tech lead (Gerardo)** — ver CONTRIBUTING.
- **Migraciones:** 37 migraciones en `prisma/migrations/`. En local se aplican con `npm run db:migrate`. A PROD las aplica Vercel durante el build (`prisma migrate deploy`), no el CLI local.
- **Seed:** `npm run db:seed` carga datos de prueba en DEV.

### El modelo `.env` vs `.env.local` (importante)

Hay dos archivos de entorno, ambos gitignored, y ambos deben apuntar a **DEV**:

| Archivo | Quién lo lee | Contiene |
|---|---|---|
| `.env.local` | Next.js (runtime) | **todas** las variables. Se baja con `vercel env pull --environment=preview .env.local` |
| `.env` | Prisma CLI | sólo `DATABASE_URL` y `DIRECT_URL` |

**Por qué dos archivos:** el Prisma CLI **no lee `.env.local`**. Sin un `.env` propio, `migrate` / `push` / `db pull` / `seed` no encontrarían la URL de la base. Por eso se duplican `DATABASE_URL` y `DIRECT_URL` en `.env`.

**Por qué `.env` = DEV por defecto:** el Prisma CLI lee `.env`; si ese archivo apuntara a PROD, un `db:migrate`, `db:push`, `db:reset` o `db:seed` le pegaría directamente a producción. Por eso la regla es que `.env` apunte siempre a DEV. El flip a PROD es opt-in puntual y lo hace cada dev en su máquina (gitignored, no commiteable): `vercel env pull --environment=production .env.prod`.

### Guards anti-PROD (commiteados, en el repo)

- `scripts/check-db-ref.ts` bloquea `db:migrate` / `db:push` / `db:reset` si `DATABASE_URL` apunta al ref de PROD.
- `prisma/seed.ts` se niega a correr contra PROD.
- Bypass deliberado: `ALLOW_PROD=1 npm run db:migrate` (o `ALLOW_PROD_SEED=1 npm run db:seed`).
- El `build` **no** lleva guard, porque Vercel lo corre legítimamente contra PROD en el deploy de producción.

Scripts de base disponibles: `db:check`, `db:migrate`, `db:push`, `db:reset`, `db:seed`.

---

## 5. Correr tests

Los tests son parte del entregable de cada spec, no opcionales.

### Unit (Vitest)

```bash
npm test           # corre la suite una vez (vitest run)
npm run test:watch # modo watch
```

Los tests unitarios viven en `src/__tests__/` (55 suites). Importan tipos y enums generados por Prisma, así que hace falta haber corrido `npx prisma generate` antes.

### E2E (Playwright)

```bash
npm run test:e2e         # corre la suite
npm run test:e2e:ui      # interfaz visual de Playwright
npm run test:e2e:headed  # browser visible
```

Los e2e viven en `tests/e2e/` (37 specs). En CI corren **contra el deploy de Vercel** (preview en PRs, DEV en pushes a `develop`), no contra un server local — por eso el workflow espera a que el deploy esté listo antes de arrancar.

**Cuándo se corre cada uno:** los unit corren rápido y son el primer filtro (local + CI). Los e2e validan flujos completos por rol (TALLER, MARCA, ESTADO, ADMIN) contra un deploy real; son más lentos y dependen del preview.

---

## 6. CI/CD

CI en GitHub Actions, deploy en Vercel (región gru1).

**En cada Pull Request (contra `develop` o `main`):**

- `test.yml` — instala con `npm ci`, corre `npx prisma generate` y `npm run test` (Vitest). Hoy está en **modo informativo**: reporta verde/rojo pero todavía no es un required check que bloquee el merge.
- `e2e.yml` — espera el preview deploy de Vercel del SHA del PR (vía GitHub Deployments API), calienta las funciones serverless (páginas públicas + login por rol) y corre `npx playwright test` contra la URL del preview. Sube el `playwright-report/` como artifact si falla.

**Deploys automáticos (Vercel desde GitHub):**

| Rama | Ambiente | URL |
|---|---|---|
| `main` | Producción | https://plataformatextil.com.ar (y https://plataforma-textil.vercel.app) |
| `develop` | Preview/DEV | preview de Vercel |

El `build` de Vercel corre `prisma migrate deploy && prisma generate && next build`, así que las migraciones a PROD se aplican en el build de `main`, no desde el CLI local. Las PRs generan preview deploys con URL única.

Además, `qa-pages.yml` publica los QA interactivos en GitHub Pages cuando se tocan los archivos de auditoría.

---

## 7. Convenciones clave

Están centralizadas en [CONTRIBUTING.md](../../CONTRIBUTING.md): server components por defecto, `'use client'` sólo cuando hace falta, sin emojis en el código, `font-overpass`, colores `brand-blue` / `brand-red`, imports desde `@/compartido/...`, Conventional Commits en español con `(#PR)`, flujo feature-branch → PR a `develop` → CI verde + QA de Sergio → squash, y la checklist de páginas nuevas.

El flujo de trabajo es **spec-first**: toda funcionalidad nace de un spec en `.claude/specs/` escrito por el tech lead. Leer el spec completo antes de arrancar y no tomar decisiones de arquitectura que no estén en él.

---

## 8. Troubleshooting común

- **"Prisma no encuentra la base / usa la URL equivocada":** el Prisma CLI **no lee `.env.local`**, sólo `.env`. Verificar que `.env` tenga `DATABASE_URL` y `DIRECT_URL` apuntando a DEV.
- **Un `db:*` se bloquea con error de PROD:** es el guard `scripts/check-db-ref.ts` haciendo su trabajo — `.env` está apuntando a PROD. Corregirlo a DEV. Si de verdad querés operar contra PROD, usar `ALLOW_PROD=1` (o `ALLOW_PROD_SEED=1` para el seed), a conciencia.
- **Tests unit fallan por tipos de Prisma:** correr `npx prisma generate` antes de `npm test`.
- **Los e2e no arrancan en local esperando un deploy:** los e2e están pensados para correr contra un deploy de Vercel (ver `TEST_BASE_URL`). Para depurar localmente, apuntar la config de Playwright al server local (`npm run dev`) o usar `test:e2e:ui`.
- **Fuentes / tipografía:** Noto Sans y Overpass están como archivos `.woff2` locales en `public/fonts/`. No dependen de Google Fonts en el build; si una fuente no carga, revisar que el archivo esté en `public/fonts/`.
- **Middleware:** Next.js 16 recomienda migrar `middleware.ts` a `proxy.ts`; por ahora no es bloqueante. El middleware usa `auth.config.ts` (ligero, Edge) para no exceder el límite de 1MB de Edge — no importar Prisma ahí.

---

_Desarrollado por UNTREF con el apoyo de la OIT. Codigo bajo licencia Apache-2.0; documentacion editorial bajo CC BY 4.0 IGO._
