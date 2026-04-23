# Spec: Generador QA — `.md` → `.html` interactivo

**Semana:** v2 / tooling
**Asignado a:** Gerardo
**Tipo:** Script de tooling (no toca el proyecto Next.js)
**Archivo de salida:** `tools/generate-qa.js`

---

## 1. Contexto

El flujo actual de auditorías requiere que Sergio edite el `.md` directamente, escribiendo resultados entre corchetes (`[ Ok ]`, `[ bug: no carga ]`). Esto es lento, propenso a errores de formato, y no escala bien a medida que los QAs crecen en complejidad.

Este spec crea un script Node.js que toma cualquier `QA_v2-xxx.md` y genera un `QA_v2-xxx.html` standalone interactivo. Sergio abre el HTML con doble click, ejecuta la auditoría con clicks y campos de texto, y al final copia el resultado como markdown para pegarlo en el `.md` original.

El `.md` sigue siendo la fuente de verdad y el entregable que se commitea. El `.html` es una herramienta descartable — se regenera siempre desde el `.md`.

---

## 2. Alcance

**Este spec incluye:**
- Script `tools/generate-qa.js` que parsea el `.md` y genera el `.html`
- HTML standalone (sin servidor, sin dependencias externas, funciona con doble click)
- Checkboxes ✅ / 🐛 / ❌ para cada ítem verificable
- Campo de texto libre por ítem (visible siempre, no solo al fallar)
- Sección "Notas del auditor" como textarea grande
- Botón "Copiar resultados como markdown" que genera el bloque final
- Los HTMLs generados van a `.gitignore`

**Este spec NO incluye:**
- Integración con GitHub Issues (es la Parte 2, spec separado)
- Watch mode ni regeneración automática
- UI compleja ni frameworks — vanilla JS en un solo archivo HTML

---

## 3. Convención de formato del `.md`

El parser asume esta estructura mínima, que ya siguen todos los QAs existentes:

```
# QA: [título]                        ← título del documento
**Spec:** `[nombre]`                  ← metadata
**Commit de implementación:** `[hash]` ← metadata
**URL de prueba:** [url]              ← metadata
**Fecha:** [fecha]                    ← metadata
**Auditor:** [nombre]                 ← metadata

## Cómo trabajar con este documento   ← instrucciones para Sergio (solo lectura)
## Credenciales de prueba             ← tabla de usuarios/passwords (solo lectura)
## Resultado global                   ← sección especial con checkboxes de veredicto
## Eje 1 — Funcionalidad              ← tabla: | # | Criterio | Resultado | Issue |
## Eje 2 — Navegabilidad              ← pasos con campos Resultado y Notas
## Eje 3 — Casos borde                ← tabla: | # | Caso | Accion | Esperado | Resultado |
## Eje 4 — Performance                ← tabla: | Verificacion | Metodo | Resultado |
## Eje 5 — Consistencia visual        ← tabla: | Verificacion | Resultado | Notas |
## Resumen de issues abiertos         ← sección editable de texto libre
## Notas del auditor                  ← textarea libre
## Checklist de cierre                ← checkboxes finales
```

**Regla de normalización:** los headings se matchean ignorando tildes y mayúsculas (`Como` = `Cómo`, `Epica` = `Épica`). Los QAs más viejos no tienen tildes; los nuevos sí.

**Regla de robustez:** si el parser encuentra una sección que no reconoce, la renderiza como texto plano sin romper el HTML. Nunca falla silenciosamente.

---

## 4. Comportamiento del HTML generado

### Cómo trabajar con este documento
- Renderizado como bloque de texto solo lectura (colapsado por defecto)
- No genera campos editables — es contexto para Sergio

### Header
- Título del QA, spec de referencia, commit, fecha, auditor
- URL de prueba como link clickeable
- Tabla de credenciales de prueba (copiada del `.md`, solo lectura)

### Resultado global
- Tres radio buttons: ✅ Aprobado / 🔧 Aprobado con fixes / ❌ Rechazado
- Campo de texto "Decisión" (cerrar v2 / fix inmediato / abrir ítem v3)

### Eje 1 — Funcionalidad
- Cada fila de la tabla se convierte en un ítem con:
  - Número y criterio (texto del `.md`)
  - Selector de resultado: ✅ / 🐛 / ❌ (botones, no dropdown)
  - Campo de texto libre "Observaciones" (siempre visible)

### Eje 2 — Navegabilidad
- Cada `### Paso N` se convierte en una card expandible con:
  - Título del paso
  - Campos Rol, URL de inicio, Acción, Esperado (texto del `.md`, solo lectura)
  - Selector ✅ / 🐛 / ❌
  - Textarea "Resultado / Notas" (editable, pre-poblada con el placeholder del `.md` si existe)

### Eje 3 — Casos borde
- Tabla con columnas: `| # | Caso | Accion | Esperado | Resultado |`
- Cada fila se convierte en un ítem con:
  - Número, caso, acción y esperado (texto del `.md`, solo lectura)
  - Selector de resultado: ✅ / 🐛 / ❌ (botones)
  - Campo de texto libre "Observaciones"

### Eje 4 — Performance
- Tabla con columnas: `| Verificacion | Metodo | Resultado |`
- Cada fila: texto de verificación y método (solo lectura) + checkbox binario (✅ / 🐛) + campo de notas opcional

### Eje 5 — Consistencia visual
- Tabla con columnas: `| Verificacion | Resultado | Notas |`
- Cada fila: texto de verificación (solo lectura) + checkbox binario (✅ / 🐛) + campo de notas opcional

### Resumen de issues abiertos
- Textarea editable para listar los issues creados durante la auditoría
- Pre-poblado con placeholder: "Listar issues abiertos con # y descripción breve"

### Notas del auditor
- Textarea grande, sin estructura, completamente libre

### Checklist de cierre
- Checkboxes clickeables, uno por ítem del `.md`

### Botón "Copiar resultados"
- Siempre visible, fijo en la parte inferior de la pantalla
- Al hacer click genera este bloque markdown y lo copia al clipboard:

```markdown
## Resultados — [nombre del spec]
**Fecha de auditoría:** [fecha actual]
**Auditor:** Sergio

### Resultado global
[veredicto seleccionado]
**Decisión:** [texto ingresado]

### Eje 1 — Funcionalidad
| # | Criterio | Resultado | Observaciones |
|---|----------|-----------|---------------|
| 1 | [criterio] | ✅ | [texto] |
| 2 | [criterio] | 🐛 | [texto] |

### Eje 2 — Navegabilidad
**Paso 1 — [título]:** ✅
**Paso 2 — [título]:** 🐛 — [notas]

### Eje 3 — Casos borde
| # | Caso | Accion | Esperado | Resultado | Observaciones |
|---|------|--------|----------|-----------|---------------|

### Resumen de issues abiertos
[contenido del textarea]

### Notas del auditor
[contenido del textarea]

### Checklist de cierre
- [x] ítem completado
- [ ] ítem pendiente
```

---

## 5. Implementación técnica

### Archivo: `tools/generate-qa.js`

Script Node.js, sin dependencias de npm (solo módulos built-in: `fs`, `path`).

```
Uso: node tools/generate-qa.js .claude/auditorias/QA_v2-xxx.md
Salida: .claude/auditorias/QA_v2-xxx.html (misma carpeta que el .md)
```

**Estructura interna del script:**

```
1. Leer el .md con fs.readFileSync
2. Parsear secciones por headings (## y ###)
3. Para cada sección, aplicar el renderer correspondiente
4. Ensamblar el HTML final con template string
5. Escribir el .html en la misma carpeta
```

**El HTML generado:**
- Todo en un solo archivo (CSS y JS inline)
- Sin dependencias externas (no CDN, no imports)
- Colores del design system: brand-blue `#1e3a5f`, brand-red `#c0392b`
- Tipografía: system-ui (no requiere carga de fuentes)
- Responsive: funciona en desktop y mobile

### `.gitignore`
Agregar al `.gitignore` del repo:
```
.claude/auditorias/*.html
```

---

## 6. Criterios de aceptación

- [ ] `node tools/generate-qa.js QA_v2-config-piloto-pre-deploy.md` genera el HTML sin errores
- [ ] El HTML abre con doble click en el navegador (sin servidor)
- [ ] Todos los ítems de Eje 1 tienen selector ✅/🐛/❌ y campo de observaciones
- [ ] Todos los pasos de Eje 2 tienen selector + textarea pre-poblado
- [ ] Botón "Copiar resultados" copia markdown válido al clipboard
- [ ] El markdown copiado incluye todos los ejes con los valores seleccionados
- [ ] Si el `.md` tiene una sección desconocida, el HTML la muestra como texto sin romper
- [ ] Funciona con los 12 QAs existentes en `.claude/auditorias/`
- [ ] El `.html` generado NO se commitea (cubierto por `.gitignore`)

---

## 7. Tests

El script es tooling puro — no vive en el proyecto Next.js y no usa Vitest. Los tests van en `tools/generate-qa.test.js` y se corren con Node directamente:

```bash
node tools/generate-qa.test.js
```

Salida esperada: lista de `✅ PASS` / `❌ FAIL` por cada caso. Sin framework de testing.

### Tests del parser

| # | Qué testear | Fixture | Esperado |
|---|-------------|---------|----------|
| 1 | Parseo de metadata | `.md` con `**Spec:**`, `**Fecha:**`, `**Auditor:**` | Objeto `{ spec, fecha, auditor }` con valores correctos |
| 2 | Detección de secciones | `.md` con los 7 headings `##` estándar | Array de 7 secciones con nombre y contenido correcto |
| 3 | Parser Eje 1 — tabla | Tabla markdown con 3 filas | Array de 3 objetos `{ numero, criterio }` |
| 4 | Parser Eje 2 — pasos | Dos `### Paso N` con campos `**Rol:**`, `**URL:**`, `**Acción:**`, `**Esperado:**` | Array de 2 objetos con todos los campos extraídos |
| 5 | Parser Eje 3 — tabla | Tabla markdown con columnas `# | Caso | Accion | Esperado | Resultado` y 2 filas | Array de 2 objetos `{ numero, caso, accion, esperado }` |
| 6 | Parser checklist de cierre | Lista de `- [ ]` con 5 ítems | Array de 5 strings con el texto de cada ítem |
| 7 | Sección desconocida | `## Sección Inventada` con texto libre | Sección renderizada como texto plano, sin error |
| 8 | `.md` mínimo (solo título y metadata) | Fixture sin ejes | HTML generado válido, sin crash |
| 9 | Normalización de tildes | Heading `## Como trabajar` (sin tilde) | Sección reconocida igual que `## Cómo trabajar` |

### Tests de integración — los 12 QAs reales

```javascript
// Para cada archivo en .claude/auditorias/QA_v2-*.md:
// 1. Correr el generador
// 2. Verificar que el .html se creó
// 3. Verificar que el .html contiene el título del QA
// 4. Verificar que el .html contiene el botón "Copiar resultados"
// 5. Verificar que el .html no contiene "undefined" ni "[object Object]"
```

Este test de integración es el más importante: garantiza que cualquier variación real entre QAs no rompe el generador.

### Tests del HTML generado — comportamiento JS

Estos se verifican manualmente abriendo el HTML en el browser (no son automatizables sin Playwright):

| # | Acción | Esperado |
|---|--------|----------|
| 1 | Click en ✅ de un ítem | Ítem queda marcado visualmente, los otros se desmarcan |
| 2 | Escribir en campo Observaciones | El texto queda guardado en el estado del HTML |
| 3 | Click "Copiar resultados" sin completar nada | Markdown copiado con todos los ítems en estado `—` (sin marcar) |
| 4 | Click "Copiar resultados" con ítems marcados | Markdown refleja exactamente lo que Sergio seleccionó |
| 5 | Recargar el HTML | Estado se resetea (no persiste — es intencional) |

---

## 8. Nota para la Parte 2

Este spec es deliberadamente independiente de GitHub. La integración de issues (botón "Crear issue" por ítem fallido con contexto del spec pre-cargado) se implementa en un spec separado `v2-generador-qa-issues.md` una vez que Sergio valide que el HTML es útil en la práctica.

La separación garantiza que si el parser tiene problemas con algún `.md` — lo que los tests de integración de la sección 7 van a detectar — se resuelve aquí sin tocar la lógica de GitHub.
