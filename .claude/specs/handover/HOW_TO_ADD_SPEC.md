# Cómo crear un Spec V4

Esta guía explica cómo crear un Spec V4 nuevo siguiendo la metodología vigente del proyecto.

**Audiencia:** Equipo de desarrollo PDT y cualquier persona que tome el proyecto a futuro.

**Documentación relacionada:**
- [Metodología V4](../../METODOLOGIA_V4.md) — Documento marco con todas las decisiones metodológicas
- [Template de Spec V4](../TEMPLATE_SPEC_V4.md) — Plantilla con las 12 secciones obligatorias
- [Template de QA V4](../../auditorias/TEMPLATE_QA_V4.md) — Plantilla del QA que se hace después

---

## Cuándo escribir un spec

**Escribir un Spec V4 si la tarea cumple AL MENOS UNO de estos criterios:**

- Toma más de 1 hora de desarrollo
- Modifica el schema de la base de datos
- Agrega o cambia un endpoint público
- Modifica algún flujo de usuario (login, registro, cotización, etc.)
- Cambia diseño visual de pantallas
- Requiere validación interdisciplinaria
- Afecta a más de 1 rol del sistema (TALLER, MARCA, ESTADO, ADMIN, CONTENIDO)
- Es parte del MVP no negociable

**NO necesita spec si la tarea es:**

- Bug fix de menos de 1 hora que no toca lógica de negocio
- Typo o cambio de copy menor
- Refactor interno sin impacto funcional
- Actualización de dependencias rutinaria
- Cambios en CI/CD o configuración

En esos casos, basta con un commit directo con mensaje descriptivo.

---

## Ubicación y nombres

Todos los specs viven en `.claude/specs/` con la convención:

```
.claude/specs/v4-[id]-[slug].md
```

**Reglas de nomenclatura:**

| Parte | Explicación | Ejemplos |
|---|---|---|
| `v4-` | Prefijo de versión obligatorio | siempre `v4-` |
| `[id]` | Identificador del bloque (del backlog) | `x-01`, `u-02`, `w-a1`, `k-01` |
| `[slug]` | Nombre corto descriptivo en kebab-case | `tokens`, `schema-multi-rol`, `formulario-taller` |

**Ejemplos válidos:**

- `v4-x-01-tokens.md` (Bloque X, item 01, refactor de tokens visuales)
- `v4-u-02-schema-multi-rol.md` (Bloque U, item 02, schema multi-rol Airbnb)
- `v4-w-a1-nomenclatura-oficio.md` (Bloque W parte A, item 1, nomenclatura del oficio textil)
- `v4-fase-0-dominio.md` (caso especial: Fase 0 antes de los bloques)

---

## Workflow paso a paso

### Paso 1 — Identificar el spec en el backlog

Antes de escribir, ubicar el spec en el documento Master V4:

1. Abrir `docs/Diseño/MASTER_V4.md.pdf` (o la versión markdown si está disponible)
2. Encontrar el bloque al que pertenece el spec (X, U, W-A, etc.)
3. Confirmar:
   - ID del item dentro del bloque
   - Estimación aproximada de horas
   - Categoría (MVP / Deseable / Espera)
   - Dependencias con otros specs

Si el spec no está en el backlog, hay dos opciones:
- **Si es chico y urgente:** agregarlo al backlog antes de escribir el spec
- **Si es grande o estratégico:** discutir con el equipo PDT antes de incorporarlo

### Paso 2 — Copiar el template

```bash
cp .claude/specs/TEMPLATE_SPEC_V4.md .claude/specs/v4-[id]-[slug].md
```

Editar el archivo nuevo y completar las 12 secciones obligatorias.

### Paso 3 — Completar las 12 secciones

Cada sección está descrita en detalle en [METODOLOGIA_V4.md](../../METODOLOGIA_V4.md) y en el [Template](../TEMPLATE_SPEC_V4.md). Resumen rápido:

| # | Sección | Tip rápido |
|---|---|---|
| 1 | Metadata | Completar los 14 campos del header. Branch siempre `feature/v4-[id]-[slug]` |
| 2 | Contexto | Por qué existe, qué resuelve, links a documentación de referencia |
| 3 | Validación interdisciplinaria | Documentar las 5 perspectivas. Marcar N/A las que no apliquen |
| 4 | Qué construir | Descripción funcional. NO detalles técnicos acá |
| 5 | Datos (schema, modelos, queries) | Cambios en Prisma, queries nuevas. N/A si es solo visual |
| 6 | Prescripciones técnicas | Decisiones obligatorias que la implementación debe respetar |
| 7 | Edge cases | Tabla con casos límite y comportamiento esperado |
| 8 | Validación sectorial | Casi siempre "N/A — Diferida a validación grupal post-MVP V4" |
| 9 | Criterios de aceptación | Lista chequeable de condiciones binarias para considerar terminado |
| 10 | Tests (flujos) | 5-10 flujos esperados (estructura: rol + precondiciones + pasos + resultado) |
| 11 | Impacto en handover | Qué docs de handover hay que actualizar |
| 12 | Riesgos y mitigaciones | Tabla con riesgos identificados |

### Paso 4 — Validar el spec antes de implementar

Antes de pasar el spec a implementación:

- [ ] Las 12 secciones están completas (o marcadas N/A con razón)
- [ ] La metadata tiene los 14 campos completos
- [ ] Las dependencias con otros specs están claras
- [ ] Los flujos de la sección 10 son ejecutables
- [ ] La categoría MVP/Deseable/Espera está definida
- [ ] Si afecta a otro rol del sistema, está documentado

Si el spec lo escribe una persona, hace falta una segunda lectura del equipo antes de implementar. Si el equipo es chico, puede ser una revisión rápida de 15 minutos.

### Paso 5 — Crear branch e implementar

```bash
git checkout develop
git pull
git checkout -b feature/v4-[id]-[slug]
```

La implementación sigue el spec **estrictamente**. Si en mitad de la implementación se descubre que el spec está incompleto o incorrecto:

1. **No improvisar.** Detener la implementación.
2. **Actualizar el spec** con la información nueva.
3. **Notificar al equipo** del cambio.
4. **Reanudar la implementación** según el spec actualizado.

Los specs son contratos. Cambiarlos sin documentar genera bugs y desconfianza en el sistema.

### Paso 6 — Actualizar handover durante la implementación

La sección 11 del spec indica qué documentos del handover hay que actualizar. Hacelo **durante** la implementación, no al final.

Documentos típicos a actualizar:
- `ARCHITECTURE.md` si cambia la arquitectura
- `DECISIONS.md` si se toma una decisión nueva
- `KNOWN_ISSUES.md` si se descubre un bug que no se resuelve en este spec
- `API.md` si cambia algún endpoint
- `ROLES.md` si cambian permisos o roles
- `SETUP.md` si cambia el setup local
- `DEPLOY.md` si cambia el deploy

### Paso 7 — Push y CI

```bash
git push origin feature/v4-[id]-[slug]
```

El CI corre automáticamente:
- Lint
- Build
- Tests unitarios (Vitest)
- Tests E2E (Playwright) si tocás código relacionado

Si el CI falla, corregir antes de avanzar.

### Paso 8 — Crear PR contra develop

Título del PR sugerido:
```
[v4-x-01] Tokens visuales V4 (refactor visual)
```

Descripción del PR incluye:
- Spec implementado (link)
- Criterios de aceptación cumplidos (checklist)
- Tests añadidos o modificados
- Documentos de handover actualizados
- Screenshots si hay cambio visual

### Paso 9 — Auditar con QA V4

**Después de mergear el PR a develop**, crear el QA correspondiente:

```bash
cp .claude/auditorias/TEMPLATE_QA_V4.md .claude/auditorias/QA_v4-[id]-[slug].md
```

El QA ejecuta los flujos de la sección 10 del spec y verifica los 6 ejes ajustados (ver [METODOLOGIA_V4.md](../../METODOLOGIA_V4.md)).

El workflow `qa-pages.yml` publica el QA automáticamente en GitHub Pages al hacer push a develop.

### Paso 10 — Merge a main

Cuando develop tiene varios PRs validados:

1. Crear PR de develop a main
2. Revisar el conjunto de cambios
3. Mergear a main
4. Vercel despliega automáticamente a producción

---

## Cómo categorizar el spec

| Categoría | Cuándo usar | Implicancia |
|---|---|---|
| **MVP no negociable** | Sin esto no se puede salir | Se prioriza siempre |
| **Deseable** | Mejora significativa pero diferible | Se hace si hay tiempo |
| **Espera** | No bloquea V4 | Se hace en paralelo o se posterga |
| **Diferido** | No entra en V4 | Va a V5 o posterior |

La categoría se define al crear el spec mirando el Master V4. Si dudás, consultá con el equipo.

---

## Cómo enlazar con QA

El Spec y el QA son artefactos complementarios:

```
┌────────────────────────┐         ┌────────────────────────┐
│  SPEC v4-x-01-tokens   │         │ QA_v4-x-01-tokens     │
│  .claude/specs/        │ ──────► │ .claude/auditorias/   │
│                        │         │                        │
│  Sección 10:           │         │  Eje 1: ejecutar       │
│  - Flujo 1             │ ──────► │  los flujos del spec   │
│  - Flujo 2             │         │  y reportar resultados │
│  - Flujo 3             │         │                        │
└────────────────────────┘         └────────────────────────┘
       ANTES                            DESPUÉS
   de implementar                  de implementar
```

**Reglas:**
- El QA usa el MISMO `[id]-[slug]` del spec, solo cambia el prefijo (`QA_v4-` en vez de `v4-`)
- El QA toma los 5-10 flujos del spec y los ejecuta
- Si el QA encuentra cosas no previstas en el spec, abre issues y se itera

---

## Cómo enlazar con issues de GitHub

| Caso | Recomendación |
|---|---|
| El spec nace de un issue existente | Mencionar el issue en la metadata (campo "Issue GitHub vinculado") |
| El spec NO viene de un issue | Crear issue al iniciar el spec, vincularlo |
| Durante la implementación se descubren bugs | Abrir issues nuevos vinculados al spec |
| El QA encuentra problemas | Abrir issues vinculados al QA |

Los issues sirven como puente entre el código (PRs), el spec (planificación) y el QA (validación).

---

## Quién aprueba un spec antes de implementar

| Tipo de spec | Aprueba |
|---|---|
| MVP no negociable | El equipo PDT (mínimo 2 personas) |
| Deseable | Una persona del equipo |
| Espera | Una persona del equipo |
| Bug fix chico (sin spec formal) | Quien lo resuelve, con commit descriptivo |

La aprobación se registra en el campo "Aprobado por" de la metadata del spec.

---

## Errores comunes a evitar

### ❌ Spec sin sección 10 completa

La sección 10 (Tests) define qué va a verificar el QA. Sin flujos claros, el QA queda sin guía y se vuelve subjetivo.

**Solución:** completar mínimo 5 flujos antes de implementar.

### ❌ Mezclar dos features en un spec

Cada spec es UNA unidad funcional. Si tu spec tiene más de 10 horas estimadas y toca múltiples áreas, probablemente sean dos specs distintos.

**Solución:** dividir en specs más chicos.

### ❌ Olvidar actualizar el handover

Si la sección 11 dice "actualizar `DECISIONS.md`" pero no se actualiza, el handover se desactualiza con cada PR.

**Solución:** incluir actualización de handover en el mismo PR del spec.

### ❌ Implementar sin spec aprobado

Si el spec no está completo y aprobado, no empezar a codear. Sin spec claro, se generan bugs y deuda técnica.

**Solución:** completar el spec primero, validar con el equipo, recién después empezar a implementar.

### ❌ Cambiar el spec en mitad de la implementación sin avisar

Si descubrís que el spec estaba mal, parar y actualizar el spec antes de seguir. No improvises sobre la marcha.

**Solución:** documentar el cambio en el spec, comunicar al equipo, continuar.

### ❌ Saltarse la categoría MVP/Deseable/Espera

Si todos los specs son MVP, ninguno lo es. La categorización sirve para priorizar.

**Solución:** ser honesto con la categoría. Mirar el Master V4 para confirmar.

---

## Checklist final del spec

Antes de pasarlo a implementación:

- [ ] 12 secciones completas (o N/A justificado)
- [ ] Metadata con los 14 campos
- [ ] Categoría MVP/Deseable/Espera definida
- [ ] Dependencias con otros specs explícitas
- [ ] Sección 10: 5-10 flujos claros y ejecutables
- [ ] Sección 11: documentos de handover a actualizar identificados
- [ ] Issue GitHub vinculado o creado
- [ ] Branch definido (`feature/v4-[id]-[slug]`)
- [ ] Aprobación del equipo registrada

---

## Glosario rápido

| Término | Significado |
|---|---|
| **Spec V4** | Documento `.md` en `.claude/specs/v4-*.md` que define qué hacer |
| **QA V4** | Documento `.md` en `.claude/auditorias/QA_v4-*.md` que valida la implementación |
| **MVP no negociable** | Spec que debe estar para salir a producción |
| **Deseable** | Spec que se hace si hay tiempo |
| **Espera** | Spec en paralelo o post-V4 |
| **Bloque** | Agrupación de specs en el Master V4 (X, U, W-A, K, etc.) |
| **Validación interdisciplinaria** | Sección 3 del spec con 5 perspectivas |
| **Validación sectorial** | Validación con talleres/marcas reales (diferida a post-MVP) |

---

## Referencias

- [Metodología V4](../../METODOLOGIA_V4.md) — Documento completo de la metodología
- [Template Spec V4](../TEMPLATE_SPEC_V4.md) — Plantilla a copiar
- [Template QA V4](../../auditorias/TEMPLATE_QA_V4.md) — Plantilla del QA
- [Master V4](../../../docs/Diseño/MASTER_V4.md.pdf) — Planificación estratégica V4
- [Cómo correr un QA](HOW_TO_RUN_QA.md) — Guía complementaria del QA

---

**Última actualización:** Mayo 2026

Si encontrás algo desactualizado o tenés sugerencias para mejorar este documento, abrí un issue o avisá al equipo.
