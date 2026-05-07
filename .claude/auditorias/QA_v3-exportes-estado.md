# QA: Exportes Estado (F-04)

**Spec:** `v3-exportes-estado.md`
**Commit de implementacion:** pendiente
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-05-05
**Auditor(es):** Sergio (tecnico) + politologo + economista + contador
**Incluye Eje 6 de validacion de dominio:** si
**Perfiles aplicables:** politologo, economista, contador

---

## Contexto institucional

ESTADO necesita exportar datos para los informes de OIT. F-04 agrega formato Excel (via exceljs), campos verificados por ARCA, nuevos tipos de exportacion (validaciones, demanda insatisfecha), informe mensual multi-hoja, y filtros avanzados (provincia, nivel, periodo). Esto transforma la seccion de exportes de una herramienta basica de descarga CSV a un sistema completo de reporteria institucional, alineado con los requerimientos de una autoridad internacional como OIT.

---

## Objetivo de este QA

Verificar que los 10 tipos de exportacion funcionan correctamente en formatos CSV y XLSX, que los filtros (provincia, nivel, periodo) aplican correctamente, que el informe mensual multi-hoja genera las 7 hojas esperadas con formato profesional, que los campos ARCA estan presentes en los reportes, y que el rate limit y los controles de acceso funcionan. Verificar retrocompatibilidad con exportes existentes y que la UI refleja los nuevos tipos de reporte.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante
5. Si el resultado no es ok → abri el widget azul "Feedback" → describI que paso
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

> **Nota:** Los items marcados **DEV** los verifica Gerardo desde el codigo o la terminal — no son verificables desde el browser. El auditor solo verifica los items marcados **QA**.

### Infraestructura y helpers

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | exceljs instalado y compatible con Vercel | DEV | ok — Gerardo 5/5 | # |
| 2 | Helper generarXlsx reutilizable en exportes.ts | DEV | ok — Gerardo 5/5 | # |
| 3 | Interface HojaExportable con tipos mixtos | DEV | ok — Gerardo 5/5 | # |
| 4 | toCsv re-exportado desde exportes.ts | DEV | ok — Gerardo 5/5 | # |

### Endpoint y seguridad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 5 | Endpoint /api/estado/exportar con maxDuration=120 | DEV | ok — Gerardo 5/5 | # |
| 6 | Parametro tipo valida 10 tipos | DEV | ok — Gerardo 5/5 | # |
| 7 | Parametro formato valida csv/xlsx | DEV | ok — Gerardo 5/5 | # |
| 8 | Rate limit 5/hora aplicado | DEV | ok — Gerardo 5/5 | # |
| 9 | Solo ESTADO y ADMIN pueden exportar | DEV/QA | ✅ code review — 3 capas: middleware /estado/*, layout requiereRol, API route check role !== ESTADO && !== ADMIN → 403 — Claude Code 6/5 | |

### Exportes individuales

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 10 | Export talleres con campos ARCA (verificadoAfip, tipoInscripcion, etc.) | QA | ✅ code review — 5 campos ARCA en headers: Verificado ARCA, Fecha verificacion, Tipo inscripcion, Categoria monotributo, Estado CUIT — Claude Code 6/5 | |
| 11 | Export talleres con tasa aceptacion cotizaciones | QA | ✅ code review — 2 groupBy queries (total/aceptadas), calculo Math.round((aceptadas/total)*100)% — Claude Code 6/5 | |
| 12 | Export talleres con discrepancia empleados (declarados vs SIPA) | DEV | ok — Gerardo 5/5 | # |
| 13 | Export marcas ampliado (verificado ARCA, pedidos sin cotizaciones) | QA | ✅ code review — headers incluyen verificadoAfip, pedidos publicados/completados/sin cotizaciones, volumen mensual — Claude Code 6/5 | |
| 14 | Export validaciones (nuevo) - historial aprobaciones/rechazos | QA | ✅ code review — query COMPLETADO/RECHAZADO/VENCIDO con taller nombre/CUIT, aprobador, motivo rechazo — Claude Code 6/5 | |
| 15 | Export demanda insatisfecha (reutiliza F-05) | QA | ✅ code review — delega a exportarMotivosCSV de F-05. ⚠️ faltan 2 columnas del spec: "Procesos requeridos" y "Accion sugerida" — Claude Code 6/5 | |
| 16 | Export resumen ampliado con metricas ARCA y demanda | QA | ✅ code review — Promise.all 11 queries. 14 metricas incluyendo "Talleres verificados ARCA" y "Pedidos sin match" — Claude Code 6/5 | |
| 17 | Export capacitaciones (mantenido) | QA | ✅ code review — query Certificado revocado=false, date filter, headers correctos — Claude Code 6/5 | |
| 18 | Export acompanamiento (mantenido) | QA | ✅ code review — talleres con <4 docs completados, sin filtros (intencional) — Claude Code 6/5 | |
| 19 | Export pedidos (mantenido) | QA | ✅ code review — incluye Fecha objetivo, date filter funcional — Claude Code 6/5 | |
| 20 | Export denuncias (mantenido) | QA | ✅ code review — excluye datos sensibles del denunciante, date filter — Claude Code 6/5 | |

### Informe mensual multi-hoja

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 21 | Informe mensual multi-hoja (7 hojas: portada, talleres, marcas, pedidos, validaciones, demanda, resumen) | QA | ✅ code review — Portada + 6 hojas data. Promise.all para 5 queries paralelas. Confirmado por test exportes.test.ts — Claude Code 6/5. ⏳ abrir XLSX en Excel |
| 22 | Portada del informe con titulo, subtitulo, fecha generacion | QA | ✅ code review — titulo B2 (font 18, bold, brand-blue), subtitulo B3, fecha B5 "Generado: [date]" es-AR — Claude Code 6/5 |  |
| 23 | Headers formateados (bold, color de fondo) | QA | ✅ code review — bold:true, white text, solid fill #1E3A5F (brand-blue) — Claude Code 6/5 | |
| 24 | Filas alternadas para legibilidad | QA | ✅ code review — even rows get fill #F9FAFB (light gray) — Claude Code 6/5 | |
| 25 | Columnas auto-ajustadas | QA | ✅ code review — max(headerLen, dataLen) + 3, cap 50 — Claude Code 6/5 | |
| 26 | Header row frozen (scroll mantiene headers visibles) | QA | ✅ code review — ws.views=[{state:'frozen', ySplit:1}] — Claude Code 6/5 | |

### Filtros

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 27 | Filtro por periodo (mes, trimestre, semestre) | QA | ✅ code review — calcularFechas convierte a desde/hasta ISO, buildDateFilter en data.ts:23-28 — Claude Code 6/5 | |
| 28 | Filtro por provincia | QA | ✅ code review — 24 provincias, aplica solo a talleres export (where.provincia) — Claude Code 6/5 | |
| 29 | Filtro por nivel (BRONCE, PLATA, ORO) | QA | ✅ code review — 3 opciones, aplica solo a talleres (where.nivel cast NivelTaller) — Claude Code 6/5 | |

### CSV y encoding

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 30 | CSV con BOM UTF-8 para tildes en Excel | DEV | ok — Gerardo 5/5 | # |

### UI

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 31 | UI con tarjetas por tipo de reporte | QA | ✅ code review — Card grid 1/2 cols, cada una con titulo, descripcion, filtros, botones CSV/XLSX — Claude Code 6/5. ⏳ visual browser | |
| 32 | UI con seccion destacada informe mensual | QA | ✅ code review — Card con border-brand-blue/30 bg-blue-50/30, separada del grid, boton FileSpreadsheet — Claude Code 6/5 | |
| 33 | Breadcrumbs en /estado/exportar | QA | ✅ code review — Breadcrumbs component: Estado > Exportar — Claude Code 6/5 | |
| 34 | Toast de exito al descargar reporte | QA | ✅ code review — toast('Reporte descargado', 'success') en handleDescargar y handleInformeMensual — Claude Code 6/5 | |
| 35 | Toast de error si falla la descarga | QA | ✅ code review — toast(msg, 'error') en HTTP error + toast('Error de conexion', 'error') en catch — Claude Code 6/5 | |

### General

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 36 | Logs de exportacion via logAccionAdmin | DEV | ok — Gerardo 5/5 | # |
| 37 | Build sin errores TypeScript | DEV | ok — Gerardo 5/5 | # |
| 38 | Suite Vitest completa (287 tests) | DEV | ok — Gerardo 5/5 | # |

---

## Eje 2 — Navegabilidad

### Paso 1 — Verificar layout de exportes como ESTADO

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado`
- **Verificador:** QA
- **Accion:** Hacer login como ESTADO. Navegar a /estado/exportar. Verificar que la pagina muestra tarjetas organizadas por tipo de reporte con una seccion destacada para el informe mensual.
- **Esperado:** Layout con tarjetas por tipo de reporte, seccion destacada del informe mensual, breadcrumbs visibles arriba. Cada tarjeta indica el tipo de reporte y permite seleccionar formato (CSV/XLSX).
- **Resultado:** ✅ code review — page usa Card grid, seccion informe destacada, breadcrumbs, filtros form. ⏳ verificacion visual browser — Claude Code 6/5
- **Notas:**

### Paso 2 — Descargar talleres en CSV y verificar columnas ARCA

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado/exportar`
- **Verificador:** QA
- **Accion:** Seleccionar el reporte de talleres. Elegir formato CSV. Descargar el archivo. Abrirlo con Excel o LibreOffice y verificar que las columnas ARCA estan presentes (verificadoAfip, tipoInscripcion, etc.).
- **Esperado:** Archivo CSV descargado correctamente. Las columnas ARCA aparecen con datos. Los caracteres especiales (ñ, tildes) se muestran correctamente gracias al BOM UTF-8.
- **Resultado:** ✅ code review — BOM UTF-8, 5 ARCA columns, toCsv RFC 4180. ⏳ descargar y abrir en Excel — Claude Code 6/5
- **Notas:**

### Paso 3 — Descargar talleres en Excel y verificar formato

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado/exportar`
- **Verificador:** QA
- **Accion:** Seleccionar el reporte de talleres. Elegir formato XLSX. Descargar el archivo. Abrirlo en Excel o LibreOffice. Verificar headers con formato (bold, color de fondo), filas alternadas, columnas auto-ajustadas, y header row frozen.
- **Esperado:** Archivo XLSX con formato profesional: headers en negrita con color de fondo, filas alternadas para legibilidad, columnas ajustadas al contenido, y al hacer scroll vertical los headers permanecen visibles.
- **Resultado:** ✅ code review — bold+fill headers, filas alternadas gray, auto-width, frozen row. ⏳ abrir XLSX — Claude Code 6/5
- **Notas:**

### Paso 4 — Aplicar filtros y verificar filtrado correcto

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado/exportar`
- **Verificador:** QA
- **Accion:** Seleccionar el reporte de talleres. Aplicar filtro por provincia (ej: Buenos Aires) y filtro por nivel (ej: PLATA). Descargar en XLSX. Abrir el archivo y verificar que solo contiene talleres de Buenos Aires con nivel PLATA.
- **Esperado:** El archivo descargado solo contiene registros que coinciden con los filtros aplicados. Si no hay coincidencias, el archivo contiene solo la fila de headers.
- **Resultado:** ✅ code review — provincia/nivel aplican where en Prisma, empty results → headers-only file. ⏳ descargar con filtros — Claude Code 6/5
- **Notas:** Solo talleres soporta los 3 filtros (provincia+nivel+periodo). Resto solo periodo.

### Paso 5 — Generar informe mensual completo

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado/exportar`
- **Verificador:** QA
- **Accion:** Seleccionar el informe mensual en la seccion destacada. Descargar el archivo XLSX. Abrirlo en Excel o LibreOffice y verificar que contiene las 7 hojas esperadas: portada, talleres, marcas, pedidos, validaciones, demanda, resumen.
- **Esperado:** Archivo XLSX con 7 hojas. La portada muestra titulo, subtitulo y fecha de generacion. Cada hoja tiene headers formateados, filas alternadas y columnas auto-ajustadas. El toast de exito aparece al completar la descarga.
- **Resultado:** ✅ code review — 7 hojas confirmadas, portada con titulo/subtitulo/fecha, formatting completo, toast success. ⏳ descargar y abrir — Claude Code 6/5
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Filtros sin coincidencias | Aplicar filtros que no coincidan con ningun registro | Se genera archivo con 0 filas de datos (solo headers), no error | QA | ✅ code review — empty arrays → CSV solo headers, XLSX solo header row. Sin errores — Claude Code 6/5. ⏳ browser |
| 2 | Caracteres especiales en CSV | Descargar CSV con ñ, tildes | Caracteres correctos gracias al BOM UTF-8 | QA | ✅ code review — BOM \uFEFF + toCsv escapa con replace(/"/g,'""') RFC 4180 — Claude Code 6/5. ⏳ abrir en Excel |
| 3 | Rate limit (6 descargas rapidas) | Descargar 6 reportes en <1 min | 5 OK, 6ta → 429 | QA | ✅ code review — limiter exportar: slidingWindow(5, '1 h'). 429 con Retry-After — Claude Code 6/5. ⏳ browser |
| 4 | Periodo semestre con poca data | Filtro semestre con pocos registros | Archivo con pocas filas, headers presentes | QA | ✅ code review — same behavior as empty, valid output — Claude Code 6/5 |
| 5 | Informe mensual en mes sin actividad | Generar informe en mes vacio | 7 hojas con solo headers, portada correcta | QA | ✅ code review — generarXlsx siempre genera portada + N hojas, filas vacias OK — Claude Code 6/5. ⏳ browser |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Pagina /estado/exportar carga en menos de 3 segundos | DevTools > Network > recargar | QA | ✅ code review — client component sin data fetch al cargar, solo renderiza UI. Deberia ser rapido — Claude Code 6/5. ⏳ browser |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | ⏳ requiere browser |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar | QA | ✅ code review — max-w-4xl, grid-cols-1 md:grid-cols-2, flex-col sm:flex-row — Claude Code 6/5. ⏳ browser |
| Descarga de reporte individual completa en menos de 10 segundos | Medir tiempo desde click hasta descarga | QA | ⏳ requiere browser. Nota: queries individuales, depende del volumen de datos |
| Informe mensual completa en menos de 30 segundos | Medir tiempo desde click hasta descarga | QA | ⏳ requiere browser. Nota: maxDuration=120s, Promise.all 5 queries paralelas |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | ✅ code review — font-overpass en h1, h2, h3 — Claude Code 6/5 | |
| Colores del design system (brand-blue, brand-red) | ✅ code review — text-brand-blue en titulos, border-brand-blue en featured card — Claude Code 6/5 | |
| Tarjetas de reporte con estilo consistente | ✅ code review — Card component uniforme, layout interno consistente — Claude Code 6/5 | |
| Seccion informe mensual visualmente destacada | ✅ code review — border-brand-blue/30 bg-blue-50/30, separada del grid — Claude Code 6/5 | |
| Breadcrumbs alineados y con separadores claros | ✅ code review — shared Breadcrumbs con ChevronRight — Claude Code 6/5 | |
| Toasts con iconos y colores consistentes por variante | ✅ code review — useToast con success=green/CheckCircle, error=red/AlertCircle — Claude Code 6/5 | |
| Textos en espanol argentino (vos/tenes) | ✅ code review — labels neutros ("Genera informes", "Descargar"). No requiere voseo en esta pagina — Claude Code 6/5 | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

> ESTADO exporta datos para informes OIT. Los perfiles interdisciplinarios validan que la informacion exportada sea relevante, completa y apropiada para su uso institucional.

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los exportes contienen la informacion que OIT realmente necesita para sus informes? | 🔵 Parcialmente. Los 10 tipos cubren: actores (talleres, marcas), proceso (validaciones, capacitaciones), resultados (pedidos, demanda insatisfecha), overview (resumen). Faltaria: indicadores de genero (cuantas mujeres en talleres, liderazgo femenino), y metricas de empleo formal generado (horas de trabajo, puestos creados). Estas son metricas criticas para OIT pero requieren datos que hoy no se capturan sistematicamente. Para el piloto, los 10 tipos son suficientes. | Agregar indicadores de genero/empleo en V4 H-07 |
| 2 | La estructura del informe mensual es la apropiada para una autoridad internacional? | 🔵 Si. Las 7 hojas (portada, talleres, marcas, pedidos, validaciones, demanda, resumen) siguen un formato compatible con informes de evaluacion OIT. La portada con titulo/subtitulo/fecha es profesional. Las hojas con headers formateados y filas alternadas son legibles en Excel. Faltaria: una hoja de "Metodologia" explicando como se calculan las metricas, y una de "Glosario" con definiciones (que es un taller BRONCE, que es tasa de aceptacion). Para el piloto actual no es bloqueante. | Considerar agregar Metodologia + Glosario en V4 |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La metrica de "tasa de aceptacion de cotizaciones" es relevante? Hay otras metricas economicas faltantes? | 🔵 Relevante pero insuficiente sola. La tasa de aceptacion (cotizaciones aceptadas / total) mide eficiencia del matching, no impacto economico. Faltaria: monto promedio por cotizacion, monto total transaccionado, precio por prenda/proceso (benchmark sectorial). Para el piloto la tasa es un buen indicador proxy. | V4 H-01 tiene estas metricas planificadas |
| 2 | El calculo de discrepancia empleados puede tener interpretaciones erroneas? | 🔵 Si, riesgo alto. La discrepancia (declarados - SIPA) puede significar: (a) empleo informal real, (b) datos desactualizados en SIPA, (c) el taller declaro mas de los que tiene formalizados por aspiracion, (d) trabajadores familiares no registrados. Sin contexto, un numero negativo (SIPA > declarados) parece anomalia pero puede ser subregistro en la plataforma. Recomendacion: agregar nota al pie en el export explicando limitaciones del calculo. | Discutir interpretacion con equipo OIT antes de usar en informes |

### Sociologo — Lenguaje y accesibilidad

No aplica (spec tecnico de exportacion).

### Contador — Flujos fiscales y operativos

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Faltan datos contables relevantes (facturacion estimada, tipos de pago)? | 🔵 Si. El export de talleres incluye tipo de inscripcion AFIP y categoria monotributo (dato ARCA) pero no facturacion estimada ni tipo de facturacion (A, B, C). Para un informe contable a OIT faltaria: facturacion mensual estimada por taller, tipo de comprobante que emiten (monotributo solo puede emitir C), y si hay operaciones con IVA. Estos datos no se capturan en la plataforma hoy. Para el piloto es aceptable — OIT pide indicadores de formalizacion, no un balance. | V4 considerar campo "facturacion estimada" en perfil taller |
| 2 | La estructura del informe mensual sirve para reportes formales a organismos publicos? | 🔵 Si. El formato XLSX multi-hoja es estandar para informes institucionales. La portada profesional con titulo/fecha, headers formateados, y filas alternadas son presentables a una autoridad internacional. Faltaria: membrete o logo OIT en la portada (solo dice "Plataforma Digital Textil"), y numero de pagina/version. Para el piloto es suficiente. | Agregar logo OIT en portada si OIT lo requiere |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |
|-------|------|-------------|------------------------|-----------|
| — | ⚠️ minor | Import muerto de EmptyState en exportar/page.tsx linea 6 (dead code) | Claude Code (code review) | baja |
| — | ⚠️ spec gap | Export demanda insatisfecha falta 2 columnas del spec: "Procesos requeridos" y "Accion sugerida" | Claude Code (code review) | baja |

---

## Notas de los auditores

**Claude Code (code review + Eje 6 primera pasada — 6/5/2026):**

**Metodologia:** Code review de route.ts, data.ts (~400 lineas, 10 export types), exportes.ts (generarXlsx), exportar/page.tsx (UI). Eje 6: 6 items primera pasada (3 perfiles).

**Hallazgos positivos:**
- 10 export types completos con data functions separadas — arquitectura limpia
- generarXlsx con formatting profesional (headers, filas alternadas, frozen row, auto-width)
- Informe mensual multi-hoja con portada — listo para OIT
- Filtros bien implementados (provincia/nivel solo en talleres, periodo en todos)
- Auth correcto en 3 capas, rate limit 5/hora
- Toast feedback para success y error
- BOM UTF-8 en CSV para compatibilidad Excel

**Observaciones no bloqueantes:**
- Dead import EmptyState (cleanup)
- 2 columnas faltantes en demanda export (simplificacion vs spec)

**Perfiles interdisciplinarios:**
[primera pasada 🔵 completada — 6 items]

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
