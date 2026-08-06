/**
 * DRY-RUN de la migración selectiva dev→prod del piloto. READ-ONLY: no escribe nada.
 *
 * Por cada email de la lista (validada por Sergio), reporta QUÉ arrastra ese user
 * (entidad + filas relacionadas + archivos) y los FLAGS de decisión:
 *   - MOCK      : el taller es "TALLER MOCK SRL" (verificado por el mock ARCA) → se
 *                 migra con verificadoAfip=false + EN_GRACIA + inicioGracia=NOW().
 *   - MERGE     : el email YA existe en prod (caso Alan: MARCA en prod) → NO se inserta
 *                 user nuevo; su entidad se adjunta al user de prod + rol.
 *   - COLISIÓN  : el cuit del user ya existe en prod (User.cuit @unique).
 *   - MULTIROL  : tiene taller Y marca en dev → arrastra ambas entidades.
 *
 * Uso:
 *   DEV_DATABASE_URL=<session pooler :5432 de DEV> \
 *   PROD_DATABASE_URL=<session pooler :5432 de PROD>  # opcional; sin él, no chequea colisiones
 *   npx tsx scripts/migracion-piloto/dry-run.ts scripts/migracion-piloto/lista.txt
 *
 * La lista: un email por línea (# para comentarios). Si no se pasa archivo, lee de stdin.
 */
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'

function clientFor(envVar: string): PrismaClient | null {
  const url = process.env[envVar]
  if (!url) return null
  return new PrismaClient({ datasources: { db: { url } } })
}

const dev = clientFor('DEV_DATABASE_URL') ?? clientFor('DATABASE_URL')
const prod = clientFor('PROD_DATABASE_URL')

if (!dev) {
  console.error('Falta DEV_DATABASE_URL (o DATABASE_URL apuntando a DEV).')
  process.exit(1)
}

function leerEmails(): string[] {
  const arg = process.argv[2]
  const raw = arg ? readFileSync(arg, 'utf-8') : readFileSync(0, 'utf-8')
  return raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
}

async function dimensionarTaller(tallerId: string) {
  const [validaciones, conDoc, maquinaria, procesos, prendas, certificados, progreso, intentos, tallerCert] =
    await Promise.all([
      dev!.validacion.count({ where: { tallerId } }),
      dev!.validacion.count({ where: { tallerId, documentoUrl: { not: null } } }),
      dev!.maquinaria.count({ where: { tallerId } }),
      dev!.tallerProceso.count({ where: { tallerId } }),
      dev!.tallerPrenda.count({ where: { tallerId } }),
      dev!.certificado.count({ where: { tallerId } }),
      dev!.progresoCapacitacion.count({ where: { tallerId } }),
      dev!.intentoEvaluacion.count({ where: { tallerId } }),
      dev!.tallerCertificacion.count({ where: { tallerId } }),
    ])
  return { validaciones, conDoc, maquinaria, procesos, prendas, certificados, progreso, intentos, tallerCert }
}

async function main() {
  const emails = leerEmails()
  console.log(`\n=== DRY-RUN migración piloto — ${emails.length} emails ===`)
  console.log(prod ? '(chequeo de colisiones contra PROD: ON)\n' : '(sin PROD_DATABASE_URL → colisiones NO chequeadas)\n')

  const resumen = { total: emails.length, encontrados: 0, mock: 0, merge: 0, colision: 0, multirol: 0, sinUser: 0,
    docs: 0, validaciones: 0, certificados: 0 }

  for (const email of emails) {
    const u = await dev!.user.findUnique({
      where: { email },
      include: { taller: true, marca: true },
    })
    if (!u) {
      console.log(`✗ ${email} — NO existe en DEV`)
      resumen.sinUser++
      continue
    }
    resumen.encontrados++

    const flags: string[] = []
    if (u.taller?.nombre === 'TALLER MOCK SRL') { flags.push('MOCK'); resumen.mock++ }
    if (u.taller && u.marca) { flags.push('MULTIROL'); resumen.multirol++ }

    if (prod) {
      const pUser = await prod.user.findUnique({ where: { email } })
      if (pUser) { flags.push(`MERGE(prod:${pUser.roles.join('+')})`); resumen.merge++ }
      if (u.cuit) {
        const pCuit = await prod.user.findFirst({ where: { cuit: u.cuit }, select: { email: true } })
        if (pCuit && pCuit.email !== email) { flags.push(`COLISIÓN cuit→${pCuit.email}`); resumen.colision++ }
      }
    }

    console.log(`\n● ${email}  [${u.roles.join('+') || 'sin-rol'}]  ${flags.length ? '⚑ ' + flags.join(' · ') : ''}`)
    if (u.taller) {
      const d = await dimensionarTaller(u.taller.id)
      resumen.docs += d.conDoc; resumen.validaciones += d.validaciones; resumen.certificados += d.certificados
      console.log(`   TALLER "${u.taller.nombre}" cuit=${u.taller.cuit} verif=${u.taller.verificadoAfip} estado=${u.taller.estadoCuenta}`)
      console.log(`     validaciones=${d.validaciones} (con doc en storage=${d.conDoc}) · maquinaria=${d.maquinaria} · procesos=${d.procesos} · prendas=${d.prendas}`)
      console.log(`     certificados=${d.certificados} · progreso=${d.progreso} · intentos=${d.intentos} · tallerCert=${d.tallerCert}`)
    }
    if (u.marca) {
      const pedidos = await dev!.pedido.count({ where: { marcaId: u.marca.id } })
      console.log(`   MARCA "${u.marca.nombre}" cuit=${u.marca.cuit} · pedidos=${pedidos}`)
    }
    if (u.avatar) console.log(`     avatar en storage: ${u.avatar}`)
  }

  console.log(`\n=== RESUMEN ===`)
  console.log(JSON.stringify(resumen, null, 2))
  console.log(`\nArchivos de 'documentos' a copiar (Storage API, mismo path): ${resumen.docs}`)
  console.log(`Flags a resolver: MOCK=${resumen.mock} · MERGE(Alan)=${resumen.merge} · COLISIÓN=${resumen.colision} · MULTIROL=${resumen.multirol}`)
  if (resumen.sinUser) console.log(`⚠️  ${resumen.sinUser} emails NO existen en DEV — revisar con Sergio antes de migrar.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await dev?.$disconnect(); await prod?.$disconnect() })
