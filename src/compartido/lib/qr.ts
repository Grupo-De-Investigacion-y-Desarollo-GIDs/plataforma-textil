import QRCode from 'qrcode'

export function getCertificadoUrl(codigo: string): string {
  const base = process.env.NEXTAUTH_URL ?? ''
  return `${base}/verificar?code=${encodeURIComponent(codigo)}`
}

export async function generateQrDataUrl(codigo: string): Promise<string> {
  return QRCode.toDataURL(getCertificadoUrl(codigo), {
    width: 300,
    margin: 2,
    color: { dark: '#1e3a5f', light: '#ffffff' },
  })
}

export async function generateQrBuffer(codigo: string): Promise<Buffer> {
  return QRCode.toBuffer(getCertificadoUrl(codigo), {
    type: 'png',
    width: 300,
    margin: 2,
    color: { dark: '#1e3a5f', light: '#ffffff' },
  })
}
