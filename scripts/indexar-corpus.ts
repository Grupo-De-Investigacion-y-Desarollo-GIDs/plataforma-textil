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

// TODO: Reemplazar con contenido real validado por OIT/UNTREF
// Los documentos del piloto se cargan desde la UI de admin (/admin/integraciones/llm)
// Este script se usa solo para indexacion batch masiva con embeddings
const corpus: Documento[] = []

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
    const id = `rag-${String(i + 1).padStart(3, '0')}`
    const embedding = await generarEmbedding(doc.contenido)
    const embeddingStr = `[${embedding.join(',')}]`

    await prisma.$executeRaw`
      INSERT INTO documentos_rag (id, titulo, contenido, categoria, fuente, activo, embedding, "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${doc.titulo},
        ${doc.contenido},
        ${doc.categoria},
        ${doc.fuente ?? null},
        true,
        ${embeddingStr}::vector,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        contenido = EXCLUDED.contenido,
        categoria = EXCLUDED.categoria,
        fuente = EXCLUDED.fuente,
        embedding = EXCLUDED.embedding,
        "updatedAt" = NOW()
    `

    console.log(`  [${i + 1}/${corpus.length}] ${doc.titulo}`)

    // Esperar 200ms entre requests para no saturar Voyage API
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log('Indexacion completada.')
  await prisma.$disconnect()
}

main().catch(console.error)
