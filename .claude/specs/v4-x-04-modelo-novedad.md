# SPEC X-04: Modelo Novedad + endpoint público

> **Spec V4** — Sigue la metodología V4 definida en `.claude/METODOLOGIA_V4.md`.

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **Tipo** | feature nueva (schema + API) |
| **Bloque** | X (identidad visual) |
| **Categoría** | MVP no negociable |
| **Estimación** | 1h |
| **Riesgo** | Bajo |
| **Dependencias** | Fase 0 ✅ (dominio + DB operativos) |
| **Branch** | `feature/v4-x-04-modelo-novedad` |
| **Validación sectorial** | N/A — Diferida a validación grupal post-MVP V4 |
| **Perspectivas relevantes** | Sectorial (propuesta visual de Sergio) |
| **Autor** | Gerardo Breard |
| **Fecha de creación** | 2026-05-15 |
| **Aprobado por** | Pendiente |
| **Issue GitHub vinculado** | N/A |
| **PR vinculado** | Pendiente |

---

## 2. Contexto

### Por qué existe este spec

El landing rediseñado (X-06) incluye una sección "Novedades y capacitaciones" con un carrusel de 4 cards. Este carrusel mezcla 2 fuentes de datos:

1. **Novedades** (nuevo modelo a crear en este spec): noticias institucionales, casos de éxito, indicadores del sector
2. **Cursos** (modelo `Coleccion` ya existente): capacitaciones de la academia

Para que X-06 pueda implementarse, necesitamos primero el modelo `Novedad` con su endpoint público y algunos datos de seed para que el carrusel tenga contenido visible en dev.

### Qué resuelve

Después de implementar este spec:

1. **Modelo Prisma `Novedad`** disponible con campos requeridos por el diseño de Sergio
2. **Migración aplicada** en dev y lista para aplicar en producción
3. **Endpoint público** `GET /api/novedades?limit=N` que devuelve novedades publicadas ordenadas por fecha
4. **Seed con 3-5 novedades de ejemplo** en dev para que X-06 pueda renderizar el carrusel cuando se implemente
5. **Listo para X-06** (Landing rediseñada) sin bloqueos

### Documentación de referencia

- `docs/Diseño/propuesta-visual-pdt-v4/propuesta-final/04-header-y-layout.md` (sección 4 del landing — Novedades y capacitaciones)
- `docs/Diseño/propuesta-visual-pdt-v4/propuesta-final/06-plan-implementacion.md` (Fase 4 — define modelo y enum)
- `docs/Diseño/propuesta-visual-pdt-v4/propuesta-final/mockup/mockup-v6.html` líneas 517-577 (mockup del carrusel)
- `MASTER_V4.md` orden de specs — X-04

---

## 3. Validación interdisciplinaria

### Perspectivas relevantes para este spec

**Politólogo:** N/A — sin impacto en políticas públicas.

**Sociólogo:** N/A — sin narrativa de usuario en este spec (eso va en X-06 cuando se renderiza el carrusel).

**Economista:** N/A — sin impacto en modelo económico.

**Contador:** N/A — sin impacto fiscal.

**Sectorial:** APLICA.
- Observación: Sergio definió la estructura del modelo en `06-plan-implementacion.md` (Fase 4) y diseñó el carrusel en el mockup.
- Decisión tomada en el spec: adoptar la estructura propuesta por Sergio (enum + campos) sin cambios. Agregar `@@map("novedades")` que Sergio omitió en su propuesta, siguiendo convención del schema actual.

---

## 4. Qué construir

### 4.1 Modelo Prisma Novedad

Nuevo modelo con enum asociado:

```prisma
enum TipoNovedad {
  NOTICIA
  CASO
  INDICADOR
}

model Novedad {
  id          String      @id @default(cuid())
  tipo        TipoNovedad
  titulo      String
  descripcion String      @db.Text
  imagenUrl   String?
  slug        String      @unique
  fecha       DateTime    @default(now())
  publicado   Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([publicado, fecha])
  @@map("novedades")
}
```

**Decisiones de diseño:**

- **3 tipos** (`NOTICIA`, `CASO`, `INDICADOR`) según propuesta de Sergio
- **`slug`** único para URLs amigables tipo `/novedades/[slug]` cuando se haga el detalle (futuro spec)
- **`imagenUrl` nullable** porque las novedades tipo `INDICADOR` no llevan imagen (usan ícono fallback según mockup)
- **`publicado` con default false** para que el admin pueda crear borradores antes de publicar
- **Índice `[publicado, fecha]`** optimiza la query del carrusel (`where: { publicado: true }, orderBy: { fecha: 'desc' }`)
- **`@@map("novedades")`** sigue convención snake_case plural del resto del schema

### 4.2 Migración Prisma

Generar migración con nombre descriptivo:

```bash
npx prisma migrate dev --name agregar_modelo_novedad
```

Verificar que el SQL generado:
- Crea el tipo enum `TipoNovedad`
- Crea la tabla `novedades`
- Crea el índice compuesto

### 4.3 Endpoint público

**Ruta:** `GET /api/novedades`

**Archivo:** `src/app/api/novedades/route.ts`

**Query params:**
- `limit?: number` — default 4, máximo 20

**Lógica:**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get('limit')
  const limit = Math.min(Math.max(parseInt(limitParam ?? '4', 10) || 4, 1), 20)

  const novedades = await prisma.novedad.findMany({
    where: { publicado: true },
    orderBy: { fecha: 'desc' },
    take: limit,
    select: {
      id: true,
      tipo: true,
      titulo: true,
      slug: true,
      fecha: true,
      imagenUrl: true,
    },
  })

  return NextResponse.json({ novedades })
}
```

**Características:**

- **Público** (no requiere auth)
- **Solo publicadas** (filtro `publicado: true`)
- **Ordenado por fecha** descendente (más recientes primero)
- **Select explícito** (no expone `descripcion` ni `updatedAt` ni `createdAt` ni `publicado` — solo lo necesario para el carrusel)
- **Validación de limit** (entre 1 y 20, default 4)

### 4.4 Middleware: ninguna acción requerida

El matcher del middleware excluye automáticamente todas las rutas `/api/*` del procesamiento de auth. `/api/novedades` es accesible sin auth sin necesidad de modificar `publicRoutes` ni el middleware.

### 4.5 Seed de datos

Agregar a `prisma/seed.ts` (o archivo correspondiente del proyecto) 5 novedades de ejemplo:

```typescript
const novedades = [
  {
    tipo: 'NOTICIA',
    titulo: 'Convenio firmado con OIT para piloto sectorial',
    descripcion: 'Anuncio del convenio que da marco al lanzamiento de la Plataforma Digital Textil...',
    imagenUrl: '/seed/novedades/convenio-oit.jpg',
    slug: 'convenio-oit-piloto-sectorial',
    fecha: new Date('2026-04-15'),
    publicado: true,
  },
  {
    tipo: 'CASO',
    titulo: 'Taller Confecciones del Sur formaliza su producción',
    descripcion: 'Caso de un taller que en 3 meses pasó de Bronce a Plata...',
    imagenUrl: '/seed/novedades/caso-taller-sur.jpg',
    slug: 'caso-confecciones-del-sur',
    fecha: new Date('2026-04-22'),
    publicado: true,
  },
  {
    tipo: 'INDICADOR',
    titulo: '+38% de talleres con CUIT verificado en el sector',
    descripcion: 'Datos consolidados del primer trimestre 2026...',
    imagenUrl: null,
    slug: 'indicador-cuit-q1-2026',
    fecha: new Date('2026-05-01'),
    publicado: true,
  },
  {
    tipo: 'NOTICIA',
    titulo: 'Nuevas capacitaciones en costura industrial disponibles',
    descripcion: 'INTI lanza módulo certificable en el sistema...',
    imagenUrl: '/seed/novedades/capacitacion-inti.jpg',
    slug: 'capacitaciones-costura-inti',
    fecha: new Date('2026-05-08'),
    publicado: true,
  },
  {
    tipo: 'INDICADOR',
    titulo: '127 talleres registrados en la plataforma',
    descripcion: 'Crecimiento sostenido del directorio textil...',
    imagenUrl: null,
    slug: 'indicador-127-talleres',
    fecha: new Date('2026-05-12'),
    publicado: true,
  },
]
```

**Patrón del seed (alineado con el existente — deleteMany + create):**

```typescript
// En la sección de limpieza (donde se hacen los deleteMany existentes), agregar:
await prisma.novedad.deleteMany()

// En la sección de creación, agregar:
for (const novedad of novedades) {
  await prisma.novedad.create({ data: novedad })
}

// En el $transaction de count al final, agregar:
prisma.novedad.count()

// Y al console.log de resumen, agregar la línea correspondiente
```

**Notas:**

- Las imágenes pueden NO existir en disco. El frontend del carrusel debería manejar `onError` de la imagen (fallback a ícono). Como no estamos implementando el carrusel en este spec, no es bloqueante.
- Una novedad con `publicado: false` opcional para verificar que el endpoint la filtra correctamente.

### 4.6 Wireframes

Ver mockup navegable de Sergio: `docs/Diseño/propuesta-visual-pdt-v4/propuesta-final/mockup/mockup-v6.html` líneas 517-577 (sección del carrusel).

**Importante:** este spec NO implementa el carrusel visualmente. Solo el modelo y endpoint. El carrusel va en X-06.

---

## 5. Datos

### Schema cambia

Sí, ver sección 4.1.

### Migración generada

Nombre sugerido: `agregar_modelo_novedad`

Aplicar localmente con `npx prisma migrate dev`. Se aplica en dev y producción automáticamente al deployar (workflow ya configurado).

### Seeds

5 novedades de ejemplo agregadas al seed existente (sección 4.5).

### Queries nuevas

Solo la del endpoint:
```typescript
prisma.novedad.findMany({
  where: { publicado: true },
  orderBy: { fecha: 'desc' },
  take: limit,
  select: { /* campos públicos */ }
})
```

---

## 6. Prescripciones técnicas

### 6.1 Estructura de archivos

```
prisma/
├── schema.prisma                 # MODIFICADO (+ enum + model + index)
├── migrations/
│   └── XXXX_agregar_modelo_novedad/
│       └── migration.sql         # NUEVO (autogenerado)
└── seed.ts                       # MODIFICADO (+ 5 novedades)

src/app/api/novedades/
└── route.ts                      # NUEVO
```

### 6.2 Convenciones del schema

Seguir convenciones del schema actual:
- ID con `cuid()`
- `createdAt` y `updatedAt` con defaults
- `@@map("novedades")` snake_case plural
- Enum en PascalCase, valores en UPPER_SNAKE
- `@db.Text` para texto largo
- Booleanos con `@default()` explícito

### 6.3 Endpoint público — seguridad

- **NO** requiere auth (es público)
- **NO** acepta POST/PUT/DELETE en este spec (CRUD de admin va en otro spec futuro si hace falta)
- **Validación de input**: limit numérico entre 1 y 20
- **Select explícito**: NO devolver `descripcion`, `updatedAt`, `createdAt`, `publicado` (info interna)
- **Rate limit**: usar el que ya tenga el proyecto para endpoints públicos. Si no hay, no agregar en este spec.

### 6.4 Performance

- **Índice** `[publicado, fecha]` cubre la query principal
- Sin joins (modelo standalone)
- Resultado pequeño (máx 20 registros con select acotado) — sin necesidad de paginación

### 6.5 TypeScript

Tipo del response:

```typescript
type NovedadPublica = {
  id: string
  tipo: 'NOTICIA' | 'CASO' | 'INDICADOR'
  titulo: string
  slug: string
  fecha: Date
  imagenUrl: string | null
}

type GetNovedadesResponse = {
  novedades: NovedadPublica[]
}
```

Prisma genera el tipo `TipoNovedad` automáticamente.

### 6.6 Migración en producción

El workflow de deploy ya corre `prisma migrate deploy` antes del build. La migración se aplica automáticamente al mergear a `main`. **No hace falta intervención manual.**

Si la migración falla en producción por algún motivo (raro, es ALTER TABLE simple), revertir el merge y diagnosticar.

---

## 7. Edge cases

### 7.1 Endpoint llamado sin `limit`

Default 4 (según mockup que muestra 4 cards).

### 7.2 Endpoint llamado con `limit=0` o negativo

`Math.max(parseInt(limit, 10), 1)` lo fuerza a 1 mínimo.

### 7.3 Endpoint llamado con `limit=999`

`Math.min(..., 20)` lo limita a 20 máximo.

### 7.4 Endpoint llamado con `limit="abc"`

`parseInt("abc", 10)` retorna `NaN`. El `|| 4` lo convierte a 4 antes de `Math.max`/`Math.min`.
Resultado: limit = 4 (default).

### 7.5 Sin novedades publicadas

Devuelve `{ novedades: [] }`. El frontend del carrusel debe manejar este caso (probablemente ocultar la sección o mostrar solo cursos).

### 7.6 Migración falla en dev

Revertir manualmente con `npx prisma migrate reset` (cuidado: borra datos) o editar el archivo de migración y reintentar.

### 7.7 Seed se corre varias veces

El seed actual usa patrón `deleteMany` + `create`. Correrlo dos veces es seguro porque el `deleteMany` previo limpia todo antes de crear de nuevo.

### 7.8 Imágenes de seed no existen

Las URLs `/seed/novedades/*.jpg` pueden no existir en `public/`. El carrusel (que se implementa en X-06) debe manejar `onError` para mostrar un placeholder. En este spec NO es responsabilidad.

---

## 8. Validación sectorial

**N/A** — Diferida a validación grupal post-MVP V4.

---

## 9. Criterios de aceptación

### Schema y migración

- [ ] `prisma/schema.prisma` tiene el enum `TipoNovedad` con 3 valores
- [ ] `prisma/schema.prisma` tiene el modelo `Novedad` con los 9 campos
- [ ] Modelo tiene `@@map("novedades")` y `@@index([publicado, fecha])`
- [ ] Migración generada con nombre descriptivo
- [ ] `npx prisma migrate dev` corre sin errores localmente
- [ ] `npx prisma generate` genera el tipo `Novedad` correctamente

### Endpoint

- [ ] `src/app/api/novedades/route.ts` existe y exporta `GET`
- [ ] Devuelve `{ novedades: [...] }` con 4 items por default
- [ ] Filtra `publicado: true`
- [ ] Ordena por `fecha` desc
- [ ] `limit` query param funciona (1-20, default 4)
- [ ] Select explícito (no expone `descripcion`, `updatedAt`, `createdAt`, `publicado`)

### Seed

- [ ] 5 novedades de ejemplo agregadas al seed
- [ ] Seed es idempotente (correr 2 veces no falla)
- [ ] Las 5 son `publicado: true` (o 4 publicadas + 1 no publicada para test)

### Calidad técnica

- [ ] `npx tsc --noEmit --skipLibCheck` pasa sin errores nuevos
- [ ] `npm run build` pasa (en CI) sin warnings nuevos
- [ ] Tests E2E pasan (0 failed, ≤1 flaky no relacionado)

### Verificación funcional

- [ ] `curl https://[preview-url]/api/novedades` retorna JSON con 4 novedades
- [ ] `curl https://[preview-url]/api/novedades?limit=2` retorna 2 novedades
- [ ] `curl https://[preview-url]/api/novedades?limit=999` retorna 5 novedades (todas las publicadas) o 20 si hay más

---

## 10. Tests (QAs basados en flujos)

### Flujo 1 — Migración aplica correctamente

**Pasos:**
1. Mergear PR
2. Vercel deploya
3. `prisma migrate deploy` se ejecuta automáticamente

**Esperado:** tabla `novedades` existe en DB de dev (y eventualmente en producción).

### Flujo 2 — Endpoint público responde

**Pasos:**
1. `curl https://dev.plataformatextil.com.ar/api/novedades`

**Esperado:** HTTP 200 con `{ novedades: [...] }` (array con 4 items por default).

### Flujo 3 — Endpoint con limit

**Pasos:**
1. `curl https://dev.plataformatextil.com.ar/api/novedades?limit=2`

**Esperado:** HTTP 200 con `{ novedades: [...] }` (array con 2 items).

### Flujo 4 — Endpoint filtra no publicadas

**Pasos:**
1. Crear una novedad con `publicado: false` (via Prisma Studio o seed)
2. `curl https://dev.plataformatextil.com.ar/api/novedades?limit=20`

**Esperado:** la novedad no publicada NO aparece en el response.

### Flujo 5 — Endpoint ordena por fecha desc

**Pasos:**
1. `curl https://dev.plataformatextil.com.ar/api/novedades`
2. Parsear JSON

**Esperado:** las fechas están en orden descendente (más reciente primero).

### Flujo 6 — Endpoint público no requiere auth

**Pasos:**
1. `curl` SIN cookie de auth a `/api/novedades`

**Esperado:** HTTP 200 (no redirige a login, no devuelve 401).

### Flujo 7 — Endpoint NO expone campos internos

**Pasos:**
1. `curl https://dev.plataformatextil.com.ar/api/novedades`
2. Verificar el JSON

**Esperado:** los objetos NO tienen `descripcion`, `updatedAt`, `createdAt`, `publicado`. Solo `id`, `tipo`, `titulo`, `slug`, `fecha`, `imagenUrl`.

### Flujo 8 — Tipo enum funciona

**Pasos:**
1. Inspeccionar response
2. Verificar que `tipo` solo tiene valores `NOTICIA`, `CASO`, o `INDICADOR`

**Esperado:** los 3 valores aparecen en el seed y se serializan correctamente.

---

## 11. Impacto en handover

### Documentos a actualizar

- [ ] `.claude/specs/handover/ARCHITECTURE.md` — agregar sección "Modelo Novedad"
  - Schema (campos + enum)
  - Endpoint público
  - Cómo agregar novedades en producción (Prisma Studio o futuro admin CRUD)
- [ ] `.claude/specs/handover/DECISIONS.md` — agregar entrada
  - Decisión: modelo Novedad con 3 tipos (NOTICIA, CASO, INDICADOR)
  - Decisión: endpoint público sin auth para alimentar carrusel del landing
  - Pendiente: admin CRUD de novedades (no en MVP, futuro spec si hace falta)

### Documentos NO afectados

- `KNOWN_ISSUES.md`: ninguno
- `DEPLOY.md`: ninguno
- Skills: ninguno

---

## 12. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| La migración rompe algo en producción | Muy baja | Alto | El cambio es solo `CREATE TABLE` + `CREATE INDEX` + `CREATE TYPE`. Sin ALTER en tablas existentes. |
| Las imágenes de seed no existen | Alta | Bajo | El frontend del carrusel se hace en X-06, ese spec maneja fallback. |
| El endpoint expone datos sensibles por error | Baja | Medio | Select explícito en la query. Verificación manual del response. |
| Admin no tiene UI para crear novedades | Alta | Bajo | Aceptable: usar Prisma Studio para v4.0. Admin CRUD si hace falta en spec futuro. |
| Carrusel rompe si no hay novedades publicadas | Media | Bajo | Frontend de X-06 maneja `[]` vacío. Seed inicial garantiza 4-5 novedades publicadas. |
| `slug` duplicado en seed | Baja | Bajo | Upsert con `slug` como clave hace el seed idempotente. |
| Migración pendiente y deploy a producción falla | Muy baja | Alto | Workflow ya valida `prisma migrate deploy` antes del build. Si falla, deploy falla y no se promociona. |

---

## Decisiones explícitas tomadas en este spec

1. **Adoptar la estructura de Sergio sin cambios** — enum + 9 campos del modelo
2. **Agregar `@@map("novedades")`** que Sergio omitió, siguiendo convención del schema
3. **Endpoint público sin auth** — necesario para el landing público
4. **Sin admin CRUD en este spec** — usar Prisma Studio para v4.0, CRUD si hace falta en spec futuro
5. **Seed idempotente con deleteMany + create** — sigue el patrón existente del seed
6. **Imágenes de seed pueden no existir** — frontend maneja fallback en X-06
7. **Limit acotado 1-20** — evita queries grandes accidentales

---

## Notas para la implementación

- **Skills relevantes:** Claude Code debe cargar `.claude/skills/spec-v4-implementation/SKILL.md` (checklist antes de tocar schema)
- **Antes de modificar el schema:** correr `npx prisma migrate status` para confirmar que no hay migraciones pendientes
- **Después del schema:** correr `npx prisma migrate dev --name agregar_modelo_novedad` y verificar el SQL antes de aplicar
- **Después del migrate:** correr `npx prisma generate` para actualizar los tipos TypeScript
- **El seed se aplica con:** el comando que tenga el proyecto (probablemente `npm run seed` o `npx prisma db seed`)
- **No mezclar con otros cambios:** este PR solo toca schema + seed + endpoint. Si Claude Code descubre algo más que tocar, parar y reportar.
