# SPEC N — [ID]: [Titulo descriptivo del spec]

> **Plantilla V4** — Reemplazar todos los `[placeholders]` con contenido real.
> Las 14 secciones son obligatorias. Si una seccion no aplica, marcar como "N/A" con razon breve.
>
> **SECCION 0 es BLOQUEANTE** — No se implementa nada hasta que pre-flight pase.
> **SECCION 13 NO SE MODIFICA** durante implementacion — solo durante pre-flight.

---

## 0. Pre-flight checks (BLOQUEANTE)

> **REGLA:** Ejecutar ANTES de escribir una sola linea de codigo.
> Si pre-flight encuentra problemas, se genera un spec v2 corregido y se descarta la v1.

### 0.1 Verificacion de dependencias

- [ ] Specs listados en dependencias estan mergeados a develop
- [ ] Archivos/componentes referenciados en el spec EXISTEN en el repo actual
- [ ] Branch base (`develop`) esta actualizada

### 0.2 Verificacion de schema y datos

- [ ] Campos Prisma usados en el spec coinciden con `prisma/schema.prisma` ACTUAL
- [ ] Valores de enums Prisma usados en queries son los REALES (no asumidos)
- [ ] Defaults de columnas revisados (ej: `publicado @default(false)` — ajustar logica si se necesita otro valor)
- [ ] Relaciones entre modelos son correctas
- [ ] Indices necesarios existen o se crean en el spec

### 0.3 Discovery de impacto tecnico (extendido)

Verificar:

- [ ] Schema actual de los modelos Prisma involucrados (campos REALES, no asumir nombres)
- [ ] VALORES de enums Prisma usados en queries (ej: `EN_EJECUCION`, no `EN_PROCESO`)
- [ ] Defaults de columnas (ej: `publicado: false` en DB, forzar `true` en create si se necesita)
- [ ] Endpoints existentes que se podrian reutilizar (storage, upload, etc.)
- [ ] Componentes existentes que se podrian reutilizar (file-upload, forms, tables)
- [ ] Layout existente del rol involucrado (sidebar, auth, breadcrumbs)
- [ ] Migraciones recientes que cambien estructura
- [ ] Middleware: rutas ya permitidas vs rutas nuevas necesarias
- [ ] `next.config.ts`: configuraciones que afecten (remotePatterns, redirects, etc.)
- [ ] Utilidades compartidas en `src/compartido/lib/` que se puedan reusar

### 0.4 Verificacion de componentes y patrones

- [ ] Componentes UI referenciados existen con la API correcta (props, eventos)
- [ ] Patrones de pagina (server component, force-dynamic, loading.tsx) coinciden con el proyecto
- [ ] Imports usan paths correctos del proyecto (`@/compartido/...`, no `@/lib/...`)

### 0.5 Reporte pre-flight

**Si TODO pasa:** proceder con implementacion.

**Si hay discrepancias:** generar tabla de correcciones:

| # | Problema | En el spec dice | En el codigo real es | Correccion |
|---|----------|-----------------|---------------------|------------|
| C1 | ... | ... | ... | ... |

Y producir spec v2 corregido antes de implementar.

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **Tipo** | [refactor visual / refactor funcional / feature nueva / bug fix / analisis] |
| **Bloque** | [X / U / W-A / W-B / K / Q / R / S / G / etc.] |
| **Categoria** | [MVP no negociable / Deseable / Espera] |
| **Estimacion** | [Xh] |
| **Riesgo** | [Bajo / Medio / Alto] |
| **Dependencias** | [Spec N (debe estar mergeado antes) / Ninguna] |
| **Branch** | `feature/v4-[id]-[slug]` |
| **Validacion sectorial** | N/A — Diferida a validacion grupal post-MVP V4 |
| **Perspectivas relevantes** | [Politologo / Sociologo / Economista / Contador / Sectorial / N/A] |
| **Autor** | Gerardo Breard |
| **Fecha de creacion** | YYYY-MM-DD |
| **Aprobado por** | [Pendiente / Equipo PDT / etc.] |
| **Issue GitHub vinculado** | [#N / N/A] |
| **PR vinculado** | [URL / Pendiente] |

---

## 2. Contexto

### Por que existe este spec

[Explicar que hallazgo, decision o problema origino este spec.]

### Que resuelve

[Describir que cambia en la experiencia del usuario o en el sistema despues de implementar este spec.]

### Documentacion de referencia

- [Link a documento relevante del master, hallazgos, propuesta visual, etc.]
- [Link a issue o conversacion relevante]

---

## 3. Validacion interdisciplinaria

### Perspectivas relevantes para este spec

**Politologo:** [APLICA / N/A]
- [Si APLICA: observacion que se considero + decision tomada en el spec]
- [Si N/A: razon breve por la que no aplica]

**Sociologo:** [APLICA / N/A]
- [Observacion + decision, o razon de N/A]

**Economista:** [APLICA / N/A]
- [Observacion + decision, o razon de N/A]

**Contador:** [APLICA / N/A]
- [Observacion + decision, o razon de N/A]

**Sectorial:** [APLICA / N/A]
- [Observacion + decision, o razon de N/A]

> Si NINGUNA perspectiva aplica al spec, reemplazar toda esta seccion por:
>
> **N/A — Spec puramente tecnico-interno sin impacto interdisciplinario.**

---

## 4. Que construir

### Funcionalidades

1. [Funcionalidad 1]
2. [Funcionalidad 2]
3. [...]

### Wireframes o referencias visuales

[Si aplica: wireframes ASCII, links a mockup HTML, screenshots, etc.]

### Consideraciones de lenguaje

[Si aplica: decisiones de copy, terminologia, narrativa segun decisiones del master.]

---

## 5. Datos (schema, modelos, queries)

### Cambios en schema Prisma

[Si aplica: nuevas tablas, modificaciones a tablas existentes, indices nuevos, etc.]

```prisma
// Ejemplo
model NuevoModelo {
  id        String   @id @default(cuid())
  // ...
}
```

### Migraciones SQL

[Si aplica: SQL especifico, raw queries, etc.]

### Queries o relaciones nuevas

[Si aplica: queries de Prisma, raw SQL para reportes, etc.]

### Seed o data inicial

[Si aplica: datos que el spec necesita en la base.]

> Si el spec no toca datos: **N/A — Spec visual/refactor sin cambios en schema.**

---

## 6. Prescripciones tecnicas

Decisiones tecnicas obligatorias que la implementacion DEBE respetar:

- [Decision 1: ej. "Usar `cn()` de `lib/utils.ts` para concatenar clases Tailwind"]
- [Decision 2: ej. "NO hardcodear colores en `style={{}}`, usar variables CSS"]
- [Decision 3: ej. "Endpoint debe usar patron inline auth check"]
- [Decision 4: ej. "Server component con `force-dynamic` para listados"]

### Librerias o paquetes nuevos

[Si aplica: listar nuevas dependencias con version y justificacion.]

### Convenciones del proyecto a mantener

[Patrones existentes que se deben respetar, ej. estructura de carpetas, naming, etc.]

---

## 7. Edge cases

| # | Caso limite | Comportamiento esperado |
|---|---|---|
| 1 | [Datos vacios] | [Como se comporta el sistema] |
| 2 | [Concurrencia] | [Politica de resolucion] |
| 3 | [Error de red] | [Mensaje al usuario / retry / etc.] |
| 4 | [Permisos faltantes] | [Redirect / mensaje / log] |
| 5 | [...] | [...] |

---

## 8. Validacion sectorial

**N/A — Diferida a validacion grupal post-MVP V4**

> En casos excepcionales (UX muy critica que justifica validacion previa), reemplazar este texto por el formato de validacion.

---

## 9. Criterios de aceptacion

Condiciones tecnicas/funcionales binarias que deben cumplirse para considerar el spec terminado:

- [ ] Build de produccion pasa sin errores (`npm run build`)
- [ ] Tests E2E existentes siguen pasando
- [ ] No hay warnings nuevos de TypeScript
- [ ] No hay warnings nuevos de ESLint
- [ ] [Criterio especifico del spec 1]
- [ ] [Criterio especifico del spec 2]
- [ ] Documentacion de handover actualizada (ver seccion 11)
- [ ] PR creado, revisado y mergeado a develop
- [ ] Verificacion visual en `dev.plataformatextil.com.ar` OK
- [ ] Merge a main exitoso

---

## 10. Tests (QAs basados en flujos)

[5-10 flujos esperados que describen QUE deberia verificar el QA.]

### Flujo 1: [Titulo descriptivo del flujo]

- **Rol:** [taller / marca / ESTADO / ADMIN / no autenticado]
- **Precondiciones:** [estado de la base de datos necesario]
- **Pasos:**
  1. [Paso 1]
  2. [Paso 2]
  3. [Paso 3]
- **Resultado esperado:** [que debe pasar al final]
- **Verificaciones cruzadas:** [si involucra varios roles, que ve cada uno]
- **Tipo:** [automatizado Playwright / manual]

[Continuar con tantos flujos como aplique:
- 2-3 flujos para spec chiquito (<2h)
- 4-6 flujos para spec mediano (2-5h)
- 7-10 flujos para spec grande (5h+)]

---

## 11. Impacto en handover

Documentos de `.claude/specs/handover/` a crear o actualizar al terminar este spec:

- **[NOMBRE_DOC.md]** -> [que se agrega o cambia]
- **N/A** [si ningun doc aplica]

---

## 12. Riesgos y mitigaciones

| # | Riesgo | Probabilidad | Impacto | Mitigacion |
|---|---|---|---|---|
| 1 | [Descripcion del riesgo] | [Alta/Media/Baja] | [Alto/Medio/Bajo] | [Como se mitiga] |
| 2 | [...] | [...] | [...] | [...] |

---

## 13. Selectores criticos (NO MODIFICAR en implementacion)

> **REGLA:** Esta tabla se completa durante el pre-flight (seccion 0) y NO se modifica durante implementacion.
> Si un selector se rompe, la regresion es inmediata y visible en produccion.

| Selector / Concepto | Donde se usa | Riesgo si se rompe |
|---|---|---|
| [Query Prisma critica] | [archivo:linea] | [Que deja de funcionar] |
| [Campo de enum] | [Schema + queries] | [Build error / data corruption] |
| [Componente reutilizado] | [archivos que lo importan] | [UI rota en N paginas] |
| [Ruta API] | [frontend que la consume] | [Feature completa deja de funcionar] |
| [Config/env var] | [donde se lee] | [Runtime error en deploy] |

---

## 14. Plan de implementacion

[Pasos ordenados con estimacion de tiempo. Cada paso debe ser un commit atomico.]

1. **[Paso 1] (X min)** — [Que se hace]
2. **[Paso 2] (X min)** — [Que se hace]
3. **[Paso N] (X min)** — [Que se hace]

**Total estimado: Xh Xmin**

---

**Fin del SPEC N — [ID]**

> Una vez terminado el spec, el QA correspondiente se crea como `.claude/auditorias/QA_v4-[id]-[slug].md` siguiendo `TEMPLATE_QA_V4.md`.
