import { NextRequest, NextResponse } from 'next/server'
import { generateQrBuffer } from '@/compartido/lib/qr'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    if (!code?.trim()) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
    }
    const png = await generateQrBuffer(code)
    return new NextResponse(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Error en GET /api/qr/[code]:', error)
    return NextResponse.json({ error: 'Error al generar QR' }, { status: 500 })
  }
}
