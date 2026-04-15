import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { logActividad } from '@/compartido/lib/log'

export async function POST(request: Request) {
  const session = await auth()

  const body = await request.json()
  const { tipo, mensaje, pagina, entidad, entidadId, auditorNombre, auditorRol } = body

  if (!tipo || !mensaje || mensaje.length < 10) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
  }

  // Datos del usuario: de la sesion si esta logueado, del body si es auditor externo
  const userId = session?.user?.id ?? null
  const role = session?.user
    ? (session.user as { role?: string }).role
    : auditorRol ?? 'SIN_LOGIN'
  const nombre = session?.user?.name ?? auditorNombre ?? 'Anonimo'

  logActividad('FEEDBACK', userId, {
    tipo,
    mensaje,
    pagina,
    entidad: entidad ?? null,
    entidadId: entidadId ?? null,
    rol: role,
    auditorNombre: !session?.user ? (auditorNombre ?? null) : null,
    auditorRol: !session?.user ? (auditorRol ?? null) : null,
    userAgent: request.headers.get('user-agent') ?? '',
  })

  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
    const labels: Record<string, string[]> = {
      bug: ['bug', 'piloto'],
      mejora: ['enhancement', 'piloto'],
      falta: ['feature-request', 'piloto'],
      confusion: ['ux', 'piloto'],
    }

    const rolDisplay = session?.user ? role : `${auditorRol ?? 'SIN_LOGIN'} (auditor: ${nombre})`

    try {
      await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          title: `[${tipo.toUpperCase()}] ${mensaje.slice(0, 60)}${mensaje.length > 60 ? '...' : ''}`,
          body: `**Tipo:** ${tipo}\n**Rol:** ${rolDisplay}\n**Pagina:** ${pagina}\n${entidad ? `**Entidad:** ${entidad} ${entidadId}\n` : ''}\n**Descripcion:**\n${mensaje}`,
          labels: labels[tipo] ?? ['piloto'],
        }),
      })
    } catch { /* GitHub failure should not block feedback response */ }
  }

  return NextResponse.json({ ok: true })
}
