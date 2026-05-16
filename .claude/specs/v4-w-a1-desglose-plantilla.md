# SPEC W-A1: Desglose de plantilla por categoría de oficio textil

> **Spec V4** — Sigue la metodología V4 definida en `.claude/METODOLOGIA_V4.md`.
> 
> **Importante:** este spec amplía el alcance original de W-A1 del MASTER_V4 (que era solo cambio de labels, 1h). Decisión tomada durante redacción: hacer refactor completo a desglose por categoría para tener información sectorial real, no solo un valor agregado.

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **Tipo** | refactor de schema + UX del formulario taller + reporte sectorial |
| **Bloque** | W-A (formulario taller) |
| **Categoría** | MVP no negociable |
| **Estimación** | 4-5h |
| **Riesgo** | Medio (cambio de schema + UX + reporte) |
| **Dependencias** | Fase 0 ✅ (DB operativa) |
| **Branch** | `feature/v4-w-a1-desglose-plantilla` |
| **Validación sectorial** | Aplica — Sofía propuso la nomenclatura |
| **Perspectivas relevantes** | Sectorial (Sofía), Sociólogo (lenguaje del oficio) |
| **Autor** | Gerardo Breard |
| **Fecha de creación** | 2026-05-16 |
| **Aprobado por** | Pendiente — Sergio (UI), Sofía (nomenclatura) |
| **Issue GitHub vinculado** | #297, #298 |
| **PR vinculado** | Pendiente |

---

## 2. Contexto

### Por qué existe este spec

El formulario actual del taller tiene una pregunta de "experiencia promedio del equipo" que es un solo valor agregado para todo el taller (`<1`, `1-3`, `3-5`, `5+` años). Este diseño tiene 3 problemas:

1. **Vocabulario genérico:** habla en años abstractos, no en términos del oficio textil real (aprendices, oficiales, etc.)
2. **Pérdida de información:** un taller con 5 aprendices + 3 oficiales + 2 oficial calificados responde simplemente "promedio 3-5 años", perdiendo el detalle de la composición real
3. **Inutilidad sectorial:** el reporte para ESTADO/OIT no puede decir "el sector tiene X% de oficiales calificados" porque no se mide

Adicionalmente, el código actual tiene:
- **Datos legacy sucios** en producción/dev (2 talleres con `alta`/`media`, valores de un esquema anterior)
- **Código muerto** (input "¿Cuánto tiempo lleva tu trabajador más antiguo?" que se renderiza pero no se guarda)
- **Sin validación** server-side de los valores aceptados

### Qué resuelve

Después de implementar este spec:

1. **Vocabulario del oficio textil real:** Aprendices / Medio oficial / Oficial / Oficial calificado (propuesta de Sofía, alineada con master 3.15)
2. **Desglose por categoría:** cada taller indica CUÁNTOS trabajadores tiene en cada nivel de oficio
3. **Reporte sectorial enriquecido:** ESTADO/OIT pueden ver distribución real de la plantilla del sector
4. **Datos limpios:** los valores legacy se eliminan, el código muerto desaparece
5. **Mejor matching futuro:** marcas pueden filtrar talleres por capacidad de confección compleja (cantidad de oficial calificados)

### Documentación de referencia

- `MASTER_V4.md` sección 3.15 (Nomenclatura del oficio textil)
- `docs/Diseño/sofia/Comentarios_plataforma_redtextil.docx` (propuesta original de Sofía, sección "Experiencia promedio del equipo")
- Issues GitHub #297, #298

---

## 3. Validación interdisciplinaria

### Perspectivas relevantes

**Politólogo:** N/A — no toca políticas públicas.

**Sociólogo:** APLICA.
- Observación: el lenguaje "Novato/Junior/Intermedio/Experto" del esquema actual es lenguaje corporativo genérico (estilo SaaS B2B), no del oficio textil.
- Decisión tomada: usar nomenclatura del oficio real (Aprendices, Medio oficial, Oficial, Oficial calificado), siguiendo principio "institucional con cercanía, no SaaS B2B" del master.

**Economista:** N/A — no afecta modelo económico.

**Contador:** N/A — no afecta normativa fiscal.

**Sectorial:** APLICA FUERTE.
- Observación: Sofía documentó la nomenclatura correcta en su propuesta. El cuadro actual está mal estructurado.
- Decisión tomada: adoptar exactamente la propuesta de Sofía (4 categorías con sus rangos de años entre paréntesis para ayuda visual).
- Validación futura: Sergio aprobará el diseño visual del nuevo formulario antes de mergear.

---

## 4. Qué construir

### 4.1 Modelo de datos

#### Nuevo enum

```prisma
enum CategoriaOficioTextil {
  APRENDIZ              // < 1 año
  MEDIO_OFICIAL         // 1-3 años
  OFICIAL               // 3-5 años
  OFICIAL_CALIFICADO    // > 5 años
}
```

#### Nueva tabla relacional

```prisma
model TallerPlantilla {
  id        String                @id @default(cuid())
  tallerId  String
  categoria CategoriaOficioTextil
  cantidad  Int                   @default(0)
  createdAt DateTime              @default(now())
  updatedAt DateTime              @updatedAt

  taller    Taller                @relation(fields: [tallerId], references: [id], onDelete: Cascade)

  @@unique([tallerId, categoria])
  @@index([tallerId])
  @@map("taller_plantilla")
}
```

**Decisiones de diseño:**

- **`@@unique([tallerId, categoria])`:** un taller solo puede tener UNA fila por categoría (evita duplicados)
- **`onDelete: Cascade`:** si se borra el taller, se borran sus filas de plantilla
- **`cantidad: Int @default(0)`:** permite registrar 0 trabajadores de una categoría (taller solo con aprendices y oficiales, sin medio oficiales)
- **`@@index([tallerId])`:** optimiza queries del perfil y del reporte sectorial

#### Modificación del modelo Taller

```prisma
model Taller {
  // ... campos existentes

  // ELIMINAR:
  // experienciaPromedio String?  ← se elimina

  // AGREGAR:
  plantilla TallerPlantilla[]
}
```

#### Migración de datos existentes

Estrategia: los 4 talleres con datos actuales **NO se migran** (todos a 0). Razones:
- 2 de los 4 tienen valores legacy inválidos (`alta`, `media`)
- Los otros 2 con `3-5` no tienen información sobre cantidad real por categoría
- Forzar re-completar garantiza datos limpios

**SQL de migración:**

```sql
-- 1. Eliminar columna experienciaPromedio
ALTER TABLE "talleres" DROP COLUMN "experienciaPromedio";

-- 2. Crear enum
CREATE TYPE "CategoriaOficioTextil" AS ENUM (
  'APRENDIZ', 'MEDIO_OFICIAL', 'OFICIAL', 'OFICIAL_CALIFICADO'
);

-- 3. Crear tabla
CREATE TABLE taller_plantilla (...);

-- 4. NO insertar datos para talleres existentes (queda vacío hasta que re-completen)
```

### 4.2 UX del formulario

#### Pantalla actual (a reemplazar)

```
Paso 4 del wizard:

¿Cuánta experiencia tiene tu equipo?
○ Menos de 1 año (Novato)
○ 1-3 años (Junior)
○ 3-5 años (Intermedio)
○ Más de 5 años (Experto)

¿Cuánto tiempo lleva tu trabajador más antiguo? [input numérico]  ← código muerto, eliminar
```

#### Pantalla nueva

```
Paso 4 del wizard:

¿Cómo se compone tu equipo?

Indicá cuántas personas tenés en cada categoría del oficio textil:

┌─────────────────────────────────────────────────────────┐
│ Aprendices                                              │
│ Menos de 1 año de experiencia                           │
│                                          [  __  ] personas │
├─────────────────────────────────────────────────────────┤
│ Medio oficial                                           │
│ 1 a 3 años de experiencia                               │
│                                          [  __  ] personas │
├─────────────────────────────────────────────────────────┤
│ Oficial                                                 │
│ 3 a 5 años de experiencia                               │
│                                          [  __  ] personas │
├─────────────────────────────────────────────────────────┤
│ Oficial calificado                                      │
│ Más de 5 años de experiencia                            │
│                                          [  __  ] personas │
└─────────────────────────────────────────────────────────┘

Total: 0 personas
```

**Características:**
- Cada categoría es un input numérico independiente
- Default: 0 (vacío visual, pero almacenado como 0)
- Contador de total automático debajo
- Sin validación cruzada con `cantidadTrabajadores` general (independiente)
- Validación: cada cantidad debe ser ≥ 0 (no negativos)
- Texto auxiliar: "Si no tenés trabajadores de alguna categoría, dejá en 0"

### 4.3 Vista del perfil del taller

#### Pantalla actual

```
Experiencia promedio del equipo: 3-5 años (Intermedio)
```

#### Pantalla nueva

```
Composición del equipo:

  Aprendices:           5 personas
  Medio oficial:        3 personas
  Oficial:              2 personas
  Oficial calificado:   1 persona

  Total: 11 personas
```

Si todos están en 0 o no completó el desglose:

```
Composición del equipo: pendiente de completar
```

### 4.4 Reporte sectorial (ESTADO)

#### Vista actual

```
Gráfico de barras: "Experiencia promedio del equipo"

  Menos de 1 año:    ▓▓▓▓▓░░░░ 25%
  1-3 años:          ▓▓▓▓▓▓▓▓░ 40%
  3-5 años:          ▓▓▓▓░░░░░ 20%
  Más de 5 años:     ▓▓▓░░░░░░ 15%

(Cuenta talleres, no trabajadores)
```

#### Vista nueva

```
Distribución de la plantilla del sector

  Aprendices:           ▓▓▓▓▓▓▓░░ 35% (X personas)
  Medio oficial:        ▓▓▓▓▓░░░░ 28% (X personas)
  Oficial:              ▓▓▓▓░░░░░ 22% (X personas)
  Oficial calificado:   ▓▓▓░░░░░░ 15% (X personas)

  Total: X personas en N talleres con plantilla declarada

Nota: incluye solo talleres que completaron el desglose. 
      N de X talleres totales lo completaron.
```

**Decisiones de diseño:**

- Métrica nueva: **cantidad de trabajadores** por categoría, no cantidad de talleres
- Mostrar % + valor absoluto
- Indicar cobertura (cuántos talleres completaron vs total)
- Si la mayoría no completó: el gráfico advierte "Datos parciales"

### 4.5 Wireframes

Mockup ASCII en sección 4.2, 4.3, 4.4 arriba. No hay mockup HTML porque Sofía no diseñó la pantalla, solo definió la nomenclatura.

**Sergio aprobará el diseño visual final** antes de mergear.

---

## 5. Datos

### Schema cambia

Sí, ver sección 4.1.

### Migración generada

Nombre: `desglose_plantilla_taller`

Contiene:
1. `DROP COLUMN experiencia_promedio FROM talleres`
2. `CREATE TYPE CategoriaOficioTextil`
3. `CREATE TABLE taller_plantilla`
4. `CREATE INDEX`
5. NO inserta datos para talleres existentes (quedan en 0)

### Queries nuevas

**Para perfil del taller:**

```typescript
prisma.tallerPlantilla.findMany({
  where: { tallerId },
  orderBy: { categoria: 'asc' }
})
```

**Para formulario (al cargar valores existentes):**

```typescript
prisma.tallerPlantilla.findMany({
  where: { tallerId },
  select: { categoria: true, cantidad: true }
})
```

**Para reporte sectorial:**

```typescript
// Suma de trabajadores por categoría
const distribucion = await prisma.tallerPlantilla.groupBy({
  by: ['categoria'],
  _sum: { cantidad: true },
  where: {
    taller: {
      // filtros de estado activo, etc.
    }
  }
})

// Cantidad de talleres que completaron
const talleresConPlantilla = await prisma.tallerPlantilla.findMany({
  distinct: ['tallerId'],
  select: { tallerId: true }
})
```

### Mutación al guardar formulario

Usar `upsert` con `@@unique([tallerId, categoria])` para que sea idempotente:

```typescript
for (const categoria of ['APRENDIZ', 'MEDIO_OFICIAL', 'OFICIAL', 'OFICIAL_CALIFICADO']) {
  await prisma.tallerPlantilla.upsert({
    where: { tallerId_categoria: { tallerId, categoria } },
    update: { cantidad: input[categoria] ?? 0 },
    create: { tallerId, categoria, cantidad: input[categoria] ?? 0 }
  })
}
```

### Seed

Actualizar `prisma/seed.ts`:
- En la limpieza: agregar `await prisma.tallerPlantilla.deleteMany()` (antes de los talleres)
- **IMPORTANTE:** el seed actual tiene `experienciaPromedio: 'alta'` y `experienciaPromedio: 'media'`
  hardcoded en algunos talleres. Estas líneas **deben eliminarse**. De lo contrario, TypeScript
  compila con error porque el campo ya no existe en el tipo Taller.
  Verificación: `grep -n "experienciaPromedio" prisma/seed.ts` — eliminar TODAS las ocurrencias.
- En la creación: para cada taller del seed, crear 4 filas de TallerPlantilla con valores ejemplares
- Mantener consistencia con la cantidadTrabajadores general

Ejemplo:
```typescript
// Taller La Aguja: total 3 trabajadores
await prisma.tallerPlantilla.createMany({
  data: [
    { tallerId, categoria: 'APRENDIZ', cantidad: 1 },
    { tallerId, categoria: 'MEDIO_OFICIAL', cantidad: 1 },
    { tallerId, categoria: 'OFICIAL', cantidad: 1 },
    { tallerId, categoria: 'OFICIAL_CALIFICADO', cantidad: 0 },
  ]
})
```

---

## 6. Prescripciones técnicas

### 6.1 Estructura de archivos

```
prisma/
├── schema.prisma                      # MODIFICADO (enum + modelo + drop column)
├── migrations/
│   └── XXXX_desglose_plantilla_taller/
│       └── migration.sql              # NUEVO (autogenerado)
└── seed.ts                            # MODIFICADO (limpieza + creación)

src/app/(taller)/taller/perfil/
├── completar/page.tsx                 # MODIFICADO (paso 4 del wizard)
└── page.tsx                           # MODIFICADO (vista del perfil)

src/app/(estado)/estado/sector/
└── page.tsx                           # MODIFICADO (reporte sectorial)

src/compartido/lib/
└── oficio-textil.ts                   # NUEVO (labels y helpers)

(Posibles archivos adicionales según estructura del proyecto)
```

### 6.2 Helper centralizado para labels

Crear `src/compartido/lib/oficio-textil.ts`:

```typescript
import type { CategoriaOficioTextil } from '@prisma/client'

export const CATEGORIAS_OFICIO_TEXTIL: CategoriaOficioTextil[] = [
  'APRENDIZ',
  'MEDIO_OFICIAL', 
  'OFICIAL',
  'OFICIAL_CALIFICADO',
]

export const LABEL_OFICIO_TEXTIL: Record<CategoriaOficioTextil, string> = {
  APRENDIZ: 'Aprendices',
  MEDIO_OFICIAL: 'Medio oficial',
  OFICIAL: 'Oficial',
  OFICIAL_CALIFICADO: 'Oficial calificado',
}

export const DESCRIPCION_OFICIO_TEXTIL: Record<CategoriaOficioTextil, string> = {
  APRENDIZ: 'Menos de 1 año de experiencia',
  MEDIO_OFICIAL: '1 a 3 años de experiencia',
  OFICIAL: '3 a 5 años de experiencia',
  OFICIAL_CALIFICADO: 'Más de 5 años de experiencia',
}
```

Usar este helper en todos los lugares (formulario, perfil, reporte). Evita strings duplicados.

### 6.3 Validación server-side

En el endpoint que guarda la plantilla:

```typescript
// Validar que cada cantidad sea entero >= 0
const schema = z.object({
  APRENDIZ: z.number().int().min(0),
  MEDIO_OFICIAL: z.number().int().min(0),
  OFICIAL: z.number().int().min(0),
  OFICIAL_CALIFICADO: z.number().int().min(0),
})
```

Si el proyecto no usa zod, usar el patrón de validación existente.

### 6.4 Componentes UI

Usar los componentes V4 ya disponibles (después de mergear X-02):

- `Input` con `type="number"` y `min=0`
- `Card` para agrupar cada categoría
- Mostrar descripción debajo del label con `text-ink-secondary`

### 6.5 Backwards compatibility

**NO hay backwards compatibility para `experienciaPromedio`.** Se elimina el campo. Cualquier código que lo use tiene que actualizarse a usar `plantilla`.

Lugares conocidos a actualizar (del reporte de Claude Code):
- `src/app/(taller)/taller/perfil/completar/page.tsx`
- `src/app/(taller)/taller/perfil/page.tsx`
- `src/app/(estado)/estado/sector/page.tsx`
- `src/app/api/talleres/[id]/route.ts` — 2 cambios:
  - Quitar `'experienciaPromedio'` de la whitelist `fields` (línea 58 aprox)
  - Agregar dentro de `prisma.$transaction` (PUT) la lógica de guardado
    de TallerPlantilla siguiendo patrón delete + createMany (consistente
    con maquinaria/procesos/prendas del mismo archivo):
    ```typescript
    if (body.plantilla && typeof body.plantilla === 'object') {
      await tx.tallerPlantilla.deleteMany({ where: { tallerId: id } })
      await tx.tallerPlantilla.createMany({
        data: [
          { tallerId: id, categoria: 'APRENDIZ', cantidad: body.plantilla.APRENDIZ ?? 0 },
          { tallerId: id, categoria: 'MEDIO_OFICIAL', cantidad: body.plantilla.MEDIO_OFICIAL ?? 0 },
          { tallerId: id, categoria: 'OFICIAL', cantidad: body.plantilla.OFICIAL ?? 0 },
          { tallerId: id, categoria: 'OFICIAL_CALIFICADO', cantidad: body.plantilla.OFICIAL_CALIFICADO ?? 0 },
        ]
      })
    }
    ```
- `src/app/api/talleres/me/route.ts` — agregar `plantilla: true` al include:
  ```typescript
  include: { maquinaria: true, plantilla: true }
  ```

### 6.7 Recalcular scoreEquipo

El wizard tiene un cálculo de scoreEquipo (línea 139 aprox de
completar/page.tsx) que actualmente usa el campo `experiencia`
para puntuar. Como ese campo se elimina, el score se recalcula
desde el desglose por categoría con ponderación:

```typescript
const totalPersonas = aprendices + medioOficial + oficial + oficialCalificado

const scoreEquipo = totalPersonas > 0
  ? Math.round((aprendices * 30 + medioOficial * 50 + oficial * 75 + oficialCalificado * 90) / totalPersonas)
  : 0
```

Razón: refleja composición real del equipo (no solo promedio agregado).
Talleres con mayor proporción de oficiales calificados ganan más score.

Edge case: si totalPersonas === 0, score = 0. La UI debe manejar esto
mostrando que el desglose está pendiente de completar.

### 6.8 Tests E2E

Actualmente no hay tests E2E para este campo. Agregar test mínimo:

```typescript
test('TALLER puede completar desglose de plantilla en wizard de perfil', async ({ page }) => {
  await page.goto('/taller/perfil/completar')
  // ... navegar al paso 4
  await page.locator('input[name="aprendices"]').fill('5')
  await page.locator('input[name="medioOficial"]').fill('3')
  // ... guardar
  // verificar que se guarda
})
```

---

## 7. Edge cases

### 7.1 Taller con todos los valores en 0

Acceptable. Significa que no completó el desglose o que no tiene equipo. La UI muestra "Composición del equipo: pendiente de completar".

### 7.2 Taller con suma > cantidadTrabajadores general

Sin validación cruzada (decisión 3 del relevamiento). El taller puede tener inconsistencias entre los dos campos. Aceptable porque:
- Un trabajador puede contar en distintos roles según el contexto
- La info más confiable es el desglose nuevo

### 7.3 Taller que tenía `experienciaPromedio` y ahora se rompe el deploy

La migración elimina la columna. Cualquier código que lea `experienciaPromedio` después del deploy va a romperse si no se actualizó.

**Mitigación:** este spec actualiza TODOS los lugares conocidos. Si CI verde, no hay regresión.

### 7.4 Taller con 0 trabajadores totales

Si el taller declara 0 en las 4 categorías, eso es válido. Aceptable que un taller esté "vacío" temporalmente (re-organización, vacaciones, etc.).

### 7.5 Reporte sectorial con pocos talleres con datos

Mostrar disclaimer: "Datos parciales: solo N de X talleres completaron el desglose".

### 7.6 Talleres que existían antes del cambio

Sus filas en `taller_plantilla` no existen. Las queries del perfil deben manejar `findMany` con array vacío y mostrar "pendiente de completar".

### 7.7 Re-completar el formulario

Usar `upsert` con `@@unique([tallerId, categoria])`. Garantiza idempotencia.

### 7.8 Concurrencia (taller editando en 2 sesiones)

Last-write-wins. Aceptable porque es un campo de un solo taller (no hay otros usuarios editando).

---

## 8. Validación sectorial

### Validada por

**Sofía:** propuso la nomenclatura original (`Comentarios_plataforma_redtextil.docx`). La adoptamos exacta.

### Decisiones ampliadas (más allá de Sofía)

- **Desglose por categoría:** ampliación nuestra. Sofía propuso solo cambiar labels, pero el desglose da información más rica para el reporte sectorial.
- **Avisar a Sofía** antes de mergear: confirmarle que el desglose le parece útil para el reporte sectorial que ella usa.

### Validación pendiente

- **Sergio:** aprobar diseño visual del nuevo formulario y del nuevo perfil del taller (URL temporal del PR)
- **Sofía:** confirmar que el desglose por categoría sirve para sus reportes

---

## 9. Criterios de aceptación

### Schema y migración

- [ ] `prisma/schema.prisma` tiene el enum `CategoriaOficioTextil` con 4 valores
- [ ] `prisma/schema.prisma` tiene el modelo `TallerPlantilla` con sus relaciones
- [ ] Campo `experienciaPromedio` eliminado del modelo `Taller`
- [ ] Migración generada con nombre `desglose_plantilla_taller`
- [ ] `npx prisma migrate dev` corre sin errores localmente

### Formulario del taller

- [ ] Paso 4 del wizard tiene 4 inputs numéricos (uno por categoría)
- [ ] Cada input muestra label + descripción (rango de años)
- [ ] Total se calcula automáticamente
- [ ] Validación: cada cantidad ≥ 0
- [ ] Guardado funciona con upsert (idempotente)
- [ ] Código muerto eliminado (input "¿Cuánto tiempo lleva tu trabajador más antiguo?")

### Vista del perfil del taller

- [ ] Muestra el desglose por categoría con sus cantidades
- [ ] Muestra el total
- [ ] Si no completó: mensaje "pendiente de completar"

### Reporte sectorial

- [ ] Gráfico cambia de "talleres por experiencia" a "trabajadores por categoría"
- [ ] Muestra % + valor absoluto
- [ ] Indica cobertura (cuántos talleres completaron vs total)

### Helper

- [ ] `src/compartido/lib/oficio-textil.ts` existe con CATEGORIAS, LABEL, DESCRIPCION
- [ ] Todos los lugares usan el helper (no hay strings hardcoded)

### Calidad técnica

- [ ] `npx tsc --noEmit --skipLibCheck` pasa sin errores
- [ ] `npm run build` pasa en CI
- [ ] Tests E2E pasan (0 failed, ≤1 flaky no relacionado)
- [ ] Test E2E nuevo: completar desglose en wizard funciona

### Aprobación visual

- [ ] Sergio aprobó el nuevo formulario (paso 4)
- [ ] Sergio aprobó la nueva vista del perfil del taller
- [ ] Sofía confirmó que el desglose le sirve para sus reportes (opcional pero recomendado)

---

## 10. Tests (QAs basados en flujos)

### Flujo 1 — Taller completa el desglose por primera vez

1. Login como TALLER nuevo
2. Ir a wizard de completar perfil
3. Llegar al paso 4
4. Ingresar: 5 aprendices, 3 medio oficial, 2 oficial, 1 oficial calificado
5. Verificar total = 11
6. Continuar al paso siguiente
7. Volver al paso 4

**Esperado:** los valores se mantienen guardados.

### Flujo 2 — Taller edita el desglose existente

1. Taller ya tiene plantilla guardada
2. Edita el campo "Aprendices" de 5 a 7
3. Guarda

**Esperado:** solo se actualiza el valor de APRENDIZ, los otros 3 no se tocan. Upsert correcto.

### Flujo 3 — Taller declara 0 en todas las categorías

1. Taller ingresa 0 en las 4 categorías
2. Guarda

**Esperado:** se guardan 4 filas con cantidad 0. Vista del perfil muestra "pendiente de completar" o "0 personas declaradas" (decidir cuál).

### Flujo 4 — Vista del perfil muestra desglose correctamente

1. Login como TALLER con plantilla completa (del seed)
2. Ir a `/taller/perfil`

**Esperado:** ver las 4 categorías con sus cantidades y el total.

### Flujo 5 — Reporte sectorial muestra distribución

1. Login como ESTADO
2. Ir a `/estado/sector`

**Esperado:** gráfico con 4 barras (una por categoría) mostrando suma de trabajadores en el sector + porcentajes.

### Flujo 6 — Migración no rompe talleres existentes

1. Verificar en dev DB: los 4 talleres que tenían `experienciaPromedio` siguen existiendo
2. Su `plantilla` está vacía
3. La UI los muestra como "pendiente de completar"

**Esperado:** no hay errores 500 en el perfil de talleres viejos.

### Flujo 7 — Validación rechaza valores negativos

1. Intentar guardar plantilla con `cantidad: -1`

**Esperado:** error 400 o validación client-side que impida enviar.

### Flujo 8 — Helper centralizado funciona

1. Verificar que `LABEL_OFICIO_TEXTIL['APRENDIZ']` retorna "Aprendices"
2. Verificar que se usa en formulario, perfil y reporte

**Esperado:** mismo string en todos los lugares.

---

## 11. Impacto en handover

### Documentos a actualizar

- [ ] `.claude/specs/handover/ARCHITECTURE.md` — agregar sección "Plantilla del taller por categoría de oficio"
  - Schema (enum + tabla relacional)
  - Helper en `src/compartido/lib/oficio-textil.ts`
  - Patrón de upsert para guardar
- [ ] `.claude/specs/handover/DECISIONS.md` — agregar entradas
  - Decisión: ampliar W-A1 original (solo labels) a refactor completo con desglose por categoría
  - Decisión: eliminar `experienciaPromedio` sin migrar datos viejos (re-completar)
  - Decisión: nomenclatura del oficio textil según Sofía y MASTER 3.15
- [ ] `.claude/specs/handover/KNOWN_ISSUES.md` — agregar nota sobre talleres existentes con plantilla vacía hasta que re-completen

### Skills a actualizar

Si durante implementación se descubre patrón nuevo, agregar regla a `.claude/skills/spec-v4-implementation/SKILL.md`. Por ejemplo, sobre migraciones que eliminan columnas: hacerlas en pasos separados (deprecar → eliminar) si los datos son críticos.

---

## 12. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| La migración rompe algo en producción | Baja | Alto | Producción está vacía de talleres reales (recién limpiada). Solo dev tiene datos legacy. El cambio es seguro. |
| Sergio no aprueba el diseño visual del nuevo paso 4 | Media | Bajo | Iteramos en el mismo branch. Cambios solo de presentación. |
| Sofía no aprueba el cambio de scope (desglose vs solo labels) | Baja | Bajo | Le explicamos por qué (info más rica) y le mostramos el reporte sectorial mejorado. Si no aprueba, revertimos a solo labels. |
| Talleres existentes en dev se rompen | Media | Bajo | Manejo de plantilla vacía en UI: "pendiente de completar". |
| Tests E2E preexistentes rompen | Baja | Bajo | No hay tests E2E que validen este campo. Bajo riesgo. |
| El reporte sectorial cambia métrica (trabajadores vs talleres) y confunde | Media | Medio | El nuevo gráfico debe tener label claro: "Cantidad de trabajadores por categoría". Sergio aprueba el diseño. |
| Otros lugares del código usan `experienciaPromedio` que no detectamos | Media | Alto | Grep exhaustivo antes de implementar: `grep -rn "experienciaPromedio" src/`. Si aparecen archivos no documentados, actualizar todos. |
| El helper `oficio-textil.ts` se duplica con otro existente | Baja | Bajo | Verificar antes de crear: `grep -rn "Aprendiz\|Oficial calificado" src/compartido/lib/` |

---

## Decisiones explícitas tomadas en este spec

1. **Ampliar W-A1 de "solo labels" a "refactor con desglose"** — decisión de Gerardo, justificada por la pérdida de información sectorial
2. **Eliminar `experienciaPromedio`** — limpio, sin backwards compat (los 4 talleres existentes tienen valores sucios)
3. **Tabla relacional `TallerPlantilla`** — escalable si después se agregan más categorías
4. **Migración de datos: todos a 0** — datos viejos no son confiables, mejor que re-completen
5. **Sin validación cruzada con `cantidadTrabajadores` general** — independientes, evita confusión
6. **Helper centralizado** `oficio-textil.ts` para labels — evita strings duplicados
7. **Sergio aprueba visualmente** antes de mergear (URL temporal del PR)
8. **Aviso a Sofía** sobre el cambio de scope, pero no es bloqueante

---

## Notas para la implementación

- **Skills relevantes:** Claude Code debe cargar `.claude/skills/spec-v4-implementation/SKILL.md` y `.claude/skills/playwright-e2e/SKILL.md`
- **Antes de implementar:** correr `grep -rn "experienciaPromedio" src/` para confirmar que no hay archivos ocultos que usen el campo
- **Antes de implementar:** correr `grep -rn "Novato\|Junior\|Intermedio\|Experto" src/` para detectar otros usos de la nomenclatura vieja
- **Estructura del PR:** 1 commit grande o varios commits temáticos según preferencia. Sugerencia: 
  - Commit 1: schema + migración + helper
  - Commit 2: formulario
  - Commit 3: vista del perfil
  - Commit 4: reporte sectorial
  - Commit 5: seed + tests E2E
- **Después del CI verde:** pasar preview URL a Sergio para aprobación visual
- **Después de aprobación:** mergear
