'use server'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  BLOQUES_VIDRIERA,
  bloqueVisibleVidriera,
  type BloqueVidriera,
  type VisibilidadVidriera,
  type VisibilidadInput,
} from '@/compartido/lib/visibilidad-vidriera'

/**
 * Escritura de "Configuracion de visibilidad" (Etapa 2.2-C1, §5.3 / §7).
 *
 * ⚠️ REGLA ANTI-FOOTGUN (§5.3, critica): NO escribe solo la key tocada. Persiste el
 * MAPA COMPLETO de los 10 bloques toggle-libre con booleano explicito + setea
 * `modeloB_revisado=true`. Asi, tras el primer guardado no quedan `null`, y el flip a
 * true es render-neutral (ningun bloque aparece/desaparece solo). Para cualquier key
 * que el cliente no haya enviado, se persiste su visibilidad EFECTIVA actual
 * (via `bloqueVisiblePublico`), de modo que el guardado nunca expone un bloque que el
 * taller no toco.
 *
 * Ownership: solo el taller dueño escribe su propia visibilidad.
 */
export async function actualizarVisibilidadVidriera(
  input: VisibilidadInput,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'No autenticado' }

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      visibilidadVidriera: true,
      modeloB_revisado: true,
      certificados: { where: { revocado: false }, select: { id: true } },
    },
  })
  if (!taller) return { ok: false, error: 'Taller no encontrado' }

  // Mapa COMPLETO: cada bloque con booleano explicito (§5.3). Las keys enviadas usan
  // el valor del panel; las ausentes conservan su visibilidad efectiva actual.
  const mapaCompleto = {} as Record<BloqueVidriera, boolean>
  for (const bloque of BLOQUES_VIDRIERA) {
    const enviado = input.bloques?.[bloque]
    mapaCompleto[bloque] =
      typeof enviado === 'boolean'
        ? enviado
        : bloqueVisibleVidriera(taller, bloque)
  }

  // formacionBadges: solo ids de certificados del PROPIO taller (no confiar en cliente).
  const idsValidos = new Set(taller.certificados.map((c) => c.id))
  const formacionBadges: Record<string, boolean> = {}
  for (const [id, valor] of Object.entries(input.formacionBadges ?? {})) {
    if (idsValidos.has(id) && typeof valor === 'boolean') {
      formacionBadges[id] = valor
    }
  }

  const visibilidad: VisibilidadVidriera = { ...mapaCompleto }
  if (Object.keys(formacionBadges).length > 0) {
    visibilidad.formacionBadges = formacionBadges
  }

  await prisma.taller.update({
    where: { id: taller.id },
    data: {
      visibilidadVidriera: visibilidad,
      modeloB_revisado: true,
    },
  })

  // Superficies afectadas: Mi vidriera, gestion (el panel) y el dashboard (banner).
  revalidatePath('/taller/perfil/vidriera')
  revalidatePath('/taller/perfil/gestion')
  revalidatePath('/taller')

  return { ok: true }
}
