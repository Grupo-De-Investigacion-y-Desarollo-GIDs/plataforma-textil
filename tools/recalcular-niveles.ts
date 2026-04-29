/**
 * Recalcula niveles de todos los talleres con las reglas actuales de DB.
 * Uso: npx tsx tools/recalcular-niveles.ts [--dry-run]
 * Lee DATABASE_URL de .env (no .env.local).
 */
import { PrismaClient, NivelTaller } from '@prisma/client'

const prisma = new PrismaClient()
const dryRun = process.argv.includes('--dry-run')

function nivelesIncluyenHasta(nivel: NivelTaller): NivelTaller[] {
  if (nivel === 'BRONCE') return ['BRONCE']
  if (nivel === 'PLATA') return ['BRONCE', 'PLATA']
  return ['BRONCE', 'PLATA', 'ORO']
}

async function main() {
  if (dryRun) console.log('=== DRY RUN — no se aplican cambios ===\n')

  const reglas = await prisma.reglaNivel.findMany({ orderBy: { puntosMinimos: 'desc' } })
  const tiposRequeridos = await prisma.tipoDocumento.findMany({
    where: { activo: true, requerido: true },
    select: { id: true, nivelMinimo: true, puntosOtorgados: true },
  })

  const talleres = await prisma.taller.findMany({
    include: {
      validaciones: {
        where: { estado: 'COMPLETADO' },
        include: { tipoDocumento: { select: { id: true, puntosOtorgados: true } } },
      },
      certificados: { where: { revocado: false }, select: { id: true } },
    },
  })

  let cambios = 0
  for (const taller of talleres) {
    const puntaje = taller.validaciones.reduce(
      (sum, v) => sum + v.tipoDocumento.puntosOtorgados, 0
    ) + (taller.verificadoAfip ? 10 : 0)

    const certificados = taller.certificados.length
    const tiposCompletados = new Set(taller.validaciones.map(v => v.tipoDocumento.id))

    let nivelNuevo: NivelTaller = 'BRONCE'
    for (const regla of reglas) {
      const cumplePuntos = puntaje >= regla.puntosMinimos
      const cumpleAfip = !regla.requiereVerificadoAfip || taller.verificadoAfip
      const cumpleCertificados = certificados >= regla.certificadosAcademiaMin
      const niveles = nivelesIncluyenHasta(regla.nivel)
      const tiposNivel = tiposRequeridos.filter(t => niveles.includes(t.nivelMinimo))
      const cumpleDocumentos = tiposNivel.every(t => tiposCompletados.has(t.id))

      if (cumplePuntos && cumpleAfip && cumpleCertificados && cumpleDocumentos) {
        nivelNuevo = regla.nivel
        break
      }
    }

    if (nivelNuevo !== taller.nivel) {
      console.log(`  ${taller.nombre}: ${taller.nivel} -> ${nivelNuevo} (${puntaje} pts)`)
      if (!dryRun) {
        await prisma.taller.update({
          where: { id: taller.id },
          data: { nivel: nivelNuevo, puntaje },
        })
      }
      cambios++
    }
  }

  console.log(`\nTotal: ${talleres.length} talleres revisados, ${cambios} cambios${dryRun ? ' (no aplicados)' : ' aplicados'}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
