import { randomBytes } from 'crypto'
import { prisma } from './prisma'

export async function generarMagicLink(opts: { userId: string; destino: string }) {
  const token = randomBytes(32).toString('base64url')
  const expira = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

  const link = await prisma.magicLink.create({
    data: {
      token,
      userId: opts.userId,
      destino: opts.destino,
      expira,
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://plataforma-textil.vercel.app'

  return {
    token: link.token,
    url: `${baseUrl}/n/${link.token}`,
  }
}
