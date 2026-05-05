import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { encode } from 'next-auth/jwt'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const magicLink = await prisma.magicLink.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!magicLink) {
    return NextResponse.redirect(new URL('/login?error=link_invalido', req.url))
  }

  if (magicLink.expira < new Date()) {
    return NextResponse.redirect(new URL('/login?error=link_expirado', req.url))
  }

  if (magicLink.usadoEn) {
    // Link ya fue usado — redirigir al destino sin auto-login
    return NextResponse.redirect(new URL(magicLink.destino, req.url))
  }

  // Marcar como usado
  await prisma.magicLink.update({
    where: { id: magicLink.id },
    data: { usadoEn: new Date() },
  })

  // Nombre de cookie segun ambiente (debe coincidir con auth.config.ts)
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieName = isProduction
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  // Crear sesion NextAuth manualmente
  // El salt DEBE coincidir con el nombre de la cookie para que decode() funcione
  const sessionToken = await encode({
    token: {
      sub: magicLink.user.id,
      email: magicLink.user.email,
      name: magicLink.user.name,
      role: (magicLink.user as { role?: string }).role,
      id: magicLink.user.id,
      registroCompleto: (magicLink.user as { registroCompleto?: boolean }).registroCompleto ?? true,
    },
    secret: process.env.NEXTAUTH_SECRET!,
    salt: cookieName,
  })

  // Setear cookie de sesion y redirigir al destino
  const response = NextResponse.redirect(new URL(magicLink.destino, req.url))
  response.cookies.set({
    name: cookieName,
    value: sessionToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 dias (igual que sesion normal)
  })

  return response
}
