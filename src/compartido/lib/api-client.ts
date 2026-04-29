/**
 * Helper para extraer mensaje de error user-friendly de una respuesta API.
 * Maneja ambos formatos:
 *   - V3 nuevo: { error: { code, message, details?, digest? } }
 *   - Legacy:   { error: "string" }
 */
export function getErrorMessage(data: unknown, fallback = 'Algo salio mal'): string {
  if (!data || typeof data !== 'object') return fallback

  const obj = data as Record<string, unknown>

  // Formato V3: error es un objeto con message
  if (obj.error && typeof obj.error === 'object') {
    const err = obj.error as Record<string, unknown>
    if (typeof err.message === 'string') return err.message
  }

  // Formato legacy: error es un string
  if (typeof obj.error === 'string') return obj.error

  return fallback
}

/**
 * Extraer el código de error de una respuesta API V3.
 * Retorna undefined para respuestas legacy o sin código.
 */
export function getErrorCode(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const obj = data as Record<string, unknown>
  if (obj.error && typeof obj.error === 'object') {
    const err = obj.error as Record<string, unknown>
    if (typeof err.code === 'string') return err.code
  }
  return undefined
}
