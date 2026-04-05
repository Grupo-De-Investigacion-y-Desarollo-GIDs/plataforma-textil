# Spec: Directorio público con filtros

- **Semana:** 3
- **Asignado a:** Sergio
- **Dependencias:** Ninguna

## 1. Contexto

El directorio público `/directorio` existe pero no tiene filtros ni búsqueda — muestra todos los talleres sin posibilidad de filtrar. Hay que replicar los filtros del directorio de marcas (`/marca/directorio`) que ya funciona correctamente. Sin paginación para el piloto — con 25 talleres no es necesario.

## 2. Qué construir

- Agregar filtros al directorio público: texto libre, nivel, proceso, prenda
- Ordenar por puntaje descendente (ORO primero)
- Corregir `zona` → `ubicacion` en las cards para consistencia con el resto del proyecto
- Sin paginación — documentado como mejora futura

## 3. Datos

- Mismas queries que `/marca/directorio` — copiar el patrón exacto
- Los selects de proceso y prenda se cargan de `ProcesoProductivo` y `TipoPrenda` (activos)
- No requiere auth — página pública

## 4. Prescripciones técnicas

### Archivo a modificar — `src/app/(public)/directorio/page.tsx`

**Cambio 1 — Agregar `searchParams` a las props y validar nivel:**

Copiar el patrón exacto de `/marca/directorio/page.tsx` (líneas 17-41):

```typescript
const allowedNiveles = ['BRONCE', 'PLATA', 'ORO'] as const

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; nivel?: string; proceso?: string; prenda?: string }> | { q?: string; nivel?: string; proceso?: string; prenda?: string }
}) {
  const params = await Promise.resolve(searchParams ?? {})
  const query = (params.q || '').trim()
  const nivelRaw = (params.nivel || '').trim().toUpperCase()
  const nivel = allowedNiveles.includes(nivelRaw as (typeof allowedNiveles)[number])
    ? (nivelRaw as (typeof allowedNiveles)[number])
    : ''
  const procesoId = (params.proceso || '').trim()
  const prendaId = (params.prenda || '').trim()
```

La validación de nivel evita que `?nivel=INVALIDO` en la URL cause un error de Prisma.

**Cambio 2 — Cargar opciones para selects + query con filtros:**

```typescript
const [procesos, prendas, talleres] = await Promise.all([
  prisma.procesoProductivo.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' },
  }),
  prisma.tipoPrenda.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' },
  }),
  prisma.taller.findMany({
    where: {
      ...(query ? { OR: [
        { nombre: { contains: query, mode: 'insensitive' } },
        { ubicacion: { contains: query, mode: 'insensitive' } },
      ]} : {}),
      ...(nivel ? { nivel } : {}),
      ...(procesoId ? { procesos: { some: { procesoId } } } : {}),
      ...(prendaId ? { prendas: { some: { prendaId } } } : {}),
    },
    include: {
      procesos: { include: { proceso: true } },
      prendas: { include: { prenda: true } },
    },
    orderBy: { puntaje: 'desc' },
  }),
])

const hasFilters = query || nivel || procesoId || prendaId
```

**Cambio 3 — Agregar formulario de filtros antes del grid:**

```tsx
<form method="get" className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <input
      name="q"
      defaultValue={query}
      placeholder="Buscar por nombre o ubicación..."
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
    />
    <select name="nivel" defaultValue={nivel}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
      <option value="">Todos los niveles</option>
      <option value="BRONCE">Bronce</option>
      <option value="PLATA">Plata</option>
      <option value="ORO">Oro</option>
    </select>
    <select name="proceso" defaultValue={procesoId}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
      <option value="">Todos los procesos</option>
      {procesos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
    </select>
    <select name="prenda" defaultValue={prendaId}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
      <option value="">Todas las prendas</option>
      {prendas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
    </select>
  </div>
  <div className="flex gap-2 mt-3">
    <button type="submit"
      className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90">
      Filtrar
    </button>
    {hasFilters && (
      <a href="/directorio"
        className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
        Limpiar filtros
      </a>
    )}
  </div>
</form>
```

**Cambio 4 — Corregir cards: reemplazar `taller.zona` por `taller.ubicacion` en el JSX de cada card.**

Nota: el schema tiene ambos campos (`ubicacion` y `zona`). Se usa `ubicacion` por consistencia con el directorio de marca y el registro.

**Cambio 5 — Agregar contador de resultados:**

```tsx
<p className="text-sm text-gray-500 mb-4">
  {talleres.length} {talleres.length === 1 ? 'taller encontrado' : 'talleres encontrados'}
  {hasFilters ? ' con los filtros aplicados' : ''}
</p>
```

**Cambio 6 — Estado vacío mejorado si no hay resultados:**

```tsx
{talleres.length === 0 && (
  <div className="text-center py-12 text-gray-500">
    <p className="text-lg">No encontramos talleres con esos filtros</p>
    {hasFilters && (
      <a href="/directorio" className="text-brand-blue underline text-sm mt-2 block">
        Ver todos los talleres
      </a>
    )}
  </div>
)}
```

## 5. Casos borde

- Sin talleres en la DB → estado vacío sin error
- Filtro con nivel inválido (`?nivel=INVALIDO`) → se ignora gracias a la validación con `allowedNiveles`
- Sin procesos ni prendas activos → selects vacíos, solo la opción "Todos"
- Paginación → no implementada, documentar como mejora futura cuando supere 50 talleres

## 6. Criterio de aceptación

- [ ] El directorio público muestra los filtros de texto, nivel, proceso y prenda
- [ ] Filtrar por nivel ORO muestra solo talleres ORO
- [ ] Las cards muestran `ubicacion` (no `zona`)
- [ ] El contador de resultados se actualiza con los filtros
- [ ] Sin resultados muestra estado vacío con link para limpiar filtros
- [ ] Build pasa sin errores

## 7. Tests (verificación manual)

1. Ir a `/directorio` sin login → verificar que carga
2. Filtrar por nivel ORO → verificar que solo aparecen talleres ORO
3. Buscar "Avellaneda" → verificar que filtra correctamente
4. Filtrar por prenda → verificar talleres que trabajan esa prenda
5. Aplicar filtro sin resultados → verificar estado vacío
