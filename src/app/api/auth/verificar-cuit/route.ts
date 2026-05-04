import { NextRequest, NextResponse } from 'next/server'
import { consultarPadron, mensajeErrorArca, errorBloqueaRegistro } from '@/compartido/lib/arca'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'

// GET /api/auth/verificar-cuit?cuit=XXXXXXXXXXX
// No requiere autenticacion — se usa durante el registro (on blur)
export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const blocked = await rateLimit(req, 'verificarCuit', ip)
  if (blocked) return blocked

  try {
    const cuit = req.nextUrl.searchParams.get('cuit')
    if (!cuit || cuit.replace(/-/g, '').length !== 11) {
      return NextResponse.json({ valid: false, error: 'CUIT invalido' }, { status: 400 })
    }

    const resultado = await consultarPadron(cuit)

    if (resultado.exitosa && resultado.datos) {
      return NextResponse.json({
        valid: true,
        razonSocial: resultado.datos.nombre,
        domicilio: resultado.datos.domicilioFiscal?.calle,
        tipoInscripcion: resultado.datos.tipoInscripcion,
        estadoCuit: resultado.datos.estadoCuit,
      })
    }

    const bloquea = resultado.error ? errorBloqueaRegistro(resultado.error) : false
    return NextResponse.json({
      valid: false,
      error: resultado.error ? mensajeErrorArca(resultado.error) : 'Error al verificar CUIT',
      codigo: resultado.error,
      bloquea,
    }, { status: bloquea ? 400 : 200 })
  } catch {
    return NextResponse.json({ valid: false, error: 'Error interno' }, { status: 500 })
  }
}
