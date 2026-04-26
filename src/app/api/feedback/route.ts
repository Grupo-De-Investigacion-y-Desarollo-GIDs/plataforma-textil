import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { logActividad } from '@/compartido/lib/log'
import { corsHeaders, handleOptions } from '@/compartido/lib/cors'
import { buildIssueLabels, buildIssueBody } from '@/compartido/lib/feedback'

export async function OPTIONS(request: Request) {
  return handleOptions(request)
}

export async function POST(request: Request) {
  const session = await auth()

  const body = await request.json()
  const { tipo, mensaje, pagina, entidad, entidadId, auditorNombre, auditorRol, contextoQA } = body

  if (!tipo || !mensaje || mensaje.length < 10) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400, headers: corsHeaders(request) })
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
    contextoQA: contextoQA ?? null,
    userAgent: request.headers.get('user-agent') ?? '',
  })

  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
    const rolDisplay = session?.user ? role : `${auditorRol ?? 'SIN_LOGIN'} (auditor: ${nombre})`

    const issueBody = buildIssueBody({
      tipo,
      rolDisplay: rolDisplay ?? 'SIN_LOGIN',
      pagina,
      entidad,
      entidadId,
      mensaje,
      contextoQA,
    })

    const issueLabels = buildIssueLabels(tipo, contextoQA)

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
          body: issueBody,
          labels: issueLabels,
        }),
      })
    } catch { /* GitHub failure should not block feedback response */ }
  }

  return NextResponse.json({ ok: true }, { headers: corsHeaders(request) })
}
