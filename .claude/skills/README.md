# Skills V4 — PDT

Sistema de skills para guiar a Claude Code al implementar y debuggear specs de V4 sin repetir bugs ya solucionados.

## Qué son los skills

Los skills son archivos `SKILL.md` con instrucciones específicas que Claude Code lee automáticamente cuando detecta una tarea relevante. Cada skill tiene:

- **Frontmatter** con `name`, `description`, y `trigger`
- **Contenido** con reglas, patrones, y bugs históricos a evitar

## Cómo Claude Code los usa

1. Al arrancar una tarea, Claude Code escanea `.claude/skills/`
2. Identifica qué skills aplican según el `trigger` del frontmatter
3. Carga el contenido del/los skill(s) relevante(s)
4. Aplica las reglas durante la implementación

## Skills disponibles

### `playwright-e2e/SKILL.md`

Patrones para tests E2E con Playwright en Next.js 16 + React 19 + NextAuth v5.

**Cuándo se activa:**
- Modificación de tests en `tests/e2e/`
- Flakies con "strict mode violation" o timeouts de auth
- Modificación de `auth.setup.ts` o `_helpers/auth.ts`

**Cubre:**
- Locators seguros para streaming SSR (scoperar a `<main>`)
- Auth setup con `storageState` (no login por test)
- Por qué evitar `page.request.post()` para auth de NextAuth
- Server Components pesados y client-side router
- Credenciales del seed del proyecto

### `vercel-nextauth/SKILL.md`

Configuración correcta de Vercel + NextAuth v5.

**Cuándo se activa:**
- Modificación de variables de entorno en Vercel
- Problemas de redirect cross-domain
- Modificación de `src/auth.ts`, `src/auth.config.ts`, `email.ts`

**Cubre:**
- Variables Preview sin `gitBranch` específico
- NEXTAUTH_URL solo en Production
- Fallback a VERCEL_URL en código
- Rate limiting y bypass para CI
- Cookies `__Host-`/`__Secure-` en NextAuth

### `github-workflows/SKILL.md`

Patrones para workflows GitHub Actions.

**Cuándo se activa:**
- Modificación de `.github/workflows/*.yml`
- Problemas con CI que solo aparecen en PRs
- Detección de archivos por pattern (V2/V3/V4)

**Cubre:**
- curl con `-d` NO necesita `-X POST` (rompe redirects)
- Preview URL en PRs via GitHub Deployments API
- Path filters al introducir nueva versión
- Warmup programático con login real

### `spec-v4-implementation/SKILL.md`

Checklist y guía para implementar specs V4.

**Cuándo se activa:**
- Implementación de specs V4
- Creación de branch `feature/v4-[id]-[slug]`
- Modificación de archivos críticos compartidos
- Cambios destructivos en producción/dev

**Cubre:**
- Verificaciones previas antes de tocar globals.css, schema, middleware
- Transacciones atómicas para borrados destructivos
- Estructura de PRs (commits, body, criterios merge)
- Self-hosting de fuentes
- Validación interdisciplinaria
- Workflow de QA después del spec

### `debugging-methodology/SKILL.md`

Metodología para investigar bugs sin caer en trial-and-error.

**Cuándo se activa:**
- Tests E2E fallando sin causa clara
- PR con 2+ intentos de fix sin progreso
- Fallos "que parecen flaky"
- Logs contradictorios o confusos

**Cubre:**
- Investigar antes de adivinar
- Jerarquía de hipótesis (de simple a complejo)
- Cuándo parar y replantear
- Cómo reportar honestamente
- Por qué "pasa en retry" NO es "funciona"
- Plantillas de "stop and investigate"

## Cuándo se generaron

2026-05-15, después de las lecciones de PR #310, #312, #314, #315, #316, #317, #318.

## Cómo mantener actualizados estos skills

Cuando aparezca un bug nuevo recurrente:

1. Identificar el patrón (no el caso específico)
2. Agregar la regla al skill correspondiente
3. Documentar el bug histórico que la generó
4. Si es un patrón nuevo que no encaja en ningún skill: crear uno nuevo

## Bugs históricos referenciados

| PR | Bug | Skill que lo previene |
|---|---|---|
| #310 | Variables Vercel `gitBranch=develop` | vercel-nextauth |
| #312 | Cross-domain redirect (NEXTAUTH_URL) | vercel-nextauth |
| #312 | curl `-X POST` causando 405 | github-workflows |
| #312 | Detección preview URL en PRs | github-workflows |
| #312 | Warmup anónimo no calentaba functions | github-workflows |
| #312 | `/unauthorized` no era ruta pública | spec-v4-implementation |
| #314 | Tokens visuales removidos en uso | spec-v4-implementation |
| #314 | Animaciones eliminadas del CSS | spec-v4-implementation |
| #315 | qa-pages no detectaba `QA_v4-*` | github-workflows |
| #316 | Breadcrumb strict mode violation | playwright-e2e |
| #317 | Cache file-validation cross-instance | (bug producto, no skill) |
| #318 | Secret `TEST_ESTADO_*` con valor incorrecto | debugging-methodology |
| #318 | `page.request.post()` con cookies `__Host-` | playwright-e2e |
| #318 | h1, "Talleres", "Exportar CSV" duplicados (SSR) | playwright-e2e |
| #318 | URL API `/api/estado/demanda-insatisfecha/exportar` inexistente | playwright-e2e |
| #318 | Falta tilde en assertion | playwright-e2e |

## Cómo aplicar al repo

Crear directorio en el repo:

```bash
mkdir -p .claude/skills/playwright-e2e
mkdir -p .claude/skills/vercel-nextauth
mkdir -p .claude/skills/github-workflows
mkdir -p .claude/skills/spec-v4-implementation
mkdir -p .claude/skills/debugging-methodology
```

Copiar los SKILL.md correspondientes.

Crear PR `chore/skills-v4-infrastructure` con el commit:

```
chore(skills): infraestructura de skills V4

Captura aprendizajes de PR #310 a #318 en sistema de skills modular.
Claude Code va a cargar estos skills automáticamente según el contexto
de la tarea (modificar tests E2E, configurar Vercel, debuggear, etc.).

Objetivo: evitar repetir bugs ya solucionados en los 32 specs restantes
de V4.

Skills:
- playwright-e2e: locators seguros, storageState, evitar page.request.post
- vercel-nextauth: variables sin gitBranch, NEXTAUTH_URL solo en prod
- github-workflows: curl correcto, preview URL en PRs, path filters
- spec-v4-implementation: checklist pre-implementación, transacciones atómicas
- debugging-methodology: investigar antes de adivinar, parar a los 3 intentos

Ver .claude/skills/README.md para detalles.
```
