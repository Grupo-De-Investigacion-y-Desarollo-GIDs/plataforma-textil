import type { NextAuthConfig } from 'next-auth'
import type { UserRole } from '@prisma/client'
import Credentials from 'next-auth/providers/credentials'

// Configuracion ligera sin Prisma/bcrypt para uso en middleware (Edge)
// La validacion real de credenciales se hace en auth.ts
//
// IMPORTANTE: session y cookies DEBEN ir aca (no en auth.ts) porque el
// middleware usa esta config directamente. Si van solo en auth.ts, el
// middleware usa nombres de cookie default y no reconoce la sesion.

const isProduction = process.env.NODE_ENV === 'production'

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
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,   // 7 dias
    updateAge: 24 * 60 * 60,     // renueva cada 24h si hay actividad
  },
  cookies: {
    sessionToken: {
      name: isProduction
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: isProduction,
      },
    },
    csrfToken: {
      name: isProduction
        ? '__Host-authjs.csrf-token'
        : 'authjs.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: isProduction,
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          id: string
          role?: string | null
          roles?: UserRole[] | null
          activeMode?: UserRole | null
          registroCompleto?: boolean
        }
        token.id = u.id
        // Normalización en el borde de sesión (U-03): roles[] efectivos y
        // activeMode siempre derivados, aunque la DB tenga roles=[] o
        // activeMode=null (usuarios creados post-U02).
        const activeMode = (u.activeMode ?? u.role ?? null) as UserRole | null
        token.activeMode = activeMode
        token.roles =
          u.roles && u.roles.length > 0
            ? u.roles
            : activeMode
              ? [activeMode]
              : []
        // INVARIANTE de back-compat: role == activeMode. Cualquier gate sin
        // migrar que lea token.role / session.user.role ve el valor correcto.
        token.role = activeMode ?? undefined
        token.registroCompleto =
          (user as { registroCompleto?: boolean }).registroCompleto ?? true
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.roles = (token.roles as UserRole[]) ?? []
        session.user.activeMode = (token.activeMode as UserRole | null) ?? null
        // INVARIANTE: role == activeMode (fallback a token.role para sesiones
        // viejas emitidas antes del deploy de U-03).
        session.user.role = (token.activeMode ?? token.role) as string
        ;(session.user as { registroCompleto: boolean }).registroCompleto =
          (token.registroCompleto as boolean) ?? true
      }
      return session
    },
  },
} satisfies NextAuthConfig
