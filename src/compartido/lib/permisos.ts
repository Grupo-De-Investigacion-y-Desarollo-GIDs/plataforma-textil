import { auth } from './auth'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { tieneAlgunRol, modoActivo, type Rol } from './roles'

type RolPermitido = Rol

/**
 * Para uso en Server Components.
 * Verifica que el usuario tiene MEMBRESÍA en alguno de los roles permitidos
 * (decisión D1/A: gating por roles[], no por el escalar role).
 * Redirige a /login si no hay sesion, a /unauthorized si no tiene el rol.
 */
export async function requiereRol(rolesPermitidos: RolPermitido[]) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  if (!tieneAlgunRol(session.user, rolesPermitidos)) {
    redirect('/unauthorized')
  }
  return session
}

/**
 * Para uso en API routes.
 * Retorna la sesion validada o un NextResponse con error estructurado.
 * Formato del 403 preparado para Q-03 (errores consistentes).
 */
export async function requiereRolApi(
  rolesPermitidos: RolPermitido[]
): Promise<NextResponse | { userId: string; role: string }> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!tieneAlgunRol(session.user, rolesPermitidos)) {
    return NextResponse.json(
      {
        error: `Requiere rol: ${rolesPermitidos.join(' o ')}`,
        code: 'INSUFFICIENT_ROLE',
        rolesRequeridos: rolesPermitidos,
      },
      { status: 403 }
    )
  }
  // role == activeMode (invariante de back-compat). Los consumidores que ya
  // usaban .role siguen viendo el modo actuante.
  return { userId: session.user.id!, role: (modoActivo(session.user) ?? '') as string }
}

// Re-export de las primitivas para componentes y branches de UI que necesitan
// leer el modo/membresía sin redirigir.
export { modoActivo, tieneAlgunRol, rolesEfectivos } from './roles'
export type { Rol } from './roles'
