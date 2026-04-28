import { describe, it, expect } from 'vitest'
import {
  MAGIC_BYTES,
  detectarTipoArchivo,
  sanitizarNombreArchivo,
  esNombreSeguro,
} from '@/compartido/lib/file-validation'

// Helpers para crear buffers con magic bytes reales
function hexToBuffer(hex: string, padTo = 16): Buffer {
  const bytes = Buffer.from(hex, 'hex')
  if (bytes.length >= padTo) return bytes
  return Buffer.concat([bytes, Buffer.alloc(padTo - bytes.length)])
}

function asciiPrefixBuffer(ascii: string, padTo = 16): Buffer {
  const bytes = Buffer.from(ascii, 'ascii')
  if (bytes.length >= padTo) return bytes
  return Buffer.concat([bytes, Buffer.alloc(padTo - bytes.length)])
}

describe('detectarTipoArchivo — magic bytes', () => {
  it('detecta PDF (%PDF / 25504446)', () => {
    const buffer = hexToBuffer('255044462d312e34')
    expect(detectarTipoArchivo(buffer, ['pdf'])).toBe('pdf')
  })

  it('detecta JPEG (FF D8 FF)', () => {
    const buffer = hexToBuffer('ffd8ffe0')
    expect(detectarTipoArchivo(buffer, ['jpeg'])).toBe('jpeg')
  })

  it('detecta PNG (89504E47...)', () => {
    const buffer = hexToBuffer('89504e470d0a1a0a')
    expect(detectarTipoArchivo(buffer, ['png'])).toBe('png')
  })

  it('detecta WebP (RIFF....WEBP)', () => {
    // RIFF + 4 bytes de tamano + WEBP
    const riff = Buffer.from('RIFF', 'ascii')
    const size = Buffer.alloc(4) // tamano placeholder
    const webp = Buffer.from('WEBP', 'ascii')
    const buffer = Buffer.concat([riff, size, webp, Buffer.alloc(4)])
    expect(detectarTipoArchivo(buffer, ['webp'])).toBe('webp')
  })

  it('detecta XLSX (PK\\x03\\x04 — ZIP signature)', () => {
    const buffer = hexToBuffer('504b0304')
    expect(detectarTipoArchivo(buffer, ['xlsx'])).toBe('xlsx')
  })

  it('detecta MP4 (ftyp en offset 4)', () => {
    // 4 bytes de tamano + "ftyp"
    const size = Buffer.alloc(4)
    const ftyp = Buffer.from('ftyp', 'ascii')
    const buffer = Buffer.concat([size, ftyp, Buffer.alloc(8)])
    expect(detectarTipoArchivo(buffer, ['mp4'])).toBe('mp4')
  })

  it('detecta MOV (moov en offset 4)', () => {
    const size = Buffer.alloc(4)
    const moov = Buffer.from('moov', 'ascii')
    const buffer = Buffer.concat([size, moov, Buffer.alloc(8)])
    expect(detectarTipoArchivo(buffer, ['mov'])).toBe('mov')
  })

  it('rechaza EXE (MZ header 4D5A) — no matchea ningun tipo', () => {
    const buffer = hexToBuffer('4d5a9000')
    expect(detectarTipoArchivo(buffer, ['pdf', 'jpeg', 'png', 'webp'])).toBeNull()
  })

  it('rechaza bytes aleatorios', () => {
    const buffer = hexToBuffer('deadbeefcafebabe')
    expect(detectarTipoArchivo(buffer, ['pdf', 'jpeg', 'png', 'webp'])).toBeNull()
  })

  it('rechaza buffer vacio (0 bytes)', () => {
    const buffer = Buffer.alloc(0)
    expect(detectarTipoArchivo(buffer, ['pdf', 'jpeg', 'png'])).toBeNull()
  })

  it('MIME spoofing: buffer JPEG con tipos=[pdf] retorna null', () => {
    // Magic bytes son de JPEG pero solo permitimos PDF
    const buffer = hexToBuffer('ffd8ffe0')
    expect(detectarTipoArchivo(buffer, ['pdf'])).toBeNull()
  })
})

describe('sanitizarNombreArchivo', () => {
  it('limpia path traversal (../)', () => {
    const resultado = sanitizarNombreArchivo('../../../etc/passwd')
    expect(resultado).not.toContain('..')
    expect(resultado).not.toContain('/')
  })

  it('reemplaza caracteres especiales <>:"|?* con _', () => {
    const resultado = sanitizarNombreArchivo('file<name>:test|doc?.pdf')
    expect(resultado).not.toMatch(/[<>:"|?*]/)
    expect(resultado).toContain('_')
  })

  it('trunca a 200 caracteres', () => {
    const nombre = 'a'.repeat(300) + '.pdf'
    const resultado = sanitizarNombreArchivo(nombre)
    expect(resultado.length).toBeLessThanOrEqual(200)
  })

  it('elimina caracteres de control', () => {
    const resultado = sanitizarNombreArchivo('file\x00name\x1f.pdf')
    expect(resultado).not.toMatch(/[\x00-\x1f\x7f]/)
    expect(resultado).toContain('filename')
  })
})

describe('esNombreSeguro', () => {
  it('rechaza ../hack.pdf (path traversal)', () => {
    expect(esNombreSeguro('../hack.pdf')).toBe(false)
  })

  it('rechaza C:\\server\\file (backslashes)', () => {
    expect(esNombreSeguro('C:\\server\\file')).toBe(false)
  })

  it('rechaza ... (solo dots)', () => {
    expect(esNombreSeguro('...')).toBe(false)
  })

  it('acepta documento-2026.pdf (nombre normal)', () => {
    expect(esNombreSeguro('documento-2026.pdf')).toBe(true)
  })

  it('rechaza nombres con solo espacios', () => {
    expect(esNombreSeguro('   ')).toBe(false)
  })
})
