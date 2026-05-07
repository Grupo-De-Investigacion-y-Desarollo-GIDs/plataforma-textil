# QA: Reporte de campo del piloto (T-02)

**Spec:** `v3-reporte-campo.md`
**Commit de implementacion:** pendiente (develop)
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-05-06
**Auditor(es):** Sergio (tecnico) + politologo, economista, sociologo
**Incluye Eje 6 de validacion de dominio:** si
**Perfiles aplicables:** politologo, economista, sociologo (contador NO aplica)

---

## Contexto institucional

El piloto OIT no es solo una plataforma funcional — es un experimento de politica publica. Los aprendizajes cualitativos (resistencias culturales, expectativas no cumplidas, oportunidades detectadas) no aparecen en logs ni metricas. Este spec crea la herramienta para registrar, categorizar y reportar esas observaciones de campo de forma estructurada.

---

## Objetivo de este QA

Verificar que el equipo (ADMIN, ESTADO) puede registrar observaciones de campo, filtrarlas, editarlas, y generar reportes Excel multi-hoja para OIT con datos cuantitativos y cualitativos integrados.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante
5. Si el resultado no es ok → abri el widget azul "Feedback" → describi que paso
6. Al terminar, completa el resultado global y commitea este archivo actualizado

---

## Resultado global

- [ ] Aprobado — todo funciona
- [x] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** cerrado — 2 fixes mergeados a main. 8 items browser pendientes para Sergio.
**Cerrado por:** Claude Code 7/5/2026

---

## Eje 1 — Funcionalidad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Modelo ObservacionCampo agregado con enums y relaciones named | DEV | ok | |
| 2 | Modelo User con arrays observacionesCreadas y observacionesRecibidas | DEV | ok | |
| 3 | Migracion aplicada exitosamente | DEV | ok | |
| 4 | POST /api/admin/observaciones crea observacion | QA | ✅ code review — auth ADMIN/ESTADO, Zod validation (9 tipos, 6 fuentes, importancia 1-5), logAccionAdmin — Claude Code 6/5 | |
| 5 | GET /api/admin/observaciones lista con filtros (tipo, fuente, tags hasSome, periodo, sentimiento) | QA | ✅ code review — 5 filtros + paginacion (page/limit). Tags usa hasSome. Periodo: 7d/30d/90d/6m — Claude Code 6/5 | |
| 6 | PATCH /api/admin/observaciones/[id] edita observacion | QA | ✅ code review — auth + verificarPermisoEdicion (autor o ADMIN). Zod parcial. Log — Claude Code 6/5 | |
| 7 | DELETE /api/admin/observaciones/[id] borra observacion | QA | ✅ code review — misma verificacion de permisos. Retorna {ok:true} — Claude Code 6/5 | |
| 8 | Pagina /admin/observaciones con listado y filtros | QA | ✅ code review — server component con Prisma directo. Filtros form method=get. EmptyState. Cards con badges, estrellas, tags — Claude Code 6/5 | |
| 9 | Pagina /admin/observaciones/nueva con formulario completo | QA | ✅ code review — Breadcrumbs, FormularioObservacion compartido, disclaimer OIT — Claude Code 6/5 | |
| 10 | Pagina /admin/observaciones/[id]/editar para edicion | QA | ✅ code review — Breadcrumbs, canEdit check, warning amarillo si no es autor ni ADMIN. EliminarObservacion con dialog — Claude Code 6/5 | |
| 11 | Auth: ADMIN/ESTADO crean/ven; solo autor o ADMIN edita/borra | QA | ✅ code review API — APIs correctas. ⚠️ ESTADO no puede acceder a la UI /admin/observaciones (middleware + layout bloquean). Aceptable para V3 (documentado en Paso 8) — Claude Code 6/5 | |
| 12 | GET /api/admin/reporte-mensual genera Excel multi-hoja | QA | ✅ code review — 5 hojas + portada: Metricas plataforma, Etapas onboarding, Demanda insatisfecha, Observaciones, Resumen ejecutivo. Auth ADMIN/ESTADO — Claude Code 6/5 | |
| 13 | GET /api/admin/reporte-piloto genera Excel completo | QA | ✅ code review — 8 hojas + portada: Resumen ejecutivo, Talleres, Marcas, Metricas finales, Demanda insatisfecha, Aprendizajes cualitativos, Recomendaciones, Anexo Pedidos — Claude Code 6/5 | |
| 14 | Tags sugeridos en autocomplete (11 tags pre-cargados) | QA | ✅ code review — 11 tags exactos: cultural, fiscal, tecnico, proceso, positivo, negativo, urgente, politica-publica, engagement, capacitacion, comercial. Pills clickeables toggle on/off — Claude Code 6/5 | |
| 15 | Filtro por tags usa hasSome (OR, no AND) | DEV | ok | |
| 16 | Build sin errores de TypeScript | DEV | ok | |
| 17 | Sidebar admin incluye item "Observaciones" | QA | ✅ code review — Eye icon en admin layout sidebar (layout.tsx:25). ⚠️ UserSidebar mobile (user-sidebar.tsx:74-78) NO incluye "Observaciones" — gap desktop/mobile — Claude Code 6/5 | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Acceder al listado de observaciones

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** /admin
- **Verificador:** QA
- **Accion:** En la sidebar izquierda, buscar "Observaciones" (icono ojo). Hacer clic.
- **Esperado:** Se carga /admin/observaciones con titulo "Observaciones de campo", filtros, y boton "+ Nueva observacion". Si no hay observaciones, se muestra EmptyState.
- **Resultado:** ✅ code review — titulo "Observaciones de campo", 5 filtros form, boton "+ Nueva observacion", EmptyState presente — Claude Code 6/5. ⏳ verificacion visual en browser
- **Notas:** Pagina default filtra ultimos 30 dias

### Paso 2 — Crear observacion nueva

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones
- **Verificador:** QA
- **Accion:** Clic en "+ Nueva observacion". Completar: Tipo = RESISTENCIA, Fuente = VISITA, Sentimiento = Negativo, Importancia = 4 estrellas, Titulo = "Taller no quiere poner CUIT", Contenido = "Pensaba que era para denunciar evasion fiscal", Tags = clickear "cultural" y "fiscal", Fecha = hoy, Ubicacion = "Tucuman". Clic en "Registrar observacion".
- **Esperado:** Toast "Observacion registrada". Redirige a /admin/observaciones. La observacion aparece en el listado con badge RESISTENCIA rojo, 4 estrellas, tags #cultural #fiscal.
- **Resultado:** ✅ code review — form con todos los campos (tipo, fuente, sentimiento, importancia, titulo, contenido, tags, fecha, ubicacion, usuario). POST crea con Zod validation. Toast + redirect — Claude Code 6/5. ⏳ flujo completo requiere browser
- **Notas:**

### Paso 3 — Crear observacion con usuario asociado

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones/nueva
- **Verificador:** QA
- **Accion:** En "Sobre quien", escribir "Roberto" → seleccionar Roberto Gimenez del dropdown. Completar: Tipo = EXITO, Fuente = LLAMADA, Sentimiento = Positivo, Importancia = 3, Titulo = "Cerro 2 pedidos en una semana", Contenido = "Ya usa la plataforma para todos sus pedidos". Tags = "engagement, comercial". Guardar.
- **Esperado:** Toast de exito. En el listado, la observacion muestra "Sobre: Roberto Gimenez (TALLER)".
- **Resultado:** ✅ code review — campo userId en form con search/autocomplete. Listado muestra "Sobre: {user.name} ({user.role})" — Claude Code 6/5. ⏳ flujo completo requiere browser
- **Notas:**

### Paso 4 — Filtrar observaciones

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones
- **Verificador:** QA
- **Accion:** Seleccionar Tipo = RESISTENCIA → Filtrar. Verificar que solo aparece la observacion de resistencia. Limpiar filtro y probar Tags = "cultural" → Filtrar.
- **Esperado:** Los filtros funcionan. El filtro por tags muestra observaciones que tengan al menos uno de los tags indicados.
- **Resultado:** ✅ code review — filtros form method=get con searchParams. Tags usa hasSome (OR). 5 filtros + paginacion — Claude Code 6/5. ⏳ interaccion requiere browser
- **Notas:**

### Paso 5 — Editar observacion

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones
- **Verificador:** QA
- **Accion:** Clic en la primera observacion. Verificar Breadcrumbs "Observaciones > Editar observacion". Cambiar importancia a 5 estrellas. Clic en "Guardar cambios".
- **Esperado:** Toast "Observacion actualizada". Redirige al listado. La observacion ahora tiene 5 estrellas.
- **Resultado:** ✅ code review — Breadcrumbs correctos. PATCH con Zod parcial. Toast + redirect. canEdit check en pagina — Claude Code 6/5. ⏳ flujo requiere browser
- **Notas:**

### Paso 6 — Eliminar observacion

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones/[id]/editar
- **Verificador:** QA
- **Accion:** Clic en boton rojo "Eliminar" → confirmar "Si, eliminar".
- **Esperado:** Toast "Observacion eliminada". Redirige al listado. La observacion ya no aparece.
- **Resultado:** ✅ code review — EliminarObservacion con dialog de confirmacion. DELETE + toast + redirect — Claude Code 6/5. ⏳ flujo requiere browser
- **Notas:**

### Paso 7 — Descargar reporte mensual

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones
- **Verificador:** QA
- **Accion:** Clic en "Reporte mensual" (boton con icono de descarga).
- **Esperado:** Se descarga un archivo .xlsx. Al abrir en Excel: portada con titulo y fecha, hojas "Metricas plataforma", "Etapas onboarding", "Demanda insatisfecha", "Observaciones", "Resumen ejecutivo".
- **Resultado:** ✅ code review — 5 hojas + portada confirmadas en reporte-mensual/route.ts. Auth ADMIN/ESTADO. Param ?mes=YYYY-MM — Claude Code 6/5. ⏳ descarga real requiere browser
- **Notas:**

### Paso 8 — Verificar acceso ESTADO

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** /estado
- **Verificador:** QA
- **Accion:** Navegar a /admin/observaciones (si ESTADO tiene acceso al panel admin) o verificar que las APIs responden correctamente para ESTADO.
- **Esperado:** ESTADO puede crear y ver observaciones. ESTADO no puede editar observaciones de otros.
- **Resultado:** ✅ code review API — APIs permiten ESTADO. verificarPermisoEdicion bloquea edicion de obs de otros. ⚠️ UI bloqueada: middleware + layout /admin/ solo permiten ADMIN — Claude Code 6/5
- **Notas:** ESTADO accede a las APIs pero la UI esta en (admin). Para V3 esto es OK — evaluar si necesita su propio panel en V4.

### Paso 9 — Verificar que TALLER no ve observaciones

- **Rol:** TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Intentar acceder a /admin/observaciones directamente.
- **Esperado:** Redirige a /unauthorized o muestra error 403.
- **Resultado:** ✅ code review — middleware bloquea TALLER de /admin/* (redirect /unauthorized). Layout tambien chequea role !== ADMIN — Claude Code 6/5
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Observacion sin usuario asociado | Crear observacion sin seleccionar "Sobre quien" | Se crea OK, en listado no muestra "Sobre: ..." | QA | ✅ code review — userId es opcional en Zod schema. Listado condiciona "Sobre:" a obs.user existente — Claude Code 6/5 |
| 2 | Titulo vacio | Submit sin completar titulo | Toast de error, no se envia | QA | ✅ code review — Zod: titulo min(1). Form tiene required en input. Doble validacion — Claude Code 6/5 |
| 3 | Contenido vacio | Submit sin contenido | Toast de error, no se envia | QA | ✅ code review — Zod: contenido min(1). Textarea tiene required — Claude Code 6/5 |
| 4 | Tags custom | Escribir un tag nuevo: "mi-tag-nuevo" | Se guarda y aparece en el listado | QA | ✅ code review — input permite escribir tags custom comma-separated. Array de strings se guarda en DB — Claude Code 6/5. ⏳ interaccion browser |
| 5 | Importancia minima (1) y maxima (5) | Crear dos observaciones con importancia 1 y 5 | Ambas se guardan, muestran estrellas correctas | QA | ✅ code review — Zod: int min(1) max(5). Estrellas renderizan con Star icons llenos/vacios — Claude Code 6/5 |
| 6 | Sentimiento opcional | Crear observacion sin seleccionar sentimiento | Se crea OK (sentimiento null) | DEV | ⚠️ code review — API acepta sentimiento nullable, PERO form siempre default NEUTRAL (radio buttons sin opcion "ninguno"). No es posible enviar null desde la UI — Claude Code 6/5 |
| 7 | Edicion solo por autor | Login como ESTADO, intentar editar obs de ADMIN | Mensaje "Solo el autor o un ADMIN puede modificar" | QA | ✅ code review — verificarPermisoEdicion retorna 403. UI muestra warning amarillo "Solo el autor o un ADMIN puede editar" — Claude Code 6/5 |
| 8 | Reporte sin observaciones | Generar reporte mensual en mes sin observaciones | Excel se genera, hoja Observaciones vacia | QA | ✅ code review — generarXlsx acepta filas vacias, headers siempre presentes — Claude Code 6/5. ⏳ descarga real browser |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| /admin/observaciones carga en menos de 3 segundos | DevTools > Network > recargar | QA | ⏳ requiere browser |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | ⏳ requiere browser |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar | QA | ⏳ requiere browser. ⚠️ "Observaciones" no esta en UserSidebar mobile |
| Reporte mensual se descarga en menos de 10 segundos | Cronometrar descarga | QA | ⏳ requiere browser |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | ⏳ requiere browser | |
| Colores del design system (brand-blue, badges) | ⏳ requiere browser | |
| Skeleton loading visible al cargar paginas | ✅ code review — 3 loading.tsx con animate-pulse (listado, nueva, editar) — Claude Code 6/5 | |
| Breadcrumbs en paginas nueva y editar | ✅ code review — Breadcrumbs en nueva/page.tsx y [id]/editar/page.tsx — Claude Code 6/5 | |
| Sidebar admin muestra "Observaciones" con icono ojo | ✅ code review — Eye icon en admin layout:25. ⚠️ Falta en UserSidebar mobile — Claude Code 6/5 | |
| EmptyState cuando no hay observaciones | ✅ code review — EmptyState en pagina listado — Claude Code 6/5 | |
| Tags clickeables en formulario de sugerencias | ✅ code review — 11 pills toggle con bg-brand-blue activo — Claude Code 6/5 | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los 9 tipos de observacion capturan las dimensiones relevantes para politica publica? | 🔵 Si, cubren bien el espectro. RESISTENCIA y EXPECTATIVA capturan barreras culturales. DIFICULTAD_TECNICA y _PROCESO diferencian entre problemas de usabilidad y de procedimiento. OPORTUNIDAD y EXITO documentan lo positivo. CONTEXTO_TALLER/MARCA capturan contexto sectorial. POLITICA_PUBLICA es la categoria mas valiosa — conecta observaciones de campo con recomendaciones de politica. | Validar con equipo OIT si la taxonomia se alinea con sus marcos |
| 2 | La estructura del reporte final del piloto (8 hojas) sirve para informes a organismos internacionales como OIT? | 🔵 Si. Las 8 hojas cubren: resumen ejecutivo (sintesis para decision-makers), talleres y marcas (actores), metricas y funnel (resultados cuantitativos), demanda insatisfecha (gap analysis), aprendizajes cualitativos (agrupados por tipo — lo mas valioso), recomendaciones (accionables), y anexo datos raw. Esta estructura es compatible con formatos de evaluacion de proyectos OIT. | Agregar introduccion metodologica en la portada para contexto internacional |
| 3 | Falta algun tipo de observacion? (ej: GENERO, INTERSECCIONALIDAD) | 🔵 Si, GENERO es un gap importante. OIT tiene mandato transversal de genero. En el sector textil argentino, la mayoria de trabajadores/as son mujeres. Sugerencia V4: agregar GENERO como tipo de observacion + tag "genero" en sugeridos. Tambien considerar MEDIOAMBIENTE (condiciones de trabajo, residuos textiles) que es otro eje OIT. | No bloqueante para piloto — el tag "cultural" puede cubrir parcialmente |
| 4 | La hoja "Recomendaciones" que toma POLITICA_PUBLICA + demanda insatisfecha, es util para decision? | 🔵 Si, es la pieza mas valiosa del reporte. Conecta evidencia cualitativa (que dicen los actores) con datos cuantitativos (que muestran los numeros) y genera recomendaciones accionables. El riesgo es que si hay pocas observaciones POLITICA_PUBLICA, la hoja queda debil. Recomendacion: el equipo debe priorizar registrar al menos 3-5 observaciones POLITICA_PUBLICA por mes. | Agregar guia al equipo sobre cuando usar cada tipo |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La capa cualitativa complementa las metricas cuantitativas en el reporte mensual? | 🔵 Si, correctamente. El reporte mensual tiene 5 hojas: 2 cuantitativas (metricas, onboarding funnel), 1 gap analysis (demanda insatisfecha), 1 cualitativa (observaciones), 1 sintesis (resumen ejecutivo). La hoja de resumen ejecutivo cruza ambas capas: top 5 positivas + top 5 problemas (por importancia). Esto es la integracion quali-quanti correcta para un informe de evaluacion. | El orden de hojas es logico: de lo macro a lo micro |
| 2 | Hay riesgo de sesgo del observador? El campo sentimiento puede sesgar? | 🔵 Si, riesgo real. El sentimiento pre-asignado por el observador puede sesgar el analisis. Mitigaciones en la implementacion: (1) el campo contenido libre permite registrar la complejidad sin forzar un label, (2) los tags permiten multi-etiquetado, (3) la importancia (1-5) es independiente del sentimiento. Riesgo residual: en reportes agregados, contar "X observaciones negativas" puede ser misleading si el observador sesga hacia lo negativo. Recomendacion: el resumen ejecutivo deberia reportar distribucion de sentimiento como contexto, no como metrica. | Considerar agregar campo "confianza del observador" (alta/media/baja) en V4 |
| 3 | La escala de importancia (1-5) es suficiente para priorizar? | 🔵 Si para el piloto. Con ~25 talleres y ~50-100 observaciones, 5 niveles es suficiente. El reporte ejecutivo usa top 5 por importancia, lo cual funciona. A escala (500+ observaciones) se necesitaria un sistema de scoring mas sofisticado (combinando importancia + frecuencia + impacto). | Para V4 considerar scoring compuesto |
| 4 | El reporte mensual integra correctamente metricas + funnel + demanda + observaciones? | 🔵 Si. Las 5 hojas forman una narrativa coherente: cuantos hay (metricas) → como avanzan (funnel) → que falta (demanda insatisfecha) → que aprendimos (observaciones) → que hacer (resumen ejecutivo). La integracion es buena. | Verificar con reporte real post-piloto |

### Sociologo — Lenguaje y accesibilidad

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La capacidad de registrar contexto cultural es suficiente? | 🔵 Parcialmente. El campo contenido libre + tag "cultural" permite registrar narrativas, pero no hay guia sobre como hacerlo. El equipo puede registrar "taller no quiere poner CUIT" sin capturar el por que cultural (miedo a AFIP, desconfianza institucional, experiencia previa negativa). Recomendacion: agregar un prompt en el formulario: "Si es cultural, describI el contexto: que dijo la persona, por que crees que piensa asi, que sabias antes que no sabias". | Capacitar al equipo observador antes del piloto |
| 2 | El sentimiento puede simplificar realidades complejas? | 🔵 Si, riesgo real. Una resistencia puede ser simultaneamente comprensible (el taller tiene razon en desconfiar del Estado) y problematica (bloquea su formalizacion). La tricotomia POSITIVO/NEUTRAL/NEGATIVO no captura esta ambiguedad. Mitigacion: el campo contenido libre permite la complejidad. El sentimiento deberia usarse como filtro rapido, no como juicio definitivo. | Documentar en guia: "el sentimiento es tu primera impresion, no un veredicto" |
| 3 | Las citas literales permiten preservar la voz de los talleres? | 🔵 Si, el campo contenido libre lo permite. Recomendacion al equipo: usar comillas para citas textuales ("yo no voy a poner mi CUIT en ningun lado") y distinguir de interpretacion del observador. El formato actual no fuerza esta distincion pero la permite. | Agregar campo separado "cita textual" en V4 si el feedback lo justifica |
| 4 | Hay riesgo de extractivismo de conocimiento? | 🔵 Si, riesgo etico real. Si un taller explica un proceso productivo unico durante una visita y el equipo lo registra para OIT sin consentimiento explicito, hay apropiacion de conocimiento. Mitigaciones actuales: (1) el disclaimer del formulario alerta al equipo, (2) el contenido no es publico (solo ADMIN/ESTADO lo ve). Faltante critico: no hay consentimiento del taller observado. Para el piloto es aceptable (observaciones sobre la experiencia de uso, no sobre saberes productivos). Para escala V4 se necesita protocolo de consentimiento informado. | Discutir con OIT — pueden tener lineamientos IGDS sobre esto |
| 5 | Deberia agregarse mecanismo para que el taller valide la observacion? | 🔵 Para V4 si. No para el piloto. Un mecanismo de "el taller ve y comenta la observacion" cambiaria la dinamica: el equipo se autocensuraria (no registraria resistencias criticas si el taller va a leerlas). Para el piloto, las observaciones son internas. Para V4, considerar un sistema donde el taller puede ver observaciones despersonalizadas (sin saber que es sobre el) como "tendencias del sector". | V4 decidir: transparencia total vs informes agregados |
| 6 | El disclaimer del formulario es suficiente para el equipo observador? | 🔵 Suficiente para arrancar. El texto actual ("Esta info se usa para el reporte a OIT. No incluyas datos sensibles que no quieras compartir.") es claro pero dirigido al equipo, no al taller observado. Recomendacion: agregar a la capacitacion pre-piloto un modulo sobre etica de observacion participante. | No bloqueante — el disclaimer esta presente |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |
|-------|------|-------------|------------------------|-----------|
| — | ⚠️ UX | UserSidebar mobile no incluye "Observaciones" — item visible en desktop pero no en hamburger menu | Claude Code (code review) | baja |
| — | ⚠️ UX | Sentimiento default NEUTRAL sin opcion de deseleccionar — API acepta null pero UI siempre envia valor | Claude Code (code review) | baja |
| — | 🔵 Eje 6 | Falta tipo GENERO como categoria de observacion — eje transversal OIT | Politologo (primera pasada) | V4 |
| — | 🔵 Eje 6 | Sin protocolo de consentimiento del taller observado — riesgo etico de extractivismo | Sociologo (primera pasada) | V4 |

---

## Notas de los auditores

**Claude Code (code review + Eje 6 primera pasada — 6/5/2026):**

**Metodologia:** Code review de 4 API routes, 3 paginas, formulario compartido, 3 loading.tsx, sidebar, reportes Excel. Eje 6 primera pasada con 3 perfiles (politologo, economista, sociologo).

**Hallazgos positivos:**
- Arquitectura solida: CRUD completo con Zod validation, auth por ownership, logging
- Reportes Excel bien estructurados: mensual (5 hojas) y piloto (8 hojas) con integracion quali-quanti
- 11 tags sugeridos cubren bien el espectro de observaciones
- EmptyState, Breadcrumbs, Skeletons — checklist UX cumplida
- Auth model correcto: ADMIN/ESTADO crean/ven, solo autor/ADMIN edita/borra

**Observaciones no bloqueantes:**
- UserSidebar mobile desincronizado (falta Observaciones)
- Sentimiento no es realmente opcional en la UI
- ESTADO no puede acceder a la UI (aceptado V3, documentado)

**Perfiles interdisciplinarios:**
[primera pasada 🔵 completada — 14 items, requiere validacion humana]

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
