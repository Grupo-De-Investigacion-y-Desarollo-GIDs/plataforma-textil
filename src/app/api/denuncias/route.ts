import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { getFeatureFlag } from '@/compartido/lib/features'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'

// K-05/§6.8: el GET (list admin/estado) era codigo muerto — no hay panel que lo
// consuma y el master no preve uno (G-14 hasta evalua deshabilitar denuncias). Se
// elimino. El POST (denuncia anonima) y /api/denuncias/[codigo] (tracking) siguen vivos.

// POST queda publico para denuncias anonimas
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const blocked = await rateLimit(req, 'denuncias', ip)
  if (blocked) return blocked

  try {
    if (!await getFeatureFlag('denuncias')) {
      return NextResponse.json({ error: 'Funcionalidad no disponible' }, { status: 503 })
    }

    const body = await req.json()
    const count = await prisma.denuncia.count()
    const codigo = `DEN-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`

    const denuncia = await prisma.denuncia.create({
      data: {
        tipo: body.tipo,
        tallerId: body.tallerId || null,
        descripcion: body.descripcion,
        anonima: body.anonima ?? true,
        codigo,
        evidenciaUrl: body.evidenciaUrl,
      },
    })
    return NextResponse.json(denuncia, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear denuncia' }, { status: 500 })
  }
}
