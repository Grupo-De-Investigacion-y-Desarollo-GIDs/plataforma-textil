// Cuentas demo del evento (y del seed en general): se identifican por el dominio
// institucional `@pdt.org.ar`. Ningún usuario real usa ese dominio (los del piloto son
// gmail/propios), así que el chequeo por sufijo es seguro y no necesita cambio de schema.
//
// Motivo: durante el evento varias tablets rotan sobre las mismas cuentas demo. Si un
// visitante cambia la contraseña (o el email) de una cuenta, rompe la tablet siguiente.
// El guard bloquea el cambio de credenciales para estas cuentas.

export const DOMINIO_DEMO = '@pdt.org.ar'

/** true si el email pertenece a una cuenta demo/seed (dominio institucional). */
export function esCuentaDemo(email: string | null | undefined): boolean {
  return typeof email === 'string' && email.trim().toLowerCase().endsWith(DOMINIO_DEMO)
}

/** Mensaje del 403 cuando se intenta cambiar la credencial de una cuenta demo. */
export const MENSAJE_CUENTA_DEMO =
  'Esta es una cuenta de demostración: no se puede cambiar la contraseña ni el correo.'
