import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/stats/public — contadores públicos sin datos sensibles
export async function GET() {
  try {
    const [talleres, marcas, certificados] = await Promise.all([
      prisma.taller.count(),
      prisma.marca.count(),
      prisma.certificado.count({ where: { revocado: false } }),
    ])

    return NextResponse.json({ talleres, marcas, certificados })
  } catch {
    // Fallback si la DB no responde
    return NextResponse.json({ talleres: 0, marcas: 0, certificados: 0 })
  }
}
