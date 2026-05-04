import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { sendEmail, buildMagicLinkEmail } from './email'
import authConfig from './auth.config'

const baseAdapter = PrismaAdapter(prisma)

const adapter = {
  ...baseAdapter,
  createUser: async (data: { email: string; name?: string | null; image?: string | null; emailVerified?: Date | null }) => {
    // Usuarios creados por adapter (OAuth/magic link) empiezan con registro incompleto
    return prisma.user.create({
      data: {
        ...data,
        registroCompleto: false,
      },
    })
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  // session hereda de authConfig (strategy: jwt, maxAge: 7d, updateAge: 24h)
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          registroCompleto: user.registroCompleto,
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    EmailProvider({
      server: 'smtp://placeholder', // No se usa — sendVerificationRequest override
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendEmail({
          to: identifier,
          ...buildMagicLinkEmail(url),
        })
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Para OAuth/email, verificar si el email ya existe con otro provider
      if (account?.provider === 'google' || account?.provider === 'email') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true },
        })
        if (existingUser && existingUser.accounts.length === 0 && existingUser.password) {
          // Usuario con email+contrasena intentando entrar con OAuth
          return '/login?error=OAuthAccountNotLinked'
        }
      }
      return true
    },
  },
})
