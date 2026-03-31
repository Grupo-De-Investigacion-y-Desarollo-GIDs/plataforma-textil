import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendEmail, buildPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    // Delete any existing tokens for this user
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })

    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    })

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/restablecer/${token}`

    const { subject, html } = buildPasswordResetEmail(resetUrl)
    await sendEmail({ to: email, subject, html })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en password-reset:', error)
    return NextResponse.json({ error: 'Error al procesar solicitud' }, { status: 500 })
  }
}
