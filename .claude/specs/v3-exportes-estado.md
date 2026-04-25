# Spec: Exportes del Estado en formatos reales

- **Versión:** V3
- **Origen:** V3_BACKLOG F-04
- **Asignado a:** Gerardo
- **Prioridad:** Media — el ESTADO necesita poder extraer datos para informes a OIT

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG D-01 mergeado (ESTADO con sus rutas)
- [ ] V3_BACKLOG INT-01 mergeado (datos ARCA disponibles para incluir en exportes)
- [ ] V3_BACKLOG F-05 mergeado (tabla MotivoNoMatch para exporte demanda-insatisfecha)
- [ ] V3_BACKLOG Q-03 mergeado (formato de errores consistente)
- [ ] V3_BACKLOG S-04 mergeado (logAccionAdmin disponible)

---

## 1. Contexto

Hoy `/estado/exportar` (o `/api/exportar` según donde esté el endpoint actual) tiene exportes a CSV de talleres, marcas y resumen. En V2 se identificó que faltaban cosas:

- **No incluye datos verificados por ARCA** — los exportes muestran campos autodeclarados sin diferenciación
- **No incluye datos del Eje 6** — pedidos sin cotizaciones, demanda insatisfecha (F-05)
- **No incluye historial de validaciones** — qué documentos aprobó/rechazó el ESTADO y cuándo
- **Solo CSV** — para informes formales a OIT, Excel con formato estructurado es más profesional
- **Sin filtros** — exporta todo el universo de datos sin posibilidad de acotar por fecha, provincia, nivel, etc.

Para que el ESTADO pueda armar informes mensuales para OIT, los exportes tienen que ser:
- Más completos (todos los datos relevantes, no solo los básicos)
- Más diferenciados (autodeclarado vs verificado)
- Más flexibles (filtros por dimensiones)
- Más profesionales (Excel con hojas y formato)

---

## 2. Qué construir

1. **Ampliación de exportes existentes** — agregar campos de ARCA, validaciones, métricas de actividad
2. **3 exportes nuevos** — historial de validaciones, demanda insatisfecha, métricas mensuales agregadas
3. **Formato Excel además de CSV** — para informes formales
4. **Filtros en la UI** — fecha, provincia, nivel, estado de verificación
5. **Plantilla de informe mensual a OIT** — Excel pre-formateado con hojas + portada + totales

---

## 3. Inventario de exportes

### 3.1 — Exportes ampliados (existentes con campos nuevos)

#### `talleres.csv` / `talleres.xlsx`
| Campo | Origen | Nuevo en V3 |
|-------|--------|-------------|
| ID | Taller | - |
| Nombre | Taller | - |
| CUIT | Taller | - |
| **Verificado por ARCA** | Taller | ✅ |
| **Fecha verificación** | Taller | ✅ |
| **Tipo inscripción AFIP** | Taller (INT-01) | ✅ |
| **Categoría monotributo** | Taller (INT-01) | ✅ |
| **Estado CUIT** | Taller (INT-01) | ✅ |
| Nivel actual | Taller | - |
| Puntaje | Taller | - |
| Provincia | Taller | - |
| Localidad | Taller | - |
| Capacidad mensual | Taller | - |
| **Empleados declarados** | Taller | - |
| **Empleados SIPA** | Taller (INT-01) | ✅ |
| **Discrepancia empleados** | Calculado | ✅ |
| Activo | User | - |
| Fecha registro | Taller | - |
| Última actividad | User | - |
| Pedidos completados | Calculado | ✅ |
| Cotizaciones enviadas | Calculado | ✅ |
| Tasa aceptación cotizaciones | Calculado | ✅ |
| Documentos aprobados | Calculado | ✅ |
| Documentos pendientes | Calculado | ✅ |

#### `marcas.csv` / `marcas.xlsx`
| Campo | Nuevo en V3 |
|-------|-------------|
| ID | - |
| Nombre | - |
| CUIT | - |
| **Verificado por ARCA** | ✅ |
| Activo | - |
| Pedidos publicados | ✅ |
| Pedidos completados | ✅ |
| Pedidos sin cotizaciones | ✅ |
| Volumen total ($) | ✅ |
| Última actividad | ✅ |

#### `resumen.csv` / `resumen.xlsx`
Stats agregadas con cuts por: nivel, provincia, mes.

### 3.2 — Exportes nuevos

#### `validaciones.csv` / `validaciones.xlsx`
Historial completo de aprobaciones/rechazos del ESTADO.

| Campo | Origen |
|-------|--------|
| Fecha | Validacion |
| Taller | Taller |
| Tipo documento | TipoDocumento |
| Estado | Validacion |
| Aprobado por | User (rol ESTADO) |
| Motivo (si rechazado/revocado) | Validacion.detalle |
| Documento URL | Validacion (solo URL si admin/estado) |

#### `demanda-insatisfecha.csv` / `demanda-insatisfecha.xlsx`
Pedidos sin cotizaciones con motivos. Salida directa de F-05.

| Campo | Origen |
|-------|--------|
| Fecha pedido | Pedido |
| Marca | Pedido.marca |
| Tipo prenda | Pedido |
| Cantidad | Pedido |
| Procesos requeridos | Pedido (string list) |
| Motivo no-match | MotivoNoMatch |
| Talleres cerca | MotivoNoMatch.detalle |
| Acción sugerida | Calculado |

#### `metricas-mensuales.xlsx`
Plantilla pre-formateada con hojas separadas:
- Hoja 1: Portada (logo OIT, periodo, totales)
- Hoja 2: Talleres (con campos ampliados)
- Hoja 3: Marcas
- Hoja 4: Pedidos del mes
- Hoja 5: Validaciones del mes
- Hoja 6: Demanda insatisfecha
- Hoja 7: Resumen ejecutivo (gráficos opcionales V4)

---

## 4. Implementación

### 4.1 — Librería para Excel

```bash
npm install exceljs
```

`exceljs` permite generar archivos `.xlsx` con:
- Múltiples hojas
- Formato (negritas, colores, bordes)
- Fórmulas
- Headers/footers
- Sin dependencias nativas (compatible con Vercel serverless)

**Importante:** agregar `export const maxDuration = 120` al inicio de `/api/estado/exportar/route.ts`. Sin esto, Vercel mata la función a los 60s default. Con plan Pro de Vercel se puede subir hasta 300s.

### 4.2 — Helper compartido `tools/exportes.ts`

Reutilizar `toCsv` extraído en S-04 (logs admin auditoría) y agregar `toXlsx`:

```typescript
// src/compartido/lib/exportes.ts
import ExcelJS from 'exceljs'
import { toCsv } from './csv'  // del spec S-04

export interface HojaExportable {
  nombre: string
  headers: string[]
  filas: (string | number | Date | null)[][]
  // Opcional: estilos por columna
  estilos?: {
    columnasNumericas?: number[]   // formato number
    columnasFecha?: number[]       // formato date
    columnaResaltada?: number[]    // bold
  }
}

export async function generarXlsx(
  hojas: HojaExportable[],
  metadata?: { titulo?: string; subtitulo?: string; logoUrl?: string }
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()

  workbook.creator = 'Plataforma Digital Textil'
  workbook.created = new Date()

  // Si hay metadata, crear hoja de portada
  if (metadata?.titulo) {
    const portada = workbook.addWorksheet('Portada')
    portada.mergeCells('B2:E2')
    portada.getCell('B2').value = metadata.titulo
    portada.getCell('B2').font = { size: 18, bold: true }

    if (metadata.subtitulo) {
      portada.mergeCells('B3:E3')
      portada.getCell('B3').value = metadata.subtitulo
    }
  }

  // Generar hojas
  for (const hoja of hojas) {
    const worksheet = workbook.addWorksheet(hoja.nombre.slice(0, 31))  // Excel limita a 31 chars

    // Headers con formato
    worksheet.addRow(hoja.headers)
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    }

    // Filas de datos
    for (const fila of hoja.filas) {
      worksheet.addRow(fila)
    }

    // Auto-fit columnas
    worksheet.columns.forEach((col, idx) => {
      const headerLength = hoja.headers[idx].length
      const maxLength = Math.max(headerLength, ...hoja.filas.map(f => String(f[idx] ?? '').length))
      col.width = Math.min(maxLength + 2, 50)
    })

    // Aplicar estilos
    if (hoja.estilos?.columnasFecha) {
      for (const colIdx of hoja.estilos.columnasFecha) {
        worksheet.getColumn(colIdx + 1).numFmt = 'dd/mm/yyyy'
      }
    }
  }

  return await workbook.xlsx.writeBuffer() as Buffer
}

export { toCsv } from './csv'
```

### 4.3 — Endpoint unificado (ampliación del existente)

El endpoint actual `src/app/api/exportar/route.ts` (183 líneas) ya implementa **7 tipos de exporte en CSV**:

| Tipo | Estado actual |
|------|--------------|
| `talleres` | ✅ nombre, cuit, ubicacion, nivel, puntaje, capacidad, email, telefono, validaciones count, certificados count |
| `marcas` | ✅ nombre, cuit, tipo, ubicacion, email, volumenMensual, pedidosRealizados |
| `resumen` | ✅ 8 queries paralelas: totales, distribución por nivel, inactivos 30d, denuncias, certificados/mes, subidas de nivel/mes |
| `capacitaciones` | ✅ taller, coleccion, codigo, calificacion, fecha |
| `acompanamiento` | ✅ talleres con <4 validaciones completadas |
| `pedidos` | ✅ omId, marca, tipoPrenda, cantidad, estado, montoTotal, fechaObjetivo |
| `denuncias` | ✅ tipo, estado, anonima, fechas |

Auth actual: ADMIN o ESTADO. **Cambiar a solo ESTADO** según D-01 — ADMIN no exporta porque su rol es técnico, no regulatorio.

**Alcance real de F-04:**
1. **Ampliar los 7 existentes** — agregar campos ARCA (verificadoAfip, tipoInscripcionAfip, etc.), métricas calculadas (tasa aceptación, pedidos completados) y discrepancias (empleados declarados vs SIPA)
2. **Crear 2 tipos nuevos** — `validaciones` (historial aprobaciones/rechazos) y `demanda` (pedidos sin cotizaciones con motivos)
3. **Agregar formato Excel** — `mensual` es una agregación multi-hoja de los demás tipos, no un tipo de query nuevo
4. **Para `capacitaciones`, `acompanamiento`, `denuncias`** — mantenerlos como están; opcionalmente agregar datos ARCA si aplica a la entidad

Archivo destino: `src/app/api/estado/exportar/route.ts` (mover desde `/api/exportar/` y ampliar)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { apiHandler, errorForbidden, errorResponse } from '@/compartido/lib/api-errors'
import { auth } from '@/compartido/lib/auth'
import { obtenerDataExporte } from './data'
import { generarXlsx, toCsv } from '@/compartido/lib/exportes'

export const GET = apiHandler(async (req) => {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ESTADO') {
    return errorForbidden('ESTADO')
  }

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo')         // 'talleres' | 'marcas' | 'validaciones' | 'demanda' | 'resumen' | 'mensual'
  const formato = searchParams.get('formato')   // 'csv' | 'xlsx'
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')
  const provincia = searchParams.get('provincia')
  const nivel = searchParams.get('nivel')

  if (!tipo || !formato) {
    return errorResponse({
      code: 'INVALID_INPUT',
      message: 'Faltan parámetros tipo y formato',
      status: 400,
    })
  }

  // Rate limit (de S-02)
  // ...

  const data = await obtenerDataExporte(tipo, { desde, hasta, provincia, nivel })

  if (formato === 'csv') {
    const csv = toCsv(data.headers, data.filas)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${tipo}-${fechaActual()}.csv"`,
      }
    })
  }

  if (formato === 'xlsx') {
    const buffer = await generarXlsx(data.hojas, data.metadata)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${tipo}-${fechaActual()}.xlsx"`,
      }
    })
  }

  return errorResponse({
    code: 'INVALID_INPUT',
    message: 'Formato inválido. Usar csv o xlsx',
    status: 400,
  })
})
```

### 4.4 — Función `obtenerDataExporte`

Archivo nuevo: `src/app/api/estado/exportar/data.ts`

Implementa la lógica de cada tipo de exporte. Cada uno hace las queries necesarias y devuelve la estructura común:

```typescript
export async function obtenerDataExporte(
  tipo: string,
  filtros: { desde?: string; hasta?: string; provincia?: string; nivel?: string }
): Promise<{
  headers: string[]
  filas: any[][]
  hojas: HojaExportable[]   // para Excel multi-hoja
  metadata?: { titulo: string; subtitulo: string }
}> {
  switch (tipo) {
    case 'talleres':
      return obtenerTalleres(filtros)
    case 'marcas':
      return obtenerMarcas(filtros)
    case 'validaciones':
      return obtenerValidaciones(filtros)
    case 'demanda':
      return obtenerDemanda(filtros)
    case 'mensual':
      return obtenerInformeMensual(filtros)
    case 'resumen':
      return obtenerResumen(filtros)
    default:
      throw new Error(`Tipo desconocido: ${tipo}`)
  }
}
```

Cada función específica hace las queries de Prisma con los filtros aplicados y mapea a las filas.

### 4.5 — UI de filtros y exportes (transformación de la página existente)

La página actual `src/app/(estado)/estado/exportar/page.tsx` (113 líneas, client component) ya tiene:
- **7 tipos de reporte** con radio buttons y descripciones
- **Filtro de período** con dropdown: todo el historial, mes actual, 3 meses, 6 meses
- **Download flow funcional**: fetch → blob → crear `<a>` → click → revoke URL
- **Integración en sidebar** ESTADO: "Exportar Datos" con icono FileText
- **Auth guard** en layout.tsx

**Cambios prescritos:**
1. Reemplazar el layout de radio buttons por **tarjetas** — una por tipo de exporte
2. Agregar **filtros específicos por tipo**: provincia, nivel, verificación ARCA (no todos los filtros aplican a todos los tipos)
3. Agregar **selector de formato** CSV/Excel en cada tarjeta
4. Agregar **sección destacada** para el informe mensual (tarjeta más grande, selector de mes)
5. **Reusar el download flow existente** (fetch → blob → click) sin cambios — solo agregar el parámetro `formato` al fetch

Cada tarjeta:

```
┌─────────────────────────────────────────────────────────┐
│ 📊 Talleres                                              │
│                                                          │
│ Datos completos: identificación, formalización,          │
│ verificación ARCA, métricas de actividad                 │
│                                                          │
│ Filtros aplicables:                                      │
│ ▢ Provincia: [Todas ▼]                                   │
│ ▢ Nivel: [Todos ▼]                                       │
│ ▢ Verificación ARCA: [○ Todos  ○ Verificados  ○ No verif]│
│ ▢ Período: [hoy] a [hoy]                                 │
│                                                          │
│ [📄 Descargar CSV]  [📑 Descargar Excel]                 │
└─────────────────────────────────────────────────────────┘
```

Para el informe mensual (más sustantivo):

```
┌─────────────────────────────────────────────────────────┐
│ 📋 Informe mensual completo                              │
│                                                          │
│ Plantilla pre-formateada con todas las hojas:            │
│ Talleres, marcas, pedidos, validaciones, demanda         │
│ insatisfecha. Listo para presentar a OIT.                │
│                                                          │
│ Período: [Marzo 2026 ▼]                                  │
│                                                          │
│ [📑 Generar informe completo]                            │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Cálculos especiales

### 5.1 — Tasa de aceptación de cotizaciones

```typescript
const tasa = cotizacionesAceptadas / cotizacionesEnviadas * 100
```

Es 0% para talleres sin cotizaciones todavía.

### 5.2 — Discrepancia empleados (autodeclarado vs SIPA)

```typescript
const discrepancia = taller.trabajadoresRegistrados - (taller.empleadosRegistradosSipa ?? 0)
// Positivo: el taller declaró más de los que están en SIPA
// Negativo: SIPA tiene más empleados de los que el taller declaró (raro)
// 0: coinciden
// null si no hay dato de SIPA
```

Es un dato interesante para ESTADO — indica posible informalidad o necesidad de actualizar declaración.

### 5.3 — Última actividad

Combina varias señales:
- Último login
- Última cotización enviada
- Último documento subido

Toma la más reciente de las tres.

---

## 6. Seguridad y privacidad

### 6.1 — Datos sensibles

Los exportes incluyen información que es sensible aunque sea agregada:
- CUIT de talleres y marcas
- Datos de contacto
- Datos verificados de ARCA

**Quién puede exportar:** solo ESTADO. ADMIN no exporta porque su rol es técnico, no regulatorio.

### 6.2 — Logs de exportación

Cada export genera un log con `logAccionAdmin` (de S-04):

```typescript
await logAccionAdmin('EXPORTE_GENERADO', session.user.id, {
  entidad: 'exportacion',
  entidadId: 'manual',
  metadata: {
    tipo,
    formato,
    filtros,
    cantidadRegistros: filas.length,
  }
})
```

Esto permite a OIT auditar qué se exportó cuándo y por quién.

### 6.3 — Rate limit

5 exportaciones por hora por usuario (de S-02). Es generoso para uso normal pero previene scraping accidental.

---

## 7. Casos borde

- **Filtros sin coincidencias** — el exporte se genera con 0 filas y un mensaje en el header. No falla, no devuelve error 404.

- **Período muy amplio (1 año+)** — limitar el período máximo a 6 meses por exporte. La justificación **no es por timeout** (con `maxDuration: 120` y el volumen del piloto de ~3500 filas máximo en 6 meses, el riesgo de timeout es bajo) sino por **usabilidad**: archivos Excel >1MB son incómodos de manejar, y períodos más largos pierden poder analítico para informes mensuales. Si ESTADO necesita rangos mayores, hacer múltiples exportes y consolidar localmente.

- **Talleres con datos parciales** — campos `null` se exportan como string vacío en CSV o celda vacía en Excel. No "N/A" ni "—".

- **Talleres dados de baja durante el período** — se incluyen en exportes históricos pero con un campo "estado" que indica si están activos hoy.

- **Datos de ARCA viejos (>30 días)** — se incluyen igual con la fecha de verificación. ESTADO ve "verificado hace 45 días" y decide si re-sincroniza primero.

- **Excel >10000 filas** — `exceljs` maneja bien hasta cientos de miles, pero el archivo se vuelve pesado. Para V3 con 25 talleres no es problema; para V4 con escala mayor evaluar paginación o filtros obligatorios.

- **Caracteres especiales en CSV** — `toCsv` ya escapa comillas y comas. UTF-8 con BOM para que Excel lo abra correctamente con tildes y eñes.

- **Servidor lento o caído al exportar** — el browser muestra spinner mientras espera. Vercel mata la función a los 60s por defecto (Free) o hasta 300s (Pro). Con `maxDuration: 120` prescrito en 4.1, hay margen suficiente para el piloto.

---

## 8. Criterios de aceptación

- [ ] Librería `exceljs` instalada y compatible con Vercel
- [ ] Helper `generarXlsx` reutilizable en `src/compartido/lib/exportes.ts`
- [ ] Endpoint `/api/estado/exportar` con filtros por tipo, formato, fecha, provincia, nivel
- [ ] 6 tipos de exporte: talleres, marcas, validaciones, demanda, resumen, mensual
- [ ] Cada tipo en formato CSV y XLSX
- [ ] UI `/estado/exportar` con tarjetas y filtros por exporte
- [ ] Informe mensual con 7 hojas (portada, talleres, marcas, pedidos, validaciones, demanda, resumen)
- [ ] Logs de exportación generados via `logAccionAdmin`
- [ ] Rate limit aplicado (5/hora)
- [ ] Solo ESTADO puede acceder
- [ ] Filtros funcionan correctamente
- [ ] Datos de ARCA incluidos cuando están disponibles
- [ ] Discrepancia empleados calculada y exportada
- [ ] Build sin errores de TypeScript

---

## 9. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | Exporte CSV de talleres se descarga | Click en botón, abrir archivo | QA |
| 2 | Exporte Excel de talleres se descarga | Mismo, formato xlsx | QA |
| 3 | Filtros por provincia funcionan | Aplicar filtro, verificar archivo | QA |
| 4 | Datos ARCA aparecen cuando están disponibles | Verificar columna en exporte | QA |
| 5 | Informe mensual tiene 7 hojas | Abrir xlsx, verificar pestañas | QA |
| 6 | Discrepancia empleados se calcula | Verificar fila con datos conocidos | DEV |
| 7 | Rate limit se aplica | 6 exportes rápidos, último da 429 | DEV |
| 8 | Solo ESTADO puede exportar | Login como ADMIN, intentar | QA |
| 9 | Logs de exportación aparecen | Después de exportar, verificar /admin/logs | QA |
| 10 | Caracteres especiales (ñ, tildes) se exportan correctamente | Buscar nombres con tildes en archivo | QA |

---

## 10. Validación de dominio (perfiles interdisciplinarios)

**Politólogo:**
- ¿Los exportes contienen la información que OIT realmente necesita para sus informes?
- ¿La estructura del informe mensual es la apropiada para una autoridad internacional?

**Economista:**
- ¿La métrica de "tasa de aceptación de cotizaciones" es relevante? ¿Hay otras métricas económicas faltantes?
- ¿El cálculo de discrepancia empleados puede tener interpretaciones erróneas?

**Sociólogo:**
- ¿Los datos exportables pueden generar perfilamiento o discriminación de talleres?
- ¿Es apropiado incluir datos personales (CUIT) en exportes que pueden circular en organismos?

**Contador:**
- ¿Faltan datos contables relevantes (facturación estimada, tipos de pago)?
- ¿La estructura del informe mensual sirve para reportes formales a organismos públicos?

---

## 11. Referencias

- V3_BACKLOG → F-04
- D-01 — define que ESTADO es quien exporta
- INT-01 — datos verificados por ARCA disponibles
- F-05 — datos de demanda insatisfecha
- S-04 — `logAccionAdmin` para auditar exportes
- ExcelJS docs: https://github.com/exceljs/exceljs
