# Discovery — Etapa 2.2: Tres dimensiones de la vidriera + Configuración de visibilidad

> **Tipo:** discovery / spec para revisión de Gerardo. **NO implementa nada.**
> **Fecha:** 2026-06-22 · **Autor:** Claude (sobre `develop` actualizado; 2.1 en QA en PR #439, branch `feature/etapa2-subtabs-mi-taller` @ `8859a46`).
> **Insumos leídos:** copy `v4-narrativa-etapas-2-3-copy.md` §2.1–§2.2 · helper mergeado `src/compartido/lib/visibilidad-vidriera.ts` (#437) · propuesta `v4-etapa2-visibilidad-schema-propuesta.md` · estado post-2.1 del branch del PR #439 · render público `src/app/(public)/perfil/[id]/page.tsx`.
> **Objetivo del doc:** que Gerardo decida el **modelo de UX de "Configuración de visibilidad"** y la **forma del type de Formación granular** antes de que Sergio codee.

---

## ✅ Decisiones de Gerardo (2026-06-22)

1. **UX de toggles → Opción A** (panel "Configuración de visibilidad" en "Mi gestión productiva" + "Mi vidriera" read-only + **deep-link** desde el mensaje de bloque oculto, opción C). **Confirmado.**
2. **Formación granular → SÍ entra en 2.2** con la key `formacionBadges` (aditiva, sin migración). **Confirmado.**
3. **Plan de PRs partido → 2.2a** (reorg + filtrado, behavior-preserving) **/ 2.2b** (config + granular). **Confirmado.**

> 🔒 **2.2a está BLOQUEADA por el merge de #439 (sub-tabs 2.1).** Se construye sobre el layout/sub-tabs y "Mi gestión productiva". **No arrancar implementación de 2.2 hasta que #439 mergee.**

**Bordes de producto — PENDIENTES DE SERGIO** (no son decisiones de UX de Gerardo; las define producto al implementar, ver §10):
- ¿`descripcion` libre / procesos / prendas quedan **fijos** (no toggleables) o se suman al set toggleable?
- ¿`Certificaciones` de calidad (`TallerCertificacion`, hoy público sin gate, fuera del set de 6) a qué bloque va y se gatea?
- ¿El sub-bloque "Mi capacidad de producción" **duplica/reemplaza** el "Cap. mensual" que ya está en el stats grid público, y qué muestra sin SAM?
- Bloque 1 Credenciales: ¿se duplica como bloque dentro de la vidriera además de la cabecera, o la cabecera lo cubre?

---

## TL;DR (para decidir rápido)

1. **2.2 es más grande de lo que sugiere el copy.** Hoy la vidriera pública renderiza **solo 2 de los 6 bloques toggleables** (`maquinaria`, `formacion`). Los otros 4 — `equipo`, `espacio`, `capacidad`, `organizacion` — **no existen en la superficie pública**; viven solo en "Mi gestión productiva" (privado). El Bloque 3 "Descripción de mi taller" del copy los quiere en la vidriera → **son net-new en público**, no un re-toggle de algo existente.
2. **"Mi vidriera" (el preview del taller) hoy NO es fiel.** Renderiza `maquinaria` y `certificados` **sin filtro** `bloqueVisible`. El único lugar fiel hoy es el link "Ver cómo me ve el directorio" → `/perfil/[id]`. 2.2 debe aplicar el **mismo filtro** en "Mi vidriera".
3. **#437 ya dejó la base** (campo JSONB + helper + tests + 2 gates en público). **Net-new de 2.2:** reorg en 3 bloques (público + vidriera), 4 gates públicos nuevos, filtro en "Mi vidriera", la UI "Configuración de visibilidad", el endpoint de escritura, el type de Formación granular + su helper, y los estados vacíos/mensajes del copy.
4. **Recomiendo partir 2.2 en 2 PRs:** **2.2a Reorg + filtrado** (sin escritura, behavior-preserving porque todos los talleres tienen visibilidad `null`) y **2.2b Configuración de visibilidad** (la UI de toggles + endpoint + Formación granular). Detalle en §8.
5. **Decisión de UX que necesito de vos (§3):** ¿dónde viven los toggles? Recomiendo **panel "Configuración de visibilidad" en "Mi gestión productiva"** + preview read-only en "Mi vidriera" con el mensaje de bloque oculto. Alternativa: eye-toggles inline en la vidriera.
6. **Decisión de datos que necesito de vos (§4):** Formación granular por-badge → recomiendo **key nueva `formacionBadges: Record<certificadoId, boolean>`** (aditiva, sin migración, el block-gate `formacion` se mantiene como master on/off). El user-prompt ya marca granular como in-scope ("decisión de Sergio").

---

## 1. Estado actual de la vidriera (post-2.1)

2.1 (PR #439) partió la antigua página única `/taller/perfil` en un **layout contenedor** (cabecera común + sub-tabs) y **dos páginas**:

### `layout.tsx` (server) + `perfil-header-tabs.tsx` (client)
- Carga 1 vez: `id, nombre, nivel, verificadoAfip, provincia, partido, ubicacionDetalle, sam, user{email,phone}`.
- Cabecera común: `nombre` + `Badge(nivelAEtapa(nivel))` + `BadgeArca` + ubicación + email/phone + botón **"Ver cómo me ve el directorio"** (`<Link target="_blank">` a `/perfil/[id]`) + botones editar/completar.
- Sub-tabs: **Mi vidriera** (`/taller/perfil`) · **Mi gestión productiva** (`/taller/perfil/gestion`). Cromo oculto en `editar`/`completar` vía `pathname`.

### `page.tsx` — "Mi vidriera" (lo que ven las marcas)
Renderiza, **todo sin filtro `bloqueVisible`** (⚠️ no fiel al público):
`ProgressRing` completitud · stats grid (rating / trabajadores / cap. mensual / on-time) · Descripción · Procesos · Tipos de prenda · **Mi portfolio** (`PortfolioManager`, editable) · Maquinaria · Certificaciones · Certificados de cursos.

### `gestion/page.tsx` — "Mi gestión productiva" (privado)
`Información General` (CUIT, fundado, pedidos completados, puntaje) · `Perfil productivo` (organización, espacio m², composición del equipo `plantilla`, registro de producción, escalabilidad, **SAM**) + nota "visible para el equipo de la plataforma y la Coordinación".

### Render público `/perfil/[id]` (lo que realmente ven las marcas — fuente de verdad)
nombre · `BadgeArca` + validaciones · ubicación · descripción (cita) · stats grid · Procesos · Tipos de prenda · **Trabajos realizados** (portfolio) · **Maquinaria** `&& bloqueVisible(taller,'maquinaria')` · **Certificaciones** *(sin gate)* · **Capacitaciones certificadas** `&& bloqueVisible(taller,'formacion')`.

### Hallazgos clave del estado actual

| Hallazgo | Detalle | Consecuencia para 2.2 |
|---|---|---|
| **Solo 2/6 gates están cableados** | Público usa `bloqueVisible` para `maquinaria` y `formacion`. Faltan `equipo`, `espacio`, `capacidad`, `organizacion`. | Esos 4 son **net-new en público** (hoy ni se renderizan ahí). |
| **"Mi vidriera" no es fiel** | Muestra `maquinaria`/`certificados`/`certificaciones` sin filtro. | 2.2 debe aplicar el mismo filtro en `page.tsx`. |
| **`equipo/espacio/capacidad/organizacion` viven solo en gestión** | Son privados hoy. El copy §2.2 los quiere en la vidriera (Bloque 3). | Hay que **moverlos/duplicar el render** a vidriera+público y gatearlos. SAM se queda fuera (invariante). |
| **`Certificaciones` (TallerCertificacion) está sin gate** | Es distinto de `Certificados`/Academia (=`formacion`). | **Decisión #5:** ¿a qué bloque pertenece y se gatea? |
| **Stats grid expone "Cap. mensual" en público** | Número suelto, sin pasar por `capacidad`. | Definir si "capacidad" como bloque incluye/duplica ese número (§4.5 dice SAM nunca; cap. mensual sí es pública hoy). |

---

## 2. La reorg en 3 bloques (copy §2.2)

`Mi vidriera` se reorganiza en 3 bloques con título + subtítulo + ayuda contextual (textos en el copy §2.2, líneas 42–75):

### Bloque 1 — Credenciales 🔒 (siempre visible, no toggleable)
- **Contenido:** etapa actual (`nivelAEtapa(nivel)` → badge azul claro/medio/oscuro según Inicial/En proceso/Consolidada) + `BadgeArca`.
- **Origen actual:** ya está en la cabecera común (2.1). En la reorg se vuelve un **bloque con título "Credenciales"** dentro de la vidriera (no solo cabecera), con su ayuda contextual.
- **Decisión menor:** ¿se duplica en cabecera y bloque, o la cabecera se simplifica y Credenciales pasa a ser el primer bloque? Recomiendo: cabecera mantiene identidad (nombre+etapa+ARCA) y el Bloque 1 Credenciales repite los badges con el subtítulo/ayuda del copy (es barato y el copy lo pide explícito). → confirmar en review.

### Bloque 2 — Formación (toggleable; granular por-badge — ver §4)
- **Contenido:** badges de cursos completados = `certificados` (Academia). Texto sobre cada badge: nombre del curso (+ fecha opcional).
- **Estado vacío (copy):** "Todavía no completaste ningún curso. Mirá la Academia para empezar tu primer trayecto formativo." · **CTA:** "Ir a la Academia".
- **Hoy:** `certificados` se renderiza como lista "Capacitaciones certificadas" (público) / "Certificados de cursos" (vidriera). 2.2 lo reestiliza como **badges** y le suma el estado vacío + CTA + granularidad.

### Bloque 3 — Descripción de mi taller (toggleable por sub-bloque)
- **Subtítulo:** "Lo que contás sobre cómo trabajás. Vos decidís qué hacer visible a las marcas."
- **Sub-bloques (cada uno su título, cada uno toggleable):**

| Sub-bloque (copy) | Bloque del helper | Campo(s) Prisma | ¿En público hoy? |
|---|---|---|---|
| Mi equipo de trabajo | `equipo` | `plantilla[]` (categoría×cantidad) | ❌ net-new |
| Mi espacio físico | `espacio` | `metrosCuadrados` | ❌ net-new |
| Mi capacidad de producción | `capacidad` | `capacidadMensual`, `escalabilidad` — **SAM nunca** | parcial (cap. mensual está en stats grid) |
| Cómo organizo el trabajo | `organizacion` | `organizacion`, `registroProduccion` | ❌ net-new |
| Maquinaria | `maquinaria` | `maquinaria[]` | ✅ ya gateado |

- **Mensaje cuando un bloque está oculto** (visible solo al taller en su preview): "Este bloque no se muestra a las marcas. Cambialo desde Configuración de visibilidad si querés exponerlo."
- ¿Dónde queda la **descripción libre** (`taller.descripcion`) y los **procesos/prendas**? El copy §2.2 no los lista entre los sub-bloques toggleables. Hoy son públicos sin gate. **Decisión menor:** quedan como contenido fijo del Bloque 3 (no toggleable) o se suman al set. Recomiendo: **fijos** (no estaban en el set de 6 del helper; sumarlos sería ampliar el modelo). → confirmar.

**¿Clara la distribución de campos?** Sí para los 5 sub-bloques del Modelo B (mapean 1:1 al helper). Los bordes a confirmar: descripción/procesos/prendas (fijos vs toggleables), `Certificaciones` vs `Formación`, y si "capacidad" pública duplica el número del stats grid.

---

## 3. UI de "Configuración de visibilidad" — patrón UX (decisión de Gerardo)

El copy nombra un lugar concreto: *"…desde **Configuración de visibilidad**"* y *"Cambialo desde **Configuración de visibilidad** si querés exponerlo."* → sugiere una sección con nombre propio, no toggles dispersos.

### Opción A — Panel "Configuración de visibilidad" en "Mi gestión productiva" *(recomendada)*
- Una `Card` "Configuración de visibilidad" en `/taller/perfil/gestion` con un toggle (ojo on/off) por bloque (`formacion`, `equipo`, `espacio`, `capacidad`, `organizacion`, `maquinaria`) + sub-toggles por badge dentro de Formación.
- **Mi vidriera** queda **read-only**: es el preview fiel. Donde un bloque está oculto, muestra el mensaje "Este bloque no se muestra a las marcas…" con un link a la config en gestión.
- **Pros:** (1) calza con el modelo mental de 2.1 — *vidriera = lo que ven las marcas* (preview), *gestión = donde administrás*; (2) un solo lugar de escritura (un solo write surface, sin sincronizar estado entre dos páginas); (3) coincide con el wording literal del copy; (4) la vidriera no se llena de controles de edición que confunden "¿esto lo ven las marcas?".
- **Contras:** el toggle está a un tab de distancia del bloque que afecta (menos inmediato).

### Opción B — Eye-toggles inline en cada bloque de "Mi vidriera"
- Cada bloque del Bloque 3 lleva un ícono ojo (mostrar/ocultar) editable in situ.
- **Pros:** máxima inmediatez y descubribilidad.
- **Contras:** rompe el encuadre "esto es lo que ven las marcas" (mezcla preview con edición — ¿el ojo tachado lo ven ellas?); dos superficies que escriben visibilidad (vidriera + gestión) si gestión también la muestra; más estado cliente.

### Opción C — Híbrido: panel en gestión (fuente de escritura) + indicador read-only en vidriera con deep-link
- Igual que A, pero el mensaje de bloque oculto en la vidriera incluye un botón "Configurar visibilidad" que **deep-linkea** al panel en gestión (anchor/scroll).
- **Pros:** discoverabilidad de B con la limpieza de A.
- **Contras:** un poco más de trabajo (anchor + scroll).

**Recomendación: A, idealmente con el deep-link de C.** Un único endpoint de escritura, encaja con la narrativa de 2.1, respeta el copy. **Esto es lo que necesito que confirmes antes de codear.**

---

## 4. Type extendido para Formación granular

Estado actual del type (#437, `visibilidad-vidriera.ts`):
```ts
export type VisibilidadVidriera = Partial<Record<BloqueVidriera, boolean>>
// formacion?: boolean  → on/off de TODO el bloque
```

El user-prompt marca Formación **granular por-badge** como in-scope. Cada badge = un `Certificado` (tiene `id`). Diseño recomendado — **aditivo, sin migración** (sigue siendo el mismo JSONB):

```ts
export type VisibilidadVidriera = Partial<Record<BloqueVidriera, boolean>> & {
  /** Override por-badge de Formación. Key = Certificado.id. Solo `false` oculta.
   *  Ausente = visible. Se ignora si `formacion === false` (master apaga todo). */
  formacionBadges?: Record<string, boolean>
}
```

**Semántica de resolución (helper nuevo `badgeFormacionVisible`):**
1. Si `bloqueVisible(taller,'formacion') === false` → **todo el bloque oculto** (master off; los badges no importan).
2. Si el bloque está visible → cada badge visible **salvo** `formacionBadges[certificadoId] === false`.
3. Default (`formacionBadges` ausente / key ausente) → visible. Mantiene behavior-preserving.

```ts
export function badgeFormacionVisible(
  taller: { visibilidadVidriera?: unknown },
  certificadoId: string,
): boolean {
  if (!bloqueVisible(taller, 'formacion')) return false
  const raw = (taller?.visibilidadVidriera as Record<string, unknown> | null)?.formacionBadges
  const map = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  return map[certificadoId] !== false
}
```

- **Por qué key nueva y no `formacion: boolean | Record<…>`:** sobrecargar `formacion` rompe el type `Partial<Record<…, boolean>>` y obliga a tocar `normalizarVisibilidad`/`bloqueVisible`. Una key hermana **no toca el helper existente ni los tests #437**, y el block-gate `formacion` sigue siendo el master on/off literal del copy ("podés elegir qué badges mostrar" + el bloque entero se puede ocultar).
- **Sin migración:** JSONB lo absorbe; talleres actuales sin la key → todos los badges visibles.
- **Decisión #2 reabierta:** la propuesta #437 había **diferido** lo granular. El user-prompt lo vuelve a meter. Confirmar que entra en 2.2 (recomiendo 2.2b) y no se difiere de nuevo.

---

## 5. Endpoint de escritura (server action vs PATCH)

El repo usa **ambos** patrones: server actions (`'use server'` en marca/perfil, admin, estado, `sincronizar-nivel-action.ts`) y API routes (`PUT /api/talleres/[id]`, que ya autoriza por `session.user.id === taller.userId || ADMIN`).

**Recomendación: server action dedicada** `actualizarVisibilidadVidriera(input)` en `src/taller/` (o co-locada en gestión), porque:
- El único consumidor es el propio taller logueado desde su UI — no hay cliente externo ni API pública que justifique una route.
- Next 16 App Router idiomático; `revalidatePath('/taller/perfil')` + `/taller/perfil/gestion` directo.
- Autoriza con `auth()` + `taller.userId === session.user.id` (mismo patrón que el PUT).
- Escribe **solo** `visibilidadVidriera` (merge sobre el JSONB existente; nunca pisa otras keys) — superficie mínima, no toca el resto del perfil.

**Validación:** normalizar el input contra `BLOQUES_VIDRIERA` + `formacionBadges` (keys = ids de certificados que pertenecen al taller; descartar ajenas). Reusar/extender `normalizarVisibilidad`.

**Alternativa (fallback):** extender `PUT /api/talleres/[id]` para aceptar `visibilidadVidriera` — consistente con cómo se guarda el resto del perfil hoy, pero acopla un toggle chico a un endpoint grande. Server action es más limpia para este caso.

---

## 6. ¿Cuánto cubre #437 ya? ¿Cuánto es net-new?

| Pieza | Estado |
|---|---|
| Campo `visibilidadVidriera Json?` + migración aditiva (DEV) | ✅ #437 |
| Helper `bloqueVisible` / `normalizarVisibilidad` / `samVisible` + tests | ✅ #437 |
| Gate público `maquinaria` + `formacion` (2 de 6) | ✅ #437 |
| Sub-tabs + cabecera + "Mi gestión productiva" + botón "Ver cómo me ve el directorio" | ✅ 2.1 (#439, en QA) |
| **Reorg en 3 bloques** (público + "Mi vidriera") con títulos/subtítulos/ayuda/estados vacíos del copy | ❌ net-new |
| **4 gates públicos nuevos** (`equipo`, `espacio`, `capacidad`, `organizacion`) + render de esos bloques en público (hoy no existen ahí) | ❌ net-new |
| **Filtro `bloqueVisible` en "Mi vidriera"** (hoy muestra todo sin filtrar) | ❌ net-new |
| **Type + helper de Formación granular** (`formacionBadges`, `badgeFormacionVisible`) | ❌ net-new |
| **UI "Configuración de visibilidad"** (toggles por bloque + por badge) | ❌ net-new |
| **Endpoint de escritura** (server action) | ❌ net-new |
| Mensaje "Este bloque no se muestra a las marcas…" en preview | ❌ net-new |

**Resumen:** #437 dejó la **plomería de lectura** (campo + helper + 2 gates). 2.2 es **la mayoría del trabajo visible**: reorg, 4 gates nuevos, filtrar la vidriera, escritura, granular y toda la UI de config.

---

## 7. Dependencias

- **Badges de Formación = `Certificado` (Academia).** Ya existen en schema y seed (la vidriera/perfil ya listan `certificados`). **No hay placeholder necesario**: si el taller tiene cursos completados, hay badges; si no, aplica el estado vacío del copy + CTA "Ir a la Academia". No depende de contenido nuevo de Academia para funcionar.
- **`TallerCertificacion` (Certificaciones de calidad)** es **distinto** de `Certificado` (cursos). El copy Bloque 2 Formación = cursos de Academia. Decidir si `Certificaciones` (hoy público sin gate) cae en Credenciales, en Descripción, o queda fija fuera del set. → **Decisión #5**.
- **2.1 (#439) debe mergear primero** — 2.2 construye sobre el layout/sub-tabs y "Mi gestión productiva". Bloqueante.
- **Schema:** **NO requiere cambios** (todo cabe en el JSONB existente). No hay trabajo de Gerardo-modela-schema acá; sí su decisión de UX y la del type granular.

---

## 8. Plan de PRs

2.2 es grande y mezcla cosas behavior-preserving con cosas net-new de escritura. **Recomiendo partir en 2 (o 3) PRs reviewables:**

### PR 2.2a — Reorg + filtrado (read-only, behavior-preserving)
- Reorganiza "Mi vidriera" y `/perfil/[id]` en los 3 bloques (Credenciales / Formación / Descripción con sus 5 sub-bloques), con títulos/subtítulos/ayuda/estados vacíos del copy.
- Cablea los **4 gates públicos faltantes** (`equipo`, `espacio`, `capacidad`, `organizacion`) y aplica `bloqueVisible` en **"Mi vidriera"** (la vuelve fiel).
- **Behavior-preserving:** con todos los talleres en `visibilidad = null`, todo queda visible → sin cambio percibido salvo el reordenamiento visual.
- Mensaje "Este bloque no se muestra a las marcas…" en el preview (aunque aún no haya UI para ocultarlos).
- **Sin escritura.** Test: render de los 3 bloques + que un `visibilidadVidriera` mockeado con `false` oculta el bloque correspondiente en público y en vidriera.

### PR 2.2b — Configuración de visibilidad (escritura) + Formación granular
- Type extendido (`formacionBadges`) + helper `badgeFormacionVisible` + tests.
- UI "Configuración de visibilidad" (patrón decidido en §3) con toggles por bloque + por badge.
- Server action de escritura + validación + `revalidatePath`.
- Aplica el gate granular de badges en público y vidriera.
- Test e2e: ocultar un bloque/badge desde gestión → desaparece en `/perfil/[id]`.

### (Opcional) PR 2.2c — Pulido de Formación como badges + estado vacío + CTA Academia
- Si el restyle de `certificados` a "badges" + estado vacío es voluminoso, sale aparte. Si es chico, va en 2.2a.

**Por qué partir:** 2.2a es de bajo riesgo (read-only, behavior-preserving, fácil de QA-ear por Sergio) y desbloquea ver la vidriera reorganizada en producción sin esperar la UI de toggles. 2.2b concentra el riesgo (escritura, estado cliente, granular) en un PR enfocado.

---

## 9. Estimación, orden y riesgos

**Orden:** #439 (2.1) merge → **2.2a** → **2.2b** → (2.2c si hace falta). 🔒 **2.2a bloqueada hasta que mergee #439.**

**Estimación (Sergio, con spec cerrado):**
- 2.2a: ~1–1.5 días (reorg de 2 superficies + 4 gates + estados vacíos + tests).
- 2.2b: ~1.5–2 días (UI toggles + granular + server action + e2e).
- Total 2.2: ~3–3.5 días.

**Riesgos:**
- **R1 — Doble superficie de render.** Los 3 bloques se renderizan en `/perfil/[id]` (público) **y** en "Mi vidriera" (taller). Riesgo de divergencia. **Mitigación:** extraer los bloques a componentes compartidos en `src/taller/componentes/` que ambas páginas consuman, parametrizados por `contexto: 'publico' | 'privado'` (el mismo contrato que `samVisible`). Recomendado fuerte.
- **R2 — `samVisible` mal aplicado.** Si "capacidad" pasa a público, el render del sub-bloque **debe** omitir SAM siempre (helper ya existe). **Mitigación:** que el componente de "capacidad" reciba `contexto` y nunca pinte SAM en `'publico'`. Cubrir con test.
- **R3 — Mobile.** El panel de toggles + los sub-bloques nuevos son navegación/controles nuevos en una superficie que el taller usa en celular. Verificar 320/375 (mismo protocolo que 2.1).
- **R4 — `Certificaciones` sin gate** (hallazgo §1). Si no se decide, queda una inconsistencia (calidad pública, cursos toggleables). **Mitigación:** decisión #5.
- **R5 — Validación de `formacionBadges`.** Las keys son ids de certificados; la escritura debe rechazar ids que no pertenezcan al taller (no confiar en el cliente).

---

## 10. Decisiones

### ✅ Resueltas por Gerardo (2026-06-22)
1. **UX de Configuración de visibilidad (§3):** **Opción A** (panel en "Mi gestión productiva", vidriera read-only) **+ deep-link (C)** desde el mensaje de bloque oculto.
2. **Formación granular (§4):** **entra en 2.2** con la key `formacionBadges`.
3. **Plan de PRs (§8):** partido en **2.2a** (reorg+filtrado) **/ 2.2b** (config+granular).
4. **Endpoint (§5):** **server action dedicada** (recomendación del doc; queda firme salvo objeción al implementar).

### 🟡 Bordes de producto — PENDIENTES DE SERGIO
> No son decisiones de UX de Gerardo. Las define producto al implementar 2.2a/2.2b; si alguna trae duda, Sergio pregunta antes de codear.
- **B1 — Bloque 1 Credenciales (§2):** ¿se duplica como bloque dentro de la vidriera (además de la cabecera) como pide el copy, o la cabecera lo cubre y no hacemos bloque aparte?
- **B2 — Descripción libre / procesos / prendas (§2):** ¿quedan fijos (no toggleables, como hoy) o se suman al set toggleable? (Sugerencia del doc: fijos.)
- **B3 — `Certificaciones` de calidad (§1, §7):** ¿a qué bloque pertenece y se gatea? Hoy es público sin gate y no está en el set de 6.
- **B4 — "Capacidad" pública (§1):** "Cap. mensual" ya aparece en el stats grid público. ¿El sub-bloque "Mi capacidad de producción" lo duplica/reemplaza, y qué muestra sin SAM (cap. mensual + escalabilidad)?
