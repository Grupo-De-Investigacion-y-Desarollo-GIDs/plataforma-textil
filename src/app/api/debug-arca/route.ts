import { NextResponse } from 'next/server'
import Afip from '@afipsdk/afip.js'

// TEMPORAL — eliminar después de validar la integración ARCA
export async function GET(req: Request) {
  const url = new URL(req.url)
  const cuit = url.searchParams.get('cuit')

  if (!cuit) {
    const cert = process.env.AFIP_CERT ?? ''
    const key = process.env.AFIP_KEY ?? ''
    const token = process.env.AFIP_SDK_TOKEN ?? ''
    return NextResponse.json({
      token_length: token.length,
      token_first10: token.substring(0, 10),
      cert_length: cert.length,
      cert_has_begin: cert.includes('BEGIN CERTIFICATE'),
      key_length: key.length,
      key_has_begin: key.includes('BEGIN PRIVATE KEY'),
      cuit: process.env.AFIP_CUIT_PLATAFORMA,
      env: process.env.AFIP_SDK_ENV,
      enabled: process.env.ARCA_ENABLED,
    })
  }

  // Si se pasa ?cuit=XXXX, hacer consulta real y devolver response crudo
  try {
    const afip = new Afip({
      CUIT: process.env.AFIP_CUIT_PLATAFORMA!,
      production: process.env.AFIP_SDK_ENV?.trim() === 'production',
      access_token: process.env.AFIP_SDK_TOKEN!,
      ...(process.env.AFIP_CERT && process.env.AFIP_KEY
        ? { cert: process.env.AFIP_CERT, key: process.env.AFIP_KEY }
        : {}),
    })

    const cuitNum = parseInt(cuit.replace(/-/g, ''), 10)
    const result = await afip.RegisterScopeThirteen.getTaxpayerDetails(cuitNum)

    return NextResponse.json({
      cuit,
      found: result !== null,
      raw_keys: result ? Object.keys(result) : null,
      raw: result,
    })
  } catch (e: unknown) {
    const err = e as { message?: string; status?: number; data?: unknown }
    return NextResponse.json({
      cuit,
      error: err.message,
      status: err.status,
      data: err.data,
    }, { status: 500 })
  }
}
