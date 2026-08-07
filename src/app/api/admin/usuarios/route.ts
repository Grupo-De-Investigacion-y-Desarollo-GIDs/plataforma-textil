import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { logAccionAdmin } from '@/compartido/lib/log'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const sesion = await requiereRolApi(['ADMIN'])
    if (sesion instanceof NextResponse) return sesion

    const { searchParams } = req.nextUrl

    // Registros incompletos (OAuth/magic link sin completar)
    if (searchParams.get('incompletos') === 'true') {
      const usuarios = await prisma.user.findMany({
        where: { registroCompleto: false },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ usuarios })
    }

    const page = parseInt(searchParams.get('page') || '1')
    // Límite real (antes 10): con >10 usuarios el listado quedaba capado y el panel
    // calculaba los contadores sobre la página devuelta. 100 alcanza el piloto; si algún
    // día se supera, el cliente ya recibe `total`/`totalPages` para paginar.
    const limit = parseInt(searchParams.get('limit') || '100')
    const role = searchParams.get('role')
    const q = searchParams.get('q')

    const where: Record<string, unknown> = {}
    if (role) where.role = role
    if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }]

    const [usuarios, total, porRol] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, role: true, active: true, createdAt: true, phone: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
      // Contadores por rol sobre la BASE (COUNT/groupBy), no sobre la página: las StatCards
      // Total/Talleres/Marcas deben reflejar la plataforma, no las filas visibles.
      prisma.user.groupBy({ by: ['role'], where, _count: { _all: true } }),
    ])

    const conteoRol = Object.fromEntries(porRol.map(g => [g.role, g._count._all])) as Record<string, number>

    return NextResponse.json({
      usuarios,
      total,
      totalTalleres: conteoRol.TALLER ?? 0,
      totalMarcas: conteoRol.MARCA ?? 0,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sesion = await requiereRolApi(['ADMIN'])
    if (sesion instanceof NextResponse) return sesion

    const body = await req.json()
    const exists = await prisma.user.findUnique({ where: { email: body.email } })
    if (exists) return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })

    const hashedPassword = await bcrypt.hash(body.password, 10)
    const user = await prisma.user.create({
      // MITIGACION #307 (temporal): emailVerified al crear para no bloquear el
      // onboarding (mismo motivo que en auth/registro). Revertir con flujo real.
      data: { email: body.email, password: hashedPassword, name: body.name, role: body.role, phone: body.phone, emailVerified: new Date() },
      select: { id: true, email: true, name: true, role: true, active: true },
    })
    logAccionAdmin('ADMIN_USUARIO_CREADO', sesion.userId, {
      entidad: 'usuario',
      entidadId: user.id,
      metadata: { role: body.role, email: body.email },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
