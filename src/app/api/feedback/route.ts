import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { logActividad } from '@/compartido/lib/log'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { tipo, mensaje, pagina } = body

  if (!tipo || !mensaje || mensaje.length < 10) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
  }

  const role = (session.user as { role?: string }).role

  logActividad('FEEDBACK', session.user.id, {
    tipo,
    mensaje,
    pagina,
    rol: role,
    userAgent: request.headers.get('user-agent') ?? '',
  })

  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
    const labels: Record<string, string[]> = {
      bug: ['bug', 'piloto'],
      mejora: ['enhancement', 'piloto'],
      falta: ['feature-request', 'piloto'],
      confusion: ['ux', 'piloto'],
    }
    fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: `[${tipo.toUpperCase()}] ${mensaje.slice(0, 60)}${mensaje.length > 60 ? '...' : ''}`,
        body: `**Tipo:** ${tipo}\n**Rol:** ${role}\n**Pagina:** ${pagina}\n\n**Descripcion:**\n${mensaje}`,
        labels: labels[tipo] ?? ['piloto'],
      }),
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
