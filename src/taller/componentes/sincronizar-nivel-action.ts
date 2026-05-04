'use server'

import { aplicarNivel } from '@/compartido/lib/nivel'
import { auth } from '@/compartido/lib/auth'

export async function sincronizarNivel(tallerId: string, nivelActual: string): Promise<{ cambio: boolean }> {
  const session = await auth()
  if (!session?.user) return { cambio: false }

  const resultado = await aplicarNivel(tallerId, session.user.id)
  return { cambio: resultado.nivel !== nivelActual }
}
