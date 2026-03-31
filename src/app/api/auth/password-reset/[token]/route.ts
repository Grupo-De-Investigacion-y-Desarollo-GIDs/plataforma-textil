import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const { password } = await req.json()

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const record = await prisma.verificationToken.findUnique({ where: { token } })

    if (!record || record.expires < new Date()) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { email: record.identifier },
      data: { password: hashedPassword },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token } },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en password-reset/[token]:', error)
    return NextResponse.json({ error: 'Error al restablecer contraseña' }, { status: 500 })
  }
}
