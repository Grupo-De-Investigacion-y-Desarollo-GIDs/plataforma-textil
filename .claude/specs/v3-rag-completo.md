# Spec: RAG completo con soporte PDF y corpus real

- **Versión:** V3
- **Origen:** V3_BACKLOG F-06
- **Asignado a:** Gerardo
- **Prioridad:** Media — nice-to-have para piloto, no bloqueante. Pero alta visibilidad institucional para OIT

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG I-01 mergeado (ambientes separados — API keys diferenciadas dev/prod)
- [ ] Decisión sobre presupuesto: ANTHROPIC_API_KEY + VOYAGE_API_KEY se contratan
- [ ] Documentos del corpus inicial recolectados (guías OIT, normativa ARCA, requisitos municipales)

---

## 1. Contexto

**Estado en V2:**

El RAG existe como código. Tiene:
- Página `/admin/integraciones/llm` para configurar
- Endpoint `POST /api/admin/rag` para cargar texto plano
- Endpoint `POST /api/chat` que consume el corpus
- Tabla `RagDocumento` con embeddings de Voyage AI
- Feature flags `asistente_rag` y `llm_enabled`

**Pero está desactivado** porque:
- Las API keys (`ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`) no están configuradas en producción
- Los flags están en OFF por decisión de V2
- No tiene corpus real cargado
- Solo acepta texto plano, no PDFs

**Por qué OIT lo quiere para V3:**

El asistente RAG es la pieza diferencial visible para presentar la plataforma. Un taller pregunta "¿cómo me inscribo en monotributo?" y el asistente responde con información actualizada del Estado argentino, citando fuentes oficiales.

Sin esto, la plataforma es un directorio + checklist. Con esto, es una herramienta de orientación institucional que escala — el ESTADO no tiene que responder cada consulta individualmente.

**Lo que vamos a construir:**

1. Configurar API keys en Vercel
2. Soporte de carga de PDFs al corpus (los documentos oficiales del Estado son PDFs)
3. Cargar corpus inicial con materiales reales (~10-20 documentos)
4. Ajustar prompts del chat para que tenga tono institucional
5. Mostrar el asistente en el dashboard del taller (no solo en `/admin/`)

---

## 2. Qué construir

1. **Configuración de API keys** — `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY` en Vercel
2. **Soporte de PDFs en upload de RAG** — extracción de texto + chunking
3. **Corpus inicial cargado** — guías OIT + normativa ARCA + requisitos municipales
4. **Mejora del chat existente** — tono institucional, citación de fuentes
5. **Componente flotante en dashboard del taller** — `/taller` muestra el asistente como widget
6. **Activación de feature flags** — `asistente_rag` y `llm_enabled` en `true` para producción

---

## 3. Configuración de API keys

### 3.1 — Variables de entorno

```bash
# Anthropic — para generación de respuestas
ANTHROPIC_API_KEY=sk-ant-...

# Voyage AI — para embeddings
VOYAGE_API_KEY=pa-...

# Modelo de Voyage para embeddings (default: voyage-3-lite)
VOYAGE_MODEL=voyage-3-lite

# Modelo de Anthropic para chat (default: claude-haiku-4-5)
ANTHROPIC_MODEL=claude-haiku-4-5
```

### 3.2 — Costos estimados

**Voyage AI (`voyage-3-lite`):**
- Embedding: $0.00002 por 1K tokens
- 50 documentos × 10 chunks × 500 tokens = 250K tokens = $0.005 (carga inicial)
- Embeddings de queries: $0.00002 × 0.5K × 1000 queries/mes = $0.01/mes
- **Total Voyage: <$1/mes** para el piloto

**Anthropic (`claude-haiku-4-5`):**
- Input: $0.80 por 1M tokens
- Output: $4 por 1M tokens
- 1000 queries/mes × (3K input + 500 output tokens) = 3.5M tokens
- **Total Anthropic: ~$5/mes** para el piloto

**Total estimado para piloto: <$10/mes** combinado. Aceptable.

### 3.3 — Configuración por ambiente

Solo activar el RAG en `production` y `preview`. En desarrollo local, usar mock para evitar consumir crédito accidentalmente.

```typescript
// src/compartido/lib/rag.ts
const ragHabilitado =
  process.env.VERCEL_ENV === 'production' ||
  process.env.VERCEL_ENV === 'preview' ||
  process.env.RAG_FORCE_ENABLE === 'true'  // override para tests locales
```

---

## 4. Soporte de PDFs

### 4.1 — Stack para extracción

**Opción A (descartada): `pdf-parse`**

`pdf-parse` v3.x tiene un **bug conocido**: al importarse intenta cargar archivos de test desde `node_modules/pdf-parse/test/data/05-versions-space.pdf`, lo que rompe en Vercel serverless donde esos archivos no se incluyen en el bundle. Workaround posible: crear archivo dummy en esa ruta, pero es frágil.

**Opción B (recomendada): `pdfjs-dist`**

```bash
npm install pdfjs-dist
```

`pdfjs-dist` (Mozilla PDF.js) es más limpio y mantenido. Extrae texto de PDFs sin dependencias nativas, compatible con Vercel serverless.

```typescript
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

async function extraerTextoPdf(buffer: Buffer): Promise<string> {
  const doc = await getDocument({ data: new Uint8Array(buffer) }).promise
  const paginas: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const pagina = await doc.getPage(i)
    const contenido = await pagina.getTextContent()
    paginas.push(contenido.items.map((item: any) => item.str).join(' '))
  }
  return paginas.join('\n\n')
}
```

**Limitaciones conocidas:**
- No extrae texto de imágenes dentro del PDF (no hace OCR)
- PDFs con layout complejo (columnas, tablas) pueden quedar mal estructurados
- Para V3 documentos oficiales del Estado son texto-based — no es problema

### 4.2 — Endpoint de upload modificado

**Estado actual de `/api/admin/rag/route.ts`:**
- Auth: `ADMIN | CONTENIDO` (no solo ADMIN)
- POST acepta: JSON `{ titulo, contenido, categoria, fuente? }` con validación Zod
- ID se genera como `rag-${Date.now().toString(36)}` (no cuid())
- GET: lista documentos sin embedding, ordenados por createdAt DESC
- DELETE (en `/api/admin/rag/[id]/`): soft delete (`activo: false`)

**Cambios V3:**
- Auth ampliado: `ADMIN | ESTADO | CONTENIDO` — ADMIN mantiene acceso para gestión técnica, ESTADO se agrega según D-01
- Aceptar **tanto JSON (texto plano, retrocompatible) como FormData (PDFs)** — detección por `content-type`
- Mantener patrón de ID `rag-${Date.now().toString(36)}` para nuevos chunks

```typescript
import { extraerTextoPdf } from '@/compartido/lib/pdf'
import { generarEmbedding, hacerChunks } from '@/compartido/lib/rag'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'ESTADO', 'CONTENIDO'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  let titulo: string, contenido: string, fuente: string | null, categoria: string

  // Detección por content-type: FormData (PDF) o JSON (texto plano)
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    titulo = formData.get('titulo') as string
    fuente = formData.get('fuente') as string
    categoria = formData.get('categoria') as string

    if (!file) {
      return NextResponse.json({ error: 'Falta archivo PDF' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    contenido = await extraerTextoPdf(buffer)

    if (contenido.length < 100) {
      return NextResponse.json({
        error: 'No se pudo extraer texto del PDF (puede ser imagen escaneada)'
      }, { status: 400 })
    }
  } else {
    // JSON — flujo existente retrocompatible
    const body = await req.json()
    titulo = body.titulo
    contenido = body.contenido
    fuente = body.fuente ?? null
    categoria = body.categoria
  }

  // Hacer chunks de ~500 tokens cada uno
  const chunks = hacerChunks(contenido, { tamanoMaximo: 500, overlap: 50 })

  // Generar embedding por cada chunk
  const documentos = []
  for (const [idx, chunk] of chunks.entries()) {
    const embedding = await generarEmbedding(chunk)

    const doc = await prisma.documentoRAG.create({
      data: {
        id: `rag-${Date.now().toString(36)}`,
        titulo,
        fuente,
        categoria,
        chunkIndex: idx,
        contenido: chunk,
        embedding,
        metadata: {
          archivoOriginal: contentType.includes('multipart') ? (formData.get('file') as File)?.name : null,
          totalChunks: chunks.length,
        }
      }
    })
    documentos.push(doc)
  }

  return NextResponse.json({
    success: true,
    documentos: documentos.length,
    titulo
  })
}
```

### 4.3 — Helper `hacerChunks`

```typescript
// src/compartido/lib/rag.ts

interface ChunkOpts {
  tamanoMaximo: number   // tokens máximos por chunk
  overlap: number         // tokens de overlap entre chunks
}

export function hacerChunks(texto: string, opts: ChunkOpts): string[] {
  // Aproximación: 1 token ≈ 4 caracteres en español
  const charsPorChunk = opts.tamanoMaximo * 4
  const overlapChars = opts.overlap * 4

  // Limpiar texto: colapsar whitespace, normalizar
  const limpio = texto.replace(/\s+/g, ' ').trim()

  // Dividir por párrafos primero, después por chunks de tamaño máximo
  const parrafos = limpio.split(/\.\s+/)

  const chunks: string[] = []
  let actual = ''

  for (const parrafo of parrafos) {
    const proximo = actual + (actual ? '. ' : '') + parrafo

    if (proximo.length > charsPorChunk) {
      if (actual) chunks.push(actual)
      // Iniciar nuevo chunk con overlap del anterior
      const tail = actual.slice(-overlapChars)
      actual = tail + parrafo
    } else {
      actual = proximo
    }
  }

  if (actual) chunks.push(actual)

  return chunks
}
```

---

## 5. Modelo de datos

### 5.1 — Ampliación de `DocumentoRAG` (existente)

El modelo se llama **`DocumentoRAG`** (no `RagDocumento`), mapeado a tabla `documentos_rag`. Todas las referencias Prisma son `prisma.documentoRAG`.

**Campos que YA existen hoy:**

```prisma
model DocumentoRAG {
  id         String   @id @default(cuid())
  titulo     String                          // ya existe
  contenido  String   @db.Text               // ya existe
  categoria  String                          // ya existe (String libre, no enum)
  fuente     String?                         // ya existe (nullable)
  activo     Boolean  @default(true)         // ya existe (soft delete)
  embedding  Unsupported("vector(512)")?     // ya existe
  createdAt  DateTime @default(now())        // ya existe
  updatedAt  DateTime @updatedAt             // ya existe

  @@map("documentos_rag")
}
```

**Campos NUEVOS en V3 (solo 2):**

```prisma
  chunkIndex  Int   @default(0)   // posición dentro del documento original
  metadata    Json?               // { archivoOriginal, totalChunks, fechaActualizacion }
```

Migración: `ALTER TABLE documentos_rag ADD COLUMN "chunkIndex" INTEGER NOT NULL DEFAULT 0; ALTER TABLE documentos_rag ADD COLUMN metadata JSONB;`

**Decisión sobre `categoria`:** mantener como `String` libre para no requerir migración con conversión de datos existentes. Las categorías esperadas se documentan como **convención** (no como tipo):
- `FORMALIZACION_FISCAL` — monotributo, IVA, ganancias
- `HABILITACIONES` — municipales, provinciales
- `LABORAL` — ART, sindicatos, contratos
- `CAPACITACION_TECNICA` — cursos, certificaciones
- `COMERCIAL` — contratos con marcas, facturación
- `OTROS`

---

## 6. Corpus inicial

### 6.1 — Documentos a incluir

Lista mínima viable del corpus para arrancar V3:

| Categoría | Documento | Fuente | Páginas aprox. |
|-----------|-----------|--------|----------------|
| FORMALIZACION_FISCAL | Guía monotributo 2024 | AFIP | 12 |
| FORMALIZACION_FISCAL | Inscripción IVA paso a paso | AFIP | 8 |
| FORMALIZACION_FISCAL | Categorización monotributo | AFIP | 6 |
| HABILITACIONES | Habilitación municipal CABA | GCBA | 10 |
| HABILITACIONES | Habilitación municipal PBA | Provincia | 15 |
| LABORAL | ART obligatoria — guía rápida | SRT | 10 |
| LABORAL | Régimen laboral textil | OIT | 25 |
| CAPACITACION_TECNICA | Confección industrial básica | INTI Textiles | 20 |
| COMERCIAL | Modelos de contratos textil | Cámara Textil | 12 |
| COMERCIAL | Estándares de calidad PYME | INTI | 18 |

**Total estimado:** ~140 páginas, ~50K palabras, ~100 chunks.

### 6.2 — Carga manual con script

Archivo nuevo: `tools/cargar-corpus-rag.ts`

```typescript
import { config } from 'dotenv'
import { promises as fs } from 'fs'
import path from 'path'

config()

const corpusDir = path.join(__dirname, '../corpus-rag')

interface DocumentoCorpus {
  archivo: string
  titulo: string
  fuente: string
  categoria: string
}

const corpus: DocumentoCorpus[] = [
  { archivo: 'monotributo-2024.pdf', titulo: 'Guía monotributo 2024', fuente: 'AFIP', categoria: 'FORMALIZACION_FISCAL' },
  { archivo: 'iva-inscripcion.pdf', titulo: 'Inscripción IVA paso a paso', fuente: 'AFIP', categoria: 'FORMALIZACION_FISCAL' },
  // ... resto
]

async function main() {
  for (const doc of corpus) {
    const filePath = path.join(corpusDir, doc.archivo)
    const buffer = await fs.readFile(filePath)

    const formData = new FormData()
    const blob = new Blob([buffer], { type: 'application/pdf' })
    formData.append('file', blob, doc.archivo)
    formData.append('titulo', doc.titulo)
    formData.append('fuente', doc.fuente)
    formData.append('categoria', doc.categoria)

    const res = await fetch('https://plataforma-textil.vercel.app/api/admin/rag', {
      method: 'POST',
      headers: { 'Cookie': `authjs.session-token=${process.env.SESSION_TOKEN}` },
      body: formData
    })

    const result = await res.json()
    console.log(`✓ ${doc.titulo}: ${result.documentos} chunks`)
  }
}

main()
```

Ejecución:
```bash
npx tsx tools/cargar-corpus-rag.ts
```

---

## 7. Mejoras del chat

### 7.1 — System prompt institucional

**Estado actual:** el system prompt NO está hardcodeado — se lee de `ConfiguracionSistema` con `clave: 'llm_system_prompt', grupo: 'llm'`. Es configurable desde `/admin/integraciones/llm` (textarea en UI admin).

El prompt actual dice:
```
Sos un asistente de la Plataforma Digital Textil (PDT) de OIT Argentina y UNTREF.
Ayudas a talleres textiles con preguntas sobre formalizacion, tramites y uso de la plataforma.
Responde siempre en espanol, de forma clara y concisa.
Si en el contexto hay links en formato markdown, incluílos en tu respuesta para que el usuario pueda navegar directamente.
Solo responde basandote en el contexto provisto. Si no sabes, deci que no tenes esa informacion y sugeri contactar soporte@plataformatextil.ar.
```

**Cambio prescrito:** actualizar el **valor en ConfiguracionSistema** (no hardcodear en código) con el nuevo prompt institucional. Ejecutar:

```sql
UPDATE configuracion_sistema
SET valor = '...'  -- nuevo prompt abajo
WHERE clave = 'llm_system_prompt' AND grupo = 'llm';
```

Nuevo valor del prompt:

```typescript
const NUEVO_PROMPT = `Sos un asistente de la Plataforma Digital Textil (PDT), una iniciativa de OIT y UNTREF.

Ayudás a talleres textiles argentinos a entender la formalización: monotributo, IVA, habilitaciones municipales, ART, capacitaciones técnicas y temas comerciales.

REGLAS:
1. Respondé en español argentino, usando "vos" y "tenés".
2. Sé concreto y práctico — los talleres familiares no quieren teoría.
3. Citá siempre la fuente de tu respuesta cuando uses información del corpus (ej: "Según AFIP..." o "La OIT recomienda...").
4. Si no tenés información del corpus para responder, decí: "No tengo información actualizada sobre eso. Te recomiendo consultar [organismo correspondiente]."
5. NO inventes datos, números, plazos o trámites. Si algo cambió en la normativa y tu corpus está desactualizado, mejor decir "consultá AFIP" que dar info incorrecta.
6. NO recomiendes productos o servicios privados. Tu rol es orientar hacia trámites públicos.

Si la pregunta no es sobre formalización textil/fiscal/laboral, redirigí amablemente: "Mi rol es ayudarte con temas de formalización del taller. Para [otro tema] te recomiendo..."`
```

**Ampliar objeto `fuentes` en la respuesta del chat:**

Hoy el endpoint retorna `{ respuesta, fuentes: [titulo1, titulo2] }` (array de strings). En V3, ampliar a objetos para que la UI pueda mostrar cards informativas:

```typescript
// En /api/chat/route.ts — cambiar la respuesta
return NextResponse.json({
  respuesta,
  fuentes: contexto.map((d) => ({
    titulo: d.titulo,
    fuente: d.fuente,
    categoria: d.categoria,
  })),
})
```

### 7.2 — Citación de fuentes

Cuando el chat usa información del corpus, debe citarla. Modificar el flujo para incluir las fuentes en el contexto:

```typescript
// Después de hacer la búsqueda vectorial
const contextoConFuentes = chunks.map(c => `
[Fuente: ${c.fuente} — ${c.titulo}]
${c.contenido}
`).join('\n\n---\n\n')

const userMessage = `${pregunta}\n\nContexto disponible:\n${contextoConFuentes}`
```

El system prompt instruye a citar; el contexto trae las fuentes; el modelo las incluye en su respuesta.

### 7.3 — Mostrar fuentes citadas en la UI

Después de la respuesta del modelo, parsear las citas detectadas y mostrarlas como cards al pie:

```tsx
<div className="chat-message">
  <p>{respuesta}</p>

  {fuentesCitadas.length > 0 && (
    <div className="fuentes mt-3 pt-3 border-t">
      <p className="text-xs text-zinc-500 mb-2">Fuentes consultadas:</p>
      {fuentesCitadas.map(f => (
        <div className="text-xs bg-zinc-50 rounded p-2 mb-1">
          📄 <strong>{f.titulo}</strong> · {f.fuente}
        </div>
      ))}
    </div>
  )}
</div>
```

---

## 8. Widget del asistente en dashboard del taller

### 8.1 — Componente flotante

Archivo nuevo: `src/taller/componentes/asistente-flotante.tsx`

Botón flotante en la esquina inferior derecha del dashboard del taller que abre un panel de chat.

**Conflicto con feedback widget:** el feedback widget actual (`src/compartido/componentes/feedback-widget.tsx`) ocupa `fixed bottom-4 right-4 z-50` y se renderiza **globalmente** desde el root layout. Se superpone con el asistente flotante.

**Resolución:** cuando el asistente RAG está activo en la página actual, mover el feedback widget a `bottom-4 left-4`. Implementar via prop o context que el layout de taller pase al feedback widget.

**Nota:** ya existe un `AsistenteChat` inline (no flotante) en `src/taller/componentes/asistente-chat.tsx`, usado solo en `/taller/aprender/[id]`. El widget flotante nuevo NO lo reemplaza — son usos diferentes (el inline es contextual al contenido de aprendizaje, el flotante es genérico para cualquier página del taller).

**Jerarquía de z-index:** Asistente flotante (`z-50`), Toast (`z-50`), Feedback widget (`z-50`). El que renderiza después gana visualmente — como el asistente se monta en el layout de taller y el feedback en el root layout, el asistente queda encima.

```tsx
'use client'

export function AsistenteFlotante() {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="fixed bottom-6 right-6 bg-violet-600 text-white rounded-full p-4 shadow-lg hover:scale-105 transition z-50"
        >
          💬 ¿Necesitás ayuda?
        </button>
      )}

      {abierto && (
        <ChatPanel onClose={() => setAbierto(false)} />
      )}
    </>
  )
}
```

### 8.2 — Activación condicional

El widget solo aparece si `asistente_rag` está habilitado. La función real es `getFeatureFlag` (no `isFeatureEnabled`), ubicada en `src/compartido/lib/features.ts`. Firma: `getFeatureFlag(clave: string): Promise<boolean>` — lee de `ConfiguracionSistema`, retorna `valor === 'true'`. Si la clave no existe, retorna `true` (habilitado por defecto).

```tsx
import { getFeatureFlag } from '@/compartido/lib/features'

export default async function TallerLayout({ children }: { children: ReactNode }) {
  const ragHabilitado = await getFeatureFlag('asistente_rag')

  return (
    <>
      {children}
      {ragHabilitado && <AsistenteFlotante />}
    </>
  )
}
```

### 8.3 — Mensaje de bienvenida contextual

El primer mensaje del asistente al abrirse depende del nivel del taller:

- BRONCE: "¡Hola! Veo que estás empezando con la formalización. ¿Querés que te explique qué es el monotributo o por dónde empezar?"
- PLATA: "¡Hola! Como ya estás en PLATA, podés preguntarme sobre los próximos pasos para llegar a ORO o sobre cualquier duda fiscal/laboral."
- ORO: "¡Hola! Como ya estás en ORO, podés consultarme cualquier duda específica sobre tu operación. ¿En qué te ayudo?"

---

## 9. Activación de feature flags

No existe tabla `feature_flags`. Los flags viven en `ConfiguracionSistema` (tabla `configuracion_sistema`), con campos `clave` (String) y `valor` (String: `"true"` / `"false"`).

Los flags ya existen en el seed (`asistente_rag` en grupo `features_e2`, `llm_enabled` en grupo `llm`) — solo hay que cambiar el valor.

Una vez que todo está listo (API keys, corpus cargado, chat ajustado), activar:

```sql
UPDATE configuracion_sistema SET valor = 'true' WHERE clave = 'asistente_rag';
UPDATE configuracion_sistema SET valor = 'true' WHERE clave = 'llm_enabled';
```

Esto se hace al final del deploy de V3, una vez que se verificó que todo funciona en preview.

---

## 10. Casos borde

- **API keys inválidas o agotadas** — el endpoint de chat detecta el error 401/429 y muestra al usuario "El asistente no está disponible en este momento. Intentá más tarde." Los logs registran el error específico para que el admin lo resuelva.

- **Pregunta fuera de scope** — si el modelo no encuentra contexto relevante en el corpus, el system prompt instruye a redirigir al organismo correspondiente. Por ejemplo: "No tengo información sobre [tema], te recomiendo consultar la web de AFIP."

- **PDF escaneado (imagen)** — `pdfjs-dist` no hace OCR. Si el extract devuelve menos de 100 caracteres, el endpoint retorna error claro. Para V4 evaluar agregar OCR (Tesseract o servicio externo).

- **Corpus desactualizado** — la normativa cambia. La metadata de cada chunk incluye `fechaActualizacion`. La UI de admin muestra un badge cuando un documento es viejo. ESTADO recibe alerta al pasar 90 días sin actualizar un documento.

- **Modelo alucinaciones** — pese al system prompt, el modelo puede inventar. Mitigación: el chat siempre cita fuentes. Si no cita, es señal de que está fuera de corpus → mostrar disclaimer "Esta respuesta no fue verificada con fuentes oficiales."

- **Costos descontrolados** — un usuario malicioso podría hacer cientos de queries para agotar el plan. Mitigación: rate limit de S-02 ya cubre `/api/chat` (30 req/hora por user).

- **Tono inapropiado del modelo** — si el modelo responde de forma rara o irrespetuosa, el system prompt no es suficiente. Para V4 evaluar agregar un filtro de salida o usar Claude con instrucción `caution` mode.

- **Privacidad de las preguntas** — las preguntas de los talleres pueden contener info sensible (CUIT, nombres). Mitigación: NO logar el contenido de las preguntas en `LogActividad`, solo el evento "CHAT_USADO" con timestamp y usuario.

---

## 11. Criterios de aceptación

- [ ] API keys configuradas en Vercel para production y preview
- [ ] Mock activo en development local (sin consumir crédito)
- [ ] `pdfjs-dist` instalado y funcionando
- [ ] Endpoint de upload acepta PDFs y texto plano
- [ ] Helper `hacerChunks` con tamaño y overlap configurables
- [ ] Modelo `DocumentoRAG` ampliado con `chunkIndex` y `metadata` (los demás campos ya existen)
- [ ] Migración aplicada
- [ ] Corpus inicial cargado: 10 documentos mínimo, ~100 chunks
- [ ] System prompt institucional aplicado
- [ ] Citación de fuentes en respuestas
- [ ] UI del chat muestra cards de fuentes consultadas
- [ ] Widget flotante en dashboard del taller
- [ ] Mensaje de bienvenida contextual por nivel
- [ ] Feature flags `asistente_rag` y `llm_enabled` activados
- [ ] Rate limit aplicado en `/api/chat`
- [ ] Privacidad: contenido de preguntas no se loguea
- [ ] Build sin errores de TypeScript

---

## 12. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | Upload de PDF carga el contenido al corpus | Subir PDF de prueba, verificar tabla | QA |
| 2 | PDF escaneado retorna error claro | Subir PDF imagen, verificar mensaje | DEV |
| 3 | Chat responde con info del corpus | Preguntar "¿Qué es el monotributo?", verificar respuesta + citas | QA |
| 4 | Chat redirige cuando pregunta está fuera de scope | Preguntar "¿Cuál es la receta de la milanesa?", verificar redirección | QA |
| 5 | Citas de fuentes aparecen en UI | Hacer query, verificar cards de fuentes al pie | QA |
| 6 | Widget flotante aparece en /taller | Login como taller, verificar | QA |
| 7 | Widget no aparece si flag está OFF | Desactivar flag, recargar, verificar | DEV |
| 8 | Mensaje de bienvenida es contextual por nivel | Probar con BRONCE, PLATA, ORO | QA |
| 9 | Rate limit funciona | 31 queries seguidas, última da 429 | DEV |
| 10 | Mock funciona en development | Levantar localmente sin keys, verificar respuestas mock | DEV |

---

## 13. Validación de dominio (perfiles interdisciplinarios)

**Politólogo:**
- ¿La selección de fuentes (AFIP, OIT, INTI, Cámara Textil) es la correcta para una herramienta institucional?
- ¿Hay riesgo de sesgo si solo cargamos fuentes oficiales? ¿Conviene incluir información sindical?

**Economista:**
- ¿Las categorías cubren los temas que efectivamente afectan económicamente al taller?
- ¿Falta información sobre costos comparados (monotributo vs RI) para decisiones del taller?

**Sociólogo:**
- ¿El tono del chat es accesible para talleres con poca alfabetización digital?
- ¿La citación de fuentes ayuda o intimida ("no entiendo qué es Resolución 4321")?
- ¿El mensaje de bienvenida es adecuado o paternalista?

**Contador:**
- ¿El corpus inicial cubre lo esencial para el taller textil promedio?
- ¿Hay información que falta y es crítica (ej: convenio colectivo textil)?
- ¿Las respuestas del modelo sobre temas fiscales serán precisas con este corpus?

---

## 14. Referencias

- V3_BACKLOG → F-06
- V2: implementación base del RAG (modelo, endpoints, chat)
- Voyage AI docs: https://docs.voyageai.com
- Anthropic Claude docs: https://docs.claude.com
- pdfjs-dist (Mozilla PDF.js): https://www.npmjs.com/package/pdfjs-dist
