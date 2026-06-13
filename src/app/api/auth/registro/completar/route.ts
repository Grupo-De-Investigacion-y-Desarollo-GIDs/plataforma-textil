import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { verificarCuit } from '@/compartido/lib/afip'
import { crearEntidadParaRol } from '@/compartido/lib/crear-entidad-rol'
import { z } from 'zod'

const schema = z.object({
  role: z.enum(['TALLER', 'MARCA']),
  nombre: z.string().trim().min(1, 'Nombre requerido'),
  cuit: z.string().trim().min(1, 'CUIT requerido'),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const raw = await req.json()
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { role, nombre, cuit } = parsed.data

  // Verificar que el usuario no tenga ya Taller o Marca
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { taller: true, marca: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }
  if (user.taller || user.marca) {
    return NextResponse.json({ error: 'Ya tenes una entidad registrada' }, { status: 409 })
  }

  // Verificar CUIT con AfipSDK
  const afipResult = await verificarCuit(cuit)
  if (!afipResult.valid) {
    return NextResponse.json({ error: afipResult.error || 'CUIT invalido' }, { status: 400 })
  }

  // Transaccion: crear entidad (+ validaciones si es taller) + actualizar usuario
  await prisma.$transaction(async (tx) => {
    await crearEntidadParaRol(tx, {
      userId: user.id,
      rol: role,
      nombre,
      cuit: cuit.replace(/-/g, ''),
      verificadoAfip: true,
    })
    await tx.user.update({
      where: { id: user.id },
      // U-05: el user completa su primera entidad (el guard de arriba garantiza que
      // no tenía taller/marca → es single-rol). Sincronizamos roles=[role]/activeMode=role
      // junto al role para no regenerar el dato desincronizado. Ver spec v4-u-05.
      data: { role, roles: [role], activeMode: role, registroCompleto: true },
    })
  })

  return NextResponse.json({ ok: true })
}
