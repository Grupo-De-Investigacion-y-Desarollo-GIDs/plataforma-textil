'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { useLogoutCallbackUrl } from '@/compartido/componentes/evento/evento-provider'

export function AdminLogoutButton() {
  const callbackUrl = useLogoutCallbackUrl()
  return (
    <button
      onClick={() => signOut({ callbackUrl })}
      className="flex items-center gap-2 text-sm hover:text-red-200 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Cerrar sesión
    </button>
  )
}
