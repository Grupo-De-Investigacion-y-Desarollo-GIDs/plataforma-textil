# Discovery — Narrativa V4, Etapa 2 (Reestructuración)

> **Tipo:** discovery / relevamiento. **NO es spec de implementación, NO se implementó nada.**
> **Fecha:** 2026-06-21 · **Autor:** Claude (auditoría read-only sobre develop `ff546e0`).
> **Insumo:** `.claude/specs/v4-narrativa-etapas-2-3-copy.md` (copy de Sergio, sección ETAPA 2).
> **Método:** 4 agentes de exploración auditando el código real contra el copy. Igual que los discoveries previos, el copy asume trabajo que en parte ya está hecho.

> ## 🔧 CORREGIDO por Sergio — 21-jun (revisión de modelo)
> El discovery original mezclaba **etapas narrativas** con **umbrales/capacidades** y asumía un modelo de "perfil 80% para cotizar" que **la V4 inventó y NO está en el master 3.7**. Sergio corrigió el modelo de fondo. Cambios aplicados a este documento (secciones marcadas con 🔧):
> 1. **Separación etapas ≠ capacidades** (nueva sección, abajo). Las **etapas** (formalización, sello que ve la marca) y las **capacidades** (qué podés hacer: cotizar, aparecer) son ejes distintos.
> 2. **Cotizar = SOLO CUIT verificado** (no el "perfil 80%"; ese gate se SACA para el piloto). → 2.3 reescrito.
> 3. **Período de gracia 60 días = para CUIT, no para vidriera**, y vence a **cuenta inactiva** (no solo mensaje). → 2.3 reescrito.
> 4. **Filtros del directorio definidos: Rubro / Servicios / Ubicación** (capacidad NO se filtra). → 2.4 reescrito.
> 5. **Formación = toggle granular por badge** (excepción a "no granular"). → nota en 2.2.
> 6. **Rename ESTADO→COORD se DIFIERE a V4.5**; en Etapa 2 solo queda un **fix de copy de comms** al taller (no debe leer "Estado"). → 2.5 reescrito.
> 7. **Nuevo scope → Etapa 3 / V4.5:** panel del **COORD POLÍTICO** para configurar los requisitos de cada etapa (configurable, no hardcodeado). → fuera de Etapa 2.

La Etapa 2 tiene **5 componentes** (el copy enumera 2.1 a 2.5):

| # | Componente | Estado global | Brecha | Esfuerzo | ¿Arrancable ya? |
|---|---|---|---|---|---|
| 2.1 ✅ | Sub-tabs "Mi taller" | ✅ **HECHO** (#439, `2b3a3fd`) | Split en sub-tabs (Mi vidriera \| Mi gestión productiva) + cabecera común + botón/modal preview + ajustes de QA (3 pases) | — | ✅ Listo |
| 2.2 | Tres dimensiones de la vidriera | 🟡 En curso (**2.2-A ✅**) | **2.2-A HECHO** (#442, `a12c798`): estructura (3er sub-tab "Datos básicos" + reorder + dedup + modelo de distribución por contexto). Falta **2.2-B** (taxonomía + render condicional con flag) + **2.2-C** (toggles + escritura) | ~2.5–3.5 d | ✅ Sí (2.2-B/C arrancables) |
| 2.3 🔧 | Tres umbrales escalonados | 🔴 Ausente (como modelo) | Gracia 60d→**inactiva**, vidriera mínima (4 reqs). **Cotizar=solo CUIT (ya existe)** | ~2–3 d | ✅ Sí (modelo ya cerrado) |
| 2.4 ✅ | Filtros del directorio | ✅ **HECHO** (#438, `f35e39a`) | Rubro/Servicios/Ubicación (cascada) + copy gate ARCA — mergeado en develop | — | ✅ Listo |
| 2.5 ✅ | Comms al taller no dicen "Estado" | ✅ **HECHO** (#438, `f35e39a`) | 7 puntos user-facing → "Coordinación". **Rename interno sigue → V4.5** | — | ✅ Listo |

**Total ajustado: ~6.5–9 días** de Sergio (antes ~10–13). Bajó porque: cotizar simplificado a solo-CUIT (que ya existe, elimina el cálculo holístico de %), el mecanismo de visibilidad ya tiene su base mergeada (#437), y el rename pesado ESTADO→COORD (~1.5–2 d) sale de Etapa 2 hacia V4.5 (queda solo el fix de copy ~0.5 d). El grueso restante es net-new de 2.3 (gracia + vidriera mínima) y el render/UI de 2.2.

### 📦 Estado de la Etapa 2 (actualizado 2026-06-24)

**HECHO en develop:**
- ✅ **2.2-A — estructura de la vidriera** (`#442`, `a12c798`, mergeado 2026-06-27): 3er sub-tab **"Datos básicos"** (ruta índice) + reorder (Datos básicos → Mi gestión productiva → Mi vidriera) + dedup de cards. Tras el QA del combinado de Sergio incorpora el **modelo de distribución de info por contexto** (reemplaza el issue B): cabecera = solo nombre + pills; ubicación → Datos básicos; card **"Tu recorrido de formalización"** en Inicio (etapa + ARCA + "X de N requisitos verificados" + link); CUIT con texto chico "Verificado por ARCA"; `ProximoNivelCard` → "Próximos pasos para avanzar" (evita doble heading). Mergeado **antes** de #439b para crear `/taller/perfil/vidriera`. CI verde (unit + e2e).
- ✅ **#439b — barrido del rol Taller** (`#440`, `43738fc`, mergeado 2026-06-27): sacó la gamificación del dashboard (ring 19% / stat-grid) + el "Verificar email" fantasma del checklist + ocultó PII del aprobador + ajustó links (incl. el botón "Ver mi vidriera" del wizard → `/taller/perfil/vidriera`, que NO da 404 porque #442 entró primero). CI verde.
- ✅ **Sidebar "Formalización %"** (`#443`, `e75510a`, mergeado 2026-06-27): se quitó el "Formalización X%" + barra del user-sidebar (degamificación V4, coherente con el dashboard). CI verde.
- ✅ **2.5 — fix de comms** (`#438`, `f35e39a`): los 7 puntos user-facing que leía el taller dicen "Coordinación", no "Estado". Base schema de visibilidad de 2.2 también ya en develop (`#437`).
- ✅ **2.4 — filtros del directorio** (`#438`, `f35e39a`): Rubro / Servicios / Ubicación (cascada provincia→partido) + texto fijo del gate ARCA, en el directorio público y la vista marca.
- ✅ **2.1 — sub-tabs "Mi taller"** (`#439`, `2b3a3fd`, mergeado 2026-06-24): split en sub-tabs (Mi vidriera | Mi gestión productiva) + cabecera común con `nivelAEtapa` + ARCA + "Ver cómo me ve el directorio" como **modal** sobre Mi vidriera. Incluye 3 pases de QA de Sergio: cleanup de marketplace en Mi vidriera **y** en la vista pública `/perfil/[id]`, PII del responsable → privada (gestión), breadcrumb del wizard, "Guardar y completar después" en pasos intermedios, "Puntaje" eliminado, y diagnóstico/fix de pedidos de test (T-08). CI verde sobre develop (unit + e2e).

**Pendiente de la Etapa 2:**
- 🟡 **2.2 — vidriera por categorías de visibilidad + privacy-by-default.** Spec **CERRADO** (matriz final de Sergio) en `v4-etapa2-2-vidriera-discovery.md`. Se parte en **3 PRs**: **2.2-A** ✅ **HECHO** (#442, `a12c798`) · **2.2-B** (taxonomía 3 categorías + render condicional con flag `modeloB_revisado`) · **2.2-C** (UI de toggles + escritura + Formación granular). Estado: el flag `modeloB_revisado` ya está en develop (#441) y 2.2-A también → **2.2-B arrancable ya**; 2.2-C espera 2.2-B. **Ninguna decisión de Sergio pendiente.** El "cambio 4" de Sergio (Mi vidriera con 3 dimensiones + toggles + indicadores "Editado en X →") va en 2.2-B/C (ver §7 del spec de 2.2).
- ✅ **#439b — hallazgos del barrido** (`#440`, `43738fc`, mergeado 2026-06-27): gráficos "Formalización 19%", métricas del dashboard, PII del aprobador, audit de links. **MERGEADO** (ya no pendiente).
- 🔴 **2.3 — gracia 60d→inactiva + vidriera mínima (4 reqs)** (el mayor net-new restante; necesita decisión cron on-read vs job).

**Único prerrequisito externo del próximo deploy a prod (orden de Sergio):** **OBS-01 — setup externo de observabilidad** (UptimeRobot + Telegram + notificaciones de Vercel). Es operativo/manual, no de código; el código de `/api/health` + runbook ya están. El paquete del piloto en develop NO depende de OBS-01 para funcionar, pero OBS-01 debe quedar montado antes de promover a prod.

---

## 🔧 Modelo corregido — Etapas narrativas ≠ Capacidades (el cambio de fondo)

El discovery original trataba "umbrales", "niveles" y "etapas" como un mismo eje confuso. Sergio separó **dos ejes ortogonales**:

### Eje A — ETAPAS NARRATIVAS (formalización · master 3.9)
Es el **sello que ve la marca**. Tres etapas, que mapean 1:1 a los niveles internos BRONCE/PLATA/ORO (que **siguen en DB para analítica**, master 3.8 — no se borran, solo se renombra el lenguaje de cara al usuario):

| Etapa narrativa | Nivel interno (DB) | Requisito |
|---|---|---|
| **Etapa inicial** | BRONCE | CUIT verificado en ARCA |
| **En proceso** | PLATA | CUIT + Habilitación municipal + ART (3 de 7 requisitos) |
| **Consolidada** | ORO | Los 7 requisitos verificados |

- Ya implementado como traducción de lenguaje vía `nivelAEtapa()` (ver 2.3).
- **Los requisitos de cada etapa serán configurables por el COORD POLÍTICO** desde un panel nuevo → eso es **Etapa 3 / V4.5**, NO Etapa 2. Por ahora los requisitos quedan como están (hardcodeados en `nivel.ts`).

### Eje B — CAPACIDADES (condiciones funcionales · qué podés hacer)
**No son etapas.** Son gates de acción, con su propia barra:

| Capacidad | Requisito (modelo corregido) | Hoy en código |
|---|---|---|
| **Cotizar** | **SOLO CUIT verificado en ARCA** | ✅ Ya es así: `if (!taller.verificadoAfip) 403` en `api/cotizaciones`. **NO se toca.** |
| **Aparecer en directorio** | CUIT verificado **+ vidriera mínima (4 reqs)** | 🟡 Parcial: hoy solo `verificadoAfip:true`; falta sumar la vidriera mínima |

> **Lo que se SACA:** el "perfil productivo al 80% para cotizar" que la V4 había agregado. No está en master 3.7. Para el piloto, **cotizar depende únicamente del CUIT**. Esto elimina todo el cálculo de "% de completitud holístico" que el discovery original estimaba como net-new.

---

## 2.1 — Sub-tabs "Mi taller" · ✅ HECHO (PR #439, `2b3a3fd`, 2026-06-24)

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
2. **Mecanismo de "Configuración de visibilidad" — BASE YA MERGEADA (#437).** Era la brecha dura de la etapa; ya está cimentada:
   - Schema: `Taller.visibilidadVidriera Json?` (migración aditiva, behavior-preserving, null = todo visible).
   - Helper: `src/compartido/lib/visibilidad-vidriera.ts` (`bloqueVisible`, `normalizarVisibilidad`, `samVisible`) con invariantes Credenciales-fijo y SAM-siempre-privado.
   - Render: el filtro ya se aplica en `(public)/perfil/[id]/page.tsx` para Maquinaria y Formación.
   - **Falta (PRs siguientes):** la **UI** "Configuración de visibilidad" (escribir el JSONB), aplicar `bloqueVisible` a los 4 bloques aún sin render condicional (equipo/espacio/capacidad/organización), y el mensaje "Este bloque no se muestra a las marcas…".
3. **Badges de Formación** (bloque 2): hoy es lista de texto, no badges; sin estado vacío con CTA "Ir a la Academia"; sin fecha de obtención.
   - 🔧 **Visibilidad granular por badge (corrección Sergio):** Formación es la **excepción** a "toggle por bloque". El taller puede ocultar **cada badge individualmente** (visibles por default). **Ningún curso es requisito de nada** (ni cotizar, ni etapas, ni directorio).
   - **Implicancia para el type:** el JSONB `visibilidadVidriera` **ya soporta esto sin migración**. En el PR de Formación se extiende el type para que `formacion` pueda ser `boolean | Record<badgeId, boolean>` (bool = todo el bloque; objeto = por badge). El helper `bloqueVisible('formacion')` se mantiene para "¿hay algún badge visible?"; se agrega un `badgeVisible(taller, badgeId)`. **No es cambio de schema, es cambio de type/helper** (queda para el PR de Formación, no para ahora).

### Dependencias críticas
- **➜ §1.3 del master (toggles de visibilidad Modelo B):** el mecanismo de visibilidad de 2.2 **ES** el trabajo pendiente de §1.3. Confirmado: no existe nada. Hay que construirlo (schema + UI + render condicional). **Se construye una vez y lo usan Credenciales, Formación y Descripción.** Es el cuello de botella técnico de la etapa.
- **➜ Academia (bloque 2 Formación):** la Academia está **madura y funciona end-to-end** (crear/publicar curso → taller cursa → progreso → certificado con QR/email; modelos `Coleccion/Video/Evaluacion/ProgresoCapacitacion/Certificado`; `calcularNivel`/`aplicarNivel` operativos; 3 colecciones seedeadas). **PERO los videos son placeholders (rickroll)** — no hay contenido real. Veredicto: los badges de Formación **se pueden construir ya** (no hay blocker técnico de Academia), pero **el contenido real de cursos hace falta antes de producción**. La visibilidad por-badge depende del mecanismo del punto 2.

### Esfuerzo: ~3–4 días (bajó: la base de visibilidad ya está en #437)
- Reorg en 3 bloques: ~1 d.
- **UI** "Configuración de visibilidad" + render condicional de los 4 bloques restantes (la base schema/helper/render ya existe): ~1.5–2 d.
- Badges de Formación + visibilidad granular por badge (sobre Academia existente): ~1 d.

---

## 2.3 🔧 — Capacidades y período de gracia (modelo corregido)

> **Reescrito tras la corrección de Sergio (21-jun).** El discovery original leía "3 umbrales escalonados" con un gate de "perfil 80% para cotizar". Ese modelo **se descarta**: cotizar = solo CUIT; el resto se reduce a **vidriera mínima** (para aparecer) + **período de gracia 60d sobre el CUIT**. Ver "Modelo corregido" arriba.

### Qué existe hoy
- **"Mi recorrido"** = `src/app/(taller)/taller/formalizacion/page.tsx` (`institutional.ts:29`). El dashboard `/taller` muestra anillo de progreso + historial de niveles.
- **Etapas (Inicial / En proceso / Consolidada):** YA implementadas como *traducción* de BRONCE/PLATA/ORO vía `nivelAEtapa()`. El reframe de lenguaje del copy ya está cubierto. **No se toca** (sus requisitos serán configurables por COORD político → V4.5).
- **Recálculo de nivel:** EXISTE y funciona — `src/compartido/lib/nivel.ts` (`calcularNivel`/`aplicarNivel`, con log + notificación al subir).
- **Gating de cotizar:** ✅ **YA es el modelo correcto** — `api/cotizaciones/route.ts` → `if (!taller.verificadoAfip) 403`. **Solo CUIT. No se toca.**
- **Gating de directorio:** hoy `where: { verificadoAfip: true }` (solo CUIT). Falta sumar la **vidriera mínima**.

### Brecha real (vs modelo corregido) — qué es net-new

1. **🔴 Período de gracia de 60 días (sobre el CUIT) — ABSENTE.** Modelo corregido:
   - Si pasan **60 días sin verificar CUIT** → la cuenta pasa a **INACTIVA** (no se borra; estado `pendiente formalización`, **recuperable** automáticamente al verificar el CUIT).
   - **Email recordatorio ~día 50.**
   - La cuenta inactiva **conserva** acceso a Academia + Recursos (no la expulsa de la plataforma), pero no opera comercialmente.
   - Hoy: `createdAt` existe, pero no hay cuenta regresiva, ni el email del día 50, ni la transición a inactiva, ni la recuperación. Es lógica nueva (job/cron o cálculo on-read + un campo de estado).
2. **"Vidriera mínima" (4 requisitos para aparecer en directorio) — PARCIAL/floja.** El modelo corregido fija **4 reqs** (antes el discovery contaba 5 con cálculo de %):
   - **Descripción ≥ 50 caracteres**
   - **Ubicación declarada** (manual, no automática)
   - **Al menos 1 rubro o capacidad**
   - **Foto del taller** — **OPCIONAL para el piloto** (placeholder institucional); configurable como obligatoria post-piloto.
   - Hoy `compartido/lib/onboarding.ts` chequea solo 2 (`capacidadMensual` + `descripcion`), sin el umbral de 50 chars ni la noción "vidriera mínima". Hay que nombrarlo, validarlo y usarlo en el `where` del directorio.
   - **La vidriera mínima NO tiene gracia:** si no la completa, simplemente **no aparece** en el directorio, pero **sigue operando** (Academia + Recursos). No hay penalización ni cuenta regresiva.
3. **% de completitud holístico (80%) — DESCARTADO.** Ya no se calcula: cotizar es solo-CUIT. Esto era el grueso del net-new del discovery viejo y **sale de scope**.
4. **Gating de cotizar — NO se toca.** Ya es solo-CUIT, que es el modelo correcto.

### Dependencias / decisiones
- **Modelo ya cerrado por Sergio** — no quedan decisiones de producto abiertas para arrancar (gracia 60d→inactiva, vidriera mínima 4 reqs, foto opcional en piloto).
- **Schema (Gerardo):** la cuenta inactiva probablemente necesita un campo de estado/flag (o se deriva on-read de `verificadoAfip` + `createdAt`). Definir al especificar el PR.
- Render de los paneles de capacidad/etapa vive en "Mi recorrido"; no depende de Academia ni de 2.2.

### Esfuerzo: ~2–3 días (bajó desde 3–4)
Baja porque se descarta el cálculo de % y la reescritura del gate de cotizar. Queda: lógica de gracia 60d→inactiva (cálculo on-read o cron + email día 50 + recuperación), validación de vidriera mínima (4 checks) y sumarla al `where` del directorio, y los paneles en `/taller/formalizacion`. Puede requerir 1 campo de schema (Gerardo) para el estado inactivo.

---

## 2.4 — Filtros del directorio · ✅ HECHO (PR #438, `f35e39a`)

> **Implementado y mergeado en develop (2026-06-22).** Componente compartido `DirectorioFiltros` con los 3 filtros (Rubro=prenda / Servicios=proceso / Ubicación=cascada provincia→partido vía `derivarUbicaciones()`), texto fijo del gate ARCA, heading "Filtrar talleres" y botón "Aplicar filtros", en el directorio público y la vista marca. Capacidad NO se filtra. El resto de esta sección queda como registro del relevamiento.

### Qué existe hoy
- **Dos directorios:** público `src/app/(public)/directorio/page.tsx` y marca `src/app/(marca)/marca/directorio/page.tsx`.
- Ambos tienen **3 controles visibles**: `q` (búsqueda nombre/ubicación) + `proceso` (select) + `prenda` (select). (Más `page` de paginación, que no es filtro.)
- **Gate CUIT YA aplicado** en ambos `where`: `verificadoAfip: true`. ✅
- **Empty state YA correcto** en ambos: "No encontramos talleres con esos filtros" (coincide con el copy). ✅

### 🔧 Filtros definidos (corrección Sergio) — los 3 son Rubro / Servicios / Ubicación
Ya no es decisión pendiente. Sergio fijó los **3 filtros** (master 3.11):

| Filtro | Significado | Mapeo a código hoy |
|---|---|---|
| **Rubro** | Tipo de prenda principal (remera, jean, camisa, buzo, pantalón) | ≈ control `prenda` actual (relación `prendas`) |
| **Servicios** | Procesos productivos (corte, confección, terminación, estampado) | ≈ control `proceso` actual (relación `procesos`) |
| **Ubicación** | Provincia + partido declarado | hoy va dentro del `q` de texto; debe ser **filtro propio** (select provincia/partido) |

- **Regla forzada (no es filtro):** solo talleres con **CUIT verificado en ARCA** (master 3.11). ✅ Ya aplicado en ambos `where` (`verificadoAfip:true`). Hay que **comunicarlo** con el texto siempre visible "Mostramos solo talleres con CUIT verificado por ARCA" (hoy ABSENTE).
- **Capacidad NO se filtra:** excluiría a los talleres del piloto que aún no declararon capacidad. Aparece en la **card** si el taller la hizo visible (Modelo B / 2.2), pero no es un filtro.

### Brecha real (vs modelo corregido)
- **Ubicación como filtro propio** (select provincia/partido), separada de la búsqueda por texto. Es el único cambio funcional; el resto es cosmético.
- **Título "Filtrar talleres"** sobre el form — ABSENTE.
- **Texto "Mostramos solo talleres con CUIT verificado por ARCA"** — ABSENTE (el gate existe en la query, falta comunicarlo).
- **Botón "Aplicar filtros"** — hoy dice "Filtrar". Rename de copy. **"Limpiar filtros"** ✅ ya existe.

### Esfuerzo: ~0.5–1 día. El filtro de ubicación propio sube un poco vs el 0.5 cosmético; sigue siendo el quick-win de la etapa.

---

## 2.5 — El taller no debe leer "Estado" · ✅ HECHO (PR #438, `f35e39a`) — rename interno → V4.5

> **Implementado y mergeado en develop (2026-06-22).** Los **7** puntos user-facing que leía el taller dicen "Coordinación" (los 6 detectados + el 7º `taller/perfil:246` que el grep destapó, confirmado por Gerardo). El **rename interno** del rol (enum + rutas + ~70 archivos) **sigue diferido a V4.5**. El resto de esta sección queda como registro del relevamiento.

> **Corrección Sergio:** el rename técnico ESTADO→COORD (enum + rutas + ~70 archivos) **se difiere a V4.5**. En Etapa 2 / piloto solo queda la **condición de Sergio**: el taller nunca debe **leer** la palabra "Estado". Eso es un **fix de copy acotado** en las comms al taller, separado del rename interno.

### ✅ Verificación de la condición (auditoría 22-jun): ¿el taller lee "Estado"?
**SÍ, en varios lados** (no en los emails Resend, sí en notif/WhatsApp/páginas). El email real de doc aprobado dice "equipo de PDT" (limpio); el resto no:

| # | Dónde | Archivo:línea | Texto que lee el taller |
|---|---|---|---|
| 1 | **Notificación in-app** | `(estado)/estado/talleres/[id]/page.tsx:111` | `El Estado aprobo tu ${tipo}.` |
| 2 | **WhatsApp** | `compartido/lib/whatsapp-templates.ts:9` | `El Estado aprobo tu ${tipoDocumento}. Sumaste ${puntos} puntos…` |
| 3 | **Página formalización** | `(taller)/taller/formalizacion/page.tsx:136` | `Verificado por … 'el Estado' …` |
| 4 | **Dashboard taller** | `(taller)/taller/page.tsx:188` | `…una vez que el Estado verifique tu CUIT…` |
| 5 | **Pedido disponible** | `(taller)/taller/pedidos/disponibles/[id]/page.tsx:103` | `…el Estado revisa y aprueba en dias habiles.` |
| 6 | **Ayuda onboarding** | `(public)/ayuda/onboarding-taller/page.tsx:77` | `El Estado los revisa y aprueba en 24-48hs habiles.` |

✅ **Limpio (no tocar):** el email Resend `buildDocAprobadoEmail` dice "equipo de PDT", no "Estado".

### Fix de Etapa 2 (la condición de Sergio) — ~0.5 día
Cambiar el **copy de cara al taller** de "el Estado" → "**Coordinación**" en esos **6 puntos** (notif in-app, WhatsApp, 4 páginas). Es solo string replacement en copy user-facing; **no toca enum, ni rutas, ni schema**. Bajo riesgo, entra en el piloto.

### Diferido a V4.5 — el rename interno (~1.5–2 d, ~70 archivos)
Enum `UserRole.ESTADO`, `type Rol`, route group `(estado)/`→`(coord)/`, `api/estado/`, middleware, ~12 tests. **Migración de enum en producción + rename de rutas** = mayor riesgo, menor valor de usuario, y **no bloquea** nada. PR aislado con tests, post-piloto, junto con el panel del COORD político (ver "Movido a V4.5").

---

## 🔧 Movido a Etapa 3 / V4.5 (fuera de Etapa 2)

- **Panel del COORD POLÍTICO** para configurar los requisitos de cada etapa narrativa (qué hace falta para Inicial / En proceso / Consolidada). Hoy esos requisitos están hardcodeados en `nivel.ts`; hacerlos configurables es scope nuevo. → **V4.5.**
- **Rename interno ESTADO → COORD** (enum + rutas + ~70 archivos). PR aislado con tests, post-piloto. → **V4.5.** (En Etapa 2 solo va el fix de copy de comms, ver 2.5.)
- **Visibilidad de marca** ("Ver cómo me ven los talleres", lado simétrico marca) — ya estaba diferida en la propuesta de visibilidad. → **V4.5.**

## Dependencias críticas (respuesta directa, modelo corregido)

- **¿2.2 depende de los toggles de §1.3?** → **Sí, y 2.2 ES §1.3.** La **base** del mecanismo ya está mergeada (#437: schema + helper + render). Queda la **UI de configuración** y aplicar el helper a los bloques restantes. Dejó de ser el cuello de botella.
- **¿Formación depende de Academia?** → Academia está **madura/funcional** (no bloquea badges), pero su **contenido es placeholder** (videos rickroll) → contenido real antes de producción. **Ningún curso es requisito de nada** (corrección Sergio).
- **¿2.3 necesita lógica nueva?** → **Sí, pero menos que antes:** gracia 60d→**inactiva** (net-new) + vidriera mínima 4 reqs (parcial). **El % holístico y la reescritura del gate de cotizar se descartan** (cotizar = solo CUIT, que ya existe).

## Qué se puede hacer YA vs qué espera

**Arrancable ya (sin bloqueos, modelo ya cerrado):**
- **2.4 filtros** — Rubro/Servicios/Ubicación ya definidos; sumar filtro de ubicación + copy gate ARCA.
- **2.5 fix de comms** — cambiar "el Estado" → "Coordinación" en los 6 puntos. Quick-win, condición de Sergio para el piloto.
- **2.1 sub-tabs** (estructura, sin schema).
- **2.2 UI de visibilidad + reorg** (base ya en develop) y **render de los 4 bloques restantes**.
- **2.3 gracia 60d→inactiva + vidriera mínima 4 reqs + paneles** (modelo cerrado; quizá 1 campo de schema de Gerardo).

**Espera / gated:**
- **2.2 Formación badges:** construibles ya; el **hide granular por badge** se extiende sobre el JSONB existente; el **contenido real** de Academia hace falta para producción.
- **Rename interno ESTADO→COORD + panel COORD político:** → V4.5.

## Orden de ataque sugerido (arrancable YA con el modelo correcto)
1. **2.5 fix de comms** ("el Estado"→"Coordinación", 6 puntos) — el más barato y es **condición de Sergio para el piloto** (~0.5 d).
2. **2.4 filtros** — Rubro/Servicios/Ubicación + copy gate ARCA; quick-win, valida el pipeline (~0.5–1 d).
3. **2.1 sub-tabs** — estructura base sobre la que se monta 2.2 (~1–1.5 d).
4. **2.2 UI de visibilidad + reorg en 3 bloques** (la base ya está en #437) (~1.5–2 d). Render de los 4 bloques restantes con `bloqueVisible`.
5. **2.3 gracia + vidriera mínima + paneles** — el mayor net-new restante; en paralelo a 2.2 si hay capacidad (~2–3 d). Quizá 1 campo de schema (Gerardo).
6. **2.2 Formación badges** + visibilidad granular por badge — una vez que (4) esté; contenido real de Academia para producción (~1 d).

## Decisiones que necesito de Gerardo (las del modelo ya están cerradas por Sergio)
1. **Schema:** confirmar que vos modelás lo que falte — posible **campo de estado "cuenta inactiva"** para 2.3 (o derivarlo on-read de `verificadoAfip`+`createdAt`); extensión del **type** `visibilidadVidriera` para Formación granular (no es migración). Sergio no toca schema.
2. **2.3 gracia:** ¿la transición a cuenta inactiva se computa **on-read** (barato, sin cron) o con un **job/cron** (necesario igual para el email del día 50)? El email del día 50 empuja hacia tener un cron.
3. **2.3 vidriera mínima:** confirmar que la **foto es opcional en el piloto** (placeholder institucional) y configurable post-piloto — Sergio ya lo dijo; solo confirmás el placeholder a usar.
4. **2.4 ubicación:** ¿el filtro de ubicación es **provincia** sola, o **provincia + partido** en cascada? (afecta el control y el `where`).
5. **Orden:** ¿arranca por **2.5 comms** (condición del piloto) y **2.4 filtros** como primeros PRs, o preferís meter 2.1+2.2 antes?
6. **Academia:** ¿el contenido real de cursos (reemplazar videos placeholder) entra en Etapa 2 o es trabajo separado? (no bloquea construir, sí bloquea producción).
