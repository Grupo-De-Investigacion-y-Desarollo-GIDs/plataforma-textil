import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true },
    })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Error al obtener cuenta' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const updateData: Record<string, unknown> = {}

    if (body.name) updateData.name = body.name
    if (body.phone) updateData.phone = body.phone

    if (body.newPassword) {
      if (typeof body.newPassword !== 'string' || body.newPassword.length < 8) {
        return NextResponse.json({ error: 'La nueva contrasena debe tener al menos 8 caracteres' }, { status: 400 })
      }

      if (!body.currentPassword || typeof body.currentPassword !== 'string') {
        return NextResponse.json({ error: 'Contrasena actual requerida' }, { status: 400 })
      }

      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user?.password) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
      }

      const valid = await bcrypt.compare(body.currentPassword, user.password)
      if (!valid) {
        return NextResponse.json({ error: 'Contrasena actual incorrecta' }, { status: 400 })
      }

      updateData.password = await bcrypt.hash(body.newPassword, 10)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No hay datos para actualizar' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, email: true, name: true, phone: true, role: true },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar cuenta' }, { status: 500 })
  }
}
