import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import authConfig from '@/compartido/lib/auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role as string | undefined

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/',
    '/login',
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
    '/perfil/',        // Perfil público taller /perfil/[id]
    '/perfil-marca/',  // Perfil público marca /perfil-marca/[id]
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
  const registroCompleto = (req.auth?.user as { registroCompleto?: boolean })?.registroCompleto
  if (isLoggedIn && registroCompleto === false) {
    if (pathname === '/registro/completar' || pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/registro/completar', nextUrl))
  }

  // Protección por rol

  // Rutas de ADMIN - solo para rol ADMIN
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl))
    }
    return NextResponse.next()
  }

  // Rutas de TALLER - solo para rol TALLER
  if (pathname.startsWith('/taller')) {
    if (userRole !== 'TALLER') {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl))
    }
    return NextResponse.next()
  }

  // Rutas de MARCA - solo para rol MARCA
  if (pathname.startsWith('/marca')) {
    if (userRole !== 'MARCA') {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl))
    }
    return NextResponse.next()
  }

  // Rutas de ESTADO - para rol ESTADO y ADMIN
  if (pathname.startsWith('/estado')) {
    if (userRole !== 'ESTADO' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl))
    }
    return NextResponse.next()
  }

  // Rutas de CONTENIDO - para rol CONTENIDO y ADMIN
  if (pathname.startsWith('/contenido')) {
    if (userRole !== 'CONTENIDO' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl))
    }
    return NextResponse.next()
  }

  // Rutas de cuenta - accesibles para todos los usuarios logueados
  if (pathname.startsWith('/cuenta')) {
    return NextResponse.next()
  }

  // Redirigir a dashboard según rol si accede a raíz estando logueado
  if (pathname === '/' && isLoggedIn) {
    switch (userRole) {
      case 'TALLER':
        return NextResponse.redirect(new URL('/taller', nextUrl))
      case 'MARCA':
        return NextResponse.redirect(new URL('/marca/directorio', nextUrl))
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
})

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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

