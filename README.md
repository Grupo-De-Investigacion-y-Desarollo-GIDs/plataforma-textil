# Plataforma Digital Textil

**Donde se encuentran talleres y marcas para producir formalmente.**

_Desarrollado por UNTREF con el apoyo de la OIT._

![Stack](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC) ![License](https://img.shields.io/badge/License-MIT-green) ![Status](https://img.shields.io/badge/Status-V3%20cerrado%20%E2%80%A2%20V4%20en%20curso-orange)

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
| **Versión actual** | V3 (cerrada en mayo 2026) |
| **Próxima versión** | V4 (en planificación, ~440h estimadas) |
| **Despliegue producción** | https://plataformatextil.com.ar |
| **Despliegue desarrollo** | https://dev.plataformatextil.com.ar |
| **Licencia** | MIT (ver [LICENSE](LICENSE)) |
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

---

## Stack tecnológico

| Categoría | Tecnología |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, React Compiler activado) |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI** | [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/) (config CSS nativa) |
| **Iconos** | [Lucide React](https://lucide.dev/) |
| **Base de datos** | [PostgreSQL](https://www.postgresql.org/) en [Supabase](https://supabase.com/) (región sa-east-1) |
| **ORM** | [Prisma 6](https://www.prisma.io/) |
| **Autenticación** | [NextAuth v5](https://authjs.dev/) (magic links + Google OAuth) |
| **Storage** | [Supabase Storage](https://supabase.com/storage) (multi-bucket) |
| **Email** | [Resend](https://resend.com/) (transaccional, dominio propio verificado) |
| **DNS y forwarding** | [Cloudflare](https://cloudflare.com/) (DNS + Email Routing) |
| **Verificación CUIT** | [AfipSDK](https://afipsdk.com/) (integración con ARCA) |
| **Asistente IA (RAG)** | [Claude API](https://www.anthropic.com/) + [Voyage AI](https://www.voyageai.com/) (embeddings 512 dim) + Supabase pgvector |
| **PDF** | [@react-pdf/renderer](https://react-pdf.org/) (certificados, órdenes de manufactura) |
| **QR** | [qrcode](https://www.npmjs.com/package/qrcode) |
| **Gráficos** | [Recharts](https://recharts.org/) |
| **Formularios** | [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Excel** | [ExcelJS](https://github.com/exceljs/exceljs) (exportes ESTADO) |
| **Rate limiting** | [Upstash Redis](https://upstash.com/) + [@upstash/ratelimit](https://github.com/upstash/ratelimit) |
| **Tests unitarios** | [Vitest 4](https://vitest.dev/) (33 tests) |
| **Tests E2E** | [Playwright](https://playwright.dev/) (24 tests V3 + 16 legacy) |
| **Lint** | [ESLint 9](https://eslint.org/) (config Next.js) |
| **Hosting** | [Vercel](https://vercel.com/) (CI/CD automático desde GitHub) |
| **Registrador del dominio** | [NIC.ar](https://nic.ar/) |
| **Analytics** | [@vercel/analytics](https://vercel.com/docs/analytics) + [@vercel/speed-insights](https://vercel.com/docs/speed-insights) |

---

## Cómo correr el proyecto localmente

### Requisitos previos

- Node.js 20 o superior
- npm 10 o superior
- PostgreSQL local o acceso a Supabase
- Variables de entorno configuradas (ver `.env.example`)

### Instalación rápida

```bash
# 1. Clonar repo
git clone https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil.git
cd plataforma-textil

# 2. Instalar dependencias
npm install

# 3. Copiar y configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con los valores correspondientes

# 4. Generar cliente Prisma
npx prisma generate

# 5. Correr migraciones
npx prisma migrate dev

# 6. Cargar datos de prueba (seed)
npm run db:seed

# 7. Iniciar servidor de desarrollo
npm run dev
```

La aplicación queda disponible en http://localhost:3000.

Para instrucciones detalladas (variables de entorno completas, configuración de Supabase, troubleshooting), ver [.claude/specs/handover/SETUP.md](.claude/specs/handover/SETUP.md).

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
| `npm run test:e2e:ui` | Tests E2E con interfaz visual de Playwright |
| `npm run test:e2e:headed` | Tests E2E con browser visible |
| `npm run db:seed` | Cargar datos de prueba en la base |

---

## Cómo se despliega

El despliegue es automático vía Vercel a partir de los pushes a las ramas:

| Rama | Ambiente | URL |
|---|---|---|
| `main` | Producción | https://plataformatextil.com.ar |
| `develop` | Development | https://dev.plataformatextil.com.ar |

Cada push a esas ramas dispara un build en Vercel que:

1. Corre migraciones Prisma (`prisma migrate deploy`)
2. Genera el cliente Prisma (`prisma generate`)
3. Hace build de Next.js (`next build`)
4. Despliega a la URL correspondiente

Las pull requests generan **preview deploys** con URL única para revisión.

Para detalles completos de configuración (DNS, Resend, variables, Cloudflare, etc.), ver [.claude/specs/handover/DEPLOY.md](.claude/specs/handover/DEPLOY.md).

---

## Estructura del repo

```
plataforma-textil/
├── .claude/                    # Specs, QAs y herramientas de desarrollo
│   ├── specs/                  # Especificaciones funcionales por versión (v1, v2, v3, v4)
│   ├── auditorias/             # QAs de auditoría con HTML público
│   └── METODOLOGIA_V4.md       # Método de trabajo vigente para V4
│
├── .github/workflows/          # GitHub Actions (CI/CD)
│   ├── e2e.yml                 # Tests E2E con Playwright
│   └── qa-pages.yml            # Publicación automática de QAs en GitHub Pages
│
├── docs/                       # Documentación funcional y técnica
│   ├── 01_estrategia/          # Contexto y estrategia
│   ├── 02_funcional/           # Casos de uso, historias de usuario, pantallas
│   ├── 03_tecnico/             # Arquitectura, API, schema, design system
│   ├── 04_operacional/         # Hoja de ruta, decisiones, sprints
│   ├── Diseño/                 # Propuesta visual V4, mockups, assets
│   └── auditoria/              # AS-IS, GAP, ROADMAP
│
├── prisma/                     # Schema y migraciones de PostgreSQL
│   ├── schema.prisma
│   └── migrations/             # 28 migraciones (feb 2026 → may 2026)
│
├── public/                     # Assets estáticos (fuentes, imágenes)
│
├── src/                        # Código fuente de la app
│   ├── app/                    # App Router de Next.js (páginas + API routes)
│   ├── compartido/             # Componentes y librerías compartidas
│   ├── lib/                    # Utilidades (auth, prisma, email, rag, etc.)
│   └── __tests__/              # Tests unitarios con Vitest
│
├── tests/                      # Tests E2E con Playwright
│   ├── e2e/                    # Tests V3 (24 archivos)
│   └── fixtures/               # Fixtures compartidos
│
├── tools/                      # Scripts auxiliares
│   └── generate-qa.js          # Generador de QAs interactivos en HTML
│
├── CLAUDE.md                   # Instrucciones para Claude Code (asistente de IA)
├── LICENSE                     # Licencia MIT
└── README.md                   # Este archivo
```

---

## Documentación

### Documentación funcional (qué hace la PDT)

- [Contexto del proyecto](docs/01_estrategia/01_CONTEXTO.md)
- [Funciones](docs/02_funcional/02_FUNCIONES.md)
- [Casos de uso](docs/02_funcional/03_CASOS_USO.md)
- [Historias de usuario](docs/02_funcional/HISTORIAS_USUARIO.md)
- [Pantallas MVP](docs/02_funcional/PANTALLAS_MVP.md)
- [Matriz pantallas-funciones](docs/02_funcional/MATRIZ_PANTALLAS_FUNCIONES.md)

### Documentación técnica (cómo está construida)

- [Arquitectura](docs/03_tecnico/05_ARQUITECTURA.md)
- [Plan de schema](docs/03_tecnico/PLAN_SCHEMA.md)
- [Contrato de API](docs/03_tecnico/API_CONTRACT.md)
- [Sistema de diseño](docs/03_tecnico/DESIGN_SYSTEM.md)
- [Estrategia de testing](docs/03_tecnico/ESTRATEGIA_TESTING.md)
- [Integraciones](docs/03_tecnico/06_INTEGRACIONES.md)

### Documentación operativa (cómo se trabaja en V4)

- [Master V4](docs/Diseño/MASTER_V4.md.pdf) — Documento estratégico de planificación
- [Metodología V4](.claude/METODOLOGIA_V4.md) — Método vigente para el desarrollo
- [Plantilla de spec V4](.claude/specs/TEMPLATE_SPEC_V4.md)
- [Plantilla de QA V4](.claude/auditorias/TEMPLATE_QA_V4.md)
- [Decisiones tomadas](docs/04_operacional/DECISIONES.md)
- [Hoja de ruta](docs/04_operacional/04_HOJA_RUTA.md)

### Documentación de handover (para retomar el proyecto)

Para que otros equipos puedan tomar el proyecto y operarlo, hay una serie de documentos en `.claude/specs/handover/`:

- `SETUP.md` — Instalación detallada paso a paso
- `DEPLOY.md` — Configuración de producción (Vercel, Supabase, Resend, Cloudflare, NIC.ar)
- `ARCHITECTURE.md` — Arquitectura del sistema en profundidad
- `DECISIONS.md` — Registro consolidado de decisiones importantes
- `KNOWN_ISSUES.md` — Bugs conocidos y workarounds
- `ROLES.md` — Definición de roles y permisos
- `API.md` — Endpoints públicos e internos
- `HOW_TO_ADD_SPEC.md` — Cómo crear un spec nuevo siguiendo la metodología V4
- `HOW_TO_RUN_QA.md` — Cómo correr una auditoría QA
- `CONTRIBUTING.md` — Cómo contribuir al proyecto

> **Nota:** Algunos documentos de handover se completan progresivamente durante el desarrollo de V4. Si encontrás un documento faltante o desactualizado, abrí un issue o contactanos.

---

## Cómo contribuir

Por ahora la contribución externa está limitada al equipo de desarrollo PDT. Si querés colaborar:

1. **Reportar bugs:** abrí un [issue](https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/issues) con el template correspondiente.
2. **Proponer mejoras:** abrí un issue con la etiqueta `enhancement`.
3. **Forks y derivados:** la licencia MIT permite fork y uso del código. Si tu organización quiere usar la PDT como base, contactanos para coordinar.

Para contribuciones internas del equipo PDT, ver `.claude/specs/handover/CONTRIBUTING.md` (en preparación).

---

## Licencia

Este proyecto se distribuye bajo licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

**Copyright (c) 2026 Organización Internacional del Trabajo (OIT) y Universidad Nacional de Tres de Febrero (UNTREF).**

---

## Contacto

| Para qué | Contacto |
|---|---|
| Soporte técnico de la app | soporte@plataformatextil.com.ar |
| Consultas generales | contacto@plataformatextil.com.ar |
| Issues del repo | [GitHub Issues](https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/issues) |

---

## Créditos

**Desarrollado por UNTREF con el apoyo de la OIT.**

Este proyecto es resultado del trabajo conjunto de profesionales de distintas disciplinas (desarrollo, sociología, ciencias políticas, economía, contaduría, diseño UX/UI) coordinados a través de la Universidad Nacional de Tres de Febrero con el apoyo institucional y financiero de la Organización Internacional del Trabajo.

