# Documentación de la Plataforma Digital Textil

Esta carpeta contiene toda la documentación funcional, técnica y operativa del proyecto PDT.

La documentación está organizada por **tipo** y por **etapa del proyecto**. Cada subcarpeta tiene un foco específico.

---

## Cómo navegar esta carpeta

### Si querés entender QUÉ es la PDT

Empezá por:
- [`01_estrategia/01_CONTEXTO.md`](01_estrategia/01_CONTEXTO.md) — Contexto y propósito del proyecto
- [`02_funcional/HISTORIAS_USUARIO.md`](02_funcional/HISTORIAS_USUARIO.md) — Quién la usa y para qué
- [`02_funcional/02_FUNCIONES.md`](02_funcional/02_FUNCIONES.md) — Qué funciones tiene

### Si querés entender CÓMO está construida

Empezá por:
- [`03_tecnico/05_ARQUITECTURA.md`](03_tecnico/05_ARQUITECTURA.md) — Arquitectura del sistema
- [`03_tecnico/PLAN_SCHEMA.md`](03_tecnico/PLAN_SCHEMA.md) — Modelo de datos
- [`03_tecnico/API_CONTRACT.md`](03_tecnico/API_CONTRACT.md) — Endpoints disponibles

### Si querés entender CÓMO se trabaja en V4

Empezá por:
- [`Diseño/MASTER_V4.md.pdf`](Diseño/MASTER_V4.md.pdf) — Documento estratégico de planificación V4
- [`../.claude/METODOLOGIA_V4.md`](../.claude/METODOLOGIA_V4.md) — Método de trabajo vigente
- [`04_operacional/DECISIONES.md`](04_operacional/DECISIONES.md) — Decisiones tomadas

### Si querés operar el proyecto (deploy, setup, etc.)

Buscá en `.claude/specs/handover/` en la raíz del repo (fuera de `docs/`).

---

## Estructura de subcarpetas

### `01_estrategia/`

Documentación de contexto y propósito del proyecto. **Punto de entrada conceptual.**

- `01_CONTEXTO.md` — Marco del proyecto: por qué existe, alcance, audiencia

### `02_funcional/`

**Qué hace la plataforma**, desde la perspectiva del usuario y del producto.

- `02_FUNCIONES.md` — Catálogo de funciones del sistema
- `03_CASOS_USO.md` — Casos de uso detallados
- `07_COMUNICACION.md` — Estrategia de comunicación interna entre roles
- `HISTORIAS_USUARIO.md` — User stories por rol
- `MATRIZ_PANTALLAS_FUNCIONES.md` — Relación pantalla ↔ función
- `PANTALLAS_MVP.md` — Inventario de pantallas del MVP
- `PANTALLAS_ADICIONALES.md` — Pantallas fuera del MVP

### `03_tecnico/`

**Cómo está construida la plataforma**, desde la perspectiva del desarrollador.

- `05_ARQUITECTURA.md` — Arquitectura del sistema
- `06_INTEGRACIONES.md` — Integraciones externas (AFIP, Resend, Supabase, etc.)
- `08_PLAN_DESARROLLO_TECNICO.md` — Plan técnico general
- `API_CONTRACT.md` — Endpoints disponibles y contratos
- `DESIGN_SYSTEM.md` — Sistema de diseño y componentes
- `ESTRATEGIA_TESTING.md` — Política de tests (unitarios + E2E)
- `PLAN_SCHEMA.md` — Esquema de base de datos
- `componentes-ux.md` — Componentes UX/UI

### `04_operacional/`

**Cómo se trabaja en el proyecto**: hoja de ruta, decisiones, sprints.

- `04_HOJA_RUTA.md` — Roadmap general
- `CHECKLIST.md` — Checklist operativo
- `DECISIONES.md` — Registro consolidado de decisiones importantes
- `DISTRIBUCION_TRABAJO.md` — Distribución de tareas entre el equipo
- `GAPS_PANTALLAS.md` — Pantallas faltantes identificadas
- `SPRINT_2.md` — Documentación del sprint 2

### `auditoria/`

Análisis AS-IS / TO-BE del proyecto. Documentos de gap analysis y planificación de remediación.

- `AS_IS_MAP.md` — Estado actual del sistema
- `TO_BE_MAP.md` — Estado deseado
- `GAP_MATRIX.md` — Diferencia entre AS-IS y TO-BE
- `ROADMAP_REMEDIACION.md` — Plan para cerrar los gaps

### `seguridad/`

Configuraciones y políticas de seguridad.

- `cookies.md` — Configuración de cookies de autenticación

### `Diseño/`

Toda la propuesta visual V4 desarrollada por el equipo de diseño: tokens, componentes, mockups, assets.

- `MASTER_V4.md.pdf` — Documento estratégico V4 (versión actual)
- `propuesta-visual-pdt-v4/` — Propuesta visual completa de V4
  - `propuesta-final/` — 7 documentos finales (tokens, componentes, header, layout, etc.)
  - `mockup/` — Mockups HTML interactivos navegables
  - `notas/` — Notas de investigación previa (análisis, benchmarking, decisiones)
  - `screenshots/produccion/` — Capturas del estado actual de V3
  - `imagenes/` — Assets generados por IA (logo, hero, cards)
  - `benchmark/` — Referencias visuales externas

### `Otros/`

Documentos misceláneos que no encajan en las otras categorías.

- `Documentacion/` — PDFs descriptivos de los 3 roles (TALLER, MARCA, ESTADO) + certificado SSL
- `ILO_ISRA_Template.xlsx` — Template institucional de OIT
- `issues-abiertos-v4.md` — Lista de issues abiertos pendientes para V4

---

## Documentos en la raíz de `/docs/`

Además de las subcarpetas, hay algunos archivos sueltos en la raíz:

- `v4-input-institucional.md` — Input institucional consolidado para V4

---

## Documentación que NO está en esta carpeta

Algunos documentos importantes viven fuera de `/docs/` por razones técnicas:

| Tipo | Ubicación | Por qué |
|---|---|---|
| Specs de implementación | `.claude/specs/` | Convención del proyecto desde V1 |
| QAs de auditoría | `.claude/auditorias/` | Convención del proyecto |
| Documentación de handover | `.claude/specs/handover/` | Para retomar el proyecto |
| Metodología V4 vigente | `.claude/METODOLOGIA_V4.md` | Método activo del equipo |
| Templates de spec/QA V4 | `.claude/specs/TEMPLATE_SPEC_V4.md` y `.claude/auditorias/TEMPLATE_QA_V4.md` | Plantillas técnicas |
| Instrucciones para Claude Code | `CLAUDE.md` (raíz del repo) | Convención del asistente IA |

---

## Cómo agregar nuevos documentos

Si vas a agregar un documento nuevo:

1. **Si es funcional o de producto:** va a `02_funcional/`
2. **Si es técnico (arquitectura, API, código):** va a `03_tecnico/`
3. **Si es operativo (decisión, sprint, hoja de ruta):** va a `04_operacional/`
4. **Si es de auditoría (gap analysis, AS-IS, TO-BE):** va a `auditoria/`
5. **Si es de seguridad:** va a `seguridad/`
6. **Si es de diseño visual:** va a `Diseño/`
7. **Si no encaja en ninguna:** va a `Otros/`

Actualizá este README cuando agregues categorías nuevas o documentos importantes.

---

## Convenciones de nomenclatura

- Carpetas numeradas (`01_`, `02_`, etc.) son **fundacionales** del proyecto, no se renombran
- Archivos numerados (`01_`, `02_`, etc.) son **lectura secuencial recomendada** dentro de su carpeta
- Archivos en MAYÚSCULAS son **documentos importantes** (decisiones, schema, contratos)
- Archivos en minúsculas son **documentos de trabajo o referencia**

---

## Cómo encontrar algo específico

Si buscás algo y no sabés dónde está:

- **Una función específica:** `02_funcional/MATRIZ_PANTALLAS_FUNCIONES.md`
- **Un endpoint:** `03_tecnico/API_CONTRACT.md`
- **Un modelo de datos:** `03_tecnico/PLAN_SCHEMA.md`
- **Una decisión de producto:** `04_operacional/DECISIONES.md`
- **Un componente visual:** `Diseño/propuesta-visual-pdt-v4/propuesta-final/03-componentes.md`
- **El plan V4:** `Diseño/MASTER_V4.md.pdf`
- **El método de trabajo V4:** `../.claude/METODOLOGIA_V4.md`

---

**Última actualización:** Mayo 2026

Si encontrás algo desactualizado o un documento que ya no aplica, abrí un [issue](https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/issues) o avisá al equipo.
