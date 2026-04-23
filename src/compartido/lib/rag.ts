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

  // Leer config del admin desde DB
  const configs = await prisma.configuracionSistema.findMany({
    where: { grupo: 'llm' },
  })
  const configMap = Object.fromEntries(configs.map(c => [c.clave, c.valor]))

  const model = configMap['llm_model'] ?? 'claude-haiku-4-5-20251001'
  const maxTokens = parseInt(configMap['llm_max_tokens'] ?? '500')
  const systemPrompt = configMap['llm_system_prompt'] ?? `Sos un asistente de la Plataforma Digital Textil (PDT) de OIT Argentina y UNTREF.
Ayudas a talleres textiles con preguntas sobre formalizacion, tramites y uso de la plataforma.
Responde siempre en espanol, de forma clara y concisa.
Si en el contexto hay links en formato markdown, incluílos en tu respuesta para que el usuario pueda navegar directamente.
Solo responde basandote en el contexto provisto. Si no sabes, deci que no tenes esa informacion y sugeri contactar soporte@plataformatextil.ar.`

  const contextoTexto = contexto
    .map((d) => `## ${d.titulo}\n${d.contenido}`)
    .join('\n\n')

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
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
