# Cómo contribuir a la PDT

Guía de contribución para el equipo de desarrollo de la **Plataforma Digital Textil (PDT)**, iniciativa de la OIT y la UNTREF (repo `pdt`, org GitHub `Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil`).

Este documento describe el flujo real de trabajo del proyecto: cómo se construye una funcionalidad, qué convenciones seguir, cómo nombrar commits y ramas, y qué tiene que estar verde antes de mergear. No inventa procesos: refleja cómo se trabaja hoy.

Para levantar el entorno local ver [docs/handover/GUIA_DESARROLLO.md](docs/handover/GUIA_DESARROLLO.md).

---

## 1. Cómo contribuir: el flujo spec → implementación

La PDT no se trabaja por "tareas sueltas". Toda funcionalidad nace de un **spec** escrito antes de tocar código.

1. **El spec lo escribe Gerardo (tech lead).** Los specs viven en `.claude/specs/` con nombre descriptivo (por ejemplo `semana1-registro-cuit.md`). Cada spec prescribe qué archivos crear o modificar, qué patrón usar (server component vs. server action vs. API route), qué librerías usar, cómo manejar errores y cómo integrarse con el código existente. También define casos borde, criterio de aceptación y qué tests correr.
2. **Quien implementa lee el spec completo antes de abrir el editor.** Si algo no está claro, se pregunta a Gerardo antes de arrancar. No se toman decisiones de arquitectura que no estén en el spec: ante la duda, se pregunta, no se improvisa.
3. **No se toca el schema de Prisma sin Gerardo.** El `prisma/schema.prisma` y las migraciones son responsabilidad exclusiva del tech lead. Si una funcionalidad necesita cambios de datos, eso se resuelve en el spec, no sobre la marcha.
4. **El PR no se abre hasta que se cumplen todos los criterios de aceptación** del spec, incluidos los tests.

La estructura obligatoria de cada spec y el detalle de las reglas están en [CLAUDE.md](CLAUDE.md), sección "SPECS — Estructura y reglas".

---

## 2. Setup del entorno

Resumen mínimo (la guía completa está en [docs/handover/GUIA_DESARROLLO.md](docs/handover/GUIA_DESARROLLO.md)):

```bash
git clone https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil.git
cd plataforma-textil
npm install
vercel env pull --environment=preview .env.local   # trae todas las vars (apunta a DEV)
# configurar .env con DATABASE_URL y DIRECT_URL de DEV (lo lee el Prisma CLI)
npx prisma generate
npm run dev
```

La app queda en http://localhost:3000. **Nunca dejar `.env` apuntando a PROD** (ver la sección de base de datos de la guía de desarrollo y los guards anti-PROD más abajo).

---

## 3. Convenciones de código

- **Server components por defecto.** Usar `'use client'` sólo cuando es necesario (estado local, eventos, hooks de browser).
- **Filtros con `searchParams`** + form `method="get"` + `where` dinámico de Prisma. No inventar patrones de filtrado nuevos.
- **Auth en dos archivos:** `src/lib/auth.config.ts` (ligero, corre en Edge, lo usa el middleware) y `src/lib/auth.ts` (completo, server-side). No mezclar Prisma en la config de Edge (excede el límite de 1MB).
- **UI:** fuente `font-overpass`, colores `brand-blue` / `brand-red`, componentes de `src/components/ui/` y `Badge` con variantes. Tailwind v4 con config CSS nativa.
- **Sin emojis en el código**, salvo mock data ya existente. Sin emojis en headings de docs.
- **Imports con alias:** el código compartido se importa desde `@/compartido/...` (por ejemplo `@/compartido/componentes/ui/toast`, `@/compartido/componentes/ui/breadcrumbs`). Utilidades core en `@/lib/...`.
- **TypeScript** en todo el código. Correr `npm run lint` (ESLint 9, config Next.js) antes de abrir el PR.

---

## 4. Convención de commits

El proyecto usa **Conventional Commits** en español, con el número de PR entre paréntesis al final. Patrón real deducido del historial:

```
<tipo>[(scope)]: <descripción breve en minúscula> (#<PR>)
```

Tipos en uso:

| Tipo | Para qué | Ejemplo real |
|---|---|---|
| `feat:` | Funcionalidad nueva | `feat: circuito CUIT Piezas A+B — corrección de CUIT + reverificación (PR-2) (#453)` |
| `fix:` | Corrección de bug | `fix: circuito CUIT PR-3 — normalización de formato de CUIT (#454)` |
| `docs:` | Documentación / marcar spec HECHO | `docs(spec): circuito CUIT COMPLETO — PR-2 (A+B) HECHO (#453)` |
| `chore:` | Mantenimiento, tooling | tareas de infraestructura sin efecto funcional |

Notas del estilo real:
- El scope es opcional y va entre paréntesis: `docs(spec)`, `docs(etapa2-3)`, `fix(...)`.
- La descripción va en minúscula, puede usar `—` para separar contexto.
- Los commits automáticos de bitácora usan el prefijo `daily:` (por ejemplo `daily: 2026-07-11`); los genera el hook, no se escriben a mano.

---

## 5. Flujo de ramas y PRs

Modelo de ramas:

| Rama | Rol | Deploy |
|---|---|---|
| `main` | Producción | Auto-deploy a https://plataformatextil.com.ar |
| `develop` | Integración / preview | Auto-deploy a preview |

Flujo:

1. **Feature branch desde `develop`.** Verificar si la rama ya existe en el remoto antes de crearla; no crear ramas con `-b` a ciegas.
2. **Implementar según el spec.** Los **tests son parte del entregable**, no opcionales: cada spec define qué flujos testear con Vitest (unit) y/o Playwright (e2e). Sin tests, el PR no está terminado.
3. **Abrir PR contra `develop`.** El PR dispara los workflows de CI:
   - `test.yml` — unit tests de Vitest (`src/__tests__/`). Hoy corre en modo informativo (reporta verde/rojo, no bloquea todavía).
   - `e2e.yml` — Playwright contra el preview deploy de Vercel (`tests/e2e/`). Espera a que el deploy esté listo, calienta funciones serverless y corre la suite.
4. **CI en verde obligatorio.** No se mergea con CI roja.
5. **QA de Sergio antes del merge.** La revisión funcional es parte del gate: no se mergea sin el QA correspondiente.
6. **Merge con squash.** El historial de `develop` se mantiene con un commit por PR (rebase + squash). Ver el workflow de merge en las notas del proyecto.

> Los QA interactivos se publican automáticamente en GitHub Pages cuando se toca `.claude/auditorias/QA_v2-*.md`. URL pública: https://grupo-de-investigacion-y-desarollo-gids.github.io/plataforma-textil/

---

## 6. Checklist obligatoria — páginas nuevas

Antes de mergear cualquier página nueva, verificar (idéntico a [CLAUDE.md](CLAUDE.md)):

1. **Layout correcto:** la página está en el grupo de layout que corresponde.
   - Páginas de un solo rol → `(admin)/`, `(taller)/`, `(marca)/`, `(estado)/`
   - Páginas accesibles por múltiples roles → `(public)/` (layout condicional: Header global si logueado, header mínimo si anónimo)
   - Páginas de auth → `(auth)/`
2. **Breadcrumbs:** las sub-páginas de detalle usan `<Breadcrumbs>` de `@/compartido/componentes/ui/breadcrumbs` (NO un `<Link>← Volver</Link>` manual).
3. **Toast V3:** el feedback de acciones usa `useToast` de `@/compartido/componentes/ui/toast` (NO `alert()`).
4. **EmptyState:** los listados que pueden estar vacíos usan `<EmptyState>` de `@/compartido/componentes/ui/empty-state`.
5. **Loading / Skeleton:** las páginas con data async tienen `loading.tsx` o un skeleton inline del sistema.
6. **Verificación visual:** confirmar que el sidebar y el header están presentes según el contexto del rol.

---

## 7. Reporte de issues

- **Bugs y mejoras:** abrir un [issue en GitHub](https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/issues). Para mejoras usar la etiqueta `enhancement`.
- **Decisiones técnicas importantes, cambios de infraestructura o funcionalidad completada:** documentar en `.claude/specs/handover/`. Gerardo mantiene esa documentación; no se espera al final del proyecto para completarla.
- **Contacto:** soporte técnico en soporte@plataformatextil.com.ar, consultas generales en contacto@plataformatextil.com.ar.

---

_Desarrollado por UNTREF con el apoyo de la OIT. Distribuido bajo licencia MIT._
