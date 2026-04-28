import { auth } from './auth'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

type RolPermitido = 'ADMIN' | 'ESTADO' | 'CONTENIDO' | 'MARCA' | 'TALLER'

/**
 * Para uso en Server Components.
 * Verifica que el usuario tiene uno de los roles permitidos.
 * Redirige a /login si no hay sesion, a /unauthorized si el rol no coincide.
 */
export async function requiereRol(rolesPermitidos: RolPermitido[]) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  const role = (session.user as { role?: string }).role as string
  if (!rolesPermitidos.includes(role as RolPermitido)) {
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
  const role = (session.user as { role?: string }).role as string
  if (!rolesPermitidos.includes(role as RolPermitido)) {
    return NextResponse.json(
      {
        error: `Requiere rol: ${rolesPermitidos.join(' o ')}`,
        code: 'INSUFFICIENT_ROLE',
        rolesRequeridos: rolesPermitidos,
      },
      { status: 403 }
    )
  }
  return { userId: session.user.id!, role }
}
