# Spec: Exportes del Estado — conectar UI a API real

- **Semana:** 3
- **Asignado a:** Gerardo
- **Dependencias:** semana2-queries-dashboard-estado mergeado

## ⚠️ ANTES DE ARRANCAR

- `semana2-queries-dashboard-estado` (Gerardo) — queries del dashboard deben existir

## 1. Contexto

La página `/estado/exportar` tiene UI completa pero el flujo no cierra — el botón "Descargar" crea un blob pero la API `/api/exportar` ya genera CSV real. Hay que conectar la UI a la API existente, agregar los 3 reportes que faltan (marcas, pedidos, denuncias) y mejorar el CSV de resumen con las métricas del dashboard.

## 2. Qué construir

- Conectar el flujo completo: seleccionar tipo → generar → descargar CSV
- Agregar 3 tipos de reporte nuevos: marcas, pedidos, denuncias
- Mejorar el CSV de resumen con las métricas del dashboard Estado
- Agregar filtro de período (mes actual, últimos 3 meses, todo)

## 3. Datos

Los 4 reportes existentes ya tienen queries. Los 3 nuevos:

**Marcas:**

```typescript
prisma.marca.findMany({
  include: { user: { select: { email: true, createdAt: true } } },
  orderBy: { createdAt: 'desc' },
})
// Columnas: Nombre, CUIT, Tipo, Ubicación, Email, Volumen mensual, Pedidos realizados, Fecha registro
```

**Pedidos:**

```typescript
prisma.pedido.findMany({
  include: { marca: { select: { nombre: true } } },
  orderBy: { createdAt: 'desc' },
})
// Columnas: ID, Marca, Tipo prenda, Cantidad, Estado, Monto total, Fecha creación, Fecha objetivo
```

**Denuncias:**

```typescript
prisma.denuncia.findMany({
  orderBy: { createdAt: 'desc' },
})
// Columnas: Tipo, Estado, Anónima, Fecha recepción, Última actualización — sin datos del denunciante
```

## 4. Prescripciones técnicas

### Archivo a modificar — `src/app/api/exportar/route.ts`

**Cambio 1 — Agregar filtro de período:**

```typescript
const desde = req.nextUrl.searchParams.get('desde') // ISO date string opcional
const whereBase = desde ? { createdAt: { gte: new Date(desde) } } : {}
```

Aplicar `whereBase` a todas las queries donde aplique.

**Cambio 2 — Mejorar reporte resumen con métricas del dashboard:**

Agregar al CSV de resumen las métricas nuevas: `progresoPromedio`, `talleresInactivos`, `denunciasSinResolver`, `certificadosMes`, `subieronNivelMes`. Reutilizar las mismas queries del dashboard Estado.

**Cambio 3 — Agregar casos `marcas`, `pedidos`, `denuncias`:**

Mantener el patrón `if/else if` existente. Todos los valores numéricos deben envolverse en `String()` para compatibilidad con `toCsv(headers: string[], rows: string[][])`.

```typescript
} else if (tipo === 'marcas') {
  const marcas = await prisma.marca.findMany({
    where: whereBase,
    include: { user: { select: { email: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  })
  csv = toCsv(
    ['Nombre', 'CUIT', 'Tipo', 'Ubicación', 'Email', 'Volumen mensual', 'Pedidos realizados', 'Fecha registro'],
    marcas.map(m => [
      m.nombre, m.cuit, m.tipo ?? '', m.ubicacion ?? '',
      m.user.email, String(m.volumenMensual), String(m.pedidosRealizados),
      m.user.createdAt.toISOString().split('T')[0],
    ]),
  )
  filename = 'marcas.csv'

} else if (tipo === 'pedidos') {
  const pedidos = await prisma.pedido.findMany({
    where: whereBase,
    include: { marca: { select: { nombre: true } } },
    orderBy: { createdAt: 'desc' },
  })
  csv = toCsv(
    ['ID', 'Marca', 'Tipo prenda', 'Cantidad', 'Estado', 'Monto total', 'Fecha creación', 'Fecha objetivo'],
    pedidos.map(p => [
      p.omId, p.marca.nombre, p.tipoPrenda, String(p.cantidad), p.estado,
      String(p.montoTotal ?? ''), p.createdAt.toISOString().split('T')[0],
      p.fechaObjetivo ? p.fechaObjetivo.toISOString().split('T')[0] : '',
    ]),
  )
  filename = 'pedidos.csv'

} else if (tipo === 'denuncias') {
  const denuncias = await prisma.denuncia.findMany({
    where: whereBase,
    orderBy: { createdAt: 'desc' },
  })
  csv = toCsv(
    ['Tipo', 'Estado', 'Anónima', 'Fecha recepción', 'Última actualización'],
    denuncias.map(d => [
      d.tipo, d.estado, d.anonima ? 'Sí' : 'No',
      d.createdAt.toISOString().split('T')[0],
      d.updatedAt.toISOString().split('T')[0],
    ]),
  )
  filename = 'denuncias.csv'
}
```

### Archivo a modificar — `src/app/(estado)/estado/exportar/page.tsx`

**Cambio 1 — Agregar 3 tipos nuevos al array de opciones:**

```typescript
{ value: 'marcas', label: 'Listado de marcas', desc: 'Todas las marcas con CUIT, tipo y volumen' },
{ value: 'pedidos', label: 'Reporte de pedidos', desc: 'Pedidos con estado, cantidades y montos' },
{ value: 'denuncias', label: 'Reporte de denuncias', desc: 'Denuncias recibidas sin datos del denunciante' },
```

**Cambio 2 — Agregar selector de período:**

Agregar estado `periodo` y un `<select>` debajo del Card de tipo de reporte:

```tsx
const [periodo, setPeriodo] = useState('')

// Dentro del JSX, después del Card de tipo de reporte:
<div className="mt-4">
  <label className="text-sm font-medium text-gray-700">Período</label>
  <select value={periodo} onChange={e => setPeriodo(e.target.value)}
    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
    <option value="">Todo el historial</option>
    <option value="mes">Mes actual</option>
    <option value="trimestre">Últimos 3 meses</option>
    <option value="semestre">Últimos 6 meses</option>
  </select>
</div>
```

**Cambio 3 — Conectar el flujo completo:**

Reemplazar `handleGenerar` para descargar directamente sin paso intermedio:

```typescript
function calcularDesde(periodo: string): string | null {
  if (!periodo) return null
  const ahora = new Date()
  if (periodo === 'mes') return new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
  if (periodo === 'trimestre') {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return d.toISOString()
  }
  if (periodo === 'semestre') {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return d.toISOString()
  }
  return null
}

async function handleGenerar() {
  setGenerando(true)
  setError('')
  try {
    const desde = calcularDesde(periodo)
    const url = `/api/exportar?tipo=${tipo}${desde ? `&desde=${desde}` : ''}`
    const res = await fetch(url)
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Error al generar' }))
      setError(data.error || 'Error al generar reporte')
      return
    }
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(blobUrl)
  } catch {
    setError('Error de conexión')
  } finally {
    setGenerando(false)
  }
}
```

Nota: `calcularDesde` crea instancias `new Date()` separadas para trimestre y semestre para evitar mutación del objeto `ahora`.

## 5. Casos borde

- Reporte vacío (sin datos en el período) → CSV con solo headers, sin filas — descarga igual
- Error de red al generar → mostrar mensaje de error claro
- Reporte de denuncias → nunca incluir descripción ni datos del denunciante (privacidad)
- Período "mes" en enero → fecha inicio es 1 de enero del año actual, no error

## 6. Criterio de aceptación

- [ ] Los 7 tipos de reporte aparecen en la UI
- [ ] Seleccionar un tipo y hacer click en "Generar" descarga el CSV automáticamente
- [ ] El filtro de período funciona — reporte de mes actual tiene menos registros que todo el historial
- [ ] El CSV de denuncias no incluye descripción ni datos del denunciante
- [ ] Build pasa sin errores

## 7. Tests (verificación manual — Sergio)

1. Loguearse como ESTADO → ir a `/estado/exportar`
2. Seleccionar "Listado de talleres" + período "Mes actual" → verificar que descarga CSV con datos
3. Seleccionar "Listado de marcas" → verificar que descarga CSV con las marcas del seed
4. Seleccionar "Reporte de denuncias" → verificar que el CSV no tiene columna de descripción
