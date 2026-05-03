/**
 * Sincroniza talleres existentes contra ARCA.
 *
 * Uso:
 *   npx tsx tools/sincronizar-arca.ts --dry-run   # ver que pasaria
 *   npx tsx tools/sincronizar-arca.ts              # ejecutar
 *
 * Requiere: ARCA_ENABLED=true en .env.local + credenciales AfipSDK
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const dryRun = process.argv.includes('--dry-run')

async function main() {
  console.log(`\n=== Sincronizacion ARCA ${dryRun ? '(DRY RUN)' : ''} ===\n`)

  const talleres = await prisma.taller.findMany({
    select: {
      id: true,
      nombre: true,
      cuit: true,
      verificadoAfip: true,
      verificadoAfipAt: true,
    },
    orderBy: { nombre: 'asc' },
  })

  console.log(`Total talleres: ${talleres.length}`)
  console.log(`Verificados: ${talleres.filter(t => t.verificadoAfip).length}`)
  console.log(`Sin verificar: ${talleres.filter(t => !t.verificadoAfip).length}`)
  console.log('')

  if (dryRun) {
    console.log('Talleres que se sincronizarian:')
    for (const t of talleres) {
      const diasDesdeUltima = t.verificadoAfipAt
        ? Math.floor((Date.now() - t.verificadoAfipAt.getTime()) / (1000 * 60 * 60 * 24))
        : null
      const necesita = !t.verificadoAfip || !t.verificadoAfipAt || (diasDesdeUltima !== null && diasDesdeUltima >= 30)
      console.log(`  ${necesita ? '[SYNC]' : '[SKIP]'} ${t.nombre} (${t.cuit}) — verificado: ${t.verificadoAfip}${diasDesdeUltima !== null ? `, hace ${diasDesdeUltima} dias` : ', nunca'}`)
    }
    console.log('\nUsa sin --dry-run para ejecutar.')
    return
  }

  // Import dinámico del cliente ARCA (requiere env vars)
  const { sincronizarTaller } = await import('../src/compartido/lib/arca')

  let exitosos = 0
  let fallidos = 0

  for (const t of talleres) {
    process.stdout.write(`  Sincronizando ${t.nombre} (${t.cuit})... `)
    try {
      const resultado = await sincronizarTaller(t.id, true)
      if (resultado.exitosa) {
        console.log('OK')
        exitosos++
      } else {
        console.log(`FALLO: ${resultado.error}`)
        fallidos++
      }
    } catch (err) {
      console.log(`ERROR: ${err instanceof Error ? err.message : err}`)
      fallidos++
    }

    // Esperar 1 segundo entre consultas para no saturar AFIP
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\n=== Resultado ===`)
  console.log(`Exitosos: ${exitosos}`)
  console.log(`Fallidos: ${fallidos}`)
  console.log(`Total: ${talleres.length}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
