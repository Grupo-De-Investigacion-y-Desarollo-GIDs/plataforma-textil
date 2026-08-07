import { NextResponse, type NextRequest } from 'next/server'
import { tieneAlgunRol, modoActivo, type FuenteRoles } from '@/compartido/lib/roles'
import { decodeSessionToken, SESSION_COOKIE_NAME } from '@/compartido/lib/session-cookie'

// B-05: el middleware lee el JWT READ-ONLY (decode), sin re-emitir Set-Cookie.
// Antes envolvía con el wrapper `auth()`, que bajo strategy jwt re-firma y re-emite
// la cookie en CADA navegación → una navegación con la cookie vieja pisaba la
// actualización concurrente de un cambio de modo/rol (last-write-wins en el jar).
// Ahora la escritura autoritativa de la cookie la hacen los endpoints server-side
// (active-mode, me/roles); acá SOLO leemos. El sliding-expiry queda a cargo del
// useSession (SessionProvider en el root layout + Header/FeedbackWidget global). El
// gating es BYTE-IDÉNTICO al anterior: solo cambia de dónde sale la identidad.
export default async function middleware(req: NextRequest) {
  const { nextUrl } = req

  // Lectura pura del token desde la cookie. Edge-safe (decode usa jose). null si
  // falta/expiró/es inválido → se trata como no logueado (igual que antes).
  const token = await decodeSessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value)
  const isLoggedIn = !!token
  // U-03: gating por MEMBRESÍA en roles[] (decisión D1/A), no por el escalar.
  const sessionUser = (token
    ? { role: token.role, roles: token.roles, activeMode: token.activeMode }
    : undefined) as FuenteRoles | undefined

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/',
    '/login',
    '/acceso-rapido',
    '/demo',           // Evento: acceso por tarjetas (gateado por MODO_EVENTO en la page)
    '/registro',
    '/olvide-contrasena',
    '/restablecer',
    '/ayuda',
    '/terminos',
    '/privacidad',
    '/verificar',
    '/denunciar',
    '/consultar-denuncia',
    '/directorio',
    '/unauthorized',
    '/perfil/',        // Perfil público taller /perfil/[id]
    '/perfil-marca/',  // Perfil público marca /perfil-marca/[id]
    '/n/',             // Magic links WhatsApp (F-02)
    // Marketing pages (X-06)
    '/taller-info',
    '/marca-info',
    '/impacto',
    '/recursos',
    '/academia-publica',
    '/novedades',
    '/contacto',
    '/accesibilidad',
  ]

  // Verificar si es ruta pública (incluyendo rutas dinámicas)
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return nextUrl.pathname === '/'
    }
    if (route.endsWith('/')) {
      // Para rutas dinámicas como /perfil/[id]
      return nextUrl.pathname.startsWith(route) && nextUrl.pathname.split('/').length === 3
    }
    return nextUrl.pathname === route || nextUrl.pathname.startsWith(route + '/')
  })

  // Si es ruta pública, permitir acceso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Si no está logueado y no es ruta pública, redirigir a login
  if (!isLoggedIn) {
    const callbackUrl = nextUrl.pathname + nextUrl.search
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
    )
  }

  // Usuarios con registro incompleto (OAuth/magic link sin completar)
  const pathname = nextUrl.pathname
  const registroCompleto = (token as { registroCompleto?: boolean } | null)?.registroCompleto
  if (isLoggedIn && registroCompleto === false) {
    if (pathname === '/registro/completar' || pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/registro/completar', nextUrl))
  }

  // Protección por rol

  // Rutas de ADMIN — ADMIN siempre, CONTENIDO solo evaluaciones
  // ESTADO ya no accede a /admin/* (tiene sus propias rutas /estado/*)
  // Colecciones se gestiona desde /contenido/colecciones (J-03)
  if (pathname.startsWith('/admin')) {
    if (sessionUser && tieneAlgunRol(sessionUser, ['ADMIN'])) return NextResponse.next()
    if (
      sessionUser &&
      tieneAlgunRol(sessionUser, ['CONTENIDO']) &&
      pathname.startsWith('/admin/evaluaciones')
    ) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/unauthorized', nextUrl))
  }

  // Rutas de TALLER - membresía TALLER
  if (pathname.startsWith('/taller')) {
    if (!sessionUser || !tieneAlgunRol(sessionUser, ['TALLER'])) {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl))
    }
    return NextResponse.next()
  }

  // Rutas de MARCA - membresía MARCA
  if (pathname.startsWith('/marca')) {
    if (!sessionUser || !tieneAlgunRol(sessionUser, ['MARCA'])) {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl))
    }
    return NextResponse.next()
  }

  // Rutas de ESTADO - membresía ESTADO o ADMIN
  if (pathname.startsWith('/estado')) {
    if (!sessionUser || !tieneAlgunRol(sessionUser, ['ESTADO', 'ADMIN'])) {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl))
    }
    return NextResponse.next()
  }

  // Rutas de CONTENIDO - membresía CONTENIDO o ADMIN
  if (pathname.startsWith('/contenido')) {
    if (!sessionUser || !tieneAlgunRol(sessionUser, ['CONTENIDO', 'ADMIN'])) {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl))
    }
    return NextResponse.next()
  }

  // Rutas de cuenta - accesibles para todos los usuarios logueados
  if (pathname.startsWith('/cuenta')) {
    return NextResponse.next()
  }

  // Redirigir a dashboard según el modo activo si accede a raíz estando logueado
  if (pathname === '/' && isLoggedIn) {
    switch (sessionUser ? modoActivo(sessionUser) : undefined) {
      case 'TALLER':
        return NextResponse.redirect(new URL('/taller', nextUrl))
      case 'MARCA':
        return NextResponse.redirect(new URL('/marca', nextUrl))
      case 'ESTADO':
        return NextResponse.redirect(new URL('/estado', nextUrl))
      case 'ADMIN':
        return NextResponse.redirect(new URL('/admin', nextUrl))
      case 'CONTENIDO':
        return NextResponse.redirect(new URL('/contenido', nextUrl))
      default:
        return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (NextAuth needs these)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2|woff|ttf|eot|ico)$).*)',
  ],
}

