// Helper ÚNICO para leer/firmar/setear la cookie de sesión JWT de Auth.js v5.
//
// Por qué existe (B-05): bajo `strategy: 'jwt'`, Auth.js v5 re-firma y re-emite la
// cookie en CADA lectura de sesión (el middleware era el escritor dominante). Una
// navegación que transportaba la cookie vieja podía pisar una actualización
// concurrente de `update()` (last-write-wins en el cookie jar) → el usuario quedaba
// en el modo viejo hasta re-login. El fix mueve la escritura autoritativa al
// servidor: los endpoints de mutación (active-mode, me/roles) setean la cookie ya
// actualizada en la MISMA response, y el middleware pasa a leer sin re-emitir.
//
// Este módulo centraliza el patrón que antes vivía inline en `app/n/[token]/route.ts`
// (encode + Set-Cookie) para que haya UNA sola implementación del firmado de cookie
// en todo el repo. Es Edge-safe (encode/decode de next-auth/jwt usan jose) → lo puede
// importar tanto el middleware (Edge) como las route handlers (Node).

import { encode, decode } from 'next-auth/jwt'
import type { UserRole } from '@prisma/client'

const isProduction = process.env.NODE_ENV === 'production'

// DEBE coincidir con `cookies.sessionToken.name` de auth.config.ts. Auth.js v5 usa
// el nombre de la cookie como `salt` del cifrado (ver @auth/core session.js), así que
// este valor es a la vez el nombre de la cookie y el salt de encode/decode.
export const SESSION_COOKIE_NAME = isProduction
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

// 7 días: igual que `session.maxAge` de auth.config.ts.
const SESSION_MAX_AGE = 7 * 24 * 60 * 60

// Roles que un usuario puede auto-asignarse vía cambio de sesión. Los de equipo
// (ADMIN/ESTADO/CONTENIDO) NUNCA se suman desde un delta → anti-escalación.
const ROLES_OPERATIVOS = ['TALLER', 'MARCA']

function secret(): string {
  return process.env.NEXTAUTH_SECRET as string
}

// Payload del token de sesión (lo que setea el callback jwt de auth.config.ts).
export interface SessionTokenPayload {
  [key: string]: unknown
  id?: string
  role?: string | null
  roles?: string[] | null
  activeMode?: string | null
  registroCompleto?: boolean
}

// Delta autoritativo (ya confirmado en DB por el endpoint) a aplicar sobre el token.
export interface CambioSesion {
  activeMode?: string | null
  /** Roles a SUMAR (union). Los no-operativos se filtran (anti-escalación). */
  roles?: string[] | null
}

/** encode del token con el salt/secret/maxAge correctos. */
export async function encodeSessionToken(token: SessionTokenPayload): Promise<string> {
  return encode({ token, salt: SESSION_COOKIE_NAME, secret: secret(), maxAge: SESSION_MAX_AGE })
}

/** decode read-only de una cookie de sesión. Devuelve null si falta o es inválida. */
export async function decodeSessionToken(
  raw: string | undefined | null,
): Promise<SessionTokenPayload | null> {
  if (!raw) return null
  try {
    return (await decode({ token: raw, salt: SESSION_COOKIE_NAME, secret: secret() })) as
      | SessionTokenPayload
      | null
  } catch {
    // Token expirado / secret rotado / corrupto → tratar como no logueado.
    return null
  }
}

/**
 * Construye el token nuevo desde el token ACTUAL + el delta confirmado en DB.
 * MISMA semántica que la rama `trigger === 'update'` del callback jwt de
 * auth.config.ts (incluido el filtro anti-escalación): los roles solo se EXPANDEN
 * con roles operativos; el activeMode solo se acepta si pertenece a los roles
 * resultantes; se preserva la invariante role == activeMode.
 */
export function mergeSessionDelta(
  token: SessionTokenPayload,
  delta: CambioSesion,
): SessionTokenPayload {
  const out: SessionTokenPayload = { ...token }

  if (Array.isArray(delta.roles)) {
    const previos = Array.isArray(out.roles) ? out.roles : []
    out.roles = Array.from(
      new Set([...previos, ...delta.roles.filter((r) => ROLES_OPERATIVOS.includes(r))]),
    )
  }

  const nuevo = delta.activeMode
  const rolesActuales = Array.isArray(out.roles) ? out.roles : []
  if (nuevo && rolesActuales.includes(nuevo)) {
    out.activeMode = nuevo
    out.role = nuevo // invariante role == activeMode (back-compat U-03)
  }

  return out
}

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
}

// Tipo mínimo: cualquier respuesta con un cookie store estilo NextResponse.
interface ConCookies {
  cookies: { set: (opts: { name: string; value: string } & typeof SESSION_COOKIE_OPTIONS) => unknown }
}

/** Firma `token` y lo setea como cookie de sesión en `res` (mismo response). */
export async function setSessionCookie<T extends ConCookies>(
  res: T,
  token: SessionTokenPayload,
): Promise<T> {
  const value = await encodeSessionToken(token)
  res.cookies.set({ name: SESSION_COOKIE_NAME, value, ...SESSION_COOKIE_OPTIONS })
  return res
}

// Re-export para callers que quieran el tipo de rol fuerte sin reimportar.
export type { UserRole }
