import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

// Configuracion ligera sin Prisma/bcrypt para uso en middleware (Edge)
// La validacion real de credenciales se hace en auth.ts
export default {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: () => null,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.id = user.id
        token.registroCompleto = (user as { registroCompleto?: boolean }).registroCompleto ?? true
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        ;(session.user as { registroCompleto: boolean }).registroCompleto =
          (token.registroCompleto as boolean) ?? true
      }
      return session
    },
  },
} satisfies NextAuthConfig
