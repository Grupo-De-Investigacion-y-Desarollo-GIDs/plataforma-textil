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
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar v3 / fix inmediato / abrir item v4 ]
**Issues abiertos:** # (links a GitHub)

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
| 9 | Solo ESTADO y ADMIN pueden exportar | DEV/QA | | # |

### Exportes individuales

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 10 | Export talleres con campos ARCA (verificadoAfip, tipoInscripcion, etc.) | QA | | # |
| 11 | Export talleres con tasa aceptacion cotizaciones | QA | | # |
| 12 | Export talleres con discrepancia empleados (declarados vs SIPA) | DEV | ok — Gerardo 5/5 | # |
| 13 | Export marcas ampliado (verificado ARCA, pedidos sin cotizaciones) | QA | | # |
| 14 | Export validaciones (nuevo) - historial aprobaciones/rechazos | QA | | # |
| 15 | Export demanda insatisfecha (reutiliza F-05) | QA | | # |
| 16 | Export resumen ampliado con metricas ARCA y demanda | QA | | # |
| 17 | Export capacitaciones (mantenido) | QA | | # |
| 18 | Export acompanamiento (mantenido) | QA | | # |
| 19 | Export pedidos (mantenido) | QA | | # |
| 20 | Export denuncias (mantenido) | QA | | # |

### Informe mensual multi-hoja

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 21 | Informe mensual multi-hoja (7 hojas: portada, talleres, marcas, pedidos, validaciones, demanda, resumen) | QA | | # |
| 22 | Portada del informe con titulo, subtitulo, fecha generacion | QA | | # |
| 23 | Headers formateados (bold, color de fondo) | QA | | # |
| 24 | Filas alternadas para legibilidad | QA | | # |
| 25 | Columnas auto-ajustadas | QA | | # |
| 26 | Header row frozen (scroll mantiene headers visibles) | QA | | # |

### Filtros

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 27 | Filtro por periodo (mes, trimestre, semestre) | QA | | # |
| 28 | Filtro por provincia | QA | | # |
| 29 | Filtro por nivel (BRONCE, PLATA, ORO) | QA | | # |

### CSV y encoding

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 30 | CSV con BOM UTF-8 para tildes en Excel | DEV | ok — Gerardo 5/5 | # |

### UI

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 31 | UI con tarjetas por tipo de reporte | QA | | # |
| 32 | UI con seccion destacada informe mensual | QA | | # |
| 33 | Breadcrumbs en /estado/exportar | QA | | # |
| 34 | Toast de exito al descargar reporte | QA | | # |
| 35 | Toast de error si falla la descarga | QA | | # |

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
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Descargar talleres en CSV y verificar columnas ARCA

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado/exportar`
- **Verificador:** QA
- **Accion:** Seleccionar el reporte de talleres. Elegir formato CSV. Descargar el archivo. Abrirlo con Excel o LibreOffice y verificar que las columnas ARCA estan presentes (verificadoAfip, tipoInscripcion, etc.).
- **Esperado:** Archivo CSV descargado correctamente. Las columnas ARCA aparecen con datos. Los caracteres especiales (ñ, tildes) se muestran correctamente gracias al BOM UTF-8.
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Descargar talleres en Excel y verificar formato

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado/exportar`
- **Verificador:** QA
- **Accion:** Seleccionar el reporte de talleres. Elegir formato XLSX. Descargar el archivo. Abrirlo en Excel o LibreOffice. Verificar headers con formato (bold, color de fondo), filas alternadas, columnas auto-ajustadas, y header row frozen.
- **Esperado:** Archivo XLSX con formato profesional: headers en negrita con color de fondo, filas alternadas para legibilidad, columnas ajustadas al contenido, y al hacer scroll vertical los headers permanecen visibles.
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Aplicar filtros y verificar filtrado correcto

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado/exportar`
- **Verificador:** QA
- **Accion:** Seleccionar el reporte de talleres. Aplicar filtro por provincia (ej: Buenos Aires) y filtro por nivel (ej: PLATA). Descargar en XLSX. Abrir el archivo y verificar que solo contiene talleres de Buenos Aires con nivel PLATA.
- **Esperado:** El archivo descargado solo contiene registros que coinciden con los filtros aplicados. Si no hay coincidencias, el archivo contiene solo la fila de headers.
- **Resultado:** [ ]
- **Notas:**

### Paso 5 — Generar informe mensual completo

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado/exportar`
- **Verificador:** QA
- **Accion:** Seleccionar el informe mensual en la seccion destacada. Descargar el archivo XLSX. Abrirlo en Excel o LibreOffice y verificar que contiene las 7 hojas esperadas: portada, talleres, marcas, pedidos, validaciones, demanda, resumen.
- **Esperado:** Archivo XLSX con 7 hojas. La portada muestra titulo, subtitulo y fecha de generacion. Cada hoja tiene headers formateados, filas alternadas y columnas auto-ajustadas. El toast de exito aparece al completar la descarga.
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Filtros sin coincidencias | Aplicar filtros que no coincidan con ningun registro (ej: provincia + nivel muy especificos) y descargar | Se genera archivo con 0 filas de datos (solo headers), no error | QA | |
| 2 | Caracteres especiales en CSV | Descargar reporte CSV que contenga datos con ñ, tildes y caracteres especiales. Abrir con Excel | Los caracteres se muestran correctamente gracias al BOM UTF-8, sin caracteres rotos | QA | |
| 3 | Rate limit (6 descargas rapidas) | Descargar 6 reportes en rapida sucesion (menos de 1 minuto) | Las primeras 5 descargas funcionan. La 6ta retorna error 429 con mensaje claro de rate limit | QA | |
| 4 | Periodo semestre con poca data | Seleccionar filtro de periodo "semestre" en un periodo con pocos registros | Archivo generado con pocas filas pero sin errores, headers presentes | QA | |
| 5 | Informe mensual en mes sin actividad | Generar informe mensual para un periodo donde no hubo actividad | Las 7 hojas estan presentes con solo headers (sin filas de datos). La portada muestra la informacion correcta | QA | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Pagina /estado/exportar carga en menos de 3 segundos | DevTools > Network > recargar | QA | |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar | QA | |
| Descarga de reporte individual completa en menos de 10 segundos | Medir tiempo desde click hasta descarga | QA | |
| Informe mensual completa en menos de 30 segundos | Medir tiempo desde click hasta descarga del XLSX multi-hoja | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | | |
| Colores del design system (brand-blue, brand-red) | | |
| Tarjetas de reporte con estilo consistente | | |
| Seccion informe mensual visualmente destacada | | |
| Breadcrumbs alineados y con separadores claros | | |
| Toasts con iconos y colores consistentes por variante | | |
| Textos en espanol argentino (vos/tenes) | | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

> ESTADO exporta datos para informes OIT. Los perfiles interdisciplinarios validan que la informacion exportada sea relevante, completa y apropiada para su uso institucional.

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los exportes contienen la informacion que OIT realmente necesita para sus informes? | | |
| 2 | La estructura del informe mensual es la apropiada para una autoridad internacional? | | |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La metrica de "tasa de aceptacion de cotizaciones" es relevante? Hay otras metricas economicas faltantes? | | |
| 2 | El calculo de discrepancia empleados puede tener interpretaciones erroneas? | | |

### Sociologo — Lenguaje y accesibilidad

No aplica (spec tecnico de exportacion).

### Contador — Flujos fiscales y operativos

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Faltan datos contables relevantes (facturacion estimada, tipos de pago)? | | |
| 2 | La estructura del informe mensual sirve para reportes formales a organismos publicos? | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |
|-------|------|-------------|------------------------|-----------|

---

## Notas de los auditores

**Sergio (tecnico):**
[observaciones tecnicas sobre implementacion, seguridad, performance, formatos de archivo]

**Perfiles interdisciplinarios:**
[observaciones sobre completitud de datos, relevancia de metricas, adecuacion para informes OIT]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Eje 6 completado por cada perfil aplicable
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
