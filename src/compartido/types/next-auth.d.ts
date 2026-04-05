import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
    registroCompleto?: boolean
  }
  interface Session {
    user: {
      id: string
      role: string
      registroCompleto: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    registroCompleto?: boolean
  }
}
