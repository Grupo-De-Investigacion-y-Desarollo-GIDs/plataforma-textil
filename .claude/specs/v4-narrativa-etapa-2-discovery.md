# Discovery — Narrativa V4, Etapa 2 (Reestructuración)

> **Tipo:** discovery / relevamiento. **NO es spec de implementación, NO se implementó nada.**
> **Fecha:** 2026-06-21 · **Autor:** Claude (auditoría read-only sobre develop `ff546e0`).
> **Insumo:** `.claude/specs/v4-narrativa-etapas-2-3-copy.md` (copy de Sergio, sección ETAPA 2).
> **Método:** 4 agentes de exploración auditando el código real contra el copy. Igual que los discoveries previos, el copy asume trabajo que en parte ya está hecho.

La Etapa 2 tiene **5 componentes** (el copy enumera 2.1 a 2.5; el plan original mencionaba 4 — falta contar **2.5 ESTADO→COORD**):

| # | Componente | Estado global | Brecha | Esfuerzo | ¿Arrancable ya? |
|---|---|---|---|---|---|
| 2.1 | Sub-tabs "Mi taller" | 🟡 Parcial | Falta el split en 2 sub-tabs + header común + botón preview | ~1–1.5 d | ✅ Sí |
| 2.2 | Tres dimensiones de la vidriera | 🟡 Parcial | Reorg + **mecanismo de visibilidad (no existe)** + badges Formación | ~4–5 d | ⚠️ Parcial (visibilidad sí; Formación depende de Academia) |
| 2.3 | Tres umbrales escalonados | 🔴 Ausente (como modelo) | Lógica nueva: gracia 60d, vidriera mínima, %, gating por umbral | ~3–4 d | ✅ Sí (necesita decisiones) |
| 2.4 | Filtros del directorio | 🟢 Casi listo | Copy/cosmético + definir cuáles 3 filtros | ~0.5 d | ✅ Sí (necesita decisión) |
| 2.5 | Rename ESTADO → COORD | 🟡 Mecánico, ancho | Enum + migración + rename de rutas (~70 archivos) | ~1.5–2 d | ⚠️ Defer-able (decisión + riesgo) |

**Total ajustado: ~10–13 días** de Sergio (vs. lo que el plan asumía como "reestructuración liviana"). El grueso es net-new lógica (2.3) y el mecanismo de visibilidad (2.2), no el copy.

---

## 2.1 — Sub-tabs "Mi taller"

### Qué existe hoy
- El tab top-level **ya se llama "Mi taller"** → `src/compartido/lib/content/institutional.ts:28` (`{ label: 'Mi taller', href: '/taller/perfil' }`). El nombre paraguas que pide el copy ya está.
- Existe un **patrón de sub-tabs reutilizable**: `src/app/(taller)/taller/pedidos/layout.tsx` (sub-tabs "Recibidos | Disponibles", client-side, ocultas en páginas de detalle — PR #374). Sirve de molde para "Mi vidriera | Mi gestión productiva".
- `src/app/(taller)/taller/perfil/page.tsx` renderiza hoy la vista del taller (9 secciones planas).

### Brecha real (vs copy 2.1)
- **No existe el split en 2 sub-tabs.** Hoy `/taller/perfil` es una sola vista. Falta: sub-tab **"Mi vidriera"** (público, lo que ven las marcas) + sub-tab **"Mi gestión productiva"** (privado, solo taller + acompañamiento).
- **No existe "Mi gestión productiva"** como página/concepto en ningún lado.
- **Header común** (nombre + etapa actual + ARCA verificado) — los datos existen pero no hay una cabecera compartida sobre ambos sub-tabs.
- **Botón "Ver cómo me ve el directorio"** — ABSENTE (`grep "Ver cómo" / "preview"` = 0). Hoy el taller tendría que adivinar su `/perfil/[id]`.

### Dependencias
- Acoplado a 2.2: "Mi vidriera" = vista pública filtrada por visibilidad; "Mi gestión productiva" = todo sin filtrar. El split de sub-tabs y el mecanismo de visibilidad se diseñan juntos.

### Esfuerzo: ~1–1.5 días
Reestructurar `/taller/perfil` con layout de sub-tabs (molde de pedidos), crear la página "Mi gestión productiva", header común, botón preview. Sin schema.

---

## 2.2 — Tres dimensiones de la vidriera (Credenciales · Formación · Descripción)

### Qué existe hoy
- **Vidriera del taller** (`taller/perfil/page.tsx`) y **perfil público** (`(public)/perfil/[id]/page.tsx`): layout **plano de ~9 secciones**, NO reorganizado en 3 bloques.
- **Bloque 1 — Credenciales:** los datos existen (etapa vía `nivelAEtapa()`, badge ARCA `verificadoAfip`). Falta agruparlos como "Credenciales".
- **Bloque 3 — Descripción / perfil productivo:** **los 5 sub-bloques existen** en schema y en el wizard `taller/perfil/completar/page.tsx`:
  - Mi equipo de trabajo (`plantilla`, `rolesFuncionales`, `polivalencia`)
  - Mi espacio físico (`metrosCuadrados`, `areas`)
  - Mi capacidad de producción (`sam`, `horario`, `paradasFrecuencia`)
  - Cómo organizo el trabajo (`organizacion`, `registroProduccion`, `escalabilidad`)
  - Maquinaria (`maquinaria`)
- **Bloque 2 — Formación:** ver dependencia Academia abajo. Hoy hay una card "Capacitaciones certificadas" (texto + link "Verificar"), NO badges.

### Brecha real (vs copy 2.2)
1. **Reorganización** de la vidriera (pública y privada) en los 3 bloques narrados. Trabajo de UI sobre datos que ya existen.
2. **🔴 Mecanismo de "Configuración de visibilidad" — NO EXISTE.** Es la brecha dura de toda la Etapa 2:
   - `grep "visibilidad/ocultar/mostrar/visible"` en código de taller → solo texto narrativo, ningún mecanismo.
   - No hay campo de schema para "visible a marcas" por bloque ni por badge.
   - El único enum de visibilidad existente es `VisibilidadPedido` (PUBLICO|INVITACION), para pedidos — no reutilizable.
   - Falta: schema (flags por bloque), página/modal "Configuración de visibilidad", render condicional en `/perfil/[id]`, y el mensaje "Este bloque no se muestra a las marcas…".
3. **Badges de Formación** (bloque 2): hoy es lista de texto, no badges; sin estado vacío con CTA "Ir a la Academia"; sin fecha de obtención; sin visibilidad por-badge.

### Dependencias críticas
- **➜ §1.3 del master (toggles de visibilidad Modelo B):** el mecanismo de visibilidad de 2.2 **ES** el trabajo pendiente de §1.3. Confirmado: no existe nada. Hay que construirlo (schema + UI + render condicional). **Se construye una vez y lo usan Credenciales, Formación y Descripción.** Es el cuello de botella técnico de la etapa.
- **➜ Academia (bloque 2 Formación):** la Academia está **madura y funciona end-to-end** (crear/publicar curso → taller cursa → progreso → certificado con QR/email; modelos `Coleccion/Video/Evaluacion/ProgresoCapacitacion/Certificado`; `calcularNivel`/`aplicarNivel` operativos; 3 colecciones seedeadas). **PERO los videos son placeholders (rickroll)** — no hay contenido real. Veredicto: los badges de Formación **se pueden construir ya** (no hay blocker técnico de Academia), pero **el contenido real de cursos hace falta antes de producción**. La visibilidad por-badge depende del mecanismo del punto 2.

### Esfuerzo: ~4–5 días
- Reorg en 3 bloques: ~1 d.
- Mecanismo de visibilidad (schema Gerardo + Config UI + render condicional): ~2–3 d.
- Badges de Formación (sobre Academia existente): ~1 d.

---

## 2.3 — Tres umbrales escalonados (Registrado → Visible → Apto para cotizar)

### Qué existe hoy
- **"Mi recorrido"** = `src/app/(taller)/taller/formalizacion/page.tsx` (`institutional.ts:29`). El dashboard `/taller` muestra anillo de progreso + historial de niveles, pero **ninguno de los dos renderiza los 3 umbrales** como paneles ordenados.
- **Etapas (Inicial / En proceso / Consolidada):** YA implementadas como *traducción* de BRONCE/PLATA/ORO vía `nivelAEtapa()`. El reframe de lenguaje del copy ya está cubierto.
- **Recálculo de nivel:** EXISTE y funciona — `src/compartido/lib/nivel.ts` (`calcularNivel`/`aplicarNivel`, con log + notificación al subir). Se dispara en eventos puntuales (ej: aprobación de validación), no en todo cambio.
- **Gating actual:** hoy todo se controla con el booleano **`verificadoAfip`**:
  - Directorio (público y marca): `where: { verificadoAfip: true }`.
  - Cotizar: guard en `api/cotizaciones/route.ts` → `if (!taller.verificadoAfip) 403`.

### Brecha real (vs copy 2.3) — esto es lo más net-new de la etapa
1. **Los 3 umbrales NO existen como modelo.** El copy los plantea como **gates de acción** (qué podés hacer), conceptualmente **distintos de los niveles** (qué tan formalizado estás). Hoy no hay ningún modelo de umbral; el gating es un único booleano.
2. **🔴 Período de gracia de 60 días — ABSENTE.** `createdAt` existe pero no hay lógica de "período de bienvenida", ni cuenta regresiva, ni mensajes "Te quedan [X] días…" / "El período de bienvenida finalizó…".
3. **"Vidriera mínima" — PARCIAL/floja.** El onboarding (`compartido/lib/onboarding.ts`) chequea solo 2 de los 5 requisitos del copy (`capacidadMensual` + `descripcion`). Faltan: descripción ≥50 caracteres, ubicación, ≥1 rubro/capacidad, 1 foto. No es un concepto nombrado ni validado.
4. **% de completitud del perfil productivo (80% para Umbral 2) — ABSENTE.** No hay cálculo holístico de completitud.
5. **Gating por umbral — ABSENTE.** Hoy `verificadoAfip` gatea **a la vez** aparecer en directorio (Umbral 2) y cotizar (Umbral 3); el copy quiere que "Apto para cotizar" sea una barra **más alta y distinta** (etapa ≥ "En proceso" + perfil productivo). Cambiar esto toca el `where` del directorio y el guard de cotizaciones.

### Dependencias / decisiones
- Necesita **decisiones de producto** (ver "Decisiones" abajo): qué nivel = "En proceso", qué barra exacta habilita cotizar, qué pasa al vencer la gracia.
- No depende de Academia ni de 2.2 para arrancar la lógica base (gracia + vidriera mínima + paneles), pero el render de los 3 paneles vive en "Mi recorrido".

### Esfuerzo: ~3–4 días
Lógica de gracia (createdAt-based), validación de vidriera mínima (5 checks), cálculo de %, 3 paneles en `/taller/formalizacion`, y reescritura del gating (directorio + cotizar). Puede requerir 1–2 campos de schema (Gerardo) según cómo se persista el estado de umbral.

---

## 2.4 — Filtros del directorio

### Qué existe hoy
- **Dos directorios:** público `src/app/(public)/directorio/page.tsx` y marca `src/app/(marca)/marca/directorio/page.tsx`.
- Ambos tienen **3 controles visibles**: `q` (búsqueda nombre/ubicación) + `proceso` (select) + `prenda` (select). (Más `page` de paginación, que no es filtro.)
- **Gate CUIT YA aplicado** en ambos `where`: `verificadoAfip: true`. ✅
- **Empty state YA correcto** en ambos: "No encontramos talleres con esos filtros" (coincide con el copy). ✅

### Brecha real (vs copy 2.4) — casi todo cosmético
- **Título "Filtrar talleres"** sobre el form — ABSENTE en ambos.
- **Texto siempre visible "Mostramos solo talleres con CUIT verificado por ARCA"** — ABSENTE (el gate existe en la query pero no se comunica al usuario).
- **Botón "Aplicar filtros"** — hoy dice "Filtrar" en ambos. Rename de copy.
- **Botón "Limpiar filtros"** — ✅ ya existe.

### ⚠️ Decisión pendiente
El copy dice "simplificar a **tres** filtros" pero **no enumera cuáles** (la lista bajo "Filtros:" en el copy quedó vacía). Hoy ya hay 3 controles (q/proceso/prenda). El estado vacío del copy menciona "ampliando la **ubicación**", lo que sugiere que ubicación debería ser un filtro propio. **Hay que definir los 3 filtros exactos antes de tocar nada** (probablemente: ubicación + proceso + prenda, con la búsqueda por texto aparte).

### Esfuerzo: ~0.5 día (una vez definidos los 3 filtros). Es el quick-win de la etapa.

---

## 2.5 — Rename ESTADO → COORD

### Qué existe hoy / brecha
Rename de nomenclatura puro (mismos permisos). **Radio de impacto ancho: ~70 archivos.**

| Categoría | Archivos | Riesgo |
|---|---|---|
| **Enum + migración DB** | `prisma/schema.prisma` (`enum UserRole { … ESTADO … }`) | 🔴 Alto — requiere migración de enum + estrategia de deploy |
| **Tipo Rol** | `compartido/lib/roles.ts` (`type Rol`) | importado indirectamente por ~63 archivos |
| **Rename de route group** | `src/app/(estado)/` → `(coord)/` (8 páginas) + `src/app/api/estado/` (~8 routes) | 🟡 rutas `/estado/*` → `/coord/*` en 25+ archivos |
| **Middleware** | `src/middleware.ts` (gating + redirect a `/estado`) | revisión manual |
| **Tests** | 12 archivos `__tests__` con 'ESTADO' en mocks | mecánico |
| **Copy UI** | selectores de rol, "Verificado por el Estado", etc. (~8 archivos) | bajo |

### Recomendación
**Defer-able.** Es el componente de **menor valor de usuario** (cambio de nombre) y **mayor riesgo** (migración de enum + rename de rutas en producción). Conviene hacerlo en su propio PR aislado, con tests, y no mezclado con 2.1–2.4. Necesita decisión de Gerardo sobre timing (¿antes o después del piloto?). Como es solo nomenclatura, **no bloquea** ningún otro componente.

---

## Dependencias críticas (respuesta directa)

- **¿2.2 depende de los toggles de §1.3?** → **Sí, y al revés: 2.2 ES §1.3.** El mecanismo de visibilidad por bloque no existe en absoluto; hay que construirlo (schema + UI + render condicional). Es el cuello de botella técnico de la etapa; se construye una vez para los 3 bloques.
- **¿Formación depende de Academia?** → Academia está **madura/funcional** (no bloquea construir badges), pero su **contenido es placeholder** (videos rickroll) → el contenido real hace falta antes de producción, no antes de construir los badges.
- **¿2.3 necesita lógica nueva de umbrales/gracia?** → **Sí, casi todo es net-new:** período de gracia 60d (ausente), vidriera mínima validada (parcial), % de completitud (ausente), y los 3 umbrales como gates (ausentes; hoy un solo booleano `verificadoAfip` gatea todo).

## Qué se puede hacer YA vs qué espera

**Arrancable ya (sin bloqueos):**
- **2.4 filtros** (cosmético) — una vez Gerardo defina los 3 filtros.
- **2.1 sub-tabs** (estructura, sin schema).
- **2.2 mecanismo de visibilidad + reorg + Credenciales/Descripción** (schema lo toca Gerardo).
- **2.3 lógica de gracia + vidriera mínima + paneles** (una vez tomadas las decisiones de producto).

**Espera / gated:**
- **2.2 Formación badges:** construibles ya, pero (a) dependen del mecanismo de visibilidad para el hide por-badge y (b) el contenido real de Academia para producción.
- **2.4 filtros exactos:** decisión de Gerardo (el copy no los enumera).
- **2.3 umbrales:** decisiones de producto (qué nivel = "En proceso", barra de cotizar, vencimiento de gracia).
- **2.5 COORD rename:** decisión de timing + PR aislado (defer-able, no bloquea nada).

## Orden de ataque sugerido
1. **2.4 filtros** — quick-win, valida el pipeline de la etapa (0.5 d).
2. **2.1 sub-tabs** — estructura base sobre la que se monta 2.2 (1–1.5 d).
3. **2.2 mecanismo de visibilidad** (schema Gerardo primero) + reorg en 3 bloques (2–3 d). Es el cuello de botella; cuanto antes se desbloquee, mejor.
4. **2.3 umbrales + gracia** — el mayor net-new; en paralelo a 2.2 si hay capacidad (3–4 d).
5. **2.2 Formación badges** — una vez que (3) y la visibilidad estén, y con contenido real de Academia para producción (1 d).
6. **2.5 COORD rename** — PR aislado, defer-able, cuando se decida el timing (1.5–2 d).

## Decisiones que necesito de Gerardo
1. **Schema:** confirmar que vos modelás los campos nuevos (visibilidad por bloque para 2.2; posibles flags de umbral/vidriera-mínima para 2.3; enum COORD para 2.5). Sergio no toca schema.
2. **2.4:** ¿cuáles son los **3 filtros exactos** del directorio? (el copy no los enumera; sugerencia: ubicación + proceso + prenda).
3. **2.3:** ¿qué nivel/etapa habilita el **Umbral 2** ("En proceso") y qué barra exacta habilita **cotizar** (Umbral 3)? ¿Qué pasa cuando vence el período de gracia de 60 días — solo mensaje, o se restringe algo?
4. **2.2 visibilidad:** ¿el mecanismo es por **bloque** (Credenciales/Formación/Descripción) o también granular (sub-bloques de Descripción + por-badge de Formación)? El copy sugiere ambos niveles.
5. **2.5:** ¿el rename ESTADO→COORD va **en esta etapa o se difiere** (recomendación: difiere, PR aislado, post-piloto)?
6. **Academia:** ¿el contenido real de cursos (reemplazar videos placeholder) entra en el alcance de la Etapa 2 o es trabajo separado?
