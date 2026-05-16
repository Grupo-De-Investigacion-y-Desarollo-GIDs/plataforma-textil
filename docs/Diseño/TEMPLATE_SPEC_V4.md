# SPEC N — [ID]: [Título descriptivo del spec]

> **Plantilla V4** — Reemplazar todos los `[placeholders]` con contenido real.
> Esta plantilla sigue la metodología V4 definida en `.claude/METODOLOGIA_V4.md`.
> Las 12 secciones son obligatorias. Si una sección no aplica, marcar como "N/A" con razón breve.

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **Tipo** | [refactor visual / refactor funcional / feature nueva / bug fix / análisis] |
| **Bloque** | [X / U / W-A / W-B / K / Q / R / S / G / etc.] |
| **Categoría** | [MVP no negociable / Deseable / Espera] |
| **Estimación** | [Xh] |
| **Riesgo** | [Bajo / Medio / Alto] |
| **Dependencias** | [Spec N (debe estar mergeado antes) / Ninguna] |
| **Branch** | `feature/v4-[id]-[slug]` |
| **Validación sectorial** | N/A — Diferida a validación grupal post-MVP V4 |
| **Perspectivas relevantes** | [Politólogo / Sociólogo / Economista / Contador / Sectorial / N/A] |
| **Autor** | Gerardo Breard |
| **Fecha de creación** | YYYY-MM-DD |
| **Aprobado por** | [Pendiente / Equipo PDT / etc.] |
| **Issue GitHub vinculado** | [#N / N/A] |
| **PR vinculado** | [URL / Pendiente] |

---

## 2. Contexto

### Por qué existe este spec

[Explicar qué hallazgo, decisión o problema originó este spec. ¿Vino del piloto V3? ¿De un colega del equipo? ¿De auditoría Fase 2? ¿De una decisión del master?]

### Qué resuelve

[Describir qué cambia en la experiencia del usuario o en el sistema después de implementar este spec.]

### Documentación de referencia

- [Link a documento relevante del master, hallazgos, propuesta visual, etc.]
- [Link a issue o conversación relevante]

---

## 3. Validación interdisciplinaria

### Perspectivas relevantes para este spec

**Politólogo:** [APLICA / N/A]
- [Si APLICA: observación que se consideró + decisión tomada en el spec]
- [Si N/A: razón breve por la que no aplica]

**Sociólogo:** [APLICA / N/A]
- [Observación + decisión, o razón de N/A]

**Economista:** [APLICA / N/A]
- [Observación + decisión, o razón de N/A]

**Contador:** [APLICA / N/A]
- [Observación + decisión, o razón de N/A]

**Sectorial:** [APLICA / N/A]
- [Observación + decisión, o razón de N/A]

> Si NINGUNA perspectiva aplica al spec, reemplazar toda esta sección por:
>
> **N/A — Spec puramente técnico-interno sin impacto interdisciplinario.**

---

## 4. Qué construir

### Funcionalidades

1. [Funcionalidad 1]
2. [Funcionalidad 2]
3. [...]

### Wireframes o referencias visuales

[Si aplica: wireframes ASCII, links a mockup HTML, screenshots, etc.]

```
[Ejemplo de wireframe ASCII si aplica]

┌─────────────────────────────────┐
│ Header                          │
├─────────────────────────────────┤
│ Contenido principal             │
│                                 │
│   ┌─────────┐  ┌─────────┐      │
│   │ Card 1  │  │ Card 2  │      │
│   └─────────┘  └─────────┘      │
│                                 │
└─────────────────────────────────┘
```

### Consideraciones de lenguaje

[Si aplica: decisiones de copy, terminología, narrativa según decisiones del master.]

---

## 5. Datos (schema, modelos, queries)

### Cambios en schema Prisma

[Si aplica: nuevas tablas, modificaciones a tablas existentes, índices nuevos, etc.]

```prisma
// Ejemplo
model NuevoModelo {
  id        String   @id @default(cuid())
  // ...
}
```

### Migraciones SQL

[Si aplica: SQL específico, raw queries, etc.]

### Queries o relaciones nuevas

[Si aplica: queries de Prisma, raw SQL para reportes, etc.]

### Seed o data inicial

[Si aplica: datos que el spec necesita en la base.]

> Si el spec no toca datos: **N/A — Spec visual/refactor sin cambios en schema.**

---

## 6. Prescripciones técnicas

Decisiones técnicas obligatorias que la implementación DEBE respetar:

- [Decisión 1: ej. "Usar `cn()` de `lib/utils.ts` para concatenar clases Tailwind"]
- [Decisión 2: ej. "NO hardcodear colores en `style={{}}`, usar variables CSS"]
- [Decisión 3: ej. "Endpoint debe usar `apiHandler` de `lib/api-handler.ts`"]
- [Decisión 4: ej. "Mantener compat con `var(--brand-blue)` legacy"]

### Librerías o paquetes nuevos

[Si aplica: listar nuevas dependencias con versión y justificación.]

### Convenciones del proyecto a mantener

[Patrones existentes que se deben respetar, ej. estructura de carpetas, naming, etc.]

---

## 7. Edge cases

| # | Caso límite | Comportamiento esperado |
|---|---|---|
| 1 | [Datos vacíos] | [Cómo se comporta el sistema] |
| 2 | [Concurrencia] | [Política de resolución] |
| 3 | [Error de red] | [Mensaje al usuario / retry / etc.] |
| 4 | [Permisos faltantes] | [Redirect / mensaje / log] |
| 5 | [...] | [...] |

---

## 8. Validación sectorial

**N/A — Diferida a validación grupal post-MVP V4**

> En casos excepcionales (UX muy crítica que justifica validación previa), reemplazar este texto por:
>
> ```
> APLICA — Validación previa con [N] talleres + [N] marcas
>
> Momento: [antes de implementar / después de implementar antes de mergear]
> Formato: [sesión individual remota / sesión grupal / asincrónico con formulario]
> Preguntas a responder:
> 1. ...
> 2. ...
> 3. ...
> Criterio de aprobado: [qué tiene que pasar para considerar validado]
> ```

---

## 9. Criterios de aceptación

Condiciones técnicas/funcionales binarias que deben cumplirse para considerar el spec terminado:

- [ ] Build de producción pasa sin errores (`npm run build`)
- [ ] Tests E2E existentes siguen pasando
- [ ] No hay warnings nuevos de TypeScript
- [ ] No hay warnings nuevos de ESLint
- [ ] [Criterio específico del spec 1]
- [ ] [Criterio específico del spec 2]
- [ ] Documentación de handover actualizada (ver sección 11)
- [ ] PR creado, revisado y mergeado a develop
- [ ] Verificación visual en `dev.plataformatextil.com.ar` OK
- [ ] Merge a main exitoso

---

## 10. Tests (QAs basados en flujos)

[5-10 flujos esperados que describen QUÉ debería verificar el QA. Estructura: rol + precondiciones + pasos + resultado esperado + verificaciones cruzadas + tipo (automatizado/manual).]

### Flujo 1: [Título descriptivo del flujo]

- **Rol:** [taller / marca / ESTADO / ADMIN / no autenticado]
- **Precondiciones:** [estado de la base de datos necesario]
- **Pasos:**
  1. [Paso 1]
  2. [Paso 2]
  3. [Paso 3]
- **Resultado esperado:** [qué debe pasar al final]
- **Verificaciones cruzadas:** [si involucra varios roles, qué ve cada uno]
- **Tipo:** [automatizado Playwright / manual]

### Flujo 2: [Título descriptivo]

[Mismo formato]

### Flujo 3: [Título descriptivo]

[Mismo formato]

[Continuar con tantos flujos como aplique según tamaño del spec:
- 2-3 flujos para spec chiquito (<2h)
- 4-6 flujos para spec mediano (2-5h)
- 7-10 flujos para spec grande (5h+)
- 10-15 flujos para refactor de fondo]

---

## 11. Impacto en handover

Documentos de `.claude/specs/handover/` a crear o actualizar al terminar este spec:

- **[NOMBRE_DOC.md]** → [qué se agrega o cambia]
- **[OTRO_DOC.md]** → [qué se agrega o cambia]
- **N/A** [si ningún doc aplica]

### Ejemplo

```
- ARCHITECTURE.md → agregar sección "Design tokens V4" con paleta y tipografía
- DECISIONS.md → registrar adopción de propuesta visual de Sergio
- KNOWN_ISSUES.md → N/A (no se descubrieron issues nuevos)
```

> Si NINGÚN documento aplica: **N/A — Spec no genera cambios documentables en handover.**

---

## 12. Riesgos y mitigaciones

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| 1 | [Descripción del riesgo] | [Alta/Media/Baja] | [Alto/Medio/Bajo] | [Cómo se mitiga] |
| 2 | [...] | [...] | [...] | [...] |
| 3 | [...] | [...] | [...] | [...] |

### Ejemplo

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| 1 | FOIT (Flash of Invisible Text) al cargar fuentes nuevas | Media | Bajo | Configurar `font-display: swap` explícito en `@font-face` |
| 2 | Tests E2E fallan por cambios de selectores visuales | Baja | Medio | Actualizar tests si fallan; mantener data-testid estables |
| 3 | Browsers viejos no soportan `@theme inline` (Tailwind v4) | Baja | Alto | Verificar versión de Tailwind del repo antes de empezar |

---

## Notas finales

[Espacio libre para cualquier nota adicional, contexto que no encajó en otra sección, o links útiles.]

---

**Fin del SPEC N — [ID]**

> Una vez terminado el spec, el QA correspondiente se crea como `.claude/auditorias/QA_v4-[id]-[slug].md` siguiendo `TEMPLATE_QA_V4.md`.
