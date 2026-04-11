# Spec: Épica Storage y Documentos

**Versión:** v2
**Asignado a:** Gerardo (schema + backend + seed) + Sergio (UI)
**Prioridad:** P1
**Resuelve:** H-02, H-03, H-04, H-05 + bug de dual naming + contradicción bucket privado vs URL pública
**Prerrequisito:** `v2-config-piloto-pre-deploy` ejecutado (bucket `documentos` creado en Supabase)

---

## 1. Contexto

Hay **tres problemas interrelacionados** que este spec cierra juntos:

1. **Dual naming system roto**: el seed usa nombres legibles en español (`'CUIT/Monotributo'`, `'Nómina digital'`) pero el código del taller usa `SCREAMING_SNAKE_CASE` (`'CUIT_MONOTRIBUTO'`, `'LIBRO_SUELDOS'`). Cuando un taller abre `/taller/formalizacion`, el upsert crea filas **duplicadas** con nombres incorrectos. Los talleres del seed terminan con 13-15 validaciones en lugar de 7. Este bug explica H-03 (*"Libro de sueldos digital no aparece en admin"*) y contribuye a H-20 porque `nivel.ts` no reconoce las filas del seed como completadas y recalcula talleres PLATA/ORO como BRONCE.

2. **Ciclo de vida incompleto**: los documentos `COMPLETADO` no tienen link de descarga en el admin (H-04). El motivo de rechazo del tab "Documentos" está hardcodeado en *"Documento ilegible o incorrecto"*.

3. **Bucket privado vs URL pública**: `storage.ts` usa `getPublicUrl()` pero el spec `v2-config-piloto-pre-deploy.md §1` (ya mergeado) configuró el bucket como privado. Las URLs retornadas por `uploadFile` son strings válidos pero **no son accesibles** — al click en el admin, dan 400/401. Este bloqueo **contribuye a H-01** en la parte de "ver documentos pendientes".

**Decisión de nomenclatura**: **Opción B — migrar todo a nombres legibles en español**, alineados con el seed existente. La DB es la fuente de verdad. Alternativas descartadas: Opción A (SCREAMING_SNAKE feo en admin), Opción C (codigo + nombre, más robusta pero requiere más migración, post-piloto).

---

## 2. Decisiones de arquitectura

- **Nomenclatura canónica**: nombres legibles en español, igual que `TipoDocumento.nombre` en el seed actual.
- **Re-seedear la DB** — no hay datos reales, es seguro hacer reset + seed limpio.
- **Eliminar el upsert del render** de `/taller/formalizacion` — mover la creación de validaciones al registro del taller.
- **Bucket `documentos` cambia a PÚBLICO** para el piloto. Este spec **supersede** la decisión de `v2-config-piloto-pre-deploy.md §1` que decía *"privado"*. Motivación: `storage.ts` usa `getPublicUrl()` y cambiar a signed URLs requiere más código + renovación periódica. Para el piloto con datos no sensibles, público es aceptable. Signed URLs se implementará post-piloto cuando haya datos reales.
- **Agregar campos** `label`, `enlaceTramite`, `costoEstimado`, `nivelMinimo`, `orden` al modelo `TipoDocumento` — centraliza toda la info del catálogo en DB, elimina los hardcoded del taller.
- **`CERTIFICACION_AMBIENTAL` se elimina** del checklist — está en el hardcoded del taller pero `nivel.ts` no la conoce, entonces nunca genera puntaje. Bug silencioso. Se remueve del seed y del checklist.
- **`tipoDocumentoId` pasa a obligatorio** (de `String?` a `String`) — fuerza que toda validación apunte a un tipo canónico, elimina el dual-sistema `tipo` libre + FK opcional.

---

## 3. Cambios de schema

**Archivo:** `prisma/schema.prisma`

### 3.1 Ampliar modelo `TipoDocumento`

```prisma
model TipoDocumento {
  id            String      @id @default(cuid())
  nombre        String      @unique              // canónico legible: 'CUIT/Monotributo'
  label         String                           // texto del checklist del taller: 'Registrate en ARCA'
  descripcion   String?
  enlaceTramite String?                          // URL al trámite oficial
  costoEstimado String?                          // 'Gratuito', '$3.500/mes', etc.
  nivelMinimo   NivelTaller                      // BRONCE/PLATA/ORO — en qué nivel se requiere
  requerido     Boolean     @default(true)
  activo        Boolean     @default(true)
  orden         Int         @default(0)          // para ordenar el checklist

  validaciones Validacion[]

  @@map("tipos_documento")
}
```

`NivelTaller` es el enum existente del modelo `Taller`.

### 3.2 Hacer `tipoDocumentoId` obligatorio en `Validacion`

```prisma
model Validacion {
  // ... campos existentes sin cambios ...
  tipoDocumentoId String                         // ← de String? a String (obligatorio)
  tipoDocumento   TipoDocumento @relation(fields: [tipoDocumentoId], references: [id])
  // ... mantener @@unique([tallerId, tipo]) por compatibilidad ...
}
```

### 3.3 Migración — **OBLIGATORIO `migrate reset`**

⚠️ **No usar `migrate dev`**. Los cambios incluyen:

- `TipoDocumento.nivelMinimo NivelTaller` sin default → `migrate dev` falla sobre filas existentes
- `Validacion.tipoDocumentoId String` (de nullable a obligatorio) → `migrate dev` falla sobre filas con `tipoDocumentoId: null`

Ambos se resuelven con un reset que vacía la tabla antes de re-crearla con el seed actualizado:

```bash
# ⚠️ REQUIERE RESET — NOT NULL sobre columnas nuevas sin default
npx prisma migrate reset --force
# El db seed corre automáticamente después del reset, pero si no:
npx prisma db seed
```

**Justificación del reset**: la sección §2 declara que *"no hay datos reales"*. Los únicos datos en la DB del piloto son los 3 talleres del seed + sus validaciones duplicadas del bug de dual naming. El reset elimina todo y deja una base limpia.

Si en algún momento hay datos reales que preservar, la alternativa es:
- Hacer `nivelMinimo NivelTaller?` (nullable) + script SQL de backfill
- Hacer `tipoDocumentoId String?` (nullable) + script de backfill basado en match por `nombre`

Pero **no es el escenario actual** — el spec asume reset limpio.

### 3.4 Actualizar seed — `prisma/seed.ts`

#### (a) Reemplazar la sección de `TipoDocumento` con los 7 tipos canónicos (sin `Certificado ambiental`)

```ts
const tiposDocData = [
  {
    nombre: 'CUIT/Monotributo',
    label: 'Registrate en ARCA',
    descripcion: 'Inscripción en ARCA (ex-AFIP) como Monotributista o Responsable Inscripto',
    enlaceTramite: 'https://www.afip.gob.ar',
    costoEstimado: 'Gratuito',
    nivelMinimo: 'PLATA',
    requerido: true,
    orden: 1,
  },
  {
    nombre: 'Habilitación municipal',
    label: 'Habilita tu local',
    descripcion: 'Permiso de funcionamiento del municipio correspondiente',
    enlaceTramite: null,
    costoEstimado: 'Variable según municipio',
    nivelMinimo: 'PLATA',
    requerido: true,
    orden: 2,
  },
  {
    nombre: 'ART',
    label: 'Asegura a tu equipo',
    descripcion: 'Póliza de Aseguradora de Riesgos del Trabajo vigente',
    enlaceTramite: null,
    costoEstimado: 'Variable según aseguradora',
    nivelMinimo: 'PLATA',
    requerido: true,
    orden: 3,
  },
  {
    nombre: 'Empleados registrados',
    label: 'Registra tus empleados',
    descripcion: 'Constancia de alta temprana de empleados en ARCA',
    enlaceTramite: 'https://www.afip.gob.ar',
    costoEstimado: 'Gratuito',
    nivelMinimo: 'ORO',
    requerido: true,
    orden: 4,
  },
  {
    nombre: 'Habilitación bomberos',
    label: 'Habilitación de bomberos',
    descripcion: 'Certificado de prevención contra incendios',
    enlaceTramite: null,
    costoEstimado: 'Variable',
    nivelMinimo: 'ORO',
    requerido: true,
    orden: 5,
  },
  {
    nombre: 'Plan de seguridad e higiene',
    label: 'Plan de seguridad',
    descripcion: 'Plan firmado por profesional de SyH matriculado',
    enlaceTramite: null,
    costoEstimado: 'Variable según profesional',
    nivelMinimo: 'ORO',
    requerido: true,
    orden: 6,
  },
  {
    nombre: 'Nómina digital',
    label: 'Libro de sueldos digital',
    descripcion: 'Libro de sueldos digital (LSD) o recibos digitales',
    enlaceTramite: null,
    costoEstimado: 'Gratuito',
    nivelMinimo: 'ORO',
    requerido: true,
    orden: 7,
  },
]

// Upsert y capturar los registros creados — necesarios para el post-seed de validaciones faltantes
const tiposDocCreados = await Promise.all(
  tiposDocData.map(td =>
    prisma.tipoDocumento.upsert({
      where: { nombre: td.nombre },
      update: td,
      create: td,
    })
  )
)
```

> **Nota**: la sección de Validacion del seed actual ya usa `nombre` (ej: `'CUIT/Monotributo'`) como `tipo`. Esas líneas no se tocan — siguen igual. Pero **el seed actual es incompleto**: Roberto (BRONCE) tiene solo 4 filas, Graciela (PLATA) tiene 6, Carlos (ORO) tiene 8 incluyendo `'Certificado ambiental'`. Después del fix, los 3 talleres deben tener las 7 filas de los 7 tipos.

#### (b) Post-seed — rellenar validaciones faltantes en cada taller

Agregar al final de la sección de seed de talleres (después de las `createMany` explícitas de validaciones de cada taller):

```ts
// Post-seed: garantizar que cada taller tenga las 7 validaciones.
// Los createMany explícitos de arriba pueden no cubrir las 7 — este loop
// rellena las faltantes con estado NO_INICIADO.
for (const taller of [tallerBronce, tallerPlata, tallerOro]) {
  const existentes = await prisma.validacion.findMany({
    where: { tallerId: taller.id },
    select: { tipo: true },
  })
  const nombresExistentes = new Set(existentes.map(v => v.tipo))
  const faltantes = tiposDocCreados.filter(td => !nombresExistentes.has(td.nombre))

  if (faltantes.length > 0) {
    await prisma.validacion.createMany({
      data: faltantes.map(td => ({
        tallerId: taller.id,
        tipo: td.nombre,
        tipoDocumentoId: td.id,
        estado: 'NO_INICIADO',
      })),
    })
  }
}
```

Resultado esperado:

| Taller | Filas explícitas del seed | Rellenadas por post-seed | Total |
|---|---|---|---|
| Roberto (BRONCE) | 4 | 3 | **7** |
| Graciela (PLATA) | 6 | 1 (`'Nómina digital'`) | **7** |
| Carlos (ORO) | 7 (sin `'Certificado ambiental'`) | 0 | **7** |

Si el seed actual tiene la línea `{ tallerId: tallerOro.id, tipo: 'Certificado ambiental', ... }`, **hay que eliminarla** junto con el cambio de §3.4(a).

---

## 4. Cambios de backend — Gerardo

### Pre-migración: verificación de callers

**Antes de aplicar la migración**, correr:

```bash
grep -rn "prisma\.validacion\.create\|prisma\.validacion\.createMany" src/
```

y verificar que **todas** las llamadas incluyen `tipoDocumentoId` en el payload. Si alguna no lo hace, agregarlo antes de aplicar la migración — el cambio de `tipoDocumentoId: String? → String` rompería cualquier write que no lo provea.

Callers conocidos (al momento de escribir este spec):

1. **Seed** (§3.4) — ya lo setea ✓
2. **Upsert del render de `/taller/formalizacion:99-105`** — se elimina en Acción 3 ✓
3. **Registro nuevo** (Acción 2 de este spec) — lo setea explícitamente ✓

Si el grep encuentra otros callers no listados, agregarles `tipoDocumentoId` antes del merge.

### Acción 1 — Actualizar `nivel.ts` para leer tipos de DB, preservando pureza

**Archivo:** `src/compartido/lib/nivel.ts`

La función `calcularNivelPuro` está deliberadamente marcada como pura (comentario en línea 34 del original). **No reescribirla como async** — extender la interface para recibir los tipos como parámetros.

#### Cambio 1.1 — Extender `DatosTaller`

```ts
export interface DatosTaller {
  verificadoAfip: boolean
  tiposValidacionCompletados: string[]
  numCertificadosActivos: number
  tiposPlata: string[]      // ← nuevo
  tiposOro: string[]        // ← nuevo
}
```

#### Cambio 1.2 — Reescribir `calcularNivelPuro` para usar los nuevos parámetros

```ts
export function calcularNivelPuro(datos: DatosTaller): ResultadoNivel {
  const tiposCompletados = new Set(datos.tiposValidacionCompletados)
  const numValidaciones = datos.tiposValidacionCompletados.length
  const numCertificados = datos.numCertificadosActivos

  // Calcular puntaje (sin cambios)
  let puntaje = 0
  if (datos.verificadoAfip) puntaje += PTS_VERIFICADO_AFIP
  puntaje += numValidaciones * PTS_POR_VALIDACION
  puntaje += numCertificados * PTS_POR_CERTIFICADO
  puntaje = Math.min(puntaje, PUNTAJE_MAX)

  // Determinar nivel usando los parámetros nuevos
  let nivel: NivelTaller = 'BRONCE'

  const tienePlata =
    datos.verificadoAfip &&
    datos.tiposPlata.every((v) => tiposCompletados.has(v)) &&
    numCertificados >= 1

  if (tienePlata) {
    nivel = 'PLATA'

    // Para ORO se requieren TODOS los de PLATA + TODOS los de ORO
    const tieneOro = [...datos.tiposPlata, ...datos.tiposOro].every((v) =>
      tiposCompletados.has(v)
    )
    if (tieneOro) {
      nivel = 'ORO'
    }
  }

  return { nivel, puntaje }
}
```

> **Importante**: la condición de ORO usa `[...tiposPlata, ...tiposOro].every(...)`. Esto replica la semántica del código actual donde `VALIDACIONES_ORO = [...VALIDACIONES_PLATA, ...otros]`. Al cargar de DB con `nivelMinimo === 'ORO'`, solo se traen los 4 tipos específicos de ORO — hay que combinarlos con los 3 de PLATA para validar el nivel superior.

#### Cambio 1.3 — Actualizar `calcularNivel` (async wrapper) para cargar de DB

```ts
export async function calcularNivel(tallerId: string): Promise<ResultadoNivel> {
  const [taller, tiposRequeridos] = await Promise.all([
    prisma.taller.findUnique({
      where: { id: tallerId },
      select: {
        verificadoAfip: true,
        validaciones: {
          where: { estado: 'COMPLETADO' },
          select: { tipo: true },
        },
        certificados: {
          where: { revocado: false },
          select: { id: true },
        },
      },
    }),
    prisma.tipoDocumento.findMany({
      where: { requerido: true, activo: true },
      select: { nombre: true, nivelMinimo: true },
    }),
  ])

  if (!taller) throw new Error(`Taller ${tallerId} no encontrado`)

  const tiposPlata = tiposRequeridos
    .filter(t => t.nivelMinimo === 'PLATA')
    .map(t => t.nombre)
  const tiposOro = tiposRequeridos
    .filter(t => t.nivelMinimo === 'ORO')
    .map(t => t.nombre)

  return calcularNivelPuro({
    verificadoAfip: taller.verificadoAfip,
    tiposValidacionCompletados: taller.validaciones.map((v) => v.tipo),
    numCertificadosActivos: taller.certificados.length,
    tiposPlata,
    tiposOro,
  })
}
```

#### Cambio 1.4 — Eliminar las constantes viejas

```ts
// ELIMINAR:
// export const VALIDACIONES_PLATA = ['CUIT_MONOTRIBUTO', 'HABILITACION_MUNICIPAL', 'ART']
// export const VALIDACIONES_ORO = [...VALIDACIONES_PLATA, 'INSCRIPCION_EMPLEADOR', ...]
```

Los tests de `calcularNivelPuro` (si existen) deben actualizarse para pasar `tiposPlata` y `tiposOro` como parámetros explícitos.

#### Impacto cruzado en `v2-epica-academia.md` (ya mergeado)

El spec de academia prescribe derivar `tiposPendientes` usando `[...VALIDACIONES_PLATA, ...VALIDACIONES_ORO]` menos las completadas. **Al implementar ese spec** (no al modificar el archivo del spec en disco), Sergio debe sustituir ese import por una query a `TipoDocumento`:

```ts
// En /taller/page.tsx donde el spec de academia prescribe la lógica:
const tiposRequeridos = await prisma.tipoDocumento.findMany({
  where: { requerido: true, activo: true },
  select: { nombre: true },
})
const completadas = new Set(
  (await prisma.validacion.findMany({
    where: { tallerId: taller.id, estado: 'COMPLETADO' },
    select: { tipo: true },
  })).map(v => v.tipo)
)
const tiposPendientes = tiposRequeridos
  .map(t => t.nombre)
  .filter(nombre => !completadas.has(nombre))
```

> **No se reescribe el spec de academia** — los specs mergeados son históricos y no se tocan. Al implementar academia, consultar también este spec para cruzar dependencias. Esta nota sirve como pointer.

### Acción 2 — Mover la creación de validaciones al registro del taller

**Archivo:** `src/app/api/auth/registro/route.ts`

Después de crear el taller (localizar el `prisma.taller.create` existente), agregar:

```ts
// Crear las validaciones iniciales del taller basadas en el catálogo actual
const tiposDoc = await prisma.tipoDocumento.findMany({
  where: { activo: true },
  select: { id: true, nombre: true },
})

await prisma.validacion.createMany({
  data: tiposDoc.map(td => ({
    tallerId: nuevoTaller.id,
    tipo: td.nombre,
    tipoDocumentoId: td.id,
    estado: 'NO_INICIADO',
  })),
})
```

Esto garantiza que todo taller recién creado tenga sus 7 filas sin depender del upsert del render.

### Acción 3 — Eliminar el upsert del render en `/taller/formalizacion/page.tsx`

**Archivo:** `src/app/(taller)/taller/formalizacion/page.tsx`

Eliminar las líneas **99-105** del archivo actual:

```ts
// ELIMINAR ENTERO:
for (const tv of tiposValidacion) {
  await prisma.validacion.upsert({
    where: { tallerId_tipo: { tallerId: taller.id, tipo: tv.tipo } },
    create: { tallerId: taller.id, tipo: tv.tipo, estado: 'NO_INICIADO' },
    update: {},
  })
}
```

Las filas ya existen desde el registro (Acción 2) o desde el seed (§3.4).

### Acción 4 — Configurar bucket `documentos` como PÚBLICO

**No requiere cambios de código.** `src/compartido/lib/storage.ts` usa `getPublicUrl()` que funciona correctamente con bucket público.

**Acción operativa**: en Supabase Dashboard → Storage → `documentos` → **Make public**.

> **Supersede explícita**: este spec supersede la decisión de `v2-config-piloto-pre-deploy.md §1` que decía *"Configurar como privado (no público)"*. El bucket `documentos` debe ser **público** para el piloto. Signed URLs se implementará post-piloto cuando haya datos sensibles reales. Si el config-piloto ya se ejecutó con el bucket privado, cambiarlo a público manualmente desde el Dashboard.

---

## 5. Cambios de UI — Sergio

### ⚠️ Antes de arrancar

- [ ] Migración `storage_documentos_v2` mergeada (Gerardo)
- [ ] Seed actualizado y re-ejecutado: `npx prisma migrate reset --force`
- [ ] `nivel.ts` actualizado para leer de DB con `tiposPlata`/`tiposOro` (Gerardo, Acción 1)
- [ ] Bucket `documentos` cambiado a público en Supabase (Acción 4)
- [ ] Grep de callers de `prisma.validacion.create` ejecutado y sin callers rotos

### UI-1 — Reescribir `/taller/formalizacion/page.tsx`

**Archivo:** `src/app/(taller)/taller/formalizacion/page.tsx`

Reemplazar los arrays hardcodeados `tiposValidacion` y `validacionInfo` (líneas 15-67 del original) por una query a DB:

```ts
// Reemplaza los arrays hardcodeados
const tiposDocumento = await prisma.tipoDocumento.findMany({
  where: { activo: true },
  orderBy: { orden: 'asc' },
})

// Cruzar con las validaciones del taller
const validacionesPorNombre = Object.fromEntries(
  validaciones.map(v => [v.tipo, v])
)
```

En el render, usar `tiposDocumento` en lugar del array hardcoded:

```tsx
{tiposDocumento.map(td => {
  const validacion = validacionesPorNombre[td.nombre]
  const estado = validacion?.estado ?? 'NO_INICIADO'
  const status = estadoToStatus[estado] || 'optional'

  return (
    <div key={td.id} className="py-3 first:pt-0 last:pb-0">
      <ChecklistItem
        title={td.label}                           // label humano desde DB
        status={status}
        description={
          estado === 'COMPLETADO'   ? 'Documentación verificada'
        : estado === 'PENDIENTE'    ? 'En revisión por el equipo de PDT'
        : estado === 'VENCIDO'      ? 'Documento vencido — requiere actualización'
        : estado === 'RECHAZADO'    ? `Rechazado: ${validacion?.detalle || 'Revisá la documentación'}`
        :                              td.descripcion
        }
      />
      {estado !== 'COMPLETADO' && (
        <>
          <div className="flex gap-2 mt-2 ml-8">
            {(estado === 'NO_INICIADO' || estado === 'RECHAZADO') && validacion && (
              <UploadButton validacionId={validacion.id} />
            )}
            {td.enlaceTramite && (
              <a href={td.enlaceTramite} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="secondary" icon={<ExternalLink className="w-3 h-3" />}>
                  Ir al trámite
                </Button>
              </a>
            )}
          </div>
          {td.costoEstimado && (
            <div className="mt-2 ml-8 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              {td.descripcion && <p>{td.descripcion}</p>}
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span className="font-medium">Costo: {td.costoEstimado}</span>
                {!td.requerido && (
                  <span className="text-gray-400">(Opcional)</span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
})}
```

Actualizar el denominador del progreso para usar `tiposDocumento.length` (7):

```ts
const total = tiposDocumento.length   // 7 en lugar de 8
const progreso = Math.round((completadas / total) * 100)
```

### UI-2 — Reescribir tab "Formalización" en `/admin/talleres/[id]`

**Archivo:** `src/app/(admin)/admin/talleres/[id]/page.tsx`

#### Cambio 2.1 — Cargar `TipoDocumento` para el mapa de labels

Agregar al bloque de queries al principio del componente (alrededor de la línea 53):

```ts
const tiposDocumento = await prisma.tipoDocumento.findMany({
  where: { activo: true },
  orderBy: { orden: 'asc' },
  select: { nombre: true, label: true },
})
const labelPorNombre = Object.fromEntries(
  tiposDocumento.map(td => [td.nombre, td.label])
)
```

#### Cambio 2.2 — Contador de pendientes para el badge del tab

```ts
const docsConUrlPendientes = taller.validaciones.filter(
  v => v.estado === 'PENDIENTE' && v.documentoUrl
).length
```

#### Cambio 2.3 — Mostrar label humano en el ChecklistItem

```tsx
// ANTES (línea 183):
title={v.tipo.replace(/_/g, ' ')}

// DESPUÉS:
title={labelPorNombre[v.tipo] ?? v.tipo}
```

#### Cambio 2.4 — Mostrar link de documento en TODOS los estados con `documentoUrl`

Reemplazar el bloque condicional actual (líneas 193-208) por:

```tsx
{/* Link del documento visible en cualquier estado si existe URL */}
{v.documentoUrl && (
  <div className="mt-2 ml-8">
    <a
      href={v.documentoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-blue underline text-sm inline-flex items-center gap-1"
    >
      <FileText className="w-3.5 h-3.5" />
      Ver documento
    </a>
  </div>
)}

{/* Acciones solo para PENDIENTE */}
{v.estado === 'PENDIENTE' && v.documentoUrl && (
  <div className="flex gap-2 mt-2 ml-8">
    <form action={aprobarValidacion}>
      <input type="hidden" name="validacionId" value={v.id} />
      <Button size="sm" type="submit">Aprobar</Button>
    </form>
    <form action={rechazarValidacion} className="flex gap-1">
      <input type="hidden" name="validacionId" value={v.id} />
      <input
        type="text"
        name="motivo"
        placeholder="Motivo del rechazo..."
        required
        className="text-xs border border-gray-300 rounded px-2 py-1 w-48"
      />
      <Button size="sm" variant="secondary" type="submit">Rechazar</Button>
    </form>
  </div>
)}
```

Cambios concretos vs versión actual:

- **Link del documento** se muestra para **COMPLETADO, RECHAZADO, VENCIDO y PENDIENTE** (cualquier estado con `documentoUrl`). Antes solo aparecía en PENDIENTE.
- **Input de motivo** pasa a `required` — el admin no puede rechazar sin motivo.
- **Motivo ya no está hardcodeado** en ninguna parte.

#### Cambio 2.5 — Reemplazar tab "Documentos" por "Historial" + actualizar badge del tab Formalización

El tab "Documentos" es 100% redundante con el tab Formalización después del Cambio 2.4 (ambos cubren los pendientes con las mismas acciones). Eliminarlo y reemplazarlo por un tab nuevo **"Historial"** que muestre los logs del taller.

Los tabs quedan:

```ts
const tabs: Array<'formalizacion' | 'historial' | 'actividad'> = ['formalizacion', 'historial', 'actividad']
```

**Actualizar el label del tab Formalización** para mantener el contador de pendientes:

```tsx
{(['formalizacion', 'historial', 'actividad'] as const).map(t => (
  <Link
    key={t}
    href={`/admin/talleres/${id}?tab=${t}`}
    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
      tab === t ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {t === 'formalizacion'
      ? `Formalización${docsConUrlPendientes > 0 ? ` (${docsConUrlPendientes})` : ''}`
      : t === 'historial'
        ? 'Historial'
        : 'Actividad'}
  </Link>
))}
```

El tab "Historial" muestra los logs del taller (VALIDACION_APROBADA, VALIDACION_RECHAZADA, NIVEL_SUBIDO, NIVEL_BAJADO):

```ts
const historialLogs = await prisma.logActividad.findMany({
  where: {
    accion: { in: ['VALIDACION_APROBADA', 'VALIDACION_RECHAZADA', 'NIVEL_SUBIDO', 'NIVEL_BAJADO'] },
    detalles: { path: ['tallerId'], equals: id },
  },
  orderBy: { timestamp: 'desc' },
  take: 30,
  include: { user: { select: { name: true } } },
})
```

```tsx
{tab === 'historial' && (
  <Card>
    <h2 className="font-overpass font-bold text-brand-blue mb-3">Historial del taller</h2>
    {historialLogs.length === 0 ? (
      <p className="text-sm text-gray-500">Sin actividad registrada.</p>
    ) : (
      <div className="space-y-2">
        {historialLogs.map(log => {
          const detalles = log.detalles as {
            nivelAnterior?: string
            nivelNuevo?: string
            motivo?: string
          }
          const descripcion =
            log.accion === 'VALIDACION_APROBADA' ? `${log.user?.name ?? 'Admin'} aprobó una validación`
          : log.accion === 'VALIDACION_RECHAZADA' ? `${log.user?.name ?? 'Admin'} rechazó una validación${detalles.motivo ? ` — ${detalles.motivo}` : ''}`
          : log.accion === 'NIVEL_SUBIDO' ? `Subió de nivel: ${detalles.nivelAnterior} → ${detalles.nivelNuevo}`
          : log.accion === 'NIVEL_BAJADO' ? `Bajó de nivel: ${detalles.nivelAnterior} → ${detalles.nivelNuevo}`
          : log.accion
          return (
            <div key={log.id} className="text-sm border-b border-gray-50 pb-2">
              <span className="text-gray-400">
                {log.timestamp.toLocaleDateString('es-AR')}
              </span>
              <p className="text-gray-700">{descripcion}</p>
            </div>
          )
        })}
      </div>
    )}
  </Card>
)}
```

**Eliminar el bloque del tab "Documentos"** (líneas ~216-248 del original) completamente.

> **Nota coordinación con `v2-log-niveles-bidireccional.md`**: ese spec fixa el bug de `NIVEL_SUBIDO` mal etiquetado. Si se implementa primero este spec (storage), el texto del tab "Historial" va a mostrar correctamente las bajadas como "Bajó de nivel" solo si ya está el fix de `nivel.ts`. Si no, las bajadas pre-fix se muestran con el texto incorrecto de `NIVEL_SUBIDO`. Ambos specs son compatibles, el orden no importa para que ambos funcionen.

---

## 6. Casos borde

- **Taller del seed después del reset** → tiene exactamente 7 validaciones (3 reales del seed completas + 4 del post-seed en NO_INICIADO para BRONCE; y progresiones similares para PLATA/ORO). Sin duplicados.
- **Taller registrado post-merge de este spec** → la Acción 2 del registro crea las 7 filas automáticamente.
- **Taller pre-fix** (hipotético, no aplica al piloto) → después del reset ya no existe. No se implementa fallback en `/taller/formalizacion` porque §2 declara que no hay datos reales a preservar.
- **Admin aprueba una validación del seed** → `aplicarNivel` recalcula con la lógica nueva que lee de DB. El taller Plata seedeado (6 filas COMPLETADO) matchea los 3 tipos PLATA y mantiene el nivel PLATA. El taller Oro matchea los 3 de PLATA + 4 de ORO y mantiene ORO. Sin bajadas fantasma.
- **`CERTIFICACION_AMBIENTAL`** → ya no existe en el schema. Si algún taller real había subido un documento de ese tipo en desarrollo, se pierde con el reset. Aceptado por §2.
- **Documento con `documentoUrl` apuntando al bucket privado** → después del cambio a público (Acción 4), las URLs existentes vuelven a ser accesibles sin cambios. Si el cambio a público se hace **después** de que el bucket tenía datos subidos, Supabase mantiene los paths — solo cambia la ACL.
- **`nivel.ts` leyendo de DB en cada llamada** → trae los 7 tipos cada vez, unos 0.5-2ms extra por cada `calcularNivel`. Para el piloto con volumen bajo es aceptable. Si escala, agregar cache en memoria con TTL corto.
- **Motivo de rechazo vacío** → el input tiene `required`, el navegador lo bloquea. El server action recibe el motivo no vacío y lo persiste en `validacion.detalle`.

---

## 7. Criterio de aceptación

- [ ] `npx prisma migrate reset --force` ejecuta sin errores
- [ ] `npx prisma db seed` crea 7 `TipoDocumento`, cada taller del seed tiene exactamente 7 `Validacion`
- [ ] `CERTIFICACION_AMBIENTAL` no aparece en ninguna vista (taller ni admin)
- [ ] Taller registrado post-merge tiene 7 validaciones creadas automáticamente
- [ ] `/taller/formalizacion` muestra los 7 tipos con labels legibles desde DB
- [ ] `/taller/formalizacion` denominador del progreso = 7
- [ ] Admin `/admin/talleres/[id]` ve los mismos labels que el taller (no "CUIT MONOTRIBUTO" feo)
- [ ] Admin puede ver el link del documento en estados COMPLETADO, RECHAZADO y VENCIDO (no solo PENDIENTE)
- [ ] Motivo de rechazo es un `<input required>`, no hardcodeado
- [ ] Tab "Documentos" eliminado; nuevo tab "Historial" con los logs del taller
- [ ] Badge del tab "Formalización" muestra el contador de pendientes cuando `> 0`
- [ ] `calcularNivel` devuelve el nivel correcto para los 3 talleres del seed (BRONCE/PLATA/ORO) sin bajadas fantasma
- [ ] `calcularNivelPuro` sigue siendo una función pura (recibe `tiposPlata`/`tiposOro` como parámetros, no lee de DB)
- [ ] Grep `prisma\.validacion\.create` confirma que todos los callers pasan `tipoDocumentoId`
- [ ] Bucket `documentos` es público en Supabase prod
- [ ] Build de TypeScript pasa sin errores

---

## 8. Tests (verificación manual)

1. **Re-seed limpio**:
   - `npx prisma migrate reset --force`
   - En Supabase: verificar que hay exactamente 7 filas en `tipos_documento`
   - Verificar que Roberto, Graciela y Carlos tienen exactamente 7 filas cada uno en `validaciones`
2. **Checklist del taller**:
   - Login como Roberto Giménez (BRONCE)
   - Ir a `/taller/formalizacion` → ver 7 items con labels legibles ("Registrate en ARCA", "Habilita tu local", etc.)
   - Verificar que el progreso es `1/7` (solo CUIT completado en el seed)
3. **Registro de taller nuevo**:
   - Registrar un taller nuevo desde `/registro`
   - En Supabase verificar que tiene 7 filas en `validaciones`, todas en `NO_INICIADO`
4. **Admin con labels legibles**:
   - Login como Lucía Fernández (ADMIN)
   - Ir a `/admin/talleres/[graciela_id]` → tab Formalización
   - Verificar que los items muestran "Registrate en ARCA" (no "CUIT MONOTRIBUTO")
5. **Documento aprobado visible (fix H-04)**:
   - Como Graciela, subir un documento a una validación en `NO_INICIADO`
   - Como admin, aprobarla → pasa a `COMPLETADO`
   - Recargar la página del taller → ver que la validación COMPLETADO tiene link "Ver documento"
   - Click en el link → el PDF/imagen abre correctamente (confirma que el bucket es público)
6. **Motivo de rechazo obligatorio**:
   - Como admin, intentar rechazar una validación sin escribir motivo → el navegador bloquea el submit
   - Escribir motivo "Fecha vencida" y rechazar → verificar en DB que `detalle = 'Fecha vencida'`
7. **`calcularNivel` sin bajadas fantasma**:
   - En Supabase, ver el `nivel` y `puntaje` de Graciela antes de cualquier cambio
   - Como admin, aprobar una validación cualquiera de Graciela
   - Verificar que Graciela **sigue siendo PLATA** (no baja a BRONCE como antes del fix)
8. **Tab Historial**:
   - Ir a `/admin/talleres/[id]?tab=historial`
   - Verificar que muestra los logs del taller con textos descriptivos ("aprobó una validación", "subió de nivel", etc.)
9. **Bucket público**:
   - Copiar una URL de `documentoUrl` de Supabase
   - Pegarla en una ventana incógnito sin sesión → el documento debe cargarse
   - Si da 400/401 → el bucket está todavía privado, ir al Dashboard y hacerlo público

---

## 9. Archivos tocados

| Archivo | Cambios | Responsable |
|---|---|---|
| `prisma/schema.prisma` | Ampliar `TipoDocumento`, NOT NULL en `Validacion.tipoDocumentoId` | Gerardo |
| `prisma/seed.ts` | 7 tipos + post-seed de validaciones faltantes | Gerardo |
| `src/compartido/lib/nivel.ts` | Extender `DatosTaller`, reescribir `calcularNivelPuro`, `calcularNivel` async carga de DB | Gerardo |
| `src/app/api/auth/registro/route.ts` | Crear validaciones iniciales al registrar taller | Gerardo |
| `src/app/(taller)/taller/formalizacion/page.tsx` | Eliminar upsert, leer de DB, usar `td.label`/`td.enlaceTramite`/`td.costoEstimado` | Sergio |
| `src/app/(admin)/admin/talleres/[id]/page.tsx` | Label desde DB, link en todos los estados, motivo required, reemplazar tab Documentos por Historial, badge contador | Sergio |
| Supabase Dashboard → Storage → `documentos` | Configurar como público (supersede config-piloto §1) | Gerardo (ops) |

**7 archivos modificados, 0 archivos nuevos**. Una migración con reset obligatorio.
