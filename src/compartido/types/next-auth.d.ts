import { DefaultSession } from 'next-auth'
import type { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    role?: string
    roles?: UserRole[]
    activeMode?: UserRole | null
    registroCompleto?: boolean
  }
  interface Session {
    user: {
      id: string
      // role == activeMode (invariante de back-compat U-03).
      role: string
      roles: UserRole[]
      activeMode: UserRole | null
      registroCompleto: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    roles?: UserRole[]
    activeMode?: UserRole | null
    registroCompleto?: boolean
  }
}
