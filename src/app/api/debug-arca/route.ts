import { NextResponse } from 'next/server'

// TEMPORAL — eliminar después de validar la integración ARCA
export async function GET() {
  const cert = process.env.AFIP_CERT ?? ''
  const key = process.env.AFIP_KEY ?? ''
  const token = process.env.AFIP_SDK_TOKEN ?? ''
  const cuit = process.env.AFIP_CUIT_PLATAFORMA ?? ''
  const env = process.env.AFIP_SDK_ENV ?? ''
  const enabled = process.env.ARCA_ENABLED ?? ''

  return NextResponse.json({
    token_length: token.length,
    token_first10: token.substring(0, 10),
    cert_length: cert.length,
    cert_has_begin: cert.includes('BEGIN CERTIFICATE'),
    cert_lines: cert.split('\n').length,
    key_length: key.length,
    key_has_begin: key.includes('BEGIN PRIVATE KEY'),
    key_lines: key.split('\n').length,
    cuit,
    env,
    enabled,
  })
}
