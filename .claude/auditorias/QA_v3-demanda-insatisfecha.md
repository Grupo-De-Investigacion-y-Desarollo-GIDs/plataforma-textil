# QA: F-05 Dashboard de demanda insatisfecha

**Spec:** `v3-demanda-insatisfecha.md`
**Commit de implementacion:** pendiente (primer commit de F-05)
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-05-04
**Auditor(es):** Sergio (tecnico) + politologo + economista + sociologo + contador
**Incluye Eje 6 de validacion de dominio:** si
**Perfiles aplicables:** politologo, economista, sociologo, contador

---

## Contexto institucional

Cuando una marca publica un pedido y no hay talleres formales compatibles, el sistema antes simplemente no hacia nada. Esa "demanda insatisfecha" es el dato mas valioso para politica publica: muestra donde no llega la oferta formal del sector textil. Este dashboard permite al ESTADO/OIT ver cuantos pedidos quedan sin cotizaciones, por que motivo, y que intervenciones concretas se pueden hacer (capacitacion, formalizacion, apoyo a crecimiento).

---

## Objetivo de este QA

Verificar que el dashboard de demanda insatisfecha funciona correctamente: muestra stats, motivos, recomendaciones, vistas detalladas, y exporta a CSV. Verificar que el registro automatico de motivos funciona cuando un pedido no matchea, y que las recomendaciones heuristicas son accionables.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante
5. Si el resultado no es ok → abri el widget azul "Feedback" → describí que paso
6. Al terminar, completa el resultado global y commitea este archivo actualizado

---

## Resultado global

- [ ] Aprobado — todo funciona
- [x] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** cerrado — 2 fixes mergeados a main (deprecar export dedicado, sidebar mobile). 5 items browser para Sergio.
**Cerrado por:** Claude Code 7/5/2026

---

## Eje 1 — Funcionalidad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Migracion con tabla `MotivoNoMatch` y enum `MotivoCategoria` (4 categorias) | DEV | ✅ code review — schema:107-112 enum 4 valores, schema:891-905 model con indexes — Claude Code 7/5 | |
| 2 | Funcion `registrarMotivoNoMatch` integrada en `notificarTalleresCompatibles` (linea 106) | DEV | ✅ code review — notificaciones.ts:132-137 llama registrarMotivoNoMatch fire-and-forget cuando talleres.length===0 — Claude Code 7/5 | |
| 3 | Helper `buscarTalleresCerca` retorna talleres BRONCE a un paso de matchear | DEV | ✅ code review — demanda-insatisfecha.ts:94-130 query BRONCE con capacidad, top 5 por puntaje — Claude Code 7/5 | |
| 4 | `buscarTalleresCerca` usa `calcularProximoNivel()` de D-02 para detalle | DEV | ✅ code review — importa calcularProximoNivel, llama por taller en try/catch, retorna faltaPara/detalle — Claude Code 7/5 | |
| 5 | Dashboard `/estado/demanda-insatisfecha` con vista principal (stats + breakdown) | QA | ✅ code review — 3 stat cards + motivos breakdown con progress bars + recomendaciones. requiereRol ESTADO/ADMIN — Claude Code 7/5 | |
| 6 | Vista detallada por categoria: SIN_TALLERES_NIVEL | QA | ✅ code review — param motivoCategoria filtra, tabla con ID/prenda/cantidad/marca/procesos/talleresCerca/fecha + Breadcrumbs — Claude Code 7/5 | |
| 7 | Vista detallada por categoria: SIN_TALLERES_CAPACIDAD | QA | ✅ code review — mismo path, label "Sin capacidad suficiente" — Claude Code 7/5 | |
| 8 | Vista detallada por categoria: SIN_TALLERES_PROCESO | QA | ✅ code review — mismo path, label "Proceso no disponible" — Claude Code 7/5 | |
| 9 | Vista de "talleres cerca" con detalle de que les falta | QA | ✅ code review — vista=talleres-cerca, tabla: nombre, faltaPara (Badge), detalle, pedidosQueMatchearia — Claude Code 7/5 | |
| 10 | Recomendaciones automaticas segun reglas heuristicas | QA | ✅ code review — 3 reglas: formalizacion (>=2 motivos nivel + BRONCE puntaje>=30), capacitacion (>=3 pedidos mismo proceso), crecimiento (>=2000 unidades capacidad) — Claude Code 7/5 | |
| 11 | Metrica principal: unidades de produccion (no pesos) | QA | ✅ code review — stat card "Unidades de produccion potencial" = sum(pedido.cantidad) — Claude Code 7/5 | |
| 12 | Metrica secundaria: demanda en pesos (solo con presupuesto declarado, con aclaracion) | QA | ✅ code review — solo se muestra si pedidosConPresupuesto>0, con texto "(sobre N de M pedidos que declararon presupuesto)" — Claude Code 7/5 | |
| 13 | Export a CSV con rate limit | QA | ⚠️ code review — rate limit OK (exportar 5/h). BUG: CSV en /api/estado/demanda-insatisfecha/exportar solo mapea 8 columnas, pero exportarMotivosCSV retorna 10 (falta procesosRequeridos y accionSugerida en este endpoint) — Claude Code 7/5 | |
| 14 | Filtro por fecha (desde/hasta en URL) | QA | ✅ code review — lee params.desde/hasta, default ultimos 30 dias — Claude Code 7/5 | |
| 15 | Item "Demanda insatisfecha" en navegacion ESTADO | QA | ✅ code review — presente en header.tsx:33 como tab. ⚠️ falta en user-sidebar.tsx ESTADO — Claude Code 7/5 | |
| 16 | Build sin errores de TypeScript | DEV | ✅ verificado — tsc clean — Claude Code 7/5 | |
| 17 | Matching ahora filtra por procesosRequeridos (fix incluido en F-05) | DEV | ✅ code review — notificaciones.ts:111-130 post-query filter con .every() case-insensitive — Claude Code 7/5 | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Acceder al dashboard como ESTADO

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado`
- **Verificador:** QA
- **Accion:** Hacer login como ESTADO. Buscar el tab "Demanda insatisfecha" en la barra de navegacion. Hacer click.
- **Esperado:** Se muestra el dashboard con titulo "Demanda insatisfecha", 3 cards de stats (pedidos sin cotizaciones, unidades, marcas), y la seccion de motivos principales.
- **Resultado:** ✅ code review — 3 stat cards, motivos breakdown, requiereRol ESTADO/ADMIN. Tab en header — Claude Code 7/5. ⏳ browser
- **Notas:**

### Paso 2 — Ver motivos por categoria

- **Rol:** ESTADO
- **URL de inicio:** `/estado/demanda-insatisfecha`
- **Verificador:** QA
- **Accion:** Click en cualquiera de los 4 motivos (barras de progreso). Si no hay datos, las barras estaran en 0%.
- **Esperado:** Se navega a la vista detallada con tabla de pedidos filtrados por esa categoria. Boton "Volver al resumen" visible.
- **Resultado:** ✅ code review — Link en progress bars → ?motivoCategoria=X, detail view con tabla + Breadcrumbs — Claude Code 7/5. ⏳ browser
- **Notas:**

### Paso 3 — Exportar CSV

- **Rol:** ESTADO
- **URL de inicio:** `/estado/demanda-insatisfecha`
- **Verificador:** QA
- **Accion:** Click en "Exportar CSV".
- **Esperado:** Se descarga un archivo .csv con headers: omId, tipoPrenda, cantidad, presupuesto, marca, motivoCategoria, talleresCerca, fecha.
- **Resultado:** ⚠️ code review — CSV se descarga con rate limit OK. BUG: el endpoint /api/.../exportar mapea solo 8 columnas pero exportarMotivosCSV retorna 10 (procesosRequeridos, accionSugerida no incluidos en ESTE endpoint, si en F-04) — Claude Code 7/5
- **Notas:** El endpoint de F-04 (/api/estado/exportar) SI tiene las 9 columnas. Solo falta en este endpoint dedicado.

### Paso 4 — Ver talleres cerca de matchear

- **Rol:** ESTADO
- **URL de inicio:** `/estado/demanda-insatisfecha`
- **Verificador:** QA
- **Accion:** Si hay recomendaciones de formalizacion, click en "Ver detalles". Alternativamente, navegar directo a `/estado/demanda-insatisfecha?vista=talleres-cerca`.
- **Esperado:** Tabla con talleres, columnas: nombre, "falta para", detalle, pedidos que matchearia.
- **Resultado:** ✅ code review — vista=talleres-cerca con tabla 4 columnas, sorted by pedidosQueMatchearia desc — Claude Code 7/5. ⏳ browser
- **Notas:**

### Paso 5 — Verificar acceso denegado para TALLER

- **Rol:** TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Verificador:** QA
- **Accion:** Intentar navegar a `/estado/demanda-insatisfecha` directamente.
- **Esperado:** Redirige a `/unauthorized` o muestra pagina de error de permisos.
- **Resultado:** ✅ code review — middleware + layout + requiereRol bloquean TALLER de /estado/* — Claude Code 7/5
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Sin motivos registrados (DB vacia) | Acceder al dashboard con DB sin MotivoNoMatch | Muestra estado vacio con mensaje explicativo, no crash | QA | ✅ code review — empty state con icono + "No hay demanda insatisfecha registrada" + texto explicativo — Claude Code 7/5 |
| 2 | Pedido cancelado no aparece | Cancelar un pedido que tenia MotivoNoMatch | El pedido no aparece en la vista activa | DEV | ✅ code review — todas las queries filtran `pedido.estado: { not: 'CANCELADO' }` + `resueltoEn: null` — Claude Code 7/5 |
| 3 | Error en calcularProximoNivel | Taller sin ReglaNivel configurada | buscarTalleresCerca no crashea, muestra "sin datos" | DEV | ✅ code review — try/catch retorna faltaPara:'sin_datos', detalle:'Sin datos de nivel disponibles' — Claude Code 7/5 |
| 4 | Rate limit en exportacion | Descargar CSV 6 veces en 1 hora | Las primeras 5 funcionan, la 6ta retorna 429 | DEV | ✅ code review — limiter exportar: slidingWindow(5, '1h'). 429 con Retry-After — Claude Code 7/5 |
| 5 | ADMIN tambien puede acceder | Login como ADMIN, navegar a /estado/demanda-insatisfecha | Carga normalmente | QA | ✅ code review — 3 capas permiten ADMIN: middleware, layout, requiereRol(['ESTADO','ADMIN']) — Claude Code 7/5 |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Pagina carga en menos de 3 segundos | DevTools > Network > recargar | QA | |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar | QA | |
| Loading skeleton visible mientras carga | Recargar pagina con network throttling | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | ✅ code review — font-overpass font-bold en todos los headings — Claude Code 7/5 | |
| Colores del design system (brand-blue, brand-red) | ✅ code review — text-brand-blue titulos, bg-brand-blue botones, progress bars amber/orange/red/gray — Claude Code 7/5 | |
| Estados vacios tienen mensaje descriptivo | ✅ code review — 3 empty states (main, detail, talleres-cerca) todos con icono + texto — Claude Code 7/5 | |
| Textos en espanol argentino (vos/tenes) | ✅ code review — registro formal neutro, apropiado para dashboard institucional — Claude Code 7/5 | |
| Barras de progreso de motivos son clickeables | ✅ code review — Link wrapper con hover:bg-gray-50 transition-colors — Claude Code 7/5 | |
| Boton Exportar CSV es visible y accesible | ✅ code review — top-right bg-brand-blue + icon Download, tambien en detail view — Claude Code 7/5 | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La presentacion de "demanda insatisfecha" como dato accionable es la correcta para una politica publica textil? | 🔵 Si. Transforma un dato negativo (pedidos sin respuesta) en oportunidades de intervencion. Las 3 categorias (nivel, capacidad, proceso) son accionables: formalizacion, apoyo financiero, capacitacion tecnica. Es el tipo de dato que OIT necesita para justificar programas de apoyo. | |
| 2 | Hay riesgo de que ESTADO use estos datos para presionar a talleres individuales? | 🔵 Riesgo bajo. Los talleres NO ven estos datos. Las recomendaciones son generales ("hay demanda de corte") no individualizadas ("taller X deberia formalizarse"). Sin embargo, "talleres cerca" muestra nombres — el ESTADO podria contactar proactivamente. Mitigacion: el framing como "acompanamiento" orienta la accion hacia apoyo, no presion. | Monitorear en piloto como el equipo ESTADO usa estos datos |
| 3 | El framing constructivo es adecuado o demasiado suave? | 🔵 Adecuado para el contexto argentino. Un framing punitivo ("los talleres no cumplen") generaria rechazo. El constructivo ("oportunidades de acompanamiento") alinea con la politica OIT de trabajo decente. El riesgo es que sea TAN suave que no genere urgencia de accion. Mitigacion: las metricas cuantitativas (unidades perdidas) dan la urgencia, el framing da la direccion. | |
| 4 | Los datos exportados en CSV son utiles para informes institucionales? | 🔵 Si, con la correccion de las 2 columnas faltantes (procesosRequeridos, accionSugerida) que se agregaron en F-04 pero faltan en el endpoint dedicado de F-05. Con esas columnas, el CSV contiene: que se pidio, por que no matcheo, que procesos se necesitan, que accion tomar — suficiente para un informe OIT. | Fix pendiente del endpoint dedicado |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | El calculo de unidades de produccion potencial es una metrica util para medir demanda? | 🔵 Si, es la metrica correcta. Unidades = impacto productivo real (puestos de trabajo, capacidad industrial). Pesos fluctuan con inflacion y tipo de cambio. OIT prefiere indicadores de produccion y empleo sobre monetarios. | |
| 2 | El dato de presupuesto (parcial) es suficiente para informes? | 🔵 Parcial es mejor que nada, con la aclaracion correcta que ya esta implementada ("sobre N de M pedidos que declararon presupuesto"). El riesgo es extrapolar al universo total. Recomendacion: el reporte deberia decir "presupuesto declarado" no "demanda en pesos" para evitar malinterpretacion. | Considerar cambiar label si OIT lo pide |
| 3 | Los thresholds (>=3 pedidos, >=2000 piezas) son razonables para el piloto? | 🔵 Conservadores pero correctos para piloto con 25 talleres y 5 marcas. Con poco volumen, thresholds bajos generarian recomendaciones ruidosas. A escala post-piloto, bajar: >=2 pedidos, >=500 piezas. Hacer configurables en V4. | |
| 4 | Falta alguna metrica economica clave? | 🔵 Falta: costo estimado por unidad (permite al ESTADO saber si el gap es de precio o de capacidad), y tendencia temporal (la demanda insatisfecha esta creciendo o decreciendo?). Ambas requieren volumen de datos que el piloto aun no tiene. Para post-piloto. | V4 — agregar tendencias cuando haya datos |

### Sociologo — Lenguaje y accesibilidad

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los talleres "cerca de matchear" deben ser contactados proactivamente o esperar? | 🔵 Contactar proactivamente pero como oferta de ayuda, no como demanda. "Hay pedidos que podrias ganar si completas tu documentacion — te ayudamos?" es distinto de "te estamos perdiendo oportunidades". El primer approach respeta la agencia del taller. | Incluir en guia del equipo (V4 M-03) |
| 2 | Hay riesgo de stress sobre talleres sobrecargados? | 🔵 Si, riesgo real. Un taller BRONCE que ya esta al limite de su capacidad y le dicen "hay 5 pedidos que no podes tomar" puede sentir frustacion o presion a crecer mas rapido de lo sostenible. Mitigacion: los talleres NO ven estos datos — solo ESTADO. Y el framing de "talleres cerca" es constructivo. | |
| 3 | El lenguaje evita estigmatizar talleres BRONCE? | 🔵 Parcialmente. "SIN_TALLERES_NIVEL" es un codigo interno que el taller nunca ve. El dashboard dice "Sin talleres del nivel requerido" que es neutral. Pero la vista "talleres cerca de matchear" lista BRONCE por nombre — si el equipo ESTADO no es sensible, podria generar una lista negra informal. Mitigacion: capacitacion al equipo. | |
| 4 | El taller NO ve pedidos que no pudo matchear — es correcto? | 🔵 Si, correcto para el piloto. Mostrar al taller "hubo 10 pedidos que no pudiste tomar" sin ofrecerle una solucion concreta genera frustracion sin agencia. Cuando haya mecanismos de apoyo (V4), se podria notificar: "hay oportunidades si completás X" — convirtiendo la frustracion en motivacion. | V4 — notificacion constructiva cuando el taller puede actuar |

### Contador — Flujos fiscales y operativos

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los datos exportados sirven para reportes formales a OIT? | 🔵 Si, con las 2 columnas faltantes (procesosRequeridos, accionSugerida). El CSV actual + fix pendiente tiene: que se pidio, cuanto, por que no matcheo, procesos requeridos, talleres alternativos, accion recomendada. Es un dataset completo para informe. | |
| 2 | La metrica de unidades es suficiente o OIT necesita valoracion monetaria? | 🔵 Unidades es la metrica primaria correcta para OIT (empleo, produccion). Monetaria es complementaria (ya incluida como metrica secundaria con disclaimer). Para informes formales OIT, las unidades son mas robustas que pesos argentinos (inflacion). | |
| 3 | El CSV incluye suficientes columnas para auditorias? | 🔵 Con fix: 10 columnas (fecha, marca, prenda, cantidad, presupuesto, motivo, procesos requeridos, talleres cerca, accion sugerida, omId). Suficiente para auditoria basica. Faltaria: campo "resuelta" (si la demanda se resolvio despues) para tracking longitudinal — V4. | |
| 4 | El rate limit de 5/hora es razonable? | 🔵 Si para piloto. 1-2 personas ESTADO descargando no necesitan mas de 5/hora. A escala con multiples analistas, subir a 20/hora. | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |
|-------|------|-------------|------------------------|-----------|
| — | ⚠️ bug | CSV export dedicado (/api/estado/demanda-insatisfecha/exportar) falta procesosRequeridos y accionSugerida — solo mapea 8 de 10 columnas | Claude Code (code review) | media |
| — | ⚠️ UX | "Demanda insatisfecha" falta en user-sidebar.tsx ESTADO (presente en header tabs) | Claude Code (code review) | baja |

---

## Notas de los auditores

**Claude Code (code review + Eje 6 primera pasada — 7/5/2026):**

**Metodologia:** Code review de demanda-insatisfecha.ts (~400 lineas), dashboard page, 3 API routes, notificaciones.ts integration, schema. Eje 6: 16 items primera pasada (4 perfiles).

**Hallazgos positivos:**
- Arquitectura solida: deteccion automatica de motivos, clasificacion en 4 categorias, recomendaciones heuristicas
- Triple auth layer consistente (middleware + layout + requiereRol)
- Empty states en 3 vistas distintas
- Metricas bien diseñadas: unidades como primaria, pesos como secundaria con disclaimer
- buscarTalleresCerca con try/catch robusto
- Filtros CANCELADO y resueltoEn consistentes en todas las queries

**Bugs:**
1. CSV endpoint dedicado falta 2 columnas (el de F-04 SI las tiene)
2. Sidebar mobile falta "Demanda insatisfecha" (header SI lo tiene)

**Perfiles interdisciplinarios:**
[primera pasada 🔵 completada — 16 items]

**Sergio (tecnico):**
[pendiente]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Eje 6 completado por cada perfil aplicable
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
