'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex items-center gap-2 text-sm hover:text-red-200 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Cerrar Sesión
    </button>
  )
}
