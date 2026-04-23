# Spec: Épica Perfil Productivo — Wizard, Perfil Taller y Dashboard Sectorial

**Versión:** v2
**Asignado a:** Gerardo (schema + lógica) + Sergio (UI)
**Tipo:** Evolutivo — fase inicial. Los criterios de puntaje y pesos se definen en una etapa posterior con la mesa tripartita.

---

## 1. Contexto

El wizard de perfil productivo recolecta datos valiosos del sector textil pero tiene tres problemas críticos:

- **Bug de puntaje**: el wizard envía `puntaje: scoreGeneral` al mismo campo que usa `nivel.ts` para formalización — se pisan.
- **Datos huérfanos**: el taller completa 14 pasos y no puede ver lo que cargó en ninguna pantalla (salvo re-abriendo el wizard).
- **Sin infraestructura de recomendación**: los cursos sugeridos son los primeros por `orden`, sin relación con el perfil del taller.

Este spec resuelve los tres problemas y agrega un dashboard sectorial para el Estado.

---

## 2. Decisiones de arquitectura

- El **wizard no genera puntaje**. Es una herramienta de diagnóstico productivo para la OIT y el Estado.
- El **puntaje de formalización** lo calcula exclusivamente `nivel.ts` basado en documentos aprobados.
- Las **sugerencias de cursos** combinan dos dimensiones: producción (procesos del taller) y formalización (pasos pendientes del checklist).
- Todo es fase inicial — los criterios de puntaje productivo se definen cuando la mesa tripartita lo decida.

---

## 3. Cambios de schema

**Archivo:** `prisma/schema.prisma`

**Cambio 1** — agregar dos campos a `Coleccion` para recomendaciones:

```prisma
model Coleccion {
  // ... campos existentes ...
  procesosTarget      String[]  // IDs de procesos productivos relacionados
  formalizacionTarget String[]  // claves de tipos de validación relacionadas
}
```

**Cambio 2** — **no hay cambios al modelo `Taller`**. Los campos del wizard ya existen (`sam`, `prendaPrincipal`, `organizacion`, `metrosCuadrados`, `areas`, `experienciaPromedio`, `polivalencia`, `horario`, `registroProduccion`, `escalabilidad`, `paradasFrecuencia`).

**Migración (solo Gerardo):**

```bash
npx prisma migrate dev --name add_coleccion_recomendacion_targets
```

**Actualizar `prisma/seed.ts`** — agregar `procesosTarget` y `formalizacionTarget` a las 3 colecciones existentes. Usar los valores reales de `src/compartido/lib/nivel.ts` (`VALIDACIONES_PLATA` y `VALIDACIONES_ORO`):

```ts
// Colección 1 — Seguridad e higiene (col1 en el seed actual)
procesosTarget: [],
formalizacionTarget: ['HABILITACION_BOMBEROS', 'SEGURIDAD_HIGIENE', 'INSCRIPCION_EMPLEADOR'],

// Colección 2 — Cálculo de costos (col2)
procesosTarget: ['confeccion', 'corte'],  // usar IDs reales del seed de procesos
formalizacionTarget: ['LIBRO_SUELDOS'],

// Colección 3 — Formalización básica (col3)
procesosTarget: [],
formalizacionTarget: ['CUIT_MONOTRIBUTO', 'HABILITACION_MUNICIPAL', 'ART'],
```

> Los valores son los tipos que usa el sistema de niveles. `MONOTRIBUTO`, `HABILITACION_LOCAL`, `BOMBEROS` y `BROMATOLOGIA` **no existen** — no usarlos.

---

## 4. Cambio crítico — fix bug del wizard

**Archivo:** `src/app/(taller)/taller/perfil/completar/page.tsx`

### 4.1 handleSave (línea ~182)

```ts
// ANTES — pisa el puntaje de formalización:
body: JSON.stringify({ ...buildPayload(), puntaje: scoreGeneral })

// DESPUÉS — no manda puntaje:
body: JSON.stringify(buildPayload())
```

Además se puede (opcional) borrar las constantes `scoreEquipo`, `scoreOrg`, `scoreMaq`, `scoreGestion`, `scoreEscalabilidad` y `scoreGeneral` de las líneas 137-142 si ya no se usan en el resumen (ver 4.2). Si todavía se usan en los "Indicadores de Madurez", eliminarlos también.

### 4.2 Paso 13 — Resumen del wizard

Reformular el JSX del paso 13 (líneas ~579-647). Decisiones explícitas:

| Card | Acción | Razón |
|------|--------|-------|
| "Score General" (el `text-5xl` con `{scoreGeneral}%`) | **ELIMINAR** | Ya no existe score productivo |
| "Indicadores de Madurez" (las 5 barras de progreso por dimensión) | **ELIMINAR** | Usan los 5 sub-scores del bug |
| "Capacidad" (capacidadDiaria + capacidadMensual + especialidad) | **MANTENER** | Útil para el taller saber su capacidad estimada |
| "Procesos seleccionados" y "Prendas seleccionadas" | **MANTENER** | Confirman lo que eligió |
| "Badges Desbloqueados" | **MANTENER** | Son feedback positivo, no dependen del score |

El mensaje del título del paso debe cambiar de:
> "¡Perfil Completado!" + "Score General 75%" + "Top 25% de talleres"

A:
> "¡Perfil productivo completado!"
> "Las marcas pueden ver tu capacidad, maquinaria y procesos"
> "Este diagnóstico ayuda al equipo de la plataforma a entender el sector textil"

---

## 5. UI — Sección perfil productivo en `/taller/perfil`

**Archivo:** `src/app/(taller)/taller/perfil/page.tsx`

**No se requieren cambios en la query de Prisma** — la query actual (`findFirst` sin `select`) ya devuelve todos los scalars del modelo `Taller`, incluidos `organizacion`, `metrosCuadrados`, `sam`, `prendaPrincipal`, `experienciaPromedio`, `registroProduccion`, `escalabilidad`. Los campos ya están disponibles en el objeto `taller`.

Agregar nueva sección **después de "Tipos de Prenda" y antes de "Certificaciones"**. Mostrar solo si el taller completó el wizard (proxy: `taller.organizacion !== null`):

```tsx
{taller.organizacion && (
  <Card title="Perfil productivo">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">

      {/* Organización */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-gray-500 text-xs mb-1">Organización</p>
        <p className="font-medium text-gray-800">
          {taller.organizacion === 'linea' ? 'En línea'
           : taller.organizacion === 'modular' ? 'Modular'
           : 'Prenda completa'}
        </p>
      </div>

      {/* Espacio */}
      {(taller.metrosCuadrados ?? 0) > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Espacio</p>
          <p className="font-medium text-gray-800">{taller.metrosCuadrados} m²</p>
        </div>
      )}

      {/* Experiencia promedio */}
      {taller.experienciaPromedio && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Experiencia del equipo</p>
          <p className="font-medium text-gray-800">
            {taller.experienciaPromedio === '5+' ? 'Más de 5 años'
             : taller.experienciaPromedio === '3-5' ? '3 a 5 años'
             : taller.experienciaPromedio === '1-3' ? '1 a 3 años'
             : 'Menos de 1 año'}
          </p>
        </div>
      )}

      {/* Registro de producción */}
      {taller.registroProduccion && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Registro de producción</p>
          <p className="font-medium text-gray-800">
            {taller.registroProduccion === 'software' ? 'Software'
             : taller.registroProduccion === 'excel' ? 'Excel/planilla'
             : taller.registroProduccion === 'papel' ? 'Papel'
             : 'Sin registro'}
          </p>
        </div>
      )}

      {/* Escalabilidad */}
      {taller.escalabilidad && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Puede escalar</p>
          <p className="font-medium text-gray-800">
            {taller.escalabilidad === 'turno' ? 'Segundo turno'
             : taller.escalabilidad === 'tercerizar' ? 'Tercerización'
             : taller.escalabilidad === 'contratar' ? 'Contratando personal'
             : taller.escalabilidad === 'horas-extra' ? 'Horas extra'
             : 'Sin capacidad de escalar'}
          </p>
        </div>
      )}

      {/* SAM */}
      {(taller.sam ?? 0) > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">SAM ({taller.prendaPrincipal})</p>
          <p className="font-medium text-gray-800">{taller.sam} min</p>
        </div>
      )}

    </div>

    <p className="text-xs text-gray-400 mt-4">
      Esta información es visible para el equipo de la plataforma y organismos del Estado.
      No afecta tu nivel de formalización.
    </p>
  </Card>
)}
```

> Importante: usar `??` para los null-checks de `Int?`. `taller.metrosCuadrados > 0` sin el `??` falla typecheck porque el campo es `number | null`.

---

## 6. Lógica de recomendación de cursos

**Archivo:** `src/app/(taller)/taller/page.tsx`

Reemplazar la query actual de `coleccionesRecomendadas` por lógica en dos dimensiones + fallback, con prioridad explícita (formalización primero, procesos segundo).

### 6.1 Derivar tipos de validación pendientes

Un taller recién creado no tiene filas en `Validacion` — hay que derivar pendientes de la **diferencia** entre la lista hardcodeada de tipos requeridos y los que están `COMPLETADO`:

```ts
import { VALIDACIONES_PLATA, VALIDACIONES_ORO } from '@/compartido/lib/nivel'

// 1. Tipos completados
const completadas = new Set(
  (await prisma.validacion.findMany({
    where: { tallerId: taller.id, estado: 'COMPLETADO' },
    select: { tipo: true },
  })).map(v => v.tipo)
)

// 2. Tipos pendientes = todos los requeridos menos los completados
const tiposPendientes = [...VALIDACIONES_PLATA, ...VALIDACIONES_ORO]
  .filter(t => !completadas.has(t))

// 3. Procesos del taller
const procesosTaller = (taller?.procesos ?? []).map(p => p.procesoId)
```

### 6.2 Dos queries separadas con prioridad y fallback

```ts
// Query 1 — prioridad alta: por formalización pendiente
const porFormalizacion = await prisma.coleccion.findMany({
  where: {
    activa: true,
    formalizacionTarget: { hasSome: tiposPendientes },
    NOT: { certificados: { some: { tallerId: taller.id, revocado: false } } },
  },
  orderBy: { orden: 'asc' },
  take: 3,
})

// Query 2 — prioridad media: por procesos del taller (solo si quedan slots)
const restantes = 3 - porFormalizacion.length
const idsYaIncluidos = porFormalizacion.map(c => c.id)
const porProcesos = restantes > 0
  ? await prisma.coleccion.findMany({
      where: {
        activa: true,
        id: { notIn: idsYaIncluidos },
        procesosTarget: { hasSome: procesosTaller },
        NOT: { certificados: { some: { tallerId: taller.id, revocado: false } } },
      },
      orderBy: { orden: 'asc' },
      take: restantes,
    })
  : []

// Query 3 — fallback: cualquier colección no completada si aún no llegamos a 3
const totalEncontradas = [...porFormalizacion, ...porProcesos]
const coleccionesRecomendadas = totalEncontradas.length < 3
  ? [
      ...totalEncontradas,
      ...(await prisma.coleccion.findMany({
        where: {
          activa: true,
          id: { notIn: totalEncontradas.map(c => c.id) },
          NOT: { certificados: { some: { tallerId: taller.id, revocado: false } } },
        },
        orderBy: { orden: 'asc' },
        take: 3 - totalEncontradas.length,
      })),
    ]
  : totalEncontradas
```

**Si el taller es `null`** (no completó el registro del taller todavía), saltar toda la lógica anterior y usar la query simple existente (`orderBy orden asc, take 3`).

---

## 7. Dashboard sectorial — `/estado/sector`

### 7.1 Archivo nuevo

**Archivo:** `src/app/(estado)/estado/sector/page.tsx`

Server component con queries agregadas sobre datos del wizard:

```ts
export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { Card } from '@/compartido/componentes/ui/card'

export default async function DiagnosticoSectorPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ESTADO') redirect('/unauthorized')

  const [
    distribucionOrganizacion,
    distribucionExperiencia,
    distribucionRegistro,
    distribucionEscalabilidad,
    capacidadTotalSector,
    distribucionZona,
    procesosComunes,
    prendasComunes,
  ] = await prisma.$transaction([
    prisma.taller.groupBy({
      by: ['organizacion'],
      _count: true,
      where: { organizacion: { not: null } },
    }),
    prisma.taller.groupBy({
      by: ['experienciaPromedio'],
      _count: true,
      where: { experienciaPromedio: { not: null } },
    }),
    prisma.taller.groupBy({
      by: ['registroProduccion'],
      _count: true,
      where: { registroProduccion: { not: null } },
    }),
    prisma.taller.groupBy({
      by: ['escalabilidad'],
      _count: true,
      where: { escalabilidad: { not: null } },
    }),
    prisma.taller.aggregate({
      _sum: { capacidadMensual: true },
      _avg: { capacidadMensual: true },
      where: { capacidadMensual: { gt: 0 } },
    }),
    prisma.taller.groupBy({
      by: ['zona'],
      _count: true,
      where: { zona: { not: null } },
    }),
    prisma.tallerProceso.groupBy({
      by: ['procesoId'],
      _count: true,
      orderBy: { _count: { procesoId: 'desc' } },
      take: 5,
    }),
    prisma.tallerPrenda.groupBy({
      by: ['prendaId'],
      _count: true,
      orderBy: { _count: { prendaId: 'desc' } },
      take: 5,
    }),
  ])

  // Resolver nombres de procesos y prendas (el groupBy devuelve solo IDs)
  const topProcesoIds = procesosComunes.map(p => p.procesoId)
  const topPrendaIds  = prendasComunes.map(p => p.prendaId)

  const [nombresProcesos, nombresPrendas] = await Promise.all([
    prisma.procesoProductivo.findMany({
      where: { id: { in: topProcesoIds } },
      select: { id: true, nombre: true },
    }),
    prisma.tipoPrenda.findMany({
      where: { id: { in: topPrendaIds } },
      select: { id: true, nombre: true },
    }),
  ])

  const topProcesosConNombre = procesosComunes.map(p => ({
    nombre: nombresProcesos.find(n => n.id === p.procesoId)?.nombre ?? p.procesoId,
    count: p._count,
  }))

  const topPrendasConNombre = prendasComunes.map(p => ({
    nombre: nombresPrendas.find(n => n.id === p.prendaId)?.nombre ?? p.prendaId,
    count: p._count,
  }))

  const totalTalleres = await prisma.taller.count()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-overpass text-brand-blue">Diagnóstico del sector</h1>
        <p className="text-gray-500 mt-1">Datos productivos agregados de los talleres registrados</p>
        <p className="text-xs text-gray-400 mt-1">
          Basado en el perfil productivo completado por cada taller.
          No refleja la situación de formalización.
          {totalTalleres < 10 && <> · Datos del piloto — {totalTalleres} talleres.</>}
        </p>
      </div>

      {/* Capacidad instalada */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-2xl font-bold text-brand-blue">
            {capacidadTotalSector._sum.capacidadMensual?.toLocaleString('es-AR') ?? 0}
          </p>
          <p className="text-sm text-gray-500">Unidades/mes — capacidad total instalada</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-brand-blue">
            {Math.round(capacidadTotalSector._avg.capacidadMensual ?? 0).toLocaleString('es-AR')}
          </p>
          <p className="text-sm text-gray-500">Unidades/mes — promedio por taller</p>
        </Card>
      </div>

      {/* Organización productiva */}
      <Card title="Organización productiva">
        {/* Barras proporcionales por tipo (linea/modular/completa) */}
      </Card>

      {/* Gestión y registro */}
      <Card title="Gestión y registro">
        {/* Barras: software / excel / papel / ninguno */}
      </Card>

      {/* Escalabilidad */}
      <Card title="Capacidad de escalar">
        {/* Barras por tipo */}
      </Card>

      {/* Procesos más comunes */}
      <Card title="Top 5 procesos productivos">
        <ul className="space-y-1 text-sm">
          {topProcesosConNombre.map(p => (
            <li key={p.nombre} className="flex justify-between">
              <span>{p.nombre}</span>
              <span className="text-gray-500">{p.count} talleres</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Prendas más comunes */}
      <Card title="Top 5 tipos de prenda">
        <ul className="space-y-1 text-sm">
          {topPrendasConNombre.map(p => (
            <li key={p.nombre} className="flex justify-between">
              <span>{p.nombre}</span>
              <span className="text-gray-500">{p.count} talleres</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Distribución por zona */}
      <Card title="Distribución por zona">
        <ul className="space-y-1 text-sm">
          {distribucionZona.map(z => (
            <li key={z.zona ?? 'sin-zona'} className="flex justify-between">
              <span>{z.zona ?? 'Sin zona'}</span>
              <span className="text-gray-500">{z._count} talleres</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
```

> Las barras proporcionales de "Organización", "Gestión y registro" y "Escalabilidad" se renderizan con el mismo patrón que usa `/estado/page.tsx` en "Distribución por nivel" (líneas 120-145). Copiar ese componente y adaptarlo.

### 7.2 Navegación del Estado

El `Header` (`src/compartido/componentes/layout/header.tsx`) ya es `'use client'`, ya usa `usePathname()` y **ya deriva el `activeTab` desde la URL** automáticamente (líneas 60-65). Sólo hay que agregar un item a `tabsByRole.ESTADO`:

```ts
ESTADO: [
  { id: 'dashboard', label: 'Dashboard', href: '/estado' },
  { id: 'sector', label: 'Diagnóstico del sector', href: '/estado/sector' },  // ← nuevo
  { id: 'exportar', label: 'Exportar', href: '/estado/exportar' },
],
```

El `activeTab='dashboard'` hardcodeado en `src/app/(estado)/layout.tsx:21` **ya es ignorado** por el Header (el prop se mezcla con el `usePathname`, pero la derivación por URL gana). Se puede borrar por limpieza, pero no es bloqueante.

---

## 8. Casos borde

- **Taller que no completó el wizard** → sección "Perfil productivo" no aparece en `/taller/perfil` (condición `taller.organizacion !== null`).
- **Taller recién creado sin filas en `Validacion`** → cubierto en §6.1: los pendientes se derivan de la lista hardcodeada menos los `COMPLETADO`, así que un taller BRONCE recién creado tendrá `tiposPendientes = VALIDACIONES_PLATA ∪ VALIDACIONES_ORO` y recibirá recomendaciones de formalización.
- **Sin colecciones con `formalizacionTarget` seteado** → query 1 devuelve 0, query 2 corre, query 3 hace fallback. Se llena con cualquier colección no completada.
- **Dashboard sectorial con pocos talleres (piloto = 3)** → se muestra igual. La nota bajo el H1 indica "Datos del piloto — N talleres" si `totalTalleres < 10`.
- **`hasSome` en arrays vacíos** → Prisma lo maneja retornando false. No matchea nada, lo cual es el comportamiento deseado.
- **`capacidadMensual` del wizard alimenta el directorio** → no se cambia en esta fase. Sigue mostrándose en las cards del directorio y perfil público como hoy. La mesa tripartita decidirá si se reemplaza por un dato auditado.

---

## 9. Criterio de aceptación

- [ ] El wizard ya no envía `puntaje: scoreGeneral` en `handleSave`
- [ ] El paso de resumen del wizard no muestra el "Score General" ni los "Indicadores de Madurez" (las 5 barras)
- [ ] El paso de resumen sigue mostrando "Capacidad", "Procesos seleccionados", "Prendas seleccionadas" y "Badges Desbloqueados"
- [ ] `/taller/perfil` muestra la sección "Perfil productivo" si `taller.organizacion !== null`
- [ ] Los talleres que no completaron el wizard no ven la sección
- [ ] Los cursos recomendados en `/taller` priorizan colecciones que matcheen pasos de formalización pendientes del taller
- [ ] Si el taller es BRONCE recién creado (sin filas en `Validacion`), los cursos de formalización básica aparecen primero
- [ ] `/estado/sector` carga con datos agregados reales y resuelve los nombres de procesos y prendas (no muestra IDs crudos)
- [ ] El item "Diagnóstico del sector" aparece en el Header del rol ESTADO y el tab se marca activo al estar en `/estado/sector`
- [ ] La migración de schema aplica limpio en local y en Supabase
- [ ] Build pasa sin errores de TypeScript (prestar atención a los null-checks con `??`)

---

## 10. Tests (verificación manual)

1. **Fix del bug del puntaje**:
   - Login como taller BRONCE con `puntaje = 30`
   - Completar el wizard → guardar
   - Verificar en DB que `puntaje` sigue siendo `30` (o el que tenga después del último `aplicarNivel`)
2. **Perfil productivo visible**:
   - Login como taller que completó el wizard
   - Ir a `/taller/perfil` → ver sección "Perfil productivo" con los 6 campos
   - Login como taller que no lo completó → la sección no aparece
3. **Recomendaciones priorizan formalización**:
   - Login como taller BRONCE sin validaciones completadas
   - Dashboard `/taller` → primera colección recomendada debe ser "Formalización básica" (col3)
   - Marcar `CUIT_MONOTRIBUTO`, `HABILITACION_MUNICIPAL`, `ART` como COMPLETADO en DB
   - Recargar dashboard → "Formalización básica" ya no debe aparecer; deben subir otras por procesos o fallback
4. **Dashboard sectorial**:
   - Login como ESTADO → navegar al tab "Diagnóstico del sector"
   - Verificar que los 5 procesos y las 5 prendas muestran nombres (no IDs)
   - Verificar que la capacidad total es la suma real de `capacidadMensual > 0` en la DB
5. **Navegación del Estado**:
   - Login como ESTADO, ir a `/estado/sector` → el tab "Diagnóstico del sector" debe estar activo en el Header
   - Click en "Dashboard" y "Exportar" → los otros tabs activan correctamente

---

## Nota evolutiva

Este spec es la fase inicial. En una etapa posterior — cuando la mesa tripartita lo defina — se podrá:

- Agregar un campo `puntajeProductivo Int?` separado al modelo `Taller`, con criterios y pesos acordados
- Usar los datos del wizard para ranking en el directorio según criterios acordados (ej: combinación formalización + capacidad + experiencia)
- Expandir el dashboard sectorial con análisis geográfico, comparativas temporales y alertas por zona
- Revisar si el `capacidadMensual` calculado por el wizard debe reemplazarse por un dato auditado
