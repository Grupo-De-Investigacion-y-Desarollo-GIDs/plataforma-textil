# Spec: Tipos de documento gestionados desde la base de datos

- **Versión:** V3
- **Origen:** V3_BACKLOG D-02
- **Asignado a:** Gerardo
- **Prioridad:** Alta — desbloquea F-01 (Tu próximo nivel) y permite al ESTADO ajustar requisitos sin deploy

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG D-01 mergeado (redefinición de roles ESTADO)
- [ ] El modelo `TipoDocumento` ya existe en `prisma/schema.prisma` desde V2

---

## 1. Contexto

Hoy el modelo `TipoDocumento` ya existe en la DB y los talleres consultan sus validaciones desde ahí. Pero hay piezas hardcodeadas en el código que asumen una lista específica de tipos:

1. **Cálculo del puntaje del taller** (`src/compartido/lib/nivel.ts`) — las constantes de puntos son fijas (`PTS_POR_VALIDACION = 10` para todos los tipos) y los umbrales de nivel están hardcodeados (AFIP + certificados >= 1 para PLATA)
2. **Banner contextual del dashboard** (`src/app/(taller)/taller/page.tsx`) — importa constantes `PTS_*` de nivel.ts para mostrar el desglose de puntaje
3. **Seed inicial** — los tipos se crean en `prisma/seed.ts` con datos hardcodeados que solo aplican al ambiente de demo
4. **`/admin/documentos`** (ahora `/estado/documentos` post-D-01) — la UI permite editar tipos pero el campo `puntosOtorgados` no existe, todos suman 10 puntos fijos

El problema concreto: si el ESTADO agrega un tipo nuevo "Constancia de inscripción municipal" desde la UI, los talleres lo ven en su checklist y **sí afecta el cálculo de nivel** (la lógica ya lee tipos de DB dinámicamente), pero todos los documentos dan exactamente 10 puntos y los umbrales para PLATA/ORO son rígidos. No se puede priorizar un documento sobre otro.

Este spec hace que toda la lógica de niveles lea sus umbrales y puntos de la DB, configurables por el ESTADO sin deploy.

---

## 2. Qué construir

1. **Refactor de `aplicarNivel()`** — reemplazar constantes hardcodeadas por valores de DB (ReglaNivel + puntosOtorgados)
2. **Campo nuevo en `TipoDocumento`: `puntosOtorgados`** — explicita cuántos puntos suma cada documento al ser aprobado
3. **Tabla nueva `ReglaNivel`** — define las condiciones para cada nivel (puntos mínimos, documentos requeridos, certificados de academia, etc) de forma configurable
4. **UI ampliada en `/estado/documentos`** — permite editar puntos por documento
5. **UI nueva en `/estado/configuracion-niveles`** — permite editar los criterios de cada nivel
6. **Banner contextual dinámico** en dashboard del taller — calcula qué falta basándose en la configuración real de DB
7. **Migración de datos** — los valores actuales hardcodeados se migran a las nuevas tablas

---

## 3. Modelo de datos

### 3.1 — Modificación de `TipoDocumento`

```prisma
model TipoDocumento {
  id              String      @id @default(cuid())
  nombre          String      @unique
  label           String
  descripcion     String?
  enlaceTramite   String?
  costoEstimado   String?
  nivelMinimo     NivelTaller @default(BRONCE)
  requerido       Boolean     @default(true)
  activo          Boolean     @default(true)
  orden           Int         @default(0)

  // Nuevo en V3
  puntosOtorgados Int         @default(10)  // puntos al estar COMPLETADO
  ordenVisualizacion Int      @default(0)   // orden en la checklist del taller

  validaciones    Validacion[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@map("tipos_documento")
}
```

### 3.2 — Tabla nueva `ReglaNivel`

```prisma
model ReglaNivel {
  id                       String      @id @default(cuid())
  nivel                    NivelTaller @unique  // BRONCE | PLATA | ORO

  // Condiciones para alcanzar este nivel
  puntosMinimos            Int     // ej: 50 para PLATA
  requiereVerificadoAfip   Boolean @default(false)
  certificadosAcademiaMin  Int     @default(0)  // ej: 1 para PLATA

  // Tipos de documento requeridos (relación many-to-many implícita por nivelMinimo en TipoDocumento)
  // No se duplica acá — se infiere consultando TipoDocumento where nivelMinimo <= este nivel y requerido = true

  // Metadata
  descripcion              String? // texto explicativo para UI
  beneficios               String[] @default([])  // ["Aparece más arriba en directorio", "Acceso a marcas grandes"]

  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt

  @@map("reglas_nivel")
}
```

> **Nota:** El enum se llama `NivelTaller` en el schema (no `Nivel`). El campo existente `TipoDocumento.nivelMinimo` ya usa `NivelTaller`. Todo el spec usa `NivelTaller` para consistencia.

### 3.3 — Seed inicial

```typescript
// prisma/seed.ts
await prisma.reglaNivel.createMany({
  data: [
    {
      nivel: 'BRONCE',
      puntosMinimos: 0,
      requiereVerificadoAfip: false,
      certificadosAcademiaMin: 0,
      descripcion: 'Nivel inicial — el taller está registrado en la plataforma',
      beneficios: [
        'Aparece en el directorio público',
        'Recibe pedidos compatibles con su capacidad',
      ],
    },
    {
      nivel: 'PLATA',
      puntosMinimos: 50,
      requiereVerificadoAfip: true,
      certificadosAcademiaMin: 1,
      descripcion: 'El taller demuestra formalización básica y compromiso con la capacitación',
      beneficios: [
        'Aparece más arriba en el directorio',
        'Acceso a pedidos de marcas medianas',
        'Distintivo PLATA visible',
      ],
    },
    {
      nivel: 'ORO',
      puntosMinimos: 100,
      requiereVerificadoAfip: true,
      certificadosAcademiaMin: 0,  // ← arranca en 0 para V3 (ver nota abajo)
      descripcion: 'Taller plenamente formalizado con capacitación avanzada',
      beneficios: [
        'Top del directorio',
        'Acceso a marcas grandes',
        'Invitaciones directas a pedidos premium',
        'Distintivo ORO visible',
      ],
    },
  ],
  skipDuplicates: true,
})
```

> **IMPORTANTE sobre `certificadosAcademiaMin` para ORO:** Hoy la lógica de ORO NO requiere certificados — solo requiere todas las validaciones completadas. Poner `certificadosAcademiaMin: 3` sería un REQUISITO NUEVO que bajaría a todos los talleres ORO existentes con menos de 3 certificados al momento del deploy.
>
> **Decisión:** arrancar V3 con `certificadosAcademiaMin: 0` para ORO, que replica el comportamiento actual. El ESTADO puede subir este valor desde la UI de `/estado/configuracion-niveles` cuando la academia tenga suficientes cursos disponibles. Así el cambio es una decisión institucional consciente, no un efecto colateral del deploy.

---

## 4. Refactor de `aplicarNivel()`

Archivo: `src/compartido/lib/nivel.ts`

### 4.1 — Estado real del código actual

La lógica actual tiene una arquitectura limpia de 3 capas:

1. **`calcularNivelPuro(datos: DatosTaller)`** (líneas 26-59) — pure function, recibe datos ya procesados, retorna `{ nivel, puntaje }`
2. **`calcularNivel(tallerId)`** (líneas 61-99) — fetcha datos de DB, construye `DatosTaller`, llama a `calcularNivelPuro()`
3. **`aplicarNivel(tallerId, userId?)`** (líneas 101-131) — llama a `calcularNivel()`, actualiza DB, loguea cambios

**Lo que ya es dinámico (no cambiar):**

`calcularNivel()` ya lee tipos de documento de DB dinámicamente:

```typescript
// nivel.ts líneas 77-80 — ESTO YA EXISTE
const tiposRequeridos = await prisma.tipoDocumento.findMany({
  where: { requerido: true, activo: true },
  select: { nombre: true, nivelMinimo: true },
})
const tiposPlata = tiposRequeridos.filter(t => t.nivelMinimo === 'PLATA').map(t => t.nombre)
const tiposOro = tiposRequeridos.filter(t => t.nivelMinimo === 'ORO').map(t => t.nombre)
```

Si el ESTADO agrega un tipo nuevo, `calcularNivel()` ya lo detecta. No hay nombres hardcodeados.

**Lo que SÍ está hardcodeado (reemplazar):**

```typescript
// nivel.ts líneas 20-23 — CONSTANTES FIJAS
export const PTS_VERIFICADO_AFIP = 10      // → viene de config o se mantiene como bonus fijo
export const PTS_POR_VALIDACION = 10       // → reemplazar por TipoDocumento.puntosOtorgados
export const PTS_POR_CERTIFICADO = 15      // → podría ir a ReglaNivel o mantener fijo
export const PUNTAJE_MAX = 100             // → eliminar cap o hacerlo configurable

// nivel.ts líneas 41-44 — UMBRALES FIJOS
const tienePlata =
  datos.verificadoAfip &&                  // → ReglaNivel.requiereVerificadoAfip
  datos.tiposPlata.every(completed) &&     // → ya dinámico, OK
  numCertificados >= 1                     // → ReglaNivel.certificadosAcademiaMin

// nivel.ts líneas 50-53 — ORO solo chequea tipos, NO certificados
const tieneOro = [...datos.tiposPlata, ...datos.tiposOro].every(completed)
// ↑ No hay check de certificados para ORO — eso es lógica nueva si se agrega
```

**Callers existentes (6 archivos):**

| Archivo | Qué importa | Impacto del refactor |
|---------|-------------|---------------------|
| `admin/talleres/[id]/page.tsx` | `aplicarNivel` | Ninguno (firma no cambia) |
| `api/validaciones/[id]/route.ts` | `aplicarNivel` | Ninguno (firma no cambia) |
| `api/certificados/route.ts` | `aplicarNivel` | Ninguno (firma no cambia) |
| `api/colecciones/[id]/evaluacion/route.ts` | `aplicarNivel` | Ninguno (firma no cambia) |
| `taller/page.tsx` | `PTS_VERIFICADO_AFIP`, `PTS_POR_VALIDACION`, `PTS_POR_CERTIFICADO`, `PUNTAJE_MAX` | **Actualizar**: reemplazar constantes por datos de DB o eliminar desglose |
| `__tests__/nivel.test.ts` | `calcularNivelPuro`, constantes `PTS_*` | **Reescribir**: 153 líneas de tests necesitan datos de ReglaNivel mockeados |

### 4.2 — Lógica nueva (dinámica)

```typescript
import { prisma } from './prisma'
import type { NivelTaller } from '@prisma/client'

export async function aplicarNivel(tallerId: string, userId?: string): Promise<ResultadoNivel> {
  // Leer nivel anterior
  const tallerActual = await prisma.taller.findUnique({
    where: { id: tallerId },
    select: { nivel: true },
  })
  const nivelAnterior = tallerActual?.nivel ?? 'BRONCE'

  const resultado = await calcularNivel(tallerId)

  await prisma.taller.update({
    where: { id: tallerId },
    data: { nivel: resultado.nivel, puntaje: resultado.puntaje },
  })

  if (nivelAnterior !== resultado.nivel) {
    const orden: Record<string, number> = { BRONCE: 0, PLATA: 1, ORO: 2 }
    const accion = orden[resultado.nivel] > orden[nivelAnterior] ? 'NIVEL_SUBIDO' : 'NIVEL_BAJADO'
    logActividad(accion, userId, { tallerId, nivelAnterior, nivelNuevo: resultado.nivel })
  }

  return resultado
}

async function calcularNivel(tallerId: string): Promise<ResultadoNivel> {
  // 3 queries en paralelo (reglas y tipos se cachean con TTL 5 min)
  const [reglas, taller, todosLosTipos] = await Promise.all([
    getReglasNivel(),
    prisma.taller.findUniqueOrThrow({
      where: { id: tallerId },
      include: {
        validaciones: {
          where: { estado: 'COMPLETADO' },
          include: { tipoDocumento: { select: { id: true, puntosOtorgados: true } } },
        },
        certificados: { where: { revocado: false } },
      },
    }),
    getTiposRequeridos(),
  ])

  // Calcular puntos sumando puntosOtorgados de cada validación COMPLETADO
  const puntos = taller.validaciones.reduce(
    (sum, v) => sum + v.tipoDocumento.puntosOtorgados,
    0
  ) + (taller.verificadoAfip ? 10 : 0)  // bonus AFIP se mantiene fijo

  const certificados = taller.certificados.length
  const tiposCompletados = new Set(taller.validaciones.map(v => v.tipoDocumentoId))

  // Evaluar reglas de mayor a menor — el primer match gana
  for (const regla of reglas) {
    const cumplePuntos = puntos >= regla.puntosMinimos
    const cumpleAfip = !regla.requiereVerificadoAfip || taller.verificadoAfip
    const cumpleCertificados = certificados >= regla.certificadosAcademiaMin

    // Filtrar tipos requeridos para este nivel EN MEMORIA (no query por regla)
    const niveles = nivelesIncluyenHasta(regla.nivel)
    const tiposRequeridos = todosLosTipos.filter(t => niveles.includes(t.nivelMinimo))
    const cumpleDocumentos = tiposRequeridos.every(t => tiposCompletados.has(t.id))

    if (cumplePuntos && cumpleAfip && cumpleCertificados && cumpleDocumentos) {
      return { nivel: regla.nivel, puntaje: puntos }
    }
  }

  return { nivel: 'BRONCE', puntaje: puntos }
}

// Helper: dado nivel ORO, retorna ['BRONCE', 'PLATA', 'ORO']
function nivelesIncluyenHasta(nivel: NivelTaller): NivelTaller[] {
  if (nivel === 'BRONCE') return ['BRONCE']
  if (nivel === 'PLATA') return ['BRONCE', 'PLATA']
  return ['BRONCE', 'PLATA', 'ORO']
}
```

> **Nota:** la query de `tiposRequeridos` se ejecuta UNA VEZ fuera del loop (via `getTiposRequeridos()` con cache) y se filtra en memoria con `.filter()`. Esto reduce de 5-7 queries a 3 (reglas cacheadas + taller + tipos cacheados), y en la hot path solo queda 1 query (taller) porque reglas y tipos tienen TTL de 5 minutos.

### 4.3 — Helper para "qué falta para el próximo nivel"

Función nueva en el mismo archivo:

```typescript
export interface ProximoNivelInfo {
  nivelActual: NivelTaller
  nivelProximo: NivelTaller | null  // null si ya es ORO
  puntosActuales: number            // puntaje actual del taller
  puntosObjetivo: number            // puntosMinimos de la ReglaNivel del próximo nivel
  puntosFaltantes: number           // puntosObjetivo - puntosActuales
  documentosFaltantes: {
    id: string
    nombre: string
    nivelMinimo: NivelTaller
    puntos: number
    requerido: boolean              // true = requerido para el nivel, false = opcional (solo suma puntos)
  }[]
  requiereAfip: boolean
  certificadosFaltantes: number
  beneficiosProximoNivel: string[]
}

export async function calcularProximoNivel(tallerId: string): Promise<ProximoNivelInfo> {
  // ... lee taller y reglas, devuelve info detallada
  // Esta función la consume el banner contextual del dashboard (F-01)
}
```

> **Nota F-01:** los campos `puntosActuales`, `puntosObjetivo` y `documentosFaltantes[].requerido` fueron agregados por dependencia con F-01 (proximo-nivel-dashboard). F-01 los consume para la barra de progreso y para distinguir documentos requeridos de opcionales en la UI. Confirmado en commit 14813b2.

---

## 5. UI de configuración

### 5.1 — `/estado/documentos` (existente, ampliada)

Tab existente: lista de TipoDocumento con CRUD básico. Agregar:

- Columna **Puntos** (editable)
- Columna **Orden** (editable, drag & drop)
- Filtro por nivel mínimo

### 5.2 — `/estado/configuracion-niveles` (nuevo)

Página nueva con un card por nivel (BRONCE, PLATA, ORO):

Cada card muestra editable:
- Puntos mínimos
- ¿Requiere verificación AFIP? (toggle)
- Certificados de academia mínimos (input numérico)
- Descripción (textarea)
- Beneficios (lista editable)

**Preview de impacto (obligatorio):** antes de guardar, la UI ejecuta una query que cuenta cuántos talleres se verían afectados. Si el cambio bajaría talleres de nivel, muestra:

> "Con esta configuración, **X talleres** que actualmente son PLATA pasarían a BRONCE. ¿Confirmar?"

El conteo se calcula server-side con un endpoint `POST /api/estado/configuracion-niveles/preview` que evalúa las reglas propuestas contra el estado actual de todos los talleres sin aplicar cambios.

Al guardar, se invalidan los caches y la próxima evaluación de niveles usa los nuevos valores.

### 5.3 — Vista taller (sin cambios estructurales)

El dashboard del taller (`/taller`) ya muestra el banner contextual desde V2. Lo que cambia es **la fuente de la información**: ahora viene de `calcularProximoNivel()` que lee dinámicamente, no de constantes.

El dashboard actualmente importa `PTS_VERIFICADO_AFIP`, `PTS_POR_VALIDACION`, `PTS_POR_CERTIFICADO`, `PUNTAJE_MAX` de nivel.ts (línea 9-13 de `taller/page.tsx`). Estas constantes se eliminan — el desglose de puntaje pasa a calcularse desde los datos de DB (cada tipo con su `puntosOtorgados`).

El usuario no nota la diferencia visualmente, pero ahora si el ESTADO modifica los criterios, el banner del taller refleja los nuevos requisitos sin deploy.

---

## 6. Migración de datos

### 6.1 — Migración del schema

```bash
npx prisma migrate dev --name v3_tipos_documento_y_reglas_nivel
```

Genera dos cambios:
- ALTER TABLE para agregar `puntosOtorgados` y `ordenVisualizacion` a `TipoDocumento`
- CREATE TABLE para `ReglaNivel`

### 6.2 — Backfill de `puntosOtorgados`

El campo se agrega con `@default(10)`, así que la migración setea todos los tipos existentes a 10 (valor actual equivalente a la constante `PTS_POR_VALIDACION`).

Para diferenciar por nivel, **agregar SQL al final del archivo `migration.sql` generado por Prisma** (antes de correr `prisma migrate deploy`):

```sql
-- Backfill: ajustar puntos según nivel mínimo
UPDATE tipos_documento SET "puntosOtorgados" = 15 WHERE "nivelMinimo" = 'PLATA';
UPDATE tipos_documento SET "puntosOtorgados" = 20 WHERE "nivelMinimo" = 'ORO';
-- BRONCE queda en 10 (default de la migración)
```

Esto corre exactamente 1 vez como parte de la migración, sin scripts separados. Es idempotente y auditado en el historial de migraciones de Prisma.

### 6.3 — Backfill de `ReglaNivel`

Las 3 filas de `ReglaNivel` van en el seed (`prisma/seed.ts`) con `createMany({ skipDuplicates: true })` como se muestra en sección 3.3. El seed es idempotente — si las filas ya existen, no se duplican.

---

## 7. Casos borde

- **Cambio de regla afecta talleres existentes** — si ESTADO sube el mínimo de PLATA de 50 a 60 puntos, los talleres que estaban en PLATA con 55 puntos **bajan a BRONCE en la próxima evaluación**. Hay un detalle importante sobre el timing:

  **El cambio NO es instantáneo.** `aplicarNivel()` se ejecuta solo cuando hay un trigger: ESTADO aprueba/rechaza/revoca validación, se emite/revoca un certificado, o un taller completa una evaluación de academia. Esto significa que los talleres bajan de nivel gradualmente a medida que se disparan estos eventos.

  **Escenario confuso:** ESTADO sube el mínimo de PLATA y después aprueba un documento de un taller que estaba en PLATA con puntos insuficientes. La aprobación del documento dispara `aplicarNivel()`, que usa las nuevas reglas y **baja al taller de nivel**. Para el taller, la acción fue positiva (documento aprobado) pero el resultado fue negativo (bajó de nivel). Esto es correcto pero confuso.

  **Mitigación:**
  1. La UI de `/estado/configuracion-niveles` muestra preview de impacto ANTES de guardar (ver sección 5.2)
  2. Después de cambiar reglas, ESTADO puede correr `npx tsx tools/recalcular-niveles.ts` para aplicar el cambio a todos los talleres de una vez, en vez de que sea goteo
  3. La opción `--dry-run` del script permite ver el impacto antes de ejecutar

- **Tipo de documento desactivado** — si ESTADO desactiva un tipo, las validaciones existentes mantienen sus puntos pero el tipo no se pide a nuevos talleres. La función `aplicarNivel` solo cuenta tipos `activo: true` en `tiposRequeridos`.

- **Documento opcional con puntos** — un tipo con `requerido: false` pero `puntosOtorgados: 5` da puntos al taller que lo presenta voluntariamente, pero su ausencia no impide subir de nivel. El cálculo de puntos suma todos los completados, sin importar si son requeridos.

- **Regla de nivel sin documentos asociados** — si ESTADO crea una regla pero no marca ningún `TipoDocumento` con ese `nivelMinimo`, la condición de documentos es trivialmente cierta (el `every()` sobre array vacío retorna `true`). El nivel se basa solo en puntos, AFIP y certificados.

- **Performance del cálculo** — `aplicarNivel()` hace 3 queries en paralelo (taller + reglas cacheadas + tipos cacheados). Con cache caliente, solo 1 query (taller). Aceptable para la escala del piloto (~25 talleres).

- **Talleres pre-V3 con nivel asignado** — la primera ejecución de `aplicarNivel()` con la nueva lógica puede recalcular niveles. Si algún taller tenía un nivel inconsistente con su data real, se ajusta. **Importante:** correr el recálculo en bloque después del deploy con `npx tsx tools/recalcular-niveles.ts --dry-run` primero para ver impacto, y luego sin flag para aplicar.

- **Impacto de la migración en talleres ORO** — el seed arranca con `certificadosAcademiaMin: 0` para ORO (replica el comportamiento actual). Si se hubiera puesto 3, todos los talleres ORO con menos de 3 certificados habrían bajado de nivel al desplegar. Esta decisión permite que el ESTADO suba el requisito cuando la academia tenga suficientes cursos, como decisión institucional consciente.

---

## 8. Prescripciones técnicas

### 8.1 — Cache de reglas y tipos

```typescript
// src/compartido/lib/nivel.ts
import type { ReglaNivel, TipoDocumento, NivelTaller } from '@prisma/client'

const cacheReglas = new Map<string, { data: ReglaNivel[]; expira: number }>()
const cacheTipos = new Map<string, { data: TipoDocumento[]; expira: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000  // 5 minutos

async function getReglasNivel(): Promise<ReglaNivel[]> {
  const cached = cacheReglas.get('all')
  if (cached && cached.expira > Date.now()) return cached.data

  const data = await prisma.reglaNivel.findMany({
    orderBy: { puntosMinimos: 'desc' }
  })
  cacheReglas.set('all', { data, expira: Date.now() + CACHE_TTL_MS })
  return data
}

async function getTiposRequeridos(): Promise<TipoDocumento[]> {
  const cached = cacheTipos.get('all')
  if (cached && cached.expira > Date.now()) return cached.data

  const data = await prisma.tipoDocumento.findMany({
    where: { activo: true, requerido: true }
  })
  cacheTipos.set('all', { data, expira: Date.now() + CACHE_TTL_MS })
  return data
}

export function invalidarCacheNivel() {
  cacheReglas.clear()
  cacheTipos.clear()
}
```

Llamar `invalidarCacheNivel()` desde:
- `PUT /api/estado/configuracion-niveles/[id]`
- `PUT /api/tipos-documento`
- `POST /api/tipos-documento`

### 8.2 — Script de recálculo

Archivo nuevo: `tools/recalcular-niveles.ts`

Ejecutar con: `npx tsx tools/recalcular-niveles.ts [--dry-run]`

Lee `DATABASE_URL` de `.env` (no `.env.local`). Puede apuntar a producción o preview según lo que esté configurado en `.env`.

```typescript
import { PrismaClient, NivelTaller } from '@prisma/client'

const prisma = new PrismaClient()
const dryRun = process.argv.includes('--dry-run')

async function main() {
  if (dryRun) console.log('=== DRY RUN — no se aplican cambios ===\n')

  const talleres = await prisma.taller.findMany({
    select: { id: true, nombre: true, nivel: true },
  })

  // Obtener reglas y tipos
  const reglas = await prisma.reglaNivel.findMany({ orderBy: { puntosMinimos: 'desc' } })
  const tiposRequeridos = await prisma.tipoDocumento.findMany({
    where: { activo: true, requerido: true },
  })

  let cambios = 0
  for (const taller of talleres) {
    const nuevoNivel = await evaluarTaller(taller.id, reglas, tiposRequeridos)
    if (nuevoNivel !== taller.nivel) {
      console.log(`${taller.nombre}: ${taller.nivel} → ${nuevoNivel}`)
      if (!dryRun) {
        await prisma.taller.update({
          where: { id: taller.id },
          data: { nivel: nuevoNivel },
        })
      }
      cambios++
    }
  }

  console.log(`\nTotal: ${talleres.length} talleres revisados, ${cambios} cambios${dryRun ? ' (no aplicados)' : ''}`)
  await prisma.$disconnect()
}

// evaluarTaller() replica la lógica de calcularNivel() inline
// para no depender de imports con path aliases de src/
async function evaluarTaller(
  tallerId: string,
  reglas: ReglaNivel[],
  todosLosTipos: TipoDocumento[]
): Promise<NivelTaller> {
  // ... misma lógica que calcularNivel() pero con PrismaClient local
}

main().catch(console.error)
```

> **Nota:** El script NO importa de `src/compartido/lib/nivel.ts` porque eso requiere resolver path aliases de TypeScript. En su lugar, inlinea la lógica de evaluación. Esto es intencional — el script debe ser autocontenido para ejecutar contra cualquier ambiente.

---

## 9. Criterios de aceptación

- [ ] Migración `v3_tipos_documento_y_reglas_nivel` aplicada sin errores
- [ ] Backfill SQL en el migration.sql asigna puntos diferenciados por nivel (10/15/20)
- [ ] Tabla `ReglaNivel` creada con 3 registros (BRONCE, PLATA, ORO) desde el seed
- [ ] ORO arranca con `certificadosAcademiaMin: 0` (replica V2, no rompe talleres existentes)
- [ ] Campo `puntosOtorgados` agregado a `TipoDocumento`
- [ ] `aplicarNivel()` refactorizada: lee umbrales de `ReglaNivel`, puntos de `puntosOtorgados` — sin constantes hardcodeadas
- [ ] `calcularNivel()` ejecuta 3 queries en paralelo (1 con cache caliente), tipos se filtran en memoria sin N+1
- [ ] Constantes `PTS_*` eliminadas de nivel.ts
- [ ] `taller/page.tsx` actualizado para no depender de constantes eliminadas
- [ ] `nivel.test.ts` reescrito con datos de ReglaNivel mockeados
- [ ] Helper `calcularProximoNivel()` creado y testeado
- [ ] UI `/estado/documentos` muestra campo "Puntos" editable
- [ ] UI `/estado/configuracion-niveles` permite editar criterios de cada nivel
- [ ] UI muestra preview de talleres afectados antes de guardar cambio de regla
- [ ] Cache con TTL 5 min implementado e invalidado al guardar
- [ ] Script `tools/recalcular-niveles.ts` funcional con flag `--dry-run`
- [ ] Banner contextual del taller usa `calcularProximoNivel()` (no constantes)
- [ ] Build sin errores de TypeScript

---

## 10. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | Taller con 50 pts + AFIP + 1 cert sube a PLATA | Login como taller, verificar nivel | QA |
| 2 | ESTADO sube mínimo PLATA a 60 → talleres con 55 pts bajan a BRONCE | Editar regla, ejecutar recálculo, verificar | QA |
| 3 | ESTADO agrega tipo nuevo con 20 pts → talleres reciben puntos al aprobarlo | Crear tipo, aprobar para taller, verificar puntos | QA |
| 4 | Banner del taller refleja regla nueva sin deploy | Editar regla, login como taller en cache renovado | QA |
| 5 | aplicarNivel ejecuta en menos de 200ms | Logs de Vercel, medir | DEV |
| 6 | Cache se invalida al guardar cambio en /estado/configuracion-niveles | Editar y verificar fetch | DEV |
| 7 | Tipo desactivado no se pide a nuevos talleres | Desactivar, ver checklist de taller nuevo | QA |
| 8 | Puntos por tipo se suman correctamente (10 BRONCE, 15 PLATA, 20 ORO) | Verificar matemáticas con tipos mixtos | DEV |
| 9 | Talleres pre-V3 mantienen su nivel después de migración (dry-run) | Snapshot antes y después | DEV |
| 10 | calcularProximoNivel devuelve documentosFaltantes correcto | Test unit con varios escenarios | DEV |
| 11 | Preview de impacto muestra conteo correcto de talleres afectados | Cambiar regla, verificar conteo antes de guardar | QA |
| 12 | Script --dry-run no aplica cambios | Correr dry-run, verificar DB sin cambios | DEV |

---

## 11. Validación de dominio (perfiles interdisciplinarios)

**Politólogo:**
- ¿Permitir al ESTADO ajustar criterios de niveles refleja correctamente la división de poderes en política pública?
- ¿La transparencia de los criterios (visible para el taller) genera confianza institucional?

**Economista:**
- ¿Los puntos asignados a cada documento generan incentivos correctos? (ej: monotributo da más puntos que constancia municipal)
- ¿La estructura de puntos motiva a los talleres a completar más documentos voluntariamente?

**Sociólogo:**
- ¿El taller entiende la relación entre "aprobar este documento" y "subir de nivel"?
- ¿Los beneficios mostrados por nivel son comprensibles y motivadores?

**Contador:**
- ¿Los puntos otorgados por cada tipo de documento reflejan correctamente su importancia fiscal?
- ¿La configurabilidad permite adaptarse a cambios normativos (ej: nueva monotributo)?

---

## 12. Impacto en otros specs

- **F-01 (proximo-nivel-dashboard)** — depende de este spec. Usa `calcularProximoNivel()` para mostrar el banner del taller con info dinámica.
- **D-01** — este spec asume que las rutas ya están en `/estado/`, no en `/admin/`. Confirma que `/estado/documentos` y `/estado/configuracion-niveles` van bajo el rol ESTADO.

---

## 13. Referencias

- V3_BACKLOG → D-02
- V2 issue #87 — donde Sergio reportó "tiene puntos pero no cambia a PLATA" (resuelto con banner contextual, pero la lógica sigue rígida)
- V2 issue #110 — donde se aclaró que el nivel cambia automáticamente al aprobar (V3 lo hace configurable)
