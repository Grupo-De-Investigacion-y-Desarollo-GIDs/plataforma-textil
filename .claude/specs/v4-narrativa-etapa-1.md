# SPEC — V4-NARRATIVA-E1: Narrativa V4 Etapa 1 (renombres + reordenamiento de tabs, sin "X de 7" en vidriera pública)

> **Plantilla V4.** Spec de SCOPE RECORTADO: cubre solo la porción **copy/UI sin schema ni lógica** de la Etapa 1 del narrativa (§1.1 renombres+reorden y §1.2 quitar "X de 7"). Los sub-cambios §1.3 (Modelo B de visibilidad) y §1.4 (vitrina con info de marca) **se difieren a specs propios** porque requieren schema y lógica — ver §2 y la decisión de scope D-A.

---

## 0. Pre-flight checks (BLOQUEANTE)

### 0.1 Verificación de dependencias

- [x] No hay specs bloqueantes mergeados pendientes — Etapa 1 es post-U y autónoma
- [x] Archivos referenciados EXISTEN en develop (verificados en discovery: `institutional.ts`, `header.tsx`, `user-sidebar.tsx`, páginas de marca, `checklist-sec9-10.spec.ts`)
- [x] `develop` actualizada al momento del discovery (2026-06-08)
- [x] El spec previo `v4-renombres-tabs-taller.md` (commit `eb87a48`) ya hizo la **primera** tanda de renombres de TALLER. Este spec es el **delta** sobre ese estado.

### 0.2 Verificación de schema y datos

- [x] **N/A — este spec NO toca schema.** Solo cambia labels visibles y quita un texto. No se agregan campos, tablas ni migraciones.

### 0.3 Discovery de impacto técnico

Estado **actual** (post `eb87a48` + F1/F3 `#375`) verificado en código:

`src/compartido/lib/content/institutional.ts` → `TABS_BY_ROLE`:

```ts
TALLER: [
  { label: 'Inicio',       href: '/taller' },
  { label: 'Pedidos',      href: '/taller/pedidos' },        // ← debe ir AL FINAL
  { label: 'Mi recorrido', href: '/taller/formalizacion' },
  { label: 'Mi vidriera',  href: '/taller/perfil' },         // ← debe renombrarse a "Mi taller"
  { label: 'Cursos',       href: '/taller/aprender' },
],
MARCA: [
  { label: 'Tablero',     href: '/marca' },                  // ← "Inicio"
  { label: 'Directorio',  href: '/marca/directorio' },       // ← "Explorar talleres"
  { label: 'Mis pedidos', href: '/marca/pedidos' },          // ← "Pedidos" (al final)
  { label: 'Mi perfil',   href: '/marca/perfil' },           // ← "Mi marca" (2da posición)
],
```

- [x] **Tabs centralizados** en `TABS_BY_ROLE` (institutional.ts). El `header.tsx` los consume; no hay labels de sección duplicados en el sidebar (F3 desacopló: `user-sidebar.tsx` solo tiene accesos personales Notificaciones/Mi cuenta/Ayuda).
- [x] **NO hay i18n.** Los labels son literales centralizados (tabs) + literales inline en cada page (h1/headings). No hay archivo de copy ni librería de traducción.
- [x] **El renombre NO cambia rutas** — solo labels. `href` queda igual (`/marca/perfil`, `/marca/directorio`, etc.). Sin redirects ni links rotos.
- [x] **"X de 7 requisitos verificados"** aparece en exactamente **2 superficies públicas**:
  - `src/app/(public)/directorio/page.tsx:151` — `{taller.validaciones.length} de 7 requisitos verificados`
  - `src/app/(marca)/marca/directorio/page.tsx:206` — idéntico
  - (El `Módulo X de 7` en `taller/perfil/completar/page.tsx:254` es contador de wizard, **NO** se toca. La página pública `perfil/[id]` NO tiene "de 7".)
- [x] **Tests que assertan sobre estos textos:** `e2e/checklist-sec9-10.spec.ts` líneas 236 (TALLER) y 346 (MARCA) tienen `expectedItems` hardcodeados. **Ojo: ya están STALE** — referencian labels que ni siquiera coinciden con el estado actual ('Mi Tablero', 'Academia', 'Mi Panel', 'Directorio Talleres') y buscan links de sidebar que F3 (#375) ya eliminó. Es deuda pre-existente, no introducida por este spec (ver §12 R-3).

### 0.4 Verificación de componentes y patrones

- [x] `header.tsx` renderiza `TABS_BY_ROLE[userRole]` tal cual (no hardcodea labels) → cambiar el array alcanza para header.
- [x] Imports correctos (`@/compartido/lib/content/institutional`).

### 0.5 Reporte pre-flight

**Pasa**, con una corrección de scope respecto al narrativa literal:

| # | Problema | Narrativa dice | Realidad | Corrección |
|---|----------|----------------|----------|------------|
| C1 | MARCA target incluye tab **Cursos** (`/marca/aprender`) | §1.1 + §4.2: `Inicio · Mi marca · Explorar talleres · Cursos · Pedidos` | `/marca/aprender` **NO existe** — Academia para marcas es **Etapa 3** (§3.4, diferencia #17) | **Omitir "Cursos" del header MARCA en Etapa 1.** Se agrega en Etapa 3 junto con la ruta. |
| C2 | "Etapa 1 sin schema ni lógica" | El framing del prompt | La Etapa 1 del narrativa incluye §1.3 (Modelo B, 8-10h, requiere persistir toggles = schema) y §1.4 (vitrina info marca, requiere query/lógica) | **Diferir §1.3 y §1.4 a specs propios.** Este spec = solo §1.1 + §1.2. |

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **Tipo** | refactor visual (copy/UI) |
| **Bloque** | Narrativa V4 — Etapa 1 (porción copy/UI) |
| **Categoría** | MVP — bajo riesgo, alto impacto visible |
| **Estimación** | 4-6h (§1.1 ~3-4h + §1.2 ~1h + reconciliar e2e ~1h) |
| **Riesgo** | Bajo |
| **Dependencias** | Ninguna bloqueante. Coexiste con cierre de U-09/#398. |
| **Branch** | `feature/v4-narrativa-e1-renombres` |
| **Validación sectorial** | N/A — Diferida a validación grupal post-MVP V4 |
| **Perspectivas relevantes** | Sectorial (narrativa de tono al taller/marca) |
| **Autor** | Gerardo Breard |
| **Fecha de creación** | 2026-06-08 |
| **Aprobado por** | Gerardo (decisiones D-A, D-B, D-C cerradas — ver §2 "Decisiones cerradas") |
| **Issue GitHub vinculado** | N/A |
| **PR vinculado** | Pendiente |

---

## 2. Contexto

### Por qué existe este spec

La **Narrativa V4** (`.claude/specs/narrativa-V4-consolidado-niveles-1-a-4.md`, propuesta cerrada de Sergio) reorganiza el lenguaje del proyecto en 4 niveles y define un plan de implementación en 4 etapas. La **§4.4 (toggle multi-rol)** ya se ejecutó en U-04. La **Etapa 1** es el siguiente paso: cambios narrativos visibles de bajo riesgo.

La Etapa 1 del narrativa tiene 4 sub-cambios (§1.1–§1.4, ~14-16h totales). Este spec cubre **solo la porción copy/UI sin schema ni lógica**: §1.1 (renombres + reorden de tabs) y §1.2 (quitar "X de 7" de la vidriera pública). Los otros dos se difieren:

- **§1.3 Modelo B de visibilidad del perfil productivo (8-10h)** → spec propio. Requiere persistir toggles "Visible en directorio: SI/NO" por bloque del perfil = **cambios de schema** (campos/JSON de visibilidad por grupo) + lógica de filtrado en el render de la vidriera. Contradice "sin schema ni lógica".
- **§1.4 Vitrina con info de marca en cada pedido (Opción C híbrida, 2-3h)** → spec propio. Requiere traer datos de la marca en la query de `/taller/pedidos/disponibles` y respetar visibilidad = **lógica**, no solo copy.

### Qué resuelve

- Alinea los tabs de TALLER y MARCA con la narrativa "el viaje" (Pedidos = resultado, va al final; identidad "Mi taller"/"Mi marca" temprano).
- Protege al taller en la negociación con marcas: la vidriera pública deja de exponer "X de 7 requisitos" (que se lee como ranking), quedando solo Etapa + ARCA. El detalle "X de 7" sigue privado en Mi recorrido.

### Decisiones cerradas (Gerardo, 2026-06-08)

Las tres decisiones que estaban abiertas en el discovery quedaron resueltas y este spec las refleja:

- **D-A — CONFIRMADA: el spec cubre SOLO §1.1 + §1.2** (renombres/reorden de tabs + quitar "X de 7"). §1.3 (Modelo B de visibilidad por grupo) y §1.4 (vitrina con info de marca) **van a specs propios** porque tocan schema/lógica.
- **D-B — CONFIRMADA: SÍ alinear h1/encabezados** con los nuevos labels de tabs (coherencia visual header ↔ página).
- **D-C — CONFIRMADA: renombrar "Mi vidriera" → "Mi taller" AHORA** (no esperar a Etapa 2), para evitar re-renombrar dos veces. En Etapa 2 "Mi taller" pasará a ser paraguas con "Mi vidriera" como sub-tab.

### Specs futuros (diferidos de la Etapa 1)

- **§1.3 — Modelo B de visibilidad del perfil productivo por grupo** → spec propio pendiente (requiere schema: toggles "visible SI/NO" por bloque + lógica de filtrado en la vidriera).
- **§1.4 — Vitrina con info de marca en cada pedido (Opción C híbrida)** → spec propio pendiente (requiere lógica: traer datos de la marca en la query de `/taller/pedidos/disponibles` respetando visibilidad).

### Documentación de referencia

- `.claude/specs/narrativa-V4-consolidado-niveles-1-a-4.md` §1 (Etapa 1), §4.1–§4.2 (orden de tabs), §6 (3 dimensiones), §9 diferencias #4, #8, #21
- `.claude/specs/v4-renombres-tabs-taller.md` (primera tanda de renombres TALLER, ya mergeada `eb87a48`)

---

## 3. Validación interdisciplinaria

**Sectorial:** APLICA
- Observación: la vidriera pública es la cara del taller ante marcas. Mostrar "X de 7" invita a comparar talleres como un ranking de formalización, lo que precariza al que recién arranca. Decisión (ya tomada en narrativa, diferencia #4): la vidriera pública muestra **resultado agregado** (Etapa + ARCA), no proceso. Este spec la ejecuta.
- "Pedidos al final" refuerza el tono de acompañamiento (el pedido es consecuencia del viaje, no la primera presión comercial).

Resto de perspectivas: N/A — cambio de copy/orden sin impacto político/económico/contable.

---

## 4. Qué construir

### Funcionalidades

**§1.1 — Renombres + reorden de tabs (header).**

TALLER — estado final del array `TABS_BY_ROLE.TALLER`:

```
Inicio · Mi taller · Mi recorrido · Cursos · Pedidos
```
- Renombrar `Mi vidriera` → **`Mi taller`** (href `/taller/perfil` sin cambios).
- Reordenar: **Pedidos al final** (después de Cursos).
- Orden final: `Inicio(/taller) · Mi taller(/taller/perfil) · Mi recorrido(/taller/formalizacion) · Cursos(/taller/aprender) · Pedidos(/taller/pedidos)`.

> Nota narrativa: en **Etapa 2** "Mi taller" pasa a ser paraguas con sub-tabs "Mi vidriera" (público) + "Mi gestión productiva" (privado) (§2.1). En Etapa 1 solo se renombra el tab top; la página sigue siendo la actual.

MARCA — estado final del array `TABS_BY_ROLE.MARCA`:

```
Inicio · Mi marca · Explorar talleres · Pedidos
```
- Renombrar `Tablero` → **`Inicio`** (href `/marca`).
- Renombrar `Mi perfil` → **`Mi marca`** (href `/marca/perfil`) y moverlo a **2da posición**.
- Renombrar `Directorio` → **`Explorar talleres`** (href `/marca/directorio`).
- Renombrar `Mis pedidos` → **`Pedidos`** (href `/marca/pedidos`) y moverlo **al final**.
- **NO agregar "Cursos"** (ruta `/marca/aprender` no existe — Etapa 3). Ver pre-flight C1.
- Orden final: `Inicio(/marca) · Mi marca(/marca/perfil) · Explorar talleres(/marca/directorio) · Pedidos(/marca/pedidos)`.

**Capitalización (sentence case):** todos los labels resultantes ya quedan en sentence case. No hay nada extra que unificar en TALLER/MARCA. ESTADO no se toca (su renombre a COORD es Etapa 2).

**Alineación de h1/encabezados de página** (decisión D-B = CONFIRMADA SÍ): para que el header y el título de cada página no se contradigan, alinear el h1/título visible:
- `taller/perfil/page.tsx`: h1 `Mi vidriera` → `Mi taller`.
- `marca/perfil/page.tsx`: h1 `Mi perfil` → `Mi marca`.
- `marca/directorio/page.tsx`: h1 `Directorio` → `Explorar talleres`.
- `marca/pedidos/page.tsx`: h1 `Mis pedidos` → `Pedidos`.
- `marca/page.tsx`: h1/saludo `Tablero` → `Inicio` (si el h1 dice "Tablero"; si es un saludo personal, dejar).
- Breadcrumbs de sub-páginas de marca que digan los labels viejos → alinear.
- **NO** tocar prosa donde "directorio" es sustantivo común ("talleres del directorio").

**§1.2 — Quitar "X de 7 requisitos verificados" de la vidriera pública.**
- Eliminar la línea `{taller.validaciones.length} de 7 requisitos verificados` en:
  - `src/app/(public)/directorio/page.tsx:151`
  - `src/app/(marca)/marca/directorio/page.tsx:206`
- Conservar lo que ya muestra cada card de Etapa + estado ARCA (verificado). Si la card no muestra Etapa explícita, dejar el resto igual — el spec solo **quita** el "X de 7", no agrega.
- **NO** tocar el "X de 7" privado de Mi recorrido (`taller/formalizacion`) ni el contador de wizard `Módulo X de 7`.

### Wireframes o referencias visuales

Narrativa §4.1 (TALLER) y §4.2 (MARCA). Para Etapa 1, sin el dropdown ni la columna "Cursos" de MARCA.

### Consideraciones de lenguaje

Sentence case, "vos" coloquial. "Mi taller"/"Mi marca" = identidad. "Explorar talleres" = acción de la marca. (Nivel 5 copy fino queda pendiente, fuera de este spec.)

---

## 5. Datos (schema, modelos, queries)

**N/A — Spec visual/refactor sin cambios en schema.** No se agregan campos, tablas, índices ni migraciones. `taller.validaciones` se sigue consultando (se usa en Mi recorrido y en el conteo interno); solo se deja de **renderizar** el número en las cards públicas.

> Si al implementar se detecta que `validaciones` se incluía en la query SOLO para ese conteo de la card pública, se puede evaluar quitarlo del `include` para esa query puntual (optimización menor, opcional). No es requisito del spec.

---

## 6. Prescripciones técnicas

- **Tabs:** editar **únicamente** `TABS_BY_ROLE` en `src/compartido/lib/content/institutional.ts`. No hardcodear labels en `header.tsx`.
- **NO cambiar rutas (`href`).** Solo cambian `label` y el orden del array. Cero redirects, cero links nuevos.
- **NO tocar schema, enums, ni nombres internos** (componentes, feature flags, campos Prisma como `validaciones`/`certificadosAcademiaMin`). Es la misma regla que el spec previo `v4-renombres-tabs-taller.md`.
- **NO agregar el tab "Cursos" a MARCA** (Etapa 3).
- h1/encabezados: editar el literal inline en cada `page.tsx` correspondiente (D-B confirmada). Usar el mismo patrón de heading existente (no introducir componentes nuevos).
- §1.2: borrar el JSX de la línea "X de 7", sin reordenar el resto de la card.
- Tests: actualizar `e2e/checklist-sec9-10.spec.ts` (ver §10) para que los `expectedItems` reflejen el header final, o reconciliar con el autor si el test ya estaba roto (R-3).

### Librerías o paquetes nuevos

Ninguno.

### Convenciones del proyecto a mantener

`font-overpass`, colores brand, estructura de carpetas por grupo de layout, sin emojis en código.

---

## 7. Edge cases

| # | Caso límite | Comportamiento esperado |
|---|---|---|
| 1 | Tab activo detectado por `pathname` | Sigue funcionando: el match es por `href`, que no cambia. El reorden no afecta la detección. |
| 2 | Card de taller sin `validaciones` cargadas | Ya no se muestra el número; no hay "0 de 7". Sin regresión. |
| 3 | Multi-rol (toggle TALLER↔MARCA) | Cada modo ve su `TABS_BY_ROLE` con los labels nuevos. El header ya re-renderiza por `userRole`. |
| 4 | Usuario MARCA intenta `/marca/aprender` a mano | 404 como hoy (ruta no existe). No agregamos el tab justamente para no inducir el click. |
| 5 | Página pública `perfil/[id]` | No tenía "de 7" — no se toca. |

---

## 8. Validación sectorial

**N/A — Diferida a validación grupal post-MVP V4.** La decisión narrativa (#4, vidriera sin "X de 7") ya está cerrada por Sergio.

---

## 9. Criterios de aceptación

- [ ] Build de producción pasa sin errores
- [ ] Tests E2E existentes siguen pasando (con `checklist-sec9-10` reconciliado)
- [ ] Sin warnings nuevos de TS/ESLint
- [ ] Header TALLER muestra, en orden: **Inicio · Mi taller · Mi recorrido · Cursos · Pedidos**
- [ ] Header MARCA muestra, en orden: **Inicio · Mi marca · Explorar talleres · Pedidos** (sin "Cursos")
- [ ] h1/encabezados de las páginas alineados con los nuevos labels (decisión D-B)
- [ ] Las cards de `/directorio` (público) y `/marca/directorio` **no** muestran "X de 7 requisitos verificados"
- [ ] Mi recorrido (privado) **sí** sigue mostrando el detalle de verificación
- [ ] Las rutas (`href`) no cambiaron — sin links rotos
- [ ] Handover actualizado (§11)
- [ ] PR creado, QA de Sergio OK, mergeado a develop
- [ ] Verificación visual en preview OK

---

## 10. Tests (QAs basados en flujos)

### Flujo 1: Header TALLER — labels y orden
- **Rol:** taller
- **Pasos:** login taller → mirar la banda de tabs.
- **Resultado esperado:** `Inicio · Mi taller · Mi recorrido · Cursos · Pedidos` (Pedidos al final, "Mi taller" en 2da posición).
- **Tipo:** automatizado Playwright (assert orden + textos en `nav`).

### Flujo 2: Header MARCA — labels y orden, sin Cursos
- **Rol:** marca
- **Pasos:** login marca → mirar tabs.
- **Resultado esperado:** `Inicio · Mi marca · Explorar talleres · Pedidos`. **No** aparece "Cursos". Los links navegan a las rutas correctas (sin 404).
- **Tipo:** automatizado Playwright.

### Flujo 3: Navegación no se rompe
- **Rol:** taller y marca
- **Pasos:** clickear cada tab.
- **Resultado esperado:** cada tab abre su página (rutas intactas), tab activo resaltado correctamente.
- **Tipo:** automatizado (reusar el patrón de `checklist-sec9-10` 10.3 de recorrer rutas).

### Flujo 4: Vidriera pública sin "X de 7"
- **Rol:** no autenticado (`/directorio`) y marca (`/marca/directorio`)
- **Precondiciones:** al menos un taller verificado con validaciones parciales.
- **Pasos:** abrir el listado → inspeccionar una card.
- **Resultado esperado:** **no** aparece "X de 7 requisitos verificados". Sí el estado de verificación ARCA / etapa que ya mostraba.
- **Tipo:** automatizado Playwright (assert `not.toContainText('de 7 requisitos')`).

### Flujo 5: "X de 7" sigue en Mi recorrido (privado)
- **Rol:** taller
- **Pasos:** ir a `/taller/formalizacion`.
- **Resultado esperado:** el detalle de verificación (incluido el conteo) sigue visible. No hubo regresión por confundir superficies.
- **Tipo:** automatizado o manual.

### Flujo 6: Reconciliar `checklist-sec9-10.spec.ts`
- Actualizar `expectedItems` (líneas 236, 346) a los labels finales del header **o** confirmar que el test ya estaba roto por F3 y arreglar selectores/aria. Que el suite quede verde.
- **Tipo:** mantenimiento de test.

---

## 11. Impacto en handover

- **`.claude/specs/handover/`** → registrar: "Narrativa V4 Etapa 1 (copy/UI) ejecutada: tabs TALLER/MARCA renombrados+reordenados, 'X de 7' fuera de la vidriera pública. §1.3 (Modelo B) y §1.4 (vitrina info marca) diferidos a specs propios."
- Actualizar `ORDEN_IMPLEMENTACION.md` con el estado de Etapa 1 (porción copy/UI) y los dos sub-specs diferidos.

---

## 12. Riesgos y mitigaciones

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R-1 | Confundir "X de 7" público (quitar) con el de Mi recorrido (conservar) | Baja | Medio | Discovery acotó las 2 líneas exactas; Flujo 5 verifica que el privado sobrevive. |
| R-2 | Agregar "Cursos" a MARCA por seguir el narrativa literal → link 404 | Media | Medio | Pre-flight C1 lo prohíbe explícitamente; Flujo 2 lo testea. |
| R-3 | `checklist-sec9-10.spec.ts` ya está **stale** (labels y aria de pre-F3) → puede estar fallando o dar falso verde | Media | Bajo | Reconciliar en Flujo 6. Si se confirma roto de antes, anotar en `DEUDA_TECNICA.md` (T-*) que era deuda previa, no de este spec. |
| R-4 | "Mi taller" como tab choca con que la página aún es la vidriera (Etapa 2 la convierte en paraguas) | Baja | Bajo | Aceptado (D-C): en Etapa 1 el tab "Mi taller" abre la vidriera actual; Etapa 2 reestructura con sub-tabs. Se renombra ahora para no hacerlo dos veces. |

---

## 13. Selectores críticos (NO MODIFICAR en implementación)

| Selector / Concepto | Dónde se usa | Riesgo si se rompe |
|---|---|---|
| `href` de cada tab (`/taller/perfil`, `/marca/directorio`, etc.) | `TABS_BY_ROLE` + detección de tab activo en `header.tsx` | Si se cambia un href, se rompe la navegación y la detección de activo. **Solo se cambian `label` y orden.** |
| `taller.validaciones` (relación Prisma) | Mi recorrido + conteo interno | Si se quita del `include` equivocado, rompe Mi recorrido. Solo se deja de renderizar en cards públicas. |
| `TABS_BY_ROLE` (forma del objeto) | `header.tsx` lo consume por `userRole` | Cambiar la estructura (no los datos) rompería el header de todos los roles. |
| `aria-label` de tabs/nav | e2e que selecciona por rol/nombre | Mantener accesibilidad; e2e Flujo 1-3 dependen de los textos. |

---

## 14. Plan de implementación

1. **Tabs TALLER (15 min)** — en `institutional.ts`: renombrar `Mi vidriera`→`Mi taller`, reordenar Pedidos al final. Commit.
2. **Tabs MARCA (15 min)** — en `institutional.ts`: renombrar Tablero→Inicio, Mi perfil→Mi marca (2da), Directorio→Explorar talleres, Mis pedidos→Pedidos (final). Sin Cursos. Commit.
3. **h1/encabezados (45-60 min)** — alinear títulos de `taller/perfil`, `marca/perfil`, `marca/directorio`, `marca/pedidos`, `marca/page` + breadcrumbs de marca (decisión D-B). Commit.
4. **§1.2 quitar "X de 7" (30 min)** — borrar la línea en `(public)/directorio/page.tsx` y `(marca)/marca/directorio/page.tsx`. Commit.
5. **Reconciliar e2e (45-60 min)** — `checklist-sec9-10.spec.ts` expectedItems + cualquier assert de texto; agregar asserts de los Flujos 1, 2, 4. Commit.
6. **Verificación (30 min)** — build local (si toolchain lo permite) / CI, revisión visual en preview de los 2 roles.

**Total estimado: 4-6h**

---

**Fin del SPEC — V4-NARRATIVA-E1**

> §1.3 (Modelo B de visibilidad) y §1.4 (vitrina con info de marca) requieren specs propios con sección de Datos real (schema/queries). No implementar acá.
