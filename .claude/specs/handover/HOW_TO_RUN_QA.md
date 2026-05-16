# Cómo correr una auditoría QA V4

Esta guía explica cómo ejecutar una auditoría QA siguiendo la metodología V4.

**Audiencia:** Equipo de QA, equipo de desarrollo y cualquier persona que necesite validar un spec implementado.

**Documentación relacionada:**
- [Metodología V4](../../METODOLOGIA_V4.md) — Documento marco con las decisiones metodológicas
- [Template QA V4](../../auditorias/TEMPLATE_QA_V4.md) — Plantilla con las 6 secciones y ejes
- [Template Spec V4](../TEMPLATE_SPEC_V4.md) — Plantilla del spec correspondiente
- [Cómo crear un spec V4](HOW_TO_ADD_SPEC.md) — Guía complementaria

---

## Cuándo se hace un QA

Se ejecuta un QA **después de mergear el PR del spec a develop**.

Flujo típico:

```
1. Escribir spec       ──►   .claude/specs/v4-[id]-[slug].md
2. Crear branch        ──►   feature/v4-[id]-[slug]
3. Implementar
4. PR a develop
5. CI verde
6. Merge a develop
7. ───── ACÁ ENTRA EL QA ─────►   .claude/auditorias/QA_v4-[id]-[slug].md
8. QA aprobado
9. PR de develop a main
10. Merge a main (producción)
```

El QA actúa como **gate** antes del merge a main. Si el QA detecta bugs críticos, hay que iterar antes de pasar a producción.

---

## Quién hace el QA

| Tipo de spec | Quién audita |
|---|---|
| MVP no negociable | Auditor distinto al que implementó (mínimo 2 personas en el proyecto) |
| Deseable | Una persona del equipo (puede ser quien implementó si no hay otra disponible) |
| Espera | Una persona del equipo |
| Refactor visual | Validación visual manual + tests E2E |
| Cambios en schema/auth | Auditor + revisión técnica externa si es crítico |

El campo "Auditor" en la metadata del QA registra quién lo ejecutó.

---

## Estructura del QA V4

El QA V4 tiene **6 ejes** (heredados de V3 con 4 ajustes) más una sección nueva de **Verificación de Handover**:

| Eje | Foco | Cambios respecto a V3 |
|---|---|---|
| 1 — Flujos funcionales | Ejecutar los flujos definidos en la sección 10 del spec | **Reestructurado:** antes eran criterios atomizados |
| 2 — Navegabilidad | Pasos secuenciales con rol, URL, acción, esperado | Sin cambios |
| 3 — Casos borde | Edge cases del spec | Sin cambios |
| 4 — Performance | Carga, consola, responsive | Sin cambios |
| 5 — Consistencia visual | Tipografía, paleta, componentes V4 | **Reforzado:** verificaciones nuevas del rediseño V4 |
| 6 — Validación de dominio | Verificar perspectivas del spec | **Alivianado:** solo verifica, no genera nuevo |
| + Verificación de handover | Docs de handover actualizados | **NUEVO** en V4 |

---

## Workflow paso a paso

### Paso 1 — Verificar que el spec esté mergeado a develop

Antes de auditar, confirmar:

- El PR del spec está mergeado a `develop`
- El CI corrió verde (lint, build, tests)
- Vercel desplegó automáticamente a `dev.plataformatextil.com.ar`
- El feature es accesible y funcional en el ambiente dev

Si algo de esto falla, no empezar el QA. Reportar al equipo de desarrollo.

### Paso 2 — Leer el spec correspondiente

Antes de auditar, leer **el spec completo** (`.claude/specs/v4-[id]-[slug].md`).

Prestar atención especial a:

- **Sección 1 (Metadata):** categoría, riesgo, perspectivas relevantes
- **Sección 3 (Validación interdisciplinaria):** qué perspectivas se consideraron y qué se decidió
- **Sección 7 (Edge cases):** casos límite a verificar
- **Sección 9 (Criterios de aceptación):** condiciones binarias que deben cumplirse
- **Sección 10 (Tests):** los flujos que el QA va a ejecutar
- **Sección 11 (Impacto en handover):** documentos que debieron actualizarse

### Paso 3 — Copiar el template del QA

```bash
cp .claude/auditorias/TEMPLATE_QA_V4.md .claude/auditorias/QA_v4-[id]-[slug].md
```

El nombre del QA usa el MISMO `[id]-[slug]` del spec. Solo cambia el prefijo:

| Spec | QA correspondiente |
|---|---|
| `v4-x-01-tokens.md` | `QA_v4-x-01-tokens.md` |
| `v4-u-02-schema.md` | `QA_v4-u-02-schema.md` |
| `v4-w-a1-nomenclatura.md` | `QA_v4-w-a1-nomenclatura.md` |

### Paso 4 — Completar el header del QA

| Campo | Cómo completar |
|---|---|
| Versión | `v4` |
| Spec auditado | nombre del archivo del spec |
| Categoría | copiar del spec |
| Auditor | tu nombre o rol |
| Fecha | fecha de la auditoría |
| URL auditada | `https://dev.plataformatextil.com.ar` (o producción si aplica) |
| Commit auditado | SHA del último commit mergeado |
| PR vinculado | URL del PR del spec |
| Issue vinculado | número del issue si aplica |
| Tipo de QA | code-review / browser-manual / browser-automatizado / mixto |

### Paso 5 — Ejecutar el Eje 1 (Flujos funcionales)

Este es el **eje principal** del QA. Tomar cada flujo de la sección 10 del spec y ejecutarlo.

Para cada flujo:

1. **Reproducir las precondiciones** (estado de la base de datos, login con rol correspondiente, etc.)
2. **Seguir los pasos uno por uno** según el spec
3. **Verificar el resultado esperado**
4. **Documentar:**
   - Resultado: Pasó / Con bugs / Falló
   - Bugs encontrados (descripción + abrir issue de GitHub)
   - Notas relevantes

**Estructura por flujo:**

```
### Flujo 1: [Título del flujo del spec]

- Rol: [del spec]
- Precondiciones: [del spec]
- Pasos ejecutados: [lo que efectivamente hiciste]
- Resultado: ✅ Pasó / ⚠️ Con bugs / ❌ Falló
- Bugs encontrados: [descripción + #issue si aplica]
- Notas: [observaciones]
```

### Paso 6 — Ejecutar Ejes 2 a 4

**Eje 2 — Navegabilidad:** seguir pasos secuenciales documentando rol, URL, acción, esperado, resultado.

**Eje 3 — Casos borde:** ejecutar los edge cases definidos en la sección 7 del spec.

**Eje 4 — Performance:** verificar tiempo de carga, consola limpia, responsive si aplica.

### Paso 7 — Ejecutar Eje 5 (Consistencia visual)

Heredado de V3 + verificaciones nuevas V4.

**Verificaciones heredadas de V3:**
- Tipografías correctas (no fallback de browser)
- Colores consistentes
- Empty states implementados donde aplica
- Mensajes en español argentino (vos, no tú)
- Sin lorem ipsum o texto debug

**Verificaciones nuevas V4 (rediseño visual):**
- Tokens correctos (paleta V4 con terracotta, pastels, ink)
- Source Serif 4 en H1 grandes
- Inter en body text
- Overpass en UI
- Body color casi-negro (`#0F0F1E`), no azul brand
- Componentes nuevos correctos (KpiCard, FilterPills, EmptyState)
- Footer institucional con leyenda "Desarrollado por UNTREF con el apoyo de la OIT"
- Sin restos visibles de niveles BRONCE/PLATA/ORO
- Lenguaje no estigmatizante para talleres pendientes
- Etapas con nombres nuevos (Inicial / En proceso / Consolidada)

Las verificaciones nuevas solo aplican si el spec toca esas áreas. Si no aplica, marcar N/A.

### Paso 8 — Ejecutar Eje 6 (Validación de dominio) — ALIVIANADO

**Cambio importante en V4:** este eje YA NO genera observaciones nuevas. Solo verifica que la implementación respete las perspectivas documentadas en la sección 3 del spec.

Para cada perspectiva (politólogo, sociólogo, economista, contador, sectorial):

1. Mirar qué decisión se documentó en la sección 3 del spec
2. Verificar si la implementación la respetó
3. Resultado: ✅ Respetada / ⚠️ Respetada parcialmente / ❌ No respetada / N/A

**Si surge una observación nueva no prevista en el spec:**
- NO generar tabla de preguntas nuevas (como hacía V3)
- Abrir issue de GitHub con el hallazgo
- Vincular el issue al spec
- La iteración se hace en spec separado

### Paso 9 — Verificar handover (NUEVO V4)

Esto es un eje nuevo de V4. Mirar la **sección 11 del spec** ("Impacto en handover") y verificar que cada documento listado fue efectivamente actualizado en el mismo merge.

Por ejemplo, si el spec dice:
- ARCHITECTURE.md → agregar sección "Design tokens V4"
- DECISIONS.md → registrar adopción de propuesta visual

Entonces el QA verifica:
- ¿La sección "Design tokens V4" existe en ARCHITECTURE.md después del merge? ✅ / ❌
- ¿La decisión está registrada en DECISIONS.md? ✅ / ❌

Si algún documento NO se actualizó, abrir issue de seguimiento.

### Paso 10 — Resumen de issues

Listar todos los bugs encontrados durante el QA con su severidad:

| Severidad | Criterio |
|---|---|
| **Crítico** | Bloquea funcionalidad principal. Hay que resolver antes de mergear a main |
| **Alto** | Funcionalidad importante afectada pero hay workaround |
| **Medio** | Bug visible pero no bloqueante |
| **Bajo** | Cosmético o edge case raro |

Para cada bug, abrir un issue en GitHub vinculado al spec.

### Paso 11 — Resultado global

Llenar el campo "Resultado global" al final del QA:

| Estado | Significado | Acción |
|---|---|---|
| ✅ Aprobado | Todo pasó. No hay bugs críticos ni altos | Mergear develop → main |
| ⚠️ Aprobado con fixes | Hay bugs medios o bajos. Crítico/alto resuelto | Mergear y resolver los pendientes después |
| ❌ Rechazado | Bug crítico o alto no resuelto | NO mergear. Iterar y volver a auditar |

### Paso 12 — Commit y push del QA

```bash
git checkout develop
git pull
git add .claude/auditorias/QA_v4-[id]-[slug].md
git commit -m "qa: [v4-id] resultado del QA (aprobado / con fixes / rechazado)"
git push origin develop
```

### Paso 13 — Publicación automática en GitHub Pages

El workflow `qa-pages.yml` detecta el push del archivo `QA_v4-*.md` y:

1. Genera HTML interactivo con `tools/generate-qa.js`
2. Crea un índice de QAs
3. Publica en GitHub Pages

URL pública: https://grupo-de-investigacion-y-desarollo-gids.github.io/plataforma-textil/

Esto es automático, no requiere acción manual.

### Paso 14 — Cierre del ciclo

Si el QA está en **Aprobado** o **Aprobado con fixes**:

1. Crear PR de `develop` a `main`
2. Mergear cuando CI esté verde
3. Vercel despliega automáticamente a producción
4. Cerrar issue de GitHub vinculado al spec (mencionando el QA)
5. Notificar al equipo

Si el QA está en **Rechazado**:

1. NO mergear a main
2. Los bugs críticos/altos quedan como issues abiertos
3. El equipo de desarrollo itera
4. Repetir el QA con el nuevo merge a develop

---

## Tipos de QA según el contexto

### QA por code-review

Auditor revisa el código sin abrir el browser. Útil para:

- Cambios técnicos puros (refactor, optimización)
- Specs sin UI nueva
- Verificación rápida después de fixes

### QA por browser-manual

Auditor abre el browser y ejecuta los flujos manualmente. Útil para:

- Specs con cambios visuales o de UX
- Validación de flujos end-to-end de usuario
- Primera vez que un feature pasa a producción

### QA por browser-automatizado

Auditor ejecuta los tests Playwright de los flujos del spec. Útil para:

- Specs de MVP no negociable
- Funciones críticas (login, registro, cotización)
- Regression testing

### QA mixto

Combinación de las anteriores. Es lo más común para specs grandes.

---

## Política de automatización de QA

| Flujo | Automatización |
|---|---|
| Flujos críticos del MVP (login, registro, cotizar, formalización básica) | Automatizados con Playwright |
| Flujos secundarios | Manuales |
| Refactors visuales | Verificación visual manual |
| Edge cases | Manuales (Playwright para los críticos) |

Los tests E2E automatizados se ejecutan automáticamente en cada PR vía el workflow `e2e.yml`.

---

## Errores comunes a evitar

### ❌ Empezar el QA sin leer el spec completo

Si el auditor no leyó la sección 3 (validación interdisciplinaria), no puede validar el Eje 6.

**Solución:** leer el spec antes de abrir el TEMPLATE_QA.

### ❌ Auditar antes del merge a develop

Si el feature no está en `dev.plataformatextil.com.ar`, el QA no puede ejecutarse de manera real.

**Solución:** esperar al merge a develop y verificar que el deploy haya pasado.

### ❌ No abrir issues por bugs encontrados

Si encontrás un bug y lo dejás solo en el QA, no se va a resolver.

**Solución:** abrir issue de GitHub vinculado al spec y al QA.

### ❌ Generar observaciones nuevas en Eje 6

El Eje 6 en V4 solo verifica. Si surge algo nuevo, va a issue.

**Solución:** documentar el hallazgo como issue, no como pregunta nueva en el QA.

### ❌ Olvidar la verificación de handover

Si la sección 11 del spec listaba documentos a actualizar y no se verificó, queda deuda documental.

**Solución:** siempre verificar la sección "Verificación de handover" del template.

### ❌ Aprobar con bugs críticos sin resolver

Aprobar y mergear a main con bugs críticos genera incidentes en producción.

**Solución:** ser estricto con la severidad. Crítico = no se mergea hasta resolverse.

---

## Checklist del QA

Antes de marcar el QA como cerrado:

- [ ] Header completo (auditor, fecha, URL, commit, PR)
- [ ] Eje 1 ejecutado: todos los flujos del spec
- [ ] Eje 2 ejecutado (si aplica)
- [ ] Eje 3 ejecutado: todos los edge cases del spec
- [ ] Eje 4 ejecutado (performance)
- [ ] Eje 5 ejecutado con verificaciones V4 nuevas si aplica
- [ ] Eje 6 ejecutado: perspectivas del spec verificadas
- [ ] Verificación de handover completada
- [ ] Issues abiertos para todos los bugs encontrados
- [ ] Resultado global completado
- [ ] QA commiteado y pusheado a develop
- [ ] HTML del QA generado automáticamente en GitHub Pages

---

## Glosario rápido

| Término | Significado |
|---|---|
| **QA V4** | Auditoría siguiendo TEMPLATE_QA_V4.md |
| **Eje** | Una de las 6 secciones de verificación del QA |
| **Flujo** | Unidad de verificación del Eje 1 (rol + precondiciones + pasos + resultado) |
| **Severidad** | Crítico / Alto / Medio / Bajo |
| **Resultado global** | Aprobado / Aprobado con fixes / Rechazado |
| **GitHub Pages** | URL pública donde se publican los QAs en HTML interactivo |

---

## Referencias

- [Metodología V4](../../METODOLOGIA_V4.md)
- [Template QA V4](../../auditorias/TEMPLATE_QA_V4.md)
- [Template Spec V4](../TEMPLATE_SPEC_V4.md)
- [Cómo crear un spec V4](HOW_TO_ADD_SPEC.md)
- QAs publicados: https://grupo-de-investigacion-y-desarollo-gids.github.io/plataforma-textil/

---

**Última actualización:** Mayo 2026

Si encontrás algo desactualizado o tenés sugerencias para mejorar este documento, abrí un issue o avisá al equipo.
