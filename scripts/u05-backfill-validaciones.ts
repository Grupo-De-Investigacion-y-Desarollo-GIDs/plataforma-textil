// U-05 (paso D, secundario): backfill de validaciones faltantes (deuda D-02).
//
// Por qué existe: talleres creados vía /registro/completar antes del fix de U-09
// quedaron SIN checklist de Validacion. Este script crea las Validacion NO_INICIADO
// faltantes (una por cada TipoDocumento.activo) para cada taller con checklist
// incompleto. La FUENTE ya está cerrada (registro/route.ts y U-09 crean el checklist
// al alta); esto repara solo el dato histórico.
//
// Por qué script (no SQL crudo): para generar cuids correctos y leer TipoDocumento.activo
// dinámicamente (SQL crudo necesitaría gen_random_uuid() y hardcodear los tipos).
//
// Idempotente: dedupe por (tallerId, tipo) = @@unique. Re-correr = 0 inserts.
//
// Modos:
//   (default)  --dry-run : reporta qué crearía, NO escribe.
//   --apply              : crea las validaciones faltantes.
// Guard anti-PROD: bloquea contra prod salvo ALLOW_PROD=1.
//
// Ejecutar:
//   npx tsx scripts/u05-backfill-validaciones.ts            # dry-run
//   ALLOW_PROD=1 npx tsx scripts/u05-backfill-validaciones.ts            # dry-run contra prod (dimensionar)
//   npx tsx scripts/u05-backfill-validaciones.ts --apply    # aplica en dev
//   ALLOW_PROD=1 npx tsx scripts/u05-backfill-validaciones.ts --apply    # aplica en prod (deliberado)

import { PrismaClient } from '@prisma/client'

const PROD_REF = 'nefbhacmjrzynnhvgfnl' // ref de prod, ver scripts/check-db-ref.ts
const dbUrl = process.env.DATABASE_URL ?? ''
const isProd = dbUrl.includes(PROD_REF)
if (isProd && process.env.ALLOW_PROD !== '1') {
  console.error('🔴 BLOQUEADO: DATABASE_URL apunta a PROD. Repetí con ALLOW_PROD=1 si es deliberado.')
  process.exit(1)
}
if (isProd) console.warn('⚠️  ALLOW_PROD=1 — operando contra PROD deliberadamente.')

const prisma = new PrismaClient()
const apply = process.argv.includes('--apply')

async function main() {
  const tiposActivos = await prisma.tipoDocumento.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
  })
  console.log(`\n📋 U-05 backfill validaciones (${apply ? 'APPLY' : 'dry-run'}) — ${tiposActivos.length} tipos activos\n`)

  const talleres = await prisma.taller.findMany({
    select: { id: true, nombre: true, validaciones: { select: { tipo: true } } },
  })

  let talleresTocados = 0
  let validacionesCreadas = 0

  for (const t of talleres) {
    const existentes = new Set(t.validaciones.map((v) => v.tipo))
    const faltantes = tiposActivos.filter((td) => !existentes.has(td.nombre)) // dedupe por (tallerId, tipo)
    if (!faltantes.length) continue

    talleresTocados++
    validacionesCreadas += faltantes.length
    console.log(`  ${t.nombre} (${t.id}): faltan ${faltantes.length} → [${faltantes.map((f) => f.nombre).join(', ')}]`)

    if (apply) {
      await prisma.validacion.createMany({
        data: faltantes.map((td) => ({
          tallerId: t.id,
          tipo: td.nombre,
          tipoDocumentoId: td.id,
          estado: 'NO_INICIADO' as const,
        })),
      })
    }
  }

  console.log(`\n  Talleres con checklist incompleto: ${talleresTocados} / ${talleres.length}`)
  console.log(`  Validaciones ${apply ? 'creadas' : 'a crear'}: ${validacionesCreadas}`)
  if (!apply && talleresTocados > 0) console.log('\n  (dry-run: no se escribió nada. Re-correr con --apply para aplicar.)')
  console.log('')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
