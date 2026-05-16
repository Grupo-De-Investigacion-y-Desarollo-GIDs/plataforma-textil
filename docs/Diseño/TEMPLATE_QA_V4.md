# QA V4 — [ID]: [Título descriptivo del spec]

> **Plantilla QA V4** — Reemplazar `[placeholders]` con contenido real.
> Esta plantilla actualiza `TEMPLATE_QA.md` V3 con los 4 ajustes definidos en `.claude/METODOLOGIA_V4.md`:
> 1. Eje 1 reestructurado como flujos del spec
> 2. Eje 5 reforzado para rediseño visual V4
> 3. Eje 6 alivianado (solo verifica, no genera nuevo)
> 4. Sección nueva "Verificación de handover"

---

## Header del QA

| Campo | Valor |
|---|---|
| **Versión** | v4 |
| **Spec auditado** | `v4-[id]-[slug].md` |
| **Categoría** | [MVP no negociable / Deseable / Espera] |
| **Auditor** | [Gerardo / Claude Code / Sergio / otro] |
| **Fecha** | YYYY-MM-DD |
| **URL auditada** | `https://dev.plataformatextil.com.ar` o `https://plataformatextil.com.ar` |
| **Commit auditado** | [SHA del commit] |
| **PR vinculado** | [URL del PR] |
| **Issue vinculado** | [#N o N/A] |
| **Tipo de QA** | [code-review / browser-manual / browser-automatizado / mixto] |

---

## Contexto institucional

[Breve descripción del contexto del proyecto. Puede ser igual para todos los QAs V4 o adaptado según el spec.]

> Ejemplo:
> Plataforma Digital Textil (PDT) — proyecto OIT-UNTREF para formalización del sector textil argentino.
> Modelo: Showcase + Match con backend institucional invisible.
> Versión actual: V4 (rediseño visual + multi-rol + nomenclador propio).

---

## Objetivo del QA

[1-2 líneas describiendo qué verifica este QA en particular.]

> Ejemplo:
> Verificar que los tokens visuales V4 (paleta extendida, 3 fuentes nuevas, body color casi-negro) se aplican correctamente en producción sin romper componentes existentes.

---

## Instrucciones de trabajo

1. Leer el spec `v4-[id]-[slug].md` antes de auditar
2. Reproducir el ambiente según indicaciones (URL, commit, credenciales)
3. Ejecutar cada flujo del Eje 1 (vienen de la sección 10 del spec)
4. Verificar los Ejes 2 a 6 según corresponda
5. Abrir issue por cada bug encontrado (vincular al spec)
6. Completar la sección de "Verificación de handover"
7. Llenar el "Resultado global" al final

---

## Resultado global

**Estado:** [✅ Aprobado / ⚠️ Aprobado con fixes / ❌ Rechazado]

**Decisión:** [Mergear a main / Iterar antes de mergear / Bloquear merge hasta resolver]

**Resumen ejecutivo:** [3-5 líneas describiendo el resultado general de la auditoría]

**Issues abiertos en este QA:**
- [#N] [Título del issue]
- [#N] [Título del issue]

---

## Eje 1 — Flujos funcionales

Ejecución de los flujos definidos en la sección 10 del spec.

### Flujo 1: [Título del flujo del spec]

- **Rol:** [del spec]
- **Precondiciones:** [del spec]
- **Pasos ejecutados:** [lo que efectivamente hiciste]
- **Resultado:** [✅ Pasó / ⚠️ Con bugs / ❌ Falló]
- **Bugs encontrados:** [descripción + #issue si aplica]
- **Notas:** [observaciones relevantes]

### Flujo 2: [Título]

- **Rol:** [del spec]
- **Precondiciones:** [del spec]
- **Pasos ejecutados:** [...]
- **Resultado:** [...]
- **Bugs encontrados:** [...]
- **Notas:** [...]

### Flujo 3: [Título]

[Mismo formato]

[Continuar con todos los flujos del spec — debería haber 5-10]

---

## Eje 2 — Navegabilidad

Verificación de pasos secuenciales en la app.

| # | Rol | URL | Acción | Esperado | Resultado |
|---|---|---|---|---|---|
| 1 | [rol] | [URL] | [qué hacés] | [qué debería pasar] | [✅/⚠️/❌] |
| 2 | [...] | [...] | [...] | [...] | [...] |

---

## Eje 3 — Casos borde

Verificación de los edge cases definidos en la sección 7 del spec.

| # | Caso borde | Acción ejecutada | Esperado | Resultado |
|---|---|---|---|---|
| 1 | [Del spec] | [Lo que hiciste] | [Del spec] | [✅/⚠️/❌] |
| 2 | [...] | [...] | [...] | [...] |

---

## Eje 4 — Performance

Verificación de carga y experiencia técnica.

| # | Verificación | Resultado | Notas |
|---|---|---|---|
| 1 | Tiempo de carga inicial < 3s en pantallas críticas | [✅/⚠️/❌] | [valores observados] |
| 2 | Sin errores en consola del browser | [✅/⚠️/❌] | [errores si los hay] |
| 3 | Sin warnings de React en desarrollo | [✅/⚠️/❌] | [warnings si los hay] |
| 4 | Lighthouse Performance ≥ [X] en pantalla principal | [✅/⚠️/❌] | [score real] |
| 5 | Lighthouse Accessibility ≥ [X] | [✅/⚠️/❌] | [score real] |
| 6 | Funciona en mobile (responsive) | [✅/⚠️/❌] | [si aplica al spec] |

---

## Eje 5 — Consistencia visual

Heredado de V3 + reforzado para V4 con verificaciones del rediseño Sergio.

### Verificaciones heredadas de V3

| # | Verificación | Resultado | Notas |
|---|---|---|---|
| 1 | Tipografías correctas (no Times New Roman ni Arial accidental) | [✅/⚠️/❌] | |
| 2 | Colores consistentes con sistema semántico | [✅/⚠️/❌] | |
| 3 | Empty states implementados donde aplica | [✅/⚠️/❌] | |
| 4 | Mensajes y labels en español argentino (vos, no tú) | [✅/⚠️/❌] | |
| 5 | Sin texto roto, sin lorem ipsum residual | [✅/⚠️/❌] | |
| 6 | Sin elementos de debug visibles (console.log, alerts) | [✅/⚠️/❌] | |

### Verificaciones nuevas V4 (rediseño Sergio)

| # | Verificación | Resultado | Notas |
|---|---|---|---|
| 7 | Tokens de paleta correctos (terracotta, pastels, ink) | [✅/⚠️/❌] | |
| 8 | Tipografía Source Serif 4 en H1 grandes | [✅/⚠️/❌] | |
| 9 | Tipografía Inter en body text | [✅/⚠️/❌] | |
| 10 | Tipografía Overpass en UI (botones, labels) | [✅/⚠️/❌] | |
| 11 | Body color es casi-negro (`#0F0F1E`), no azul brand | [✅/⚠️/❌] | |
| 12 | Componentes nuevos correctos: KpiCard, FilterPills, EmptyState | [✅/⚠️/❌] | [si aplica al spec] |
| 13 | Footer institucional con leyenda "Desarrollado por UNTREF con el apoyo de la OIT" | [✅/⚠️/❌] | [si aplica al spec] |
| 14 | Sin restos visibles de niveles BRONCE/PLATA/ORO | [✅/⚠️/❌] | [si aplica al spec] |
| 15 | Lenguaje no estigmatizante para talleres pendientes | [✅/⚠️/❌] | [si aplica al spec] |
| 16 | Etapas con nombres nuevos (Inicial / En proceso / Consolidada) | [✅/⚠️/❌] | [si aplica al spec] |

> Las verificaciones 12-16 solo aplican si el spec toca esas áreas. Si no aplica: marcar N/A.

---

## Eje 6 — Validación de dominio

> **CAMBIO V4:** Eje 6 alivianado. Solo verifica que la implementación respete las perspectivas documentadas en la sección 3 del spec. NO genera observaciones nuevas.

### Verificación de perspectivas del spec

Tomar la sección 3 del spec auditado y verificar que cada decisión interdisciplinaria se respetó en la implementación.

| Perspectiva | ¿Aplicaba según spec? | ¿Implementación respeta la decisión? | Notas |
|---|---|---|---|
| Politólogo | [SÍ / N/A] | [✅ / ⚠️ / ❌ / N/A] | [observaciones] |
| Sociólogo | [SÍ / N/A] | [✅ / ⚠️ / ❌ / N/A] | [observaciones] |
| Economista | [SÍ / N/A] | [✅ / ⚠️ / ❌ / N/A] | [observaciones] |
| Contador | [SÍ / N/A] | [✅ / ⚠️ / ❌ / N/A] | [observaciones] |
| Sectorial | [SÍ / N/A] | [✅ / ⚠️ / ❌ / N/A] | [observaciones] |

### Si surge una observación nueva no prevista en el spec

NO generar tabla de preguntas nuevas (como hacía V3). En su lugar:

1. Abrir issue de GitHub con el hallazgo
2. Vincular el issue al spec
3. Documentar el issue en la sección "Resumen de issues" de este QA
4. La iteración se hace en spec separado, no dentro de este QA

---

## Verificación de handover (NUEVO V4)

Verificar que el spec actualizó los documentos del handover indicados en su sección 11.

| Documento | Indicado en spec | Actualizado en este merge | Notas |
|---|---|---|---|
| ARCHITECTURE.md | [SÍ / N/A] | [✅ / ❌ / N/A] | [qué se agregó o por qué falta] |
| DECISIONS.md | [SÍ / N/A] | [✅ / ❌ / N/A] | [...] |
| KNOWN_ISSUES.md | [SÍ / N/A] | [✅ / ❌ / N/A] | [...] |
| DEPLOY.md | [SÍ / N/A] | [✅ / ❌ / N/A] | [...] |
| ROLES.md | [SÍ / N/A] | [✅ / ❌ / N/A] | [...] |
| API.md | [SÍ / N/A] | [✅ / ❌ / N/A] | [...] |
| SETUP.md | [SÍ / N/A] | [✅ / ❌ / N/A] | [...] |
| HOW_TO_ADD_SPEC.md | [SÍ / N/A] | [✅ / ❌ / N/A] | [...] |
| HOW_TO_RUN_QA.md | [SÍ / N/A] | [✅ / ❌ / N/A] | [...] |
| Otros | [SÍ / N/A] | [✅ / ❌ / N/A] | [especificar cuáles] |

> Si la sección 11 del spec dice "N/A": marcar toda esta sección como "N/A — Spec no requería actualización de handover".

---

## Resumen de issues

Bugs encontrados durante este QA. Se abren como issues de GitHub vinculados al spec.

| # | Severidad | Título | Issue # | Estado |
|---|---|---|---|---|
| 1 | [Crítico / Alto / Medio / Bajo] | [Título breve] | [#N] | [Abierto / En progreso / Resuelto] |
| 2 | [...] | [...] | [...] | [...] |

### Severidad — criterios

- **Crítico:** bloquea funcionalidad principal, hay que resolver antes de mergear
- **Alto:** funcionalidad importante afectada pero workaround disponible
- **Medio:** bug visible pero no bloqueante
- **Bajo:** cosmético o edge case raro

---

## Notas adicionales del auditor

[Espacio libre para observaciones que no encajaron en otras secciones, ideas para mejoras futuras, hallazgos colaterales, etc.]

---

## Checklist de cierre del QA

- [ ] Todos los flujos del Eje 1 ejecutados
- [ ] Ejes 2-5 verificados (los que aplican)
- [ ] Eje 6 verificado contra perspectivas del spec
- [ ] Verificación de handover completada
- [ ] Issues abiertos para todos los bugs encontrados
- [ ] Resultado global completado
- [ ] QA mergeado a `.claude/auditorias/` en develop
- [ ] HTML generado por workflow `qa-pages.yml` accesible en GitHub Pages

---

**Fin del QA V4 — [ID]**

> Este QA se publica automáticamente en GitHub Pages tras merge a develop.
> URL: https://grupo-de-investigacion-y-desarollo-gids.github.io/plataforma-textil/
