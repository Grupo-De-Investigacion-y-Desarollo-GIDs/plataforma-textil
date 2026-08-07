// Spec v4-a: proteger el registro fuera de PRODUCTION (preview/dev tienen URL pública
// y base DEV → cualquiera crea cuentas). Gate por ambiente + allowlist, con MODO_EVENTO
// para relajarlo durante el evento OIT. Módulo PURO (solo lee env), testeable sin red/DB.

export type ModoRegistro = 'abierto' | 'allowlist' | 'evento'

/** URL pública del registro de PRODUCCIÓN (a donde se dirige a la gente real). */
export const URL_REGISTRO_PROD = 'https://plataformatextil.com.ar/registro'

/**
 * Copy del 403 cuando el gate bloquea un registro fuera de prod. Incluye el enlace a
 * producción para redirigir a la persona: durante el piloto circuló el link de dev y
 * hubo altas que se creyeron hechas y quedaron rebotadas por el gate (Pampa/Pura Sangre).
 */
export const MENSAJE_REGISTRO_RESTRINGIDO =
  'El registro en este ambiente de pruebas está limitado. Para registrarte en la ' +
  `Plataforma Digital Textil, ingresá en ${URL_REGISTRO_PROD}`

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

/**
 * true si el email usa un TLD reservado de test (RFC 2606/6761): `.test`, `.example`,
 * `.invalid`, `.localhost`. Son sintéticos y no enrutables a una persona real; los e2e
 * de registro usan `@*.test`. Se permiten en modo allowlist para que el CI corra sin
 * abrir el gate a emails reales (una cuenta `@x.test` es basura no-entregable, no un leak).
 */
export function esEmailDeTest(email: string): boolean {
  return /\.(test|example|invalid|localhost)$/i.test(email.trim())
}
