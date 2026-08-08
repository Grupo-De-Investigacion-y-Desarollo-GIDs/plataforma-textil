'use client'

import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/compartido/componentes/ui/toast'
import { ModoEventoProvider } from '@/compartido/componentes/evento/evento-provider'

export function Providers({ children, modoEvento = false }: { children: React.ReactNode; modoEvento?: boolean }) {
  return (
    <SessionProvider>
      <ModoEventoProvider value={modoEvento}>
        <ToastProvider>{children}</ToastProvider>
      </ModoEventoProvider>
    </SessionProvider>
  )
}
