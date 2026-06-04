// Primitivas puras de roles para multi-rol (U-03).
// SIN imports de Prisma/auth/next — Edge-safe a propósito: las usan tanto
// permisos.ts (server) como middleware.ts (Edge), sin duplicar la lógica.

export type Rol = 'TALLER' | 'MARCA' | 'ESTADO' | 'ADMIN' | 'CONTENIDO'

/** Fuente mínima de roles: lo que trae la sesión/token. */
export interface FuenteRoles {
  role?: string | null
  roles?: string[] | null
  activeMode?: string | null
}

/**
 * Modo en que el usuario está actuando.
 * Fallback: activeMode ?? role. Garantiza un valor aunque activeMode sea null
 * (usuarios creados post-U02 o sesiones viejas no tienen activeMode poblado).
 */
export function modoActivo(u: FuenteRoles): Rol | undefined {
  return (u.activeMode ?? u.role ?? undefined) as Rol | undefined
}

/**
 * Roles efectivos para decisiones de acceso (membresía, decisión D1/A).
 * Si roles[] está vacío o ausente (usuarios post-U02, sesiones viejas),
 * cae a [activeMode ?? role]. Nunca devuelve vacío si hay role/activeMode.
 */
export function rolesEfectivos(u: FuenteRoles): Rol[] {
  if (u.roles && u.roles.length > 0) return u.roles as Rol[]
  const modo = modoActivo(u)
  return modo ? [modo] : []
}

/**
 * Membresía: true si alguno de los roles efectivos del usuario está en la
 * lista de roles permitidos. Es la decisión central de acceso en U-03.
 */
export function tieneAlgunRol(u: FuenteRoles, permitidos: Rol[]): boolean {
  return rolesEfectivos(u).some((r) => permitidos.includes(r))
}
