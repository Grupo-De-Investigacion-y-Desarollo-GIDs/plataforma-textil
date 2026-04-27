import { NextRequest, NextResponse } from 'next/server'
import { verificarCuit } from '@/compartido/lib/afip'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'

// GET /api/auth/verificar-cuit?cuit=XXXXXXXXXXX
// No requiere autenticacion — se usa durante el registro
export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const blocked = await rateLimit(req, 'verificarCuit', ip)
  if (blocked) return blocked

  try {
    const cuit = req.nextUrl.searchParams.get('cuit')
    if (!cuit || cuit.replace(/-/g, '').length !== 11) {
      return NextResponse.json({ valid: false, error: 'CUIT invalido' }, { status: 400 })
    }
    const result = await verificarCuit(cuit)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ valid: false, error: 'Error interno' }, { status: 500 })
  }
}
