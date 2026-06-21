import { NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'

// Health-check liviano para sondas externas (UptimeRobot, etc.). Devuelve 200
// si la app responde Y la DB contesta un SELECT 1; 503 si la DB falla. Es mejor
// que pingear la home (server component pesado, cacheable) porque caza caidas de
// DB que la home podria enmascarar. Distinto de /api/health/version (que solo
// reporta SHA/env sin tocar la DB).
export const runtime = 'nodejs' // Prisma necesita Node, no Edge.
export const dynamic = 'force-dynamic' // nunca cachear el resultado del check.

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json(
      { status: 'ok', db: 'up' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    // Log generico (sin el error crudo: puede traer connection string) — queda
    // en los runtime logs de Vercel para correlacionar con la alerta de uptime.
    console.error('[health] DB check failed: SELECT 1 did not respond')
    return NextResponse.json(
      { status: 'error', db: 'down' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
