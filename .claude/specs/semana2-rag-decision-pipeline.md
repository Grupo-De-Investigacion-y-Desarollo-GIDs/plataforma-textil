# Spec: RAG — Infraestructura y Pipeline

- **Semana:** 2
- **Asignado a:** Gerardo
- **Dependencias:** Ninguna — puede hacerse en paralelo con otros specs

---

## 1. Contexto

El Escenario 2 requiere un asistente de ayuda basado en IA. Los videos no tienen transcripciones disponibles todavia — el corpus inicial sera un conjunto de documentos de texto sobre formalizacion y tramites que Gerardo carga manualmente para el piloto. El equipo de contenidos carga el corpus real despues desde el panel de admin. Stack decidido: Claude API (chat) + Voyage AI (embeddings) + Supabase pgvector (busqueda vectorial).

---

## 2. Que construir

- Habilitar pgvector en Supabase
- Modelo `DocumentoRAG` en Prisma para almacenar chunks con embeddings
- Script de indexacion: recibe texto → genera embedding con Voyage AI → guarda en DB
- API de chat: recibe pregunta → busca contexto relevante → genera respuesta con Claude
- 20-30 documentos de texto iniciales sobre formalizacion y tramites (corpus piloto)
- Backend de configuracion del asistente en `/admin/integraciones/llm`

---

## 3. Datos

### Habilitar pgvector

Ejecutar en Supabase SQL Editor (no via Prisma migrate):

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Modelo DocumentoRAG

```prisma
model DocumentoRAG {
  id         String   @id @default(cuid())
  titulo     String
  contenido  String   @db.Text
  categoria  String   // 'formalizacion' | 'tramites' | 'plataforma' | 'capacitacion'
  fuente     String?  // URL o referencia de la fuente
  activo     Boolean  @default(true)
  embedding  Unsupported("vector(512)")?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("documentos_rag")
}
```

Nota: `vector(512)` corresponde a `voyage-3-lite` que produce embeddings de 512 dimensiones. Si se migra a `voyage-3` (1024 dims) hay que recrear la columna y re-indexar.

Migracion Prisma: `npx prisma migrate dev --name agregar_documento_rag`

Nota sobre indice vectorial: para el piloto (<100 documentos), pgvector hace scan secuencial que es suficiente. Cuando el corpus supere 100 documentos, crear indice en Supabase SQL Editor:

```sql
CREATE INDEX ON documentos_rag USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Variables de entorno

Agregar a `.env.local`, `.env.example` y Vercel:

```
ANTHROPIC_API_KEY=     # Claude API para generacion de respuestas
VOYAGE_API_KEY=        # Voyage AI para generacion de embeddings
```

Son servicios distintos con keys distintas. `ANTHROPIC_API_KEY` se obtiene en console.anthropic.com. `VOYAGE_API_KEY` se obtiene en dash.voyageai.com.

### Modelo ConfiguracionSistema — ya existe

La tabla `ConfiguracionSistema` (schema linea 605) ya existe con campos `clave`, `valor`, `grupo`. Se usa para guardar configuracion del asistente (provider, modelo, max_tokens, system_prompt, habilitado).

### Corpus inicial

Gerardo carga manualmente via script estos temas (20-30 documentos):

1. Que es el CUIT y como obtenerlo
2. Que es el monotributo y como registrarse
3. Que es la ART y como contratarla
4. Habilitacion municipal — que es y como obtenerla
5. Habilitacion de bomberos — que es y como obtenerla
6. Seguridad e higiene en talleres textiles
7. Libro de sueldos digital
8. Inscripcion como empleador
9. Niveles BRONCE/PLATA/ORO — que requiere cada uno
10. Como subir documentos en la plataforma
11. Como funciona la verificacion de CUIT via ARCA
12. Como se calculan los certificados
13. Como funciona el sistema de capacitacion
14. Preguntas frecuentes sobre pedidos y cotizaciones
15. Beneficios de formalizarse
16. Contacto y soporte de la plataforma
17. Como completar el perfil de taller
18. Como funciona el directorio de talleres
19. Que son las auditorias y como prepararse
20. Como registrarse en la plataforma paso a paso

---

## 4. Prescripciones tecnicas

### Dependencias a instalar

```bash
npm install @anthropic-ai/sdk
```

Voyage AI se usa via REST (sin SDK) — no requiere dependencia adicional.

### Archivo nuevo — `src/compartido/lib/rag.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from './prisma'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Generar embedding para un texto usando Voyage AI via REST
export async function generarEmbedding(texto: string): Promise<number[]> {
  const voyageKey = process.env.VOYAGE_API_KEY
  if (!voyageKey) throw new Error('VOYAGE_API_KEY no configurada')

  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${voyageKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: texto, model: 'voyage-3-lite' }),
  })

  if (!response.ok) {
    throw new Error(`Voyage AI error: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  return data.data[0].embedding // number[] de 512 dimensiones
}

// Buscar documentos similares usando pgvector
export async function buscarContexto(
  pregunta: string,
  limit = 5,
): Promise<{ id: string; titulo: string; contenido: string; categoria: string }[]> {
  const embedding = await generarEmbedding(pregunta)

  // Convertir array a string con formato pgvector
  const embeddingStr = `[${embedding.join(',')}]`

  const resultados = await prisma.$queryRaw`
    SELECT id, titulo, contenido, categoria
    FROM documentos_rag
    WHERE activo = true
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `

  return resultados as { id: string; titulo: string; contenido: string; categoria: string }[]
}

// Generar respuesta con Claude usando el contexto
export async function generarRespuesta(
  pregunta: string,
  contexto: { titulo: string; contenido: string }[],
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY no configurada')
  }

  const contextoTexto = contexto
    .map((d) => `## ${d.titulo}\n${d.contenido}`)
    .join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: `Sos un asistente de la Plataforma Digital Textil (PDT) de OIT Argentina y UNTREF.
Ayudas a talleres textiles con preguntas sobre formalizacion, tramites y uso de la plataforma.
Responde siempre en espanol, de forma clara y concisa.
Solo responde basandote en el contexto provisto. Si no sabes, deci que no tenes esa informacion y sugeri contactar soporte@plataformatextil.ar.`,
    messages: [
      {
        role: 'user',
        content: contextoTexto
          ? `Contexto relevante:\n${contextoTexto}\n\nPregunta: ${pregunta}`
          : pregunta,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
```

### Archivo nuevo — `src/app/api/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { buscarContexto, generarRespuesta } from '@/compartido/lib/rag'
import { z } from 'zod'

const chatSchema = z.object({
  pregunta: z.string().min(10, 'La pregunta debe tener al menos 10 caracteres').max(500, 'La pregunta es demasiado larga'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!process.env.ANTHROPIC_API_KEY || !process.env.VOYAGE_API_KEY) {
      return NextResponse.json({ error: 'Asistente no disponible' }, { status: 503 })
    }

    const body = await req.json()
    const parsed = chatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    const { pregunta } = parsed.data

    // Buscar contexto relevante
    let contexto: { id: string; titulo: string; contenido: string; categoria: string }[] = []
    try {
      contexto = await buscarContexto(pregunta)
    } catch (err) {
      // Si pgvector falla o no hay documentos, responder sin contexto
      console.error('Error buscando contexto RAG:', err)
    }

    // Generar respuesta con Claude
    const respuesta = await generarRespuesta(pregunta, contexto)

    return NextResponse.json({
      respuesta,
      fuentes: contexto.map((d) => d.titulo),
    })
  } catch (error) {
    console.error('Error en POST /api/chat:', error)
    return NextResponse.json(
      { error: 'No se pudo generar la respuesta. Intenta de nuevo.' },
      { status: 503 }
    )
  }
}
```

Decisiones de diseno para el piloto:
- **Single-turn:** cada request es independiente, no hay historial de conversacion. Multi-turn se implementa en fase posterior.
- **Sin streaming:** la respuesta se retorna completa como JSON. La UI muestra un spinner mientras carga. Streaming se implementa en fase posterior.
- **Rate limiting por autenticacion:** solo usuarios logueados pueden usar el chat. No hay limite de requests por usuario. Esto es suficiente para el piloto con pocos usuarios. Si se necesita rate limiting real, se agrega en produccion con un middleware o servicio externo.

### Archivo nuevo — `scripts/indexar-corpus.ts`

Script que corre una vez para indexar el corpus inicial:

```typescript
// Ejecutar: npx tsx scripts/indexar-corpus.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY
if (!VOYAGE_API_KEY) throw new Error('VOYAGE_API_KEY requerida')

interface Documento {
  titulo: string
  contenido: string
  categoria: string
  fuente?: string
}

// Corpus — Gerardo completa con contenido real
const corpus: Documento[] = [
  {
    titulo: 'Que es el CUIT y como obtenerlo',
    contenido: '...contenido real aqui...',
    categoria: 'tramites',
  },
  // ... 19-29 documentos mas
]

async function generarEmbedding(texto: string): Promise<number[]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: texto, model: 'voyage-3-lite' }),
  })
  if (!res.ok) throw new Error(`Voyage error: ${res.status}`)
  const data = await res.json()
  return data.data[0].embedding
}

async function main() {
  console.log(`Indexando ${corpus.length} documentos...`)

  for (const [i, doc] of corpus.entries()) {
    const embedding = await generarEmbedding(doc.contenido)
    const embeddingStr = `[${embedding.join(',')}]`

    await prisma.$executeRaw`
      INSERT INTO documentos_rag (id, titulo, contenido, categoria, fuente, activo, embedding, "createdAt", "updatedAt")
      VALUES (
        ${`rag-${String(i + 1).padStart(3, '0')}`},
        ${doc.titulo},
        ${doc.contenido},
        ${doc.categoria},
        ${doc.fuente ?? null},
        true,
        ${embeddingStr}::vector,
        NOW(),
        NOW()
      )
    `

    console.log(`  [${i + 1}/${corpus.length}] ${doc.titulo}`)

    // Esperar 200ms entre requests para no saturar Voyage API
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log('Indexacion completada.')
  await prisma.$disconnect()
}

main().catch(console.error)
```

### Archivo nuevo — `src/app/api/admin/rag/route.ts`

```typescript
// GET — lista documentos RAG (solo ADMIN/CONTENIDO)
// Retorna todos los documentos sin el campo embedding (demasiado grande)

// POST — crear documento RAG + generar embedding automaticamente (solo ADMIN/CONTENIDO)
// Body: { titulo, contenido, categoria, fuente? }
// 1. Validar con Zod
// 2. generarEmbedding(contenido)
// 3. $executeRaw INSERT con embedding::vector
// 4. Retornar documento creado
```

### Archivo nuevo — `src/app/api/admin/rag/[id]/route.ts`

```typescript
// DELETE — desactivar documento (soft delete, solo ADMIN/CONTENIDO)
// Setea activo: false — no elimina fisicamente
```

### Archivo a mover — `.claude/pendiente/.../llm/page.tsx` → `src/app/(admin)/admin/integraciones/llm/page.tsx`

Mover el stub y conectar al backend usando `ConfiguracionSistema`:

- Al cargar: `GET /api/admin/config?grupo=llm` para obtener valores guardados
- Al guardar: `POST /api/admin/config` con las claves:
  - `llm_provider` (openai | anthropic)
  - `llm_model` (claude-haiku-4-5-20251001 | etc)
  - `llm_max_tokens` (500)
  - `llm_system_prompt` (texto del system prompt)
  - `llm_enabled` (true | false)
- Agregar seccion "Documentos del corpus" que muestra lista de DocumentoRAG con:
  - Tabla: titulo, categoria, activo, fecha
  - Boton "Agregar documento" → form inline o modal
  - Boton "Desactivar" por documento

### Archivo nuevo — `src/app/api/admin/config/route.ts`

```typescript
// GET /api/admin/config?grupo=llm — lista configuraciones del grupo (solo ADMIN)
// POST /api/admin/config — upsert configuracion (solo ADMIN)
// Body: { clave: string, valor: string, grupo: string }
// Usa prisma.configuracionSistema.upsert({ where: { clave }, create: {...}, update: { valor } })
```

---

## 5. Casos borde

- **`ANTHROPIC_API_KEY` no configurada** → `POST /api/chat` retorna 503 "Asistente no disponible"
- **`VOYAGE_API_KEY` no configurada** → idem 503
- **pgvector no habilitado** → error en `$queryRaw` → catch block responde sin contexto (solo Claude con system prompt, sin RAG)
- **Pregunta muy corta (<10 chars)** → 400 "La pregunta debe tener al menos 10 caracteres"
- **Pregunta muy larga (>500 chars)** → 400 "La pregunta es demasiado larga"
- **Sin documentos en corpus** → `buscarContexto` retorna `[]` → Claude responde solo con system prompt
- **Error de Claude API (rate limit, etc.)** → 503 "No se pudo generar la respuesta. Intenta de nuevo."
- **Error de Voyage API** → catch en `buscarContexto` → responde sin contexto
- **Usuario no autenticado** → 401

---

## 6. Criterio de aceptacion

- [ ] `CREATE EXTENSION vector` corre en Supabase sin error
- [ ] Migracion `DocumentoRAG` corre sin errores — campo `contenido` es `@db.Text`, embedding es `vector(512)`
- [ ] `ANTHROPIC_API_KEY` y `VOYAGE_API_KEY` configuradas en `.env.local`, `.env.example` y Vercel
- [ ] Script `indexar-corpus.ts` indexa al menos 10 documentos con embeddings de 512 dimensiones
- [ ] `POST /api/chat` con pregunta sobre formalizacion retorna respuesta relevante con fuentes
- [ ] `POST /api/chat` sin autenticacion retorna 401
- [ ] `POST /api/chat` sin API keys configuradas retorna 503
- [ ] `GET /api/admin/rag` retorna lista de documentos sin campo embedding
- [ ] `POST /api/admin/rag` crea documento y genera embedding automaticamente
- [ ] `/admin/integraciones/llm` guarda y carga configuracion real desde `ConfiguracionSistema`
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Correr `CREATE EXTENSION vector` en Supabase SQL Editor
2. Correr migracion y verificar que tabla `documentos_rag` existe con columna `embedding` tipo `vector(512)`
3. Correr `npx tsx scripts/indexar-corpus.ts` — verificar que indexa sin errores y loguea progreso
4. Verificar en Supabase que la columna `embedding` tiene valores (no null) de 512 dimensiones
5. `POST /api/chat` con pregunta "Que necesito para pasar de BRONCE a PLATA?" → debe retornar respuesta relevante mencionando validaciones requeridas
6. `POST /api/chat` con pregunta "abc" → debe retornar 400
7. Entrar a `/admin/integraciones/llm` → guardar configuracion → recargar → verificar que carga los valores guardados
8. Desde `/admin/integraciones/llm` → agregar documento al corpus → verificar que aparece en la lista y tiene embedding
