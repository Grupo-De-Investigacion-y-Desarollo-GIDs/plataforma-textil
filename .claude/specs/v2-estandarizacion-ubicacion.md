# Spec: Estandarización de ubicación — provincias y partidos INDEC

- **Semana:** v2 / datos
- **Asignado a:** Gerardo (migración + JSON) + Sergio (UI selects)
- **Origen:** Issue #38 — distribución por zona muestra partidos libres en vez de provincias estandarizadas
- **Dependencias:** ninguna

---

## ANTES DE ARRANCAR

- [x] No hay datos reales de ubicación en producción — solo seed. Migración limpia.
- [x] Campo actual: `zona String?` en modelo Taller
- [x] Archivo afectado en UI: `src/app/(taller)/taller/perfil/editar/editar-form.tsx`

---

## 1. Contexto

El campo `zona` es texto libre — los talleres escriben lo que quieren ("Avellaneda", "avellaneda", "GBA Sur", etc.). Esto hace que los reportes del Estado sean inútiles porque no se puede agrupar por zona de forma confiable.

La solución es reemplazar el campo libre por dos selects en cascada (provincia → partido/departamento) con datos estandarizados del INDEC, más un campo libre opcional para detalles adicionales.

---

## 2. Qué construir

1. **Migración Prisma** — reemplazar `zona` por `provincia`, `partido`, `ubicacionDetalle`
2. **JSON estático** — árbol de provincias + partidos/departamentos de INDEC (~530 entradas)
3. **Componente `UbicacionSelector`** — selects en cascada en el formulario de edición del perfil del taller
4. **Seed actualizado** — con valores estandarizados
5. **Query de distribución actualizada** — en dashboard de Estado, agrupar por provincia
6. **Directorio público** — actualizar búsqueda y display en `/directorio` para usar `provincia`/`partido` en vez de solo `ubicacion`

---

## 3. Datos

### Migración Prisma

```prisma
model Taller {
  // Reemplazar:
  // zona          String?

  // Por:
  provincia        String?   // ej: "Buenos Aires"
  partido          String?   // ej: "Avellaneda"
  ubicacionDetalle String?   // ej: "Barrio Flores, cerca de Av. Mitre" (libre)
}
```

### JSON estático de INDEC

Archivo: `src/compartido/data/ubicaciones-ar.json`

Fuente: `datos.gob.ar` — API de georeferenciación del INDEC. 24 provincias + ~529 departamentos/partidos.

### Query de distribución actualizada

```typescript
const distribucionPorProvincia = await prisma.taller.groupBy({
  by: ['provincia'],
  _count: { id: true },
  where: { provincia: { not: null } },
  orderBy: { _count: { id: 'desc' } }
})
```

---

## 4. Prescripciones técnicas

### 4.1 — Migración

```bash
npx prisma migrate dev --name estandarizar-ubicacion-taller
```

### 4.2 — JSON estático

Archivo: `src/compartido/data/ubicaciones-ar.json`

### 4.3 — Componente `UbicacionSelector`

Archivo: `src/compartido/componentes/ubicacion-selector.tsx`

### 4.4 — Integrar en formulario de edición

Archivo: `src/app/(taller)/taller/perfil/editar/editar-form.tsx`

### 4.5 — Actualizar seed

Archivo: `prisma/seed.ts`

### 4.6 — Actualizar query de distribución en Estado

Archivo: `src/app/(estado)/estado/sector/page.tsx`

### 4.7 — Actualizar directorio público

Archivo: `src/app/(public)/directorio/page.tsx` — agregar `provincia`/`partido` a la búsqueda y al display de cada taller.

### 4.8 — Limpiar referencias a `zona`

Archivos afectados:
- `src/app/(taller)/taller/perfil/page.tsx`
- `src/app/(admin)/admin/talleres/[id]/page.tsx`
- `src/app/(admin)/admin/talleres/page.tsx`
- `src/app/api/talleres/route.ts`
- `src/app/api/talleres/[id]/route.ts`

---

## 5. Casos borde

- **Taller sin provincia seleccionada** — el select de partido no aparece
- **Provincia sin partidos en el JSON** — fallback a array vacío
- **Campo zona legacy en código** — buscar y reemplazar todas las referencias
- **Directorio público** — actualizar filtro y display

---

## 6. Criterios de aceptación

- [ ] Migración corre sin errores: `npx prisma migrate dev`
- [ ] JSON de INDEC tiene las 24 provincias con sus partidos/departamentos
- [ ] Formulario de edición muestra select de provincia → partido en cascada
- [ ] Al cambiar provincia se resetea el partido seleccionado
- [ ] Campo de detalle libre funciona y se guarda
- [ ] Seed corre sin errores con los nuevos campos
- [ ] Dashboard de Estado agrupa por provincia (no por zona)
- [ ] Directorio público muestra provincia/partido y permite buscar por ellos
- [ ] No quedan referencias a `taller.zona` en el codebase
- [ ] Build sin errores de TypeScript

---

## 7. Tests

| # | Qué testear | Verificador |
|---|-------------|-------------|
| 1 | Select de provincia muestra las 24 provincias | QA |
| 2 | Al seleccionar Buenos Aires, el select de partido muestra partidos bonaerenses | QA |
| 3 | Al cambiar de provincia, el partido se resetea | QA |
| 4 | Campo detalle se guarda correctamente | QA |
| 5 | Dashboard de Estado muestra distribución por provincia | QA |
| 6 | Directorio público muestra provincia/partido del taller | QA |
| 7 | Seed corre limpio con `npx prisma db seed` | DEV |
| 8 | No hay referencias a `taller.zona` después de la migración | DEV |
| 9 | JSON de INDEC parsea sin errores en TypeScript | DEV |
