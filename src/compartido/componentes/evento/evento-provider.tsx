'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'

// Modo evento (martes 11): activo solo cuando MODO_EVENTO=on (preview). El root layout
// (server) lee la env var y la pasa como valor del contexto — el cliente no lee env.
// Efectos en cliente: (a) el logout redirige a /demo, (b) timeout de inactividad → /demo.
const ModoEventoContext = createContext(false)

/** true si la app corre en modo evento (para el redirect de logout, etc.). */
export function useModoEvento(): boolean {
  return useContext(ModoEventoContext)
}

/** Destino del logout según el modo: /demo en evento, /login normal. */
export function useLogoutCallbackUrl(): string {
  return useModoEvento() ? '/demo' : '/login'
}

const MINUTOS_INACTIVIDAD = 12

// Higiene del público rotando: tras 12 min sin interacción, cierra sesión y vuelve a /demo,
// así nadie hereda la sesión del anterior. Solo se monta en modo evento y con sesión activa.
function InactividadEvento() {
  const { status } = useSession()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return

    const reiniciar = () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        signOut({ callbackUrl: '/demo' })
      }, MINUTOS_INACTIVIDAD * 60 * 1000)
    }

    const eventos = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    eventos.forEach(e => window.addEventListener(e, reiniciar, { passive: true }))
    reiniciar()

    return () => {
      eventos.forEach(e => window.removeEventListener(e, reiniciar))
      if (timer.current) clearTimeout(timer.current)
    }
  }, [status])

  return null
}

export function ModoEventoProvider({ value, children }: { value: boolean; children: React.ReactNode }) {
  return (
    <ModoEventoContext.Provider value={value}>
      {children}
      {value && <InactividadEvento />}
    </ModoEventoContext.Provider>
  )
}
