'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sincronizarNivel } from './sincronizar-nivel-action'

export function SincronizarNivel({ tallerId, nivelActual }: { tallerId: string; nivelActual: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const resultado = await sincronizarNivel(tallerId, nivelActual)
      if (resultado.cambio) {
        router.refresh()
      }
    })
  }, [tallerId, nivelActual, router, startTransition])

  return null
}
