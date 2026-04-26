# Spec: Formato ampliado de QA para V3

- **Versión:** V3
- **Origen:** propuesta del equipo — Sergio + necesidad de los 4 compañeros
- **Asignado a:** Gerardo
- **Prioridad:** Crítica — bloquea todos los QAs siguientes de V3

---

## ANTES DE ARRANCAR

- [ ] V2 cerrado (merge a main del 22/04/2026)
- [ ] `tools/generate-qa.js` funcional (generador V2)
- [ ] `TEMPLATE_QA.md` versión V2 disponible

---

## 1. Contexto

En V2 el formato de QA se consolidó con los aportes de Sergio: 5 ejes estructurados (funcionalidad, navegabilidad, casos borde, performance, consistencia visual), pasos de navegación con rol/URL/acción/esperado/resultado, y casos borde con ataques reales como bypass desde DevTools. Este formato funcionó muy bien — permitió encontrar bugs de seguridad que nadie encontraría con testing intuitivo.

Pero V3 introduce dos cambios importantes que el formato actual no cubre:

**1. Equipo ampliado con 4 perfiles interdisciplinarios**
Hasta ahora Sergio era el único QA — perfil técnico. En V3 se suman 4 compañeros con perfiles no-técnicos (politólogo, economista, sociólogo, contador). Necesitan:
- Contexto del dominio textil al inicio de cada QA para entender el flujo desde la lógica institucional
- Preguntas específicas para su expertise, no solo checkboxes técnicos
- Separación clara entre qué audita cada perfil

**2. Distinción Verificador QA vs DEV**
Algunos ítems solo son verificables desde código (ej: "el endpoint corre con runtime nodejs"), otros solo desde la UI (ej: "el botón aprobar muestra spinner mientras procesa"). En V2 mezclamos todo y Sergio se atascaba en ítems que requerían mirar código. V3 separa explícitamente.

Este spec define el formato ampliado para todos los QAs de V3 y actualiza el generador para producirlos automáticamente.

---

## 2. Qué construir

1. **Nuevo `TEMPLATE_QA.md` versión V3** — con Eje 6 (validación de dominio), columna Verificador QA/DEV, sección de contexto textil
2. **Actualización de `tools/generate-qa.js`** — parsear el nuevo formato y generar HTML que soporte los 6 ejes
3. **Estructura por perfil auditor** — cada ítem del Eje 6 está etiquetado con el perfil que lo audita (Politólogo/Economista/Sociólogo/Contador/Todos)
4. **Ejemplo completo** — un QA de referencia escrito con el formato nuevo (usando el spec V3 de separar ambientes como ejemplo)
5. **Migración de QAs V2** — documentación sobre qué hacer con los 14 QAs existentes (quedan como están, V2 está cerrado)

---

## 3. Estructura del nuevo QA

### 3.1 — Secciones obligatorias

```markdown
# QA: [NOMBRE DEL SPEC]

**Spec:** `[nombre-spec].md`
**Commit de implementación:** `[hash]`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** [fecha]
**Auditor(es):** Sergio (técnico) + [perfiles aplicables]
**Incluye Eje 6 de validación de dominio:** sí / no
**Perfiles aplicables:** politólogo, economista, sociólogo, contador

---

## Contexto institucional

[Breve párrafo explicando qué representa este spec en la realidad del sector textil argentino.
Por ejemplo: "Este flujo simula el registro de un taller familiar en Florencio Varela que busca
formalizar su operación para acceder a mejores clientes. La CUIT se verifica contra ARCA
automáticamente — hoy el taller depende de trámites manuales para probar su inscripción."]

---

## Objetivo de este QA

[Qué se está probando y por qué importa para OIT/Estado/talleres]

---

## Cómo trabajar con este documento

1. Abrí este archivo y la plataforma en paralelo
2. Identificá qué ítems te corresponden según tu perfil (columna Verificador)
3. Seguí los pasos en orden — cada paso depende del anterior
4. Marcá cada resultado con ✅ (ok), 🐛 (bug menor) o ❌ (bloqueante)
5. Si el resultado no es ✅ → abrí el widget azul "Feedback" → tipo [bug/falta/confusión] → describí qué pasó
6. Al terminar, completá el resultado global y commiteá este archivo actualizado

**Regla de oro:** un issue por hallazgo, desde la página donde ocurre.

---

## Credenciales de prueba

[tabla existente con 8 roles]

---

## Resultado global

- [ ] ✅ Aprobado — todo funciona
- [ ] 🔧 Aprobado con fixes — funciona pero hay bugs menores
- [ ] ❌ Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decisión:** [ cerrar v3 / fix inmediato / abrir ítem v4 ]
**Issues abiertos:** # (links a GitHub)

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptación del spec está implementado.

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | [criterio del spec] | QA / DEV | ✅ / 🐛 / ❌ | # |

---

## Eje 2 — Navegabilidad

Pasos de navegación en orden. Cada paso es una acción concreta.

### Paso N — [descripción]

- **Rol:** [qué usuario usar]
- **URL de inicio:** [dónde empezar]
- **Verificador:** QA (mirando la UI) / DEV (mirando código/DB)
- **Acción:** [paso a paso]
- **Esperado:** [qué debería pasar]
- **Resultado:** [ ✅ / 🐛 / ❌ ]
- **Notas:** [observaciones libres]

---

## Eje 3 — Casos borde

| # | Caso | Acción | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | [caso] | [qué hacer] | [qué debe pasar] | QA / DEV | ✅ / 🐛 / ❌ |

---

## Eje 4 — Performance

| Verificación | Método | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Página carga en < 3s | DevTools → Network | QA | ✅ / 🐛 |
| Sin errores en consola | DevTools → Console | QA | ✅ / 🐛 |
| Query Prisma < 200ms | Vercel Logs | DEV | ✅ / 🐛 |

---

## Eje 5 — Consistencia visual

| Verificación | Resultado | Notas |
|-------------|-----------|-------|
| Tipografías consistentes (Overpass para títulos) | ✅ / 🐛 | |
| Colores del design system | ✅ / 🐛 | |
| Textos en español argentino (vos/tenés) | ✅ / 🐛 | |

---

## Eje 6 — Validación de dominio (perfiles interdisciplinarios)

Preguntas específicas para cada perfil. Se responde con texto libre + ✅/🐛.

### Politólogo — Relación con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | ¿El flujo refleja correctamente la relación entre Estado y sector privado? | ✅ / 🐛 | |
| 2 | ¿Los incentivos alineados entre actores (taller, marca, Estado)? | ✅ / 🐛 | |

### Economista — Incentivos y métricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | ¿La estructura de niveles (Bronce/Plata/Oro) crea incentivos correctos para formalizar? | ✅ / 🐛 | |
| 2 | ¿El matching marca-taller optimiza algo claro (costo, calidad, capacidad)? | ✅ / 🐛 | |

### Sociólogo — Lenguaje y accesibilidad

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | ¿El lenguaje es comprensible para un taller familiar sin estudios técnicos? | ✅ / 🐛 | |
| 2 | ¿Hay barreras de entrada implícitas (vocabulario, supuestos culturales)? | ✅ / 🐛 | |

### Contador — Flujos fiscales y operativos

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | ¿Los documentos requeridos coinciden con la realidad fiscal del sector? | ✅ / 🐛 | |
| 2 | ¿El flujo de formalización es viable para un monotributista? | ✅ / 🐛 | |

**Nota:** El Eje 6 solo se incluye si el spec tiene aspectos de dominio textil/institucional. Specs puramente técnicos (ej: rate limiting, cookies de sesión) pueden omitir este eje — lo indica el flag en el encabezado.

---

## Resumen de issues abiertos

| Issue | Tipo | Descripción | Perfil que lo encontró | Prioridad |
|-------|------|-------------|------------------------|-----------|

---

## Notas de los auditores

**Sergio (técnico):**
[observaciones técnicas sobre implementación, seguridad, performance]

**Perfiles interdisciplinarios:**
[observaciones sobre lógica institucional, lenguaje, incentivos, contexto del sector]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptación del spec verificados
- [ ] Casos borde probados (incluyendo ataques desde DevTools)
- [ ] Performance revisada en desktop y móvil
- [ ] Eje 6 completado por cada perfil aplicable
- [ ] Issues abiertos en GitHub con labels correctos (piloto, perfil-X)
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
```

### 3.2 — Eje 6 condicional

El Eje 6 **solo aparece** si el spec tiene aspectos de dominio. Se activa con un flag en el encabezado del QA:

```markdown
**Incluye Eje 6 de validación de dominio:** sí
**Perfiles aplicables:** politólogo, economista, sociólogo, contador
```

> **Nota:** No usar frontmatter YAML. El patrón `**Key:** value` que usa el template actual es suficiente y consistente con el resto de los metadatos del header. `parsearMetadata` ya lee este formato con regex simples — agregar 2 campos nuevos son 3 líneas de código.

Specs técnicos sin dominio (rate limiting, cookies, logs) ponen `no` y el generador omite el eje.

Specs con dominio pero solo un perfil relevante (ej: ARCA integration → solo contador) especifican la lista.

---

## 4. Actualización de `tools/generate-qa.js`

### 4.1 — Parseo del nuevo formato

Funciones exactas a modificar en `tools/generate-qa.js`:

**`parsearMetadata` (línea 27)** — agregar 3 regex nuevos:
```javascript
const eje6Match = header.match(/\*\*Incluye Eje 6.*?:\*\*\s*(.+)$/m)
if (eje6Match) meta.incluyeEje6 = normalizar(eje6Match[1]) === 'si'

const perfilesMatch = header.match(/\*\*Perfiles aplicables:\*\*\s*(.+)$/m)
if (perfilesMatch) meta.perfiles = perfilesMatch[1].split(',').map(p => p.trim())

const auditorMatch = header.match(/\*\*Auditor\(es\):\*\*\s*(.+)$/m)
// reemplaza el regex actual de Auditor (línea 46)
```

**`SECCION_MAP` (línea 467)** — agregar 4 entries:
```javascript
'contexto institucional': renderContextoInstitucional,  // nuevo (~10 líneas)
'objetivo de este qa': renderObjetivo,                    // nuevo (~5 líneas)
'eje 6': renderEje6,                                      // nuevo (~40 líneas, parsea ### por perfil)
'notas de los auditores': renderNotasAuditores,           // variante de renderNotasAuditor
```

**`renderEje1`, `renderEje3`, `renderEje4`** — agregar badge Verificador (~5 líneas por eje):
```javascript
// En cada render, después de parsear la fila:
const verificador = f.verificador || 'QA'
const badgeClass = verificador.includes('DEV') ? 'badge-dev' : 'badge-qa'
// Agregar al HTML: <span class="${badgeClass}">${verificador}</span>
```

**`copiarResultados` (línea 805 del JS inline)** — agregar bloque para Eje 6 (~15 líneas):
```javascript
// Similar a los bloques de Eje 1-5, iterando #eje6 .item-card
const eje6Cards = document.querySelectorAll('#eje6 .item-card')
if (eje6Cards.length > 0) { /* ... */ }
```

**Total: ~80-100 líneas aditivas** en un archivo de ~1100 líneas. Nada se reescribe — todo es extensión del código existente.

### 4.2 — Filtros en la UI

> **Nota:** El patrón `display: none` ya existe en el generador (líneas 533, 654, 704 del CSS). Los filtros solo requieren agregar atributos `data-verificador` y `data-perfil` a cada `.item-card`, más 4 botones al inicio del HTML y ~15 líneas de JS inline.

El HTML generado tiene filtros al inicio:
- Botón "Ver solo ítems para Sergio (QA técnico)"
- Botón "Ver solo ítems para mí (según perfil)" — dropdown de perfiles
- Botón "Ver solo ítems DEV"
- Botón "Ver todos"

Implementación:

```javascript
function filtrarPor(tipo) {
  document.querySelectorAll('.item-card, .paso-card').forEach(c => {
    if (tipo === 'todos') { c.style.display = ''; return }
    c.style.display = c.dataset.verificador === tipo ? '' : 'none'
  })
  // Ocultar/mostrar secciones vacías
  document.querySelectorAll('.section').forEach(s => {
    const items = s.querySelectorAll('.item-card:not([style*="none"]), .paso-card:not([style*="none"])')
    // Solo ocultar ejes, no secciones como resultado global
    if (s.id?.startsWith('eje') && items.length === 0) s.style.display = 'none'
    else s.style.display = ''
  })
}
```

### 4.3 — Renderizado del Eje 6

> **Nota:** Zero código nuevo para acordeones. Se reutiliza la función `toggleCollapse` existente (líneas 737-745 del JS) con el mismo patrón que usan Credenciales y Pasos del Eje 2.

Cada perfil tiene su propia sección colapsable. Por defecto colapsadas — el usuario expande la que le corresponde:

```html
<div class="section collapsible collapsed" onclick="toggleCollapse(this)">
  <h2>Politólogo — Relación con el Estado <span class="collapse-icon">&#9654;</span></h2>
  <div class="collapse-content">
    <!-- items del perfil, mismo formato que Eje 1 -->
  </div>
</div>
```

El `renderEje6` parsea las subsecciones `###` dentro del Eje 6, filtra por los perfiles indicados en `meta.perfiles`, y genera un acordeón colapsable por cada perfil.

---

## 5. Ejemplo completo

Archivo de referencia: `.claude/docs/EJEMPLO_QA_V3.md`

Contiene un QA escrito con el formato completo usando el spec `v3-separar-ambientes` como caso. Sirve de:
- Guía visual para Gerardo al escribir QAs nuevos
- Material de onboarding para los 4 compañeros
- Caso de prueba del generador

---

## 6. Migración de QAs V2 y GitHub Action

Los 14 QAs existentes de V2 **no se migran** — V2 está cerrado, los QAs quedan como prueba histórica. Todos los QAs de V3 usan el formato nuevo desde el primer spec.

La GitHub Action (`qa-pages.yml`) y el generador necesitan 3 cambios para procesar los QAs V3:

**Cambio 1 — Trigger paths** (línea 7 de `qa-pages.yml`):
```yaml
paths:
  - '.claude/auditorias/QA_v2-*.md'
  - '.claude/auditorias/QA_v3-*.md'    # agregar
  - 'tools/generate-qa.js'
```

**Cambio 2 — Loop de generación** (línea 27 de `qa-pages.yml`):
```bash
for f in .claude/auditorias/QA_v2-*.md .claude/auditorias/QA_v3-*.md; do
  node tools/generate-qa.js "$f"
done
```

**Cambio 3 — Index generator** (línea 1067 de `generate-qa.js`):
```javascript
.filter(f => (f.startsWith('QA_v2-') || f.startsWith('QA_v3-')) && f.endsWith('.md'))
```

---

## 7. Casos borde

- **Spec técnico sin Eje 6** — el generador reconoce el flag `Incluye Eje 6 de validación de dominio: no` y omite la sección completamente. Doble protección: si la sección `## Eje 6` no existe en el markdown, `encontrarRenderer` no la encuentra.

- **Spec con un solo perfil aplicable** — el generador muestra solo esa sección del Eje 6, oculta las demás.

- **Campo Verificador faltante en una tabla** — default a "QA" (retrocompatible con formato V2).

- **Auditor abre QA y no es Sergio** — el filtro por perfil le muestra solo sus ítems. Si no selecciona perfil, ve todo.

- **Issue creado desde el Eje 6** — el label de GitHub incluye el perfil que lo creó (`perfil-politologo`, `perfil-economista`, etc) para poder filtrar después.

---

## 8. Criterios de aceptación

- [ ] `TEMPLATE_QA.md` versión V3 creado con los 6 ejes + columna Verificador + contexto institucional
- [ ] `tools/generate-qa.js` actualizado para parsear el nuevo formato
- [ ] HTML generado tiene filtros por perfil (QA técnico, perfiles interdisciplinarios, DEV, todos)
- [ ] Eje 6 colapsable por perfil, omitido cuando el flag es `no`
- [ ] Ejemplo completo en `.claude/docs/EJEMPLO_QA_V3.md`
- [ ] Badge visual de Verificador (QA azul / DEV gris)
- [ ] Issues creados desde Eje 6 incluyen label del perfil
- [ ] QAs V2 siguen siendo accesibles pero no se regeneran
- [ ] GitHub Action procesa tanto `QA_v2-*.md` como `QA_v3-*.md`
- [ ] Index generator lista QAs de ambas versiones
- [ ] `tools/generate-qa.test.js` con tests del nuevo formato pasando
- [ ] Build sin errores

---

## 9. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | QA con flag Eje 6 sí genera HTML con 6 ejes | Crear QA de prueba, correr generador | DEV |
| 2 | QA con flag Eje 6 no omite la sección | Crear QA técnico, verificar HTML sin Eje 6 | DEV |
| 3 | Filtro "ver solo ítems QA" oculta ítems DEV | Click en filtro en HTML | QA |
| 4 | Filtro "ver solo mi perfil" funciona | Seleccionar perfil, verificar filtrado | QA |
| 5 | Badges Verificador se muestran correctamente | QA con mix de QA/DEV, verificar colores | QA |
| 6 | Eje 6 colapsado por defecto | Abrir HTML generado, verificar acordeón cerrado | QA |
| 7 | Issue desde Eje 6 incluye label del perfil | Crear issue desde sección sociólogo, verificar label en GitHub | QA |
| 8 | QAs V2 siguen accesibles en GitHub Pages | Abrir URL de V2, verificar que renderiza | QA |
| 9 | GitHub Action triggerea con QA_v3-*.md | Push un QA_v3, verificar que el workflow corre | DEV |

---

## 10. Dependencias para specs siguientes

Este spec es **prerequisito** para todos los specs de V3 que generen QA. Una vez commiteado:

1. Los specs siguientes (Bloque 2 en adelante) generan QAs con el formato nuevo
2. El primer QA con formato V3 es el del spec `v3-separar-ambientes` (ya escrito antes de este, se migra)
3. Los QAs generados tienen la columna Verificador poblada desde el spec

---

## 11. Referencias

- `TEMPLATE_QA.md` versión V2 (base del trabajo)
- QAs de V2 como ejemplo de profundidad esperada (`QA_v2-epica-academia.md` es el más completo)
- V3_BACKLOG → T-05 (Protocolo de validación funcional para equipo interdisciplinario)
