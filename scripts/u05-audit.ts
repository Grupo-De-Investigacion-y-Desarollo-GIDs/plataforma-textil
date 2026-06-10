// U-05: auditoría del invariante roles[]/activeMode en User.
//
// Invariante objetivo (single y multi-rol):
//   - cardinality(roles) >= 1  (nunca vacío)
//   - activeMode != null
//   - role ∈ roles  y  activeMode ∈ roles
//
// Modos:
//   --dry-run (default): imprime el cuadro de estado actual (counts). NO escribe nada.
//   --verify           : valida las post-condiciones; sale con código ≠0 si alguna falla
//                        (pensado para usar tras aplicar la migración / re-seed).
//
// Guard anti-PROD: bloquea contra prod salvo ALLOW_PROD=1 (este script es de SOLO
// LECTURA, pero mantenemos el guard por consistencia con check-db-ref.ts y para que
// nadie lo confunda con un script de escritura). Espeja el ref de scripts/check-db-ref.ts.
//
// Ejecutar:
//   npx tsx scripts/u05-audit.ts            # dry-run (default)
//   npx tsx scripts/u05-audit.ts --verify   # post-condición (CI/manual post-migración)

import { PrismaClient, type UserRole } from '@prisma/client'

const PROD_REF = 'nefbhacmjrzynnhvgfnl' // ref de prod, ver scripts/check-db-ref.ts
const dbUrl = process.env.DATABASE_URL ?? ''
if (dbUrl.includes(PROD_REF) && process.env.ALLOW_PROD !== '1') {
  console.error('🔴 BLOQUEADO: DATABASE_URL apunta a PROD. Repetí con ALLOW_PROD=1 (solo lectura) si es deliberado.')
  process.exit(1)
}

const prisma = new PrismaClient()

const mode = process.argv.includes('--verify') ? 'verify' : 'dry-run'

type Row = { id: string; email: string; role: UserRole; roles: UserRole[]; activeMode: UserRole | null }

async function main() {
  const users: Row[] = await prisma.user.findMany({
    select: { id: true, email: true, role: true, roles: true, activeMode: true },
    orderBy: { email: 'asc' },
  })

  const sinRoles = users.filter((u) => u.roles.length === 0)
  const sinActiveMode = users.filter((u) => u.activeMode === null)
  // Inconsistencias de invariante (solo entre los que tienen datos): role no está en
  // roles, o activeMode no está en roles. No las "arregla" la migración (sus WHERE solo
  // tocan vacío/null); las reportamos para decisión informada.
  const roleFueraDeRoles = users.filter((u) => u.roles.length > 0 && !u.roles.includes(u.role))
  const activeModeFueraDeRoles = users.filter(
    (u) => u.activeMode !== null && u.roles.length > 0 && !u.roles.includes(u.activeMode),
  )

  console.log(`\n📊 U-05 auditoría (${mode}) — ${users.length} users en total\n`)
  console.log(`  roles=[] (vacío)         : ${sinRoles.length}`)
  console.log(`  activeMode=null          : ${sinActiveMode.length}`)
  console.log(`  role ∉ roles             : ${roleFueraDeRoles.length}`)
  console.log(`  activeMode ∉ roles       : ${activeModeFueraDeRoles.length}`)

  if (sinRoles.length) {
    console.log('\n  Users con roles=[] (la migración les pondría roles=[role]):')
    for (const u of sinRoles) console.log(`    - ${u.email}  role=${u.role}`)
  }
  if (sinActiveMode.length) {
    console.log('\n  Users con activeMode=null (la migración les pondría activeMode=role):')
    for (const u of sinActiveMode) console.log(`    - ${u.email}  role=${u.role}`)
  }
  if (roleFueraDeRoles.length || activeModeFueraDeRoles.length) {
    console.log('\n  ⚠️  Inconsistencias que la migración NO toca (revisar a mano si aparecen):')
    for (const u of roleFueraDeRoles) console.log(`    - ${u.email}  role=${u.role} ∉ roles=[${u.roles.join(',')}]`)
    for (const u of activeModeFueraDeRoles)
      console.log(`    - ${u.email}  activeMode=${u.activeMode} ∉ roles=[${u.roles.join(',')}]`)
  }

  if (mode === 'verify') {
    const fallas = sinRoles.length + sinActiveMode.length + roleFueraDeRoles.length + activeModeFueraDeRoles.length
    if (fallas > 0) {
      console.error(`\n❌ verify FALLÓ: ${fallas} violaciones de invariante.\n`)
      process.exit(1)
    }
    console.log('\n✅ verify OK: invariante roles[]/activeMode satisfecho por el 100% de los users.\n')
  } else {
    console.log('\n(dry-run: no se escribió nada. La migración SQL aplica el backfill en el build / db:migrate.)\n')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
