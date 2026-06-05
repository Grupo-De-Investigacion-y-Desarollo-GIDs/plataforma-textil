// Preflight de seguridad: bloquea comandos Prisma destructivos contra PROD.
//
// Por qué existe: el Prisma CLI lee `.env` (no `.env.local`). Si `.env` apunta a
// PROD, un `prisma migrate/push/reset` local le pega a produccion por defecto.
// Este guard se ejecuta ANTES del comando Prisma (ver wrappers db:* en package.json)
// y aborta si DATABASE_URL apunta al ref de prod, salvo opt-in explicito ALLOW_PROD=1.
//
// Uso: se invoca via los scripts `db:migrate`, `db:push`, `db:reset`.
// Bypass deliberado: ALLOW_PROD=1 npm run db:migrate
//
// Ejecutar: npx tsx scripts/check-db-ref.ts

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PROD_REF = 'nefbhacmjrzynnhvgfnl' // ref de prod, ver .claude/specs/handover/DECISIONS.md

// Resuelve DATABASE_URL igual que el Prisma CLI: process.env tiene prioridad
// (ej. pasada inline al comando), y si no, se parsea `.env`.
function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  try {
    const env = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
    const match = env.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\n]+)["']?/m)
    return match?.[1] ?? ''
  } catch {
    return ''
  }
}

const dbUrl = resolveDatabaseUrl()

if (!dbUrl) {
  // Sin URL no hay ref de prod que detectar; el comando Prisma fallara por su
  // cuenta si realmente falta. No bloqueamos por "no se pudo determinar".
  console.warn('⚠️  check-db-ref: no se pudo resolver DATABASE_URL (ni en process.env ni en .env). No se bloquea.')
  process.exit(0)
}

const isProdDb = dbUrl.includes(PROD_REF)

if (isProdDb && process.env.ALLOW_PROD !== '1') {
  console.error('')
  console.error('🔴 Comando BLOQUEADO: DATABASE_URL apunta a PROD (' + PROD_REF + ').')
  console.error('   Estabas por correr un comando Prisma destructivo contra PRODUCCION.')
  console.error('')
  console.error('   - Si es DELIBERADO: repeti con  ALLOW_PROD=1  al frente del comando.')
  console.error('   - Si no: configura .env para apuntar a DEV (mismas vars que .env.local).')
  console.error('')
  process.exit(1)
}

if (isProdDb) {
  console.warn('⚠️  ALLOW_PROD=1 detectado — ejecutando contra PROD deliberadamente.')
} else {
  console.log('✅ check-db-ref: DATABASE_URL no apunta a PROD. OK.')
}

process.exit(0)
