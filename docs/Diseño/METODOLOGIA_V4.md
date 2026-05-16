# Metodología V4 — Plataforma Digital Textil (PDT)

**Versión:** 1.0
**Fecha:** Mayo 2026
**Autor:** Gerardo Breard (decisiones) + Claude (consolidación)
**Estado:** Vigente para todos los specs V4
**Reemplaza:** Metodología informal usada en V2 y V3

---

## Por qué esta metodología existe

V2 y V3 funcionaron con una metodología informal heredada de las primeras semanas del proyecto. Funcionó pero dejó problemas:

1. **Validación interdisciplinaria llegaba tarde.** El Eje 6 (politólogo, sociólogo, economista, contador) opinaba al FINAL del QA. Cuando identificaba un problema conceptual, el código ya estaba escrito. Ejemplo: "género debería ser eje transversal" llegó cuando el módulo de observaciones ya estaba implementado.

2. **QAs demasiado atomizados.** 30-40 items técnicos por spec. Auditoría Fase 2 encontró 22 bugs que pasaron QA V3 porque los tests eran demasiado granulares — se perdían el "bosque" del flujo de usuario.

3. **Validación sectorial no planificada.** Talleres y marcas reales validaban solo si surgía el tema, no como parte del ciclo.

4. **Handover inexistente.** El proyecto debe ser replicable por otros equipos (OIT lo distribuye con licencia open source) pero la carpeta `.claude/specs/handover/` solo tiene un README vacío.

5. **Dependencias entre specs implícitas.** No quedaba claro qué spec debía estar mergeado antes que otro.

La metodología V4 corrige estas 5 cosas manteniendo lo que funcionó.

---

## Principios rectores

Cinco principios que rigen toda decisión metodológica en V4:

### 1. Análisis funcional ANTES de codear

Antes de cualquier línea de código, el spec responde:
- ¿Quién es el usuario afectado?
- ¿Qué hace en su día a día?
- ¿Qué procesos toca?
- ¿Cómo se conecta con otros roles?

### 2. Validación interdisciplinaria desde el spec, no al final del QA

Las 5 perspectivas relevantes (politólogo, sociólogo, economista, contador, sectorial) se documentan en el spec antes de implementar, no en el QA después.

### 3. Specs orientados a flujos completos, no checklists técnicos atomizados

Tanto en la sección "Qué construir" como en "Tests", el foco es el flujo de usuario end-to-end. Los detalles técnicos quedan subordinados al flujo, no al revés.

### 4. Handover continuo, no diferido

Cada spec actualiza los documentos de handover relevantes. No se acumula deuda documental.

### 5. Categoría de release explícita

Cada spec declara si es MVP no negociable / Deseable / Espera. Si OIT pide salir antes de terminar V4, sabemos qué entra y qué no.

---

## Sistema dual: Spec + QA

Cada feature V4 produce **dos artefactos**:

| Artefacto | Cuándo se escribe | Quién lo escribe | Para qué |
|---|---|---|---|
| **Spec V4** | ANTES de implementar | Gerardo | Definir qué construir y cómo validarlo |
| **QA V4** | DESPUÉS de implementar | Gerardo o Claude Code | Verificar que la implementación cumple el spec |

Los dos son complementarios:

- El spec tiene **flujos esperados** (5-10 items en sección 10) que describen QUÉ debería verificar el QA.
- El QA ejecuta esos flujos y reporta resultados (aprobado / con bugs / fallido).

El QA puede encontrar cosas no previstas en el spec → se documenta como issue y se itera.

---

## Ubicaciones y convenciones de nombres

| Carpeta | Contenido | Convención |
|---|---|---|
| `.claude/specs/` | Specs V4 | `v4-[id]-[slug].md` (ej: `v4-x-01-tokens.md`) |
| `.claude/auditorias/` | QAs V4 | `QA_v4-[id]-[slug].md` (ej: `QA_v4-x-01-tokens.md`) |
| `.claude/specs/handover/` | Documentos de handover | Nombres descriptivos (DEPLOY.md, ARCHITECTURE.md, etc.) |
| `tools/generate-qa.js` | Generador HTML de QAs | Sin cambios (ya soporta múltiples versiones) |
| `.github/workflows/qa-pages.yml` | Workflow GitHub Pages | Actualizar para incluir `QA_v4-*.md` al primer QA V4 |

**REVIEWs separados (`REVIEW_v3-*.md`):** se eliminan en V4. La revisión técnica interna se hace como comentarios en el PR de GitHub, no como archivo separado.

---

## La plantilla del Spec V4 — 12 secciones

Cada spec V4 tiene **12 secciones obligatorias**. Si una sección no aplica al spec específico, se marca como "N/A" con razón breve.

| # | Sección | Para qué |
|---|---|---|
| 1 | Metadata | Información estructurada del spec (14 campos) |
| 2 | Contexto | Por qué existe el spec, qué problema resuelve |
| 3 | Validación interdisciplinaria | Documentación de las perspectivas relevantes |
| 4 | Qué construir | Descripción funcional |
| 5 | Datos (schema, modelos, queries) | Estructura técnica de datos |
| 6 | Prescripciones técnicas | Decisiones técnicas obligatorias |
| 7 | Edge cases | Casos límite a considerar |
| 8 | Validación sectorial | Si aplica testing con usuarios reales |
| 9 | Criterios de aceptación | Lista chequeable para considerar terminado |
| 10 | Tests (QAs basados en flujos) | 5-10 flujos esperados |
| 11 | Impacto en handover | Qué documentos del handover actualizar |
| 12 | Riesgos y mitigaciones | Qué puede salir mal y cómo se mitiga |

La plantilla completa está en `TEMPLATE_SPEC_V4.md`.

---

## Detalle de cada sección

### Sección 1 — Metadata

Información estructurada al principio del spec. 14 campos:

| # | Campo | Valores posibles |
|---|---|---|
| 1 | Tipo | refactor visual / refactor funcional / feature nueva / bug fix / análisis |
| 2 | Bloque | X / U / W-A / W-B / K / Q / R / S / G / etc. |
| 3 | Categoría | MVP no negociable / Deseable / Espera |
| 4 | Estimación | en horas (ej: "3h") |
| 5 | Riesgo | Bajo / Medio / Alto |
| 6 | Dependencias | Spec X / Ninguna |
| 7 | Branch | `feature/v4-[id]-[slug]` |
| 8 | Validación sectorial | "N/A — Diferida a validación grupal post-MVP V4" en casi todos |
| 9 | Perspectivas relevantes | lista de las 5 que aplican / N/A |
| 10 | Autor | Gerardo (o quien escriba el spec) |
| 11 | Fecha de creación | YYYY-MM-DD |
| 12 | Aprobado por | quien valida el spec antes de implementar |
| 13 | Issue GitHub vinculado | #N o "N/A" |
| 14 | PR vinculado | URL o "N/A" (se completa al crear PR) |

### Sección 2 — Contexto

Responde tres preguntas:

1. **Por qué existe este spec.** ¿Qué hallazgo, decisión o problema lo originó?
2. **Qué resuelve.** ¿Qué cambia en la experiencia del usuario o en el sistema?
3. **Documentación de referencia.** Links a documentos relevantes (master, hallazgos, propuesta visual de Sergio, issues, etc.).

Idealmente 200-400 palabras.

### Sección 3 — Validación interdisciplinaria

Documentación de las perspectivas que se consideraron al diseñar el spec.

Las 5 perspectivas posibles:

| Perspectiva | Mira |
|---|---|
| Politólogo | Políticas públicas, marco normativo, eje de género, derechos |
| Sociólogo | Sujeto, vínculos sociales, ética de observación, estigmatización |
| Economista | Modelo económico, formalización, costos, escalabilidad |
| Contador | AFIP/ARCA, normativa fiscal, certificaciones, compliance |
| Sectorial | Sector textil real (talleres, marcas, lenguaje del oficio, prácticas) |

**Formato sugerido:**

```
### Perspectivas relevantes para este spec

**Politólogo:** N/A — no toca políticas públicas ni marco normativo.

**Sociólogo:** APLICA.
- Observación: el lenguaje de "niveles BRONCE/PLATA/ORO" estigmatiza a talleres en etapa inicial.
- Decisión tomada en el spec: ocultar niveles en UI, mostrar "X de 7 requisitos verificados".

**Economista:** APLICA.
- Observación: el modelo de membresía vigente anual cambia incentivos.
- Decisión tomada en el spec: período de gracia 60 días sin penalización.

**Contador:** N/A — no toca CUIT ni normativa fiscal en este spec.

**Sectorial:** APLICA.
- Observación: tu colega sectorial validó que el lenguaje "Tiempo estándar de confección" es correcto en lugar de "SAM".
- Decisión tomada en el spec: usar el término en español.
```

Si NINGUNA perspectiva aplica: marcar la sección completa como "N/A — Spec puramente técnico-interno sin impacto interdisciplinario".

### Sección 4 — Qué construir

Descripción funcional de qué debe hacer el sistema después de implementar el spec.

**Estructura sugerida:**

1. **Lista de funcionalidades** (qué hace el feature)
2. **Wireframes ASCII** o referencia a mockup HTML/imagen si aplica
3. **Lenguaje no estigmatizante** si aplica decisiones de narrativa

NO incluir detalles técnicos de implementación aquí. Eso va en sección 6.

### Sección 5 — Datos (schema, modelos, queries)

Cambios en estructura de datos:

- Nuevas tablas o modificaciones a tablas Prisma existentes
- Migraciones SQL si aplica
- Queries o relaciones nuevas
- Seeds o data inicial necesaria

Si el spec no toca datos (ej: refactor visual puro): "N/A — Spec visual sin cambios en schema."

### Sección 6 — Prescripciones técnicas

Decisiones técnicas obligatorias que el implementador (Claude Code o desarrollador) DEBE respetar:

- Librerías específicas a usar
- Patrones de código existentes a mantener
- Convenciones del proyecto
- Restricciones de performance o seguridad

Ejemplos:
- "Usar `cn()` de `lib/utils.ts` para concatenar clases Tailwind"
- "NO hardcodear colores en `style={{}}`, usar variables CSS o clases Tailwind"
- "Endpoint debe usar `apiHandler` de `lib/api-handler.ts`"

### Sección 7 — Edge cases

Casos límite que el implementador debe contemplar:

- Datos vacíos
- Datos muy largos
- Concurrencia
- Errores de red
- Permisos faltantes
- Estados intermedios

Cada edge case con su comportamiento esperado.

### Sección 8 — Validación sectorial

**Por decisión 4 de la metodología:** casi todos los specs V4 marcan esta sección como:

```
N/A — Diferida a validación grupal post-MVP V4
```

Solo en casos excepcionales (spec con UX muy crítica que justifica validación previa), se cambia. Si se valida pre-implementación:

```
APLICA — Validación previa con 3 talleres + 1 marca

Momento: antes de implementar
Formato: sesión individual remota (Zoom)
Preguntas a responder:
1. ...
2. ...
Criterio de aprobado: ...
```

### Sección 9 — Criterios de aceptación

Lista chequeable corta (5-15 items) que define qué tiene que pasar para considerar el spec terminado.

A diferencia de los tests (sección 10) que son flujos de usuario, los criterios de aceptación son condiciones técnicas/funcionales binarias:

```
- [ ] Build de producción pasa sin errores
- [ ] Tests E2E existentes siguen pasando
- [ ] No hay warnings nuevos de TypeScript
- [ ] Lighthouse mantiene puntaje ≥ X en pantallas críticas
- [ ] Documentación de handover actualizada
```

### Sección 10 — Tests (QAs basados en flujos)

**5-10 flujos esperados** que describen QUÉ debería verificar el QA.

**Estructura de cada flujo:**

```
N. ✅ FLUJO: [Título descriptivo en 1 línea]
   - Rol: [taller / marca / ESTADO / ADMIN / no autenticado]
   - Precondiciones: [estado de la base de datos necesario]
   - Pasos:
     1. ...
     2. ...
     3. ...
   - Resultado esperado: [qué debe pasar al final]
   - Verificaciones cruzadas: [si involucra varios roles, qué ve cada uno]
   - Tipo: automatizado Playwright / manual
```

**Cantidad sugerida según tamaño del spec:**

| Categoría | Flujos sugeridos |
|---|---|
| Spec chiquito (<2h) | 2-3 flujos |
| Spec mediano (2-5h) | 4-6 flujos |
| Spec grande (5h+) | 7-10 flujos |
| Spec refactor de fondo | 10-15 flujos |

**Política de automatización:**

- Flujos críticos del MVP (login, registro, cotizar, aceptar pedido, formalización básica) → automatizados con Playwright
- Flujos secundarios → manuales
- Refactors visuales (Spec 2, 3, 4 del Bloque X) → manuales (verificación visual)

### Sección 11 — Impacto en handover

Qué documentos de `.claude/specs/handover/` el spec necesita crear o actualizar.

Documentos posibles:

| Documento | Cuándo se actualiza |
|---|---|
| `ARCHITECTURE.md` | Cambios estructurales (schema, arquitectura, stack) |
| `DECISIONS.md` | Decisiones de producto o técnicas relevantes |
| `KNOWN_ISSUES.md` | Bugs descubiertos durante el spec que no se resolvieron |
| `DEPLOY.md` | Cambios en proceso de despliegue |
| `ROLES.md` | Cambios en roles o permisos |
| `API.md` | Endpoints nuevos o modificados |
| `SETUP.md` | Cambios en setup local |
| `HOW_TO_ADD_SPEC.md` | Si la metodología cambia |
| `HOW_TO_RUN_QA.md` | Si el proceso de QA cambia |

**Formato sugerido:**

```
## 11. Impacto en handover

Documentos a actualizar al terminar este spec:

- ARCHITECTURE.md → agregar sección "Design tokens V4" describiendo paleta y tipografía
- DECISIONS.md → registrar adopción de propuesta visual de Sergio
- KNOWN_ISSUES.md → N/A (no se descubrieron issues nuevos)
```

Si NINGÚN documento aplica:

```
## 11. Impacto en handover

N/A — Spec no genera cambios documentables en handover.
```

### Sección 12 — Riesgos y mitigaciones

Lista de riesgos identificados al diseñar el spec, con su mitigación.

**Estructura:**

```
| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| ... | Alta/Media/Baja | Alto/Medio/Bajo | ... |
```

---

## El sistema QA V4 — 6 ejes ajustados

Heredamos el TEMPLATE_QA V3 con sus 6 ejes y aplicamos 4 ajustes:

### Eje 1 — Funcionalidad (REESTRUCTURADO)

**Antes (V3):** tabla con 17-25 criterios técnicos atomizados.

**Ahora (V4):** ejecución de los 5-10 flujos definidos en la sección 10 del spec.

Cada flujo se ejecuta y se reporta:
- Pasó / Falló / Con bugs
- Issues abiertos si aplica
- Notas relevantes

### Eje 2 — Navegabilidad (sin cambios)

Verificación de pasos secuenciales con rol, URL, acción, esperado, resultado.

### Eje 3 — Casos borde (sin cambios)

Tabla con acción / esperado / verificador.

### Eje 4 — Performance (sin cambios)

Carga <3s, consola limpia, responsive.

### Eje 5 — Consistencia visual (REFORZADO)

Mantiene verificaciones de V3 + agrega verificaciones específicas del rediseño V4:

- Tokens correctos (paleta, tipografía nueva)
- Componentes nuevos correctos (KpiCard, FilterPills, EmptyState)
- Footer institucional con leyenda "Desarrollado por UNTREF con el apoyo de la OIT"
- Sin restos visibles de niveles BRONCE/PLATA/ORO
- Lenguaje no estigmatizante para talleres pendientes
- Etapas con nombres nuevos (Etapa inicial / En proceso / Consolidada)

### Eje 6 — Validación de dominio (ALIVIANADO)

**Antes (V3):** 16 preguntas de dominio (4 perfiles × 4 preguntas) generadas al final del QA.

**Ahora (V4):** SOLO verifica que la implementación respete las perspectivas documentadas en la sección 3 del spec.

NO se generan observaciones nuevas en el QA. Si surgen, se abren issues para iteración.

### Sección nueva — Verificación de handover

Después de los 6 ejes, sección nueva que verifica que el spec actualizó los documentos del handover indicados:

```
## Verificación de handover

- [ ] DECISIONS.md actualizado (si aplica)
- [ ] ARCHITECTURE.md actualizado (si aplica)
- [ ] KNOWN_ISSUES.md actualizado (si aplica)
- [ ] Otros docs del handover actualizados (si aplica)
```

La plantilla completa del QA V4 está en `TEMPLATE_QA_V4.md`.

---

## Flow completo de trabajo V4

Cada spec V4 sigue este flow:

```
1. Escribir spec V4
   - 12 secciones obligatorias
   - .claude/specs/v4-x-01-tokens.md
   - Sección 3: documentar perspectivas relevantes
   - Sección 10: definir 5-10 flujos esperados
   - Sección 11: identificar docs handover a actualizar

2. Revisar spec
   - Vos revisás solo (validación interdisciplinaria documentada en spec)
   - Si surge duda → consultar a colega del equipo PDT
   - Aprobar o iterar el spec

3. Implementar
   - Branch feature/v4-[id]-[slug]
   - Claude Code o vos implementa siguiendo el spec
   - Commits frecuentes con mensajes descriptivos

4. Push a develop
   - CI corre tests automatizados (Playwright, lint, build)
   - Validación visual en dev.plataformatextil.com.ar

5. Actualizar handover
   - Antes de mergear, actualizar documentos identificados en sección 11
   - Commit dentro del mismo PR o como commit separado

6. Crear QA V4
   - .claude/auditorias/QA_v4-[id]-[slug].md
   - Sigue TEMPLATE_QA_V4 con 6 ejes ajustados
   - Eje 1: ejecutar flujos del spec
   - Verificación de handover al final

7. Auto-publicación de QA
   - Workflow qa-pages.yml detecta QA_v4-*.md
   - Genera HTML en GitHub Pages

8. Merge a main
   - Si CI verde y QA aprobado
   - Deploy automático a producción
   - Cerrar issue de GitHub vinculado
```

---

## Categorías de release V4

Cada spec declara su categoría en la metadata. Esto define qué pasa si OIT pide salir antes de terminar V4.

### MVP no negociable

Sin estos specs no se puede salir. Si OIT pide salir antes y estos no están, NO se sale.

Bloques: Fase 0 (dominio), X, U, K, B (mobile), W-A, bugs G-19 G-20.

### Deseable

Mejora significativa pero diferible si hace falta. Si se difieren, se incorporan en sub-releases posteriores al piloto.

Bloques: R, Q, S, H, G items restantes.

### Espera

No entra en V4 o se hace en paralelo cuando hay tiempo.

Bloques: A, J, M, P, D, C, F, L.

### Diferido

No entra en V4 bajo ninguna circunstancia. Va a V5 o posterior.

Bloque: E (integraciones de pago).

---

## Handover en V4

### Decisión: handover incremental + handover básico inicial

Antes de empezar Spec 2, se crea el handover básico (~6.5h):

| Documento | Estimación |
|---|---|
| `README.md` principal del proyecto | 2h |
| `LICENSE` (MIT o Apache 2.0) | 5 min |
| `README.md` de `/docs/` | 30 min |
| `.claude/specs/handover/SETUP.md` | (existente, revisar) |
| `.claude/specs/handover/DEPLOY.md` | 2h (incluye guía dominio aprendida ayer) |
| `.claude/specs/handover/DECISIONS.md` | 1h (consolidar master) |
| `.claude/specs/handover/HOW_TO_ADD_SPEC.md` | 1h (referencia esta metodología) |

Durante V4, cada spec actualiza el handover en su sección 11.

Al final del MVP V4, se hace una pasada completa de handover para completar lo que falte:

- `ARCHITECTURE.md` completo
- `API.md` con todos los endpoints
- `ROLES.md` con todos los permisos
- `KNOWN_ISSUES.md` consolidado
- `CONTRIBUTING.md` para contribuyentes externos
- Documentos de capacitación al equipo (PDFs)

---

## Cambios técnicos al sistema existente

### Workflow `qa-pages.yml`

Antes:
```yaml
paths:
  - '.claude/auditorias/QA_v2-*.md'
  - '.claude/auditorias/QA_v3-*.md'
  - 'tools/generate-qa.js'
```

Después (agregar línea):
```yaml
paths:
  - '.claude/auditorias/QA_v2-*.md'
  - '.claude/auditorias/QA_v3-*.md'
  - '.claude/auditorias/QA_v4-*.md'  # NUEVO
  - 'tools/generate-qa.js'
```

Este cambio se aplica al primer commit de un QA V4.

### Generador HTML `tools/generate-qa.js`

Verificar antes del primer QA V4:
- Funciona con el formato nuevo del Eje 1 (flujos en lugar de criterios atomizados)
- Soporta la sección "Verificación de handover"
- Detecta el prefijo `QA_v4-`

Si requiere ajustes, se hacen como spec separado o como fix dentro del primer QA V4.

### REVIEWs eliminados

V3 tenía REVIEWs en paralelo a QAs. V4 los elimina.

La revisión técnica interna se hace como:
- Comentarios en el PR de GitHub
- Conversaciones asincrónicas con el equipo si es necesario

NO se crean archivos `REVIEW_v4-*.md`.

---

## Validación sectorial — política V4

Por decisión 4:

- **Durante V4:** NO se valida spec por spec con talleres/marcas reales.
- **Al terminar MVP V4 (después de Spec 33):** 1-2 sesiones grupales grandes que cubran todo el rediseño.
- **Si surgen problemas en producción:** se abren issues iterativos.

**Ventajas:**
- Elimina coordinación de validación spec por spec
- Permite avanzar rápido en V4
- Concentra feedback al final, cuando hay producto integral para mostrar

**Riesgo asumido:** podemos llegar al final del MVP con cambios visuales/funcionales que el sector rechace. Mitigación: el equipo PDT (con colega sectorial) ya validó las decisiones de fondo durante la planificación.

---

## Próximos pasos para arrancar

1. **Aprobar esta metodología** (decisión tomada).
2. **Crear handover básico** (~6.5h) antes de Spec 2.
3. **Crear template del spec** (`TEMPLATE_SPEC_V4.md`) en `.claude/specs/`.
4. **Crear template del QA** (`TEMPLATE_QA_V4.md`) en `.claude/auditorias/`.
5. **Escribir Spec 2 (X-01 Tokens)** usando la nueva metodología — primer spec V4 real.
6. **Iterar la metodología si algo no funciona** durante los primeros 3-5 specs V4.

---

## Anexo — Comparación V3 vs V4

| Aspecto | V3 | V4 |
|---|---|---|
| Estructura del spec | Informal, ~7-15 secciones según spec | 12 secciones fijas |
| Validación interdisciplinaria | Al final del QA (Eje 6) | En sección 3 del spec, antes de implementar |
| QA — items | 30-40 criterios atomizados | 5-10 flujos completos |
| Validación sectorial | Spec por spec si surgía | Diferida a sesiones grupales post-MVP |
| Handover | Vacío (carpeta con README en blanco) | Incremental, cada spec actualiza |
| REVIEWs | Archivos separados (REVIEW_v3-*.md) | Eliminados, reemplazados por comentarios PR |
| Categoría de release | Implícita | Explícita en metadata (MVP / Deseable / Espera) |
| Dependencias entre specs | Implícitas | Explícitas en metadata |
| Convención de nombres | v3-*.md, QA_v3-*.md, REVIEW_v3-*.md | v4-*.md, QA_v4-*.md (sin REVIEWs) |
| Workflow GitHub Pages | Matchea v2 y v3 | Se agrega v4 al primer QA |

---

**Fin del documento METODOLOGIA_V4.md**

*Este documento se actualiza si la metodología requiere ajustes durante el desarrollo de V4.*
