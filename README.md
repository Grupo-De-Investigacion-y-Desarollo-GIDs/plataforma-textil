# Plataforma Digital Textil

**Donde se encuentran talleres y marcas para producir formalmente.**

_Desarrollado por UNTREF con el apoyo de la OIT._

![Stack](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC) ![License](https://img.shields.io/badge/License-Apache--2.0-green) ![Status](https://img.shields.io/badge/Status-Piloto%20en%20producci%C3%B3n%20%E2%80%A2%20en%20transferencia-blue)

---

> ## 📦 ¿Venís a recibir el proyecto? Empezá acá
>
> La plataforma está en **transferencia al nuevo equipo responsable**. Todo lo que necesitás para tomar la operación está en dos lugares:
>
> - **[`docs/transferencia/`](docs/transferencia/)** — el plan del traspaso y lo que queda por delante:
>   - **[SPEC_TRANSFERENCIA.md](docs/transferencia/SPEC_TRANSFERENCIA.md)** — plan operativo en 6 fases (entrega limpia → cuentas → rotación → reunión → acompañamiento → acta) + bloqueantes institucionales.
>   - **[BACKLOG_PENDIENTES.md](docs/transferencia/BACKLOG_PENDIENTES.md)** — todo lo pendiente, priorizado (Crítico / Importante / Mejora): **qué recibís y qué te queda por hacer**.
>   - **[INVENTARIO_LIMPIEZA.md](docs/transferencia/INVENTARIO_LIMPIEZA.md)** — clasificación del árbol del repo (A/B/C/D).
>   - **[AUDITORIA_HISTORIA_GIT.md](docs/transferencia/AUDITORIA_HISTORIA_GIT.md)** — qué hay en la historia git (secretos: ninguno; PII del piloto: sí).
> - **[`docs/handover/`](docs/handover/)** — el paquete de handover v1.0 (checklist OIT a–j): arquitectura, runbook operativo, backup/restore, deuda y roadmap, guía de desarrollo, cobertura de tests.
>
> El resto de este README es la referencia general del proyecto.

---

## Qué es la PDT

La **Plataforma Digital Textil (PDT)** es una iniciativa de la Organización Internacional del Trabajo (OIT) y la Universidad Nacional de Tres de Febrero (UNTREF) que conecta talleres textiles argentinos con marcas que necesitan producción.

A diferencia de un marketplace de comercio electrónico, la PDT funciona como una **vidriera profesional** del sector: los talleres exhiben sus capacidades, servicios y certificaciones; las marcas exploran, descubren y contactan. La transacción comercial se cierra por fuera de la plataforma. Lo que la PDT mide es el **encuentro** entre actores y la calidad del **posicionamiento profesional** del taller.

Por debajo, la plataforma sirve al Estado como instrumento de **política pública para promover la formalización del sector**. Esa dimensión institucional es invisible para el usuario final: el taller la vive como "requisitos para ser visible", no como trámite estatal. ESTADO accede a métricas de formalización, demanda insatisfecha y observaciones de campo sin protagonismo en la interfaz pública.

### El modelo en una imagen

```
┌────────────────────────────────────────────────────────────────┐
│  CAPA VISIBLE (lo que el usuario percibe)                      │
│  Vidriera del taller · Directorio para marcas · Recursos       │
├────────────────────────────────────────────────────────────────┤
│  CAPA INTERMEDIA (lo que la plataforma promueve invisiblemente)│
│  Onboarding · Documentación · Capacitación · Verificación      │
├────────────────────────────────────────────────────────────────┤
│  CAPA INSTITUCIONAL (invisible para usuarios)                  │
│  Dashboards ESTADO · Reportes OIT · Métricas de política       │
└────────────────────────────────────────────────────────────────┘
```

### Lo que NO es la PDT

Para evitar confusiones de quienes lleguen al repo buscando otro tipo de plataforma:

- **No es un marketplace de e-commerce.** No procesa pagos. No cobra comisiones.
- **No hace tracking de envíos.** La logística la coordinan los actores.
- **No tiene sistema de reviews.** No mide reputación post-transacción.
- **No es una bolsa de trabajo.** No conecta empleados con empleadores.
- **No es una plataforma de denuncias.** Aunque puede haber observaciones de campo en el módulo ESTADO, no reemplaza a los canales institucionales correspondientes.

---

## Estado del proyecto

| Aspecto | Estado |
|---|---|
| **Ciclo** | Piloto en producción — **en transferencia al nuevo equipo** (ver [`docs/transferencia/`](docs/transferencia/)) |
| **Última versión en prod** | `v2.1.0` — Etapa 2 completa (vidriera + gracia CUIT) |
| **Despliegue producción** | https://plataformatextil.com.ar |
| **Despliegue desarrollo** | https://dev.plataformatextil.com.ar |
| **Licencia** | Apache-2.0 (código) · CC BY 4.0 IGO (documentación) — ver [LICENSE](LICENSE) |
| **Repositorio** | https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil |
| **Issues** | [GitHub Issues](https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/issues) |
| **QAs auditados** | [GitHub Pages](https://grupo-de-investigacion-y-desarollo-gids.github.io/plataforma-textil/) |
| **Contacto** | contacto@plataformatextil.com.ar |

---

## Actores del sistema

La plataforma tiene 5 roles funcionales:

| Rol | Quién | Qué hace |
|---|---|---|
| **TALLER** | Unidades productivas textiles | Carga su perfil productivo, recibe pedidos, gestiona su formalización |
| **MARCA** | Marcas y empresas de indumentaria | Publica pedidos, explora el directorio de talleres, recibe cotizaciones |
| **ESTADO** | OIT, organismos públicos | Visualiza dashboards de formalización, demanda insatisfecha y observaciones |
| **ADMIN** | Equipo de gestión PDT | Modera contenido, valida documentación, administra usuarios |
| **CONTENIDO** | Curadores institucionales | Gestiona Academia, recursos institucionales y documentación pública |

> Un mismo usuario puede tener **varios roles** (multi-rol) y alternar el modo activo desde el header.

---

## Stack tecnológico

| Categoría | Tecnología |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI** | [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/) (config CSS nativa) |
| **Iconos** | [Lucide React](https://lucide.dev/) |
| **Base de datos** | [PostgreSQL 17](https://www.postgresql.org/) en [Supabase](https://supabase.com/) (región sa-east-1) |
| **ORM** | [Prisma 6](https://www.prisma.io/) |
| **Autenticación** | [NextAuth v5](https://authjs.dev/) (JWT; magic links + Google OAuth planificado) |
| **Storage** | [Supabase Storage](https://supabase.com/storage) (bucket `imagenes` público, `documentos` privado) |
| **Email** | [Resend](https://resend.com/) (transaccional, dominio propio verificado) |
| **Verificación CUIT** | [AfipSDK](https://afipsdk.com/) (integración con ARCA) |
| **Asistente IA (RAG)** | [Claude API](https://www.anthropic.com/) + [Voyage AI](https://www.voyageai.com/) (embeddings) + Supabase pgvector |
| **PDF / QR** | [@react-pdf/renderer](https://react-pdf.org/) + [qrcode](https://www.npmjs.com/package/qrcode) (certificados, órdenes) |
| **Gráficos** | [Recharts](https://recharts.org/) |
| **Formularios** | [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Rate limiting** | [Upstash Redis](https://upstash.com/) + [@upstash/ratelimit](https://github.com/upstash/ratelimit) |
| **Tests** | [Vitest](https://vitest.dev/) (unitarios) + [Playwright](https://playwright.dev/) (E2E) |
| **Lint** | [ESLint 9](https://eslint.org/) |
| **Hosting / CI-CD** | [Vercel](https://vercel.com/) (deploy automático desde GitHub) |
| **Dominio** | [NIC Argentina](https://nic.ar/) (`.com.ar`), DNS gestionado en Vercel |
| **Monitoreo** | [UptimeRobot](https://uptimerobot.com/) sobre `/api/health` |

> El inventario completo de servicios/cuentas (con refs) está en [SPEC_TRANSFERENCIA.md § Apéndice](docs/transferencia/SPEC_TRANSFERENCIA.md). Los **valores de credenciales** viven en el `INVENTARIO_ACCESOS` (canal seguro separado, fuera del repo).

---

## Cómo correr el proyecto localmente

### Requisitos previos

- Node.js 20 o superior (24 LTS recomendado)
- npm 10 o superior
- Acceso a un proyecto Supabase de desarrollo (o PostgreSQL local)
- Variables de entorno configuradas (ver `.env.example`)

### Instalación rápida

```bash
# 1. Clonar repo
git clone https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil.git
cd plataforma-textil

# 2. Instalar dependencias
npm install

# 3. Copiar y configurar variables de entorno (apuntar a DEV)
cp .env.example .env.local   # usado por Next.js (runtime)
cp .env.example .env         # usado por el Prisma CLI (migraciones)
# Editar ambos con los valores de DEV. Obtenerlos con:
#   vercel env pull --environment=preview .env.local
# y copiar DATABASE_URL/DIRECT_URL tambien a .env.
# NUNCA dejar .env apuntando a PROD (ver "seguridad de la DB" abajo).

# 4. Generar cliente Prisma
npx prisma generate

# 5. Correr migraciones (con guard anti-PROD)
npm run db:migrate

# 6. Cargar datos de prueba (seed)
npm run db:seed

# 7. Iniciar servidor de desarrollo
npm run dev
```

La aplicación queda disponible en http://localhost:3000.

Para la guía detallada (variables completas, Supabase, troubleshooting), ver **[docs/handover/GUIA_DESARROLLO.md](docs/handover/GUIA_DESARROLLO.md)**.

### Scripts disponibles

| Script | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo en localhost:3000 |
| `npm run build` | Build de producción (corre migraciones Prisma) |
| `npm run start` | Servidor de producción (requiere build previo) |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run test` | Tests unitarios con Vitest (una vez) |
| `npm run test:watch` | Tests unitarios en modo watch |
| `npm run test:e2e` | Tests E2E con Playwright |
| `npm run db:migrate` | `prisma migrate dev` con guard anti-PROD |
| `npm run db:push` | `prisma db push` con guard anti-PROD |
| `npm run db:reset` | `prisma migrate reset` con guard anti-PROD |
| `npm run db:check` | Verifica que `DATABASE_URL` no apunte a PROD |
| `npm run db:seed` | Cargar datos de prueba (bloquea PROD salvo `ALLOW_PROD_SEED=1`) |

> **Seguridad DB:** los scripts `db:*` bloquean si `DATABASE_URL` apunta a PROD. Para operar contra PROD deliberadamente: `ALLOW_PROD=1 npm run db:migrate` (o `ALLOW_PROD_SEED=1 npm run db:seed`). El `build` no lleva guard porque Vercel lo corre legítimamente contra PROD en el deploy de producción.
>
> ⚠️ **El reseed (`db:seed`/`db:reset`) BORRA todo DEV** (deleteMany de todas las tablas). DEV es solo para datos demo; hacer snapshot y coordinar antes. El contenido curado (cursos, imágenes demo) vive en el seed (`scripts/seed-*.ts`) para sobrevivir un reseed.

---

## Cómo se despliega

El despliegue es automático vía Vercel a partir de los pushes a las ramas:

| Rama | Ambiente | URL |
|---|---|---|
| `main` | Producción | https://plataformatextil.com.ar |
| `develop` | Development | https://dev.plataformatextil.com.ar |

Cada push a esas ramas dispara un build en Vercel que corre migraciones Prisma (`prisma migrate deploy`), genera el cliente y hace `next build`. Las pull requests generan **preview deploys** con URL única. Salud: `GET /api/health` (200 db:up / 503 db:down) y `GET /api/health/version` (SHA/env/ref).

Para detalles completos (DNS, Resend, variables, refs de Supabase), ver **[docs/handover/ARQUITECTURA_DEPLOY.md](docs/handover/ARQUITECTURA_DEPLOY.md)** y **[docs/handover/RUNBOOK_OPERATIVO.md](docs/handover/RUNBOOK_OPERATIVO.md)**.

---

## Estructura del repo

```
plataforma-textil/
├── src/                        # Código fuente de la app
│   ├── app/                    # App Router (páginas + API routes, por grupo de rol)
│   ├── compartido/             # Componentes y librerías compartidas
│   ├── lib/                    # Utilidades (auth, prisma, email, rag…)
│   └── __tests__/              # Tests unitarios con Vitest
│
├── prisma/                     # Schema + 42 migraciones + seed (reseed-safe)
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── scripts/                    # Scripts de seed, migración de piloto, ARCA, QA de datos
│   ├── seed-cursos.ts          # Cursos reales (reseed-safe)
│   ├── seed-evento-*.ts        # Imágenes demo (reseed-safe)
│   └── migracion-piloto/       # ⚠️ contiene PII real (ver AUDITORIA_HISTORIA_GIT.md)
│
├── tests/                      # Tests E2E con Playwright (tests/e2e + tests/fixtures)
│
├── tools/                      # Scripts auxiliares (generate-qa.js, perf-check.js…)
│
├── public/                     # Assets estáticos (fuentes, imágenes)
│
├── docs/                       # Documentación
│   ├── transferencia/          # ← Traspaso al nuevo equipo (empezá acá)
│   ├── handover/               # ← Paquete de handover v1.0 (checklist OIT a–j)
│   ├── legal/                  # PIA, términos, privacidad
│   ├── seguridad/              # HARDENING, cookies
│   ├── operacion/              # Manuales de operación y administración
│   ├── 01_estrategia…04_operacional/  # Documentación funcional y de planificación
│   └── auditoria/              # AS-IS, GAP, ROADMAP
│
├── .claude/                    # Specs (~140), auditorías QA, skills, hooks, bitácora
│   └── specs/                  # Especificaciones por versión (histórico de decisiones)
│
├── .github/workflows/          # GitHub Actions (test.yml, e2e.yml, qa-pages.yml)
│
├── CLAUDE.md                   # Instrucciones para Claude Code (asistente de IA)
├── LICENSE                     # Apache-2.0
└── README.md                   # Este archivo
```

> El árbol está en proceso de curaduría pre-transferencia. La clasificación de qué es vigente / histórico / descartable está en [INVENTARIO_LIMPIEZA.md](docs/transferencia/INVENTARIO_LIMPIEZA.md).

---

## Documentación

### Para recibir y operar el proyecto (empezá por acá)

- **[docs/transferencia/](docs/transferencia/)** — plan de traspaso + backlog + inventario + auditoría de historia.
- **[docs/handover/HANDOVER_PACKAGE.md](docs/handover/HANDOVER_PACKAGE.md)** — checklist OIT a–j de lo entregado.
- **[docs/handover/RUNBOOK_OPERATIVO.md](docs/handover/RUNBOOK_OPERATIVO.md)** — operación día a día, deploy IDs, escalamiento.
- **[docs/handover/GUIA_DESARROLLO.md](docs/handover/GUIA_DESARROLLO.md)** — setup detallado.
- **[docs/handover/BACKUP_RESTORE.md](docs/handover/BACKUP_RESTORE.md)** — backups y restauración.
- **[docs/handover/DEUDA_Y_ROADMAP.md](docs/handover/DEUDA_Y_ROADMAP.md)** — deuda técnica + roadmap.
- **[docs/handover/COBERTURA_TESTS.md](docs/handover/COBERTURA_TESTS.md)** — cobertura de tests.

### Legal y seguridad

- [docs/legal/PIA.md](docs/legal/PIA.md) — Privacy Impact Assessment.
- [docs/legal/POLITICA_DE_PRIVACIDAD.md](docs/legal/POLITICA_DE_PRIVACIDAD.md) · [docs/legal/TERMINOS_Y_CONDICIONES.md](docs/legal/TERMINOS_Y_CONDICIONES.md)
- [docs/seguridad/HARDENING.md](docs/seguridad/HARDENING.md) — endurecimiento y hallazgos.

### Operación

- [docs/operacion/MANUAL_OPERACION.md](docs/operacion/MANUAL_OPERACION.md) · [docs/operacion/MANUAL_ADMINISTRACION.md](docs/operacion/MANUAL_ADMINISTRACION.md)

### Funcional y técnica (referencia / histórico)

- Funcional: [`docs/02_funcional/`](docs/02_funcional/) (casos de uso, historias, pantallas).
- Técnica: [`docs/03_tecnico/`](docs/03_tecnico/) (arquitectura, API, schema, design system).
- Decisiones y specs ejecutadas: [`.claude/specs/`](.claude/specs/) (histórico de decisiones por versión).

---

## Cómo contribuir

La contribución está limitada al equipo responsable de la PDT.

1. **Reportar bugs:** abrí un [issue](https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/issues) con el template correspondiente.
2. **Proponer mejoras:** abrí un issue con la etiqueta `enhancement`.
3. **Forks y derivados:** la licencia Apache-2.0 permite fork y uso del código conservando la atribución y el aviso de licencia. Ver [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Licencia

El **código** se distribuye bajo **Apache-2.0** (ver [LICENSE](LICENSE)). La **documentación** se distribuye bajo **CC BY 4.0 IGO**.

**Copyright (c) 2026 Organización Internacional del Trabajo (OIT) y Universidad Nacional de Tres de Febrero (UNTREF).**

---

## Contacto

| Para qué | Contacto |
|---|---|
| Soporte técnico de la app | soporte@plataformatextil.com.ar |
| Consultas generales | contacto@plataformatextil.com.ar |
| Privacidad / datos | privacidad@plataformatextil.com.ar |
| Issues del repo | [GitHub Issues](https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/issues) |

---

## Créditos

**Desarrollado por UNTREF con el apoyo de la OIT.**

Este proyecto es resultado del trabajo conjunto de profesionales de distintas disciplinas (desarrollo, sociología, ciencias políticas, economía, contaduría, diseño UX/UI) coordinados a través de la Universidad Nacional de Tres de Febrero con el apoyo institucional y financiero de la Organización Internacional del Trabajo.
