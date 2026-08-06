// Spec v4-a: proteger el registro fuera de PRODUCTION (preview/dev tienen URL pública
// y base DEV → cualquiera crea cuentas). Gate por ambiente + allowlist, con MODO_EVENTO
// para relajarlo durante el evento OIT. Módulo PURO (solo lee env), testeable sin red/DB.

export type ModoRegistro = 'abierto' | 'allowlist' | 'evento'

/** Modo según ambiente + flag. En production siempre 'abierto' (no-op, sin cambio). */
export function modoRegistro(env: NodeJS.ProcessEnv = process.env): ModoRegistro {
  if (env.VERCEL_ENV === 'production') return 'abierto'
  if (env.MODO_EVENTO === 'on') return 'evento'
  return 'allowlist'
}

/**
 * true si el email pasa la allowlist (`REGISTRO_ALLOWLIST`, CSV). Entradas que empiezan
 * con `@` son dominios (match por sufijo); el resto, emails exactos. Vacía ⇒ false
 * (deny by default).
 */
export function emailPermitido(email: string, csv: string = process.env.REGISTRO_ALLOWLIST ?? ''): boolean {
  const e = email.trim().toLowerCase()
  const entradas = csv.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  return entradas.some(entrada =>
    entrada.startsWith('@') ? e.endsWith(entrada) : e === entrada
  )
}
