import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { setSessionCookie } from '@/compartido/lib/session-cookie'

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

  // Crear sesion NextAuth manualmente y setear la cookie via el helper unico
  // (mismo encode + salt = nombre de cookie que usa el login normal). Ver
  // session-cookie.ts.
  const response = NextResponse.redirect(new URL(magicLink.destino, req.url))
  await setSessionCookie(response, {
    sub: magicLink.user.id,
    email: magicLink.user.email,
    name: magicLink.user.name,
    role: (magicLink.user as { role?: string }).role,
    id: magicLink.user.id,
    registroCompleto: (magicLink.user as { registroCompleto?: boolean }).registroCompleto ?? true,
  })

  return response
}
