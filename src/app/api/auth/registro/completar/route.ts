import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { verificarCuit } from '@/compartido/lib/afip'
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

  // Transaccion: crear entidad + actualizar usuario
  await prisma.$transaction([
    role === 'TALLER'
      ? prisma.taller.create({
          data: { userId: user.id, nombre, cuit: cuit.replace(/-/g, ''), verificadoAfip: true },
        })
      : prisma.marca.create({
          data: { userId: user.id, nombre, cuit: cuit.replace(/-/g, ''), verificadoAfip: true },
        }),
    prisma.user.update({
      where: { id: user.id },
      data: { role, registroCompleto: true },
    }),
  ])

  return NextResponse.json({ ok: true })
}
