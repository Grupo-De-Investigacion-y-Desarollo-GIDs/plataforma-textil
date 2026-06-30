# Discovery / Spec — Etapa 2.2: Vidriera por categorías de visibilidad + privacy-by-default

> **Tipo:** spec consolidada para implementación. **NO implementa nada** — consolida el modelo confirmado para que la implementación salga sin idas y vueltas.
> **Fecha:** 2026-06-23 (re-spec sobre el discovery del 2026-06-22) · **Autor:** Claude.
> **Insumos:** copy `v4-narrativa-etapas-2-3-copy.md` §2.1–§2.2 · helper `src/compartido/lib/visibilidad-vidriera.ts` (#437) · `v4-etapa2-visibilidad-schema-propuesta.md` · estado post-2.1 **+ QA** del PR #439 (`feature/etapa2-subtabs-mi-taller` @ `1c4cc7e`) · render público `src/app/(public)/perfil/[id]/page.tsx`.

---

## ✅ ESTADO: ETAPA 2.2 COMPLETA (2026-06-30)

Los 3 PRs del plan (§8) están **mergeados a develop**, CI verde:

| PR | Qué entregó | SHA en develop |
|---|---|---|
| **2.2-A** (#442) | 3er sub-tab "Datos básicos" + reorder + sync por lectura | `a12c798` |
| **2.2-B** (#444) | Taxonomía + render condicional (`bloqueVisiblePublico`, flag `modeloB_revisado`) + banners | `66992f6` |
| **2.2-C1** (#445) | Toggles **inline** + 4 secciones + descubribilidad (3 estados) + escritura (anti-footgun) + net-new (incl. `inscripcion`) + R-DIR + Formación + seed `modeloB_revisado=true`/`tipoInscripcionAfip` | `dbf5971` |

> El plan original tenía 2.2-C como un solo PR; se partió en **2.2-C1** (núcleo funcional: toggles + escritura + render, **mergeado**) y **2.2-C2** (capa de descubribilidad fina, **pendiente**). La descubribilidad básica (3 estados por card) entró en 2.2-C1; 2.2-C2 cubre los refinamientos (indicadores "Editado en X →", estados visuales avanzados).

**Qué queda de la Etapa 2 (NO bloquea el cierre de 2.2):**
- **B — "Mis cursos"** (card de Academia en Mi gestión productiva): PR aparte, fuera del piloto de visibilidad.
- **2.2-C2** — capa de descubribilidad fina: indicadores "Editado en [tab] →" por card, refinamientos visuales.
- **Etapa 2.3** — gracia 60d + vidriera mínima (net-new).
- **Pendientes que NO gatean** (§10): revisión completa del SAM; taxonomía oficial de rubros/procesos (CIAI/FECOSET, vía Matías) que reemplaza el seed actual.

---

## 🔒 Bloqueos por PR (leer primero) — SPEC CERRADO

> ✅ **El spec de 2.2 está CERRADO (2026-06-23): no queda NINGUNA decisión de Sergio pendiente para 2.2-A/B/C.** La matriz final (§4) resolvió Efic/Result, D3 ("tiempos") y D4 (acreditaciones). Lo único pendiente son **tareas de plataforma/Gerardo**, no decisiones de producto.

| PR | Bloqueado por | NO bloqueado por |
|---|---|---|
| **2.2-A** (estructura: 3er sub-tab + reorder + sync) | **Nada — arrancable YA** (#439 ✅ mergeado, `2b3a3fd`) | — |
| **2.2-B** (taxonomía + render condicional) | **Nada — arrancable YA** (#439 ✅ · flag `modeloB_revisado` ✅ en develop, #441 `306dd3e`) | Efic/Result ✅ resuelto · D3/D4 ✅ resueltos · flag ✅ ya modelado |
| **2.2-C** (config UI + toggles + escritura) | 2.2-B mergeado | D3/D4 ✅ resueltos |

**Resumen accionable:**
- **2.2-A arrancable YA** (#439 mergeado). No espera nada.
- **2.2-B arrancable YA:** #439 ✅ + el flag `modeloB_revisado` ✅ ya está en develop (#441, schema + migración + backfill aplicado). Ya no espera el modelado del flag ni Efic/Result. Su scope restante es taxonomía + `bloqueVisiblePublico` (render condicional), no el campo.
- **2.2-C** espera 2.2-B mergeado. **Nada de Sergio pendiente.**

> **Pendientes que NO bloquean 2.2** (mejoras posteriores, no gate): (A) revisión completa del SAM, (B) taxonomía oficial de rubros/procesos (CIAI/FECOSET). Ver §10.

---

## ✅ Modelo CONFIRMADO por Sergio (2026-06-23)

Esto **reemplaza** las decisiones parciales del discovery anterior (Opción A de toggles + Formación granular siguen vigentes; el resto se amplía).

1. **Tercer sub-tab "Datos básicos".** "Mi taller" pasa de 2 a **3 sub-tabs**, en orden secuencial: **Datos básicos → Mi gestión productiva → Mi vidriera** (obligatorio → productivo → curatorial). Reestructura 2.1. **Es estructural** (mueve la ruta índice). Ver §2.
2. **Sincronización Datos básicos → Vidriera, sin doble carga.** Van a la vidriera automático: **nombre del taller, descripción, año, ubicación**. Quedan privados (solo el taller + Coordinación): **nombre del responsable, email, teléfono**. La sync NO es copia ni trigger: es **lectura del mismo registro** (ver §3).
3. **Default de visibilidad = privacy-by-default vía flag `modeloB_revisado`** (la pieza clave). Schema mantiene `null=visible` de #437; un flag nuevo decide cómo se interpreta el null. Ver §5.
4. **3 categorías de bloques:** FORZADO-VISIBLE / FORZADO-PRIVADO / TOGGLE-LIBRE. Tabla canónica en §4.
5. **Formación granular** con `formacionBadges: Record<certificadoId, boolean>` (aditivo, sin migración), `formacion` como master on/off. Ver §6.
6. **Aviso al activar un toggle:** *"Al activar esto, los datos de [bloque] van a ser visibles para las marcas que vean tu vidriera. ¿Confirmás?"* (solo al pasar de oculto→visible). Ver §7.
7. **UI de configuración = Opción A:** panel "Configuración de visibilidad" en **Mi gestión productiva** + **Mi vidriera read-only** con deep-link al panel desde el mensaje de bloque oculto. Ver §7.

---

## 0. Delta respecto del discovery del 2026-06-22

| Antes (discovery) | Ahora (confirmado) |
|---|---|
| 2 sub-tabs (vidriera / gestión) | **3 sub-tabs** (datos básicos / gestión / vidriera) — estructural |
| 6 bloques toggleables | **~12 bloques** (3 categorías; el set toggleable se amplía — ver §4) |
| Default null=visible (#437 directo) | **Privacy-by-default** condicionado por `modeloB_revisado` |
| Sin flag nuevo | **Flag `modeloB_revisado Boolean @default(false)`** (1 migración aditiva) |
| Bordes B1–B4 abiertos | **TODOS resueltos** (B1–B4, año/D2, portfolio/D5, R-DIR, Efic-Result, tiempos/D3, acreditaciones/D4). **Spec CERRADO** — ver matriz final §4 |
| Plan 2 PRs | **3 PRs** (el sub-tab estructural va aparte) |

---

## 1. Estado actual post-2.1 (incluye QA de #439 @ `1c4cc7e`)

2.1 partió `/taller/perfil` en **layout (cabecera + sub-tabs)** + páginas. Tras el QA de Sergio (commit `1c4cc7e`):

- **Cabecera común** (`perfil-header-tabs.tsx`): `nombre` + `Badge(nivelAEtapa(nivel))` + `BadgeArca` + ubicación + **solo** botón "Editar datos básicos". (Email/teléfono **ya salieron** de la cabecera; los 2 botones movidos — ver abajo.)
- **`page.tsx` — "Mi vidriera"** (`/taller/perfil`, índice): botón **"Ver cómo me ve el directorio"** (movido acá) · Descripción · Procesos · Tipos de prenda · **Mi portfolio** (editable) · Maquinaria · Certificaciones · Certificados de cursos. **Sin** `bloqueVisible` (no fiel al público todavía). Ya **no** tiene barra de completitud / Rating / On-time / stats grid (eliminados en QA). Trabajadores y Cap. mensual **fuera** del grid — su lugar final es el bloque `capacidad` de 2.2.
- **`gestion/page.tsx` — "Mi gestión productiva"** (`/taller/perfil/gestion`): card **"Datos del responsable"** (nombre/email/teléfono, privado, leyenda de minimización) · Información General (CUIT, fundado, pedidos, puntaje) · Perfil productivo (organización, espacio, equipo `plantilla`, registro, escalabilidad, **SAM**) + botón "Actualizar perfil productivo".
- **Render público `/perfil/[id]`** (fuente de verdad, **verificado limpio de PII**; re-QA `5f3eedb`): nombre · `BadgeArca`+validaciones · ubicación · descripción · Procesos · Tipos de prenda · Trabajos realizados · **Maquinaria** `&& bloqueVisible('maquinaria')` · Certificaciones *(sin gate)* · **Capacitaciones certificadas** `&& bloqueVisible('formacion')`. **El stats grid de marketplace (Rating/Trabajadores/Cap.mensual/On-time) fue eliminado** (re-QA, igual que en Mi vidriera).

**Hallazgos que siguen vigentes:** solo **2/6 gates** cableados en público (`maquinaria`, `formacion`); `equipo/espacio/capacidad/organizacion` **no existen en público** hoy (net-new); "Mi vidriera" no aplica el filtro (no es fiel); `Certificaciones` de calidad sin gate; el stats grid público aún muestra "Cap. mensual" como número suelto.

---

## 2. Tercer sub-tab "Datos básicos" + reorder (estructural)

**Orden de sub-tabs:** `Datos básicos` → `Mi gestión productiva` → `Mi vidriera`. El flujo secuencial implica **aterrizar en Datos básicos** → la ruta índice cambia de dueño:

| Tab (orden) | Ruta propuesta | Contenido |
|---|---|---|
| 1. Datos básicos | `/taller/perfil` *(índice — nuevo dueño)* | Identidad + registro: nombre taller, descripción, año, ubicación (**→ van a vidriera**, §3) + **datos del responsable** (nombre/email/tel, **privados**). Edición vía el form existente `/taller/perfil/editar`. |
| 2. Mi gestión productiva | `/taller/perfil/gestion` *(sin cambio)* | Perfil productivo + **panel "Configuración de visibilidad"** (§7) |
| 3. Mi vidriera | `/taller/perfil/vidriera` *(movida desde el índice)* | Lo que ven las marcas (read-only, filtrado por visibilidad) + "Ver cómo me ve el directorio" |

**Implicancias de implementación:**
- Mover la actual `page.tsx` (Mi vidriera) a `vidriera/page.tsx`; crear la nueva `page.tsx` (Datos básicos) en el índice.
- La card **"Datos del responsable"** (hoy en gestión por el QA) **se mueve a Datos básicos** (es dato de registro, marcado privado).
- `perfil-header-tabs.tsx`: el array `subTabs` pasa a 3 entradas en el nuevo orden; `mostrarCromo` y la lógica de tab activa (hoy `pathname === '/taller/perfil'` para vidriera) se actualizan para las 3 rutas. Cuidar el `startsWith` para no marcar 2 tabs activos.
- **Mobile:** 3 tabs en 320px → el `nav` ya tiene `overflow-x-auto` + `whitespace-nowrap` (de 2.1); verificar que 3 entran/scrollean sin romper.

**Por qué va en su propio PR:** es un cambio de **routing + estructura** (igual que 2.1 fue estructural), independiente de la lógica de visibilidad. Aislarlo hace el QA de Sergio trivial (¿están los 3 tabs en orden?, ¿aterriza en Datos básicos?, ¿se ve el responsable solo ahí?) y deja los 2 PRs siguientes enfocados en visibilidad.

---

## 3. Sincronización Datos básicos → Vidriera

**Decisión clave: NO hay copia, NO hay trigger, NO hay segundo registro.** La "sincronización automática" = **una sola fuente de verdad leída por varias superficies**:

- **Fuente única:** la fila `Taller` (+ su relación `User`).
- **Campos que "van a la vidriera":** `Taller.nombre`, `Taller.descripcion`, `Taller.fundado` (año), `Taller.provincia/partido/ubicacionDetalle`. **Las mismas columnas** que edita "Datos básicos" (vía el form `/editar` → `PUT /api/talleres/[id]`) son las que **lee** el render de la vidriera (pública y "Mi vidriera"). No se duplica el dato: se lee el mismo.
- **Campos privados (solo taller + Coordinación):** `User.name`, `User.email`, `User.phone`. La sync es trivial: el render público **simplemente no los SELECT-ea**. Viven en "Datos básicos" (vista del taller) y en la vista de Coordinación; nunca en la consulta de `/perfil/[id]`.
- **Propagación:** como todas las superficies son `force-dynamic`, editar en Datos básicos actualiza la fila y la vidriera lo refleja en el **siguiente render** (sin caché que invalidar; opcionalmente `revalidatePath` tras el PUT para SSR inmediato).

**Regla para el implementador:** no crear campos espejo ni eventos de sync. "Sincronizado" = mismo `Taller` row. La única disciplina es: el render público SELECT-ea solo columnas públicas; los campos privados nunca entran a esa query. (Mismo principio que `samVisible`.)

---

## 4. Taxonomía de bloques — 3 categorías (tabla canónica)

> Esta tabla es **el contrato** de qué se muestra/oculta. La categoría determina cómo la trata el render; el toggle solo aplica a TOGGLE-LIBRE.

### 4.1 FORZADO-VISIBLE (nunca se oculta; sin toggle)
| Bloque | Campo | Nota |
|---|---|---|
| Nombre del taller | `Taller.nombre` | |
| Descripción | `Taller.descripcion` | mínimo **≥50 caracteres** para directorio (§4.4) |
| Ubicación | `Taller.provincia/partido` | |
| Etapa de formalización | `nivelAEtapa(nivel)` | nunca enum crudo |
| ARCA | `verificadoAfip` → `BadgeArca` | invariante #437 |

### 4.2 FORZADO-PRIVADO (nunca se expone públicamente; sin toggle) ✅ matriz final
| Bloque | Campo | Nota |
|---|---|---|
| CUIT | `Taller.cuit` | |
| **Nombre del responsable** + email + teléfono | `User.name/email/phone` | ✅ confirmado: nombre del responsable = **forzado-privado** (nunca en superficie pública — confirma el bug b del re-QA). Minimización (OIT IGDS 457); vive en Datos básicos + Coordinación |
| **SAM completo (Tiempo + Eficiencia + Resultado)** | `Taller.sam` + pasos Efic/Result del wizard | ✅ **D1 resuelto:** los 3 (Tiempo estándar, Eficiencia y Resultado de capacidad) son **forzado-privados siempre**. `samVisible('publico')===false` (invariante #437) |
| **Tiempos** | = SAM | ✅ **D3 resuelto:** "Tiempos" **ES el SAM** → forzado-privado, **NO toggle-libre**. (Eliminado del set toggleable.) |
| Los 7 ítems del recorrido | datos del recorrido/umbrales | privados al taller + Coordinación |

### 4.3 TOGGLE-LIBRE (default OCULTO con privacy-by-default; aviso al activar) ✅ matriz final
| Bloque | Key de visibilidad | Campo(s) | ¿En público hoy? | Nota |
|---|---|---|---|---|
| Mi equipo de trabajo | `equipo` | `plantilla[]` | ❌ net-new | |
| Mi espacio físico | `espacio` | `metrosCuadrados` | ❌ net-new | |
| Procesos | `procesos` *(nuevo)* | `procesos[]` | ✅ (hoy sin gate) | pasa a toggleable. Catálogo: seed actual (ver pendiente B, §10) |
| Prendas / rubros | `prendas` *(nuevo)* | `prendas[]` | ✅ (hoy sin gate) | pasa a toggleable. Catálogo: seed actual (ver pendiente B, §10) |
| Organización | `organizacion` | `organizacion`, `registroProduccion` | ❌ net-new | |
| Maquinaria | `maquinaria` | `maquinaria[]` | ✅ ya gateado | |
| Capacidad (rango) | `capacidad` | `capacidadMensual` **como rango**, `escalabilidad` | parcial | público = **rango bucketizado**, nunca SAM |
| Año de fundación | `anioFundacion` *(nuevo)* | `Taller.fundado` | — | ✅ D2: el dato sincroniza (§3), el toggle gatea su visibilidad |
| **Academia** | `formacion` (granular vía `formacionBadges`) | `certificados[]` (badges PDT) | parcial | ✅ **D4 resuelto:** para el **piloto**, **1 solo toggle "Academia"** (badges de cursos PDT), granular por badge. **Certificaciones externas (`TallerCertificacion`) quedan FUERA del piloto** (sin toggle propio). |
| Portfolio | `portfolio` *(nuevo)* | `portfolioFotos[]` | ✅ (hoy sin gate) | ✅ D5: pasa a oculto-por-default (existentes lo mantienen vía revisado=true) |

> **Eliminados del set toggleable respecto del borrador anterior:** `tiempos` (= SAM → forzado-privado, D3) y `certificaciones` (externas, fuera del piloto, D4). El set toggleable del **piloto** queda en **10 keys**: `equipo, espacio, procesos, prendas, organizacion, maquinaria, capacidad, anioFundacion, formacion, portfolio`.

### 4.4 Regla de elegibilidad para el directorio ✅ (R-DIR confirmado por Gerardo)
Para **aparecer en `/directorio`**, además de FORZADO-VISIBLE completo (nombre, descripción ≥50, ubicación, etapa, ARCA) se exige **≥1 `proceso` o `rubro` con su toggle activo**.

⚠️ **CAMBIO DE SUPUESTO vs #437:** la propuesta #437 decía "los toggles son render-only, nunca entran en un WHERE". **Eso ya no es cierto:** la visibilidad ahora **SÍ condiciona la inclusión en el listado** del directorio, no solo el render del perfil. Documentado explícitamente para que nadie asuma lo viejo.

- **Implementación (mitigación aceptada):** **filtro post-query en app** evaluando el estado del toggle (la visibilidad vive en JSONB; no es queryable eficientemente en SQL). El directorio trae los candidatos por `verificadoAfip` + FORZADO-VISIBLE y descarta en app los que no tienen ≥1 proceso/rubro con toggle activo.
- **REQUISITO de test de 2.2 (obligatorio):** caso **"taller con todos sus bloques toggle-libre ocultos → NO aparece en el directorio"**. Es la prueba de que el cambio de supuesto está bien implementado. (Va en el PR donde se cablea la elegibilidad — ver §9.)
- Riesgo asociado: R-DIR en §9.

### 4.5 Resolución de B1–B4 del discovery anterior
- **B1 Credenciales** → FORZADO-VISIBLE (resuelto: nunca toggle).
- **B2 procesos/prendas** → **TOGGLE-LIBRE** (Sergio los hace toggleables; antes sugeríamos fijos).
- **B3 Certificaciones de calidad** → ✅ **fuera del piloto** (D4). Solo entra "Academia" (`formacion`, badges PDT, granular). Las certificaciones externas se retoman post-piloto.
- **B4 Capacidad pública** → muestra **rango** (no el número exacto) + escalabilidad; SAM nunca. El "Cap. mensual" suelto del stats grid público se reemplaza por este bloque.

---

## 5. El flag `modeloB_revisado` (privacy-by-default)

### 5.1 Schema (migración aditiva) — ✅ YA EN DEVELOP (#441, `306dd3e`)
```prisma
model Taller {
  // ...
  modeloB_revisado  Boolean  @default(false)  // ¿el taller ya revisó qué muestra su vidriera?
}
```
- **Aditiva:** columna con default, sin tocar nada existente.
- **Backfill en la misma migración:** `UPDATE "talleres" SET "modeloB_revisado" = true;` → **todos los talleres EXISTENTES quedan en `true`** (no se les cambia la visibilidad: seguían en `null=visible` de #437, y `true` preserva eso). Talleres **nuevos** entran en `false` (default).
  - ⚠️ **Nombre real de la tabla = `"talleres"`** (vía `@@map("talleres")`), NO `"Taller"`. No copiar el nombre del modelo Prisma al SQL.
- **Estado:** schema + migración (`20260624120000_agregar_modelob_revisado`) **aplicados a DEV** y mergeados a develop (#441). Backfill verificado: 6/6 talleres en `true`, 0 en `false`. **2.2-B ya no espera el modelado del flag** — solo espera arrancar.

### 5.2 Render condicional (público + "Mi vidriera")
Para un bloque **TOGGLE-LIBRE**, la visibilidad pública se resuelve así:
```ts
// raw = taller.visibilidadVidriera?.[bloque]   (null/undefined si nunca se tocó)
function bloqueVisiblePublico(taller, bloque): boolean {
  if (taller.modeloB_revisado) return raw !== false   // #437: null/true → visible, false → oculto
  return raw === true                                  // privacy-by-default: SOLO explícito-true se muestra
}
```
- `modeloB_revisado === false` (taller nuevo) → **bloques en null se tratan como OCULTOS**. Solo muestra lo que el taller activó explícitamente. Cumple privacy-by-default V4.
- `modeloB_revisado === true` (existentes, o tras revisar) → respeta `null=visible` (#437 intacto).
- FORZADO-VISIBLE siempre se renderiza (sujeto a contenido); FORZADO-PRIVADO nunca.

### 5.3 Flip a `true` — **regla crítica anti-footgun**
> "Primer toggle confirmado por el taller → `modeloB_revisado=true`."

Si al primer confirm solo escribiéramos la key tocada y flipáramos el flag, **todos los demás bloques en `null` pasarían a visibles** (porque con `true` rige `null=visible`). Para evitar exponer bloques que el taller nunca eligió:

**El guardado de "Configuración de visibilidad" escribe SIEMPRE el mapa COMPLETO de bloques toggle-libre** (cada uno con booleano explícito según el estado del panel), **junto con** `modeloB_revisado=true`. Así, tras el primer guardado no quedan `null` para los bloques existentes → el flip es **render-neutral** (ningún bloque aparece/desaparece solo). El `null=visible` post-revisado solo aplicaría a tipos de bloque **agregados a futuro**, que se vuelven a anunciar vía banner.

### 5.4 Banners (dashboard del taller)
| Audiencia | Condición | Texto | CTA |
|---|---|---|---|
| Talleres **existentes** | `modeloB_revisado=true` y aún no abrió la config | **"Revisá qué muestra tu vidriera"** | → panel de Configuración de visibilidad (gestión) |
| Talleres **nuevos** | `modeloB_revisado=false` | **"Tenés datos que podés mostrar a las marcas"** | → panel de Configuración de visibilidad (gestión) |

- El banner de "nuevos" persiste mientras `modeloB_revisado=false`.
- El banner de "existentes" es un nudge: se oculta cuando abren la config por primera vez (trackear con un dismiss liviano — `localStorage` o un 2º flag; **decisión menor**, §10).
- Ubicación: dashboard `/taller` (y opcionalmente tope de "Mi vidriera").

### 5.5 Aviso de confirmación al activar (decisión #6)
Al pasar un toggle de **oculto→visible**, modal/confirm:
> *"Al activar esto, los datos de **[bloque]** van a ser visibles para las marcas que vean tu vidriera. ¿Confirmás?"*
- Solo en activación (no al ocultar).
- Al confirmar: persistir (mapa completo, §5.3) + `modeloB_revisado=true` si era el primer cambio.

---

## 6. Type de visibilidad extendido + resolver

### 6.1 Union de bloques — set del PILOTO, 10 keys (aditivo — solo TS + array; el JSONB ya lo soporta, sin migración)
```ts
export type BloqueVidriera =
  | 'formacion'        // Academia (badges PDT) — granular vía formacionBadges
  | 'equipo' | 'espacio' | 'organizacion' | 'maquinaria' | 'capacidad'
  | 'procesos'         // [NUEVO]
  | 'prendas'          // [NUEVO]
  | 'anioFundacion'    // [NUEVO]
  // NO incluidos en el piloto: 'tiempos' (= SAM, forzado-privado, D3) ·
  // 'certificaciones' externas (fuera del piloto, D4) · 'portfolio' es key nueva ↓
  | 'portfolio'        // [NUEVO]
```
`BLOQUES_VIDRIERA` (el array) se amplía igual; `normalizarVisibilidad` itera el array → sigue funcionando sin cambios de lógica. (Si post-piloto se suman `certificaciones` u otros, es aditivo: solo TS, sin migración.)

### 6.2 Formación granular (confirmado)
```ts
export type VisibilidadVidriera = Partial<Record<BloqueVidriera, boolean>> & {
  /** Override por-badge de Formación. Key = Certificado.id. Solo `false` oculta.
   *  Ausente = visible. Se ignora si el master `formacion` está oculto. */
  formacionBadges?: Record<string, boolean>
}

export function badgeFormacionVisible(taller, certificadoId): boolean {
  if (!bloqueVisiblePublico(taller, 'formacion')) return false   // master off (respeta el flag)
  const map = (taller?.visibilidadVidriera as any)?.formacionBadges ?? {}
  return map[certificadoId] !== false
}
```
- Key hermana → **no toca** `bloqueVisible`/`normalizarVisibilidad` ni los tests #437.
- **Validación de escritura:** las keys de `formacionBadges` deben ser ids de `Certificado` **del propio taller** (descartar ajenas; no confiar en el cliente).

---

## 7. UI de Configuración de visibilidad (Opción A) + endpoint

- **Panel "Configuración de visibilidad"** en **Mi gestión productiva** (`/taller/perfil/gestion`): un toggle (ojo on/off) por bloque TOGGLE-LIBRE + sub-toggles por badge dentro de Formación. Agrupado por las 3 categorías (las FORZADO-* se muestran informativas, sin control).
- **Mi vidriera = read-only** (preview fiel): donde un bloque está oculto, muestra *"Este bloque no se muestra a las marcas. Cambialo desde Configuración de visibilidad si querés exponerlo."* con **deep-link** al panel (anchor/scroll en gestión).
- **Patrón "dónde se edita cada bloque" (pedido en QA del combinado #439b+#442, 2026-06-27).** Cada card de "Mi vidriera" muestra un link directo al tab donde se edita su contenido, para reforzar el modelo conceptual *vidriera = curaduría, edición en otro tab* (hoy el taller no sabe a dónde ir sin probar tab por tab). Mapa card → destino:
  - **Descripción**, **Tipos de prenda/rubros**, **Año** → *"Editado en Datos básicos →"* (`/taller/perfil`).
  - **Procesos**, **Maquinaria**, **Portfolio**, **Equipo/Espacio/Organización/Capacidad** → *"Editado en Mi gestión productiva →"* (`/taller/perfil/gestion`, vía el wizard `completar` donde corresponda).
  - Formato: micro-link bajo el título de cada card (ej. bajo "Descripción" un `Editado en Datos básicos →`). No confundir con el deep-link de "bloque oculto" (ese va al panel de visibilidad); este apunta a **dónde se edita el dato**, no dónde se togglea su visibilidad.
- **Aviso de confirmación** (§5.5) al activar.
- **Endpoint: server action dedicada** `actualizarVisibilidadVidriera(input)`:
  - Autoriza `auth()` + `taller.userId === session.user.id`.
  - Escribe el **mapa completo** de toggles (§5.3) + `formacionBadges` validado + setea `modeloB_revisado=true`.
  - `revalidatePath('/taller/perfil')` + `/taller/perfil/vidriera` + `/taller/perfil/gestion`.
  - Superficie mínima: solo toca `visibilidadVidriera` + `modeloB_revisado`; nunca otras columnas.
  - *Fallback:* extender `PUT /api/talleres/[id]` (menos limpio; acopla a un endpoint grande).

---

## 8. Plan de PRs (re-confirmado — 3 cortes)

> El sub-tab estructural **va aparte** (como 2.1). El resto se parte en render+flag (behavior-preserving para existentes) y luego escritura+UI.

### PR **2.2-A — Tercer sub-tab "Datos básicos" + reorder + sync** *(estructural)*
- 3 sub-tabs en orden, ruta índice = Datos básicos, mover Mi vidriera a `/vidriera`.
- Mover card "Datos del responsable" a Datos básicos.
- Aclaración de sync = lectura compartida (no código nuevo de sync; solo asegurar que el render público no SELECT-ee privados).
- **Sin** lógica de visibilidad nueva. Bajo riesgo, QA trivial.

### PR **2.2-B — Taxonomía + render condicional** *(render-only, behavior-preserving para existentes)*
- Reorg de "Mi vidriera" y `/perfil/[id]` en las 3 categorías (§4) + estados vacíos/mensajes del copy.
- Expandir `BloqueVidriera` (§6.1) + cablear los gates faltantes en público y en "Mi vidriera".
- **Flag `modeloB_revisado`: ✅ YA en develop** (#441, schema + migración + backfill, §5.1). 2.2-B solo agrega `bloqueVisiblePublico` (§5.2) en ambos renders, que **lee** el flag.
- **Banners** (§5.4).
- **Behavior-preserving para talleres existentes** (revisado=true ⇒ null=visible, como hoy). Talleres **nuevos** quedan en privacy-by-default (solo FORZADO-VISIBLE) hasta el PR-C. ⚠️ Ver "gap" en §9.
- **Sin UI de toggles / sin escritura.** Tests: `bloqueVisiblePublico` con flag true/false; render de las 3 categorías.

### PR **2.2-C — Configuración de visibilidad (UI + escritura) + Formación granular**
- Panel de toggles en gestión (§7) + Mi vidriera read-only con deep-link.
- Server action (escribe mapa completo + `modeloB_revisado=true` + `formacionBadges` validado, §5.3/§6.2).
- Aviso de confirmación (§5.5).
- Tests e2e: activar un toggle (con confirm) → aparece en `/perfil/[id]`; ocultar → desaparece; badge granular.

**Recomendación de corte (minimiza riesgo / facilita QA):** A (estructura) → B (taxonomía+flag, behavior-preserving) → C (escritura+UI). Cada PR es cohesivo y QA-eable solo. El sub-tab aislado evita mezclar routing con visibilidad; el flag aislado se prueba sin UI; la escritura concentra el riesgo de estado cliente al final.

---

## 9. Estimación, orden, qué bloquea qué

**Orden:** #439 merge → **2.2-A** → **2.2-B** → **2.2-C**.

**Estimación (Sergio, spec cerrado):**
- 2.2-A: ~1 día (routing + mover responsable + mobile 3 tabs).
- 2.2-B: ~1.5–2 días (taxonomía ×2 superficies + expandir type + render condicional + banners + tests). *(flag migración+backfill ya hecho, #441.)*
- 2.2-C: ~2–2.5 días (panel UI + aviso + server action con mapa completo + granular + e2e).
- **Total 2.2: ~4.5–5.5 días.**

**Qué bloquea qué:**
- #439 ✅ **mergeado** (`2b3a3fd`) — Etapa 2.1 cerrada. 2.2-A/B ya no lo esperan.
- FORZADO-PRIVADO ✅ **cerrado** (Efic/Result resuelto, §4.2) — ya no bloquea 2.2-B.
- Schema (`modeloB_revisado`) ✅ **mergeado** (#441, `306dd3e`) — migración + backfill aplicados a DEV. **2.2-B ya no espera nada de plataforma.**
- **Ninguna decisión de Sergio pendiente** para A/B/C. **2.2-A y 2.2-B son arrancables YA.**

**Riesgos:**
- **R-DIR — elegibilidad de directorio rompe "render-only" (§4.4). ✅ confirmado (Gerardo).** La visibilidad ahora condiciona aparecer en `/directorio` (cambio de supuesto vs #437). Va en **2.2-B** (usa el mismo `bloqueVisiblePublico`; behavior-preserving para existentes con revisado=true). Mitigación: filtro post-query en app evaluando el toggle de procesos/prendas. **Test obligatorio de 2.2:** "taller con todo toggle-libre oculto ⇒ NO aparece en el directorio".
- **R-FLAG — flip del flag expone bloques (§5.3).** Mitigación: **escribir mapa completo** en el primer guardado (regla crítica). Test: taller nuevo activa 1 toggle ⇒ solo ese bloque aparece, los demás siguen ocultos.
- **R-GAP — ventana 2.2-B→2.2-C.** Talleres **nuevos** entre B y C quedan en privacy-by-default sin UI para exponer nada (solo FORZADO-VISIBLE). Es el default seguro y los talleres nuevos tienen pocos bloques cargados; mitigación: shipear B y C cerca, o incluir el panel mínimo en B. Aceptable.
- **R-DOBLE — doble superficie de render.** Los bloques se pintan en `/perfil/[id]` y en "Mi vidriera". Mitigación: **componentes compartidos** parametrizados por `contexto: 'publico' | 'privado'` (mismo contrato que `samVisible`).
- **R-PORT — portfolio cambia de comportamiento. ✅ confirmado (Gerardo, D5).** Hoy público sin gate; pasa a oculto-por-default para nuevos (existentes lo mantienen vía revisado=true).
- **R-MOBILE — 3 tabs + panel de toggles** en 320/375. Verificar con playwright-core (protocolo 2.1).

---

## 10. Decisiones — SPEC CERRADO

> ✅ **No queda ninguna decisión de producto/Sergio pendiente para 2.2-A/B/C.** Todo lo abierto del discovery quedó resuelto.

### ✅ Confirmadas por Sergio (2026-06-23)
Las 7 del bloque "Modelo CONFIRMADO" arriba (3 sub-tabs, sync por lectura compartida, flag `modeloB_revisado`, 3 categorías, Formación granular, aviso al activar, Opción A de UI), **más la matriz final**:
- **D1 — Efic/Result → RESUELTO.** El **SAM completo (Tiempo estándar + Eficiencia + Resultado de capacidad)** es **forzado-privado siempre** (§4.2).
- **D3 — "Tiempos" → RESUELTO.** "Tiempos" **es el SAM** → forzado-privado, **NO toggle-libre**. Eliminado del set toggleable (§4.2/§4.3).
- **D4 — Acreditaciones → RESUELTO.** Para el **piloto**, **1 solo toggle "Academia"** (badges PDT, granular por badge). **Certificaciones externas FUERA del piloto** (§4.3).
- **Nombre del responsable → forzado-privado** (confirma el bug b del re-QA; §4.2).

### ✅ Resueltas por Gerardo (2026-06-23)
- **D2 — "año de fundación".** Sin contradicción: el dato **se sincroniza** (§3), el toggle `anioFundacion` gatea su **visibilidad**.
- **D5 — Portfolio default oculto.** Confirmado; existentes lo mantienen vía `modeloB_revisado=true`.
- **R-DIR — elegibilidad de directorio (§4.4).** Mitigación aceptada (filtro post-query) + **REQUISITO de test** "taller con todo toggle-libre oculto ⇒ NO aparece en el directorio". Cambio de supuesto vs #437 documentado.

### ⏳ Pendientes que **NO bloquean** 2.2 (mejoras posteriores)
> El piloto arranca sin esperar esto; quedan anotados para no perderlos.
- **A — Revisión completa del SAM.** Qué preguntas hace el wizard, cómo se procesa, y qué uso le da Coordinación. No bloquea 2.2 (el SAM ya es forzado-privado; el detalle del cálculo/uso es trabajo aparte).
- **B — Taxonomía oficial de rubros/procesos.** El catálogo definitivo viene de la **taxonomía oficial (CIAI/FECOSET, vía Matías)**. **2.2 arranca con el seed actual de procesos/prendas**; **queda EXPLÍCITO que el catálogo final reemplaza el seed cuando la taxonomía oficial esté disponible** (los toggles `procesos`/`prendas` no cambian; solo cambia el catálogo subyacente).

### 🔧 Menor (no bloquea)
- **D6 — Dismiss del banner "Revisá tu vidriera"** (existentes): `localStorage` vs 2º flag. *(Preferible localStorage.)*

### ✅ Pendiente de plataforma (Gerardo) para 2.2-B — RESUELTO
- ✅ **`modeloB_revisado Boolean @default(false)`** modelado + migrado + backfill existentes→true — **en develop (#441, `306dd3e`)**. Tabla real `"talleres"` (no `"Taller"`). Verificado: 6/6 en `true`.
- La expansión de `BloqueVidriera` (10 keys del piloto) es **solo TS** (JSONB ya lo soporta) — no requiere migración. Se hace dentro de 2.2-B.
- **No queda ningún pendiente de plataforma para arrancar 2.2-B.**
