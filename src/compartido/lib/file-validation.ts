import { prisma } from './prisma'
import type { ConfiguracionUpload } from '@prisma/client'

export type TipoArchivoSoportado =
  | 'pdf' | 'jpeg' | 'png' | 'webp'
  | 'xlsx' | 'docx' | 'mp4' | 'mov'

/**
 * Detectores de magic bytes por tipo de archivo.
 * Cada función recibe un Buffer de al menos 16 bytes y retorna true si matchea.
 */
export const MAGIC_BYTES: Record<TipoArchivoSoportado, (buffer: Buffer) => boolean> = {
  pdf: (b) => b.length >= 4 && b.slice(0, 4).toString('hex') === '25504446',
  jpeg: (b) => b.length >= 3 && b.slice(0, 3).toString('hex') === 'ffd8ff',
  png: (b) => b.length >= 8 && b.slice(0, 8).toString('hex') === '89504e470d0a1a0a',
  webp: (b) =>
    b.length >= 12 &&
    b.slice(0, 4).toString('ascii') === 'RIFF' &&
    b.slice(8, 12).toString('ascii') === 'WEBP',
  xlsx: (b) => b.length >= 4 && b.slice(0, 4).toString('hex') === '504b0304',
  docx: (b) => b.length >= 4 && b.slice(0, 4).toString('hex') === '504b0304',
  mp4: (b) => b.length >= 8 && b.slice(4, 8).toString('ascii') === 'ftyp',
  mov: (b) => {
    if (b.length < 8) return false
    const type = b.slice(4, 8).toString('ascii')
    return type === 'ftyp' || type === 'moov' || type === 'mdat'
  },
}

/**
 * Detecta el tipo real de un archivo por sus magic bytes.
 * Solo busca entre los tipos permitidos.
 * Retorna el tipo detectado o null si no matchea ninguno.
 */
export function detectarTipoArchivo(
  buffer: Buffer,
  tiposPermitidos: string[]
): TipoArchivoSoportado | null {
  for (const tipo of tiposPermitidos) {
    if (tipo in MAGIC_BYTES && MAGIC_BYTES[tipo as TipoArchivoSoportado](buffer)) {
      return tipo as TipoArchivoSoportado
    }
  }
  return null
}

// Cache de configuraciones en memoria (1 minuto)
const cacheConfigs = new Map<string, { data: ConfiguracionUpload; expira: number }>()
const CACHE_TTL_MS = 60 * 1000

async function obtenerConfig(contexto: string): Promise<ConfiguracionUpload | null> {
  const ahora = Date.now()
  const cached = cacheConfigs.get(contexto)

  if (cached && cached.expira > ahora) {
    return cached.data
  }

  const config = await prisma.configuracionUpload.findUnique({
    where: { contexto },
  })

  if (config) {
    cacheConfigs.set(contexto, { data: config, expira: ahora + CACHE_TTL_MS })
  }

  return config
}

export interface FileValidationResult {
  valid: boolean
  error?: string
  tipoDetectado?: TipoArchivoSoportado
}

/**
 * Valida un archivo segun la configuracion de su contexto.
 * Fail-closed: si no hay config para el contexto, rechaza por defecto.
 */
export async function validarArchivo(
  file: File,
  contexto: string
): Promise<FileValidationResult> {
  const config = await obtenerConfig(contexto)

  if (!config || !config.activo) {
    return {
      valid: false,
      error: 'Subida de archivos no habilitada para este contexto. Contacta al administrador.',
    }
  }

  // Validar tamano
  const tamanoMaximoBytes = config.tamanoMaximoMB * 1024 * 1024
  if (file.size > tamanoMaximoBytes) {
    return {
      valid: false,
      error: `El archivo supera el tamano maximo de ${config.tamanoMaximoMB} MB`,
    }
  }

  if (file.size === 0) {
    return { valid: false, error: 'El archivo esta vacio' }
  }

  // Leer primeros 16 bytes para magic bytes
  const buffer = Buffer.from(await file.slice(0, 16).arrayBuffer())

  // Detectar tipo real
  const tipoDetectado = detectarTipoArchivo(buffer, config.tiposPermitidos)

  if (!tipoDetectado) {
    const permitidos = config.tiposPermitidos.join(', ').toUpperCase()
    return {
      valid: false,
      error: `Formato no soportado. Aceptamos: ${permitidos}`,
    }
  }

  // Validar nombre
  if (!esNombreSeguro(file.name)) {
    return {
      valid: false,
      error: 'El nombre del archivo contiene caracteres no permitidos',
    }
  }

  return { valid: true, tipoDetectado }
}

export function sanitizarNombreArchivo(nombre: string): string {
  return nombre
    .replace(/[\/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/[<>:"|?*]/g, '_')
    .trim()
    .slice(0, 200)
}

export function esNombreSeguro(nombre: string): boolean {
  if (nombre.includes('/') || nombre.includes('\\') || nombre.includes('..')) return false
  if (/^[\s.]+$/.test(nombre)) return false
  if (!/[a-zA-Z0-9]/.test(nombre)) return false
  return true
}

/**
 * Invalida el cache de configuraciones.
 * Llamar desde el endpoint PUT despues de actualizar una config.
 */
export function invalidarCacheConfigs() {
  cacheConfigs.clear()
}
