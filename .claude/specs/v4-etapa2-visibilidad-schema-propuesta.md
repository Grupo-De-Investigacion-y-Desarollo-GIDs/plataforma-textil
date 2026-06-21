# Propuesta de schema — Visibilidad por bloque de la vidriera (Etapa 2.2 / §1.3 Modelo B)

> **Tipo:** propuesta de diseño para revisión de Gerardo. **NO se implementó nada, NO se migró nada.**
> **Fecha:** 2026-06-21 · **Autor:** Claude (sobre develop `4cbe96b`).
> **Insumos:** copy `v4-narrativa-etapas-2-3-copy.md` §2.2 · master `narrativa-V4-consolidado-niveles-1-a-4.md` §1.3 + §4.5 (Modelo B) · `prisma/schema.prisma` (model Taller) · `src/app/(public)/perfil/[id]/page.tsx`.
> **Decisión previa de Gerardo:** toggle **por bloque, NO granular** por ahora.

Es el **cuello de botella técnico de la Etapa 2**: lo usan los 3 bloques de la vidriera y no depende de decisiones de producto. Una vez resuelto, desbloquea 2.1 (sub-tabs), 2.2 (reorg + Formación) y el botón "Ver cómo me ve el directorio".

---

## 0. Qué dice cada fuente (para alinear el alcance)

- **Copy §2.2:** "Esta sección incluye tu perfil productivo. Podés mostrar u ocultar **bloques completos** desde Configuración de visibilidad. Lo que ocultes solo lo verás vos en Mi gestión productiva." Credenciales: "siempre se muestra al menos ARCA y la etapa". Formación: "Podés elegir qué badges mostrar" (granularidad por-badge).
- **Master §1.3 / §4.5 (Modelo B):** "Toggles **por grupo** del perfil productivo (composición equipo, espacio, capacidad escalado, organización, maquinaria). **SAM siempre privado, no editable**. ARCA siempre público, no editable."
- **Reconciliación:** la unidad toggleable es el **grupo/bloque** (no campo-por-campo). Credenciales es fijo. Formación por-badge queda **diferido** (la decisión de Gerardo "no granular" lo posterga); por ahora Formación se trata como un bloque on/off entero. → ver decisión abierta #2.

---

## 1. Modelo de datos — opciones evaluadas

Dato clave que condiciona todo: **estos toggles son RENDER-ONLY**. Nunca entran en un `WHERE`/filtro. El directorio filtra por `verificadoAfip: true`, jamás por visibilidad de bloques. Es decir, no necesitamos indexar ni querear flags individuales — solo leerlos junto al taller y decidir qué renderizar.

### Opción A — Columna JSONB en Taller *(recomendada)*
```prisma
// Mapa de visibilidad de bloques de la vidriera. null = todo visible (default).
visibilidadVidriera  Json?
```
Forma del objeto (validada en app con un type + normalizador):
```ts
type VisibilidadVidriera = {
  formacion?: boolean
  equipo?: boolean
  espacio?: boolean
  capacidad?: boolean
  organizacion?: boolean
  maquinaria?: boolean
}
// ausente o key faltante => true (visible)
```
- **Pros:** migración trivial y 100% aditiva (1 columna nullable, sin backfill); **consistente con el house style** — Taller ya usa `Json?` (`rolesFuncionales`, `domicilioFiscalAfip`); se lee en el mismo `findUnique` sin joins; **extensible sin migración** (agregar un bloque o pasar a por-badge no toca el schema); default natural (null/ausente = visible).
- **Contras:** sin type-safety a nivel DB; la forma se valida en app (mitigable con un normalizador chico); no se puede querear un flag suelto — **irrelevante** porque nunca filtramos por esto.

### Opción B — Columnas booleanas por bloque
```prisma
visibleFormacion    Boolean @default(true)
visibleEquipo       Boolean @default(true)
visibleEspacio      Boolean @default(true)
visibleCapacidad    Boolean @default(true)
visibleOrganizacion Boolean @default(true)
visibleMaquinaria   Boolean @default(true)
```
- **Pros:** type-safe, defaults a nivel DB, explícito y legible.
- **Contras:** 6 columnas ahora; **cada bloque nuevo o granularidad futura = migración nueva**; ruido en el modelo. La ventaja de queryabilidad no aplica (render-only).

### Opción C — Tabla aparte (`VidrieraVisibilidad`: taller × bloque)
- **Pros:** normalizada, audit-friendly, escala a por-badge/granular sin límite.
- **Contras:** **overkill** para 6 booleanos; join extra en cada render público; más código. Prematuro para el alcance "por bloque, no granular".

### Recomendación: **Opción A (JSONB `visibilidadVidriera`)**
Por: (1) render-only ⇒ la única ventaja de B/C (type-safety/queryabilidad) casi no paga; (2) migración aditiva de una columna nullable sin backfill; (3) **mismo patrón que ya tiene Taller** (`Json?`); (4) future-proof: pasar Formación a por-badge, o sumar bloques, no requiere migración. El costo (validar forma en app) se cubre con un normalizador de ~10 líneas + un type TS. Si Gerardo prefiere garantías a nivel DB sobre flexibilidad, **B es el fallback limpio** (también aditiva, `@default(true)`).

---

## 2. Bloques toggleables vs fijos

| Bloque de la vidriera | ¿Toggleable? | Nota |
|---|---|---|
| **Credenciales** (etapa + ARCA) | 🔒 **NO — siempre visible** | Invariante del copy y §4.5: ARCA no negociable para estar en directorio. |
| **Formación** (badges de cursos) | ✅ Sí (block-level por ahora) | Copy pide por-badge; **diferido** → on/off entero. Decisión #2. |
| **Descripción → Mi equipo de trabajo** | ✅ Sí | grupo Modelo B |
| **Descripción → Mi espacio físico** | ✅ Sí | grupo Modelo B |
| **Descripción → Mi capacidad de producción** | ✅ Sí | grupo Modelo B — **SAM SIEMPRE privado** aunque el grupo esté visible (ver invariante) |
| **Descripción → Cómo organizo el trabajo** | ✅ Sí | grupo Modelo B |
| **Descripción → Maquinaria** | ✅ Sí | grupo Modelo B |

**Set toggleable = 6 flags:** `formacion, equipo, espacio, capacidad, organizacion, maquinaria`.

**Invariantes (independientes de los toggles):**
- **Credenciales**: siempre se renderiza en la vidriera pública.
- **SAM**: nunca se expone públicamente, ni siquiera con `capacidad: true`. El render del grupo "capacidad" omite SAM siempre. (Protección de cotización del taller, §4.5.)

---

## 3. Default — talleres nuevos y existentes

**Default = TODO VISIBLE** (null/ausente ⇒ visible).

- **Razón:** el copy y §4.5 apuntan a una vidriera que muestra lo que el taller construyó; **ocultar por accidente es el peor resultado**. Mostrar lo ya completado es lo esperable. El taller activamente *oculta* lo que no quiere mostrar, no al revés.
- **Talleres nuevos:** sin acción, muestran todo lo que completaron.
- **Talleres existentes:** `visibilidadVidriera = null` ⇒ interpretado como todo visible ⇒ **conserva exactamente el comportamiento actual** (hoy `/perfil/[id]` muestra todo sin filtro). Cero cambio percibido tras la migración.
- (Bloques vacíos —p.ej. sin maquinaria cargada— ya no se renderizan por estar vacíos; la visibilidad solo aplica a bloques con contenido.)

---

## 4. Cómo lo consume el render

**El endpoint público YA EXISTE:** `src/app/(public)/perfil/[id]/page.tsx` (server component, `prisma.taller.findUnique`, `force-dynamic`). El directorio (público y marca) linkea a `/perfil/[id]` → es **un solo lugar** donde aplicar el filtro. Hoy renderiza todos los bloques **sin condicionar** → hay que **agregarle el filtro** (no es endpoint nuevo).

Diseño sugerido (UI de 2.x, no parte del schema, pero define cómo se consume):
- Helper compartido `bloqueVisible(taller, bloque): boolean` → lee `visibilidadVidriera` con la convención "ausente = true" + aplica invariantes (Credenciales siempre true; SAM siempre stripped).
- **Vidriera pública** (`/perfil/[id]`, lo que ve la marca) → renderiza solo bloques con `bloqueVisible === true`.
- **"Mi vidriera"** (preview del propio taller) y botón **"Ver cómo me ve el directorio"** → **misma** lógica de filtro (reusa el helper) para que el preview sea fiel.
- **"Mi gestión productiva"** (privado, página nueva de 2.1) → **sin filtro**: muestra todo + la UI "Configuración de visibilidad" (los 6 toggles) + el mensaje "Este bloque no se muestra a las marcas…".
- Para guardar los toggles: server action o `PATCH /api/taller/perfil/visibilidad` que escribe `visibilidadVidriera`. (UI/endpoint de escritura = trabajo de 2.2, fuera de esta propuesta de schema.)

---

## 5. Migración

**Una sola migración aditiva.** Opción A:
```prisma
model Taller {
  // ...
  visibilidadVidriera  Json?   // null = todo visible
}
```
- **ADITIVA confirmada:** columna nullable, **sin backfill**, sin default que recalcular. Filas existentes quedan en `null` ⇒ todo visible ⇒ comportamiento actual intacto.
- No toca columnas existentes, no borra datos, reversible (drop column).
- (Opción B sería igual de aditiva: 6 `Boolean @default(true)`; default true preserva el todo-visible actual.)
- Schema lo modela y migra **Gerardo** (regla del repo: Sergio no toca schema). Las migraciones a PROD las aplica Vercel en el build.

---

## 6. ¿Cubre §1.3 completo?

§1.3 Modelo B pedía 4 cosas para el **taller**:
1. Toggles por grupo del perfil productivo → ✅ **cubierto** (5 grupos).
2. SAM siempre privado → ✅ **cubierto** (invariante, no es toggle).
3. ARCA siempre público → ✅ **cubierto** (Credenciales fijo).
4. Botón "Ver cómo me ve el directorio" → 🟡 el **dato** lo habilita esta propuesta; el **botón** es UI (2.1/2.2), no schema.

**Lo que esta propuesta NO cubre (y §1.3 sí menciona):**
- **Lado MARCA — "Ver cómo me ven los talleres" / visibilidad de campos de la marca.** §1.3 lo lista como simétrico. El copy §2.2 es solo taller. Esta propuesta modela **solo la vidriera del taller**; la visibilidad simétrica del perfil de marca es trabajo aparte (mismo patrón aplicado a `model Marca`). → decisión #4.
- **Formación por-badge** (copy §2.2): diferido por la decisión "no granular". El JSONB lo soporta a futuro sin migración. → decisión #2.
- §1.3 también incluía **1.4 (vitrina con info de marca en cada pedido)** — no es visibilidad de perfil, fuera de alcance.

**Conclusión:** cubre el **núcleo taller de §1.3 Modelo B completo**, salvo la pieza simétrica de marca y la granularidad por-badge (ambas explícitamente fuera del alcance "por bloque, taller").

---

## 7. Decisiones que necesito de Gerardo antes de implementar

1. **Modelo de datos:** ¿confirmás **Opción A (JSONB `visibilidadVidriera`)** o preferís **Opción B (6 booleanos)**? (Mi rec: A, por additividad + house style; B si querés garantías a nivel DB.)
2. **Formación:** ¿on/off a nivel bloque por ahora (per-badge diferido), como propongo? ¿O Formación no es toggleable y siempre se muestra?
3. **Grupo "capacidad":** confirmar que puede ser visible **pero SAM siempre se omite** del render público. ¿Qué muestra "capacidad" públicamente sin SAM (p.ej. capacidad mensual declarada, horario)?
4. **Lado marca:** ¿la visibilidad simétrica del perfil de marca ("Ver cómo me ven los talleres") entra en Etapa 2 o se difiere? (Esta propuesta no la incluye.)
5. **Set de bloques:** ¿confirmás los **6 toggleables** (formacion + equipo + espacio + capacidad + organizacion + maquinaria) con **Credenciales fijo**? ¿Falta o sobra alguno?
6. **Vos modelás y migrás** el schema (Sergio implementa la UI/render/endpoint sobre el campo ya migrado), ¿correcto?
